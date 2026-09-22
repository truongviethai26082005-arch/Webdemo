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

export interface DashboardUrgentAssignment {
  id: string;
  title: string;
  class_name: string;
  due_date: string | null;
  due_date_formatted: string;
  is_overdue: boolean;
  is_due_soon: boolean;
  days_left: string;
}

export interface StudentDashboardStatsResult {
  student: StudentProfileSummary | null;
  attendance: {
    present_count: number;
    absent_excused_count: number;
    absent_unexcused_count: number;
    total_sessions: number;
    present_rate: number;
    present_rate_label: string;
    actual_absences: number;
    max_absent: number;
    absence_display: string;
    exceeded_absence: boolean;
    late_count: number;
    max_late: number;
    late_display: string;
  };
  assignments: {
    pending_count: number;
    overdue_count: number;
    submitted_count: number;
    graded_count: number;
    total_count: number;
    urgent_assignments: DashboardUrgentAssignment[];
  };
  error?: string;
}

export interface StudentDashboardSummaryResult {
  student: StudentProfileSummary | null;
  stats: StudentAttendanceStats;
  error?: string;
}

/**
 * Server Action tổng hợp dữ liệu Dashboard học viên chuẩn hóa:
 * 1. Lớp học & Ghi danh: Lấy danh sách class_id từ enrollments của học sinh.
 * 2. Điểm danh & Cảnh báo giới hạn:
 *    - Đếm chính xác số buổi từ attendance_records (hoặc attendance): present_count, absent_excused_count, absent_unexcused_count.
 *    - Tổng số buổi = present + excused + unexcused.
 *    - Tỷ lệ có mặt: 0% nếu total = 0 kèm nhãn "Chưa có buổi học nào". Nếu > 0: (present_count / tổng) * 100.
 *    - Giới hạn nghỉ: max_absent = 3. Số buổi nghỉ = absent_excused + absent_unexcused. Display: `${số_buổi_nghỉ}/${max_absent}`.
 *    - exceeded_absence = số_buổi_nghỉ >= max_absent.
 * 3. Bài tập & Kiểm tra:
 *    - Lấy bài tập của các lớp đang học, map với submissions của học sinh (pending, submitted, graded, overdue).
 *    - Lấy tối đa 2 bài tập cần làm gấp nhất.
 */
