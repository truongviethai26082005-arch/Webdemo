import { getStudentProfileSettings } from "@/lib/actions/student";
import { StudentSettingsClient } from "./settings-client";
import { Settings, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cài đặt tài khoản | Cổng Học sinh",
};

export default async function StudentSettingsPage() {
  const data = await getStudentProfileSettings();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <span>Cài đặt tài khoản</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Quản lý hồ sơ học viên định danh và tùy chỉnh bảo mật mật khẩu cá nhân
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tài khoản chính chủ</span>
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

      {/* NỘI DUNG CHÍNH (CLIENT COMPONENT) */}
      <StudentSettingsClient initialProfile={data?.profile || null} />
    </div>
  );
}
