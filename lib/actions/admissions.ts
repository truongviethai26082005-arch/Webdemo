"use server";

import { createStudent } from "@/lib/actions/students";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";

export interface ConvertLeadPayload {
  leadId: string;
  studentName: string;
  studentDob?: string;
  parentName: string;
  parentPhone: string;
  classId: string;
  initialSessions: number;
  depositAmount?: number;
  note?: string;
}

export async function convertLeadToStudentAction(payload: ConvertLeadPayload) {
  const guard = await requireRole(["admin", "sale"]);
  if (!guard.authorized) return { success: false, error: guard.error };

  try {
    const formData = new FormData();
    formData.set("full_name", payload.studentName.trim());
    if (payload.parentName) formData.set("parent_name", payload.parentName.trim());
    formData.set("parent_phone", payload.parentPhone.trim());
    if (payload.studentDob) formData.set("birth_date", payload.studentDob);
    if (payload.classId) formData.set("class_id", payload.classId);
    formData.set("initial_sessions", String(payload.initialSessions || 12));
    formData.set("status", "active");
    formData.set(
      "note",
      payload.note || `Chuyển đổi từ Tuyển sinh (Lead ID: ${payload.leadId})${payload.depositAmount ? ` - Đã cọc: ${payload.depositAmount.toLocaleString("vi-VN")} đ` : ""}`
    );

    const result = await createStudent(formData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    revalidatePath("/admin/admissions");
    revalidatePath("/admin/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/finance");

    return {
      success: true,
      student: result.data,
      message: `Đã chuyển đổi thành công học sinh ${payload.studentName} vào hệ thống chính thức!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi chuyển đổi học sinh";
    return { success: false, error: message };
  }
}
