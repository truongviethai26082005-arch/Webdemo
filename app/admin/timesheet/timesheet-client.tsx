"use client";

import { useState, useTransition } from "react";
import { CalendarCheck, QrCode, AlertTriangle, Loader2, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatVND } from "@/lib/utils/vietqr";
import { getTeacherTimesheet, TeacherTimesheetRow } from "@/lib/actions/teachers";

interface TimesheetClientProps {
  initialData: TeacherTimesheetRow[];
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function TimesheetClient({ initialData }: TimesheetClientProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<TeacherTimesheetRow[]>(initialData);
  const [selected, setSelected] = useState<TeacherTimesheetRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function refetch(nextMonth: number, nextYear: number) {
    startTransition(async () => {
      const result = await getTeacherTimesheet(nextMonth, nextYear);
      setData(result);
    });
  }

  function handleMonthChange(value: string) {
    const m = Number(value);
    setMonth(m);
    refetch(m, year);
  }

  function handleYearChange(value: string) {
    const y = Number(value);
    setYear(y);
    refetch(month, y);
  }

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b border-border/80 bg-muted/20 flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Chấm công theo tháng</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cột "Đã quét QR" là bằng chứng đối chiếu — không tự động thay đổi cách tính lương
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(month)} onValueChange={handleMonthChange}>
              <SelectTrigger className="h-9 w-28 text-xs rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={String(m)}>Tháng {m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={handleYearChange}>
              <SelectTrigger className="h-9 w-24 text-xs rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Giáo viên</TableHead>
              <TableHead className="text-center">Số buổi hoàn thành</TableHead>
              <TableHead className="text-right">Tổng lương</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Chưa có giáo viên nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.teacher.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="font-bold text-sm text-foreground">{row.teacher.full_name}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-primary" />
                      {row.teacher.phone || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs font-bold">{row.completedSessionsCount} buổi</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVND(row.totalSalary)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(row)}
                      className="h-8 gap-1 text-xs rounded-xl"
                    >
                      Xem buổi dạy
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CalendarCheck className="w-4.5 h-4.5 text-primary" />
              Chi tiết buổi dạy: {selected?.teacher.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tháng {month}/{year} — buổi "Hoàn thành" nhưng 0 học sinh quét QR có thể cần Admin kiểm tra lại
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Điểm danh chính thức</TableHead>
                  <TableHead className="text-center">Đã quét QR</TableHead>
                  <TableHead className="text-right">Lương buổi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selected?.sessions || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-xs">
                      Không có buổi dạy nào trong tháng này
                    </TableCell>
                  </TableRow>
                ) : (
                  selected!.sessions.map((s) => {
                    const isSuspicious = s.status === "completed" && s.qrCheckinCount === 0;
                    return (
                      <TableRow key={s.id} className={isSuspicious ? "bg-amber-500/5" : ""}>
                        <TableCell className="text-xs font-mono">
                          {new Date(s.sessionDate).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{s.className}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              s.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : s.status === "cancelled"
                                ? "bg-destructive/10 text-destructive border-destructive/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {s.status === "completed" ? "Hoàn thành" : s.status === "cancelled" ? "Đã hủy" : "Chưa diễn ra"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono">{s.officialAttendanceCount}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-mono font-bold">{s.qrCheckinCount}</span>
                            {isSuspicious && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-bold">
                          {formatVND(s.salary)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
