-- Migration: thêm cột chi phí cố định hàng tháng vào center_settings.
-- Trước đây lib/actions/analytics.ts đã có sẵn code đọc cột "fixed_cost"
-- (kèm TODO ghi rõ "chưa tạo schema") nhưng cột chưa từng tồn tại — luôn rơi
-- vào fallback bịa cứng 6.500.000đ để tính "Lợi nhuận gộp" hiển thị cho
-- Admin, vi phạm AGENTS.md Mục 11.1. Chủ dự án chọn: để trống, hiện rõ "Chưa
-- cấu hình" cho tới khi tự nhập số thật qua UI (2026-09-22).
-- Ngày tạo: 2026-09-22

ALTER TABLE public.center_settings
  ADD COLUMN IF NOT EXISTS fixed_cost NUMERIC;
