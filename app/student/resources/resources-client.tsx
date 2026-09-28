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
  ChevronRight,
  RotateCcw,
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
      {/* 1. THỐNG KÊ NHANH (3 THẺ TỔNG QUAN CHUẨN 100% THEO THIẾT KẾ MẪU) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Thẻ 1: Tổng số tài liệu */}
        <div
          onClick={() => {
            setSelectedClassId("all");
            setSelectedType("all");
            setSearchQuery("");
            setOnlyNew(false);
          }}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
            selectedClassId === "all" && selectedType === "all" && !searchQuery && !onlyNew
              ? "border-blue-400/80 ring-2 ring-blue-500/10"
              : "border-slate-100 dark:border-border hover:border-blue-300 dark:hover:border-blue-800"
          )}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C10.1162 5 10.625 5.21071 11 5.58579L12.4142 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                  fill="#3b82f6"
                  fillOpacity="0.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 13H15M12 10V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Tổng số tài liệu
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1a73e8] dark:text-blue-400 leading-tight">
                {totalCount}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-muted-foreground">
                Bấm để xem tất cả
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Thẻ 2: Tập tin mới */}
        <div
          onClick={() => setOnlyNew((prev) => !prev)}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
            onlyNew
              ? "border-purple-400/80 ring-2 ring-purple-500/10"
              : "border-slate-100 dark:border-border hover:border-purple-300 dark:hover:border-purple-800"
          )}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-purple-100/70 dark:bg-purple-950/60 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Tập tin mới
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 leading-tight">
                {newCount}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-muted-foreground">
                Tài liệu vừa được cập nhật
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Thẻ 3: Học liệu số */}
        <div
          onClick={() => {
            if (selectedType === "all") setSelectedType("pdf");
            else if (selectedType === "pdf") setSelectedType("slide");
            else if (selectedType === "slide") setSelectedType("video");
            else setSelectedType("all");
          }}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
            selectedType !== "all"
              ? "border-emerald-400/80 ring-2 ring-emerald-500/10"
              : "border-slate-100 dark:border-border hover:border-emerald-300 dark:hover:border-emerald-800"
          )}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="12" cy="19" r="2.5" />
                <line x1="8.2" y1="8" x2="10.2" y2="10.2" />
                <line x1="15.8" y1="8" x2="13.8" y2="10.2" />
                <line x1="12" y1="15" x2="12" y2="16.5" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Học liệu số
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                {pdfCount + slideCount + videoCount}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-muted-foreground">
                PDF • Slide • Video
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. THANH TÌM KIẾM & BỘ LỌC ĐỊNH DẠNG (CHUẨN HÀNG NGANG THEO MẪU) */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-2.5 sm:p-3 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Ô tìm kiếm dạng pill bo tròn hoàn toàn */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu theo tên, lớp học, giáo viên..."
              className="w-full h-10 sm:h-11 pl-10 pr-9 rounded-full bg-slate-50/80 dark:bg-muted/40 border border-slate-100 dark:border-border text-xs sm:text-sm text-slate-800 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bộ lọc định dạng tài liệu dạng pill */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 py-1 lg:py-0">
            <span className="text-xs font-medium text-slate-400 dark:text-muted-foreground mr-1 shrink-0">
              Định dạng:
            </span>

            {/* Tất cả */}
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={cn(
                "h-9 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs",
                selectedType === "all"
                  ? "bg-[#1a73e8] text-white shadow-blue-500/20"
                  : "bg-slate-50 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/80"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tất cả</span>
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={() => setSelectedType("pdf")}
              className={cn(
                "h-9 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs",
                selectedType === "pdf"
                  ? "bg-rose-600 text-white shadow-rose-500/20"
                  : "bg-slate-50 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/80"
              )}
            >
              <FileText className={cn("w-3.5 h-3.5", selectedType === "pdf" ? "text-white" : "text-rose-500")} />
              <span>PDF ({pdfCount})</span>
            </button>

            {/* Slide */}
            <button
              type="button"
              onClick={() => setSelectedType("slide")}
              className={cn(
                "h-9 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs",
                selectedType === "slide"
                  ? "bg-amber-500 text-white shadow-amber-500/20"
                  : "bg-slate-50 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/80"
              )}
            >
              <Presentation className={cn("w-3.5 h-3.5", selectedType === "slide" ? "text-white" : "text-amber-500")} />
              <span>Slide ({slideCount})</span>
            </button>

            {/* Video */}
            <button
              type="button"
              onClick={() => setSelectedType("video")}
              className={cn(
                "h-9 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs",
                selectedType === "video"
                  ? "bg-purple-600 text-white shadow-purple-500/20"
                  : "bg-slate-50 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/80"
              )}
            >
              <Video className={cn("w-3.5 h-3.5", selectedType === "video" ? "text-white" : "text-purple-500")} />
              <span>Video ({videoCount})</span>
            </button>
          </div>
        </div>

        {/* Lớp học (nếu có nhiều lớp) */}
        {classOptions.length > 1 && (
          <div className="pt-2 border-t border-slate-100 dark:border-border/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 dark:text-muted-foreground shrink-0 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Lớp học:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedClassId("all")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0",
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
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 max-w-[220px] truncate",
                  selectedClassId === cls.id
                    ? "bg-[#1a73e8] text-white shadow-2xs"
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

      {/* 3. DANH SÁCH TÀI LIỆU DẠNG LƯỚI HOẶC TRẠNG THÁI RỖNG (CHUẨN MẪU) */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const badge = getTypeBadge(res.type, res.file_format);
            const IconComponent = badge.icon;

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between group"
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
                    className="rounded-xl text-xs font-bold h-9 bg-[#1a73e8] hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
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
        /* 4. TRẠNG THÁI RỖNG (EMPTY STATE CHUẨN 100% THEO THIẾT KẾ MẪU TRONG ẢNH) */
        <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border p-12 sm:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
          {/* Hiệu ứng màu pastel loang nhẹ phía sau */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

          {/* Minh họa 3D vector: Folder xanh, tài liệu nhô ra, sổ tay tím, mầm cây xanh và ánh sáng lấp lánh */}
          <div className="relative z-10 mb-2 select-none">
            <svg
              width="180"
              height="110"
              viewBox="0 0 180 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bóng mờ bên dưới */}
              <ellipse cx="90" cy="98" rx="65" ry="8" fill="#e0e7ff" fillOpacity="0.5" />

              {/* Nhánh lá mầm cây xanh phía sau folder */}
              <path d="M72 65C62 50 64 35 76 25C80 38 78 52 72 65Z" fill="#34d399" />
              <path d="M72 65C68 48 74 38 85 30C86 44 80 56 72 65Z" fill="#10b981" />

              {/* Thân folder xanh dương phía sau */}
              <path
                d="M42 58C42 54.6863 44.6863 52 48 52H64L70 58H104C107.314 58 110 60.6863 110 64V90C110 93.3137 107.314 96 104 96H48C44.6863 96 42 93.3137 42 90V58Z"
                fill="#2563eb"
              />

              {/* Các trang tài liệu giấy trắng nhô ra bên trong */}
              <rect
                x="56"
                y="26"
                width="36"
                height="46"
                rx="3"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
              <line
                x1="62"
                y1="36"
                x2="84"
                y2="36"
                stroke="#93c5fd"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="62"
                y1="43"
                x2="84"
                y2="43"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="62"
                y1="50"
                x2="76"
                y2="50"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Mặt trước nắp folder xanh nhạt mở nghiêng */}
              <path
                d="M38 60C38 57.2386 40.2386 55 43 55H66L72 61H107C109.761 61 112 63.2386 112 66V90C112 93.3137 109.314 96 106 96H44C40.6863 96 38 93.3137 38 90V60Z"
                fill="#60a5fa"
              />
              <path
                d="M40 70L40 92C40 94.2091 41.7909 96 44 96H106C108.209 96 110 94.2091 110 92V70L74 70L68 64H44C41.7909 64 40 65.7909 40 68Z"
                fill="#3b82f6"
              />
              <rect x="44" y="74" width="8" height="4" rx="1.5" fill="#ffffff" fillOpacity="0.7" />

              {/* Quyển sổ tím đứng nghiêng bên phải */}
              <rect
                x="108"
                y="44"
                width="26"
                height="46"
                rx="4"
                fill="#7c3aed"
                transform="rotate(8 108 44)"
              />
              <rect
                x="106"
                y="44"
                width="4"
                height="46"
                rx="1.5"
                fill="#5b21b6"
                transform="rotate(8 106 44)"
              />
              <line
                x1="113"
                y1="55"
                x2="128"
                y2="57"
                stroke="#c4b5fd"
                strokeWidth="2"
                strokeLinecap="round"
                transform="rotate(8 113 55)"
              />

              {/* Các hạt sáng lấp lánh & máy bay giấy lơ lửng */}
              <path d="M30 46L36 43L34 49L30 46Z" fill="#60a5fa" />
              <circle cx="138" cy="36" r="2" fill="#818cf8" />
              <circle cx="28" cy="62" r="1.5" fill="#93c5fd" />
              <path d="M140 48L148 44L145 52L140 48Z" fill="#a78bfa" />
            </svg>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-foreground z-10">
            Chưa có tài liệu nào
          </h3>

          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1.5 max-w-md leading-relaxed z-10">
            {searchQuery || selectedClassId !== "all" || selectedType !== "all" || onlyNew
              ? "Không có tài liệu nào khớp với từ khóa tìm kiếm hoặc bộ lọc của bạn. Hãy thử chọn điều kiện khác."
              : "Hiện tại các lớp học của bạn chưa có tài liệu. Vui lòng quay lại sau hoặc liên hệ giáo viên phụ trách."}
          </p>

          <button
            type="button"
            onClick={() => {
              handleResetFilters();
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50/80 hover:bg-blue-100/90 text-[#1a73e8] dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-900/60 text-xs font-semibold transition-all shadow-2xs z-10 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
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
