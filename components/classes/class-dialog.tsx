"use client";

import { useState, useEffect, useMemo } from "react";
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
import { createClass, updateClass } from "@/lib/actions/classes";
import {
  BookOpen,
  Loader2,
  Calendar,
  Clock,
  Users,
  DoorOpen,
  GraduationCap,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: any[];
  existingClasses?: any[];
  editingClass?: any | null;
  onSaved?: (savedClass?: any) => void;
}

const WEEK_DAYS = [
  { id: "T2", label: "T2", fullLabel: "Thứ 2" },
  { id: "T3", label: "T3", fullLabel: "Thứ 3" },
  { id: "T4", label: "T4", fullLabel: "Thứ 4" },
  { id: "T5", label: "T5", fullLabel: "Thứ 5" },
  { id: "T6", label: "T6", fullLabel: "Thứ 6" },
  { id: "T7", label: "T7", fullLabel: "Thứ 7" },
  { id: "CN", label: "CN", fullLabel: "Chủ Nhật" },
];

function getDayIdFromIsoDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return map[date.getDay()];
  }
  return "";
}

function getDayNameVi(dayId: string): string {
  const map: Record<string, string> = {
    T2: "Thứ 2",
    T3: "Thứ 3",
    T4: "Thứ 4",
    T5: "Thứ 5",
    T6: "Thứ 6",
    T7: "Thứ 7",
    CN: "Chủ Nhật",
  };
  return map[dayId] || dayId;
}

