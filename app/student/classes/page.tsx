import { getStudentClasses } from "@/lib/actions/student";
import {
  BookOpen,
  User,
  School,
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lớp học của tôi | Cổng Học sinh",
};

export default async function StudentClassesPage() {
  const classes = await getStudentClasses();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>Lớp học của tôi</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Theo dõi thông tin lớp học, giáo viên phụ trách và số buổi học còn lại của bạn
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-muted text-slate-700 dark:text-muted-foreground shrink-0 self-start sm:self-auto border border-slate-200/60 dark:border-border">
          Tổng cộng: <span className="text-blue-600 dark:text-blue-400">{classes.length}</span> lớp
        </div>
      </div>

      {/* 2. LƯỚI THẺ LỚP HỌC (GRID CARDS) */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isLowBalance = cls.balance_sessions <= 2;
            const isNegative = cls.balance_sessions < 0;

            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between gap-4"
              >
                {/* Phần đầu thẻ: Tên lớp, mã lớp, trạng thái */}
                <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-border/60">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="text-base font-bold text-foreground leading-snug line-clamp-1"
                      title={cls.name}
                    >
                      {cls.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mã lớp */}
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground border border-slate-200/60 dark:border-border">
                      {cls.code}
                    </span>

                    {/* Trạng thái ghi danh */}
                    {cls.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đang học</span>
                      </span>
                    ) : cls.status === "paused" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                        <span>Tạm dừng</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-muted dark:text-muted-foreground">
                        <span>Đã kết thúc</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Phần thân: Giáo viên, phòng học, lịch học định kỳ */}
                <div className="space-y-2.5 text-xs text-muted-foreground py-1 flex-1">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">
                      GV:{" "}
                      <strong className="text-foreground font-semibold">
                        {cls.teacher_name || "Đang xếp giáo viên"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <School className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Phòng:{" "}
                      <strong className="text-foreground font-semibold">
                        {cls.room || "Học trực tiếp tại trung tâm"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Lịch học:{" "}
                      <strong className="text-foreground font-semibold">
                        {cls.schedule_desc}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Phần chân thẻ (Footer nổi bật): Số buổi còn lại */}
                <div
                  className={cn(
                    "rounded-xl p-3 border transition-colors flex items-center justify-between gap-2",
                    isNegative
                      ? "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-300"
                      : isLowBalance
                      ? "bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300"
                      : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isLowBalance ? (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 truncate">
                        {isNegative
                          ? "Nợ học phí khẩn cấp"
                          : isLowBalance
                          ? "Sắp hết buổi học"
                          : "Số buổi còn lại"}
                      </span>
                      <span className="text-xs font-semibold truncate">
                        {isLowBalance ? "Vui lòng gia hạn sớm" : "Đang duy trì tốt"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black leading-none">
                      {cls.balance_sessions}
                    </span>
                    <span className="text-[11px] font-semibold ml-1">buổi</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3. TRẠNG THÁI RỖNG (EMPTY STATE) */
        <div className="bg-white dark:bg-card rounded-2xl border border-dashed border-slate-200 dark:border-border p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Bạn chưa tham gia lớp học nào
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Khi được trung tâm xếp lớp hoặc đăng ký môn học mới, thông tin lớp học, giáo viên và số buổi còn lại sẽ hiển thị tại đây.
          </p>
        </div>
      )}
    </div>
  );
}
