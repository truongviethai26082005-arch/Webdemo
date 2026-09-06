import { AdminHeader } from "@/components/layout/admin-header";
import { AdmissionsBoard } from "@/components/admissions/admissions-board";

export default function AdmissionsPage() {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <AdminHeader
        title="Quản lý Tuyển sinh (CRM)"
        subtitle="Theo dõi phễu khách hàng và chăm sóc học viên tiềm năng"
      />
      <div className="flex-1 overflow-hidden">
        <AdmissionsBoard />
      </div>
    </div>
  );
}
