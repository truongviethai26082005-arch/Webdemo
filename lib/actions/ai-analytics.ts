"use server";

import { requireRole } from "@/lib/auth/guards";

// Model Gemini đôi lúc trả 503 "high demand" tạm thời (đã xác minh thực tế
// khi tích hợp Cody AI Advisor) — thử lại 1 lần sau độ trễ ngắn trước khi
// báo lỗi hẳn cho người dùng, tránh gãy trải nghiệm vì 1 lần quá tải thoáng qua.
async function fetchGeminiWithRetry(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  if (response.status === 503) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return fetch(url, options);
  }
  return response;
}

export interface StudentBalanceItem {
  studentId: string;
  studentName: string;
  className: string;
  balanceSessions: number;
}

export interface ClassPerformanceItem {
  classId: string;
  className: string;
  activeEnrollments: number;
  completedSessions: number;
  cancelledSessions: number;
  absentUnexcusedCount: number;
}

export interface OperationalSnapshot {
  month: number;
  year: number;
  week?: number; // 0 = cả tháng, 1..5 = tuần trong tháng
  weekLabel?: string;
  startDateStr: string;
  endDateStr: string;
  paidRevenue: number;
  teacherCosts: number;
  grossProfit: number;
  negativeDebtStudents: StudentBalanceItem[];
  lowBalanceStudents: StudentBalanceItem[];
  classPerformance: ClassPerformanceItem[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function parseVietnamDateOnly(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  // Múi giờ Asia/Ho_Chi_Minh: UTC + 7
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const y = vnTime.getUTCFullYear();
  const m = String(vnTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(vnTime.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Lấy snapshot số liệu vận hành thực tế theo TUẦN hoặc THÁNG từ Supabase (Múi giờ Asia/Ho_Chi_Minh).
 * week = 0 hoặc undefined: Toàn bộ tháng
 * week = 1..5: Tuần cụ thể trong tháng
 */
export async function getOperationalAnalyticsSnapshot(
  month: number,
  year: number,
  week: number = 0
): Promise<{ success: true; data: OperationalSnapshot } | { error: string }> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!month || month < 1 || month > 12 || !year || year < 2000) {
    return { error: "Tháng hoặc năm không hợp lệ" };
  }

  try {
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    let startDay = 1;
    let endDay = lastDayOfMonth;
    let weekLabel = `Tháng ${month}/${year}`;

    if (week && week >= 1 && week <= 5) {
      startDay = (week - 1) * 7 + 1;
      endDay = week === 5 ? lastDayOfMonth : Math.min(week * 7, lastDayOfMonth);
      weekLabel = `Tuần ${week} (${String(startDay).padStart(2, "0")}/${String(month).padStart(2, "0")} - ${String(endDay).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year})`;
    }

    const startDateStr = `${year}-${String(month).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
    const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

    // 1. Doanh thu thực thu từ invoices có status = 'paid' trong khoảng ngày
    const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select("id, amount, status, paid_at, created_at")
      .eq("status", "paid");

    if (invoicesError) {
      console.error("Lỗi truy vấn invoices:", invoicesError);
      return { error: "Không thể tải dữ liệu hóa đơn" };
    }

    let paidRevenue = 0;
    for (const inv of invoicesData || []) {
      const dateStr = inv.paid_at || inv.created_at;
      if (!dateStr) continue;
      const vnDate = parseVietnamDateOnly(dateStr);
      if (vnDate && vnDate >= startDateStr && vnDate <= endDateStr) {
        paidRevenue += Number(inv.amount) || 0;
      }
    }

    // 2. Thù lao giáo viên từ class_sessions có status = 'completed' trong khoảng ngày
    const [teachersRes, sessionsRes] = await Promise.all([
      supabase.from("profiles").select("id, salary_per_session").eq("role", "teacher"),
      supabase
        .from("class_sessions")
        .select("id, class_id, teacher_id, session_date, status")
        .gte("session_date", startDateStr)
        .lte("session_date", endDateStr),
    ]);

    if (teachersRes.error) {
      console.error("Lỗi truy vấn profiles teacher:", teachersRes.error);
      return { error: "Không thể tải biểu phí giáo viên" };
    }
    if (sessionsRes.error) {
      console.error("Lỗi truy vấn class_sessions:", sessionsRes.error);
      return { error: "Không thể tải lịch học trong thời gian này" };
    }

    const teacherSalaryMap = new Map<string, number>();
    for (const t of teachersRes.data || []) {
      teacherSalaryMap.set(t.id, Number(t.salary_per_session) || 0);
    }

    let teacherCosts = 0;
    const completedSessionsList = (sessionsRes.data || []).filter((s) => s.status === "completed");
    for (const s of completedSessionsList) {
      if (s.teacher_id && teacherSalaryMap.has(s.teacher_id)) {
        teacherCosts += teacherSalaryMap.get(s.teacher_id) || 0;
      }
    }

    const grossProfit = paidRevenue - teacherCosts;

    // 3. Học sinh có balance_sessions < 0 và 0 <= balance_sessions <= 2
    const { data: enrollmentsData, error: enrollError } = await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        class_id,
        balance_sessions,
        status,
        students:students (id, full_name),
        classes:classes (id, name)
      `);

    if (enrollError) {
      console.error("Lỗi truy vấn enrollments:", enrollError);
      return { error: "Không thể tải dữ liệu ghi danh học sinh" };
    }

    const negativeDebtStudents: StudentBalanceItem[] = [];
    const lowBalanceStudents: StudentBalanceItem[] = [];

    for (const e of enrollmentsData || []) {
      const bal = Number(e.balance_sessions);
      if (isNaN(bal)) continue;

      const item: StudentBalanceItem = {
        studentId: e.student_id,
        studentName: (e.students as any)?.full_name || "Chưa rõ họ tên",
        className: (e.classes as any)?.name || "Chưa phân lớp",
        balanceSessions: bal,
      };

      if (bal < 0) {
        negativeDebtStudents.push(item);
      } else if (bal <= 2) {
        lowBalanceStudents.push(item);
      }
    }

    // 4. Thống kê theo từng lớp học
    const { data: classesData, error: classesError } = await supabase
      .from("classes")
      .select("id, name");

    if (classesError) {
      console.error("Lỗi truy vấn classes:", classesError);
      return { error: "Không thể tải danh sách lớp học" };
    }

    const periodSessionIds = (sessionsRes.data || []).map((s) => s.id);
    let periodAttendance: Array<{ id: string; session_id: string; status: string }> = [];

    if (periodSessionIds.length > 0) {
      const { data: attData } = await supabase
        .from("attendance")
        .select("id, session_id, status")
        .in("session_id", periodSessionIds);
      periodAttendance = attData || [];
    }

    // Map session_id -> class_id
    const sessionClassMap = new Map<string, string>();
    for (const s of sessionsRes.data || []) {
      sessionClassMap.set(s.id, s.class_id);
    }

    const classPerformance: ClassPerformanceItem[] = (classesData || []).map((c) => {
      const activeEnrollments = (enrollmentsData || []).filter(
        (e) => e.class_id === c.id && e.status === "active"
      ).length;

      const completedCount = (sessionsRes.data || []).filter(
        (s) => s.class_id === c.id && s.status === "completed"
      ).length;

      const cancelledCount = (sessionsRes.data || []).filter(
        (s) => s.class_id === c.id && s.status === "cancelled"
      ).length;

      const absentUnexcusedCount = periodAttendance.filter((a) => {
        const classId = sessionClassMap.get(a.session_id);
        return classId === c.id && a.status === "absent_unexcused";
      }).length;

      return {
        classId: c.id,
        className: c.name,
        activeEnrollments,
        completedSessions: completedCount,
        cancelledSessions: cancelledCount,
        absentUnexcusedCount,
      };
    });

    const snapshot: OperationalSnapshot = {
      month,
      year,
      week,
      weekLabel,
      startDateStr,
      endDateStr,
      paidRevenue,
      teacherCosts,
      grossProfit,
      negativeDebtStudents,
      lowBalanceStudents,
      classPerformance,
    };

    return { success: true, data: snapshot };
  } catch (err: any) {
    console.error("Lỗi không mong muốn trong getOperationalAnalyticsSnapshot:", err);
    return { error: err?.message || "Lỗi xử lý dữ liệu báo cáo" };
  }
}

/**
 * Sinh Báo Cáo Phân Tích Chi Tiết Toàn Diện do AI Cody thực hiện theo thời gian tuần/tháng.
 */
export async function generateAIExecutiveReport({
  snapshot,
}: {
  snapshot: OperationalSnapshot;
}): Promise<{ success?: boolean; report?: string; error?: string }> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };

