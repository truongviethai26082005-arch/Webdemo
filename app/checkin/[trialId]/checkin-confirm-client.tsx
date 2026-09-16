"use client";

import { useState } from "react";
import { confirmTrialCheckin } from "@/lib/actions/admissions";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface CheckinConfirmClientProps {
  trialId: string;
  initialStatus: "scheduled" | "attended" | "absent" | "cancelled";
}

export function CheckinConfirmClient({ trialId, initialStatus }: CheckinConfirmClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await confirmTrialCheckin(trialId);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setStatus("attended");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "attended") {
    return (
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Đã ghi nhận có mặt. Hẹn gặp bạn tại buổi học!
      </div>
    );
  }

  if (status === "absent" || status === "cancelled") {
    return (
      <div className="p-3 rounded-xl bg-muted/40 border border-border text-muted-foreground text-xs">
        Buổi học thử này đã đổi lịch. Vui lòng liên hệ trung tâm để được hỗ trợ.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={handleConfirm}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Xác nhận có mặt
      </button>
    </div>
  );
}
