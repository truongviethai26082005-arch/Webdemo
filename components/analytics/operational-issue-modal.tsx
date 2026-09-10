"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  MapPin,
  Search,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";

export interface OperationalIssue {
  id: string;
  title: string;
  severity: "critical" | "warning";
  severityLabel: "Nghiêm trọng" | "Cần lưu ý";
  stageTitle: string; // VD: "Quy trình Nóng: Chốt cọc & Học phí sau học thử"
  stageLocation: string; // VD: "Tầng N3 ➔ N4 (Phễu Tuyển Sinh)"
  estimatedLoss: string; // VD: "Hụt ~35.000.000 đ doanh thu mới trong tháng"
  lossMetric: string; // "15 phụ huynh đang ngập ngừng"
  rootCauseSummary: string;
  rootCausePoints: string[];
  recommendationSummary: string;
  actionSteps: string[];
  expectedOutcome: string;
  primaryAction: {
    label: string;
    successMessage: string;
  };
  secondaryAction?: {
    label: string;
    successMessage: string;
  };
}

interface OperationalIssueModalProps {
  issue: OperationalIssue | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OperationalIssueModal({
  issue,
  isOpen,
  onClose,
}: OperationalIssueModalProps) {
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!issue) return null;

  function handleAction(message: string) {
    setActionSuccess(message);
    setTimeout(() => {
      setActionSuccess(null);
    }, 4000);
  }

  const isCritical = issue.severity === "critical";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-2xl max-h-[90vh] p-0 flex flex-col bg-card border border-slate-300 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-muted/20 shrink-0 pr-12">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                isCritical
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
              }`}
            >
              {issue.severityLabel.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground font-mono font-semibold">
              #{issue.id.toUpperCase()}
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-black text-foreground leading-snug">
            {issue.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Báo cáo nguyên nhân gốc rễ và đề xuất can thiệp định lượng từ EduCenter AI Advisor
          </DialogDescription>
        </div>

        {/* BODY (SCROLLABLE NỘI DUNG) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Thông báo tương tác hành động thành công */}
          {actionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* PHẦN 1: VỊ TRÍ & KHÂU TẮC NGHẼN */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>1. Vị trí & Khâu tắc nghẽn</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Khâu bị ảnh hưởng
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    {issue.stageTitle}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="self-start sm:self-auto bg-background/80 text-primary border-primary/25 text-[11px] font-bold"
                >
                  {issue.stageLocation}
                </Badge>
              </div>

              {/* Hộp cảnh báo thiệt hại định lượng */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  isCritical
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
                }`}
              >
                <TrendingDown
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    isCritical
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Thiệt hại định lượng ước tính
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold leading-snug">
                    {issue.estimatedLoss}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Quy mô ảnh hưởng: {issue.lossMetric}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 2: NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
              <Search className="w-4 h-4 text-indigo-500" />
              <span>2. Nguyên nhân gốc rễ (Root Cause)</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                {issue.rootCauseSummary}
              </p>

              <div className="space-y-2 pt-1">
                {(issue.rootCausePoints || []).map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card border border-slate-300 dark:border-slate-700 text-xs text-foreground"
                  >
                    <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                      0{index + 1}
                    </div>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PHẦN 3: GIẢI PHÁP AI ĐỀ XUẤT (ACTIONABLE PLAN) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>3. Giải pháp AI đề xuất (Actionable Plan)</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                {issue.recommendationSummary}
              </p>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Các bước triển khai ngay:
                </span>
                {(issue.actionSteps || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-foreground bg-card/80 p-2.5 rounded-xl border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Thẻ kỳ vọng đạt được */}
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200">
                  {issue.expectedOutcome}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER (CHÂN MODAL) */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-card shrink-0 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {issue.secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(issue.secondaryAction!.successMessage)}
              className="w-full sm:w-auto h-9 text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-muted"
            >
              {issue.secondaryAction.label}
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => handleAction(issue.primaryAction.successMessage)}
            className="w-full sm:w-auto h-9 text-xs font-black rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
          >
            <span>{issue.primaryAction.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
