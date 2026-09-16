"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Save,
  Phone,
  Clock,
  Sparkles,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceStatus } from "@/types/database";
import { saveAttendanceSheet, AttendanceSheetItem } from "@/lib/actions/attendance";

interface AttendanceSheetClientProps {
  sessionId: string;
  session: any;
  initialRoster: AttendanceSheetItem[];
}

export function AttendanceSheetClient({
  sessionId,
  session,
  initialRoster,
}: AttendanceSheetClientProps) {
  const router = useRouter();
  const [roster, setRoster] = useState<AttendanceSheetItem[]>(initialRoster);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thống kê đếm trạng thái hiện tại
  const presentCount = roster.filter((r) => r.status === "present").length;
  const absentExcusedCount = roster.filter((r) => r.status === "absent_excused").length;
  const absentUnexcusedCount = roster.filter((r) => r.status === "absent_unexcused").length;

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setRoster((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, status } : item
      )
    );
    setSaveSuccess(false);
  }

  function updateNote(studentId: string, note: string) {
    setRoster((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, note } : item
      )
    );
    setSaveSuccess(false);
  }

  function markAllPresent() {
    setRoster((prev) => prev.map((item) => ({ ...item, status: "present" })));
    setSaveSuccess(false);
  }

  function markAllAbsentExcused() {
    setRoster((prev) => prev.map((item) => ({ ...item, status: "absent_excused" })));
    setSaveSuccess(false);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    const items = roster.map((r) => ({
      student_id: r.student_id,
      status: r.status,
      note: r.note,
    }));

    const result = await saveAttendanceSheet(sessionId, items);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/teacher/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Lịch dạy
        </Link>

        {/* Attendance Summary Counter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt: {presentCount}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Nghỉ có phép: {absentExcusedCount}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3.5 h-3.5" /> Nghỉ không phép: {absentUnexcusedCount}
          </span>
        </div>
      </div>

      {/* Control Actions & Bulk Tool Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={markAllPresent}
            className="text-xs gap-1.5 h-9 bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            Đánh dấu Có mặt tất cả (1 chạm)
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={markAllAbsentExcused}
            className="text-xs text-muted-foreground hover:text-foreground h-9"
          >
            Nghỉ có phép tất cả
          </Button>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || roster.length === 0}
          className="gap-2 text-xs font-bold shadow-md h-9 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Đang lưu điểm danh...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Lưu Bảng Điểm Danh & Hoàn Thành
            </>
          )}
        </Button>
      </div>

      {/* Success / Error Messages */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu bảng điểm danh thành công! Hệ thống đã tự động tính toán lại số buổi học của từng em.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Full-width Desktop Attendance Data Sheet */}
      <Card className="border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[280px]">Học sinh & SĐT</TableHead>
              <TableHead className="w-[140px] text-center">Số buổi còn lại</TableHead>
              <TableHead className="w-[420px] text-center">Trạng thái Điểm danh</TableHead>
              <TableHead>Ghi chú bài học / Nhận xét</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">Chưa có học sinh nào trong lớp học này</p>
                  <p className="text-xs mt-0.5">Admin cần thêm học sinh vào lớp trước khi điểm danh.</p>
                </TableCell>
              </TableRow>
            ) : (
              roster.map((item, index) => {
                const isPresent = item.status === "present";
                const isAbsentExcused = item.status === "absent_excused";
                const isAbsentUnexcused = item.status === "absent_unexcused";

                const isZeroOrNegative = item.balance_sessions <= 0;
                const isLow = item.balance_sessions <= 2 && item.balance_sessions > 0;

                return (
                  <TableRow key={item.student_id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-bold text-sm text-foreground">{item.student_name}</span>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-primary" />
                          {item.parent_phone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                          isZeroOrNegative
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : isLow
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {item.balance_sessions} buổi
                      </span>
                    </TableCell>

                    {/* 3-State Toggle Group for Desktop */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border gap-1">
                        {/* 1. Có mặt */}
                        <button
                          type="button"
                          onClick={() => updateStatus(item.student_id, "present")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isPresent
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Có mặt
                        </button>

                        {/* 2. Nghỉ có phép */}
                        <button
                          type="button"
                          onClick={() => updateStatus(item.student_id, "absent_excused")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAbsentExcused
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Có phép
                        </button>

                        {/* 3. Nghỉ không phép */}
                        <button
                          type="button"
                          onClick={() => updateStatus(item.student_id, "absent_unexcused")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAbsentUnexcused
                              ? "bg-destructive text-destructive-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Không phép
                        </button>
                      </div>
                    </TableCell>

                    {/* Inline Note Input on each row */}
                    <TableCell>
                      <Input
                        value={item.note || ""}
                        onChange={(e) => updateNote(item.student_id, e.target.value)}
                        placeholder="Ghi chú: bài tập, ý thức, muộn..."
                        className="h-9 text-xs"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Bottom Floating/Fixed Save Bar */}
      {roster.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border shadow-md">
          <span className="text-xs text-muted-foreground">
            Đã điểm danh: <strong className="text-foreground">{presentCount + absentExcusedCount + absentUnexcusedCount}/{roster.length}</strong> học sinh
          </span>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="gap-2 text-xs font-bold h-10 px-6 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Đang lưu điểm danh...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu Bảng Điểm Danh & Hoàn Thành
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
