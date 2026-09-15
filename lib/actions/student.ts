"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StudentProfileSummary {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  balance_sessions: number;
}

export interface StudentAttendanceStats {
  present: number;
  absent_unexcused: number;
  absent_excused: number;
  total: number;
}

export interface StudentDashboardSummaryResult {
  student: StudentProfileSummary | null;
  stats: StudentAttendanceStats;
  error?: string;
}

/**
 * Server Action lấy thông tin tóm tắt hiển thị trên Dashboard của Học sinh:
 * 1. Lấy thông tin user hiện tại qua `supabase.auth.getUser()`.
 * 2. Truy vấn bảng `students` theo `auth_user_id = user.id`. Nếu không tìm thấy, fallback an toàn từ `user`.
 * 3. Truy vấn `balance_sessions` từ bảng `enrollments` hoặc `students`.
 * 4. Truy vấn bảng `attendance_records` (có fallback sang bảng `attendance`) theo `student_id` để thống kê buổi học.
 * 5. Trả về object `{ student, stats }`.
 */
export async function getStudentDashboardSummary(): Promise<StudentDashboardSummaryResult> {
  const supabase = await createClient();

  // 1. Dùng Supabase Server Client lấy thông tin user hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      student: null,
      stats: {
        present: 0,
        absent_unexcused: 0,
        absent_excused: 0,
        total: 0,
      },
      error: "Chưa đăng nhập",
    };
  }

  // 2. Truy vấn bảng students theo điều kiện auth_user_id = user.id
  const { data: studentData } = await supabase
    .from("students")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentId = studentData?.id || user.id;

  // 3. Truy vấn số buổi học còn lại (balance_sessions) từ enrollments hoặc students
  let balanceSessions = 0;
  const { data: enrollmentsData } = await supabase
    .from("enrollments")
    .select("balance_sessions, status")
    .eq("student_id", studentId);

  if (enrollmentsData && enrollmentsData.length > 0) {
    balanceSessions = enrollmentsData.reduce(
      (sum, e) => sum + (typeof e.balance_sessions === "number" ? e.balance_sessions : 0),
      0
    );
  } else if (typeof (studentData as any)?.balance_sessions === "number") {
    balanceSessions = (studentData as any).balance_sessions;
  }

  // Nếu không tìm thấy profile, trả về dữ liệu mặc định an toàn từ user
  const student: StudentProfileSummary = studentData
    ? {
        id: studentData.id,
        full_name:
          studentData.full_name ||
          (user.user_metadata?.full_name as string) ||
          "Học sinh",
        email:
          (studentData as any).email ||
          user.email ||
          "",
        phone:
          (studentData as any).phone ||
          studentData.parent_phone ||
          user.phone ||
          "",
        balance_sessions: balanceSessions,
      }
    : {
        id: user.id,
        full_name: (user.user_metadata?.full_name as string) || "Học sinh",
        email: user.email || "",
        phone: user.phone || "",
        balance_sessions: balanceSessions,
      };

  // 3. Truy vấn bảng attendance_records theo student_id vừa tìm được
  // (Đồng thời hỗ trợ fallback sang bảng 'attendance' trong schema DB của dự án)
  let attendanceRows: { status: string }[] = [];

  const { data: recordsData, error: recordsError } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("student_id", studentId);

  if (!recordsError && recordsData) {
    attendanceRows = recordsData;
  } else {
    const { data: attData } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId);

    if (attData) {
      attendanceRows = attData;
    }
  }

  // 4. Đếm tổng số buổi của từng trạng thái
  const stats: StudentAttendanceStats = {
    present: 0,
    absent_unexcused: 0,
    absent_excused: 0,
    total: 0,
  };

  for (const row of attendanceRows) {
    if (row.status === "present") {
      stats.present += 1;
    } else if (row.status === "absent_unexcused") {
      stats.absent_unexcused += 1;
    } else if (row.status === "absent_excused") {
      stats.absent_excused += 1;
    }
  }
  stats.total = stats.present + stats.absent_unexcused + stats.absent_excused;

  return {
    student,
    stats,
  };
}