export function ClassDialog({
  isOpen,
  onClose,
  teachers,
  existingClasses = [],
  editingClass,
  onSaved,
}: ClassDialogProps) {
  // Form fields
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [feePerSession, setFeePerSession] = useState(150000);
  const [feeInput, setFeeInput] = useState("150.000");
  const [maxStudents, setMaxStudents] = useState(15);
  const [startDate, setStartDate] = useState("");

  // Schedule fields
  const [selectedDays, setSelectedDays] = useState<string[]>(["T2", "T4"]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");

  // State & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    if (editingClass) {
      setName(editingClass.name || "");
      setRoom(editingClass.room || "");
      setTeacherId(editingClass.teacher_id || "");
      const fee = editingClass.fee_per_session || 0;
      setFeePerSession(fee);
      setFeeInput(fee > 0 ? new Intl.NumberFormat("vi-VN").format(fee) : "");
      setMaxStudents(editingClass.max_students || 15);
      setStartDate(editingClass.start_date || today);

      // Parse schedule if existing
      if (editingClass.schedule) {
        let scheduleArray: any[] = [];
        if (Array.isArray(editingClass.schedule)) {
          scheduleArray = editingClass.schedule;
        } else if (typeof editingClass.schedule === "string") {
          try {
            scheduleArray = JSON.parse(editingClass.schedule);
          } catch {
            scheduleArray = [];
          }
        }

        if (scheduleArray.length > 0) {
          const days = scheduleArray.map((s) => s.day || s).filter(Boolean);
          setSelectedDays(days);
          if (scheduleArray[0]?.start_time) setStartTime(scheduleArray[0].start_time);
          if (scheduleArray[0]?.end_time) setEndTime(scheduleArray[0].end_time);
        }
      } else {
        setSelectedDays(["T2", "T4"]);
        setStartTime("18:00");
        setEndTime("19:30");
      }
    } else {
      // Default new form state
      setName("");
      setRoom("");
      setTeacherId("");
      setFeePerSession(150000);
      setFeeInput("150.000");
      setMaxStudents(15);
      setStartDate(today);
      setSelectedDays(["T2", "T4"]);
      setStartTime("18:00");
      setEndTime("19:30");
    }

    // Reset errors
    setError(null);
    setNameError(null);
    setTeacherError(null);
    setScheduleError(null);
    setStartDateError(null);
  }, [editingClass, isOpen]);

  // Real-time Conflict Check
  const conflictWarning = useMemo(() => {
    if (!existingClasses || existingClasses.length === 0) return null;
    if (!selectedDays.length || !startTime || !endTime) return null;

    const cleanRoom = room.trim().toLowerCase();

    for (const cls of existingClasses) {
      if (editingClass && cls.id === editingClass.id) continue;

      let otherSchedule: any[] = [];
      if (Array.isArray(cls.schedule)) {
        otherSchedule = cls.schedule;
      } else if (typeof cls.schedule === "string") {
        try {
          otherSchedule = JSON.parse(cls.schedule);
        } catch {
          otherSchedule = [];
        }
      }
      if (!otherSchedule.length) continue;

      const isSameTeacher = teacherId && cls.teacher_id && cls.teacher_id === teacherId;
      const isSameRoom = cleanRoom && cls.room && cleanRoom === cls.room.trim().toLowerCase();

      if (!isSameTeacher && !isSameRoom) continue;

      for (const day of selectedDays) {
        for (const oldItem of otherSchedule) {
          if (oldItem.day === day) {
            const oldStart = oldItem.start_time || "18:00";
            const oldEnd = oldItem.end_time || "19:30";

            // Overlap: startTime < oldEnd && endTime > oldStart
            if (startTime < oldEnd && endTime > oldStart) {
              const dayText = getDayNameVi(day);
              if (isSameTeacher) {
                const teacherObj = teachers.find((t) => t.id === teacherId);
                const teacherName = teacherObj?.full_name || cls.teacher?.full_name || "Giáo viên";
                return `Giáo viên ${teacherName} đã có lịch học lớp "${cls.name}" vào ${dayText} (${oldStart} - ${oldEnd}). Vui lòng chọn lịch khác!`;
              }
              if (isSameRoom) {
                return `Phòng học "${cls.room}" đã có lịch học lớp "${cls.name}" vào ${dayText} (${oldStart} - ${oldEnd}). Vui lòng chọn phòng học hoặc lịch khác!`;
              }
            }
          }
        }
      }
    }

    return null;
  }, [existingClasses, editingClass, teacherId, room, selectedDays, startTime, endTime, teachers]);

  // Validate Start Date whenever startDate or selectedDays change
  useEffect(() => {
    if (!startDate || !selectedDays.length) {
      setStartDateError(null);
      return;
    }
    const dayId = getDayIdFromIsoDate(startDate);
    if (dayId && !selectedDays.includes(dayId)) {
      const dayVi = getDayNameVi(dayId);
      const scheduleDaysVi = selectedDays.map(getDayNameVi).join(", ");
      setStartDateError(
        `Ngày khai giảng (${startDate}) rơi vào ${dayVi}, không nằm trong các thứ của lịch học (${scheduleDaysVi}). Vui lòng chọn lại đúng ngày!`
      );
    } else {
      setStartDateError(null);
    }
  }, [startDate, selectedDays]);

  // Currency input handler
  function handleFeeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawNumbers = e.target.value.replace(/\D/g, "");
    if (!rawNumbers) {
      setFeePerSession(0);
      setFeeInput("");
      return;
    }
    const numericValue = parseInt(rawNumbers, 10);
    setFeePerSession(numericValue);
    setFeeInput(new Intl.NumberFormat("vi-VN").format(numericValue));
  }

  // Toggle Day selection
  function handleToggleDay(dayId: string) {
    setScheduleError(null);
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) {
        setScheduleError("Lớp học phải có ít nhất 1 buổi trong tuần.");
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  }

  // Submit Handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setTeacherError(null);
    setScheduleError(null);

    let hasError = false;

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên lớp học.");
      hasError = true;
    }

    if (!teacherId) {
      setTeacherError("Vui lòng chọn giáo viên phụ trách.");
      hasError = true;
    }

    if (selectedDays.length === 0) {
      setScheduleError("Vui lòng chọn ít nhất 1 thứ trong tuần.");
      hasError = true;
    }

    if (startTime >= endTime) {
      setScheduleError("Giờ bắt đầu phải trước giờ kết thúc.");
      hasError = true;
    }

    if (startDateError) {
      hasError = true;
    }

    if (conflictWarning) {
      setError(conflictWarning);
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    const schedulePayload = selectedDays.map((day) => ({
      day,
      start_time: startTime,
      end_time: endTime,
    }));

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("room", room.trim());
    formData.append("teacher_id", teacherId);
    formData.append("fee_per_session", String(feePerSession));
    formData.append("max_students", String(maxStudents || 15));
    formData.append("start_date", startDate);
    formData.append("schedule", JSON.stringify(schedulePayload));

    let result;
    if (editingClass) {
      result = await updateClass(editingClass.id, formData);
    } else {
      result = await createClass(formData);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      if (onSaved) onSaved(result.data);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card rounded-2xl p-6 shadow-xl border border-border/80 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingClass ? "Chỉnh Sửa Lớp Học" : "Tạo Lớp Học Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Thiết lập thông tin vận hành, giáo viên, phòng học và thời khóa biểu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Main Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Schedule Conflict Warning Alert */}
          {conflictWarning && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
              <div>
                <strong className="block font-bold">Cảnh báo trùng lịch ca học:</strong>
                <p className="mt-0.5 leading-relaxed">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* 2-Column Balanced Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            {/* 1. Tên Lớp Học (Bắt buộc) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Tên lớp học <strong className="text-destructive">*</strong>
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError(null);
                }}
                placeholder="VD: Toán 9 Nâng Cao - Ôn thi Chuyên"
                className={`h-9 text-xs rounded-xl ${
                  nameError ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {nameError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {nameError}
                </p>
              )}
            </div>

            {/* 2. Phòng Học */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <DoorOpen className="w-3 h-3 text-muted-foreground" />
                <span>Phòng học</span>
              </Label>
              <Input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="VD: Phòng 201 (Tầng 2)"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* 3. Giáo Viên Phụ Trách (Bắt buộc) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-muted-foreground" />
                <span>Giáo viên phụ trách <strong className="text-destructive">*</strong></span>
              </Label>
              <select
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  if (e.target.value) setTeacherError(null);
                }}
                className={`w-full h-9 px-3 rounded-xl border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                  teacherError ? "border-destructive" : "border-input"
                }`}
              >
                <option value="">-- Chọn giáo viên phụ trách --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.email || t.phone || "Giáo viên"})
                  </option>
                ))}
              </select>
              {teacherError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {teacherError}
                </p>
              )}
            </div>

            {/* 4. Học Phí Mỗi Buổi */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Coins className="w-3 h-3 text-muted-foreground" />
                <span>Học phí mỗi buổi (VNĐ)</span>
              </Label>
              <div className="relative">
                <Input
                  value={feeInput}
                  onChange={handleFeeChange}
                  placeholder="150.000"
                  className="h-9 text-xs rounded-xl font-mono pr-12 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold pointer-events-none">
                  đ
                </span>
              </div>
            </div>

            {/* 5. Sĩ Số Tối Đa */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span>Sĩ số tối đa</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxStudents}
                onChange={(e) => setMaxStudents(parseInt(e.target.value, 10) || 15)}
                className="h-9 text-xs rounded-xl font-mono font-bold"
                placeholder="15"
              />
            </div>

            {/* 6. Ngày Khai Giảng (Validate theo thứ trong lịch học) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>Ngày khai giảng <strong className="text-destructive">*</strong></span>
                </Label>
                {startDate && (
                  <span className="text-[10px] font-bold text-primary">
                    ({getDayNameVi(getDayIdFromIsoDate(startDate))})
                  </span>
                )}
              </div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`h-9 text-xs rounded-xl font-mono ${
                  startDateError ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {startDateError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1 leading-tight">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {startDateError}
                </p>
              )}
            </div>
          </div>

          {/* Lịch Học Hàng Tuần (Schedule) */}
          <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Lịch học hàng tuần
              </span>
              <span className="text-[11px] text-muted-foreground">
                Chọn các thứ và khung giờ học
              </span>
            </div>

            {/* Thứ trong tuần */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Thứ trong tuần:
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {WEEK_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => handleToggleDay(day.id)}
                      className={`h-8 px-3 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 scale-[1.02]"
                          : "bg-background border border-border text-foreground hover:bg-muted"
                      }`}
                      title={day.fullLabel}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {scheduleError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {scheduleError}
                </p>
              )}
            </div>

            {/* Khung giờ học */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Giờ bắt đầu
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-8 text-xs rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Giờ kết thúc
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-8 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Tóm tắt lịch học trực quan */}
            {selectedDays.length > 0 && (
              <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tóm tắt lịch:</span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="text-primary">
                    {selectedDays.map((d) => WEEK_DAYS.find((w) => w.id === d)?.label).join(", ")}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-muted-foreground">
                    {startTime} - {endTime}
                  </span>
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs rounded-xl h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || Boolean(conflictWarning) || Boolean(startDateError)}
              className="text-xs font-bold rounded-xl h-9 px-5 gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý dữ liệu...</span>
                </>
              ) : editingClass ? (
                "Lưu Thay Đổi"
              ) : (
                "Tạo Lớp Học"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
