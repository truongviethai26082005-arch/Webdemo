"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Class, Profile } from "@/types/database";

export async function getClasses(): Promise<Class[]> {
  const supabase = await createClient();
  
  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *,
      teacher:profiles!classes_teacher_id_fkey(*),
      enrollments:enrollments(count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return (classes || []).map((c: any) => ({
    ...c,
    enrollment_count: c.enrollments?.[0]?.count || 0,
  }));
}

export async function getClassById(id: string) {
  const supabase = await createClient();

  const { data: classData, error } = await supabase
    .from("classes")
    .select(`
      *,
      teacher:profiles!classes_teacher_id_fkey(*),
      enrollments:enrollments(
        id,
        balance_sessions,
        joined_at,
        student:students(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching class by id:", error);
    return null;
  }

  return classData;
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
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const room = (formData.get("room") as string) || null;
  const teacher_id = (formData.get("teacher_id") as string) || null;
  const fee_per_session = Number(formData.get("fee_per_session")) || 0;
  const max_students = Number(formData.get("max_students")) || 15;
  const start_date = (formData.get("start_date") as string) || null;
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
      schedule,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
  return { success: true, data };
}

export async function updateClass(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const room = (formData.get("room") as string) || null;
  const teacher_id = (formData.get("teacher_id") as string) || null;
  const fee_per_session = Number(formData.get("fee_per_session")) || 0;
  const max_students = Number(formData.get("max_students")) || 15;
  const start_date = (formData.get("start_date") as string) || null;
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

  // 1. Validate Ngày khai giảng
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
      max_students,
      start_date,
      schedule,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true, data };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();
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
    .order("full_name", { ascending: true });

  if (error) return [];
  return data as Profile[];
}

export async function getClassesByTeacher(teacherId?: string) {
  const supabase = await createClient();
  let currentTeacherId = teacherId;
  if (!currentTeacherId) {
    const { data: { user } } = await supabase.auth.getUser();
    currentTeacherId = user?.id;
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
        student:students(*)
      )
    `)
    .eq("teacher_id", currentTeacherId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching teacher classes:", error);
    return [];
  }

  return (classes || []).map((c: any) => ({
    ...c,
    enrollment_count: c.enrollments?.length || 0,
  }));
}

