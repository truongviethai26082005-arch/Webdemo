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

## Đặc tả luồng nghiệp vụ Phễu Tuyển sinh (chốt với chủ dự án ngày 2026-09-14)

**Luồng tổng quát:**
```
Học sinh điền form đăng ký (hoặc Sale nhập tay hộ) → dữ liệu vào ĐẦU phễu
  → đi qua các giai đoạn chăm sóc trong phễu
  → cuối phễu, học sinh đồng ý chốt học
  → tùy lớp/hình thức học (theo buổi hay theo khóa) → tạo mã QR chuyển khoản
    (số tiền + nội dung chuyển khoản cá nhân hóa riêng cho từng hóa đơn)
  → khi khách chuyển khoản thành công → hệ thống tự động ghi nhận
  → đẩy dữ liệu sang Admin & Teacher (nếu đã có lớp phù hợp)
```

### Quyết định kiến trúc quan trọng: TÁCH "xác nhận đã thanh toán" khỏi "xếp vào lớp cụ thể"

Đây là điểm mấu chốt để xử lý đúng 2 tình huống mà chủ dự án đặt ra: chưa có
lớp phù hợp, hoặc lớp chưa đủ sĩ số để khai giảng. **KHÔNG gộp chung 2 bước
này làm 1** như quy tắc cũ (mục 9 AGENTS.md) mặc định — quy tắc cũ giả định
luôn có sẵn `class_id` để gọi `enrollStudentInClass()` ngay, thực tế không
phải lúc nào cũng đúng.

**Bước 1 — Ghi nhận thanh toán (LUÔN LUÔN làm ngay, bất kể đã có lớp hay chưa):**
Ngay khi khách chuyển khoản thành công (xác nhận tự động hoặc Sale xác nhận
tay), BẮT BUỘC:
1. Gọi `createStudent()` (đã phân quyền admin+sale, `lib/actions/students.ts`)
   để tạo bản ghi học sinh thật.
2. Gọi `createInvoice()` (đã phân quyền admin+sale, `lib/actions/invoices.ts`)
   để ghi nhận hóa đơn đã thanh toán — đảm bảo doanh thu/công nợ trên Admin
   luôn chính xác NGAY LẬP TỨC, không phụ thuộc việc đã xếp lớp hay chưa.
3. KHÔNG tự viết luồng lưu trữ riêng cho 2 bước trên — tái sử dụng đúng 2 hàm
   có sẵn.

**Bước 2 — Xếp vào lớp cụ thể (CHỈ làm khi đã có lớp phù hợp VÀ còn chỗ trống):**
- Nếu đã có lớp đúng môn/đúng khung giờ và còn chỗ (`enrollment_count <
  max_students`) → gọi ngay `enrollStudentInClass()` (đã phân quyền
  admin+sale, `lib/actions/students.ts`) với đúng `class_id`.
- Nếu CHƯA có lớp phù hợp, hoặc lớp hiện có đã đầy → học sinh ở trạng thái
  **"đã đóng tiền, chờ xếp lớp"**. Trạng thái này lưu trong dữ liệu RIÊNG của
  Sale (bảng `leads`/`conversions` tương lai, ví dụ cột `class_id` tạm để
  trống hoặc 1 cột `status = 'paid_pending_class'`) — KHÔNG tạo `enrollments`
  giả hay `class_id` giả để "cho có".
- Khi Admin mở lớp mới hoặc có chỗ trống ở lớp cũ, quay lại gọi
  `enrollStudentInClass()` cho những học sinh đang chờ — có thể làm thủ công
  (Admin/Sale chọn tay từ danh sách chờ) hoặc Sale tự xây thêm 1 nút "Xếp lớp
  ngay" cho danh sách chờ này khi đã sẵn lớp.

**Báo cáo cần có cho Admin (đọc tổng hợp, KHÔNG thao tác trực tiếp dữ liệu
Sale — đúng nguyên tắc "1 tính năng 1 chủ sở hữu" mục 6 AGENTS.md):** 1 mục
"Học sinh chờ xếp lớp" — suy ra bằng cách lọc `students` có hóa đơn
(`invoices.status = 'paid'`) nhưng CHƯA có `enrollments` đang active tương
ứng. Không cần Sale "đẩy" dữ liệu này qua Admin — Admin tự query ra được từ
2 bảng `students`/`invoices` mà Sale đã ghi đúng cách ở Bước 1.

### Xử lý "lớp chưa đủ sĩ số để khai giảng" — KHÔNG cần đổi schema

Hệ thống hiện tại đã tự nhiên hỗ trợ sẵn tình huống này, không cần thêm cột
trạng thái mới: `lib/utils/session-generator.ts` (`ensureSessionsGenerated`)
chỉ tự sinh buổi học (`class_sessions`) khi lớp đã có `start_date`. Vì vậy:
- Admin có thể tạo lớp và cho học sinh ghi danh (đếm sĩ số) **trước khi** đặt
  ngày khai giảng.
- Khi nào đủ sĩ số, Admin mới đặt/xác nhận `start_date` — lúc đó hệ thống mới
  bắt đầu sinh buổi học, Teacher mới thấy lớp xuất hiện trong "Lịch dạy học".
- Trước khi có `start_date`, lớp vẫn hiển thị bình thường ở trang Quản lý Lớp
  học của Admin (với sĩ số đang ghi danh), chỉ là chưa có buổi học nào — đây
  là tín hiệu tự nhiên cho "đang chờ đủ sĩ số", không cần thêm cờ trạng thái
  riêng trừ khi sau này team thấy cần hiển thị rõ hơn (badge "Chờ đủ sĩ số"
  trên UI — có thể thêm sau, không chặn việc code Sale bây giờ).

### Việc CHƯA giải quyết — cần 1 buổi thiết kế riêng khi thực sự bắt tay làm

**Tích hợp xác nhận thanh toán tự động qua ngân hàng** (đối chiếu biến động số
dư để tự phát hiện khách đã chuyển khoản, khớp đúng mã QR/nội dung chuyển
khoản cá nhân hóa) là bài toán tích hợp riêng, khá phức tạp — cần dịch vụ
trung gian đọc được biến động số dư ngân hàng (ví dụ Casso hoặc tương tự),
KHÔNG tự nhiên có sẵn chỉ vì xây xong phễu. Chưa thiết kế chi tiết, để dành
làm riêng khi bắt tay vào phần này.

**Bài học cần nhớ khi xây cơ chế xác nhận thanh toán (tự động hoặc thủ công):**
đúng như bug đã tìm thấy và vá ở `markInvoiceAsPaid()` ngày 2026-09-13 (xem
AGENTS.md Mục 7) — 1 webhook/thao tác xác nhận thanh toán có thể bị gọi 2 lần
cho cùng 1 giao dịch (webhook ngân hàng gửi trùng, hoặc Sale bấm xác nhận 2
lần). BẮT BUỘC kiểm tra hóa đơn CHƯA ở trạng thái `paid` trước khi xử lý —
không giả định "gọi 1 lần duy nhất".

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)
