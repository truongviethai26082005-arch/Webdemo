"use server";

import { createClient } from "@/lib/supabase/server";
import { getTeacherPayroll } from "@/lib/actions/teachers";
import { TeacherPayroll } from "@/types/database";

export interface StudentLedgerItem {
  id: string;
  name: string;
  phone: string;
  classes: {
    id: string;
    name: string;
    feePerSession: number;
    balanceSessions: number;
  }[];
  totalBalanceSessions: number;
  totalPaid: number;
  currentDebt: number;
  needsReminder: boolean;
  status: string;
}

export interface FinancialKPIs {
  totalAvailableSessions: number;
  totalUnpaidDebt: number;
  studentsNeedingReminderCount: number;
  totalCollectedThisMonth: number;
}

export interface TransactionInvoice {
  id: string;
  code: string;
  createdAt: string;
  paidAt?: string | null;
  studentId: string;
  studentName: string;
  studentCode?: string;
  parentPhone: string;
  classId: string;
  className: string;
  sessionsAdded: number;
  amount: number;
  status: "paid" | "pending" | "cancelled";
  paymentMethod: "cash" | "transfer";
  note?: string | null;
}

export interface LedgerTimelineEntry {
  id: string;
  date: string;
  type: "deposit" | "attendance";
  title: string;
  className: string;
  sessionsChange: number; // e.g. +12 or -1
  amountChange: number;   // e.g. +1.800.000 or 0
  status: string;
  paymentMethod?: string;
  note?: string;
}

