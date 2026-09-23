"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  FileCheck,
  ChevronRight,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssignment, deleteAssignment, type TeacherAssignmentItem } from "@/lib/actions/assignments";

interface TeacherAssignmentsClientProps {
  classes: any[];
  assignments: TeacherAssignmentItem[];
}

const TYPE_OPTIONS = [
  { value: "homework", label: "Bài tập về nhà" },
  { value: "quiz", label: "Trắc nghiệm nhanh" },
  { value: "test", label: "Bài kiểm tra định kỳ" },
  { value: "project", label: "Dự án nhóm / thuyết trình" },
];

function getTypeBadge(type: string) {
  switch (type) {
    case "quiz":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] font-bold">Trắc nghiệm</Badge>;
    case "test":
      return <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold">Bài kiểm tra</Badge>;
    case "project":
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">Dự án</Badge>;
    default:
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold">Bài tập về nhà</Badge>;
  }
}

export function TeacherAssignmentsClient({ classes, assignments }: TeacherAssignmentsClientProps) {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newClassId, setNewClassId] = useState(classes[0]?.id || "");
  const [newType, setNewType] = useState("homework");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("10");
  const [newInstructions, setNewInstructions] = useState("");

  const filteredAssignments = assignments.filter((a) => {
    const matchClass = selectedClassFilter === "all" || a.class_id === selectedClassFilter;
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSearch;
  });

  function resetForm() {
    setNewTitle("");
    setNewClassId(classes[0]?.id || "");
    setNewType("homework");
    setNewDueDate("");
    setNewMaxScore("10");
    setNewInstructions("");
    setFormError(null);
  }

  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newDueDate || !newClassId) return;
    setIsSubmitting(true);
    setFormError(null);

    const result = await createAssignment({
      title: newTitle,
      classId: newClassId,
      type: newType,
      dueDate: newDueDate,
      maxScore: Number(newMaxScore) || 10,
      instructions: newInstructions,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setFormError(result.error);
      return;
    }

    setIsDialogOpen(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa bài tập này? Toàn bộ bài nộp liên quan sẽ bị xóa theo.")) return;
    const result = await deleteAssignment(id);
    if (result?.error) {
      alert(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Bài Tập & Kiểm Tra</h3>
            <p className="text-xs text-muted-foreground">
              Tạo bài tập về nhà, trắc nghiệm và đề kiểm tra định kỳ cho các lớp học
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={classes.length === 0}
          className="gap-2 text-xs font-bold h-9 rounded-xl shadow-md shadow-primary/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Tạo Bài Tập Mới
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-2">
          <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
            <SelectTrigger className="h-9 w-48 text-xs rounded-xl">
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
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm tên bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center border border-border/80 rounded-2xl shadow-soft">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-bold text-foreground">Chưa có bài tập hoặc bài kiểm tra nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {classes.length === 0
              ? "Bạn chưa được phân công lớp nào."
              : 'Bấm nút "+ Tạo Bài Tập Mới" để giao bài tập hoặc lên lịch kiểm tra cho học sinh.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const submissionPercent = Math.round((asg.submitted_count / (asg.total_students || 1)) * 100);
            return (
              <Card
                key={asg.id}
                className="border border-border/80 bg-card shadow-soft hover:shadow-card transition-all rounded-2xl overflow-hidden p-4"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{asg.title}</span>
                      {getTypeBadge(asg.type)}
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {asg.class_name}
                      </Badge>
                    </div>

                    {asg.instructions && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{asg.instructions}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Hạn nộp: <strong className="font-mono text-foreground/90">{asg.due_date || "—"}</strong>
                      </span>
                      <span>•</span>
                      <span>Thang điểm: <strong className="font-mono text-foreground/90">{asg.max_score}đ</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {asg.submitted_count}/{asg.total_students} đã nộp
                        </span>
                      </div>
                      <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${submissionPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href="/teacher/grading">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs rounded-xl border-border hover:bg-muted font-semibold"
                        >
                          Chấm điểm
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(asg.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        title="Xóa bài tập"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tạo Bài Tập / Bài Test Mới</DialogTitle>
            <DialogDescription className="text-xs">
              Thiết lập bài tập hoặc bài kiểm tra định kỳ cho học sinh
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAssignment} className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tên bài tập / Tiêu đề bài test *</Label>
              <Input
                placeholder="VD: Bài kiểm tra 15p: Từ vựng Unit 3"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Lớp học giao bài *</Label>
              <Select value={newClassId} onValueChange={setNewClassId}>
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hình thức bài tập</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="h-9 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Thang điểm tối đa</Label>
                <Input
                  type="number"
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(e.target.value)}
                  className="h-9 text-xs rounded-xl font-mono"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hạn nộp bài (Deadline) *</Label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nội dung bài tập / Link tài liệu / Ghi chú</Label>
              <Textarea
                placeholder="VD: Dán link đề bài (Google Drive, Docs...) hoặc viết trực tiếp nội dung bài tập, yêu cầu nộp bài tại đây"
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="min-h-[88px] text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setIsDialogOpen(false); resetForm(); }}
                disabled={isSubmitting}
                className="text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs font-bold rounded-xl">
                {isSubmitting ? "Đang lưu..." : "Giao Bài Tập"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
