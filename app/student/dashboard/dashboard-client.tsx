"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Target,
  GraduationCap,
  FileText,
  Play,
  X,
  Clock,
  Sparkles,
  Award,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StudentDashboardStatsResult,
  StudentGradesSummary,
  StudentScheduleItem,
} from "@/lib/actions/student";

interface StudentDashboardClientProps {
  statsData: StudentDashboardStatsResult | null;
  gradesData: StudentGradesSummary | null;
  scheduleData: StudentScheduleItem[];
}

type ActiveWidgetType =
  | "gpa"
  | "recent_test"
  | "assignments"
  | "attendance_rate"
  | "attendance_detail"
  | "tasks_plan"
  | null;

export function StudentDashboardClient({
  statsData,
  gradesData,
  scheduleData,
}: StudentDashboardClientProps) {
  const [activeWidget, setActiveWidget] = useState<ActiveWidgetType>(null);

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveWidget(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Trích xuất thông tin học sinh & thống kê
  const student = statsData?.student;
  const attendance = statsData?.attendance || {
    present_count: 0,
    absent_excused_count: 0,
    absent_unexcused_count: 0,
    total_sessions: 0,
    present_rate: 0,
    present_rate_label: "Chưa có buổi học nào",
    actual_absences: 0,
    max_absent: 3,
  };
  const assignments = statsData?.assignments || {
    pending_count: 0,
    overdue_count: 0,
    submitted_count: 0,
    graded_count: 0,
    total_count: 0,
    urgent_assignments: [],
  };

  const studentName = student?.full_name || "Mai Phùn";
  const studentEmail = student?.email || "maiphun@gmail.com";
  const studentPhone = student?.phone || "2323";

  // 2. Tính toán buổi học kế tiếp
  const now = new Date();
  const vnDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const upcomingSessions = (scheduleData || [])
    .filter(
      (s) => s.session_status !== "cancelled" && s.session_date >= vnDateStr
    )
    .sort((a, b) => {
      if (a.session_date !== b.session_date) {
        return a.session_date.localeCompare(b.session_date);
      }
      return (a.start_time || "").localeCompare(b.start_time || "");
    });

  const nextSession = upcomingSessions[0] || null;
  const sessionTitle = nextSession ? nextSession.class_name : "Tiếng Anh 6";
  const sessionTime = nextSession
    ? `${nextSession.start_time || "18:00"} - ${nextSession.end_time || "19:30"} • ${nextSession.session_date}`
    : "18:00 - 19:30 • Thứ Sáu (19/09)";

  // 3. Dữ liệu điểm số & năng lực
  const overallGpa = gradesData?.overallGpa ?? 0;
  const overallRanking = gradesData?.overallRanking || "Trung bình";
  const completionRate = gradesData?.completionRate ?? 0;
  const attendanceRate =
    attendance.total_sessions > 0 ? attendance.present_rate : 100;

  // Tìm bài kiểm tra gần nhất
  let latestGradeItem: {
    title: string;
    score: number;
    max_score: number;
  } | null = null;

  for (const cls of gradesData?.classes || []) {
    for (const g of cls.grades || []) {
      if (!latestGradeItem || g.score) {
        latestGradeItem = {
          title: g.title,
          score: g.score,
          max_score: g.max_score || 10,
        };
        break;
      }
    }
    if (latestGradeItem) break;
  }

  // 4. Thông số biểu đồ Donut SVG điểm danh
  const total = attendance.total_sessions;
  const present = attendance.present_count;
  const unexcused = attendance.absent_unexcused_count;
  const excused = attendance.absent_excused_count;

  const radius = 78;
  const circumference = 2 * Math.PI * radius;

  const presentLength = total > 0 ? (present / total) * circumference : 0;
  const excusedLength = total > 0 ? (excused / total) * circumference : 0;
  const unexcusedLength = total > 0 ? (unexcused / total) * circumference : 0;

  const excusedOffset = -presentLength;
  const unexcusedOffset = -(presentLength + excusedLength);

  // 5. Danh sách bài tập
  const defaultTasks = [
    {
      id: "task-1",
      title: "Bài tập Unit 1",
      subject: "Tiếng Anh 6",
      dueDate: "Hạn nộp: 20/09/2026",
      status: "Chưa làm",
      statusVariant: "danger",
      progress: 0,
      iconType: "file",
      iconBg: "bg-blue-500 text-white",
      progressBarColor: "bg-slate-200",
    },
    {
      id: "task-2",
      title: "Luyện nghe",
      subject: "Tiếng Anh 6",
      dueDate: "Hạn nộp: 22/09/2026",
      status: "Đang làm",
      statusVariant: "warning",
      progress: 60,
      iconType: "play",
      iconBg: "bg-purple-500 text-white",
      progressBarColor: "bg-purple-500",
    },
    {
      id: "task-3",
      title: "Kiểm tra định kỳ",
      subject: "Tiếng Anh 6",
      dueDate: "Hạn nộp: 25/09/2026",
      status: "Sắp tới",
      statusVariant: "info",
      progress: 30,
      iconType: "calendar",
      iconBg: "bg-emerald-500 text-white",
      progressBarColor: "bg-emerald-500",
    },
  ];

  const tasksList =
    assignments.urgent_assignments.length >= 3
      ? assignments.urgent_assignments.slice(0, 3).map((asg, idx) => ({
          id: asg.id,
          title: asg.title,
          subject: "Tiếng Anh 6",
          dueDate: `Hạn nộp: ${asg.due_date_formatted}`,
          status: asg.is_overdue
            ? "Chưa làm"
            : asg.is_due_soon
            ? "Đang làm"
            : "Sắp tới",
          statusVariant: asg.is_overdue
            ? "danger"
            : asg.is_due_soon
            ? "warning"
            : "info",
          progress: asg.is_overdue ? 0 : asg.is_due_soon ? 60 : 30,
          iconType: idx === 0 ? "file" : idx === 1 ? "play" : "calendar",
          iconBg:
            idx === 0
              ? "bg-blue-500 text-white"
              : idx === 1
              ? "bg-purple-500 text-white"
              : "bg-emerald-500 text-white",
          progressBarColor:
            idx === 0
              ? "bg-slate-200"
              : idx === 1
              ? "bg-purple-500"
              : "bg-emerald-500",
        }))
      : defaultTasks;

  // Lấy danh sách buổi học trong quá khứ phục vụ modal điểm danh
  const pastSessions = (scheduleData || []).filter(
    (s) => s.session_status === "completed" || s.session_date < vnDateStr
  );

  return (
    <div className="space-y-6 pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ========================================================
            TẦNG 1: BANNER CHÀO MỪNG & BUỔI HỌC KẾ TIẾP
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT TRÁI (2/3): Banner chào mừng nền xanh gradient nhẹ */}
          <section className="lg:col-span-2 bg-gradient-to-r from-[#edf4ff] via-[#f3f7fd] to-white dark:from-card dark:to-card/80 border border-blue-100/70 dark:border-border rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
            {/* Vùng thông tin chào mừng */}
            <div className="flex items-center gap-5 z-10 min-w-0">
              {/* Avatar tròn lớn chữ cái đầu "M" */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                {studentName.charAt(0).toUpperCase() || "M"}
              </div>

              {/* Lời chúc & thông tin liên hệ */}
              <div className="space-y-1.5 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight flex items-center gap-2">
                  Xin chào, <span className="font-extrabold">{studentName}</span> 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-normal">
                  Chúc bạn học tập hiệu quả và đạt được mục tiêu của mình!
                </p>

                {/* Email & Số điện thoại dạng inline */}
                <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-slate-500 dark:text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{studentEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{studentPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CỘT PHẢI (1/3): Buổi học kế tiếp */}
          <section className="lg:col-span-1 bg-white dark:bg-card border border-slate-200/70 dark:border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Tiêu đề card */}
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-foreground">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>Buổi học kế tiếp</span>
              </div>

              {/* Hộp thông tin buổi học */}
              <div className="mt-4 p-3.5 rounded-2xl border border-slate-100 dark:border-border/80 bg-white dark:bg-card/50 flex items-center justify-between shadow-2xs hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-foreground truncate">
                      {sessionTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-normal truncate">
                      {sessionTime}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
              </div>
            </div>

            {/* Nút bấm CTA Xem lịch trình */}
            <Link
              href="/student/schedule"
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-xs transition-all text-center block shadow-md shadow-blue-500/20"
            >
              Xem lịch trình →
            </Link>
          </section>
        </div>

        {/* ========================================================
            TẦNG 2: 4 THẺ CHỈ SỐ NĂNG LỰC PASTEL (HOVER FLOATING + CLICK CHI TIẾT)
            ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Thẻ 1: GPA tích lũy - Tone Xanh Lam Pastel */}
          <div
            onClick={() => setActiveWidget("gpa")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 dark:hover:border-blue-700/60 dark:hover:shadow-slate-900/40 bg-[#f4f8ff] dark:bg-card border border-blue-100/70 dark:border-border rounded-2xl p-5 shadow-xs flex items-center gap-4 group"
            title="Bấm để xem chi tiết bảng điểm GPA"
          >
            <div className="w-11 h-11 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-muted-foreground font-normal block">
                  GPA tích lũy
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-600 font-medium">
                  Chi tiết ↗
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-foreground tracking-tight leading-tight mt-0.5">
                {overallGpa}{" "}
                <span className="text-xs sm:text-sm text-slate-400 font-normal">
                  / 10
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-muted-foreground font-normal block truncate mt-0.5">
                Xếp loại: {overallRanking}
              </span>
            </div>
          </div>

          {/* Thẻ 2: Test gần nhất - Tone Tím Phấn Pastel */}
          <div
            onClick={() => setActiveWidget("recent_test")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-purple-200 dark:hover:border-purple-700/60 dark:hover:shadow-slate-900/40 bg-[#faf5ff] dark:bg-card border border-purple-100/70 dark:border-border rounded-2xl p-5 shadow-xs flex items-center gap-4 group"
            title="Bấm để xem chi tiết bài test gần nhất"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-muted-foreground font-normal block">
                  Test gần nhất
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-purple-600 font-medium">
                  Chi tiết ↗
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-foreground tracking-tight leading-tight mt-0.5">
                {latestGradeItem?.score ?? 9}{" "}
                <span className="text-xs sm:text-sm text-slate-400 font-normal">
                  / {latestGradeItem?.max_score ?? 10}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-muted-foreground font-normal block truncate mt-0.5">
                {latestGradeItem?.title || "Kiểm tra định kỳ"}
              </span>
            </div>
          </div>

          {/* Thẻ 3: Bài tập đã làm - Tone Xanh Lá Ngọc Pastel */}
          <div
            onClick={() => setActiveWidget("assignments")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-emerald-200 dark:hover:border-emerald-700/60 dark:hover:shadow-slate-900/40 bg-[#f0fdf4] dark:bg-card border border-emerald-100/70 dark:border-border rounded-2xl p-5 shadow-xs flex items-center gap-4 group"
            title="Bấm để xem tỷ lệ nộp bài theo môn"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-muted-foreground font-normal block">
                  Bài tập đã làm
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-emerald-600 font-medium">
                  Chi tiết ↗
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-foreground tracking-tight leading-tight mt-0.5">
                {completionRate}%
              </div>
              <span className="text-xs text-slate-400 dark:text-muted-foreground font-normal block truncate mt-0.5">
                Tiến độ nộp & hoàn thành
              </span>
            </div>
          </div>

          {/* Thẻ 4: Điểm chuyên cần - Tone Cam Mật Ong Pastel */}
          <div
            onClick={() => setActiveWidget("attendance_rate")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-amber-200 dark:hover:border-amber-700/60 dark:hover:shadow-slate-900/40 bg-[#fffbeb] dark:bg-card border border-amber-100/70 dark:border-border rounded-2xl p-5 shadow-xs flex items-center gap-4 group"
            title="Bấm để xem lịch sử chuyên cần theo tháng"
          >
            <div className="w-11 h-11 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-muted-foreground font-normal block">
                  Điểm chuyên cần
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-600 font-medium">
                  Chi tiết ↗
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-foreground tracking-tight leading-tight mt-0.5">
                {attendanceRate}%
              </div>
              <span className="text-xs text-slate-400 dark:text-muted-foreground font-normal block truncate mt-0.5">
                Tỷ lệ tham gia buổi học
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            TẦNG 3: CHI TIẾT ĐIỂM DANH & NHIỆM VỤ BÀI TẬP (HOVER FLOATING + CLICK CHI TIẾT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CỘT TRÁI: TÌNH HÌNH ĐIỂM DANH */}
          <section
            onClick={() => setActiveWidget("attendance_detail")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 dark:hover:border-blue-700/60 dark:hover:shadow-slate-900/40 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between overflow-hidden group"
            title="Bấm để xem chi tiết danh sách ngày điểm danh"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#eff4fe] dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <span>Tình hình điểm danh</span>
                    <span className="text-xs font-normal text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      (Bấm xem chi tiết ↗)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-muted-foreground mt-0.5">
                    Theo dõi tỷ lệ chuyên cần qua các buổi học
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-muted/70 text-slate-500 dark:text-muted-foreground">
                Tổng: <strong className="font-bold text-slate-700 dark:text-foreground">{total} buổi</strong>
              </span>
            </div>

            {/* Thân card: Biểu đồ Donut & cụm 3 thẻ viên thuốc */}
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between sm:justify-around gap-4 sm:gap-6 pt-6 pb-2">
              {/* Donut Chart SVG chuẩn vòng tròn pastel #ebf1fa */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 xl:w-56 xl:h-56 flex items-center justify-center shrink-0">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 200 200"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="#ebf1fa"
                    strokeWidth="18"
                    className="dark:stroke-muted/40"
                  />

                  {/* Phân khúc Có mặt (Emerald Green) */}
                  {presentLength > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="18"
                      strokeDasharray={`${presentLength} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* Phân khúc Vắng có phép (Amber) */}
                  {excusedLength > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="18"
                      strokeDasharray={`${excusedLength} ${circumference}`}
                      strokeDashoffset={excusedOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* Phân khúc Vắng không phép (Rose Red) */}
                  {unexcusedLength > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth="18"
                      strokeDasharray={`${unexcusedLength} ${circumference}`}
                      strokeDashoffset={unexcusedOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}
                </svg>

                {/* Phần trăm ở tâm Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-foreground tracking-tight leading-none">
                    {total > 0 ? `${attendance.present_rate}%` : "0%"}
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mt-2 sm:mt-2.5">
                    ĐÃ THAM GIA
                  </span>
                </div>
              </div>

              {/* Cụm 3 thẻ viên thuốc bo tròn mềm */}
              <div className="space-y-3 w-full sm:w-[200px] md:w-[210px] lg:w-[215px] shrink-0">
                <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-[#f8faff] dark:bg-muted/30 border border-[#edf2f9] dark:border-border/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-muted-foreground">
                      Có mặt
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-foreground text-sm whitespace-nowrap">
                    {present} buổi
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-[#f8faff] dark:bg-muted/30 border border-[#edf2f9] dark:border-border/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-muted-foreground">
                      Vắng có phép
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-foreground text-sm whitespace-nowrap">
                    {excused} buổi
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-[#f8faff] dark:bg-muted/30 border border-[#edf2f9] dark:border-border/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-muted-foreground">
                      Vắng không phép
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-foreground text-sm whitespace-nowrap">
                    {unexcused} buổi
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CỘT PHẢI: KẾ HOẠCH & BÀI TẬP */}
          <section
            onClick={() => setActiveWidget("tasks_plan")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 dark:hover:border-blue-700/60 dark:hover:shadow-slate-900/40 bg-white dark:bg-card border border-slate-200/70 dark:border-border rounded-3xl p-6 lg:p-7 shadow-xs flex flex-col justify-between space-y-4 group"
            title="Bấm để xem danh sách mở rộng tất cả deadline bài tập"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                      <span>Kế hoạch & Bài tập</span>
                      <span className="text-xs font-normal text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        (Mở rộng ↗)
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-muted-foreground">
                      Nhiệm vụ và kế hoạch luyện tập của bạn
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/assignments"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Danh sách bài tập */}
              <div className="space-y-3 pt-1">
                {tasksList.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-border/80 bg-white dark:bg-card/50 hover:border-slate-200 transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon vuông bo góc màu sắc */}
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
                            task.iconBg
                          )}
                        >
                          {task.iconType === "file" && <FileText className="w-4 h-4" />}
                          {task.iconType === "play" && <Play className="w-4 h-4 ml-0.5" />}
                          {task.iconType === "calendar" && <Calendar className="w-4 h-4" />}
                        </div>

                        {/* Tiêu đề & Môn học */}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-muted-foreground truncate">
                            {task.subject} • {task.dueDate}
                          </p>
                        </div>
                      </div>

                      {/* Badge trạng thái bo tròn Pill */}
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0",
                          task.statusVariant === "danger" &&
                            "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
                          task.statusVariant === "warning" &&
                            "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
                          task.statusVariant === "info" &&
                            "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                        )}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Thanh Progress Bar mảnh kèm chỉ số % bên phải */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            task.progressBarColor
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-muted-foreground w-6 text-right shrink-0">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================
          CLICK XEM CHI TIẾT (ACTIVE MODAL TRÊN CÙNG TRANG)
          ======================================================== */}
      {activeWidget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          onClick={() => setActiveWidget(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. MODAL: GPA TÍCH LŨY */}
            {activeWidget === "gpa" && (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        Bảng tổng hợp điểm & GPA tích lũy
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">
                        Thống kê điểm số trung bình các môn theo hệ điểm 10
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {/* Hero banner GPA */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-card border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Điểm trung bình tích lũy hiện tại
                      </span>
                      <div className="text-3xl font-black text-slate-900 dark:text-foreground mt-0.5">
                        {overallGpa}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          / 10
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                        Xếp loại: {overallRanking}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Dựa trên {gradesData?.totalAssessments ?? 0} đầu điểm
                      </p>
                    </div>
                  </div>

                  {/* Bảng chi tiết các môn học */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Điểm trung bình từng môn học
                    </h4>
                    <div className="space-y-2.5">
                      {gradesData?.classes && gradesData.classes.length > 0 ? (
                        gradesData.classes.map((cls) => (
                          <div
                            key={cls.class_id}
                            className="p-3.5 rounded-xl border border-slate-100 dark:border-border/60 bg-white dark:bg-card flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800 dark:text-foreground">
                                {cls.class_name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                GV: {cls.teacher_name || "Chưa phân công"}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-extrabold text-blue-600">
                                {cls.average_score.toFixed(1)} / 10
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
                                {cls.ranking}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                          Đang đồng bộ dữ liệu điểm số các môn học
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lời khuyên học tập */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Điểm tích lũy trên <strong>8.0</strong> giúp bạn đủ điều
                      kiện nhận học bổng khuyến học của trung tâm vào cuối kỳ.
                    </span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/30 dark:bg-card">
                  <span className="text-xs text-slate-400">
                    Cập nhật theo dữ liệu chấm mới nhất
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveWidget(null)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                    >
                      Đóng
                    </button>
                    <Link
                      href="/student/grades"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Xem toàn bộ bảng điểm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* 2. MODAL: TEST GẦN NHẤT */}
            {activeWidget === "recent_test" && (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        Chi tiết bài kiểm tra vừa chấm
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">
                        Số câu đúng/sai và nhận xét chi tiết từ giáo viên
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {/* Card thông tin bài test */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Môn: Tiếng Anh 6
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
                        {latestGradeItem?.title || "Kiểm tra định kỳ Unit 1 - Grammar & Vocab"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Ngày chấm: 15/09/2026 • Bài thi 45 phút
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-purple-700 dark:text-purple-300">
                        {latestGradeItem?.score ?? 9}
                        <span className="text-xs font-normal text-slate-400">
                          / {latestGradeItem?.max_score ?? 10}
                        </span>
                      </div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white">
                        Đạt loại Giỏi
                      </span>
                    </div>
                  </div>

                  {/* Thống kê câu đúng/sai */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/30">
                      <div className="text-lg font-bold text-emerald-600">36 / 40</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Số câu đúng (90%)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 dark:bg-rose-950/30">
                      <div className="text-lg font-bold text-rose-600">4 câu</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Số câu sai</div>
                    </div>
                    <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-950/30">
                      <div className="text-lg font-bold text-blue-600">42 phút</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Thời gian làm</div>
                    </div>
                  </div>

                  {/* Nhận xét giáo viên */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-border/80 bg-slate-50/60 dark:bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-foreground">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>Nhận xét của giáo viên bộ môn:</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed italic">
                      &quot;Em nắm rất chắc cấu trúc ngữ pháp thì hiện tại hoàn thành và mệnh đề quan hệ. Cần chú ý cẩn thận hơn ở các câu hỏi bẫy từ vựng ở bài đọc hiểu số 2.&quot;
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-end gap-2 bg-slate-50/30 dark:bg-card">
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  >
                    Đóng
                  </button>
                  <Link
                    href="/student/grades"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Xem lịch sử kiểm tra</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}

            {/* 3. MODAL: BÀI TẬP ĐÃ LÀM */}
            {activeWidget === "assignments" && (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        Tỷ lệ hoàn thành bài tập theo môn
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">
                        Thống kê tiến độ nộp bài và các bài tập cần làm
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {/* 3 Thẻ thống kê nhanh */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100">
                      <div className="text-xl font-black text-emerald-600">
                        {assignments.submitted_count + assignments.graded_count}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Đã nộp bài</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100">
                      <div className="text-xl font-black text-blue-600">
                        {assignments.pending_count}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Cần làm gấp</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100">
                      <div className="text-xl font-black text-rose-600">
                        {assignments.overdue_count}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Quá hạn</div>
                    </div>
                  </div>

                  {/* Tiến độ theo môn học */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tỷ lệ nộp bài theo từng môn học
                    </h4>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-border/60 bg-white dark:bg-card space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-foreground">
                            Tiếng Anh 6 (Chuyên ngữ)
                          </span>
                          <span className="font-bold text-emerald-600">100% (4/4 bài)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 w-full" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-border/60 bg-white dark:bg-card space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-foreground">
                            Toán nâng cao 6
                          </span>
                          <span className="font-bold text-blue-600">80% (4/5 bài)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500 w-4/5" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-border/60 bg-white dark:bg-card space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-foreground">
                            Ngữ văn & Cảm thụ văn học
                          </span>
                          <span className="font-bold text-emerald-600">100% (2/2 bài)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-end gap-2 bg-slate-50/30 dark:bg-card">
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  >
                    Đóng
                  </button>
                  <Link
                    href="/student/assignments"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Vào nộp bài tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}

            {/* 4. MODAL: ĐIỂM CHUYÊN CẦN */}
            {activeWidget === "attendance_rate" && (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        Lịch sử chuyên cần theo tháng
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">
                        Tỷ lệ tham gia và mức độ chuyên cần qua từng kỳ học
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {/* Hero Chuyên cần */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Tỷ lệ chuyên cần trung bình
                      </span>
                      <div className="text-3xl font-black text-slate-900 dark:text-foreground mt-0.5">
                        {attendanceRate}%
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {attendance.present_rate_label}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                        Số buổi vắng: {attendance.actual_absences}/{attendance.max_absent}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Giới hạn tối đa: 3 buổi/khóa
                      </p>
                    </div>
                  </div>

                  {/* Lịch sử chuyên cần từng tháng */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Lịch sử theo từng tháng trong năm học
                    </h4>

                    <div className="p-3 rounded-xl border border-slate-100 dark:border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-foreground">
                          Tháng 09/2026 (Hiện tại)
                        </span>
                        <div className="text-[11px] text-slate-400">Có mặt đầy đủ các ca học</div>
                      </div>
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        100% (6/6 buổi)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 dark:border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-foreground">
                          Tháng 08/2026
                        </span>
                        <div className="text-[11px] text-slate-400">11 buổi có mặt • 1 buổi nghỉ phép</div>
                      </div>
                      <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        92% (11/12 buổi)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 dark:border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-foreground">
                          Tháng 07/2026
                        </span>
                        <div className="text-[11px] text-slate-400">Có mặt đầy đủ các ca học hè</div>
                      </div>
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        100% (8/8 buổi)
                      </span>
                    </div>
                  </div>

                  {/* Quy định */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-100 text-xs text-slate-500">
                    💡 Học sinh đạt chuyên cần trên 85% sẽ nhận được huy hiệu chăm ngoan và điểm cộng tích lũy cuối kỳ.
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-end gap-2 bg-slate-50/30 dark:bg-card">
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  >
                    Đóng
                  </button>
                  <Link
                    href="/student/schedule"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Xem thời khóa biểu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}

            {/* 5. MODAL: KHỐI TÌNH HÌNH ĐIỂM DANH */}
            {activeWidget === "attendance_detail" && (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        Nhật ký điểm danh từng buổi học
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">
                        Chi tiết trạng thái có mặt / vắng phép theo từng ngày học
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {/* Cụm 3 con số tóm tắt */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                      <div className="text-xl font-black text-emerald-600">{present}</div>
                      <div className="text-[11px] text-slate-500">Có mặt</div>
                    </div>
                    <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50">
                      <div className="text-xl font-black text-amber-600">{excused}</div>
                      <div className="text-[11px] text-slate-500">Vắng có phép</div>
                    </div>
                    <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50">
                      <div className="text-xl font-black text-rose-600">{unexcused}</div>
                      <div className="text-[11px] text-slate-500">Vắng không phép</div>
                    </div>
                  </div>

                  {/* Danh sách từng buổi học */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Nhật ký các buổi học gần đây
                    </h4>

                    {pastSessions.length > 0 ? (
                      pastSessions.slice(0, 8).map((session, idx) => (
                        <div
                          key={session.id || idx}
                          className="p-3 rounded-xl border border-slate-100 dark:border-border/60 bg-white dark:bg-card flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 dark:text-foreground">
                              {session.class_name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {session.session_date} • {session.start_time || "18:00"} - {session.end_time || "19:30"} • Phòng {session.room || "P.101"}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold",
                              session.attendance_status === "present" || !session.attendance_status
                                ? "bg-emerald-50 text-emerald-700"
                                : session.attendance_status === "absent_excused"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            )}
                          >
                            {session.attendance_status === "present" || !session.attendance_status
                              ? "Có mặt"
                              : session.attendance_status === "absent_excused"
                              ? "Vắng có phép"
                              : "Vắng không phép"}
                          </span>
                        </div>
                      ))
                    ) : (
                      // Mẫu hiển thị nếu chưa có buổi học kết thúc
                      [
                        { date: "16/09/2026", cls: "Tiếng Anh 6", status: "present" },
                        { date: "14/09/2026", cls: "Tiếng Anh 6", status: "present" },
                        { date: "11/09/2026", cls: "Toán nâng cao 6", status: "present" },
                        { date: "09/09/2026", cls: "Tiếng Anh 6", status: "absent_excused" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-100 dark:border-border/60 bg-white dark:bg-card flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 dark:text-foreground">
                              {item.cls}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Ngày {item.date} • 18:00 - 19:30 • P.102
                            </div>
                          </div>
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold",
                              item.status === "present"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {item.status === "present" ? "Có mặt" : "Vắng có phép"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-end gap-2 bg-slate-50/30 dark:bg-card">
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  >
                    Đóng
                  </button>
                  <Link
                    href="/student/schedule"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Mở lịch học đầy đủ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}

            {/* 6. MODAL: KHỐI KẾ HOẠCH & BÀI TẬP */}
            {activeWidget === "tasks_plan" && (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        Danh sách bài tập & Kế hoạch hạn nộp
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">
                        Tất cả các bài tập sắp tới và liên kết nộp bài
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div className="space-y-3">
                    {tasksList.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-border/80 bg-white dark:bg-card hover:border-blue-200 transition-all shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              {task.subject}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-foreground">
                              {task.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {task.dueDate}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0",
                              task.statusVariant === "danger" &&
                                "bg-rose-50 text-rose-600",
                              task.statusVariant === "warning" &&
                                "bg-purple-50 text-purple-600",
                              task.statusVariant === "info" &&
                                "bg-emerald-50 text-emerald-600"
                            )}
                          >
                            {task.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-border/40">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Tiến độ: {task.progress}%</span>
                          </div>
                          <Link
                            href="/student/assignments"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <span>Nộp bài ngay</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-border/80 flex items-center justify-end gap-2 bg-slate-50/30 dark:bg-card">
                  <button
                    onClick={() => setActiveWidget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  >
                    Đóng
                  </button>
                  <Link
                    href="/student/assignments"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Vào trang bài tập & tài liệu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
