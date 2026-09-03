"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ClassSession } from "@/types/database";

export async function getClassSessions(classId?: string, date?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("class_sessions")
    .select(`
      *,
      class:classes(*),
      teacher:profiles(*),
      attendance:attendance(count)
    `)
    .order("session_date", { ascending: false });

  if (classId) {
    query = query.eq("class_id", classId);
  }

  if (date) {
    query = query.eq("session_date", date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return (data || []).map((s: any) => ({
    ...s,
    attendance_count: s.attendance?.[0]?.count || 0,
  }));
}

export async function getTeacherSessions(teacherId?: string) {
  const supabase = await createClient();

  let currentTeacherId = teacherId;
  if (!currentTeacherId) {
    const { data: { user } } = await supabase.auth.getUser();
    currentTeacherId = user?.id;
  }

  if (!currentTeacherId) return [];

  // Lấy danh sách các lớp giáo viên này phụ trách
  const { data: myClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", currentTeacherId);

  const classIds = (myClasses || []).map(c => c.id);

  if (classIds.length === 0) return [];

  const { data, error } = await supabase
    .from("class_sessions")
    .select(`
      *,
      class:classes(*),
      teacher:profiles(*),
      attendance:attendance(count)
    `)
    .in("class_id", classIds)
    .order("session_date", { ascending: false });

  if (error) {
    console.error("Error fetching teacher sessions:", error);
    return [];
  }

  return (data || []).map((s: any) => ({
    ...s,
    attendance_count: s.attendance?.[0]?.count || 0,
  }));
}

export async function getTodaySessions() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("class_sessions")
    .select(`
      *,
      class:classes(*),
      teacher:profiles(*),
      attendance:attendance(count)
    `)
    .eq("session_date", today)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching today sessions:", error);
    return [];
  }

  return data;
}

export async function createClassSession(formData: FormData) {
  const supabase = await createClient();

  const class_id = formData.get("class_id") as string;
  const teacher_id = (formData.get("teacher_id") as string) || null;
  const session_date = formData.get("session_date") as string || new Date().toISOString().split("T")[0];
  const start_time = (formData.get("start_time") as string) || null;
  const end_time = (formData.get("end_time") as string) || null;
  const note = (formData.get("note") as string) || null;
  const status = (formData.get("status") as any) || "completed";

  if (!class_id) {
    return { error: "Vui lòng chọn Lớp học" };
  }

  const { data, error } = await supabase
    .from("class_sessions")
    .insert({
      class_id,
      teacher_id,
      session_date,
      start_time,
      end_time,
      note,
      status,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
  revalidatePath("/teacher/schedule");
  return { success: true, data };
}

export async function deleteClassSession(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("class_sessions").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/teacher/schedule");
  return { success: true };
}
