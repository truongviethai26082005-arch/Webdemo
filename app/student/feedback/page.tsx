import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Star,
  HelpCircle,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gửi phản hồi | Cổng Học sinh",
};

export default function StudentFeedbackPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>Gửi phản hồi</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Đóng góp ý kiến chất lượng giảng dạy, cơ sở vật chất và gửi yêu cầu hỗ trợ
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
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
            <MessageSquare className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Tính năng đang được phát triển
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hòm thư góp ý và cổng hỗ trợ học viên trực tuyến đang được xây dựng nhằm lắng nghe mọi trải nghiệm của bạn:
          </p>
        </div>

        {/* Danh sách tính năng dự kiến */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Đánh giá tiết học</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Bình chọn độ hài lòng về chất lượng buổi dạy</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Hỏi đáp học tập</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Gửi thắc mắc trực tiếp đến giáo viên hoặc trợ giảng</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Khiếu nại cơ sở</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Phản ánh phòng học, điều hòa, thiết bị đến ban quản trị</p>
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
