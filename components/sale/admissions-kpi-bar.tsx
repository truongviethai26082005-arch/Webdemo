"use client";

import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { Users, PhoneCall, GraduationCap, CheckCircle2, TrendingUp, Clock } from "lucide-react";

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
      label: "Đang tư vấn",
      value: stats.inquiryCount,
      sub: "Chưa xếp lịch học thử",
      icon: PhoneCall,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      label: "Đang học thử",
      value: stats.trialCount,
      sub: "Đã xếp ca & chờ test",
      icon: GraduationCap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-900/50",
    },
    {
      label: "Chờ chốt đơn",
      value: stats.conversionCount,
      sub: "Đã học thử, chờ phụ huynh",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      borderColor: "border-indigo-200 dark:border-indigo-900/50",
    },
    {
      label: "Ghi danh thành công",
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3.5 rounded-2xl bg-card border ${c.borderColor} shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
              <div className={`w-7 h-7 rounded-lg ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-foreground">{c.value}</div>
              <div className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
