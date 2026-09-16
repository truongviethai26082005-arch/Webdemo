-- lib/actions/students.ts (createStudent/updateStudent) đã viết sẵn logic ghi 2 cột này từ trước,
-- nhưng cột chưa tồn tại trên DB khiến dữ liệu nhập vào bị âm thầm rớt (fallback bỏ field khi lỗi
-- PGRST204). Thêm cột để khớp đúng ý đồ code đã có.
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS note TEXT;
