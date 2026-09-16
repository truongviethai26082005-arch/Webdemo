Nhật ký làm việc — Phân hệ Học sinh (Student)
> File này CHỈ dành cho người phụ trách phân hệ Student ghi lại tiến độ,
> quyết định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác
> sửa file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án.

## Hiện trạng khi bắt đầu (2026-09-13)

- `app/student/layout.tsx` + `app/student/dashboard/page.tsx`: mới là
  **placeholder tối thiểu** (có nút đăng xuất, chặn quyền đúng) — CHƯA có
  tính năng thật nào.
- **Khác biệt quan trọng so với Admin/Teacher/Sale:** học sinh KHÔNG có bản
  ghi trong bảng `profiles` — không dùng `getCurrentProfile()` được. Việc xác
  định quyền/danh tính phải dùng `requireRole(["student"])`
  (`lib/auth/guards.ts`), hàm này tự kiểm tra qua `students.auth_user_id`.
  `app/student/layout.tsx` đã làm đúng mẫu này — copy theo, đừng đổi sang
  `getCurrentProfile()`.
- Muốn lấy đúng bản ghi `students` của người đang đăng nhập: lấy `user.id` từ
  session (`supabase.auth.getUser()`), rồi query
  `students` với điều kiện `auth_user_id = user.id` — KHÔNG dùng ID do client
  truyền lên để xác định "học sinh nào" (đúng nguyên tắc IDOR ở AGENTS.md
  Mục 5.3).
- Chỉ được xem dữ liệu gắn với chính bản ghi `students` của mình (lịch học,
  điểm danh, công nợ) — không xem được học sinh khác.
- RLS thật theo từng role (AGENTS.md Mục 5.4) **chưa xong** — mọi kiểm tra
  quyền hiện chỉ dựa vào tầng ứng dụng (Server Action), không dựa vào
  Database. Vẫn phải tự viết ownership check đầy đủ dù RLS có vẻ như đã bật.

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)
