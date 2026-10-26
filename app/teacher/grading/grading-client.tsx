"use client";

import { useState } from "react";
import {
  Award,
  Search,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gradeSubmission, type TeacherSubmissionItem } from "@/lib/actions/assignments";

interface TeacherGradingClientProps {
  classes: any[];
  submissions: TeacherSubmissionItem[];
}

export function TeacherGradingClient({ classes, submissions }: TeacherGradingClientProps) {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [gradingSubmission, setGradingSubmission] = useState<TeacherSubmissionItem | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchClass = selectedClassFilter === "all" || sub.class_id === selectedClassFilter;
    const matchStatus = selectedStatusFilter === "all" || sub.status === selectedStatusFilter;
    const matchSearch =
      sub.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assignment_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  });

  const pendingCount = submissions.filter((s) => s.status !== "graded").length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  function openGradingModal(sub: TeacherSubmissionItem) {
    setGradingSubmission(sub);
    setScoreInput(sub.score !== null ? String(sub.score) : "");
    setFeedbackInput(sub.feedback || "");
    setFormError(null);
  }

  async function handleSaveGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!gradingSubmission) return;

    const parsedScore = parseFloat(scoreInput);
    if (isNaN(parsedScore)) {
      setFormError("Vui lòng nhập điểm số hợp lệ");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const result = await gradeSubmission(gradingSubmission.id, parsedScore, feedbackInput);

    setIsSaving(false);

    if (result?.error) {
      setFormError(result.error);
      return;
    }

    setGradingSubmission(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Không Gian Chấm Điểm & Nhận Xét</h3>
            <p className="text-xs text-muted-foreground">
              Danh sách bài làm của học sinh chờ chấm, chấm điểm trực tiếp và ghi nhận xét
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-bold py-1 px-3 rounded-xl">
            Chờ chấm: {pendingCount} bài
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-bold py-1 px-3 rounded-xl">
            Đã chấm: {gradedCount} bài
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
            <SelectTrigger className="h-9 w-44 text-xs rounded-xl">
              <SelectValue placeholder="Chọn lớp học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các lớp</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
            <SelectTrigger className="h-9 w-36 text-xs rounded-xl">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="submitted">Chờ chấm ({pendingCount})</SelectItem>
              <SelectItem value="graded">Đã chấm ({gradedCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm học sinh, bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Học sinh</TableHead>
              <TableHead>Bài tập / Bài test</TableHead>
              <TableHead>Lớp học</TableHead>
              <TableHead>Thời gian nộp</TableHead>
              <TableHead className="text-center">Điểm số</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-foreground">Không có bài làm nào trong danh sách</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Học sinh nộp bài tập sẽ xuất hiện tại đây để giáo viên chấm điểm.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((sub) => {
                const isPending = sub.status !== "graded";
                return (
                  <TableRow key={sub.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
                          {sub.student_name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{sub.student_name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-foreground line-clamp-1">
                        {sub.assignment_title}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {sub.class_name}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString("vi-VN") : "—"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-mono">
                      {sub.score !== null ? (
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                          {sub.score} / {sub.max_score}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {isPending ? (
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                          Chờ chấm
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                          ✓ Đã chấm
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isPending ? "default" : "outline"}
                        onClick={() => openGradingModal(sub)}
                        className="h-8 gap-1.5 text-xs rounded-xl font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isPending ? "Chấm điểm" : "Sửa điểm / Lời phê"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={Boolean(gradingSubmission)} onOpenChange={(open) => !open && setGradingSubmission(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Chấm Điểm & Ghi Nhận Xét</DialogTitle>
            <DialogDescription className="text-xs">
              Đánh giá bài làm và gửi phản hồi chi tiết cho học sinh
            </DialogDescription>
          </DialogHeader>

          {gradingSubmission && (
            <form onSubmit={handleSaveGrade} className="space-y-4 pt-2">
              {formError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Học sinh:</span>
                  <span className="font-bold text-foreground">{gradingSubmission.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lớp học:</span>
                  <span className="font-semibold text-foreground">{gradingSubmission.class_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bài tập:</span>
                  <span className="font-semibold text-foreground">{gradingSubmission.assignment_title}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nội dung bài làm của học sinh</Label>
                <div className="p-3 rounded-xl bg-card border border-border/80 text-xs text-foreground/90 max-h-32 overflow-y-auto italic">
                  "{gradingSubmission.content || "Không có nội dung đính kèm"}"
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Điểm số đạt được *</Label>
                  <span className="text-xs text-muted-foreground">
                    Thang điểm tối đa: {gradingSubmission.max_score}
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max={gradingSubmission.max_score}
                  placeholder="VD: 8.5"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lời phê / Nhận xét của giáo viên</Label>
                <Textarea
                  placeholder="Ghi nhận ưu điểm, điểm cần khắc phục hoặc hướng dẫn thêm cho học viên..."
                  value={feedbackInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackInput(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGradingSubmission(null)}
                  disabled={isSaving}
                  className="text-xs rounded-xl"
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={isSaving} className="text-xs font-bold rounded-xl">
                  {isSaving ? "Đang lưu..." : "Lưu Kết Quả Chấm Điểm"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
