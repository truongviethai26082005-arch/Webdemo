"use client";

import { useEffect, useState } from "react";
import { TrialSlot } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, QrCode } from "lucide-react";

interface TrialSlotQrDialogProps {
  slot: TrialSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Hiển thị QR điểm danh học thử: mã cố định gắn với ca học thử (dán tại
// phòng học), học sinh tự quét -> nhập SĐT đã đăng ký để điểm danh.
// Xem app/checkin/[token]/page.tsx và lib/actions/trial-checkin.ts.
export function TrialSlotQrDialog({ slot, open, onOpenChange }: TrialSlotQrDialogProps) {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && slot) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setLink(`${origin}/checkin/${slot.checkin_token}`);
      setCopied(false);
    }
  }, [open, slot]);

  if (!slot) return null;

  const qrUrl = link ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(link)}` : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            Mã QR Điểm Danh — {slot.subject}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-center">
          <p className="text-xs text-muted-foreground">
            In &amp; dán mã này tại phòng học thử ({slot.day_of_week} • {slot.time_slot}). Học sinh tự quét bằng điện thoại, nhập SĐT đã đăng ký để điểm danh.
          </p>
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR điểm danh học thử" className="mx-auto rounded-xl border border-border" width={260} height={260} />
          )}
          <div className="flex items-center gap-2">
            <Input readOnly value={link} className="text-xs font-mono" />
            <Button type="button" size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