  const apiKey = process.env.GEMINI_API_KEY;
  const timeTitle = snapshot.weekLabel || `Tháng ${snapshot.month}/${snapshot.year}`;
  const marginPercent =
    snapshot.paidRevenue > 0
      ? Math.round((snapshot.grossProfit / snapshot.paidRevenue) * 100)
      : 0;
  const salaryPercent =
    snapshot.paidRevenue > 0
      ? Math.round((snapshot.teacherCosts / snapshot.paidRevenue) * 100)
      : 0;

  // Nếu chưa có API key, sinh báo cáo phân tích theo mẫu logic chuẩn xác dựa trên số liệu thực tế
  if (!apiKey) {
    const reportText = `### I. BỨC TRANH TÀI CHÍNH & HIỆU QUẢ DẠY HỌC (${timeTitle})
- **Nhận xét**: ${
      salaryPercent > 45
        ? "Chi phí thù lao giáo viên đang chiếm tỷ trọng cao trong doanh thu, kéo giảm đáng kể lợi nhuận gộp — đây là điểm cần xử lý sớm để tránh ảnh hưởng dòng tiền."
        : snapshot.paidRevenue > 0 && snapshot.teacherCosts === 0
        ? "Biên lợi nhuận ghi nhận 100% là con số bất thường, không phản ánh đúng thực tế vận hành — nhiều khả năng do thiếu dữ liệu chi phí giáo viên chứ không phải trung tâm thực sự không tốn chi phí dạy học."
        : "Cơ cấu tài chính đang cân đối, chi phí thù lao giáo viên trong ngưỡng an toàn và lợi nhuận gộp dương ổn định."
    }
- **Nguyên nhân**: ${
      salaryPercent > 45
        ? "Tỷ trọng thù lao giáo viên vượt ngưỡng an toàn, thường do sĩ số lớp thấp hoặc lịch dạy chưa tối ưu."
        : snapshot.paidRevenue > 0 && snapshot.teacherCosts === 0
        ? "Đã ghi nhận doanh thu nhưng chưa có buổi dạy nào ở trạng thái 'completed' trong kỳ — cần kiểm tra lại điểm danh/lịch dạy đã cập nhật đúng chưa."
        : "Chưa phát hiện bất thường."
    }
- **Giải pháp**: ${
      salaryPercent > 45
        ? "Rà soát dồn lớp sĩ số thấp, tối ưu khung giờ dạy để giảm tỷ trọng chi phí giáo viên."
        : snapshot.paidRevenue > 0 && snapshot.teacherCosts === 0
        ? "Kiểm tra lại trạng thái điểm danh (status = 'completed') của các buổi học trong kỳ để đảm bảo lương giáo viên được ghi nhận đúng."
        : "Duy trì kiểm soát tỷ trọng chi phí như hiện tại."
    }

---

### II. BÓC TÁCH ĐIỂM NGHẼN HỌC VIÊN & CÔNG NỢ
- **Nhận xét**: ${
      snapshot.negativeDebtStudents.length > 0
        ? "Đang tồn đọng công nợ học phí ở mức cần xử lý ngay, ảnh hưởng trực tiếp dòng tiền nếu không thu hồi kịp thời."
        : snapshot.lowBalanceStudents.length > 0
        ? "Chưa phát sinh nợ khẩn cấp, nhưng có nhóm học viên sắp hết buổi cần chủ động chăm sóc gia hạn trước khi chuyển thành nguy cơ mất học viên."
        : "Tình hình công nợ học phí đang trong tầm kiểm soát tốt, không có điểm nghẽn cần xử lý gấp."
    }
- **Nguyên nhân**: ${
      snapshot.negativeDebtStudents.length > 0
        ? "Học viên đã học vượt số buổi đã đóng tiền nhưng chưa gia hạn kịp thời."
        : "Không phát hiện bất thường trong kỳ này."
    }
- **Giải pháp**: ${
      snapshot.negativeDebtStudents.length > 0 || snapshot.lowBalanceStudents.length > 0
        ? "Gửi thông báo kèm mã VietQR thu học phí/gia hạn ngay cho các học viên trên trong 48 giờ tới."
        : "Tiếp tục theo dõi định kỳ, chưa cần hành động khẩn cấp."
    }

---

### III. HIỆU SUẤT VẬN HÀNH CÁC LỚP HỌC
- **Nhận xét**: ${
      snapshot.classPerformance.some((c) => c.activeEnrollments < 5 || c.absentUnexcusedCount > 5)
        ? "Một số lớp đang vận hành kém hiệu quả (sĩ số thấp hoặc tỷ lệ vắng cao), tiềm ẩn rủi ro ảnh hưởng doanh thu và trải nghiệm học viên nếu không điều chỉnh."
        : "Toàn bộ lớp học đang vận hành ổn định, chưa ghi nhận rủi ro về sĩ số hay chuyên cần."
    }
- **Nguyên nhân**: ${
      snapshot.classPerformance.some((c) => c.activeEnrollments < 5 || c.absentUnexcusedCount > 5)
        ? "Một số lớp có dấu hiệu sĩ số thấp hoặc vắng nhiều, có thể do lịch học chưa phù hợp hoặc chưa được chăm sóc tái tục kịp thời."
        : "Các lớp đang vận hành ổn định, chưa phát hiện bất thường."
    }
- **Giải pháp**: ${
      snapshot.classPerformance.some((c) => c.activeEnrollments < 5 || c.absentUnexcusedCount > 5)
        ? "Rà soát điều phối/dồn lớp sĩ số thấp, liên hệ phụ huynh học viên vắng nhiều để tìm hiểu nguyên nhân và hỗ trợ kèm cặp bổ trợ."
        : "Duy trì vận hành hiện tại."
    }

---

### IV. KẾ HOẠCH HÀNH ĐỘNG TUẦN / THÁNG TỚI (ACTION PLAN)
1. **Thu hồi công nợ khẩn cấp**: Kích hoạt gửi thông báo kèm VietQR 24/7 cho ${snapshot.negativeDebtStudents.length} học sinh âm buổi.
2. **Chăm sóc tái tục sớm**: Phân công tư vấn viên gọi điện tư vấn lộ trình học cho nhóm ${snapshot.lowBalanceStudents.length} học sinh còn ≤ 2 buổi.
3. **Tối ưu sĩ số lớp**: Rà soát các lớp có sĩ số dưới 5 học viên để điều phối khung giờ hoặc dồn lớp nhằm bảo toàn biên lợi nhuận.`;

    return { success: true, report: reportText };
  }

