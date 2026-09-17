"use client";

import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { Users, GraduationCap, CheckCircle2, HeartHandshake, UserX } from "lucide-react";

interface AdmissionsFunnelChartProps {
  stats: AdmissionsKpiStats;
}

interface FunnelStage {
  code: string;
  label: string;
  value: number;
  icon: typeof Users;
  fillClassName: string;
  textClassName: string;
}

// Kích thước hình học của phễu (đơn vị SVG = px logic, cố định để nhãn bên phải
// canh đúng theo từng dải mà không cần đo DOM).
const BAND_H = 44;
const GAP_H = 22;
const SVG_W = 160;
const MAX_BAND_W = 140;
// Dải cuối không có dải sau để thu hẹp theo -> tự thu nhỏ đáy 1 tỉ lệ cố định
// để vẫn giữ hình phễu (đáy nhọn hơn đỉnh), thuần túy thẩm mỹ, không đại diện số liệu.
const LAST_BAND_TAPER = 0.55;

export function AdmissionsFunnelChart({ stats }: AdmissionsFunnelChartProps) {
  const total = stats.totalLeads;

  // Phễu 3 giai đoạn (gộp hiển thị từ 6 giá trị LeadStage chi tiết ở
  // types/database.ts — xem lib/utils/admissions-funnel.ts):
  // GĐ1 Khách hàng tiềm năng (raw+potential, tất cả) -> GĐ2 Xếp lịch học thử
  // (trial) -> GĐ3 Ghi danh & chuyển đổi (conversion+enrolled+waiting_class).
  // Lưu ý: khách hàng có thể bỏ qua GĐ2 và chốt đơn thẳng từ GĐ1.
  const stages: FunnelStage[] = [
    {
      code: "1",
      label: "Khách hàng tiềm năng",
      value: total,
      icon: Users,
      fillClassName: "fill-amber-600",
      textClassName: "text-amber-700 dark:text-amber-400",
    },
    {
      code: "2",
      label: "Xếp lịch học thử",
      value:
        stats.trialCount + stats.conversionCount + stats.enrolledCount + stats.waitingClassCount,
      icon: GraduationCap,
      fillClassName: "fill-purple-600",
      textClassName: "text-purple-700 dark:text-purple-400",
    },
    {
      code: "3",
      label: "Ghi danh & chuyển đổi",
      value: stats.conversionCount + stats.enrolledCount + stats.waitingClassCount,
      icon: CheckCircle2,
      fillClassName: "fill-emerald-600",
      textClassName: "text-emerald-700 dark:text-emerald-400",
    },
  ];

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-card border border-dashed border-border p-10 flex flex-col items-center text-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Chưa có dữ liệu Lead</p>
          <p className="text-sm text-muted-foreground mt-1">
            Thêm khách hàng tiềm năng đầu tiên để bắt đầu theo dõi phễu chuyển đổi.
          </p>
        </div>
      </div>
    );
  }

  const widthFor = (value: number) => (total > 0 ? (value / total) * MAX_BAND_W : 0);
  const svgH = stages.length * BAND_H + (stages.length - 1) * GAP_H;

  const bands = stages.map((stage, i) => {
    const topW = widthFor(stage.value);
    const nextValue = i < stages.length - 1 ? stages[i + 1].value : stage.value * LAST_BAND_TAPER;
    const bottomW = i < stages.length - 1 ? widthFor(nextValue) : topW * LAST_BAND_TAPER;
    const y0 = i * (BAND_H + GAP_H);
    const y1 = y0 + BAND_H;
    const topL = (SVG_W - topW) / 2;
    const topR = topL + topW;
    const botL = (SVG_W - bottomW) / 2;
    const botR = botL + bottomW;
    return {
      ...stage,
      points: `${topL},${y0} ${topR},${y0} ${botR},${y1} ${botL},${y1}`,
    };
  });

  // 2 chỉ số phụ hiển thị dưới phễu — số thật suy ra từ dữ liệu, không bịa:
  const lostCount = stats.noDemandCount;
  const nurturingCount = Math.max(total - lostCount - stats.enrolledCount - stats.waitingClassCount, 0);

  return (
    <div className="rounded-2xl bg-card border border-border shadow-xs p-6 mb-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-foreground">Phễu chuyển đổi Tuyển sinh</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {total} hồ sơ Lead — số trên mỗi bậc là số hồ sơ đã từng đạt tới bậc đó
        </p>
      </div>

      <div className="flex items-stretch gap-4">
        <svg
          viewBox={`0 0 ${SVG_W} ${svgH}`}
          width={SVG_W}
          height={svgH}
          className="shrink-0"
          role="img"
          aria-label="Sơ đồ phễu chuyển đổi tuyển sinh"
        >
          {bands.map((b) => (
            <polygon key={b.code} points={b.points} className={b.fillClassName} />
          ))}
        </svg>

        <div className="flex-1 flex flex-col" style={{ height: svgH }}>
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const pctOfTotal = total > 0 ? Math.round((stage.value / total) * 100) : 0;
            const prevValue = i === 0 ? total : stages[i - 1].value;
            const pctOfPrev = prevValue > 0 ? Math.round((stage.value / prevValue) * 100) : 0;

            return (
              <div key={stage.code}>
                {i > 0 && (
                  <div style={{ height: GAP_H }} className="flex items-center pl-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      ↓ {pctOfPrev}% chuyển tiếp
                    </span>
                  </div>
                )}
                <div style={{ height: BAND_H }} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[11px] font-black shrink-0 ${stage.textClassName}`}>
                      {stage.code}
                    </span>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${stage.textClassName}`} />
                    <span className="text-xs font-bold text-foreground truncate">{stage.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black leading-none text-foreground">{stage.value}</div>
                    <div className="text-[11px] text-muted-foreground leading-none mt-0.5">
                      {pctOfTotal}% tổng số
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 chỉ số phụ ngoài phễu chính, giống N5 (Nuôi dưỡng) / N0 (Đã mất) */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-border/60">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-muted-foreground truncate">Đang chăm sóc</div>
            <div className="text-base font-black text-foreground leading-tight">{nurturingCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/40">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-muted-foreground truncate">Đã mất (không nhu cầu)</div>
            <div className="text-base font-black text-foreground leading-tight">{lostCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
