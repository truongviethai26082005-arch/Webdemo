"use client";

import { useState } from "react";
import {
  TrendingDown,
  ArrowDown,
  Info,
  ChevronRight,
  Filter,
  UserX,
  Sparkles,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FunnelStageData, FunnelDropBoxData } from "@/types/analytics";

interface FunnelVisualizationCardProps {
  stages: FunnelStageData[];
  dropBox: FunnelDropBoxData;
}

export function FunnelVisualizationCard({
  stages,
  dropBox,
}: FunnelVisualizationCardProps) {
  // Default selected tier is N3 (Học thử) as highlighted in the user prompt!
  const [selectedStageId, setSelectedStageId] = useState<string>("N3");

  const selectedStage =
    stages.find((s) => s.id === selectedStageId) || stages[2];

  // Visual width percentage for the inverted funnel tiers
  const tierWidths: Record<string, string> = {
    N1: "w-full max-w-[540px]",
    N2: "w-[85%] max-w-[460px]",
    N3: "w-[70%] max-w-[380px]",
    N4: "w-[55%] max-w-[300px]",
  };

  const tierColors: Record<
    string,
    {
      bg: string;
      activeGlow: string;
      text: string;
      badge: string;
    }
  > = {
    N1: {
      bg: "bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white",
      activeGlow: "ring-2 ring-blue-400 shadow-xl shadow-blue-900/40",
      text: "text-blue-100",
      badge: "bg-blue-500/30 text-blue-200 border-blue-400/30",
    },
    N2: {
      bg: "bg-gradient-to-r from-indigo-800 via-indigo-700 to-purple-800 hover:from-indigo-700 hover:to-purple-700 text-white",
      activeGlow: "ring-2 ring-indigo-400 shadow-xl shadow-indigo-900/40",
      text: "text-indigo-100",
      badge: "bg-indigo-500/30 text-indigo-200 border-indigo-400/30",
    },
    N3: {
      bg: "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white",
      activeGlow: "ring-2 ring-amber-300 shadow-xl shadow-amber-900/40",
      text: "text-amber-50",
      badge: "bg-amber-400/30 text-amber-100 border-amber-300/40",
    },
    N4: {
      bg: "bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white",
      activeGlow: "ring-2 ring-emerald-300 shadow-xl shadow-emerald-900/40",
      text: "text-emerald-50",
      badge: "bg-emerald-400/30 text-emerald-100 border-emerald-300/40",
    },
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground">
              Báo Cáo Tỷ Lệ Chuyển Đổi Phễu (Inverted Funnel)
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
              Cấu trúc 4 tầng đảo ngược
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mô hình phễu chuẩn hóa đo lường từng nấc chuyển đổi, tỷ lệ đi tiếp, số lượng đang dừng và tỷ lệ rớt phễu
          </p>
        </div>

        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Nhấp vào từng tầng phễu để xem chi tiết chỉ số</span>
        </div>
      </div>

      {/* Main 2-Column Layout: Left (Selected Tier Detail + Drop Box) / Right (Inverted Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Detail Inspector Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Stage Detail Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-primary text-primary-foreground">
                  {selectedStage.code}
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground leading-tight">
                    {selectedStage.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedStage.subtitle}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-foreground">{selectedStage.count}</span>
                <span className="text-xs text-muted-foreground ml-1">Lead</span>
              </div>
            </div>

            {/* Parameter Box */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Đã từng đạt bậc:</span>
                <strong className="text-foreground text-sm font-bold">
                  {selectedStage.everReached}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Đang ở bậc này:</span>
                <span className="text-primary font-extrabold text-sm bg-primary/10 px-2 py-0.2 rounded-md">
                  {selectedStage.currentlyInStage}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Đã đi tiếp hoặc ra nhánh:</span>
                <strong className="text-foreground text-sm font-bold">
                  {selectedStage.movedNextOrBranched}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground font-medium">So với bậc đầu phễu:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  {selectedStage.pctOfTopFunnel}%
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 bg-emerald-500/10 px-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                  Lên hệ: Chính thức:
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm">
                  {selectedStage.rateToOfficial}%
                </span>
              </div>
            </div>
          </div>

          {/* Box Màu Xám: Trạng thái rớt khỏi phễu (Lost / Drop box) */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-xs">
                  {dropBox.code}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {dropBox.title}
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                {dropBox.count} trường hợp
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Phân tích nguyên nhân rớt phễu:
              </span>
              <div className="space-y-1.5">
                {dropBox.reasons.map((r, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        • {r.reason}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {r.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-500 dark:bg-slate-400 rounded-full"
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The Visual Inverted Trapezoid Funnel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-muted/20 to-muted/60 border border-border/80 min-h-[440px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Mô hình Phễu Chuyển Đổi Thu Hẹp Dần (Từ Trên Xuống Đáy)
          </span>

          <div className="w-full flex flex-col items-center space-y-1.5">
            {stages.map((stage, index) => {
              const isSelected = selectedStage.id === stage.id;
              const colorInfo = tierColors[stage.id];
              const widthClass = tierWidths[stage.id];

              return (
                <div key={stage.id} className="w-full flex flex-col items-center">
                  {/* Tier Bar (Trapezoid Style Layer) */}
                  <button
                    type="button"
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`relative text-left px-5 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer ${widthClass} ${colorInfo.bg} ${
                      isSelected ? colorInfo.activeGlow : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs font-black">
                          {stage.code}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-tight">
                            {stage.title}
                          </h4>
                          <span className={`text-[10px] ${colorInfo.text} font-medium`}>
                            {stage.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-white">
                          {stage.count}
                        </span>
                        <span className="text-[11px] text-white/80 font-medium">Lead</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-full bg-white shadow-md animate-pulse" />
                    )}
                  </button>

                  {/* Transition Arrow to next tier */}
                  {index < stages.length - 1 && (
                    <div className="my-1 flex items-center justify-center gap-1.5 py-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-black tracking-tight text-muted-foreground bg-card/90 px-3 py-1 rounded-full border border-border/80 shadow-xs">
                        <span className="text-muted-foreground">‹</span>
                        <span className="text-primary font-extrabold">
                          {stages[index].conversionRateNext}%
                        </span>
                        <span>chuyển tiếp</span>
                        <span className="text-muted-foreground">›</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Funnel Note */}
          <div className="mt-5 text-center text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Đáy phễu: <strong>4 học viên chính thức</strong> đã nạp cọc / đóng học phí trọn gói vào lớp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
