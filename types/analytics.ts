export interface FunnelStageData {
  id: "N1" | "N2" | "N3" | "N4";
  code: string; // "N1", "N2", "N3", "N4"
  title: string; // "Lead thô", "Tiềm năng", "Học thử", "Chính thức"
  subtitle: string;
  count: number;
  conversionRateNext: number; // e.g. 74, 42, 36
  everReached: number; // Đã từng đạt bậc
  currentlyInStage: number; // Đang ở bậc này
  movedNextOrBranched: number; // Đã đi tiếp hoặc ra nhánh
  pctOfTopFunnel: number; // So với bậc đầu phễu (31%)
  rateToOfficial: number; // Lên hệ: Chính thức (36%)
  colorName: string;
  gradientClass: string;
  borderClass: string;
  badgeClass: string;
}

export interface FunnelDropBoxData {
  id: "N0";
  code: string; // "N0"
  title: string; // "Đã nghỉ / Rớt phễu"
  count: number;
  reasons: {
    reason: string;
    percentage: number;
    count: number;
  }[];
}

export interface CashFlowMonthItem {
  month: number;
  label: string; // "T1", "T2"...
  fullName: string; // "Tháng 1", "Tháng 2"...
  revenue: number; // Doanh thu thực thu
  expense: number; // Chi phí vận hành (Lương GV + Cố định)
  teacherSalary: number; // Lương thù lao GV
  fixedCost: number; // Chi phí cố định & quản lý
  netCashFlow: number; // Dòng tiền ròng
  isPeak?: boolean;
  peakTitle?: string;
}

export interface GrossProfitData {
  actualRevenue: number;
  teacherPayrollPaid: number;
  operationalCost: number;
  actualGrossProfit: number;
  grossMarginPercent: number; // % Biên lợi nhuận gộp
  salaryCostRatioPercent: number; // % Chi phí lương / Doanh thu
  isSalarySafe: boolean; // an toàn nếu <= 45%
  forecastRevenueEndMonth: number;
  forecastProfitEndMonth: number;
  forecastMarginPercent: number;
}

export interface RetentionMetricsData {
  renewalRate: number; // Tỷ lệ đóng tiếp học phí (%) e.g. 78.5
  renewalTarget: number; // Mục tiêu duy trì (75%)
  renewalCount?: number; // Số học viên đóng tiếp (79 bạn)
  consideringRate?: number; // Tỷ lệ đang cân nhắc / chờ phản hồi (%) e.g. 17.3
  consideringCount?: number; // Số học viên đang cân nhắc (18 bạn)
  churnRate: number; // Tỷ lệ dừng học hẳn (%) e.g. 4.2
  churnCountThisMonth: number; // Số học sinh nghỉ (3 bạn)
  totalExpiringThisMonth?: number; // Tổng học viên đến hạn kết thúc gói (100 bạn)
  renewedSuccessCount?: number; // Số học viên gia hạn thành công (75 bạn)
  averageLifetimeMonths: number; // Thời gian học trung bình (8.4 tháng)
  averagePackagesPerStudent: number; // Số khóa học trung bình (~3 khóa)
  activeStudents: number;
  churnReasons: {
    reason: string;
    count: number;
    percentage: number;
    description: string;
    solutionNote?: string; // e.g. "Ưu tiên hỗ trợ đổi ca"
  }[];
}

export interface AIAdvisorInsight {
  generatedAt: string;
  executiveSummary: string;
  bottlenecks: {
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }[];
  recommendations: {
    id: string;
    title: string;
    actionPlan: string;
    expectedImpact: string;
    priority: "urgent" | "high" | "normal";
  }[];
}
