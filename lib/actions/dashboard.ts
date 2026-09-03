"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const today = now.toISOString().split("T")[0];

  // 1. Tổng số học sinh đang hoạt động
  const { count: totalStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 2. Tổng số lớp học
  const { count: activeClasses } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true });

  // 3. Số buổi dạy trong tháng
  const { count: monthlySessions } = await supabase
    .from("class_sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .gte("session_date", startDate)
    .lt("session_date", endDate);

  // 4. Doanh thu học phí trong tháng (CHỈ tính các hóa đơn có status = 'paid')
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("status", "paid")
    .gte("paid_at", startDate)
    .lt("paid_at", endDate);

  const monthlyRevenue = (paidInvoices || []).reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

  // 4b. Công nợ chưa thu CHUẨN:
  // (1) Hóa đơn PENDING (Chưa thanh toán)
  const { data: pendingInvoices } = await supabase
    .from("invoices")
    .select(`
      id,
      amount,
      sessions_added,
      created_at,
      status,
      student_id,
      class_id,
      student:students(id, full_name, parent_phone),
      class:classes(id, name, fee_per_session)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // (2) Học sinh bị âm buổi (balance_sessions < 0)
  const { data: negativeEnrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      class_id,
      balance_sessions,
      student:students(id, full_name, parent_phone),
      class:classes(id, name, fee_per_session)
    `)
    .lt("balance_sessions", 0);

  // Tránh đúp: Không cộng 2 lần nếu học sinh âm buổi đã có hóa đơn pending cho lớp đó
  const pendingPairs = new Set(
    (pendingInvoices || []).map((inv: any) => `${inv.student_id}_${inv.class_id}`)
  );

  const pendingItems = (pendingInvoices || []).map((inv: any) => {
    const student = Array.isArray(inv.student) ? inv.student[0] : inv.student;
    const cls = Array.isArray(inv.class) ? inv.class[0] : inv.class;
    return {
      id: inv.id,
      type: "pending_invoice" as const,
      invoiceId: inv.id,
      studentId: student?.id || inv.student_id,
      studentName: student?.full_name || "Học sinh",
      parentPhone: student?.parent_phone || "",
      classId: cls?.id || inv.class_id,
      className: cls?.name || "Lớp học",
      amount: Number(inv.amount) || 0,
      sessions: inv.sessions_added || 0,
      createdAt: inv.created_at,
      description: `Hóa đơn nạp ${inv.sessions_added} buổi đang chờ thanh toán`,
    };
  });

  const negativeItems: any[] = [];
  for (const rawEnr of (negativeEnrollments || [])) {
    const enr = rawEnr as any;
    const student = Array.isArray(enr.student) ? enr.student[0] : enr.student;
    const cls = Array.isArray(enr.class) ? enr.class[0] : enr.class;
    const key = `${enr.student_id}_${enr.class_id}`;
    if (!pendingPairs.has(key)) {
      const negativeSessions = Math.abs(Number(enr.balance_sessions) || 0);
      const fee = Number(cls?.fee_per_session) || 0;
      const debtAmount = negativeSessions * fee;

      negativeItems.push({
        id: enr.id,
        type: "negative_balance" as const,
        enrollmentId: enr.id,
        studentId: student?.id || enr.student_id,
        studentName: student?.full_name || "Học sinh",
        parentPhone: student?.parent_phone || "",
        classId: cls?.id || enr.class_id,
        className: cls?.name || "Lớp học",
        amount: debtAmount,
        sessions: negativeSessions,
        createdAt: new Date().toISOString(),
        description: `Học sinh đang nợ ${negativeSessions} buổi học`,
      });
    }
  }

  const allDebtDetails = [...pendingItems, ...negativeItems];
  const unpaidDebt = allDebtDetails.reduce((sum, item) => sum + item.amount, 0);
  const debtCount = allDebtDetails.length;

  // 5. Cảnh báo học sinh sắp hết buổi (balance_sessions <= 2)
  const { data: lowBalanceEnrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      balance_sessions,
      student:students!inner(*),
      class:classes!inner(*)
    `)
    .lte("balance_sessions", 2)
    .eq("student.status", "active")
    .order("balance_sessions", { ascending: true })
    .limit(10);

  // 6. Lịch học hôm nay
  const { data: todaySessions } = await supabase
    .from("class_sessions")
    .select(`
      *,
      class:classes(*),
      teacher:profiles(*),
      attendance:attendance(count)
    `)
    .eq("session_date", today)
    .order("start_time", { ascending: true });

  return {
    totalStudents: totalStudents || 0,
    activeClasses: activeClasses || 0,
    monthlySessions: monthlySessions || 0,
    monthlyRevenue,
    unpaidDebt,
    debtCount,
    debtDetails: allDebtDetails,
    lowBalanceList: (lowBalanceEnrollments || []).map((e: any) => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      studentName: e.student.full_name,
      parentPhone: e.student.parent_phone,
      classId: e.class.id,
      className: e.class.name,
      feePerSession: e.class.fee_per_session,
      balanceSessions: e.balance_sessions,
    })),
    todaySessions: (todaySessions || []).map((s: any) => ({
      ...s,
      attendance_count: s.attendance?.[0]?.count || 0,
    })),
  };
}
