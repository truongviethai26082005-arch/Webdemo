"use client";

import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { Users, UserCheck, GraduationCap, CheckCircle2, TrendingUp, Clock } from "lucide-react";

interface AdmissionsKpiBarProps {
  stats: AdmissionsKpiStats;
}

export function AdmissionsKpiBar({ stats }: AdmissionsKpiBarProps) {
  const cards = [
    {
      label: "Tổng số Lead",
      value: stats.totalLeads,
      sub: "Toàn bộ data tiếp nhận",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      label: "1. Khách hàng tiềm năng",
      value: stats.rawCount + stats.potentialCount,
      sub: `${stats.rawCount} chưa liên hệ, ${stats.potentialCount} đã liên hệ`,
      icon: UserCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      label: "2. Xếp lịch học thử",
      value: stats.trialCount,
      sub: "Đã xếp ca & chờ test",
      icon: GraduationCap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-900/50",
    },
    {
      label: "3. Chờ chốt đơn",
      value: stats.conversionCount,
      sub: "Sẵn sàng ghi danh & chuyển đổi",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      borderColor: "border-indigo-200 dark:border-indigo-900/50",
    },
    {
      label: "3. Đã chuyển đổi",
      value: stats.enrolledCount + stats.waitingClassCount,
      sub: `${stats.waitingClassCount} học sinh chờ xếp lớp`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
    {
      label: "Tỷ lệ chuyển đổi",
      value: `${stats.conversionRate}%`,
      sub: "Hiệu suất chốt gói",
      icon: TrendingUp,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      borderColor: "border-rose-200 dark:border-rose-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-card border ${c.borderColor} shadow-xs flex flex-col justify-between gap-3 transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground leading-snug">{c.label}</span>
              <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-foreground">{c.value}</div>
              <div className="text-xs text-muted-foreground/80 mt-1 leading-snug">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
