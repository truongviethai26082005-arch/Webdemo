"use client";

import { Users, Sparkles, Award, ArrowRight } from "lucide-react";

interface AdmissionsFunnelBarProps {
  leadCount: number;
  trialCount: number;
  convertedCount: number;
  pendingLeads: number;
  pendingTrials: number;
  pendingConversions: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const STEPS = [
  {
    id: "leads",
    label: "Khách hàng tiềm năng",
    subtext: "Tiếp nhận & Chăm sóc Lead",
    icon: Users,
    activeColor: "border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20 bg-white text-indigo-950",
    activeTopBar: "bg-indigo-500",
    iconActive: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "trials",
    label: "Xếp lịch học thử",
    subtext: "Ghép lớp & Test năng lực",
    icon: Sparkles,
    activeColor: "border-purple-500 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/20 bg-white text-purple-950",
    activeTopBar: "bg-purple-500",
    iconActive: "bg-purple-50 text-purple-600",
  },
  {
    id: "conversions",
    label: "Ghi danh & Chuyển đổi",
    subtext: "Chốt gói & VietQR 1 chạm",
    icon: Award,
    activeColor: "border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/20 bg-white text-emerald-950",
    activeTopBar: "bg-emerald-500",
    iconActive: "bg-emerald-50 text-emerald-600",
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
  const counts = [leadCount, trialCount, convertedCount];
  const pending = [pendingLeads, pendingTrials, pendingConversions];

  const activeIndex = STEPS.findIndex((s) => s.id === activeTab);
  const progressWidths = ["33.33%", "66.66%", "100%"];
  const progressWidth = activeIndex >= 0 ? progressWidths[activeIndex] : "33.33%";

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-2 pb-3 border-b border-slate-100 transition-all">
      {/* Thanh tiến trình chuyển bước mượt mà (Progress Line Animation) */}
      <div className="relative h-1 bg-slate-100 w-full overflow-hidden rounded-full mb-2.5">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full shadow-xs"
          style={{ width: progressWidth }}
        />
      </div>

      {/* 3 Steps Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          const count = counts[idx];
          const pendingCount = pending[idx];

          return (
            <div key={step.id} className="relative">
              <button
                type="button"
                onClick={() => onTabChange(step.id)}
                className={`
                  w-full text-left p-3.5 rounded-xl border relative overflow-hidden group cursor-pointer
                  transition-all duration-300 ease-out transform
                  hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 active:scale-[0.98]
                  ${
                    isActive
                      ? step.activeColor
                      : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }
                `}
              >
                {/* Top Accent Line for Active Step */}
                {isActive && (
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${step.activeTopBar}`} />
                )}

                {/* Card Top: Title & Icon (XÓA BỎ "Bước 1", "Bước 2", "Bước 3") */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      className={`text-sm font-bold leading-tight tracking-tight transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      {step.subtext}
                    </p>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `${step.iconActive} shadow-2xs`
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Bottom: Metrics & Pending Badge */}
                <div className="flex items-baseline justify-between mt-2.5 pt-1.5 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-lg font-extrabold tracking-tight transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-800"
                      }`}
                    >
                      {count}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">hồ sơ</span>
                  </div>

                  {pendingCount > 0 ? (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                      {pendingCount} chờ xử lý
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                      ✓ Hoàn tất
                    </span>
                  )}
                </div>
              </button>

              {/* Arrow Connector between Steps on Desktop */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-2xs items-center justify-center text-slate-300 text-xs">
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
