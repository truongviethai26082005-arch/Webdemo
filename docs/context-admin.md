Nhật ký làm việc — Phân hệ Quản trị (Admin)
> File này CHỈ dành cho người phụ trách phân hệ Admin ghi lại tiến độ, quyết
> định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác sửa
> file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án: sự cố bảo mật đã
>   xử lý, quyết định kiến trúc lớn, trạng thái Git — áp dụng cho cả 4
>   phân hệ, không chỉ riêng Admin.

## Việc còn treo dành riêng cho Admin (chuyển từ docs/context-handoff.md Mục 15.2 ngày 2026-09-13)

- 4 dialog bỏ qua `result.error` từ Server Action, ghi dữ liệu giả vào store
  khi thất bại: `class-dialog.tsx`, `teacher-dialog.tsx` (còn ghi email giả),
  `student-dialog.tsx` (còn reset nhầm số buổi về 12), `add-student-dialog.tsx`.
- Đổi giáo viên phụ trách hoặc đổi lịch học của 1 lớp (`updateClass`) không
  đồng bộ lại `class_sessions` đã sinh trước đó.
- Công thức lương "Thưởng − Phạt" chưa persist thật — `payroll-tab.tsx` chỉ
  lưu tạm ở state, mất khi F5.
- `getFinancialHubData`/`analytics.ts` cộng dồn `balance_sessions` xuyên suốt
  các lớp của 1 học sinh thay vì tính riêng từng lượt ghi danh.
- Vài chỗ tính "hôm nay" bằng giờ UTC thay vì giờ Việt Nam.
- `payroll-tab.tsx`: đổi tháng/năm trên bộ lọc không gọi lại dữ liệu.
- `getCenterBankSettings()` trả tài khoản ngân hàng giả khi query lỗi.
- Vài hằng số mock chưa dọn trong `analytics-client.tsx`.

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-14 — Hoàn thiện "Học sinh đã có tài khoản đăng nhập" ở trang Quản lý Tài khoản

Chủ dự án test trang `/admin/accounts` phát hiện phần "Học sinh đã có tài
khoản đăng nhập" chỉ hiện tên dạng badge tĩnh, không xem được email đăng
nhập, không thao tác gì được (không đổi được mật khẩu khi học sinh quên).
Đã hoàn thiện:
- Thêm `getStudentAccountsOverview()` (`lib/actions/accounts.ts`) — trả về
  danh sách học sinh đã có tài khoản kèm email thật (cross-reference qua
  `adminClient.auth.admin.listUsers()`, giống cách `getAllAccounts()` đã làm).
- Thêm `resetStudentPassword()` (`lib/actions/students.ts`) — đổi mật khẩu
  1 học sinh theo `studentId`, bắt buộc mật khẩu mới ≥ 8 ký tự.
- Cập nhật `accounts-client.tsx`: thay badge tĩnh bằng bảng có cột Email +
  SĐT phụ huynh + nút "Đổi mật khẩu" (dialog mới
  `components/accounts/reset-student-password-dialog.tsx`, có check
  `result.error` đúng chuẩn Mục 3 AGENTS.md).

**Quyết định kiến trúc quan trọng đi kèm (đã xác nhận với chủ dự án):** Sale
cũng được cấp quyền **quản lý đầy đủ** tài khoản học sinh (xem, tạo, đổi mật
khẩu) — không chỉ Admin — vì Sale là người trực tiếp làm việc/hỗ trợ học
sinh hằng ngày. Đã nới quyền `createAccountByAdmin()` (`lib/actions/auth.ts`)
để Sale gọi được, nhưng CHỈ khi tạo tài khoản role="student" (chặn cứng ở
tầng server, Sale không bao giờ tạo được tài khoản Admin/Teacher/Sale qua
hàm này). `getStudentAccountsOverview()` và `resetStudentPassword()` cũng
đã guard `["admin","sale"]` sẵn. Chi tiết đầy đủ cho Sale ở
`docs/context-sale.md`. **Việc còn lại (không chặn ai):** Sale hiện CHƯA có
UI riêng để dùng 3 hàm này (chưa build trang Sale) — đây là việc của người
code Sale khi họ xây màn hình quản lý học sinh của họ, không phải việc của
Admin.
