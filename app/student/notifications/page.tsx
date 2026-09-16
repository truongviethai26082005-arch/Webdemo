import { getStudentNotifications } from "@/lib/actions/student";
import { StudentNotificationsClient } from "./notifications-client";
import { Bell, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tin tức & Cảnh báo | Cổng Học sinh",
};

export default async function StudentNotificationsPage() {
  const data = await getStudentNotifications();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <span>Tin tức & Cảnh báo</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Trung tâm thông báo học vụ, hạn chót nộp bài tập, cảnh báo buổi học và tin tức sự kiện
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Kênh thông báo chính thức</span>
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
      <StudentNotificationsClient initialData={data} />
    </div>
  );
}
