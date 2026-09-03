"use client";

import { useState } from "react";
import {
  Wallet,
  CalendarCheck,
  Clock,
  TrendingUp,
  DollarSign,
  Printer,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";

interface TeacherEarningsClientProps {
  earningsData: {
    teacher: any;
    salaryPerSession: number;
    month: number;
    year: number;
    completedSessionsCount: number;
    upcomingSessionsCount: number;
    actualEarnings: number;
    projectedEarnings: number;
    sessions: any[];
  } | null;
}

export function TeacherEarningsClient({ earningsData }: TeacherEarningsClientProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "scheduled">("all");

  if (!earningsData) {
    return (
      <Card className="p-12 text-center border border-border/80 rounded-2xl shadow-soft">
        <Wallet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
        <h3 className="text-base font-bold text-foreground">Không tìm thấy thông tin thù lao</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Vui lòng liên hệ quản trị viên để cập nhật mức thù lao mỗi buổi dạy.
        </p>
      </Card>
    );
  }

  const {
    salaryPerSession,
    month,
    year,
    completedSessionsCount,
    upcomingSessionsCount,
    actualEarnings,
    projectedEarnings,
    sessions,
  } = earningsData;

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Thù Lao & Thu Nhập Cá Nhân</h3>
            <p className="text-xs text-muted-foreground">
              Theo dõi số ca giảng dạy hoàn thành và quyết toán thu nhập trong tháng {month}/{year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold py-1 px-3 rounded-xl font-mono">
            Đơn giá: {formatVND(salaryPerSession)} / buổi
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1 text-xs h-9 rounded-xl"
          >
            <Printer className="w-3.5 h-3.5" />
            In phiếu
          </Button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual Earnings */}
        <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Thù Lao Thực Nhận
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              {formatVND(actualEarnings)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Tính trên {completedSessionsCount} ca đã hoàn thành
            </p>
          </CardContent>
        </Card>

        {/* Projected Earnings */}
        <Card className="border border-border/80 bg-gradient-to-br from-blue-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Thu Nhập Dự Tính Cả Tháng
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight font-mono">
              {formatVND(projectedEarnings)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Nếu hoàn tất toàn bộ ca đã lên lịch
            </p>
          </CardContent>
        </Card>

        {/* Completed Sessions */}
        <Card className="border border-border/80 bg-gradient-to-br from-purple-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ca Đã Hoàn Thành
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {completedSessionsCount} <span className="text-sm font-normal text-muted-foreground">buổi</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Đã điểm danh và chốt sổ
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="border border-border/80 bg-gradient-to-br from-amber-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ca Dạy Còn Lại
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {upcomingSessionsCount} <span className="text-sm font-normal text-muted-foreground">buổi</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Lịch dạy dự kiến trong tháng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session History Breakdown */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Chi Tiết Các Ca Dạy Tháng {month}/{year}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Bảng kê từng buổi dạy, lớp học phụ trách và thù lao tương ứng
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="h-8 text-xs rounded-xl"
              >
                Tất cả ({sessions.length})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
                className="h-8 text-xs rounded-xl"
              >
                Đã dạy ({completedSessionsCount})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "scheduled" ? "default" : "outline"}
                onClick={() => setFilterStatus("scheduled")}
                className="h-8 text-xs rounded-xl"
              >
                Sắp tới ({upcomingSessionsCount})
              </Button>
            </div>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Ngày dạy</TableHead>
              <TableHead>Lớp học</TableHead>
              <TableHead>Khung giờ & Phòng</TableHead>
              <TableHead className="text-center">Sĩ số có mặt</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thù lao ca dạy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-foreground">Không có ca dạy nào trong mục này</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Các buổi dạy đã hoàn thành hoặc sắp diễn ra sẽ hiển thị tại đây.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((s: any) => {
                const isCompleted = s.status === "completed";
                return (
                  <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {s.session_date}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-xs text-foreground">
                        {s.class?.name || "Lớp học"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {s.start_time || "18:00"} - {s.end_time || "19:30"} • {s.class?.room || "Phòng chung"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {isCompleted ? (
                        <span className="text-xs font-semibold text-foreground">
                          {s.attendance_count} HS
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {isCompleted ? (
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                          ✓ Đã hoàn thành
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] font-bold">
                          ○ Đã lên lịch
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {isCompleted ? (
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                          +{formatVND(salaryPerSession)}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          (dự tính {formatVND(salaryPerSession)})
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
