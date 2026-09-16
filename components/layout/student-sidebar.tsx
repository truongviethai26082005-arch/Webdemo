"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  Library,
  Award,
  CalendarCheck,
  Bell,
  MessageSquare,
  Settings,
  GraduationCap,
  LogOut,
  User,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const STUDENT_NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "TỔNG QUAN",
    items: [
      {
        title: "Tiến độ học tập",
        href: "/student/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupLabel: "HỌC TẬP & LỚP HỌC",
    items: [
      {
        title: "Lịch học",
        href: "/student/schedule",
        icon: Calendar,
      },
      {
        title: "Danh sách lớp học",
        href: "/student/classes",
        icon: BookOpen,
      },
      {
        title: "Bài tập & Tự luyện",
        href: "/student/assignments",
        icon: FileText,
      },
      {
        title: "Thư viện tài liệu",
        href: "/student/resources",
        icon: Library,
      },
    ],
  },
  {
    groupLabel: "KIỂM TRA & KẾT QUẢ",
    items: [
      {
        title: "Bảng điểm & Đánh giá",
        href: "/student/grades",
        icon: Award,
      },
      {
        title: "Lịch hẹn test",
        href: "/student/tests",
        icon: CalendarCheck,
      },
    ],
  },
  {
    groupLabel: "HỖ TRỢ & HỒ SƠ",
    items: [
      {
        title: "Tin tức & Cảnh báo",
        href: "/student/notifications",
        icon: Bell,
      },
      {
        title: "Gửi phản hồi",
        href: "/student/feedback",
        icon: MessageSquare,
      },
      {
        title: "Cài đặt tài khoản",
        href: "/student/settings",
        icon: Settings,
      },
    ],
  },
];

interface StudentSidebarProps {
  userFullName?: string;
  userEmail?: string;
}

export function StudentSidebar({
  userFullName = "Học viên",
  userEmail,
}: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-border bg-white dark:bg-card flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-20">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-100 dark:border-border/80 px-5 flex items-center justify-between shrink-0">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3 font-bold text-lg text-primary tracking-tight group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-foreground font-extrabold text-base tracking-tight">
                EduCenter
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                Cổng Học Viên
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {STUDENT_NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-muted-foreground/70 mb-1.5">
                {group.groupLabel}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/student/dashboard"
                      ? pathname === "/student/dashboard" || pathname === "/student"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold"
                          : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100/80 dark:hover:bg-muted/80 hover:text-slate-900 dark:hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive
                              ? "text-white"
                              : "text-slate-400 dark:text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-border/80 bg-slate-50/70 dark:bg-muted/20 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-200 dark:border-blue-800">
              {userFullName?.charAt(0)?.toUpperCase() || "H"}
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-xs font-bold truncate text-foreground">
                {userFullName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-blue-500" /> Học viên
              </span>
            </div>
          </div>
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
