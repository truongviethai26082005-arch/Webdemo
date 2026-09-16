import { getStudentAccountsOverview } from "@/lib/actions/accounts";
import { getStudents } from "@/lib/actions/students";
import { SaleHeader } from "@/components/layout/sale-header";
import { SaleAccountsClient } from "@/app/sale/accounts/sale-accounts-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản trị Tài khoản Học sinh | Tuyển sinh EduCenter",
  description: "Cấp và đặt lại mật khẩu cho học sinh đăng nhập vào hệ thống LMS",
};

export default async function SaleAccountsPage() {
  const [studentAccounts, allStudents] = await Promise.all([
    getStudentAccountsOverview(),
    getStudents(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Quản Trị Tài Khoản Học Sinh"
        subtitle="Cấp tài khoản mới và hỗ trợ đặt lại mật khẩu cho học sinh & phụ huynh"
      />
      <div className="flex-1">
        <SaleAccountsClient
          studentAccounts={studentAccounts}
          allStudents={allStudents}
        />
      </div>
    </div>
  );
}
