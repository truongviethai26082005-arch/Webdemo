import { getClasses, getTeacherOptions } from "@/lib/actions/classes";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdmissionsClient } from "./admissions-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản lý Tuyển sinh (Phễu & CRM) | EduCenter EMS",
  description: "Đo lường và chuyển đổi học viên tiềm năng qua 4 giai đoạn phễu tuyển sinh",
};

export default async function AdmissionsPage() {
  const [classes, teachers] = await Promise.all([
    getClasses(),
    getTeacherOptions(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Quản lý Tuyển sinh (CRM & Phễu tuyển sinh)"
        subtitle="Đo lường phễu chuyển đổi xuyên suốt: Lead tiềm năng ➔ Tư vấn & Chăm sóc ➔ Học thử & Test ➔ Ghi danh & Chốt cọc"
      />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <AdmissionsClient classes={classes} teachers={teachers} />
      </div>
    </div>
  );
}
