"use client";

import { useState } from "react";
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  User,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Submission {
  id: string;
  studentName: string;
  classId: string;
  className: string;
  assignmentTitle: string;
  submittedAt: string;
  status: "pending" | "graded";
  score?: number;
  maxScore: number;
  submissionContent?: string;
  feedback?: string;
}

interface TeacherGradingClientProps {
  classes: any[];
}

function getSubjectSubmissionTemplates(className: string) {
  const nameLower = (className || "").toLowerCase();

  if (nameLower.includes("toán") || nameLower.includes("math")) {
    return [
      {
        assignmentTitle: "Bài tập về nhà: 15 câu trắc nghiệm & tự luận Đại số",
        maxScore: 10,
        submissionContent: "Em đã hoàn thành bài tập tự luận và gửi kèm ảnh bài làm ạ.",
        status: "pending" as const,
      },
      {
        assignmentTitle: "Bộ bài tập tự luyện chuyên đề Hình Học & Chứng minh",
        maxScore: 10,
        score: 9.0,
        submissionContent: "Bài làm chứng minh hình học câu a, b, c trong phiếu bài tập.",
        feedback: "Lời giải mạch lạc, lập luận chứng minh chặt chẽ, chú ý ký hiệu vuông góc ở câu c.",
        status: "graded" as const,
      },
      {
        assignmentTitle: "Bài kiểm tra 45 phút định kỳ Tháng 8 (Đại số & Hình học)",
        maxScore: 100,
        score: 85,
        submissionContent: "File PDF bài làm kiểm tra định kỳ 45 phút.",
        feedback: "Làm tốt phần trắc nghiệm và hình học, cần cẩn thận hơn khi biến đổi biểu thức rút gọn.",
        status: "graded" as const,
      },
    ];
  }

  if (nameLower.includes("văn") || nameLower.includes("ngữ văn") || nameLower.includes("literature")) {
    return [
      {
        assignmentTitle: "Bài tập về nhà: Lập dàn ý phân tích nhân vật trong tác phẩm",
        maxScore: 10,
        submissionContent: "Em đã lập xong dàn ý chi tiết 3 phần Mở bài - Thân bài - Kết bài ạ.",
        status: "pending" as const,
      },
      {
        assignmentTitle: "Viết bài văn tự luận (400 - 500 từ) cảm nhận về đoạn trích",
        maxScore: 10,
        score: 9.0,
        submissionContent: "Bài văn tự luận trình bày suy nghĩ và cảm nhận sâu sắc về tác phẩm.",
        feedback: "Bài viết giàu cảm xúc, luận điểm rõ ràng, vốn từ phong phú. Phát huy tốt!",
        status: "graded" as const,
      },
      {
        assignmentTitle: "Bài kiểm tra 45 phút định kỳ: Đọc hiểu văn bản & Tập làm văn",
        maxScore: 100,
        score: 88,
        submissionContent: "Bài nộp kiểm tra định kỳ Đọc hiểu và Tập làm văn.",
        feedback: "Trả lời tốt các câu hỏi đọc hiểu, bài tập làm văn cần chú ý liên kết đoạn mượt mà hơn.",
        status: "graded" as const,
      },
    ];
  }

  if (nameLower.includes("lý") || nameLower.includes("vật lý") || nameLower.includes("physics")) {
    return [
      {
        assignmentTitle: "Bài tập về nhà: 20 câu trắc nghiệm Chuyển động & Định luật Vật Lý",
        maxScore: 10,
        submissionContent: "Em đã nộp đáp án 20 câu trắc nghiệm Vật lý ạ.",
        status: "pending" as const,
      },
      {
        assignmentTitle: "Bài tập tính toán: Áp dụng công thức và vẽ sơ đồ hiện tượng",
        maxScore: 10,
        score: 8.5,
        submissionContent: "Sơ đồ và bước tính toán công suất / lực tác dụng.",
        feedback: "Áp dụng đúng công thức, tính toán chính xác, nhớ ghi đủ đơn vị đo (N, J, W).",
        status: "graded" as const,
      },
    ];
  }

  if (nameLower.includes("hóa") || nameLower.includes("chemistry")) {
    return [
      {
        assignmentTitle: "Bài tập về nhà: Chuỗi phản ứng & Bài toán tính theo phương trình",
        maxScore: 10,
        submissionContent: "Bài nộp phương trình hóa học và tính nồng độ phần trăm.",
        status: "pending" as const,
      },
      {
        assignmentTitle: "Bài kiểm tra 15 phút: Phân loại chất & Chuỗi biến hóa",
        maxScore: 10,
        score: 9.0,
        submissionContent: "File ảnh bài làm kiểm tra 15 phút.",
        feedback: "Cân bằng phương trình tốt, xác định chất chính xác.",
        status: "graded" as const,
      },
    ];
  }

  if (nameLower.includes("anh") || nameLower.includes("english") || nameLower.includes("toeic") || nameLower.includes("ielts")) {
    return [
      {
        assignmentTitle: "Bài tập về nhà: 20 câu trắc nghiệm Chia thì Quá khứ",
        maxScore: 10,
        submissionContent: "Em đã hoàn thành 20 câu trắc nghiệm trên phiếu bài tập đính kèm ạ.",
        status: "pending" as const,
      },
      {
        assignmentTitle: "Viết đoạn văn ngắn 150 từ giới thiệu về gia đình",
        maxScore: 10,
        score: 9.0,
        submissionContent: "My family has four members: my parents, my younger brother and me...",
        feedback: "Bài viết mạch lạc, từ vựng phong phú, lưu ý lỗi chia động từ ở câu số 4.",
        status: "graded" as const,
      },
      {
        assignmentTitle: "Bài kiểm tra 45 phút định kỳ Tháng 8",
        maxScore: 100,
        score: 85,
        submissionContent: "File bài làm kiểm tra định kỳ 45 phút.",
        feedback: "Làm tốt phần ngữ pháp câu điều kiện, cần cải thiện phần mệnh đề quan hệ.",
        status: "graded" as const,
      },
    ];
  }

  return [
    {
      assignmentTitle: "Bài tập về nhà: Bổ trợ kiến thức & Luyện tập câu hỏi chuyên đề",
      maxScore: 10,
      submissionContent: "Em đã hoàn thành bài tập nộp cho thầy/cô ạ.",
      status: "pending" as const,
    },
    {
      assignmentTitle: "Bài kiểm tra 45 phút định kỳ",
      maxScore: 100,
      score: 85,
      submissionContent: "Bài làm kiểm tra định kỳ.",
      feedback: "Kiến thức nắm chắc, bài làm cẩn thận và đạt kết quả tốt.",
      status: "graded" as const,
    },
  ];
}

