"use client";

import {
  Users,
  MessageSquare,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdmissionsFunnelBarProps {
  leadCount: number;
  contactedCount: number;
  trialCount: number;
  convertedCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdmissionsFunnelBar({
  leadCount,
  contactedCount,
  trialCount,
  convertedCount,
  activeTab,
  onTabChange,
}: AdmissionsFunnelBarProps) {
  // Tính toán tỷ lệ chuyển đổi
  const overallRate = leadCount > 0 ? ((convertedCount / leadCount) * 100).toFixed(1) : "0.0";
  const contactRate = leadCount > 0 ? ((contactedCount / leadCount) * 100).toFixed(0) : "0";
  const trialRate = contactedCount > 0 ? ((trialCount / contactedCount) * 100).toFixed(0) : "0";
  const closeRate = trialCount > 0 ? ((convertedCount / trialCount) * 100).toFixed(0) : "0";

  const steps = [
    {
      id: "leads",
      stage: "1. Khách hàng tiềm năng",
      shortLabel: "Lead thô",
      count: leadCount,
      rateLabel: "Tiếp nhận 100%",
      icon: Users,
      color: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/30",
      activeBorder: "ring-2 ring-blue-500 shadow-md shadow-blue-500/10",
      pillColor: "bg-blue-500 text-white",
    },
    {
      id: "interactions",
      stage: "2. Tư vấn & Chăm sóc",
      shortLabel: "Đang chăm sóc",
      count: contactedCount,
      rateLabel: `${contactRate}% so với Lead`,
      icon: MessageSquare,
      color: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30",
      activeBorder: "ring-2 ring-amber-500 shadow-md shadow-amber-500/10",
      pillColor: "bg-amber-500 text-white",
    },
    {
      id: "trials",
      stage: "3. Xếp lịch & Học thử",
      shortLabel: "Học thử / Test",
      count: trialCount,
      rateLabel: `${trialRate}% từ Tư vấn`,
      icon: Sparkles,
      color: "from-purple-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/30",
      activeBorder: "ring-2 ring-purple-500 shadow-md shadow-purple-500/10",
      pillColor: "bg-purple-500 text-white",
    },
    {
      id: "conversions",
      stage: "4. Ghi danh & Chốt cọc",
      shortLabel: "Chốt cọc / Ghi danh",
      count: convertedCount,
      rateLabel: `${closeRate}% từ Học thử`,
      icon: Award,
      color: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      activeBorder: "ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10",
      pillColor: "bg-emerald-600 text-white",
    },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-soft space-y-4">
      {/* Funnel Header / Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Thước đo Phễu Tuyển sinh & Tỷ lệ Chuyển đổi Vận hành
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Flame className="w-3 h-3" /> Realtime
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Theo dõi 4 nấc phễu liên tục từ khi tiếp nhận khách hàng cho tới khi nhập học chính thức
            </p>
          </div>
        </div>

        {/* Big Conversion Metric Box */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-4 py-2 rounded-xl border border-emerald-500/20">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300">
              Tỷ lệ chốt phễu (Lead ➔ Học viên)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-emerald-600 tracking-tight">
                {overallRate}%
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                ({convertedCount}/{leadCount} học viên)
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive 4-Step Funnel Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;

          return (
            <div key={step.id} className="relative group">
              <button
                type="button"
                onClick={() => onTabChange(step.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 bg-gradient-to-b ${step.color} ${
                  isActive ? step.activeBorder : "hover:border-primary/40 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {step.stage}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shadow-2xs ${
                      isActive ? step.pillColor : "bg-card text-foreground border border-border/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-foreground">
                      {step.count}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">học viên</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-background/80">
                    {step.rateLabel}
                  </Badge>
                </div>

                {isActive && (
                  <div className="mt-2 pt-2 border-t border-current/15 flex items-center justify-between text-[11px] font-bold text-foreground">
                    <span>Đang xem tab này</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                )}
              </button>

              {/* Connecting Arrow for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-card border border-border shadow-xs items-center justify-center text-muted-foreground text-[10px]">
                  ›
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
