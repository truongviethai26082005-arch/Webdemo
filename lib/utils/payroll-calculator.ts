import { AppTeacher } from "@/lib/constants/teachers";
import { AppClass } from "@/lib/context/app-data-context";
import { TeacherPayroll, TeacherSessionDetail, Profile } from "@/types/database";

/**
 * Trích xuất các thứ trong tuần và giờ học từ chuỗi schedule
 * VD: "Thứ 4 & Thứ 7 (18:00 - 19:30)" -> days: [3, 6], time: "18:00 - 19:30"
 */
function parseScheduleDetails(scheduleStr?: string): {
  days: number[]; // 0: CN, 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7
  startTime: string;
  endTime: string;
} {
  const result = {
    days: [1, 4] as number[], // default T2 & T5
    startTime: "18:00",
    endTime: "19:30",
  };

  if (!scheduleStr) return result;

  const lower = scheduleStr.toLowerCase();

  // Extract time: (HH:mm - HH:mm)
  const timeMatch = scheduleStr.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (timeMatch) {
    result.startTime = timeMatch[1];
    result.endTime = timeMatch[2];
  }

  const detectedDays: number[] = [];
  if (lower.includes("thứ 2") || lower.includes("thứ hai") || lower.includes("t2")) detectedDays.push(1);
  if (lower.includes("thứ 3") || lower.includes("thứ ba") || lower.includes("t3")) detectedDays.push(2);
  if (lower.includes("thứ 4") || lower.includes("thứ tư") || lower.includes("t4")) detectedDays.push(3);
  if (lower.includes("thứ 5") || lower.includes("thứ năm") || lower.includes("t5")) detectedDays.push(4);
  if (lower.includes("thứ 6") || lower.includes("thứ sáu") || lower.includes("t6")) detectedDays.push(5);
  if (lower.includes("thứ 7") || lower.includes("thứ bảy") || lower.includes("t7")) detectedDays.push(6);
  if (lower.includes("chủ nhật") || lower.includes("cn")) detectedDays.push(0);

  if (detectedDays.length > 0) {
    result.days = detectedDays;
  }

  return result;
}

/**
 * Tính toán Bảng lương giáo viên chuẩn từ danh sách classes và teachers
 * Áp dụng thống nhất cho cả /admin/teachers và /admin/finance
 */
export function calculateTeacherPayrollFromClasses(
  teachers: AppTeacher[],
  classes: AppClass[],
  month: number,
  year: number
): TeacherPayroll[] {
  // Số ngày trong tháng
  const daysInMonth = new Date(year, month, 0).getDate();

  return teachers.map((t) => {
    // 1. Tìm tất cả các lớp giáo viên này phụ trách
    const tName = (t.full_name || t.name || "").toLowerCase();
    const cleanName = tName.replace(/^(thầy|cô)\s+/i, "");

    const assignedClasses = classes.filter((cls) => {
      const clsAny = cls as any;
      const clsTeacherId = cls.teacher_id || clsAny.teacherId;
      const clsTeacherName = (cls.teacherName || clsAny.teacher_name || "").toLowerCase();

      return (
        clsTeacherId === t.id ||
        clsTeacherName.includes(tName) ||
        (cleanName && clsTeacherName.includes(cleanName))
      );
    });

    // 2. Trích xuất tất cả ca dạy thực tế của các lớp trong tháng
    const allSessions: TeacherSessionDetail[] = [];

    assignedClasses.forEach((cls) => {
      const sched = typeof cls.schedule === "string" ? cls.schedule : "";
      const { days, startTime, endTime } = parseScheduleDetails(sched);
      const studentCount = cls.currentEnrolled ?? cls.enrollment_count ?? cls.currentStudents ?? 15;

      // Quét từng ngày trong tháng
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        const dayOfWeek = currentDate.getDay(); // 0 = CN, 1 = T2, ...

        if (days.includes(dayOfWeek)) {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          allSessions.push({
            id: `sess-${cls.id}-${dateStr}`,
            sessionDate: dateStr,
            startTime,
            endTime,
            className: cls.name,
            room: cls.room || "P.201",
            attendanceCount: studentCount,
            status: "completed",
          });
        }
      }
    });

    // Sắp xếp các ca dạy giảm dần theo ngày
    allSessions.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

    const completedSessions = allSessions.length;
    const salaryPerSession = t.salary_per_session || 220000;
    const totalSalary = completedSessions * salaryPerSession;

    const profileTeacher: Profile = {
      id: t.id,
      full_name: t.full_name || t.name,
      phone: t.phone || null,
      salary_per_session: salaryPerSession,
      bank_name: t.bank_name || null,
      bank_account_no: t.bank_account_no || null,
      role: "teacher",
      created_at: t.created_at || new Date().toISOString(),
    };

    return {
      teacher: profileTeacher,
      completedSessions,
      salaryPerSession,
      totalSalary,
      sessions: allSessions,
    };
  });
}
