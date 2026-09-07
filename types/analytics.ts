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
  renewalRate: number; // Tỷ lệ tái tục học phí (%)
  renewalTarget: number; // Mục tiêu (75%)
  averageLifetimeMonths: number; // Thời gian gắn bó trung bình (tháng)
  averagePackagesPerStudent: number; // Số gói trung bình
  churnRate: number; // Tỷ lệ rời bỏ (%)
  churnCountThisMonth: number;
  activeStudents: number;
  churnReasons: {
    reason: string;
    count: number;
    percentage: number;
    description: string;
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