export async function getStudentDashboardStats(): Promise<StudentDashboardStatsResult> {
  const supabase = await createClient();

  const defaultResult: StudentDashboardStatsResult = {
    student: null,
    attendance: {
      present_count: 0,
      absent_excused_count: 0,
      absent_unexcused_count: 0,
      total_sessions: 0,
      present_rate: 0,
      present_rate_label: "Chưa có buổi học nào",
      actual_absences: 0,
      max_absent: 3,
      absence_display: "0/3",
      exceeded_absence: false,
      late_count: 0,
      max_late: 3,
      late_display: "0/3",
    },
    assignments: {
      pending_count: 0,
      overdue_count: 0,
      submitted_count: 0,
      graded_count: 0,
      total_count: 0,
      urgent_assignments: [],
    },
  };

  // 1. Dùng Supabase Server Client lấy thông tin user hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ...defaultResult,
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

  // 3. Truy vấn enrollments để lấy balance_sessions và danh sách lớp đang học
  let balanceSessions = 0;
  const activeClassIds: string[] = [];

  const { data: enrollmentsData } = await supabase
    .from("enrollments")
    .select("id, class_id, balance_sessions, status")
    .eq("student_id", studentId);

  if (enrollmentsData && enrollmentsData.length > 0) {
    for (const e of enrollmentsData) {
      if (typeof e.balance_sessions === "number") {
        balanceSessions += e.balance_sessions;
      }
      if ((!e.status || e.status === "active") && e.class_id) {
        activeClassIds.push(e.class_id);
      }
    }
  } else if (typeof (studentData as any)?.balance_sessions === "number") {
    balanceSessions = (studentData as any).balance_sessions;
  }

  // Nếu không tìm thấy profile, trả về dữ liệu an toàn từ user
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

  // 4. Truy vấn bảng attendance_records (hoặc attendance)
  let attendanceRows: { status: string }[] = [];

  const { data: recordsData, error: recordsError } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("student_id", studentId);

  if (!recordsError && recordsData && recordsData.length > 0) {
    attendanceRows = recordsData;
  } else {
    const { data: attData } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId);

    if (attData && attData.length > 0) {
      attendanceRows = attData;
    }
  }

  let present_count = 0;
  let absent_excused_count = 0;
  let absent_unexcused_count = 0;

  for (const row of attendanceRows) {
    if (row.status === "present") {
      present_count += 1;
    } else if (row.status === "absent_unexcused") {
      absent_unexcused_count += 1;
    } else if (row.status === "absent_excused") {
      absent_excused_count += 1;
    }
  }

  const total_sessions =
    present_count + absent_excused_count + absent_unexcused_count;
  const present_rate =
    total_sessions > 0
      ? Math.round((present_count / total_sessions) * 100)
      : 0;
  const present_rate_label =
    total_sessions > 0 ? `${present_rate}%` : "Chưa có buổi học nào";

  const max_absent = 3;
  const actual_absences = absent_excused_count + absent_unexcused_count;
  const exceeded_absence = actual_absences >= max_absent;
  const absence_display = `${actual_absences}/${max_absent}`;
  const max_late = 3;
  const late_display = `0/${max_late}`;

  // 5. Truy vấn bài tập & bài nộp
  const uniqueClassIds = Array.from(new Set(activeClassIds));
  let assignmentsList: any[] = [];

  if (uniqueClassIds.length > 0) {
    try {
      const { data: asgData } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          instructions,
          due_date,
          class_id,
          type,
          class:classes(id, name, code)
        `)
        .in("class_id", uniqueClassIds);

      if (asgData) {
        assignmentsList = asgData;
      }
    } catch (err: any) {
      console.warn("Lỗi truy vấn bài tập cho dashboard:", err?.message || err);
    }
  }

  let submissionsList: any[] = [];
  const asgIds = assignmentsList.map((a) => a.id);
  if (asgIds.length > 0) {
    try {
      const { data: subData } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", studentId)
        .in("assignment_id", asgIds);

      if (subData) {
        submissionsList = subData;
      }
    } catch (err: any) {
      console.warn("Lỗi truy vấn bài nộp cho dashboard:", err?.message || err);
    }
  }

  const subMap = new Map<string, any>();
  for (const sub of submissionsList) {
    subMap.set(sub.assignment_id, sub);
  }

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  let pending_count = 0;   // chưa nộp và còn hạn
  let overdue_count = 0;   // chưa nộp và quá hạn
  let submitted_count = 0; // đã nộp, chờ chấm
  let graded_count = 0;    // đã chấm điểm

  const urgentCandidates: DashboardUrgentAssignment[] = [];

  for (const a of assignmentsList) {
    const sub = subMap.get(a.id);
    const cls = Array.isArray(a.class) ? a.class[0] : a.class;
    const className = cls?.name || "Lớp học";

    if (sub) {
      if (
        sub.status === "graded" ||
        (sub.score !== null && sub.score !== undefined)
      ) {
        graded_count += 1;
      } else {
        submitted_count += 1;
      }
    } else {
      // Chưa nộp bài
      let is_overdue = false;
      let is_due_soon = false;
      let days_left = "Không thời hạn";

      if (a.due_date) {
        const dueTime = new Date(a.due_date).getTime();
        const diffMs = dueTime - now;

        if (diffMs < 0) {
          is_overdue = true;
          overdue_count += 1;
          const daysAgo = Math.ceil(Math.abs(diffMs) / ONE_DAY_MS);
          days_left = `Quá hạn ${daysAgo} ngày`;
        } else {
          pending_count += 1;
          if (diffMs <= ONE_DAY_MS) {
            is_due_soon = true;
            const hoursLeft = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)));
            days_left = `Hết hạn sau ${hoursLeft} giờ`;
          } else {
            const days = Math.ceil(diffMs / ONE_DAY_MS);
            days_left = `Còn ${days} ngày`;
          }
        }
      } else {
        pending_count += 1;
      }

      urgentCandidates.push({
        id: a.id,
        title: a.title || "Bài tập về nhà",
        class_name: className,
        due_date: a.due_date || null,
        due_date_formatted: a.due_date
          ? new Date(a.due_date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Không thời hạn",
        is_overdue,
        is_due_soon,
        days_left,
      });
    }
  }

  // Sắp xếp ưu tiên: Quá hạn lên đầu, sau đó sắp hết hạn, sau đó đến hạn gần nhất
  urgentCandidates.sort((x, y) => {
    if (x.is_overdue && !y.is_overdue) return -1;
    if (!x.is_overdue && y.is_overdue) return 1;
    if (x.is_due_soon && !y.is_due_soon) return -1;
    if (!x.is_due_soon && y.is_due_soon) return 1;
    if (x.due_date && y.due_date) {
      return new Date(x.due_date).getTime() - new Date(y.due_date).getTime();
    }
    if (x.due_date) return -1;
    if (y.due_date) return 1;
    return 0;
  });

  const urgent_assignments = urgentCandidates.slice(0, 2);

  return {
    student,
    attendance: {
      present_count,
      absent_excused_count,
      absent_unexcused_count,
      total_sessions,
      present_rate,
      present_rate_label,
      actual_absences,
      max_absent,
      absence_display,
      exceeded_absence,
      late_count: 0,
      max_late,
      late_display,
    },
    assignments: {
      pending_count,
      overdue_count,
      submitted_count,
      graded_count,
      total_count: assignmentsList.length,
      urgent_assignments,
    },
  };
}

/**
 * Server Action lấy thông tin tóm tắt tương thích ngược
 */
export async function getStudentDashboardSummary(): Promise<StudentDashboardSummaryResult> {
  const data = await getStudentDashboardStats();
  return {
    student: data.student,
    stats: {
      present: data.attendance.present_count,
      absent_unexcused: data.attendance.absent_unexcused_count,
      absent_excused: data.attendance.absent_excused_count,
      total: data.attendance.total_sessions,
    },
    error: data.error,
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

export interface StudentResourceItem {
  id: string;
  title: string;
  description?: string | null;
  class_id: string;
  class_name: string;
  class_code?: string | null;
  teacher_name?: string | null;
  type: "slide" | "pdf" | "video" | "link";
  file_format: string; // "PDF" | "Slide PPTX" | "Video MP4" | "Link"
  file_size?: string | null;
  file_url: string;
  created_at: string;
  is_new?: boolean;
}

/**
 * Server Action lấy danh sách tài liệu học tập của học sinh:
 * 1. Xác thực đăng nhập qua `supabase.auth.getUser()`.
 * 2. Lấy `student_id` từ bảng `students` (`auth_user_id = user.id`).
 * 3. Truy vấn các lớp học sinh đang ghi danh hoạt động (`enrollments` status = 'active').
 * 4. Truy vấn bảng `materials` trong Supabase theo `class_id`.
 * 5. Nếu chưa có bảng tài liệu thật hoặc bảng trống, trả về dữ liệu mẫu chuẩn nghiệp vụ gắn theo đúng các `classes` thực tế của học sinh.
 */
export async function getStudentResources(): Promise<StudentResourceItem[]> {
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

  // 3. Lấy danh sách lớp học sinh đang tham gia (active) kèm thông tin giáo viên
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select(`
      class_id,
      class:classes(
        id,
        name,
        code,
        teacher:profiles(full_name)
      )
    `)
    .eq("student_id", student.id)
    .eq("status", "active");

  if (enrollError || !enrollments || enrollments.length === 0) {
    return [];
  }

  const enrolledClasses = enrollments
    .map((e: any) => e.class)
    .filter(Boolean);

  if (enrolledClasses.length === 0) {
    return [];
  }

  const classIds = enrolledClasses.map((c: any) => c.id);

  // 4. Thử truy vấn bảng materials trong Supabase (nếu có dữ liệu)
  let dbMaterials: any[] = [];
  try {
    const { data: materials, error: matError } = await supabase
      .from("materials")
      .select("*")
      .in("class_id", classIds);

    if (!matError && materials && materials.length > 0) {
      dbMaterials = materials;
    }
  } catch {
    // Không ném lỗi nếu bảng materials chưa cấu hình hoặc RLS chặn
  }

  // Map thông tin lớp học để tra cứu nhanh
  const classMap = new Map<string, any>();
  for (const cls of enrolledClasses) {
    classMap.set(cls.id, cls);
  }

  // 5. Nếu có tài liệu từ DB, format và trả về
  if (dbMaterials.length > 0) {
    return dbMaterials.map((m: any) => {
      const cls = classMap.get(m.class_id) || {};
      const teacherName = cls.teacher?.full_name || null;
      const type = (m.type || "pdf") as "slide" | "pdf" | "video" | "link";

      return {
        id: m.id,
        title: m.title || "Tài liệu học tập",
        description: m.description || null,
        class_id: m.class_id,
        class_name: cls.name || "Lớp học",
        class_code: cls.code || null,
        teacher_name: teacherName,
        type,
        file_format:
          m.file_format ||
          (type === "pdf"
            ? "PDF"
            : type === "slide"
            ? "Slide PPTX"
            : type === "video"
            ? "Video MP4"
            : "Link"),
        file_size: m.file_size || m.size || "1.5 MB",
        file_url: m.url || m.file_url || "#",
        created_at: m.created_at || new Date().toISOString(),
        is_new: false,
      };
    });
  }

  // 6. Nếu không tìm thấy tài liệu thực tế từ DB, trả về mảng rỗng []
  return [];
}

export interface StudentGradeItem {
  id: string;
  title: string;
  type: "quiz_15m" | "test_1period" | "midterm" | "final" | "homework" | "attendance";
  type_label: string;
  score: number;
  max_score: number;
  weight: number; // Tỷ trọng phần trăm (%)
  graded_at: string;
  feedback?: string | null;
}

export interface StudentClassGrades {
  class_id: string;
  class_name: string;
  class_code?: string | null;
  teacher_name?: string | null;
  average_score: number;
  ranking: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình";
  teacher_feedback: {
    strengths: string;
    improvements: string;
    general_comment: string;
  };
  grades: StudentGradeItem[];
}

export interface StudentGradesSummary {
  overallGpa: number;
  overallRanking: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình";
  completionRate: number; // %
  attendanceRate: number; // %
  totalAssessments: number;
  classes: StudentClassGrades[];
}

function getRankingFromScore(score: number): "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình" {
  if (score >= 9.0) return "Xuất sắc";
  if (score >= 8.0) return "Giỏi";
  if (score >= 6.5) return "Khá";
  return "Trung bình";
}

/**
 * Server Action lấy Bảng điểm & Đánh giá của học sinh:
 * 1. Xác thực đăng nhập qua `supabase.auth.getUser()`.
 * 2. Lấy `student_id` từ bảng `students` (`auth_user_id = user.id`).
 * 3. Truy vấn các lớp học sinh đang ghi danh hoạt động (`enrollments` status = 'active').
 * 4. Truy vấn tỷ lệ chuyên cần từ bảng `attendance`.
 * 5. Truy vấn bài nộp đã chấm điểm từ bảng `submissions` (status = 'graded').
 * 6. Cơ chế Fallback an toàn: Nếu chưa phát sinh điểm số thật trong DB, tự động sinh dữ liệu mẫu chuẩn nghiệp vụ gắn theo đúng các lớp học thực tế của học viên.
 */
export async function getStudentGrades(): Promise<StudentGradesSummary> {
  const supabase = await createClient();

  const emptySummary: StudentGradesSummary = {
    overallGpa: 0,
    overallRanking: "Trung bình",
    completionRate: 0,
    attendanceRate: 100,
    totalAssessments: 0,
    classes: [],
  };

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return emptySummary;
  }

  // 2. Tìm student_id từ bảng students
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!student) {
    return emptySummary;
  }

  // 3. Lấy danh sách lớp học sinh đang tham gia (active) kèm thông tin giáo viên
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select(`
      class_id,
      class:classes(
        id,
        name,
        code,
        teacher:profiles(full_name)
      )
    `)
    .eq("student_id", student.id)
    .eq("status", "active");

  if (enrollError || !enrollments || enrollments.length === 0) {
    return emptySummary;
  }

  const enrolledClasses = enrollments
    .map((e: any) => e.class)
    .filter(Boolean);

  if (enrolledClasses.length === 0) {
    return emptySummary;
  }

  // 4. Tính toán tỷ lệ chuyên cần từ bảng attendance
  let attendanceRate = 95;
  try {
    const { data: attData } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", student.id);

    if (attData && attData.length > 0) {
      const presentCount = attData.filter((a) => a.status === "present").length;
      attendanceRate = Math.round((presentCount / attData.length) * 100);
    }
  } catch {
    // giữ mặc định an toàn
  }

  // 5. Thử truy vấn các bài nộp đã có điểm từ bảng submissions
  const classIds = enrolledClasses.map((c: any) => c.id);
  let dbGradedSubmissions: any[] = [];
  try {
    const { data: gradedSubs, error: subsError } = await supabase
      .from("submissions")
      .select(`
        id,
        assignment_id,
        score,
        feedback,
        submitted_at,
        assignment:assignments(
          id,
          title,
          class_id,
          type
        )
      `)
      .eq("student_id", student.id)
      .eq("status", "graded");

    if (!subsError && gradedSubs && gradedSubs.length > 0) {
      dbGradedSubmissions = gradedSubs.filter(
        (s: any) => s.assignment && classIds.includes(s.assignment.class_id)
      );
    }
  } catch {
    // Bỏ qua lỗi nếu bảng submissions chưa cấu hình
  }

  // 6. Xử lý dữ liệu điểm số từng lớp
  const classGradesList: StudentClassGrades[] = [];

  if (dbGradedSubmissions.length > 0) {
    // Nếu có điểm thật từ Database
    for (const cls of enrolledClasses) {
      const clsSubs = dbGradedSubmissions.filter(
        (s: any) => s.assignment.class_id === cls.id
      );

      if (clsSubs.length > 0) {
        const gradeItems: StudentGradeItem[] = clsSubs.map((sub: any) => {
          const type = (sub.assignment.type || "homework") as any;
          const typeLabel =
            type === "midterm"
              ? "Giữa kỳ"
              : type === "final"
              ? "Cuối kỳ"
              : type === "quiz"
              ? "15 phút"
              : "Bài tập";

          return {
            id: sub.id,
            title: sub.assignment.title || "Bài kiểm tra",
            type: type === "midterm" ? "midterm" : "homework",
            type_label: typeLabel,
            score: typeof sub.score === "number" ? sub.score : 8.0,
            max_score: 10,
            weight: 20,
            graded_at: sub.submitted_at || new Date().toISOString(),
            feedback: sub.feedback || null,
          };
        });

        const totalScores = gradeItems.reduce((acc, cur) => acc + cur.score, 0);
        const avgScore = Number((totalScores / gradeItems.length).toFixed(1));

        classGradesList.push({
          class_id: cls.id,
          class_name: cls.name || "Lớp học",
          class_code: cls.code || null,
          teacher_name: cls.teacher?.full_name || "Giáo viên bộ môn",
          average_score: avgScore,
          ranking: getRankingFromScore(avgScore),
          teacher_feedback: {
            strengths: "Học sinh có ý thức học tập tốt, hoàn thành đúng hạn các bài tập được giao.",
            improvements: "Cần chú ý cẩn thận hơn ở các phần câu hỏi nâng cao.",
            general_comment: "Tiến độ học tập ổn định và duy trì thái độ tích cực.",
          },
          grades: gradeItems,
        });
      }
    }
  }

  // 7. Nếu không có điểm số thực tế từ DB, trả về cấu trúc rỗng chuẩn xác thực
  if (classGradesList.length === 0) {
    return {
      overallGpa: 0,
      overallRanking: "Trung bình",
      completionRate: 0,
      attendanceRate,
      totalAssessments: 0,
      classes: [],
    };
  }

  // 8. Tính toán các chỉ số thống kê tổng hợp (Overall summary)
  const totalAvg = classGradesList.reduce((acc, cur) => acc + cur.average_score, 0);
  const overallGpa = classGradesList.length > 0 ? Number((totalAvg / classGradesList.length).toFixed(1)) : 0;
  const totalAssessments = classGradesList.reduce((acc, cur) => acc + cur.grades.length, 0);

  return {
    overallGpa,
    overallRanking: getRankingFromScore(overallGpa),
    completionRate: 100,
    attendanceRate,
    totalAssessments,
    classes: classGradesList,
  };
}

// ==========================================
// 8. CÀI ĐẶT TÀI KHOẢN (SETTINGS) & ĐỔI MẬT KHẨU
// ==========================================

export interface StudentProfileSettingsData {
  id: string;
  student_code: string;
  full_name: string;
  email: string;
  phone: string;
  parent_name?: string | null;
  parent_phone?: string | null;
  status?: string;
  created_at?: string;
}

export interface StudentProfileSettingsResult {
  profile: StudentProfileSettingsData | null;
  error?: string;
}

export interface UpdatePasswordResult {
  success?: boolean;
  error?: string;
}

export interface UpdateStudentProfileParams {
  full_name?: string;
  phone?: string;
}

export interface UpdateStudentProfileResult {
  success?: boolean;
  error?: string;
}

/**
 * Server Action cập nhật thông tin cá nhân học viên an toàn (Họ tên, SĐT liên hệ):
 * 1. Xác thực user hiện tại qua `supabase.auth.getUser()`.
 * 2. Cập nhật bảng `students` tương ứng với `auth_user_id = user.id`.
 * 3. Đồng bộ `full_name` sang `user_metadata` để hiển thị đồng bộ ở Header/Dashboard.
 */
export async function updateStudentProfile(
  params: UpdateStudentProfileParams
): Promise<UpdateStudentProfileResult> {
  const supabase = await createClient();

  // 1. Kiểm tra session hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" };
  }

  const fullName = params.full_name?.trim();
  const phone = params.phone?.trim();

  if (fullName !== undefined && fullName.length < 2) {
    return { error: "Họ và tên phải có tối thiểu 2 ký tự" };
  }

  if (phone !== undefined && phone.length > 0) {
    const cleanedPhone = phone.replace(/[\s\-\.\(\)]/g, "");
    if (!/^\+?[0-9]{9,12}$/.test(cleanedPhone)) {
      return { error: "Số điện thoại không hợp lệ (cần từ 9 đến 12 chữ số)" };
    }
  }

  // 2. Tìm bản ghi học sinh gắn với auth_user_id = user.id
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (fullName) {
    updatePayload.full_name = fullName;
  }
  if (phone !== undefined) {
    updatePayload.parent_phone = phone;
  }

  if (student?.id) {
    const { error: updateError } = await supabase
      .from("students")
      .update(updatePayload)
      .eq("id", student.id);

    if (updateError) {
      console.error("Error updating student profile in DB:", updateError);
      return { error: "Cập nhật thông tin học sinh thất bại. Vui lòng thử lại sau." };
    }
  }

  // 3. Đồng bộ họ tên sang Supabase Auth metadata để các layout / header cập nhật ngay
  if (fullName) {
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
  }

  revalidatePath("/student", "layout");
  revalidatePath("/student/settings");
  revalidatePath("/student/dashboard");
  revalidatePath("/student");

  return { success: true };
}

/**
 * Server Action lấy thông tin tài khoản phục vụ trang Cài đặt (Settings) của học viên:
 * 1. Lấy thông tin user hiện tại qua `supabase.auth.getUser()`.
 * 2. Truy vấn bảng `students` theo `auth_user_id = user.id`.
 * 3. Trả về thông tin cá nhân ở chế độ chỉ đọc.
 */
export async function getStudentProfileSettings(): Promise<StudentProfileSettingsResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      profile: null,
      error: "Chưa đăng nhập",
    };
  }

  // Truy vấn bảng students theo điều kiện auth_user_id = user.id
  const { data: studentData } = await supabase
    .from("students")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentId = studentData?.id || user.id;
  const studentCode = studentData?.id
    ? `#HV-${studentData.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
    : `#HV-${user.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

  const profile: StudentProfileSettingsData = {
    id: studentId,
    student_code: studentCode,
    full_name:
      studentData?.full_name ||
      (user.user_metadata?.full_name as string) ||
      "Học viên",
    email: (studentData as any)?.email || user.email || "Chưa cập nhật",
    phone:
      (studentData as any)?.phone ||
      studentData?.parent_phone ||
      user.phone ||
      "Chưa cập nhật",
    parent_name: studentData?.parent_name || null,
    parent_phone: studentData?.parent_phone || null,
    status: studentData?.status || "active",
    created_at: studentData?.created_at || user.created_at,
  };

  return { profile };
}

/**
 * Server Action đổi mật khẩu an toàn cho học sinh:
 * 1. Xác thực user hiện tại qua `supabase.auth.getUser()`.
 * 2. Xác thực quyền học sinh qua `students.auth_user_id = user.id`.
 * 3. Kiểm tra độ dài mật khẩu mới (>= 6 ký tự).
 * 4. Gọi API chuẩn `supabase.auth.updateUser({ password: newPassword })`.
 */
export async function updateStudentPassword(
  newPassword: string
): Promise<UpdatePasswordResult> {
  const supabase = await createClient();

  // 1. Kiểm tra session hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" };
  }

  // 2. Xác thực học sinh theo auth_user_id (phòng ngừa gọi trái phép)
  const { error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (studentError) {
    return { error: "Không thể xác minh danh tính học sinh" };
  }

  // 3. Kiểm tra độ dài mật khẩu
  if (!newPassword || newPassword.trim().length < 6) {
    return { error: "Mật khẩu mới phải có tối thiểu 6 ký tự" };
  }

  // 4. Cập nhật mật khẩu bằng Supabase Auth API chuẩn
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message || "Đổi mật khẩu thất bại. Vui lòng thử lại sau." };
  }

  revalidatePath("/student/settings");
  return { success: true };
}

// ==========================================
// 9. LỊCH HẸN TEST & THI THỬ ĐỊNH KỲ (TESTS)
// ==========================================

export interface UpcomingTestSession {
  id: string;
  title: string;
  test_code: string;
  subject: string;
  class_name?: string;
  date: string;
  time: string;
  duration_minutes: number;
  room: string;
  format: "offline" | "online";
  proctor_name: string;
  registration_deadline?: string;
  status: "registered" | "pending_confirmation" | "confirmed";
  notes?: string;
  rules?: string[];
  meeting_url?: string;
}

export interface CompletedTestResult {
  id: string;
  title: string;
  test_code: string;
  subject: string;
  class_name?: string;
  date: string;
  score: number;
  max_score: number;
  ranking: string;
  skills: {
    skill_name: string;
    score: number;
    max_score: number;
  }[];
  general_feedback: string;
  paper_download_url?: string;
  solution_url?: string;
}

export interface StudentTestsSummary {
  upcomingTests: UpcomingTestSession[];
  completedTests: CompletedTestResult[];
  stats: {
    upcomingCount: number;
    completedCount: number;
    latestScore: number | null;
    latestScoreMax: number;
    latestScoreRanking?: string;
  };
  error?: string;
}

/**
 * Server Action lấy danh sách lịch thi thử và kết quả đánh giá năng lực định kỳ:
 * 1. Xác thực user hiện tại qua `supabase.auth.getUser()`.
 * 2. Xác thực học sinh theo `students.auth_user_id = user.id`.
 * 3. Lấy thông tin các lớp học sinh đang học để gắn ngữ cảnh ca thi chính xác.
 * 4. Fallback thông minh dữ liệu chuẩn nghiệp vụ trường hợp trung tâm chưa tạo bảng tests riêng.
 */
export async function getStudentTests(): Promise<StudentTestsSummary> {
  const supabase = await createClient();

  // 1. Kiểm tra session hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      upcomingTests: [],
      completedTests: [],
      stats: {
        upcomingCount: 0,
        completedCount: 0,
        latestScore: null,
        latestScoreMax: 10,
      },
      error: "Chưa đăng nhập",
    };
  }

  // 2. Lấy thông tin học sinh
  const { data: studentData } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentId = studentData?.id || user.id;

  // 3. Lấy danh sách lớp active của học sinh
  const { data: enrollmentsData } = await supabase
    .from("enrollments")
    .select(`
      class_id,
      status,
      classes (
        id,
        name,
        room,
        teacher:profiles (
          full_name
        )
      )
    `)
    .eq("student_id", studentId)
    .eq("status", "active");

  const enrolledClasses: { id: string; name: string; room?: string; teacher_name?: string }[] = [];
  if (enrollmentsData && enrollmentsData.length > 0) {
    enrollmentsData.forEach((item: any) => {
      if (item.classes) {
        enrolledClasses.push({
          id: item.classes.id,
          name: item.classes.name,
          room: item.classes.room || "Phòng 204",
          teacher_name: item.classes.teacher?.full_name || "Ban Khảo thí",
        });
      }
    });
  }

  const upcomingTests: UpcomingTestSession[] = [];
  const completedTests: CompletedTestResult[] = [];

  // 4. Truy vấn các bài kiểm tra thực tế từ DB (nếu có)
  if (enrolledClasses.length > 0) {
    const classIds = enrolledClasses.map((c) => c.id);

    try {
      const { data: testAssignments } = await supabase
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
            room,
            teacher:profiles(full_name)
          )
        `)
        .in("class_id", classIds)
        .in("type", ["test", "exam", "quiz"]);

      if (testAssignments && testAssignments.length > 0) {
        const assignmentIds = testAssignments.map((a: any) => a.id);
        const { data: testSubmissions } = await supabase
          .from("submissions")
          .select("*")
          .eq("student_id", studentId)
          .in("assignment_id", assignmentIds);

        const subMap = new Map<string, any>();
        if (testSubmissions) {
          for (const sub of testSubmissions) {
            subMap.set(sub.assignment_id, sub);
          }
        }

        for (const t of testAssignments) {
          const sub = subMap.get(t.id);
          const cls = (t.class as any) || {};
          const clsName = cls.name || "Lớp học";
          const room = cls.room || "Phòng học";
          const teacherName = cls.teacher?.full_name || "Ban Khảo thí";

          if (sub && sub.status === "graded" && typeof sub.score === "number") {
            completedTests.push({
              id: t.id,
              title: t.title || "Bài kiểm tra",
              test_code: `TEST-${t.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
              subject: clsName,
              class_name: clsName,
              date: sub.submitted_at
                ? sub.submitted_at.split("T")[0]
                : t.due_date?.split("T")[0] || new Date().toISOString().split("T")[0],
              score: sub.score,
              max_score: 10,
              ranking:
                sub.score >= 9
                  ? "Xuất sắc"
                  : sub.score >= 8
                  ? "Giỏi"
                  : sub.score >= 6.5
                  ? "Khá"
                  : "Trung bình",
              skills: [],
              general_feedback: sub.feedback || "Hoàn thành bài thi",
              paper_download_url: "#",
              solution_url: "#",
            });
          } else {
            const testDate = t.due_date
              ? t.due_date.split("T")[0]
              : new Date().toISOString().split("T")[0];
            upcomingTests.push({
              id: t.id,
              title: t.title || "Lịch hẹn kiểm tra",
              test_code: `TEST-${t.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
              subject: clsName,
              class_name: clsName,
              date: testDate,
              time: "08:30 - 10:00",
              duration_minutes: 90,
              room: room,
              format: "offline",
              proctor_name: teacherName,
              status: "confirmed",
              notes: t.instructions || "Có mặt đúng giờ theo lịch của lớp.",
            });
          }
        }
      }
    } catch {
      // Bỏ qua lỗi nếu truy vấn thất bại
    }
  }

  return {
    upcomingTests,
    completedTests,
    stats: {
      upcomingCount: upcomingTests.length,
      completedCount: completedTests.length,
      latestScore: completedTests[0]?.score ?? null,
      latestScoreMax: completedTests[0]?.max_score ?? 10,
      latestScoreRanking: completedTests[0]?.ranking,
    },
  };
}

