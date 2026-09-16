"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  EntranceTestQuestion,
  LeadTestAttempt,
  CourseRecommendationRule,
  TestOption,
} from "@/types/database";

// ==========================================
// 1. NGÂN HÀNG CÂU HỎI (Admin/Sale quản trị — cần đăng nhập)
// ==========================================

export async function getQuestions(subject?: string): Promise<EntranceTestQuestion[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  let query = supabase.from("entrance_test_questions").select("*").order("created_at", { ascending: false });
  if (subject) query = query.eq("subject", subject);

  const { data } = await query;
  return (data || []) as EntranceTestQuestion[];
}

export interface QuestionPayload {
  subject: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: TestOption;
  points?: number;
}

export async function createQuestion(payload: QuestionPayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!payload.subject.trim() || !payload.question_text.trim()) {
    return { error: "Vui lòng nhập đủ môn học và nội dung câu hỏi" };
  }
  if (!payload.option_a.trim() || !payload.option_b.trim() || !payload.option_c.trim() || !payload.option_d.trim()) {
    return { error: "Vui lòng nhập đủ 4 đáp án" };
  }

  const { error } = await supabase.from("entrance_test_questions").insert({
    subject: payload.subject.trim(),
    question_text: payload.question_text.trim(),
    option_a: payload.option_a.trim(),
    option_b: payload.option_b.trim(),
    option_c: payload.option_c.trim(),
    option_d: payload.option_d.trim(),
    correct_option: payload.correct_option,
    points: payload.points ?? 1,
  });

  if (error) return { error: error.message };

  revalidatePath("/sale/admissions");
  return { success: true };
}

export async function updateQuestion(id: string, payload: Partial<QuestionPayload> & { is_active?: boolean }) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { error } = await supabase.from("entrance_test_questions").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/sale/admissions");
  return { success: true };
}

export async function deleteQuestion(id: string) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { error } = await supabase.from("entrance_test_questions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/sale/admissions");
  return { success: true };
}

// ==========================================
// 2. QUY ĐỔI ĐIỂM -> GỢI Ý LỚP (Admin/Sale quản trị)
// ==========================================

export async function getRecommendationRules(): Promise<CourseRecommendationRule[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data } = await supabase
    .from("course_recommendation_rules")
    .select("*, suggested_class:classes(*)")
    .order("subject", { ascending: true })
    .order("min_percentage", { ascending: true });

  return (data || []) as CourseRecommendationRule[];
}

export interface RecommendationRulePayload {
  subject: string;
  min_percentage: number;
  max_percentage: number;
  suggested_class_id?: string | null;
  suggested_label: string;
  note?: string;
}

export async function createRecommendationRule(payload: RecommendationRulePayload) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (!payload.subject.trim() || !payload.suggested_label.trim()) {
    return { error: "Vui lòng nhập đủ môn học và nội dung gợi ý" };
  }
  if (payload.min_percentage < 0 || payload.max_percentage > 100 || payload.min_percentage > payload.max_percentage) {
    return { error: "Khoảng điểm % không hợp lệ" };
  }

  const { error } = await supabase.from("course_recommendation_rules").insert({
    subject: payload.subject.trim(),
    min_percentage: payload.min_percentage,
    max_percentage: payload.max_percentage,
    suggested_class_id: payload.suggested_class_id || null,
    suggested_label: payload.suggested_label.trim(),
    note: payload.note?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/sale/admissions");
  return { success: true };
}

export async function deleteRecommendationRule(id: string) {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const { error } = await supabase.from("course_recommendation_rules").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/sale/admissions");
  return { success: true };
}

// Tra khoảng điểm % -> gợi ý lớp phù hợp thật (không suy diễn, chỉ trả về
// đúng rule Sale/Admin đã tự cấu hình; rỗng nếu chưa cấu hình rule nào).
export async function getRecommendationForScore(subject: string, percentage: number): Promise<CourseRecommendationRule[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data } = await supabase
    .from("course_recommendation_rules")
    .select("*, suggested_class:classes(*)")
    .eq("subject", subject)
    .lte("min_percentage", percentage)
    .gte("max_percentage", percentage);

  return (data || []) as CourseRecommendationRule[];
}

// ==========================================
// 3. GỬI BÀI TEST CHO 1 LEAD (Sale bấm nút, tạo link công khai)
// ==========================================

export interface CreateAttemptResult {
  error?: string;
  success?: true;
  accessToken?: string;
}

export async function createTestAttemptForLead(leadId: string, subject: string): Promise<CreateAttemptResult> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase, user } = guard.context;

  if (!subject.trim()) {
    return { error: "Vui lòng chọn môn học để tạo bài test" };
  }

  const { count } = await supabase
    .from("entrance_test_questions")
    .select("id", { count: "exact", head: true })
    .eq("subject", subject)
    .eq("is_active", true);

  if (!count || count === 0) {
    return { error: `Chưa có câu hỏi nào cho môn "${subject}" trong ngân hàng câu hỏi. Vui lòng thêm câu hỏi trước.` };
  }

  const { data, error } = await supabase
    .from("lead_test_attempts")
    .insert({ lead_id: leadId, subject: subject.trim(), created_by: user?.id })
    .select("access_token")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/sale/admissions");
  return { success: true, accessToken: data.access_token };
}

export async function getTestAttemptsForLead(leadId: string): Promise<LeadTestAttempt[]> {
  const guard = await requireRole(["sale", "admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data } = await supabase
    .from("lead_test_attempts")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  return (data || []) as LeadTestAttempt[];
}

// ==========================================
// 4. LÀM BÀI TEST (CÔNG KHAI — học sinh tự làm, không cần đăng nhập)
// ==========================================
// Toàn bộ logic chấm điểm chạy trong 2 hàm SECURITY DEFINER phía Supabase
// (get_entrance_test, submit_entrance_test — xem migration
// 20260916_admissions_checkin_and_entrance_test.sql) để KHÔNG BAO GIỜ trả
// đáp án đúng cho client trước khi nộp bài, và không cần mở RLS rộng cho anon.

export interface PublicQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface GetEntranceTestResult {
  success: boolean;
  message?: string;
  leadName?: string;
  subject?: string;
  questions?: PublicQuestion[];
}

export async function getEntranceTestForAttempt(accessToken: string): Promise<GetEntranceTestResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_entrance_test", { p_access_token: accessToken });

  if (error) {
    return { success: false, message: "Không thể tải bài test. Vui lòng thử lại." };
  }

  return data as GetEntranceTestResult;
}

export interface SubmitAnswer {
  questionId: string;
  selectedOption: TestOption;
}

export interface SubmitEntranceTestResult {
  success: boolean;
  message?: string;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  correctCount?: number;
  totalCount?: number;
}

export async function submitEntranceTest(accessToken: string, answers: SubmitAnswer[]): Promise<SubmitEntranceTestResult> {
  if (!answers || answers.length === 0) {
    return { success: false, message: "Vui lòng trả lời ít nhất 1 câu trước khi nộp bài" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_entrance_test", {
    p_access_token: accessToken,
    p_answers: answers,
  });

  if (error) {
    return { success: false, message: "Có lỗi khi nộp bài. Vui lòng thử lại." };
  }

  return data as SubmitEntranceTestResult;
}
