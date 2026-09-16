"use client";

import { useState, useEffect, useMemo } from "react";
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
import { CalendarCheck, Sparkles, School, Clock, AlertTriangle, Users, CheckCircle2 } from "lucide-react";
import { Lead, TrialClass, DEFAULT_FIXED_TRIAL_SLOTS, FixedTrialSlot, isStudentInTrialSlot, TrialStatus, TrialRegistration } from "@/types/admissions";

interface ScheduleTrialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  classes: any[];
  teachers: any[];
  trials?: TrialClass[];
  defaultLeadId?: string;
  onScheduleTrial: (trial: TrialClass) => void;
}

export function ScheduleTrialDialog({
  isOpen,
  onClose,
  leads,
  classes,
  teachers,
  trials = [],
  defaultLeadId,
  onScheduleTrial,
}: ScheduleTrialDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [targetSubject, setTargetSubject] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Calculate real-time enrolled counts for fixed slots
  const slotOccupancy = useMemo(() => {
    const map: Record<string, number> = {};
    DEFAULT_FIXED_TRIAL_SLOTS.forEach((slot) => {
      const count = trials.filter((t) => isStudentInTrialSlot(t, slot)).length;
      map[slot.id] = count;
    });
    return map;
  }, [trials]);

  useEffect(() => {
    if (isOpen) {
      if (defaultLeadId) {
        const lead = leads.find((l) => l.id === defaultLeadId);
        if (lead) {
          setStudentName(lead.studentName);
          setParentPhone(lead.parentPhone);
          setTargetSubject(lead.targetSubject);
        } else {
          setStudentName("");
          setParentPhone("");
          setTargetSubject("");
        }
      } else {
        setStudentName("");
        setParentPhone("");
        setTargetSubject("");
      }
      setSelectedClassIds([DEFAULT_FIXED_TRIAL_SLOTS[0]?.id || ""]);
    }
  }, [isOpen, defaultLeadId, leads]);

  const handleToggleClass = (classId: string, isFull: boolean) => {
    if (isFull) return; // Nếu lớp đã đủ sĩ số thì chặn
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId) // Bỏ chọn nếu đã có
        : [...prev, classId]                   // Thêm vào danh sách nếu chưa có
    );
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!studentName.trim()) {
      alert("Vui lòng nhập Họ và tên học sinh!");
      return;
    }

    if (!parentPhone.trim()) {
      alert("Vui lòng nhập Số điện thoại liên hệ!");
      return;
    }

    if (selectedClassIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 lớp học thử!");
      return;
    }

    const chosenSlots = DEFAULT_FIXED_TRIAL_SLOTS.filter((s) =>
      selectedClassIds.includes(s.id)
    );

    const fullSlots = chosenSlots.filter(
      (s) => (slotOccupancy[s.id] || 0) >= s.maxCapacity
    );
    if (fullSlots.length > 0) {
      alert(
        `⚠️ Có lớp học thử đã hết chỗ: ${fullSlots.map((s) => s.className).join(", ")}. Vui lòng chọn ca học khác!`
      );
      return;
    }

    const lead = leads.find((l) => l.id === defaultLeadId);

    const registrations: TrialRegistration[] = chosenSlots.map((s) => ({
      trialClassId: s.id,
      className: s.className,
      schedule: s.dayTime,
      teacherName: s.teacherName,
      room: s.room,
      status: "scheduled" as TrialStatus,
    }));

    const primarySlot = chosenSlots[0];

    const newTrial: TrialClass = {
      id: `trial-${Date.now()}`,
      trialClassId: primarySlot?.id,
      trialRegistrations: registrations,
      leadId: lead?.id || `lead-${Date.now()}`,
      leadName: studentName.trim(),
      parentPhone: parentPhone.trim(),
      targetSubject: chosenSlots.map((s) => s.subject).join(" & "),
      className: chosenSlots.map((s) => s.className).join(" & "),
      teacherName: primarySlot?.teacherName || "Thầy cô bộ môn",
      trialDate: primarySlot?.trialDate || new Date().toISOString().split("T")[0],
      startTime: primarySlot?.startTime || "18:00",
      endTime: primarySlot?.endTime || "19:30",
      room: primarySlot?.room || "P.201",
      status: "scheduled",
      parentFeedback: notes.trim() || undefined,
    };

    onScheduleTrial(newTrial);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-base">
            <CalendarCheck className="w-5 h-5" />
            <DialogTitle className="text-base font-extrabold">
              Xếp Lịch Học Thử — Hỗ Trợ Đăng Ký Nhiều Ca
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Tích chọn một hoặc nhiều ca trải nghiệm cố định cho học sinh (Có kiểm soát sĩ số độc lập)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* 1. Nhập Tên & SĐT Học sinh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="VD: Trần Khánh Vy..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="tel"
                placeholder="VD: 0934567890..."
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* 2. Selector Ca học thử cố định dạng Checkbox [☑] */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Chọn các ca trải nghiệm cố định (Tích chọn nhiều môn)</span>
              <span className="text-[10px] text-muted-foreground font-normal">Đã chọn: {selectedClassIds.length} ca</span>
            </Label>

            <div className="space-y-2">
              {DEFAULT_FIXED_TRIAL_SLOTS.map((slot) => {
                const count = slotOccupancy[slot.id] || 0;
                const isFull = count >= slot.maxCapacity;
                const isChecked = selectedClassIds.includes(slot.id);

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleToggleClass(slot.id, isFull)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? isFull
                          ? "border-rose-500 bg-rose-500/10 opacity-70 cursor-not-allowed"
                          : "border-purple-600 bg-purple-500/10 shadow-xs"
                        : isFull
                        ? "border-rose-200 bg-rose-500/5 opacity-50 cursor-not-allowed"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isFull}
                          readOnly
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer pointer-events-none"
                        />
                        <div>
                          <div className="text-xs font-extrabold text-foreground">
                            {slot.className}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-0.5">
                            <span>🕒 {slot.dayTime}</span>
                            <span>•</span>
                            <span>GV: {slot.teacherName}</span>
                            <span>•</span>
                            <span>{slot.room}</span>
                          </div>
                        </div>
                      </div>

                      {/* Capacity Badge */}
                      <div className="text-right shrink-0">
                        {isFull ? (
                          <span className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Đã đủ chỗ ({count}/{slot.maxCapacity})
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-600" /> Còn chỗ ({count}/{slot.maxCapacity})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ghi chú & Yêu cầu của phụ huynh</Label>
            <textarea
              rows={2}
              placeholder="VD: Gia đình muốn quan sát bài test của con ở cả 2 môn..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 font-medium"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 font-semibold text-xs">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={selectedClassIds.length === 0}
              className="h-9 px-5 font-extrabold text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              Lưu {selectedClassIds.length} ca học thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
