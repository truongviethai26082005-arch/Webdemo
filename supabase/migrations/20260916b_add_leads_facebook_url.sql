-- Migration: Thêm liên hệ Facebook cho Lead (bên cạnh Gọi điện & Zalo)
-- Ngày tạo: 2026-09-16
-- Lưu ý: KHÔNG có cách suy ra link Facebook thật từ SĐT như Zalo
-- (zalo.me/{phone}) — phải lưu link Facebook/Messenger thật do Sale tự nhập
-- (AGENTS.md 11.1: không tự bịa dữ liệu).

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS facebook_url TEXT;
