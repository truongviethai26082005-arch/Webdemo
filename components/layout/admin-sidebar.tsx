"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Receipt, 
  GraduationCap, 
  Wallet,
  LogOut,
  Sparkles,
  School
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    title: "Tổng quan Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Lớp học",
    href: "/admin/classes",
    icon: BookOpen,
  },
  {
    title: "Học sinh & Xếp lớp",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Đội ngũ Giáo viên",
    href: "/admin/teachers",
    icon: GraduationCap,
  },
  {
    title: "Tài chính & Thu phí",
    href: "/admin/finance",
    icon: Receipt,
  },
];

interface AdminSidebarProps {
  userFullName?: string;
  userEmail?: string;
}

export function AdminSidebar({ userFullName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-20">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-border/80 px-5 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 font-bold text-lg text-primary tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <School className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-foreground font-extrabold text-base tracking-tight">EduCenter</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Quản lý trung tâm</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Quản trị hệ thống
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
              {userFullName?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate text-foreground">{userFullName || "Quản trị viên"}</span>
              <span className="text-[10px] text-muted-foreground truncate">{userEmail || "admin"}</span>
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
