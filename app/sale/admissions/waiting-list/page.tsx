import { getWaitingListStudents } from "@/lib/actions/admissions";
import { getClasses } from "@/lib/actions/classes";
import { SaleHeader } from "@/components/layout/sale-header";
import { WaitingListClient } from "@/app/sale/admissions/waiting-list/waiting-list-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Học sinh Chờ Xếp Lớp | Tuyển sinh EduCenter",
  description: "Quản lý danh sách học sinh đã đóng học phí nhưng đang chờ xếp lớp",
};

export default async function WaitingListPage() {
  const [waitingStudents, classes] = await Promise.all([
    getWaitingListStudents(),
    getClasses(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Học Sinh Chờ Xếp Lớp"
        subtitle="Quản lý học sinh đã nộp học phí, sẵn sàng vào lớp khi Admin mở ca mới"
      />
      <div className="flex-1">
        <WaitingListClient
          initialStudents={waitingStudents}
          classes={classes}
        />
      </div>
    </div>
  );
}
