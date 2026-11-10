import { Suspense } from "react";
import { StudentCheckinClient } from "./check-in-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Điểm danh QR | Cổng Học sinh",
  description: "Quét mã QR hoặc nhập mã số giáo viên chiếu để tự điểm danh buổi học",
};

export default function StudentCheckinPage() {
  return (
    <Suspense>
      <StudentCheckinClient />
    </Suspense>
  );
}