export interface StudentScheduleItem {
  id: string;
  class_id: string;
  class_name: string;
  room?: string | null;
  teacher_name?: string | null;
  session_date: string;
  start_time?: string | null;
  end_time?: string | null;
  session_status: "scheduled" | "completed" | "cancelled";
  attendance_status?: "present" | "absent_excused" | "absent_unexcused" | null;
  note?: string | null;
}

/**
 * Server Action lấy danh sách lịch học của học sinh:
 * 1. Kiểm tra session đăng nhập qua `supabase.auth.getUser()`.
 * 2. Lấy `student_id` từ bảng `students` (`auth_user_id = user.id`).
 * 3. Truy vấn các lớp học sinh tham gia từ `enrollments` (`status = 'active'`).
 * 4. Tự động sinh buổi học nếu chưa có và truy vấn bảng `class_sessions`.
 * 5. Kèm theo thông tin tên lớp, phòng học, giáo viên phụ trách, trạng thái điểm danh cá nhân.
 * 6. Sắp xếp theo thời gian tăng dần (`session_date ASC`, `start_time ASC`).
 */
export async function getStudentSchedule(
  startDate?: string,
  endDate?: string
): Promise<StudentScheduleItem[]> {
  const supabase = await createClient();

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // 2. Lấy student_id từ bảng students theo auth_user_id = user.id
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!student) {
    return [];
  }

  const studentId = student.id;

  // 3. Truy vấn các lớp học sinh đang tham gia từ enrollments (status = 'active')
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", studentId)
    .eq("status", "active");

  if (enrollError || !enrollments || enrollments.length === 0) {
    return [];
  }

  // Lọc danh sách class_id duy nhất
  const classIds = Array.from(new Set(enrollments.map((e) => e.class_id).filter(Boolean)));
  if (classIds.length === 0) {
    return [];
  }

  // 4. Truy vấn các buổi học từ bảng class_sessions thuộc các lớp đó (chỉ đọc dữ liệu sẵn có)
  let query = supabase
    .from("class_sessions")
    .select(`
      id,
      class_id,
      teacher_id,
      session_date,
      start_time,
      end_time,
      status,
      note,
      class:classes(id, name, room),
      teacher:profiles(id, full_name)
    `)
    .in("class_id", classIds);

  if (startDate) {
    query = query.gte("session_date", startDate);
  }
  if (endDate) {
    query = query.lte("session_date", endDate);
  }

  // Sắp xếp theo thời gian tăng dần (buổi học gần nhất lên trước)
  query = query
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  const { data: sessions, error: sessionsError } = await query;

  if (sessionsError || !sessions || sessions.length === 0) {
    if (sessionsError) {
      console.error("Lỗi truy vấn lịch học:", sessionsError);
    }
    return [];
  }

  // 5. Lấy thông tin trạng thái điểm danh trước để hỗ trợ ưu tiên bản ghi có điểm danh
  const allSessionIds = sessions.map((s) => s.id);
  const attendanceMap = new Map<string, "present" | "absent_excused" | "absent_unexcused">();

  if (allSessionIds.length > 0) {
    const { data: attData } = await supabase
      .from("attendance")
      .select("session_id, status")
      .eq("student_id", studentId)
      .in("session_id", allSessionIds);

    if (attData) {
      for (const row of attData) {
        attendanceMap.set(row.session_id, row.status);
      }
    }
  }

  // 6. Khử trùng lặp buổi học (Deduplicate) theo khóa tổng hợp: class_id + session_date + start_time
  const uniqueSessionsMap = new Map<string, any>();
  for (const s of sessions) {
    const uniqueKey = `${s.class_id}_${s.session_date}_${s.start_time}`;
    if (!uniqueSessionsMap.has(uniqueKey)) {
      uniqueSessionsMap.set(uniqueKey, s);
    } else {
      // Nếu bản ghi trùng lặp này có điểm danh còn bản ghi trước đó không có, ưu tiên bản ghi có điểm danh
      const existing = uniqueSessionsMap.get(uniqueKey);
      if (attendanceMap.has(s.id) && !attendanceMap.has(existing.id)) {
        uniqueSessionsMap.set(uniqueKey, s);
      }
    }
  }

  const uniqueSessions = Array.from(uniqueSessionsMap.values());

  return uniqueSessions.map((s: any) => {
    const attStatus = attendanceMap.get(s.id) || null;
    return {
      id: s.id,
      class_id: s.class_id,
      class_name: s.class?.name || "Lớp học",
      room: s.class?.room || null,
      teacher_name: s.teacher?.full_name || null,
      session_date: s.session_date,
      start_time: s.start_time,
      end_time: s.end_time,
      session_status: s.status,
      attendance_status: attStatus,
      note: s.note,
    };
  });
}

