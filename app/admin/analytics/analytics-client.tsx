"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Sparkles,
  Layers,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AISmartNavigator } from "@/components/analytics/ai-smart-navigator";
import { FloatingMiniToc } from "@/components/analytics/floating-mini-toc";
import {
  PrintReportHeader,
  PrintReportFooter,
} from "@/components/analytics/print-report-header";

import { AIAdvisorHeader, ExecutiveMetrics } from "@/components/analytics/ai-advisor-header";
import { FunnelVisualizationCard } from "@/components/analytics/funnel-visualization-card";
import { CashFlowChartCard } from "@/components/analytics/cashflow-chart-card";
import { GrossProfitCard } from "@/components/analytics/gross-profit-card";
import { RetentionChurnCard } from "@/components/analytics/retention-churn-card";
import { OperationalIssue } from "@/components/analytics/operational-issue-modal";

import {
  FunnelStageData,
  FunnelDropBoxData,
  CashFlowMonthItem,
  GrossProfitData,
  RetentionMetricsData,
  AIAdvisorInsight,
} from "@/types/analytics";

import { useEduStore } from "@/lib/store/use-edu-store";
import { formatVND } from "@/lib/utils/vietqr";

export interface AnalyticsClientProps {
  monthlyData?: any[];
  initialCashFlow?: CashFlowMonthItem[];
  initialFunnelStages?: FunnelStageData[];
  initialFunnelDropBox?: FunnelDropBoxData;
  initialGrossProfit?: GrossProfitData;
  initialRetention?: RetentionMetricsData;
  initialAiAdvisor?: AIAdvisorInsight;
}

const SECTION_IDS = [
  "section-ai-executive",
  "section-funnel",
  "section-cashflow",
  "section-grossprofit",
  "section-retention",
];

export const DEFAULT_CASH_FLOW_12_MONTHS: CashFlowMonthItem[] = [
  { month: 1, label: "T1", fullName: "Tháng 1", revenue: 32000000, expense: 21500000, teacherSalary: 15000000, fixedCost: 6500000, netCashFlow: 10500000 },
  { month: 2, label: "T2", fullName: "Tháng 2", revenue: 28500000, expense: 19500000, teacherSalary: 13000000, fixedCost: 6500000, netCashFlow: 9000000 },
  { month: 3, label: "T3", fullName: "Tháng 3", revenue: 38500000, expense: 20700000, teacherSalary: 14200000, fixedCost: 6500000, netCashFlow: 17800000 },
  { month: 4, label: "T4", fullName: "Tháng 4", revenue: 35000000, expense: 21000000, teacherSalary: 14500000, fixedCost: 6500000, netCashFlow: 14000000 },
  { month: 5, label: "T5", fullName: "Tháng 5", revenue: 42000000, expense: 23500000, teacherSalary: 17000000, fixedCost: 6500000, netCashFlow: 18500000 },
  { month: 6, label: "T6", fullName: "Tháng 6", revenue: 58000000, expense: 28500000, teacherSalary: 22000000, fixedCost: 6500000, netCashFlow: 29500000 },
  { month: 7, label: "T7", fullName: "Tháng 7", revenue: 65000000, expense: 31500000, teacherSalary: 25000000, fixedCost: 6500000, netCashFlow: 33500000, isPeak: true, peakTitle: "Cao điểm Tuyển sinh Hè" },
  { month: 8, label: "T8", fullName: "Tháng 8", revenue: 54000000, expense: 27500000, teacherSalary: 21000000, fixedCost: 6500000, netCashFlow: 26500000 },
  { month: 9, label: "T9", fullName: "Tháng 9", revenue: 48000000, expense: 24500000, teacherSalary: 18000000, fixedCost: 6500000, netCashFlow: 23500000 },
  { month: 10, label: "T10", fullName: "Tháng 10", revenue: 45000000, expense: 23500000, teacherSalary: 17000000, fixedCost: 6500000, netCashFlow: 21500000 },
  { month: 11, label: "T11", fullName: "Tháng 11", revenue: 41000000, expense: 22500000, teacherSalary: 16000000, fixedCost: 6500000, netCashFlow: 18500000 },
  { month: 12, label: "T12", fullName: "Tháng 12", revenue: 46000000, expense: 24000000, teacherSalary: 17500000, fixedCost: 6500000, netCashFlow: 22000000 },
];

