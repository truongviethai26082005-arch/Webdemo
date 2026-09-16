import Link from "next/link";
import { getStudentDashboardStats } from "@/lib/actions/student";
import {
  Mail,
  Phone,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarCheck,
  BookOpenCheck,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tiến độ học tập | Cổng Học sinh",
};

export default async function StudentDashboardPage() {
  const data = await getStudentDashboardStats();
  const student = data?.student;
  const attendance = data?.attendance || {
    present_count: 0,
    absent_excused_count: 0,
    absent_unexcused_count: 0,
    total_sessions: 0,
    present_rate: 0,
    present_rate_label: "Chưa có buổi học nào",
    actual_absences: 0,
    max_absent: 3,
    absence_display: "0/3",
    exceeded_absence: false,
    late_count: 0,
    max_late: 3,
    late_display: "0/3",
  };
  const assignments = data?.assignments || {
    pending_count: 0,
    overdue_count: 0,
    submitted_count: 0,
    graded_count: 0,
    total_count: 0,
    urgent_assignments: [],
  };

  const studentName = student?.full_name || "Học viên";
  const studentEmail = student?.email || "Chưa cập nhật";
  const studentPhone = student?.phone || "Chưa cập nhật";
  const studentCode = student?.id
    ? `#HV-${student.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
    : "#HV-202601";
  const balanceSessions = student?.balance_sessions ?? 0;

  // Số liệu điểm danh
  const total = attendance.total_sessions;
  const present = attendance.present_count;
  const unexcused = attendance.absent_unexcused_count;
  const excused = attendance.absent_excused_count;
  const attendanceRate = attendance.present_rate;

  // Tính toán thông số biểu đồ Donut SVG (bán kính r = 58, chu vi ~ 364.42)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const presentLength =
    total > 0 ? (present / total) * circumference : 0;
  const excusedLength =
    total > 0 ? (excused / total) * circumference : 0;
  const unexcusedLength =
    total > 0 ? (unexcused / total) * circumference : 0;

  const excusedOffset = -presentLength;
  const unexcusedOffset = -(presentLength + excusedLength);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. THẺ THÔNG TIN HỌC VIÊN TRÊN CÙNG */}
      <section className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Thông tin học viên */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {studentName}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
                <Hash className="w-3 h-3" />
                {studentCode}
              </span>
              <Link
                href="/student/classes"
                title="Bấm để kiểm tra chi tiết danh sách lớp học và số buổi"
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
                  balanceSessions < 0
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/50"
                    : balanceSessions <= 2
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/50"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/50"
                )}
              >
                <Sparkles className="w-3 h-3 shrink-0 transition-transform group-hover:scale-110" />
                <span>Số buổi còn lại: {balanceSessions}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[220px]">{studentEmail}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{studentPhone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Khung cảnh báo giới hạn (Khắc phục lỗi 5/0, dữ liệu khớp 100% với điểm danh) */}
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/40 rounded-2xl p-4 flex flex-col justify-between shrink-0 min-w-[260px] sm:min-w-[300px]">
          <div className="flex items-center justify-between gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cảnh báo giới hạn</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 font-semibold">
              Kỳ hiện tại
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
            {/* Thẻ Nghỉ */}
            <div
              className={cn(
                "rounded-xl p-2.5 shadow-2xs transition-colors",
                attendance.exceeded_absence
                  ? "bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800"
                  : "bg-white/80 dark:bg-card/70 border border-amber-200/60 dark:border-amber-800/40"
              )}
            >
              <div
                className={cn(
                  "text-[11px] font-medium",
                  attendance.exceeded_absence
                    ? "text-rose-700 dark:text-rose-400 font-bold"
                    : "text-amber-700/90 dark:text-amber-400"
                )}
              >
                Nghỉ
              </div>
              <div
                className={cn(
                  "text-base font-black mt-0.5",
                  attendance.exceeded_absence
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-900 dark:text-amber-200"
                )}
              >
                {attendance.absence_display}
              </div>
            </div>

            {/* Thẻ Trễ */}
            <div className="bg-white/80 dark:bg-card/70 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-700/90 dark:text-amber-400 font-medium">
                Trễ
              </div>
              <div className="text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                {attendance.late_display}
              </div>
            </div>

            {/* Thẻ Bỏ bài tập */}
            <div
              className={cn(
                "rounded-xl p-2.5 shadow-2xs transition-colors",
                assignments.overdue_count > 0
                  ? "bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800"
                  : "bg-white/80 dark:bg-card/70 border border-amber-200/60 dark:border-amber-800/40"
              )}
            >
              <div
                className={cn(
                  "text-[11px] font-medium",
                  assignments.overdue_count > 0
                    ? "text-rose-700 dark:text-rose-400 font-bold"
                    : "text-amber-700/90 dark:text-amber-400"
                )}
              >
                Bỏ bài tập
              </div>
              <div
                className={cn(
                  "text-base font-black mt-0.5",
                  assignments.overdue_count > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-900 dark:text-amber-200"
                )}
              >
                {assignments.overdue_count}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHỐI NỘI DUNG 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: KHỐI ĐIỂM DANH */}
        <section className="lg:col-span-7 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Tình hình điểm danh
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Theo dõi tỷ lệ chuyên cần qua các buổi học
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
                Tổng: {total} buổi
              </span>
            </div>

            {/* Vùng biểu đồ Donut & Chú thích màu */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-6 pt-6 pb-2">
              {/* Biểu đồ Donut SVG */}
              <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 160 160"
                >
                  {/* Vòng tròn nền */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="14"
                    className="text-slate-100 dark:text-slate-800"
                  />

                  {/* Phân khúc Có mặt (Xanh lá) - chỉ vẽ khi total > 0 */}
                  {presentLength > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="14"
                      strokeDasharray={`${presentLength} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* Phân khúc Vắng có phép (Vàng) */}
                  {excusedLength > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="14"
                      strokeDasharray={`${excusedLength} ${circumference}`}
                      strokeDashoffset={excusedOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* Phân khúc Vắng không phép (Đỏ) */}
                  {unexcusedLength > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth="14"
                      strokeDasharray={`${unexcusedLength} ${circumference}`}
                      strokeDashoffset={unexcusedOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}
                </svg>

                {/* Phần trăm ở tâm Donut (không vẽ 100% khi 0 buổi) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  {total > 0 ? (
                    <>
                      <span className="text-3xl font-black text-foreground tracking-tight">
                        {attendanceRate}%
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Có mặt
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-400 dark:text-slate-500">
                        0%
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground mt-0.5 leading-tight">
                        Chưa có buổi học
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Danh sách chú thích màu */}
              <div className="space-y-3 shrink-0">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-2xs" />
                  <span className="text-slate-600 dark:text-muted-foreground font-medium">
                    Có mặt:
                  </span>
                  <span className="font-bold text-foreground">{present} buổi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-2xs" />
                  <span className="text-slate-600 dark:text-muted-foreground font-medium">
                    Vắng có phép:
                  </span>
                  <span className="font-bold text-foreground">{excused} buổi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-2xs" />
                  <span className="text-slate-600 dark:text-muted-foreground font-medium">
                    Vắng không phép:
                  </span>
                  <span className="font-bold text-foreground">{unexcused} buổi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Các ô nhỏ đếm số buổi có thể bấm để xem chi tiết lịch */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Có mặt */}
            <Link
              href="/student/schedule"
              title="Bấm để xem lịch sử buổi học có mặt"
              className="rounded-xl p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex flex-col justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group"
            >
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                <span className="text-[11px] font-semibold">Có mặt</span>
                <CheckCircle2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-2">
                {present}
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 ml-1">
                  buổi
                </span>
              </div>
            </Link>

            {/* Vắng không phép */}
            <Link
              href="/student/schedule"
              title="Bấm để xem lịch sử buổi học vắng không phép"
              className="rounded-xl p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/40 flex flex-col justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group"
            >
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                <span className="text-[11px] font-semibold">Không phép</span>
                <XCircle className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="text-xl font-black text-rose-800 dark:text-rose-300 mt-2">
                {unexcused}
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 ml-1">
                  buổi
                </span>
              </div>
            </Link>

            {/* Vắng có phép */}
            <Link
              href="/student/schedule"
              title="Bấm để xem lịch sử buổi học vắng có phép"
              className="rounded-xl p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 flex flex-col justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group"
            >
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                <span className="text-[11px] font-semibold">Có phép</span>
                <Clock className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="text-xl font-black text-amber-800 dark:text-amber-300 mt-2">
                {excused}
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 ml-1">
                  buổi
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* CỘT PHẢI: KHỐI BÀI TẬP & KIỂM TRA */}
        <section className="lg:col-span-5 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header widget */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Bài tập & Kiểm tra
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Nhiệm vụ cần hoàn thành
                  </p>
                </div>
              </div>
              <Link
                href="/student/assignments"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Thanh tóm tắt trạng thái: [Cần làm] - [Chờ chấm] - [Đã chấm] */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Cần làm
                </div>
                <div className="text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                  {assignments.pending_count + assignments.overdue_count}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-center">
                <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                  Chờ chấm
                </div>
                <div className="text-base font-black text-blue-900 dark:text-blue-200 mt-0.5">
                  {assignments.submitted_count}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Đã chấm
                </div>
                <div className="text-base font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {assignments.graded_count}
                </div>
              </div>
            </div>

            {/* Danh sách mini các bài cần nộp gấp (tối đa 2 bài) hoặc Empty state */}
            {assignments.urgent_assignments.length > 0 ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Nhiệm vụ cần nộp gấp</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Ưu tiên hoàn thành
                  </span>
                </div>

                <div className="space-y-2.5">
                  {assignments.urgent_assignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-border bg-slate-50/60 dark:bg-muted/30 hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60">
                              {asg.class_name}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                asg.is_overdue
                                  ? "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300"
                                  : asg.is_due_soon
                                  ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300"
                                  : "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300"
                              )}
                            >
                              {asg.days_left}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground truncate max-w-[260px]">
                            {asg.title}
                          </h4>
                        </div>

                        <Button
                          asChild
                          size="sm"
                          className="rounded-lg h-7 px-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                        >
                          <Link href="/student/assignments">Làm bài</Link>
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-200/60 dark:border-border/60">
                        <span>Hạn chót: {asg.due_date_formatted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty state tinh tế khi không còn bài tập nào cần làm */
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/20 text-center flex flex-col items-center justify-center space-y-3 min-h-[160px]">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-foreground">
                    Bạn đã hoàn thành tất cả bài tập!
                  </h3>
                  <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                    Hiện không có nhiệm vụ bài tập nào cần nộp gấp. Hãy duy trì phong độ học tập tốt nhé!
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold border-slate-200 dark:border-border h-8"
                >
                  <Link href="/student/assignments">
                    Xem kho bài tập & điểm số
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
