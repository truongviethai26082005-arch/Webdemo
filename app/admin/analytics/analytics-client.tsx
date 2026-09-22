"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Sparkles,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateCenterFixedCost } from "@/lib/actions/settings";

import { FloatingMiniToc } from "@/components/analytics/floating-mini-toc";
import {
  PrintReportHeader,
  PrintReportFooter,
} from "@/components/analytics/print-report-header";

import { AIAdvisorHeader, ExecutiveMetrics } from "@/components/analytics/ai-advisor-header";
import { CashFlowChartCard } from "@/components/analytics/cashflow-chart-card";
import { GrossProfitCard } from "@/components/analytics/gross-profit-card";
import { OperationalIssue } from "@/components/analytics/operational-issue-modal";

import {
  CashFlowMonthItem,
  GrossProfitData,
  AIAdvisorInsight,
} from "@/types/analytics";

import {
  getAnalyticsReportData,
  AnalyticsReportData,
  AnalyticsRetentionData,
} from "@/lib/actions/analytics";

import { useEduStore } from "@/lib/store/use-edu-store";
import { formatVND } from "@/lib/utils/vietqr";
import {
  getOperationalAnalyticsSnapshot,
  generateAIExecutiveReport,
  OperationalSnapshot,
} from "@/lib/actions/ai-analytics";
import { AnalyticsChatMascot } from "@/components/analytics/analytics-chat-mascot";
import { AnalyticsPrintReport } from "@/components/analytics/analytics-print-report";

export interface AnalyticsClientProps {
  monthlyData?: any[];
  initialCashFlow?: CashFlowMonthItem[];
  initialFunnelStages?: any;
  initialFunnelDropBox?: any;
  initialGrossProfit?: GrossProfitData;
  initialRetention?: any;
  initialAiAdvisor?: AIAdvisorInsight;
}

const SECTION_IDS = [
  "section-ai-executive",
  "section-funnel",
  "section-cashflow",
  "section-grossprofit",
  "section-retention",
];

// Khởi tạo dòng tiền 12 tháng chuẩn (không chứa số liệu giả lập / hardcode)
export const DEFAULT_CASH_FLOW_12_MONTHS: CashFlowMonthItem[] = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  label: `T${i + 1}`,
  fullName: `Tháng ${i + 1}`,
  revenue: 0,
  expense: 0,
  teacherSalary: 0,
  fixedCost: 0,
  netCashFlow: 0,
}));

export const DEFAULT_AI_ADVISOR: AIAdvisorInsight = {
  generatedAt: "Chưa quét",
  executiveSummary: "Hệ thống AI phân tích dựa trên dữ liệu thống kê vận hành thực tế.",
  bottlenecks: [],
  recommendations: [],
};

