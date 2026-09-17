"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getEntranceTestForAttempt,
  submitEntranceTest,
  GetEntranceTestResult,
  SubmitEntranceTestResult,
  SubmitAnswer,
} from "@/lib/actions/entrance-test";
import { TestOption } from "@/types/database";
import { Loader2, XCircle, CheckCircle2, ClipboardList } from "lucide-react";

interface TestClientProps {
  token: string;
}

const OPTION_KEYS: TestOption[] = ["a", "b", "c", "d"];

export function TestClient({ token }: TestClientProps) {
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<GetEntranceTestResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, TestOption>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitEntranceTestResult | null>(null);

  useEffect(() => {
    getEntranceTestForAttempt(token).then((data) => {
      setTestData(data);
      setLoading(false);
    });
  }, [token]);

  const handleSubmit = async () => {
    if (!testData?.questions) return;
    const payload: SubmitAnswer[] = testData.questions
      .filter((q) => answers[q.id])
      .map((q) => ({ questionId: q.id, selectedOption: answers[q.id] }));

    setSubmitting(true);
    const res = await submitEntranceTest(token, payload);
    setSubmitting(false);
    setResult(res);
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg p-8 rounded-2xl bg-card border border-border text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!testData?.success) {
    return (
      <div className="w-full max-w-lg p-8 rounded-2xl bg-card border border-border text-center space-y-2">
        <XCircle className="w-10 h-10 text-destructive mx-auto" />
        <p className="text-sm font-semibold text-foreground">{testData?.message || "Liên kết không hợp lệ"}</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="w-full max-w-lg p-8 rounded-2xl bg-card border border-border text-center space-y-3">
        {result.success ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h1 className="text-lg font-black text-foreground">Đã nộp bài thành công!</h1>
            <p className="text-sm text-muted-foreground">
              Đúng {result.correctCount}/{result.totalCount} câu — {result.totalScore}/{result.maxScore} điểm ({result.percentage}%)
            </p>
            <p className="text-xs text-muted-foreground">
              Nhân viên tư vấn sẽ liên hệ để tư vấn lộ trình khóa học phù hợp dựa trên kết quả này.
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-foreground">{result.message}</p>
          </>
        )}
      </div>
    );
  }

  const questions = testData.questions || [];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h1 className="text-base font-black text-foreground">Test Đầu Vào — {testData.subject}</h1>
        <p className="text-xs text-muted-foreground">
          Xin chào {testData.leadName}! Hãy chọn đáp án đúng cho từng câu bên dưới.
        </p>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Câu {idx + 1}: {q.question_text}
            </p>
            <div className="space-y-1.5">
              {OPTION_KEYS.map((key) => {
                const optionText = q[`option_${key}` as keyof typeof q] as string;
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      answers[q.id] === key ? "border-primary bg-primary/10 font-semibold" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={answers[q.id] === key}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: key }))}
                    />
                    <span className="uppercase font-bold text-muted-foreground">{key}.</span>
                    <span>{optionText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border/60 space-y-2">
        <p className="text-xs text-center text-muted-foreground">
          Đã trả lời {answeredCount}/{questions.length} câu
        </p>
        <Button onClick={handleSubmit} disabled={submitting || answeredCount === 0} className="w-full text-sm font-bold">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Nộp bài"}
        </Button>
      </div>
    </div>
  );
}
