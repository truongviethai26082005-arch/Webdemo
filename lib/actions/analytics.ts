"use server";

import {
  CashFlowMonthItem,
  GrossProfitData,
  AIAdvisorInsight,
} from "@/types/analytics";
import { requireRole } from "@/lib/auth/guards";

export interface UnavailableFeature {
  available: false;
  reason: string;
}

export interface AnalyticsRetentionData {
  customerRetentionRate: number | UnavailableFeature; // Tỷ lệ giữ chân khách hàng (CRR %)
  renewalRate: number; // Tỷ lệ đóng tiếp học phí (Renewal %)
  renewalTarget: number; // Mục tiêu duy trì (75%)
  renewalCount: number; // Số học viên đóng tiếp / quay lại
  consideringRate: number; // Tỷ lệ đang cân nhắc (%)
  consideringCount: number; // Số học viên đang cân nhắc
  churnRate: number | UnavailableFeature; // Tỷ lệ dừng học hẳn (%)
  churnCountThisMonth?: number; // Số học sinh thôi học trong tháng
  totalExpiringThisMonth: number; // Tổng học viên đến hạn / sắp hết gói
  renewedSuccessCount: number; // Số học viên gia hạn thành công
  averageLifetimeMonths: number; // Thời gian học trung bình (tháng)
  averagePackagesPerStudent: number; // Số khóa học trung bình (~khóa)
  activeStudents: number; // Số học sinh đang học
  churnReasons: UnavailableFeature;
}

export interface AnalyticsReportData {
  funnelStages: UnavailableFeature;
  funnelDropBox: UnavailableFeature;
  cashFlow12Months: CashFlowMonthItem[];
  grossProfitData: GrossProfitData;
  retentionData: AnalyticsRetentionData;
  aiAdvisor: AIAdvisorInsight;
}

