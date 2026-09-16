import { getStudentTests } from "@/lib/actions/student";
import { StudentTestsClient } from "./tests-client";
import { CalendarCheck, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lịch hẹn test & Thi thử định kỳ | Cổng Học sinh",
};

export default async function StudentTestsPage() {
  const data = await getStudentTests();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span>Lịch hẹn test & Thi thử định kỳ</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Theo dõi danh sách ca thi thử sắp tới, xem quy chế phòng thi và tra cứu kết quả đánh giá năng lực
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Khảo thí chuẩn hóa</span>
          </span>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-border text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <Link href="/student/dashboard" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. NỘI DUNG CHÍNH (CLIENT COMPONENT) */}
      <StudentTestsClient initialData={data} />
    </div>
  );
}
