import { getPublicTrialCheckinInfo } from "@/lib/actions/admissions";
import { CheckinConfirmClient } from "./checkin-confirm-client";
import { CalendarCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ trialId: string }>;
}

// Trang công khai, KHÔNG yêu cầu đăng nhập — phụ huynh/học sinh tự quét mã QR
// bằng camera điện thoại để xác nhận có mặt tại buổi học thử. Nằm ngoài
// app/sale/ vì khách vãng lai không có tài khoản Sale; proxy.ts (middleware
// dùng chung) chỉ chặn đúng 4 tiền tố /admin, /teacher, /sale, /student nên
// route này không cần sửa gì ở proxy.ts để hoạt động công khai.
export default async function PublicTrialCheckinPage({ params }: PageProps) {
  const { trialId } = await params;
  const info = await getPublicTrialCheckinInfo(trialId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <CalendarCheck className="w-6 h-6" />
        </div>

        {"error" in info ? (
          <div>
            <h1 className="text-base font-bold text-foreground">Không tìm thấy lượt học thử</h1>
            <p className="text-xs text-muted-foreground mt-1">{info.error}</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-base font-bold text-foreground">
                Chào {info.studentFirstName}!
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Buổi học thử: <strong className="text-foreground">{info.subject}</strong>
                {info.dayOfWeek && ` • ${info.dayOfWeek}`}
                {info.timeSlot && ` • ${info.timeSlot}`}
              </p>
            </div>

            <CheckinConfirmClient trialId={trialId} initialStatus={info.status} />
          </>
        )}
      </div>
    </div>
  );
}
