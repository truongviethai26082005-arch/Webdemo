"use client";

import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Calculator,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrossProfitData } from "@/types/analytics";
import { formatVND } from "@/lib/utils/vietqr";

interface GrossProfitCardProps {
  data?: GrossProfitData | null;
}

export function GrossProfitCard({ data }: GrossProfitCardProps) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-card/50 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
          <Wallet className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Chưa có dữ liệu lợi nhuận
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Cần có dữ liệu hóa đơn học phí và bảng lương giáo viên để tính toán biên độ lợi nhuận gộp.
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
  return (
    <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Phân Tích Lợi Nhuận Gộp &amp; Dự Báo
            </h3>
            <Badge
              variant="outline"
              className={
                safeData.isSalarySafe
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold py-0.2 px-2"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 text-[10px] font-semibold py-0.2 px-2"
              }
            >
              {safeData.isSalarySafe ? "Biên độ tài chính an toàn" : "Cảnh báo vượt chi phí"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Công thức chuẩn: Lợi nhuận gộp = Doanh thu thực thu - Lương thù lao giáo viên
          </p>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
          <Calculator className="w-3.5 h-3.5 text-slate-500" />
          <span>Thời gian thực</span>
        </div>
      </div>

      {/* Main Calculation Grid - Nền trắng tối giản, viền border-slate-300 rõ nét */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Doanh thu thực thu */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Doanh thu thực thu (A)
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatVND(safeData.actualRevenue)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Từ các hóa đơn &amp; phiếu thu đã xác nhận
          </p>
        </div>

        {/* Step 2: Lương thù lao GV */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Lương giáo viên (B)
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatVND(safeData.teacherPayrollPaid)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Tỷ trọng lương: </span>
            <strong className="text-foreground font-bold">
              {safeData.salaryCostRatioPercent}%
            </strong>
            <span className="text-[10px] text-muted-foreground">(An toàn: ≤45%)</span>
          </div>
        </div>

        {/* Step 3: Lợi nhuận gộp = A - B */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Lợi nhuận gộp (A - B)
            </span>
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.2 rounded-md border border-slate-300 dark:border-slate-700">
              Biên: {safeData.grossMarginPercent}%
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatVND(safeData.actualGrossProfit)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Chưa trừ chi phí cố định vận hành
          </p>
        </div>
      </div>

      {/* Safety Gauge Progress Bar - Thanh mảnh gọn gàng */}
      <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            Kiểm soát tỷ trọng Lương giáo viên trên Doanh thu
          </span>
          <span className="text-muted-foreground">
            Hiện tại: <strong className="text-foreground">{safeData.salaryCostRatioPercent}%</strong> / Giới hạn: <strong>45%</strong>
          </span>
        </div>

        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${
              safeData.isSalarySafe ? "bg-emerald-500" : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(safeData.salaryCostRatioPercent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>0% (Rất thấp)</span>
          <span className="font-medium text-slate-600 dark:text-slate-400">Ngưỡng cảnh báo: 45%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Forecast Section - Tối giản tinh tế */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Chỉ số Lợi Nhuận Ước Tính Đến Cuối Tháng (Forecast)
            </h4>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-[10px] font-medium"
          >
            AI Projection
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Dự báo doanh thu:</span>
            <div className="text-sm font-bold text-foreground">
              {formatVND(safeData.forecastRevenueEndMonth)}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Dự báo lợi nhuận gộp:</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {formatVND(safeData.forecastProfitEndMonth)}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Dự báo biên lợi nhuận:</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ~{safeData.forecastMarginPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
