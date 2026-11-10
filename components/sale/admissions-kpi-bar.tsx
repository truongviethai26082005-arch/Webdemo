"use client";

import { useState } from "react";
import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { Lead } from "@/types/database";
import { formatVND } from "@/lib/utils/vietqr";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, UserCheck, GraduationCap, CheckCircle2, TrendingUp, Clock } from "lucide-react";

interface AdmissionsKpiBarProps {
  stats: AdmissionsKpiStats;
  leads: Lead[];
  // leadId -> tổng học phí đã nộp (chỉ có với Lead đã chuyển đổi) — xem
  // getLeadPaymentsMap() trong lib/actions/admissions.ts.
  leadPayments: Record<string, number>;
  onSelectLead: (lead: Lead) => void;
}

const PREVIEW_LIMIT = 8;

// Phễu 3 tầng (gộp HIỂN THỊ, xem giải thích đầy đủ ở admissions-funnel-chart.tsx)
// — KPI bar vẫn giữ nguyên bản chất SNAPSHOT (đếm số Lead ĐANG ở đúng tầng
// hiện tại, khác với biểu đồ phễu dùng công thức LŨY KẾ) theo đúng quyết
// định đã chốt với chủ dự án trước đó — chỉ đổi số lượng/tên nhóm thẻ từ 4
// xuống 3, KHÔNG đổi lại công thức snapshot này.
export function AdmissionsKpiBar({ stats, leads, leadPayments, onSelectLead }: AdmissionsKpiBarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Điều kiện lọc PHẢI khớp chính xác công thức đã dùng để tính từng số ở
  // getAdmissionsKpiStats() (loại no_demand khỏi mọi bậc N đang hoạt động,
  // quy "inquiry" cũ về nhóm 1) — nếu không, số hiện trên thẻ và danh sách
  // xem nhanh khi bấm vào sẽ lệch nhau, gây hiểu nhầm y như bug đã gặp trước.
  const matchesN1 = (l: Lead) =>
    (l.stage === "raw" || l.stage === "potential" || (l.stage as string) === "inquiry") &&
    l.status !== "no_demand";
  const matchesN2 = (l: Lead) => l.stage === "trial" && l.status !== "no_demand";
  const matchesPending = (l: Lead) => l.stage === "conversion" && l.status !== "no_demand";
  const matchesConverted = (l: Lead) => l.stage === "enrolled" || l.stage === "waiting_class";

  const cards: {
    key: string;
    label: string;
    value: number | string;
    sub: string;
    icon: typeof Users;
    color: string;
    bg: string;
    borderColor: string;
    filter: ((l: Lead) => boolean) | null;
    showPayment?: boolean;
  }[] = [
    {
      key: "total",
      label: "Tổng số Lead",
      value: stats.totalLeads,
      sub: "Toàn bộ data tiếp nhận",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-900/50",
      filter: () => true,
    },
    {
      key: "n1",
      label: "1. Khách hàng tiềm năng",
      value: stats.rawCount + stats.potentialCount,
      sub: `${stats.rawCount} chưa liên hệ, ${stats.potentialCount} đã liên hệ`,
      icon: UserCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-900/50",
      filter: matchesN1,
    },
    {
      key: "n2",
      label: "2. Xếp lịch học thử",
      value: stats.trialCount,
      sub: "Đã xếp ca & chờ test",
      icon: GraduationCap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-900/50",
      filter: matchesN2,
    },
    {
      key: "pending",
      label: "3. Chờ chốt đơn",
      value: stats.conversionCount,
      sub: "Sẵn sàng ghi danh & chuyển đổi",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      borderColor: "border-indigo-200 dark:border-indigo-900/50",
      filter: matchesPending,
    },
    {
      key: "converted",
      label: "3. Đã chuyển đổi",
      value: stats.enrolledCount + stats.waitingClassCount,
      sub: `${stats.waitingClassCount} học sinh chờ xếp lớp`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
      filter: matchesConverted,
      showPayment: true,
    },
    {
      key: "rate",
      label: "Tỷ lệ chuyển đổi",
      value: `${stats.conversionRate}%`,
      sub: "Hiệu suất chốt gói",
      icon: TrendingUp,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      borderColor: "border-rose-200 dark:border-rose-900/50",
      // Là 1 tỷ lệ tính toán, không đại diện 1 nhóm Lead cụ thể riêng —
      // không có danh sách nào để xem nhanh, nên không cho bấm mở popover.
      filter: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const matched = c.filter ? leads.filter(c.filter) : [];

        const cardBody = (
          <div
            className={`p-4 rounded-2xl bg-card border ${c.borderColor} shadow-xs flex flex-col justify-between gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 text-left w-full ${
              c.filter ? "cursor-pointer" : ""
            }`}
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

        if (!c.filter) {
          return <div key={c.key}>{cardBody}</div>;
        }

        return (
          <Popover
            key={c.key}
            open={openKey === c.key}
            onOpenChange={(open) => setOpenKey(open ? c.key : null)}
          >
            <PopoverTrigger asChild>
              <button type="button">{cardBody}</button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="text-xs font-bold text-foreground">{c.label}</div>
                <div className="text-[11px] text-muted-foreground">{matched.length} học sinh/Lead</div>
              </div>
              {matched.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  Chưa có Lead nào ở nhóm này.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {matched.slice(0, PREVIEW_LIMIT).map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => {
                        setOpenKey(null);
                        onSelectLead(lead);
                      }}
                      className="w-full text-left p-3 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{lead.full_name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {lead.course_interest || "Chưa rõ môn"} • {lead.phone}
                        </div>
                      </div>
                      {c.showPayment && (
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {leadPayments[lead.id] ? formatVND(leadPayments[lead.id]) : "Chưa ghi nhận"}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {matched.length > PREVIEW_LIMIT && (
                <div className="p-2 text-[11px] text-center text-muted-foreground border-t border-border">
                  +{matched.length - PREVIEW_LIMIT} Lead khác — xem đầy đủ ở tab Leads
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
