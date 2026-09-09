"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  BrainCircuit,
  Target,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  DollarSign,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIAdvisorInsight } from "@/types/analytics";
import {
  OperationalIssue,
  OperationalIssueModal,
} from "./operational-issue-modal";

interface AIAdvisorHeaderProps {
  data: AIAdvisorInsight;
  onRefresh?: () => void;
}

const OPERATIONAL_ISSUES: OperationalIssue[] = [
  {
    id: "tuition-barrier",
    title: "Rào cản học phí chiếm 45% lý do từ chối sau học thử",
    severity: "critical",
    severityLabel: "Nghiêm trọng",
    stageTitle: "Quy trình Nóng: Chốt cọc & Học phí sau học thử",
    stageLocation: "Tầng N3 ➔ N4 (Phễu Tuyển Sinh)",
    estimatedLoss: "Hụt ~35.000.000 đ doanh thu tuyển sinh mới trong tháng",
    lossMetric: "15 phụ huynh đang ngập ngừng chưa chốt học phí",
    rootCauseSummary:
      "Phụ huynh đánh giá rất tích cực về năng lực giáo viên và chất lượng giảng dạy, nhưng trung tâm chỉ áp dụng biểu phí đóng gộp kỳ dài (6 - 12 tháng), thiếu phương án chia nhỏ kỳ hạn đóng.",
    rootCausePoints: [
      "100% phụ huynh hài lòng với kết quả bài test năng lực đầu vào của học sinh.",
      "45% từ chối chuyển khoản ngay vì số tiền đóng gộp 1 lần vượt ngân sách chi tiêu hàng tháng của gia đình.",
      "Thiếu tùy chọn thanh toán linh hoạt 2 - 3 đợt hoặc trả góp qua thẻ tín dụng 0%.",
    ],
    recommendationSummary:
      "Mở chính sách thanh toán học phí linh hoạt chia 2–3 đợt hoặc gói ngắn hạn 1–3 tháng; gửi ưu đãi cam kết đầu ra kèm quà tặng cho 15 phụ huynh đang ngập ngừng.",
    actionSteps: [
      "Kích hoạt chính sách chia đợt đóng phí (50% lúc đăng ký, 50% sau 30 ngày) trên hệ thống Finance.",
      "Gửi tin nhắn Zalo ZNS / SMS kèm bảng lộ trình tiến bộ chi tiết đến 15 phụ huynh ở tầng học thử.",
      "Tặng thêm 1 buổi test định hướng phương pháp học tập cá nhân hóa trị giá 500.000 đ.",
    ],
    expectedOutcome:
      "Kỳ vọng: Kéo tỷ lệ chốt học phí từ 28% lên lại 38% - 42% trong 2 tuần (Thu hồi ~25M - 35M doanh thu).",
    primaryAction: {
      label: "Kích hoạt gói phí linh hoạt",
      successMessage: "Đã kích hoạt chính sách đóng phí 2-3 đợt thành công trên toàn hệ thống!",
    },
    secondaryAction: {
      label: "Xem DS 15 phụ huynh cần liên hệ lại",
      successMessage: "Đã xuất danh sách 15 phụ huynh cần tư vấn lại sang mục Quản lý Tuyển sinh!",
    },
  },
  {
    id: "attendance-drop",
    title: "Học viên vắng ≥ 3 buổi tăng tỷ lệ bỏ khóa học",
    severity: "warning",
    severityLabel: "Cần lưu ý",
    stageTitle: "Khối Đào tạo: Giữ chân & Chuyên cần (Môn Tiếng Anh)",
    stageLocation: "Section Giữ Chân & Churn Rate",
    estimatedLoss: "Nguy cơ mất ~12 học viên gia hạn cuối kỳ (~28.000.000 đ)",
    lossMetric: "Tỷ lệ bỏ khóa tăng gấp 3.2 lần ở nhóm học sinh vắng ≥ 3 buổi",
    rootCauseSummary:
      "Học viên nghỉ học nhiều buổi liên tiếp không có cơ chế phụ đạo bù kiến thức kịp thời, dẫn đến hổng kiến thức, đuối bài trên lớp và mất động lực học tập.",
    rootCausePoints: [
      "Học sinh nghỉ ốm hoặc bận việc gia đình nhưng giáo viên bộ môn chưa kịp gửi tóm tắt bài giảng.",
      "Thiếu cơ chế tự động xếp lịch học bù 1:1 với trợ giảng trong vòng 48h sau buổi nghỉ.",
      "Tỷ lệ sụt giảm gia hạn tập trung cao nhất ở các lớp Tiếng Anh giao tiếp & luyện thi.",
    ],
    recommendationSummary:
      "Kích hoạt quy trình tự động cảnh báo GV chủ nhiệm khi học viên vắng từ buổi thứ 2; tự động xếp lịch phụ đạo bù kiến thức 1:1 miễn phí.",
    actionSteps: [
      "Bật thông báo tự động cho giáo viên phụ trách khi học sinh nghỉ học buổi thứ 2 liên tiếp.",
      "Điều phối trợ giảng tổ chức buổi học bù online 30 phút để ôn tập lại kiến thức trọng tâm.",
      "Gọi điện trao đổi trực tiếp với phụ huynh để phối hợp nhắc nhở lịch học của con.",
    ],
    expectedOutcome:
      "Kỳ vọng: Giảm tỷ lệ bỏ khóa 65%, đưa tỷ lệ chuyên cần bình quân toàn trung tâm trở lại mức chuẩn ≥ 93%.",
    primaryAction: {
      label: "Kích hoạt quy trình bù bài 1:1",
      successMessage: "Đã bật quy trình cảnh báo vắng và phân công trợ giảng học bù tự động!",
    },
    secondaryAction: {
      label: "Xem DS học viên vắng ≥ 3 buổi",
      successMessage: "Đã lọc danh sách 12 học viên vắng nhiều buổi để bộ phận Đào tạo xử lý!",
    },
  },
];

