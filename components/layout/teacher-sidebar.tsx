"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  BookOpen,
  FolderArchive,
  ClipboardList,
  Award,
  Wallet,
  User,
  LogOut,
  School,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const TEACHER_NAV_ITEMS = [
  {
    title: "Lịch dạy học",
    href: "/teacher/schedule",
    icon: Calendar,
  },
  {
    title: "Lớp học của tôi",
    href: "/teacher/classes",
    icon: BookOpen,
  },
  {
    title: "Tài nguyên học tập",
    href: "/teacher/resources",
    icon: FolderArchive,
  },
  {
    title: "Bài tập & Kiểm tra",
    href: "/teacher/assignments",
    icon: ClipboardList,
  },
  {
    title: "Chấm điểm & Nhận xét",
    href: "/teacher/grading",
    icon: Award,
  },
  {
    title: "Thù lao cá nhân",
    href: "/teacher/earnings",
    icon: Wallet,
  },
];

interface TeacherSidebarProps {
  userFullName?: string;
  userEmail?: string;
}

export function TeacherSidebar({ userFullName, userEmail }: TeacherSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-20">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-border/80 px-5 flex items-center justify-between">
          <Link href="/teacher/schedule" className="flex items-center gap-3 font-bold text-lg text-primary tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <School className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-foreground font-extrabold text-base tracking-tight">EduCenter</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Cổng Giáo Viên</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Không gian giảng dạy
          </div>
          {TEACHER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/teacher/schedule" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.title}</span>
                {isActive && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/80 bg-muted/30">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/60 shadow-xs hover:border-border transition-colors">
          <Link href="/teacher/profile" className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
              {userFullName?.charAt(0) || "T"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate text-foreground">{userFullName || "Giáo viên"}</span>
              <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <User className="w-2.5 h-2.5" /> Hồ sơ cá nhân
              </span>
            </div>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
