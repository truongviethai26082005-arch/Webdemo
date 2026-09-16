"use client";

import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { Users, GraduationCap, CheckCircle2, TrendingUp } from "lucide-react";

interface AdmissionsKpiBarProps {
  stats: AdmissionsKpiStats;
}

// Phễu 3 tầng (gộp HIỂN THỊ, xem giải thích đầy đủ ở admissions-funnel-chart.tsx)
// — KPI bar vẫn giữ nguyên bản chất SNAPSHOT (đếm số Lead ĐANG ở đúng tầng
// hiện tại, khác với biểu đồ phễu dùng công thức LŨY KẾ) theo đúng quyết
// định đã chốt với chủ dự án trước đó — chỉ đổi số lượng/tên nhóm thẻ từ 4
// xuống 3, KHÔNG đổi lại công thức snapshot này.
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
      label: "N1. Khách hàng tiềm năng",
      value: stats.rawCount + stats.potentialCount,
      sub: "Đang chăm sóc, chưa xếp học thử",
      icon: Users,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10",
      borderColor: "border-slate-200 dark:border-slate-800/50",
    },
    {
      label: "N2. Xếp lịch học thử",
      value: stats.trialCount + stats.conversionCount,
      sub: `${stats.conversionCount} đã học thử, chờ chốt`,
      icon: GraduationCap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-900/50",
    },
    {
      label: "N3. Ghi danh & chuyển đổi",
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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
