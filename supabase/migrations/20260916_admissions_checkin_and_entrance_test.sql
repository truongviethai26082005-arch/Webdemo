-- Migration: Phễu Tuyển sinh 3 giai đoạn — QR check-in học thử + Test đầu vào
-- Ngày tạo: 2026-09-16
-- Bối cảnh: gộp hiển thị 4->3 giai đoạn KHÔNG cần đổi schema (xem
-- lib/utils/admissions-funnel.ts, không có trong migration này). Migration
-- này chỉ bổ sung 2 tính năng mới hoàn toàn chưa có: (1) QR check-in điểm
-- danh học thử tự động, (2) Test đầu vào nhiều câu hỏi + gợi ý lớp theo điểm.
--
-- CHƯA CHẠY trên Supabase — cần chủ dự án tự chạy (đúng thông lệ cả dự án,
-- Claude không có quyền ghi DB trực tiếp). Chạy xong báo lại để tiếp tục
-- nhập ngân hàng câu hỏi thật.

-- ==========================================
-- PHẦN 1: QR check-in điểm danh học thử
-- ==========================================
-- checkin_token: mã cố định gắn với 1 ca học thử (trial_slots), dùng để in
-- QR dán tại phòng học. Học sinh tự quét, nhập SĐT đã đăng ký để điểm danh.
ALTER TABLE public.trial_slots
  ADD COLUMN IF NOT EXISTS checkin_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_slots_checkin_token ON public.trial_slots(checkin_token);

ALTER TABLE public.lead_trials
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- ==========================================
-- PHẦN 2: Test đầu vào (nhiều câu hỏi, tự chấm điểm)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.entrance_test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('a','b','c','d')),
    points NUMERIC NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lead_test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    access_token UUID NOT NULL DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    total_score NUMERIC,
    max_score NUMERIC,
    percentage NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_test_attempts_token ON public.lead_test_attempts(access_token);
CREATE INDEX IF NOT EXISTS idx_lead_test_attempts_lead_id ON public.lead_test_attempts(lead_id);

CREATE TABLE IF NOT EXISTS public.lead_test_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.lead_test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.entrance_test_questions(id) ON DELETE CASCADE,
    selected_option TEXT NOT NULL CHECK (selected_option IN ('a','b','c','d')),
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, question_id)
);

-- ==========================================
-- PHẦN 3: Quy đổi điểm -> gợi ý lớp phù hợp
-- ==========================================
-- Bắt đầu TRỐNG (không có ngưỡng điểm mặc định nào) — đúng nguyên tắc
-- AGENTS.md 11.1 "không tự bịa dữ liệu". Sale/Admin tự nhập ngưỡng điểm thật
-- qua UI quản trị sau khi migration này chạy xong.
CREATE TABLE IF NOT EXISTS public.course_recommendation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    min_percentage NUMERIC NOT NULL,
    max_percentage NUMERIC NOT NULL,
    suggested_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    suggested_label TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (min_percentage >= 0 AND max_percentage <= 100 AND min_percentage <= max_percentage)
);

CREATE INDEX IF NOT EXISTS idx_entrance_test_questions_subject ON public.entrance_test_questions(subject);
CREATE INDEX IF NOT EXISTS idx_course_recommendation_rules_subject ON public.course_recommendation_rules(subject);

ALTER TABLE public.entrance_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_recommendation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access to entrance_test_questions"
ON public.entrance_test_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to lead_test_attempts"
ON public.lead_test_attempts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to lead_test_answers"
ON public.lead_test_answers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to course_recommendation_rules"
ON public.course_recommendation_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- PHẦN 4: Hàm SECURITY DEFINER cho luồng CÔNG KHAI (chưa đăng nhập)
-- ==========================================
-- Học sinh học thử/làm test đầu vào CHƯA có tài khoản đăng nhập (chỉ được
-- cấp tài khoản sau khi 'enrolled' — xem AGENTS.md mục 9). Thay vì mở RLS
-- SELECT rộng cho vai trò `anon` trên leads/lead_trials/entrance_test_questions
-- (sẽ lộ SĐT/tên phụ huynh và đáp án đúng cho bất kỳ ai có anon key — vốn là
-- key công khai nhúng sẵn trong client bundle), dùng 3 hàm SECURITY DEFINER
-- hẹp: chỉ nhận đúng tham số cần, chỉ trả đúng dữ liệu tối thiểu cần thiết,
-- không có endpoint nào cho phép liệt kê toàn bộ bảng.

-- 4a. Check-in học thử bằng SĐT (quét QR của ca học thử -> nhập SĐT)
CREATE OR REPLACE FUNCTION public.checkin_trial_lead(p_checkin_token UUID, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot RECORD;
  v_trial RECORD;
BEGIN
  SELECT id, subject INTO v_slot
  FROM trial_slots WHERE checkin_token = p_checkin_token;

  IF v_slot.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Mã QR không hợp lệ');
  END IF;

  SELECT lt.id, lt.checked_in_at, l.full_name INTO v_trial
  FROM lead_trials lt
  JOIN leads l ON l.id = lt.lead_id
  WHERE lt.slot_id = v_slot.id
    AND l.phone = p_phone
    AND lt.status = 'scheduled'
    AND (lt.trial_date IS NULL OR lt.trial_date = CURRENT_DATE)
  ORDER BY lt.created_at DESC
  LIMIT 1;

  IF v_trial.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Không tìm thấy lịch học thử của số điện thoại này cho ca học hôm nay. Vui lòng liên hệ nhân viên tư vấn.'
    );
  END IF;

  IF v_trial.checked_in_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already', true, 'message', 'Bạn đã điểm danh trước đó rồi!', 'leadName', v_trial.full_name);
  END IF;

  UPDATE lead_trials SET checked_in_at = now() WHERE id = v_trial.id;

  RETURN jsonb_build_object('success', true, 'already', false, 'message', 'Điểm danh thành công!', 'leadName', v_trial.full_name, 'subject', v_slot.subject);
