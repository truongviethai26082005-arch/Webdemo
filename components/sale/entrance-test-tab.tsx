"use client";

import { useState } from "react";
import { EntranceTestQuestion, CourseRecommendationRule, Class, TestOption } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createQuestion,
  deleteQuestion,
  createRecommendationRule,
  deleteRecommendationRule,
} from "@/lib/actions/entrance-test";
import { Plus, Trash2, AlertCircle, Loader2, BookOpen, Target } from "lucide-react";

interface EntranceTestTabProps {
  questions: EntranceTestQuestion[];
  recommendationRules: CourseRecommendationRule[];
  classes: Class[];
  onRefresh: () => void;
}

const OPTION_KEYS: TestOption[] = ["a", "b", "c", "d"];

export function EntranceTestTab({ questions, recommendationRules, classes, onRefresh }: EntranceTestTabProps) {
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);

  const subjects = Array.from(new Set(questions.map((q) => q.subject)));

  return (
    <div className="space-y-6">
      {/* SECTION 1: NGÂN HÀNG CÂU HỎI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Ngân Hàng Câu Hỏi Test Đầu Vào ({questions.length})
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Câu hỏi trắc nghiệm 4 đáp án theo từng môn học, dùng để tạo bài test gửi cho học sinh tự làm.
            </p>
          </div>
          <Button size="sm" onClick={() => setQuestionDialogOpen(true)} className="text-xs font-bold gap-1 h-8 rounded-xl">
            <Plus className="w-3.5 h-3.5" />
            Thêm câu hỏi
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Chưa có câu hỏi nào</p>
              <p className="text-sm text-muted-foreground mt-1">
                Thêm câu hỏi đầu tiên để có thể gửi bài test đầu vào cho học sinh.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
                  <TableHead className="font-bold">Môn học</TableHead>
                  <TableHead className="font-bold">Câu hỏi</TableHead>
                  <TableHead className="font-bold">Đáp án đúng</TableHead>
                  <TableHead className="font-bold">Điểm</TableHead>
                  <TableHead className="text-right font-bold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-bold">{q.subject}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate">{q.question_text}</TableCell>
                    <TableCell className="uppercase font-bold">{q.correct_option}</TableCell>
                    <TableCell>{q.points}</TableCell>
                    <TableCell className="text-right">
                      <DeleteQuestionButton id={q.id} onRefresh={onRefresh} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* SECTION 2: QUY ĐỔI ĐIỂM -> GỢI Ý LỚP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Quy Đổi Điểm → Gợi Ý Khóa Học ({recommendationRules.length})
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Định nghĩa khoảng % điểm test đầu vào ứng với lớp/lộ trình nào — hệ thống tự gợi ý khi Sale chốt đơn.
            </p>
          </div>
          <Button size="sm" onClick={() => setRuleDialogOpen(true)} className="text-xs font-bold gap-1 h-8 rounded-xl">
            <Plus className="w-3.5 h-3.5" />
            Thêm ngưỡng điểm
          </Button>
        </div>

        {recommendationRules.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Chưa cấu hình ngưỡng điểm nào</p>
              <p className="text-sm text-muted-foreground mt-1">
                Chưa có gợi ý tự động nào cho tới khi bạn thêm ngưỡng điểm thật ở đây.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
                  <TableHead className="font-bold">Môn học</TableHead>
                  <TableHead className="font-bold">Khoảng điểm (%)</TableHead>
                  <TableHead className="font-bold">Gợi ý</TableHead>
                  <TableHead className="font-bold">Lớp liên kết</TableHead>
                  <TableHead className="text-right font-bold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendationRules.map((r) => (
                  <TableRow key={r.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-bold">{r.subject}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {r.min_percentage}% - {r.max_percentage}%
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{r.suggested_label}</TableCell>
                    <TableCell className="text-muted-foreground">{r.suggested_class?.name || "—"}</TableCell>
                    <TableCell className="text-right">
                      <DeleteRuleButton id={r.id} onRefresh={onRefresh} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateQuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        existingSubjects={subjects}
        onSuccess={() => {
          setQuestionDialogOpen(false);
          onRefresh();
        }}
      />

      <CreateRuleDialog
        open={ruleDialogOpen}
        onOpenChange={setRuleDialogOpen}
        existingSubjects={subjects}
        classes={classes}
        onSuccess={() => {
          setRuleDialogOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
}

function DeleteQuestionButton({ id, onRefresh }: { id: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
      disabled={loading}
      onClick={async () => {
        if (!confirm("Xóa câu hỏi này?")) return;
        setLoading(true);
        await deleteQuestion(id);
        setLoading(false);
        onRefresh();
      }}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </Button>
  );
}

function DeleteRuleButton({ id, onRefresh }: { id: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
      disabled={loading}
      onClick={async () => {
        if (!confirm("Xóa ngưỡng điểm này?")) return;
        setLoading(true);
        await deleteRecommendationRule(id);
        setLoading(false);
        onRefresh();
      }}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </Button>
  );
}

function CreateQuestionDialog({
  open,
  onOpenChange,
  existingSubjects,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSubjects: string[];
  onSuccess: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<Record<TestOption, string>>({ a: "", b: "", c: "", d: "" });
  const [correctOption, setCorrectOption] = useState<TestOption>("a");
  const [points, setPoints] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSubject("");
    setQuestionText("");
    setOptions({ a: "", b: "", c: "", d: "" });
    setCorrectOption("a");
    setPoints("1");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createQuestion({
      subject,
      question_text: questionText,
      option_a: options.a,
      option_b: options.b,
      option_c: options.c,
      option_d: options.d,
      correct_option: correctOption,
      points: Number(points) || 1,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm câu hỏi Test đầu vào</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Môn học</Label>
            <Input
              list="subject-suggestions"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: Tiếng Anh, Toán..."
              required
              disabled={loading}
            />
            <datalist id="subject-suggestions">
              {existingSubjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Nội dung câu hỏi</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={2}
              required
              disabled={loading}
            />
          </div>

          {OPTION_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === key}
                onChange={() => setCorrectOption(key)}
                disabled={loading}
                title={`Đáp án ${key.toUpperCase()} đúng`}
              />
              <Input
                value={options[key]}
                onChange={(e) => setOptions((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Đáp án ${key.toUpperCase()}`}
                required
                disabled={loading}
                className="text-xs h-8"
              />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">Tích chọn radio bên trái đáp án đúng.</p>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Điểm cho câu này</Label>
            <Input type="number" min={0} step="0.5" value={points} onChange={(e) => setPoints(e.target.value)} disabled={loading} className="text-xs h-8 w-24" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="text-xs font-bold">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Lưu câu hỏi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateRuleDialog({
  open,
  onOpenChange,
  existingSubjects,
  classes,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSubjects: string[];
  classes: Class[];
  onSuccess: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [minPct, setMinPct] = useState("");
  const [maxPct, setMaxPct] = useState("");
  const [label, setLabel] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSubject("");
    setMinPct("");
    setMaxPct("");
    setLabel("");
    setClassId("");
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createRecommendationRule({
      subject,
      min_percentage: Number(minPct),
      max_percentage: Number(maxPct),
      suggested_label: label,
      suggested_class_id: classId || null,
      note,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm ngưỡng điểm → gợi ý khóa học</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Môn học (khớp đúng tên môn trong ngân hàng câu hỏi)</Label>
            <Input
              list="rule-subject-suggestions"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={loading}
            />
            <datalist id="rule-subject-suggestions">
              {existingSubjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Từ % điểm</Label>
              <Input type="number" min={0} max={100} value={minPct} onChange={(e) => setMinPct(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Đến % điểm</Label>
              <Input type="number" min={0} max={100} value={maxPct} onChange={(e) => setMaxPct(e.target.value)} required disabled={loading} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Nội dung gợi ý (VD: "Lớp Tiếng Anh Nâng Cao")</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} required disabled={loading} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Liên kết tới lớp thật (tùy chọn)</Label>
            <Select value={classId} onValueChange={setClassId} disabled={loading}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Không liên kết lớp cụ thể" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Ghi chú (tùy chọn)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} disabled={loading} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="text-xs font-bold">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Lưu ngưỡng điểm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
