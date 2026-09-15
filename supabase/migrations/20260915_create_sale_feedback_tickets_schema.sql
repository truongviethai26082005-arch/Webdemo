-- Migration: Bảng "Phản ánh & Góp ý" (Feedback / Complaint Tickets) cho Phân hệ Sale
-- Ngày tạo: 2026-09-15
-- Ghi nhận phàn nàn/góp ý của phụ huynh/học sinh, Sale tiếp nhận và theo dõi xử lý.
-- Giai đoạn 1 (MVP): chỉ Sale tự ghi nhận + tự đánh dấu trạng thái xử lý, CHƯA có
-- định tuyến sang bộ phận khác / SLA tự động (để dành giai đoạn sau nếu thực tế cần).

CREATE TABLE IF NOT EXISTS public.feedback_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other', -- 'teaching_quality' | 'schedule' | 'tuition' | 'facility' | 'other'
    channel TEXT NOT NULL DEFAULT 'hotline', -- 'in_person' | 'hotline' | 'zalo' | 'facebook' | 'system' | 'email'
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'in_progress' | 'resolved'
    resolution_note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_tickets_status ON public.feedback_tickets(status);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_student_id ON public.feedback_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_created_at ON public.feedback_tickets(created_at);

ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;

-- Policy tạm giống các bảng Sale khác (leads, trial_slots...) — phân quyền chi tiết
-- (chỉ admin+sale) nằm ở tầng Server Action qua requireRole(), đúng hiện trạng
-- chung của toàn bộ 7 bảng lõi + 4 bảng Sale đã có (xem AGENTS.md Mục 5.4).
CREATE POLICY "Authenticated users full access to feedback_tickets"
ON public.feedback_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
