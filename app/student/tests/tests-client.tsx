"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  StudentTestsSummary,
  UpcomingTestSession,
  CompletedTestResult,
} from "@/lib/actions/student";
import {
  CalendarCheck,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Info,
  Laptop,
  Building2,
  FileText,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Search,
  X,
  Play,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StudentTestsClientProps {
  initialData: StudentTestsSummary;
}

export function StudentTestsClient({ initialData }: StudentTestsClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data] = useState<StudentTestsSummary>(initialData);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // State xác nhận tham gia
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    data.upcomingTests.forEach((t) => {
      if (t.status === "confirmed") {
        initial[t.id] = true;
      }
    });
    return initial;
  });

  // Modal quy chế
  const [selectedRuleTest, setSelectedRuleTest] = useState<UpcomingTestSession | null>(null);

  // Modal xem đề / đáp án
  const [viewPaperDialog, setViewPaperDialog] = useState<{
    open: boolean;
    title: string;
    type: "paper" | "solution";
  }>({
    open: false,
    title: "",
    type: "paper",
  });

  const handleConfirmAttendance = (testId: string) => {
    setConfirmedIds((prev) => ({
      ...prev,
      [testId]: true,
    }));
  };

  // Tính số ngày còn lại
  const getDaysRemainingText = (dateStr: string) => {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) return `Còn ${diffDays} ngày`;
      if (diffDays === 0) return "Hôm nay thi";
      return "Đã diễn ra";
    } catch {
      return "Sắp diễn ra";
    }
  };

  // Bộ lọc tìm kiếm
  const filteredUpcoming = useMemo(() => {
    if (!searchQuery.trim()) return data.upcomingTests;
    const q = searchQuery.toLowerCase().trim();
    return data.upcomingTests.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.class_name || "").toLowerCase().includes(q) ||
        t.test_code.toLowerCase().includes(q)
    );
  }, [data.upcomingTests, searchQuery]);

  const filteredCompleted = useMemo(() => {
    if (!searchQuery.trim()) return data.completedTests;
    const q = searchQuery.toLowerCase().trim();
    return data.completedTests.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.class_name || "").toLowerCase().includes(q) ||
        t.test_code.toLowerCase().includes(q)
    );
  }, [data.completedTests, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. KHỐI THẺ THỐNG KÊ TỔNG QUAN (3 CARDS CHUẨN THEO ẢNH MẪU) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Ca thi sắp tới */}
        <div
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
            activeTab === "upcoming"
              ? "border-blue-400/80 ring-2 ring-blue-500/10"
              : "border-slate-100 dark:border-border hover:border-blue-300 dark:hover:border-blue-800"
          )}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Ca thi sắp tới
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#1a73e8] dark:text-blue-400 leading-tight">
                  {data.stats.upcomingCount}
                </span>
                <span className="text-xs text-slate-400 font-normal">đợt thi</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#1a73e8] dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5">
                Bấm để xem lịch sắp tới ›
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Đã tham gia */}
        <div
          onClick={() => setActiveTab("completed")}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
            activeTab === "completed"
              ? "border-purple-400/80 ring-2 ring-purple-500/10"
              : "border-slate-100 dark:border-border hover:border-purple-300 dark:hover:border-purple-800"
          )}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-purple-100/70 dark:bg-purple-950/60 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Đã tham gia
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 leading-tight">
                  {data.stats.completedCount}
                </span>
                <span className="text-xs text-slate-400 font-normal">kỳ đánh giá</span>
              </div>
              <p className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-0.5">
                Bấm để xem kết quả điểm ›
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Điểm thi gần nhất */}
        <div
          onClick={() => setActiveTab("completed")}
          className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border hover:border-emerald-300 dark:hover:border-emerald-800 p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Điểm thi gần nhất
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                  {data.stats.latestScore !== null ? data.stats.latestScore : "--"}
                </span>
                {data.stats.latestScore !== null && (
                  <span className="text-xs text-slate-400 font-normal">/ {data.stats.latestScoreMax}</span>
                )}
                {data.stats.latestScoreRanking && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ml-1">
                    {data.stats.latestScoreRanking}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-0.5">
                Bấm để xem chi tiết bài thi ›
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. HÀNG TABS & Ô TÌM KIẾM DẠNG PILL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Tabs pills */}
        <div className="flex items-center gap-2">
          {/* Tab 1: Lịch thi sắp tới */}
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer",
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-foreground"
            )}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-white" />
            <span>Lịch thi sắp tới</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                activeTab === "upcoming"
                  ? "bg-white/25 text-white"
                  : "text-blue-600 bg-blue-50 dark:bg-blue-950"
              )}
            >
              {data.upcomingTests.length}
            </span>
          </button>

          {/* Tab 2: Lịch sử thi & Kết quả */}
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "completed"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/20"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-foreground"
            )}
          >
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>Lịch sử thi & Kết quả</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                activeTab === "completed"
                  ? "bg-white/25 text-white"
                  : "text-purple-600 font-bold"
              )}
            >
              {data.completedTests.length}
            </span>
          </button>
        </div>

        {/* Ô tìm kiếm dạng pill bên phải */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu theo tên, lớp học, giáo viên..."
            className="w-full h-10 pl-9 pr-8 rounded-full bg-slate-50/80 dark:bg-muted/40 border border-slate-100/90 dark:border-border text-xs text-slate-800 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. NỘI DUNG TAB 1: LỊCH THI SẮP TỚI */}
      {activeTab === "upcoming" && (
        <div>
          {filteredUpcoming.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border p-12 sm:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
              <div className="absolute top-10 left-10 w-48 h-48 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Illustration Vector SVG for Exam Calendar */}
              <div className="relative z-10 mb-2 select-none">
                <svg width="180" height="110" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="90" cy="98" rx="65" ry="8" fill="#e0e7ff" fillOpacity="0.5" />
                  <rect x="52" y="32" width="76" height="60" rx="10" fill="#3b82f6" />
                  <rect x="56" y="36" width="68" height="52" rx="7" fill="#ffffff" />
                  <rect x="66" y="26" width="6" height="12" rx="3" fill="#2563eb" />
                  <rect x="87" y="26" width="6" height="12" rx="3" fill="#2563eb" />
                  <rect x="108" y="26" width="6" height="12" rx="3" fill="#2563eb" />
                  <line x1="56" y1="48" x2="124" y2="48" stroke="#dbeafe" strokeWidth="2" />
                  <circle cx="72" cy="60" r="3.5" fill="#93c5fd" />
                  <circle cx="90" cy="60" r="3.5" fill="#3b82f6" />
                  <circle cx="108" cy="60" r="3.5" fill="#93c5fd" />
                  <circle cx="72" cy="74" r="3.5" fill="#93c5fd" />
                  <circle cx="90" cy="74" r="3.5" fill="#93c5fd" />
                  <circle cx="108" cy="74" r="3.5" fill="#60a5fa" />
                  <path d="M36 46L40 43L38 48L36 46Z" fill="#60a5fa" />
                  <circle cx="146" cy="40" r="2.5" fill="#818cf8" />
                  <circle cx="34" cy="66" r="2" fill="#93c5fd" />
                </svg>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-foreground z-10">
                {searchQuery ? "Không tìm thấy ca thi nào" : "Chưa có lịch hẹn test nào"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1.5 max-w-md leading-relaxed z-10">
                {searchQuery
                  ? "Không có ca thi thử sắp diễn ra phù hợp với từ khóa tìm kiếm của bạn."
                  : "Hiện tại bạn chưa có ca thi thử hoặc lịch hẹn kiểm tra năng lực nào sắp tới từ trung tâm."}
              </p>

              <button
                type="button"
                onClick={() => {
                  if (searchQuery) setSearchQuery("");
                  handleRefresh();
                }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all z-10 cursor-pointer active:scale-95"
              >
                <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                <span>Làm mới</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredUpcoming.map((test, index) => {
                const daysInfo = getDaysRemainingText(test.date);
                const isOnline = test.format === "online";
                const isConfirmed = confirmedIds[test.id];

                return (
                  <div
                    key={test.id}
                    className={cn(
                      "bg-white dark:bg-card rounded-3xl border border-slate-100/90 dark:border-border/60 shadow-xs p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md",
                      isOnline ? "border-t-2 border-t-purple-400" : "border-t-2 border-t-emerald-400"
                    )}
                  >
                    <div>
                      {/* Hàng badge trên đầu */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5",
                              isOnline
                                ? "bg-purple-50 text-purple-600 border border-purple-200/60"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                            )}
                          >
                            {isOnline ? (
                              <>
                                <Laptop className="w-3.5 h-3.5" />
                                <span>Thi Trực Tuyến</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3.5 h-3.5" />
                                <span>Thi Trực Tiếp</span>
                              </>
                            )}
                          </span>

                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100/80 text-slate-600">
                            #{test.test_code}
                          </span>
                        </div>

                        {/* Badge đếm ngược dạng viên thuốc Cyan */}
                        <div className="bg-[#00bcd4] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-white" />
                          <span>{daysInfo}</span>
                        </div>
                      </div>

                      {/* Tiêu đề ca thi */}
                      <h4 className="text-base font-bold text-slate-900 dark:text-foreground mt-3 tracking-tight">
                        {test.title}
                      </h4>

                      {/* Tên lớp học */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted-foreground mt-0.5 mb-4">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.class_name}</span>
                      </div>

                      {/* Hộp thông số 2x2 nền xám nhẹ */}
                      <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl p-4 grid grid-cols-2 gap-3 border border-slate-100/80 dark:border-border/40">
                        {/* Ngày thi */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Ngày thi</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{test.date}</p>
                          </div>
                        </div>

                        {/* Thời gian làm bài */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Thời gian làm bài</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {test.time} ({test.duration_minutes} phút)
                            </p>
                          </div>
                        </div>

                        {/* Địa điểm / Phòng thi */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Địa điểm / Phòng thi</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                              {test.room}
                            </p>
                          </div>
                        </div>

                        {/* Cán bộ coi thi */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Cán bộ coi thi</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                              {test.proctor_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dải ghi chú lưu ý */}
                      {test.notes && (
                        <div className="bg-sky-50/60 dark:bg-sky-950/30 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-4 border border-sky-100/60">
                          <Info className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="leading-relaxed">{test.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Hàng nút thao tác cuối thẻ */}
                    <div className="flex items-center justify-between mt-5 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRuleTest(test)}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Quy chế ca thi</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (test.meeting_url) {
                                  window.open(test.meeting_url, "_blank");
                                } else {
                                  alert("Ca thi trực tuyến sẽ mở phòng trước giờ bắt đầu 15 phút.");
                                }
                              }}
                              className="border border-slate-200 dark:border-border rounded-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-muted transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Vào phòng thi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConfirmAttendance(test.id)}
                              disabled={isConfirmed}
                              className={cn(
                                "rounded-full px-5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer",
                                isConfirmed
                                  ? "bg-emerald-600 text-white cursor-default"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                              )}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>{isConfirmed ? "Đã xác nhận" : "Xác nhận tham gia"}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Phòng thi ${test.room} sẽ mở tiếp đón học sinh trước 15 phút.`);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-5 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Vào phòng thi</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. NỘI DUNG TAB 2: LỊCH SỬ THI & KẾT QUẢ */}
      {activeTab === "completed" && (
        <div>
          {filteredCompleted.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border p-12 sm:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
              <div className="absolute top-10 left-10 w-48 h-48 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Illustration Vector SVG for Completed Test/Award */}
              <div className="relative z-10 mb-2 select-none">
                <svg width="180" height="110" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="90" cy="98" rx="65" ry="8" fill="#f3e8ff" fillOpacity="0.6" />
                  <rect x="55" y="24" width="70" height="68" rx="10" fill="#a855f7" />
                  <rect x="59" y="28" width="62" height="60" rx="7" fill="#ffffff" />
                  <circle cx="90" cy="50" r="14" fill="#f3e8ff" stroke="#c084fc" strokeWidth="2" />
                  <path d="M84 50L88 54L96 46" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="70" y1="72" x2="110" y2="72" stroke="#e9d5ff" strokeWidth="3" strokeLinecap="round" />
                  <line x1="76" y1="79" x2="104" y2="79" stroke="#f3e8ff" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="144,38 147,41 144,44 141,41" fill="#a855f7" opacity="0.8" />
                  <circle cx="36" cy="58" r="2.5" fill="#c084fc" />
                </svg>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-foreground z-10">
                {searchQuery ? "Không tìm thấy kết quả thi nào" : "Chưa có lịch sử kết quả thi"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1.5 max-w-md leading-relaxed z-10">
                {searchQuery
                  ? "Không có kết quả thi nào phù hợp với từ khóa tìm kiếm của bạn."
                  : "Sau khi hoàn thành các đợt thi thử và được cán bộ chấm điểm, kết quả chi tiết sẽ hiển thị tại đây."}
              </p>

              <button
                type="button"
                onClick={() => {
                  if (searchQuery) setSearchQuery("");
                  handleRefresh();
                }}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all z-10 cursor-pointer active:scale-95"
              >
                <RotateCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                <span>Làm mới</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredCompleted.map((test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-card rounded-3xl border border-slate-100/90 dark:border-border/60 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                          {test.subject}
                        </span>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100/80 text-slate-600">
                          #{test.test_code}
                        </span>
                      </div>

                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        {test.ranking}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-foreground tracking-tight">
                      {test.title}
                    </h4>
                    <p className="text-xs text-slate-500">{test.class_name} • Ngày thi: {test.date}</p>

                    <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl p-4 flex items-center justify-between border border-slate-100/80">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Điểm số đạt được</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-emerald-600">{test.score}</span>
                          <span className="text-xs text-slate-400">/ {test.max_score}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium">Nhận xét chung</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 max-w-[200px] truncate">
                          {test.general_feedback || "Hoàn thành bài thi"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setViewPaperDialog({
                          open: true,
                          title: test.title,
                          type: "paper",
                        })
                      }
                      className="rounded-full text-xs font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      <span>Xem đề thi</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setViewPaperDialog({
                          open: true,
                          title: test.title,
                          type: "solution",
                        })
                      }
                      className="rounded-full text-xs font-semibold"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      <span>Đáp án chi tiết</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. DIALOG XEM QUY CHẾ PHÒNG THI */}
      <Dialog
        open={!!selectedRuleTest}
        onOpenChange={(open) => {
          if (!open) setSelectedRuleTest(null);
        }}
      >
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Quy chế & Hướng dẫn ca thi</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedRuleTest?.title} (#{selectedRuleTest?.test_code})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-border/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hình thức thi:</span>
                <span className="font-bold text-foreground capitalize">
                  {selectedRuleTest?.format === "online" ? "Trực tuyến qua mạng" : "Trực tiếp tại phòng thi"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phòng thi:</span>
                <span className="font-bold text-foreground">{selectedRuleTest?.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian làm bài:</span>
                <span className="font-bold text-foreground">
                  {selectedRuleTest?.time} ({selectedRuleTest?.duration_minutes} phút)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quy định bắt buộc đối với học viên:</span>
              </h5>
              <ul className="space-y-2 pl-2">
                {selectedRuleTest?.rules?.map((rule, rIdx) => (
                  <li
                    key={rIdx}
                    className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 dark:text-amber-200">
              <span className="font-bold block">Hỗ trợ khẩn cấp trong ca thi:</span>
              <p className="mt-0.5">
                Nếu có sự cố phát sinh, vui lòng báo ngay với cán bộ coi thi hoặc hotline phòng Đào tạo: <strong>0988.xxx.xxx</strong>.
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => setSelectedRuleTest(null)}
              className="rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            >
              Tôi đã hiểu quy chế
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. DIALOG XEM ĐỀ THI / ĐÁP ÁN THAM KHẢO */}
      <Dialog
        open={viewPaperDialog.open}
        onOpenChange={(open) =>
          setViewPaperDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {viewPaperDialog.type === "paper" ? (
                <FileText className="w-4 h-4 text-blue-600" />
              ) : (
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>
                {viewPaperDialog.type === "paper"
                  ? "Đề thi tham khảo"
                  : "Đáp án & Hướng dẫn giải chi tiết"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {viewPaperDialog.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-border/60 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="font-bold text-foreground">
                Tài liệu lưu trữ khảo thí số
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Tài liệu ôn tập và hướng dẫn giải chi tiết được phát hành lưu hành nội bộ phục vụ học viên đối chiếu kết quả.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full text-xs font-semibold rounded-full border-slate-200 dark:border-border"
              onClick={() => {
                alert("Hệ thống đang mở tài liệu xem trước trong tab mới.");
                setViewPaperDialog((prev) => ({ ...prev, open: false }));
              }}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              <span>Xem trực tiếp trên trình đọc PDF</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
