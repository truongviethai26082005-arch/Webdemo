"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import { deleteClassSession } from "@/lib/actions/sessions";

interface AttendanceAdminClientProps {
  initialSessions: any[];
  classes: any[];
  teachers: any[];
}

export function AttendanceAdminClient({
  initialSessions,
  classes,
  teachers,
}: AttendanceAdminClientProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    const matchClass = classFilter === "all" || s.class_id === classFilter;
    const matchDate = !dateFilter || s.session_date === dateFilter;
    return matchClass && matchDate;
  });

  async function handleDelete(id: string) {
    if (confirm("Bạn có chắc muốn xóa buổi học này?")) {
      const res = await deleteClassSession(id);
      if (res.error) alert(res.error);
      else setSessions(sessions.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 font-mono w-40"
            />
            {dateFilter && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDateFilter("")}
                className="text-xs h-9"
              >
                Xóa ngày
              </Button>
            )}
          </div>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-sm shrink-0">
          <Plus className="w-4 h-4" />
          Tạo Buổi Học Mới
        </Button>
      </div>

      {/* Sessions Data Table */}
      <Card className="border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Ngày & Giờ học</TableHead>
              <TableHead>Lớp học & Phòng</TableHead>
              <TableHead>Giáo viên đứng lớp</TableHead>
              <TableHead>Nội dung / Ghi chú</TableHead>
              <TableHead className="text-center">Trạng thái điểm danh</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">Chưa có buổi học nào</p>
                  <p className="text-xs mt-0.5">Bấm "Tạo Buổi Học Mới" để lên lịch giảng dạy.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => {
                const isCompleted = session.status === "completed";
                return (
                  <TableRow key={session.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div>
                        <span className="font-bold text-sm text-foreground font-mono">
                          {new Date(session.session_date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-primary" />
                          {session.start_time || "18:00"} - {session.end_time || "19:30"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-bold text-sm text-foreground">
                          {session.class?.name || "Lớp học"}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Phòng: <span className="font-medium text-foreground">{session.class?.room || "Phòng chung"}</span>
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold text-foreground">
                        {session.teacher?.full_name || "Chưa phân công"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {session.note || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {isCompleted ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                          Đã điểm danh ({session.attendance_count} HS)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                          Chờ điểm danh
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/teacher/attendance/${session.id}`}>
                          <Button size="sm" variant={isCompleted ? "outline" : "default"} className="h-8 text-xs gap-1">
                            {isCompleted ? "Xem điểm danh" : "Điểm danh ngay"}
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(session.id)}
                          title="Xóa buổi học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateSessionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        classes={classes}
        teachers={teachers}
      />
    </div>
  );
}
