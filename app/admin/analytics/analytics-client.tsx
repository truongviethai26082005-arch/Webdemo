"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Filter,
  Layers,
  Banknote,
  Users,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Wallet,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const TABS = [
  { id: "all", label: "Tất cả báo cáo", icon: LayoutGrid },
  { id: "funnel", label: "Phễu chuyển đổi", icon: Filter },
  { id: "cashflow", label: "Dòng tiền 12T", icon: TrendingUp },
  { id: "profit", label: "Lợi nhuận gộp", icon: Wallet },
  { id: "retention", label: "Tỷ lệ giữ chân", icon: Users },
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
  const [activeSection, setActiveSection] = useState<string>("all");

  function handleRefreshAI() {
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
  }

  function handlePrint() {
    window.print();
  }

  const currentTab = TABS.find((t) => t.id === activeSection) || TABS[0];

  return (
    <div className="space-y-6">
      {/* Quick Navigation / Tab Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pr-1">
          {activeSection !== "all" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveSection("all")}
              className="h-8 text-xs font-semibold gap-1 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Xem toàn bộ báo cáo</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="h-8 text-xs font-bold gap-1.5 rounded-xl border-border hover:bg-muted"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo</span>
          </Button>
        </div>
      </div>

      {/* Thông báo chế độ lọc khi xem tab riêng lẻ */}
      {activeSection !== "all" && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              Đang lọc riêng khối: <span className="text-primary">{currentTab.label}</span>
            </span>
            <span className="text-muted-foreground">• Các khối báo cáo khác đã được ẩn tạm thời</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection("all")}
            className="text-primary font-bold hover:underline"
          >
            Hiện lại tất cả
          </button>
        </div>
      )}

      {/* 1. KHỐI AI ADVISOR (CHỈ HIỂN THỊ KHI CHỌN "TẤT CẢ BÁO CÁO") */}
      {activeSection === "all" && (
        <AIAdvisorHeader data={aiAdvisor} onRefresh={handleRefreshAI} />
      )}

      {/* 2. KHỐI PHỄU CHUYỂN ĐỔI (HIỂN THỊ KHI "TẤT CẢ" HOẶC CHỌN RIÊNG "funnel") */}
      {(activeSection === "all" || activeSection === "funnel") && (
        <FunnelVisualizationCard
          stages={initialFunnelStages}
          dropBox={initialFunnelDropBox}
        />
      )}

      {/* 3. KHỐI DÒNG TIỀN 12T (HIỂN THỊ KHI "TẤT CẢ" HOẶC CHỌN RIÊNG "cashflow") */}
      {(activeSection === "all" || activeSection === "cashflow") && (
        <CashFlowChartCard data={initialCashFlow} />
      )}

      {/* 4. KHỐI LỢI NHUẬN GỘP (HIỂN THỊ KHI "TẤT CẢ" HOẶC CHỌN RIÊNG "profit") */}
      {(activeSection === "all" || activeSection === "profit") && (
        <GrossProfitCard data={initialGrossProfit} />
      )}

      {/* 5. KHỐI TỶ LỆ GIỮ CHÂN (HIỂN THỊ KHI "TẤT CẢ" HOẶC CHỌN RIÊNG "retention") */}
      {(activeSection === "all" || activeSection === "retention") && (
        <RetentionChurnCard data={initialRetention} />
      )}
    </div>
  );
}
