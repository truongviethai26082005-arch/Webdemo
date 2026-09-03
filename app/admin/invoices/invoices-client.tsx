"use client";

import { useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  QrCode,
  CheckCircle2,
  Clock,
  Trash2,
  DollarSign,
  Phone,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { VietQRModal } from "@/components/invoices/vietqr-modal";
import { markInvoiceAsPaid, deleteInvoice } from "@/lib/actions/invoices";

interface InvoicesClientProps {
  initialInvoices: any[];
  students: any[];
}

export function InvoicesClient({ initialInvoices, students }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vietQrData, setVietQrData] = useState<any | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.student?.parent_phone?.includes(searchTerm) ||
      inv.class?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCollected = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const totalPending = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  async function handleMarkPaid(id: string) {
    if (confirm("Xác nhận đã nhận đủ tiền cho hóa đơn này? Hệ thống sẽ tự động cộng số buổi tương ứng vào ví của học sinh.")) {
      const res = await markInvoiceAsPaid(id);
      if (res.error) {
        alert(res.error);
      } else {
        setInvoices(
          invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: "paid", paid_at: new Date().toISOString() }
              : inv
          )
        );
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
      const res = await deleteInvoice(id);
      if (res.error) alert(res.error);
      else setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  }

  function handleOpenVietQR(inv: any) {
    setVietQrData({
      id: inv.id,
      studentName: inv.student?.full_name || "Học sinh",
      studentCode: inv.student?.student_code || inv.student?.code || "",
      className: inv.class?.name || "Lớp học",
      amount: Number(inv.amount) || 0,
      sessionsAdded: inv.sessions_added,
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border bg-card shadow-sm p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Tổng tiền đã thu (Đã thanh toán)
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatVND(totalCollected)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="border bg-card shadow-sm p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Tiền đang chờ thu (Chưa thanh toán)
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {formatVND(totalPending)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo học sinh, SĐT, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">🟡 Chờ thanh toán (Pending)</option>
            <option value="paid">🟢 Đã thanh toán (Paid)</option>
          </select>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm shrink-0">
          <Plus className="w-4 h-4" />
          Tạo Phiếu Thu Mới (VietQR)
        </Button>
      </div>

      {/* Invoices Data Table */}
      <Card className="border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Mã đơn & Ngày tạo</TableHead>
              <TableHead>Học sinh & SĐT</TableHead>
              <TableHead>Lớp & Số buổi nạp</TableHead>
              <TableHead>Số tiền cần thu</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">Chưa có phiếu thu nào</p>
                  <p className="text-xs mt-0.5">Bấm "Tạo Phiếu Thu Mới" để thu học phí hoặc sinh mã VietQR.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => {
                const isPaid = inv.status === "paid";
                return (
                  <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          HD#{inv.id.substring(0, 8).toUpperCase()}
                        </span>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {new Date(inv.created_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-bold text-sm text-foreground">
                          {inv.student?.full_name || "Học sinh"}
                        </span>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-primary" />
                          {inv.student?.parent_phone || "—"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-foreground">
                          {inv.class?.name || "Lớp"}
                        </span>
                        <p className="text-xs text-primary font-bold mt-0.5">
                          + {inv.sessions_added} buổi học
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-black text-sm font-mono text-foreground">
                        {formatVND(inv.amount)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {isPaid ? (
                        <div>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-bold">
                            Đã thanh toán
                          </Badge>
                          {inv.paid_at && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {new Date(inv.paid_at).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] font-bold">
                          Chờ thanh toán
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenVietQR(inv)}
                          className="h-8 gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Xem VietQR
                        </Button>

                        {!isPaid && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(inv.id)}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã thu tiền
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(inv.id)}
                          title="Xóa hóa đơn"
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
      <CreateInvoiceDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        students={students}
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
