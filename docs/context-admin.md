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

## Việc còn treo dành riêng cho Admin (Cập nhật 2026-09-16)

- 3 dialog cần kiểm tra `result.error` từ Server Action để không ghi dữ liệu giả khi thất bại: `class-dialog.tsx`, `teacher-dialog.tsx` (còn ghi email giả khi lỗi), `student-dialog.tsx`.
- Đổi giáo viên phụ trách hoặc đổi lịch học của 1 lớp (`updateClass`) chưa tự động đồng bộ lại `class_sessions` đã sinh trước đó.
- Công thức lương "Thưởng − Phạt" chưa persist vào Database — `payroll-tab.tsx` chỉ lưu tạm ở state, mất khi F5.
- `payroll-tab.tsx`: Đổi tháng/năm trên bộ lọc chưa gọi lại dữ liệu động từ server.
- `getCenterBankSettings()` trả tài khoản ngân hàng giả khi query bị lỗi.
- Chuẩn bị sẵn dữ liệu/báo cáo Admin để hiển thị dữ liệu tổng hợp từ Sale (Tuyển sinh) và Student khi 2 phân hệ này đi vào hoạt động.

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-23 — Triển khai Widget Chatbot AI Vận Hành (Cody AI Mascot) & Trang Báo Cáo Phân Tích Chi Tiết Theo Tuần/Tháng (`/admin/analytics`)

- **Bối cảnh & Mục tiêu:**
  - Nâng cấp tính năng Analytics cho Admin với Trợ lý AI Cody đóng vai Cố vấn Quản trị & Vận hành cấp cao.
  - Nút "Tổng hợp báo cáo" trên thanh điều khiển cho phép mở ra ngay **Trang Báo Cáo Phân Tích Chi Tiết Toàn Diện** do AI tổng hợp theo từng **Tuần** hoặc từng **Tháng** được chọn.
  - Nút "In Báo Cáo / Xuất PDF" thuần túy thực hiện lệnh in trực tiếp (`window.print()`) chuẩn khổ A4 dọc.
- **Các thành phần triển khai:**
  1. **Backend Server Actions (`lib/actions/ai-analytics.ts`):**
     - `getOperationalAnalyticsSnapshot(month, year, week)`:
       - Phân quyền fail-closed `requireRole(["admin"])`.
       - Lọc theo khoảng ngày chính xác của Tuần (Cả tháng, Tuần 1..5) theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7).
       - Bóc tách doanh thu thực thu (`invoices.status = 'paid'`), thù lao giáo viên (`class_sessions.status = 'completed'` × `profiles.salary_per_session`), lợi nhuận gộp dạy học.
       - Danh sách học viên âm buổi (`balance_sessions < 0`) và học viên sắp hết buổi (`0 <= balance_sessions <= 2`).
       - Thống kê vận hành từng lớp học (sĩ số đang học, ca dạy xong, ca hủy, số lượt vắng không phép).
       - 100% truy vấn đọc (Read-only), tuyệt đối không chỉnh sửa cơ sở dữ liệu.
     - `generateAIExecutiveReport({ snapshot })`:
       - Lập Báo cáo Phân tích Tổng hợp Chi tiết 4 phần (Bức tranh tài chính, Điểm nghẽn học viên & Công nợ, Hiệu suất từng lớp học, Kế hoạch hành động 4-5 bước cho tuần/tháng tới) qua Google Gemini REST API (`gemini-1.5-flash`). Có cơ chế sinh báo cáo tự động từ số liệu thực tế khi chưa cấu hình `GEMINI_API_KEY`.
     - `askAIAnalyticsChatbot({ messages, snapshot })`:
       - Chatbot đối thoại chuyên sâu qua Google Gemini REST API đóng vai Cố vấn Vận hành.
  2. **Linh vật Chatbot nổi (`components/analytics/analytics-chat-mascot.tsx`):**
     - Nút Mascot nổi góc phải dưới (`fixed bottom-6 right-6 z-50`), badge online xanh ngọc, tooltip gợi ý câu hỏi theo tháng.
     - Khung chat `w-[420px] h-[580px]`, tin nhắn mở đầu tóm tắt số liệu thật của tháng, 3 quick chips bấm nhanh, input bar hỗ trợ Enter và loading state. Có nút chuyển nhanh sang in báo cáo.
  3. **Trang Báo Cáo Phân Tích Chi Tiết & In Ấn A4 (`components/analytics/analytics-print-report.tsx`):**
     - Layout A4 chuẩn văn phòng, `@media print` tự động ẩn thanh điều hướng, nút bấm.
     - 5 khối nội dung: Chỉ số tài chính, Bảng công nợ, Bảng hiệu suất từng lớp học, Khối đánh giá & kế hoạch hành động từ Cody AI, Chữ ký phê duyệt 2 bên (Người lập báo cáo & Giám đốc trung tâm).
     - Bộ lọc Tuần/Tháng/Năm trực tiếp trên trang báo cáo và nút "Cập nhật AI".
     - Nút "In Báo Cáo / Xuất PDF" gọi `window.print()` trực tiếp.
  4. **Tích hợp Dashboard Analytics (`app/admin/analytics/analytics-client.tsx`):**
     - Nút bấm nổi bật "Tổng hợp báo cáo" mở trang báo cáo chi tiết AI.
     - Bộ chọn thời gian: Tuần (Cả tháng, Tuần 1..5), Tháng (1..12), Năm (2024..2027).
     - Nút "In Báo Cáo / Xuất PDF" in trực tiếp.
     - Dọn dẹp mock data tĩnh `DEFAULT_AI_ADVISOR`.
     - Nhúng Mascot Cody AI.
  5. **Mẫu biến môi trường (`.env.example`):** Thêm dòng gợi ý `GEMINI_API_KEY=`.
