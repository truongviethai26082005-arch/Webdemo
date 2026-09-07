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
import { CalendarCheck, Sparkles, School, Clock } from "lucide-react";
import { Lead, TrialClass } from "@/types/admissions";

interface ScheduleTrialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  classes: any[];
  teachers: any[];
  defaultLeadId?: string;
  onScheduleTrial: (trial: TrialClass) => void;
}

export function ScheduleTrialDialog({
  isOpen,
  onClose,
  leads,
  classes,
  teachers,
  defaultLeadId,
  onScheduleTrial,
}: ScheduleTrialDialogProps) {
  const [selectedLeadId, setSelectedLeadId] = useState(defaultLeadId || "");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [customClassName, setCustomClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [room, setRoom] = useState("Phòng 201");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (defaultLeadId) {
      setSelectedLeadId(defaultLeadId);
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }

    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
      setCustomClassName(classes[0].name);
      if (classes[0].room) setRoom(classes[0].room);
    }

    if (teachers.length > 0 && !teacherName) {
      setTeacherName(teachers[0].full_name);
    }

    // Default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTrialDate(tomorrow.toISOString().split("T")[0]);
  }, [defaultLeadId, leads, classes, teachers, selectedLeadId, selectedClassId, teacherName]);

  function handleClassChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedClassId(val);
    if (val === "custom_test") {
      setCustomClassName("Buổi Test Năng Lực 1-1");
    } else {
      const found = classes.find((c) => c.id === val);
      if (found) {
        setCustomClassName(found.name);
        if (found.room) setRoom(found.room);
        if (found.teacher?.full_name) setTeacherName(found.teacher.full_name);
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) {
      alert("Vui lòng chọn học viên tiềm năng!");
      return;
    }
    if (!trialDate) {
      alert("Vui lòng chọn ngày học thử!");
      return;
    }

    const newTrial: TrialClass = {
      id: `trial-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.studentName,
      parentPhone: lead.parentPhone,
      targetSubject: lead.targetSubject,
      classId: selectedClassId !== "custom_test" ? selectedClassId : undefined,
      className: customClassName || "Lớp học thử",
      teacherName: teacherName || "Thầy cô bộ môn",
      trialDate,
      startTime,
      endTime,
      room,
      status: "scheduled",
      parentFeedback: notes.trim() || undefined,
    };

    onScheduleTrial(newTrial);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <CalendarCheck className="w-5 h-5" />
            <span>Xếp Lịch Học Thử / Test Năng Lực Đầu Vào</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn lớp đang chạy hoặc ghép ca học thử, chỉ định giáo viên phụ trách
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Chọn Lead */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Học sinh đăng ký học thử</Label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.studentName} - [{l.targetSubject}] (PH: {l.parentName} - {l.parentPhone})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Lớp học */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Hình thức học thử & Lớp ghép</Label>
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="custom_test">⭐ Buổi Test Riêng 1-1 tại trung tâm</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp: {cls.name} (Phòng: {cls.room || "Chưa xếp"} - GV: {cls.teacher?.full_name || "Chưa phân công"})
                </option>
              ))}
            </select>
          </div>

          {/* Giáo viên & Phòng học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Giáo viên phụ trách test/dạy</Label>
              <Input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="VD: Thầy Dũng / Cô Mai"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phòng học / Địa điểm</Label>
              <Input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="VD: Phòng 201"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Ngày & Giờ học */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ngày học thử</Label>
              <Input
                type="date"
                required
                value={trialDate}
                onChange={(e) => setTrialDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Giờ bắt đầu</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Giờ kết thúc</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ghi chú & Yêu cầu của phụ huynh</Label>
            <textarea
              rows={2}
              placeholder="VD: Gia đình muốn cô quan sát thái độ làm bài hình học của con..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Xác nhận xếp lịch học thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
