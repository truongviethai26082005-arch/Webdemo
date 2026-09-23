import { getStudents } from "@/lib/actions/students";
import { getClasses } from "@/lib/actions/classes";
import { getCenterBankSettings } from "@/lib/actions/settings";
import { EMPTY_CENTER_BANK_SETTINGS } from "@/lib/utils/vietqr";
import { SaleHeader } from "@/components/layout/sale-header";
import { StudentsClient } from "@/app/sale/students/students-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Học sinh Đã Chuyển đổi | EduCenter",
  description: "Tra cứu học sinh hiện có và đăng ký thêm lớp học mới cho học sinh đã chuyển đổi",
};

export default async function SaleStudentsPage() {
  const [students, classes, bankSettings] = await Promise.all([
    getStudents(),
    getClasses(),
    getCenterBankSettings(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Học sinh Đã Chuyển đổi"
        subtitle="Tra cứu học sinh hiện có và đăng ký thêm lớp học mới"
      />
      <div className="flex-1">
        <StudentsClient initialStudents={students} classes={classes} bankSettings={bankSettings ?? EMPTY_CENTER_BANK_SETTINGS} />
      </div>
    </div>
  );
}
