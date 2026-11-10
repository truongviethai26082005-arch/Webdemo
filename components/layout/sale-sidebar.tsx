"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  UserPlus,
  Clock,
  KeyRound,
  LogOut,
  School,
  Sparkles,
  MessageSquareWarning,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    title: "Lịch làm việc hôm nay",
    subtitle: "Gọi hẹn lại & Ca học thử",
    href: "/sale/daily-tasks",
    icon: CalendarCheck,
    badge: "Hôm nay",
  },
  {
    title: "Phễu Tuyển sinh",
    subtitle: "CRM, Học thử & Chốt đơn",
    href: "/sale/admissions",
    icon: UserPlus,
    badge: "CRM",
  },
  {
    title: "Học sinh chờ xếp lớp",
    subtitle: "Đã thanh toán, chờ mở lớp",
    href: "/sale/admissions/waiting-list",
    icon: Clock,
  },
  {
    title: "Học sinh Đã Chuyển đổi",
    subtitle: "Đăng ký thêm lớp mới",
    href: "/sale/students",
    icon: GraduationCap,
  },
  {
    title: "Tài khoản Học sinh",
    subtitle: "Cấp & Đặt lại mật khẩu",
    href: "/sale/accounts",
    icon: KeyRound,
  },
  {
    title: "Phản ánh & Góp ý",
    subtitle: "Tiếp nhận & theo dõi xử lý",
    href: "/sale/feedback",
    icon: MessageSquareWarning,
  },
  {
    title: "Báo cáo Tuyển sinh",
    subtitle: "Theo nguồn, thời gian & học thử",
    href: "/sale/reports",
    icon: BarChart3,
  },
];


interface SaleSidebarProps {
  userFullName?: string;
  userEmail?: string;
}

export function SaleSidebar({ userFullName, userEmail }: SaleSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-20 print:hidden no-print">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-border/80 px-5 flex items-center justify-between">
          <Link
            href="/sale/admissions"
            className="flex items-center gap-3 font-bold text-lg text-primary tracking-tight group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <School className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-foreground font-extrabold text-base tracking-tight">
                EduCenter
              </span>
              <span className="text-[11px] text-primary font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Tuyển sinh &amp; CSKH
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Nghiệp vụ Tuyển sinh
          </div>
          {NAV_ITEMS.map((item) => {
            const isExact = pathname === item.href;
            const isSub = item.href !== "/sale/admissions" && pathname.startsWith(item.href);
            const isAdmissionsRoot = item.href === "/sale/admissions" && pathname === "/sale/admissions";
            const isActive = isExact || isSub || isAdmissionsRoot;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="truncate">{item.title}</span>
                  {item.subtitle && (
                    <span
                      className={cn(
                        "text-[11px] font-normal truncate",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"
                      )}
                    >
                      {item.subtitle}
                    </span>
                  )}
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider",
                      isActive ? "bg-white/25 text-white" : "bg-primary/15 text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer with SAFE Logout Button */}
      <div className="p-3 border-t border-border/80 bg-muted/30">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/60 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
              {userFullName?.charAt(0) || "S"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate text-foreground">
                {userFullName || "Chuyên viên Tuyển sinh"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {userEmail || "sale@educenter.vn"}
              </span>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Đăng xuất khỏi hệ thống"
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