- **Thẩm định an toàn & Kiểm tra kỹ thuật:**
  - Toàn bộ thay đổi nằm trong phân hệ Admin, hoàn toàn không ảnh hưởng đến `teacher`, `sale`, `student` hay shared core logic.
  - `npx tsc --noEmit` đạt exit code **0**.

### 2026-09-22 — Rà soát tác động của thay đổi `classes.ts`/`students.ts` tới Teacher/Sale trước khi merge (chưa sửa code, chỉ audit)

- Bối cảnh: các thay đổi ở phiên 2026-09-17 bên dưới (đồng bộ enrollments active-only, auto-backfill trong `getStudents()`) vẫn đang ở trạng thái **uncommitted** trên nhánh `feature/admin`, chưa merge về `develop`. `lib/actions/classes.ts` và `lib/actions/students.ts` thuộc Nhóm 2 (dùng chung nhiều phân hệ — mục 8 AGENTS.md), nên trước khi merge đã grep lại codebase thật để xác minh phạm vi ảnh hưởng (không chỉ tin vào nhật ký cũ, đúng tinh thần mục 11.8).
- Xác minh được:
  - **`getClassesByTeacher()`** được gọi trực tiếp ở 4 trang phân hệ Teacher: `app/teacher/classes/page.tsx`, `assignments/page.tsx`, `resources/page.tsx`, `grading/page.tsx`. Sau khi lọc chỉ giữ enrollment `status === 'active'`, giáo viên sẽ không còn thấy học sinh `paused`/`dropped` trong danh sách lớp mình dạy, và `enrollment_count` đổi nghĩa (trước: tổng số bản ghi enrollment; nay: chỉ active).
  - **`getStudents()`** được Sale gọi trực tiếp ở `app/sale/feedback/page.tsx` và `app/sale/accounts/page.tsx`. Cơ chế auto-backfill enrollments mới thêm (hardcode `balance_sessions: 12`) sẽ tự chạy như side-effect ghi DB ẩn mỗi khi Sale chỉ đơn thuần tải trang xem danh sách học sinh — vi phạm mục 11.1 (không tự bịa số liệu mặc định) và biến 1 hàm đọc thành hàm có ghi ẩn.
  - `getClassById()`, `getClasses()` chỉ dùng trong Admin — an toàn. `createStudent()`, `deleteStudent()` thay đổi nhỏ, rủi ro thấp. `enrollStudentInClass()` (thêm `status: "active"`) cần lưu ý vì đây là hàm mục 9 AGENTS.md quy định Sale **bắt buộc** phải tái sử dụng khi chuyển đổi Lead → Học sinh.
