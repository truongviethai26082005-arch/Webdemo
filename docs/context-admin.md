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

## Phiên 2026-09-16: Cập nhật thẻ Công Nợ & Khối Cảnh Báo Vận Hành trên Dashboard Tổng Quan

- **Thẻ KPI "CÔNG NỢ CHƯA THU" trên Dashboard (`app/admin/dashboard/dashboard-client.tsx`):**
  - Chuyển thành `<Link href="/admin/finance?tab=students&filter=debt">`.
  - Tiêu đề: `CÔNG NỢ CHƯA THU`.
  - Dòng phụ: `[X khoản nợ • Bấm để xem danh sách]` (xóa cụm "xử lý / xóa nợ").
  - Giá trị tổng nợ: `stats.unpaidDebt` tính toán từ dữ liệu thực tế.

- **Tự động lọc công nợ tại trang Tài chính (`app/admin/finance/`):**
  - Cập nhật `app/admin/finance/page.tsx` và `finance-client.tsx`: hỗ trợ query params `tab=students` và `filter=debt`. Khi có `tab=students`, tự động mở Tab "Tài chính Học viên" (`ledger`).
  - Cập nhật `components/finance/customer-ledger-table.tsx`: khi nhận `filter=debt`, tự động kích hoạt bộ lọc `[ Nợ / Âm buổi ]`, chỉ hiển thị học sinh có nợ (`st.currentDebt > 0 || st.totalBalanceSessions <= 0`). Bấm `[ Tất cả ]` sẽ xóa `filter` khỏi URL và hiển thị lại toàn bộ học viên.

- **Thay thế "Cảnh báo học phí" thành "CẢNH BÁO VẬN HÀNH":**
  - Xóa bỏ khối "Cảnh báo học phí" cũ (chăm sóc học phí thuộc nghiệp vụ Sale).
  - Thêm khối `CẢNH BÁO VẬN HÀNH` quét từ dữ liệu thật:
    1. Lớp chưa có giáo viên (`!cls.teacher_id && !cls.teacherId && !cls.teacher?.id && ...`).
    2. Lớp chưa xếp phòng (`!cls.room || cls.room === 'Chưa xếp' || cls.room === 'Chưa xếp phòng'`).
    3. Ca học hôm nay kết thúc mà chưa điểm danh (`todaySessions` đã kết thúc dựa theo giờ kết thúc/bắt đầu nhưng chưa hoàn tất điểm danh).
  - Có link điều hướng nhanh đến chi tiết từng lớp học (`/admin/classes/[id]`).
  - Nếu không có cảnh báo nào, hiển thị trạng thái an toàn chuẩn:
    `<div className="p-4 text-center text-sm text-slate-500">Hệ thống vận hành ổn định. Các lớp học đều đã đủ giáo viên, phòng học và hoàn tất điểm danh.</div>`.
  - Tuân thủ Điều 4: Không mock/fallback data ảo.
