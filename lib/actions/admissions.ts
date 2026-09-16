"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { requireRole } from "@/lib/auth/guards";
import { createStudent, enrollStudentInClass } from "@/lib/actions/students";
import { createInvoice } from "@/lib/actions/invoices";
import { createAccountByAdmin } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

type SbClient = Awaited<ReturnType<typeof createClient>>;
import {
  Lead,
  LeadInteraction,
  TrialSlot,
  LeadTrial,
  LeadStage,
  LeadStatus,
  LeadSource,
  InteractionChannel,
  FeedbackSentiment,
  TrialResult,
} from "@/types/database";

// ==========================================
// 1. QUẢN LÝ LEADS (KHÁCH HÀNG TIỀM NĂNG)
// ==========================================

export async function getLeads(
  stageFilter?: string,
  statusFilter?: string,
  search?: string
): Promise<Lead[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  let query = supabase
    .from("leads")
    .select(`
      *,
      assigned_sale:profiles!leads_assigned_sale_id_fkey(*),
      converted_student:students(*),
      target_class:classes(*),
      interactions:lead_interactions(*),
      trials:lead_trials(*, slot:trial_slots(*))
    `)
    .order("created_at", { ascending: false });

  if (stageFilter && stageFilter !== "all") {
    query = query.eq("stage", stageFilter);
  }

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(`full_name.ilike.%${s}%,phone.ilike.%${s}%,parent_name.ilike.%${s}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error in getLeads:", error.message || error);
    return [];
  }

  return (data as unknown as Lead[]) || [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return null;
  const { supabase } = guard.context;

  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      assigned_sale:profiles!leads_assigned_sale_id_fkey(*),
      converted_student:students(*),
      target_class:classes(*),
      interactions:lead_interactions(*),
      trials:lead_trials(*, slot:trial_slots(*))
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as Lead;
}

export interface CreateLeadPayload {
  fullName: string;
  parentName?: string;
  phone: string;
  zalo?: string;
  facebookUrl?: string;
  email?: string;
  birthDate?: string;
  grade?: string;
  courseInterest?: string;
  targetGoal?: string;
  source: LeadSource;
  referrerName?: string;
  targetClassId?: string;
  targetClassName?: string;
  note?: string;
}

export async function createLead(payload: CreateLeadPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  if (!payload.fullName?.trim() || !payload.phone?.trim()) {
    return { error: "Vui lòng nhập họ tên học sinh và số điện thoại liên hệ" };
  }

  // Bắt buộc chọn đúng nguồn thật (AGENTS.md Mục 11.1: không tự bịa dữ liệu
  // mặc định khi chưa có dữ liệu thật) — trước đây tự động gán "facebook_ads"
  // khi thiếu, làm sai lệch số liệu "nguồn nào hiệu quả" nếu Sale quên chọn.
  if (!payload.source) {
    return { error: "Vui lòng chọn nguồn tiếp nhận khách hàng" };
  }

  const insertData = {
    full_name: payload.fullName.trim(),
    parent_name: payload.parentName?.trim() || null,
    phone: payload.phone.trim(),
    zalo: payload.zalo?.trim() || null,
    facebook_url: payload.facebookUrl?.trim() || null,
    email: payload.email?.trim() || null,
    birth_date: payload.birthDate || null,
    grade: payload.grade?.trim() || null,
    course_interest: payload.courseInterest?.trim() || null,
    target_goal: payload.targetGoal?.trim() || null,
    source: payload.source,
    referrer_name: payload.referrerName?.trim() || null,
    target_class_id: payload.targetClassId || null,
    target_class_name: payload.targetClassName?.trim() || null,
    note: payload.note?.trim() || null,
    stage: "raw",
    status: "new",
    assigned_sale_id: user.id,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return { error: `Không thể tạo Lead: ${error.message}` };
  }

  revalidatePath("/sale/admissions");
  return { success: true, data };
}

export async function updateLead(id: string, payload: Partial<CreateLeadPayload> & { stage?: LeadStage; status?: LeadStatus }) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.fullName !== undefined) updateData.full_name = payload.fullName.trim();
  if (payload.parentName !== undefined) updateData.parent_name = payload.parentName?.trim() || null;
  if (payload.phone !== undefined) updateData.phone = payload.phone.trim();
  if (payload.zalo !== undefined) updateData.zalo = payload.zalo?.trim() || null;
  if (payload.facebookUrl !== undefined) updateData.facebook_url = payload.facebookUrl?.trim() || null;
  if (payload.email !== undefined) updateData.email = payload.email?.trim() || null;
  if (payload.birthDate !== undefined) updateData.birth_date = payload.birthDate || null;
  if (payload.grade !== undefined) updateData.grade = payload.grade?.trim() || null;
  if (payload.courseInterest !== undefined) updateData.course_interest = payload.courseInterest?.trim() || null;
  if (payload.targetGoal !== undefined) updateData.target_goal = payload.targetGoal?.trim() || null;
  if (payload.source !== undefined) updateData.source = payload.source;
  if (payload.referrerName !== undefined) updateData.referrer_name = payload.referrerName?.trim() || null;
  if (payload.targetClassId !== undefined) updateData.target_class_id = payload.targetClassId || null;
  if (payload.targetClassName !== undefined) updateData.target_class_name = payload.targetClassName?.trim() || null;
  if (payload.note !== undefined) updateData.note = payload.note?.trim() || null;
  if (payload.stage !== undefined) updateData.stage = payload.stage;

  // Đọc trước stage hiện tại của Lead nếu có đổi status — dùng để (a) chặn
  // đổi status tùy tiện khi Lead đã Chính thức (N4), (b) tự thăng N1->N2 khi
  // cần. Luôn tự kiểm tra ở server, không dựa vào việc UI đã ẩn nút hay chưa
  // (đúng nguyên tắc AGENTS.md Mục 5.3).
  let currentStage: LeadStage | undefined;
  if (payload.status !== undefined && payload.stage === undefined) {
    const { data: currentLead } = await supabase
      .from("leads")
      .select("stage")
      .eq("id", id)
      .single();
    currentStage = currentLead?.stage;
  }

  if (payload.status !== undefined) {
    // Lead đã Chính thức (N4) — status coi như cố định là 'converted', không
    // cho lùi lại các trạng thái chăm sóc trước đó (đã liên hệ/hẹn gọi/không
    // nhu cầu) qua đường tắt này nữa.
    if (
      (currentStage === "enrolled" || currentStage === "waiting_class") &&
      payload.status !== "converted"
    ) {
      return { error: "Lead đã chốt học chính thức — không thể đổi lại trạng thái chăm sóc trước đó." };
    }
    updateData.status = payload.status;
  }

  // TỰ ĐỘNG HÓA (đồng bộ với logInteraction()): Sale có 2 cách đánh dấu "đã
  // liên hệ" — form ghi nhật ký đầy đủ (đã tự thăng N1->N2), HOẶC nút "Chuyển
  // nhanh trạng thái" (Đã liên hệ/Hẹn gọi lại) gọi thẳng updateLead() này mà
  // trước đây KHÔNG hề thăng tầng. Hậu quả thật đã phát hiện qua dữ liệu: Lead
  // có status "Đã liên hệ" nhưng vĩnh viễn kẹt ở "N1 Lead thô", nút "Học thử"
  // không bao giờ hiện ra được. Đã đồng bộ lại: nếu gọi hàm này để chuyển
  // status sang "contacted"/"callback" mà không tự chỉ định `stage`, và Lead
  // hiện đang ở "raw", tự động thăng lên "potential" giống hệt logInteraction().
  if (
    (payload.status === "contacted" || payload.status === "callback") &&
    currentStage === "raw"
  ) {
    updateData.stage = "potential";
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: `Cập nhật Lead thất bại: ${error.message}` };
  }

  // ĐỒNG BỘ với "Lịch làm việc hôm nay": trang đó chỉ đọc lịch hẹn gọi lại từ
  // `lead_interactions.callback_at`, KHÔNG đọc `leads.status`. Trước đây nút
  // "Chuyển nhanh trạng thái > Hẹn gọi lại" chỉ đổi `status`, không tạo dòng
  // tương tác nào — Lead hiện "Hẹn gọi lại" nhưng KHÔNG BAO GIỜ xuất hiện ở
  // "Lịch Hẹn Gọi Lại Cho Phụ Huynh" (bug thật đã phát hiện qua dữ liệu thật
  // 2026-09-15). Đã vá: khi chuyển sang status 'callback' theo cách này, tự
  // tạo 1 lịch hẹn gọi lại (nếu Lead chưa có lịch hẹn nào đang chờ xử lý, để
  // tránh tạo trùng khi bấm nút nhiều lần) với thời điểm mặc định NGAY BÂY
  // GIỜ (chưa chọn giờ cụ thể) — Sale có thể chỉnh lại giờ hẹn chính xác hơn
  // qua form "Ghi nhận nhật ký trao đổi" đầy đủ nếu cần.
  if (payload.status === "callback") {
    const { data: existingCallback } = await supabase
      .from("lead_interactions")
      .select("id")
      .eq("lead_id", id)
      .not("callback_at", "is", null)
      .limit(1)
      .maybeSingle();

    if (!existingCallback) {
      await supabase.from("lead_interactions").insert({
        lead_id: id,
        sale_id: user.id,
        channel: "call",
        content: "Hẹn gọi lại nhanh (chưa chọn giờ cụ thể) — xử lý ở Lịch làm việc hôm nay.",
        callback_at: new Date().toISOString(),
      });
    }
  }

  revalidatePath("/sale/admissions");
  revalidatePath("/sale/daily-tasks");
  return { success: true, data };
}

export async function deleteLead(id: string) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) {
    return { error: `Xóa Lead thất bại: ${error.message}` };
  }

  revalidatePath("/sale/admissions");
  return { success: true };
}

// ==========================================
// 2. NHẬT KÝ TƯƠNG TÁC (CRM INTERACTIONS)
// ==========================================

export interface LogInteractionPayload {
  leadId: string;
  channel: InteractionChannel;
  content: string;
  sentiment?: FeedbackSentiment;
  isMissedCall?: boolean;
  callbackAt?: string;
  newStatus?: LeadStatus;
}

export async function logInteraction(payload: LogInteractionPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  if (!payload.leadId || !payload.content?.trim()) {
    return { error: "Vui lòng nhập nội dung tương tác" };
  }

  // 1. Lấy thông tin lead hiện tại TRƯỚC khi ghi — cần để tính đúng số lần
  // gọi nhỡ liên tiếp mới.
  const { data: lead } = await supabase
    .from("leads")
    .select("missed_calls_count, status, stage")
    .eq("id", payload.leadId)
    .single();

  const currentMissed = lead?.missed_calls_count || 0;
  const newMissed = payload.isMissedCall ? currentMissed + 1 : 0; // nếu tương tác thành công -> reset về 0
  const willAutoNoDemand = Boolean(payload.isMissedCall) && newMissed >= 3;

  // 2. Thêm bản ghi tương tác vào lead_interactions. Lưu ý: KHÔNG tự đặt
  // callback_at ở đây khi gọi nhỡ — nhắc nhở "cần gọi lại vì đã gọi nhỡ
  // 1-2/3 lần" được `getSaleDailyTasks()` tự tính TẠI THỜI ĐIỂM ĐỌC trực
  // tiếp từ `leads.missed_calls_count` (xem giải thích ở đó), để không phụ
  // thuộc vào việc có đúng 1 dòng tương tác nào từng được gắn callback_at hay
  // chưa — tránh lặp lại lỗi thật đã phát hiện 2026-09-16 (Lead "Trần Nhật
  // Tân" gọi nhỡ 2 lần nhưng không hiện nhắc nhở). `callback_at` ở đây chỉ
  // dùng cho lịch hẹn THẬT Sale tự chọn giờ (form đầy đủ hoặc nút "Hẹn gọi
  // lại").
  const { error: logErr } = await supabase.from("lead_interactions").insert({
    lead_id: payload.leadId,
    sale_id: user.id,
    channel: payload.channel,
    content: payload.content.trim(),
    sentiment: payload.sentiment || null,
    is_missed_call: Boolean(payload.isMissedCall),
    callback_at: payload.callbackAt || null,
  });

  if (logErr) {
    return { error: `Ghi nhận tương tác thất bại: ${logErr.message}` };
  }

  const leadUpdate: Record<string, unknown> = {
    missed_calls_count: newMissed,
    updated_at: new Date().toISOString(),
  };

  // TỰ ĐỘNG HÓA trạng thái theo đúng kết quả cuộc gọi (yêu cầu chủ dự án
  // 2026-09-16, để trạng thái luôn phản ánh đúng thực tế thay vì đứng yên ở
  // "Đã liên hệ" cũ dù vừa gọi nhỡ thêm):
  // - Gọi nhỡ đủ 3 lần liên tiếp -> "Không có nhu cầu" (đã có từ trước).
  // - Gọi nhỡ 1-2 lần (chưa đủ 3) -> tự chuyển "Hẹn gọi lại", để đúng bản
  //   chất (cần gọi lại) và đồng bộ với "Lịch làm việc hôm nay".
  // - Liên hệ được thật (không phải gọi nhỡ) -> tự chuyển "Đã liên hệ".
  // `payload.newStatus` (nếu có) vẫn được ưu tiên cao hơn khi 1 nơi gọi hàm
  // này muốn tự chỉ định trạng thái khác — hiện chưa có UI nào truyền tham
  // số này, giữ lại để không phá vỡ khả năng mở rộng sau.
  if (willAutoNoDemand) {
    leadUpdate.status = "no_demand";
  } else if (payload.newStatus) {
    leadUpdate.status = payload.newStatus;
  } else if (payload.isMissedCall) {
    leadUpdate.status = "callback";
  } else {
    leadUpdate.status = "contacted";
  }

  // TỰ ĐỘNG HÓA (phễu N1-N3): liên hệ được THẬT (không phải gọi nhỡ) với 1
  // Lead còn ở tầng "raw" (chưa xác thực) -> coi như đã xác thực nhu cầu, tự
  // động lên "potential". Không tự đẩy lên nếu là cuộc gọi nhỡ. Bao gồm cả
  // "inquiry" (giá trị stage cũ trước khi tách N1/N2, có thể còn sót lại nếu
  // migration 20260915_split_lead_stage_raw_potential.sql chưa chạy) để xử
  // lý đồng nhất với "raw".
  if (!payload.isMissedCall && (lead?.stage === "raw" || (lead?.stage as string) === "inquiry")) {
    leadUpdate.stage = "potential";
  }

  await supabase.from("leads").update(leadUpdate).eq("id", payload.leadId);

  revalidatePath("/sale/admissions");
  revalidatePath("/sale/daily-tasks");
  return {
    success: true,
    missedCallsCount: newMissed,
    autoNoDemand: willAutoNoDemand,
  };
}

// ==========================================
// 3. QUẢN LÝ CA HỌC THỬ (TRIALS)
// ==========================================

export async function getTrialSlots(): Promise<TrialSlot[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data: slots, error } = await supabase
    .from("trial_slots")
    .select(`
      *,
      trials:lead_trials(id, status)
    `)
    .order("created_at", { ascending: false });

  if (error || !slots) {
    console.error("Error in getTrialSlots:", error?.message || error);
    return [];
  }

  return slots.map((s) => {
    const trials = (s as unknown as { trials?: { status: string }[] }).trials || [];
    const activeCount = trials.filter((t) => t.status !== "cancelled").length;
    return {
      id: s.id,
      subject: s.subject,
      teacher_name: s.teacher_name,
      room: s.room,
      day_of_week: s.day_of_week,
      time_slot: s.time_slot,
      max_students: s.max_students,
      batch_number: s.batch_number,
      status: s.status,
      note: s.note,
      checkin_token: s.checkin_token,
      created_at: s.created_at,
      registered_count: activeCount,
    };
  });
}

export interface CreateTrialSlotPayload {
  subject: string;
  teacherName?: string;
  room?: string;
  dayOfWeek: string;
  timeSlot: string;
  maxStudents: number;
  note?: string;
}

export async function createTrialSlot(payload: CreateTrialSlotPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!payload.subject?.trim() || !payload.dayOfWeek?.trim() || !payload.timeSlot?.trim()) {
    return { error: "Vui lòng nhập môn học, ngày trong tuần và khung giờ học thử" };
  }

  const { data, error } = await supabase
    .from("trial_slots")
    .insert({
      subject: payload.subject.trim(),
      teacher_name: payload.teacherName?.trim() || null,
      room: payload.room?.trim() || null,
      day_of_week: payload.dayOfWeek.trim(),
      time_slot: payload.timeSlot.trim(),
      max_students: Number(payload.maxStudents) || 10,
      batch_number: 1,
      status: "active",
      note: payload.note?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: `Tạo ca học thử thất bại: ${error.message}` };
  }

  revalidatePath("/sale/admissions");
  return { success: true, data };
}

// Mở đợt học thử mới khi ca học cũ đã hoàn tất / đủ sĩ số (Batch rollover)
export async function rolloverTrialSlot(slotId: string) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { data: currentSlot, error: fetchErr } = await supabase
    .from("trial_slots")
    .select("batch_number")
    .eq("id", slotId)
    .single();

  if (fetchErr || !currentSlot) {
    return { error: "Không tìm thấy ca học thử" };
  }

  const nextBatch = (currentSlot.batch_number || 1) + 1;

  const { error: updateErr } = await supabase
    .from("trial_slots")
    .update({
      batch_number: nextBatch,
      status: "active",
    })
    .eq("id", slotId);

  if (updateErr) {
    return { error: `Mở đợt mới thất bại: ${updateErr.message}` };
  }

  revalidatePath("/sale/admissions");
  return { success: true, nextBatch };
}

// Xếp ca học thử cho Lead (Cho phép chọn nhiều ca cùng lúc)
export async function registerLeadTrials(leadId: string, slotIds: string[], trialDate?: string) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!leadId || !slotIds || slotIds.length === 0) {
    return { error: "Vui lòng chọn ít nhất một ca học thử" };
  }

  const uniqueSlotIds = Array.from(new Set(slotIds));

  // Kiểm tra sĩ số THẬT ngay tại server trước khi ghi — không chỉ tin vào việc
  // giao diện đã disable nút chọn khi đầy (đúng nguyên tắc AGENTS.md Mục 5.3:
  // không được chỉ dựa vào UI, Server Action phải tự kiểm tra).
  const { data: slots, error: slotsErr } = await supabase
    .from("trial_slots")
    .select("id, subject, day_of_week, time_slot, max_students, trials:lead_trials(status)")
    .in("id", uniqueSlotIds);

  if (slotsErr || !slots || slots.length !== uniqueSlotIds.length) {
    return { error: "Không tìm thấy hoặc không thể kiểm tra sĩ số ca học thử, vui lòng thử lại" };
  }

  const slotActiveCounts = new Map<string, number>();
  const fullSlots: string[] = [];
  for (const slot of slots) {
    const trials = (slot as unknown as { trials?: { status: string }[] }).trials || [];
    const activeCount = trials.filter((t) => t.status !== "cancelled").length;
    slotActiveCounts.set(slot.id, activeCount);
    if (activeCount >= slot.max_students) {
      fullSlots.push(`${slot.subject} (${slot.day_of_week} ${slot.time_slot})`);
    }
  }

  if (fullSlots.length > 0) {
    return {
      error: `Ca học thử đã đủ sĩ số: ${fullSlots.join(", ")}. Vui lòng chọn ca khác hoặc mở đợt mới.`,
    };
  }

  const inserts = uniqueSlotIds.map((slotId) => ({
    lead_id: leadId,
    slot_id: slotId,
    trial_date: trialDate || null,
    status: "scheduled",
  }));

  const { error } = await supabase.from("lead_trials").insert(inserts);

  if (error) {
    return { error: `Đăng ký ca học thử thất bại: ${error.message}` };
  }

  // Đồng bộ lại status = 'full' cho ca vừa chạm sĩ số tối đa sau khi thêm lượt đăng ký này
  for (const slot of slots) {
    const newActiveCount = (slotActiveCounts.get(slot.id) || 0) + 1;
    if (newActiveCount >= slot.max_students) {
      await supabase.from("trial_slots").update({ status: "full" }).eq("id", slot.id);
    }
  }

  // Cập nhật stage của lead sang 'trial'
  await supabase
    .from("leads")
    .update({ stage: "trial", status: "contacted", updated_at: new Date().toISOString() })
    .eq("id", leadId);

  revalidatePath("/sale/admissions");
  return { success: true };
}

// Chấm điểm và đánh giá năng lực sau học thử
export interface RecordTrialAssessmentPayload {
  trialId: string;
  leadId: string;
  status: "attended" | "absent" | "cancelled";
  score?: number;
  evaluation?: string;
  result?: TrialResult;
  advanceToConversion?: boolean;
}

export async function recordTrialAssessment(payload: RecordTrialAssessmentPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { data: updatedTrial, error: trialErr } = await supabase
    .from("lead_trials")
    .update({
      status: payload.status,
      score: payload.score !== undefined ? payload.score : null,
      evaluation: payload.evaluation?.trim() || null,
      result: payload.result || null,
    })
    .eq("id", payload.trialId)
    .select("slot_id")
    .single();

  if (trialErr) {
    return { error: `Lưu đánh giá thất bại: ${trialErr.message}` };
  }

  // Nếu hủy 1 lượt đăng ký -> giải phóng chỗ, tự mở lại ca nếu đang báo "đầy"
  // nhưng thực tế đã còn chỗ trống sau khi hủy.
  if (payload.status === "cancelled" && updatedTrial?.slot_id) {
    const { data: slot } = await supabase
      .from("trial_slots")
      .select("max_students, status, trials:lead_trials(status)")
      .eq("id", updatedTrial.slot_id)
      .single();

    if (slot && slot.status === "full") {
      const trials = (slot as unknown as { trials?: { status: string }[] }).trials || [];
      const activeCount = trials.filter((t) => t.status !== "cancelled").length;
      if (activeCount < slot.max_students) {
        await supabase
          .from("trial_slots")
          .update({ status: "active" })
          .eq("id", updatedTrial.slot_id);
      }
    }
  }

  // Cập nhật kết quả vào bản ghi Lead
  const leadUpdates: Record<string, unknown> = {
    trial_result: payload.result || null,
    test_score: payload.score !== undefined ? payload.score : null,
    updated_at: new Date().toISOString(),
  };

  if (payload.advanceToConversion) {
    leadUpdates.stage = "conversion";
  }

  await supabase.from("leads").update(leadUpdates).eq("id", payload.leadId);

  revalidatePath("/sale/admissions");
  return { success: true };
}

// ==========================================
// 3B. TỰ ĐỘNG CẤP TÀI KHOẢN ĐĂNG NHẬP KHI HỌC SINH ĐÃ "CHÍNH THỨC"
// Điều kiện đúng theo yêu cầu chủ dự án: ĐÃ chốt học + ĐÃ thanh toán + ĐÃ xếp
// lớp (stage = 'enrolled') — KHÔNG áp dụng cho 'waiting_class' (đã đóng tiền
// nhưng chưa xếp lớp thì chưa đủ điều kiện). Tái dùng đúng createAccountByAdmin()
// (lib/actions/auth.ts) đã được cấp quyền sẵn cho Sale — KHÔNG viết luồng tạo
// tài khoản song song riêng, đúng nguyên tắc AGENTS.md Mục 9/11.7.
// ==========================================

interface AutoAccountResult {
  created: boolean;
  email?: string;
  password?: string;
  reason?: string;
}

function generateRandomPassword(): string {
  // 12 ký tự, đủ mạnh, sinh phía server (không phụ thuộc trình duyệt)
  return randomBytes(9).toString("base64").replace(/[/+=]/g, "").slice(0, 12);
}

async function tryAutoCreateStudentAccount(
  supabase: SbClient,
  params: { studentId: string; fullName: string; phone?: string | null; email?: string | null }
): Promise<AutoAccountResult> {
  const email = params.email?.trim();
  // KHÔNG tự bịa email khi Lead chưa có (đúng AGENTS.md Mục 11.1) — nếu chưa
  // có email thật, bỏ qua bước này, để Sale tự cấp tay sau ở trang Tài khoản
  // Học sinh khi đã thu thập được email thật.
  if (!email) {
    return { created: false, reason: "Lead chưa có email nên chưa thể tự cấp tài khoản" };
  }

  // Tránh tạo trùng nếu học sinh đã có tài khoản từ trước (VD: Sale đã tự tạo
  // tay lúc còn ở danh sách chờ xếp lớp).
  const { data: student } = await supabase
    .from("students")
    .select("auth_user_id")
    .eq("id", params.studentId)
    .single();

  if (student?.auth_user_id) {
    return { created: false, reason: "Học sinh đã có tài khoản đăng nhập từ trước" };
  }

  const password = generateRandomPassword();

  const result = await createAccountByAdmin({
    email,
    password,
    fullName: params.fullName,
    role: "student",
    phone: params.phone || undefined,
    studentId: params.studentId,
  });

  if (result?.error) {
    return { created: false, reason: result.error };
  }

  return { created: true, email, password };
}

// ==========================================
// 4. CHỐT ĐƠN & CHUYỂN ĐỔI (CONVERSIONS)
// ==========================================

export interface CompleteConversionPayload {
  leadId: string;
  classId: string;
  sessions: number;
  amount: number;
  enrollImmediately: boolean; // true: xếp lớp ngay; false: đưa vào danh sách chờ xếp lớp
  studentName: string;
  parentName?: string;
  parentPhone: string;
  studentDob?: string;
  note?: string;
}

export async function completeLeadConversion(payload: CompleteConversionPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!payload.studentName?.trim() || !payload.parentPhone?.trim()) {
    return { error: "Thiếu thông tin bắt buộc của học sinh và phụ huynh" };
  }

  if (payload.sessions <= 0 || payload.amount <= 0) {
    return { error: "Số buổi và số tiền học phí phải lớn hơn 0" };
  }

  if (!payload.classId) {
    return { error: "Vui lòng chọn lớp học quan tâm để tạo hóa đơn học phí hợp lệ" };
  }

  // Chặn chốt đơn 2 lần cho cùng 1 Lead — đúng nguyên tắc chống double-submit
  // đã áp dụng ở markInvoiceAsPaid() (AGENTS.md Mục 7). Quan trọng: giao diện
  // có thể còn hiện nhầm nút "Chốt học" cho Lead đã chốt xong (dữ liệu cũ
  // trong lead_trials chưa dọn), nhưng Server Action luôn phải tự kiểm tra
  // ở server, không dựa vào việc UI đã ẩn/khóa nút hay chưa.
  const { data: currentLead } = await supabase
    .from("leads")
    .select("stage, email")
    .eq("id", payload.leadId)
    .single();

  if (currentLead && (currentLead.stage === "enrolled" || currentLead.stage === "waiting_class")) {
    return { error: "Lead này đã chốt học chính thức rồi, không thể chốt lại lần nữa." };
  }

  try {
    // ------------------------------------------------------------------
    // BƯỚC 1: GHI NHẬN THANH TOÁN (LUÔN LÀM NGAY)
    // ------------------------------------------------------------------
    // 1a. Tạo bản ghi học sinh thật qua createStudent()
    // Chú ý: Nếu enrollImmediately = false, không truyền class_id vào createStudent
    // để tránh tạo enrollment giả khi chưa sẵn sàng xếp lớp.
    const studentFormData = new FormData();
    studentFormData.set("full_name", payload.studentName.trim());
    if (payload.parentName) studentFormData.set("parent_name", payload.parentName.trim());
    studentFormData.set("parent_phone", payload.parentPhone.trim());
    if (payload.studentDob) studentFormData.set("birth_date", payload.studentDob);
    studentFormData.set("status", "active");
    studentFormData.set(
      "note",
      payload.note || `Chuyển đổi từ Tuyển sinh (Lead: ${payload.leadId})`
    );

    if (payload.enrollImmediately) {
      studentFormData.set("class_id", payload.classId);
      studentFormData.set("initial_sessions", String(payload.sessions));
    }

    const studentResult = await createStudent(studentFormData);
    if (studentResult.error || !studentResult.data?.id) {
      return { error: `Tạo hồ sơ học sinh thất bại: ${studentResult.error}` };
    }

    const newStudentId = studentResult.data.id;

    // 1b. Tạo hóa đơn học phí thật đã thanh toán qua createInvoice()
    const invoiceFormData = new FormData();
    invoiceFormData.set("student_id", newStudentId);
    invoiceFormData.set("class_id", payload.classId);
    invoiceFormData.set("sessions_added", String(payload.sessions));
    invoiceFormData.set("amount", String(payload.amount));
    invoiceFormData.set("is_paid", "true");
    invoiceFormData.set("payment_method", "transfer");
    invoiceFormData.set(
      "note",
      `Thanh toán qua VietQR - Gói ${payload.sessions} buổi (Tuyển sinh chốt đơn)`
    );

    const invoiceResult = await createInvoice(invoiceFormData);
    if (invoiceResult.error) {
      return {
        error: `Tạo hóa đơn học phí thất bại: ${invoiceResult.error}. Học sinh ID: ${newStudentId}`,
      };
    }

    // ------------------------------------------------------------------
    // BƯỚC 2: XẾP LỚP CỤ THỂ HOẶC ĐƯA VÀO DANH SÁCH CHỜ
    // ------------------------------------------------------------------
    let finalStage: LeadStage = "enrolled";
    if (!payload.enrollImmediately) {
      finalStage = "waiting_class";
    }

    // Cập nhật lại Lead để lưu liên kết
    await supabase
      .from("leads")
      .update({
        stage: finalStage,
        status: "converted",
        converted_student_id: newStudentId,
        target_class_id: payload.classId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.leadId);

    // BƯỚC 3: Tự động cấp tài khoản đăng nhập NẾU đã đủ 3 điều kiện — đã chốt
    // học, đã thanh toán (Bước 1), VÀ đã xếp lớp ngay (finalStage = 'enrolled').
    // 'waiting_class' (đã đóng tiền nhưng chưa xếp lớp) KHÔNG được cấp — đúng
    // yêu cầu chủ dự án. Best-effort: lỗi ở bước này KHÔNG được làm hỏng việc
    // chốt đơn đã thành công ở trên.
    let accountResult: AutoAccountResult = { created: false };
    if (finalStage === "enrolled") {
      accountResult = await tryAutoCreateStudentAccount(supabase, {
        studentId: newStudentId,
        fullName: payload.studentName.trim(),
        phone: payload.parentPhone.trim(),
        email: currentLead?.email,
      });
    }

    // Đồng bộ cache toàn hệ thống
    revalidatePath("/sale/admissions");
    revalidatePath("/sale/admissions/waiting-list");
    revalidatePath("/admin/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/finance");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      studentId: newStudentId,
      stage: finalStage,
      message: payload.enrollImmediately
        ? `Đã ghi danh thành công học sinh ${payload.studentName} vào lớp!`
        : `Đã thu phí thành công! Học sinh ${payload.studentName} được lưu vào danh sách chờ xếp lớp.`,
      accountCreated: accountResult.created,
      accountEmail: accountResult.email,
      accountPassword: accountResult.password,
      accountSkipReason: accountResult.reason,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi ngoại lệ khi xử lý chốt đơn";
    return { error: msg };
  }
}

// ==========================================
// 5. DANH SÁCH HỌC SINH CHỜ XẾP LỚP (WAITING LIST)
// ==========================================

export interface WaitingListStudentItem {
  id: string; // lead id hoặc student id
  leadId?: string;
  studentId: string;
  fullName: string;
  parentName?: string | null;
  parentPhone: string;
  courseInterest?: string | null;
  targetClassName?: string | null;
  targetClassId?: string | null;
  assignedSaleName?: string | null;
  paidSessions: number;
  paidAmount: number;
  paidAt?: string | null;
  note?: string | null;
  // Kết quả học thử ("test đầu vào") — tái dùng đúng trường đã có sẵn của
  // Lead, phục vụ gợi ý lớp phù hợp khi Sale xếp lớp chính thức, không thêm
  // cột DB mới.
  trialResult?: TrialResult | null;
  testScore?: number | null;
}

export async function getWaitingListStudents(): Promise<WaitingListStudentItem[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  // Lấy các lead ở trạng thái 'waiting_class'
  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      *,
      student:students(*),
      target_class:classes(*),
      assigned_sale:profiles!leads_assigned_sale_id_fkey(*)
    `)
    .eq("stage", "waiting_class")
    .order("updated_at", { ascending: false });

  if (error || !leads) {
    console.error("Error in getWaitingListStudents:", error?.message || error);
    return [];
  }

  // Lấy thêm thông tin hóa đơn nộp tiền của từng học sinh
  const studentIds = leads.map((l) => l.converted_student_id).filter(Boolean);
  let invoiceMap = new Map<string, { sessions: number; amount: number; paidAt: string }>();

  if (studentIds.length > 0) {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("student_id, sessions_added, amount, paid_at")
      .in("student_id", studentIds)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (invoices) {
      for (const inv of invoices) {
        if (!invoiceMap.has(inv.student_id)) {
          invoiceMap.set(inv.student_id, {
            sessions: inv.sessions_added,
            amount: inv.amount,
            paidAt: inv.paid_at || "",
          });
        }
      }
    }
  }

  return leads.map((l) => {
    const inv = l.converted_student_id ? invoiceMap.get(l.converted_student_id) : undefined;
    return {
      id: l.id,
      leadId: l.id,
      studentId: l.converted_student_id || "",
      fullName: l.full_name,
      parentName: l.parent_name,
      parentPhone: l.phone,
      courseInterest: l.course_interest,
      targetClassName: l.target_class?.name || l.target_class_name,
      targetClassId: l.target_class_id,
      assignedSaleName: l.assigned_sale?.full_name || null,
      paidSessions: inv?.sessions || 0,
      paidAmount: inv?.amount || 0,
      paidAt: inv?.paidAt || l.updated_at,
      note: l.note,
      trialResult: l.trial_result || null,
      testScore: l.test_score !== undefined ? l.test_score : null,
    };
  });
}

