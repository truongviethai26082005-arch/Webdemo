import { getStudentFeedbacks } from "@/lib/actions/student";
import { StudentFeedbackClient } from "./feedback-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Phản hồi & Đóng góp ý kiến | Cổng Học sinh",
  description: "Gửi ý kiến đóng góp, phản ánh chất lượng giảng dạy và dịch vụ học viên",
};

export default async function StudentFeedbackPage() {
  const initialData = await getStudentFeedbacks();

  return <StudentFeedbackClient initialData={initialData} />;
}