function generateInitialSubmissions(classes: any[]): Submission[] {
  if (!classes || classes.length === 0) {
    return [
      {
        id: "sub-1",
        studentName: "Nguyễn Văn An",
        classId: "c1",
        className: "Lớp Học",
        assignmentTitle: "Bài tập về nhà: 15 câu trắc nghiệm & tự luận Đại số",
        submittedAt: "2026-09-02 19:45",
        status: "pending",
        maxScore: 10,
        submissionContent: "Em đã hoàn thành bài tập tự luận và gửi kèm ảnh bài làm ạ.",
      },
    ];
  }

  const sampleStudents = ["Nguyễn Văn An", "Trần Thị Mai", "Lê Hoàng Long", "Phạm Minh Đức"];
  const result: Submission[] = [];
  let idCounter = 1;

  classes.forEach((c) => {
    const templates = getSubjectSubmissionTemplates(c.name);
    templates.forEach((tmpl, i) => {
      const studentName = sampleStudents[(idCounter - 1) % sampleStudents.length];
      result.push({
        id: `sub-${idCounter++}`,
        studentName,
        classId: c.id,
        className: c.name,
        assignmentTitle: tmpl.assignmentTitle,
        submittedAt: `2026-09-0${(i % 3) + 1} 19:30`,
        status: tmpl.status,
        score: tmpl.score,
        maxScore: tmpl.maxScore,
        submissionContent: tmpl.submissionContent,
        feedback: tmpl.feedback,
      });
    });
  });

  return result;
}

export function TeacherGradingClient({ classes }: TeacherGradingClientProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(() => generateInitialSubmissions(classes));

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const filteredSubmissions = submissions.filter((sub) => {
    const matchClass = selectedClassFilter === "all" || sub.classId === selectedClassFilter;
    const matchStatus = selectedStatusFilter === "all" || sub.status === selectedStatusFilter;
    const matchSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  function openGradingModal(sub: Submission) {
    setGradingSubmission(sub);
    setScoreInput(sub.score !== undefined ? String(sub.score) : "");
    setFeedbackInput(sub.feedback || "");
  }

  function handleSaveGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!gradingSubmission) return;

    const parsedScore = parseFloat(scoreInput);
    if (isNaN(parsedScore)) return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === gradingSubmission.id
          ? {
              ...s,
              status: "graded",
              score: parsedScore,
              feedback: feedbackInput,
            }
          : s
      )
    );

    setGradingSubmission(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
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

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
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

          {/* Status Filter */}
          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
            <SelectTrigger className="h-9 w-36 text-xs rounded-xl">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ chấm ({pendingCount})</SelectItem>
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

      {/* Submissions Table */}
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
                const isPending = sub.status === "pending";
                return (
                  <TableRow key={sub.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
                          {sub.studentName.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{sub.studentName}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-foreground line-clamp-1">
                        {sub.assignmentTitle}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {sub.className}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">{sub.submittedAt}</span>
                    </TableCell>

                    <TableCell className="text-center font-mono">
                      {sub.score !== undefined ? (
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                          {sub.score} / {sub.maxScore}
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

      {/* Grading Dialog */}
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
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Học sinh:</span>
                  <span className="font-bold text-foreground">{gradingSubmission.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lớp học:</span>
                  <span className="font-semibold text-foreground">{gradingSubmission.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bài tập:</span>
                  <span className="font-semibold text-foreground">{gradingSubmission.assignmentTitle}</span>
                </div>
              </div>

              {/* Student Submission Content Box */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nội dung bài làm của học sinh</Label>
                <div className="p-3 rounded-xl bg-card border border-border/80 text-xs text-foreground/90 max-h-32 overflow-y-auto italic">
                  "{gradingSubmission.submissionContent || "Không có nội dung đính kèm"}"
                </div>
              </div>

              {/* Score Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Điểm số đạt được *</Label>
                  <span className="text-xs text-muted-foreground">
                    Thang điểm tối đa: {gradingSubmission.maxScore}
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max={gradingSubmission.maxScore}
                  placeholder={`VD: 8.5`}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl font-mono font-bold"
                />
              </div>

              {/* Teacher Remarks / Feedback Textarea */}
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
                  className="text-xs rounded-xl"
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold rounded-xl">
                  Lưu Kết Quả Chấm Điểm
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
