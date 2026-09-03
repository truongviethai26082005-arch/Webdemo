"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@/types/database";

export interface AttendanceSheetItem {
  student_id: string;
  student_name: string;
  parent_phone: string;
  balance_sessions: number;
  attendance_id?: string;
  status: AttendanceStatus;
  note?: string;
}

export async function getAttendanceSheet(sessionId: string) {
  const supabase = await createClient();

  // 1. Lấy thông tin session và lớp
  const { data: session, error: sessionError } = await supabase
    .from("class_sessions")
    .select(`
      *,
      class:classes(*),
      teacher:profiles(*)
    `)
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    console.error("Session not found:", sessionError);
    return null;
  }

  // 2. Lấy danh sách học sinh ghi danh trong lớp này
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select(`
      balance_sessions,
      student:students(*)
    `)
    .eq("class_id", session.class_id)
    .order("student(full_name)", { ascending: true });

  if (enrollError) {
    console.error("Enrollments fetch error:", enrollError);
  }

  // 3. Lấy bản ghi điểm danh hiện có của buổi này (nếu đã điểm danh trước đó)
  const { data: existingAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("session_id", sessionId);

  const attendanceMap = new Map<string, any>();
  (existingAttendance || []).forEach((a) => {
    attendanceMap.set(a.student_id, a);
  });

  // 4. Ghép nối dữ liệu
  const roster: AttendanceSheetItem[] = (enrollments || [])
    .filter((e) => e.student && (e.student as any).status !== "dropped")
    .map((e) => {
      const student = e.student as any;
      const exist = attendanceMap.get(student.id);

      return {
        student_id: student.id,
        student_name: student.full_name,
        parent_phone: student.parent_phone,
        balance_sessions: e.balance_sessions,
        attendance_id: exist?.id,
        status: exist?.status || "present",
        note: exist?.note || "",
      };
    });

  return {
    session,
    roster,
  };
}

export async function saveAttendanceSheet(
  sessionId: string,
  items: { student_id: string; status: AttendanceStatus; note?: string }[]
) {
  const supabase = await createClient();

  if (!sessionId || !items || items.length === 0) {
    return { error: "Không có dữ liệu điểm danh để lưu" };
  }

  const rows = items.map((item) => ({
    session_id: sessionId,
    student_id: item.student_id,
    status: item.status,
    note: item.note || null,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "session_id,student_id" });

  if (error) {
    console.error("Error saving attendance sheet:", error);
    return { error: error.message };
  }

  // Cập nhật trạng thái buổi học thành 'completed'
  await supabase
    .from("class_sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);

  revalidatePath(`/teacher/attendance/${sessionId}`);
  revalidatePath(`/admin/attendance`);
  revalidatePath(`/admin/students`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/teacher/schedule`);

  return { success: true };
}
