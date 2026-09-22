"use server";

import { requireRole } from "@/lib/auth/guards";

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
- **Doanh thu thực thu**: ${new Intl.NumberFormat("vi-VN").format(snapshot.paidRevenue)} đ
- **Thù lao giáo viên**: ${new Intl.NumberFormat("vi-VN").format(snapshot.teacherCosts)} đ (Chiếm **${salaryPercent}%** doanh thu)
- **Lợi nhuận gộp**: ${new Intl.NumberFormat("vi-VN").format(snapshot.grossProfit)} đ (Biên lợi nhuận: **${marginPercent}%**)
- **Đánh giá kiểm soát chi phí**: ${
      salaryPercent <= 45
        ? "✅ Tỷ trọng thù lao giáo viên đang ở mức an toàn (< 45%). Hoạt động dạy học mang lại dòng tiền dương vững chắc."
        : "⚠️ Tỷ trọng thù lao giáo viên đang vượt ngưỡng chuẩn 45%. Cần tối ưu sĩ số các lớp để nâng cao hiệu suất dòng tiền."
    }

---

### II. BÓC TÁCH ĐIỂM NGHẼN HỌC VIÊN & CÔNG NỢ
- **Học viên âm buổi (Nợ học phí khẩn cấp)**: ${
      snapshot.negativeDebtStudents.length > 0
        ? `Phát hiện **${snapshot.negativeDebtStudents.length} học viên** bị âm buổi (${snapshot.negativeDebtStudents.map((s) => `${s.studentName} - Lớp ${s.className}`).join(", ")}). Cần gửi mã VietQR thu hồi học phí ngay.`
        : "✅ Không có học viên nào bị âm buổi học trong kỳ này."
    }
- **Học viên sắp hết buổi (<= 2 buổi)**: Có **${snapshot.lowBalanceStudents.length} học viên** cần chăm sóc tái tục trước buổi học cuối.

---

### III. HIỆU SUẤT VẬN HÀNH CÁC LỚP HỌC
${snapshot.classPerformance.map((c) => {
  const status = c.activeEnrollments < 5 ? "⚠️ Sĩ số thấp" : c.absentUnexcusedCount > 5 ? "⚠️ Vắng nhiều" : "✅ Ổn định";
  return `- **Lớp ${c.className}**: ${c.activeEnrollments} học viên | ${c.completedSessions} buổi hoàn thành | ${c.cancelledSessions} buổi hủy | ${c.absentUnexcusedCount} lượt vắng không phép ➔ ${status}`;
}).join("\n")}

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

Cấu trúc trình bày bằng Markdown chuyên nghiệp:
### I. BỨC TRANH TÀI CHÍNH & HIỆU QUẢ DẠY HỌC
### II. BÓC TÁCH ĐIỂM NGHẼN HỌC VIÊN & CÔNG NỢ
### III. HIỆU SUẤT VẬN HÀNH CÁC LỚP HỌC
### IV. KẾ HOẠCH HÀNH ĐỘNG CỤ THỂ CHO BAN GIÁM ĐỐC & GIÁO VỤ (ACTION PLAN)`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