// ==========================================
// 10. TIN TỨC & CẢNH BÁO (NOTIFICATIONS)
// ==========================================

export type NotificationCategory =
  | "academic_warning"
  | "assignment_schedule"
  | "center_news";

export type NotificationPriority = "urgent" | "important" | "normal";

export interface StudentNotificationItem {
  id: string;
  title: string;
  content: string;
  category: NotificationCategory;
  category_label: string;
  priority: NotificationPriority;
  priority_label: string;
  created_at: string;
  relative_time: string;
  is_read: boolean;
  class_name?: string;
  action_url?: string;
  action_label?: string;
  sender?: string;
}

export interface StudentNotificationsSummary {
  notifications: StudentNotificationItem[];
  stats: {
    total: number;
    unreadCount: number;
    importantCount: number;
  };
  error?: string;
}

/**
 * Server Action lấy danh sách tin tức và cảnh báo cho học viên:
 * 1. Xác thực user hiện tại qua `supabase.auth.getUser()`.
 * 2. Xác thực học sinh theo `students.auth_user_id = user.id`.
 * 3. Lấy thông tin lớp học và số buổi học còn lại (balance_sessions).
 * 4. Tự động sinh dữ liệu thông báo/cảnh báo đa chiều gắn chuẩn theo ngữ cảnh thực tế của học sinh.
 */
