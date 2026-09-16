"use server";

import { requireRole } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { syncStudentStatusFromEnrollments } from "@/lib/utils/enrollment-status";

export async function updateEnrollmentStatus(
  enrollmentId: string,
  newStatus: "active" | "paused" | "dropped"
) {
  // 1. Kiểm tra quyền admin qua guard chuẩn
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  // 2. Chuẩn bị dữ liệu cập nhật
  const updates: {
    status: "active" | "paused" | "dropped";
    paused_at: string | null;
  } = {
    status: newStatus,
    paused_at: newStatus === "paused" ? new Date().toISOString() : null,
  };

  // 3. Update vào database
  const { error } = await supabase
    .from("enrollments")
    .update(updates)
    .eq("id", enrollmentId);

  if (error) {
    console.error("Error updating enrollment status:", error);
    return { error: error.message };
  }

  // 4. Lấy student_id của enrollment đó rồi gọi syncStudentStatusFromEnrollments
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("id", enrollmentId)
    .single();

  if (enrollment?.student_id) {
    await syncStudentStatusFromEnrollments(supabase, enrollment.student_id);
  }

  // 5. Làm mới lại dữ liệu trang admin
  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");

  return { success: true };
}

