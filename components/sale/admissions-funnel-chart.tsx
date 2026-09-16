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

  // Phễu 3 tầng theo yêu cầu chủ dự án (2026-09-16): gộp HIỂN THỊ từ 4 xuống
  // 3 khối — KHÔNG đổi cấu trúc dữ liệu LeadStage (vẫn giữ nguyên 6 giá trị
  // raw/potential/trial/conversion/enrolled/waiting_class ở types/database.ts
  // để không phải chạy thêm 1 migration DB nữa, và vẫn giữ được khả năng
  // phân biệt nội bộ chi tiết hơn khi cần). N1 Khách hàng tiềm năng = gộp
  // raw+potential (mọi Lead đều bắt đầu ở đây). N2 Xếp lịch học thử = gộp
  // trial+conversion (đã đăng ký học thử, kể cả đang chờ chốt sau học thử).
  // N3 Ghi danh & chuyển đổi = gộp enrolled+waiting_class (đã thanh toán).
  const stages: FunnelStage[] = [
    {
      code: "N1",
      label: "Khách hàng tiềm năng",
      value: total,
      icon: Users,
      fillClassName: "fill-slate-600",
      textClassName: "text-slate-700 dark:text-slate-400",
    },
    {
      code: "N2",
      label: "Xếp lịch học thử",
      value: stats.trialCount + stats.conversionCount + stats.enrolledCount + stats.waitingClassCount,
      icon: GraduationCap,
      fillClassName: "fill-purple-600",
      textClassName: "text-purple-700 dark:text-purple-400",
    },
    {
      code: "N3",
      label: "Ghi danh & chuyển đổi",
      value: stats.enrolledCount + stats.waitingClassCount,
      icon: CheckCircle2,
      fillClassName: "fill-emerald-600",
      textClassName: "text-emerald-700 dark:text-emerald-400",
    },
  ];

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 text-center text-sm text-muted-foreground mb-6">
        Chưa có dữ liệu Lead để hiển thị phễu chuyển đổi.
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
    <div className="rounded-2xl bg-card border border-border shadow-xs p-5 mb-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground">Phễu chuyển đổi Tuyển sinh</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
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
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      ↓ {pctOfPrev}% chuyển tiếp
                    </span>
                  </div>
                )}
                <div style={{ height: BAND_H }} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[10px] font-black shrink-0 ${stage.textClassName}`}>
                      {stage.code}
                    </span>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${stage.textClassName}`} />
                    <span className="text-xs font-bold text-foreground truncate">{stage.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black leading-none text-foreground">{stage.value}</div>
                    <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
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
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/60">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-muted-foreground truncate">Đang chăm sóc</div>
            <div className="text-base font-black text-foreground leading-tight">{nurturingCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/40">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-muted-foreground truncate">Đã mất (không nhu cầu)</div>
            <div className="text-base font-black text-foreground leading-tight">{lostCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
