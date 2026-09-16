-- Cho phép học sinh có tài khoản đăng nhập riêng (role "student"), liên kết qua auth_user_id.
-- Xem AGENTS.md Mục 4/5.2 — 1 bản ghi students có thể có hoặc chưa có tài khoản đăng nhập.
ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);