  const prompt = `Bạn là Cody, Cố vấn Quản trị & Vận hành cấp cao của trung tâm dạy thêm.
Dựa trên dữ liệu thống kê vận hành thực tế kỳ ${timeTitle} dưới đây, hãy lập BẢN BÁO CÁO PHÂN TÍCH TỔNG HỢP CHI TIẾT VÀ KẾ HOẠCH HÀNH ĐỘNG.
Tuyệt đối không bịa đặt số liệu ngoài các dữ kiện đã cung cấp.

DỮ LIỆU THỰC TẾ (${snapshot.startDateStr} đến ${snapshot.endDateStr}):
- Doanh thu thực thu: ${new Intl.NumberFormat("vi-VN").format(snapshot.paidRevenue)} đ
- Thù lao giáo viên: ${new Intl.NumberFormat("vi-VN").format(snapshot.teacherCosts)} đ
- Lợi nhuận gộp: ${new Intl.NumberFormat("vi-VN").format(snapshot.grossProfit)} đ (${marginPercent}%)
- Tỷ lệ lương/doanh thu: ${salaryPercent}%
- Học sinh âm buổi: ${
  snapshot.negativeDebtStudents.length > 0
    ? snapshot.negativeDebtStudents.map((s) => `${s.studentName} (Lớp ${s.className}, âm ${Math.abs(s.balanceSessions)} buổi)`).join("; ")
    : "Không có"
}
- Học sinh sắp hết buổi: ${
  snapshot.lowBalanceStudents.length > 0
    ? snapshot.lowBalanceStudents.map((s) => `${s.studentName} (Lớp ${s.className}, còn ${s.balanceSessions} buổi)`).join("; ")
    : "Không có"
}
- Tình hình từng lớp:
${snapshot.classPerformance.map((c) => `  * ${c.className}: Sĩ số ${c.activeEnrollments}, ${c.completedSessions} buổi dạy xong, ${c.cancelledSessions} buổi hủy, ${c.absentUnexcusedCount} lượt vắng không phép`).join("\n")}

Cấu trúc trình bày bằng Markdown chuyên nghiệp. Với RIÊNG 3 mục I, II, III: BẮT BUỘC
trình bày đủ 3 phần rõ ràng theo đúng thứ tự — **Nhận xét** (đánh giá dựa trên số liệu),
**Nguyên nhân** (nếu phát hiện điểm bất thường/rủi ro; nếu số liệu bình thường thì ghi rõ
"Không phát hiện bất thường"), **Giải pháp** (hành động cụ thể để xử lý đúng nguyên nhân
vừa nêu). Mục IV KHÔNG lặp lại nội dung 3 mục trên mà là kế hoạch hành động tổng thể,
ưu tiên theo thứ tự, cho cả kỳ tới.

QUAN TRỌNG: phần **Nhận xét** của mỗi mục KHÔNG được chỉ liệt kê lại các con số đã
cung cấp ở trên (những số liệu đó đã hiển thị sẵn trên các thẻ/bảng của báo cáo) — phải
đưa ra NHẬN ĐỊNH/ĐÁNH GIÁ định tính (VD: "bất thường", "rủi ro", "ổn định", "cần lưu ý")
dựa trên việc diễn giải ý nghĩa của số liệu đó, không nhắc lại số liệu thô.

### I. BỨC TRANH TÀI CHÍNH & HIỆU QUẢ DẠY HỌC
### II. BÓC TÁCH ĐIỂM NGHẼN HỌC VIÊN & CÔNG NỢ
### III. HIỆU SUẤT VẬN HÀNH CÁC LỚP HỌC
### IV. KẾ HOẠCH HÀNH ĐỘNG CỤ THỂ CHO BAN GIÁM ĐỐC & GIÁO VỤ (ACTION PLAN)`;

