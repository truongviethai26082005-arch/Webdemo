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

### 2026-09-16 — Gỡ bỏ nút "Thêm Học Sinh Vào Lớp" thủ công tại trang Chi tiết Lớp học

- **Gỡ bỏ UI & Dọn dẹp Dead Code (`class-detail-client.tsx`):**
  - Đã loại bỏ hoàn toàn nút `+ Thêm Học Sinh Vào Lớp` tại header trang Chi tiết Lớp học (`/admin/classes/[id]`). Luồng đưa học sinh vào lớp sẽ chuyển giao chuẩn hóa qua phân hệ Tuyển sinh (Sale / Admissions).
  - Dọn dẹp hoàn toàn state `isAddStudentOpen`, biến `alreadyEnrolledStudentIds`, component modal `<AddStudentDialog />` và các import thừa (`AddStudentDialog`, `UserPlus`, `Plus`), tránh đè state cục bộ lỗi như đề cập tại Mục 15.2 (`context-handoff.md`).
  - Cập nhật Empty State khi lớp chưa có học sinh: `"Lớp học hiện chưa có học sinh nào. Học sinh sẽ được tự động thêm vào đây khi hoàn tất Ghi danh tại phân hệ Tuyển sinh."`
  - Kiểm tra biên dịch TypeScript `npx tsc --noEmit` đạt mã 0 (sạch lỗi type/import).

### 2026-09-16 — Tinh giản hệ thống trạng thái học sinh (chỉ giữ Đang học & Đã nghỉ)

- **Loại bỏ hoàn toàn trạng thái "Tạm dừng" (`paused`):**
  - Đã loại bỏ tùy chọn `paused` trong dropdown bộ lọc trạng thái tại trang Quản lý Học sinh (`/admin/students`), chỉ giữ 2 mục chọn: `🟢 Đang học` (`active` / `enrolled`) và `🔴 Đã nghỉ` (các trạng thái non-active).
  - Tinh chỉnh menu thay đổi trạng thái nhanh tại bảng danh sách học sinh (`students-client.tsx`) và dialog thêm/sửa học sinh (`student-dialog.tsx`) chỉ gồm 2 lựa chọn: `🟢 Đang học` (`active`) và `🔴 Đã nghỉ` (`dropped`).
  - Badge trạng thái hiển thị chuẩn: màu xanh lá `bg-emerald-50 text-emerald-700 border-emerald-200` cho "Đang học" và màu đỏ nhạt `bg-rose-50 text-rose-700 border-rose-200` cho "Đã nghỉ".
  - Kiểm tra biên dịch TypeScript `npx tsc --noEmit` đạt mã 0 (sạch lỗi type/enum).

### 2026-09-16 — Tái cấu trúc toàn bộ bố cục Admin Dashboard theo nguyên tắc Zero-Mock Data & Phân trang Ca học

- **Tối ưu hàng KPI Metrics & Thanh Dòng tiền (Flat Strip):**
  - Đồng bộ 4 thẻ KPI chính (`Tổng số học sinh`, `Lớp học đang mở`, `Công nợ chưa thu`, `Doanh thu tháng này`) chuẩn hóa `text-2xl font-bold text-slate-900 tracking-tight`, loại bỏ hoàn toàn fallback values cứng.
  - Chuyển khối "Dòng Tiền Vận Hành & Chi Phí Nhân Sự" thành Flat Strip gồm 3 thẻ phẳng (`Doanh thu đã thu`, `Dự tính lương GV`, `Lợi nhuận gộp`) đặt trực tiếp bên dưới 4 thẻ KPI, có nút trỏ về `/admin/finance`.

- **Cấu trúc 2 cột điều hành bên dưới (Grid 12-col: `lg:grid-cols-12 gap-6 items-start`):**
  - **Cột Trái (6/12 - Cảnh báo vận hành & Công nợ):** Chỉ hiển thị sự vụ khi có dữ liệu vi phạm thực tế từ DB (lớp chưa xếp phòng, học sinh sắp hết buổi `balance_sessions <= 2`, ca học đã kết thúc nhưng chưa điểm danh). Nếu không có sự vụ (0 sự vụ), render Empty State trung thực: `"Hiện tại không có sự vụ vận hành nào cần xử lý. Hệ thống hoạt động bình thường."`
  - **Cột Phải (6/12 - Ca học hôm nay & Điểm danh):** Chỉ lọc các ca học diễn ra trong ngày (`session_date` = hôm nay), tích hợp phân trang tinh gọn 3 ca/trang với bộ điều hướng `◀` `Trang X / Y` `▶`, giữ cố định chiều cao cột và loại bỏ các lớp không có ca học hôm nay.

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

## Phiên 2026-09-16: Thiết Lập & Áp Dụng Hệ Thống Design Tokens Đồng Bộ Toàn Diện Cho Toàn Bộ Phân Hệ Admin

- **Quy chuẩn Typography & Token áp dụng:**
  - Tiêu đề khối / Card: `text-xs font-semibold uppercase tracking-wider text-slate-500`
  - Số liệu lớn (Metric Values): `text-2xl font-bold text-slate-900 tracking-tight my-1` (**BẮT BUỘC** `text-slate-900`, tuyệt đối không dùng font chữ xanh/đỏ/vàng cho metric lớn).
  - Subtext chân thẻ: `text-xs text-slate-400 truncate`
  - Nội dung bảng: `text-sm text-slate-700 font-medium`
  - Table Header `<thead>`: `bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider`
  - Table Body `<tbody>`: `hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0`
  - Padding ô bảng: `py-3 px-4`
  - Màu icon nhận diện góc phải `w-10 h-10 rounded-xl`:
    - Đào tạo / Học sinh / Lớp học: `bg-blue-50 text-blue-600`
    - Doanh thu / Dòng tiền vào: `bg-emerald-50 text-emerald-600`
    - Chi phí / Công nợ / Cảnh báo: `bg-rose-50 text-rose-600`
    - Tiến độ / Chuyên cần: `bg-amber-50 text-amber-600`

- **Các trang & component đã rà soát và chuẩn hóa:**
  1. `/admin` (Tổng quan Dashboard): `app/admin/dashboard/dashboard-client.tsx`
  2. `/admin/classes`: `app/admin/classes/classes-client.tsx`
  3. `/admin/classes/[id]`: `app/admin/classes/[id]/class-detail-client.tsx`
  4. `/admin/students`: `app/admin/students/students-client.tsx`
  5. `/admin/teachers`: `app/admin/teachers/teachers-client.tsx`
  6. `/admin/finance`: `components/finance/customer-ledger-table.tsx`, `components/finance/transaction-logs-table.tsx`, `components/finance/payroll-tab.tsx`
  7. `/admin/analytics`: `app/admin/analytics/analytics-client.tsx`, `components/analytics/ai-advisor-header.tsx`, `components/analytics/gross-profit-card.tsx`, `components/analytics/cashflow-chart-card.tsx`
- **Kiểm tra biên dịch:** `npx tsc --noEmit` đạt code 0 (sạch lỗi type/syntax).

