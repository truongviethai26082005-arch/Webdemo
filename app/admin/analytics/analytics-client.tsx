"use client";

import { useState, useEffect, useRef } from "react";
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

import { AIAdvisorHeader } from "@/components/analytics/ai-advisor-header";
import { FunnelVisualizationCard } from "@/components/analytics/funnel-visualization-card";
import { CashFlowChartCard } from "@/components/analytics/cashflow-chart-card";
import { GrossProfitCard } from "@/components/analytics/gross-profit-card";
import { RetentionChurnCard } from "@/components/analytics/retention-churn-card";

import {
  FunnelStageData,
  FunnelDropBoxData,
  CashFlowMonthItem,
  GrossProfitData,
  RetentionMetricsData,
  AIAdvisorInsight,
} from "@/types/analytics";

interface AnalyticsClientProps {
  initialFunnelStages: FunnelStageData[];
  initialFunnelDropBox: FunnelDropBoxData;
  initialCashFlow: CashFlowMonthItem[];
  initialGrossProfit: GrossProfitData;
  initialRetention: RetentionMetricsData;
  initialAiAdvisor: AIAdvisorInsight;
}

const SECTION_IDS = [
  "section-ai-executive",
  "section-funnel",
  "section-cashflow",
  "section-grossprofit",
  "section-retention",
];

export function AnalyticsClient({
  initialFunnelStages,
  initialFunnelDropBox,
  initialCashFlow,
  initialGrossProfit,
  initialRetention,
  initialAiAdvisor,
}: AnalyticsClientProps) {
  const [aiAdvisor, setAiAdvisor] = useState<AIAdvisorInsight>(initialAiAdvisor);
  const [activeSectionId, setActiveSectionId] = useState<string>("section-ai-executive");
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    SECTION_IDS.forEach((id) => {
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
            <AIAdvisorHeader data={aiAdvisor} onRefresh={handleRefreshAI} />
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
              stages={initialFunnelStages}
              dropBox={initialFunnelDropBox}
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
            <CashFlowChartCard data={initialCashFlow} />
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
            <GrossProfitCard data={initialGrossProfit} />
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
            <RetentionChurnCard data={initialRetention} />
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
