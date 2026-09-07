"use client";

import { useState, useEffect } from "react";
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
import { Award, CheckCircle2, UserCheck, Sparkles } from "lucide-react";
import { TrialClass, TrialStatus, TrialResult } from "@/types/admissions";

interface AssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  onSaveAssessment: (updatedTrial: TrialClass, moveToConversion?: boolean) => void;
}

export function AssessmentDialog({
  isOpen,
  onClose,
  trial,
  onSaveAssessment,
}: AssessmentDialogProps) {
  const [status, setStatus] = useState<TrialStatus>("attended");
  const [testScore, setTestScore] = useState<number>(8.0);
  const [trialResult, setTrialResult] = useState<TrialResult>("good");
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [parentFeedback, setParentFeedback] = useState("");
  const [nextStep, setNextStep] = useState<"convert" | "re_test" | "failed">("convert");

  useEffect(() => {
    if (trial) {
      setStatus(trial.status || "attended");
      setTestScore(trial.testScore ?? 8.0);
      setTrialResult(trial.trialResult || "good");
      setTeacherFeedback(trial.teacherFeedback || "");
      setParentFeedback(trial.parentFeedback || "");
      setNextStep(trial.nextStep || "convert");
    }
  }, [trial]);

  if (!trial) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trial) return;

    const updatedTrial: TrialClass = {
      ...trial,
      status,
      testScore: Number(testScore),
      trialResult,
      teacherFeedback: teacherFeedback.trim(),
      parentFeedback: parentFeedback.trim(),
      nextStep,
    };

    onSaveAssessment(updatedTrial, nextStep === "convert");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <Award className="w-5 h-5" />
            <span>Đánh Giá Năng Lực & Phản Hồi Sau Học Thử</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Cập nhật kết quả buổi test/học thử của học sinh{" "}
            <strong className="text-foreground">{trial.leadName}</strong> ({trial.className})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Trạng thái tham gia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trạng thái buổi học thử</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TrialStatus)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="attended">✅ Đã tham gia đầy đủ</option>
                <option value="scheduled">🕒 Đã hẹn (Chưa tới giờ)</option>
                <option value="absent">❌ Vắng mặt không phép</option>
                <option value="cancelled">🚫 Phụ huynh xin hủy hẹn</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Điểm test đầu vào (Thang 10)</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={testScore}
                onChange={(e) => setTestScore(parseFloat(e.target.value) || 0)}
                className="h-9 text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Xếp loại năng lực đầu vào</Label>
            <select
              value={trialResult}
              onChange={(e) => setTrialResult(e.target.value as TrialResult)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="excellent">Xuất sắc (Phù hợp lớp Nâng cao / Chuyên)</option>
              <option value="good">Tốt (Theo kịp lớp bình thường)</option>
              <option value="average">Trung bình (Cần phụ đạo thêm kiến thức nền)</option>
              <option value="weak">Yếu / Mất gốc (Cần kèm 1-1 lấy lại căn bản)</option>
            </select>
          </div>

          {/* Nhận xét giáo viên */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Nhận xét của giáo viên đứng lớp về năng lực & thái độ
            </Label>
            <textarea
              rows={3}
              placeholder="VD: Bé tiếp thu tốt, hăng hái phát biểu nhưng tính toán còn ẩu, cần rèn luyện tính cẩn thận..."
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Phản hồi phụ huynh */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Phản hồi của học sinh & phụ huynh sau buổi học thử
            </Label>
            <textarea
              rows={2}
              placeholder="VD: Con về khen thầy cô giảng dễ hiểu, muốn tiếp tục đăng ký học chính thức..."
              value={parentFeedback}
              onChange={(e) => setParentFeedback(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Hướng xử lý */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
            <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Định hướng bước tiếp theo (Next Step)
            </Label>
            <select
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value as any)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="convert">🎯 Chuyển sang Ghi danh & Chốt cọc / Thu học phí</option>
              <option value="re_test">🔄 Học thử thêm buổi 2 / Kiểm tra lại</option>
              <option value="failed">❌ Thất bại (Không theo được / Phụ huynh từ chối)</option>
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Lưu đánh giá
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
