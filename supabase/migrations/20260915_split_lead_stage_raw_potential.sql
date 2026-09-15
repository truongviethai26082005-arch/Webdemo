-- Migration: Tách stage 'inquiry' thành 2 tầng riêng 'raw' (Lead thô) và
-- 'potential' (Tiềm năng) theo đúng mô hình phễu 4 tầng N1-N4 chuẩn CRM giáo
-- dục (N1 Lead thô -> N2 Tiềm năng -> N3 Học thử -> N4 Chính thức).
-- Ngày tạo: 2026-09-15

-- Đổi giá trị mặc định cho cột stage của các Lead mới tạo sau này
ALTER TABLE public.leads ALTER COLUMN stage SET DEFAULT 'raw';

-- Chuyển dữ liệu đã có: Lead nào đã từng liên hệ được (status khác 'new')
-- coi như đã xác thực nhu cầu thật -> lên tầng 'potential'.
UPDATE public.leads
SET stage = 'potential', updated_at = now()
WHERE stage = 'inquiry' AND status IN ('contacted', 'callback', 'converted', 'no_demand');

-- Lead chưa từng liên hệ (status vẫn 'new') -> giữ ở tầng 'raw' (thấp nhất)
UPDATE public.leads
SET stage = 'raw', updated_at = now()
WHERE stage = 'inquiry' AND status = 'new';
