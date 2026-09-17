"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTrialSlotPublicInfo, checkinTrialLead } from "@/lib/actions/trial-checkin";
import { Loader2, CheckCircle2, XCircle, QrCode } from "lucide-react";

interface CheckinClientProps {
  token: string;
}

export function CheckinClient({ token }: CheckinClientProps) {
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [slotInfo, setSlotInfo] = useState<{
    success: boolean;
    message?: string;
    subject?: string;
    teacherName?: string | null;
    room?: string | null;
    dayOfWeek?: string;
    timeSlot?: string;
  } | null>(null);

  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; leadName?: string } | null>(null);

  useEffect(() => {
    getTrialSlotPublicInfo(token).then((info) => {
      setSlotInfo(info);
      setLoadingInfo(false);
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await checkinTrialLead(token, phone);
    setSubmitting(false);
    setResult(res);
  };

  if (loadingInfo) {
    return (
      <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!slotInfo?.success) {
    return (
      <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border text-center space-y-2">
        <XCircle className="w-10 h-10 text-destructive mx-auto" />
        <p className="text-sm font-semibold text-foreground">{slotInfo?.message || "Mã QR không hợp lệ"}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-base font-black text-foreground">Điểm Danh Học Thử</h1>
        <p className="text-sm font-semibold text-foreground">{slotInfo.subject}</p>
        <p className="text-xs text-muted-foreground">
          {slotInfo.dayOfWeek} • {slotInfo.timeSlot}
          {slotInfo.room ? ` • Phòng ${slotInfo.room}` : ""}
        </p>
        {slotInfo.teacherName && (
          <p className="text-xs text-muted-foreground">GV: {slotInfo.teacherName}</p>
        )}
      </div>

      {result ? (
        <div className={`p-4 rounded-xl text-center space-y-2 ${result.success ? "bg-emerald-500/10 border border-emerald-200" : "bg-destructive/10 border border-destructive/20"}`}>
          {result.success ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive mx-auto" />
          )}
          <p className={`text-sm font-semibold ${result.success ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}>
            {result.leadName ? `${result.leadName} — ` : ""}{result.message}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Số điện thoại đã đăng ký học thử</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              required
              disabled={submitting}
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full text-sm font-bold">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Điểm danh ngay"}
          </Button>
        </form>
      )}
    </div>
  );
}
