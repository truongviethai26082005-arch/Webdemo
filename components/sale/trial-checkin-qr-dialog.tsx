"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Check, CheckCircle2 } from "lucide-react";

interface TrialCheckinQrDialogProps {
  trialId: string | null;
  leadName?: string;
  subject?: string;
  alreadyAttended?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Hiện mã QR check-in cho 1 lượt đăng ký học thử cụ thể — học sinh/phụ huynh
// tự quét bằng camera điện thoại (không cần app riêng, không cần thêm thư
// viện đọc QR ở phía mình) để mở trang công khai app/checkin/[trialId] và tự
// xác nhận có mặt. Dùng `lead_trials.id` (UUID sẵn có) làm token — không
// thêm cột/bảng DB mới. Ảnh QR sinh qua dịch vụ ảnh công khai (cùng cách
// VietQR đang dùng ở lib/utils/vietqr.ts), không cần thêm gói npm.
export function TrialCheckinQrDialog({
  trialId,
  leadName,
  subject,
  alreadyAttended,
  open,
  onOpenChange,
}: TrialCheckinQrDialogProps) {
  const [checkinUrl, setCheckinUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (trialId && typeof window !== "undefined") {
      setCheckinUrl(`${window.location.origin}/checkin/${trialId}`);
    }
  }, [trialId]);

  if (!trialId) return null;

  const qrImageUrl = checkinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(checkinUrl)}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard — phụ huynh có thể tự bôi đen copy tay.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span>Mã Check-in Buổi Học Thử</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {leadName ? <strong className="text-foreground">{leadName}</strong> : "Học sinh"}
            {subject ? ` • ${subject}` : ""}
          </DialogDescription>
        </DialogHeader>

        {alreadyAttended && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã check-in có mặt trước đó.
          </div>
        )}

        {qrImageUrl && (
          <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-center mx-auto">
            <img
              src={qrImageUrl}
              alt="Mã QR check-in học thử"
              className="w-48 h-48 object-contain mx-auto"
            />
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center">
          Đưa mã này cho phụ huynh/học sinh trước buổi học — đến nơi chỉ cần
          dùng camera điện thoại quét như quét QR bình thường để tự xác nhận
          có mặt, không cần đăng nhập.
        </p>

        <Button
          type="button"
          variant="outline"
          className="w-full text-xs font-bold gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Đã sao chép link" : "Sao chép link check-in"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
