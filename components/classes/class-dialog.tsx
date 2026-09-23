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
import { useEduStore } from "@/lib/store/use-edu-store";
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

function addTwoHours(timeStr: string): string {
  if (!timeStr || !timeStr.includes(":")) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return "";
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return "";

  const newHours = (hours + 2) % 24;
  return `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function calculatePlannedSessions(daysCount: number, months: number | ""): number {
  if (daysCount === 0 || !months || Number(months) <= 0) {
    return 0;
  }
  return daysCount * Number(months) * 4;
}

function computeProjectedEndDate(
  startDateStr: string,
  selectedDays: string[],
  totalSessions: number
): string {
  // Điều kiện 1: Có ít nhất 1 thứ được chọn trong tuần
  if (!selectedDays || selectedDays.length === 0) {
    return "";
  }
  // Điều kiện 3: Tổng số buổi tính ra phải > 0
  if (!totalSessions || totalSessions <= 0) {
    return "";
  }
  // Kiểm tra ngày khai giảng hợp lệ
  if (!startDateStr) {
    return "";
  }
  const parts = startDateStr.split("-");
  if (parts.length !== 3) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return "";

  const currentDate = new Date(year, month, day);
  const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const startDayId = map[currentDate.getDay()];

  // Điều kiện 2: Ngày khai giảng hợp lệ (phải rơi đúng vào một trong các thứ đã chọn)
  if (!selectedDays.includes(startDayId)) {
    return "";
  }

  // Buổi 1 là chính ngày khai giảng
  let sessionCount = 1;
  let safetyLoop = 0;

  // Duyệt tịnh tiến các ngày tiếp theo trùng với các thứ trong lịch học tuần cho đến khi đạt đúng số buổi totalSessions
  while (sessionCount < totalSessions && safetyLoop < 3000) {
    currentDate.setDate(currentDate.getDate() + 1);
    safetyLoop++;
    const currentDayId = map[currentDate.getDay()];
    if (selectedDays.includes(currentDayId)) {
      sessionCount++;
    }
  }

  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth() + 1).padStart(2, "0");
  const d = String(currentDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ClassDialog({
  isOpen,
  onClose,
  teachers,
  existingClasses = [],
  editingClass,
  onSaved,
}: ClassDialogProps) {
  const { addClass } = useEduStore();

  // Form fields
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [feePerSession, setFeePerSession] = useState(150000);
  const [feeInput, setFeeInput] = useState("150.000");
  const [maxStudents, setMaxStudents] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");

  // Course Duration fields
  const [durationMonths, setDurationMonths] = useState<number | "">("");
  const [durationPreset, setDurationPreset] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totalPlannedSessions, setTotalPlannedSessions] = useState<number | "">("");
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  // Schedule fields
  const [selectedDays, setSelectedDays] = useState<string[]>(["T2", "T4"]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");

  // State & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [totalPlannedSessionsError, setTotalPlannedSessionsError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    if (editingClass) {
      setName(editingClass.name || "");
      setRoom(editingClass.room || "");
      setTeacherId(editingClass.teacher_id || editingClass.teacher?.id || "");
      const fee = editingClass.fee_per_session || editingClass.feePerSession || 0;
      setFeePerSession(fee);
      setFeeInput(fee > 0 ? new Intl.NumberFormat("vi-VN").format(fee) : "");
      const initMax = editingClass.max_students ?? editingClass.maxCapacity;
      setMaxStudents(initMax !== undefined && initMax !== null ? initMax : "");
      
      const initStartDate = editingClass.startDate || editingClass.start_date || today;
      setStartDate(initStartDate);

      const months = editingClass.durationMonths || editingClass.duration_months;
      if (months) {
        setDurationMonths(months);
        if ([1, 3, 5].includes(Number(months))) {
          setDurationPreset(String(months));
        } else {
          setDurationPreset("custom");
        }
      } else {
        setDurationMonths("");
        setDurationPreset("");
      }

      setEndDate(editingClass.endDate || editingClass.end_date || "");
      const planned = editingClass.totalPlannedSessions ?? editingClass.total_planned_sessions;
      setTotalPlannedSessions(planned !== undefined && planned !== null && planned !== "" ? Number(planned) : "");
      setCompletedSessions(editingClass.completedSessions ?? editingClass.completed_sessions ?? 0);

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
        setEndTime("20:00");
      }
    } else {
      // Default new form state
      setName("");
      setRoom("");
      setTeacherId("");
      setFeePerSession(150000);
      setFeeInput("150.000");
      setMaxStudents("");
      setStartDate(today);
      setSelectedDays(["T2", "T4"]);
      setStartTime("18:00");
      setEndTime("20:00");
      setDurationMonths("");
      setDurationPreset("");
      setTotalPlannedSessions(0);
      setCompletedSessions(0);
      setEndDate("");
    }

    // Reset errors
    setError(null);
    setNameError(null);
    setTeacherError(null);
    setScheduleError(null);
    setStartDateError(null);
    setTotalPlannedSessionsError(null);
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
    let nextDays: string[];
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) {
        setScheduleError("Lớp học phải có ít nhất 1 buổi trong tuần.");
        return;
      }
      nextDays = selectedDays.filter((d) => d !== dayId);
    } else {
      nextDays = [...selectedDays, dayId];
    }
    setSelectedDays(nextDays);

    // Tự động cập nhật tổng số buổi cả khóa: (số lượng thứ được chọn) * (số tháng) * 4
    const newTotal = calculatePlannedSessions(nextDays.length, durationMonths);
    setTotalPlannedSessions(newTotal);
    if (newTotal > 0) setTotalPlannedSessionsError(null);
  }

  // Tự động tính Giờ kết thúc theo Giờ bắt đầu (Cố định 2 tiếng)
  function handleStartTimeChange(newStart: string) {
    setStartTime(newStart);
    setScheduleError(null);
    if (!newStart) {
      setEndTime("");
    } else {
      setEndTime(addTwoHours(newStart));
    }
  }

  // Tự động tính Ngày bế giảng (Dự kiến):
  // Điều kiện bắt buộc: (1) >= 1 thứ được chọn; (2) Ngày khai giảng hợp lệ; (3) totalSessions > 0
  useEffect(() => {
    const total = typeof totalPlannedSessions === "number" ? totalPlannedSessions : parseInt(String(totalPlannedSessions), 10);
    const hasSessions = !isNaN(total) && total > 0;
    const startDayId = getDayIdFromIsoDate(startDate);
    const isStartDateValid = Boolean(startDate && startDayId && selectedDays.includes(startDayId));

    if (selectedDays.length > 0 && isStartDateValid && hasSessions) {
      setEndDate(computeProjectedEndDate(startDate, selectedDays, total));
    } else {
      setEndDate("");
    }
  }, [startDate, selectedDays, totalPlannedSessions]);

  // Handle Duration Preset selection
  function handlePresetChange(val: string) {
    setDurationPreset(val);
    if (val === "") {
      setDurationMonths("");
      const newTotal = calculatePlannedSessions(selectedDays.length, "");
      setTotalPlannedSessions(newTotal);
      setMaxStudents("");
    } else if (val === "1") {
      setDurationMonths(1);
      const newTotal = calculatePlannedSessions(selectedDays.length, 1);
      setTotalPlannedSessions(newTotal);
      if (newTotal > 0) setTotalPlannedSessionsError(null);
      // Quy ước "1 tháng (Luyện thi cấp tốc)": Sĩ số tối đa = 20
      setMaxStudents(20);
    } else if (val === "3") {
      setDurationMonths(3);
      const newTotal = calculatePlannedSessions(selectedDays.length, 3);
      setTotalPlannedSessions(newTotal);
      if (newTotal > 0) setTotalPlannedSessionsError(null);
      // Quy ước "3 tháng (Cơ bản / Tiêu chuẩn)": Sĩ số tối đa = 30
      setMaxStudents(30);
    } else if (val === "5") {
      setDurationMonths(5);
      const newTotal = calculatePlannedSessions(selectedDays.length, 5);
      setTotalPlannedSessions(newTotal);
      if (newTotal > 0) setTotalPlannedSessionsError(null);
      // Quy ước "5 tháng (Nâng cao / Chuyên sâu)": Sĩ số tối đa = 10
      setMaxStudents(10);
    } else if (val === "custom") {
      // "Tùy chỉnh số tháng...": Để trống ô sĩ số để Admin tự gõ, KHÔNG tự ý điền số mặc định
      setMaxStudents("");
      const monthsVal = durationMonths && Number(durationMonths) > 0 ? Number(durationMonths) : "";
      const newTotal = calculatePlannedSessions(selectedDays.length, monthsVal);
      setTotalPlannedSessions(newTotal);
      if (newTotal > 0) setTotalPlannedSessionsError(null);
    }
  }

  // Handle custom months input
  function handleCustomMonthsChange(val: number) {
    const validVal = isNaN(val) || val <= 0 ? "" : Math.max(1, Math.min(36, val));
    setDurationMonths(validVal);
    const newTotal = calculatePlannedSessions(selectedDays.length, validVal);
    setTotalPlannedSessions(newTotal);
    if (newTotal > 0) setTotalPlannedSessionsError(null);
  }

  // Dòng tóm tắt tổng hợp duy nhất cho khóa học
  const summaryParts = useMemo(() => {
    const parts: string[] = [];

    // 1. Thứ trong tuần
    if (selectedDays.length > 0) {
      parts.push(
        selectedDays.map((d) => WEEK_DAYS.find((w) => w.id === d)?.label).join(", ")
      );
    }

    // 2. Khung giờ
    if (startTime && endTime) {
      parts.push(`${startTime} - ${endTime}`);
    }

    // 3. Thời lượng khóa học & Tổng số buổi (Dự kiến)
    const hasPlannedSessions = totalPlannedSessions !== "" && Number(totalPlannedSessions) > 0;
    if (durationMonths && hasPlannedSessions) {
      parts.push(`${durationMonths} tháng (${totalPlannedSessions} buổi)`);
    } else if (durationMonths) {
      parts.push(`${durationMonths} tháng`);
    } else if (hasPlannedSessions) {
      parts.push(`${totalPlannedSessions} buổi`);
    }

    // 4. Ngày khai giảng & Ngày bế giảng (Dự kiến)
    if (startDate && endDate) {
      parts.push(`${startDate} ➔ ${endDate}`);
    } else if (startDate) {
      parts.push(`Khai giảng: ${startDate}`);
    }

    return parts;
  }, [selectedDays, startTime, endTime, durationMonths, totalPlannedSessions, startDate, endDate]);

  // Submit Handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setTeacherError(null);
    setScheduleError(null);
    setTotalPlannedSessionsError(null);

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

    if (!startTime || !endTime) {
      setScheduleError("Vui lòng chọn giờ bắt đầu và giờ kết thúc.");
      hasError = true;
    } else if (startTime >= endTime) {
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

    if (totalPlannedSessions === "" || Number(totalPlannedSessions) <= 0 || isNaN(Number(totalPlannedSessions))) {
      setTotalPlannedSessionsError("Vui lòng nhập tổng số buổi dự kiến (> 0)");
      if (!conflictWarning) {
        setError("Vui lòng nhập tổng số buổi dự kiến (> 0)");
      }
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    const schedulePayload = selectedDays.map((day) => ({
      day,
      start_time: startTime,
      end_time: endTime,
    }));

    const finalEndDate = endDate || "";
    const today = new Date().toISOString().split("T")[0];
    const isCompleted =
      (finalEndDate && finalEndDate < today) ||
      (Number(totalPlannedSessions) > 0 && completedSessions >= Number(totalPlannedSessions));

    const normalizedMaxStudents =
      maxStudents !== "" && Number(maxStudents) > 0
        ? Number(maxStudents)
        : durationPreset === "1"
        ? 20
        : durationPreset === "3"
        ? 30
        : durationPreset === "5"
        ? 10
        : 20;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("room", room.trim());
    formData.append("teacher_id", teacherId);
    formData.append("fee_per_session", String(feePerSession));
    formData.append("max_students", String(normalizedMaxStudents));
    formData.append("start_date", startDate);
    formData.append("end_date", finalEndDate);
    formData.append("duration_months", durationMonths ? String(durationMonths) : "");
    formData.append("total_planned_sessions", String(totalPlannedSessions));
    formData.append("completed_sessions", String(editingClass ? (completedSessions || 0) : 0));
    formData.append("schedule", JSON.stringify(schedulePayload));

    let result;
    try {
      if (editingClass) {
        result = await updateClass(editingClass.id, formData);
      } else {
        result = await createClass(formData);
      }
    } catch (err: any) {
      console.error("Backend class sync error:", err);
      setError(err?.message || "Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    // Kiểm tra if (result?.error): hiển thị thông báo, KHÔNG đóng dialog, KHÔNG ghi dữ liệu giả
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const teacherObj = teachers.find((t) => t.id === teacherId);
    const scheduleDaysVi = selectedDays.map(getDayNameVi).join(", ");
    const scheduleText = `${scheduleDaysVi} (${startTime} - ${endTime})`;

    const savedClassItem = {
      id: result?.data?.id || editingClass?.id || `cls-${Date.now()}`,
      name: name.trim(),
      subject: name.includes("Toán")
        ? "Toán"
        : name.includes("Anh")
        ? "Tiếng Anh"
        : name.includes("Lý")
        ? "Vật lý"
        : name.includes("Văn")
        ? "Ngữ Văn"
        : "Toán 9",
      room: room.trim() || "P.201",
      teacher_id: teacherId,
      teacherName: teacherObj?.full_name || "Chưa phân công",
      teacher: teacherObj ? { id: teacherId, full_name: teacherObj.full_name, phone: teacherObj.phone } : undefined,
      fee_per_session: feePerSession,
      feePerSession: feePerSession,
      max_students: normalizedMaxStudents,
      maxStudents: normalizedMaxStudents,
      maxCapacity: normalizedMaxStudents,
      enrollment_count: editingClass?.enrollment_count || 0,
      currentStudents: editingClass?.currentStudents || 0,
      currentEnrolled: editingClass?.currentEnrolled || 0,
      status: isCompleted ? ("completed" as const) : ("active" as const),
      schedule: scheduleText,
      durationMonths: durationMonths ? Number(durationMonths) : undefined,
      startDate: startDate,
      endDate: finalEndDate,
      totalPlannedSessions: Number(totalPlannedSessions),
      completedSessions: editingClass ? (Number(completedSessions) || 0) : 0,
    };

    addClass(savedClassItem);
    setLoading(false);
    if (onSaved) onSaved(savedClassItem);
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

          {/* Khối 1: Thông tin cơ bản & Học phí */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            {/* Hàng 1: Tên Lớp Học (Bắt buộc) */}
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

            {/* Hàng 1: Phòng Học */}
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

            {/* Hàng 2: Giáo Viên Phụ Trách (Bắt buộc) */}
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

            {/* Hàng 2: Học Phí Mỗi Buổi */}
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

            {/* Hàng 3: Ngày Khai Giảng (Validate theo thứ trong lịch học) */}
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

            {/* Hàng 3: Ô trống bên cạnh cho thoáng giao diện */}
            <div className="hidden sm:block" />
          </div>

          {/* Khối 2: Lịch Học Hàng Tuần */}
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
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="h-8 text-xs rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Giờ kết thúc
                  </Label>
                  {startTime && endTime && (
                    <span className="text-[10px] text-primary font-bold">
                      +2 tiếng
                    </span>
                  )}
                </div>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-8 text-xs rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Khối 3: Thời Hạn & Kế Hoạch Khóa Học (Khu vực tự động tính toán) */}
          <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Thời hạn & Kế hoạch khóa học
              </span>
              <span className="text-[11px] text-muted-foreground">
                Khu vực tự động tính toán kế hoạch
              </span>
            </div>

            {/* Hàng 1: Thời lượng khóa học | Sĩ số tối đa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Thời lượng khóa học */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Thời lượng khóa học
                </Label>
                <div className="flex gap-1.5">
                  <select
                    value={durationPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chọn thời lượng khóa học --</option>
                    <option value="1">1 tháng (Luyện thi cấp tốc)</option>
                    <option value="3">3 tháng (Cơ bản / Tiêu chuẩn)</option>
                    <option value="5">5 tháng (Nâng cao / Chuyên sâu)</option>
                    <option value="custom">Tùy chỉnh số tháng...</option>
                  </select>
                  {durationPreset === "custom" && (
                    <div className="relative w-20">
                      <Input
                        type="number"
                        min="1"
                        max="36"
                        value={durationMonths}
                        onChange={(e) => handleCustomMonthsChange(parseInt(e.target.value, 10))}
                        className="h-9 text-xs rounded-xl font-mono font-bold pr-7"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-semibold">
                        th
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sĩ số tối đa */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span>Sĩ số tối đa</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={maxStudents}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMaxStudents("");
                    } else {
                      const num = parseInt(val, 10);
                      setMaxStudents(isNaN(num) ? "" : num);
                    }
                  }}
                  onBlur={() => {
                    if (maxStudents !== "") {
                      const n = Number(maxStudents);
                      if (n < 1) setMaxStudents(1);
                      else if (n > 100) setMaxStudents(100);
                    }
                  }}
                  className="h-9 text-xs rounded-xl font-mono font-bold"
                  placeholder={
                    durationPreset === "1"
                      ? "20"
                      : durationPreset === "3"
                      ? "30"
                      : durationPreset === "5"
                      ? "10"
                      : "Nhập sĩ số..."
                  }
                />
              </div>
            </div>

            {/* Hàng 2: Tổng số buổi cả khóa (Dự kiến) | Ngày bế giảng (Dự kiến) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
              {/* Tổng số buổi cả khóa (Dự kiến) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Tổng số buổi cả khóa (Dự kiến) <strong className="text-destructive">*</strong>
                  </Label>
                  {durationMonths && selectedDays.length > 0 ? (
                    <span className="text-[10px] text-muted-foreground">
                      {selectedDays.length} buổi/tuần × {durationMonths} th × 4
                    </span>
                  ) : null}
                </div>
                <Input
                  type="number"
                  min="0"
                  max="200"
                  value={totalPlannedSessions === "" ? "" : totalPlannedSessions}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === "" ? "" : parseInt(val, 10);
                    setTotalPlannedSessions(num);
                    if (num !== "" && num > 0) setTotalPlannedSessionsError(null);
                  }}
                  placeholder={
                    selectedDays.length === 0 || !durationMonths || Number(durationMonths) <= 0
                      ? "Chưa đủ dữ liệu để tính"
                      : "Nhập tổng số buổi..."
                  }
                  className={`h-9 text-xs rounded-xl font-mono font-bold ${
                    totalPlannedSessionsError ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {totalPlannedSessionsError && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {totalPlannedSessionsError}
                  </p>
                )}
              </div>

              {/* Ngày bế giảng (Dự kiến) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Ngày bế giảng (Dự kiến)
                  </Label>
                  {endDate ? (
                    <span className="text-[10px] text-primary font-bold">
                      Tự động tính ({totalPlannedSessions} buổi)
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Chưa đủ dữ liệu tính ngày bế giảng
                    </span>
                  )}
                </div>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs rounded-xl font-mono bg-background font-semibold"
                />
              </div>
            </div>
          </div>

          {/* DÒNG TÓM TẮT TỔNG HỢP DUY NHẤT (Ngay trên 2 nút Hủy / Tạo lớp) */}
          <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center justify-between text-xs gap-2 flex-wrap">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Tóm tắt khóa học:</span>
            </span>
            {summaryParts.length > 0 ? (
              <div className="font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                {summaryParts.map((part, index) => (
                  <span key={index} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-muted-foreground font-normal">•</span>}
                    <span
                      className={
                        index === 0
                          ? "text-primary"
                          : index === 1
                          ? "font-mono"
                          : index === 2
                          ? "text-foreground"
                          : "font-mono text-muted-foreground"
                      }
                    >
                      {part}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground italic text-[11px]">
                Chưa đủ thông tin để tóm tắt
              </span>
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
