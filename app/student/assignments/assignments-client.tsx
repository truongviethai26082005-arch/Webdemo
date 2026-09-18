"use client";

import { useState } from "react";
import {
  StudentAssignmentItem,
  submitAssignment,
} from "@/lib/actions/student";
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  Award,
  AlertTriangle,
  RotateCcw,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AssignmentsClientProps {
  initialAssignments: StudentAssignmentItem[];
}

export function StudentAssignmentsClient({
  initialAssignments,
}: AssignmentsClientProps) {
  const [assignments, setAssignments] =
    useState<StudentAssignmentItem[]>(initialAssignments);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "submitted" | "graded"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog nộp bài
  const [submittingAssignment, setSubmittingAssignment] =
    useState<StudentAssignmentItem | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Dialog xem chi tiết bài nộp & nhận xét
  const [viewingAssignment, setViewingAssignment] =
    useState<StudentAssignmentItem | null>(null);

  // Thống kê số lượng
  const pendingCount = assignments.filter((a) => a.status === "pending").length;
  const submittedCount = assignments.filter(
    (a) => a.status === "submitted"
  ).length;
  const gradedCount = assignments.filter((a) => a.status === "graded").length;

  // Lọc theo tab và tìm kiếm
  const filteredAssignments = assignments.filter((item) => {
    if (activeTab === "pending" && item.status !== "pending") return false;
    if (activeTab === "submitted" && item.status !== "submitted") return false;
    if (activeTab === "graded" && item.status !== "graded") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchClass = item.class_name.toLowerCase().includes(q);
      const matchTeacher =
        item.teacher_name?.toLowerCase().includes(q) ?? false;
      return matchTitle || matchClass || matchTeacher;
    }
    return true;
  });

  const handleOpenSubmit = (asg: StudentAssignmentItem) => {
    setSubmittingAssignment(asg);
    setSubmissionContent(asg.submission_content || "");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleOpenView = (asg: StudentAssignmentItem) => {
    setViewingAssignment(asg);
  };

  const ACTION_TIMEOUT_MS = 15000;

  const handleSubmit = async () => {
    if (!submittingAssignment) return;
    if (!submissionContent.trim()) {
      setSubmitError("Vui lòng nhập nội dung câu trả lời hoặc liên kết bài làm của bạn");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitPromise = submitAssignment(
        submittingAssignment.id,
        submissionContent.trim()
      );

      const timeoutPromise = new Promise<{ error?: string }>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Không thể kết nối máy chủ, vui lòng kiểm tra đường truyền và thử lại"
              )
            ),
          ACTION_TIMEOUT_MS
        )
      );

      const res = await Promise.race([submitPromise, timeoutPromise]);

      if (res?.error) {
        setSubmitError(res.error);
        return;
      }

      // Cập nhật trạng thái cục bộ
      setAssignments((prev) =>
        prev.map((item) => {
          if (item.id === submittingAssignment.id) {
            return {
              ...item,
              status: "submitted",
              submission_content: submissionContent.trim(),
              submitted_at: new Date().toISOString(),
              is_overdue: false,
              is_due_soon: false,
            };
          }
          return item;
        })
      );

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmittingAssignment(null);
        setSubmitSuccess(false);
      }, 900);
    } catch (err: any) {
      const isNetwork =
        err?.message?.includes("fetch") ||
        err?.message?.includes("network") ||
        err?.name === "AbortError" ||
        err?.message?.includes("kết nối") ||
        err?.message?.includes("timeout");
      setSubmitError(
        isNetwork
          ? "Không thể kết nối máy chủ, vui lòng kiểm tra đường truyền và thử lại"
          : (err?.message || "Không thể kết nối máy chủ, vui lòng kiểm tra đường truyền và thử lại")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "Không có thời hạn";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderTypeBadge = (type?: string | null) => {
    switch (type) {
      case "test":
      case "quiz":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px] font-semibold"
          >
            Bài kiểm tra
          </Badge>
        );
      case "project":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-semibold"
          >
            Dự án
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] font-semibold"
          >
            Bài tập về nhà
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. THẺ THỐNG KÊ SỐ LƯỢNG */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Cần hoàn thành */}
        <div
          onClick={() => setActiveTab("pending")}
          className={cn(
            "p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            activeTab === "pending"
              ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cần hoàn thành
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Bài chưa nộp hoặc quá hạn</p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-amber-500/20"
                : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
            )}
          >
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Đang chờ chấm */}
        <div
          onClick={() => setActiveTab("submitted")}
          className={cn(
            "p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            activeTab === "submitted"
              ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Đang chờ chấm
            </p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {submittedCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Đã gửi cho giáo viên</p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
              activeTab === "submitted"
                ? "bg-blue-600 text-white shadow-blue-500/20"
                : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            )}
          >
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Đã hoàn thành */}
        <div
          onClick={() => setActiveTab("graded")}
          className={cn(
            "p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] group",
            activeTab === "graded"
              ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-card border-slate-200/80 dark:border-border hover:border-blue-400/80"
          )}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Đã hoàn thành
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {gradedCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Đã được chấm điểm & nhận xét</p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
              activeTab === "graded"
                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH BỘ LỌC & TÌM KIẾM */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab chuyển đổi */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-muted/70 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "all"
                ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            Tất cả ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "pending"
                ? "bg-white dark:bg-card text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            Cần làm ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("submitted")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "submitted"
                ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            Đã nộp ({submittedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("graded")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "graded"
                ? "bg-white dark:bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            Đã có điểm ({gradedCount})
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên bài, lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-border"
          />
        </div>
      </div>

      {/* 3. DANH SÁCH THẺ BÀI TẬP */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((asg) => {
            return (
              <div
                key={asg.id}
                className={cn(
                  "bg-white dark:bg-card rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between gap-4",
                  asg.is_overdue && asg.status === "pending"
                    ? "border-red-200/90 dark:border-red-900/60 hover:border-red-400"
                    : asg.is_due_soon && asg.status === "pending"
                    ? "border-amber-200/90 dark:border-amber-900/60 hover:border-amber-400"
                    : "border-slate-200/80 dark:border-border hover:border-blue-300 dark:hover:border-blue-800"
                )}
              >
                {/* Phần Header Thẻ: Loại bài & Trạng thái */}
                <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-border/60">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {renderTypeBadge(asg.type)}
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {asg.class_name}
                      </span>
                    </div>

                    {/* Badge trạng thái nộp */}
                    {asg.status === "pending" && (
                      asg.is_overdue ? (
                        <Badge className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800 text-[11px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Đã quá hạn
                        </Badge>
                      ) : asg.is_due_soon ? (
                        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Sắp hết hạn
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-muted dark:text-slate-300 border-slate-200 dark:border-border text-[11px] font-medium">
                          Chưa nộp
                        </Badge>
                      )
                    )}

                    {asg.status === "submitted" && (
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã nộp bài
                      </Badge>
                    )}

                    {asg.status === "graded" && (
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Đã chấm: {asg.score ?? 0}đ
                      </Badge>
                    )}
                  </div>

                  {/* Tên bài tập */}
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {asg.title}
                  </h3>

                  {/* Giáo viên & Hạn chót */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>GV: <strong className="text-foreground">{asg.teacher_name || "Chưa phân công"}</strong></span>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1.5 font-medium",
                        asg.is_overdue && asg.status === "pending"
                          ? "text-red-600 dark:text-red-400 font-bold"
                          : asg.is_due_soon && asg.status === "pending"
                          ? "text-amber-600 dark:text-amber-400 font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Hạn: {formatDateTime(asg.due_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Phần Thân: Hướng dẫn / Đề bài */}
                <div className="space-y-2 text-xs">
                  {asg.instructions ? (
                    <div className="bg-slate-50 dark:bg-muted/40 p-3 rounded-xl border border-slate-100 dark:border-border/80 text-muted-foreground line-clamp-3">
                      <span className="font-semibold text-foreground mr-1">Hướng dẫn:</span>
                      {asg.instructions}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-[11px]">
                      Không có hướng dẫn bổ sung từ giáo viên.
                    </p>
                  )}

                  {/* Nếu đã chấm điểm -> Hiển thị Feedback callout */}
                  {asg.status === "graded" && (
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" />
                          Kết quả chấm điểm
                        </span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                          {asg.score ?? 0} điểm
                        </span>
                      </div>
                      {asg.feedback ? (
                        <p className="text-xs text-emerald-900/80 dark:text-emerald-200/90 leading-relaxed">
                          <span className="font-semibold">Nhận xét:</span> {asg.feedback}
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-800/60 italic">
                          Chưa có nhận xét chi tiết.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Phần Footer Thẻ: Nút hành động */}
                <div className="pt-2 border-t border-slate-100 dark:border-border/60 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    {asg.status === "submitted" && asg.submitted_at && (
                      <span>Đã nộp: {formatDateTime(asg.submitted_at)}</span>
                    )}
                    {asg.status === "pending" && (
                      <span className="italic text-slate-500">Chưa nộp bài</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {asg.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenSubmit(asg)}
                        className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Nộp bài tập
                      </Button>
                    )}

                    {asg.status === "submitted" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenView(asg)}
                          className="h-8 text-xs font-semibold rounded-xl border-slate-200 dark:border-border flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem bài
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenSubmit(asg)}
                          className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Nộp lại
                        </Button>
                      </>
                    )}

                    {asg.status === "graded" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenView(asg)}
                        className="h-8 text-xs font-bold text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem chi tiết & bài nộp
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. EMPTY STATE */
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {searchQuery
                ? "Không tìm thấy bài tập nào"
                : activeTab === "pending"
                ? "Tuyệt vời! Không có bài tập nào cần làm"
                : activeTab === "submitted"
                ? "Chưa có bài tập nào đang chờ chấm"
                : activeTab === "graded"
                ? "Chưa có bài tập nào có điểm"
                : "Chưa có bài tập nào được giao"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? "Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."
                : "Khi giáo viên giao bài tập hoặc chấm bài cho lớp học của bạn, thông tin sẽ xuất hiện ngay tại đây."}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs rounded-xl"
            >
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      )}

      {/* 5. DIALOG NỘP BÀI TẬP */}
      <Dialog
        open={Boolean(submittingAssignment)}
        onOpenChange={(open) => !open && !isSubmitting && setSubmittingAssignment(null)}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span>Nộp bài tập</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {submittingAssignment?.title} ({submittingAssignment?.class_name})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Đề bài tóm tắt */}
            {submittingAssignment?.instructions && (
              <div className="bg-slate-50 dark:bg-muted/50 p-3 rounded-xl border border-slate-200/70 dark:border-border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  Đề bài & Hướng dẫn:
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {submittingAssignment.instructions}
                </p>
              </div>
            )}

            {/* Hạn nộp */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground">Hạn chót:</span>
              <span className="font-bold text-foreground">
                {formatDateTime(submittingAssignment?.due_date)}
              </span>
            </div>

            {/* Ô nhập bài làm */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Nội dung bài làm hoặc Liên kết nộp bài <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={5}
                placeholder="Dán đường link bài làm (Google Drive, Docs, GitHub, Canva...) hoặc nhập trực tiếp câu trả lời của bạn vào đây..."
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                className="text-xs rounded-xl resize-none"
                disabled={isSubmitting || submitSuccess}
              />
              <p className="text-[11px] text-muted-foreground">
                💡 <span className="font-semibold">Mẹo:</span> Nếu nộp link Google Drive hoặc Google Docs, hãy nhớ chọn quyền{" "}
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  &quot;Bất kỳ ai có liên kết đều có thể xem&quot;
                </span>{" "}
                để giáo viên có thể chấm bài.
              </p>
            </div>

            {/* Lỗi nếu có */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Thành công */}
            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nộp bài thành công! Đang lưu dữ liệu...</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmittingAssignment(null)}
              disabled={isSubmitting || submitSuccess}
              className="text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || submitSuccess || !submissionContent.trim()}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              {isSubmitting ? "Đang gửi bài..." : "Xác nhận nộp bài"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. DIALOG XEM BÀI NỘP & NHẬN XÉT CHI TIẾT */}
      <Dialog
        open={Boolean(viewingAssignment)}
        onOpenChange={(open) => !open && setViewingAssignment(null)}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Chi tiết bài tập & Bài nộp</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {viewingAssignment?.title} — {viewingAssignment?.class_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Điểm & Phản hồi nếu đã chấm */}
            {viewingAssignment?.status === "graded" && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Điểm số đạt được:
                  </span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {viewingAssignment.score ?? 0} điểm
                  </span>
                </div>
                {viewingAssignment.feedback && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-emerald-900/90 dark:text-emerald-200">
                    <p className="font-semibold mb-1">Lời nhận xét từ Giáo viên:</p>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {viewingAssignment.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Nội dung bài học sinh đã nộp */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Nội dung bạn đã nộp:</span>
                {viewingAssignment?.submitted_at && (
                  <span className="text-[11px] text-muted-foreground">
                    Thời gian: {formatDateTime(viewingAssignment.submitted_at)}
                  </span>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-muted/50 p-3 rounded-xl border border-slate-200/70 dark:border-border text-foreground leading-relaxed whitespace-pre-wrap break-all max-h-56 overflow-y-auto">
                {viewingAssignment?.submission_content || "Không có nội dung bài nộp"}
              </div>

              {/* Nếu bài nộp chứa liên kết URL, hỗ trợ nút mở nhanh */}
              {viewingAssignment?.submission_content &&
                (viewingAssignment.submission_content.startsWith("http://") ||
                  viewingAssignment.submission_content.startsWith("https://")) && (
                  <a
                    href={viewingAssignment.submission_content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold pt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Mở liên kết bài làm trong tab mới
                  </a>
                )}
            </div>

            {/* Hướng dẫn đề bài ban đầu */}
            {viewingAssignment?.instructions && (
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-border">
                <span className="font-semibold text-muted-foreground">
                  Đề bài ban đầu:
                </span>
                <p className="text-muted-foreground bg-slate-50/60 dark:bg-muted/30 p-2.5 rounded-lg border border-slate-100 dark:border-border whitespace-pre-wrap">
                  {viewingAssignment.instructions}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setViewingAssignment(null)}
              className="text-xs rounded-xl"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
