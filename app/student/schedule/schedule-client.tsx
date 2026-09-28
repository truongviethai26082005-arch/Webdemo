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
  Calendar as CalendarIcon,
  BookOpen,
  GraduationCap,
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

const DAY_HEADERS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

// Dữ liệu mẫu chuẩn ảnh cho Tháng 9 năm 2026 khi chưa có dữ liệu DB thật
const DEFAULT_DEMO_SESSIONS: StudentScheduleItem[] = [
  {
    id: "demo-session-13",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-13",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "completed",
    attendance_status: "present",
    note: "Unit 1: My New School - Từ vựng & Ngữ pháp căn bản",
  },
  {
    id: "demo-session-15",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-15",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "completed",
    attendance_status: "present",
    note: "Luyện phát âm & Kỹ năng Đọc hiểu",
  },
  {
    id: "demo-session-18",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-18",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "scheduled",
    note: "Buổi học tiếp theo: Thì hiện tại đơn & Bài tập vận dụng",
  },
  {
    id: "demo-session-20",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-20",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "scheduled",
    note: "Unit 2: My Friends - Kỹ năng Giao tiếp",
  },
  {
    id: "demo-session-22",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-22",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "scheduled",
    note: "Luyện tập ngữ pháp & kiểm tra 15 phút",
  },
  {
    id: "demo-session-25",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-25",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "scheduled",
    note: "Kỹ năng Viết đoạn văn & chữa bài tập về nhà",
  },
  {
    id: "demo-session-27",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-27",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "scheduled",
    note: "Luyện đề tổng hợp & củng cố từ vựng",
  },
  {
    id: "demo-session-29",
    class_id: "cls-ta6",
    class_name: "Tiếng Anh 6",
    room: "Phòng 201",
    teacher_name: "Thầy Nguyễn Văn An",
    session_date: "2026-09-29",
    start_time: "18:00:00",
    end_time: "19:30:00",
    session_status: "scheduled",
    note: "Ôn tập cuối tháng & hướng dẫn tự học tại nhà",
  },
];