export interface StudentClassItem {
  id: string; // ID enrollment
  class_id: string;
  name: string;
  code: string;
  room?: string | null;
  schedule_desc: string;
  teacher_name?: string | null;
  balance_sessions: number;
  status: string;
  enrolled_at?: string | null;
}

function formatScheduleDesc(schedule: any): string {
  if (!schedule) return "Chưa có lịch cố định";
  let list = schedule;
  if (typeof schedule === "string") {
    try {
      list = JSON.parse(schedule);
    } catch {
      return schedule;
    }
  }
  if (Array.isArray(list) && list.length > 0) {
    return list
      .map((item: any) => {
        const time =
          item.start_time && item.end_time
            ? ` (${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)})`
            : "";
        return `${item.day}${time}`;
      })
      .join(", ");
  }
  return "Chưa có lịch cố định";
}

/**
 * Server Action lấy danh sách các lớp học của học sinh:
 * 1. Xác thực người dùng hiện tại qua `supabase.auth.getUser()`.
 * 2. Tìm `student_id` trong bảng `students` (`auth_user_id = user.id`).
 * 3. Truy vấn bảng `enrollments` theo `student_id` để lấy thông tin lớp, số buổi còn lại và giáo viên phụ trách.
 * 4. Trả về mảng danh sách các lớp học sinh tham gia.
 */
export async function getStudentClasses(): Promise<StudentClassItem[]> {
  const supabase = await createClient();

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // 2. Tìm student_id từ bảng students (auth_user_id = user.id)
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!student) {
    return [];
  }

  // 3. Truy vấn bảng enrollments theo student_id
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select(`
      id,
      class_id,
      balance_sessions,
      status,
      joined_at,
      class:classes(
        *,
        teacher:profiles(*)
      )
    `)
    .eq("student_id", student.id)
    .order("joined_at", { ascending: false });

  if (enrollError || !enrollments) {
    console.error("Lỗi lấy danh sách lớp học của học sinh:", enrollError);
    return [];
  }

  // 4. Trả về mảng danh sách các lớp học sinh đang tham gia
  return enrollments.map((enr: any) => {
    const cls = enr.class || {};
    const code =
      cls.code ||
      `#LH-${cls.id ? cls.id.replace(/-/g, "").slice(0, 6).toUpperCase() : "CLASS"}`;
    const scheduleDesc = cls.schedule_desc || formatScheduleDesc(cls.schedule);

    return {
      id: enr.id,
      class_id: enr.class_id,
      name: cls.name || "Lớp học",
      code,
      room: cls.room || null,
      schedule_desc: scheduleDesc,
      teacher_name: cls.teacher?.full_name || null,
      balance_sessions: enr.balance_sessions ?? 0,
      status: enr.status || "active",
      enrolled_at: enr.joined_at || null,
    };
  });
}

