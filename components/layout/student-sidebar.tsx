"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Library,
  Trophy,
  BarChart3,
  CalendarCheck,
  Bell,
  HelpCircle,
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
        title: "Trang chủ học tập",
        href: "/student/dashboard",
        icon: Home,
      },
      {
        title: "Học tập & Lớp học",
        href: "/student/classes",
        icon: BookOpen,
      },
      {
        title: "Lịch học",
        href: "/student/schedule",
        icon: Calendar,
      },
      {
        title: "Danh sách lớp học",
        href: "/student/classes",
        icon: Users,
      },
      {
        title: "Bài tập & Tài liệu",
        href: "/student/assignments",
        icon: FileText,
      },
      {
        title: "Thư viện tài liệu",
        href: "/student/resources",
        icon: Library,
      },
      {
        title: "Kiểm tra & Kết quả",
        href: "/student/tests",
        icon: Trophy,
      },
      {
        title: "Bảng điểm & Đánh giá",
        href: "/student/grades",
        icon: BarChart3,
      },
      {
        title: "Lịch hẹn test",
        href: "/student/tests",
        icon: CalendarCheck,
      },
    ],
  },
  {
    groupLabel: "HỖ TRỢ & HỌC VỤ",
    items: [
      {
        title: "Tin tức & Cảnh báo",
        href: "/student/notifications",
        icon: Bell,
      },
      {
        title: "Câu hỏi thường gặp",
        href: "/student/feedback",
        icon: HelpCircle,
      },
    ],
  },
];

interface StudentSidebarProps {
  userFullName?: string;
  userEmail?: string;
}

export function StudentSidebar({
  userFullName = "Mai Phùn",
  userEmail,
}: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200/70 dark:border-border bg-white dark:bg-card flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-20 border-b border-slate-100 dark:border-border/80 px-6 flex items-center shrink-0">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-slate-900 dark:text-foreground font-extrabold text-lg tracking-tight">
                EduCenter
              </span>
              <span className="text-[11px] text-slate-400 dark:text-muted-foreground font-normal tracking-tight mt-0.5">
                Học hôm nay - Kiến tạo ngày mai
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
          {STUDENT_NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-muted-foreground/70 mb-2">
                {group.groupLabel}
              </div>
              <div className="space-y-1">
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
                        "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all group",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted/60 hover:text-slate-900 dark:hover:text-foreground font-medium"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-muted-foreground group-hover:text-slate-700 dark:group-hover:text-foreground"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide",
                            isActive
                              ? "bg-blue-600 text-white"
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
      <div className="p-3.5 border-t border-slate-100 dark:border-border/80 bg-slate-50/50 dark:bg-muted/10 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-card border border-slate-200/70 dark:border-border shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
              {userFullName?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-xs font-bold truncate text-slate-800 dark:text-foreground">
                {userFullName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-muted-foreground truncate flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-blue-600" /> Sinh viên
              </span>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
