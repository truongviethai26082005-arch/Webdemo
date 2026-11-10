"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Class, Profile } from "@/types/database";
import { requireRole } from "@/lib/auth/guards";
import { ensureSessionsGenerated, cleanupStaleScheduledSessions } from "@/lib/utils/session-generator";

export async function getClasses(): Promise<Class[]> {
  const supabase = await createClient();
  
  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *,
      teacher:profiles!classes_teacher_id_fkey(*),
      enrollments:enrollments(id, status)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return (classes || []).map((c: any) => {
    const activeEnrollments = (c.enrollments || []).filter(
      (e: any) => !e.status || e.status === "active"
    );
    return {
      ...c,
      enrollments: activeEnrollments,
      enrollment_count: activeEnrollments.length,
    };
  });
}

export async function getClassById(id: string) {
  const guard = await requireRole(["admin", "teacher"]);
  if (!guard.authorized) return null;
  const { supabase, user, role } = guard.context;

  // 1. Kiểm tra an toàn id
  if (!id || typeof id !== "string" || id.trim() === "" || id === "undefined" || id === "null") {
    console.warn("getClassById: id không hợp lệ hoặc bị undefined:", id);
    return null;
  }

  try {
    // 2. Thực hiện query database với maybeSingle() để tránh lỗi khi không tìm thấy
    const { data: classData, error } = await supabase
      .from("classes")
      .select(`
        *,
        teacher:profiles!classes_teacher_id_fkey(*),
        enrollments:enrollments(
          id,
          balance_sessions,
          joined_at,
          status,
          student:students(*)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching class by id:", error.message || JSON.stringify(error));
      return null;
    }

    if (!classData) {
      return null;
    }

    // Nếu role là teacher: kiểm tra class.teacher_id === user.id
    if (role === "teacher" && classData.teacher_id !== user.id) {
      return null;
    }

    const activeEnrollments = (classData.enrollments || []).filter(
      (e: any) => (!e.status || e.status === "active") && e.student
    );

    return {
      ...classData,
      enrollments: activeEnrollments,
      enrollment_count: activeEnrollments.length,
    };
  } catch (err) {
    console.error("Catch error fetching class by id:", err);
    return null;
  }
}

function getDayIdFromIsoDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return map[date.getDay()];
  }
  return "";
}

function getDayNameVi(dayId: string): string {
  const map: Record<string, string> = {
    T2: "Thứ 2",
    T3: "Thứ 3",
    T4: "Thứ 4",
    T5: "Thứ 5",
    T6: "Thứ 6",
    T7: "Thứ 7",
    CN: "Chủ Nhật",
  };
  return map[dayId] || dayId;
}

// So sánh 2 lịch học bất kể thứ tự phần tử/khóa JSON, chỉ quan tâm
// (thứ, giờ bắt đầu, giờ kết thúc) — dùng để phát hiện Admin có thực sự đổi
// lịch học hay không khi sửa lớp, tránh chạy đồng bộ lại session không cần thiết.
function normalizeScheduleForCompare(schedule: any): string {
  if (!Array.isArray(schedule)) return "";
  return JSON.stringify(
    schedule
      .map((s: any) => ({
        day: s?.day || "",
        start_time: s?.start_time || "",
        end_time: s?.end_time || "",
      }))
      .sort((a, b) => (a.day + a.start_time).localeCompare(b.day + b.start_time))
  );
}

function findClassConflict({
  targetClassId,
  teacherId,
  room,
  schedule,
  existingClasses,
}: {
  targetClassId?: string;
  teacherId?: string | null;
  room?: string | null;
  schedule: any;
  existingClasses: any[];
}): string | null {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return null;

  const targetRoom = room?.trim().toLowerCase();

  for (const cls of existingClasses) {
    if (targetClassId && cls.id === targetClassId) continue;

    let otherSchedule: any[] = [];
    if (Array.isArray(cls.schedule)) {
      otherSchedule = cls.schedule;
    } else if (typeof cls.schedule === "string") {
      try {
        otherSchedule = JSON.parse(cls.schedule);
      } catch {
        otherSchedule = [];
      }
    }

    if (!otherSchedule || otherSchedule.length === 0) continue;

    const isSameTeacher = teacherId && cls.teacher_id && cls.teacher_id === teacherId;
    const isSameRoom = targetRoom && cls.room && targetRoom === cls.room.trim().toLowerCase();

    if (!isSameTeacher && !isSameRoom) continue;

    for (const newItem of schedule) {
      for (const oldItem of otherSchedule) {
        if (newItem.day && oldItem.day && newItem.day === oldItem.day) {
          const startA = newItem.start_time || "18:00";
          const endA = newItem.end_time || "19:30";
          const startB = oldItem.start_time || "18:00";
          const endB = oldItem.end_time || "19:30";

          // Overlap check: startA < endB && endA > startB
          if (startA < endB && endA > startB) {
            const dayText = getDayNameVi(newItem.day);
            if (isSameTeacher) {
              const teacherName = cls.teacher?.full_name || "Giáo viên";
              return `Giáo viên ${teacherName} đã có lịch học lớp "${cls.name}" vào ${dayText}, ${startB} - ${endB}. Vui lòng chọn lịch khác!`;
            }
            if (isSameRoom) {
              return `Phòng học "${cls.room}" đã có lịch học lớp "${cls.name}" vào ${dayText}, ${startB} - ${endB}. Vui lòng chọn lịch khác!`;
            }
          }
        }
      }
    }
  }

  return null;
}

export async function createClass(formData: FormData) {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const name = formData.get("name") as string;
  const room = (formData.get("room") as string) || null;
  const teacher_id = (formData.get("teacher_id") as string) || null;
  const fee_per_session = Number(formData.get("fee_per_session")) || 0;
  const max_students = Number(formData.get("max_students")) || 15;
  const start_date = (formData.get("start_date") as string) || null;
  const end_date = (formData.get("end_date") as string) || null;
  const scheduleRaw = formData.get("schedule") as string;
  let schedule = null;
  if (scheduleRaw) {
    try {
      schedule = JSON.parse(scheduleRaw);
    } catch {
      schedule = null;
    }
  }

  if (!name || name.trim() === "") {
    return { error: "Tên lớp học không được để trống" };
  }

  if (!teacher_id || teacher_id.trim() === "") {
    return { error: "Vui lòng phân công Giáo viên phụ trách lớp học" };
  }

  if (!room || room.trim() === "") {
    return { error: "Vui lòng nhập Phòng học" };
  }

  if (!fee_per_session || fee_per_session <= 0) {
    return { error: "Vui lòng nhập Học phí mỗi buổi lớn hơn 0" };
  }

  if (!start_date) {
    return { error: "Vui lòng chọn Ngày khai giảng" };
  }

  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return { error: "Vui lòng chọn ít nhất 1 thứ trong Lịch học hàng tuần" };
  }

  if (!end_date) {
    return { error: "Vui lòng chọn Thời lượng khóa học để hệ thống tính ngày bế giảng dự kiến" };
  }

  // 1. Validate Ngày khai giảng: phải rơi đúng vào một trong các Thứ của lịch học
  if (start_date && schedule && Array.isArray(schedule) && schedule.length > 0) {
    const startDayId = getDayIdFromIsoDate(start_date);
    const scheduleDays = schedule.map((s: any) => s.day).filter(Boolean);
    if (startDayId && !scheduleDays.includes(startDayId)) {
      const dayVi = getDayNameVi(startDayId);
      const scheduleDaysVi = scheduleDays.map(getDayNameVi).join(", ");
      return {
        error: `Ngày khai giảng (${start_date}) rơi vào ${dayVi}, không trùng với các thứ trong lịch học (${scheduleDaysVi}). Vui lòng chọn ngày khai giảng đúng vào ngày học của lớp!`,
      };
    }
  }

  // 2. Kiểm tra xung đột lịch (Conflict check)
  const { data: existingClasses } = await supabase
    .from("classes")
    .select("id, name, room, teacher_id, schedule, teacher:profiles!classes_teacher_id_fkey(full_name)");

  const conflictError = findClassConflict({
    teacherId: teacher_id === "" ? null : teacher_id,
    room,
    schedule,
    existingClasses: existingClasses || [],
  });

  if (conflictError) {
    return { error: conflictError };
  }

  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: name.trim(),
      room,
      teacher_id: teacher_id === "" ? null : teacher_id,
      fee_per_session,
      max_students,
      start_date,
      end_date,
      schedule,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await ensureSessionsGenerated(supabase, data.id);

  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
  return { success: true, data };
}

export async function updateClass(id: string, formData: FormData) {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  // Ngày khai giảng/Thời lượng/Tổng buổi/Ngày bế giảng/Sĩ số tối đa là dữ
  // liệu hoạch định 1 lần lúc TẠO lớp (xem createClass) — sửa lớp KHÔNG cho
  // chỉnh lại các trường này nữa (dialog không còn gửi lên), nên updateClass()
  // chỉ đọc và ghi đúng 5 thứ thực sự "sửa được" khi vận hành: tên, phòng,
  // giáo viên, học phí, lịch học.
  const name = formData.get("name") as string;
  const room = (formData.get("room") as string) || null;
  const teacher_id = (formData.get("teacher_id") as string) || null;
  const fee_per_session = Number(formData.get("fee_per_session")) || 0;
  const scheduleRaw = formData.get("schedule") as string;
  let schedule = null;
  if (scheduleRaw) {
    try {
      schedule = JSON.parse(scheduleRaw);
    } catch {
      schedule = null;
    }
  }

  if (!name || name.trim() === "") {
    return { error: "Tên lớp học không được để trống" };
  }

  if (!teacher_id || teacher_id.trim() === "") {
    return { error: "Vui lòng phân công Giáo viên phụ trách lớp học" };
  }

  // Lấy dữ liệu lớp TRƯỚC khi update để biết Admin có đổi giáo viên/lịch học
  // hay không — cần thiết để đồng bộ lại class_sessions đã sinh trước đó
  // (AGENTS.md Mục 7: đổi giáo viên/lịch cũ để lại session "ma"/sai lương).
  const { data: beforeUpdate } = await supabase
    .from("classes")
    .select("teacher_id, schedule")
    .eq("id", id)
    .maybeSingle();

  // 2. Kiểm tra xung đột lịch
  const { data: existingClasses } = await supabase
    .from("classes")
    .select("id, name, room, teacher_id, schedule, teacher:profiles!classes_teacher_id_fkey(full_name)");

  const conflictError = findClassConflict({
    targetClassId: id,
    teacherId: teacher_id === "" ? null : teacher_id,
    room,
    schedule,
    existingClasses: existingClasses || [],
  });

  if (conflictError) {
    return { error: conflictError };
  }

  const { data, error } = await supabase
    .from("classes")
    .update({
      name: name.trim(),
      room,
      teacher_id: teacher_id === "" ? null : teacher_id,
      fee_per_session,
      schedule,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const newTeacherId = teacher_id === "" ? null : teacher_id;

  // Đồng bộ lại class_sessions CHƯA diễn ra (status = 'scheduled') khi Admin
  // đổi giáo viên hoặc đổi lịch học — không đụng tới buổi đã 'completed'
  // (giữ đúng lịch sử lương/điểm danh) hay đã 'cancelled'.
  if (beforeUpdate) {
    const teacherChanged = (beforeUpdate.teacher_id || null) !== newTeacherId;
    const scheduleChanged =
      normalizeScheduleForCompare(beforeUpdate.schedule) !== normalizeScheduleForCompare(schedule);

    if (teacherChanged) {
      await supabase
        .from("class_sessions")
        .update({ teacher_id: newTeacherId })
        .eq("class_id", id)
        .eq("status", "scheduled");
    }

    if (scheduleChanged) {
      await cleanupStaleScheduledSessions(supabase, id, schedule);
    }
  }

  await ensureSessionsGenerated(supabase, id);

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true, data };
}

export async function deleteClass(id: string) {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getTeacherOptions(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Profile[];
}

export async function getClassesByTeacher(teacherId?: string) {
  const guard = await requireRole(["admin", "teacher"]);
  if (!guard.authorized) return [];
  const { supabase, user, role } = guard.context;

  let currentTeacherId = teacherId;
  if (role === "teacher") {
    currentTeacherId = user.id;
  } else if (!currentTeacherId) {
    currentTeacherId = user.id;
  }
  if (!currentTeacherId) return [];

  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *,
      enrollments:enrollments(
        id,
        balance_sessions,
        joined_at,
        status,
        student:students(*)
      )
    `)
    .eq("teacher_id", currentTeacherId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching teacher classes:", error);
    return [];
  }

  return (classes || []).map((c: any) => {
    const activeEnrollments = (c.enrollments || []).filter(
      (e: any) => (!e.status || e.status === "active") && e.student
    );
    return {
      ...c,
      enrollments: activeEnrollments,
      enrollment_count: activeEnrollments.length,
    };
  });
}

