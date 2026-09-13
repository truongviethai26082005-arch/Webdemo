Nhật ký làm việc — Phân hệ Tuyển sinh (Sale)
> File này CHỈ dành cho người phụ trách phân hệ Sale ghi lại tiến độ, quyết
> định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác sửa
> file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định. **Đặc biệt
>   đọc kỹ Mục 9 "Quy tắc bắt buộc: Đồng bộ khi Lead chuyển đổi thành Học
>   sinh" trước khi code bước ghi danh/chuyển đổi.**
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án.

## Hiện trạng khi bắt đầu (2026-09-13)

- `app/sale/layout.tsx` + `app/sale/admissions/page.tsx`: mới là **placeholder
  tối thiểu** (chặn quyền đúng qua `profiles.role === "sale"`, có nút đăng
  xuất) — CHƯA có tính năng thật nào. Toàn bộ tính năng Tuyển sinh cần xây
  mới từ đây.
- `app/admin/admissions` (code cũ): **100% dữ liệu giả, không có bảng DB
  thật** (không có bảng `leads`). Chỉ dùng để tham khảo giao diện/luồng
  nghiệp vụ, KHÔNG copy phần xử lý dữ liệu — phải viết lại thật.
- Chưa có bảng `leads`, `lead_interactions` trên Supabase — cần tự thiết kế
  schema + viết migration khi bắt đầu (nhớ cập nhật `types/database.ts` cùng
  lúc, theo đúng AGENTS.md Mục 3/9).
- **Bắt buộc tái sử dụng** khi ghi danh chuyển đổi thành công: `createStudent()`,
  `enrollStudentInClass()`, `createInvoice()` (đều ở `lib/actions/students.ts`
  và `invoices.ts`, đã phân quyền admin+sale sẵn) — KHÔNG tự viết luồng lưu
  trữ song song riêng.
- Việc tự động cấp tài khoản đăng nhập cho học sinh ngay lúc chốt đơn: **cố ý
  chưa làm sẵn**, để người code Sale tự quyết khi xây (xem AGENTS.md Mục 9
  điểm 5 để biết đầy đủ lý do + cách làm nếu muốn, tái dùng
  `createAccountByAdmin()` đã có UI mẫu ở `app/admin/accounts`).

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)
