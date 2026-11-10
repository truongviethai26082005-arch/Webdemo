"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  FeedbackTicket,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackChannel,
  StudentFeedback,
} from "@/types/database";

// ==========================================
// PHẢN ÁNH & GÓP Ý — Giai đoạn 1 (MVP)
// Sale tự ghi nhận + tự đánh dấu xử lý, chưa có định tuyến/SLA tự động.
// ==========================================

export async function getFeedbackTickets(
  statusFilter?: string,
  categoryFilter?: string
): Promise<FeedbackTicket[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  let query = supabase
    .from("feedback_tickets")
    .select(`
      *,
      student:students(*),
      created_by_profile:profiles!feedback_tickets_created_by_fkey(*)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (categoryFilter && categoryFilter !== "all") {
    query = query.eq("category", categoryFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error in getFeedbackTickets:", error.message || error);
    return [];
  }

  return (data as unknown as FeedbackTicket[]) || [];
}

export async function getFeedbackTicketsByStudent(studentId: string): Promise<FeedbackTicket[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data, error } = await supabase
    .from("feedback_tickets")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error in getFeedbackTicketsByStudent:", error.message || error);
    return [];
  }

  return (data as unknown as FeedbackTicket[]) || [];
}

export interface CreateFeedbackTicketPayload {
  studentId?: string;
  contactName: string;
  contactPhone: string;
  category: FeedbackCategory;
  channel: FeedbackChannel;
  content: string;
}

export async function createFeedbackTicket(payload: CreateFeedbackTicketPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  if (!payload.contactName?.trim() || !payload.contactPhone?.trim()) {
    return { error: "Vui lòng nhập tên và số điện thoại người phản ánh" };
  }
  if (!payload.content?.trim()) {
    return { error: "Vui lòng nhập nội dung phản ánh" };
  }
  if (!payload.category) {
    return { error: "Vui lòng chọn phân loại phản ánh" };
  }

  const { data, error } = await supabase
    .from("feedback_tickets")
    .insert({
      student_id: payload.studentId || null,
      contact_name: payload.contactName.trim(),
      contact_phone: payload.contactPhone.trim(),
      category: payload.category,
      channel: payload.channel,
      content: payload.content.trim(),
      status: "new",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: `Không thể tạo phản ánh: ${error.message}` };
  }

  revalidatePath("/sale/feedback");
  return { success: true, data };
}

export interface UpdateFeedbackStatusPayload {
  id: string;
  status: FeedbackStatus;
  resolutionNote?: string;
}

export async function updateFeedbackTicketStatus(payload: UpdateFeedbackStatusPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const updateData: Record<string, unknown> = {
    status: payload.status,
    updated_at: new Date().toISOString(),
  };

  if (payload.resolutionNote !== undefined) {
    updateData.resolution_note = payload.resolutionNote.trim() || null;
  }

  if (payload.status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  } else {
    updateData.resolved_at = null;
  }

  const { error } = await supabase
    .from("feedback_tickets")
    .update(updateData)
    .eq("id", payload.id);

  if (error) {
    return { error: `Cập nhật trạng thái thất bại: ${error.message}` };
  }

  revalidatePath("/sale/feedback");
  return { success: true };
}

export interface FeedbackKpiStats {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
}

export async function getFeedbackKpiStats(): Promise<FeedbackKpiStats> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) {
    return { total: 0, newCount: 0, inProgressCount: 0, resolvedCount: 0 };
  }
  const { supabase } = guard.context;

  const { data, error } = await supabase.from("feedback_tickets").select("status");

  if (error || !data) {
    return { total: 0, newCount: 0, inProgressCount: 0, resolvedCount: 0 };
  }

  let newCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  for (const t of data) {
    if (t.status === "new") newCount++;
    else if (t.status === "in_progress") inProgressCount++;
    else if (t.status === "resolved") resolvedCount++;
  }

  return { total: data.length, newCount, inProgressCount, resolvedCount };
}

// ==========================================
// PHẢN HỒI TRỰC TIẾP TỪ HỌC SINH (bảng student_feedbacks — học sinh tự gửi
// qua /student/feedback). Sale/Admin đọc + trả lời tại đây — trước đây bảng
// này không ai đọc, học sinh gửi xong "biến mất", không ai xử lý.
// ==========================================

export interface StudentFeedbackWithStudent extends StudentFeedback {
  student_name: string;
}

export async function getStudentFeedbackList(): Promise<StudentFeedbackWithStudent[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data, error } = await supabase
    .from("student_feedbacks")
    .select("*, student:students(full_name)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((f: any) => ({
    ...f,
    student_name: f.student?.full_name || "Học sinh",
  }));
}

export interface RespondStudentFeedbackPayload {
  id: string;
  status: "pending" | "processing" | "resolved";
  adminResponse: string;
}

export async function respondToStudentFeedback(payload: RespondStudentFeedbackPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!payload.adminResponse?.trim()) {
    return { error: "Vui lòng nhập nội dung phản hồi cho học sinh" };
  }

  const { error } = await supabase
    .from("student_feedbacks")
    .update({
      status: payload.status,
      admin_response: payload.adminResponse.trim(),
      responded_at: new Date().toISOString(),
    })
    .eq("id", payload.id);

  if (error) return { error: `Không thể lưu phản hồi: ${error.message}` };

  revalidatePath("/sale/feedback");
  revalidatePath("/student/feedback");
  return { success: true };
}
