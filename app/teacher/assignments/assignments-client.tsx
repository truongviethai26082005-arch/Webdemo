"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Assignment {
  id: string;
  title: string;
  classId: string;
  className: string;
  type: "homework" | "quiz" | "test" | "project";
  dueDate: string;
  maxScore: number;
  totalStudents: number;
  submittedCount: number;
  status: "active" | "closed";
  instructions?: string;
}

interface TeacherAssignmentsClientProps {
  classes: any[];
}

export function TeacherAssignmentsClient({ classes }: TeacherAssignmentsClientProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "asg-1",
      title: "Bài tập về nhà: 20 câu trắc nghiệm Chia thì Hiện tại & Quá khứ",
      classId: classes[0]?.id || "c1",
      className: classes[0]?.name || "Lớp Tiếng Anh Giao Tiếp",
      type: "quiz",
      dueDate: "2026-09-10",
      maxScore: 10,
      totalStudents: 15,
      submittedCount: 12,
      status: "active",
      instructions: "Học sinh hoàn thành trước 23h59 ngày 10/09.",
    },
    {
      id: "asg-2",
      title: "Viết đoạn văn ngắn 150 từ giới thiệu về gia đình",
      classId: classes[0]?.id || "c1",
      className: classes[0]?.name || "Lớp Tiếng Anh Giao Tiếp",
      type: "homework",
      dueDate: "2026-09-08",
      maxScore: 10,
      totalStudents: 15,
      submittedCount: 15,
      status: "active",
      instructions: "Chú ý sử dụng các từ vựng đã học trong Bài 01.",
    },
    {
      id: "asg-3",
      title: "Bài kiểm tra 45 phút định kỳ Tháng 8",
      classId: classes[1]?.id || classes[0]?.id || "c2",
      className: classes[1]?.name || classes[0]?.name || "Lớp Ngữ Pháp Nâng Cao",
      type: "test",
      dueDate: "2026-08-30",
      maxScore: 100,
      totalStudents: 18,
      submittedCount: 18,
      status: "closed",
      instructions: "Đề kiểm tra tổng hợp kiến thức Unit 1 - Unit 4.",
    },
  ]);

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newClassId, setNewClassId] = useState(classes[0]?.id || "");
  const [newType, setNewType] = useState<Assignment["type"]>("homework");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("10");
  const [newInstructions, setNewInstructions] = useState("");

  const filteredAssignments = assignments.filter((a) => {
    const matchClass = selectedClassFilter === "all" || a.classId === selectedClassFilter;
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSearch;
  });

  function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    const chosenClass = classes.find((c) => c.id === newClassId);
    const countStudents = chosenClass?.enrollments?.length || 15;

    const newAsg: Assignment = {
      id: "asg-" + Date.now(),
      title: newTitle,
      classId: newClassId,
      className: chosenClass?.name || "Lớp học",
      type: newType,
      dueDate: newDueDate,
      maxScore: Number(newMaxScore) || 10,
      totalStudents: countStudents,
      submittedCount: 0,
      status: "active",
      instructions: newInstructions,
    };

    setAssignments([newAsg, ...assignments]);
    setIsDialogOpen(false);
    setNewTitle("");
    setNewDueDate("");
    setNewInstructions("");
  }

  function handleDelete(id: string) {
    setAssignments(assignments.filter((a) => a.id !== id));
  }

  function getTypeBadge(type: Assignment["type"]) {
    switch (type) {
      case "quiz":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] font-bold">Trắc nghiệm</Badge>;
      case "homework":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold">Bài tập về nhà</Badge>;
      case "test":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold">Bài kiểm tra</Badge>;
      case "project":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">Dự án</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
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
          className="gap-2 text-xs font-bold h-9 rounded-xl shadow-md shadow-primary/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Tạo Bài Tập Mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center border border-border/80 rounded-2xl shadow-soft">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-bold text-foreground">Chưa có bài tập hoặc bài kiểm tra nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Bấm nút "+ Tạo Bài Tập Mới" để giao bài tập hoặc lên lịch kiểm tra cho học sinh.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const isClosed = asg.status === "closed";
            const submissionPercent = Math.round((asg.submittedCount / (asg.totalStudents || 1)) * 100);
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
                        {asg.className}
                      </Badge>
                    </div>

                    {asg.instructions && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{asg.instructions}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Hạn nộp: <strong className="font-mono text-foreground/90">{asg.dueDate}</strong>
                      </span>
                      <span>•</span>
                      <span>Thang điểm: <strong className="font-mono text-foreground/90">{asg.maxScore}đ</strong></span>
                    </div>
                  </div>

                  {/* Submission Progress & Actions */}
                  <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {asg.submittedCount}/{asg.totalStudents} đã nộp
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

      {/* Create Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tạo Bài Tập / Bài Test Mới</DialogTitle>
            <DialogDescription className="text-xs">
              Thiết lập bài tập hoặc bài kiểm tra định kỳ cho học sinh
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAssignment} className="space-y-4 pt-2">
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
                <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                  <SelectTrigger className="h-9 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homework">Bài tập về nhà</SelectItem>
                    <SelectItem value="quiz">Trắc nghiệm nhanh</SelectItem>
                    <SelectItem value="test">Bài kiểm tra định kỳ</SelectItem>
                    <SelectItem value="project">Dự án nhóm / thuyết trình</SelectItem>
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
              <Label className="text-xs font-semibold">Ghi chú / Yêu cầu chi tiết</Label>
              <Input
                placeholder="VD: Học sinh nộp file ảnh chụp hoặc file word trước hạn"
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" className="text-xs font-bold rounded-xl">
                Giao Bài Tập
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
