"use client";

import { useState } from "react";
import {
  StudentLedgerItem,
  FinancialKPIs,
  TransactionInvoice,
} from "@/lib/actions/finance";
import { TeacherPayroll } from "@/types/database";
import { CustomerLedgerTable } from "@/components/finance/customer-ledger-table";
import { TransactionLogsTable } from "@/components/finance/transaction-logs-table";
import { PayrollTab } from "@/components/finance/payroll-tab";
import { ReceiptModal } from "@/components/finance/receipt-modal";
import { StudentLedgerSheet } from "@/components/finance/student-ledger-sheet";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { VietQRModal, VietQRInvoiceData } from "@/components/invoices/vietqr-modal";
import { markInvoiceAsPaid } from "@/lib/actions/invoices";
import {
  Users,
  Receipt,
  Wallet,
  Plus,
  QrCode,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinanceClientProps {
  initialCustomerLedger: StudentLedgerItem[];
  initialTransactionLogs: TransactionInvoice[];
  initialPayrollData: TeacherPayroll[];
  kpis: FinancialKPIs;
  studentsRaw: any[];
  currentMonth: number;
  currentYear: number;
  defaultTab?: "ledger" | "transactions" | "payroll";
}

export function FinanceClient({
  initialCustomerLedger,
  initialTransactionLogs,
  initialPayrollData,
  kpis,
  studentsRaw,
  currentMonth,
  currentYear,
  defaultTab = "ledger",
}: FinanceClientProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Data states
  const [customerLedger, setCustomerLedger] = useState<StudentLedgerItem[]>(initialCustomerLedger);
  const [transactionLogs, setTransactionLogs] = useState<TransactionInvoice[]>(initialTransactionLogs);
  const [kpiState, setKpiState] = useState<FinancialKPIs>(kpis);

  // Dialog states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedStudentForTopUp, setSelectedStudentForTopUp] = useState<string>("");
  const [selectedClassForTopUp, setSelectedClassForTopUp] = useState<string>("");

  // VietQR modal
  const [vietQrData, setVietQrData] = useState<VietQRInvoiceData | null>(null);

  // Receipt modal
  const [receiptInvoice, setReceiptInvoice] = useState<TransactionInvoice | null>(null);

  // Student ledger slide-over sheet
  const [ledgerStudent, setLedgerStudent] = useState<StudentLedgerItem | null>(null);

  // Handle + Thu phí for a specific student from customer ledger
  function handleTopUpStudent(st: StudentLedgerItem) {
    setSelectedStudentForTopUp(st.id);
    setSelectedClassForTopUp(st.classes[0]?.id || "");
    setIsCreateInvoiceOpen(true);
  }

  // Handle Mark Paid for pending invoice
  async function handleMarkPaid(invoiceId: string) {
    if (
      !confirm(
        "Xác nhận đã nhận đủ tiền cho hóa đơn này? Hệ thống sẽ tự động cộng số buổi tương ứng vào ví của học sinh."
      )
    ) {
      return;
    }

    const res = await markInvoiceAsPaid(invoiceId);
    if (res.error) {
      alert(res.error);
      return;
    }

    // Cập nhật trạng thái trong Transaction Logs
    setTransactionLogs((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "paid",
              paidAt: new Date().toISOString(),
            }
          : inv
      )
    );

    // Tìm hóa đơn để cộng buổi và giảm công nợ trong Customer Ledger
    const targetInv = transactionLogs.find((inv) => inv.id === invoiceId);
    if (targetInv) {
      setCustomerLedger((prev) =>
        prev.map((st) => {
          if (st.id === targetInv.studentId) {
            const newTotalPaid = st.totalPaid + targetInv.amount;
            const newDebt = Math.max(0, st.currentDebt - targetInv.amount);
            const newBalance = st.totalBalanceSessions + targetInv.sessionsAdded;
            return {
              ...st,
              totalPaid: newTotalPaid,
              currentDebt: newDebt,
              totalBalanceSessions: newBalance,
              needsReminder: newBalance <= 2,
            };
          }
          return st;
        })
      );

      // Cập nhật KPIs
      setKpiState((prev) => ({
        ...prev,
        totalUnpaidDebt: Math.max(0, prev.totalUnpaidDebt - targetInv.amount),
        totalAvailableSessions: prev.totalAvailableSessions + targetInv.sessionsAdded,
      }));
    }
  }

  // When invoice created successfully
  function handleInvoiceCreated(createdInvoice: any) {
    // Nếu chưa thanh toán ngay -> mở popup VietQR Techcombank
    setVietQrData({
      id: createdInvoice.id,
      studentName: createdInvoice.studentName || "Học sinh",
      studentCode: createdInvoice.studentCode,
      className: createdInvoice.className || "Lớp học",
      amount: createdInvoice.amount,
      sessionsAdded: createdInvoice.sessionsAdded,
      paymentMethod: createdInvoice.paymentMethod,
      note: createdInvoice.note,
    });
    // Reload sau khi đóng dialog để lấy số liệu mới nhất
    window.location.reload();
  }

  function handleInvoiceSuccessPaid() {
    // Đã thu ngay: reload để refresh bảng và ví buổi
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation Bar & Horizontal Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <TabsList className="grid grid-cols-3 w-full sm:w-[480px] h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger
              value="ledger"
              className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              Tài chính Học viên
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              Lịch sử Hóa đơn
            </TabsTrigger>
            <TabsTrigger
              value="payroll"
              className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5" />
              Bảng lương GV
            </TabsTrigger>
          </TabsList>

          {/* Quick Action Button */}
          <Button
            onClick={() => {
              setSelectedStudentForTopUp("");
              setSelectedClassForTopUp("");
              setIsCreateInvoiceOpen(true);
            }}
            className="gap-2 text-xs font-bold h-9 shadow-md shadow-primary/25 rounded-xl shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            + Thu Học Phí (VietQR)
          </Button>
        </div>

        {/* Tab 1: Tài chính Học viên (Customer Ledger) */}
        <TabsContent value="ledger" className="mt-5 space-y-4">
          <CustomerLedgerTable
            students={customerLedger}
            kpis={kpiState}
            onTopUp={handleTopUpStudent}
            onViewHistory={(st) => setLedgerStudent(st)}
          />
        </TabsContent>

        {/* Tab 2: Lịch sử Hóa đơn (Transaction Logs) */}
        <TabsContent value="transactions" className="mt-5 space-y-4">
          <TransactionLogsTable
            invoices={transactionLogs}
            onOpenVietQR={(inv) =>
              setVietQrData({
                id: inv.id,
                studentName: inv.studentName,
                studentCode: inv.studentCode,
                className: inv.className,
                amount: inv.amount,
                sessionsAdded: inv.sessionsAdded,
                paymentMethod: inv.paymentMethod,
                note: inv.note || undefined,
              })
            }
            onOpenReceipt={(inv) => setReceiptInvoice(inv)}
            onMarkPaid={handleMarkPaid}
          />
        </TabsContent>

        {/* Tab 3: Bảng lương Giáo viên (Payroll Integration) */}
        <TabsContent value="payroll" className="mt-5 space-y-4">
          <PayrollTab
            initialPayroll={initialPayrollData}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </TabsContent>
      </Tabs>

      {/* Modal 1: Tạo Phiếu Thu Học Phí (Create Invoice Dialog) */}
      <CreateInvoiceDialog
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        students={studentsRaw}
        defaultStudentId={selectedStudentForTopUp}
        defaultClassId={selectedClassForTopUp}
        onCreated={handleInvoiceCreated}
        onSuccessPaid={handleInvoiceSuccessPaid}
        onSuccessCash={handleInvoiceSuccessPaid}
      />

      {/* Modal 2: Popup VietQR Techcombank */}
      <VietQRModal
        isOpen={Boolean(vietQrData)}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />

      {/* Modal 3: Xem & In Biên Lai Thu Tiền (Receipt Modal) */}
      <ReceiptModal
        isOpen={Boolean(receiptInvoice)}
        onClose={() => setReceiptInvoice(null)}
        invoice={receiptInvoice}
      />

      {/* Modal 4: Slide-over Drawer Sao Kê Học Viên (Student Ledger Sheet) */}
      <StudentLedgerSheet
        isOpen={Boolean(ledgerStudent)}
        onClose={() => setLedgerStudent(null)}
        student={ledgerStudent}
        onTopUp={handleTopUpStudent}
      />
    </div>
  );
}
