"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Plus,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrialClass, TrialStatus } from "@/types/admissions";

const TRIAL_STATUS_CONFIG: Record<
  TrialStatus,
  { label: string; className: string; icon: string; next?: TrialStatus }
> = {
  scheduled: {
    label: "Chờ học thử",
    className:
      "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold",
    icon: "🕒",
    next: "attended",
  },
  attended: {
    label: "Đã tham gia",
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
    icon: "✅",
    next: undefined,
  },
  absent: {
    label: "Vắng mặt",
    className:
      "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    icon: "❌",
    next: "scheduled",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-muted text-muted-foreground border-border",
    icon: "🚫",
    next: "scheduled",
  },
};

/* ─── Inline Quick Assessment Form ─── */
function QuickAssessmentRow({
  trial,
  onSave,
}: {
  trial: TrialClass;
  onSave: (updated: TrialClass) => void;
}) {
  const [score, setScore] = useState<string>(
    trial.testScore !== undefined ? String(trial.testScore) : ""
  );
  const [teacherFeedback, setTeacherFeedback] = useState(
    trial.teacherFeedback || ""
  );
  const [parentFeedback, setParentFeedback] = useState(
    trial.parentFeedback || ""
  );
  const [satisfaction, setSatisfaction] = useState<number>(
    trial.parentFeedback?.includes("5 sao") ? 5 : 4
  ); // 1-5 stars
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const numScore = score !== "" ? parseFloat(score) : undefined;
    const updated: TrialClass = {
      ...trial,
      testScore: numScore,
      teacherFeedback: teacherFeedback || undefined,
      parentFeedback: parentFeedback
        ? `${parentFeedback} (Đánh giá ${satisfaction}★)`
        : `Mức độ hài lòng phụ huynh: ${satisfaction}/5 sao`,
      trialResult:
        numScore !== undefined
          ? numScore >= 8.5
            ? "excellent"
            : numScore >= 7
            ? "good"
            : numScore >= 5
            ? "average"
            : "weak"
          : undefined,
    };
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="my-3 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
        <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Đánh giá nhanh kết quả học thử — {trial.leadName}
        </h5>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Lớp: {trial.className} • Ngày: {trial.trialDate}
        </span>
      </div>

      {/* Score + Star Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-foreground flex items-center justify-between">
            <span>Điểm test năng lực (Thang điểm 10)</span>
            <span className="font-mono text-primary text-xs font-black">
              {score ? `${score}/10` : "Chưa chấm"}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={score || 0}
              onChange={(e) => setScore(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-muted rounded-lg"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Điểm"
              className="w-16 h-8 rounded-lg border border-input bg-background px-2 text-center text-xs font-black text-amber-700 dark:text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-foreground block">
            Mức độ hài lòng của phụ huynh sau buổi test
          </label>
          <div className="flex items-center gap-1.5 h-8">
            {[1, 2, 3, 4, 5].map((s) => {
              const active = (hoverRating || satisfaction) >= s;
              return (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setSatisfaction(s)}
                  className={`text-xl transition-all duration-150 hover:scale-130 ${
                    active ? "text-amber-400 drop-shadow-xs" : "text-muted-foreground/30"
                  }`}
                >
                  ★
                </button>
              );
            })}
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 ml-2">
              {satisfaction}/5 sao
            </span>
          </div>
        </div>
      </div>

      {/* Teacher feedback */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold text-foreground block">
          Nhận xét của giáo viên về học lực & sự tiếp thu
        </label>
        <textarea
          value={teacherFeedback}
          onChange={(e) => setTeacherFeedback(e.target.value)}
          placeholder="VD: Bé nắm chắc lý thuyết nền tảng, tư duy nhanh nhẹn. Cần rèn thêm kỹ năng giải toán hình học không gian..."
          className="w-full h-16 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-medium leading-relaxed"
        />
      </div>

      {/* Parent feedback */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold text-foreground block">
          Ghi chú phản hồi & nguyện vọng của phụ huynh
        </label>
        <input
          type="text"
          value={parentFeedback}
          onChange={(e) => setParentFeedback(e.target.value)}
          placeholder="VD: Mẹ rất khen thầy cô nhiệt tình, có nguyện vọng đăng ký gói 24 buổi ngay trong tuần..."
          className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          size="sm"
          onClick={handleSave}
          className={`h-9 px-4 text-xs font-black gap-2 transition-all shadow-sm ${
            saved
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Đã lưu kết quả đánh giá!
            </>
          ) : (
            <>
              <Award className="w-4 h-4" /> Lưu kết quả đánh giá học thử
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main TrialsTab ─── */
interface TrialsTabProps {
  trials: TrialClass[];
  onOpenScheduleTrial: () => void;
  onOpenAssessment: (trial: TrialClass) => void;
  onMoveToConversion: (trial: TrialClass) => void;
  onUpdateTrialStatus: (trialId: string, status: TrialStatus) => void;
  onSaveAssessment: (trial: TrialClass) => void;
}

export function TrialsTab({
  trials,
  onOpenScheduleTrial,
  onOpenAssessment,
  onMoveToConversion,
  onUpdateTrialStatus,
  onSaveAssessment,
}: TrialsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredTrials = useMemo(() => {
    return trials.filter((t) => {
      const matchSearch =
        !searchTerm ||
        t.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.parentPhone.includes(searchTerm) ||
        t.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trials, searchTerm, statusFilter]);

  // Counts per status
  const scheduledCount = trials.filter((t) => t.status === "scheduled").length;
  const attendedCount = trials.filter((t) => t.status === "attended").length;
  const absentCount = trials.filter((t) => t.status === "absent").length;

  return (
    <div className="space-y-4">
      {/* Status summary pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
          <div className="text-lg font-black text-blue-600 dark:text-blue-400">{scheduledCount}</div>
          <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">🕒 Chờ học thử</div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{attendedCount}</div>
          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">✅ Đã tham gia</div>
        </div>
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
          <div className="text-lg font-black text-rose-600 dark:text-rose-400">{absentCount}</div>
          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">❌ Vắng mặt</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT, lớp học thử, giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">🕒 Chờ học thử</option>
            <option value="attended">✅ Đã tham gia</option>
            <option value="absent">❌ Vắng mặt</option>
            <option value="cancelled">🚫 Đã hủy</option>
          </select>
        </div>

        <Button
          onClick={onOpenScheduleTrial}
          size="sm"
          className="font-bold gap-1.5 shadow-sm bg-purple-600 hover:bg-purple-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4" />
          Xếp lịch học thử mới
        </Button>
      </div>

      {/* Trials Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Học sinh & Môn thử
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Lớp & Giáo viên
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Thời gian & Phòng
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Trạng thái
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Kết quả đánh giá
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3 text-right">
                Tác vụ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground text-xs"
                >
                  Không tìm thấy lịch học thử nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrials.map((trial) => {
                const statusCfg =
                  TRIAL_STATUS_CONFIG[trial.status] ||
                  TRIAL_STATUS_CONFIG.scheduled;
                const isExpanded = expandedRow === trial.id;

                return (
                  <>
                    <TableRow
                      key={trial.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      {/* Học sinh */}
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground">
                            {trial.leadName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Lớp & GV */}
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">
                            {trial.className.replace(/\s*\(.*?\)\s*$/, "")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            GV: {trial.teacherName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Thời gian & Phòng */}
                      <TableCell className="py-3">
                        <div className="flex flex-col text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {trial.trialDate}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {trial.startTime} - {trial.endTime}
                            {trial.room && ` (${trial.room})`}
                          </span>
                        </div>
                      </TableCell>

                      {/* Trạng thái — 3-step pipeline */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-1.5">
                          {/* Visual Stepper Tracker */}
                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => onUpdateTrialStatus(trial.id, "scheduled")}
                              title="Đặt về Chờ học thử"
                              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                                trial.status === "scheduled"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-muted/80 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600"
                              }`}
                            >
                              🕒 Chờ thử
                            </button>
                            <span className="text-muted-foreground text-[10px]">&rarr;</span>
                            <button
                              type="button"
                              onClick={() => onUpdateTrialStatus(trial.id, "attended")}
                              title="Xác nhận đã tham gia"
                              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                                trial.status === "attended"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-muted/80 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                              }`}
                            >
                              ✅ Tham gia
                            </button>
                            <span className="text-muted-foreground text-[10px]">&rarr;</span>
                            <button
                              type="button"
                              onClick={() => onUpdateTrialStatus(trial.id, "absent")}
                              title="Đánh dấu vắng mặt"
                              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                                trial.status === "absent"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "bg-muted/80 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                              }`}
                            >
                              ❌ Vắng
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            {trial.status === "scheduled" && (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                Sắp diễn ra theo lịch
                              </span>
                            )}
                            {trial.status === "attended" && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Đã hoàn thành buổi thử
                              </span>
                            )}
                            {trial.status === "absent" && (
                              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                Cần liên hệ xếp lại
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Kết quả đánh giá */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          {trial.testScore !== undefined ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                                Điểm test: {trial.testScore}/10
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Chưa nhập đánh giá
                            </span>
                          )}
                          {trial.teacherFeedback && (
                            <span
                              className="text-[10px] text-muted-foreground truncate font-medium"
                              title={trial.teacherFeedback}
                            >
                              GV: {trial.teacherFeedback}
                            </span>
                          )}
                          {trial.parentFeedback && (
                            <span
                              className="text-[10px] font-bold text-foreground truncate"
                              title={trial.parentFeedback}
                            >
                              💬 {trial.parentFeedback}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Tác vụ */}
                      <TableCell className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Toggle assessment form */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setExpandedRow(
                                isExpanded ? null : trial.id
                              )
                            }
                            className={`h-8 text-xs px-2.5 gap-1.5 font-bold transition-all ${
                              isExpanded
                                ? "border-amber-500 text-amber-700 bg-amber-500/10"
                                : "border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                            }`}
                            title="Đánh giá kết quả học thử"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Đánh giá</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </Button>

                          {/* Chuyển Ghi danh & Đóng phí */}
                          <Button
                            size="sm"
                            onClick={() => onMoveToConversion(trial)}
                            className="h-8 text-xs px-3 gap-1.5 font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs hover:shadow-md hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
                            title="Đẩy thẳng hồ sơ sang Bước 3: Ghi danh & Đóng phí"
                          >
                            <span>Ghi danh & Đóng phí</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Quick Assessment Row */}
                    {isExpanded && trial.status === "attended" && (
                      <TableRow key={`${trial.id}-assessment`}>
                        <TableCell
                          colSpan={6}
                          className="py-0 px-4 bg-amber-500/5 border-b border-amber-500/20"
                        >
                          <QuickAssessmentRow
                            trial={trial}
                            onSave={(updated) => {
                              onSaveAssessment(updated);
                              setExpandedRow(null);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[11px] text-muted-foreground px-1">
        Hiển thị <strong>{filteredTrials.length}</strong> / {trials.length} lịch học thử
      </p>
    </div>
  );
}
