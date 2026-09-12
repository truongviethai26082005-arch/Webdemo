import { getStudents } from "@/lib/actions/students";
import { AdminHeader } from "@/components/layout/admin-header";
import { AccountsClient } from "./accounts-client";

export const metadata = {
  title: "Quản lý tài khoản | EduCenter",
};

export default async function AdminAccountsPage() {
  const students = await getStudents();

  return (
    <div>
      <AdminHeader
        title="Quản lý Tài khoản"
        subtitle="Tạo tài khoản đăng nhập cho nhân sự (Admin/Giáo viên/Tuyển sinh) hoặc cấp tài khoản cho học sinh đã có sẵn"
      />
      <div className="p-6 max-w-3xl mx-auto">
        <AccountsClient students={students} />
      </div>
    </div>
  );
}
