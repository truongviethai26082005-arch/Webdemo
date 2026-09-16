"use client";

import { useState } from "react";
import {
  StudentFeedbackItem,
  StudentFeedbackClassOption,
  StudentFeedbacksData,
  StudentFeedbackInput,
  submitStudentFeedback,
} from "@/lib/actions/student";
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  GraduationCap,
  CreditCard,
  HelpCircle,
  History,
  PlusCircle,
  RotateCcw,
  MessageSquareText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface StudentFeedbackClientProps {
  initialData: StudentFeedbacksData;
}

export function StudentFeedbackClient({
  initialData,
}: StudentFeedbackClientProps) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [feedbacks, setFeedbacks] = useState<StudentFeedbackItem[]>(
    initialData.feedbacks || []
  );
  const classes = initialData.classes || [];

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<
    "teaching_quality" | "facilities" | "tuition_schedule" | "other"
  >("teaching_quality");
  const [selectedClassId, setSelectedClassId] = useState<string>("none");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Labels theo số sao
  const ratingLabels: Record<number, string> = {
    1: "Rất không hài lòng",
    2: "Chưa hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Rất hài lòng & Xuất sắc",
  };

  const currentRatingDisplay = hoverRating || rating;

  // Tính toán thống kê
  const totalCount = feedbacks.length;
  const resolvedCount = feedbacks.filter((f) => f.status === "resolved").length;
  const pendingCount = feedbacks.filter((f) => f.status !== "resolved").length;
  const avgRating =
    totalCount > 0
      ? (
          feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalCount
        ).toFixed(1)
      : "5.0";

  // Xử lý gửi phản hồi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!title.trim()) {
      setSubmitError("Vui lòng nhập tiêu đề ngắn gọn cho phản hồi.");
      return;
    }

    if (!content.trim()) {
      setSubmitError("Vui lòng nhập nội dung chi tiết ý kiến đóng góp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: StudentFeedbackInput = {
        category,
        class_id: selectedClassId === "none" ? undefined : selectedClassId,
        rating,
        title: title.trim(),
        content: content.trim(),
      };

      const res = await submitStudentFeedback(input);

      if (res?.error) {
        setSubmitError(res.error);
      } else {
        setSubmitSuccess(
          res?.message ||
            "Cảm ơn bạn đã gửi phản hồi! Chúng tôi đã ghi nhận đóng góp của bạn."
        );
        if (res?.feedback) {
          setFeedbacks((prev) => [res.feedback!, ...prev]);
        }
        // Reset form
        setTitle("");
        setContent("");
        setRating(5);
        setSelectedClassId("none");
      }
    } catch (err: any) {
      setSubmitError(
        err?.message || "Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper hiển thị icon theo chủ đề
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "teaching_quality":
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case "facilities":
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case "tuition_schedule":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>Phản hồi & Đóng góp ý kiến</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Lắng nghe trải nghiệm học tập, phản ánh cơ sở vật chất và góp ý nâng cao chất lượng trung tâm
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hỗ trợ 24/7</span>
          </span>
        </div>
      </div>

      {/* 2. STAT WIDGETS TỔNG QUAN (Click-to-filter / Switch tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Widget 1: Tổng số phản hồi */}
        <div
          onClick={() => setActiveTab("history")}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs flex items-center gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] select-none group",
            activeTab === "history" && "ring-2 ring-blue-500/20 border-blue-500/50"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Tổng phản hồi đã gửi
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-foreground">
                {totalCount}
              </span>
              <span className="text-xs text-muted-foreground">đóng góp</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Đã xử lý & giải đáp */}
        <div
          onClick={() => setActiveTab("history")}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs flex items-center gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-400/80 active:scale-[0.99] select-none group",
            activeTab === "history" && "ring-2 ring-emerald-500/20 border-emerald-500/50"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Đã được phản hồi
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-emerald-600">
                {resolvedCount}
              </span>
              <span className="text-xs text-muted-foreground">
                / {totalCount} ý kiến ({pendingCount} đang xử lý)
              </span>
            </div>
          </div>
        </div>

        {/* Widget 3: Mức độ hài lòng TB */}
        <div
          onClick={() => setActiveTab("new")}
          className={cn(
            "bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-4 shadow-xs flex items-center gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-400/80 active:scale-[0.99] select-none group",
            activeTab === "new" && "ring-2 ring-amber-500/20 border-amber-500/50"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Mức hài lòng trung bình
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-foreground">
                {avgRating}
              </span>
              <span className="text-xs text-muted-foreground">
                / 5.0 sao (Đánh giá của bạn)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BỘ CHUYỂN TABS CHÍNH */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-border pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("new");
            setSubmitError(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "new"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted"
          )}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Gửi phản hồi mới</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("history");
            setSubmitError(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted"
          )}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử phản hồi</span>
          <span
            className={cn(
              "px-1.5 py-0.5 text-[10px] font-extrabold rounded-full",
              activeTab === "history"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-muted text-slate-700 dark:text-slate-300"
            )}
          >
            {feedbacks.length}
          </span>
        </button>
      </div>

      {/* 4. NỘI DUNG THEO TAB */}
      {activeTab === "new" ? (
        /* ================= TAB 1: FORM GỬI PHẢN HỒI MỚI ================= */
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 md:p-8 shadow-xs">
          {/* Banner thành công */}
          {submitSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  Gửi phản hồi thành công!
                </p>
                <p className="mt-0.5 leading-relaxed">{submitSuccess}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("history")}
                    className="h-8 text-xs font-bold rounded-lg border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 dark:bg-card dark:text-emerald-300"
                  >
                    Xem lịch sử phản hồi
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSubmitSuccess(null)}
                    className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                  >
                    Gửi thêm góp ý khác
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Banner báo lỗi */}
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  Chưa thể gửi phản hồi
                </p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Khối 1: Chọn mức độ hài lòng (Star Rating) */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
              <label className="text-xs font-bold text-foreground block">
                1. Mức độ hài lòng của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled =
                      hoverRating !== null
                        ? starValue <= hoverRating
                        : starValue <= rating;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                        title={`${starValue} sao - ${ratingLabels[starValue]}`}
                      >
                        <Star
                          className={cn(
                            "w-7 h-7 transition-colors",
                            isFilled
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-muted-foreground/40"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/60">
                  {currentRatingDisplay} sao — {ratingLabels[currentRatingDisplay]}
                </span>
              </div>
            </div>

            {/* Khối 2: Chủ đề & Lớp học liên quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dropdown Chủ đề */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  2. Chủ đề phản hồi <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={category}
                  onValueChange={(val: any) => setCategory(val)}
                >
                  <SelectTrigger className="rounded-xl h-10 text-xs font-medium">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="teaching_quality" className="text-xs">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chất lượng giảng dạy & Giáo viên</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="facilities" className="text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Cơ sở vật chất & Phòng học</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tuition_schedule" className="text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Học phí & Thời khóa biểu</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other" className="text-xs">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Góp ý khác & Dịch vụ học viên</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Lớp học */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  3. Lớp học liên quan <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                </label>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => setSelectedClassId(val)}
                >
                  <SelectTrigger className="rounded-xl h-10 text-xs font-medium">
                    <SelectValue placeholder="Chọn lớp học (nếu có)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none" className="text-xs">
                      <span className="text-muted-foreground">
                        Chung (Không gắn với lớp cụ thể)
                      </span>
                    </SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id} className="text-xs">
                        {cls.name} {cls.code ? `(${cls.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Khối 3: Tiêu đề */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                4. Tiêu đề ý kiến <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Góp ý về điều hòa phòng 204, Xin thêm đề thi thử môn Toán..."
                className="rounded-xl h-10 text-xs font-medium"
                maxLength={150}
              />
              <p className="text-[11px] text-muted-foreground">
                Tóm tắt ngắn gọn ý chính của vấn đề bạn muốn phản ánh (tối đa 150 ký tự).
              </p>
            </div>

            {/* Khối 4: Nội dung chi tiết */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                5. Nội dung chi tiết <span className="text-rose-500">*</span>
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Vui lòng mô tả cụ thể sự việc, thời điểm diễn ra, đề xuất hoặc mong muốn của bạn để trung tâm có thể giải quyết nhanh chóng và chuẩn xác nhất..."
                className="rounded-xl text-xs font-medium resize-y"
              />
            </div>

            {/* Nút gửi */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTitle("");
                  setContent("");
                  setRating(5);
                  setSelectedClassId("none");
                  setSubmitError(null);
                }}
                disabled={isSubmitting}
                className="rounded-xl h-10 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Làm mới form
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi ý kiến đóng góp</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= TAB 2: LỊCH SỬ PHẢN HỒI ================= */
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-muted text-slate-400 flex items-center justify-center">
                <MessageSquareText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Chưa có phản hồi nào
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Bạn chưa gửi phản hồi hoặc đóng góp ý kiến nào. Ý kiến của bạn giúp trung tâm hoàn thiện chất lượng giảng dạy mỗi ngày!
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setActiveTab("new")}
                className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Gửi phản hồi đầu tiên ngay</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((fb) => {
                const isResolved = fb.status === "resolved";
                return (
                  <div
                    key={fb.id}
                    className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Header card: Danh mục + Rating + Badge trạng thái */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Huy hiệu danh mục */}
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted text-slate-800 dark:text-slate-200">
                          {getCategoryIcon(fb.category)}
                          <span>{fb.category_label}</span>
                        </span>

                        {/* Lớp học liên quan nếu có */}
                        {fb.class_name && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60">
                            <BookOpen className="w-3 h-3 text-blue-600" />
                            <span>{fb.class_name}</span>
                          </span>
                        )}

                        {/* Đánh giá sao */}
                        <div className="flex items-center gap-0.5 ml-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-3.5 h-3.5",
                                s <= fb.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 dark:text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Trạng thái xử lý */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-lg text-[11px] font-bold px-2.5 py-0.5 gap-1.5",
                          isResolved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                            : "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60"
                        )}
                      >
                        {isResolved ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        )}
                        <span>{fb.status_label}</span>
                      </Badge>
                    </div>

                    {/* Tiêu đề & Nội dung phản hồi của học sinh */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-foreground">
                        {fb.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {fb.content}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Gửi ngày {new Date(fb.created_at).toLocaleDateString("vi-VN")}{" "}
                          lúc {new Date(fb.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Khối phản hồi từ Ban Quản trị / Giáo vụ (nếu có) */}
                    {fb.admin_response && (
                      <div className="mt-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-600 rounded-r-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                            <MessageSquareText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Phản hồi từ Ban Quản trị / Giáo vụ trung tâm</span>
                          </div>
                          {fb.responded_at && (
                            <span className="text-[10px] text-blue-600/80 dark:text-blue-400 font-medium">
                              {new Date(fb.responded_at).toLocaleDateString("vi-VN")}{" "}
                              {new Date(fb.responded_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {fb.admin_response}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
