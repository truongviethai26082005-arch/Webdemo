"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QrCode, Camera, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { submitCheckin } from "@/lib/actions/checkin";

const SCANNER_ELEMENT_ID = "student-checkin-qr-reader";

function extractTokenFromScannedText(text: string): string {
  try {
    const url = new URL(text);
    return url.searchParams.get("token") || text;
  } catch {
    return text; // Không phải URL -> coi nguyên chuỗi quét được là token
  }
}

export function StudentCheckinClient() {
  const searchParams = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const scannerRef = useRef<any>(null);
  const hasAutoSubmittedRef = useRef(false);

  async function handleSubmit(input: { qrToken?: string; code?: string }) {
    setIsSubmitting(true);
    setResult(null);
    const res = await submitCheckin(input);
    setIsSubmitting(false);

    if ("error" in res) {
      setResult({ type: "error", message: res.error });
      return;
    }
    setResult({ type: "success", message: `Điểm danh thành công lớp "${res.className}"!` });
    setManualCode("");
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // scanner đã dừng sẵn hoặc chưa kịp start xong — bỏ qua
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }

  async function startScanner() {
    setResult(null);
    setIsScanning(true);

    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        async (decodedText: string) => {
          await stopScanner();
          const qrToken = extractTokenFromScannedText(decodedText);
          handleSubmit({ qrToken });
        },
        () => {
          // lỗi decode từng khung hình (bình thường khi camera chưa bắt được mã) — bỏ qua
        }
      );
    } catch {
      setResult({ type: "error", message: "Không thể mở camera. Hãy cấp quyền camera cho trình duyệt hoặc dùng cách nhập mã số bên dưới." });
      setIsScanning(false);
      scannerRef.current = null;
    }
  }

  // Nếu học sinh mở link từ QR bằng camera điện thoại (ngoài app), link có sẵn ?token=...
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      handleSubmit({ qrToken: tokenFromUrl });
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6 py-4">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Điểm danh bằng QR</h1>
        <p className="text-xs text-muted-foreground">
          Quét mã giáo viên đang chiếu trên lớp hoặc nhập mã số 6 chữ số
        </p>
      </div>

      {result && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            result.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      <Card className="p-4 rounded-2xl border shadow-sm space-y-3">
        <div id={SCANNER_ELEMENT_ID} className={isScanning ? "rounded-xl overflow-hidden" : "hidden"} />

        {!isScanning && (
          <Button onClick={startScanner} className="w-full gap-2 text-xs font-bold h-10 rounded-xl">
            <Camera className="w-4 h-4" />
            Mở camera quét mã QR
          </Button>
        )}

        {isScanning && (
          <Button onClick={stopScanner} variant="outline" className="w-full gap-2 text-xs font-bold h-9 rounded-xl">
            Dừng camera
          </Button>
        )}
      </Card>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground font-semibold">HOẶC</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Card className="p-4 rounded-2xl border shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <KeyRound className="w-4 h-4 text-primary" />
          Nhập mã số 6 chữ số
        </div>
        <div className="flex gap-2">
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="VD: 482913"
            inputMode="numeric"
            className="h-10 text-center text-lg font-mono tracking-widest rounded-xl"
          />
          <Button
            onClick={() => handleSubmit({ code: manualCode })}
            disabled={isSubmitting || manualCode.length !== 6}
            className="h-10 px-5 text-xs font-bold rounded-xl shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Điểm danh"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
