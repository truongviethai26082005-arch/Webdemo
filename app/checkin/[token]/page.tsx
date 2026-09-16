import { CheckinClient } from "./checkin-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Điểm danh học thử | EduCenter",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

// Trang CÔNG KHAI, không yêu cầu đăng nhập — học sinh học thử chưa có tài
// khoản (chỉ được cấp sau khi 'enrolled', xem AGENTS.md mục 9). proxy.ts chỉ
// bảo vệ /admin, /teacher, /sale, /student nên route này không bị chặn.
export default async function CheckinPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <CheckinClient token={token} />
    </div>
  );
}
