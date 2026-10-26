"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { signOut } from "@/lib/actions/auth";
import { Calendar, LogOut, ChevronDown, Bell, GraduationCap, Settings } from "lucide-react";

interface StudentHeaderProps {
  studentName?: string;
}

export function StudentHeader({
  studentName = "Mai Phùn",
}: StudentHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Format ngày theo chuẩn ảnh mẫu: "Thứ Tư, 16 Tháng 9, 2026"
  const now = new Date();
  const rawDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  // Viết hoa chữ cái đầu và định dạng đẹp
  const todayFormatted = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return (
    <header className="h-20 bg-transparent px-8 flex items-center justify-end sticky top-0 z-30">
      {/* Right section: Date Pill + User Profile */}
      <div className="flex items-center gap-4">
        {/* Date Pill */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white dark:bg-card border border-slate-200/80 dark:border-border px-4 py-2 rounded-2xl text-xs font-medium text-slate-600 dark:text-muted-foreground shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-muted-foreground" />
          <span>{todayFormatted}</span>
        </div>

        {/* User Profile Pill / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1 sm:pr-3 rounded-full hover:bg-white/80 dark:hover:bg-card/80 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {studentName?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-foreground leading-tight">
                {studentName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-muted-foreground font-normal leading-tight mt-0.5">
                Sinh viên
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5" />
          </button>

          {/* User Menu Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card rounded-2xl shadow-lg border border-slate-200/80 dark:border-border p-2 space-y-1 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-border/80 sm:hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-foreground">{studentName}</p>
                <p className="text-[10px] text-slate-400">Sinh viên</p>
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600 dark:text-muted-foreground">
                <span>Giao diện</span>
                <ThemeSwitcher />
              </div>

              <Link
                href="/student/notifications"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted rounded-xl transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Thông báo học tập</span>
              </Link>

              <Link
                href="/student/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted rounded-xl transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Cài đặt tài khoản</span>
              </Link>

              <form action={signOut} className="pt-1 border-t border-slate-100 dark:border-border/80">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
