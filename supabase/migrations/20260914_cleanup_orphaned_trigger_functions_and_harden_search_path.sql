-- Phát hiện qua Supabase Security Advisor ngày 2026-09-14 (rà soát cuối trước
-- khi bàn giao code song song 4 phân hệ).
--
-- 1. Migration 20260912_fix_duplicate_deduction_triggers_and_failopen_role.sql
--    trước đó chỉ DROP TRIGGER cho 2 trigger gây trừ/cộng buổi 2 lần, nhưng
--    CHƯA xóa FUNCTION bên dưới. Xác minh lại bằng pg_trigger: cả 3 hàm dưới
--    đây hiện KHÔNG còn gắn với trigger nào (an toàn để xóa hẳn), nhưng vẫn
--    tồn tại trong DB dưới dạng SECURITY DEFINER và được cấp quyền EXECUTE
--    qua REST RPC cho cả role anon/authenticated (Supabase advisor cảnh báo
--    "anon_security_definer_function_executable"). Gọi trực tiếp qua RPC sẽ
--    lỗi ngay (đây là hàm kiểu RETURNS trigger, Postgres không cho gọi ngoài
--    ngữ cảnh trigger) nên không phải lỗ hổng khai thác được thực tế, nhưng
--    dọn hẳn để tránh nhầm lẫn/rủi ro nếu sau này ai đó vô tình gắn lại trigger.
DROP FUNCTION IF EXISTS public.handle_attendance_balance();
DROP FUNCTION IF EXISTS public.handle_attendance_deduction();
DROP FUNCTION IF EXISTS public.handle_invoice_paid();

-- 2. Hardening theo khuyến nghị "function_search_path_mutable" của Supabase
--    Advisor: đặt search_path cố định cho 2 hàm SECURITY DEFINER/trigger còn
--    dùng thật, tránh rủi ro lý thuyết "search_path hijacking".
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
