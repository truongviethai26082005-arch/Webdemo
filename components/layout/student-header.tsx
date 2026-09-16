"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { signOut } from "@/lib/actions/auth";
import { Calendar, LogOut, GraduationCap } from "lucide-react";

interface StudentHeaderProps {
  studentName?: string;
}

export function StudentHeader({
  studentName = "Học viên",
}: StudentHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 border-b border-slate-200 dark:border-border bg-white/95 dark:bg-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-slate-100 dark:bg-muted/60 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-border/70 font-medium">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="capitalize">{todayFormatted}</span>
        </div>
      </div>

      {/* Right section: Student profile, Logout & Theme */}
      <div className="flex items-center gap-3">
        {/* Thông tin Học viên */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {studentName.charAt(0).toUpperCase() || "H"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground leading-tight max-w-[140px] truncate">
              {studentName}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 leading-none">
              <GraduationCap className="w-2.5 h-2.5" /> Học viên
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-border hidden sm:block" />

        {/* Nút Đăng xuất */}
        <form action={signOut}>
          <button
            type="submit"
            title="Đăng xuất"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-muted-foreground hover:text-destructive transition-colors px-2.5 py-1.5 rounded-lg hover:bg-destructive/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </form>

        <ThemeSwitcher />
      </div>
    </header>
  );
}
