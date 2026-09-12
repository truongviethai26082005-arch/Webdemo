"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@/types/database";
import { requireRole } from "@/lib/auth/guards";
import { syncStudentStatusFromEnrollments } from "@/lib/utils/enrollment-status";

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    // admin: toàn quyền truy cập
  } else if (profile?.role === "teacher") {
    const { data: sessionCheck } = await supabase
      .from("class_sessions")
      .select("teacher_id")
      .eq("id", sessionId)
      .single();

    if (!sessionCheck || sessionCheck.teacher_id !== user.id) {
      return null;
    }
  } else {
    return null;
  }

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
  // 1. Kiểm tra đăng nhập và phân quyền qua guard chuẩn
  const guard = await requireRole(["admin", "teacher"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  if (!sessionId || !items || items.length === 0) {
    return { error: "Không có dữ liệu điểm danh để lưu" };
  }

  // 2. Kiểm tra thông tin ca học và quyền sở hữu nếu là teacher
  const { data: sessionData, error: sessionFetchErr } = await supabase
    .from("class_sessions")
    .select("id, class_id, teacher_id, status")
    .eq("id", sessionId)
    .single();

  if (sessionFetchErr || !sessionData) {
    return { error: "Không tìm thấy thông tin ca học" };
  }

  if (role === "teacher" && sessionData.teacher_id !== user.id) {
    return { error: "Không có quyền truy cập ca dạy này" };
  }

  // Buổi học đã bị hủy: không tạo điểm danh, không trừ buổi, không tính lương (AGENTS.md Mục 6)
  if (sessionData.status === "cancelled") {
    return { error: "Buổi học này đã bị hủy, không thể điểm danh" };
  }

  // Lấy trạng thái điểm danh CŨ (nếu có) trước khi ghi đè, để chỉ trừ/hoàn đúng phần
  // THAY ĐỔI so với lần lưu trước — tránh trừ lại từ đầu mỗi lần bấm lưu (double-deduction
  // khi sửa/lưu lại nhiều lần cho cùng 1 buổi).
  const { data: existingAttendance } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("session_id", sessionId);

  const previousStatusMap = new Map<string, AttendanceStatus>();
  (existingAttendance || []).forEach((a: any) => previousStatusMap.set(a.student_id, a.status));

  // present VÀ absent_unexcused đều trừ buổi (AGENTS.md Mục 6) — absent_excused thì không.
  const isConsuming = (status: AttendanceStatus) =>
    status === "present" || status === "absent_unexcused";

  // 3. Lưu bảng điểm danh
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

  // 4. Trừ/hoàn balance_sessions CHỈ cho học sinh có trạng thái thay đổi so với lần lưu
  // trước, và kích hoạt paused/active lại tương ứng khi hết/còn buổi.
  const deltaByStudent = new Map<string, number>();
  for (const item of items) {
    const wasConsuming = isConsuming(previousStatusMap.get(item.student_id) as AttendanceStatus);
    const nowConsuming = isConsuming(item.status);
    if (wasConsuming === nowConsuming) continue; // không đổi trạng thái tiêu buổi -> không đụng balance
    deltaByStudent.set(item.student_id, nowConsuming ? -1 : 1);
  }
  const changedStudentIds = Array.from(deltaByStudent.keys());

  const updateErrors: string[] = [];

  if (changedStudentIds.length > 0) {
    const { data: currentEnrollments, error: enrollFetchErr } = await supabase
      .from("enrollments")
      .select("id, student_id, balance_sessions, status")
      .eq("class_id", sessionData.class_id)
      .in("student_id", changedStudentIds);

    if (enrollFetchErr) {
      console.error("Error fetching enrollments for attendance update:", enrollFetchErr);
      updateErrors.push(enrollFetchErr.message);
    } else if (currentEnrollments && currentEnrollments.length > 0) {
      const nowIso = new Date().toISOString();
      const updatedStudentIds = new Set<string>();

      for (const enrollment of currentEnrollments) {
        const delta = deltaByStudent.get(enrollment.student_id) ?? 0;
        if (delta === 0) continue;

        const currentBalance = enrollment.balance_sessions ?? 0;
        const newBalance = currentBalance + delta;

        const updatePayload: {
          balance_sessions: number;
          status?: string;
          paused_at?: string | null;
        } = {
          balance_sessions: newBalance,
        };

        // Nếu sau khi trừ mà hết buổi (<= 0) và đang active -> chuyển paused
        if (delta < 0 && newBalance <= 0 && enrollment.status === "active") {
          updatePayload.status = "paused";
          updatePayload.paused_at = nowIso;
        } else if (delta > 0 && newBalance > 0 && enrollment.status === "paused") {
          // Hoàn buổi (vd sửa lại thành vắng có phép) làm balance dương trở lại -> active lại
          updatePayload.status = "active";
          updatePayload.paused_at = null;
        }

        const { error: updateErr } = await supabase
          .from("enrollments")
          .update(updatePayload)
          .eq("id", enrollment.id);

        if (updateErr) {
          console.error(`Error updating enrollment balance for student ${enrollment.student_id}:`, updateErr);
          updateErrors.push(`Học sinh ${enrollment.student_id}: ${updateErr.message}`);
        } else {
          updatedStudentIds.add(enrollment.student_id);
        }
      }

      // Đồng bộ trạng thái học sinh sau khi đã cập nhật enrollments
      for (const sId of updatedStudentIds) {
        await syncStudentStatusFromEnrollments(supabase, sId);
      }
    }
  }

  // 5. Cập nhật trạng thái buổi học thành 'completed'
  await supabase
    .from("class_sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);

  revalidatePath(`/teacher/attendance/${sessionId}`);
  revalidatePath(`/admin/attendance`);
  revalidatePath(`/admin/students`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/teacher/schedule`);

  if (updateErrors.length > 0) {
    return {
      error: `Một số học sinh chưa được cập nhật số buổi: ${updateErrors.join("; ")}`,
    };
  }

  return { success: true };
}
