"use client";

import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrossProfitData } from "@/types/analytics";
import { formatVND } from "@/lib/utils/vietqr";

interface GrossProfitCardProps {
  data: GrossProfitData;
}

export function GrossProfitCard({ data }: GrossProfitCardProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground">
              Phân Tích Lợi Nhuận Gộp & Dự Báo (Gross Profit & Forecast)
            </h3>
            <Badge
              variant="outline"
              className={
                data.isSalarySafe
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold"
              }
            >
              {data.isSalarySafe ? "Biên độ tài chính an toàn" : "Cảnh báo vượt chi phí"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Công thức chuẩn: Lợi nhuận gộp = Doanh thu thực thu - Lương thù lao giáo viên
          </p>
        </div>

        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-primary" />
          <span>Tự động tính toán theo thời gian thực</span>
        </div>
      </div>

      {/* Main Calculation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Doanh thu thực thu */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Doanh thu thực thu (A)
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatVND(data.actualRevenue)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Từ các hóa đơn & phiếu thu đã xác nhận
          </p>
        </div>

        {/* Step 2: Lương thù lao GV */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            Lương thù lao giáo viên (B)
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatVND(data.teacherPayrollPaid)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Tỷ trọng lương: </span>
            <strong className="text-foreground font-bold">
              {data.salaryCostRatioPercent}%
            </strong>
            <span className="text-[10px] text-muted-foreground">(Ngưỡng an toàn: ≤45%)</span>
          </div>
        </div>

        {/* Step 3: Lợi nhuận gộp = A - B */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Lợi nhuận gộp thực tế (A - B)
            </span>
            <span className="text-xs font-black bg-primary text-primary-foreground px-2 py-0.2 rounded-full">
              Biên: {data.grossMarginPercent}%
            </span>
          </div>
          <div className="text-2xl font-black text-primary">
            {formatVND(data.actualGrossProfit)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Chưa trừ chi phí mặt bằng & quản trị cố định
          </p>
        </div>
      </div>

      {/* Safety Gauge Progress Bar */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Kiểm soát tỷ trọng Lương giáo viên trên Doanh thu
          </span>
          <span className="font-semibold text-muted-foreground">
            Hiện tại: <strong className="text-foreground">{data.salaryCostRatioPercent}%</strong> / Giới hạn: <strong>45%</strong>
          </span>
        </div>

        <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${
              data.isSalarySafe ? "bg-emerald-500" : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(data.salaryCostRatioPercent, 100)}%` }}
          />
          <div
            className="h-full bg-primary/30"
            style={{ width: `${Math.max(100 - data.salaryCostRatioPercent, 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
          <span>0% (Rất thấp)</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">Ngưỡng cảnh báo: 45%</span>
          <span>100% (Nguy hiểm)</span>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Chỉ số Lợi Nhuận Ước Tính Đến Cuối Tháng (Forecast)
            </h4>
          </div>
          <Badge className="bg-purple-600 text-white text-[10px] font-bold">
            AI Projection
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Dự báo doanh thu tháng:</span>
            <div className="text-base font-extrabold text-foreground">
              {formatVND(data.forecastRevenueEndMonth)}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Dự báo lợi nhuận gộp:</span>
            <div className="text-base font-extrabold text-purple-600 dark:text-purple-400">
              {formatVND(data.forecastProfitEndMonth)}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Dự báo biên lợi nhuận:</span>
            <div className="text-base font-extrabold text-emerald-600">
              ~{data.forecastMarginPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
