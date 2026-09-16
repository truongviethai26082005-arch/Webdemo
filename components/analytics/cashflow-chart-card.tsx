"use client";

import { useState } from "react";
import {
  TrendingUp,
  Banknote,
  DollarSign,
  ArrowUpRight,
  Flame,
  Calendar,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CashFlowMonthItem } from "@/types/analytics";
import { formatVND } from "@/lib/utils/vietqr";

interface CashFlowChartCardProps {
  data?: CashFlowMonthItem[];
}

export function CashFlowChartCard({ data }: CashFlowChartCardProps) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-card/50 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
          <Banknote className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Chưa có dữ liệu dòng tiền
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Chưa phát sinh giao dịch thu chi nào trong kỳ báo cáo để vẽ biểu đồ dòng tiền.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-medium"
        >
          Chưa có dữ liệu
        </Badge>
      </div>
    );
  }

  const safeData = data;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(Math.min(6, safeData.length - 1));

  // Chart dimensions in SVG coordinates
  const svgWidth = 760;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Max value for scaling
  const maxVal = Math.max(...safeData.map((d) => Math.max(d.revenue || 0, d.expense || 0)), 70000000);
  const minVal = 0;

  // Calculate points for Revenue and Expense
  const pointsRevenue = safeData.map((item, i) => {
    const denom = Math.max(1, safeData.length - 1);
    const x = paddingX + (i / denom) * chartWidth;
    const y = svgHeight - paddingY - ((item.revenue || 0) / maxVal) * chartHeight;
    return { x, y, item, i };
  });

  const pointsExpense = safeData.map((item, i) => {
    const denom = Math.max(1, safeData.length - 1);
    const x = paddingX + (i / denom) * chartWidth;
    const y = svgHeight - paddingY - ((item.expense || 0) / maxVal) * chartHeight;
    return { x, y, item, i };
  });

  const pathRevenue = pointsRevenue.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const lastPointRev = pointsRevenue[pointsRevenue.length - 1] || { x: chartWidth, y: svgHeight - paddingY };
  const firstPointRev = pointsRevenue[0] || { x: paddingX, y: svgHeight - paddingY };
  const areaRevenue = `${pathRevenue} L ${lastPointRev.x} ${svgHeight - paddingY} L ${firstPointRev.x} ${svgHeight - paddingY} Z`;

  const pathExpense = pointsExpense.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const totalYearRevenue = safeData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalYearExpense = safeData.reduce((sum, d) => sum + (d.expense || 0), 0);
  const netYearCashFlow = totalYearRevenue - totalYearExpense;

  const fallbackIdx = Math.min(6, pointsRevenue.length - 1);
  const activeIdx = hoveredIndex !== null && hoveredIndex < pointsRevenue.length ? hoveredIndex : fallbackIdx;
  const activePoint = pointsRevenue[activeIdx] || pointsRevenue[0];
  const activeExpensePoint = pointsExpense[activeIdx] || pointsExpense[0];

  return (
    <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Báo Cáo Dòng Tiền Vận Hành (Cash Flow Dynamics)
            </h3>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.2 rounded-md border border-slate-300 dark:border-slate-700">
              12 Tháng
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Biến động Doanh thu thực thu so sánh với Tổng chi phí (Lương giáo viên + Chi phí cố định)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-foreground">Doanh thu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-muted-foreground">Chi phí</span>
          </div>
        </div>
      </div>

      {/* Summary 3 KPIs - Nền trắng trung tính, viền border-slate-300 rõ nét */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Tổng thực thu cả năm
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatVND(totalYearRevenue)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Tổng chi phí cả năm
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatVND(totalYearExpense)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Dòng tiền ròng thặng dư
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            +{formatVND(netYearCashFlow)}
          </div>
        </div>
      </div>

      {/* Interactive SVG Line Chart */}
      <div className="relative p-2 rounded-xl bg-slate-50/70 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Area gradient under revenue curve */}
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 20000000, 40000000, 60000000].map((val, idx) => {
            const y = svgHeight - paddingY - (val / maxVal) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="currentColor"
                  className="fill-muted-foreground font-semibold"
                >
                  {val === 0 ? "0" : `${val / 1000000}tr`}
                </text>
              </g>
            );
          })}

          {/* Revenue Area Fill */}
          <path d={areaRevenue} fill="url(#revenueGrad)" />

          {/* Expense Line (Rose/Gray) */}
          <path
            d={pathExpense}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            strokeLinecap="round"
            className="opacity-75"
          />

          {/* Revenue Line (Emerald) */}
          <path
            d={pathRevenue}
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover guideline line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={svgHeight - paddingY}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-60"
            />
          )}

          {/* Points & Interactive circles */}
          {pointsRevenue.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isPeak = p.item.isPeak;

            return (
              <g key={idx} className="cursor-pointer" onClick={() => setHoveredIndex(idx)}>
                {/* Expense dot */}
                <circle
                  cx={p.x}
                  cy={pointsExpense[idx].y}
                  r="3.5"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Revenue dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "7" : isPeak ? "5.5" : "4"}
                  fill={isPeak ? "#059669" : "#10b981"}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                />

                {/* Peak visual badge */}
                {isPeak && (
                  <g>
                    <rect
                      x={p.x - 30}
                      y={p.y - 24}
                      width="60"
                      height="16"
                      rx="8"
                      fill="#059669"
                      className="shadow-sm"
                    />
                    <text
                      x={p.x}
                      y={p.y - 13}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      ★ {idx === 5 ? "Đỉnh hè" : idx === 6 ? "Đỉnh hè" : "Khai giảng"}
                    </text>
                  </g>
                )}

                {/* X-axis Month Label */}
                <text
                  x={p.x}
                  y={svgHeight - paddingY + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? "bold" : "600"}
                  fill={isHovered ? "#10b981" : "currentColor"}
                  className={isHovered ? "fill-primary font-black" : "fill-muted-foreground"}
                >
                  {p.item.label}
                </text>

                {/* Invisible hover hotspot */}
                <rect
                  x={p.x - 25}
                  y={paddingY}
                  width="50"
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip detail for current selected month */}
        {activePoint && (
          <div className="mt-3 p-3 rounded-xl bg-card border border-slate-300 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {activePoint.item.fullName}
              </span>
              {activePoint.item.isPeak && (
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  🔥 {activePoint.item.peakTitle}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-muted-foreground text-[11px]">Doanh thu: </span>
                <strong className="text-emerald-600 font-bold">
                  {formatVND(activePoint.item.revenue)}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">Chi phí: </span>
                <strong className="text-rose-500 font-bold">
                  {formatVND(activeExpensePoint.item.expense)}
                </strong>
              </div>
              <div className="bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                <span className="text-muted-foreground text-[11px]">Dòng tiền ròng: </span>
                <strong className="text-primary font-black">
                  +{formatVND(activePoint.item.netCashFlow)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
