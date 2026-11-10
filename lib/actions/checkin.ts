"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import type { AttendanceCheckin } from "@/types/database";

// Server Actions cho tính năng Điểm danh qua QR/mã số (Teacher mở mã, Student
// tự quét/nhập). File MỚI, không sửa lib/actions/attendance.ts.
//
// QUAN TRỌNG: các hàm dưới đây KHÔNG đụng tới balance_sessions. Chúng chỉ ghi
// nhận "học sinh đã quét mã" vào bảng attendance_checkins. Giáo viên vẫn phải
// tự bấm "Lưu Bảng Điểm Danh" ở /teacher/attendance/[sessionId] để
// saveAttendanceSheet() (lib/actions/attendance.ts) trừ buổi như cũ — tránh 2
// nguồn xử lý trừ buổi song song (AGENTS.md mục 6, đã từng gây lỗi trừ 2 lần).

const CODE_TTL_SECONDS = 30;

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function assertTeacherOwnsSession(
  supabase: any,
  sessionId: string,
  userId: string,
  role: string
): Promise<{ ok: true; classId: string } | { ok: false; error: string }> {
  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, class_id, teacher_id, status")
    .eq("id", sessionId)
    .single();

  if (!session) return { ok: false, error: "Không tìm thấy buổi học" };
  if (role === "teacher" && session.teacher_id !== userId) {
    return { ok: false, error: "Bạn không có quyền truy cập buổi học này" };
  }
  if (session.status === "cancelled") {
    return { ok: false, error: "Buổi học này đã bị hủy, không thể mở mã điểm danh" };
  }
  return { ok: true, classId: session.class_id };
}

export interface AttendanceCheckinCodeView {
  code: string;
  qrToken: string;
  expiresAt: string;
}

// Mở mã mới hoặc rotate mã hiện có cho 1 buổi học. Client gọi lại hàm này mỗi
// ~30s để làm mới mã (đơn giản hơn cron/job nền, không cần thêm hạ tầng).
export async function openOrRotateCheckinCode(
  sessionId: string
): Promise<{ error: string } | { success: true; data: AttendanceCheckinCodeView }> {
  const guard = await requireRole(["admin", "teacher"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  const ownership = await assertTeacherOwnsSession(supabase, sessionId, user.id, role);
  if (!ownership.ok) return { error: ownership.error };

  const code = generateSixDigitCode();
  const qrToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000).toISOString();

  const { error } = await supabase.from("attendance_checkin_codes").upsert(
    {
      session_id: sessionId,
      code,
      qr_token: qrToken,
      expires_at: expiresAt,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );

  if (error) return { error: `Không thể tạo mã điểm danh: ${error.message}` };

  return { success: true, data: { code, qrToken, expiresAt } };
}

// Đóng mã ngay lập tức (giáo viên bấm "Đóng mã" trước khi hết 30s tự nhiên).
export async function closeCheckinCode(sessionId: string): Promise<{ error?: string; success?: true }> {
  const guard = await requireRole(["admin", "teacher"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  const ownership = await assertTeacherOwnsSession(supabase, sessionId, user.id, role);
  if (!ownership.ok) return { error: ownership.error };

  const { error } = await supabase
    .from("attendance_checkin_codes")
    .delete()
    .eq("session_id", sessionId);

  if (error) return { error: `Không thể đóng mã điểm danh: ${error.message}` };
  return { success: true };
}

export interface CheckinListItem {
  student_id: string;
  student_name: string;
  checked_in_at: string;
}

// Danh sách học sinh đã quét cho buổi học — Teacher poll hàm này để hiện
// "danh sách đã quét theo thời gian thực" như yêu cầu.
export async function getSessionCheckins(sessionId: string): Promise<CheckinListItem[]> {
  const guard = await requireRole(["admin", "teacher"]);
  if (!guard.authorized) return [];
  const { supabase, user, role } = guard.context;

  const ownership = await assertTeacherOwnsSession(supabase, sessionId, user.id, role);
  if (!ownership.ok) return [];

  const { data } = await supabase
    .from("attendance_checkins")
    .select("student_id, checked_in_at, student:students(full_name)")
    .eq("session_id", sessionId)
    .order("checked_in_at", { ascending: false });

  return (data || []).map((c: any) => ({
    student_id: c.student_id,
    student_name: c.student?.full_name || "Học sinh",
    checked_in_at: c.checked_in_at,
  }));
}

// Học sinh tự quét QR hoặc nhập mã số 6 chữ số để điểm danh chính mình.
// Nhận 1 trong 2: qrToken (quét QR) hoặc code (gõ tay) — ưu tiên qrToken nếu có cả 2.
export async function submitCheckin(input: {
  qrToken?: string;
  code?: string;
}): Promise<{ error: string } | { success: true; className: string }> {
  const guard = await requireRole(["student"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  const qrToken = input.qrToken?.trim();
  const code = input.code?.trim();
  if (!qrToken && !code) {
    return { error: "Vui lòng quét mã QR hoặc nhập mã số điểm danh" };
  }

  // 1. Danh tính học sinh LUÔN lấy từ session server-side, không tin client.
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!student) return { error: "Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này" };

  // 2. Tìm mã còn hiệu lực (chưa hết hạn)
  let codeQuery = supabase
    .from("attendance_checkin_codes")
    .select("session_id, expires_at");

  codeQuery = qrToken ? codeQuery.eq("qr_token", qrToken) : codeQuery.eq("code", code as string);

  const { data: codeRow } = await codeQuery.maybeSingle();

  if (!codeRow) return { error: "Mã điểm danh không đúng hoặc đã bị đóng" };
  if (new Date(codeRow.expires_at).getTime() < Date.now()) {
    return { error: "Mã điểm danh đã hết hạn, vui lòng xin giáo viên mã mới" };
  }

  // 3. Buổi học không được hủy
  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, class_id, status, class:classes(name)")
    .eq("id", codeRow.session_id)
    .single();

  if (!session) return { error: "Không tìm thấy buổi học tương ứng với mã này" };
  if (session.status === "cancelled") {
    return { error: "Buổi học này đã bị hủy, không thể điểm danh" };
  }

  // 4. Học sinh phải đang ghi danh (active) đúng lớp của buổi đó
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", student.id)
    .eq("class_id", session.class_id)
    .eq("status", "active")
    .maybeSingle();

  if (!enrollment) {
    return { error: "Bạn không có tên trong danh sách lớp học của buổi này" };
  }

  // 5. Ghi nhận đã quét — mỗi học sinh chỉ 1 lần/buổi (unique session_id+student_id)
  const { data: existing } = await supabase
    .from("attendance_checkins")
    .select("id")
    .eq("session_id", session.id)
    .eq("student_id", student.id)
    .maybeSingle();

  if (existing) {
    return { error: "Bạn đã điểm danh buổi học này rồi" };
  }

  const { error: insertError } = await supabase.from("attendance_checkins").insert({
    session_id: session.id,
    student_id: student.id,
  });

  if (insertError) {
    return { error: `Không thể lưu điểm danh: ${insertError.message}` };
  }

  revalidatePath(`/teacher/attendance/${session.id}`);

  return { success: true, className: (session as any).class?.name || "Lớp học" };
}
