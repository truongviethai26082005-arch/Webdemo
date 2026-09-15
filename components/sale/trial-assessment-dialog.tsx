"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadTrial, TrialResult } from "@/types/database";
import { recordTrialAssessment } from "@/lib/actions/admissions";
import { Award, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface TrialAssessmentDialogProps {
  trial: (LeadTrial & { leadName?: string; leadPhone?: string; slotName?: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TrialAssessmentDialog({
  trial,
  open,
  onOpenChange,
  onSuccess,
}: TrialAssessmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"attended" | "absent" | "cancelled">("attended");
  const [score, setScore] = useState(trial?.score ? String(trial.score) : "");
  const [result, setResult] = useState<TrialResult>(trial?.result || "good");
  const [evaluation, setEvaluation] = useState(trial?.evaluation || "");
  const [advanceToConversion, setAdvanceToConversion] = useState(true);

  if (!trial) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await recordTrialAssessment({
        trialId: trial.id,
        leadId: trial.lead_id,
        status,
        score: score ? Number(score) : undefined,
        evaluation: evaluation.trim() || undefined,
        result: status === "attended" ? result : undefined,
        advanceToConversion: status === "attended" && advanceToConversion,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <span>Đánh Giá Năng Lực Sau Buổi Học Thử</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Học sinh: <strong className="text-foreground">{trial.leadName || "Học sinh"}</strong> •{" "}
            Ca: {trial.slotName || "Học thử"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tình trạng tham gia học thử</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as "attended" | "absent" | "cancelled")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                <SelectItem value="attended">Đã tham gia học thử</SelectItem>
                <SelectItem value="absent">Vắng mặt không báo trước</SelectItem>
                <SelectItem value="cancelled">Hủy lịch học thử</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "attended" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="score" className="text-xs font-semibold">
                    Điểm kiểm tra (Thang điểm 10)
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="VD: 8.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Xếp loại năng lực</Label>
                  <Select
                    value={result}
                    onValueChange={(val) => setResult(val as TrialResult)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      <SelectItem value="excellent">Xuất sắc</SelectItem>
                      <SelectItem value="good">Khá / Tốt</SelectItem>
                      <SelectItem value="average">Trung bình / Đạt</SelectItem>
                      <SelectItem value="weak">Yếu / Cần kèm thêm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="evaluation" className="text-xs font-semibold">
                  Nhận xét của Giáo viên / Chuyên viên
                </Label>
                <Textarea
                  id="evaluation"
                  placeholder="Con tiếp thu tốt, hổng phần hình học, cần củng cố bài toán thực tế..."
                  rows={3}
                  value={evaluation}
                  onChange={(e) => setEvaluation(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                <Checkbox
                  id="advance"
                  checked={advanceToConversion}
                  onCheckedChange={(c) => setAdvanceToConversion(Boolean(c))}
                  disabled={loading}
                />
                <Label
                  htmlFor="advance"
                  className="text-xs font-semibold cursor-pointer text-primary flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Đạt yêu cầu $\rightarrow$ Chuyển thẳng sang bước "Chờ Chốt Gói" (Conversion)
                </Label>
              </div>
            </>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-bold gap-1.5">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Lưu kết quả đánh giá
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
