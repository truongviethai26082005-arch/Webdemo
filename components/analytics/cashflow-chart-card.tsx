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
  data: CashFlowMonthItem[];
}

export function CashFlowChartCard({ data }: CashFlowChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(6); // Default highlight T7 (peak)

  // Chart dimensions in SVG coordinates
  const svgWidth = 760;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Max value for scaling
  const maxVal = 70000000; // 70 million VND
  const minVal = 0;

  // Calculate points for Revenue and Expense
  const pointsRevenue = data.map((item, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (item.revenue / maxVal) * chartHeight;
    return { x, y, item, i };
  });

  const pointsExpense = data.map((item, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (item.expense / maxVal) * chartHeight;
    return { x, y, item, i };
  });

  const pathRevenue = pointsRevenue.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaRevenue = `${pathRevenue} L ${pointsRevenue[pointsRevenue.length - 1].x} ${svgHeight - paddingY} L ${pointsRevenue[0].x} ${svgHeight - paddingY} Z`;

  const pathExpense = pointsExpense.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const totalYearRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalYearExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const netYearCashFlow = totalYearRevenue - totalYearExpense;

  const activePoint = hoveredIndex !== null ? pointsRevenue[hoveredIndex] : pointsRevenue[6];
  const activeExpensePoint = hoveredIndex !== null ? pointsExpense[hoveredIndex] : pointsExpense[6];

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground">
              Báo Cáo Dòng Tiền Vận Hành (Cash Flow Dynamics)
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              12 Tháng
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Biến động Doanh thu thực thu so sánh với Tổng chi phí (Lương giáo viên + Chi phí cố định)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-foreground">Doanh thu thực thu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400/80 shadow-sm" />
            <span className="text-muted-foreground">Tổng chi phí vận hành</span>
          </div>
        </div>
      </div>

      {/* Summary 3 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Tổng thực thu cả năm
          </span>
          <div className="text-xl font-black text-emerald-600 mt-0.5">
            {formatVND(totalYearRevenue)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            Tổng chi phí cả năm
          </span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
            {formatVND(totalYearExpense)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Dòng tiền ròng thặng dư
          </span>
          <div className="text-xl font-black text-primary mt-0.5">
            +{formatVND(netYearCashFlow)}
          </div>
        </div>
      </div>

      {/* Interactive SVG Line Chart */}
      <div className="relative p-2 rounded-2xl bg-muted/30 border border-border/70 overflow-hidden">
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
          <div className="mt-3 p-3 rounded-xl bg-card border border-border shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
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
