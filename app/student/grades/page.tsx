import { getStudentGrades } from "@/lib/actions/student";
import { StudentGradesClient } from "./grades-client";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bảng điểm & Đánh giá | Cổng Học sinh",
};

export default async function StudentGradesPage() {
  const summary = await getStudentGrades();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="rounded-3xl bg-gradient-to-r from-[#e0f2fe]/70 via-[#e0e7ff]/40 to-[#f3e8ff]/50 dark:from-card dark:via-card/90 dark:to-card border border-sky-100/80 dark:border-border p-6 sm:p-7 relative overflow-hidden flex items-center gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#38bdf8] via-[#3b82f6] to-[#6366f1] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
          <Award className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-foreground tracking-tight">
            Bảng điểm & Đánh giá
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
            Theo dõi kết quả học tập định kỳ, điểm số các bài kiểm tra và nhận xét chi tiết từ giáo viên
          </p>
        </div>
      </div>

      {/* 2. GIAO DIỆN TƯƠNG TÁC (CLIENT COMPONENT) */}
      <StudentGradesClient initialSummary={summary} />
    </div>
  );
}
