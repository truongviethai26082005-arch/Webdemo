"use client";

import { useState, useMemo } from "react";
import { StudentScheduleItem } from "@/lib/actions/student";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  GraduationCap,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleClientProps {
  initialSessions: StudentScheduleItem[];
}

type ViewMode = "month" | "week";

const DAY_HEADERS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

export function ScheduleClient({ initialSessions }: ScheduleClientProps) {
  // Trạng thái ngày đang xem (mặc định hôm nay)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedSession, setSelectedSession] = useState<StudentScheduleItem | null>(null);

  // Ngày hôm nay theo giờ VN dạng YYYY-MM-DD
  const todayStr = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  }, []);

  // Map các buổi học theo ngày (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, StudentScheduleItem[]>();
    for (const session of initialSessions) {
      const list = map.get(session.session_date) || [];
      list.push(session);
      map.set(session.session_date, list);
    }
    // Sắp xếp các buổi trong cùng ngày theo giờ bắt đầu
    map.forEach((list) => {
      list.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
    });
    return map;
  }, [initialSessions]);

  // Điều hướng thời gian
  function handlePrev() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(next.getMonth() - 1);
      } else {
        next.setDate(next.getDate() - 7);
      }
      return next;
    });
  }

  function handleNext() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(next.getMonth() + 1);
      } else {
        next.setDate(next.getDate() + 7);
      }
      return next;
    });
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  // Tiêu đề tháng năm ở giữa toolbar (VD: "tháng 9 năm 2026")
  const toolbarTitle = useMemo(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return `tháng ${month} năm ${year}`;
  }, [currentDate]);

  // Danh sách các ngày hiển thị trên lưới tháng (bắt đầu từ Thứ 2)
  const monthCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    // getDay: 0 là CN, 1 là T2, ..., 6 là T7
    // Trong lịch bắt đầu từ Thứ 2: Thứ 2 là 0, CN là 6
    const startDayIndex = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Các ngày thuộc tháng trước (làm mờ)
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateString = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
      });
    }

    // Các ngày thuộc tháng hiện tại
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Các ngày thuộc tháng sau để đủ số hàng của lưới (bội số của 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
      });
    }

    return days;
  }, [currentDate, todayStr]);

  // Danh sách 7 ngày trong tuần cho chế độ xem Tuần
  const weekCalendarDays = useMemo(() => {
    const day = currentDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dateNum = d.getDate();
      const dateString = `${y}-${String(m).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;

      days.push({
        dayNumber: dateNum,
        dateString,
        dayLabel: DAY_HEADERS[i],
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        isToday: dateString === todayStr,
      });
    }
    return days;
  }, [currentDate, todayStr]);

  // Cắt chuỗi giờ hiển thị dạng HH:mm
  function formatTime(timeStr?: string | null) {
    if (!timeStr) return "--:--";
    return timeStr.slice(0, 5);
  }

  // Kiểu hiển thị badge buổi học theo trạng thái
  function getBadgeStyle(session: StudentScheduleItem) {
    if (session.attendance_status === "present") {
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (session.attendance_status === "absent_excused") {
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    }
    if (session.attendance_status === "absent_unexcused") {
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    }
    if (session.session_status === "cancelled") {
      return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
    if (session.session_date < todayStr || session.session_status === "completed") {
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
    return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
  }

  function getStatusLabel(session: StudentScheduleItem) {
    if (session.attendance_status === "present") return "Đã tham gia";
    if (session.attendance_status === "absent_excused") return "Nghỉ có phép";
    if (session.attendance_status === "absent_unexcused") return "Vắng mặt";
    if (session.session_status === "cancelled") return "Đã hủy";
    if (session.session_date < todayStr || session.session_status === "completed") return "Đã kết thúc";
    return "Sắp diễn ra";
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. HEADER TOOLBAR */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Nút điều hướng tháng & nút Hôm nay */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Tháng trước"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-border flex items-center justify-center text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Tháng sau"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-border flex items-center justify-center text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
          >
            Hôm nay
          </button>
        </div>

        {/* Tiêu đề tháng năm ở giữa (VD: "tháng 9 năm 2026") */}
        <div className="text-base sm:text-lg font-black text-foreground text-center capitalize tracking-tight">
          {toolbarTitle}
        </div>

        {/* Bộ chọn chế độ bên phải: nút Tháng | Tuần */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-muted rounded-xl border border-slate-200/80 dark:border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-lg transition-all",
              viewMode === "month"
                ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            Tháng
          </button>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-lg transition-all",
              viewMode === "week"
                ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* 2. CHẾ ĐỘ XEM LƯỚI THÁNG (MONTH VIEW) */}
      {viewMode === "month" && (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-xs overflow-hidden">
          {/* Hàng tiêu đề các thứ (nền xám đậm bg-slate-500, chữ trắng) */}
          <div className="grid grid-cols-7 bg-slate-500 dark:bg-slate-700 text-white border-b border-slate-400 dark:border-slate-600">
            {DAY_HEADERS.map((dayName) => (
              <div
                key={dayName}
                className="py-2.5 text-center text-xs font-bold uppercase tracking-wider"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Lưới ngày 7 cột */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/70 dark:divide-border/60">
            {monthCalendarDays.map((day, idx) => {
              const daySessions = sessionsByDate.get(day.dateString) || [];

              return (
                <div
                  key={`${day.dateString}-${idx}`}
                  className={cn(
                    "min-h-[105px] md:min-h-[115px] p-2 transition-colors flex flex-col justify-between",
                    !day.isCurrentMonth && "bg-slate-50/60 dark:bg-muted/20 opacity-40 text-slate-400",
                    day.isCurrentMonth && "bg-white dark:bg-card",
                    day.isToday && "bg-blue-50/70 dark:bg-blue-950/30"
                  )}
                >
                  {/* Số ngày nằm ở góc trên của từng ô */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                        day.isToday
                          ? "bg-blue-600 text-white shadow-2xs font-extrabold"
                          : day.isCurrentMonth
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400"
                      )}
                    >
                      {day.dayNumber}
                    </span>
                    {daySessions.length > 0 && day.isCurrentMonth && (
                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                        {daySessions.length} buổi
                      </span>
                    )}
                  </div>

                  {/* Thanh badge nhỏ hiển thị: [Giờ] - [Tên lớp] */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[75px] scrollbar-none">
                    {daySessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setSelectedSession(session)}
                        title={`${formatTime(session.start_time)} - ${session.class_name} (${getStatusLabel(session)})`}
                        className={cn(
                          "w-full text-left px-1.5 py-0.5 rounded text-[11px] font-semibold border truncate block transition-transform hover:scale-[1.02] active:scale-95 shadow-2xs",
                          getBadgeStyle(session)
                        )}
                      >
                        <span className="font-bold mr-1">
                          {formatTime(session.start_time)}
                        </span>
                        <span>- {session.class_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CHẾ ĐỘ XEM LƯỚI TUẦN (WEEK VIEW) */}
      {viewMode === "week" && (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-xs overflow-hidden">
          {/* Hàng tiêu đề 7 ngày trong tuần */}
          <div className="grid grid-cols-7 bg-slate-500 dark:bg-slate-700 text-white border-b border-slate-400 dark:border-slate-600">
            {weekCalendarDays.map((day) => (
              <div key={day.dateString} className="py-2.5 px-1 text-center">
                <div className="text-xs font-bold uppercase tracking-wider">
                  {day.dayLabel}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {day.dayNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Lưới 7 cột chi tiết ngày trong tuần */}
          <div className="grid grid-cols-7 divide-x divide-slate-200/70 dark:divide-border/60 min-h-[360px]">
            {weekCalendarDays.map((day) => {
              const daySessions = sessionsByDate.get(day.dateString) || [];

              return (
                <div
                  key={day.dateString}
                  className={cn(
                    "p-2.5 flex flex-col gap-2 transition-colors",
                    day.isToday && "bg-blue-50/60 dark:bg-blue-950/20"
                  )}
                >
                  <div className="text-center pb-1 border-b border-slate-100 dark:border-border/60">
                    <span
                      className={cn(
                        "text-xs font-extrabold px-2 py-0.5 rounded-full inline-block",
                        day.isToday
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-muted-foreground"
                      )}
                    >
                      {day.dateString.slice(8, 10)}/{day.dateString.slice(5, 7)}
                    </span>
                  </div>

                  {/* Danh sách buổi học trong ngày */}
                  <div className="space-y-2 flex-1">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={cn(
                          "p-2 rounded-xl border cursor-pointer hover:shadow-xs transition-all space-y-1 text-xs",
                          getBadgeStyle(session)
                        )}
                      >
                        <div className="font-black flex items-center justify-between">
                          <span>
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </span>
                        </div>
                        <div className="font-bold truncate" title={session.class_name}>
                          {session.class_name}
                        </div>
                        {session.room && (
                          <div className="text-[10px] opacity-85 truncate">
                            P: {session.room}
                          </div>
                        )}
                        <div className="text-[10px] font-bold uppercase tracking-wider pt-0.5">
                          {getStatusLabel(session)}
                        </div>
                      </div>
                    ))}

                    {daySessions.length === 0 && (
                      <div className="h-20 flex items-center justify-center text-[11px] text-slate-300 dark:text-muted-foreground/40 italic text-center">
                        Không có lịch
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DIALOG XEM CHI TIẾT BUỔI HỌC KHI NHẤP VÀO BADGE */}
      <Dialog
        open={Boolean(selectedSession)}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      >
        {selectedSession && (
          <DialogContent className="max-w-md bg-white dark:bg-card rounded-2xl border border-slate-200 p-6 shadow-2xl">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {selectedSession.class_name}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chi tiết thông tin buổi học
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 pt-2 text-xs">
              {/* Ngày và giờ */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                <div className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span>Ngày học:</span>
                </div>
                <span className="font-bold text-foreground">
                  {selectedSession.session_date}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                <div className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Khung giờ:</span>
                </div>
                <span className="font-bold text-foreground">
                  {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                </span>
              </div>

              {/* Giáo viên */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                <div className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Giáo viên:</span>
                </div>
                <span className="font-bold text-foreground">
                  {selectedSession.teacher_name || "Chưa xếp giáo viên"}
                </span>
              </div>

              {/* Phòng học */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                <div className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground">
                  <DoorOpen className="w-4 h-4 text-blue-600" />
                  <span>Phòng học:</span>
                </div>
                <span className="font-bold text-foreground">
                  {selectedSession.room || "Học trực tiếp tại trung tâm"}
                </span>
              </div>

              {/* Trạng thái */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                <span className="text-slate-600 dark:text-muted-foreground">Trạng thái:</span>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full font-bold text-[11px] border",
                    getBadgeStyle(selectedSession)
                  )}
                >
                  {getStatusLabel(selectedSession)}
                </span>
              </div>

              {/* Ghi chú nếu có */}
              {selectedSession.note && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                  <div className="text-muted-foreground font-semibold mb-0.5">Ghi chú:</div>
                  <div className="text-foreground">{selectedSession.note}</div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
