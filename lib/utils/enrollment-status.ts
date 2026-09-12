// lib/utils/enrollment-status.ts

export type EffectiveStatus = "active" | "paused" | "dropped";

export interface EnrollmentInput {
  status: string;
  paused_at: string | null;
  balance_sessions: number;
}

export interface ClassInfoInput {
  end_date: string | null;
}

/**
 * Tính trạng thái THỰC SỰ của 1 lượt ghi danh tại thời điểm gọi hàm.
 */
export function getEffectiveEnrollmentStatus(
  enrollment: EnrollmentInput,
  classInfo: ClassInfoInput,
  now: Date = new Date()
): EffectiveStatus {
  // 1. Admin đã chốt dropped bằng tay -> tôn trọng tuyệt đối
  if (enrollment.status === "dropped") return "dropped";

  // 2. Xác định mốc thời điểm "bắt đầu tính nghỉ"
  let pausedSince: Date | null = null;

  if (classInfo.end_date && now > new Date(classInfo.end_date)) {
    // Lớp theo khóa: đã quá ngày bế giảng
    pausedSince = new Date(classInfo.end_date);
  } else if (enrollment.balance_sessions <= 0) {
    // Lớp theo buổi: đã hết số buổi (dùng paused_at hoặc fallback là now)
    pausedSince = enrollment.paused_at ? new Date(enrollment.paused_at) : now;
  }

  if (!pausedSince) return "active";

  // 3. Nếu đã qua mốc paused >= 7 ngày -> dropped, ngược lại là paused
  const daysSincePaused = (now.getTime() - pausedSince.getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePaused >= 7 ? "dropped" : "paused";
}

/**
 * Tính trạng thái TỔNG QUÁT của 1 học sinh từ tất cả enrollment của họ.
 * Ưu tiên: active > paused > dropped
 */
export function getEffectiveStudentStatus(
  effectiveStatuses: Array<EffectiveStatus>
): EffectiveStatus {
  if (effectiveStatuses.length === 0) return "active";
  if (effectiveStatuses.includes("active")) return "active";
  if (effectiveStatuses.includes("paused")) return "paused";
  return "dropped";
}

/**
 * Tự động đồng bộ trạng thái của bảng students dựa trên các enrollments của học sinh.
 * 1. Lấy tất cả enrollments của studentId (kèm class info để biết end_date).
 * 2. Với mỗi enrollment, gọi getEffectiveEnrollmentStatus() để tính trạng thái thật.
 * 3. Gọi getEffectiveStudentStatus() để ra trạng thái tổng quát.
 * 4. Update students.status nếu giá trị mới khác giá trị hiện tại.
 * 5. Trả về trạng thái mới đã ghi (hoặc null nếu không đổi / lỗi).
 */
export async function syncStudentStatusFromEnrollments(
  supabase: any,
  studentId: string
): Promise<EffectiveStatus | null> {
  try {
    if (!studentId) return null;

    // 1. Lấy thông tin student hiện tại và tất cả enrollments kèm class info
    const [studentRes, enrollmentsRes] = await Promise.all([
      supabase
        .from("students")
        .select("id, status")
        .eq("id", studentId)
        .single(),
      supabase
        .from("enrollments")
        .select("id, status, paused_at, balance_sessions, class:classes(end_date)")
        .eq("student_id", studentId),
    ]);

    if (studentRes.error || !studentRes.data) {
      console.error("syncStudentStatusFromEnrollments: Lỗi khi lấy thông tin học sinh:", studentRes.error);
      return null;
    }

    if (enrollmentsRes.error) {
      console.error("syncStudentStatusFromEnrollments: Lỗi khi lấy danh sách ghi danh:", enrollmentsRes.error);
      return null;
    }

    const currentStudentStatus = studentRes.data.status;
    const enrollments = enrollmentsRes.data || [];

    // 2. Tính effective status cho từng enrollment
    const effectiveStatuses: EffectiveStatus[] = enrollments.map((en: any) => {
      const classInfo: ClassInfoInput = {
        end_date: Array.isArray(en.class)
          ? en.class[0]?.end_date ?? null
          : en.class?.end_date ?? null,
      };
      const enrollmentInput: EnrollmentInput = {
        status: en.status,
        paused_at: en.paused_at,
        balance_sessions: en.balance_sessions ?? 0,
      };
      return getEffectiveEnrollmentStatus(enrollmentInput, classInfo);
    });

    // 3. Tính trạng thái tổng quát của học sinh
    const effectiveStatus = getEffectiveStudentStatus(effectiveStatuses);

    // 4. Update students.status nếu khác trạng thái hiện tại
    if (effectiveStatus !== currentStudentStatus) {
      const { error: updateError } = await supabase
        .from("students")
        .update({ status: effectiveStatus })
        .eq("id", studentId);

      if (updateError) {
        console.error("syncStudentStatusFromEnrollments: Lỗi khi cập nhật trạng thái học sinh:", updateError);
        return null;
      }

      return effectiveStatus;
    }

    return null;
  } catch (err) {
    console.error("syncStudentStatusFromEnrollments: Ngoại lệ bất ngờ:", err);
    return null;
  }
}

