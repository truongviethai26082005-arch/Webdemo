-- Trạng thái Active/Paused/Dropped là thuộc tính của TỪNG LƯỢT GHI DANH (enrollments),
-- không phải của học sinh (students) — 1 học sinh có thể active ở lớp này, paused ở lớp khác.
-- Xem AGENTS.md Mục 11 (context-handoff.md) — "Việc 2".
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'paused', 'dropped'));
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Lớp tính theo khóa (có ngày kết thúc cố định) thay vì tính theo buổi.
ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_date DATE;