export interface StudentAssignmentItem {
  id: string; // ID bài tập
  title: string;
  instructions?: string | null;
  class_id: string;
  class_name: string;
  class_code?: string;
  teacher_name?: string | null;
  due_date?: string | null;
  type?: string | null;
  created_at?: string;

  // Trạng thái nộp bài của học sinh
  submission_id?: string | null;
  submission_content?: string | null;
  status: "pending" | "submitted" | "graded";
  score?: number | null;
  feedback?: string | null;
  submitted_at?: string | null;

  // Tính toán thời gian
  is_overdue: boolean;
  is_due_soon: boolean;
}

/**
 * Server Action lấy danh sách bài tập của học sinh:
 * 1. Kiểm tra session đăng nhập qua `supabase.auth.getUser()`.
 * 2. Lấy `student_id` từ bảng `students` (`auth_user_id = user.id`).
 * 3. Lấy danh sách `class_id` từ bảng `enrollments` (`status = 'active'`).
 * 4. Truy vấn bảng `assignments` thuộc các lớp đó.
 * 5. Truy vấn bài nộp từ bảng `submissions` theo `student_id`.
 * 6. Ghép dữ liệu, tính toán trạng thái (pending/submitted/graded, is_overdue, is_due_soon).
 * 7. Sắp xếp các bài cần làm (quá hạn, sắp hết hạn, chưa làm) lên đầu.
 */