- **Việc còn treo — bắt buộc trước khi merge `feature/admin` → `develop`:**
  1. Báo trong nhóm theo đúng mẫu mục 8 AGENTS.md cho 2 file `classes.ts`/`students.ts`, nhắc rõ người phụ trách Teacher và Sale kiểm tra lại sau khi pull `develop` mới (Teacher: học sinh `dropped` có còn hiển thị đúng chỗ cần không; Sale: `getStudents()` có âm thầm tạo enrollment sai số buổi không).
  2. Cân nhắc bỏ đoạn auto-backfill hardcode `balance_sessions: 12` ra khỏi `getStudents()` (nên tách thành 1 action riêng có xác nhận thủ công, thay vì tự chạy ẩn trong hàm đọc), hoặc ít nhất đổi thành cảnh báo rõ ràng thay vì bịa số, đúng mục 11.1.

### 2026-09-23 (Claude) — PR #10 đã merge trước khi hoàn tất 2 việc còn treo ở trên; đã vá 1 trong 2 sau khi merge

Bối cảnh: PR #10 (`feature/admin` → `develop`) đã được merge trước khi 2 việc còn treo ở mục audit 2026-09-22 phía trên được xử lý xong. Đã đọc lại trực tiếp code thật trên `develop` sau merge để đánh giá thiệt hại thực tế (không suy đoán từ báo cáo cũ):

- **`getStudents()` auto-backfill `balance_sessions: 12` — XÁC NHẬN KHÔNG PHẢI MỐI NGUY ĐANG HOẠT ĐỘNG.** Đoạn code này kiểm tra `st.class_id` — nhưng bảng `students` thật **không có cột `class_id`** (đã tra `information_schema.columns` để xác nhận), nên điều kiện kích hoạt luôn sai, đoạn backfill không bao giờ tự chạy với dữ liệu thật hiện tại. Vẫn là code chết nên dọn (nếu sau này ai lỡ thêm cột `class_id` sẽ tự kích hoạt lại), nhưng KHÔNG khẩn cấp — để dành đợt dọn dữ liệu giả tiếp theo, chưa xử lý ngay.
- **`updateStudent()` cascade status xuống mọi enrollments — ĐÃ VÁ.** Xác nhận đây là lỗi thật, sai chiều: dự án đã có sẵn cơ chế đúng (`syncStudentStatusFromEnrollments()`, `lib/utils/enrollment-status.ts` — tính status TỔNG QUÁT của học sinh TỪ các enrollments), trong khi đoạn code mới lại ép NGƯỢC LẠI (status học sinh → xuống mọi enrollments), có thể vô tình "hồi sinh" 1 lượt ghi danh đã nghỉ thật khi Admin chỉ sửa thông tin không liên quan (VD: sửa SĐT). Đã xóa hẳn đoạn cascade sai chiều này khỏi `updateStudent()` — không cần thay thế bằng gì, vì hướng đồng bộ đúng đã có sẵn ở nơi khác rồi.
- `getClassesByTeacher()` (lọc active-only) và `enrollStudentInClass()` (thêm `status: "active"`) — xác nhận AN TOÀN, không cần sửa: khớp đúng quy ước đã dùng khi xây tính năng Bài tập của Teacher (2026-09-22), và là cải thiện thật (trước đây có thể tạo enrollment thiếu status).

