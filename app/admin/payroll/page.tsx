import { getTeacherPayroll } from "@/lib/actions/teachers";
import { AdminHeader } from "@/components/layout/admin-header";
import { PayrollClient } from "./payroll-client";

export const dynamic = "force-dynamic";

export default async function AdminPayrollPage() {
  const payroll = await getTeacherPayroll();

  return (
    <div>
      <AdminHeader
        title="Bảng Lương Giáo Viên"
        subtitle="Tổng hợp số ca dạy, đơn giá thù lao và quyết toán lương giáo viên theo tháng"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <PayrollClient initialPayroll={payroll} />
      </div>
    </div>
  );
}
