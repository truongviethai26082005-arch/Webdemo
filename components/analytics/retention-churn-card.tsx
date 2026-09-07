"use client";

import {
  Users,
  UserCheck,
  UserX,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RetentionMetricsData } from "@/types/analytics";

interface RetentionChurnCardProps {
  data: RetentionMetricsData;
}

export function RetentionChurnCard({ data }: RetentionChurnCardProps) {
  const isTargetAchieved = data.renewalRate >= data.renewalTarget;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground">
              Tỷ Lệ Giữ Chân Khách Hàng (Retention & Churn Rate)
            </h3>
            <Badge
              variant="outline"
              className={
                isTargetAchieved
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold"
              }
            >
              {isTargetAchieved ? "Đạt mục tiêu duy trì" : "Cần tăng cường chăm sóc"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đo lường mức độ trung thành của học viên, tỷ lệ tái tục học phí và nguyên nhân rút lui
          </p>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Đang theo dõi trên <strong className="text-foreground">{data.activeStudents}</strong> học viên
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Tỷ lệ tái tục học phí */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Tỷ lệ tái tục học phí (Renewal)
            </span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {data.renewalRate}%
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              (Mục tiêu: &gt;{data.renewalTarget}%)
            </span>
          </div>

          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(data.renewalRate, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Học viên tiếp tục nạp buổi sau khi hết gói
          </p>
        </div>

        {/* Metric 2: Thời gian gắn bó trung bình (Customer Lifetime) */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Vòng đời gắn bó TB (LTV)
            </span>
            <Clock className="w-4 h-4 text-primary" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary">
              {data.averageLifetimeMonths}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">tháng</span>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Tương đương trung bình <strong>{data.averagePackagesPerStudent} gói buổi</strong> học liên tục
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tập trung cao ở các lớp Luyện thi cấp tốc
          </p>
        </div>

        {/* Metric 3: Tỷ lệ rời bỏ (Churn Rate) */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Tỷ lệ rời bỏ (Churn Rate)
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {data.churnRate}%
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              ({data.churnCountThisMonth} học viên tháng này)
            </span>
          </div>

          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(data.churnRate * 5, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Mức chấp nhận được đối với trung tâm bổ trợ văn hóa
          </p>
        </div>
      </div>

      {/* AI Categorized Churn Reasons Breakdown */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/60 border border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Bảng Thống Kê Nguyên Nhân Rút Lui (AI Tổng Hợp Từ CRM & Nhật Ký Tư Vấn)
            </h4>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold">
            Tự động trích xuất
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {data.churnReasons.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-card border border-border/70 space-y-2 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-extrabold text-foreground leading-snug">
                  {item.reason}
                </span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 shrink-0">
                  {item.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
