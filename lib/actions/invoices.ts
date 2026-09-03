"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Invoice } from "@/types/database";

export async function getInvoices(statusFilter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(`
      *,
      student:students(*),
      class:classes(*)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return data;
}

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();

  const student_id = formData.get("student_id") as string;
  const class_id = formData.get("class_id") as string;
  const sessions_added = Number(formData.get("sessions_added")) || 0;
  const amount = Number(formData.get("amount")) || 0;
  const rawIsPaid = formData.get("is_paid");
  const is_paid_immediately = rawIsPaid === "true" || rawIsPaid === "1" || rawIsPaid === "on";
  const payment_method = (formData.get("payment_method") as string) || (is_paid_immediately ? "cash" : "transfer");
  const note = (formData.get("note") as string)?.trim() || null;

  if (!student_id || !class_id || sessions_added <= 0 || amount <= 0) {
    return { error: "Vui lòng nhập đầy đủ thông tin học sinh, lớp, số buổi và số tiền hợp lệ" };
  }

  // 1. Xác định rõ ràng status và paid_at theo yêu cầu
  const status = is_paid_immediately ? "paid" : "pending";
  const paid_at = is_paid_immediately ? new Date().toISOString() : null;

  const invoicePayload: any = {
    student_id,
    class_id,
    sessions_added,
    amount,
    status,
    paid_at,
  };
  if (payment_method) invoicePayload.payment_method = payment_method;
  if (note) invoicePayload.note = note;

  let { data, error } = await supabase
    .from("invoices")
    .insert(invoicePayload)
    .select()
    .single();

  // Fallback if payment_method or note column does not exist in schema cache
  if (error && (error.message?.includes("payment_method") || error.message?.includes("note") || error.code === "PGRST204")) {
    const fallbackPayload = {
      student_id,
      class_id,
      sessions_added,
      amount,
      status,
      paid_at,
    };
    const res = await supabase.from("invoices").insert(fallbackPayload).select().single();
    data = res.data;
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  // 2. RẤT QUAN TRỌNG: Nếu is_paid_immediately = true -> TỰ ĐỘNG TĂNG balance_sessions ở bảng enrollments
  if (is_paid_immediately && student_id && class_id) {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, balance_sessions")
      .eq("student_id", student_id)
      .eq("class_id", class_id)
      .maybeSingle();

    if (enr) {
      await supabase
        .from("enrollments")
        .update({ balance_sessions: (enr.balance_sessions || 0) + sessions_added })
        .eq("id", enr.id);
    }
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { success: true, data };
}

export async function markInvoiceAsPaid(id: string) {
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("student_id, class_id, sessions_added")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Khi xác nhận đã thu -> Cộng ngay số buổi vào ví của học sinh
  if (invoice?.student_id && invoice?.class_id && invoice?.sessions_added) {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, balance_sessions")
      .eq("student_id", invoice.student_id)
      .eq("class_id", invoice.class_id)
      .maybeSingle();

    if (enr) {
      await supabase
        .from("enrollments")
        .update({ balance_sessions: (enr.balance_sessions || 0) + invoice.sessions_added })
        .eq("id", enr.id);
    }
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function cancelPendingInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function resolveNegativeDebt(enrollmentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ balance_sessions: 0 })
    .eq("id", enrollmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// Hàm dọn sạch các hóa đơn pending test (đặc biệt của học sinh Lâm hoặc tất cả pending) để đưa công nợ về 0đ
export async function cleanUpTestPendingInvoices(studentNameFilter?: string) {
  const supabase = await createClient();

  // 1. Fetch pending invoices
  const { data: pendingInvoices, error: fetchErr } = await supabase
    .from("invoices")
    .select("id, student_id, student:students(id, full_name)")
    .eq("status", "pending");

  if (fetchErr) return { error: fetchErr.message };

  let idsToDelete: string[] = [];
  if (pendingInvoices && pendingInvoices.length > 0) {
    if (!studentNameFilter || studentNameFilter === "ALL") {
      idsToDelete = pendingInvoices.map((inv: any) => inv.id);
    } else {
      const q = studentNameFilter.toLowerCase();
      idsToDelete = pendingInvoices
        .filter((inv: any) => {
          const name = (inv.student as any)?.full_name?.toLowerCase() || "";
          return name.includes(q);
        })
        .map((inv: any) => inv.id);
    }
  }

  if (idsToDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("invoices")
      .delete()
      .in("id", idsToDelete);

    if (delErr) return { error: delErr.message };
  }

  // 2. Kiểm tra nếu có học sinh bị âm buổi do test thì đưa về 0
  const { data: negEnrs } = await supabase
    .from("enrollments")
    .select("id, balance_sessions, student:students(full_name)")
    .lt("balance_sessions", 0);

  if (negEnrs && negEnrs.length > 0) {
    const enrIds = negEnrs
      .filter((enr: any) => {
        if (!studentNameFilter || studentNameFilter === "ALL") return true;
        const name = (enr.student as any)?.full_name?.toLowerCase() || "";
        return name.includes(studentNameFilter.toLowerCase());
      })
      .map((e: any) => e.id);

    if (enrIds.length > 0) {
      await supabase.from("enrollments").update({ balance_sessions: 0 }).in("id", enrIds);
    }
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/students");
  return { success: true, deletedCount: idsToDelete.length };
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
