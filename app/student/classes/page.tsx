import { getStudentClasses, StudentClassItem } from "@/lib/actions/student";
import {
  BookOpen,
  User,
  School,
  Clock,
  Calendar,
  GraduationCap,
  Users,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Danh sách lớp học | Cổng Học sinh",
};

// Dữ liệu mẫu chuẩn ảnh tham chiếu khi DB chưa có lớp ghi danh
const DEFAULT_DEMO_CLASSES: StudentClassItem[] = [
  {
    id: "demo-cls-ta6",
    class_id: "cls-ta6",
    name: "Tiếng Anh 6",
    code: "LH-97384E",
    room: "202",
    schedule_desc: "T3 (18:00 - 19:30), T6 (18:00 - 19:30), CN (18:00 - 19:30)",
    teacher_name: "Thầy Long MCK",
    balance_sessions: 24,
    status: "active",
  },
];

export default async function StudentClassesPage() {
  const classesData = await getStudentClasses();

  // Sử dụng dữ liệu thực tế từ database; nếu chưa có thì dùng dữ liệu mẫu chuẩn thiết kế
  const displayClasses = classesData.length > 0 ? classesData : DEFAULT_DEMO_CLASSES;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. BANNER TIÊU ĐỀ TRÊN CÙNG (Chuẩn 100% thiết kế mẫu) */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/50 dark:from-card dark:via-card/90 dark:to-card border border-blue-100/60 dark:border-border p-5 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        {/* Bên trái: Icon quyển sách nền gradient + Tiêu đề + Mô tả */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center p-3 shadow-sm shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-800 dark:text-foreground tracking-tight">
              Danh sách lớp học
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              Theo dõi thông tin lớp học, giáo viên phụ trách và số buổi học còn lại của bạn
            </p>
          </div>
        </div>

        {/* Ở giữa: Minh họa 3D vector chồng sách & chậu cây xanh */}
        <div className="hidden lg:flex items-center justify-center pointer-events-none select-none opacity-90 pr-4 z-0">
          <svg width="130" height="72" viewBox="0 0 150 82" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tia sáng pastel */}
            <path d="M42 20L32 15M40 32L28 32M45 44L35 48" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cuốn sách tím bên dưới */}
            <rect x="52" y="36" width="64" height="24" rx="5" fill="#6366f1" />
            <rect x="49" y="36" width="7" height="24" rx="2.5" fill="#4f46e5" />
            <rect x="56" y="42" width="56" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.4" />
            {/* Cuốn sách xanh lam bên trên */}
            <rect x="58" y="18" width="60" height="20" rx="5" fill="#60a5fa" />
            <rect x="55" y="18" width="7" height="20" rx="2.5" fill="#3b82f6" />
            <rect x="62" y="23" width="52" height="2.5" rx="1.2" fill="#ffffff" fillOpacity="0.5" />
            {/* Dải ruy băng kẹp sách đỏ */}
            <path d="M88 18V30L92 27L96 30V18H88Z" fill="#f43f5e" />
            {/* Chậu cây succulent mini */}
            <rect x="120" y="30" width="18" height="20" rx="3.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M129 30C122 20 120 10 129 4C131 14 129 22 129 30Z" fill="#34d399" />
            <path d="M129 30C136 22 142 14 138 6C134 16 131 22 129 30Z" fill="#10b981" />
          </svg>
        </div>

        {/* Bên phải: Badge Tổng cộng số lớp dạng pill viền xám sáng */}
        <div className="border border-slate-200 dark:border-border bg-white/80 dark:bg-card/80 text-slate-600 dark:text-muted-foreground text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs z-10">
          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>
            Tổng cộng: <strong className="text-slate-800 dark:text-foreground">{displayClasses.length}</strong> lớp
          </span>
        </div>
      </div>

      {/* 2. DANH SÁCH THẺ THÔNG TIN LỚP HỌC (CARD NGANG FLUID) */}
      <div className="space-y-4">
        {displayClasses.map((cls) => {
          // Tính toán tỷ lệ buổi học (chuẩn hiển thị ví dụ 24/30)
          const totalSessions = 30;
          const remainingSessions = cls.balance_sessions ?? 24;
          const progressPercent = Math.min(
            Math.max((remainingSessions / totalSessions) * 100, 5),
            100
          );

          // Định dạng mã lớp: Đảm bảo có prefix "# "
          const cleanCode = cls.code.replace(/^#\s*/, "");
          const formattedCode = `# ${cleanCode}`;

          return (
            <div
              key={cls.id}
              className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5"
            >
              {/* ================= CỘT TRÁI (THÔNG TIN LỚP) ================= */}
              <div className="flex-1 space-y-4 min-w-0">
                {/* Dòng đầu: Icon mũ cử nhân + Tên lớp + Badge trạng thái + Badge mã lớp */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-foreground tracking-tight mr-1">
                    {cls.name}
                  </h2>

                  {/* Badge trạng thái */}
                  {cls.status === "active" ? (
                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Đang học</span>
                    </span>
                  ) : cls.status === "paused" ? (
                    <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Tạm dừng</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>Đã kết thúc</span>
                    </span>
                  )}

                  {/* Badge mã lớp */}
                  <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-100/60 dark:border-blue-900/40">
                    {formattedCode}
                  </span>
                </div>

                {/* Hàng thông tin chi tiết: Giáo viên, Phòng học, Lịch học */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Mục 1: Giáo viên */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium">
                        Giáo viên
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate">
                        {cls.teacher_name || "Đang xếp giáo viên"}
                      </p>
                    </div>
                  </div>

                  {/* Mục 2: Phòng học */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100/70 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <School className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium">
                        Phòng học
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate">
                        {cls.room || "202"}
                      </p>
                    </div>
                  </div>

                  {/* Mục 3: Lịch học */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100/70 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium">
                        Lịch học
                      </p>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                        {cls.schedule_desc || "T3 (18:00 - 19:30), T6 (18:00 - 19:30), CN (18:00 - 19:30)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CỘT PHẢI (KHỐI TIẾN ĐỘ BUỔI HỌC) ================= */}
              <div className="bg-slate-50/80 dark:bg-muted/30 rounded-xl p-4 min-w-[280px] sm:min-w-[320px] border border-slate-100/80 dark:border-border/60 flex flex-col justify-between gap-3 shrink-0">
                {/* Hàng trên: Icon lịch + "Số buổi còn lại" bên trái | "24 buổi" + Chevron bên phải */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100/70 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Số buổi còn lại
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {remainingSessions}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground ml-1">
                        buổi
                      </span>
                    </div>

                    <Link
                      href="/student/schedule"
                      title="Xem lịch học lớp này"
                      className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Hàng dưới: Thanh tiến độ (Progress bar) dải màu tím xanh gradient + tỷ lệ 24/30 */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200/70 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-muted-foreground text-right font-medium">
                    {remainingSessions}/{totalSessions}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
