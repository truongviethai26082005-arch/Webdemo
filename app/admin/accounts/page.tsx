import { getStudents } from "@/lib/actions/students";
import { getAllAccounts, getStudentAccountsOverview } from "@/lib/actions/accounts";
import { AdminHeader } from "@/components/layout/admin-header";
import { AccountsClient } from "./accounts-client";

export const metadata = {
  title: "Quản lý tài khoản | EduCenter",
};

export default async function AdminAccountsPage() {
  const [students, accounts, studentAccounts] = await Promise.all([
    getStudents(),
    getAllAccounts(),
    getStudentAccountsOverview(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Quản lý Tài khoản"
        subtitle="Tạo và xem lại tài khoản đăng nhập cho nhân sự (Admin/Giáo viên/Tuyển sinh) hoặc học sinh"
      />
      <div className="p-6 max-w-4xl mx-auto">
        <AccountsClient students={students} accounts={accounts} studentAccounts={studentAccounts} />
      </div>
    </div>
  );
}
