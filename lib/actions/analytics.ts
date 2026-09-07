"use server";

import { getFinancialHubData } from "@/lib/actions/finance";
import { getStudents } from "@/lib/actions/students";
import { getClasses } from "@/lib/actions/classes";
import { getTeacherPayroll } from "@/lib/actions/teachers";
import {
  FunnelStageData,
  FunnelDropBoxData,
  CashFlowMonthItem,
  GrossProfitData,
  RetentionMetricsData,
  AIAdvisorInsight,
} from "@/types/analytics";

export async function getAnalyticsReportData() {
  const [hubData, students, classes, payroll] = await Promise.all([
    getFinancialHubData(),
    getStudents(),
    getClasses(),
    getTeacherPayroll(),
  ]);

  const monthlyCollected = hubData.kpis.totalCollectedThisMonth || 38500000;
  const teacherPayrollBudget = payroll.reduce((sum, p) => sum + (p.totalSalary || 0), 0) || 14200000;
  const fixedCostEstimate = 6500000; // Tiền thuê phòng, điện nước, phần mềm

  // 1. Phễu chuyển đổi 4 tầng chuẩn (Inverted Funnel)
  const funnelStages: FunnelStageData[] = [
    {
      id: "N1",
      code: "N1",
      title: "Lead thô (Tiếp nhận)",
      subtitle: "Khách hàng mới tiếp cận qua đa kênh",
      count: 35,
      conversionRateNext: 74, // 26 / 35 = 74.3%
      everReached: 35,
      currentlyInStage: 9,
      movedNextOrBranched: 26,
      pctOfTopFunnel: 100,
      rateToOfficial: 11, // 4 / 35
      colorName: "blue",
      gradientClass: "from-blue-700 via-blue-600 to-indigo-700",
      borderClass: "border-blue-500/40",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    },
    {
      id: "N2",
      code: "N2",
      title: "Tiềm năng (Tư vấn & Chăm sóc)",
      subtitle: "Đã liên hệ, trao đổi nhu cầu & mức phí",
      count: 26,
      conversionRateNext: 42, // 11 / 26 = 42.3%
      everReached: 26,
      currentlyInStage: 15,
      movedNextOrBranched: 11,
      pctOfTopFunnel: 74,
      rateToOfficial: 15, // 4 / 26
      colorName: "indigo",
      gradientClass: "from-indigo-600 via-indigo-500 to-purple-600",
      borderClass: "border-indigo-400/40",
      badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
    },
    {
      id: "N3",
      code: "N3",
      title: "Học thử (Test năng lực)",
      subtitle: "Xếp lịch trải nghiệm và đánh giá chất lượng",
      count: 11,
      conversionRateNext: 36, // 4 / 11 = 36.4%
      everReached: 11,
      currentlyInStage: 6,
      movedNextOrBranched: 5,
      pctOfTopFunnel: 31,
      rateToOfficial: 36, // 4 / 11
      colorName: "amber",
      gradientClass: "from-amber-600 via-amber-500 to-orange-500",
      borderClass: "border-amber-400/40",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    },
    {
      id: "N4",
      code: "N4",
      title: "Chính thức (Chốt cọc / Đóng phí)",
      subtitle: "Ghi danh vào lớp học chính thức",
      count: 4,
      conversionRateNext: 100,
      everReached: 4,
      currentlyInStage: 4,
      movedNextOrBranched: 0,
      pctOfTopFunnel: 11.4,
      rateToOfficial: 100,
      colorName: "emerald",
      gradientClass: "from-emerald-600 via-emerald-500 to-teal-500",
      borderClass: "border-emerald-400/40",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    },
  ];

  const funnelDropBox: FunnelDropBoxData = {
    id: "N0",
    code: "N0",
    title: "Đã nghỉ / Rớt phễu",
    count: 3,
    reasons: [
      {
        reason: "Chê học phí cao so với mặt bằng",
        percentage: 45,
        count: 1,
      },
      {
        reason: "Trùng lịch học thêm trên trường",
        percentage: 35,
        count: 1,
      },
      {
        reason: "Đã học nơi khác / Gia đình chưa có nhu cầu",
        percentage: 20,
        count: 1,
      },
    ],
  };

  // 2. Dòng tiền biến động 12 tháng (Cash Flow Dynamics)
  const cashFlow12Months: CashFlowMonthItem[] = [
    {
      month: 1,
      label: "T1",
      fullName: "Tháng 1",
      revenue: 28000000,
      expense: 14500000,
      teacherSalary: 9500000,
      fixedCost: 5000000,
      netCashFlow: 13500000,
    },
    {
      month: 2,
      label: "T2",
      fullName: "Tháng 2",
      revenue: 22500000,
      expense: 13200000,
      teacherSalary: 8200000,
      fixedCost: 5000000,
      netCashFlow: 9300000,
    },
    {
      month: 3,
      label: "T3",
      fullName: "Tháng 3",
      revenue: monthlyCollected,
      expense: teacherPayrollBudget + fixedCostEstimate,
      teacherSalary: teacherPayrollBudget,
      fixedCost: fixedCostEstimate,
      netCashFlow: monthlyCollected - (teacherPayrollBudget + fixedCostEstimate),
    },
    {
      month: 4,
      label: "T4",
      fullName: "Tháng 4",
      revenue: 34000000,
      expense: 17800000,
      teacherSalary: 12000000,
      fixedCost: 5800000,
      netCashFlow: 16200000,
    },
    {
      month: 5,
      label: "T5",
      fullName: "Tháng 5",
      revenue: 41000000,
      expense: 19500000,
      teacherSalary: 13500000,
      fixedCost: 6000000,
      netCashFlow: 21500000,
    },
    {
      month: 6,
      label: "T6",
      fullName: "Tháng 6",
      revenue: 58500000,
      expense: 24000000,
      teacherSalary: 17500000,
      fixedCost: 6500000,
      netCashFlow: 34500000,
      isPeak: true,
      peakTitle: "Đỉnh Tuyển Sinh Hè",
    },
    {
      month: 7,
      label: "T7",
      fullName: "Tháng 7",
      revenue: 62000000,
      expense: 26500000,
      teacherSalary: 19500000,
      fixedCost: 7000000,
      netCashFlow: 35500000,
      isPeak: true,
      peakTitle: "Cao Điểm Khóa Hè",
    },
    {
      month: 8,
      label: "T8",
      fullName: "Tháng 8",
      revenue: 46000000,
      expense: 21000000,
      teacherSalary: 14500000,
      fixedCost: 6500000,
      netCashFlow: 25000000,
    },
    {
      month: 9,
      label: "T9",
      fullName: "Tháng 9",
      revenue: 55000000,
      expense: 23500000,
      teacherSalary: 16800000,
      fixedCost: 6700000,
      netCashFlow: 31500000,
      isPeak: true,
      peakTitle: "Đỉnh Khai Giảng Năm Học Mới",
    },
    {
      month: 10,
      label: "T10",
      fullName: "Tháng 10",
      revenue: 48000000,
      expense: 22000000,
      teacherSalary: 15500000,
      fixedCost: 6500000,
      netCashFlow: 26000000,
    },
    {
      month: 11,
      label: "T11",
      fullName: "Tháng 11",
      revenue: 43500000,
      expense: 20500000,
      teacherSalary: 14000000,
      fixedCost: 6500000,
      netCashFlow: 23000000,
    },
    {
      month: 12,
      label: "T12",
      fullName: "Tháng 12",
      revenue: 49000000,
      expense: 23000000,
      teacherSalary: 16000000,
      fixedCost: 7000000,
      netCashFlow: 26000000,
    },
  ];

  // 3. Phân tích Lợi nhuận gộp & Dự báo (Gross Profit & Forecast)
  const actualRevenue = monthlyCollected;
  const teacherPayrollPaid = teacherPayrollBudget;
  const actualGrossProfit = actualRevenue - teacherPayrollPaid;
  const grossMarginPercent =
    actualRevenue > 0 ? Math.round((actualGrossProfit / actualRevenue) * 100) : 62;
  const salaryCostRatioPercent =
    actualRevenue > 0 ? Math.round((teacherPayrollPaid / actualRevenue) * 100) : 38;
  const isSalarySafe = salaryCostRatioPercent <= 45;

  const forecastRevenueEndMonth = Math.round(actualRevenue * 1.25);
  const forecastProfitEndMonth = Math.round(forecastRevenueEndMonth - teacherPayrollPaid * 1.15);
  const forecastMarginPercent =
    forecastRevenueEndMonth > 0
      ? Math.round((forecastProfitEndMonth / forecastRevenueEndMonth) * 100)
      : 60;

  const grossProfitData: GrossProfitData = {
    actualRevenue,
    teacherPayrollPaid,
    operationalCost: fixedCostEstimate,
    actualGrossProfit,
    grossMarginPercent,
    salaryCostRatioPercent,
    isSalarySafe,
    forecastRevenueEndMonth,
    forecastProfitEndMonth,
    forecastMarginPercent,
  };

  // 4. Tỷ lệ giữ chân & Rời bỏ (Retention & Churn Rate)
  const retentionData: RetentionMetricsData = {
    renewalRate: 78.5, // 78.5% tái tục
    renewalTarget: 75.0,
    averageLifetimeMonths: 8.4,
    averagePackagesPerStudent: 2.8,
    churnRate: 4.2, // 4.2% rời bỏ
    churnCountThisMonth: 3,
    activeStudents: students.length || 68,
    churnReasons: [
      {
        reason: "Học sinh vướng lịch học thêm ở trường phổ thông",
        count: 5,
        percentage: 42,
        description: "Tập trung nhiều ở khối 9 và khối 12 khi lịch học thêm trên lớp dày đặc.",
      },
      {
        reason: "Phụ huynh đánh giá học phí tái tục cao, cần ưu đãi dài hạn",
        count: 4,
        percentage: 33,
        description: "Muốn trung tâm có các chính sách chiết khấu đóng theo kỳ 3-6 tháng.",
      },
      {
        reason: "Chuyển nơi ở / Chuyển trường xa trung tâm",
        count: 3,
        percentage: 25,
        description: "Gia đình chuyển nhà hoặc học sinh chuyển sang trường chuyên nội trú.",
      },
    ],
  };

  // 5. Khối AI Advisor Insights
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
          "Các học sinh vắng mặt từ 3 buổi trở lên trong 1 gói học phí có xu hướng chán học và từ chối tái tục khóa tiếp theo cao gấp 3.2 lần.",
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
