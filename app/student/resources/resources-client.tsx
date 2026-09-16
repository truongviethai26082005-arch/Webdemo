"use client";

import { useState, useMemo } from "react";
import { StudentResourceItem } from "@/lib/actions/student";
import {
  Search,
  BookOpen,
  FileText,
  Presentation,
  Video,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Eye,
  Calendar,
  User,
  Sparkles,
  FolderArchive,
  Layers,
  X,
  FileCode,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StudentResourcesClientProps {
  initialResources: StudentResourceItem[];
}

export function StudentResourcesClient({
  initialResources,
}: StudentResourcesClientProps) {
  const [resources] = useState<StudentResourceItem[]>(initialResources);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [onlyNew, setOnlyNew] = useState(false);

  // State Dialog xem chi tiết tài liệu
  const [viewingResource, setViewingResource] =
    useState<StudentResourceItem | null>(null);

  // Danh sách các lớp học duy nhất từ tập dữ liệu tài liệu
  const classOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string | null; count: number }>();
    for (const r of resources) {
      const existing = map.get(r.class_id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(r.class_id, {
          id: r.class_id,
          name: r.class_name,
          code: r.class_code,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [resources]);

  // Thống kê số liệu
  const totalCount = resources.length;
  const newCount = resources.filter((r) => r.is_new).length;
  const pdfCount = resources.filter((r) => r.type === "pdf").length;
  const slideCount = resources.filter((r) => r.type === "slide").length;
  const videoCount = resources.filter((r) => r.type === "video").length;

  // Lọc danh sách theo lớp, định dạng và tìm kiếm
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Lọc theo lớp
      if (selectedClassId !== "all" && res.class_id !== selectedClassId) {
        return false;
      }
      // Lọc theo tài liệu mới
      if (onlyNew && !res.is_new) {
        return false;
      }
      // Lọc theo loại
      if (selectedType !== "all" && res.type !== selectedType) {
        return false;
      }
      // Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchDesc = res.description?.toLowerCase().includes(q) ?? false;
        const matchClass = res.class_name.toLowerCase().includes(q);
        const matchTeacher = res.teacher_name?.toLowerCase().includes(q) ?? false;
        const matchFormat = res.file_format.toLowerCase().includes(q);
        return (
          matchTitle ||
          matchDesc ||
          matchClass ||
          matchTeacher ||
          matchFormat
        );
      }
      return true;
    });
  }, [resources, selectedClassId, selectedType, searchQuery, onlyNew]);

  // Icon & màu sắc theo loại tài liệu
  function getTypeBadge(type: string, format: string) {
    switch (type) {
      case "pdf":
        return {
          icon: FileText,
          label: format || "PDF",
          className:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60",
          iconColor: "text-rose-600 dark:text-rose-400",
        };
      case "slide":
        return {
          icon: Presentation,
          label: format || "Slide",
          className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60",
          iconColor: "text-amber-600 dark:text-amber-400",
        };
      case "video":
        return {
          icon: Video,
          label: format || "Video",
          className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      default:
        return {
          icon: LinkIcon,
          label: format || "Link",
          className:
            "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60",
          iconColor: "text-indigo-600 dark:text-indigo-400",
        };
    }
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  }

  function handleResetFilters() {
    setSearchQuery("");
    setSelectedClassId("all");
    setSelectedType("all");
    setOnlyNew(false);
  }

  return (
    <div className="space-y-6">
      {/* 1. THỐNG KÊ NHANH (SUMMARY STATS CÓ CLICK-TO-FILTER & HOVER EFFECTS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng số tài liệu */}
        <div
          onClick={() => {
            setSelectedClassId("all");
            setSelectedType("all");
            setSearchQuery("");
            setOnlyNew(false);
          }}
          className={cn(
            "p-4 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            selectedClassId === "all" && selectedType === "all" && !searchQuery && !onlyNew
              ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/25 dark:bg-blue-950/20"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tổng số tài liệu
            </p>
            <p className="text-2xl font-black text-foreground">{totalCount}</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Bấm để xem tất cả</p>
          </div>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105",
              selectedClassId === "all" && selectedType === "all" && !searchQuery && !onlyNew
                ? "bg-blue-600 text-white shadow-blue-500/20"
                : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
            )}
          >
            <FolderArchive className="w-5 h-5" />
          </div>
        </div>

        {/* Lớp có tài liệu */}
        <div
          onClick={() => setSelectedClassId("all")}
          className={cn(
            "p-4 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            selectedClassId !== "all"
              ? "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
              : "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/25 dark:bg-indigo-950/20"
          )}
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Lớp đang học
            </p>
            <p className="text-2xl font-black text-foreground">
              {classOptions.length}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Toàn bộ lớp học</p>
          </div>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105",
              selectedClassId === "all"
                ? "bg-indigo-600 text-white shadow-indigo-500/20"
                : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
            )}
          >
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Mới cập nhật */}
        <div
          onClick={() => setOnlyNew((prev) => !prev)}
          className={cn(
            "p-4 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            onlyNew
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/25 dark:bg-emerald-950/20"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Tài liệu mới
              </p>
              {onlyNew && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {newCount > 0 ? newCount : totalCount > 0 ? 1 : 0}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {onlyNew ? "Đang lọc tài liệu mới (Hủy)" : "Cập nhật tuần này (Lọc)"}
            </p>
          </div>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105",
              onlyNew
                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Đa dạng định dạng */}
        <div
          onClick={() => {
            // Bấm để chuyển đổi nhanh qua các định dạng: pdf -> slide -> video -> all
            if (selectedType === "all") setSelectedType("pdf");
            else if (selectedType === "pdf") setSelectedType("slide");
            else if (selectedType === "slide") setSelectedType("video");
            else setSelectedType("all");
          }}
          className={cn(
            "p-4 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            selectedType !== "all"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/25 dark:bg-amber-950/20"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Học liệu số {selectedType !== "all" && `(${selectedType.toUpperCase()})`}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <span>{pdfCount} PDF</span>
              <span>•</span>
              <span>{slideCount} Slide</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {selectedType !== "all" ? "Bấm để đổi định dạng" : `Kèm ${videoCount} video`}
            </p>
          </div>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105",
              selectedType !== "all"
                ? "bg-amber-600 text-white shadow-amber-500/20"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
            )}
          >
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG & BỘ LỌC (TOOLBAR & FILTERS) */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs space-y-4">
        {/* Hàng 1: Ô tìm kiếm và Bộ lọc lớp */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu theo tên, lớp học, giáo viên..."
              className="pl-9 pr-8 h-10 rounded-xl bg-slate-50 dark:bg-muted/40 border-slate-200/80 dark:border-border text-xs focus-visible:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bộ chọn loại định dạng */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">
              Định dạng:
            </span>
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                selectedType === "all"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:text-foreground"
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("pdf")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                selectedType === "pdf"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-3 h-3" />
              <span>PDF ({pdfCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("slide")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                selectedType === "slide"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:text-foreground"
              )}
            >
              <Presentation className="w-3 h-3" />
              <span>Slide ({slideCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("video")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                selectedType === "video"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="w-3 h-3" />
              <span>Video ({videoCount})</span>
            </button>
          </div>
        </div>

        {/* Hàng 2: Bộ lọc theo từng lớp học (Tabs) */}
        {classOptions.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-border/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Lớp học:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedClassId("all")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0",
                selectedClassId === "all"
                  ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-muted/80"
              )}
            >
              Tất cả lớp ({totalCount})
            </button>

            {classOptions.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 max-w-[220px] truncate",
                  selectedClassId === cls.id
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-muted/80"
                )}
                title={cls.name}
              >
                {cls.name} ({cls.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. DANH SÁCH TÀI LIỆU DẠNG LƯỚI (GRID LAYOUT) */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const badge = getTypeBadge(res.type, res.file_format);
            const IconComponent = badge.icon;

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between group"
              >
                {/* Phần đầu: Header của thẻ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Badge loại file */}
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border",
                        badge.className
                      )}
                    >
                      <IconComponent className={cn("w-3.5 h-3.5", badge.iconColor)} />
                      <span>{badge.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {res.is_new && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Mới
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-400">
                        {res.file_size}
                      </span>
                    </div>
                  </div>

                  {/* Tên tài liệu */}
                  <div>
                    <h3
                      className="text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
                      onClick={() => setViewingResource(res)}
                      title={res.title}
                    >
                      {res.title}
                    </h3>
                    {res.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phần thân: Thông tin lớp học, giáo viên, ngày tháng */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-border/60 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                      {res.class_name}
                    </span>
                    {res.class_code && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-muted text-slate-500 shrink-0">
                        {res.class_code}
                      </span>
                    )}
                  </div>

                  {res.teacher_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">GV: {res.teacher_name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(res.created_at)}</span>
                    </span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {res.file_format}
                    </span>
                  </div>
                </div>

                {/* Phần chân: Nút hành động */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-border/60 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingResource(res)}
                    className="rounded-xl text-xs font-bold h-9 border-slate-200/90 dark:border-border gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl text-xs font-bold h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
                  >
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở học liệu"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở xem</span>
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. TRẠNG THÁI RỖNG (EMPTY STATE) */
        <div className="bg-white dark:bg-card rounded-2xl border border-dashed border-slate-200 dark:border-border p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileCode className="w-7 h-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Không tìm thấy tài liệu phù hợp
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchQuery || selectedClassId !== "all" || selectedType !== "all"
                ? "Không có tài liệu nào khớp với từ khóa tìm kiếm hoặc bộ lọc lớp học của bạn. Hãy thử xóa hoặc điều chỉnh bộ lọc."
                : "Hiện tại các lớp học của bạn chưa được cập nhật tài liệu. Vui lòng quay lại sau hoặc liên hệ giáo viên phụ trách."}
            </p>
          </div>

          {(searchQuery || selectedClassId !== "all" || selectedType !== "all") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </Button>
          )}
        </div>
      )}

      {/* 5. DIALOG XEM CHI TIẾT TÀI LIỆU (PREVIEW DETAIL DIALOG) */}
      <Dialog
        open={Boolean(viewingResource)}
        onOpenChange={(open) => !open && setViewingResource(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          {viewingResource && (
            <div className="space-y-5">
              <DialogHeader className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const b = getTypeBadge(
                      viewingResource.type,
                      viewingResource.file_format
                    );
                    const I = b.icon;
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border",
                          b.className
                        )}
                      >
                        <I className="w-3.5 h-3.5" />
                        <span>{b.label}</span>
                      </span>
                    );
                  })()}
                  <span className="text-xs text-muted-foreground font-mono">
                    {viewingResource.file_size}
                  </span>
                </div>
                <DialogTitle className="text-base font-bold text-foreground leading-snug pt-1">
                  {viewingResource.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {viewingResource.description ||
                    "Tài liệu học tập chính thức do giáo viên và trung tâm biên soạn."}
                </DialogDescription>
              </DialogHeader>

              {/* Thông tin metadata */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lớp học:</span>
                  <span className="font-bold text-foreground">
                    {viewingResource.class_name}
                  </span>
                </div>

                {viewingResource.class_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mã lớp:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {viewingResource.class_code}
                    </span>
                  </div>
                )}

                {viewingResource.teacher_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Giáo viên:</span>
                    <span className="font-semibold text-foreground">
                      {viewingResource.teacher_name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Định dạng file:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {viewingResource.file_format}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ngày cập nhật:</span>
                  <span>{formatDate(viewingResource.created_at)}</span>
                </div>
              </div>

              {/* Hộp ghi chú sử dụng */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="leading-relaxed">
                  Bạn có thể mở tài liệu để đọc trực tiếp trên trình duyệt hoặc tải về thiết bị cá nhân để ôn tập ngoại tuyến.
                </p>
              </div>

              {/* Chân Dialog: Các nút hành động */}
              <DialogFooter className="flex-row sm:justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingResource(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Đóng
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <a
                    href={viewingResource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở tài liệu</span>
                  </a>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