// Xếp lớp cho học sinh trong danh sách chờ
export async function assignWaitingStudentToClass(
  studentId: string,
  classId: string,
  sessions: number,
  leadId?: string
) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!studentId || !classId || sessions <= 0) {
    return { error: "Vui lòng chọn học sinh, lớp học và số buổi hợp lệ" };
  }

  const enrollResult = await enrollStudentInClass(studentId, classId, sessions);
  if (enrollResult.error) {
    return { error: `Xếp lớp thất bại: ${enrollResult.error}` };
  }

  // Cập nhật trạng thái lead thành 'enrolled'
  if (leadId) {
    await supabase
      .from("leads")
      .update({
        stage: "enrolled",
        target_class_id: classId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);
  }

  // Tự động cấp tài khoản đăng nhập — tới đây học sinh đã đủ 3 điều kiện: đã
  // chốt học, đã thanh toán từ trước (đang ở danh sách chờ), và VỪA xếp lớp
  // xong ở trên. Cần lấy `full_name`/`parent_phone` (không có sẵn trong tham
  // số hàm) và email của Lead gốc (nếu có leadId) để tạo tài khoản.
  let accountResult: AutoAccountResult = { created: false };
  const { data: studentRow } = await supabase
    .from("students")
    .select("full_name, parent_phone")
    .eq("id", studentId)
    .single();

  if (studentRow) {
    let leadEmail: string | null = null;
    if (leadId) {
      const { data: leadRow } = await supabase
        .from("leads")
        .select("email")
        .eq("id", leadId)
        .single();
      leadEmail = leadRow?.email || null;
    }

    accountResult = await tryAutoCreateStudentAccount(supabase, {
      studentId,
      fullName: studentRow.full_name,
      phone: studentRow.parent_phone,
      email: leadEmail,
    });
  }

  revalidatePath("/sale/admissions");
  revalidatePath("/sale/admissions/waiting-list");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/classes/${classId}`);

  return {
    success: true,
    message: "Đã xếp lớp thành công cho học sinh!",
    accountCreated: accountResult.created,
    accountEmail: accountResult.email,
    accountPassword: accountResult.password,
    accountSkipReason: accountResult.reason,
  };
}

// ==========================================
// 6. THỐNG KÊ KPI TUYỂN SINH
// ==========================================

export interface AdmissionsKpiStats {
  totalLeads: number;
  rawCount: number; // N1 - Lead thô (chưa xác thực)
  potentialCount: number; // N2 - Tiềm năng (đã xác thực nhu cầu thật)
  trialCount: number; // N3 - Học thử
  conversionCount: number; // Bước phụ: đã học thử xong, chờ chốt (không phải 1 tầng N riêng)
  enrolledCount: number; // N4 - Chính thức (đã vào lớp)
  waitingClassCount: number; // N4 - Chính thức (đã đóng tiền, chờ xếp lớp)
  noDemandCount: number;
  conversionRate: number; // phần trăm
}

const EMPTY_KPI_STATS: AdmissionsKpiStats = {
  totalLeads: 0,
  rawCount: 0,
  potentialCount: 0,
  trialCount: 0,
  conversionCount: 0,
  enrolledCount: 0,
  waitingClassCount: 0,
  noDemandCount: 0,
  conversionRate: 0,
};

export async function getAdmissionsKpiStats(): Promise<AdmissionsKpiStats> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) {
    return { ...EMPTY_KPI_STATS };
  }
  const { supabase } = guard.context;

  const { data: leads, error } = await supabase
    .from("leads")
    .select("stage, status");

  if (error || !leads) {
    return { ...EMPTY_KPI_STATS };
  }

  const total = leads.length;
  let raw = 0;
  let potential = 0;
  let trial = 0;
  let conversion = 0;
  let enrolled = 0;
  let waiting = 0;
  let noDemand = 0;

  for (const l of leads) {
    if (l.status === "no_demand") {
      noDemand++;
      // VÁ LỖI THẬT (2026-09-16): `stage` KHÔNG tự đổi khi 1 Lead bị đóng
      // "Không có nhu cầu" (2 trục độc lập theo đúng thiết kế) — Lead đó vẫn
      // giữ nguyên `stage = 'raw'`/`'potential'`/... như trước khi bị đóng.
      // Nếu vẫn cộng vào N1/N2 như Lead đang hoạt động, các thẻ "N1. Khách
      // hàng tiềm năng — Đang chăm sóc" sẽ tính nhầm cả Lead đã chết, khiến
      // Sale hiểu sai số lượng thực sự cần chăm sóc. -> Loại hẳn khỏi mọi
      // bậc N đang "hoạt động", chỉ còn tính riêng ở `noDemandCount`
      // (`totalLeads` vẫn giữ nguyên đầy đủ, không đổi).
      continue;
    }
    // "inquiry" là giá trị `stage` cũ trước khi tách N1/N2 (2026-09-15) —
    // vẫn có thể còn sót lại ở Lead cũ nếu migration
    // 20260915_split_lead_stage_raw_potential.sql CHƯA chạy trên Supabase.
    // Quy về "raw" (N1) để không bị "biến mất" khỏi mọi bậc N như trước.
    if (l.stage === "raw" || l.stage === "inquiry") raw++;
    else if (l.stage === "potential") potential++;
    else if (l.stage === "trial") trial++;
    else if (l.stage === "conversion") conversion++;
    else if (l.stage === "enrolled") enrolled++;
    else if (l.stage === "waiting_class") waiting++;
  }

  const convertedTotal = enrolled + waiting;
  const rate = total > 0 ? Math.round((convertedTotal / total) * 100) : 0;

  return {
    totalLeads: total,
    rawCount: raw,
    potentialCount: potential,
    trialCount: trial,
    conversionCount: conversion,
    enrolledCount: enrolled,
    waitingClassCount: waiting,
    noDemandCount: noDemand,
    conversionRate: rate,
  };
}

// ==========================================
// 6B. BÁO CÁO TUYỂN SINH THEO KHOẢNG THỜI GIAN (Giai đoạn 1)
// Không cần bảng/cột DB mới — tổng hợp hoàn toàn từ bảng `leads` đã có,
// tính tại thời điểm gọi (không cron), đúng nguyên tắc dự án.
// ==========================================

export interface SourcePerformance {
  source: LeadSource;
  total: number;
  converted: number;
  rate: number; // %
  revenue: number; // VNĐ, cộng dồn hóa đơn đã thanh toán của Lead thuộc nguồn này
}

export interface TrendPoint {
  period: string; // "2026-09-01" (theo ngày) hoặc "2026-09" (theo tháng)
  newLeads: number;
  converted: number;
  revenue: number; // VNĐ
}

export interface SalespersonPerformance {
  saleId: string;
  saleName: string;
  total: number;
  converted: number;
  rate: number; // %
  revenue: number; // VNĐ
}

export interface AdmissionsReportData {
  dateFrom: string;
  dateTo: string;
  totalLeads: number;
  totalConverted: number;
  overallRate: number;
  totalRevenue: number; // VNĐ — tổng doanh thu từ các Lead tạo trong khoảng đã chọn
  avgRevenuePerConverted: number; // VNĐ — doanh thu trung bình / 1 Lead đã chốt
  bySource: SourcePerformance[];
  bySalesperson: SalespersonPerformance[];
  trend: TrendPoint[];
  trendGranularity: "day" | "month";
  trialConversion: {
    reachedTrial: number;
    convertedAfterTrial: number;
    rate: number;
  };
}

const EMPTY_REPORT_DATA: Omit<AdmissionsReportData, "dateFrom" | "dateTo"> = {
  totalLeads: 0,
  totalConverted: 0,
  overallRate: 0,
  totalRevenue: 0,
  avgRevenuePerConverted: 0,
  bySource: [],
  bySalesperson: [],
  trend: [],
  trendGranularity: "day",
  trialConversion: { reachedTrial: 0, convertedAfterTrial: 0, rate: 0 },
};

const ALL_LEAD_SOURCES: LeadSource[] = [
  "facebook_ads",
  "fanpage",
  "zalo",
  "referral",
  "walkin",
  "hotline",
  "other",
];

function isConvertedStage(stage: LeadStage) {
  return stage === "enrolled" || stage === "waiting_class";
}

function isTrialOrBeyondStage(stage: LeadStage) {
  return (
    stage === "trial" ||
    stage === "conversion" ||
    stage === "enrolled" ||
    stage === "waiting_class"
  );
}

export async function getAdmissionsReportData(
  dateFrom: string,
  dateTo: string
): Promise<AdmissionsReportData> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) {
    return { dateFrom, dateTo, ...EMPTY_REPORT_DATA };
  }
  const { supabase } = guard.context;

  // dateTo bao trọn hết ngày đó (23:59:59) để không bỏ sót Lead tạo trong ngày cuối
  const dateToEnd = `${dateTo}T23:59:59.999Z`;

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, source, stage, status, created_at, converted_student_id, assigned_sale_id")
    .gte("created_at", `${dateFrom}T00:00:00.000Z`)
    .lte("created_at", dateToEnd);

  if (error || !leads) {
    console.error("Error in getAdmissionsReportData:", error?.message || error);
    return { dateFrom, dateTo, ...EMPTY_REPORT_DATA };
  }

  // Doanh thu: đọc trực tiếp bảng `invoices` (giống đúng cách getWaitingListStudents()
  // trong file này đã làm) — chỉ cộng hóa đơn ĐÃ THANH TOÁN, gắn ngược lại đúng Lead
  // đã tạo ra học sinh đó qua `converted_student_id`, để nhất quán với cách "Lead mới"/
  // "Đã chốt" ở trên đều tính theo NGÀY TẠO LEAD (không tính theo ngày thanh toán).
  const studentIds = leads.map((l) => l.converted_student_id).filter((id): id is string => Boolean(id));
  const revenueByStudentId = new Map<string, number>();
  if (studentIds.length > 0) {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("student_id, amount")
      .in("student_id", studentIds)
      .eq("status", "paid");

    if (invoices) {
      for (const inv of invoices) {
        revenueByStudentId.set(
          inv.student_id,
          (revenueByStudentId.get(inv.student_id) || 0) + (inv.amount || 0)
        );
      }
    }
  }
  const revenueOf = (l: { converted_student_id: string | null }) =>
    l.converted_student_id ? revenueByStudentId.get(l.converted_student_id) || 0 : 0;

  const totalLeads = leads.length;
  const totalConverted = leads.filter((l) => isConvertedStage(l.stage)).length;
  const overallRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;
  const totalRevenue = leads.reduce((sum, l) => sum + revenueOf(l), 0);
  const avgRevenuePerConverted = totalConverted > 0 ? Math.round(totalRevenue / totalConverted) : 0;

  // 1. Hiệu suất theo nguồn — luôn liệt kê đủ 7 nguồn (kể cả 0 Lead), không bỏ sót
  const bySource: SourcePerformance[] = ALL_LEAD_SOURCES.map((source) => {
    const sourceLeads = leads.filter((l) => l.source === source);
    const converted = sourceLeads.filter((l) => isConvertedStage(l.stage)).length;
    return {
      source,
      total: sourceLeads.length,
      converted,
      rate: sourceLeads.length > 0 ? Math.round((converted / sourceLeads.length) * 100) : 0,
      revenue: sourceLeads.reduce((sum, l) => sum + revenueOf(l), 0),
    };
  }).filter((s) => s.total > 0); // ẩn nguồn hoàn toàn không có Lead nào trong khoảng đã chọn

  // 1B. Hiệu suất theo nhân viên Sale phụ trách (assigned_sale_id) — trả lời
  // "ai đem về doanh thu bao nhiêu" mà không thay đổi quyền truy cập (mọi
  // Sale/Admin vẫn xem/thao tác được mọi Lead như cũ, đây chỉ là báo cáo).
  const salesIds = Array.from(
    new Set(leads.map((l) => l.assigned_sale_id).filter((id): id is string => Boolean(id)))
  );
  const salesNameById = new Map<string, string>();
  if (salesIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", salesIds);
    if (profiles) {
      for (const p of profiles) salesNameById.set(p.id, p.full_name);
    }
  }

  const bySalesperson: SalespersonPerformance[] = salesIds
    .map((saleId) => {
      const saleLeads = leads.filter((l) => l.assigned_sale_id === saleId);
      const converted = saleLeads.filter((l) => isConvertedStage(l.stage)).length;
      return {
        saleId,
        saleName: salesNameById.get(saleId) || "Không rõ",
        total: saleLeads.length,
        converted,
        rate: saleLeads.length > 0 ? Math.round((converted / saleLeads.length) * 100) : 0,
        revenue: saleLeads.reduce((sum, l) => sum + revenueOf(l), 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // 2. Xu hướng theo thời gian — theo NGÀY nếu khoảng <= 31 ngày, theo THÁNG nếu dài hơn
  const fromDate = new Date(`${dateFrom}T00:00:00.000Z`);
  const toDate = new Date(`${dateTo}T00:00:00.000Z`);
  const rangeDays = Math.max(
    1,
    Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1
  );
  const granularity: "day" | "month" = rangeDays <= 31 ? "day" : "month";

  const periodKeyOf = (iso: string) => (granularity === "day" ? iso.slice(0, 10) : iso.slice(0, 7));

  // Sinh đủ danh sách period trong khoảng (kể cả period 0 Lead) để biểu đồ không
  // bị "nhảy cóc" gây hiểu nhầm — đúng nguyên tắc không che giấu trạng thái rỗng.
  const periodKeys: string[] = [];
  if (granularity === "day") {
    const cursor = new Date(fromDate);
    while (cursor <= toDate) {
      periodKeys.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  } else {
    const cursor = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), 1));
    while (cursor <= end) {
      periodKeys.push(cursor.toISOString().slice(0, 7));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }

  const trend: TrendPoint[] = periodKeys.map((period) => {
    const periodLeads = leads.filter((l) => periodKeyOf(l.created_at) === period);
    return {
      period,
      newLeads: periodLeads.length,
      converted: periodLeads.filter((l) => isConvertedStage(l.stage)).length,
      revenue: periodLeads.reduce((sum, l) => sum + revenueOf(l), 0),
    };
  });

  // 3. Tỷ lệ chuyển đổi sau học thử — trong nhóm Lead đã đạt tới học thử trở lên,
  // bao nhiêu % đã chính thức (enrolled/waiting_class)
  const reachedTrialLeads = leads.filter((l) => isTrialOrBeyondStage(l.stage));
  const convertedAfterTrial = reachedTrialLeads.filter((l) => isConvertedStage(l.stage)).length;
  const trialRate =
    reachedTrialLeads.length > 0
      ? Math.round((convertedAfterTrial / reachedTrialLeads.length) * 100)
      : 0;

  return {
    dateFrom,
    dateTo,
    totalLeads,
    totalConverted,
    overallRate,
    totalRevenue,
    avgRevenuePerConverted,
    bySource,
    bySalesperson,
    trend,
    trendGranularity: granularity,
    trialConversion: {
      reachedTrial: reachedTrialLeads.length,
      convertedAfterTrial,
      rate: trialRate,
    },
  };
}

// ==========================================
// 7. TƯƠNG THÍCH NGƯỢC CHO MOCK CŨ (CONVERT-STUDENT-DIALOG)
// ==========================================

export interface ConvertLeadPayload {
  leadId: string;
  studentName: string;
  studentDob?: string;
  parentName: string;
  parentPhone: string;
  classId: string;
  initialSessions: number;
  depositAmount?: number;
  note?: string;
}

export async function convertLeadToStudentAction(payload: ConvertLeadPayload) {
  return completeLeadConversion({
    leadId: payload.leadId,
    classId: payload.classId,
    sessions: payload.initialSessions || 12,
    amount: (payload.depositAmount && payload.depositAmount > 0) ? payload.depositAmount : 2000000,
    enrollImmediately: true,
    studentName: payload.studentName,
    parentName: payload.parentName,
    parentPhone: payload.parentPhone,
    studentDob: payload.studentDob,
    note: payload.note,
  });
}

// ==========================================
// 8. LỊCH LÀM VIỆC HÔM NAY (DAILY TASKS) & THÊM NHANH LEAD
// ==========================================

export interface CallbackTaskItem {
  id: string;
  leadId: string;
  studentName: string;
  parentName?: string | null;
  phone: string;
  callbackAt: string;
  lastContent: string;
  sentiment?: FeedbackSentiment | null;
  channel: InteractionChannel;
  leadStage: LeadStage;
  leadStatus: LeadStatus;
  // true nếu đây là nhắc nhở "đã gọi nhỡ, cần thử lại" tự tính tại thời điểm
  // đọc (xem getSaleDailyTasks) — không gắn với 1 dòng lead_interactions
  // thật nào, nên KHÔNG được gọi completeCallbackTask() với id này (id không
  // phải UUID thật). UI xử lý task loại này qua QuickCallConfirmDialog.
  isMissedCallReminder?: boolean;
  missedCallsCount?: number;
}

export interface TodayTrialTaskItem {
  id: string;
  leadId: string;
  studentName: string;
  parentName?: string | null;
  phone: string;
  slotSubject: string;
  slotTime: string;
  slotDay: string;
  room?: string | null;
  teacherName?: string | null;
  status: "scheduled" | "attended" | "absent" | "cancelled";
  score?: number | null;
  trialDate?: string | null;
}

export interface SaleDailyTasksData {
  callbackTasks: CallbackTaskItem[];
  todayTrials: TodayTrialTaskItem[];
  newLeads: Lead[];
  waitingStudentsCount: number;
  urgentTasksCount: number;
}

export async function getSaleDailyTasks(): Promise<SaleDailyTasksData> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) {
    return {
      callbackTasks: [],
      todayTrials: [],
      newLeads: [],
      waitingStudentsCount: 0,
      urgentTasksCount: 0,
    };
  }
  const { supabase } = guard.context;

  // 1. Lấy các tương tác có hẹn gọi lại (callback_at)
  const { data: interactions } = await supabase
    .from("lead_interactions")
    .select(`
      *,
      lead:leads(*)
    `)
    .not("callback_at", "is", null)
    .order("callback_at", { ascending: true });

  const callbackTasks: CallbackTaskItem[] = [];
  if (interactions) {
    for (const it of interactions) {
      const lead = it.lead as unknown as Lead;
      // Chỉ lấy task nếu Lead chưa chuyển đổi thành công hoặc chưa đóng
      if (lead && lead.status !== "converted" && lead.status !== "no_demand") {
        callbackTasks.push({
          id: it.id,
          leadId: lead.id,
          studentName: lead.full_name,
          parentName: lead.parent_name,
          phone: lead.phone,
          callbackAt: it.callback_at,
          lastContent: it.content,
          sentiment: it.sentiment,
          channel: it.channel,
          leadStage: lead.stage,
          leadStatus: lead.status,
        });
      }
    }
  }

  // 1b. VÁ LỖI THẬT (2026-09-16, Lead "Trần Nhật Tân"): gọi nhỡ 1-2/3 lần
  // liên tiếp (CHƯA đủ 3 để tự đóng) nhưng KHÔNG có sẵn lịch hẹn tường minh
  // nào (VD: dữ liệu trước khi có "Xác nhận nhanh cuộc gọi", hoặc đã bấm
  // "Đã gọi lại" giải quyết lịch hẹn cũ nhưng vẫn tiếp tục gọi nhỡ thêm) sẽ
  // "rơi vào khoảng trống" nếu chỉ dựa vào lead_interactions.callback_at.
  // Đúng nguyên tắc kiến trúc dự án (AGENTS.md: "không dùng cron, tính tại
  // thời điểm đọc"), tự suy ra nhắc nhở này trực tiếp từ missed_calls_count
  // mỗi lần tải trang — không cần lưu thêm bảng/cột nào, không thể bị lệch
  // dữ liệu theo thời gian.
  const coveredLeadIds = new Set(callbackTasks.map((t) => t.leadId));
  const { data: missedCallLeadsRaw } = await supabase
    .from("leads")
    .select("*")
    .gt("missed_calls_count", 0)
    .lt("missed_calls_count", 3);

  for (const l of (missedCallLeadsRaw as Lead[] | null) || []) {
    if (coveredLeadIds.has(l.id)) continue; // đã có lịch hẹn tường minh, tránh hiện trùng thẻ
    if (l.status === "converted" || l.status === "no_demand") continue;

    callbackTasks.push({
      id: `auto-missed-${l.id}`,
      leadId: l.id,
      studentName: l.full_name,
      parentName: l.parent_name,
      phone: l.phone,
      callbackAt: l.updated_at,
      lastContent: `Đã gọi nhỡ ${l.missed_calls_count}/3 lần liên tiếp — cần thử liên hệ lại trước khi hệ thống tự động chuyển "Không có nhu cầu".`,
      channel: "call",
      leadStage: l.stage,
      leadStatus: l.status,
      isMissedCallReminder: true,
      missedCallsCount: l.missed_calls_count,
    });
  }

  callbackTasks.sort((a, b) => new Date(a.callbackAt).getTime() - new Date(b.callbackAt).getTime());

  // 2. Lấy danh sách ca học thử của học sinh
  const { data: trials } = await supabase
    .from("lead_trials")
    .select(`
      *,
      lead:leads(*),
      slot:trial_slots(*)
    `)
    .eq("status", "scheduled")
    .order("created_at", { ascending: false });

  // Loại bỏ ca học thử của Lead ĐÃ Chính thức (N4) — Lead có thể chốt đơn
  // thẳng mà không quay lại chấm điểm ca học thử cũ, khiến bản ghi lead_trials
  // bị kẹt ở "scheduled" vĩnh viễn dù việc đã xong. Không dựa vào trạng thái
  // lead_trials một mình, phải đối chiếu lại stage hiện tại của Lead.
  const activeTrials = (trials || []).filter(
    (t: any) => t.lead?.stage !== "enrolled" && t.lead?.stage !== "waiting_class"
  );

  const todayTrials: TodayTrialTaskItem[] = activeTrials.map((t: any) => ({
    id: t.id,
    leadId: t.lead?.id || t.lead_id,
    studentName: t.lead?.full_name || "Học sinh",
    parentName: t.lead?.parent_name,
    phone: t.lead?.phone || "",
    slotSubject: t.slot?.subject || "Học thử",
    slotTime: t.slot?.time_slot || "",
    slotDay: t.slot?.day_of_week || "",
    room: t.slot?.room,
    teacherName: t.slot?.teacher_name,
    status: t.status,
    score: t.score,
    trialDate: t.trial_date,
  }));

  // 3. Lấy các Lead mới nhận chưa tư vấn (status = 'new')
  const { data: newLeads } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "new")
    .order("created_at", { ascending: false });

  // 4. Đếm số học sinh đang chờ xếp lớp
  const { count: waitingCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("stage", "waiting_class");

  const urgentCount = callbackTasks.length + todayTrials.length + (newLeads?.length || 0);

  return {
    callbackTasks,
    todayTrials,
    newLeads: (newLeads as unknown as Lead[]) || [],
    waitingStudentsCount: waitingCount || 0,
    urgentTasksCount: urgentCount,
  };
}

// Đánh dấu hoàn thành lịch hẹn gọi lại
export async function completeCallbackTask(
  interactionId: string,
  leadId: string,
  resolutionNote: string,
  newStatus?: LeadStatus
) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  // Xóa callback_at của interaction cũ để không còn báo trong to-do list
  await supabase
    .from("lead_interactions")
    .update({ callback_at: null })
    .eq("id", interactionId);

  // Thêm 1 interaction mới ghi nhận đã liên hệ lại
  const { error: logErr } = await supabase.from("lead_interactions").insert({
    lead_id: leadId,
    sale_id: user.id,
    channel: "call",
    content: resolutionNote?.trim() || "Đã liên hệ lại theo lịch hẹn trước đó.",
    is_missed_call: false,
  });

  if (logErr) {
    return { error: `Ghi nhận thất bại: ${logErr.message}` };
  }

  // Cập nhật trạng thái lead nếu có
  if (newStatus) {
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
  }

  revalidatePath("/sale/daily-tasks");
  revalidatePath("/sale/admissions");

  return { success: true, message: "Đã hoàn thành cuộc hẹn gọi lại!" };
}

// Thao tác "+ Thêm nhanh Lead" (Fast Intake)
export interface QuickLeadPayload {
  fullName: string;
  phone: string;
  parentName?: string;
  courseInterest?: string;
  source: LeadSource;
  note?: string;
}

export async function quickCreateLead(payload: QuickLeadPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  if (!payload.fullName?.trim() || !payload.phone?.trim()) {
    return { error: "Vui lòng nhập họ tên học sinh và số điện thoại liên hệ" };
  }

  // Bắt buộc chọn đúng nguồn thật, không tự bịa mặc định (AGENTS.md Mục 11.1)
  if (!payload.source) {
    return { error: "Vui lòng chọn nguồn tiếp nhận khách hàng" };
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      full_name: payload.fullName.trim(),
      phone: payload.phone.trim(),
      parent_name: payload.parentName?.trim() || null,
      course_interest: payload.courseInterest?.trim() || null,
      source: payload.source,
      note: payload.note?.trim() || "Thêm nhanh từ thanh thao tác Sale",
      stage: "raw",
      status: "new",
      missed_calls_count: 0,
      assigned_sale_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: `Thêm nhanh Lead thất bại: ${error.message}` };
  }

  // Tự động ghi 1 dòng tương tác ban đầu
  await supabase.from("lead_interactions").insert({
    lead_id: lead.id,
    sale_id: user.id,
    channel: payload.source === "zalo" ? "zalo" : "call",
    content: `Tiếp nhận nhanh qua ${payload.source}. Ghi chú: ${payload.note || "Khách quan tâm cần tư vấn"}`,
    is_missed_call: false,
  });

  revalidatePath("/sale/admissions");
  revalidatePath("/sale/daily-tasks");

  return { success: true, lead };
}


// ==========================================
// TRA CỨU SLOT LỚP TRỐNG — Sale xem lớp nào còn chỗ để tư vấn / xếp học thử
// Không tạo bảng DB mới. Đọc từ classes + enrollments đã có.
// ==========================================

import type { ClassScheduleItem } from "@/types/database";

export interface ClassSlotInfo {
  id: string;
  name: string;
  room?: string | null;
  teacherName?: string | null;
  schedule: ClassScheduleItem[];
  maxStudents: number;
  enrolledCount: number;
  /** Số chỗ còn trống = maxStudents - enrolledCount */
  availableSlots: number;
  feePerSession: number;
  startDate?: string | null;
  endDate?: string | null;
  isFull: boolean;
  /** Gần đầy: còn ≤ 3 chỗ trống */
  isAlmostFull: boolean;
}

export async function getAvailableClassSlots(): Promise<ClassSlotInfo[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      room,
      fee_per_session,
      max_students,
      start_date,
      end_date,
      schedule,
      teacher:profiles!classes_teacher_id_fkey(full_name),
      enrollments:enrollments(count)
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("getAvailableClassSlots error:", error.message);
    return [];
  }

  return (classes || []).map((c: any) => {
    const enrolledCount: number = c.enrollments?.[0]?.count ?? 0;
    const maxStudents: number = c.max_students ?? 0;
    const availableSlots = Math.max(0, maxStudents - enrolledCount);
    return {
      id: c.id as string,
      name: c.name as string,
      room: c.room ?? null,
      teacherName: (c.teacher as any)?.full_name ?? null,
      schedule: Array.isArray(c.schedule) ? c.schedule : [],
      maxStudents,
      enrolledCount,
      availableSlots,
      feePerSession: c.fee_per_session ?? 0,
      startDate: c.start_date ?? null,
      endDate: c.end_date ?? null,
      isFull: availableSlots === 0,
      isAlmostFull: availableSlots > 0 && availableSlots <= 3,
    } satisfies ClassSlotInfo;
  });
}