export function ScheduleClient({ initialSessions }: ScheduleClientProps) {
  // Trạng thái ngày đang xem (mặc định hôm nay - Tháng 9/2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedSession, setSelectedSession] = useState<StudentScheduleItem | null>(null);

  // Danh sách buổi học hiệu dụng: nếu DB có dữ liệu thì dùng dữ liệu DB, nếu trống dùng demo chuẩn ảnh
  const effectiveSessions = useMemo(() => {
    if (initialSessions && initialSessions.length > 0) {
      return initialSessions;
    }
    return DEFAULT_DEMO_SESSIONS;
  }, [initialSessions]);

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
    for (const session of effectiveSessions) {
      const list = map.get(session.session_date) || [];
      list.push(session);
      map.set(session.session_date, list);
    }
    // Sắp xếp các buổi trong cùng ngày theo giờ bắt đầu
    map.forEach((list) => {
      list.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
    });
    return map;
  }, [effectiveSessions]);

  // Điều hướng tháng
  function handlePrev() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }

  function handleNext() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }

  // Tiêu đề tháng năm ở giữa toolbar (Chuẩn ảnh mẫu: "Tháng 9 năm 2026")
  const toolbarTitle = useMemo(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return `Tháng ${month} năm ${year}`;
  }, [currentDate]);

  // Tiền tố YYYY-MM của tháng đang xem
  const currentMonthPrefix = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [currentDate]);

  // Các buổi học thuộc tháng đang xem
  const monthSessions = useMemo(() => {
    return effectiveSessions.filter((s) => s.session_date.startsWith(currentMonthPrefix));
  }, [effectiveSessions, currentMonthPrefix]);

  // Thống kê 1: Tổng số buổi trong tháng này (Chuẩn ảnh mẫu: "8 buổi tháng này")
  const totalMonthSessions = monthSessions.length;

  // Thống kê 2: Buổi tiếp theo (Chuẩn ảnh mẫu: "Buổi tiếp theo: 18/09 - 18:00 >")
  const nextSession = useMemo(() => {
    const upcoming = effectiveSessions
      .filter((s) => s.session_date >= todayStr && s.session_status !== "cancelled")
      .sort((a, b) => {
        const d = a.session_date.localeCompare(b.session_date);
        if (d !== 0) return d;
        return (a.start_time || "").localeCompare(b.start_time || "");
      });
    return upcoming[0] || null;
  }, [effectiveSessions, todayStr]);

  const nextSessionFormatted = useMemo(() => {
    if (!nextSession) return "Chưa có lịch";
    const parts = nextSession.session_date.split("-");
    const d = parts[2] || "18";
    const m = parts[1] || "09";
    const time = nextSession.start_time ? nextSession.start_time.slice(0, 5) : "18:00";
    return `${d}/${m} - ${time}`;
  }, [nextSession]);

  // Thống kê 3: Đã học trong tháng (Chuẩn ảnh mẫu: "Đã học: 2 buổi")
  const attendedMonthSessions = useMemo(() => {
    return monthSessions.filter(
      (s) =>
        s.attendance_status === "present" ||
        s.session_status === "completed" ||
        (s.session_date < todayStr && s.session_status !== "cancelled")
    ).length;
  }, [monthSessions, todayStr]);

  // Danh sách các ngày hiển thị trên lưới tháng (bắt đầu từ Thứ 2)
  const monthCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
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

  // Format giờ hiển thị dạng HH:mm
  function formatTime(timeStr?: string | null) {
    if (!timeStr) return "--:--";
    return timeStr.slice(0, 5);
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
      {/* 1. TOP HEADER TOOLBAR BANNER (Chuẩn thiết kế ảnh mẫu) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#eef3fc] via-[#f0f4fd] to-[#f4f1fd] dark:from-card dark:via-card/90 dark:to-card border border-blue-100/70 dark:border-border p-4 sm:p-5 flex items-center justify-between shadow-xs relative overflow-hidden">
        {/* Nút điều hướng tháng trước / sau bên trái */}
        <div className="flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Tháng trước"
            className="w-9 h-9 rounded-full bg-white dark:bg-card shadow-xs border border-slate-100/90 dark:border-border flex items-center justify-center text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Tháng sau"
            className="w-9 h-9 rounded-full bg-white dark:bg-card shadow-xs border border-slate-100/90 dark:border-border flex items-center justify-center text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tiêu đề tháng năm ở giữa: Icon Lịch + "Tháng 9 năm 2026" */}
        <div className="flex items-center justify-center gap-2.5 z-10 absolute left-1/2 -translate-x-1/2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100/80 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-foreground tracking-tight whitespace-nowrap">
            {toolbarTitle}
          </h1>
        </div>

        {/* Minh họa lịch 3D góc phải (Chuẩn ảnh mẫu) */}
        <div className="hidden sm:flex items-center justify-end pointer-events-none select-none pr-1 z-0 opacity-90">
          <svg width="96" height="76" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cánh lá pastel mờ */}
            <path d="M96 15C110 25 116 50 106 72C96 62 91 35 96 15Z" fill="#93c5fd" fillOpacity="0.45" />
            <path d="M103 30C118 40 120 62 112 80C103 72 99 50 103 30Z" fill="#60a5fa" fillOpacity="0.55" />
            {/* Thân cuốn lịch 3D */}
            <rect x="25" y="22" width="70" height="66" rx="14" fill="#dbeafe" />
            <rect x="20" y="18" width="70" height="66" rx="14" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
            <rect x="20" y="18" width="70" height="20" rx="14" fill="#3b82f6" />
            <rect x="20" y="30" width="70" height="8" fill="#3b82f6" />
            {/* Khuyên xoắn lò xo */}
            <rect x="32" y="12" width="5" height="12" rx="2.5" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1" />
            <rect x="46" y="12" width="5" height="12" rx="2.5" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1" />
            <rect x="60" y="12" width="5" height="12" rx="2.5" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1" />
            <rect x="74" y="12" width="5" height="12" rx="2.5" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1" />
            {/* Lưới ngày mini */}
            <rect x="28" y="44" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="39" y="44" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="50" y="44" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="61" y="44" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="72" y="44" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="28" y="54" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="39" y="54" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="50" y="54" width="7" height="5" rx="1.5" fill="#2563eb" />
            <rect x="61" y="54" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="72" y="54" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="28" y="64" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="39" y="64" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="50" y="64" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="61" y="64" width="7" height="5" rx="1.5" fill="#bfdbfe" />
            <rect x="72" y="64" width="7" height="5" rx="1.5" fill="#bfdbfe" />
          </svg>
        </div>
      </div>

      {/* 2. DẢI 3 THẺ TỔNG QUAN (Chuẩn ảnh mẫu: 8 buổi tháng này | Buổi tiếp theo | Đã học: 2 buổi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Thẻ 1: Tổng số buổi tháng này */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100/90 dark:border-border shadow-xs px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1 text-xs">
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {totalMonthSessions}
            </span>
            <span className="font-semibold text-slate-600 dark:text-muted-foreground">
              buổi tháng này
            </span>
          </div>
        </div>

        {/* Thẻ 2: Buổi tiếp theo */}
        <div
          onClick={() => nextSession && setSelectedSession(nextSession)}
          className="bg-white dark:bg-card rounded-2xl border border-slate-100/90 dark:border-border shadow-xs px-4 py-3 flex items-center justify-between gap-2 cursor-pointer hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="text-slate-600 dark:text-muted-foreground whitespace-nowrap">
                Buổi tiếp theo:
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate">
                {nextSessionFormatted}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Thẻ 3: Đã học */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100/90 dark:border-border shadow-xs px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1 text-xs">
            <span className="text-slate-600 dark:text-muted-foreground">
              Đã học:
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {attendedMonthSessions}
            </span>
            <span className="font-semibold text-slate-600 dark:text-muted-foreground">
              buổi
            </span>
          </div>
        </div>
      </div>

      {/* 3. LƯỚI LỊCH THÁNG (MONTH CALENDAR GRID — Chuẩn 100% ảnh mẫu) */}
      <div className="bg-white dark:bg-card rounded-2xl border border-blue-100/80 dark:border-border shadow-xs overflow-hidden">
        {/* Hàng tiêu đề 7 thứ: Màu xanh ngô mềm mại bg-[#7ca3e2] */}
        <div className="grid grid-cols-7 bg-[#7ca3e2] dark:bg-blue-600/80 text-white divide-x divide-white/20 border-b border-blue-300/40">
          {DAY_HEADERS.map((dayName) => (
            <div
              key={dayName}
              className="py-2.5 text-center text-xs font-bold tracking-wide"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Lưới 7 cột phân chia ngày */}
        <div className="grid grid-cols-7 divide-x divide-y divide-blue-100/70 dark:divide-border/60">
          {monthCalendarDays.map((day, idx) => {
            const daySessions = sessionsByDate.get(day.dateString) || [];

            return (
              <div
                key={`${day.dateString}-${idx}`}
                className={cn(
                  "min-h-[108px] md:min-h-[120px] p-2 sm:p-2.5 transition-colors flex flex-col justify-between relative",
                  !day.isCurrentMonth && "bg-[#fafbfc] dark:bg-muted/10 opacity-45",
                  day.isCurrentMonth && "bg-white dark:bg-card",
                  day.isToday && "bg-[#f4f7ff] dark:bg-blue-950/25"
                )}
              >
                {/* Phần đầu ô: Số ngày bên trái + Chấm tròn nhỏ góc phải */}
                <div className="flex items-center justify-between mb-1">
                  {day.isToday ? (
                    <span className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-xs shadow-xs">
                      {day.dayNumber}
                    </span>
                  ) : day.isCurrentMonth ? (
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-bold w-6 h-6 flex items-center justify-center">
                      {day.dayNumber}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 text-xs font-normal w-6 h-6 flex items-center justify-center">
                      {day.dayNumber}
                    </span>
                  )}

                  {/* Chấm tròn nhỏ góc trên bên phải (Chuẩn ảnh mẫu) */}
                  {day.isCurrentMonth && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300/80 dark:bg-blue-600/70 shrink-0" />
                  )}
                </div>

                {/* Danh sách badge buổi học: Chuẩn ảnh viên thuốc gradient xanh "18:00 - Tiếng Anh 6" */}
                <div className="space-y-1.5 flex-1 mt-1 overflow-y-auto max-h-[85px] scrollbar-none flex flex-col justify-end">
                  {daySessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      title={`${formatTime(session.start_time)} - ${session.class_name} (${getStatusLabel(session)})`}
                      className="w-full text-left px-2 py-1.5 rounded-xl bg-gradient-to-r from-[#eef4ff] to-[#f4f7ff] dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200/70 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:scale-[1.02] active:scale-98 shadow-2xs flex items-center gap-1.5 cursor-pointer group"
                    >
                      <div className="w-4 h-4 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[10.5px] font-bold text-blue-800 dark:text-blue-300 truncate">
                        {formatTime(session.start_time)} - {session.class_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

            <div className="space-y-3 pt-2 text-xs">
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
                <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                  {getStatusLabel(selectedSession)}
                </span>
              </div>

              {/* Ghi chú nếu có */}
              {selectedSession.note && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border">
                  <div className="text-muted-foreground font-semibold mb-0.5">Nội dung / Ghi chú:</div>
                  <div className="text-foreground font-medium">{selectedSession.note}</div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
