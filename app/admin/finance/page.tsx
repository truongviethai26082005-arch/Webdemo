import { getFinancialHubData } from "@/lib/actions/finance";
import { getStudents } from "@/lib/actions/students";
import { AdminHeader } from "@/components/layout/admin-header";
import { FinanceClient } from "./finance-client";

export const metadata = {
  title: "Tài chính & Thu phí (Sổ cái & VietQR) | EduCenter",
  description: "Kiến trúc Sổ cái Tài chính Đa tầng: Sổ cái học viên, nhật ký hóa đơn VietQR và bảng lương giáo viên",
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const tabParam = resolvedParams?.tab;
  const defaultTab: "ledger" | "transactions" | "payroll" =
    tabParam === "transactions" || tabParam === "payroll" ? tabParam : "ledger";

  const [hubData, rawStudents] = await Promise.all([
    getFinancialHubData(),
    getStudents(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Quản lý Tài chính & Thu phí"
        subtitle="Kiến trúc Sổ cái Đa tầng: Sổ cái học viên, nhật ký hóa đơn VietQR và bảng lương giáo viên"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <FinanceClient
          initialCustomerLedger={hubData.customerLedger}
          initialTransactionLogs={hubData.transactionLogs}
          initialPayrollData={hubData.payrollData}
          kpis={hubData.kpis}
          studentsRaw={rawStudents}
          currentMonth={hubData.currentMonth}
          currentYear={hubData.currentYear}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  );
}
