"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils/vietqr";
import { TransactionInvoice } from "@/lib/actions/finance";
import { Printer, School, CheckCircle2, X } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: TransactionInvoice | null;
}

export function ReceiptModal({ isOpen, onClose, invoice }: ReceiptModalProps) {
  if (!invoice) return null;

  function handlePrint() {
    window.print();
  }

  const dateFormatted = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleString("vi-VN")
    : new Date(invoice.createdAt).toLocaleString("vi-VN");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card rounded-2xl p-0 overflow-hidden shadow-2xl border border-border/80">
        <div className="p-6 print:p-0 space-y-5 bg-card">
          {/* Header */}
          <div className="text-center pb-4 border-b border-border/70 relative">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto mb-2">
              <School className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">
              Biên Lai Thu Học Phí
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trung tâm Bồi dưỡng Văn hóa & Luyện thi EduCenter
            </p>
            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ĐÃ HOÀN TẤT THANH TOÁN
            </div>
          </div>

          {/* Receipt Details Box */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-xl border border-border/60 font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px]">MÃ PHIẾU THU:</span>
                <span className="font-bold text-foreground text-xs">{invoice.code}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px]">NGÀY THU TIỀN:</span>
                <span className="font-bold text-foreground text-xs">{dateFormatted}</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-card">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ và tên học sinh:</span>
                <span className="font-bold text-foreground text-sm">{invoice.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại phụ huynh:</span>
                <span className="font-mono text-foreground">{invoice.parentPhone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lớp học đăng ký:</span>
                <span className="font-bold text-foreground">{invoice.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số buổi học nạp thêm:</span>
                <span className="font-bold text-primary font-mono text-sm">+{invoice.sessionsAdded} buổi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hình thức thanh toán:</span>
                <span className="font-semibold text-foreground">
                  {invoice.paymentMethod === "cash" ? "💵 Tiền mặt" : "💳 Chuyển khoản VietQR"}
                </span>
              </div>
              {invoice.note && (
                <div className="flex justify-between pt-1 border-t border-border/50 text-[11px]">
                  <span className="text-muted-foreground">Ghi chú:</span>
                  <span className="italic text-foreground">{invoice.note}</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Tổng tiền đã thu:
                </span>
                <span className="text-xs text-muted-foreground">Đã cộng đủ số buổi vào ví học sinh</span>
              </div>
              <span className="text-xl font-black text-primary font-mono tracking-tight">
                {formatVND(invoice.amount)}
              </span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-center">
              <div>
                <span className="font-bold text-foreground block">Người Nộp Tiền</span>
                <span className="text-[10px] text-muted-foreground italic">(Ký, họ tên)</span>
                <div className="h-14"></div>
                <span className="text-xs text-muted-foreground font-medium">{invoice.studentName}</span>
              </div>
              <div>
                <span className="font-bold text-foreground block">Người Thu Tiền</span>
                <span className="text-[10px] text-muted-foreground italic">(Ký, đóng dấu)</span>
                <div className="h-14"></div>
                <span className="text-xs text-muted-foreground font-medium">Bộ phận Tài chính EduCenter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted/40 border-t border-border/80 flex items-center justify-end gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl h-9 px-4">
            Đóng
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold gap-1.5 rounded-xl h-9 px-5 bg-primary text-primary-foreground shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            In Biên Lai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
