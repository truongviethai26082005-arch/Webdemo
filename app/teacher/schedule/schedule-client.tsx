"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TeacherScheduleClientProps {
  sessions: any[];
}

export function TeacherScheduleClient({ sessions }: TeacherScheduleClientProps) {
  const today = new Date().toISOString().split("T")[0];

  const todaySessions = sessions.filter((s) => s.session_date === today);
  const otherSessions = sessions.filter((s) => s.session_date !== today);

  return (
    <div className="space-y-6">
      {/* Today's Priority Sessions Card */}
      <Card className="border border-primary/30 bg-primary/5 shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-primary/20 bg-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Buổi học Hôm Nay ({new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })})
                </CardTitle>
                <CardDescription className="text-xs">
                  Vào điểm danh các lớp học đang diễn ra trong ngày
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="text-xs font-bold">
              {todaySessions.length} buổi học hôm nay
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-card">
          {todaySessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-sm text-foreground">Hôm nay bạn không có lịch dạy nào!</p>
              <p className="text-xs text-muted-foreground mt-1">Hãy chuẩn bị giáo án cho các buổi học tiếp theo.</p>
            </div>
          ) : (
            <div className="divide-y">
              {todaySessions.map((session) => {
                const isCompleted = session.status === "completed";
                return (
                  <div
                    key={session.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">
                          {session.class?.name || "Lớp học"}
                        </span>
                        {isCompleted ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                            Đã điểm danh xong ({session.attendance_count} HS)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold animate-pulse">
                            Cần điểm danh
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {session.start_time || "18:00"} - {session.end_time || "19:30"}
                        </span>
                        <span>•</span>
                        <span>Phòng: <strong className="text-foreground">{session.class?.room || "Chung"}</strong></span>
                        {session.note && (
                          <>
                            <span>•</span>
                            <span className="italic">"{session.note}"</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link href={`/teacher/attendance/${session.id}`}>
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        className="gap-2 text-xs font-semibold shadow-sm h-10 px-5"
                      >
                        {isCompleted ? "Xem / Sửa điểm danh" : "Vào điểm danh ngay"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other / Upcoming Sessions Table */}
      <Card className="border bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-base font-bold">Tất cả Lịch sử & Buổi học khác</CardTitle>
          <CardDescription className="text-xs">
            Danh sách toàn bộ các buổi học của các lớp bạn phụ trách
          </CardDescription>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Ngày học</TableHead>
              <TableHead>Giờ học</TableHead>
              <TableHead>Lớp học & Phòng</TableHead>
              <TableHead>Nội dung bài học</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {otherSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">Chưa có lịch dạy nào khác</p>
                </TableCell>
              </TableRow>
            ) : (
              otherSessions.map((session) => {
                const isCompleted = session.status === "completed";
                return (
                  <TableRow key={session.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <span className="font-bold text-sm text-foreground font-mono">
                        {new Date(session.session_date).toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {session.start_time || "18:00"} - {session.end_time || "19:30"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-bold text-sm text-foreground">
                          {session.class?.name || "Lớp học"}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Phòng: {session.class?.room || "Phòng chung"}
                        </p>
                      </div>
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
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                          Chưa điểm danh
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/teacher/attendance/${session.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          {isCompleted ? "Xem điểm danh" : "Điểm danh"}
                        </Button>
                      </Link>
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
