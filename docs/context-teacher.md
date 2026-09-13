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

## Việc còn treo dành riêng cho Teacher (chuyển từ docs/context-handoff.md Mục 15.2 ngày 2026-09-13)

- `getTeacherPersonalEarnings` và `getTeacherPayroll` tính thu nhập giáo viên
  theo 2 công thức khác nhau khi có dạy thay — ra 2 số khác nhau cho cùng
  1 tháng, cần thống nhất lại.
- 3 màn hình `app/teacher/assignments`, `app/teacher/grading`,
  `app/teacher/resources` hiện là mock `useState`, chưa nối dữ liệu thật.
  Bảng `assignments`/`materials`/`submissions` đã có sẵn trên Supabase — tận
  dụng lại, không tạo bảng mới.
- Vài fallback giờ học bịa (`|| "18:00"`) còn sót ở `schedule-client.tsx`,
  `earnings-client.tsx`; buổi `cancelled` còn hiển thị lẫn vào danh sách
  "sắp diễn ra" ở `earnings-client.tsx`.
- Trang "Lớp học của tôi" (`app/teacher/classes`) còn thiếu chức năng thao
  tác thật (chưa có nút điểm danh/xem chi tiết trực tiếp từ đây).

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)
