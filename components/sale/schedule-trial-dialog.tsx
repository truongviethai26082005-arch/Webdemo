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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Lead, TrialSlot } from "@/types/database";
import { registerLeadTrials } from "@/lib/actions/admissions";
import { Calendar, Loader2, AlertCircle, Clock, MapPin } from "lucide-react";

interface ScheduleTrialDialogProps {
  lead: Lead | null;
  trialSlots: TrialSlot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScheduleTrialDialog({
  lead,
  trialSlots,
  open,
  onOpenChange,
  onSuccess,
}: ScheduleTrialDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [trialDate, setTrialDate] = useState("");

  if (!lead) return null;

  const handleToggleSlot = (id: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotIds.length === 0) {
      setError("Vui lòng tích chọn ít nhất một ca học thử phù hợp");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await registerLeadTrials(lead.id, selectedSlotIds, trialDate || undefined);

      if (res?.error) {
        setError(res.error);
        return;
      }

      setSelectedSlotIds([]);
      setTrialDate("");
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
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span>Xếp Lịch Học Thử Cho Học Sinh</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Học sinh: <strong className="text-foreground">{lead.full_name}</strong> • SĐT:{" "}
            {lead.phone} • Nhu cầu: {lead.course_interest || "Chưa rõ"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Ngày dự kiến bắt đầu học thử</Label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              value={trialDate}
              onChange={(e) => setTrialDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Chọn ca học thử có sẵn (Cho phép chọn nhiều ca) <span className="text-destructive">*</span>
            </Label>

            {trialSlots.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed text-center text-muted-foreground text-xs">
                Chưa có ca học thử nào đang mở. Vui lòng tạo ca học thử mới ở tab "Ca học thử".
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {trialSlots.map((slot) => {
                  const isChecked = selectedSlotIds.includes(slot.id);
                  const isFull = (slot.registered_count || 0) >= slot.max_students;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && handleToggleSlot(slot.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "border-primary bg-primary/5 shadow-xs"
                          : isFull
                          ? "opacity-60 bg-muted/30 border-border cursor-not-allowed"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      {/* Chỉ mang tính hiển thị — bấm chọn xử lý DUY NHẤT ở onClick của
                          div cha bên ngoài. Trước đây Checkbox có thêm onCheckedChange
                          gọi cùng 1 hàm, khi bấm đúng vào ô tick sẽ chạy 2 lần liên tiếp
                          (bật rồi tắt ngay lập tức) khiến không tick được. */}
                      <Checkbox
                        checked={isChecked}
                        disabled={isFull || loading}
                        className="mt-0.5 pointer-events-none"
                        tabIndex={-1}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{slot.subject}</span>
                          <Badge
                            variant={isFull ? "destructive" : "outline"}
                            className="text-[11px]"
                          >
                            {isFull ? "Đã kín chỗ" : `Đợt ${slot.batch_number}`}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            {slot.day_of_week} ({slot.time_slot})
                          </span>
                          {slot.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {slot.room}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground">
                            GV: {slot.teacher_name || "Chưa xếp GV"}
                          </span>
                          <span className="font-semibold text-foreground">
                            Sĩ số: {slot.registered_count || 0}/{slot.max_students}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            <Button
              type="submit"
              disabled={loading || selectedSlotIds.length === 0}
              className="text-xs font-bold gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Xác nhận xếp ca ({selectedSlotIds.length})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
