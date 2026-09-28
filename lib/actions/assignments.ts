"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";

// Server Actions cho Bài tập/Kiểm tra + Chấm điểm — thuộc lãnh địa Teacher.
// Ownership check: mọi thao tác ghi đều tự xác nhận assignment/lớp thuộc
// đúng giáo viên đang đăng nhập (teacher_id = user.id lấy từ session), không
// bao giờ tin classId/assignmentId phía client tự nhận "của mình".

export interface TeacherAssignmentItem {
  id: string;
  title: string;
  instructions: string | null;
  class_id: string;
  class_name: string;
  type: string;
  due_date: string | null;
  max_score: number;
  created_at: string;
  total_students: number;
  submitted_count: number;
  graded_count: number;
}

export async function getTeacherAssignments(): Promise<TeacherAssignmentItem[]> {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return [];
  const { supabase, user, role } = guard.context;

  let query = supabase
    .from("assignments")
    .select(`
      id, title, instructions, class_id, type, due_date, max_score, created_at,
      class:classes(id, name, enrollments(id, status))
    `)
    .order("created_at", { ascending: false });

  if (role === "teacher") {
    query = query.eq("teacher_id", user.id);
  }

  const { data: assignments, error } = await query;
  if (error || !assignments) return [];

  const assignmentIds = assignments.map((a: any) => a.id);
  if (assignmentIds.length === 0) return [];

  const { data: submissions } = await supabase
    .from("submissions")
    .select("assignment_id, status, score")
    .in("assignment_id", assignmentIds);

  const subCountMap = new Map<string, { submitted: number; graded: number }>();
  for (const s of submissions || []) {
    const cur = subCountMap.get(s.assignment_id) || { submitted: 0, graded: 0 };
    cur.submitted += 1;
    if (s.status === "graded" || s.score !== null) cur.graded += 1;
    subCountMap.set(s.assignment_id, cur);
  }

  return assignments.map((a: any) => {
    const cls = a.class || {};
    const activeEnrollments = (cls.enrollments || []).filter((e: any) => e.status === "active");
    const counts = subCountMap.get(a.id) || { submitted: 0, graded: 0 };
    return {
      id: a.id,
      title: a.title,
      instructions: a.instructions,
      class_id: a.class_id,
      class_name: cls.name || "Lớp học",
      type: a.type || "homework",
      due_date: a.due_date,
      max_score: a.max_score ?? 10,
      created_at: a.created_at,
      total_students: activeEnrollments.length,
      submitted_count: counts.submitted,
      graded_count: counts.graded,
    };
  });
}

export interface CreateAssignmentPayload {
  title: string;
  classId: string;
  type: string;
  dueDate?: string;
  maxScore?: number;
  instructions?: string;
}

export async function createAssignment(payload: CreateAssignmentPayload) {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  if (!payload.title?.trim()) {
    return { error: "Vui lòng nhập tên bài tập" };
  }
  if (!payload.classId) {
    return { error: "Vui lòng chọn lớp học" };
  }

  // Ownership: giáo viên chỉ được giao bài cho đúng lớp mình dạy
  const { data: cls } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", payload.classId)
    .single();

  if (!cls) return { error: "Lớp học không tồn tại" };
  if (role === "teacher" && cls.teacher_id !== user.id) {
    return { error: "Bạn không có quyền giao bài cho lớp này" };
  }

  const { error } = await supabase.from("assignments").insert({
    title: payload.title.trim(),
    class_id: payload.classId,
    teacher_id: user.id,
    type: payload.type || "homework",
    due_date: payload.dueDate || null,
    max_score: payload.maxScore && payload.maxScore > 0 ? payload.maxScore : 10,
    instructions: payload.instructions?.trim() || null,
  });

  if (error) return { error: `Không thể tạo bài tập: ${error.message}` };

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher/grading");
  revalidatePath("/student/assignments");
  revalidatePath("/student/dashboard");
  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, teacher_id")
    .eq("id", assignmentId)
    .single();

  if (!assignment) return { error: "Bài tập không tồn tại" };
  if (role === "teacher" && assignment.teacher_id !== user.id) {
    return { error: "Bạn không có quyền xóa bài tập này" };
  }

  // Xóa bài nộp liên quan trước (nếu FK không tự cascade) để tránh lỗi khóa ngoại
  await supabase.from("submissions").delete().eq("assignment_id", assignmentId);

  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);
  if (error) return { error: `Không thể xóa bài tập: ${error.message}` };

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher/grading");
  revalidatePath("/student/assignments");
  return { success: true };
}

export interface TeacherSubmissionItem {
  id: string;
  assignment_id: string;
  assignment_title: string;
  class_id: string;
  class_name: string;
  max_score: number;
  student_id: string;
  student_name: string;
  content: string | null;
  status: "pending" | "submitted" | "graded";
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
}

export async function getTeacherSubmissions(): Promise<TeacherSubmissionItem[]> {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return [];
  const { supabase, user, role } = guard.context;

  let asgQuery = supabase
    .from("assignments")
    .select("id, title, class_id, max_score, teacher_id, class:classes(name)");
  if (role === "teacher") {
    asgQuery = asgQuery.eq("teacher_id", user.id);
  }
  const { data: assignments } = await asgQuery;
  if (!assignments || assignments.length === 0) return [];

  const asgMap = new Map(assignments.map((a: any) => [a.id, a]));
  const assignmentIds = assignments.map((a: any) => a.id);

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, assignment_id, student_id, content, status, score, feedback, submitted_at, student:students(full_name)")
    .in("assignment_id", assignmentIds)
    .order("submitted_at", { ascending: false });

  return (submissions || []).map((s: any) => {
    const asg = asgMap.get(s.assignment_id) as any;
    return {
      id: s.id,
      assignment_id: s.assignment_id,
      assignment_title: asg?.title || "Bài tập",
      class_id: asg?.class_id || "",
      class_name: asg?.class?.name || "Lớp học",
      max_score: asg?.max_score ?? 10,
      student_id: s.student_id,
      student_name: s.student?.full_name || "Học sinh",
      content: s.content,
      status: s.status === "graded" || s.score !== null ? "graded" : "submitted",
      score: s.score,
      feedback: s.feedback,
      submitted_at: s.submitted_at,
    };
  });
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string) {
  const guard = await requireRole(["teacher", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user, role } = guard.context;

  if (score === null || score === undefined || isNaN(score) || score < 0) {
    return { error: "Vui lòng nhập điểm số hợp lệ" };
  }

  // Ownership: chấm điểm bài nộp thuộc đúng bài tập của mình
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, assignment_id, assignment:assignments(teacher_id)")
    .eq("id", submissionId)
    .single();

  if (!submission) return { error: "Không tìm thấy bài nộp" };
  const asgTeacherId = (submission as any).assignment?.teacher_id;
  if (role === "teacher" && asgTeacherId !== user.id) {
    return { error: "Bạn không có quyền chấm bài này" };
  }

  const { error } = await supabase
    .from("submissions")
    .update({ score, feedback: feedback?.trim() || null, status: "graded" })
    .eq("id", submissionId);

  if (error) return { error: `Không thể lưu điểm: ${error.message}` };

  revalidatePath("/teacher/grading");
  revalidatePath("/student/assignments");
  revalidatePath("/student/grades");
  revalidatePath("/student/dashboard");
  return { success: true };
}
