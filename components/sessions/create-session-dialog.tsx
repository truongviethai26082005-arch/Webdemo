"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClassSession } from "@/lib/actions/sessions";
import { CalendarCheck, Loader2 } from "lucide-react";

interface CreateSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  teachers: any[];
  defaultClassId?: string;
}

export function CreateSessionDialog({
  isOpen,
  onClose,
  classes,
  teachers,
  defaultClassId,
}: CreateSessionDialogProps) {
  const [classId, setClassId] = useState(defaultClassId || "");
  const [teacherId, setTeacherId] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClassChange(newClassId: string) {
    setClassId(newClassId);
    const selectedClass = classes.find((c) => c.id === newClassId);
    if (selectedClass?.teacher_id) {
      setTeacherId(selectedClass.teacher_id);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("class_id", classId);
    formData.append("teacher_id", teacherId);
    formData.append("session_date", sessionDate);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    formData.append("note", note);
    formData.append("status", "completed");

    const result = await createClassSession(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Tạo Buổi Học Mới
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lên lịch buổi học để giáo viên tiến hành điểm danh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Chọn lớp học *</Label>
            <select
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.room || "Phòng chung"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Giáo viên đứng lớp</Label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.phone || t.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ngày học *</Label>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
              className="h-10 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Giờ bắt đầu</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Giờ kết thúc</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nội dung / Ghi chú bài học</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Bài 5 - Bất đẳng thức Cauchy"
              className="h-10"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !classId}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo buổi học"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
