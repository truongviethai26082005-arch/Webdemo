-- Tính năng: Giáo viên mở mã QR/mã số điểm danh cho 1 buổi học (class_session),
-- học sinh tự quét/nhập mã ở /student/check-in để ghi nhận đã có mặt.
-- Quan trọng: bảng attendance_checkins CHỈ ghi nhận "đã quét", KHÔNG tự trừ
-- balance_sessions. Giáo viên vẫn phải bấm "Lưu Bảng Điểm Danh" như cũ để
-- saveAttendanceSheet() (lib/actions/attendance.ts) trừ buổi — tránh 2 nguồn
-- xử lý trừ buổi song song từng gây lỗi trừ 2 lần trong dự án này.

-- Mã hiện hành (QR + số 6 chữ số) của 1 buổi học — mỗi session chỉ có đúng 1
-- dòng "mã đang mở", rotate bằng cách upsert đè lên dòng cũ mỗi ~30 giây.
create table if not exists attendance_checkin_codes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions(id) on delete cascade unique,
  code text not null,
  qr_token text not null unique,
  expires_at timestamptz not null,
  created_by uuid not null references profiles(id),
  updated_at timestamptz not null default now()
);

create index if not exists idx_attendance_checkin_codes_token on attendance_checkin_codes(qr_token);

-- Học sinh đã tự điểm danh cho 1 buổi qua QR/mã số. Mỗi học sinh chỉ 1 dòng
-- cho mỗi buổi (unique session_id + student_id) để chống quét/nhập nhiều lần.
create table if not exists attendance_checkins (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique (session_id, student_id)
);

alter table attendance_checkin_codes enable row level security;
alter table attendance_checkins enable row level security;

-- Giữ đúng pattern RLS hiện có của 7 bảng lõi trong dự án ("bật nhưng cho phép
-- authenticated toàn quyền") — an toàn thực tế nằm ở tầng Server Action
-- (ownership check bằng user.id từ session), không phải ở RLS. Xem AGENTS.md mục 5.4.
create policy "Authenticated users full access" on attendance_checkin_codes
  for all to authenticated using (true) with check (true);

create policy "Authenticated users full access" on attendance_checkins
  for all to authenticated using (true) with check (true);