export async function getFinancialHubData() {
  const supabase = await createClient();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const endOfMonth = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  // 1. Lấy toàn bộ học sinh cùng danh sách lớp đã ghi danh
  const { data: rawStudents, error: stErr } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      parent_phone,
      status,
      enrollments:enrollments(
        id,
        balance_sessions,
        class:classes(
          id,
          name,
          fee_per_session
        )
      )
    `)
    .order("full_name", { ascending: true });

  if (stErr) {
    console.error("Error fetching students for financial hub:", stErr);
  }

  // 2. Lấy toàn bộ hóa đơn từ trước đến nay
  const { data: rawInvoices, error: invErr } = await supabase
    .from("invoices")
    .select(`
      *,
      student:students(id, full_name, parent_phone),
      class:classes(id, name, fee_per_session)
    `)
    .order("created_at", { ascending: false });

  if (invErr) {
    console.error("Error fetching invoices for financial hub:", invErr);
  }

  const invoices = rawInvoices || [];
  const students = rawStudents || [];

  // Gom hóa đơn theo student_id
  const studentPaidMap = new Map<string, number>();
  const studentPendingInvoicesMap = new Map<string, any[]>();
  let totalCollectedThisMonth = 0;

  invoices.forEach((inv: any) => {
    const amount = Number(inv.amount) || 0;
    if (inv.status === "paid") {
      studentPaidMap.set(
        inv.student_id,
        (studentPaidMap.get(inv.student_id) || 0) + amount
      );
      if (inv.paid_at && inv.paid_at >= startOfMonth && inv.paid_at < endOfMonth) {
        totalCollectedThisMonth += amount;
      }
    } else if (inv.status === "pending") {
      const list = studentPendingInvoicesMap.get(inv.student_id) || [];
      list.push(inv);
      studentPendingInvoicesMap.set(inv.student_id, list);
    }
  });

  // Xây dựng danh sách Customer Ledger từng học sinh
  let totalAvailableSessions = 0;
  let totalUnpaidDebt = 0;
  let studentsNeedingReminderCount = 0;

  const customerLedger: StudentLedgerItem[] = students.map((st: any) => {
    const enrollments = (st.enrollments || []).map((e: any) => {
      const cls = Array.isArray(e.class) ? e.class[0] : e.class;
      return {
        id: cls?.id || "",
        name: cls?.name || "Lớp học",
        feePerSession: Number(cls?.fee_per_session) || 0,
        balanceSessions: Number(e.balance_sessions) || 0,
      };
    });

    const totalBalanceSessions = enrollments.reduce(
      (sum: number, e: any) => sum + e.balanceSessions,
      0
    );

    if (totalBalanceSessions > 0) {
      totalAvailableSessions += totalBalanceSessions;
    }

    const totalPaid = studentPaidMap.get(st.id) || 0;

    // Công nợ từ hóa đơn pending
    const pendingList = studentPendingInvoicesMap.get(st.id) || [];
    const pendingAmount = pendingList.reduce(
      (sum: number, inv: any) => sum + (Number(inv.amount) || 0),
      0
    );

    // Công nợ từ số buổi âm (tránh tính đúp nếu đã có HĐ pending cho lớp đó)
    const pendingClassIds = new Set(pendingList.map((inv: any) => inv.class_id));
    let negativeDebt = 0;
    enrollments.forEach((e: any) => {
      if (e.balanceSessions < 0 && !pendingClassIds.has(e.id)) {
        negativeDebt += Math.abs(e.balanceSessions) * e.feePerSession;
      }
    });

    const currentDebt = pendingAmount + negativeDebt;
    totalUnpaidDebt += currentDebt;

    const needsReminder = enrollments.some((e: any) => e.balanceSessions <= 2);
    if (needsReminder && st.status === "active") {
      studentsNeedingReminderCount += 1;
    }

    return {
      id: st.id,
      name: st.full_name,
      phone: st.parent_phone || "",
      classes: enrollments,
      totalBalanceSessions,
      totalPaid,
      currentDebt,
      needsReminder,
      status: st.status || "active",
    };
  });

  // Định dạng danh sách Transaction Logs (Nhật ký giao dịch)
  const transactionLogs: TransactionInvoice[] = invoices.map((inv: any, idx: number) => {
    const student = Array.isArray(inv.student) ? inv.student[0] : inv.student;
    const cls = Array.isArray(inv.class) ? inv.class[0] : inv.class;
    const shortId = inv.id ? inv.id.slice(0, 6).toUpperCase() : `${1000 + idx}`;

    return {
      id: inv.id,
      code: `HD-${shortId}`,
      createdAt: inv.created_at,
      paidAt: inv.paid_at,
      studentId: inv.student_id,
      studentName: student?.full_name || "Học sinh",
      parentPhone: student?.parent_phone || "",
      classId: inv.class_id,
      className: cls?.name || "Lớp học",
      sessionsAdded: Number(inv.sessions_added) || 0,
      amount: Number(inv.amount) || 0,
      status: inv.status || "pending",
      paymentMethod: inv.payment_method === "cash" ? "cash" : "transfer",
      note: inv.note,
    };
  });

  // Lấy dữ liệu Bảng lương giáo viên tháng này
  const payrollData: TeacherPayroll[] = await getTeacherPayroll(currentMonth, currentYear);

  return {
    customerLedger,
    transactionLogs,
    payrollData,
    kpis: {
      totalAvailableSessions,
      totalUnpaidDebt,
      studentsNeedingReminderCount,
      totalCollectedThisMonth,
    },
    currentMonth,
    currentYear,
  };
}

/**
 * Truy vấn toàn bộ lịch sử nạp học phí & các buổi học bị trừ điểm danh của học sinh
 * để hiển thị Sổ Sao Kê Khách Hàng (Customer Ledger Statement)
 */
export async function getStudentLedgerHistory(studentId: string): Promise<LedgerTimelineEntry[]> {
  const supabase = await createClient();

  // 1. Lấy tất cả hóa đơn nạp học phí
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      class:classes(name)
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  // 2. Lấy tất cả lượt điểm danh ca học (mỗi lần điểm danh có mặt hoặc vắng không phép trừ 1 buổi)
  const { data: attendances } = await supabase
    .from("attendance")
    .select(`
      id,
      status,
      created_at,
      session:class_sessions(
        id,
        session_date,
        start_time,
        end_time,
        class:classes(name)
      )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  const timeline: LedgerTimelineEntry[] = [];

  // Chuyển đổi invoices
  (invoices || []).forEach((inv: any) => {
    const cls = Array.isArray(inv.class) ? inv.class[0] : inv.class;
    const isPaid = inv.status === "paid";
    timeline.push({
      id: `inv-${inv.id}`,
      date: inv.paid_at || inv.created_at,
      type: "deposit",
      title: isPaid
        ? `Nạp +${inv.sessions_added} buổi học (${inv.payment_method === "cash" ? "Tiền mặt" : "VietQR"})`
        : `Tạo phiếu thu +${inv.sessions_added} buổi (Chờ thanh toán)`,
      className: cls?.name || "Lớp học",
      sessionsChange: isPaid ? Number(inv.sessions_added) : 0,
      amountChange: Number(inv.amount),
      status: inv.status,
      paymentMethod: inv.payment_method,
      note: inv.note,
    });
  });

  // Chuyển đổi attendances
  (attendances || []).forEach((att: any) => {
    const sess = Array.isArray(att.session) ? att.session[0] : att.session;
    const cls = sess ? (Array.isArray(sess.class) ? sess.class[0] : sess.class) : null;
    const dateStr = sess?.session_date || att.created_at.split("T")[0];
    const timeStr = sess ? `${sess.start_time} - ${sess.end_time}` : "";

    let statusText = "Có mặt";
    if (att.status === "absent_excused") statusText = "Vắng có phép (Bảo lưu)";
    else if (att.status === "absent_unexcused") statusText = "Vắng không phép (Trừ buổi)";

    const isConsumed = att.status === "present" || att.status === "absent_unexcused";

    timeline.push({
      id: `att-${att.id}`,
      date: sess?.session_date || att.created_at,
      type: "attendance",
      title: `Điểm danh ca học: ${timeStr} (${statusText})`,
      className: cls?.name || "Lớp học",
      sessionsChange: isConsumed ? -1 : 0,
      amountChange: 0,
      status: att.status,
      note: sess ? `Ca ngày ${dateStr}` : undefined,
    });
  });

  // Sắp xếp theo ngày giảm dần
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return timeline;
}
