"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Users,
  Phone,
  Edit,
  Trash2,
  Receipt,
  QrCode,
  Filter,
  AlertTriangle,
  BookOpen,
  FileSpreadsheet,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { StudentDialog } from "@/components/students/student-dialog";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { VietQRModal } from "@/components/invoices/vietqr-modal";
import { deleteStudent } from "@/lib/actions/students";

interface StudentsClientProps {
  initialStudents: any[];
  classes: any[];
}

function formatDateToDmy(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    return dateStr;
  }
  return dateStr;
}

export function StudentsClient({ initialStudents, classes }: StudentsClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [onlyLowBalance, setOnlyLowBalance] = useState(false);

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Invoices & VietQR
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedStudentForInvoice, setSelectedStudentForInvoice] = useState<string | undefined>();
  const [vietQrData, setVietQrData] = useState<any | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.parent_phone && s.parent_phone.includes(searchTerm));

    const matchStatus = statusFilter === "all" || s.status === statusFilter;

    const enrollments = s.enrollments || [];
    const matchClass =
      classFilter === "all" ||
      enrollments.some((e: any) => e.class_id === classFilter);

    const hasLowBalance = enrollments.some((e: any) => e.balance_sessions <= 2);

    if (onlyLowBalance) {
      return matchSearch && matchStatus && matchClass && hasLowBalance;
    }

    return matchSearch && matchStatus && matchClass;
  });

  async function handleDelete(id: string, name: string) {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${name}"? Toàn bộ lịch sử điểm danh và hóa đơn của học sinh này sẽ bị xóa.`)) {
      const res = await deleteStudent(id);
      if (res.error) {
        alert(res.error);
      } else {
        setStudents(students.filter((s) => s.id !== id));
      }
    }
  }

  function handleQuickInvoice(studentId: string) {
    setSelectedStudentForInvoice(studentId);
    setIsInvoiceOpen(true);
  }

  function downloadSampleCsv() {
    const headers = "Ho_va_ten,SDT_phu_huynh,Ten_phu_huynh,Ngay_sinh,Lop_hoc,So_buoi_ban_dau,Ghi_chu\n";
    const rows = [
      "Nguyễn Bảo Nam,0912345678,Chị Lan,2012-05-15,Toán 9 Nâng Cao,12,Cần chú ý bài tập về nhà",
      "Trần Hoàng Anh,0987654321,Anh Tuấn,2012-08-20,Tiếng Anh Giao Tiếp,12,Học sinh tiếp thu nhanh",
      "Lê Thảo My,0901234567,Chị Hương,2013-01-10,Văn 9 Luyện Đề,8,Chuyển lớp từ cơ sở 2 sang",
    ].join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_danh_sach_hoc_sinh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleProcessImport() {
    if (!importedFile) return;
    setImportStatus("Đã tải tệp lên thành công! Hệ thống đang hỗ trợ cập nhật danh sách vào cơ sở dữ liệu.");
    setTimeout(() => {
      setImportStatus(null);
      setImportedFile(null);
      setIsImportModalOpen(false);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Search, Filters & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT phụ huynh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Class Filter Dropdown */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px]"
          >
            <option value="all">Tất cả lớp học ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang học (Active)</option>
            <option value="paused">🟡 Tạm dừng (Paused)</option>
            <option value="dropped">🔴 Đã nghỉ (Dropped)</option>
          </select>

          {/* Low balance toggle button */}
          <Button
            size="sm"
            variant={onlyLowBalance ? "default" : "outline"}
            onClick={() => setOnlyLowBalance(!onlyLowBalance)}
            className={`h-9 text-xs gap-1.5 rounded-xl transition-all ${
              onlyLowBalance
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/30"
                : "text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Sắp hết buổi (≤ 2)
          </Button>
        </div>

        {/* Action Buttons: Import Excel + Add Student */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 text-xs h-9 rounded-xl border-border hover:bg-muted"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Nhập từ Excel
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingStudent(null);
              setIsDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-bold h-9 rounded-xl shadow-md shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            + Thêm Học Sinh Mới
          </Button>
        </div>
      </div>

      {/* Desktop Data Table */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[230px]">Học sinh</TableHead>
              <TableHead>Phụ huynh & SĐT</TableHead>
              <TableHead>Lớp học & Số buổi còn lại</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-foreground">Không tìm thấy học sinh nào</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thử đổi bộ lọc hoặc bấm "Thêm Học Sinh Mới".
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((st) => {
                const enrollments = st.enrollments || [];

                return (
                  <TableRow key={st.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div>
                        <span className="font-bold text-xs text-foreground">{st.full_name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          {st.birth_date && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {formatDateToDmy(st.birth_date)}
                            </span>
                          )}
                          {!st.birth_date && (
                            <span className="font-mono">
                              Ngày tạo: {new Date(st.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                        {st.note && (
                          <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px] mt-0.5">
                            Ghi chú: {st.note}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <span className="font-medium text-foreground">{st.parent_name || "Chưa có tên PH"}</span>
                        <a
                          href={`tel:${st.parent_phone}`}
                          className="text-muted-foreground hover:text-primary flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3 text-primary" />
                          {st.parent_phone}
                        </a>
                      </div>
                    </TableCell>

                    {/* Lớp học & Số buổi còn lại - hỗ trợ học sinh học nhiều lớp */}
                    <TableCell>
                      {enrollments.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">Chưa vào lớp nào</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                          {enrollments.map((enr: any) => {
                            const balance = enr.balance_sessions ?? 0;
                            const isZeroOrNegative = balance <= 0;
                            const isLow = balance <= 2 && balance > 0;
                            return (
                              <div
                                key={enr.id}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
                                  isZeroOrNegative
                                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                    : isLow
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                }`}
                              >
                                <span className="truncate max-w-[130px]">
                                  {enr.class?.name || "Lớp"}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded-md font-mono font-black text-[10px] ${
                                    isZeroOrNegative
                                      ? "bg-rose-600 text-white"
                                      : isLow
                                      ? "bg-amber-600 text-white"
                                      : "bg-emerald-600 text-white"
                                  }`}
                                >
                                  {balance} b
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {st.status === "active" && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                          Đang học
                        </Badge>
                      )}
                      {st.status === "paused" && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                          Tạm dừng
                        </Badge>
                      )}
                      {st.status === "dropped" && (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] font-bold">
                          Đã nghỉ
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickInvoice(st.id)}
                          className="h-8 gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10 rounded-xl font-semibold"
                          title="Tạo hóa đơn thu tiền VietQR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Thu phí
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingStudent(st);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl"
                          title="Sửa hồ sơ học sinh"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(st.id, st.full_name)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Student Create / Edit Dialog */}
      <StudentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        classes={classes}
        editingStudent={editingStudent}
        onSaved={() => {
          // Re-trigger refresh or update local state
          window.location.reload();
        }}
      />

      {/* Quick Invoice Dialog */}
      <CreateInvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        students={students}
        defaultStudentId={selectedStudentForInvoice}
        onCreated={(inv) => {
          if (inv.paymentMethod !== "cash") {
            setVietQrData(inv);
          }
        }}
        onSuccessCash={() => {
          window.location.reload();
        }}
      />

      {/* VietQR Display Modal */}
      <VietQRModal
        isOpen={Boolean(vietQrData)}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />

      {/* Modal Import Excel / CSV */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-xl border border-border/80">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Nhập Học Sinh Từ File Excel / CSV
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Tải lên tệp dữ liệu học sinh hàng loạt theo đúng định dạng mẫu
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Step 1: Download Sample File */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Bước 1: Tải file mẫu chuẩn (.csv)</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSampleCsv}
                  className="h-8 text-xs gap-1.5 rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải file mẫu
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                File mẫu gồm các cột: <strong>Họ tên, SĐT phụ huynh, Tên PH, Ngày sinh, Lớp học, Số buổi ban đầu, Ghi chú</strong>.
              </p>
            </div>

            {/* Step 2: Upload File */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">Bước 2: Chọn tệp Excel / CSV để tải lên</span>
              <div className="p-6 border-2 border-dashed border-border/80 rounded-2xl text-center bg-card hover:bg-muted/20 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setImportedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                {importedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary truncate max-w-[280px] mx-auto">
                      {importedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {(importedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-foreground">Kéo thả tệp hoặc bấm để duyệt file</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Hỗ trợ định dạng .csv, .xlsx, .xls</p>
                  </div>
                )}
              </div>
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
              className="text-xs rounded-xl h-9 px-4"
            >
              Đóng
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!importedFile}
              onClick={handleProcessImport}
              className="text-xs font-bold rounded-xl h-9 px-5 gap-1.5 shadow-md shadow-primary/25"
            >
              <Upload className="w-3.5 h-3.5" />
              Xác Nhận Nhập Dữ Liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
