"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Profile, TeacherPayroll, TeacherSessionDetail } from "@/types/database";

export async function getTeachers() {
  const supabase = await createClient();

  // CHỈ lấy các user có role = 'teacher' (Ẩn hoàn toàn tài khoản Admin)
  const { data: teachers, error } = await supabase
    .from("profiles")
    .select(`
      *,
      classes:classes(id, name)
    `)
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }

  return teachers;
}

export async function createTeacher(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const phone = (formData.get("phone") as string) || null;
  const salary_per_session = Number(formData.get("salary_per_session")) || 0;
  const role = "teacher"; // Mặc định luôn là giáo viên
  const bank_name = (formData.get("bank_name") as string)?.trim() || null;
  const bank_account_no = (formData.get("bank_account_no") as string)?.trim() || null;

  if (!email || !password || !full_name) {
    return { error: "Vui lòng nhập đầy đủ Email, Mật khẩu và Họ tên giáo viên" };
  }

  const adminClient = createAdminClient();

  // Tạo tài khoản bằng Admin API
  const { data: userData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (userData.user) {
    const profilePayload: any = {
      id: userData.user.id,
      full_name,
      phone,
      role,
      salary_per_session,
    };
    if (bank_name) profilePayload.bank_name = bank_name;
    if (bank_account_no) profilePayload.bank_account_no = bank_account_no;

    let { error: pErr } = await adminClient
      .from("profiles")
      .upsert(profilePayload);

    // Fallback nếu schema chưa có cột bank_
    if (pErr && (pErr.message?.includes("bank_") || pErr.code === "PGRST204")) {
      delete profilePayload.bank_name;
      delete profilePayload.bank_account_no;
      await adminClient.from("profiles").upsert(profilePayload);
    }
  }

  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function updateTeacher(id: string, formData: FormData) {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const phone = (formData.get("phone") as string) || null;
  const salary_per_session = Number(formData.get("salary_per_session")) || 0;
  const bank_name = (formData.get("bank_name") as string)?.trim() || null;
  const bank_account_no = (formData.get("bank_account_no") as string)?.trim() || null;

  const profilePayload: any = {
    full_name,
    phone,
    salary_per_session,
    role: "teacher",
  };
  if (bank_name !== null) profilePayload.bank_name = bank_name;
  if (bank_account_no !== null) profilePayload.bank_account_no = bank_account_no;

  let { error } = await supabase
    .from("profiles")
    .update(profilePayload)
    .eq("id", id);

  if (error && (error.message?.includes("bank_") || error.code === "PGRST204")) {
    delete profilePayload.bank_name;
    delete profilePayload.bank_account_no;
    const res = await supabase.from("profiles").update(profilePayload).eq("id", id);
    error = res.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function getTeacherPayroll(month?: number, year?: number): Promise<TeacherPayroll[]> {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = month || now.getMonth() + 1;
  const currentYear = year || now.getFullYear();

  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  // 1. Lấy danh sách giáo viên (CHỈ role = 'teacher')
  const { data: teachers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  if (!teachers || teachers.length === 0) return [];

  // 2. Lấy các buổi học hoàn thành trong tháng
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select(`
      id,
      teacher_id,
      session_date,
      start_time,
      end_time,
      status,
      class:classes(id, name, room),
      attendance:attendance(count)
    `)
    .eq("status", "completed")
    .gte("session_date", startDate)
    .lt("session_date", endDate)
    .order("session_date", { ascending: false });

  // Nhóm danh sách ca dạy theo từng giáo viên
  const teacherSessionsMap = new Map<string, TeacherSessionDetail[]>();
  (sessions || []).forEach((s: any) => {
    if (s.teacher_id) {
      const list = teacherSessionsMap.get(s.teacher_id) || [];
      list.push({
        id: s.id,
        sessionDate: s.session_date,
        startTime: s.start_time,
        endTime: s.end_time,
        status: s.status,
        className: s.class?.name || "Lớp học",
        room: s.class?.room || "",
        attendanceCount: s.attendance?.[0]?.count || 0,
      });
      teacherSessionsMap.set(s.teacher_id, list);
    }
  });

  return teachers.map((t) => {
    const teacherSessions = teacherSessionsMap.get(t.id) || [];
    const completedSessions = teacherSessions.length;
    const salaryPerSession = t.salary_per_session || 0;
    return {
      teacher: t as Profile,
      completedSessions,
      salaryPerSession,
      totalSalary: completedSessions * salaryPerSession,
      sessions: teacherSessions,
    };
  });
}

export async function getTeacherPersonalEarnings(teacherId?: string, month?: number, year?: number) {
  const supabase = await createClient();

  let currentTeacherId = teacherId;
  if (!currentTeacherId) {
    const { data: { user } } = await supabase.auth.getUser();
    currentTeacherId = user?.id;
  }

  if (!currentTeacherId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentTeacherId)
    .single();

  const salaryPerSession = profile?.salary_per_session || 0;

  const now = new Date();
  const currentMonth = month || now.getMonth() + 1;
  const currentYear = year || now.getFullYear();

  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data: myClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", currentTeacherId);

  const classIds = (myClasses || []).map((c) => c.id);

  let sessionsQuery = supabase
    .from("class_sessions")
    .select(`
      *,
      class:classes(*),
      attendance:attendance(count)
    `)
    .gte("session_date", startDate)
    .lt("session_date", endDate)
    .order("session_date", { ascending: false });

  if (classIds.length > 0) {
    sessionsQuery = sessionsQuery.or(`teacher_id.eq.${currentTeacherId},class_id.in.(${classIds.join(",")})`);
  } else {
    sessionsQuery = sessionsQuery.eq("teacher_id", currentTeacherId);
  }

  const { data: sessions } = await sessionsQuery;

  const allSessions = (sessions || []).map((s: any) => ({
    ...s,
    attendance_count: s.attendance?.[0]?.count || 0,
    session_salary: s.status === "completed" ? salaryPerSession : 0,
  }));

  const completedSessions = allSessions.filter((s) => s.status === "completed");
  const upcomingSessions = allSessions.filter((s) => s.status === "scheduled");

  const actualEarnings = completedSessions.length * salaryPerSession;
  const projectedEarnings = (completedSessions.length + upcomingSessions.length) * salaryPerSession;

  return {
    teacher: profile as Profile,
    salaryPerSession,
    month: currentMonth,
    year: currentYear,
    completedSessionsCount: completedSessions.length,
    upcomingSessionsCount: upcomingSessions.length,
    actualEarnings,
    projectedEarnings,
    sessions: allSessions,
  };
}
