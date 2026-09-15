import { getStudentDashboardSummary } from "@/lib/actions/student";
import {
  Mail,
  Phone,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  CalendarCheck,
  BookOpenCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tiến độ học tập | Cổng Học sinh",
};

export default async function StudentDashboardPage() {
  const data = await getStudentDashboardSummary();
  const student = data?.student;
  const stats = data?.stats || {
    present: 0,
    absent_unexcused: 0,
    absent_excused: 0,
    total: 0,
  };

  const studentName = student?.full_name || "Học viên";
  const studentEmail = student?.email || "Chưa cập nhật";
  const studentPhone = student?.phone || "Chưa cập nhật";
  const studentCode = student?.id
    ? `#HV-${student.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
    : "#HV-202601";
  const balanceSessions = student?.balance_sessions ?? 0;

  // Tính toán số liệu điểm danh
  const total = stats.total;
  const present = stats.present;
  const unexcused = stats.absent_unexcused;
  const excused = stats.absent_excused;

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 100;

  // Tính toán thông số biểu đồ Donut SVG (bán kính r = 58, chu vi ~ 364.42)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const presentLength = total > 0 ? (present / total) * circumference : circumference;
  const excusedLength = total > 0 ? (excused / total) * circumference : 0;
  const unexcusedLength = total > 0 ? (unexcused / total) * circumference : 0;

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
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs",
                  balanceSessions < 0
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/50"
                    : balanceSessions <= 2
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/50"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/50"
                )}
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Số buổi còn lại: {balanceSessions}</span>
              </span>
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

        {/* Khung cảnh báo giới hạn màu vàng nhạt bên phải */}
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
            <div className="bg-white/80 dark:bg-card/70 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-700/90 dark:text-amber-400 font-medium">
                Nghỉ
              </div>
              <div className="text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                5/0
              </div>
            </div>
            <div className="bg-white/80 dark:bg-card/70 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-700/90 dark:text-amber-400 font-medium">
                Trễ
              </div>
              <div className="text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                0/0
              </div>
            </div>
            <div className="bg-white/80 dark:bg-card/70 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-700/90 dark:text-amber-400 font-medium">
                Bỏ bài tập
              </div>
              <div className="text-base font-black text-amber-900 dark:text-amber-200 mt-0.5">
                0/0
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
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
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

                  {/* Phân khúc Có mặt (Xanh lá) */}
                  {present > 0 && (
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
                  {excused > 0 && (
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
                  {unexcused > 0 && (
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

                {/* Phần trăm ở tâm Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-foreground tracking-tight">
                    {attendanceRate}%
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Có mặt
                  </span>
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

          {/* Các ô nhỏ đếm số buổi */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Có mặt */}
            <div className="rounded-xl p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                <span className="text-[11px] font-semibold">Có mặt</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-2">
                {present}
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 ml-1">
                  buổi
                </span>
              </div>
            </div>

            {/* Vắng không phép */}
            <div className="rounded-xl p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                <span className="text-[11px] font-semibold">Không phép</span>
                <XCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-rose-800 dark:text-rose-300 mt-2">
                {unexcused}
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 ml-1">
                  buổi
                </span>
              </div>
            </div>

            {/* Vắng có phép */}
            <div className="rounded-xl p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                <span className="text-[11px] font-semibold">Có phép</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-amber-800 dark:text-amber-300 mt-2">
                {excused}
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 ml-1">
                  buổi
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CỘT PHẢI: KHỐI BÀI TẬP */}
        <section className="lg:col-span-5 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border/60">
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-muted-foreground">
              0 bài
            </span>
          </div>

          {/* Trạng thái rỗng: Chưa có bài tập nào được giao */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[260px]">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-muted text-slate-400 dark:text-muted-foreground flex items-center justify-center mb-3">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Chưa có bài tập nào được giao
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
              Khi giáo viên giao bài tập hoặc bài tập trắc nghiệm mới cho lớp học của bạn, danh sách bài tập sẽ hiển thị tại đây.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