export function AIAdvisorHeader({ data, onRefresh }: AIAdvisorHeaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<OperationalIssue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onRefresh) onRefresh();
    }, 800);
  }

  function handleOpenIssue(issue: OperationalIssue) {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  }

  return (
    <div className="rounded-2xl bg-card border border-slate-300 dark:border-slate-700 p-4 sm:p-5 shadow-xs text-foreground space-y-4">
      {/* Top bar: AI Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Trợ lý phân tích thông minh
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-[11px] text-muted-foreground font-medium">
            Quét lần cuối: {data.generatedAt}
          </span>
          <Button
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            className="h-7.5 px-3 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Đang phân tích..." : "Quét lại AI"}</span>
          </Button>
        </div>
      </div>

      {/* Block 1: TÓM TẮT ĐÁNH GIÁ (Metric Cards) - Giao diện phẳng tối giản */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <BrainCircuit className="w-3.5 h-3.5 text-slate-500" />
          <span>Tóm tắt đánh giá vận hành (AI Executive Summary)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Doanh thu */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Doanh thu tháng
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+18%</span>
                <span className="text-[11px] text-muted-foreground font-medium">Tăng trưởng ổn định</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tỷ lệ chốt */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Chốt cọc (Học thử ➔ Chính thức)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">42% ➔ 28%</span>
                <span className="text-[11px] text-rose-600/80 dark:text-rose-400 font-medium">Cảnh báo giảm sút</span>
              </div>
            </div>
          </div>

          {/* Card 3: Trọng tâm can thiệp */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Trọng tâm can thiệp
              </span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                Xử lý phản hồi sau buổi test
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block 2: VẤN ĐỀ VẬN HÀNH (Clickable List of Issues) - Thu gọn tinh tế 1 hàng duy nhất */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Vấn đề vận hành
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 px-2 py-0.5"
          >
            {OPERATIONAL_ISSUES.length} vấn đề cần xử lý
          </Badge>
        </div>

        {/* Danh sách các vấn đề: Đúng 1 hàng duy nhất (Single-Line) */}
        <div className="space-y-1.5">
          {OPERATIONAL_ISSUES.map((issue) => {
            const isCritical = issue.severity === "critical";

            return (
              <div
                key={issue.id}
                onClick={() => handleOpenIssue(issue)}
                className="group flex items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-white dark:bg-card hover:bg-slate-50/70 dark:hover:bg-muted/40 border border-slate-300 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Icon cảnh báo nhỏ gọn */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isCritical
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}
                  >
                    {isCritical ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Tag mức độ */}
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                      isCritical
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {issue.severityLabel}
                  </span>

                  {/* Tên vấn đề in đậm font-medium */}
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                    {issue.title}
                  </span>
                </div>

                {/* Nhãn hành động & Mũi tên */}
                <div className="flex items-center gap-1 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                  <span className="text-xs hidden xs:inline">Xem chi tiết</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Modal Dialog xem chi tiết vấn đề */}
      <OperationalIssueModal
        issue={selectedIssue}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
