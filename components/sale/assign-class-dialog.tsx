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
import { BookOpen, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatVND } from "@/lib/utils/vietqr";

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

  const [selectedClassId, setSelectedClassId] = useState<string>(
    student?.targetClassId || (classes.length > 0 ? classes[0].id : "")
  );
  const [sessions, setSessions] = useState<number>(student?.paidSessions || 24);

  if (!student) return null;

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
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
              disabled={loading}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Chọn lớp..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name} ({formatVND(c.fee_per_session)}/buổi)
                  </SelectItem>
                ))}
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
