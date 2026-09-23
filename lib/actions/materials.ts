"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";

// Server Actions cho Tài nguyên học tập (Materials) — thuộc lãnh địa Teacher.
// Lưu dưới dạng LIÊN KẾT (Google Drive/Youtube/link file...), không upload file
// nhị phân — tránh phải dựng thêm hạ tầng Supabase Storage cho MVP.

export interface TeacherMaterialItem {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  class_name: string;
  type: string;
  file_url: string;
  created_at: string;
}

export async function getTeacherMaterials(): Promise<TeacherMaterialItem[]> {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return [];
  const { supabase, user, role } = guard.context;

  let query = supabase
    .from("materials")
    .select("id, title, description, class_id, type, file_url, created_at, class:classes(name)")
    .order("created_at", { ascending: false });

  if (role === "teacher") {
    query = query.eq("teacher_id", user.id);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    class_id: m.class_id,
    class_name: m.class?.name || "Lớp học",
    type: m.type || "link",
    file_url: m.file_url,
    created_at: m.created_at,
  }));
}

export interface CreateMaterialPayload {
  title: string;
  classId: string;
  type: string;
  fileUrl: string;
  description?: string;
}

export async function createMaterial(payload: CreateMaterialPayload) {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  if (!payload.title?.trim()) return { error: "Vui lòng nhập tên tài liệu" };
  if (!payload.classId) return { error: "Vui lòng chọn lớp học" };
  if (!payload.fileUrl?.trim()) return { error: "Vui lòng nhập liên kết tài liệu (Google Drive, YouTube...)" };

  const { data: cls } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", payload.classId)
    .single();

  if (!cls) return { error: "Lớp học không tồn tại" };
  if (role === "teacher" && cls.teacher_id !== user.id) {
    return { error: "Bạn không có quyền thêm tài liệu cho lớp này" };
  }

  const { error } = await supabase.from("materials").insert({
    title: payload.title.trim(),
    class_id: payload.classId,
    teacher_id: user.id,
    type: payload.type || "link",
    file_url: payload.fileUrl.trim(),
    description: payload.description?.trim() || null,
  });

  if (error) return { error: `Không thể thêm tài liệu: ${error.message}` };

  revalidatePath("/teacher/resources");
  revalidatePath("/student/resources");
  return { success: true };
}

export async function deleteMaterial(materialId: string) {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  const { data: material } = await supabase
    .from("materials")
    .select("id, teacher_id")
    .eq("id", materialId)
    .single();

  if (!material) return { error: "Tài liệu không tồn tại" };
  if (role === "teacher" && material.teacher_id !== user.id) {
    return { error: "Bạn không có quyền xóa tài liệu này" };
  }

  const { error } = await supabase.from("materials").delete().eq("id", materialId);
  if (error) return { error: `Không thể xóa tài liệu: ${error.message}` };

  revalidatePath("/teacher/resources");
  revalidatePath("/student/resources");
  return { success: true };
}
