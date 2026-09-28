Nhật ký làm việc — Phân hệ Giáo viên (Teacher)
> File này CHỈ dành cho người phụ trách phân hệ Teacher ghi lại tiến độ,
> quyết định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác
> sửa file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án: sự cố bảo mật đã
>   xử lý, quyết định kiến trúc lớn, trạng thái Git — áp dụng cho cả 4
>   phân hệ, không chỉ riêng Teacher.

## Việc còn treo dành riêng cho Teacher (cập nhật 2026-09-22)

- Vài fallback giờ học bịa (`|| "18:00"`) còn sót ở `schedule-client.tsx`,
  `earnings-client.tsx`; buổi `cancelled` còn hiển thị lẫn vào danh sách
  "sắp diễn ra" ở `earnings-client.tsx`.
- Trang "Lớp học của tôi" (`app/teacher/classes`) còn thiếu chức năng thao
  tác thật (chưa có nút điểm danh/xem chi tiết trực tiếp từ đây).

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-22 (Claude) — Nối 3 màn hình mock vào dữ liệu thật + thống nhất công thức lương

Chủ dự án yêu cầu rà soát + nối luồng dữ liệu 4 phân hệ. Phần Teacher, đã
**xóa 2 mục "còn treo" ở trên** vì đã xử lý xong:

1. **`app/teacher/assignments`, `app/teacher/grading`, `app/teacher/resources`
   — chuyển từ 100% mock `useState` sang dữ liệu thật.** 2 file Server Action
   mới: `lib/actions/assignments.ts` (CRUD bài tập + chấm điểm, ownership
   check `class.teacher_id === user.id`) và `lib/actions/materials.ts` (CRUD
   tài liệu — lưu dạng **link** Drive/YouTube, không upload file nhị phân,
   tránh phải dựng Supabase Storage). Migration mới thêm `assignments.max_score`
   (mặc định 10) và `materials.type` (mặc định `'link'`) — 2 cột code cũ đã
   định hình sẵn nhưng DB thật chưa có. Đây chính là mắt xích Teacher→Student
   còn thiếu: giáo viên giao bài/chấm điểm/thêm tài liệu giờ hiện thật ngay ở
   `/student/assignments`, `/student/grades`, `/student/resources`.
2. **`getTeacherPersonalEarnings()` (`lib/actions/teachers.ts`, Nhóm 2) —
   thống nhất lại công thức với `getTeacherPayroll()`.** Trước đây hàm này
   cộng luôn mọi buổi của các lớp mình phụ trách kể cả khi có giáo viên khác
   dạy thay hôm đó (dùng `.or(teacher_id.eq.X, class_id.in.(lớp của mình))`)
   — khiến "Thu nhập của tôi" hiện số CAO HƠN số Admin thực trả. Đã sửa chỉ
   lọc theo `class_sessions.teacher_id = chính mình` (buổi mình THẬT SỰ đứng
   lớp), khớp đúng công thức `getTeacherPayroll()` dùng để trả lương.

`npx tsc --noEmit`: exit code 0. Cần chạy migration
`supabase/migrations/20260922_add_assignment_max_score_and_material_type.sql`
(đã chạy xong trên Supabase, xác nhận qua truy vấn trực tiếp).