export async function getStudentAssignments(): Promise<StudentAssignmentItem[]> {
  const supabase = await createClient();

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // 2. Tìm student_id từ bảng students
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!student) {
    return [];
  }

  // 3. Lấy các lớp đang học
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", student.id)
    .eq("status", "active");

  const classIds = Array.from(
    new Set((enrollments || []).map((e) => e.class_id).filter(Boolean))
  );

  if (classIds.length === 0) {
    return [];
  }

  // 4. Truy vấn bài tập thuộc các lớp
  const { data: assignments, error: asgError } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      instructions,
      class_id,
      teacher_id,
      due_date,
      type,
      created_at,
      class:classes(
        id,
        name,
        code,
        teacher:profiles(full_name)
      )
    `)
    .in("class_id", classIds);

  if (asgError || !assignments || assignments.length === 0) {
    return [];
  }

  // 5. Truy vấn các bài nộp của học sinh
  const assignmentIds = assignments.map((a: any) => a.id);
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("student_id", student.id)
    .in("assignment_id", assignmentIds);

  const subMap = new Map<string, any>();
  if (submissions) {
    for (const sub of submissions) {
      subMap.set(sub.assignment_id, sub);
    }
  }

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // 6. Ghép dữ liệu và phân loại
  const items: StudentAssignmentItem[] = assignments.map((a: any) => {
    const cls = a.class || {};
    const sub = subMap.get(a.id);

    let status: "pending" | "submitted" | "graded" = "pending";
    if (sub) {
      if (sub.status === "graded" || (sub.score !== null && sub.score !== undefined)) {
        status = "graded";
      } else {
        status = "submitted";
      }
    }

    let is_overdue = false;
    let is_due_soon = false;

    if (a.due_date) {
      const dueTime = new Date(a.due_date).getTime();
      if (status === "pending") {
        if (dueTime < now) {
          is_overdue = true;
        } else if (dueTime - now <= ONE_DAY_MS) {
          is_due_soon = true;
        }
      }
    }

    return {
      id: a.id,
      title: a.title || "Bài tập",
      instructions: a.instructions || null,
      class_id: a.class_id,
      class_name: cls.name || "Lớp học",
      class_code: cls.code || null,
      teacher_name: cls.teacher?.full_name || null,
      due_date: a.due_date || null,
      type: a.type || "homework",
      created_at: a.created_at,

      submission_id: sub?.id || null,
      submission_content: sub?.content || null,
      status,
      score: sub?.score ?? null,
      feedback: sub?.feedback || null,
      submitted_at: sub?.submitted_at || null,

      is_overdue,
      is_due_soon,
    };
  });

  // 7. Sắp xếp:
  // - Ưu tiên 1: Chưa làm & Quá hạn (is_overdue = true)
  // - Ưu tiên 2: Chưa làm & Sắp đến hạn (is_due_soon = true)
  // - Ưu tiên 3: Chưa làm bình thường (pending)
  // - Ưu tiên 4: Đã nộp (chờ chấm) (submitted)
  // - Ưu tiên 5: Đã có điểm (graded)
  const getRank = (item: StudentAssignmentItem) => {
    if (item.status === "pending") {
      if (item.is_overdue) return 1;
      if (item.is_due_soon) return 2;
      return 3;
    }
    if (item.status === "submitted") return 4;
    return 5;
  };

  items.sort((x, y) => {
    const rankDiff = getRank(x) - getRank(y);
    if (rankDiff !== 0) return rankDiff;

    if (x.due_date && y.due_date) {
      return new Date(x.due_date).getTime() - new Date(y.due_date).getTime();
    }
    if (x.due_date) return -1;
    if (y.due_date) return 1;
    return 0;
  });

  return items;
}

/**
 * Server Action nộp hoặc cập nhật bài làm của học sinh:
 * 1. Kiểm tra session đăng nhập và quyền student.
 * 2. Xác thực nội dung bài làm.
 * 3. Kiểm tra bài tập tồn tại và học sinh có thuộc lớp đó không.
 * 4. Nếu đã có bài nộp (chưa chấm), cập nhật nội dung; nếu chưa có, tạo mới.
 */
export async function submitAssignment(
  assignmentId: string,
  content: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn" };
  }

  // 2. Tìm student_id từ bảng students
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!student) {
    return { error: "Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này" };
  }

  const trimmedContent = (content || "").trim();
  if (!trimmedContent) {
    return { error: "Vui lòng nhập nội dung câu trả lời hoặc liên kết bài làm của bạn" };
  }

  // 3. Kiểm tra bài tập tồn tại
  const { data: assignment, error: asgError } = await supabase
    .from("assignments")
    .select("id, class_id, due_date")
    .eq("id", assignmentId)
    .single();

  if (asgError || !assignment) {
    return { error: "Bài tập không tồn tại hoặc đã bị xóa" };
  }

  // 4. Kiểm tra học sinh có thuộc lớp của bài tập này không (Authorization Ownership Check)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", student.id)
    .eq("class_id", assignment.class_id)
    .maybeSingle();

  if (!enrollment) {
    return { error: "Bạn không có tên trong danh sách lớp học của bài tập này" };
  }

  // 5. Kiểm tra submission hiện tại
  const { data: existingSub } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .eq("student_id", student.id)
    .maybeSingle();

  if (existingSub?.status === "graded") {
    return { error: "Bài tập này đã được giáo viên chấm điểm, không thể chỉnh sửa nộp lại" };
  }

  const nowIso = new Date().toISOString();

  if (existingSub) {
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        content: trimmedContent,
        status: "submitted",
        submitted_at: nowIso,
      })
      .eq("id", existingSub.id);

    if (updateError) {
      console.error("Lỗi khi cập nhật bài nộp:", updateError);
      return { error: `Lỗi cập nhật bài nộp: ${updateError.message}` };
    }
  } else {
    const { error: insertError } = await supabase
      .from("submissions")
      .insert({
        assignment_id: assignmentId,
        student_id: student.id,
        content: trimmedContent,
        status: "submitted",
        submitted_at: nowIso,
      });

    if (insertError) {
      console.error("Lỗi khi tạo mới bài nộp:", insertError);
      return { error: `Lỗi nộp bài: ${insertError.message}` };
    }
  }

  revalidatePath("/student/assignments");
  revalidatePath("/student/dashboard");

  return { success: true };
}