**Kết luận sau vá:** Teacher/Sale không bị ảnh hưởng tiêu cực nào còn sót lại từ PR #10. Bài học quy trình: lần này may mắn vì các thay đổi khác đều an toàn — nhưng đây là ví dụ thực tế về lý do phải đợi xác nhận xong trước khi bấm "Merge", không tự ý merge khi còn mục "bắt buộc trước khi merge" chưa xử lý xong (xem mục audit 2026-09-22 phía trên).

### 2026-09-17 — Sửa triệt để lỗi bất đồng bộ sĩ số lớp học & Đồng bộ dữ liệu liên kết Học sinh - Lớp học (Single Source of Truth)

- **Đồng bộ dữ liệu liên kết & Tự động Backfill (`lib/actions/students.ts`):**
  - **`getStudents()`**: Bổ sung `status` vào câu select `enrollments`. Thêm cơ chế tự động kiểm tra & tạo mới/upsert bản ghi `enrollments` (`status = 'active'`) cho bất kỳ học sinh nào có gán lớp nhưng thiếu bản ghi trong bảng `enrollments`.
  - **`createStudent()` & `enrollStudentInClass()`**: Đảm bảo các bản ghi `enrollments` luôn được khởi tạo kèm `status: 'active'`.
  - **`updateStudent()`**: Tự động đồng bộ trạng thái `status` ('active' hoặc 'dropped') sang toàn bộ bản ghi `enrollments` của học sinh tương ứng khi Admin đổi trạng thái học sinh.
- **Đồng nhất nguồn tính sĩ số từ Database Supabase (`lib/actions/classes.ts`):**
  - **`getClasses()` / `getClassById()` / `getClassesByTeacher()`**: Query động bảng `enrollments` liên kết `(id, student_id, status)` và lọc chỉ đếm các bản ghi `status === 'active'` (bỏ qua học sinh đã nghỉ / dropped).
  - Trả về thuộc tính `enrollment_count = activeEnrollments.length` và mảng `enrollments` chuẩn.
- **Chuẩn hóa Giao diện hiển thị (`classes-client.tsx`, `class-detail-client.tsx`, `students-client.tsx`):**
  - **`/admin/classes`**: Thẻ danh sách lớp đọc trực tiếp `actualCount` từ `enrollments` active. Khi sĩ số bằng 0, hiển thị chính xác `0 / 15 HS (0%)` với progress bar 0% và badge `"⚪ Chưa có học sinh"`.
  - **`/admin/classes/[id]`**: Thẻ "SĨ SỐ LỚP" và bảng danh sách học sinh dùng chung `actualCount` thực tế.
  - **`/admin/students`**: Cột "Lớp đang theo học" ưu tiên lọc và hiển thị lớp theo bản ghi `enrollments` đang hoạt động (`status === 'active'`).
- **Kiểm tra kỹ thuật:** `npx tsc --noEmit` đạt 0 lỗi type/import.

### 2026-09-16 — Tổng hợp hoàn thiện Phân hệ Admin: Tái cấu trúc Dashboard, Tinh giản Trạng thái Học sinh & Dọn dẹp Luồng thủ công

- **1. Tinh giản Luồng Ghi danh & Dọn dẹp Trang Chi tiết Lớp học (`/admin/classes/[id]`):**
  - **Gỡ bỏ nút thủ công:** Đã xóa bỏ hoàn toàn nút `+ Thêm Học Sinh Vào Lớp` và nút `Tạo Buổi học Lớp này` tại header trang chi tiết lớp học (`class-detail-client.tsx`). Quy trình đưa học sinh vào lớp sẽ đi qua luồng Ghi danh & Chuyển đổi chuẩn hóa của phân hệ Tuyển sinh (Sale / Admissions).
  - **Dọn dẹp Dead Code & Modal:** Loại bỏ state `isAddStudentOpen`, `isSessionOpen`, biến `alreadyEnrolledStudentIds`, modal `<AddStudentDialog />`, modal `<CreateSessionDialog />` và các import thừa (`AddStudentDialog`, `CreateSessionDialog`, `UserPlus`, `Plus`, `CalendarCheck`). Loại bỏ triệt để lỗi ghi đè state rác được ghi nhận tại Mục 15.2 (`context-handoff.md`).
  - **Cập nhật Empty State:** Khi lớp chưa có học sinh (`actualCount === 0`), render thông báo chuẩn: `"Lớp học hiện chưa có học sinh nào. Học sinh sẽ được tự động thêm vào đây khi hoàn tất Ghi danh tại phân hệ Tuyển sinh."`