export function AnalyticsClient({
  monthlyData,
  initialCashFlow,
  initialGrossProfit,
  initialRetention,
  initialAiAdvisor = DEFAULT_AI_ADVISOR,
}: AnalyticsClientProps = {}) {
  // ─── 0. STATE BÁO CÁO TỔNG HỢP TỪ SERVER ACTION (DB THẬT) ───
  const [serverReport, setServerReport] = useState<AnalyticsReportData | null>(null);
  const [aiAdvisor, setAiAdvisor] = useState<AIAdvisorInsight>(initialAiAdvisor || DEFAULT_AI_ADVISOR);
  const [activeSectionId, setActiveSectionId] = useState<string>("section-ai-executive");
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fixedCostInput, setFixedCostInput] = useState("");
  const [isSavingFixedCost, setIsSavingFixedCost] = useState(false);
  const [fixedCostError, setFixedCostError] = useState<string | null>(null);

  // Snapshot cho Chatbot Mascot & In Báo Cáo theo Tuần / Tháng
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 0 = cả tháng, 1..5 = tuần trong tháng
  const [snapshot, setSnapshot] = useState<OperationalSnapshot | null>(null);
  const [latestAiAnalysis, setLatestAiAnalysis] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  // Tải snapshot vận hành theo tuần/tháng/năm
  async function loadSnapshotData(m: number, y: number, w: number = 0) {
    try {
      const res = await getOperationalAnalyticsSnapshot(m, y, w);
      if (res && "data" in res) {
        setSnapshot(res.data);
        return res.data;
      }
    } catch (err) {
      console.error("Lỗi khi tải operational snapshot:", err);
    }
    return null;
  }

  useEffect(() => {
    loadSnapshotData(selectedMonth, selectedYear, selectedWeek);
  }, [selectedMonth, selectedYear, selectedWeek]);

  // Xử lý mở Trang Báo Cáo Chi Tiết do AI tổng hợp
  async function handleOpenDetailedReport() {
    setIsPrintView(true);
    const snap = await loadSnapshotData(selectedMonth, selectedYear, selectedWeek);
    const activeSnap = snap || snapshot;
    if (activeSnap) {
      setIsGeneratingAi(true);
      try {
        const aiRes = await generateAIExecutiveReport({ snapshot: activeSnap });
        if (aiRes?.report) {
          setLatestAiAnalysis(aiRes.report);
        }
      } catch (err) {
        console.error("Lỗi khi tổng hợp báo cáo AI:", err);
      } finally {
        setIsGeneratingAi(false);
      }
    }
  }

  // Tái tạo lại báo cáo AI khi đang ở chế độ xem chi tiết
  async function handleRegenerateAi() {
    if (!snapshot) return;
    setIsGeneratingAi(true);
    try {
      const aiRes = await generateAIExecutiveReport({ snapshot });
      if (aiRes?.report) {
        setLatestAiAnalysis(aiRes.report);
      }
    } catch (err) {
      console.error("Lỗi khi tạo lại báo cáo AI:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  }

  async function handleSaveFixedCost() {
    const amount = Number(fixedCostInput.replace(/\D/g, ""));
    if (!amount || amount <= 0) {
      setFixedCostError("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setIsSavingFixedCost(true);
    setFixedCostError(null);
    const result = await updateCenterFixedCost(amount);
    setIsSavingFixedCost(false);
    if (result?.error) {
      setFixedCostError(result.error);
      return;
    }
    window.location.reload();
  }

  // ─── 1. KẾT NỐI STORE TOÀN CỤC (CLIENT CONTEXT) ───
  const store = useEduStore();
  const rawStudents = store?.students;
  const rawClasses = store?.classes;
  const rawTeachers = store?.teachers;
  const rawInvoices = store?.invoices;

  const students = Array.isArray(rawStudents) ? rawStudents : [];
  const classes = Array.isArray(rawClasses) ? rawClasses : [];
  const teachers = Array.isArray(rawTeachers) ? rawTeachers : [];
  const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];

  // Tải dữ liệu thật từ Server Action khi mount component
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getAnalyticsReportData();
        if (isMounted && data) {
          setServerReport(data);
          if (data.aiAdvisor) {
            setAiAdvisor(data.aiAdvisor);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu báo cáo analytics:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── 2. DÒNG TIỀN 12 THÁNG (TÍNH THẬT 100%, XÓA TOÀN BỘ FALLBACK HARDCODE) ───
  const dynamicCashFlow: CashFlowMonthItem[] = useMemo(() => {
    if (serverReport?.cashFlow12Months && serverReport.cashFlow12Months.length > 0) {
      return serverReport.cashFlow12Months;
    }
    if (initialCashFlow && initialCashFlow.length > 0) {
      return initialCashFlow;
    }
    if (Array.isArray(monthlyData) && monthlyData.length > 0) {
      return monthlyData;
    }
    return DEFAULT_CASH_FLOW_12_MONTHS;
  }, [serverReport, initialCashFlow, monthlyData]);

  // ─── 3. LỢI NHUẬN GỘP & DỰ BÁO (GROSS PROFIT) ───
  const dynamicGrossProfit: GrossProfitData = useMemo(() => {
    if (serverReport?.grossProfitData) {
      return serverReport.grossProfitData;
    }
    if (initialGrossProfit) {
      return initialGrossProfit;
    }

    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const totalRev = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalSalary = teachers.reduce((sum, t: any) => {
      const sess = t.completedSessions !== undefined ? t.completedSessions : 0;
      const rate = t.ratePerSession || t.salary_per_session || 0;
      return sum + sess * rate;
    }, 0);
    const profit = totalRev - totalSalary;
    const margin = totalRev > 0 ? Math.round((profit / totalRev) * 100) : 0;
    const salaryRatio = totalRev > 0 ? Math.round((totalSalary / totalRev) * 100) : 0;

    const now = new Date();
    const daysPassed = Math.max(now.getDate(), 1);
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const forecastRev = Math.round((totalRev / daysPassed) * totalDays);
    const forecastProfit = forecastRev - totalSalary;

    return {
      actualRevenue: totalRev,
      teacherPayrollPaid: totalSalary,
      operationalCost: 0,
      fixedCostConfigured: false,
      actualGrossProfit: profit,
      grossMarginPercent: margin,
      salaryCostRatioPercent: salaryRatio,
      isSalarySafe: salaryRatio <= 45,
      forecastRevenueEndMonth: forecastRev,
      forecastProfitEndMonth: forecastProfit,
      forecastMarginPercent: forecastRev > 0 ? Math.round((forecastProfit / forecastRev) * 100) : 0,
    };
  }, [serverReport, initialGrossProfit, invoices, teachers]);

  // ─── 4. TỶ LỆ GIỮ CHÂN (CRR) & KHÁCH HÀNG QUAY LẠI (RENEWAL) ───
  const dynamicRetention: AnalyticsRetentionData = useMemo(() => {
    if (serverReport?.retentionData) {
      return serverReport.retentionData;
    }
    if (initialRetention) {
      return {
        customerRetentionRate: initialRetention.customerRetentionRate ?? {
          available: false,
          reason:
            "Cần hoàn thiện tính năng tự động cập nhật trạng thái học sinh theo buổi/khóa học",
        },
        renewalRate: initialRetention.renewalRate ?? 0,
        renewalTarget: initialRetention.renewalTarget ?? 75.0,
        renewalCount: initialRetention.renewalCount ?? 0,
        consideringRate: initialRetention.consideringRate ?? 0,
        consideringCount: initialRetention.consideringCount ?? 0,
        churnRate: initialRetention.churnRate ?? {
          available: false,
          reason:
            "Cần hoàn thiện tính năng tự động cập nhật trạng thái học sinh theo buổi/khóa học",
        },
        churnCountThisMonth: initialRetention.churnCountThisMonth,
        totalExpiringThisMonth: initialRetention.totalExpiringThisMonth ?? 0,
        renewedSuccessCount: initialRetention.renewedSuccessCount ?? 0,
        averageLifetimeMonths: initialRetention.averageLifetimeMonths ?? 0,
        averagePackagesPerStudent: initialRetention.averagePackagesPerStudent ?? 0,
        activeStudents: initialRetention.activeStudents ?? students.filter((s) => s.status === "active").length,
        churnReasons: {
          available: false,
          reason: "Cần hoàn thiện phân hệ Sale (bảng Lead)",
        },
      };
    }
    return {
      customerRetentionRate: {
        available: false,
        reason:
          "Cần hoàn thiện tính năng tự động cập nhật trạng thái học sinh theo buổi/khóa học",
      },
      renewalRate: 0,
      renewalTarget: 75.0,
      renewalCount: 0,
      consideringRate: 0,
      consideringCount: 0,
      churnRate: {
        available: false,
        reason:
          "Cần hoàn thiện tính năng tự động cập nhật trạng thái học sinh theo buổi/khóa học",
      },
      churnCountThisMonth: 0,
      totalExpiringThisMonth: 0,
      renewedSuccessCount: 0,
      averageLifetimeMonths: 0,
      averagePackagesPerStudent: 0,
      activeStudents: students.filter((s) => s.status === "active").length,
      churnReasons: {
        available: false,
        reason: "Cần hoàn thiện phân hệ Sale (bảng Lead)",
      },
    };
  }, [serverReport, initialRetention, students]);

  // ─── 5. CÁC THẺ CẢNH BÁO ĐIỂM NGHẼN VẬN HÀNH ───
  const expiringStudentsList = useMemo(() => {
    return students.filter((s) => {
      const rem = s.remainingSessions ?? 0;
      const hasEnrollmentLow = s.enrollments && s.enrollments.some((e: any) => (e.balance_sessions ?? 0) <= 2);
      return rem <= 2 || hasEnrollmentLow;
    });
  }, [students]);

  const expiringStudents = dynamicRetention.consideringCount || expiringStudentsList.length;

  const dynamicOperationalIssues = useMemo(() => {
    const issues: OperationalIssue[] = [];

    // Cảnh báo 1: Thu hồi phí tái tục
    if (expiringStudents > 0) {
      const sampleNames = (expiringStudentsList || [])
        .slice(0, 3)
        .map((s) => s.name || (s as any).full_name)
        .join(", ");

      issues.push({
        id: "tuition-renewal-warning",
        title: `Cảnh báo thu hồi phí tái tục (Có ${expiringStudents} học viên cần thu phí gấp)`,
        severity: "warning",
        severityLabel: "Cần lưu ý",
        stageTitle: "Tài chính & Thu phí: Tái tục học phí học sinh",
        stageLocation: "Section Giữ Chân & Sổ Cái Học Viên",
        estimatedLoss: {
          available: false,
          reason: "Cần cấu hình học phí trung bình theo từng lớp để tính chính xác số tiền thất thoát dự kiến",
        },
        lossMetric: `Có ${expiringStudents} học viên còn ≤ 2 buổi (${sampleNames}${expiringStudents > 3 ? "..." : ""})`,
        rootCauseSummary:
          "Học viên sắp kết thúc gói buổi đã đăng ký nhưng chưa nhận được thông báo học phí kỳ tiếp theo.",
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
        expectedOutcome: "Kỳ vọng: 100% học viên tái tục thành công, bảo toàn doanh thu ổn định.",
        primaryAction: {
          label: "Gửi thông báo VietQR nhắc phí",
          successMessage: "Đã gửi thông báo nhắc phí tái tục thành công đến các phụ huynh!",
        },
        secondaryAction: {
          label: "Xem DS học viên sắp hết buổi",
          successMessage: "Đã mở danh sách học sinh cần thu phí tái tục!",
        },
        targetUrl: "/admin/students",
        targetLabel: "Đi tới Học sinh & Xếp lớp",
      });
    }

    // Cảnh báo 2: Công nợ học phí
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
        targetUrl: "/admin/finance",
        targetLabel: "Đi tới Sổ cái Tài chính",
      });
    }

    // Cảnh báo 3: Sĩ số thấp ở các lớp học (< 30% công suất)
    const lowOccupancyClasses = (classes || []).filter((c: any) => {
      const cur = c.currentEnrolled ?? c.enrollment_count ?? c.currentStudents ?? 0;
      const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 15;
      return cur / (max || 1) < 0.3;
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
        estimatedLoss: {
          available: false,
          reason: "Cần phân tích thêm chi phí vận hành phòng học và thù lao",
        },
        lossMetric: `${lowOccupancyClasses.length} lớp học chưa đạt điểm hòa vốn sĩ số (cần tối thiểu 6-8 HS/lớp)`,
        rootCauseSummary:
          "Một số lớp mới mở dẫn đến sĩ số dưới 30% dung lượng phòng, làm tăng chi phí thù lao giáo viên trên từng học viên.",
        rootCausePoints: [
          `Lớp ${(lowOccupancyClasses || []).map((c: any) => c.name).join(", ")} hiện có sĩ số rất ít.`,
          "Cần ưu tiên dồn học sinh hoặc chuyển hướng tuyển sinh vào các lớp này.",
        ],
        recommendationSummary:
          "Điều phối dồn lớp có khung giờ gần nhau hoặc ưu tiên xếp học sinh mới vào các lớp này.",
        actionSteps: [
          "Khảo sát phụ huynh để gộp lớp có sĩ số thấp vào cùng một khung giờ phù hợp.",
          "Ưu tiên gợi ý lớp này trong dropdown xếp lớp.",
        ],
        expectedOutcome: "Kỳ vọng: Đưa sĩ số các lớp lên ≥ 60% công suất, tiết kiệm chi phí giáo viên.",
        primaryAction: {
          label: "Đề xuất tối ưu khung giờ lớp",
          successMessage: "Đã gửi đề xuất điều phối sĩ số lớp sang bộ phận Đào tạo!",
        },
        secondaryAction: {
          label: "Xem Quản lý Lớp học",
          successMessage: "Đang mở trang Quản lý lớp học!",
        },
        targetUrl: "/admin/classes",
        targetLabel: "Đi tới Quản lý Lớp học",
      });
    }

    return issues;
  }, [expiringStudents, expiringStudentsList, invoices, classes]);

  // Metrics điều hành hiển thị trên 3 thẻ đầu của AI Header
  const executiveMetrics: ExecutiveMetrics = useMemo(() => {
    const focus =
      expiringStudents > 0
        ? `Thu hồi phí tái tục cho ${expiringStudents} học viên`
        : "Vận hành và giữ chân học viên ổn định";

    const crrText =
      typeof dynamicRetention.customerRetentionRate === "number"
        ? `CRR: ${dynamicRetention.customerRetentionRate}%`
        : "CRR: Sắp ra mắt";

    return {
      revenueValueText: formatVND(dynamicGrossProfit.actualRevenue),
      revenueGrowthText: `Lương GV: ${formatVND(dynamicGrossProfit.teacherPayrollPaid)} (${dynamicGrossProfit.salaryCostRatioPercent}%)`,
      conversionText: `${crrText} | Renewal: ${dynamicRetention.renewalRate}%`,
      conversionSubtext: "Chỉ số giữ chân & quay lại",
      isConversionWarning: false,
      priorityFocusText: focus,
    };
  }, [dynamicGrossProfit, dynamicRetention, expiringStudents]);

  function triggerHighlight(sectionId: string) {
    setHighlightedSectionId(sectionId);
    setTimeout(() => {
      setHighlightedSectionId((prev) => (prev === sectionId ? null : prev));
    }, 2600);
  }

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      triggerHighlight(sectionId);
    }
  }

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

  async function handleRefreshAI() {
    setIsRefreshing(true);
    try {
      const data = await getAnalyticsReportData();
      if (data) {
        setServerReport(data);
        if (data.aiAdvisor) {
          setAiAdvisor({
            ...data.aiAdvisor,
            generatedAt: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          });
        }
      }
    } catch (err) {
      console.error("Lỗi khi quét lại dữ liệu analytics:", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handlePrint() {
    setIsPrintView(true);
  }

  // Tỷ lệ cho thanh phân luồng học viên
  const renewalPercent = dynamicRetention.renewalRate;
  const consideringPercent = dynamicRetention.consideringRate;
  const churnPercent =
    typeof dynamicRetention.churnRate === "number" ? dynamicRetention.churnRate : 0;
  const isChurnUnavailable =
    typeof dynamicRetention.churnRate === "object" && !dynamicRetention.churnRate.available;

  if (isPrintView) {
    return (
      <AnalyticsPrintReport
        snapshot={snapshot}
        aiAnalysisText={latestAiAnalysis}
        isGeneratingAi={isGeneratingAi}
        onBack={() => setIsPrintView(false)}
        onTimeChange={(m, y, w) => {
          setSelectedMonth(m);
          setSelectedYear(y);
          setSelectedWeek(w);
          loadSnapshotData(m, y, w).then((newSnap) => {
            if (newSnap) {
              setIsGeneratingAi(true);
              generateAIExecutiveReport({ snapshot: newSnap }).then((aiRes) => {
                setIsGeneratingAi(false);
                if (aiRes?.report) setLatestAiAnalysis(aiRes.report);
              });
            }
          });
        }}
        onRegenerateAi={handleRegenerateAi}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header chỉ xuất hiện trên bản in A4 / PDF */}
      <PrintReportHeader generatedAt={aiAdvisor.generatedAt} />

      {/* Top Controls Bar - Single-line Compact Header */}
      <div className="no-print flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-2.5 px-4 sm:py-3 sm:px-5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs">
        {/* Nút bấm "Tổng hợp báo cáo" (Mở bảng phân tích chi tiết) */}
        <button
          type="button"
          onClick={handleOpenDetailedReport}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer font-bold group border border-primary/25 shadow-xs text-left"
          title="Bấm để mở Bảng Phân Tích Báo Cáo Chi Tiết do AI tổng hợp"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Tổng hợp báo cáo</span>
              <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.2 rounded-md">
                AI
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-normal">
              {selectedWeek === 0 ? `Tháng ${selectedMonth}/${selectedYear}` : `Tuần ${selectedWeek} - T${selectedMonth}/${selectedYear}`} • Xem phân tích chi tiết ➔
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Bộ chọn thời gian: Tuần, Tháng, Năm */}
          <div className="flex items-center gap-1 text-xs font-semibold">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              title="Chọn phạm vi: Cả tháng hoặc từng tuần"
            >
              <option value={0}>Cả tháng</option>
              <option value={1}>Tuần 1 (01 - 07)</option>
              <option value={2}>Tuần 2 (08 - 14)</option>
              <option value={3}>Tuần 3 (15 - 21)</option>
              <option value={4}>Tuần 4 (22 - 28)</option>
              <option value={5}>Tuần 5 (29 - hết)</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefreshAI}
            disabled={isRefreshing}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Quét lại dữ liệu mới nhất từ hệ thống"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
            />
            <span className="hidden sm:inline">Quét lại</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs font-bold gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs px-3.5"
            title="In nhanh hoặc xuất PDF trực tiếp"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo / Xuất PDF</span>
          </Button>
        </div>
      </div>

      {/* Bố cục 2 cột: Cột Canvas chính + Cột Mục Lục Nổi (Sticky Mini-TOC) */}
      <div className="flex items-start gap-6 relative">
        <div className="flex-1 min-w-0 space-y-8">
          {/* SECTION 1: Khối Tóm tắt Điều hành AI (GIỮ NGUYÊN 100%) */}
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

          {/* SECTION 2: Báo cáo Phễu tuyển sinh (PLACEHOLDER HÓA - SẮP RA MẮT — CẦN PHÂN HỆ SALE) */}
          <section
            id="section-funnel"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-funnel"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-card/40 p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                      Phễu Tuyển Sinh &amp; Tỷ Lệ Chuyển Đổi (N1 ➔ N4)
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5"
                    >
                      Sắp ra mắt — cần phân hệ Sale
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Đo lường tỷ lệ chuyển đổi qua các tầng: Lead thô (N1) ➔ Tiềm năng (N2) ➔ Học thử (N3) ➔ Chính thức (N4) và lý do rớt phễu (N0)
                  </p>
                </div>
              </div>

              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                  <Layers className="w-6 h-6 text-slate-400" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Phễu Tuyển Sinh đang chờ kết nối dữ liệu
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tính năng đang trong lộ trình phát triển. Dữ liệu phễu chuyển đổi 4 tầng và lý do rớt phễu sẽ tự động kích hoạt khi phân hệ Sale (bảng Lead &amp; Trial) hoàn tất.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Trạng thái: <strong>Chưa khả dụng</strong> — Cần hoàn thiện phân hệ Sale (bảng Lead)</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Báo cáo Dòng tiền 12 tháng (Cash Flow Chart) */}
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
            {!dynamicGrossProfit.fixedCostConfigured && (
              <div className="mb-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 flex-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Chưa cấu hình "Chi phí cố định hàng tháng" (thuê mặt bằng, điện nước...) — Lợi nhuận gộp bên dưới đang tính tạm với chi phí cố định = 0đ.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Input
                    placeholder="VD: 15.000.000"
                    value={fixedCostInput}
                    onChange={(e) => setFixedCostInput(e.target.value)}
                    className="h-8 w-40 text-xs rounded-lg font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveFixedCost}
                    disabled={isSavingFixedCost}
                    className="h-8 text-xs font-bold rounded-lg shrink-0"
                  >
                    {isSavingFixedCost ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
                {fixedCostError && (
                  <p className="text-[11px] text-destructive font-semibold w-full sm:w-auto">{fixedCostError}</p>
                )}
              </div>
            )}
            <GrossProfitCard data={dynamicGrossProfit} />
          </section>

          {/* SECTION 5: Tỷ lệ Giữ chân (CRR) & Khách hàng quay lại (Renewal) */}
          <section
            id="section-retention"
            className={`print-break-inside-avoid scroll-mt-24 transition-all duration-700 ${
              highlightedSectionId === "section-retention"
                ? "animate-highlight-pulse ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                : ""
            }`}
          >
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
              {/* Header Card Giữ Chân */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Tỷ Lệ Giữ Chân (CRR) &amp; Khách Hàng Quay Lại (Renewal)
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold py-0.2 px-2"
                    >
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Số liệu thực tế từ hệ thống
                      </span>
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tách bạch rõ chỉ số Giữ chân khách hàng chuẩn (CRR) và Tỷ lệ tái tục khóa học tiếp theo (Renewal)
                  </p>
                </div>
              </div>

              {/* TÁCH RÕ 2 CHỈ SỐ RIÊNG BIỆT: CRR và RENEWAL - Chuẩn KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Chỉ số 1: Tỷ lệ giữ chân khách hàng (CRR) */}
                {typeof dynamicRetention.customerRetentionRate === "number" ? (
                  <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tỷ lệ giữ chân khách hàng (CRR)
                      </span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
                        {dynamicRetention.customerRetentionRate}%
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        Chuẩn CRR: ((E − N) / S) × 100
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full opacity-80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tỷ lệ giữ chân khách hàng (CRR)
                      </span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 text-slate-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-400 tracking-tight my-1">
                        --%
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        Sắp ra mắt — đang tích hợp
                      </div>
                    </div>
                  </div>
                )}

                {/* Chỉ số 2: Tỷ lệ khách hàng quay lại (Renewal) */}
                <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tỷ lệ khách hàng quay lại (Renewal)
                    </span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
                      {dynamicRetention.renewalRate}%
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {dynamicRetention.renewalCount} học viên tái tục khóa mới
                    </div>
                  </div>
                </div>
              </div>

              {/* Chỉ số bổ trợ thời gian học & học viên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800">
                      Thời gian học trung bình:{" "}
                      <span className="font-bold text-slate-900">
                        {dynamicRetention.averageLifetimeMonths} tháng (~{dynamicRetention.averagePackagesPerStudent} khóa)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Gắn bó trung bình ~{dynamicRetention.averagePackagesPerStudent} gói học phí
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 sm:pl-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800">
                      Học viên đang học:{" "}
                      <span className="font-bold text-slate-900">
                        {dynamicRetention.activeStudents} bạn
                      </span>
                      {dynamicRetention.churnCountThisMonth !== undefined && dynamicRetention.churnCountThisMonth > 0 && (
                        <>
                          {" "}
                          / Đã rời:{" "}
                          <span className="font-bold text-rose-600">
                            {dynamicRetention.churnCountThisMonth} bạn
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Sắp hết buổi: {dynamicRetention.consideringCount} bạn
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh phân luồng học viên */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    Thanh Phân Luồng Học Viên Đến Hạn Kết Thúc Gói
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Tổng: <strong className="text-slate-900">{dynamicRetention.totalExpiringThisMonth}</strong> học viên đến hạn / sắp hết
                  </span>
                </div>

                <div
                  className="w-full h-2.5 sm:h-3 rounded-full overflow-hidden bg-slate-200 flex items-center"
                  title={`Tái tục: ${renewalPercent}% | Cân nhắc: ${consideringPercent}%${!isChurnUnavailable ? ` | Dừng: ${churnPercent}%` : ""}`}
                >
                  <div
                    style={{ width: `${Math.min(100, renewalPercent)}%` }}
                    className="h-full bg-emerald-500 transition-all duration-500"
                  />
                  <div
                    style={{ width: `${Math.min(100, consideringPercent)}%` }}
                    className="h-full bg-amber-400 transition-all duration-500"
                  />
                  {!isChurnUnavailable && (
                    <div
                      style={{ width: `${Math.min(100, churnPercent)}%` }}
                      className="h-full bg-rose-500 transition-all duration-500"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đóng tiếp học phí</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{renewalPercent}%</div>
                      <div className="text-xs text-slate-400 truncate">{dynamicRetention.renewalCount} bạn tái tục</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đang cân nhắc (≤ 2 buổi)</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{consideringPercent}%</div>
                      <div className="text-xs text-slate-400 truncate">{dynamicRetention.consideringCount} bạn sắp hết buổi</div>
                    </div>
                  </div>

                  {isChurnUnavailable ? (
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full opacity-80">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dừng học hẳn</span>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 text-slate-400">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-400 tracking-tight my-1">--%</div>
                        <div className="text-xs text-slate-400 truncate">Sắp ra mắt — cần phân hệ Sale</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dừng học hẳn</span>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{churnPercent}%</div>
                        <div className="text-xs text-slate-400 truncate">{dynamicRetention.churnCountThisMonth ?? 0} bạn đã thôi học</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LÝ DO HỌC VIÊN CŨ KHÔNG GIA HẠN (PLACEHOLDER HÓA — SẮP RA MẮT — CẦN PHÂN HỆ SALE) */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-muted/20 border border-dashed border-slate-300 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      LÝ DO HỌC VIÊN CŨ KHÔNG GIA HẠN
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold"
                  >
                    Sắp ra mắt — cần phân hệ Sale
                  </Badge>
                </div>

                <div className="py-4 px-3 text-center space-y-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Khảo sát nguyên nhân dừng học đang trong lộ trình tích hợp
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-lg mx-auto">
                    Dữ liệu phân loại lý do thôi học (trùng lịch trường, học phí, chuyển trường...) sẽ được kích hoạt đồng bộ từ phân hệ Chăm sóc &amp; Tuyển sinh (Sale CRM) khi tính năng khảo sát hoàn tất.
                  </p>
                </div>
              </div>
            </div>
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

      {/* Linh vật Chatbot AI Cody nổi ở góc phải dưới */}
      <AnalyticsChatMascot
        snapshot={snapshot}
        onOpenPrint={(aiText) => {
          if (aiText) setLatestAiAnalysis(aiText);
          setIsPrintView(true);
        }}
      />
    </div>
  );
}

export default AnalyticsClient;

