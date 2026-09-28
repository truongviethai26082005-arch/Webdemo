import { getStudentAssignments } from "@/lib/actions/student";
import { StudentAssignmentsClient } from "./assignments-client";
import { CalendarCheck, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bài tập về nhà | Cổng Học sinh",
};

export default async function StudentAssignmentsPage() {
  const assignments = await getStudentAssignments();

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. BANNER TIÊU ĐỀ TRÊN CÙNG (Chuẩn thiết kế đồng bộ với Lớp học & Sidebar) */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/50 dark:from-card dark:via-card/90 dark:to-card border border-blue-100/60 dark:border-border p-5 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        {/* Bên trái: Icon + Tiêu đề + Mô tả phụ */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center p-3 shadow-sm shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-800 dark:text-foreground tracking-tight">
              Bài tập về nhà
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              Theo dõi danh sách bài tập về nhà, thời hạn nộp bài và nhận xét chấm điểm chi tiết từ giáo viên.
            </p>
          </div>
        </div>

        {/* Ở giữa: Minh họa 3D vector chồng sách & lọ bút */}
        <div className="hidden lg:flex items-center justify-center pointer-events-none select-none opacity-90 pr-4 z-0">
          <svg width="120" height="70" viewBox="0 0 130 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M38 52L26 56M32 40L20 40" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="42" y="38" width="56" height="22" rx="4" fill="#6366f1" />
            <rect x="40" y="38" width="5" height="22" rx="2" fill="#4f46e5" />
            <rect x="46" y="44" width="48" height="2.5" rx="1" fill="#ffffff" fillOpacity="0.4" />
            <rect x="46" y="24" width="52" height="18" rx="4" fill="#3b82f6" />
            <rect x="44" y="24" width="5" height="18" rx="2" fill="#2563eb" />
            <rect x="50" y="28" width="44" height="2" rx="1" fill="#ffffff" fillOpacity="0.5" />
            <rect x="88" y="22" width="18" height="22" rx="4" fill="#93c5fd" />
            <line x1="94" y1="10" x2="94" y2="24" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="8" x2="100" y2="24" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
            <line x1="106" y1="12" x2="106" y2="24" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bên phải: Badge Tổng cộng số bài tập dạng pill viền xám */}
        <div className="border border-slate-200 dark:border-border bg-white/80 dark:bg-card/80 text-slate-600 dark:text-muted-foreground text-xs px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs z-10">
          <Trophy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>
            Tổng cộng: <strong className="text-slate-800 dark:text-foreground">{assignments.length}</strong> bài tập
          </span>
        </div>
      </div>

      {/* 2. NỘI DUNG CHÍNH (CLIENT COMPONENT - 3 Thẻ thống kê & Thanh bộ lọc Tab giữ nguyên) */}
      <StudentAssignmentsClient initialAssignments={assignments} />
    </div>
  );
}
