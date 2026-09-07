"use client";

import { useState } from "react";
import {
  Users,
  Sparkles,
  Award,
  ArrowRight,
  Clock,
} from "lucide-react";

interface AdmissionsFunnelBarProps {
  leadCount: number;
  trialCount: number;
  convertedCount: number;
  pendingLeads: number; // Lead đang chờ gọi / chưa liên hệ
  pendingTrials: number; // Trial đang chờ xử lý
  pendingConversions: number; // Conversion chờ hoàn tất
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const STEPS = [
  {
    id: "leads",
    stepNum: "1",
    step: "Bước 1",
    label: "Khách hàng tiềm năng",
    shortLabel: "KH tiềm năng",
    subtext: "Tiếp nhận & Chăm sóc Lead",
    icon: Users,
    color: {
      gradient: "from-blue-500/15 via-blue-500/5 to-transparent dark:from-blue-950/40 dark:via-blue-900/10",
      activeBg: "bg-blue-50/80 dark:bg-blue-950/50",
      border: "border-blue-500/25 dark:border-blue-500/30",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20",
      hoverBorder: "hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/15",
      glowHover: "hover:shadow-[0_8px_30px_rgba(59,130,246,0.22)]",
      iconBg: "bg-blue-500 text-white",
      iconActive: "bg-blue-600 text-white shadow-md shadow-blue-500/30",
      text: "text-blue-600 dark:text-blue-400",
      pill: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      badge: "bg-blue-600 text-white",
      tooltipBg: "bg-slate-900 text-white dark:bg-slate-800 border-blue-500/40",
      accentBar: "bg-blue-500",
    },
  },
  {
    id: "trials",
    stepNum: "2",
    step: "Bước 2",
    label: "Xếp lịch học thử",
    shortLabel: "Học thử & Test",
    subtext: "Ghép lớp & Test năng lực",
    icon: Sparkles,
    color: {
      gradient: "from-purple-500/15 via-purple-500/5 to-transparent dark:from-purple-950/40 dark:via-purple-900/10",
      activeBg: "bg-purple-50/80 dark:bg-purple-950/50",
      border: "border-purple-500/25 dark:border-purple-500/30",
      activeBorder: "border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20",
      hoverBorder: "hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/15",
      glowHover: "hover:shadow-[0_8px_30px_rgba(168,85,247,0.22)]",
      iconBg: "bg-purple-500 text-white",
      iconActive: "bg-purple-600 text-white shadow-md shadow-purple-500/30",
      text: "text-purple-600 dark:text-purple-400",
      pill: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
      badge: "bg-purple-600 text-white",
      tooltipBg: "bg-slate-900 text-white dark:bg-slate-800 border-purple-500/40",
      accentBar: "bg-purple-500",
    },
  },
  {
    id: "conversions",
    stepNum: "3",
    step: "Bước 3",
    label: "Ghi danh & Chuyển đổi",
    shortLabel: "Ghi danh & Đóng phí",
    subtext: "Chốt gói & VietQR 1 chạm",
    icon: Award,
    color: {
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/10",
      activeBg: "bg-emerald-50/80 dark:bg-emerald-950/50",
      border: "border-emerald-500/25 dark:border-emerald-500/30",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/15",
      glowHover: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.22)]",
      iconBg: "bg-emerald-500 text-white",
      iconActive: "bg-emerald-600 text-white shadow-md shadow-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
      pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      badge: "bg-emerald-600 text-white",
      tooltipBg: "bg-slate-900 text-white dark:bg-slate-800 border-emerald-500/40",
      accentBar: "bg-emerald-500",
    },
  },
];

export function AdmissionsFunnelBar({
  leadCount,
  trialCount,
  convertedCount,
  pendingLeads,
  pendingTrials,
  pendingConversions,
  activeTab,
  onTabChange,
}: AdmissionsFunnelBarProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const counts = [leadCount, trialCount, convertedCount];
  const pending = [pendingLeads, pendingTrials, pendingConversions];
  const tooltipTexts = [
    `${pendingLeads} Lead đang chờ gọi & chăm sóc`,
    `${pendingTrials} buổi học thử chờ xử lý & đánh giá`,
    `${pendingConversions} hồ sơ chờ cọc & hoàn tất ghi danh`,
  ];

  const activeIndex = STEPS.findIndex((s) => s.id === activeTab);

  // Progress indicator width: Bước 1: 33.3%, Bước 2: 66.6%, Bước 3: 100%
  const progressWidths = ["33.33%", "66.66%", "100%"];
  const progressWidth = activeIndex >= 0 ? progressWidths[activeIndex] : "33.33%";

  return (
    <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft transition-all duration-300">

      {/* Progress Track (chạy từ trái sang phải mượt mà khi chuyển bước) */}
      <div className="relative h-1.5 bg-muted/70 w-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-r-full shadow-sm"
          style={{ width: progressWidth }}
        />
      </div>

      {/* 3 Steps Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-background/50">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          const isHovered = hoveredStep === step.id;
          const count = counts[idx];
          const pendingCount = pending[idx];
          const tooltipText = tooltipTexts[idx];

          return (
            <div
              key={step.id}
              className="relative"
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Floating Tooltip hiển thị khi hover */}
              {isHovered && (
                <div
                  role="tooltip"
                  className={`absolute -top-12 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap shadow-2xl pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95 ${step.color.tooltipBg}`}
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{tooltipText}</span>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 dark:border-t-slate-800" />
                </div>
              )}

              {/* Step Button */}
              <button
                type="button"
                onClick={() => onTabChange(step.id)}
                className={`
                  w-full text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group
                  bg-gradient-to-br ${step.color.gradient}
                  ${
                    isActive
                      ? `${step.color.activeBorder} ${step.color.activeBg}`
                      : `${step.color.border} ${step.color.hoverBorder} ${step.color.glowHover} bg-card/80`
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                `}
                style={{
                  transform: isHovered && !isActive ? "translateY(-2px)" : undefined,
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease",
                }}
              >
                {/* Active Accent Top Indicator Bar */}
                {isActive && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${step.color.accentBar}`} />
                )}

                {/* Main Header: Title + Icon (Bắt đầu trực tiếp từ tên tiêu đề lớn) */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <h4
                      className={`text-base font-extrabold leading-tight block tracking-tight ${
                        isActive ? step.color.text : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.subtext}
                    </p>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? step.color.iconActive
                        : "bg-card border border-border/80 text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Metrics row */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-foreground">
                      {count}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      hồ sơ
                    </span>
                  </div>

                  {/* Pending Badge */}
                  {pendingCount > 0 ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${step.color.pill}`}
                      title={tooltipText}
                    >
                      {pendingCount} chờ xử lý
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Đã xử lý hết
                    </span>
                  )}
                </div>

                {/* Active Footer Bar */}
                {isActive ? (
                  <div
                    className={`mt-3 pt-2 border-t border-current/15 flex items-center justify-between text-xs font-bold ${step.color.text}`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      Đang xem giai đoạn này
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Nhấn để xem chi tiết</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>

              {/* Connecting arrow connector between steps on desktop */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-card border border-border/80 shadow-xs items-center justify-center text-muted-foreground text-xs font-black">
                  &rsaquo;
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
