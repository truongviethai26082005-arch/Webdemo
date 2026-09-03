"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  formatVND,
  removeVietnameseTones,
  POPULAR_BANKS,
  CenterBankSettings,
  DEFAULT_CENTER_BANK_SETTINGS,
} from "@/lib/utils/vietqr";
import { getCenterBankSettings } from "@/lib/actions/settings";
import {
  QrCode,
  Copy,
  Check,
  Building2,
  CreditCard,
  User,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export interface VietQRInvoiceData {
  id: string;
  studentName: string;
  studentCode?: string;
  className: string;
  amount: number;
  sessionsAdded: number;
  paymentMethod?: string;
  note?: string;
}

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: VietQRInvoiceData | null;
  bankSettings?: CenterBankSettings;
}

export function VietQRModal({
  isOpen,
  onClose,
  invoice,
  bankSettings: customSettings,
}: VietQRModalProps) {
  const [settings, setSettings] = useState<CenterBankSettings>(
    customSettings || DEFAULT_CENTER_BANK_SETTINGS
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tự động truy vấn cấu hình ngân hàng từ bảng center_settings trên Supabase
  useEffect(() => {
    if (isOpen) {
      getCenterBankSettings().then((res) => {
        if (res) {
          setSettings(res);
        }
      });
    }
  }, [isOpen]);

  if (!invoice) return null;

  // Cú pháp chuyển khoản ngắn gọn, viết hoa không dấu (Ví dụ: HP HS01 NGUYEN VAN A)
  const studentIdentifier = invoice.studentCode ? `${invoice.studentCode} ` : "";
  const rawMemo = `HP ${studentIdentifier}${invoice.studentName}`;
  const memo = removeVietnameseTones(rawMemo);

  // URL sinh mã VietQR động theo chuẩn img.vietqr.io
  const qrUrl = `https://img.vietqr.io/image/${settings.bank_id}-${settings.bank_account_no}-compact2.png?amount=${Math.round(
    invoice.amount
  )}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(
    settings.bank_account_name
  )}`;

  // Tên hiển thị đầy đủ của ngân hàng
  const bankNameDisplay =
    settings.bank_name ||
    POPULAR_BANKS.find((b) => b.id === settings.bank_id)?.name ||
    (settings.bank_id === "TCB" ? "Techcombank (TCB)" : settings.bank_id);

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  }

  // Mẫu tin nhắn gửi Phụ huynh qua Zalo
  function getParentMessage() {
    if (!invoice) return "";
    return `Kính gửi Phụ huynh em ${invoice.studentName},

Trung tâm xin gửi thông báo nạp học phí lớp ${invoice.className}:
• Số buổi nạp: ${invoice.sessionsAdded} buổi
• Tổng tiền thanh toán: ${formatVND(invoice.amount)}

Thông tin chuyển khoản học phí:
• Ngân hàng: ${bankNameDisplay}
• Số tài khoản: ${settings.bank_account_no}
• Chủ tài khoản: ${settings.bank_account_name}
• Số tiền: ${formatVND(invoice.amount)}
• Nội dung chuyển khoản: ${memo}

(Quý phụ huynh có thể mở ứng dụng ngân hàng và quét mã VietQR đính kèm để chuyển khoản nhanh chóng và chính xác nhất).
Trân trọng cảm ơn Quý phụ huynh!`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-card border-border/80 shadow-2xl rounded-3xl">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/85 p-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2 text-white">
              <QrCode className="w-5 h-5" />
              Mã Chuyển Khoản Học Phí (VietQR)
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-xs">
              Mã QR tự động điền số tiền và nội dung, quét chuyển khoản liên ngân hàng 24/7
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* QR Code Image Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-2xl border border-border/80 shadow-inner">
            <div className="relative p-2 bg-white rounded-xl shadow-md">
              <img
                src={qrUrl}
                alt="VietQR Code"
                className="w-52 h-52 object-contain rounded-lg"
              />
            </div>
            <div className="mt-2.5 text-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="w-3 h-3" /> Chuẩn VietQR Napas 24/7
              </span>
            </div>
          </div>

          {/* Transfer Info Details */}
          <div className="space-y-2.5">
            <div className="p-3 bg-muted/30 rounded-xl border border-border/70 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Học sinh & Lớp học
              </span>
              <p className="font-bold text-sm text-foreground">{invoice.studentName}</p>
              <p className="text-xs text-muted-foreground">
                Lớp: <span className="font-semibold text-foreground">{invoice.className}</span> ({invoice.sessionsAdded} buổi)
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Ngân hàng */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Ngân hàng:</span>
                </div>
                <span className="font-bold text-foreground truncate max-w-[160px] text-right">
                  {bankNameDisplay}
                </span>
              </div>

              {/* Số tài khoản */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>Số tài khoản:</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-foreground">{settings.bank_account_no}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-md hover:bg-primary/10"
                    onClick={() => handleCopy(settings.bank_account_no, "accountNo")}
                    title="Sao chép STK"
                  >
                    {copiedField === "accountNo" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Chủ tài khoản:</span>
                </div>
                <span className="font-bold uppercase text-foreground">{settings.bank_account_name}</span>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="font-semibold text-primary">Số tiền:</span>
                <span className="font-black text-sm text-primary font-mono">{formatVND(invoice.amount)}</span>
              </div>

              {/* Nội dung chuyển khoản (kèm nút Sao chép nhanh) */}
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase block">
                    Nội dung CK:
                  </span>
                  <span className="font-mono font-bold text-xs text-foreground">{memo}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-amber-700 dark:text-amber-300 rounded-md hover:bg-amber-500/20"
                  onClick={() => handleCopy(memo, "memo")}
                  title="Sao chép nội dung"
                >
                  {copiedField === "memo" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions with 'Sao chép tin nhắn gửi Phụ huynh' */}
        <div className="p-4 bg-muted/40 border-t border-border/80 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCopy(getParentMessage(), "parent_message")}
            className={`w-full sm:w-auto h-9 text-xs font-bold gap-2 rounded-xl transition-all ${
              copiedField === "parent_message"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "border-primary/40 text-primary hover:bg-primary/10"
            }`}
          >
            {copiedField === "parent_message" ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Đã sao chép tin nhắn gửi PH!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Sao chép tin nhắn gửi Phụ huynh</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs rounded-xl h-9 px-4"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