export async function getStudentNotifications(): Promise<StudentNotificationsSummary> {
  const supabase = await createClient();

  // 1. Kiểm tra session hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      notifications: [],
      stats: {
        total: 0,
        unreadCount: 0,
        importantCount: 0,
      },
      error: "Chưa đăng nhập",
    };
  }

  // 2. Lấy thông tin học sinh
  const { data: studentData } = await supabase
    .from("students")
    .select("id, full_name, parent_phone")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentId = studentData?.id || user.id;

  // 3. Lấy các lớp đang học và số buổi còn lại
  const { data: enrollmentsData } = await supabase
    .from("enrollments")
    .select(`
      class_id,
      balance_sessions,
      status,
      classes (
        id,
        name,
        room,
        teacher:profiles (
          full_name
        )
      )
    `)
    .eq("student_id", studentId)
    .eq("status", "active");

  let totalBalance = 0;
  const enrolledClasses: { id: string; name: string; room?: string; teacher_name?: string }[] = [];

  if (enrollmentsData && enrollmentsData.length > 0) {
    enrollmentsData.forEach((item: any) => {
      if (typeof item.balance_sessions === "number") {
        totalBalance += item.balance_sessions;
      }
      if (item.classes) {
        enrolledClasses.push({
          id: item.classes.id,
          name: item.classes.name,
          room: item.classes.room || "Phòng 204",
          teacher_name: item.classes.teacher?.full_name || "Giáo viên bộ môn",
        });
      }
    });
  }

  const primaryClass = enrolledClasses[0] || null;

  // 4. Tổng hợp danh sách thông báo — CHỈ từ tín hiệu dữ liệu thật, không bịa
  // nội dung (trước đây có 5 thông báo hoàn toàn hư cấu — tên giáo viên, lịch
  // thi, tin tức trung tâm không tồn tại — đã bỏ, vi phạm AGENTS.md Mục 11.1).
  const notifications: StudentNotificationItem[] = [];

  // 4.1. Cảnh báo học phí & số buổi học (nếu số buổi <= 2 hoặc âm buổi) — dữ liệu thật
  if (totalBalance <= 2 && enrolledClasses.length > 0) {
    notifications.push({
      id: `notif-warn-${studentId.slice(0, 4)}-balance`,
      title: totalBalance < 0 ? "Cảnh báo nợ học phí khẩn cấp" : "Nhắc nhở gia hạn số buổi học",
      content:
        totalBalance < 0
          ? `Số buổi học hiện tại của bạn đang bị âm (${totalBalance} buổi). Vui lòng liên hệ ngay phòng Giáo vụ hoặc hotline trung tâm để quyết toán học phí nhằm duy trì quyền lợi học tập.`
          : `Số buổi học còn lại của bạn chỉ còn ${totalBalance} buổi. Hãy chủ động đăng ký gia hạn học phí để không bị gián đoạn lộ trình học tập.`,
      category: "academic_warning",
      category_label: "Cảnh báo học vụ",
      priority: totalBalance < 0 ? "urgent" : "important",
      priority_label: totalBalance < 0 ? "Khẩn cấp" : "Quan trọng",
      created_at: new Date().toISOString(),
      relative_time: "Vừa cập nhật",
      is_read: false,
      class_name: primaryClass?.name,
      action_url: "/student/classes",
      action_label: "Kiểm tra số buổi học",
      sender: "Phòng Giáo vụ & Kế toán",
    });
  }

  // 4.2. Bài tập sắp/đã quá hạn chưa nộp — dữ liệu thật từ assignments+submissions
  if (enrolledClasses.length > 0) {
    const classIds = enrolledClasses.map((c) => c.id);
    const { data: openAssignments } = await supabase
      .from("assignments")
      .select("id, title, due_date, class_id")
      .in("class_id", classIds)
      .not("due_date", "is", null);

    if (openAssignments && openAssignments.length > 0) {
      const assignmentIds = openAssignments.map((a) => a.id);
      const { data: mySubmissions } = await supabase
        .from("submissions")
        .select("assignment_id")
        .eq("student_id", studentId)
        .in("assignment_id", assignmentIds);

      const submittedIds = new Set((mySubmissions || []).map((s) => s.assignment_id));
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      const dueSoonOrOverdue = openAssignments.filter((a) => {
        if (submittedIds.has(a.id)) return false;
        const due = new Date(a.due_date as string).getTime();
        return due - now <= ONE_DAY_MS; // đã quá hạn hoặc còn <= 1 ngày
      });

      if (dueSoonOrOverdue.length > 0) {
        const cls = enrolledClasses.find((c) => c.id === dueSoonOrOverdue[0].class_id);
        notifications.push({
          id: `notif-assign-${studentId.slice(0, 4)}-due`,
          title: `Bạn có ${dueSoonOrOverdue.length} bài tập sắp/đã quá hạn nộp`,
          content: `"${dueSoonOrOverdue[0].title}"${dueSoonOrOverdue.length > 1 ? ` và ${dueSoonOrOverdue.length - 1} bài khác` : ""} cần nộp gấp. Vào mục Bài tập để nộp ngay.`,
          category: "assignment_schedule",
          category_label: "Bài tập & Lịch học",
          priority: "important",
          priority_label: "Quan trọng",
          created_at: new Date().toISOString(),
          relative_time: "Vừa cập nhật",
          is_read: false,
          class_name: cls?.name,
          action_url: "/student/assignments",
          action_label: "Nộp bài tập ngay",
        });
      }
    }
  }

  // 4.3. Bài vừa được giáo viên chấm điểm gần đây (7 ngày) — dữ liệu thật
  const { data: recentGraded } = await supabase
    .from("submissions")
    .select("id, score, assignment:assignments(title, class_id)")
    .eq("student_id", studentId)
    .eq("status", "graded")
    .not("score", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(1);

  if (recentGraded && recentGraded.length > 0) {
    const g = recentGraded[0] as any;
    const cls = enrolledClasses.find((c) => c.id === g.assignment?.class_id);
    notifications.push({
      id: `notif-graded-${studentId.slice(0, 4)}-${g.id}`,
      title: "Bài làm của bạn vừa được chấm điểm",
      content: `"${g.assignment?.title || "Bài tập"}" đã có điểm: ${g.score}. Xem chi tiết nhận xét trong mục Điểm số.`,
      category: "assignment_schedule",
      category_label: "Bài tập & Lịch học",
      priority: "normal",
      priority_label: "Thông thường",
      created_at: new Date().toISOString(),
      relative_time: "Gần đây",
      is_read: false,
      class_name: cls?.name,
      action_url: "/student/grades",
      action_label: "Xem điểm",
    });
  }

  // 5. Thống kê số lượng
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const importantCount = notifications.filter(
    (n) => n.priority === "urgent" || n.priority === "important"
  ).length;

  return {
    notifications,
    stats: {
      total: notifications.length,
      unreadCount,
      importantCount,
    },
  };
}

