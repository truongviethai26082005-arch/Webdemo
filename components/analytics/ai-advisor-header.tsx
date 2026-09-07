"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  BrainCircuit,
  Zap,
  ShieldAlert,
  Target,
  CalendarX,
  Gift,
  PhoneCall,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIAdvisorInsight } from "@/types/analytics";

interface AIAdvisorHeaderProps {
  data: AIAdvisorInsight;
  onRefresh?: () => void;
}

export function AIAdvisorHeader({ data, onRefresh }: AIAdvisorHeaderProps) {
  const [isScanning, setIsScanning] = useState(false);

  function handleScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onRefresh) onRefresh();
    }, 800);
  }

  return (
    <div className="rounded-3xl bg-card border border-indigo-200/90 dark:border-indigo-500/30 p-5 sm:p-6 shadow-soft bg-gradient-to-br from-indigo-50/50 via-card to-purple-50/30 dark:from-indigo-950/20 dark:via-card dark:to-slate-950 text-foreground space-y-5">
      {/* Top bar: AI Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 ring-2 ring-primary/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                EduCenter AI Advisor
                <Badge
                  variant="outline"
                  className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border-primary/25"
                >
                  Trợ Lý Phân Tích Thông Minh
                </Badge>
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Tự động quét toàn bộ cơ sở dữ liệu doanh thu, phễu tuyển sinh, chi phí và chuyên cần học viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-muted-foreground font-medium">
            Quét lần cuối: {data.generatedAt}
          </span>
          <Button
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            className="h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Đang phân tích..." : "Quét lại dữ liệu AI"}</span>
          </Button>
        </div>
      </div>

      {/* Block 1: TÓM TẮT ĐÁNH GIÁ (Bite-sized Metric Cards Thay Vì Đoạn Văn Dài) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <BrainCircuit className="w-3.5 h-3.5 text-primary" />
          <span>Tóm tắt đánh giá vận hành (AI Executive Summary)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Doanh thu */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Doanh thu tháng
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">+18%</span>
                <span className="text-[11px] text-muted-foreground font-medium">Tăng trưởng ổn định</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tỷ lệ chốt */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Chốt cọc (Học thử ➔ Chính thức)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">42% ➔ 28%</span>
                <span className="text-[11px] text-rose-600/80 dark:text-rose-300 font-semibold">Cảnh báo giảm sút</span>
              </div>
            </div>
          </div>

          {/* Card 3: Điểm mấu chốt */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Trọng tâm can thiệp
              </span>
              <div className="text-xs font-extrabold text-foreground truncate">
                Xử lý phản hồi sau buổi test
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Columns: CẢNH BÁO ĐIỂM NGHẼN & ĐỀ XUẤT GIẢI PHÁP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CỘT 1: CẢNH BÁO ĐIỂM NGHẼN */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Cảnh báo điểm nghẽn (Bottlenecks Identified)</span>
            </div>
            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 text-[10px] font-extrabold">
              2 phát hiện
            </Badge>
          </div>

          <div className="space-y-2.5">
            {/* Điểm nghẽn 1: Rào cản học phí */}
            <div className="p-3 rounded-xl bg-card border border-amber-500/25 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-foreground">
                    Rào cản học phí chiếm <span className="text-amber-600 dark:text-amber-400 text-sm font-black underline decoration-amber-500 decoration-2">45%</span> lý do từ chối
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase text-rose-700 dark:text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30 shrink-0">
                  Nghiêm trọng
                </span>
              </div>

              {/* Danh sách mục ngắn gọn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/60 text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Phụ huynh khen chất lượng dạy tốt</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/60 text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Thiếu phương án chia nhỏ kỳ hạn đóng</span>
                </div>
              </div>
            </div>

            {/* Điểm nghẽn 2: Vắng quá 3 buổi */}
            <div className="p-3 rounded-xl bg-card border border-amber-500/25 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <CalendarX className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-foreground">
                    Học viên vắng <span className="text-amber-600 dark:text-amber-400 text-sm font-black underline decoration-amber-500 decoration-2">≥ 3 buổi</span> sụt giảm gia hạn
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                  Cần lưu ý
                </span>
              </div>

              {/* Danh sách mục ngắn gọn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/60 text-foreground flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Tỷ lệ bỏ khóa tăng cao gấp <strong className="text-amber-600 dark:text-amber-400">3.2 lần</strong></span>
                </div>
                <div className="p-2 rounded-lg bg-muted/60 text-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Tập trung nhiều ở môn <strong className="text-foreground">Tiếng Anh</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: ĐỀ XUẤT GIẢI PHÁP TỰ ĐỘNG */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Đề xuất giải pháp tự động (Actionable Recommendations)</span>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30 text-[10px] font-extrabold">
              Độ khả thi cao
            </Badge>
          </div>

          <div className="space-y-2.5">
            {/* Giải pháp 1: Gói ưu đãi 3-6 tháng */}
            <div className="p-3 rounded-xl bg-card border border-emerald-500/25 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-foreground">
                    Tung gói ưu đãi <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black underline decoration-emerald-500 decoration-2">3 - 6 tháng</span> kèm quà tặng
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                  Ưu tiên ngay
                </span>
              </div>

              {/* Danh sách mục ngắn gọn */}
              <div className="space-y-1 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/60 text-foreground flex items-center justify-between">
                  <span>🎁 Tặng 1 buổi test định hướng + Giảm <strong className="text-emerald-600 dark:text-emerald-400 font-black">8%</strong> (gói 24 buổi)</span>
                </div>
                <div className="p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Kỳ vọng: Tăng tỷ lệ chốt học viên từ <strong className="text-foreground font-black">28% ➔ 40%</strong> (trong 2 tuần)</span>
                </div>
              </div>
            </div>

            {/* Giải pháp 2: Gọi lại 15 Lead học thử */}
            <div className="p-3 rounded-xl bg-card border border-emerald-500/25 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-foreground">
                    Chăm sóc lại <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black underline decoration-emerald-500 decoration-2">15 Lead</span> ở tầng Học thử
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  Hiệu quả cao
                </span>
              </div>

              {/* Danh sách mục ngắn gọn */}
              <div className="space-y-1 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/60 text-foreground flex items-center justify-between">
                  <span>📋 Gửi báo cáo năng lực chi tiết của GV + Lộ trình cam kết điểm giữa kỳ</span>
                </div>
                <div className="p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Kỳ vọng: Chốt thêm <strong className="text-foreground font-black">6 - 8 học viên</strong> tiềm năng đang lưỡng lự</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
