import { getStudentAssignments } from "@/lib/actions/student";
import { StudentAssignmentsClient } from "./assignments-client";
import { BookCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bài tập & Tự luyện | Cổng Học sinh",
};

export default async function StudentAssignmentsPage() {
  const assignments = await getStudentAssignments();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookCheck className="w-4 h-4" />
            </div>
            <span>Bài tập & Tự luyện</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Xem danh sách bài tập về nhà, bài test định kỳ và nộp bài trực tiếp cho giáo viên
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-muted text-slate-700 dark:text-muted-foreground border border-slate-200/60 dark:border-border flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Tổng cộng: <strong className="text-blue-600 dark:text-blue-400">{assignments.length}</strong> bài tập</span>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH (CLIENT COMPONENT) */}
      <StudentAssignmentsClient initialAssignments={assignments} />
    </div>
  );
}
