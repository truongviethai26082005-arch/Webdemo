"use client";

import {
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RetentionMetricsData } from "@/types/analytics";

interface RetentionChurnCardProps {
  data: RetentionMetricsData;
}

export function RetentionChurnCard({ data }: RetentionChurnCardProps) {
  const isTargetAchieved = data.renewalRate >= data.renewalTarget;

  // Số liệu phân luồng học viên
  const renewalPercent = data.renewalRate ?? 78.5;
  const renewalCount = data.renewalCount ?? 79;

  const consideringPercent = data.consideringRate ?? 17.3;
  const consideringCount = data.consideringCount ?? 18;

  const churnPercent = data.churnRate ?? 4.2;
  const churnCount = data.churnCountThisMonth ?? 3;

  // Dữ liệu tháng này: 75/100 học viên đã gia hạn thành công
  const sampleStudentText = `Dữ liệu tháng này: ${
    data.renewedSuccessCount ?? 75
  }/${data.totalExpiringThisMonth ?? 100} học viên đã gia hạn thành công`;

  // Sắp xếp nguyên nhân dừng học từ cao xuống thấp
  const sortedReasons = [...(data.churnReasons || [])].sort(
    (a, b) => b.percentage - a.percentage
  );

  return (
    <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Tỷ Lệ Giữ Chân &amp; Gia Hạn Học Phí
            </h3>
            <Badge
              variant="outline"
              className={
                isTargetAchieved
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold py-0.2 px-2"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px] font-semibold py-0.2 px-2"
              }
            >
              {isTargetAchieved ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đạt mục tiêu duy trì (&gt;{data.renewalTarget}%)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Cần tăng cường hỗ trợ
                </span>
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Đo lường mức độ tiếp tục gắn bó, phân luồng học viên đến hạn và nguyên nhân rút lui thực tế
          </p>
        </div>

        {/* Dòng mẫu học viên quy chuẩn tối giản */}
        <div className="flex items-center gap-1.5 self-start lg:self-auto bg-slate-50 dark:bg-muted/40 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {sampleStudentText}
          </span>
        </div>
      </div>

      {/* Chỉ số gắn liền với tiền & Ngữ cảnh số lượng - Tinh gọn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Thời gian học trung bình:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {data.averageLifetimeMonths} tháng (~{data.averagePackagesPerStudent} khóa)
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Gắn bó liên tục ~{data.averagePackagesPerStudent} gói học phí — Dòng tiền ổn định lâu dài
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Sức khỏe gia hạn:{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {renewalPercent}% tiếp tục
              </span>{" "}
              / Dừng học:{" "}
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {churnPercent}%
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Tỷ lệ tiếp tục áp đảo, trong ngưỡng an toàn kiểm soát
            </div>
          </div>
        </div>
      </div>

      {/* 1. KHỐI PHÂN LUỒNG HỌC VIÊN ĐẾN HẠN (Stacked Progress Bar & 3 Hộp số liệu) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            Thanh Phân Luồng Học Viên Đến Hạn Kết Thúc Gói (100%)
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Tổng cộng: <strong className="text-foreground">100%</strong> học viên đến hạn
          </span>
        </div>

        {/* Thanh tiến trình phân luồng thanh mảnh thanh lịch (h-2.5 sm:h-3) */}
        <div
          className="w-full h-2.5 sm:h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center"
          title={`Tiếp tục: ${renewalPercent}% | Cân nhắc: ${consideringPercent}% | Dừng: ${churnPercent}%`}
        >
          {/* Phần xanh ngọc dịu (78.5%): Đóng tiếp học phí */}
          <div
            style={{ width: `${renewalPercent}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
          />

          {/* Phần vàng hổ phách (17.3%): Đang cân nhắc / chờ phản hồi */}
          <div
            style={{ width: `${consideringPercent}%` }}
            className="h-full bg-amber-400 transition-all duration-500"
          />

          {/* Phần đỏ gạch (4.2%): Dừng học hẳn */}
          <div
            style={{ width: `${churnPercent}%` }}
            className="h-full bg-rose-500 transition-all duration-500"
          />
        </div>

        {/* 3 Hộp số liệu bên dưới: Nền trắng chuẩn B2B SaaS, viền border-slate-300 rõ nét */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Hộp 1: Đóng tiếp học phí */}
          <div className="bg-white dark:bg-card border border-slate-300 dark:border-slate-700 p-3 rounded-xl shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-emerald-500" />
                Đóng tiếp học phí
              </span>
              <Badge
                variant="outline"
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-xs font-medium px-2 py-0.2"
              >
                {renewalCount} bạn
              </Badge>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {renewalPercent}%
            </div>
          </div>

          {/* Hộp 2: Đang cân nhắc / chờ phản hồi */}
          <div className="bg-white dark:bg-card border border-slate-300 dark:border-slate-700 p-3 rounded-xl shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-amber-400" />
                Đang cân nhắc
              </span>
              <Badge
                variant="outline"
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-xs font-medium px-2 py-0.2"
              >
                {consideringCount} bạn
              </Badge>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {consideringPercent}%
            </div>
          </div>

          {/* Hộp 3: Dừng học hẳn */}
          <div className="bg-white dark:bg-card border border-slate-300 dark:border-slate-700 p-3 rounded-xl shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-rose-500" />
                Dừng học hẳn
              </span>
              <Badge
                variant="outline"
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-xs font-medium px-2 py-0.2"
              >
                {churnCount} bạn
              </Badge>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {churnPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. DANH SÁCH LÝ DO HỌC VIÊN CŨ KHÔNG GIA HẠN */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-muted/30 border border-slate-300 dark:border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              LÝ DO HỌC VIÊN CŨ KHÔNG GIA HẠN
            </h4>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] font-medium"
          >
            Học viên chính thức
          </Badge>
        </div>

        {/* Danh sách từng dòng tinh gọn: Đúng 2 hàng thông tin, không có subtext giải thích */}
        <div className="space-y-2">
          {sortedReasons.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-2 shadow-2xs"
            >
              {/* Hàng 1 (Tiêu đề & Nhãn) */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.reason}
                  </span>
                </div>

                {item.solutionNote && (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-medium shrink-0 px-2 py-0.5 rounded-md"
                  >
                    [{item.solutionNote}]
                  </Badge>
                )}
              </div>

              {/* Hàng 2 (Thanh đo & Con số) */}
              <div className="flex items-center">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mr-3">
                  <div
                    className="h-full rounded-full bg-slate-700 dark:bg-slate-300 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {item.percentage}% ({item.count} bạn)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
