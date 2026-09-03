"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Student } from "@/types/database";

export async function getStudents(filterStatus?: string, search?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select(`
      *,
      enrollments:enrollments(
        id,
        class_id,
        balance_sessions,
        joined_at,
        class:classes(id, name, fee_per_session)
      )
    `)
    .order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,parent_phone.ilike.%${search}%,parent_name.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }

  return data;
}

export async function getStudentById(id: string) {
  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select(`
      *,
      enrollments:enrollments(
        id,
        class_id,
        balance_sessions,
        joined_at,
        class:classes(*)
      ),
      invoices:invoices(
        id,
        amount,
        sessions_added,
        status,
        paid_at,
        created_at,
        class:classes(id, name)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching student details:", error);
    return null;
  }

  return student;
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();

  const full_name = (formData.get("full_name") as string)?.trim();
  const parent_name = (formData.get("parent_name") as string)?.trim() || null;
  const parent_phone = (formData.get("parent_phone") as string)?.trim();
  const status = (formData.get("status") as any) || "active";
  const birth_date = (formData.get("birth_date") as string) || null;
  const note = (formData.get("note") as string)?.trim() || null;
  const class_id = (formData.get("class_id") as string) || null;
  const rawSessions = formData.get("initial_sessions");
  const initial_sessions = rawSessions !== null && rawSessions !== undefined && rawSessions !== ""
    ? Number(rawSessions)
    : 12;

  if (!full_name || !parent_phone) {
    return { error: "Vui lòng nhập đầy đủ Tên học sinh và SĐT phụ huynh" };
  }

  const payload: any = {
    full_name,
    parent_name,
    parent_phone,
    status,
  };
  if (birth_date) payload.birth_date = birth_date;
  if (note) payload.note = note;

  let { data: student, error } = await supabase
    .from("students")
    .insert(payload)
    .select()
    .single();

  // Gracefully fallback if birth_date or note columns are not yet in Supabase schema
  if (error && (error.message?.includes("birth_date") || error.message?.includes("note") || error.code === "PGRST204")) {
    const fallbackPayload = {
      full_name,
      parent_name,
      parent_phone,
      status,
    };
    const res = await supabase.from("students").insert(fallbackPayload).select().single();
    student = res.data;
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  // Nếu có chọn lớp ban đầu -> Thêm vào enrollments với số buổi mua ban đầu
  if (class_id && student) {
    const { error: enrollError } = await supabase.from("enrollments").insert({
      student_id: student.id,
      class_id,
      balance_sessions: isNaN(initial_sessions) ? 12 : initial_sessions,
    });

    if (enrollError) {
      console.error("Error creating initial enrollment:", enrollError);
    }
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
  return { success: true, data: student };
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();

  const full_name = (formData.get("full_name") as string)?.trim();
  const parent_name = (formData.get("parent_name") as string)?.trim() || null;
  const parent_phone = (formData.get("parent_phone") as string)?.trim();
  const status = (formData.get("status") as any) || "active";
  const birth_date = (formData.get("birth_date") as string) || null;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!full_name || !parent_phone) {
    return { error: "Vui lòng nhập đầy đủ Tên học sinh và SĐT phụ huynh" };
  }

  const payload: any = {
    full_name,
    parent_name,
    parent_phone,
    status,
  };
  if (birth_date) payload.birth_date = birth_date;
  if (note) payload.note = note;

  let { data: student, error } = await supabase
    .from("students")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error && (error.message?.includes("birth_date") || error.message?.includes("note") || error.code === "PGRST204")) {
    const fallbackPayload = {
      full_name,
      parent_name,
      parent_phone,
      status,
    };
    const res = await supabase.from("students").update(fallbackPayload).eq("id", id).select().single();
    student = res.data;
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true, data: student };
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function enrollStudentInClass(student_id: string, class_id: string, initial_sessions: number = 0) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .upsert({
      student_id,
      class_id,
      balance_sessions: initial_sessions,
    }, { onConflict: "student_id,class_id" })
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/classes/${class_id}`);
  return { success: true, data };
}

export async function removeStudentFromClass(enrollmentId: string, classId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  if (classId) revalidatePath(`/admin/classes/${classId}`);
  return { success: true };
}

export async function updateEnrollmentBalance(enrollmentId: string, newBalance: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ balance_sessions: newBalance })
    .eq("id", enrollmentId);

  if (error) return { error: error.message };

  revalidatePath("/admin/students");
  return { success: true };
}

export async function getLowBalanceStudents(threshold: number = 2) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      balance_sessions,
      student:students!inner(*),
      class:classes!inner(*)
    `)
    .lte("balance_sessions", threshold)
    .eq("student.status", "active")
    .order("balance_sessions", { ascending: true });

  if (error) {
    console.error("Error fetching low balance students:", error);
    return [];
  }

  return data;
}
