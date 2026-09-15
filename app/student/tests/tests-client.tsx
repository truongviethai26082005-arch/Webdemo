"use client";

import { useState } from "react";
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
  AlertCircle,
  Info,
  Sparkles,
  Laptop,
  Building2,
  FileText,
  FileCheck2,
  ShieldCheck,
  MessageSquareQuote,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
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

interface StudentTestsClientProps {
  initialData: StudentTestsSummary;
}

export function StudentTestsClient({ initialData }: StudentTestsClientProps) {
  const [data] = useState<StudentTestsSummary>(initialData);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  // State quản lý việc xác nhận tham gia
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    data.upcomingTests.forEach((t) => {
      if (t.status === "confirmed") {
        initial[t.id] = true;
      }
    });
    return initial;
  });

  // Dialog xem quy chế ca thi
  const [selectedRuleTest, setSelectedRuleTest] = useState<UpcomingTestSession | null>(null);

  // Dialog xem tài liệu / đáp án đề thi tham khảo
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

  const getRankingBadge = (ranking: string) => {
    switch (ranking) {
      case "Xuất sắc":
        return "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "Giỏi":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Khá":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  // Tính số ngày còn lại đến ca thi
  const getDaysRemainingText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Diễn ra hôm nay", urgent: true };
    if (diffDays === 1) return { text: "Diễn ra ngày mai", urgent: true };
    if (diffDays > 1) return { text: `Còn ${diffDays} ngày`, urgent: diffDays <= 3 };
    return { text: "Đã diễn ra", urgent: false };
  };

  return (
    <div className="space-y-6">
      {/* 1. KHỐI THẺ THỐNG KÊ TỔNG QUAN (3 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ca thi sắp tới */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Ca thi sắp tới
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">
                {data.stats.upcomingCount}
              </span>
              <span className="text-xs text-muted-foreground">đợt thi</span>
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Chuẩn bị kiến thức & ôn tập
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/50 shadow-xs shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Ca thi đã tham gia */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Đã tham gia
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">
                {data.stats.completedCount}
              </span>
              <span className="text-xs text-muted-foreground">kỳ đánh giá</span>
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              Đã ghi nhận kết quả điểm
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-900/50 shadow-xs shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Điểm thi gần nhất */}
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Điểm thi gần nhất
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {data.stats.latestScore !== null ? data.stats.latestScore : "--"}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / {data.stats.latestScoreMax}
              </span>
              {data.stats.latestScoreRanking && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    getRankingBadge(data.stats.latestScoreRanking)
                  )}
                >
                  {data.stats.latestScoreRanking}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Đạt chuẩn năng lực mục tiêu
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/50 shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH CHUYỂN TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl max-w-fit border border-slate-200 dark:border-border">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "upcoming"
              ? "bg-white dark:bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Lịch thi sắp tới</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            {data.upcomingTests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "completed"
              ? "bg-white dark:bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>Lịch sử thi & Kết quả</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            {data.completedTests.length}
          </span>
        </button>
      </div>

      {/* 3. NỘI DUNG TAB 1: LỊCH THI SẮP TỚI */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {data.upcomingTests.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-foreground">
                  Hiện chưa có ca thi sắp diễn ra
                </h3>
                <p className="text-xs text-muted-foreground">
                  Khi trung tâm mở kỳ thi thử hoặc kiểm tra năng lực định kỳ, thông tin ca thi sẽ hiển thị tại đây.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {data.upcomingTests.map((test) => {
                const daysInfo = getDaysRemainingText(test.date);
                const isConfirmed = confirmedIds[test.id];

                return (
                  <div
                    key={test.id}
                    className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-blue-300 dark:hover:border-blue-800/80 transition-all group"
                  >
                    <div className="space-y-3.5">
                      {/* Huy hiệu trên đầu */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border",
                              test.format === "online"
                                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            )}
                          >
                            {test.format === "online" ? (
                              <>
                                <Laptop className="w-3 h-3 text-indigo-600" />
                                <span>Thi Trực Tuyến</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3 h-3 text-emerald-600" />
                                <span>Thi Trực Tiếp</span>
                              </>
                            )}
                          </span>

                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            #{test.test_code}
                          </span>
                        </div>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full",
                            daysInfo.urgent
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{daysInfo.text}</span>
                        </span>
                      </div>

                      {/* Tiêu đề ca thi */}
                      <div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                          {test.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{test.class_name || test.subject}</span>
                        </p>
                      </div>

                      {/* Lưới thông số ca thi */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-border/60">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Ngày thi</p>
                            <p className="font-semibold text-foreground truncate">
                              {test.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-border/60">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Thời gian làm bài</p>
                            <p className="font-semibold text-foreground truncate">
                              {test.time} ({test.duration_minutes} phút)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-border/60">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Địa điểm / Phòng thi</p>
                            <p className="font-semibold text-foreground truncate">
                              {test.room}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-border/60">
                          <User className="w-4 h-4 text-purple-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Cán bộ coi thi</p>
                            <p className="font-semibold text-foreground truncate">
                              {test.proctor_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ghi chú */}
                      {test.notes && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-border/60 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{test.notes}</span>
                        </div>
                      )}
                    </div>

                      {/* Footer & Nút thao tác */}
                      <div className="pt-3 border-t border-slate-100 dark:border-border/60 flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRuleTest(test)}
                        className="rounded-xl text-xs font-semibold border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        <span>Quy chế ca thi</span>
                      </Button>

                      <div className="flex items-center gap-2">
                        {test.format === "online" && test.meeting_url && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-xs font-semibold text-indigo-600 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            <a
                              href={test.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Vào phòng thi</span>
                            </a>
                          </Button>
                        )}

                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã xác nhận</span>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmAttendance(test.id)}
                            className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            <span>Xác nhận tham gia</span>
                          </Button>
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
        <div className="space-y-5">
          {data.completedTests.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-foreground">
                  Chưa có kết quả thi nào
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sau khi tham gia các kỳ thi thử và hoàn tất khâu chấm điểm, kết quả chi tiết sẽ được công bố tại đây.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {data.completedTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-5"
                >
                  {/* Header kết quả */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          #{test.test_code}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{test.date}</span>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {test.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Môn / Lớp: <strong>{test.class_name || test.subject}</strong>
                      </p>
                    </div>

                    {/* Khối điểm tổng quan */}
                    <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50/90 dark:bg-slate-900/50 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-border/60">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                          Điểm tổng
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {test.score}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            / {test.max_score}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-border mx-0.5" />
                      <span
                        className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-xl border",
                          getRankingBadge(test.ranking)
                        )}
                      >
                        {test.ranking}
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết từng kỹ năng thành phần */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kết quả đánh giá theo từng kỹ năng:</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {test.skills.map((skill, sIdx) => {
                        const percent = Math.min(
                          100,
                          Math.round((skill.score / skill.max_score) * 100)
                        );
                        return (
                          <div
                            key={sIdx}
                            className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-100 dark:border-border/60 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-foreground">
                                {skill.skill_name}
                              </span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {skill.score} / {skill.max_score}
                              </span>
                            </div>
                            {/* Thanh phần trăm */}
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nhận xét từ Ban Khảo thí */}
                  {test.general_feedback && (
                    <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <MessageSquareQuote className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-amber-950 dark:text-amber-100">
                          Nhận xét từ Giám khảo / Ban Khảo thí:
                        </span>
                        <p className="leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                          {test.general_feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nút xem đề tham khảo / đáp án */}
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
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
                      className="rounded-xl text-xs font-semibold border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      <span>Xem đề thi tham khảo</span>
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
                      className="rounded-xl text-xs font-semibold border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>Đáp án & Hướng dẫn giải</span>
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
        <DialogContent className="max-w-lg rounded-2xl p-6">
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
            {/* Tóm tắt ca thi */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-border/60 space-y-1">
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

            {/* Danh sách quy chế */}
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

            {/* Khung lưu ý khẩn cấp */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
              <span className="font-bold block">Hỗ trợ khẩn cấp trong ca thi:</span>
              <p>
                Nếu có sự cố phát sinh (sức khỏe, sự cố mạng trực tuyến), vui lòng báo ngay với cán bộ coi thi hoặc hotline phòng Đào tạo: <strong>0988.xxx.xxx</strong>.
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => setSelectedRuleTest(null)}
              className="rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
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
        <DialogContent className="max-w-md rounded-2xl p-6">
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
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-border/60 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="font-bold text-foreground">
                Tài liệu lưu trữ khảo thí số
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Tài liệu ôn tập và hướng dẫn giải chi tiết được phát hành lưu hành nội bộ nhằm phục vụ việc đối chiếu kết quả học tập của học viên.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold rounded-xl border-slate-200 dark:border-border"
                onClick={() => {
                  alert("Hệ thống đang mở tài liệu xem trước trong tab mới.");
                  setViewPaperDialog((prev) => ({ ...prev, open: false }));
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Xem trực tiếp trên trình đọc PDF</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
