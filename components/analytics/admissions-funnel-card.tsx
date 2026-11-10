"use client";

import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { HeartHandshake, UserX } from "lucide-react";

interface AdmissionsFunnelCardProps {
  stats?: AdmissionsKpiStats | null;
}

// Kích thước SVG phễu (logic px)
const BAND_H = 46;
const GAP_H = 22;
const SVG_W = 160;
const MAX_BAND_W = 140;

export function AdmissionsFunnelCard({ stats }: AdmissionsFunnelCardProps) {
  // ─── SỐ LIỆU ĐỘNG 100% TỪ DATABASE (KHÔNG MOCK / FALLBACK) ───
  // Tầng 1 (Khách hàng tiềm năng): Lấy từ totalLeads (dữ liệu thật hiện tại là 21)
  const totalLeads = stats?.totalLeads ?? 0;

  // Tầng 2 (Xếp lịch học thử): Lấy từ số lượng lead có lịch học thử thật trong database.
  // Nếu rỗng/chưa có thì hiển thị 0 và 0%
  const trialCount = stats?.everTrialCount ?? 0;

  // Tầng 3 (Ghi danh & chuyển đổi): Lấy từ convertedLeads (enrolled + waiting_class = 2 + 1 = 3)
  const convertedLeads = (stats?.enrolledCount ?? 0) + (stats?.waitingClassCount ?? 0);

  // Tỷ lệ chuyển đổi cuối: Lấy từ conversionRate (dữ liệu thật hiện tại là 14%)
  const conversionRate = stats?.conversionRate ?? (totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0);

  // Tỷ lệ phần trăm ↓ % chuyển tiếp: Tính toán động từ các biến số thực tế, mẫu số = 0 thì hiển thị 0%
  const transitionRate1to2 = totalLeads > 0 ? Math.round((trialCount / totalLeads) * 100) : 0;
  const transitionRate2to3 = trialCount > 0 ? Math.round((convertedLeads / trialCount) * 100) : 0;

  // Tỷ lệ % so với tổng số Lead
  const trialPercent = totalLeads > 0 ? Math.round((trialCount / totalLeads) * 100) : 0;
  const convertedPercent = conversionRate; // Hiện tại là 14% tổng số

  // 3 tầng hình học phễu (Tầng 1: Cam, Tầng 2: Tím, Tầng 3: Xanh lá)
  const svgH = 3 * BAND_H + 2 * GAP_H;

  // Tọa độ các khối hình thang theo tỷ lệ trực quan
  const top1 = MAX_BAND_W;
  const bot1 = totalLeads > 0 && trialCount > 0 ? Math.max((trialCount / totalLeads) * MAX_BAND_W, 90) : 95;
  const top2 = bot1;
  const bot2 = totalLeads > 0 && convertedLeads > 0 ? Math.max((convertedLeads / totalLeads) * MAX_BAND_W, 60) : 65;
  const top3 = bot2;
  const bot3 = Math.max(bot2 * 0.55, 36);

  const getPoints = (topW: number, botW: number, bandIndex: number) => {
    const y0 = bandIndex * (BAND_H + GAP_H);
    const y1 = y0 + BAND_H;
    const topL = (SVG_W - topW) / 2;
    const topR = topL + topW;
    const botL = (SVG_W - botW) / 2;
    const botR = botL + botW;
    return `${topL},${y0} ${topR},${y0} ${botR},${y1} ${botL},${y1}`;
  };

  const bandPoints = [
    getPoints(top1, bot1, 0),
    getPoints(top2, bot2, 1),
    getPoints(top3, bot3, 2),
  ];

  // 2 chỉ số phụ (Đang chăm sóc / Đã mất)
  const lostCount = stats?.noDemandCount || 0;
  const nurturingCount = Math.max(
    totalLeads - lostCount - (stats?.enrolledCount || 0) - (stats?.waitingClassCount || 0),
    0
  );

  return (
    <div className="rounded-2xl bg-card border border-border/80 shadow-soft p-5 sm:p-6">
      {/* 1. Header khối */}
      <div className="mb-6 pb-4 border-b border-border/60">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Phễu chuyển đổi Tuyển sinh
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {totalLeads} hồ sơ Lead — số trên mỗi bậc là số hồ sơ đã từng đạt tới bậc đó
        </p>
      </div>

      {/* 2. Bố cục hiển thị (Chia 3 phần ngang) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
        {/* Cột bên trái: Đồ họa hình khối phễu cắt làm 3 tầng màu */}
        <div className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-slate-50/50 dark:bg-card/40 border border-border/50">
          <svg
            viewBox={`0 0 ${SVG_W} ${svgH}`}
            width={SVG_W}
            height={svgH}
            className="shrink-0 drop-shadow-xs"
            role="img"
            aria-label="Đồ họa hình khối phễu chuyển đổi tuyển sinh 3 tầng màu"
          >
            <defs>
              {/* Tầng 1: Khối phễu hình thang ngược màu Cam */}
              <linearGradient id="funnel-orange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              {/* Tầng 2: Khối hình chữ nhật/hình thang nhỏ màu Tím */}
              <linearGradient id="funnel-purple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
              {/* Tầng 3: Khối đáy phễu màu Xanh lá */}
              <linearGradient id="funnel-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Tầng 1: Cam */}
            <polygon
              points={bandPoints[0]}
              fill="url(#funnel-orange)"
              className="transition-all duration-300 hover:opacity-90"
            />
            {/* Tầng 2: Tím */}
            <polygon
              points={bandPoints[1]}
              fill="url(#funnel-purple)"
              className="transition-all duration-300 hover:opacity-90"
            />
            {/* Tầng 3: Xanh lá */}
            <polygon
              points={bandPoints[2]}
              fill="url(#funnel-green)"
              className="transition-all duration-300 hover:opacity-90"
            />
          </svg>
        </div>

        {/* Cột ở giữa (Nhãn từng bậc & Tỷ lệ chuyển tiếp) + Cột bên phải (Chỉ số chi tiết căn phải) */}
        <div className="flex-1 w-full flex flex-col justify-between py-1" style={{ minHeight: svgH }}>
          {/* ──────────────── BẬC 1: Khách hàng tiềm năng ──────────────── */}
          <div className="flex flex-col justify-center">
            <div
              style={{ height: BAND_H }}
              className="flex items-center justify-between gap-4 px-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/35 transition-colors"
            >
              {/* Cột giữa: 1 👤 Khách hàng tiềm năng */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border bg-orange-500/10 text-orange-600 border-orange-500/30">
                  1
                </span>
                <span className="text-sm shrink-0" role="img" aria-label="Khách hàng">
                  👤
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                  Khách hàng tiềm năng
                </span>
              </div>

              {/* Cột phải: Số lượng tầng 1 + 100% tổng số */}
              <div className="text-right shrink-0">
                <div className="text-lg font-black leading-tight text-foreground font-mono">
                  {totalLeads}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  100% tổng số
                </div>
              </div>
            </div>
          </div>

          {/* Tỷ lệ chuyển tiếp giữa Bậc 1 và Bậc 2: ↓ {transitionRate1to2}% chuyển tiếp */}
          <div
            style={{ height: GAP_H }}
            className="flex items-center pl-7 text-[11px] font-semibold text-muted-foreground"
          >
            <span>↓ {transitionRate1to2}% chuyển tiếp</span>
          </div>

          {/* ──────────────── BẬC 2: Xếp lịch học thử ──────────────── */}
          <div className="flex flex-col justify-center">
            <div
              style={{ height: BAND_H }}
              className="flex items-center justify-between gap-4 px-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/35 transition-colors"
            >
              {/* Cột giữa: 2 🎓 Xếp lịch học thử */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border bg-purple-500/10 text-purple-600 border-purple-500/30">
                  2
                </span>
                <span className="text-sm shrink-0" role="img" aria-label="Học thử">
                  🎓
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                  Xếp lịch học thử
                </span>
              </div>

              {/* Cột phải: Số lượng tầng 2 + {trialPercent}% tổng số */}
              <div className="text-right shrink-0">
                <div className="text-lg font-black leading-tight text-foreground font-mono">
                  {trialCount}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {trialPercent}% tổng số
                </div>
              </div>
            </div>
          </div>

          {/* Tỷ lệ chuyển tiếp giữa Bậc 2 và Bậc 3: ↓ {transitionRate2to3}% chuyển tiếp */}
          <div
            style={{ height: GAP_H }}
            className="flex items-center pl-7 text-[11px] font-semibold text-muted-foreground"
          >
            <span>↓ {transitionRate2to3}% chuyển tiếp</span>
          </div>

          {/* ──────────────── BẬC 3: Ghi danh & chuyển đổi ──────────────── */}
          <div className="flex flex-col justify-center">
            <div
              style={{ height: BAND_H }}
              className="flex items-center justify-between gap-4 px-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/35 transition-colors"
            >
              {/* Cột giữa: 3 🎓 Ghi danh & chuyển đổi */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  3
                </span>
                <span className="text-sm shrink-0" role="img" aria-label="Ghi danh">
                  🎓
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                  Ghi danh &amp; chuyển đổi
                </span>
              </div>

              {/* Cột phải: Số lượng tầng 3 + {convertedPercent}% tổng số */}
              <div className="text-right shrink-0">
                <div className="text-lg font-black leading-tight text-foreground font-mono">
                  {convertedLeads}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {convertedPercent}% tổng số
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 chỉ số phụ dưới phễu: Đang chăm sóc & Đã mất */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/60">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground truncate">Đang chăm sóc</p>
            <p className="text-base font-black text-foreground font-mono leading-tight">{nurturingCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground truncate">Đã mất (không nhu cầu)</p>
            <p className="text-base font-black text-foreground font-mono leading-tight">{lostCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
