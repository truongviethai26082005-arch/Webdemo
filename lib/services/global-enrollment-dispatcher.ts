/**
 * Global Enrollment Dispatcher Service (Single Source of Truth)
 * Đồng bộ toàn bộ dữ liệu giữa Quản lý Tuyển sinh (Tab 3), Tài chính & Thu phí, Học sinh & Xếp lớp, và Quản lý Lớp học.
 */

export interface RegisteredSubjectPayload {
  trialClassId: string;
  className: string;
  sessions: number;
  tuitionFee: number;
  packageLabel?: string;
}

export interface StudentDataPayload {
  leadId?: string;
  conversionId?: string;
  studentName: string;
  parentName?: string;
  parentPhone: string;
}

export function handleCompleteEnrollment(
  studentData: StudentDataPayload,
  registeredSubjects: RegisteredSubjectPayload[],
  totalAmount: number,
  paymentMethod: string = "VIETQR"
) {
  const now = new Date();
  const nowIso = now.toISOString();
  const yearStr = now.getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const invoiceCode = `HD-${yearStr}-${randomNum}`;

  const totalSessionsSum = registeredSubjects.reduce(
    (sum, item) => sum + (item.sessions || 12),
    0
  );

  const classNamesFormatted = registeredSubjects
    .map((s) => `${s.className.split("(")[0].trim()} (${s.sessions || 12} buổi)`)
    .join(", ");

  // 1. TÀI CHÍNH & THU PHÍ: Tạo bản ghi Hóa đơn mới (Invoices)
  const newInvoice = {
    id: `inv-${Date.now()}-${randomNum}`,
    code: invoiceCode,
    created_at: nowIso,
    paid_at: nowIso,
    student_id: studentData.leadId || `std-${Date.now()}`,
    studentName: studentData.studentName,
    parentPhone: studentData.parentPhone,
    className: classNamesFormatted,
    sessions_added: totalSessionsSum,
    amount: totalAmount,
    payment_method: paymentMethod === "VIETQR" ? "VietQR (Napas 247)" : paymentMethod,
    status: "paid",
    note: `Thu phí ghi danh phễu tuyển sinh cho ${studentData.studentName}`,
    student: {
      full_name: studentData.studentName,
      parent_phone: studentData.parentPhone,
      parent_name: studentData.parentName || "Phụ huynh",
    },
    class: {
      name: classNamesFormatted,
    },
  };

  try {
    const existingInvoicesRaw = localStorage.getItem("educenter_invoices_v1");
    const existingInvoices = existingInvoicesRaw ? JSON.parse(existingInvoicesRaw) : [];
    const updatedInvoices = [newInvoice, ...existingInvoices];
    localStorage.setItem("educenter_invoices_v1", JSON.stringify(updatedInvoices));
  } catch (e) {
    console.error("Error saving invoice to localStorage", e);
  }

  // 2. TÀI CHÍNH HỌC VIÊN: Sổ cái học viên (Customer Ledger)
  const newLedgerItem = {
    id: `ledger-${Date.now()}`,
    studentId: studentData.leadId || `std-${Date.now()}`,
    studentName: studentData.studentName,
    parentPhone: studentData.parentPhone,
    availableSessions: totalSessionsSum,
    totalBalanceSessions: totalSessionsSum,
    cumulativePaid: totalAmount,
    totalPaid: totalAmount,
    currentDebt: 0,
    lastUpdated: nowIso,
    classes: registeredSubjects.map((s) => ({
      id: s.trialClassId,
      name: s.className,
    })),
  };

  try {
    const existingLedgerRaw = localStorage.getItem("educenter_finance_ledger_v1");
    const existingLedger = existingLedgerRaw ? JSON.parse(existingLedgerRaw) : [];
    const idx = existingLedger.findIndex(
      (l: any) =>
        l.parentPhone === studentData.parentPhone ||
        l.studentName?.toLowerCase() === studentData.studentName?.toLowerCase()
    );

    let updatedLedger;
    if (idx >= 0) {
      const prev = existingLedger[idx];
      updatedLedger = [...existingLedger];
      const newBal = (prev.availableSessions || prev.totalBalanceSessions || 0) + totalSessionsSum;
      const newPaid = (prev.cumulativePaid || prev.totalPaid || 0) + totalAmount;
      updatedLedger[idx] = {
        ...prev,
        availableSessions: newBal,
        totalBalanceSessions: newBal,
        cumulativePaid: newPaid,
        totalPaid: newPaid,
        currentDebt: 0,
        lastUpdated: nowIso,
      };
    } else {
      updatedLedger = [newLedgerItem, ...existingLedger];
    }
    localStorage.setItem("educenter_finance_ledger_v1", JSON.stringify(updatedLedger));
  } catch (e) {
    console.error("Error saving ledger to localStorage", e);
  }

  // 3. HỌC SINH & XẾP LỚP: Tạo mới hồ sơ học sinh
  const newStudent = {
    id: `std-${Date.now()}`,
    full_name: studentData.studentName,
    parent_name: studentData.parentName || "Phụ huynh",
    parent_phone: studentData.parentPhone,
    status: "active",
    remainingSessions: totalSessionsSum,
    registeredClasses: registeredSubjects.map((s) => s.className),
    enrollments: registeredSubjects.map((s) => ({
      id: `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      balance_sessions: s.sessions || 12,
      joined_at: nowIso,
      class: {
        id: s.trialClassId,
        name: s.className,
      },
    })),
    created_at: nowIso,
  };

  try {
    const existingStudentsRaw = localStorage.getItem("educenter_students_v1");
    const existingStudents = existingStudentsRaw ? JSON.parse(existingStudentsRaw) : [];
    const updatedStudents = [newStudent, ...existingStudents];
    localStorage.setItem("educenter_students_v1", JSON.stringify(updatedStudents));
  } catch (e) {
    console.error("Error saving student to localStorage", e);
  }

  // 4. QUẢN LÝ LỚP HỌC: Tăng sĩ số thực tế (+1) & cập nhật occupancy
  try {
    const existingClassesRaw = localStorage.getItem("educenter_classes_v1");
    if (existingClassesRaw) {
      const existingClasses = JSON.parse(existingClassesRaw);
      const updatedClasses = existingClasses.map((cls: any) => {
        const isTarget = registeredSubjects.some(
          (s) =>
            s.trialClassId === cls.id ||
            s.className.toLowerCase().includes(cls.name?.toLowerCase()) ||
            cls.name?.toLowerCase().includes(s.className.toLowerCase())
        );

        if (isTarget) {
          const currentEnrolled = Number(cls.enrolled_count || cls.enrolled || 18);
          const newEnrolled = currentEnrolled + 1;
          const maxCap = Number(cls.max_capacity || cls.maxCapacity || 20);
          const ratio = Math.round((newEnrolled / maxCap) * 100);
          const isNearFull = ratio >= 80;

          return {
            ...cls,
            enrolled: newEnrolled,
            enrolled_count: newEnrolled,
            occupancyRate: ratio,
            statusTag: isNearFull ? "Gần đầy" : cls.statusTag || "Đang mở",
          };
        }
        return cls;
      });
      localStorage.setItem("educenter_classes_v1", JSON.stringify(updatedClasses));
    }
  } catch (e) {
    console.error("Error updating classes in localStorage", e);
  }

  // 5. BroadCast Global Custom Event cho tất cả Client Views đang mở trên UI
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("educenter_global_sync", {
        detail: {
          type: "ENROLLMENT_COMPLETED",
          studentData,
          registeredSubjects,
          totalAmount,
          invoiceCode,
          invoice: newInvoice,
          student: newStudent,
        },
      })
    );
  }

  return {
    success: true,
    invoiceCode,
    invoice: newInvoice,
    student: newStudent,
  };
}
