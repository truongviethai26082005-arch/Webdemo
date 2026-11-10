-- Migration: bổ sung 2 cột còn thiếu để nối thật tính năng Bài tập/Tài
-- nguyên học tập của Teacher (trước đó 3 trang app/teacher/{assignments,
-- grading,resources} chỉ chạy trên dữ liệu mock, chưa từng ghi bảng thật).
-- Ngày tạo: 2026-09-22

-- Thang điểm tối đa của 1 bài tập/kiểm tra (không có sẵn, mặc định 10 —
-- đúng quy ước điểm 10 phổ biến, giáo viên tự đổi khi tạo bài nếu khác).
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS max_score NUMERIC NOT NULL DEFAULT 10;

-- Loại tài liệu (slide/pdf/video/link) để hiển thị đúng icon bên Student —
-- trước đó code đã có sẵn logic đọc cột này (lib/actions/student.ts) nhưng
-- cột chưa tồn tại trên DB thật.
ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'link';
