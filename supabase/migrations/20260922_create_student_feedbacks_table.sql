-- Migration: tạo bảng student_feedbacks — PHÁT HIỆN QUA RÀ SOÁT 2026-09-22:
-- lib/actions/student.ts (submitStudentFeedback/getStudentFeedbacks) đã viết
-- code đọc/ghi bảng này từ trước, nhưng bảng CHƯA TỪNG được tạo trên DB thật
-- — mọi lượt học sinh gửi phản hồi trước đây đều thất bại thầm lặng (lỗi bị
-- nuốt bằng try/catch, vẫn báo "Cảm ơn bạn đã gửi phản hồi!" dù không lưu gì).
-- Ngày tạo: 2026-09-22

CREATE TABLE IF NOT EXISTS public.student_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'other', -- 'teaching_quality' | 'facilities' | 'tuition_schedule' | 'other'
    rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'resolved'
    admin_response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_feedbacks_student_id ON public.student_feedbacks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_feedbacks_status ON public.student_feedbacks(status);

ALTER TABLE public.student_feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy giống hiện trạng chung toàn dự án (AGENTS.md Mục 5.4) — phân quyền
-- chi tiết (học sinh chỉ thấy phản hồi của chính mình, Sale/Admin thấy tất
-- cả) nằm ở tầng Server Action qua requireRole()/ownership check.
CREATE POLICY "Authenticated users full access to student_feedbacks"
ON public.student_feedbacks FOR ALL TO authenticated USING (true) WITH CHECK (true);
