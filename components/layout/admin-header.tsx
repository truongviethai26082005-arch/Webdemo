"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Calendar, Bell } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border/70 font-medium">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="capitalize">{todayFormatted}</span>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <div className="h-5 w-[1px] bg-border hidden sm:block" />

        <ThemeSwitcher />
      </div>
    </header>
  );
}
