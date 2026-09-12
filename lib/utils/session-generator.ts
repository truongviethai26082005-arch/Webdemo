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
