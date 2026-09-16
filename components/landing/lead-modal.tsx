"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitLead } from "@/lib/actions/leads";
import {
  Sparkles,
  CheckCircle2,
  Building2,
  User,
  Phone,
  Mail,
  Users,
  Layers,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
}

export function LeadModal({ open, onOpenChange, defaultCategory }: LeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [scale, setScale] = useState("<50");
  const [category, setCategory] = useState(defaultCategory || "language");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone || !email || !centerName) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await submitLead({
      fullName,
      centerName,
      phone,
      email,
      scale,
      category,
    });

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.message || "Không thể gửi form, vui lòng thử lại.");
    }
  }

  function handleReset() {
    setSubmitted(false);
    setError(null);
    setFullName("");
    setCenterName("");
    setPhone("");
    setEmail("");
    setScale("<50");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        // Reset when closed
        setTimeout(() => {
          setSubmitted(false);
          setError(null);
        }, 300);
      }
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        {/* Top decorative gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

        {submitted ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-500/10 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Đăng ký thành công!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Cảm ơn bạn đã quan tâm. Đội ngũ chuyên viên tư vấn của{" "}
                <strong className="text-foreground font-semibold">EduCenter EMS</strong> sẽ liên hệ
                trực tiếp qua số điện thoại <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{phone}</strong> trong vòng 24 giờ làm việc để cấp tài khoản trải nghiệm & hướng dẫn triển khai.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dữ liệu đăng ký được bảo mật và hỗ trợ kỹ thuật 1-1 miễn phí</span>
            </div>

            <Button
              type="button"
              onClick={handleReset}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
            >
              Hoàn tất & Đóng
            </Button>
          </div>
        ) : (
          <div className="p-6 sm:p-7 space-y-5">
            <DialogHeader className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold w-fit border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trải nghiệm 14 ngày miễn phí đầy đủ tính năng</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Nhận Tư Vấn & Dùng Thử EduCenter EMS
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Tự động hóa vận hành, quản lý điểm danh, học phí VietQR và kích hoạt trợ lý AI thông minh ngay hôm nay.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Họ & tên người liên hệ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lead-name"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 text-sm bg-background/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead-center" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Tên trung tâm / Lớp học <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lead-center"
                    placeholder="Anh ngữ Apollo, Lớp Toán Thầy..."
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 text-sm bg-background/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Số điện thoại Zalo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 text-sm bg-background/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead-email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Email công việc <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="quanly@trungtam.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 text-sm bg-background/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    Quy mô học viên dự kiến
                  </Label>
                  <Select value={scale} onValueChange={setScale} disabled={loading}>
                    <SelectTrigger className="h-10 text-sm bg-background/80">
                      <SelectValue placeholder="Chọn quy mô" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<50">Dưới 50 học viên (Lớp kèm/Mới mở)</SelectItem>
                      <SelectItem value="50-200">50 - 200 học viên (Trung tâm vừa)</SelectItem>
                      <SelectItem value=">200">Trên 200 học viên (Trung tâm lớn/Chuỗi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                    Lĩnh vực đào tạo chính
                  </Label>
                  <Select value={category} onValueChange={setCategory} disabled={loading}>
                    <SelectTrigger className="h-10 text-sm bg-background/80">
                      <SelectValue placeholder="Chọn lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="language">Ngoại ngữ (Anh, Trung, Hàn, Nhật)</SelectItem>
                      <SelectItem value="k12">Luyện thi & Văn hóa (Toán, Lý, Hóa...)</SelectItem>
                      <SelectItem value="tutor">Dạy kèm & Giáo viên tự do</SelectItem>
                      <SelectItem value="skills">Năng khiếu, Nghệ thuật & Kỹ năng</SelectItem>
                      <SelectItem value="other">Lĩnh vực khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý thông tin...
                    </>
                  ) : (
                    <>
                      Kích hoạt Dùng thử Miễn phí ngay
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground mt-2.5">
                  Không yêu cầu thẻ tín dụng • Triển khai trong 5 phút • Hỗ trợ chuyển đổi dữ liệu
                </p>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