  try {
    const response = await fetchGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2500 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Lỗi Gemini API generateAIExecutiveReport:", errText);
      if (response.status === 503) {
        return { error: "Dịch vụ AI (Gemini) đang quá tải, vui lòng thử lại sau ít phút" };
      }
      return { error: "Không thể kết nối đến Trợ lý AI để sinh báo cáo" };
    }

    const data = await response.json();
    const report = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!report) return { error: "AI không phản hồi nội dung báo cáo" };

    return { success: true, report };
  } catch (err: any) {
    console.error("Lỗi sinh báo cáo AI:", err);
    return { error: err?.message || "Lỗi khi tổng hợp báo cáo AI" };
  }
}

/**
 * Chatbot AI vận hành (Cody AI Advisor) phân tích chuyên sâu dữ liệu thật từ Google Gemini REST API.
 */
export async function askAIAnalyticsChatbot({
  messages,
  snapshot,
}: {
  messages: ChatMessage[];
  snapshot: OperationalSnapshot;
}): Promise<{ success?: boolean; reply?: string; error?: string }> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error: "Vui lòng cấu hình GEMINI_API_KEY trong .env.local để sử dụng Trợ lý AI",
    };
  }

  if (!messages || messages.length === 0) {
    return { error: "Nội dung câu hỏi không được để trống" };
  }

  const systemPrompt = `Bạn là Cody, Cố vấn Quản trị & Vận hành cấp cao của trung tâm dạy thêm.
Bạn chỉ được phân tích dựa trên dữ liệu thống kê thực tế được cung cấp bên dưới. Tuyệt đối không tự bịa đặt hay suy diễn số liệu không có trong báo cáo.
Khi đánh giá, bạn PHẢI:
1. Đưa ra nhận xét khách quan về Doanh thu, Thù lao giáo viên và Lợi nhuận gộp dạy học.
2. CHỈ RÕ ĐIỂM NGHẼN/ĐIỂM YẾU: Học viên nào nợ học phí, lớp nào có tỷ lệ vắng/hủy cao hoặc sĩ số quá thấp gây nguy cơ lỗ.
3. ĐỀ XUẤT GIẢI PHÁP HÀNH ĐỘNG CỤ THỂ (Action Plan): Nêu rõ từng bước cho Admin/Giáo vụ xử lý ngay trong tuần tới.
Định dạng văn bản bằng Markdown rõ ràng, chuyên nghiệp.

DỮ LIỆU THỐNG KÊ VẬN HÀNH THỰC TẾ (${snapshot.weekLabel || `Tháng ${snapshot.month}/${snapshot.year}`}):
- Doanh thu thực thu (Paid Revenue): ${new Intl.NumberFormat("vi-VN").format(snapshot.paidRevenue)} đ
- Thù lao giáo viên đã dạy (Teacher Costs): ${new Intl.NumberFormat("vi-VN").format(snapshot.teacherCosts)} đ
- Lợi nhuận gộp (Gross Profit): ${new Intl.NumberFormat("vi-VN").format(snapshot.grossProfit)} đ
- Tỷ lệ chi phí thù lao / Doanh thu: ${snapshot.paidRevenue > 0 ? Math.round((snapshot.teacherCosts / snapshot.paidRevenue) * 100) : 0}%
- Danh sách học viên âm buổi (Nợ học phí khẩn cấp): ${
  snapshot.negativeDebtStudents.length > 0
    ? snapshot.negativeDebtStudents.map((s) => `${s.studentName} (Lớp "${s.className}": âm ${Math.abs(s.balanceSessions)} buổi)`).join("; ")
    : "Không có học viên âm buổi"
}
- Danh sách học viên sắp hết buổi (0 đến 2 buổi): ${
  snapshot.lowBalanceStudents.length > 0
    ? snapshot.lowBalanceStudents.map((s) => `${s.studentName} (Lớp "${s.className}": còn ${s.balanceSessions} buổi)`).join("; ")
    : "Không có học viên sắp hết buổi"
}
- Thống kê tình hình vận hành các lớp học:
${snapshot.classPerformance.map((c) => `  * Lớp "${c.className}": ${c.activeEnrollments} học viên đang học | ${c.completedSessions} buổi hoàn thành | ${c.cancelledSessions} buổi hủy | ${c.absentUnexcusedCount} lượt vắng không phép`).join("\n")}
`;

  try {
    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetchGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Lỗi Google Gemini REST API:", response.status, errText);
      if (response.status === 400 || response.status === 403) {
        return { error: "Khóa GEMINI_API_KEY không hợp lệ hoặc đã hết hạn ngạch" };
      }
      if (response.status === 503) {
        return { error: "Dịch vụ AI (Gemini) đang quá tải, vui lòng thử lại sau ít phút" };
      }
      return { error: `Lỗi kết nối dịch vụ AI (${response.status})` };
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return { error: "Trợ lý AI không phản hồi được nội dung hợp lệ" };
    }

    return { success: true, reply };
  } catch (err: any) {
    console.error("Lỗi khi gọi chatbot AI analytics:", err);
    return { error: err?.message || "Không thể kết nối đến Trợ lý AI" };
  }
}
