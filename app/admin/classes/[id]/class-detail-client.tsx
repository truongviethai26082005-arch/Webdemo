"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  UserPlus,
  CalendarCheck,
  Receipt,
  Phone,
  Trash2,
  ArrowLeft,
  DollarSign,
  School,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import { AddStudentDialog } from "@/components/classes/add-student-dialog";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import { VietQRModal } from "@/components/invoices/vietqr-modal";
import { removeStudentFromClass } from "@/lib/actions/students";

interface ClassDetailClientProps {
  classData: any;
  allStudents: any[];
  teachers: any[];
}

export function ClassDetailClient({
  classData,
  allStudents,
  teachers,
}: ClassDetailClientProps) {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [selectedStudentForInvoice, setSelectedStudentForInvoice] = useState<string | undefined>();
  const [vietQrData, setVietQrData] = useState<any | null>(null);

  const enrollments = classData.enrollments || [];
  const alreadyEnrolledStudentIds = enrollments.map((e: any) => e.student?.id);

  async function handleRemove(enrollmentId: string, studentName: string) {
    if (confirm(`Bạn có chắc muốn xóa học sinh "${studentName}" khỏi lớp này?`)) {
      const res = await removeStudentFromClass(enrollmentId, classData.id);
      if (res.error) alert(res.error);
    }
  }

  function handleQuickInvoice(studentId: string) {
    setSelectedStudentForInvoice(studentId);
    setIsInvoiceOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách Lớp học
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSessionOpen(true)}
            className="gap-2 text-xs"
          >
            <CalendarCheck className="w-4 h-4 text-primary" />
            Tạo Buổi học Lớp này
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddStudentOpen(true)}
            className="gap-2 text-xs shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            + Thêm Học Sinh Vào Lớp
          </Button>
        </div>
      </div>

      {/* Class KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border bg-card shadow-sm p-4">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sĩ số lớp</span>
          <p className="text-2xl font-black text-foreground mt-1">{enrollments.length} <span className="text-sm font-normal text-muted-foreground">học sinh</span></p>
        </Card>
        <Card className="border bg-card shadow-sm p-4">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Học phí mỗi buổi</span>
          <p className="text-2xl font-black text-primary mt-1 font-mono">{formatVND(classData.fee_per_session)}</p>
        </Card>
        <Card className="border bg-card shadow-sm p-4">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Giáo viên</span>
          <p className="text-lg font-bold text-foreground mt-1 truncate">{classData.teacher?.full_name || "Chưa phân công"}</p>
        </Card>
      </div>

      {/* Enrolled Students Table */}
      <Card className="border bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Danh sách Học sinh trong lớp</CardTitle>
              <CardDescription className="text-xs">
                Theo dõi số buổi học còn lại của từng học sinh trong lớp này
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">
              {enrollments.length} học sinh
            </Badge>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Học sinh</TableHead>
              <TableHead>Phụ huynh & SĐT</TableHead>
              <TableHead className="text-center">Số buổi còn lại</TableHead>
              <TableHead>Ngày vào lớp</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">Chưa có học sinh nào trong lớp này</p>
                  <p className="text-xs mt-0.5">Bấm "+ Thêm Học Sinh Vào Lớp" để bắt đầu ghi danh.</p>
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enr: any) => {
                const s = enr.student;
                const isZeroOrNegative = enr.balance_sessions <= 0;
                const isLow = enr.balance_sessions <= 2 && enr.balance_sessions > 0;

                return (
                  <TableRow key={enr.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-bold text-sm text-foreground">{s.full_name}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{s.parent_name || "Phụ huynh"}</span>
                        <p className="text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-primary" />
                          {s.parent_phone}
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
                        {enr.balance_sessions} buổi
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {enr.joined_at ? new Date(enr.joined_at).toLocaleDateString("vi-VN") : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickInvoice(s.id)}
                          className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Thu tiền
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(enr.id, s.full_name)}
                          title="Xóa khỏi lớp"
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

      {/* Dialogs */}
      <AddStudentDialog
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        classId={classData.id}
        className={classData.name}
        allStudents={allStudents}
        alreadyEnrolledStudentIds={alreadyEnrolledStudentIds}
      />

      <CreateSessionDialog
        isOpen={isSessionOpen}
        onClose={() => setIsSessionOpen(false)}
        classes={[classData]}
        teachers={teachers}
        defaultClassId={classData.id}
      />

      <CreateInvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        students={allStudents}
        defaultStudentId={selectedStudentForInvoice}
        defaultClassId={classData.id}
        onCreated={(inv) => setVietQrData(inv)}
      />

      <VietQRModal
        isOpen={Boolean(vietQrData)}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />
    </div>
  );
}
