-- Migration: Dọn giá trị 'inquiry' cũ (trước khi phễu Tuyển sinh chốt lại
-- còn ĐÚNG 3 giai đoạn hiển thị: N1 Khách hàng tiềm năng / N2 Xếp lịch học
-- thử / N3 Ghi danh & chuyển đổi, 2026-09-16). Vì N1 đã gộp "raw" và
-- "potential" thành 1 khối duy nhất trên toàn bộ giao diện (không còn phân
-- biệt 2 giá trị này ở bất kỳ đâu), không cần tách 'inquiry' theo status
-- nữa — quy thẳng về 'raw' cho đơn giản, thống nhất.

-- Đổi giá trị mặc định cho cột stage của các Lead mới tạo sau này
ALTER TABLE public.leads ALTER COLUMN stage SET DEFAULT 'raw';

-- Toàn bộ Lead còn giá trị 'inquiry' cũ -> quy về 'raw' (N1)
UPDATE public.leads
SET stage = 'raw', updated_at = now()
WHERE stage = 'inquiry';
