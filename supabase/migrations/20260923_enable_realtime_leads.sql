-- Bật Supabase Realtime cho bảng `leads` — để phễu Tuyển sinh phân hệ Sale
-- (app/sale/admissions/admissions-client.tsx) tự động hiện Lead mới ngay khi
-- có request từ webhook Google Form (app/api/leads/webhook/route.ts) mà
-- không cần người dùng F5 lại trang.
-- Lưu ý: RLS của bảng `leads` đã cho phép "authenticated" full access (xem
-- 20260914_create_sale_admissions_schema.sql) nên Realtime cũng tự áp dụng
-- đúng policy đó, không cần cấu hình quyền riêng.
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
