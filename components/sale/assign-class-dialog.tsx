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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class } from "@/types/database";
import { WaitingListStudentItem, assignWaitingStudentToClass } from "@/lib/actions/admissions";
import { BookOpen, Loader2, AlertCircle, CheckCircle2, Copy, Check, Lightbulb } from "lucide-react";
import { formatVND } from "@/lib/utils/vietqr";
import { getCourseSuggestion, isClassNameMatchingSuggestion } from "@/lib/utils/admissions-course-suggestion";

interface AssignClassDialogProps {
  student: WaitingListStudentItem | null;
  classes: Class[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignClassDialog({
  student,
  classes,
  open,
  onOpenChange,
  onSuccess,
}: AssignClassDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{ email: string; password: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  // KHÔNG tự chọn sẵn lớp đầu tiên trong danh sách — bắt buộc Sale tự chọn
  // đúng lớp thật (đúng nguyên tắc AGENTS.md Mục 11.1, tránh gán nhầm học
  // sinh vào lớp/môn không liên quan).
  const [selectedClassId, setSelectedClassId] = useState<string>(student?.targetClassId || "");
  const [sessions, setSessions] = useState<number>(student?.paidSessions || 24);

  if (!student) return null;

  // Gợi ý lớp phù hợp theo kết quả "test đầu vào" đã chấm lúc học thử — chỉ
  // tham khảo, không tự chọn thay Sale (đồng bộ đúng logic đã dùng ở
  // conversion-checkout-modal.tsx cho tính nhất quán toàn phân hệ).
  const courseSuggestion = getCourseSuggestion(student.trialResult);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      setError("Vui lòng chọn lớp học để gán");
      return;
    }

    if (sessions <= 0) {
      setError("Số buổi học phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await assignWaitingStudentToClass(
        student.studentId,
        selectedClassId,
        sessions,
        student.leadId
      );

      // BẮT BUỘC: Kiểm tra res?.error
      if (res?.error) {
        setError(res.error);
        return;
      }

      // Nếu hệ thống vừa tự cấp tài khoản đăng nhập (đủ 3 điều kiện: đã chốt
      // học, đã thanh toán từ trước, và VỪA xếp lớp xong), hiện mật khẩu 1
      // lần để Sale sao chép trước khi đóng.
      if (res.accountCreated && res.accountEmail && res.accountPassword) {
        setCreatedAccount({ email: res.accountEmail, password: res.accountPassword });
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

  const handleFinish = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCopyCredentials = async () => {
    if (!createdAccount) return;
    try {
      await navigator.clipboard.writeText(
        `Email: ${createdAccount.email}\nMật khẩu: ${createdAccount.password}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard — Sale tự bôi đen copy tay.
    }
  };

  if (createdAccount) {
    return (
      <Dialog open={open} onOpenChange={handleFinish}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Đã xếp lớp &amp; tự động cấp tài khoản</span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Học sinh nay đã đủ điều kiện (đã chốt học, đã thanh toán, đã xếp lớp) — hệ thống tự
              tạo tài khoản đăng nhập. Sao chép thông tin dưới đây để gửi phụ huynh trước khi đóng.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email đăng nhập:</span>
              <span className="font-mono font-bold text-foreground">{createdAccount.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mật khẩu:</span>
              <span className="font-mono font-bold text-foreground">{createdAccount.password}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full text-xs font-bold gap-1.5"
            onClick={handleCopyCredentials}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Đã sao chép" : "Sao chép Email & Mật khẩu"}
          </Button>

          <DialogFooter className="pt-1">
            <Button type="button" className="w-full text-xs font-bold" onClick={handleFinish}>
              Đã lưu lại, đóng cửa sổ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>Xếp Lớp Chính Thức Cho Học Sinh</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Học sinh: <strong className="text-foreground">{student.fullName}</strong> • Đã đóng{" "}
            <strong className="text-emerald-600">{formatVND(student.paidAmount)}</strong> ({student.paidSessions} buổi)
          </DialogDescription>
          {(student.courseInterest || student.targetClassName) && (
            <div className="text-[11px] text-amber-700 dark:text-amber-400 p-2 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-900/40">
              {student.courseInterest && (
                <div>
                  Môn Lead từng quan tâm lúc tiếp nhận: <strong>{student.courseInterest}</strong>
                </div>
              )}
              {student.targetClassName && (
                <div>
                  Lớp đã ghi nhận lúc chốt đơn: <strong>{student.targetClassName}</strong>
                </div>
              )}
              <div className="mt-0.5">Đối chiếu trước khi chọn lớp bên dưới.</div>
            </div>
          )}
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Chọn lớp học chính thức</Label>
            {courseSuggestion && (
              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-400">
                <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Gợi ý theo kết quả học thử: <strong>{courseSuggestion.label}</strong> (lớp đánh
                  dấu ⭐ khớp môn quan tâm + mức độ gợi ý — chỉ tham khảo).
                </span>
              </div>
            )}
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
              disabled={loading}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Chọn lớp..." />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {classes.map((c) => {
                  const isSuggested = isClassNameMatchingSuggestion(
                    c.name,
                    courseSuggestion,
                    student.courseInterest
                  );
                  return (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {isSuggested && "⭐ "}
                      {c.name} ({formatVND(c.fee_per_session)}/buổi)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignSessions" className="text-xs font-semibold">
              Số buổi nạp vào lớp
            </Label>
            <Input
              id="assignSessions"
              type="number"
              min="1"
              max="150"
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value) || 1)}
              disabled={loading}
              className="text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Mặc định lấy theo số buổi học sinh đã thanh toán trên hóa đơn.
            </p>
          </div>

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
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Xác nhận xếp lớp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
