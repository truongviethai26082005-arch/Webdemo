import Link from "next/link";
import {
  Bell,
  Sparkles,
  ArrowLeft,
  Megaphone,
  CalendarClock,
  Gift,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tin tức & Cảnh báo | Cổng Học sinh",
};

export default function StudentNotificationsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <span>Tin tức & Cảnh báo</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Thông báo nghỉ lễ, sự kiện trung tâm, nhắc nhở lịch học và tin khuyến mãi
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
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bell className="w-10 h-10" />
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
            Trung tâm thông báo đang được thiết kế nhằm đồng bộ tức thời mọi thông tin quan trọng tới bạn và phụ huynh:
          </p>
        </div>

        {/* Danh sách tính năng dự kiến */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Thông báo trung tâm</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Lịch nghỉ lễ, khai giảng lớp mới, thông báo học vụ</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Nhắc nhở học tập</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cảnh báo sắp hết buổi học, nhắc hạn nộp bài tập</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-foreground">Sự kiện & Ưu đãi</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Học bổng, giải đấu học thuật và quà tặng tích lũy</p>
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