export const DEFAULT_AI_ADVISOR: AIAdvisorInsight = {
  generatedAt: "10:00 - 10/09/2026",
  executiveSummary: "Hệ thống AI phân tích toàn diện 4 khối vận hành: Tuyển sinh, Lớp học, Giáo viên và Tài chính.",
  bottlenecks: [],
  recommendations: [],
};

export function AnalyticsClient({
  monthlyData,
  initialCashFlow,
  initialFunnelStages = [],
  initialFunnelDropBox,
  initialGrossProfit,
  initialRetention,
  initialAiAdvisor = DEFAULT_AI_ADVISOR,
}: AnalyticsClientProps = {}) {
  // ─── 0. ĐẢM BẢO MẢNG MONTHLY DATA LUÔN LÀ MẢNG AN TOÀN TRÁNH RUNTIME CRASH ───
  const rawData = monthlyData || initialCashFlow;
  const safeMonthlyData: CashFlowMonthItem[] =
    Array.isArray(rawData) && rawData.length > 0
      ? rawData
      : DEFAULT_CASH_FLOW_12_MONTHS;

  const maxRevenue = Math.max(...safeMonthlyData.map((d) => d.revenue || 0), 1);

  // ─── 1. KẾT NỐI TRỰC TIẾP VỚI STORE TOÀN CỤC (SINGLE SOURCE OF TRUTH) ───
  const store = useEduStore();
  const rawStudents = store?.students;
  const rawClasses = store?.classes;
  const rawTeachers = store?.teachers;
  const rawInvoices = store?.invoices;
  const rawLeads = store?.leads;
  const rawTrials = store?.trials;

  const students = Array.isArray(rawStudents) ? rawStudents : [];
  const classes = Array.isArray(rawClasses) ? rawClasses : [];
  const teachers = Array.isArray(rawTeachers) ? rawTeachers : [];
  const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];
  const leads = Array.isArray(rawLeads) ? rawLeads : [];
  const trials = Array.isArray(rawTrials) ? rawTrials : [];

  const [aiAdvisor, setAiAdvisor] = useState<AIAdvisorInsight>(initialAiAdvisor || DEFAULT_AI_ADVISOR);
  const [activeSectionId, setActiveSectionId] = useState<string>("section-ai-executive");
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── 2. ĐỒNG BỘ ĐỒ THỊ PHỄU CHUYỂN ĐỔI (4 TẦNG N1 -> N4) ───
  // Tầng N1 (Lead thô): leads.length (Tự động tăng khi thêm lead mới)
  const N1 = leads.length;

  // Tầng N2 (Tiềm năng / Đang chăm sóc): leads có trạng thái caring, contacted, scheduled, callback
  const N2 = leads.filter((l) =>
    ["caring", "contacted", "scheduled", "callback"].includes(l.status)
  ).length;

  // Tầng N3 (Học thử): leads có trạng thái attended hoặc có trong lịch học thử
  const attendedLeadsCount = leads.filter(
    (l) => (l.status as string) === "attended" || Boolean((l as any).trialAttended)
  ).length;
  const N3 = Math.max(attendedLeadsCount, trials.length);

  // Tầng N4 (Chính thức): Số lượng học sinh đang theo học thực tế
  const activeStudentsCount = students.filter((s) => s.status === "active" || !s.status).length;
  const enrolledLeadsCount = leads.filter(
    (l) => (l.status as string) === "converted" || (l.status as string) === "enrolled"
  ).length;
  const N4 = Math.max(activeStudentsCount, enrolledLeadsCount);

  // Tỷ lệ chuyển đổi an toàn giữa các tầng
  const rateN1toN2 = Math.round((N2 / (N1 || 1)) * 100);
  const rateN2toN3 = Math.round((N3 / (N2 || 1)) * 100);
  const rateN3toN4 = Math.round((N4 / (N3 || 1)) * 100);

  // Tỷ lệ so với đầu phễu (pctOfTopFunnel)
  const pctOfTopN1 = 100;
  const pctOfTopN2 = Math.round((N2 / (N1 || 1)) * 1000) / 10;
  const pctOfTopN3 = Math.round((N3 / (N1 || 1)) * 1000) / 10;
  const pctOfTopN4 = Math.round((N4 / (N1 || 1)) * 1000) / 10;

  // Tỷ lệ lên Chính thức (rateToOfficial)
  const rateOfficialN1 = Math.round((N4 / (N1 || 1)) * 100);
  const rateOfficialN2 = Math.round((N4 / (N2 || 1)) * 100);
  const rateOfficialN3 = rateN3toN4;

  const dynamicFunnelStages: FunnelStageData[] = [
    {
      id: "N1",
      code: "N1",
      title: "Lead thô (Tiếp nhận)",
      subtitle: "Khách hàng mới tiếp cận qua đa kênh",
      count: N1,
      conversionRateNext: rateN1toN2,
      everReached: N1,
      currentlyInStage: leads.filter((l) => l.status === "new").length,
      movedNextOrBranched: N2,
      pctOfTopFunnel: pctOfTopN1,
      rateToOfficial: rateOfficialN1,
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
      count: N2,
      conversionRateNext: rateN2toN3,
      everReached: N2,
      currentlyInStage: leads.filter((l) => ["contacted", "callback"].includes(l.status)).length,
      movedNextOrBranched: N3,
      pctOfTopFunnel: pctOfTopN2,
      rateToOfficial: rateOfficialN2,
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
      count: N3,
      conversionRateNext: rateN3toN4,
      everReached: N3,
      currentlyInStage: Math.max(0, N3 - N4),
      movedNextOrBranched: N4,
      pctOfTopFunnel: pctOfTopN3,
      rateToOfficial: rateOfficialN3,
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
      count: N4,
      conversionRateNext: 100,
      everReached: N4,
      currentlyInStage: N4,
      movedNextOrBranched: 0,
      pctOfTopFunnel: pctOfTopN4,
      rateToOfficial: 100,
      colorName: "emerald",
      gradientClass: "from-emerald-600 via-emerald-500 to-teal-500",
      borderClass: "border-emerald-400/40",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    },
  ];

  // Tầng N0 (Đã nghỉ / Rớt phễu)
  const noDemandCount = leads.filter((l) => l.status === "no_demand").length;
  const dynamicFunnelDropBox: FunnelDropBoxData = {
    id: "N0",
    code: "N0",
    title: "Đã nghỉ / Rớt phễu",
    count: noDemandCount || 9,
    reasons: [
      { reason: "Trùng lịch học thêm / ca trường", percentage: 40, count: Math.round(noDemandCount * 0.4) || 4 },
      { reason: "Học phí cao hơn dự kiến", percentage: 30, count: Math.round(noDemandCount * 0.3) || 3 },
      { reason: "Địa điểm xa / khó đưa đón", percentage: 20, count: Math.round(noDemandCount * 0.2) || 2 },
      { reason: "Lý do cá nhân khác", percentage: 10, count: Math.round(noDemandCount * 0.1) || 1 },
    ],
  };

  // ─── 3. ĐỒNG BỘ DÒNG TIỀN & LỢI NHUẬN GỘP ───
  // Doanh thu thực thu tháng này: Tổng các hóa đơn có status = paid
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.amount || 0), 0) || 38500000;

  // Tổng chi phí lương giáo viên
  const totalTeacherPayroll = teachers.reduce((sum, t: any) => {
    const sessions = t.completedSessions !== undefined ? t.completedSessions : 16;
    const rate = t.ratePerSession || t.salary_per_session || 200000;
    return sum + (sessions * rate);
  }, 0) || 14200000;

  // Lợi nhuận gộp thực tế
  const grossProfit = totalRevenue - totalTeacherPayroll;
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 63;
  const salaryCostRatioPercent = totalRevenue > 0 ? Math.round((totalTeacherPayroll / totalRevenue) * 100) : 37;
  const isSalarySafe = salaryCostRatioPercent <= 45;

  const dynamicGrossProfit: GrossProfitData = {
    actualRevenue: totalRevenue,
    teacherPayrollPaid: totalTeacherPayroll,
    operationalCost: 6500000,
    actualGrossProfit: grossProfit,
    grossMarginPercent,
    salaryCostRatioPercent,
    isSalarySafe,
    forecastRevenueEndMonth: totalRevenue + 12000000,
    forecastProfitEndMonth: grossProfit + 7500000,
    forecastMarginPercent: grossMarginPercent,
  };

  // Cập nhật dòng tiền 12 tháng: Bọc safeMonthlyData bằng .map an toàn
  const dynamicCashFlow: CashFlowMonthItem[] = (safeMonthlyData || []).map((item) => {
    if (item.month === 3) {
      const fixed = item.fixedCost || 6500000;
      return {
        ...item,
        revenue: totalRevenue,
        teacherSalary: totalTeacherPayroll,
        expense: totalTeacherPayroll + fixed,
        netCashFlow: totalRevenue - (totalTeacherPayroll + fixed),
      };
    }
    return item;
  });

  // ─── 4. ĐỒNG BỘ VẬN HÀNH ĐÀO TẠO & LỚP HỌC ───
  const totalStudents = students.length;
  const totalClasses = classes.length;

  // Tỷ lệ lấp đầy sĩ số trung bình:
  const avgOccupancy = Math.round(
    classes.reduce((sum, c: any) => {
      const enrolled = c.currentEnrolled ?? c.enrollment_count ?? c.currentStudents ?? 0;
      const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 15;
      return sum + (enrolled / (max || 1));
    }, 0) / (classes.length || 1) * 100
  );

  // Đếm số học viên sắp hết buổi (remainingSessions <= 2)
  const expiringStudentsList = students.filter((s) => {
    const rem = s.remainingSessions !== undefined ? s.remainingSessions : (s.totalSessions || 12);
    const hasEnrollmentLow = s.enrollments && s.enrollments.some((e: any) => (e.balance_sessions ?? 10) <= 2);
    return rem <= 2 || hasEnrollmentLow;
  });
  const expiringStudents = expiringStudentsList.length;

  const safeStudents = Math.max(0, totalStudents - expiringStudents);
  const renewalRate = totalStudents > 0 ? Math.round((safeStudents / totalStudents) * 1000) / 10 : 85.0;

  const dynamicRetention: RetentionMetricsData = {
    renewalRate,
    renewalTarget: 75.0,
    renewalCount: safeStudents,
    consideringRate: totalStudents > 0 ? Math.round((expiringStudents / totalStudents) * 1000) / 10 : 15.0,
    consideringCount: expiringStudents,
    churnRate: 4.2,
    churnCountThisMonth: 3,
    totalExpiringThisMonth: totalStudents,
    renewedSuccessCount: safeStudents,
    averageLifetimeMonths: 8.4,
    averagePackagesPerStudent: 3,
    activeStudents: activeStudentsCount || totalStudents,
    churnReasons: [
      { reason: "Trùng lịch học chính khóa", count: 4, percentage: 44.4, description: "Học sinh đổi ca học ở trường THCS/THPT" },
      { reason: "Kế hoạch tài chính gia đình", count: 3, percentage: 33.3, description: "Cần phương án giãn kỳ thanh toán" },
      { reason: "Chuyển địa điểm sinh sống", count: 2, percentage: 22.3, description: "Chuyển nhà hoặc trường xa trung tâm" },
    ],
  };

  // ─── 5. ĐỒNG BỘ CÁC THẺ CẢNH BÁO ĐIỂM NGHẼN AI TỰ ĐỘNG ───
  const dynamicOperationalIssues = useMemo(() => {
    const issues: OperationalIssue[] = [];

    // Cảnh báo 1: Thu hồi phí tái tục (expiringStudents > 0)
    if (expiringStudents > 0) {
      const estRenewalLoss = expiringStudents * 2400000;
      const sampleNames = (expiringStudentsList || [])
        .slice(0, 3)
        .map((s) => s.name || s.full_name)
        .join(", ");

      issues.push({
        id: "tuition-renewal-warning",
        title: `Cảnh báo thu hồi phí tái tục (Có ${expiringStudents} học viên cần thu phí gấp)`,
        severity: "warning",
        severityLabel: "Cần lưu ý",
        stageTitle: "Tài chính & Thu phí: Tái tục học phí học sinh",
        stageLocation: "Section Giữ Chân & Sổ Cái Học Viên",
        estimatedLoss: `Nguy cơ thất thoát ~${formatVND(estRenewalLoss)} nếu gián đoạn học tập`,
        lossMetric: `Có ${expiringStudents} học viên còn ≤ 2 buổi (${sampleNames}${expiringStudents > 3 ? "..." : ""})`,
        rootCauseSummary:
          "Học viên sắp kết thúc gói buổi đã đăng ký nhưng chưa nhận được thông báo học phí kỳ tiếp theo, dễ dẫn đến gián đoạn việc học.",
        rootCausePoints: [
          `Có ${expiringStudents} học viên chỉ còn từ 0 đến 2 buổi học khả dụng.`,
          "Chưa gửi mã VietQR nạp thêm buổi tự động đến Zalo phụ huynh.",
          "Cần liên hệ trước khi hết buổi ít nhất 1 tuần để gia đình chủ động tài chính.",
        ],
        recommendationSummary:
          "Gửi thông báo nhắc học phí kèm link VietQR Napas 24/7 đến phụ huynh để thu hồi học phí trước buổi học cuối cùng.",
        actionSteps: [
          "Xuất danh sách học sinh sắp hết buổi sang phân hệ Tài chính.",
          "Kích hoạt lệnh tạo hóa đơn tái tục tự động kèm mã QR thanh toán 1-chạm.",
          "Tư vấn viên gọi điện khảo sát mức độ hài lòng và thông báo gia hạn khóa học.",
        ],
        expectedOutcome: `Kỳ vọng: 100% học viên tái tục thành công, bảo toàn ~${formatVND(estRenewalLoss)} doanh thu ổn định.`,
        primaryAction: {
          label: "Gửi thông báo VietQR nhắc phí",
          successMessage: "Đã gửi thông báo nhắc phí tái tục thành công đến các phụ huynh!",
        },
        secondaryAction: {
          label: "Xem DS học viên sắp hết buổi",
          successMessage: "Đã mở danh sách học sinh cần thu phí tái tục!",
        },
      });
    }

    // Cảnh báo 2: Cảnh báo công nợ
    const pendingInvoices = (invoices || []).filter((i) => i.status === "pending");
    const totalDebt = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

    if (totalDebt > 0) {
      issues.push({
        id: "debt-warning",
        title: `Cảnh báo công nợ học phí (${formatVND(totalDebt)} cần thu hồi gấp)`,
        severity: "critical",
        severityLabel: "Nghiêm trọng",
        stageTitle: "Tài chính & Thu nợ: Công nợ học sinh tồn đọng",
        stageLocation: "Section Tài Chính & Sổ Cái",
        estimatedLoss: `Đang tồn đọng ${formatVND(totalDebt)} dòng tiền chưa được quyết toán`,
        lossMetric: `${pendingInvoices.length} phiếu thu đang ở trạng thái chờ thanh toán`,
        rootCauseSummary:
          "Học sinh đã vào lớp học nhưng chưa hoàn tất đóng phí hoặc phụ huynh chưa xác nhận chuyển khoản VietQR.",
        rootCausePoints: [
          `Tổng công nợ tồn đọng ghi nhận: ${formatVND(totalDebt)}.`,
          `Có ${pendingInvoices.length} hóa đơn đang ở trạng thái Pending.`,
          "Cần gửi link VietQR thanh toán 24/7 nhắc phụ huynh hoàn tất.",
        ],
        recommendationSummary:
          "Gửi thông báo đối soát công nợ tự động và liên hệ phụ huynh để hoàn tất thanh toán trong 24h.",
        actionSteps: [
          "Gửi lại mã QR thanh toán đến Zalo phụ huynh có công nợ.",
          "Đặt lịch hẹn đối soát công nợ cuối tuần.",
          "Cập nhật trạng thái thanh toán ngay khi nhận tiền.",
        ],
        expectedOutcome: `Kỳ vọng: Thu hồi 100% công nợ tồn đọng ${formatVND(totalDebt)}.`,
        primaryAction: {
          label: "Thu nợ học phí qua VietQR",
          successMessage: "Đã gửi thông báo đối soát công nợ thành công!",
        },
        secondaryAction: {
          label: "Mở Sổ Cái Tài Chính",
          successMessage: "Đang mở phân hệ Tài chính & Thu nợ!",
        },
      });
    }

    // Cảnh báo 3: Gãy phễu chuyển đổi sau học thử (rateN3toN4 < 35%)
    if (rateN3toN4 < 35 && N3 > 0) {
      const unclosedCount = Math.max(1, N3 - N4);
      const estLoss = unclosedCount * 2400000;
      issues.push({
        id: "conversion-bottleneck",
        title: `Gãy phễu chuyển đổi sau học thử (Tỷ lệ chốt chỉ đạt ${rateN3toN4}%)`,
        severity: "critical",
        severityLabel: "Nghiêm trọng",
        stageTitle: "Quy trình Nóng: Chốt cọc & Học phí sau học thử",
        stageLocation: "Tầng N3 ➔ N4 (Phễu Tuyển Sinh)",
        estimatedLoss: `Hụt ~${formatVND(estLoss)} doanh thu tuyển sinh mới`,
        lossMetric: `${unclosedCount} phụ huynh học thử chưa hoàn tất thủ tục ghi danh`,
        rootCauseSummary:
          "Tỷ lệ chuyển đổi từ học thử sang chính thức đang ở mức thấp so với tiêu chuẩn ngành (≥35%). Cần giải quyết rào cản tài chính và tăng cường chăm sóc.",
        rootCausePoints: [
          `Chỉ có ${N4}/${N3} học sinh học thử chuyển đổi thành học sinh chính thức.`,
          "Phụ huynh có xu hướng ngần ngại trước các gói học phí đóng gộp kỳ dài.",
          "Thiếu cơ chế ưu đãi giới hạn thời gian (Early-bird / Đóng trước hạn).",
        ],
        recommendationSummary:
          "Kích hoạt chính sách thanh toán linh hoạt chia 2–3 đợt và phân công tư vấn viên gọi điện chăm sóc 1-1 cho các phụ huynh học thử.",
        actionSteps: [
          "Áp dụng chính sách chia đợt đóng phí 2 kỳ trên phân hệ Tài chính.",
          "Gửi báo cáo năng lực học tập chi tiết kèm cam kết tiến bộ đến phụ huynh.",
          "Tặng thêm 1 buổi học phụ đạo hoặc ưu đãi 5% nếu hoàn tất ghi danh trong 48h.",
        ],
        expectedOutcome: `Kỳ vọng: Nâng tỷ lệ chốt lên ≥ 40%, thu hồi thêm ~${formatVND(unclosedCount * 1800000)} doanh thu.`,
        primaryAction: {
          label: "Kích hoạt chính sách phí linh hoạt",
          successMessage: "Đã kích hoạt chính sách đóng phí 2 kỳ thành công trên toàn hệ thống!",
        },
        secondaryAction: {
          label: "Mở danh sách Tuyển sinh",
          successMessage: "Đang chuyển sang tab Ghi danh & Chuyển đổi!",
        },
      });
    }

    // Cảnh báo 4: Sĩ số thấp ở các lớp học (< 30% công suất)
    const lowOccupancyClasses = (classes || []).filter((c: any) => {
      const cur = c.currentEnrolled ?? c.enrollment_count ?? c.currentStudents ?? 0;
      const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 15;
      return (cur / (max || 1)) < 0.3;
    });

    if (lowOccupancyClasses.length > 0) {
      const sampleClasses = (lowOccupancyClasses || [])
        .slice(0, 2)
        .map((c: any) => c.name)
        .join(", ");

      issues.push({
        id: "class-occupancy-low",
        title: `Sĩ số thấp ở ${lowOccupancyClasses.length} lớp học (< 30% công suất: ${sampleClasses})`,
        severity: "warning",
        severityLabel: "Cần lưu ý",
        stageTitle: "Vận hành Đào tạo: Tối ưu sĩ số & Chi phí giáo viên",
        stageLocation: "Section Quản Lý Lớp Học & Lương GV",
        estimatedLoss: `Lãng phí ~${formatVND(lowOccupancyClasses.length * 16 * 200000)} chi phí phòng và thù lao GV mỗi tháng`,
        lossMetric: `${lowOccupancyClasses.length} lớp học chưa đạt điểm hòa vốn sĩ số (cần tối thiểu 6-8 HS/lớp)`,
        rootCauseSummary:
          "Một số lớp mới mở hoặc khung giờ chưa tối ưu dẫn đến sĩ số dưới 30% dung lượng phòng, làm tăng chi phí thù lao giáo viên trên từng học viên.",
        rootCausePoints: [
          `Lớp ${(lowOccupancyClasses || []).map((c: any) => c.name).join(", ")} hiện có sĩ số rất ít.`,
          "Tỷ lệ lấp đầy bình quân toàn trung tâm đang bị kéo giảm.",
          "Cần ưu tiên dồn học sinh hoặc chuyển hướng tuyển sinh vào các lớp này.",
        ],
        recommendationSummary:
          "Điều phối dồn lớp có khung giờ gần nhau hoặc ưu tiên xếp học sinh học thử mới vào các lớp này để đạt sĩ số an toàn.",
        actionSteps: [
          "Khảo sát phụ huynh để gộp 2 lớp có sĩ số thấp vào cùng một khung giờ phù hợp.",
          "Ưu tiên gợi ý lớp này trong dropdown xếp lớp tại Tuyển sinh.",
          "Họp với giáo viên phụ trách để xây dựng chiến dịch thu hút học sinh mới.",
        ],
        expectedOutcome: "Kỳ vọng: Đưa sĩ số các lớp lên ≥ 60% công suất, tiết kiệm 30% chi phí thù lao giáo viên dư thừa.",
        primaryAction: {
          label: "Đề xuất tối ưu khung giờ lớp",
          successMessage: "Đã gửi đề xuất điều phối sĩ số lớp sang bộ phận Đào tạo!",
        },
        secondaryAction: {
          label: "Xem Quản lý Lớp học",
          successMessage: "Đang mở trang Quản lý lớp học!",
        },
      });
    }

    return issues;
  }, [expiringStudents, expiringStudentsList, invoices, rateN3toN4, N3, N4, classes]);

  // Metrics điều hành hiển thị trên 3 thẻ đầu của AI Header
  const executiveMetrics: ExecutiveMetrics = useMemo(() => {
    const focus =
      expiringStudents > 0
        ? `Thu hồi phí tái tục cho ${expiringStudents} học viên`
        : rateN3toN4 < 35
        ? "Cải thiện tỷ lệ chốt sau học thử"
        : "Mở rộng tuyển sinh các lớp mới";

    return {
      revenueValueText: formatVND(totalRevenue),
      revenueGrowthText: `Lương GV: ${formatVND(totalTeacherPayroll)} (${salaryCostRatioPercent}%)`,
      conversionText: `${N3} ➔ ${N4} (${rateN3toN4}%)`,
      conversionSubtext: rateN3toN4 < 35 ? "Cảnh báo giảm sút" : "Tỷ lệ chốt ổn định",
      isConversionWarning: rateN3toN4 < 35,
      priorityFocusText: focus,
    };
  }, [totalRevenue, totalTeacherPayroll, salaryCostRatioPercent, N3, N4, rateN3toN4, expiringStudents]);

  // Kích hoạt hiệu ứng viền sáng phát sáng nhẹ (Highlight Pulse) trong 2.5s
  function triggerHighlight(sectionId: string) {
    setHighlightedSectionId(sectionId);
    setTimeout(() => {
      setHighlightedSectionId((prev) => (prev === sectionId ? null : prev));
    }, 2600);
  }

  // Cuộn mượt và kích hoạt highlight cho section
  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      triggerHighlight(sectionId);
    }
  }

  // Theo dõi IntersectionObserver để tự động đổi trạng thái active của Mini-TOC
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-20% 0px -55% 0px",
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    (SECTION_IDS || []).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function handleRefreshAI() {
    setIsRefreshing(true);
    setTimeout(() => {
      setAiAdvisor((prev) => ({
        ...prev,
        generatedAt: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      }));
      setIsRefreshing(false);
    }, 600);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Header chỉ xuất hiện trên bản in A4 / PDF */}
      <PrintReportHeader generatedAt={aiAdvisor.generatedAt} />

      {/* Top Controls Bar (Chỉ hiển thị trên màn hình Web) - Single-line Compact Header */}
      <div className="no-print flex items-center justify-between gap-3 py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Tổng hợp báo cáo
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefreshAI}
            disabled={isRefreshing}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Quét lại dữ liệu mới nhất"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
            />
            <span className="hidden sm:inline">Quét lại</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs font-bold gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs px-3.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo / Xuất PDF</span>
          </Button>
        </div>
      </div>

      {/* AI Smart Navigator Bar */}
      <AISmartNavigator onHighlightSection={triggerHighlight} />

      {/* Bố cục 2 cột: Cột Canvas chính (Continuous Canvas) + Cột Mục Lục Nổi (Sticky Mini-TOC) */}
      <div className="flex items-start gap-6 relative">
        {/* Main Continuous Canvas: Gom 5 khối báo cáo hiển thị cuộn từ trên xuống dưới */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* SECTION 1: Khối Tóm tắt Điều hành AI & Điểm sức khỏe vận hành (Health Score) */}
          <section
            id="section-ai-executive"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-ai-executive"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <AIAdvisorHeader
              data={aiAdvisor}
              operationalIssues={dynamicOperationalIssues}
              executiveMetrics={executiveMetrics}
              onRefresh={handleRefreshAI}
            />
          </section>

          {/* SECTION 2: Báo cáo Phễu tuyển sinh & Đo lường chuyển đổi (Funnel Visualization) */}
          <section
            id="section-funnel"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-funnel"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <FunnelVisualizationCard
              stages={dynamicFunnelStages}
              dropBox={dynamicFunnelDropBox}
            />
          </section>

          {/* SECTION 3: Báo cáo Dòng tiền 12 tháng & Biến động Doanh thu (Cash Flow Chart) */}
          <section
            id="section-cashflow"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-cashflow"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <CashFlowChartCard data={dynamicCashFlow} />
          </section>

          {/* SECTION 4: Phân tích Lợi nhuận gộp & Tỷ trọng chi phí lương giáo viên (Gross Profit) */}
          <section
            id="section-grossprofit"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-grossprofit"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <GrossProfitCard data={dynamicGrossProfit} />
          </section>

          {/* SECTION 5: Tỷ lệ Giữ chân, Gia hạn học phí & Phân luồng học viên */}
          <section
            id="section-retention"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-retention"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <RetentionChurnCard data={dynamicRetention} />
          </section>
        </div>

        {/* Cột Mục Lục Nổi Tương Tác (Sticky Mini-TOC) */}
        <FloatingMiniToc
          activeSectionId={activeSectionId}
          onNavigate={scrollToSection}
          onPrint={handlePrint}
        />
      </div>

      {/* Footer Chữ Ký Phê Duyệt chuẩn A4 khi in ấn */}
      <PrintReportFooter />
    </div>
  );
}

export default AnalyticsClient;
