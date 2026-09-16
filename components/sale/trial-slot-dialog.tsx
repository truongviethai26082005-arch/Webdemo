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
import { createTrialSlot, CreateTrialSlotPayload } from "@/lib/actions/admissions";
import { Calendar, Loader2, AlertCircle } from "lucide-react";

interface TrialSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TrialSlotDialog({
  open,
  onOpenChange,
  onSuccess,
}: TrialSlotDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [room, setRoom] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Thứ 7 & Chủ Nhật");
  const [timeSlot, setTimeSlot] = useState("18:00 - 19:30");
  const [maxStudents, setMaxStudents] = useState("10");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setSubject("");
    setTeacherName("");
    setRoom("");
    setDayOfWeek("Thứ 7 & Chủ Nhật");
    setTimeSlot("18:00 - 19:30");
    setMaxStudents("10");
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !dayOfWeek.trim() || !timeSlot.trim()) {
      setError("Vui lòng nhập môn học, ngày trong tuần và khung giờ học thử");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: CreateTrialSlotPayload = {
        subject: subject.trim(),
        teacherName: teacherName.trim() || undefined,
        room: room.trim() || undefined,
        dayOfWeek: dayOfWeek.trim(),
        timeSlot: timeSlot.trim(),
        maxStudents: Number(maxStudents) || 10,
        note: note.trim() || undefined,
      };

      const res = await createTrialSlot(payload);

      // QUY TẮC BẮT BUỘC: Kiểm tra res?.error
      if (res?.error) {
        setError(res.error);
        return;
      }

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!loading) {
          if (!isOpen) resetForm();
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span>Tạo Ca Học Thử Cố Định Mới</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Thiết lập ca học thử định kỳ theo tuần để xếp lịch cho các Lead quan tâm.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-xs font-semibold">
              Môn học / Lớp học thử <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="VD: Toán 9 Nâng Cao, Tiếng Anh Giao Tiếp..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacherName" className="text-xs font-semibold">
                Giáo viên phụ trách
              </Label>
              <Input
                id="teacherName"
                placeholder="Thầy/Cô..."
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room" className="text-xs font-semibold">
                Phòng học
              </Label>
              <Input
                id="room"
                placeholder="P.201, Online Zoom..."
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek" className="text-xs font-semibold">
                Ngày trong tuần <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dayOfWeek"
                placeholder="Thứ 3 &amp; Thứ 5, Thứ 7..."
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeSlot" className="text-xs font-semibold">
                Khung giờ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="timeSlot"
                placeholder="18:00 - 19:30"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents" className="text-xs font-semibold">
              Sĩ số tối đa mỗi đợt
            </Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="50"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-semibold">
              Ghi chú thêm
            </Label>
            <Textarea
              id="note"
              placeholder="Yêu cầu mang theo sách vở, bài test kiểm tra đầu vào..."
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2 pt-3">
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
              Tạo ca học thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