- **2. Tinh giản Hệ thống Trạng thái Học sinh (`/admin/students`):**
  - **Loại bỏ trạng thái "Tạm dừng" (`paused`):** Quy chuẩn toàn bộ phân hệ chỉ dùng 2 trạng thái: `🟢 Đang học` (`active` / `enrolled`) và `🔴 Đã nghỉ` (`dropped` / non-active).
  - **Cập nhật UI & Dialog:** Loại bỏ tùy chọn `paused` ở dropdown bộ lọc trạng thái toolbar, menu đổi trạng thái nhanh tại bảng học sinh (`students-client.tsx`), và dropdown trạng thái trong form sửa học sinh (`student-dialog.tsx`).
  - **Chuẩn hóa Badge:** `active`/`enrolled` hiển thị badge xanh `bg-emerald-50 text-emerald-700 border-emerald-200` ("Đang học"); tất cả trạng thái khác hiển thị badge đỏ `bg-rose-50 text-rose-700 border-rose-200` ("Đã nghỉ").

- **3. Tái cấu trúc Bố cục Dashboard Admin & Khắc phục lỗi Nhân bản Ca học:**
  - **Quick Nav & Layout:** Thu gọn Quick Nav header bar (gap-1.5, px-2.5 py-1.5, text-xs font-medium, w-4 h-4 icons) vừa khít 1 hàng ngang không bị tràn viền màn hình laptop ở 100% zoom.
  - **Zero-Mock Data (Điều 4):**
    - Hàng 4 thẻ KPI chính (`Tổng số học sinh`, `Lớp học đang mở`, `Công nợ chưa thu`, `Doanh thu tháng này`) chuẩn hóa `text-2xl font-bold text-slate-900 tracking-tight`, lấy dữ liệu DB thật.
    - Flat Metric Strip 3 thẻ (`Doanh thu đã thu`, `Dự tính lương GV`, `Lợi nhuận gộp`) đặt phẳng ngay dưới KPI.
    - Cột Trái Cảnh báo Vận hành (Grid 6/12): Quét dữ liệu thật (lớp thiếu phòng, học sinh nợ/sắp hết buổi, ca đã kết thúc chưa điểm danh). Nếu 0 sự vụ, render Empty State trung thực: `"Hiện tại không có sự vụ vận hành nào cần xử lý. Hệ thống hoạt động bình thường."`
  - **Sửa lỗi Nhân bản Ca học (207 ca / 69 trang):**
    - Tính ngày hôm nay theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh` -> `YYYY-MM-DD`).
    - Lọc truy vấn `class_sessions` đúng `session_date = today` và `status !== 'cancelled'`.
    - Chống trùng lặp theo Key `${class_id}_${session_date}_${start_time}` ở cả `lib/actions/dashboard.ts` và `dashboard-client.tsx`.
    - Tích hợp phân trang 3 ca/trang với bộ điều hướng `◀ Trang X / Y ▶` (vô hiệu hóa nút khi <= 3 ca, ẩn thanh khi 0 ca).

- **4. Áp dụng Hệ thống Design Tokens & Kiểm tra Kỹ thuật:**
  - Áp dụng bộ Design Tokens chuẩn toàn phân hệ Admin (Card Title `text-xs font-semibold uppercase`, Metric Value `text-2xl font-bold text-slate-900`, Table Header `bg-slate-50/80 text-slate-600 uppercase`).
  - Kiểm tra biên dịch TypeScript `npx tsc --noEmit` đạt mã **0 (sạch lỗi type/import)**.

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

## Phiên 2026-09-22 (Claude): Nối luồng dữ liệu Sale→Admin, vá 3 bug tầng tiền/số liệu

Bối cảnh: chủ dự án yêu cầu rà soát toàn bộ 4 phân hệ + nối các luồng dữ liệu
còn thiếu giữa chúng. Phần liên quan Admin:

- **Trang mới `/admin/admissions-report`** ("Báo cáo Tuyển sinh", menu sidebar
  mới) — Admin lần đầu xem được báo cáo tổng hợp từ Sale: KPI phễu, doanh thu
  theo nguồn/nhân viên Sale (30 ngày), danh sách học sinh chờ xếp lớp, tổng
  quan Phản ánh & Góp ý. **Chỉ xem, không thao tác** (đúng nguyên tắc "1 tính
  năng 1 chủ sở hữu" — file mới `app/admin/admissions-report/*`, tái dùng
  100% Server Action Sale đã có sẵn (`getAdmissionsKpiStats`,
  `getAdmissionsReportData`, `getWaitingListStudents`, `getFeedbackKpiStats`),
  không viết logic đọc dữ liệu Sale mới.
- **`components/invoices/create-invoice-dialog.tsx`**: sửa lỗi ghi "đã thu
  tiền" vào UI/store TRƯỚC khi gọi Server Action, lỗi thật bị nuốt bằng
  try/catch rỗng — Admin có thể tưởng đã thu tiền dù `createInvoice()` thất
  bại thật. Đã đảo thứ tự: gọi server trước, chỉ cập nhật UI khi có
  `success` thật, hiện `result.error` nếu thất bại.
- **`app/admin/finance/finance-client.tsx`**: dialog "Tạo Phiếu Thu" từng ưu
  tiên `globalStudents` (state cũ trong trình duyệt/localStorage) hơn
  `studentsRaw` (dữ liệu thật mới nhất từ server) khi chọn học sinh — ngược
  với cách `students-client.tsx`/`classes-client.tsx` đã làm đúng. Đã sửa lại
  đúng thứ tự ưu tiên.
- **`getCenterBankSettings()` (`lib/actions/settings.ts`, Nhóm 2)**: trước
  đây khi lỗi/thiếu dữ liệu sẽ fallback về 1 tài khoản ngân hàng hardcode
  (`DEFAULT_CENTER_BANK_SETTINGS`) — nay trả `null` thật sự, không còn bịa.
  **Nếu Admin tự viết thêm màn hình nào dùng `getCenterBankSettings()`, bắt
  buộc tự kiểm tra `null` và hiện "Chưa cấu hình tài khoản ngân hàng"** —
  không được giả định luôn có dữ liệu (xem cách `components/sale/conversion-checkout-modal.tsx`
  đã làm để tham khảo pattern).
- **"Chi phí cố định" ở `/admin/analytics`**: hết bịa cứng 6.500.000đ/tháng.
  Thêm cột `center_settings.fixed_cost` (nullable — `null` = chưa cấu hình).
  Khi chưa cấu hình, trang hiện banner vàng "Chưa cấu hình" kèm ô nhập trực
  tiếp ngay trên trang (gọi `updateCenterFixedCost()` mới trong
  `lib/actions/settings.ts`, admin-only) — **cần Admin tự vào `/admin/analytics`
  nhập số chi phí cố định thật 1 lần** để "Lợi nhuận gộp" tính đúng.
- **`lib/actions/teachers.ts` (Nhóm 2) — thống nhất lại công thức thu nhập
  giáo viên:** `getTeacherPersonalEarnings()` (Teacher tự xem) trước đây cộng
  cả những buổi thuộc lớp mình phụ trách dù người khác dạy thay hôm đó, khiến
  Teacher thấy số cao hơn số Admin thực trả qua `getTeacherPayroll()`
  (`/admin/finance` tab Lương). Đã sửa `getTeacherPersonalEarnings()` chỉ
  tính đúng buổi `class_sessions.teacher_id = chính mình` — khớp 100% với
  công thức Admin dùng để trả lương.
- `npx tsc --noEmit`: exit code 0.

