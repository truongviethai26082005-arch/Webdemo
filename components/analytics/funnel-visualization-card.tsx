"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FunnelStageData, FunnelDropBoxData } from "@/types/analytics";

const DEFAULT_STAGES: FunnelStageData[] = [
  {
    id: "N1",
    code: "N1",
    title: "Lead thô (Đăng ký mới)",
    subtitle: "Thu thập từ biểu mẫu tuyển sinh",
    count: 35,
    conversionRateNext: 74,
    everReached: 35,
    currentlyInStage: 9,
    movedNextOrBranched: 26,
    pctOfTopFunnel: 100,
    rateToOfficial: 11,
    colorName: "blue",
    gradientClass: "from-blue-700 via-blue-600 to-indigo-700",
    borderClass: "border-blue-500/40",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
  {
    id: "N2",
    code: "N2",
    title: "Tiềm năng (Tư vấn & Chăm sóc)",
    subtitle: "Đã liên hệ, trao đổi nhu cầu",
    count: 26,
    conversionRateNext: 42,
    everReached: 26,
    currentlyInStage: 15,
    movedNextOrBranched: 11,
    pctOfTopFunnel: 74,
    rateToOfficial: 15,
    colorName: "indigo",
    gradientClass: "from-indigo-600 via-indigo-500 to-purple-600",
    borderClass: "border-indigo-400/40",
    badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
  },
  {
    id: "N3",
    code: "N3",
    title: "Học thử (Test năng lực)",
    subtitle: "Xếp lịch trải nghiệm",
    count: 11,
    conversionRateNext: 36,
    everReached: 11,
    currentlyInStage: 7,
    movedNextOrBranched: 4,
    pctOfTopFunnel: 31,
    rateToOfficial: 36,
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
    count: 4,
    conversionRateNext: 100,
    everReached: 4,
    currentlyInStage: 4,
    movedNextOrBranched: 0,
    pctOfTopFunnel: 11,
    rateToOfficial: 100,
    colorName: "emerald",
    gradientClass: "from-emerald-600 via-emerald-500 to-teal-500",
    borderClass: "border-emerald-400/40",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  },
];

const DEFAULT_DROPBOX: FunnelDropBoxData = {
  id: "N0",
  code: "N0",
  title: "Đã nghỉ / Rớt phễu",
  count: 9,
  reasons: [
    { reason: "Trùng lịch học thêm / ca trường", percentage: 40, count: 4 },
    { reason: "Học phí cao hơn dự kiến", percentage: 30, count: 3 },
    { reason: "Địa điểm xa / khó đưa đón", percentage: 20, count: 2 },
    { reason: "Lý do cá nhân khác", percentage: 10, count: 1 },
  ],
};

interface FunnelVisualizationCardProps {
  stages?: FunnelStageData[];
  dropBox?: FunnelDropBoxData;
}

export function FunnelVisualizationCard({
  stages = DEFAULT_STAGES,
  dropBox = DEFAULT_DROPBOX,
}: FunnelVisualizationCardProps) {
  const safeStages = Array.isArray(stages) && stages.length > 0 ? stages : DEFAULT_STAGES;
  const safeDropBox = dropBox || DEFAULT_DROPBOX;
  // Mặc định mở tầng có vấn đề lớn nhất (N3 - Học thử/Test năng lực)
  const [expandedStage, setExpandedStage] = useState<string | null>("N3");

  const toggleStage = (stageId: string) => {
    setExpandedStage((prev) => (prev === stageId ? null : stageId));
  };

  // Độ rộng hình thang ngược thuôn dần tạo hiệu ứng phễu trục trung tâm
  const tierWidths: Record<string, string> = {
    N1: "w-full",
    N2: "w-[94%] sm:w-[92%]",
    N3: "w-[88%] sm:w-[84%]",
    N4: "w-[82%] sm:w-[76%]",
  };

  // Tone màu phẳng, dịu mắt (Slate-800, Indigo, Amber, Teal)
  const tierColors: Record<
    string,
    {
      bg: string;
      textMuted: string;
    }
  > = {
    N1: {
      bg: "bg-slate-800 text-white",
      textMuted: "text-slate-300",
    },
    N2: {
      bg: "bg-indigo-700 text-white",
      textMuted: "text-indigo-200",
    },
    N3: {
      bg: "bg-amber-600 text-white",
      textMuted: "text-amber-100",
    },
    N4: {
      bg: "bg-teal-700 text-white",
      textMuted: "text-teal-100",
    },
  };

  return (
    <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header khối */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Báo Cáo Tỷ Lệ Chuyển Đổi Phễu
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
            >
              Cấu trúc 4 tầng thuôn dần
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Mô hình phễu chuẩn hóa đo lường từng nấc chuyển đổi, tỷ lệ đi tiếp và số lượng dừng phễu
          </p>
        </div>

        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Bấm vào từng tầng để bung mở bảng chi tiết</span>
        </div>
      </div>

      {/* Bố cục Một Cột Trung Tâm (Single Column Funnel) */}
      <div className="max-w-2xl mx-auto w-full py-2 flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          {safeStages.map((stage, index) => {
            const isExpanded = expandedStage === stage.id;
            const colorInfo = tierColors[stage.id] || tierColors.N1;
            const widthClass = tierWidths[stage.id] || "w-full";

            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center transition-all duration-300 ${widthClass}`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleStage(stage.id)}
                  className={`w-full text-left px-4 sm:px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-xs hover:brightness-95 flex items-center justify-between gap-3 ${
                    colorInfo.bg
                  } ${
                    isExpanded
                      ? "ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900"
                      : ""
                  }`}
                >
                  {/* [Badge N1/N2/N3/N4] + [Tên tầng] */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs font-black">
                      {stage.code}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-tight truncate">
                        {stage.title}
                      </h4>
                      <span
                        className={`text-[10px] ${colorInfo.textMuted} font-medium block truncate`}
                      >
                        {stage.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* [Con số Lead] + [Icon ChevronDown/Up] */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-white">
                        {stage.count}
                      </span>
                      <span className="text-[11px] text-white/80 font-medium ml-1">
                        Lead
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Accordion Body: Bung mở chi tiết tại chỗ ngay dưới tầng */}
                {isExpanded && (
                  <div className="w-full bg-slate-50 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 my-2 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2.5 text-xs">
                      {/* Hàng 1: Đã từng đạt bậc (Count) • Đang ở bậc này (Count) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                          <span className="text-muted-foreground font-medium">
                            Đã từng đạt bậc:
                          </span>
                          <span className="text-foreground font-bold text-xs sm:text-sm">
                            {stage.everReached}{" "}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              Lead
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                          <span className="text-muted-foreground font-medium">
                            Đang ở bậc này:
                          </span>
                          <span className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 font-extrabold text-xs px-2 py-0.5 rounded-md">
                            {stage.currentlyInStage} Lead
                          </span>
                        </div>
                      </div>

                      {/* Hàng 2: Đã đi tiếp hoặc ra nhánh (Count) • Tỷ lệ so với đầu phễu (%) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                          <span className="text-muted-foreground font-medium">
                            Đã đi tiếp / ra nhánh:
                          </span>
                          <span className="text-foreground font-bold text-xs sm:text-sm">
                            {stage.movedNextOrBranched}{" "}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              Lead
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                          <span className="text-muted-foreground font-medium">
                            Tỷ lệ so với đầu phễu:
                          </span>
                          <span className="text-foreground font-extrabold text-xs sm:text-sm">
                            {stage.pctOfTopFunnel}%
                          </span>
                        </div>
                      </div>

                      {/* Hàng 3: Tỷ lệ chuyển tiếp lên bậc kế tiếp (%) */}
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <span className="text-muted-foreground font-medium">
                            {index < stages.length - 1
                              ? `Tỷ lệ chuyển tiếp lên bậc ${stages[index + 1].code}:`
                              : "Tỷ lệ chốt học viên chính thức:"}
                          </span>
                          <span className="font-extrabold text-foreground text-xs sm:text-sm">
                            {index < stages.length - 1
                              ? `${stage.conversionRateNext}%`
                              : `${stage.rateToOfficial}%`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index < stages.length - 1
                                ? "bg-indigo-600 dark:bg-indigo-400"
                                : "bg-teal-600 dark:bg-teal-400"
                            }`}
                            style={{
                              width: `${
                                index < stages.length - 1
                                  ? stage.conversionRateNext
                                  : stage.rateToOfficial
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nhãn chuyển tiếp giữa các tầng */}
                {index < stages.length - 1 && (
                  <div className="my-1.5 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-card px-3 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs">
                      <span className="text-slate-400">‹</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                        {stage.conversionRateNext}%
                      </span>
                      <span>chuyển tiếp</span>
                      <span className="text-slate-400">›</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Khối N0 - Rớt Phễu (Lost/Drop Box) */}
        <div className="w-full mt-4 p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                {safeDropBox.code}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {safeDropBox.title.replace(/^N0:\s*/, "")}
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
            >
              {safeDropBox.count} trường hợp rớt phễu
            </Badge>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tỷ trọng nguyên nhân chính:
            </span>
            <div className="space-y-2">
              {(safeDropBox?.reasons || []).map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      • {r.reason}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {r.percentage}%{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        ({r.count} Lead)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300"
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Funnel Note */}
        <div className="mt-3.5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>
            Đáy phễu: <strong>{stages.find((s) => s.id === "N4")?.count ?? 4} học viên chính thức</strong> đã hoàn tất nộp cọc / học phí trọn gói vào lớp.
          </span>
        </div>
      </div>
    </div>
  );
}
