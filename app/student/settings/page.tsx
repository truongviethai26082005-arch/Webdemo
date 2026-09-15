import Link from "next/link";
import {
  Settings,
  Sparkles,
  ArrowLeft,
  KeyRound,
  UserCheck,
  BellRing,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cài đặt tài khoản | Cổng Học sinh",
};

export default function StudentSettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <span>Cài đặt tài khoản</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Quản lý thông tin tài khoản, bảo mật mật khẩu và tùy chọn nhận thông báo
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            <span>Đang phát triển</span>
          </span>
        </div>
      </div>

      {/* 2. KHUNG THÔNG BÁO TÍNH NĂNG ĐANG ĐƯỢC PHÁT TRIỂN */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-8 md:p-12 shadow-xs text-center flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-700/25">
            <Settings className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Tính năng đang được phát triển
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Khu vực quản lý hồ sơ cá nhân và bảo mật tài khoản đang được hoàn thiện các tiện ích tự phục vụ:
          </p>
        </div>

        {/* Danh sách tính năng dự kiến */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Đổi mật khẩu</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Chủ động cập nhật mật khẩu đăng nhập an toàn</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Hồ sơ cá nhân</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Xác nhận số điện thoại phụ huynh và địa chỉ liên hệ</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Kênh nhận tin</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tùy chọn nhận thông báo qua Zalo, SMS hoặc Email</p>
            </div>
          </div>
        </div>

        {/* Nút quay về Dashboard */}
        <div className="pt-2">
          <Button asChild variant="outline" className="rounded-xl gap-2 text-xs font-bold">
            <Link href="/student/dashboard">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về Tiến độ học tập</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
