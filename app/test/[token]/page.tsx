import { TestClient } from "./test-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bài test đầu vào | EduCenter",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

// Trang CÔNG KHAI, không yêu cầu đăng nhập — xem ghi chú tương tự ở
// app/checkin/[token]/page.tsx.
export default async function EntranceTestPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <TestClient token={token} />
    </div>
  );
}
