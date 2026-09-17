"use client";

import { useState, useEffect } from "react";
import { Lead } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTestAttemptForLead } from "@/lib/actions/entrance-test";
import { AlertCircle, Loader2, Copy, Check, ClipboardList } from "lucide-react";

interface SendEntranceTestDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SendEntranceTestDialog({ lead, open, onOpenChange, onSuccess }: SendEntranceTestDialogProps) {
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject(lead?.course_interest || "");
      setLink(null);
      setError(null);
      setCopied(false);
    }
  }, [open, lead]);

  if (!lead) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createTestAttemptForLead(lead.id, subject);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setLink(`${origin}/test/${res.accessToken}`);
    onSuccess?.();
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = link
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Gửi Test Đầu Vào — {lead.full_name}
          </DialogTitle>
        </DialogHeader>

        {!link ? (
          <form onSubmit={handleCreate} className="space-y-3">
            {error && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Môn học kiểm tra</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} required disabled={loading} placeholder="VD: Tiếng Anh" />
              <p className="text-[11px] text-muted-foreground">
                Phải khớp đúng tên môn trong Ngân hàng câu hỏi (tab &quot;Test Đầu Vào&quot;), nếu chưa có câu hỏi cho môn này hệ thống sẽ báo lỗi.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="text-xs font-bold w-full">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Tạo liên kết bài test"}
            </Button>
          </form>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              Gửi liên kết này cho phụ huynh/học sinh qua Zalo, hoặc cho học sinh quét mã QR để tự làm bài ngay trên điện thoại.
            </p>
            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR bài test đầu vào" className="mx-auto rounded-xl border border-border" width={220} height={220} />
            )}
            <div className="flex items-center gap-2">
              <Input readOnly value={link} className="text-xs font-mono" />
              <Button type="button" size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
