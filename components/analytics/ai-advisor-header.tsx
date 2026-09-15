"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  BrainCircuit,
  Target,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIAdvisorInsight } from "@/types/analytics";
import { OperationalIssue } from "./operational-issue-modal";

export interface ExecutiveMetrics {
  revenueGrowthText?: string;
  revenueValueText?: string;
  conversionText?: string;
  conversionSubtext?: string;
  isConversionWarning?: boolean;
  priorityFocusText?: string;
}

interface AIAdvisorHeaderProps {
  data: AIAdvisorInsight;
  operationalIssues?: OperationalIssue[];
  executiveMetrics?: ExecutiveMetrics;
  onRefresh?: () => void;
}

export function AIAdvisorHeader({
  data,
  operationalIssues,
  executiveMetrics,
  onRefresh,
}: AIAdvisorHeaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  // Tuân thủ nghiêm ngặt Điều 4 - No Mock/Fallback Data: chỉ lấy dữ liệu thực tế được truyền vào
  const activeIssues = operationalIssues || [];

  function handleScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onRefresh) onRefresh();
    }, 800);
  }

  return (
    <div className="rounded-2xl bg-card border border-slate-300 dark:border-slate-700 p-4 sm:p-5 shadow-xs text-foreground space-y-4">
      {/* Top bar: AI Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Trợ lý phân tích thông minh
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-[11px] text-muted-foreground font-medium">
            Quét lần cuối: {data.generatedAt}
          </span>
          <Button
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            className="h-7.5 px-3 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Đang phân tích..." : "Quét lại AI"}</span>
          </Button>
        </div>
      </div>

      {/* Block 1: TÓM TẮT ĐÁNH GIÁ (Metric Cards) - Giao diện phẳng tối giản */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <BrainCircuit className="w-3.5 h-3.5 text-slate-500" />
          <span>Tóm tắt đánh giá vận hành (AI Executive Summary)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Doanh thu */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Doanh thu tháng
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {executiveMetrics?.revenueValueText || "0 đ"}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {executiveMetrics?.revenueGrowthText || "Thực thu"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Tỷ lệ chốt / Giữ chân */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              executiveMetrics?.isConversionWarning !== false
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
            }`}>
              {executiveMetrics?.isConversionWarning !== false ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Giữ chân & Tái tục
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {executiveMetrics?.conversionText || "Đang thống kê"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {executiveMetrics?.conversionSubtext || "Học viên duy trì lớp"}
              </span>
            </div>
          </div>

          {/* Card 3: Trọng tâm vận hành */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Trọng tâm vận hành
              </span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {executiveMetrics?.priorityFocusText || "Vận hành ổn định"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block 2: VẤN ĐỀ VẬN HÀNH (Inline Accordion Expand) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Vấn đề vận hành
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 px-2 py-0.5"
          >
            {activeIssues.length} vấn đề cần xử lý
          </Badge>
        </div>

        {/* Danh sách các vấn đề: Accordion trượt mở tại chỗ */}
        {activeIssues.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-400 italic rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            Chưa có dữ liệu cảnh báo điểm nghẽn. Hệ thống đang vận hành bình thường.
          </div>
        ) : (
          <div className="space-y-2">
            {activeIssues.map((issue) => {
              const isCritical = issue.severity === "critical";
              const isExpanded = expandedIssueId === issue.id;

              const targetHref =
                issue.targetUrl ||
                (issue.id.includes("class")
                  ? "/admin/classes"
                  : issue.id.includes("debt")
                  ? "/admin/finance"
                  : "/admin/students");

              const targetLabel =
                issue.targetLabel ||
                (issue.id.includes("class")
                  ? "Đi tới Quản lý Lớp học ➔"
                  : issue.id.includes("debt")
                  ? "Đi tới Sổ cái Tài chính ➔"
                  : "Đi tới Học sinh & Xếp lớp ➔");

              return (
                <div
                  key={issue.id}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-card shadow-xs transition-all overflow-hidden"
                >
                  {/* Dòng tóm tắt (Clickable header) */}
                  <div
                    onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                    className="group flex items-center justify-between gap-3 py-2.5 px-4 hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon cảnh báo nhỏ gọn */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isCritical
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {isCritical ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Tag mức độ */}
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                          isCritical
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {issue.severityLabel}
                      </span>

                      {/* Tên vấn đề in đậm */}
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                        {issue.title}
                      </span>
                    </div>

                    {/* Nhãn hành động & Mũi tên Accordion */}
                    <div className="flex items-center gap-1 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                      <span className="text-xs hidden xs:inline">
                        {isExpanded ? "Thu gọn" : "Chi tiết"}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  {/* Khung chi tiết khi trượt mở tại chỗ (Inline Accordion Expand) */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-muted/30 p-3.5 space-y-2 text-xs">
                      {/* Hàng 1 - Vị trí & Phạm vi */}
                      <div className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          Khâu bị ảnh hưởng:
                        </span>{" "}
                        <span>{issue.stageTitle || issue.stageLocation || "Vận hành chung"}</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          Ảnh hưởng:
                        </span>{" "}
                        <span>{issue.lossMetric || "Chưa ghi nhận số lượng"}</span>
                      </div>

                      {/* Hàng 2 - Nguyên nhân thực tế */}
                      <div className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          Nguyên nhân thực tế:
                        </span>{" "}
                        <span>{issue.rootCauseSummary}</span>
                      </div>

                      {/* Hàng 3 - Đề xuất can thiệp & Link hành động */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                        <div className="text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            Đề xuất can thiệp:
                          </span>{" "}
                          <span>{issue.recommendationSummary}</span>
                        </div>

                        <Link
                          href={targetHref}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                        >
                          <span>{targetLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
