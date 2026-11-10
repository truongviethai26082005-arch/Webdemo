import { SaleHeader } from "@/components/layout/sale-header";
import { getFeedbackTickets, getFeedbackKpiStats, getStudentFeedbackList } from "@/lib/actions/feedback";
import { getStudents } from "@/lib/actions/students";
import { FeedbackClient } from "@/app/sale/feedback/feedback-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Phản ánh & Góp ý | Tuyển sinh EduCenter",
  description: "Tiếp nhận và theo dõi xử lý phản ánh/góp ý từ phụ huynh, học sinh",
};

export default async function SaleFeedbackPage() {
  const [tickets, stats, students, studentFeedbacks] = await Promise.all([
    getFeedbackTickets(),
    getFeedbackKpiStats(),
    getStudents(),
    getStudentFeedbackList(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Phản ánh & Góp ý"
        subtitle="Tiếp nhận và theo dõi xử lý phàn nàn, góp ý từ phụ huynh & học sinh"
      />
      <div className="flex-1">
        <FeedbackClient initialTickets={tickets} stats={stats} students={students} studentFeedbacks={studentFeedbacks} />
      </div>
    </div>
  );
}
