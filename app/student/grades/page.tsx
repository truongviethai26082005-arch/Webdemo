import Link from "next/link";
import {
  Award,
  Sparkles,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bảng điểm & Đánh giá | Cổng Học sinh",
};

export default function StudentGradesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <span>Bảng điểm & Đánh giá</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Theo dõi kết quả học tập định kỳ, điểm thi và nhận xét tiến bộ từ giáo viên
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            <span>Đang phát triển</span>
          </span>
        </div>
      </div>

      {/* 2. KHUNG THÔNG BÁO TÍNH NĂNG ĐANG ĐƯỢC PHÁT TRIỂN */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-8 md:p-12 shadow-xs text-center flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Award className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Tính năng đang được phát triển
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hệ thống đang xây dựng phân hệ Bảng điểm điện tử. Bạn sẽ sớm có thể tra cứu chi tiết kết quả học tập và lộ trình phát triển năng lực:
          </p>
        </div>

        {/* Danh sách tính năng dự kiến */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Bảng điểm các kỳ</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Điểm miệng, 15 phút, giữa kỳ và cuối khóa</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Biểu đồ tiến bộ</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Trực quan hóa mức độ cải thiện qua các tháng</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Nhận xét chi tiết</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Góp ý từ giáo viên về điểm mạnh & điểm cần rèn luyện</p>
            </div>
          </div>
        </div>

        {/* Nút quay về Dashboard */}
        <div className="pt-2">
          <Button asChild variant="outline" className="rounded-xl gap-2 text-xs font-bold">
            <Link href="/student/dashboard">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về Tiến độ học tập</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