END;
$$;

REVOKE ALL ON FUNCTION public.checkin_trial_lead(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.checkin_trial_lead(UUID, TEXT) TO anon, authenticated;

-- 4a-bis. Thông tin công khai tối thiểu của ca học thử (hiển thị đầu trang
-- check-in trước khi học sinh nhập SĐT) — không lộ danh sách đăng ký.
CREATE OR REPLACE FUNCTION public.get_trial_slot_public_info(p_checkin_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot RECORD;
BEGIN
  SELECT subject, teacher_name, room, day_of_week, time_slot INTO v_slot
  FROM trial_slots WHERE checkin_token = p_checkin_token;

  IF v_slot.subject IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Mã QR không hợp lệ');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'subject', v_slot.subject,
    'teacherName', v_slot.teacher_name,
    'room', v_slot.room,
    'dayOfWeek', v_slot.day_of_week,
    'timeSlot', v_slot.time_slot
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_trial_slot_public_info(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_trial_slot_public_info(UUID) TO anon, authenticated;

-- 4b. Lấy đề test theo access_token (KHÔNG bao giờ trả đáp án đúng cho client)
CREATE OR REPLACE FUNCTION public.get_entrance_test(p_access_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_questions JSONB;
BEGIN
  SELECT ta.id, ta.subject, ta.submitted_at, l.full_name INTO v_attempt
  FROM lead_test_attempts ta
  JOIN leads l ON l.id = ta.lead_id
  WHERE ta.access_token = p_access_token;

  IF v_attempt.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Liên kết bài test không hợp lệ');
  END IF;

  IF v_attempt.submitted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bài test này đã được nộp trước đó');
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id', q.id, 'question_text', q.question_text,
    'option_a', q.option_a, 'option_b', q.option_b,
    'option_c', q.option_c, 'option_d', q.option_d
  ) ORDER BY q.created_at) INTO v_questions
  FROM entrance_test_questions q
  WHERE q.subject = v_attempt.subject AND q.is_active = true;

  UPDATE lead_test_attempts SET started_at = COALESCE(started_at, now()) WHERE id = v_attempt.id;

  RETURN jsonb_build_object(
    'success', true,
    'leadName', v_attempt.full_name,
    'subject', v_attempt.subject,
    'questions', COALESCE(v_questions, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_entrance_test(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_entrance_test(UUID) TO anon, authenticated;

-- 4c. Nộp bài test -> tự chấm điểm server-side, ghi lead_test_answers, cập nhật leads.test_score
CREATE OR REPLACE FUNCTION public.submit_entrance_test(p_access_token UUID, p_answers JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_answer JSONB;
  v_question RECORD;
  v_total_score NUMERIC := 0;
  v_max_score NUMERIC := 0;
  v_correct_count INT := 0;
  v_total_count INT := 0;
  v_percentage NUMERIC := 0;
BEGIN
  SELECT id, lead_id, subject, submitted_at INTO v_attempt
  FROM lead_test_attempts WHERE access_token = p_access_token;

  IF v_attempt.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Liên kết bài test không hợp lệ');
  END IF;

  IF v_attempt.submitted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bài test này đã được nộp trước đó');
  END IF;

  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    SELECT id, correct_option, points INTO v_question
    FROM entrance_test_questions
    WHERE id = (v_answer->>'questionId')::UUID AND subject = v_attempt.subject;

    IF v_question.id IS NOT NULL THEN
      v_total_count := v_total_count + 1;
      v_max_score := v_max_score + v_question.points;

      INSERT INTO lead_test_answers (attempt_id, question_id, selected_option, is_correct)
      VALUES (
        v_attempt.id,
        v_question.id,
        lower(v_answer->>'selectedOption'),
        lower(v_answer->>'selectedOption') = v_question.correct_option
      )
      ON CONFLICT (attempt_id, question_id) DO UPDATE
        SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct;

      IF lower(v_answer->>'selectedOption') = v_question.correct_option THEN
        v_total_score := v_total_score + v_question.points;
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;

  IF v_max_score > 0 THEN
    v_percentage := round((v_total_score / v_max_score) * 100, 1);
  END IF;

  UPDATE lead_test_attempts
  SET submitted_at = now(), total_score = v_total_score, max_score = v_max_score, percentage = v_percentage
  WHERE id = v_attempt.id;

  UPDATE leads SET test_score = v_total_score, updated_at = now() WHERE id = v_attempt.lead_id;

  RETURN jsonb_build_object(
    'success', true,
    'totalScore', v_total_score,
    'maxScore', v_max_score,
    'percentage', v_percentage,
    'correctCount', v_correct_count,
    'totalCount', v_total_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_entrance_test(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_entrance_test(UUID, JSONB) TO anon, authenticated;