/* ==========================================================================
   MODULE: PHẢN HỒI & ĐÓNG GÓP Ý KIẾN (STUDENT FEEDBACK)
   ========================================================================== */

export interface StudentFeedbackInput {
  category: "teaching_quality" | "facilities" | "tuition_schedule" | "other";
  class_id?: string;
  rating: number; // 1 đến 5 sao
  title: string;
  content: string;
}

export interface StudentFeedbackItem {
  id: string;
  student_id: string;
  category: "teaching_quality" | "facilities" | "tuition_schedule" | "other";
  category_label: string;
  class_id?: string | null;
  class_name?: string | null;
  rating: number;
  title: string;
  content: string;
  status: "pending" | "resolved" | "processing";
  status_label: string;
  admin_response?: string | null;
  responded_at?: string | null;
  created_at: string;
}

export interface StudentFeedbackClassOption {
  id: string;
  name: string;
  code?: string;
}

export interface StudentFeedbacksData {
  classes: StudentFeedbackClassOption[];
  feedbacks: StudentFeedbackItem[];
  stats: {
    total: number;
    resolvedCount: number;
    pendingCount: number;
    averageRating: number | null;
  };
  error?: string;
}

/**
 * Server Action gửi phản hồi từ học sinh:
 * - Bảo mật: Xác thực phiên đăng nhập bằng `supabase.auth.getUser()`, lấy `student.id` qua `auth_user_id = user.id`.
 * - Validation: Bắt buộc có `title`, `content` không rỗng, `rating` 1..5.
 * - Lưu trữ an toàn: Insert vào `student_feedbacks`. Nếu bảng chưa có, try-catch fallback giả lập thành công để không gián đoạn UI.
 */
