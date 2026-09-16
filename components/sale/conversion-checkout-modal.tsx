"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, Class } from "@/types/database";
import { completeLeadConversion } from "@/lib/actions/admissions";
import { CenterBankSettings, formatVND, generateVietQRUrl } from "@/lib/utils/vietqr";
import { getCourseSuggestion, isClassNameMatchingSuggestion } from "@/lib/utils/admissions-course-suggestion";
import {
  QrCode,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Building2,
  User,
  Phone,
  Copy,
  Check,
  Lightbulb,
} from "lucide-react";

interface ConversionCheckoutModalProps {
  lead: Lead | null;
  classes: Class[];
  bankSettings: CenterBankSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConversionCheckoutModal({
  lead,
  classes,
  bankSettings,
  open,
  onOpenChange,
}: ConversionCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{ email: string; password: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  // Form selection — KHÔNG tự chọn sẵn lớp đầu tiên trong danh sách: Sale bắt
  // buộc phải tự chọn đúng lớp thật (đúng nguyên tắc AGENTS.md Mục 11.1,
  // tránh lặp lại lỗi "chốt nhầm môn/lớp" khi Sale không để ý đổi dropdown).
  const [selectedClassId, setSelectedClassId] = useState<string>(lead?.target_class_id || "");
  const [sessions, setSessions] = useState<number>(24);
  const [enrollImmediately, setEnrollImmediately] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState("");

  if (!lead) return null;

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;
  const feePerSession = selectedClass?.fee_per_session || 0;
  const totalAmount = feePerSession * sessions;

  // Gợi ý lớp phù hợp dựa trên kết quả "test đầu vào" (trial_result) đã chấm
  // ở bước học thử — chỉ mang tính tham khảo, KHÔNG tự chọn thay Sale (đúng
  // nguyên tắc AGENTS.md Mục 11.1, tránh lặp lại lỗi "Hà Ngọc Sơn" trước đây).
  const courseSuggestion = getCourseSuggestion(lead.trial_result);

  // Memo chuyển khoản cá nhân hóa: "HP [SĐT] [Tên không dấu]"
  const cleanStudentName = lead.full_name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .trim();
  const transferMemo = `HP ${lead.phone.replace(/\D/g, "")} ${cleanStudentName}`.slice(0, 50);

  // Sinh link mã VietQR động theo chuẩn Napas 247 — chỉ tạo khi ĐÃ chọn đúng
  // lớp thật (tránh tạo mã QR với số tiền sai do chưa xác định được lớp/học phí).
  const vietQrUrl = selectedClass
    ? generateVietQRUrl(totalAmount, transferMemo, {
        bankId: bankSettings.bank_id,
        accountNo: bankSettings.bank_account_no,
        accountName: bankSettings.bank_account_name,
      })
    : null;

  const handleConfirmPayment = async () => {
    if (!selectedClassId) {
      setError("Vui lòng chọn lớp học quan tâm");
      return;
    }

    if (sessions <= 0 || totalAmount <= 0) {
      setError("Số buổi và học phí phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await completeLeadConversion({
        leadId: lead.id,
        classId: selectedClassId,
        sessions,
        amount: totalAmount,
        enrollImmediately,
        studentName: lead.full_name,
        parentName: lead.parent_name || undefined,
        parentPhone: lead.phone,
        studentDob: lead.birth_date || undefined,
        note: customNote.trim() || undefined,
      });

      // BẮT BUỘC: Kiểm tra res?.error trước khi báo thành công
      if (res?.error) {
        setError(res.error);
        return;
      }

      // Nếu đã đủ 3 điều kiện (chốt học + thanh toán + xếp lớp), hệ thống tự
      // cấp tài khoản đăng nhập cho học sinh — hiện mật khẩu 1 lần để Sale
      // sao chép gửi phụ huynh trước khi đóng/tải lại trang (không hiển thị
      // lại được sau khi đóng).
      if (res.accountCreated && res.accountEmail && res.accountPassword) {
        setCreatedAccount({ email: res.accountEmail, password: res.accountPassword });
        return;
      }

      onOpenChange(false);
      // Reload window để đảm bảo toàn bộ data và route được đồng bộ cache mới nhất
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onOpenChange(false);
    window.location.reload();
  };

  const handleCopyCredentials = async () => {
    if (!createdAccount) return;
    try {
      await navigator.clipboard.writeText(
        `Email: ${createdAccount.email}\nMật khẩu: ${createdAccount.password}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard — Sale tự bôi đen copy tay.
    }
  };

  // Đã chốt đơn xong VÀ hệ thống vừa tự cấp tài khoản đăng nhập — hiện màn
  // hình riêng để Sale sao chép mật khẩu trước khi đóng (không hiển thị lại
  // được sau khi đóng dialog này).
  if (createdAccount) {
    return (
      <Dialog open={open} onOpenChange={handleFinish}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Đã chốt học &amp; tự động cấp tài khoản</span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Học sinh đã đủ điều kiện (đã chốt học, đã thanh toán, đã xếp lớp) — hệ thống tự
              tạo tài khoản đăng nhập. Sao chép thông tin dưới đây để gửi cho phụ huynh trước khi
              đóng, không hiển thị lại được.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email đăng nhập:</span>
              <span className="font-mono font-bold text-foreground">{createdAccount.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mật khẩu:</span>
              <span className="font-mono font-bold text-foreground">{createdAccount.password}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full text-xs font-bold gap-1.5"
            onClick={handleCopyCredentials}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Đã sao chép" : "Sao chép Email & Mật khẩu"}
          </Button>

          <DialogFooter className="pt-1">
            <Button
              type="button"
              className="w-full text-xs font-bold"
              onClick={handleFinish}
            >
              Đã lưu lại, đóng cửa sổ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span>Chốt Gói Học &amp; Xuất Mã VietQR Thu Học Phí</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Tạo mã thanh toán trực tiếp, ghi nhận doanh thu và xếp lớp chính thức cho học sinh.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* CỘT TRÁI: CẤU HÌNH GÓI HỌC */}
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                {lead.full_name}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {lead.phone} • Phụ huynh: {lead.parent_name || "—"}
              </div>
              {(lead.course_interest || lead.target_goal) && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-1 border-t border-border/60 mt-1">
                  Môn/mục tiêu Lead đã quan tâm:{" "}
                  <strong>{lead.course_interest || "—"}</strong>
                  {lead.target_goal && ` · ${lead.target_goal}`} — đối chiếu trước
                  khi chọn lớp bên dưới.
                </div>
              )}
            </div>

            {/* Chọn lớp học thật */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Chọn lớp học chính thức <span className="text-destructive">*</span></Label>
              {courseSuggestion && (
                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-400">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Gợi ý theo kết quả học thử: <strong>{courseSuggestion.label}</strong> (lớp
                    đánh dấu ⭐ bên dưới khớp môn quan tâm + mức độ gợi ý — chỉ tham khảo, vẫn tự
                    chọn đúng lớp thật).
                  </span>
                </div>
              )}
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                disabled={loading}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Chọn lớp..." />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {classes.map((c) => {
                    const isSuggested = isClassNameMatchingSuggestion(
                      c.name,
                      courseSuggestion,
                      lead.course_interest
                    );
                    return (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {isSuggested && "⭐ "}
                        {c.name} ({formatVND(c.fee_per_session)}/buổi)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Chọn gói số buổi */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Gói số buổi mua ban đầu</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {[12, 24, 36, 48].map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={sessions === s ? "default" : "outline"}
                    className="text-xs h-8"
                    disabled={loading}
                    onClick={() => setSessions(s)}
                  >
                    {s} buổi
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground">Hoặc nhập số buổi:</span>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={sessions}
                  onChange={(e) => setSessions(Number(e.target.value) || 1)}
                  disabled={loading}
                  className="w-20 h-7 text-xs"
                />
              </div>
            </div>

            {/* Bảng tính tổng tiền */}
            <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Đơn giá/buổi:</span>
                <span className="font-semibold text-foreground">{formatVND(feePerSession)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Số lượng buổi:</span>
                <span className="font-semibold text-foreground">{sessions} buổi</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border/60 text-sm font-black text-primary">
                <span>Tổng học phí:</span>
                <span>{formatVND(totalAmount)}</span>
              </div>
            </div>

            {/* Quy tắc tách 2 bước: Xếp lớp ngay vs Chờ xếp lớp */}
            <div className="space-y-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="font-bold text-xs text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Hình thức ghi danh sau thanh toán
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="enrollNow"
                    checked={enrollImmediately}
                    onCheckedChange={(c) => setEnrollImmediately(Boolean(c))}
                    disabled={loading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="enrollNow" className="text-[11px] cursor-pointer text-foreground">
                    <strong>Ghi danh vào lớp ngay</strong> (Lớp đã có lịch và còn chỗ trống).
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="enrollWait"
                    checked={!enrollImmediately}
                    onCheckedChange={(c) => setEnrollImmediately(!Boolean(c))}
                    disabled={loading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="enrollWait" className="text-[11px] cursor-pointer text-muted-foreground">
                    <strong>Đưa vào Danh sách Chờ Xếp Lớp</strong> (Đã thu đủ tiền; lớp chưa đủ sĩ số hoặc chưa có khung giờ phù hợp).
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MÃ VIETQR ĐỘNG */}
          <div className="flex flex-col items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-full text-center space-y-1">
              <div className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {bankSettings.bank_name || "Ngân hàng nhận học phí"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                STK: <strong className="font-mono text-foreground">{bankSettings.bank_account_no}</strong> •{" "}
                {bankSettings.bank_account_name}
              </div>
            </div>

            {vietQrUrl ? (
              <>
                {/* VietQR Code Image */}
                <div className="my-3 p-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Chuyển khoản học phí"
                    className="w-48 h-48 object-contain mx-auto"
                  />
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">
                    Quét mã qua App Ngân hàng bất kỳ (Napas 24/7)
                  </div>
                </div>

                <div className="w-full p-2.5 rounded-xl bg-background border border-border text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nội dung CK:</span>
                    <span className="font-mono font-bold text-foreground truncate max-w-[170px]" title={transferMemo}>
                      {transferMemo}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-3">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="w-full text-xs font-bold gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Xác nhận đã nhận tiền &amp; Chốt đơn
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <QrCode className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs">
                  Vui lòng chọn đúng lớp học chính thức ở cột bên trái để hệ
                  thống tạo mã QR đúng số tiền.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
