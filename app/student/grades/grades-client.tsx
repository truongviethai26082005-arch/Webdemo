"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  StudentGradesSummary,
  StudentClassGrades,
} from "@/lib/actions/student";
import {
  Award,
  TrendingUp,
  CalendarCheck,
  ClipboardCheck,
  Sparkles,
  BookOpen,
  User,
  CheckCircle2,
  AlertCircle,
  MessageSquareQuote,
  Star,
  Layers,
  GraduationCap,
  RotateCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentGradesClientProps {
  initialSummary: StudentGradesSummary;
}

export function StudentGradesClient({
  initialSummary,
}: StudentGradesClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary] = useState<StudentGradesSummary>(initialSummary);
  const classes = summary.classes || [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Tab lớp học được chọn (mặc định lớp đầu tiên nếu có)
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.class_id || ""
  );

  const selectedClass: StudentClassGrades | undefined =
    classes.find((c) => c.class_id === selectedClassId) || classes[0];

  function getRankingColor(ranking: string) {
    switch (ranking) {
      case "Xuất sắc":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          pill: "bg-purple-600 text-white",
        };
      case "Giỏi":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          pill: "bg-emerald-600 text-white",
        };
      case "Khá":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          pill: "bg-blue-600 text-white",
        };
      default:
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          pill: "bg-amber-600 text-white",
        };
    }
  }

  function getScoreBadge(score: number) {
    if (score >= 9.0) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    }
    if (score >= 8.0) {
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    }
    if (score >= 6.5) {
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    }
    return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
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

  if (classes.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-100/90 dark:border-border/60 bg-white dark:bg-card relative overflow-hidden shadow-xs py-16 sm:py-24 px-6 flex flex-col items-center justify-center min-h-[480px]">
        {/* Ambient soft background gradient blobs khớp ảnh mẫu */}
        <div className="w-72 h-72 rounded-full bg-sky-200/20 dark:bg-sky-900/10 blur-3xl absolute -left-12 -bottom-12 pointer-events-none" />
        <div className="w-36 h-24 rounded-full bg-sky-100/60 dark:bg-sky-950/20 blur-xl absolute left-8 bottom-12 pointer-events-none" />

        <div className="w-80 h-80 rounded-full bg-indigo-200/20 dark:bg-indigo-900/10 blur-3xl absolute -right-12 -bottom-12 pointer-events-none" />
        <div className="w-48 h-48 rounded-full bg-purple-100/50 dark:bg-purple-950/20 blur-xl absolute right-8 bottom-6 pointer-events-none" />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
          {/* 3D Illustration SVG chuẩn 100% chi tiết ảnh mẫu */}
          <svg
            width="280"
            height="200"
            viewBox="0 0 280 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none pointer-events-none drop-shadow-xs mb-2"
          >
            <defs>
              <radialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>

              <linearGradient id="boardBorder" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>

              <linearGradient id="magRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>

              <linearGradient id="magHandle" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>

              <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>

              <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>

              <linearGradient id="planeGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="planeGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* 1. Vầng sáng dịu phía sau */}
            <ellipse cx="140" cy="115" rx="90" ry="60" fill="url(#cardGlow)" />

            {/* 2. Cành lá xanh tươi bên trái */}
            <g>
              <path
                d="M78 95 C70 82 82 72 92 80 C95 86 90 95 78 95 Z"
                fill="url(#leafGrad1)"
              />
              <path
                d="M82 108 C65 98 72 80 88 88 C98 94 92 108 82 108 Z"
                fill="url(#leafGrad2)"
              />
              <path
                d="M88 120 C75 115 78 102 92 105 C98 110 96 120 88 120 Z"
                fill="url(#leafGrad1)"
              />
            </g>

            {/* 3. Bảng kẹp giấy (Clipboard) */}
            <g filter="drop-shadow(0 4px 6px rgba(59, 130, 246, 0.08))">
              <rect
                x="95"
                y="42"
                width="90"
                height="122"
                rx="14"
                fill="url(#boardGrad)"
                stroke="url(#boardBorder)"
                strokeWidth="2.5"
              />
              {/* Tờ giấy trắng */}
              <rect
                x="103"
                y="52"
                width="74"
                height="102"
                rx="8"
                fill="#ffffff"
              />

              {/* Khóa kẹp kim loại xanh bên trên */}
              <rect
                x="118"
                y="35"
                width="44"
                height="16"
                rx="7"
                fill="#3b82f6"
              />
              <rect
                x="132"
                y="40"
                width="16"
                height="6"
                rx="3"
                fill="#1d4ed8"
              />
              <path
                d="M136 35 C136 31 144 31 144 35"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />

              {/* Các dòng checklist tích xanh */}
              {/* Dòng 1 */}
              <g>
                <rect x="111" y="66" width="13" height="13" rx="3.5" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="1" />
                <path d="M114 72.5 L116.5 75 L121 69.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="129" y="68" width="38" height="3.5" rx="1.75" fill="#93c5fd" />
                <rect x="129" y="74.5" width="22" height="3.5" rx="1.75" fill="#bfdbfe" />
              </g>

              {/* Dòng 2 */}
              <g>
                <rect x="111" y="87" width="13" height="13" rx="3.5" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="1" />
                <path d="M114 93.5 L116.5 96 L121 90.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="129" y="89" width="34" height="3.5" rx="1.75" fill="#93c5fd" />
                <rect x="129" y="95.5" width="18" height="3.5" rx="1.75" fill="#bfdbfe" />
              </g>

              {/* Dòng 3 */}
              <g>
                <rect x="111" y="108" width="13" height="13" rx="3.5" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="1" />
                <path d="M114 114.5 L116.5 117 L121 111.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="129" y="110" width="30" height="3.5" rx="1.75" fill="#93c5fd" />
                <rect x="129" y="116.5" width="16" height="3.5" rx="1.75" fill="#bfdbfe" />
              </g>
            </g>

            {/* 4. Dải mây bồng bềnh ở chân */}
            <g opacity="0.95">
              <ellipse cx="140" cy="164" rx="60" ry="18" fill="url(#cloudGrad)" />
              <ellipse cx="106" cy="158" rx="26" ry="16" fill="url(#cloudGrad)" />
              <ellipse cx="174" cy="158" rx="28" ry="17" fill="url(#cloudGrad)" />
              <ellipse cx="132" cy="154" rx="34" ry="18" fill="#ffffff" />
              <ellipse cx="158" cy="156" rx="28" ry="16" fill="#ffffff" />
            </g>

            {/* 5. Kính lúp 3D bên phải với cán tím */}
            <g filter="drop-shadow(0 6px 8px rgba(99, 102, 241, 0.18))">
              {/* Cán kính tím nghiêng 45 độ */}
              <path
                d="M182 135 L200 155"
                stroke="url(#magHandle)"
                strokeWidth="9"
                strokeLinecap="round"
              />
              {/* Khớp nối cán kính */}
              <path
                d="M178 131 L183 136"
                stroke="#4f46e5"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Tròng kính trong suốt ánh xanh */}
              <circle cx="168" cy="120" r="20" fill="#38bdf8" fillOpacity="0.18" />
              {/* Vành kính xanh dương nổi khối */}
              <circle
                cx="168"
                cy="120"
                r="20"
                stroke="url(#magRing)"
                strokeWidth="6"
                fill="none"
              />
              {/* Vệt phản chiếu cong trên tròng kính */}
              <path
                d="M157 112 A 15 15 0 0 1 173 107"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
            </g>

            {/* 6. Máy bay giấy màu xanh bay về góc trên bên phải */}
            <g transform="translate(202, 28) rotate(-10)">
              {/* Vệt lượn nét đứt */}
              <path
                d="M-8 22 C-4 18 0 16 6 14"
                stroke="#93c5fd"
                strokeWidth="1.5"
                strokeDasharray="2 3"
                strokeLinecap="round"
                fill="none"
              />
              <polygon points="12,0 28,14 12,20 16,13" fill="url(#planeGrad1)" />
              <polygon points="12,0 16,13 0,16" fill="url(#planeGrad2)" />
              <polygon points="12,20 16,13 14,16" fill="#1e40af" />
            </g>

            {/* 7. Ngôi sao và hạt lấp lánh trang trí */}
            {/* Ngôi sao 4 cánh xanh lam góc trên trái */}
            <g transform="translate(76, 54)">
              <path
                d="M6 0 Q6 6 12 6 Q6 6 6 12 Q6 6 0 6 Q6 6 6 0 Z"
                fill="#60a5fa"
                opacity="0.8"
              />
            </g>
            {/* Hạt lấp lánh tím bên phải */}
            <polygon points="214,70 217,73 214,76 211,73" fill="#a855f7" opacity="0.75" />
            {/* Chấm tròn cyan nhỏ bên dưới */}
            <circle cx="68" cy="128" r="2.5" fill="#38bdf8" opacity="0.5" />
          </svg>

          {/* Tiêu đề trạng thái khớp 100% ảnh mẫu */}
          <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-foreground mt-4 mb-2 tracking-tight">
            Chưa có dữ liệu bằng điểm
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
            Bạn hiện chưa tham gia lớp học nào hoặc giáo viên chưa cập nhật điểm số cho các bài kiểm tra của bạn.
          </p>

          {/* Nút bấm làm mới gradient Xanh - Tím bo tròn viên thuốc */}
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <RotateCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>
    );
  }

  const overallRankingColors = getRankingColor(summary.overallRanking);

  return (
    <div className="space-y-6">
      {/* 1. THẺ TỔNG QUAN KẾT QUẢ HỌC TẬP (SUMMARY STATS CÓ HOVER EFFECTS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Điểm trung bình tích lũy GPA */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Điểm TB tích lũy (GPA)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tracking-tight">
                {summary.overallGpa}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                / 10
              </span>
            </div>
            <div className="pt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border",
                  overallRankingColors.bg
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span>Xếp loại: {summary.overallRanking}</span>
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Tỷ lệ hoàn thành nhiệm vụ */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Hoàn thành bài tập
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground tracking-tight">
                {summary.completionRate}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đúng hạn & đủ số lượng
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Điểm chuyên cần */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tỷ lệ chuyên cần
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {summary.attendanceRate}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tham gia các buổi học
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Tổng số đầu điểm đánh giá */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tổng số bài kiểm tra
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground tracking-tight">
                {summary.totalAssessments}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                đầu điểm
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Qua {classes.length} lớp học
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. BỘ CHỌN LỚP HỌC (TABS) */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1.5 mr-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Chọn lớp học:</span>
          </span>

          {classes.map((cls) => {
            const isSelected = selectedClass?.class_id === cls.class_id;
            return (
              <button
                key={cls.class_id}
                type="button"
                onClick={() => setSelectedClassId(cls.class_id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 dark:bg-muted/40 text-slate-700 dark:text-muted-foreground border-slate-200/80 dark:border-border hover:bg-slate-100"
                )}
              >
                <span>{cls.class_name}</span>
                <span
                  className={cn(
                    "text-[11px] font-black px-1.5 py-0.2 rounded-md",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-muted text-slate-700 dark:text-slate-200"
                  )}
                >
                  {cls.average_score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CHI TIẾT ĐIỂM SỐ LỚP HỌC ĐƯỢC CHỌN */}
      {selectedClass && (
        <div className="space-y-6">
          {/* Header thông tin lớp học */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                  {selectedClass.class_name}
                </h2>
                {selectedClass.class_code && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground border border-slate-200/60 dark:border-border">
                    {selectedClass.class_code}
                  </span>
                )}
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                    getRankingColor(selectedClass.ranking).bg
                  )}
                >
                  {selectedClass.ranking}
                </span>
              </div>

              {selectedClass.teacher_name && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Giáo viên phụ trách:{" "}
                    <strong className="text-foreground font-semibold">
                      {selectedClass.teacher_name}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Khối Điểm trung bình lớp */}
            <div className="flex items-center gap-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-3.5 rounded-2xl shrink-0 self-start md:self-auto">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  Điểm trung bình môn
                </p>
                <p className="text-xs text-muted-foreground">Theo thang điểm 10</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                {selectedClass.average_score}
              </div>
            </div>
          </div>

          {/* Bảng chi tiết điểm số */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Bảng các đầu điểm chi tiết
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {selectedClass.grades.length} bài kiểm tra / đánh giá
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-muted/40 border-b border-slate-200/80 dark:border-border text-slate-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tên bài kiểm tra / đánh giá</th>
                    <th className="py-3 px-4">Loại điểm</th>
                    <th className="py-3 px-4 text-center">Trọng số</th>
                    <th className="py-3 px-4">Ngày chấm</th>
                    <th className="py-3 px-4 text-center">Điểm số</th>
                    <th className="py-3 px-4 min-w-[200px]">Nhận xét của giáo viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                  {selectedClass.grades.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors"
                    >
                      {/* Tên bài */}
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {item.title}
                      </td>

                      {/* Loại điểm */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-border">
                          {item.type_label}
                        </span>
                      </td>

                      {/* Trọng số */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-500 dark:text-muted-foreground">
                        {item.weight}%
                      </td>

                      {/* Ngày chấm */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-muted-foreground">
                        {formatDate(item.graded_at)}
                      </td>

                      {/* Điểm số */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={cn(
                            "inline-block font-black text-sm px-2.5 py-0.5 rounded-lg border",
                            getScoreBadge(item.score)
                          )}
                        >
                          {item.score}
                        </span>
                      </td>

                      {/* Nhận xét */}
                      <td className="py-3.5 px-4 text-muted-foreground leading-relaxed">
                        {item.feedback || "Hoàn thành bài kiểm tra theo yêu cầu."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. KHỐI NHẬN XÉT & ĐÁNH GIÁ NĂNG LỰC CỦA GIÁO VIÊN */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Đánh giá & Nhận xét của Giáo viên
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Phân tích năng lực chuyên môn và định hướng ôn luyện cho học sinh
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Xếp loại: {selectedClass.ranking}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Điểm mạnh */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Điểm mạnh & Ưu điểm nổi bật</span>
                </div>
                <p className="text-xs text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed pl-6">
                  {selectedClass.teacher_feedback.strengths}
                </p>
              </div>

              {/* Điểm cần rèn luyện thêm */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Điểm cần rèn luyện & Lưu ý</span>
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed pl-6">
                  {selectedClass.teacher_feedback.improvements}
                </p>
              </div>
            </div>

            {/* Lời nhận xét chung */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-foreground">
                  Lời nhận xét tổng quát từ Giáo viên bộ môn:
                </h4>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{selectedClass.teacher_feedback.general_comment}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
