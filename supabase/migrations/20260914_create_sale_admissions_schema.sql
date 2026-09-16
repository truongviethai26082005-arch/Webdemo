-- Migration: Schema cho Phân hệ Tuyển sinh (Sale Subsystem)
-- Ngày tạo: 2026-09-14
-- Các bảng: leads, lead_interactions, trial_slots, lead_trials

-- 1. Bảng leads (Thông tin khách hàng tiềm năng)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    parent_name TEXT,
    phone TEXT NOT NULL,
    zalo TEXT,
    email TEXT,
    birth_date DATE,
    grade TEXT,
    course_interest TEXT,
    target_goal TEXT,
    source TEXT NOT NULL DEFAULT 'facebook_ads',
    referrer_name TEXT,
    stage TEXT NOT NULL DEFAULT 'inquiry', -- 'inquiry' | 'trial' | 'conversion' | 'enrolled' | 'waiting_class'
    status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'contacted' | 'callback' | 'no_demand' | 'converted'
    assigned_sale_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    converted_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    missed_calls_count INT NOT NULL DEFAULT 0,
    trial_result TEXT, -- 'excellent' | 'good' | 'average' | 'weak'
    test_score NUMERIC,
    target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    target_class_name TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bảng lead_interactions (Nhật ký tương tác / CRM)
CREATE TABLE IF NOT EXISTS public.lead_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'call', -- 'call' | 'zalo' | 'in_person' | 'email'
    content TEXT NOT NULL,
    sentiment TEXT, -- 'high_interest' | 'price_concern' | 'schedule_conflict' | 'need_consult' | 'other'
    is_missed_call BOOLEAN NOT NULL DEFAULT false,
    callback_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Bảng trial_slots (Ca học thử cố định lặp lại theo tuần)
CREATE TABLE IF NOT EXISTS public.trial_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    teacher_name TEXT,
    room TEXT,
    day_of_week TEXT NOT NULL, -- vd: "Thứ 2 & Thứ 4", "Thứ 7"
    time_slot TEXT NOT NULL, -- vd: "17:30 - 19:00"
    max_students INT NOT NULL DEFAULT 10,
    batch_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'full' | 'closed'
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Bảng lead_trials (Học sinh đăng ký ca học thử)
CREATE TABLE IF NOT EXISTS public.lead_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.trial_slots(id) ON DELETE CASCADE,
    trial_date DATE,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'attended' | 'absent' | 'cancelled'
    score NUMERIC,
    evaluation TEXT,
    result TEXT, -- 'excellent' | 'good' | 'average' | 'weak'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chỉ mục hỗ trợ truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_sale ON public.leads(assigned_sale_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_trials_lead_id ON public.lead_trials(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_trials_slot_id ON public.lead_trials(slot_id);

-- Kích hoạt RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_trials ENABLE ROW LEVEL SECURITY;

-- Policy an toàn cho người dùng đã đăng nhập (Server Action quản lý phân quyền chi tiết)
CREATE POLICY "Authenticated users full access to leads"
ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to lead_interactions"
ON public.lead_interactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to trial_slots"
ON public.trial_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access to lead_trials"
ON public.lead_trials FOR ALL TO authenticated USING (true) WITH CHECK (true);
