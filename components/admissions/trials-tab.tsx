"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  School,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrialClass, TrialStatus } from "@/types/admissions";

interface TrialsTabProps {
  trials: TrialClass[];
  onOpenScheduleTrial: () => void;
  onOpenAssessment: (trial: TrialClass) => void;
  onMoveToConversion: (trial: TrialClass) => void;
}

const TRIAL_STATUS_CONFIG: Record<TrialStatus, { label: string; className: string }> = {
  scheduled: {
    label: "🕒 Đã xếp lịch hẹn",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold",
  },
  attended: {
    label: "✅ Đã tham gia học thử",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
  },
  absent: {
    label: "❌ Vắng mặt",
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
  cancelled: {
    label: "🚫 Đã hủy hẹn",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function TrialsTab({
  trials,
  onOpenScheduleTrial,
  onOpenAssessment,
  onMoveToConversion,
}: TrialsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  return (
    <div className="space-y-4">
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
            <option value="all">Tất cả trạng thái buổi thử</option>
            <option value="scheduled">Đã xếp lịch hẹn</option>
            <option value="attended">Đã tham gia</option>
            <option value="absent">Vắng mặt</option>
            <option value="cancelled">Đã hủy</option>
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

      {/* Trial Classes Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Học sinh & Môn thử
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Lớp & Giáo viên phụ trách
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Thời gian & Phòng học
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Trạng thái buổi thử
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Đánh giá năng lực & Phản hồi
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3 text-right">
                Tác vụ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                  Không tìm thấy lịch học thử nào phù hợp với điều kiện tìm kiếm.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrials.map((trial) => {
                const statusBadge =
                  TRIAL_STATUS_CONFIG[trial.status] || TRIAL_STATUS_CONFIG.scheduled;

                return (
                  <TableRow key={trial.id} className="group hover:bg-muted/30 transition-colors">
                    {/* Học sinh & Môn */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">{trial.leadName}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                          <span>{trial.targetSubject}</span>
                          <span>•</span>
                          <span className="text-primary font-medium">{trial.parentPhone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Lớp & GV */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {trial.className}
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

                    {/* Trạng thái */}
                    <TableCell className="py-3">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${statusBadge.className}`}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>

                    {/* Đánh giá & Phản hồi */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1 max-w-xs">
                        {trial.testScore !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                              Điểm: {trial.testScore}/10
                            </span>
                            {trial.teacherFeedback && (
                              <span className="text-[11px] text-muted-foreground truncate" title={trial.teacherFeedback}>
                                {trial.teacherFeedback}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Chưa cập nhật đánh giá test
                          </span>
                        )}

                        {trial.parentFeedback && (
                          <span className="text-[10px] text-foreground font-medium truncate" title={trial.parentFeedback}>
                            💬 PH: {trial.parentFeedback}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Tác vụ */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenAssessment(trial)}
                          className="h-8 text-xs px-2.5 gap-1 hover:border-primary hover:text-primary"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Đánh giá</span>
                        </Button>

                        {trial.status === "attended" && (
                          <Button
                            size="sm"
                            onClick={() => onMoveToConversion(trial)}
                            className="h-8 text-xs px-2.5 gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <span>Ghi danh</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