export async function getAnalyticsReportData(): Promise<AnalyticsReportData | null> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return null;
  const { supabase } = guard.context;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based: 0 = Tháng 1, 8 = Tháng 9
  const daysPassed = Math.max(now.getDate(), 1);
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // ─── 1. CHI PHÍ CỐ ĐỊNH TỪ CENTER_SETTINGS ───
  let fixedCost = 6500000;
  try {
    const { data: settings } = await supabase
      .from("center_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    // TODO: Bổ sung trường 'fixed_cost' vào bảng center_settings để người dùng cấu hình chi phí cố định trực tiếp từ giao diện cài đặt (không tạo schema mới trong task này)
    if (settings && typeof (settings as any).fixed_cost === "number") {
      fixedCost = (settings as any).fixed_cost;
    }
  } catch (err) {
    console.warn("Could not read fixed_cost from center_settings:", err);
  }

  // ─── 2. TRUY VẤN HÓA ĐƠN ĐÃ THANH TOÁN (STATUS = 'PAID') ───
  const { data: paidInvoicesData } = await supabase
    .from("invoices")
    .select("id, student_id, amount, status, paid_at, created_at")
    .eq("status", "paid");

  const allPaidInvoices = paidInvoicesData || [];

  // Tính doanh thu thật theo tháng paid_at (hoặc created_at nếu paid_at null)
  const monthlyRevenue = Array(12).fill(0);
  for (const inv of allPaidInvoices) {
    const dateStr = inv.paid_at || inv.created_at;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    if (d.getFullYear() === currentYear) {
      const m = d.getMonth();
      if (m >= 0 && m < 12) {
        monthlyRevenue[m] += Number(inv.amount) || 0;
      }
    }
  }

  // ─── 3. TRUY VẤN THÙ LAO GIÁO VIÊN (PROFILES ROLE = 'TEACHER') ───
  const { data: teachersData } = await supabase
    .from("profiles")
    .select("id, salary_per_session")
    .eq("role", "teacher");

  const teacherSalaryMap = new Map<string, number>();
  for (const t of teachersData || []) {
    teacherSalaryMap.set(t.id, Number(t.salary_per_session) || 0);
  }

  // ─── 4. TRUY VẤN CÁC BUỔI HỌC TRONG NĂM HIỆN TẠI (CLASS_SESSIONS) ───
  const startDateStr = `${currentYear}-01-01`;
  const endDateStr = `${currentYear}-12-31`;

  const { data: sessionsData } = await supabase
    .from("class_sessions")
    .select("id, teacher_id, session_date, status")
    .gte("session_date", startDateStr)
    .lte("session_date", endDateStr);

  const allSessions = sessionsData || [];

  const monthlyTeacherSalary = Array(12).fill(0);
  let currentMonthScheduledSalary = 0;

  for (const s of allSessions) {
    if (!s.session_date) continue;
    const d = new Date(s.session_date);
    if (d.getFullYear() !== currentYear) continue;
    const m = d.getMonth();
    if (m < 0 || m >= 12) continue;

    const rate = s.teacher_id ? (teacherSalaryMap.get(s.teacher_id) || 0) : 0;

    if (s.status === "completed") {
      monthlyTeacherSalary[m] += rate;
    } else if (s.status === "scheduled" && m === currentMonth) {
      currentMonthScheduledSalary += rate;
    }
  }

  // ─── 5. DÒNG TIỀN BIẾN ĐỘNG 12 THÁNG (CASHFLOW 12 MONTHS - TÍNH THẬT 100%) ───
  const cashFlow12Months: CashFlowMonthItem[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const rev = monthlyRevenue[i];
    const tSalary = monthlyTeacherSalary[i];
    const exp = tSalary + fixedCost;
    const net = rev - exp;

    return {
      month: m,
      label: `T${m}`,
      fullName: `Tháng ${m}`,
      revenue: rev,
      expense: exp,
      teacherSalary: tSalary,
      fixedCost: fixedCost,
      netCashFlow: net,
    };
  });

  // ─── 6. PHÂN TÍCH LỢI NHUẬN GỘP & DỰ BÁO (GROSS PROFIT & FORECAST - THÁNG HIỆN TẠI) ───
  const actualRevenue = monthlyRevenue[currentMonth];
  const teacherPayrollPaid = monthlyTeacherSalary[currentMonth];
  const actualGrossProfit = actualRevenue - teacherPayrollPaid;

  const grossMarginPercent =
    actualRevenue === 0 ? 0 : Math.round((actualGrossProfit / actualRevenue) * 100);
  const salaryCostRatioPercent =
    actualRevenue === 0 ? 0 : Math.round((teacherPayrollPaid / actualRevenue) * 100);
  const isSalarySafe = salaryCostRatioPercent <= 45;

  const forecastRevenueEndMonth = Math.round((actualRevenue / daysPassed) * totalDaysInMonth);
  const forecastTeacherSalaryEndMonth = teacherPayrollPaid + currentMonthScheduledSalary;
  const forecastProfitEndMonth = forecastRevenueEndMonth - (forecastTeacherSalaryEndMonth + fixedCost);
  const forecastMarginPercent =
    forecastRevenueEndMonth > 0
      ? Math.round((forecastProfitEndMonth / forecastRevenueEndMonth) * 100)
      : 0;

  const grossProfitData: GrossProfitData = {
    actualRevenue,
    teacherPayrollPaid,
    operationalCost: fixedCost,
    actualGrossProfit,
    grossMarginPercent,
    salaryCostRatioPercent,
    isSalarySafe,
    forecastRevenueEndMonth,
    forecastProfitEndMonth,
    forecastMarginPercent,
  };

  // ─── 7. TRUY VẤN HỌC SINH VÀ ENROLLMENTS ───
  const { data: studentsData } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      status,
      created_at,
      updated_at,
      enrollments:enrollments(
        id,
        balance_sessions
      )
    `);

  const allStudents = studentsData || [];
  // 7a. Tỷ lệ KHÁCH HÀNG QUAY LẠI (Renewal - học hết buổi rồi đăng ký tiếp):
  // Gom nhóm hóa đơn paid theo học sinh
  const studentPaidInvoicesMap = new Map<string, any[]>();
  for (const inv of allPaidInvoices) {
    if (!inv.student_id) continue;
    const list = studentPaidInvoicesMap.get(inv.student_id) || [];
    list.push(inv);
    studentPaidInvoicesMap.set(inv.student_id, list);
  }

  // Nhóm "đã từng hết buổi" CHỈ gồm học sinh có balance_sessions <= 0 (tổng balance_sessions <= 0)
  const finishedSessionsStudents = allStudents.filter((s) => {
    const totalBalance = (s.enrollments || []).reduce(
      (sum: number, e: any) => sum + (e.balance_sessions || 0),
      0
    );
    return totalBalance <= 0;
  });

  const totalFinishedSessionsCount = finishedSessionsStudents.length;

  // renewalCount = trong đúng nhóm đó, số học sinh có >= 2 hóa đơn status = 'paid'
  const renewalCount = finishedSessionsStudents.filter((s) => {
    const paidInvs = studentPaidInvoicesMap.get(s.id) || [];
    return paidInvs.length >= 2;
  }).length;

  const renewalRate =
    totalFinishedSessionsCount > 0
      ? Math.round((renewalCount / totalFinishedSessionsCount) * 100)
      : 0;

  // 7b. Các field còn lại tính thật từ DB
  const activeStudents = allStudents.filter((s) => s.status === "active").length;

  // Học viên đang cân nhắc: học sinh active có 0 < balance_sessions <= 2
  const consideringStudents = allStudents.filter((s) => {
    if (s.status !== "active") return false;
    const totalBalance = (s.enrollments || []).reduce(
      (sum: number, e: any) => sum + (e.balance_sessions || 0),
      0
    );
    return totalBalance > 0 && totalBalance <= 2;
  });
  const consideringCount = consideringStudents.length;
  const consideringRate =
    activeStudents > 0 ? Math.round((consideringCount / activeStudents) * 1000) / 10 : 0;

  // Tổng học viên đến hạn / sắp hết gói (balance_sessions <= 2)
  const totalExpiringThisMonth = allStudents.filter((s) => {
    if (s.status !== "active") return false;
    const totalBalance = (s.enrollments || []).reduce(
      (sum: number, e: any) => sum + (e.balance_sessions || 0),
      0
    );
    return totalBalance <= 2;
  }).length;

  // Thời gian học trung bình (tháng)
  const totalLifetimeMonths = allStudents.reduce((sum, s) => {
    const createdDate = new Date(s.created_at);
    const months = Math.max(0, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return sum + months;
  }, 0);
  const averageLifetimeMonths =
    allStudents.length > 0
      ? Math.round((totalLifetimeMonths / allStudents.length) * 10) / 10
      : 0;

  // Số gói học phí / hóa đơn trung bình mỗi học sinh
  const averagePackagesPerStudent =
    allStudents.length > 0
      ? Math.round((allPaidInvoices.length / allStudents.length) * 10) / 10
      : 0;

  // ─── PHẦN 2: PLACEHOLDER HÓA NHÓM B (FUNNEL & CHURN REASONS) ───
  const funnelStages: UnavailableFeature = {
    available: false,
    reason: "Cần hoàn thiện phân hệ Sale (bảng Lead)",
  };

  const funnelDropBox: UnavailableFeature = {
    available: false,
    reason: "Cần hoàn thiện phân hệ Sale (bảng Lead)",
  };

  const churnReasons: UnavailableFeature = {
    available: false,
    reason: "Cần hoàn thiện phân hệ Sale (bảng Lead)",
  };

  const retentionData: AnalyticsRetentionData = {
    customerRetentionRate: {
      available: false,
      reason:
        "Cần hoàn thiện tính năng tự động cập nhật trạng thái học sinh theo buổi/khóa học",
    },
    renewalRate,
    renewalTarget: 75.0,
    renewalCount,
    consideringRate,
    consideringCount,
    churnRate: {
      available: false,
      reason:
        "Cần hoàn thiện tính năng tự động cập nhật trạng thái học sinh theo buổi/khóa học",
    },
    totalExpiringThisMonth,
    renewedSuccessCount: renewalCount,
    averageLifetimeMonths,
    averagePackagesPerStudent,
    activeStudents,
    churnReasons,
  };

  // ─── 8. KHỐI AI ADVISOR INSIGHTS (GIỮ NGUYÊN 100%) ───
  const aiAdvisor: AIAdvisorInsight = {
    generatedAt: new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    executiveSummary:
      "Doanh thu tháng này tăng trưởng 18%, vận hành lớp học ổn định. Tuy nhiên, tỷ lệ chuyển đổi từ giai đoạn Học thử (N3) sang Chốt cọc chính thức (N4) giảm mạnh từ 42% xuống còn 28%. Cần can thiệp ngay ở khâu xử lý phản hồi phụ huynh sau buổi test.",
    bottlenecks: [
      {
        id: "b1",
        title: "Rào cản học phí chiếm 45% lý do phụ huynh từ chối",
        description:
          "Sau buổi học thử, đa số phụ huynh khen chất lượng giảng dạy nhưng chần chừ đóng tiền vì thiếu các phương án chia nhỏ kỳ hạn hoặc ưu đãi học bổng.",
        severity: "high",
      },
      {
        id: "b2",
        title: "Tỷ lệ gia hạn môn Tiếng Anh sụt giảm do nghỉ học quá 3 buổi",
        description:
          "Các học sinh vắng mặt từ 3 buổi trở lên trong 1 gói học phí có xu hướng chán học và từ chối gia hạn khóa tiếp theo cao gấp 3.2 lần.",
        severity: "medium",
      },
    ],
    recommendations: [
      {
        id: "r1",
        title: "Tung gói đóng học phí ưu đãi 3 tháng / 6 tháng kèm quà tặng",
        actionPlan:
          "Xử lý trực diện rào cản chi phí bằng chính sách tặng 1 buổi test định hướng và giảm 8% cho gói 24 buổi hoặc tặng balo trung tâm.",
        expectedImpact: "Tăng ngay tỷ lệ chốt học viên từ 28% lên 40% trong 2 tuần tới.",
        priority: "urgent",
      },
      {
        id: "r2",
        title: "Tư vấn viên liên hệ lại 15 Lead ở tầng 'Học thử' với kịch bản cam kết đầu ra",
        actionPlan:
          "Gửi báo cáo năng lực chi tiết của giáo viên sau buổi test kèm lộ trình cải thiện điểm số cụ thể trước kỳ thi giữa kỳ.",
        expectedImpact: "Thu hồi ít nhất 6-8 học viên tiềm năng đang lưỡng lự.",
        priority: "high",
      },
    ],
  };

  return {
    funnelStages,
    funnelDropBox,
    cashFlow12Months,
    grossProfitData,
    retentionData,
    aiAdvisor,
  };
}
