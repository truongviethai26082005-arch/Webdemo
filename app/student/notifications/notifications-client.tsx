"use client";

import { useState } from "react";
import Link from "next/link";
import {
  StudentNotificationsSummary,
  StudentNotificationItem,
  NotificationCategory,
} from "@/lib/actions/student";
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCheck,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Sparkles,
  Megaphone,
  ShieldAlert,
  ArrowRight,
  User,
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StudentNotificationsClientProps {
  initialData: StudentNotificationsSummary;
}

type WidgetFilter = "all" | "unread" | "important";

export function StudentNotificationsClient({
  initialData,
}: StudentNotificationsClientProps) {
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>(
    initialData.notifications || []
  );
  const [activeCategory, setActiveCategory] = useState<
    "all" | NotificationCategory
  >("all");
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilter>("all");

  // Dialog xem chi tiết thông báo
  const [selectedNotification, setSelectedNotification] =
    useState<StudentNotificationItem | null>(null);

  // Tính toán số lượng chưa đọc & quan trọng theo state
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const importantCount = notifications.filter(
    (n) => n.priority === "urgent" || n.priority === "important"
  ).length;

  // Xử lý khi bấm widget "Tổng thông báo"
  const handleSelectAllWidget = () => {
    setWidgetFilter("all");
    setActiveCategory("all");
  };

  // Xử lý khi bấm widget "Chưa đọc"
  const handleSelectUnreadWidget = () => {
    setWidgetFilter((prev) => (prev === "unread" ? "all" : "unread"));
  };

  // Xử lý khi bấm widget "Cảnh báo quan trọng"
  const handleSelectImportantWidget = () => {
    setWidgetFilter((prev) => (prev === "important" ? "all" : "important"));
  };

  // Xử lý đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Xử lý khi mở chi tiết thông báo -> tự động đánh dấu đã đọc
  const handleOpenDetail = (notif: StudentNotificationItem) => {
    setSelectedNotification(notif);
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
  };

  // Lọc kết hợp theo Widget và Danh mục Tabs
  const filteredNotifications = notifications.filter((n) => {
    // 1. Lọc theo Tabs danh mục
    if (activeCategory !== "all" && n.category !== activeCategory) {
      return false;
    }
    // 2. Lọc theo Widget click
    if (widgetFilter === "unread" && n.is_read) {
      return false;
    }
    if (
      widgetFilter === "important" &&
      n.priority !== "urgent" &&
      n.priority !== "important"
    ) {
      return false;
    }
    return true;
  });

  // Icon và màu sắc tương ứng theo Category & Priority
  const getCategoryIcon = (
    category: NotificationCategory,
    priority: string
  ) => {
    if (priority === "urgent") {
      return {
        icon: ShieldAlert,
        bg: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
      };
    }
    switch (category) {
      case "academic_warning":
        return {
          icon: AlertTriangle,
          bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
        };
      case "assignment_schedule":
        return {
          icon: Clock,
          bg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60",
        };
      case "center_news":
      default:
        return {
          icon: Megaphone,
          bg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60",
        };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "important":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. THẺ THỐNG KÊ NHANH ĐẦU TRANG (3 WIDGETS CÓ CLICK-TO-FILTER VÀ HOVER HIỆU ỨNG) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Widget 1: Tổng thông báo */}
        <div
          onClick={handleSelectAllWidget}
          className={cn(
            "rounded-2xl border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            widgetFilter === "all" && activeCategory === "all"
              ? "bg-blue-50/30 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Tổng thông báo
              </span>
              {widgetFilter === "all" && activeCategory === "all" ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/50">
                  <Check className="w-2.5 h-2.5" /> Tất cả
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center">
                  <span>Xem hết</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">
                {notifications.length}
              </span>
              <span className="text-xs text-muted-foreground">tin</span>
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
              Bấm để hiển thị toàn bộ
            </p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 transition-transform group-hover:scale-105",
              widgetFilter === "all" && activeCategory === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/20"
                : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/50"
            )}
          >
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 2: Thông báo chưa đọc */}
        <div
          onClick={handleSelectUnreadWidget}
          className={cn(
            "rounded-2xl border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            widgetFilter === "unread"
              ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Chưa đọc
              </span>
              {widgetFilter === "unread" ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/50">
                  <Filter className="w-2.5 h-2.5" /> Đang lọc
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center">
                  <span>Lọc nhanh</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-2xl font-black",
                  unreadCount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
                )}
              >
                {unreadCount}
              </span>
              <span className="text-xs text-muted-foreground">tin mới</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">
              {widgetFilter === "unread"
                ? "Bấm lại để hủy lọc"
                : "Bấm để lọc tin chưa đọc"}
            </p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 transition-transform group-hover:scale-105",
              widgetFilter === "unread"
                ? "bg-rose-600 text-white border-rose-600 shadow-rose-500/20"
                : unreadCount > 0
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/50"
                : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-border"
            )}
          >
            <BellRing className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 3: Cảnh báo quan trọng */}
        <div
          onClick={handleSelectImportantWidget}
          className={cn(
            "rounded-2xl border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            widgetFilter === "important"
              ? "bg-amber-50/30 dark:bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Cảnh báo quan trọng
              </span>
              {widgetFilter === "important" ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
                  <Filter className="w-2.5 h-2.5" /> Đang lọc
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center">
                  <span>Lọc nhanh</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {importantCount}
              </span>
              <span className="text-xs text-muted-foreground">cảnh báo</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
              {widgetFilter === "important"
                ? "Bấm lại để hủy lọc"
                : "Hạn nộp bài & Học phí"}
            </p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 transition-transform group-hover:scale-105",
              widgetFilter === "important"
                ? "bg-amber-600 text-white border-amber-600 shadow-amber-500/20"
                : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/50"
            )}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ: TABS LỌC & NÚT ĐÁNH DẤU ĐÃ ĐỌC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Bộ chuyển đổi danh mục Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-border">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeCategory === "all"
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Tất cả</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-foreground">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("academic_warning")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeCategory === "academic_warning"
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Cảnh báo học vụ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("assignment_schedule")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeCategory === "assignment_schedule"
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Bài tập & Lịch học</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("center_news")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeCategory === "center_news"
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Megaphone className="w-3 h-3 text-purple-600" />
            <span>Tin tức trung tâm</span>
          </button>
        </div>

        {/* Nút hành động bổ sung */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {widgetFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWidgetFilter("all")}
              className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc thẻ</span>
            </Button>
          )}

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="rounded-xl text-xs font-semibold border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              <span>Đánh dấu tất cả đã đọc</span>
            </Button>
          )}
        </div>
      </div>

      {/* CHIP BÁO TRẠNG THÁI LỌC HIỆN TẠI (NẾU ĐANG LỌC TỪ WIDGET) */}
      {widgetFilter !== "all" && (
        <div className="flex items-center gap-2 text-xs py-1 px-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-border/80 text-muted-foreground w-fit">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>
            Đang lọc danh sách theo:{" "}
            <strong className="text-foreground">
              {widgetFilter === "unread"
                ? "Thông báo chưa đọc"
                : "Cảnh báo quan trọng / khẩn cấp"}
            </strong>{" "}
            ({filteredNotifications.length} kết quả)
          </span>
          <button
            type="button"
            onClick={() => setWidgetFilter("all")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Bỏ lọc"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. DANH SÁCH THÔNG BÁO */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-foreground">
              Không có thông báo nào phù hợp
            </h3>
            <p className="text-xs text-muted-foreground">
              {widgetFilter !== "all"
                ? "Hiện không có thông báo nào thỏa mãn điều kiện lọc. Bạn có thể xóa bộ lọc để xem tất cả."
                : "Mọi cảnh báo học tập hoặc tin tức phát sinh mới sẽ được hệ thống cập nhật tự động tại đây."}
            </p>
            {widgetFilter !== "all" && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setWidgetFilter("all");
                    setActiveCategory("all");
                  }}
                  className="rounded-xl text-xs font-semibold"
                >
                  Xem toàn bộ thông báo
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const iconConfig = getCategoryIcon(notif.category, notif.priority);
            const IconComponent = iconConfig.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleOpenDetail(notif)}
                className={cn(
                  "bg-white dark:bg-card rounded-2xl border p-5 shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-800/80 group",
                  notif.is_read
                    ? "border-slate-200/80 dark:border-border opacity-85 hover:opacity-100"
                    : "border-blue-200/90 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/20 to-transparent dark:from-blue-950/15"
                )}
              >
                {/* Phần nội dung bên trái */}
                <div className="flex items-start gap-4 min-w-0">
                  {/* Icon phân loại */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 mt-0.5",
                      iconConfig.bg
                    )}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    {/* Hàng nhãn phân loại, lớp học và thời gian */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Chấm tròn chưa đọc */}
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 shrink-0" />
                      )}

                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          getPriorityBadge(notif.priority)
                        )}
                      >
                        {notif.priority_label}
                      </span>

                      <span className="text-[11px] font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {notif.category_label}
                      </span>

                      {notif.class_name && (
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate max-w-[220px]">
                          <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{notif.class_name}</span>
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground ml-auto sm:ml-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{notif.relative_time}</span>
                      </span>
                    </div>

                    {/* Tiêu đề thông báo */}
                    <h3
                      className={cn(
                        "text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-blue-600 line-clamp-1",
                        !notif.is_read && "text-blue-950 dark:text-blue-100"
                      )}
                    >
                      {notif.title}
                    </h3>

                    {/* Đoạn trích nội dung */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.content}
                    </p>
                  </div>
                </div>

                {/* Phần nút xem chi tiết bên phải */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Xem chi tiết</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. DIALOG XEM TOÀN VĂN CHI TIẾT THÔNG BÁO */}
      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => {
          if (!open) setSelectedNotification(null);
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {selectedNotification && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    getPriorityBadge(selectedNotification.priority)
                  )}
                >
                  {selectedNotification.priority_label}
                </span>
              )}
              <span className="text-[11px] font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {selectedNotification?.category_label}
              </span>
              <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{selectedNotification?.relative_time}</span>
              </span>
            </div>

            <DialogTitle className="text-base font-bold text-foreground leading-snug">
              {selectedNotification?.title}
            </DialogTitle>

            {selectedNotification?.class_name && (
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Áp dụng cho: <strong>{selectedNotification.class_name}</strong></span>
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Thân thông báo chi tiết */}
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-border/60 text-foreground leading-relaxed text-xs">
              {selectedNotification?.content}
            </div>

            {/* Thông tin đơn vị phát hành */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-100 dark:border-border/60">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nguồn thông báo: <strong>{selectedNotification?.sender || "Ban Đào tạo trung tâm"}</strong></span>
              </span>
            </div>
          </div>

          {/* Footer nút điều hướng */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedNotification(null)}
              className="rounded-xl text-xs font-semibold border-slate-200 dark:border-border"
            >
              Đóng
            </Button>

            {selectedNotification?.action_url && (
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Link
                  href={selectedNotification.action_url}
                  onClick={() => setSelectedNotification(null)}
                  className="flex items-center gap-1.5"
                >
                  <span>{selectedNotification.action_label || "Truy cập tính năng"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
