"use client";

import { useState, useTransition } from "react";
import { AdmissionsReportData, getAdmissionsReportData } from "@/lib/actions/admissions";
import { LeadSource } from "@/types/database";
import { formatVND } from "@/lib/utils/vietqr";
import {
  Users,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Loader2,
  BarChart3,
  Wallet,
  Award,
} from "lucide-react";

interface ReportsClientProps {
  initialData: AdmissionsReportData;
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  facebook_ads: "Facebook Ads",
  fanpage: "Fanpage",
  zalo: "Zalo",
  referral: "Giới thiệu",
  walkin: "Đến trực tiếp",
  hotline: "Hotline",
  other: "Khác",
};

const RANGE_PRESETS = [
  { label: "7 ngày qua", days: 7 },
  { label: "30 ngày qua", days: 30 },
  { label: "3 tháng qua", days: 90 },
  { label: "6 tháng qua", days: 180 },
];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatPeriodLabel(period: string, granularity: "day" | "month") {
  if (granularity === "month") {
    const [y, m] = period.split("-");
    return `T${m}/${y.slice(2)}`;
  }
  const [, m, d] = period.split("-");
  return `${d}/${m}`;
}

export function ReportsClient({ initialData }: ReportsClientProps) {
  const [data, setData] = useState<AdmissionsReportData>(initialData);
  const [activePreset, setActivePreset] = useState<number>(30);
  const [isPending, startTransition] = useTransition();

  const handlePresetChange = (days: number) => {
    setActivePreset(days);
    const today = new Date();
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - (days - 1));

    startTransition(async () => {
      const result = await getAdmissionsReportData(isoDate(from), isoDate(today));
      setData(result);
    });
  };

  const maxTrendValue = Math.max(1, ...data.trend.map((t) => t.newLeads));
  const maxRevenueTrend = Math.max(1, ...data.trend.map((t) => t.revenue));
  const maxSourceTotal = Math.max(1, ...data.bySource.map((s) => s.total));

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Bộ lọc khoảng thời gian */}
      <div className="flex flex-wrap items-center gap-2.5">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => handlePresetChange(p.days)}
            disabled={isPending}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              activePreset === p.days
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(data.dateFrom).toLocaleDateString("vi-VN")} —{" "}
          {new Date(data.dateTo).toLocaleDateString("vi-VN")}
        </span>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Tổng Lead mới</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{data.totalLeads}</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Đã chốt (Chính thức)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{data.totalConverted}</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Doanh thu</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-foreground truncate" title={formatVND(data.totalRevenue)}>
            {formatVND(data.totalRevenue)}
          </div>
          {data.totalConverted > 0 && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              TB {formatVND(data.avgRevenuePerConverted)}/học sinh
            </div>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Tỷ lệ chuyển đổi chung</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{data.overallRate}%</div>
        </div>
      </div>

      {/* Xu hướng theo thời gian */}
      <div className="rounded-2xl bg-card border border-border shadow-xs p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Xu hướng Lead mới theo {data.trendGranularity === "day" ? "ngày" : "tháng"}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> Lead mới
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Đã chốt
            </span>
          </div>
        </div>

        {data.trend.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">Chưa có dữ liệu trong khoảng này.</p>
        ) : (
          <div className="overflow-x-auto pt-4">
            <div className="flex items-end gap-2 h-40 min-w-max px-1">
              {data.trend.map((t) => (
                <div key={t.period} className="flex flex-col items-center gap-1 w-7 shrink-0">
                  <div className="flex items-end gap-0.5 h-32">
                    <div
                      className="w-2.5 rounded-t bg-primary"
                      style={{ height: `${Math.max((t.newLeads / maxTrendValue) * 100, t.newLeads > 0 ? 4 : 0)}%` }}
                      title={`${t.newLeads} Lead mới`}
                    />
                    <div
                      className="w-2.5 rounded-t bg-emerald-500"
                      style={{ height: `${Math.max((t.converted / maxTrendValue) * 100, t.converted > 0 ? 4 : 0)}%` }}
                      title={`${t.converted} đã chốt`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">
                    {formatPeriodLabel(t.period, data.trendGranularity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Doanh thu theo thời gian — biểu đồ riêng vì đơn vị (VNĐ) khác hẳn số lượng Lead,
          không gộp chung trục với biểu đồ trên để tránh sai lệch tỷ lệ. */}
      <div className="rounded-2xl bg-card border border-border shadow-xs p-5">
        <h3 className="text-base font-bold text-foreground flex items-center gap-1.5 mb-1">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          Doanh thu theo {data.trendGranularity === "day" ? "ngày" : "tháng"}
        </h3>
        {data.trend.length === 0 || data.totalRevenue === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Chưa ghi nhận doanh thu nào trong khoảng này.
          </p>
        ) : (
          <div className="overflow-x-auto pt-4">
            <div className="flex items-end gap-2 h-32 min-w-max px-1">
              {data.trend.map((t) => (
                <div key={t.period} className="flex flex-col items-center gap-1 w-7 shrink-0">
                  <div
                    className="w-4 rounded-t bg-amber-500"
                    style={{
                      height: `${Math.max((t.revenue / maxRevenueTrend) * 96, t.revenue > 0 ? 4 : 0)}px`,
                      minHeight: t.revenue > 0 ? "4px" : "0px",
                    }}
                    title={formatVND(t.revenue)}
                  />
                  <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">
                    {formatPeriodLabel(t.period, data.trendGranularity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiệu suất theo nguồn */}
        <div className="rounded-2xl bg-card border border-border shadow-xs p-5">
          <h3 className="text-base font-bold text-foreground mb-3">Hiệu suất theo nguồn Lead</h3>
          {data.bySource.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Chưa có Lead nào trong khoảng này.</p>
          ) : (
            <div className="space-y-3">
              {[...data.bySource]
                .sort((a, b) => b.total - a.total)
                .map((s) => (
                  <div key={s.source}>
                    <div className="flex items-center justify-between text-xs mb-1 gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{SOURCE_LABELS[s.source]}</span>
                      <span className="text-muted-foreground text-right">
                        {s.total} Lead · <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.converted} chốt</span> ·{" "}
                        <span className="font-bold text-foreground">{s.rate}%</span>
                        {s.revenue > 0 && (
                          <>
                            {" "}
                            · <span className="font-bold text-amber-600 dark:text-amber-400">{formatVND(s.revenue)}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max((s.total / maxSourceTotal) * 100, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Tỷ lệ chuyển đổi sau học thử */}
        <div className="rounded-2xl bg-card border border-border shadow-xs p-5">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            Chuyển đổi sau Học thử
          </h3>
          {data.trialConversion.reachedTrial === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Chưa có Lead nào đạt tới Học thử trong khoảng này.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-foreground">{data.trialConversion.rate}%</span>
                <span className="text-xs text-muted-foreground">
                  {data.trialConversion.convertedAfterTrial}/{data.trialConversion.reachedTrial} đã chốt sau học thử
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600"
                  style={{ width: `${data.trialConversion.rate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Trong số Lead đã tham gia học thử trở lên, bao nhiêu % đã chính thức đóng học phí — đo hiệu quả
                thật của buổi học thử.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hiệu suất & doanh thu theo Nhân viên Sale — chỉ thông tin, KHÔNG giới
          hạn quyền thao tác của ai với Lead nào (mọi Sale/Admin vẫn xem/xử lý
          được mọi Lead như cũ) — đúng yêu cầu "rõ ràng nhưng vẫn tối ưu nguồn lực". */}
      <div className="rounded-2xl bg-card border border-border shadow-xs p-5">
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-muted-foreground" />
          Hiệu suất &amp; Doanh thu theo Nhân viên Sale
        </h3>
        {data.bySalesperson.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Chưa có Lead nào được phân công cho nhân viên trong khoảng này.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="font-semibold py-2 pr-3">Nhân viên</th>
                  <th className="font-semibold py-2 pr-3 text-right">Lead phụ trách</th>
                  <th className="font-semibold py-2 pr-3 text-right">Đã chốt</th>
                  <th className="font-semibold py-2 pr-3 text-right">Tỷ lệ</th>
                  <th className="font-semibold py-2 text-right">Doanh thu mang về</th>
                </tr>
              </thead>
              <tbody>
                {data.bySalesperson.map((s) => (
                  <tr key={s.saleId} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-bold text-foreground">{s.saleName}</td>
                    <td className="py-2 pr-3 text-right text-foreground">{s.total}</td>
                    <td className="py-2 pr-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {s.converted}
                    </td>
                    <td className="py-2 pr-3 text-right text-foreground">{s.rate}%</td>
                    <td className="py-2 text-right font-bold text-amber-600 dark:text-amber-400">
                      {formatVND(s.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-3">
          Chỉ mang tính tổng hợp/tham khảo — mọi nhân viên Sale/Admin vẫn xem và xử lý được tất cả
          Lead như bình thường, không bị giới hạn theo bảng phân công này.
        </p>
      </div>
    </div>
  );
}
