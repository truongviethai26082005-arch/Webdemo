/**
 * Tiện ích tự động sinh các buổi học (class_sessions) theo lịch học (classes.schedule).
 */

const DAY_MAP: Record<string, number> = {
  CN: 0,
  T2: 1,
  T3: 2,
  T4: 3,
  T5: 4,
  T6: 5,
  T7: 6,
};

function getVietnamTodayString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().split("T")[0];
}

/**
 * Xóa các buổi học 'scheduled' (chưa diễn ra, chưa điểm danh) không còn khớp
 * với lịch học MỚI của lớp — đây là các session "ma" sinh ra theo lịch cũ.
 * Không đụng tới buổi 'completed'/'cancelled' (giữ nguyên lịch sử điểm danh/lương).
 */
export async function cleanupStaleScheduledSessions(
  supabase: any,
  classId: string,
  newSchedule: any[] | null
): Promise<void> {
  try {
    if (!classId) return;

    const scheduleList = Array.isArray(newSchedule) ? newSchedule : [];
    const validSlotKeys = new Set(
      scheduleList
        .filter((s: any) => s?.day)
        .map((s: any) => `${String(s.day).trim().toUpperCase()}_${s.start_time || ""}`)
    );

    const { data: scheduledSessions, error } = await supabase
      .from("class_sessions")
      .select("id, session_date, start_time")
      .eq("class_id", classId)
      .eq("status", "scheduled");

    if (error) {
      console.error("cleanupStaleScheduledSessions: Error fetching sessions:", error);
      return;
    }
    if (!scheduledSessions || scheduledSessions.length === 0) return;

    const staleIds: string[] = [];
    for (const s of scheduledSessions) {
      const parts = String(s.session_date).split("-").map(Number);
      if (parts.length !== 3) continue;
      const [y, m, d] = parts;
      const dateObj = new Date(y, m - 1, d, 12, 0, 0);
      const dayId = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateObj.getDay()];
      const key = `${dayId}_${s.start_time || ""}`;
      if (!validSlotKeys.has(key)) {
        staleIds.push(s.id);
      }
    }

    if (staleIds.length > 0) {
      const { error: deleteErr } = await supabase
        .from("class_sessions")
        .delete()
        .in("id", staleIds);
      if (deleteErr) {
        console.error("cleanupStaleScheduledSessions: Error deleting stale sessions:", deleteErr);
      }
    }
  } catch (err) {
    console.error("cleanupStaleScheduledSessions: Unexpected error:", err);
  }
}

export async function ensureSessionsGenerated(
  supabase: any,
  classId: string
): Promise<void> {
  try {
    if (!classId) return;

    // 1. Lấy thông tin lớp
    const { data: cls, error: clsError } = await supabase
      .from("classes")
      .select("id, start_date, end_date, schedule, teacher_id")
      .eq("id", classId)
      .maybeSingle();

    if (clsError || !cls) {
      if (clsError) {
        console.error("ensureSessionsGenerated: Error fetching class:", clsError);
      }
      return;
    }

    let scheduleList: any[] = [];
    if (Array.isArray(cls.schedule)) {
      scheduleList = cls.schedule;
    } else if (typeof cls.schedule === "string") {
      try {
        scheduleList = JSON.parse(cls.schedule);
      } catch {
        scheduleList = [];
      }
    }

    if (!Array.isArray(scheduleList) || scheduleList.length === 0) {
      return;
    }

    // 2. Xác định khoảng ngày cần đảm bảo có session
    const today = getVietnamTodayString();
    let rangeStart = today;
    if (cls.start_date) {
      rangeStart = cls.start_date > today ? cls.start_date : today;
    }

    let rangeEnd: string;
    if (cls.end_date) {
      rangeEnd = cls.end_date;
    } else {
      rangeEnd = addDays(today, 30);
    }

    if (rangeStart > rangeEnd) {
      return;
    }

    // 4. Duyệt từng ngày từ rangeStart tới rangeEnd và thu thập các buổi cần có
    interface CandidateSession {
      session_date: string;
      start_time: string | null;
      end_time: string | null;
    }

    const requiredSessions: CandidateSession[] = [];
    let current = rangeStart;

    while (current <= rangeEnd) {
      const [y, m, d] = current.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d, 12, 0, 0);
      const dayOfWeek = dateObj.getDay();

      for (const slot of scheduleList) {
        if (!slot?.day) continue;
        const mappedDay = DAY_MAP[slot.day.trim().toUpperCase()];
        if (mappedDay === dayOfWeek) {
          requiredSessions.push({
            session_date: current,
            start_time: slot.start_time || null,
            end_time: slot.end_time || null,
          });
        }
      }

      current = addDays(current, 1);
    }

    if (requiredSessions.length === 0) {
      return;
    }

    // 5. Lấy trước toàn bộ session đã tồn tại trong khoảng [rangeStart, rangeEnd]
    const { data: existingSessions, error: fetchErr } = await supabase
      .from("class_sessions")
      .select("session_date, start_time")
      .eq("class_id", classId)
      .gte("session_date", rangeStart)
      .lte("session_date", rangeEnd);

    if (fetchErr) {
      console.error(
        "ensureSessionsGenerated: Error fetching existing sessions:",
        fetchErr
      );
      return;
    }

    const existingSet = new Set<string>(
      (existingSessions || []).map(
        (s: any) => `${s.session_date}_${s.start_time || ""}`
      )
    );

    // 6. Chỉ insert các buổi còn thiếu
    const sessionsToInsert: any[] = [];
    for (const req of requiredSessions) {
      const key = `${req.session_date}_${req.start_time || ""}`;
      if (!existingSet.has(key)) {
        sessionsToInsert.push({
          class_id: classId,
          teacher_id: cls.teacher_id || null,
          session_date: req.session_date,
          start_time: req.start_time,
          end_time: req.end_time,
          status: "scheduled",
        });
        existingSet.add(key);
      }
    }

    if (sessionsToInsert.length > 0) {
      const { error: insertErr } = await supabase
        .from("class_sessions")
        .insert(sessionsToInsert);

      if (insertErr) {
        console.error(
          "ensureSessionsGenerated: Error inserting sessions:",
          insertErr
        );
      }
    }
  } catch (err) {
    console.error("ensureSessionsGenerated: Unexpected error:", err);
  }
}
