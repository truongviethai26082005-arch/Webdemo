"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils/vietqr";
import {
  StudentLedgerItem,
  LedgerTimelineEntry,
  getStudentLedgerHistory,
} from "@/lib/actions/finance";
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck,
  Receipt,
  Clock,
  Phone,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface StudentLedgerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentLedgerItem | null;
  onTopUp?: (student: StudentLedgerItem) => void;
}

export function StudentLedgerSheet({
  isOpen,
  onClose,
  student,
  onTopUp,
}: StudentLedgerSheetProps) {
  const [timeline, setTimeline] = useState<LedgerTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setLoading(true);
      getStudentLedgerHistory(student.id)
        .then((res) => {
          setTimeline(res || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, student]);

  if (!student) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden bg-card">
        {/* Header */}
        <div className="p-5 border-b border-border/70 bg-gradient-to-r from-primary/10 to-transparent">
          <SheetHeader className="text-left space-y-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-foreground">
                    Sổ Cái & Sao Kê Học Viên
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Nhật ký nạp học phí và các buổi học đã bị trừ điểm danh
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Student Quick Bio Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-primary" />
                  {student.phone || "Chưa có SĐT"}
                </p>
              </div>

              {/* Total Balance Badge */}
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Tổng số dư ví:
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs font-black font-mono px-2.5 py-0.5 ${
                    student.totalBalanceSessions <= 0
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                      : student.totalBalanceSessions <= 2
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {student.totalBalanceSessions} buổi
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground text-[11px]">Lũy kế đã nộp:</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatVND(student.totalPaid)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">Công nợ hiện tại:</span>
                <p className={`font-mono font-bold ${student.currentDebt > 0 ? "text-rose-600" : "text-foreground"}`}>
                  {formatVND(student.currentDebt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Lịch sử phát sinh giao dịch ({timeline.length})
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-xs font-semibold">Đang tải sao kê sổ cái...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="p-10 text-center bg-muted/20 rounded-2xl border border-border/60 text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm text-foreground">Chưa có giao dịch phát sinh</p>
              <p className="text-xs mt-0.5">Học sinh chưa có phiếu nạp học phí hoặc ca học điểm danh nào.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
              {timeline.map((entry) => {
                const isDeposit = entry.type === "deposit";
                const isPaid = entry.status === "paid";

                return (
                  <div key={entry.id} className="relative group">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-card shadow-xs ${
                        isDeposit
                          ? isPaid
                            ? "border-emerald-500 text-emerald-600"
                            : "border-amber-500 text-amber-600"
                          : "border-blue-500 text-blue-600"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="w-2.5 h-2.5" />
                      ) : (
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      )}
                    </div>

                    {/* Entry Card */}
                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 group-hover:bg-muted/50 transition-colors space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-xs text-foreground">{entry.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Lớp: <span className="font-semibold text-foreground/80">{entry.className}</span>
                          </p>
                        </div>

                        {/* Sessions change */}
                        <div className="text-right shrink-0">
                          <span
                            className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                              entry.sessionsChange > 0
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : entry.sessionsChange < 0
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {entry.sessionsChange > 0
                              ? `+${entry.sessionsChange} buổi`
                              : entry.sessionsChange < 0
                              ? `${entry.sessionsChange} buổi`
                              : "0 buổi"}
                          </span>

                          {entry.amountChange > 0 && (
                            <span className="block font-mono text-[11px] font-bold text-foreground mt-0.5">
                              {formatVND(entry.amountChange)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                        <span>{new Date(entry.date).toLocaleString("vi-VN")}</span>
                        {entry.status && (
                          <Badge variant="outline" className="text-[9px] py-0">
                            {entry.status === "paid"
                              ? "Thành công"
                              : entry.status === "pending"
                              ? "Chờ thu"
                              : entry.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/40 border-t border-border/80 flex items-center justify-between gap-3">
          {onTopUp && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onTopUp(student);
              }}
              className="text-xs font-bold gap-1.5 rounded-xl h-9 px-4 bg-primary text-primary-foreground shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" />
              + Nạp Thêm Buổi Học
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl h-9 px-4 ml-auto">
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