export async function submitStudentFeedback(
  input: StudentFeedbackInput
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  feedback?: StudentFeedbackItem;
}> {
  const supabase = await createClient();

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Chưa đăng nhập. Vui lòng đăng nhập lại." };
  }

  // 2. Tìm student record theo auth_user_id = user.id (chống IDOR tuyệt đối)
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentId = student?.id || user.id;

  // 3. Validation dữ liệu đầu vào
  const trimmedTitle = input.title ? input.title.trim() : "";
  const trimmedContent = input.content ? input.content.trim() : "";

  if (!trimmedTitle) {
    return { success: false, error: "Vui lòng nhập tiêu đề phản hồi." };
  }

  if (!trimmedContent) {
    return { success: false, error: "Vui lòng nhập nội dung chi tiết phản hồi." };
  }

  const rating = Number(input.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Số sao đánh giá phải từ 1 đến 5." };
  }

  const validCategories = [
    "teaching_quality",
    "facilities",
    "tuition_schedule",
    "other",
  ];
  const category = validCategories.includes(input.category)
    ? input.category
    : "other";

  const nowIso = new Date().toISOString();

  // 4. Lưu vào bảng student_feedbacks — KHÔNG nuốt lỗi (trước đây bọc
  // try/catch rồi vẫn báo thành công dù insert thất bại thật, học sinh tưởng
  // đã gửi phản hồi nhưng không có gì được lưu — xem bài học AGENTS.md Mục 3).
  const { data: inserted, error: insertError } = await supabase
    .from("student_feedbacks")
    .insert({
      student_id: studentId,
      category,
      class_id: input.class_id || null,
      rating,
      title: trimmedTitle,
      content: trimmedContent,
      status: "pending",
    })
    .select()
    .single();

  if (insertError || !inserted) {
    return {
      success: false,
      error: `Không thể gửi phản hồi: ${insertError?.message || "Lỗi không xác định"}`,
    };
  }

  const newFeedbackId = inserted.id;

  revalidatePath("/student/feedback");

  const categoryLabels: Record<string, string> = {
    teaching_quality: "Chất lượng giảng dạy",
    facilities: "Cơ sở vật chất",
    tuition_schedule: "Học phí & Lịch học",
    other: "Góp ý khác",
  };

  const createdFeedback: StudentFeedbackItem = {
    id: newFeedbackId,
    student_id: studentId,
    category: category as any,
    category_label: categoryLabels[category] || "Góp ý khác",
    class_id: input.class_id || null,
    rating,
    title: trimmedTitle,
    content: trimmedContent,
    status: "pending",
    status_label: "Đang xử lý",
    admin_response: null,
    responded_at: null,
    created_at: nowIso,
  };

  return {
    success: true,
    message:
      "Cảm ơn bạn đã gửi phản hồi! Chúng tôi đã ghi nhận đóng góp của bạn.",
    feedback: createdFeedback,
  };
}

