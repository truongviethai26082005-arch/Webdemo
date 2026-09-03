"use client";

import { useState } from "react";
import {
  BookOpen,
  Users,
  Search,
  Phone,
  Calendar,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";

interface TeacherClassesClientProps {
  initialClasses: any[];
  teacherName: string;
}

export function TeacherClassesClient({ initialClasses, teacherName }: TeacherClassesClientProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClasses.length > 0 ? initialClasses[0].id : ""
  );
  const [searchTerm, setSearchTerm] = useState("");

  const currentClass = initialClasses.find((c) => c.id === selectedClassId) || initialClasses[0];

  const students = currentClass?.enrollments || [];
  const filteredStudents = students.filter((e: any) =>
    e.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.student?.parent_phone && e.student.parent_phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Lớp Học Của Tôi</h3>
            <p className="text-xs text-muted-foreground">
              Quản lý danh sách học sinh và sĩ số các lớp do GV. <span className="font-semibold text-foreground">{teacherName}</span> phụ trách
            </p>
          </div>
        </div>

        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold py-1 px-3 rounded-xl">
          Đang phụ trách: {initialClasses.length} lớp học
        </Badge>
      </div>

      {initialClasses.length === 0 ? (
        <Card className="p-12 text-center border border-border/80 rounded-2xl shadow-soft">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-bold text-foreground">Bạn chưa được phân công lớp học nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Vui lòng liên hệ Quản trị viên trung tâm để được xếp lớp phụ trách giảng dạy.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Class Selector Cards (4/12) */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Danh sách lớp ({initialClasses.length})
            </p>

            {initialClasses.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              const studentCount = cls.enrollments?.length || 0;
              return (
                <div
                  key={cls.id}
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    setSearchTerm("");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                      : "bg-card border-border/80 hover:border-primary/50 text-foreground shadow-soft"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm tracking-tight">{cls.name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {studentCount} HS
                    </span>
                  </div>

                  <div
                    className={`text-xs mt-2 space-y-1 ${
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    <p className="flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5" />
                      Phòng: {cls.room || "Chưa xếp phòng"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Học phí: {formatVND(cls.fee_per_session)} / buổi
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Students in Selected Class (8/12) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
              <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>Học sinh Lớp: {currentClass?.name}</span>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                        {students.length} học viên
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Danh sách học viên và số buổi học hiện tại trong lớp
                    </CardDescription>
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Tìm tên học sinh, SĐT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </CardHeader>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Học sinh</TableHead>
                    <TableHead>Liên hệ Phụ huynh</TableHead>
                    <TableHead className="text-center">Số buổi còn lại</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-36 text-center text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-bold text-sm text-foreground">Không có học sinh nào</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {searchTerm ? "Không khớp với từ khóa tìm kiếm" : "Lớp này hiện chưa có học sinh được xếp vào"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((enrollment: any) => {
                      const student = enrollment.student;
                      const balance = enrollment.balance_sessions ?? 0;
                      const isLowBalance = balance <= 2;
                      return (
                        <TableRow key={enrollment.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
                                {student?.full_name?.charAt(0) || "H"}
                              </div>
                              <span className="font-bold text-xs text-foreground">
                                {student?.full_name || "Chưa có tên"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              <p className="font-semibold text-foreground/90">
                                {student?.parent_name || "Phụ huynh"}
                              </p>
                              <a
                                href={`tel:${student?.parent_phone}`}
                                className="text-muted-foreground hover:text-primary flex items-center gap-1 font-mono text-[11px]"
                              >
                                <Phone className="w-3 h-3 text-primary" />
                                {student?.parent_phone || "—"}
                              </a>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <span
                              className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg inline-block ${
                                isLowBalance
                                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {balance} buổi
                            </span>
                          </TableCell>

                          <TableCell className="text-center">
                            {isLowBalance ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                                Sắp hết buổi
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                                Bình thường
                              </Badge>
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
        </div>
      )}
    </div>
  );
}