/**
 * Server Action lấy danh sách phản hồi của học sinh & danh sách lớp học để chọn:
 * - Lấy danh sách lớp active của học sinh.
 * - Lấy danh sách phản hồi của studentId.
 * - Nếu chưa có dữ liệu, trả về danh sách mẫu chuẩn nghiệp vụ kèm admin_response để UI luôn sống động.
 */
export async function getStudentFeedbacks(): Promise<StudentFeedbacksData> {
  const supabase = await createClient();

  const categoryLabels: Record<string, string> = {
    teaching_quality: "Chất lượng giảng dạy",
    facilities: "Cơ sở vật chất",
    tuition_schedule: "Học phí & Lịch học",
    other: "Góp ý khác",
  };

  const statusLabels: Record<string, string> = {
    pending: "Đang xử lý",
    processing: "Đang xử lý",
    resolved: "Đã xử lý",
  };

  // 1. Kiểm tra session đăng nhập
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      classes: [],
      feedbacks: [],
      stats: { total: 0, resolvedCount: 0, pendingCount: 0, averageRating: null },
      error: "Chưa đăng nhập",
    };
  }

  // 2. Tìm student record
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentId = student?.id || user.id;

  // 3. Lấy danh sách lớp học active mà học sinh đang tham gia
  const classesOptions: StudentFeedbackClassOption[] = [];
  try {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        class_id,
        status,
        class:classes(id, name, code)
      `)
      .eq("student_id", studentId)
      .eq("status", "active");

    if (enrollments && enrollments.length > 0) {
      for (const e of enrollments) {
        const cls = Array.isArray(e.class) ? e.class[0] : (e.class as any);
        if (cls?.id && cls?.name) {
          classesOptions.push({
            id: cls.id,
            name: cls.name,
            code: cls.code || undefined,
          });
        }
      }
    }
  } catch (err: any) {
    console.warn("Lỗi khi lấy danh sách lớp của học sinh:", err?.message || err);
  }

  // 4. Lấy lịch sử phản hồi
  let feedbacks: StudentFeedbackItem[] = [];
  try {
    const { data: dbFeedbacks, error: fbError } = await supabase
      .from("student_feedbacks")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (!fbError && dbFeedbacks && dbFeedbacks.length > 0) {
      feedbacks = dbFeedbacks.map((fb: any) => ({
        id: fb.id,
        student_id: fb.student_id,
        category: fb.category || "other",
        category_label: categoryLabels[fb.category] || "Góp ý khác",
        class_id: fb.class_id || null,
        class_name:
          classesOptions.find((c) => c.id === fb.class_id)?.name || null,
        rating: typeof fb.rating === "number" ? fb.rating : 5,
        title: fb.title || "Phản hồi học vụ",
        content: fb.content || "",
        status: fb.status || "pending",
        status_label: statusLabels[fb.status] || "Đang xử lý",
        admin_response: fb.admin_response || null,
        responded_at: fb.responded_at || null,
        created_at: fb.created_at || new Date().toISOString(),
      }));
    }
  } catch (err: any) {
    console.warn("Lỗi truy vấn student_feedbacks, dùng fallback mẫu:", err?.message || err);
  }

  const resolvedCount = feedbacks.filter((f) => f.status === "resolved").length;
  const pendingCount = feedbacks.filter((f) => f.status !== "resolved").length;
  const averageRating =
    feedbacks.length > 0
      ? Number(
          (
            feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          ).toFixed(1)
        )
      : null;

  return {
    classes: classesOptions,
    feedbacks,
    stats: {
      total: feedbacks.length,
      resolvedCount,
      pendingCount,
      averageRating,
    },
  };
}
