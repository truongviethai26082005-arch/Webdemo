Bàn giao ngữ cảnh dự án — LMS Quản lý Trung tâm
> Tài liệu này tổng hợp toàn bộ quá trình làm việc giữa chủ dự án và Claude,
> để một AI khác (hoặc chính Claude ở phiên sau) có thể tiếp tục hỗ trợ mà
> không cần giải thích lại từ đầu. Dán toàn bộ nội dung này vào đầu phiên
> làm việc mới.
>
> ⚠️ **Đã audit lại toàn bộ tài liệu này ngày 2026-09-12 và phát hiện nhiều
> claim sai** (tên hàm không tồn tại — `createCenterUser()`; danh sách hàm
> "đã fix requireRole()" ở Mục 6 sai nhiều chỗ; hàm nói "đã xóa" nhưng thực
> tế vẫn còn; 3 trigger Database gây bug nghiêm trọng hoàn toàn không được
> nhắc tới). Các mục 4, 6, 7, 11 bên dưới đã được sửa lại cho khớp thực tế
> đã xác minh trực tiếp trên code/DB. **Luôn tự grep/đọc code hoặc truy vấn
> DB thật để xác minh trước khi tin bất kỳ claim "đã xong" nào trong tài
> liệu này** — kể cả những phần đã sửa lại, vì tài liệu vẫn do AI soạn.
1. Bối cảnh dự án
Đang xây dựng 1 website LMS quản lý trung tâm dạy thêm (giống mô hình
Slink), gồm 4 phân hệ theo role: `admin`, `teacher`, `sale`, `student`
(học sinh).
Trạng thái hiện tại: `admin` và `teacher` đang trong giai đoạn hoàn
thiện/dọn dẹp bug. `sale` và `student` chưa có route/code nào — sẽ
xây mới sau.
Cách làm việc: Chủ dự án hoàn toàn "vibe code" — không tự viết code,
giao việc cho AI coding agent khác (Antigravity IDE) thực hiện, dùng
Claude (tôi) để: soạn prompt chính xác cho Antigravity, review diff/kết
quả trả về, tư vấn kiến trúc & nghiệp vụ, phát hiện lỗi.
Mục tiêu cuối: Có 1 tầng code/dữ liệu đáng tin cậy, đủ sạch để
4 người trong team code song song 4 phân hệ mà không xung đột Git
khi cùng push code lên GitHub.
2. Tech Stack
Next.js 16.3.4 (bản canary/RC — nhiều API khác bản ổn định, cần đọc
`node\_modules/next/dist/docs/` khi dùng API mới, không code theo kiến
thức Next.js 13/14 cũ)
React 19, TypeScript
Tailwind CSS + tailwindcss-animate
shadcn/ui (dựng trên Radix UI + class-variance-authority + clsx +
tailwind-merge), config trong `components.json`
Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — backend + auth
framer-motion, lucide-react, next-themes
3. Cấu trúc thư mục
```
app/admin/{admissions,analytics,attendance,classes,dashboard,finance,
           invoices,payroll,students,teachers}
app/teacher/{assignments,attendance,classes,earnings,grading,profile,
             resources,schedule}
components/<feature>/\*.tsx (kebab-case), components/ui/ (shadcn primitives)
components/layout/{admin,teacher}-{header,sidebar}.tsx
lib/actions/<domain>.ts — Server Actions ("use server", trả về
  { error } khi lỗi hoặc { success: true, ... } / data trực tiếp khi ok)
lib/auth/guards.ts — helper phân quyền dùng chung (xem mục 5)
lib/supabase/{admin,client,proxy,server}.ts
lib/context/app-data-context.tsx — global client store (useAppData())
types/database.ts — types khớp schema Supabase
proxy.ts (gốc repo) — middleware (Next.js 16 đổi tên từ middleware.ts)
AGENTS.md, CLAUDE.md — file ngữ cảnh cho AI coding agent (đã có, xem mục 10)
```
4. Schema Database (Supabase) hiện tại
Các bảng đã có: `assignments`, `attendance`, `center\_settings`,
`class\_sessions`, `classes`, `enrollments`, `invoices`, `materials`,
`profiles`, `students`, `submissions`.
`profiles`: tài khoản nhân sự nội bộ (admin, teacher, sale — dùng
CHUNG 1 bảng), liên kết `auth.users.id`, có `role`, `salary\_per\_session`,
thông tin ngân hàng.
`students`: học sinh (đối tượng được quản lý, KHÔNG phải tài khoản đăng
nhập) — `full\_name`, `parent\_name`, `parent\_phone`, `status`
(active/paused/dropped). Kế hoạch: thêm cột `auth\_user\_id` để học
sinh có thể tự đăng nhập (link tới `auth.users`).
`classes`: `teacher\_id`, `fee\_per\_session`, `schedule` (mảng
`{day, start\_time, end\_time}`).
`enrollments`: nối student-class, có `balance\_sessions` (số buổi còn lại).
`class\_sessions`: `status`: scheduled / completed / cancelled.
`attendance`: `status`: present / absent_excused / absent_unexcused.
`invoices`: `status`: pending / paid.
QUAN TRỌNG: hiện KHÔNG có bảng `leads`/CRM nào — tính năng Tuyển
sinh (Admissions) hoàn toàn chưa có backend thật (xem mục 8).
`assignments`, `materials`, `submissions`: đã tồn tại trên Supabase
nhưng CHƯA được nối vào code — rất có thể dành cho tính năng
Tài liệu/Bài tập/Chấm điểm của Teacher (hiện đang là mock UI thuần, xem
mục 9). Khi build các tính năng này, nên kiểm tra cấu trúc cột thật của
3 bảng này trước — có thể tiết kiệm nhiều công sức thiết kế.
`UserRole`: đã mở rộng xong thành `'admin' | 'teacher' | 'sale' | 'student'`
trong `types/database.ts` (xác minh 2026-09-12). Cột `profiles.role` chỉ
CHECK cho phép `admin/teacher/sale` — role `student` không có dòng trong
`profiles`, chỉ tồn tại qua `students.auth_user_id`. Cột `students.birth_date`
và `students.note` đã thêm ngày 2026-09-12 (trước đó code đã viết sẵn logic
ghi 2 cột này nhưng cột chưa tồn tại → dữ liệu nhập vào bị âm thầm mất).
5. Mô hình phân quyền (Authorization) — đã xây dựng và áp dụng
Nguyên tắc tối cao: FAIL-CLOSED, không bao giờ FAIL-OPEN
Khi không xác định chắc chắn được danh tính/quyền, LUÔN từ chối truy cập,
không bao giờ mặc định gán 1 quyền nào đó. Nguyên tắc này đúc kết từ 3 lỗi
bảo mật nghiêm trọng đã tìm thấy và sửa (xem mục 6).
Cách xác định role sau đăng nhập (đã implement đúng thứ tự)
```
1. Tìm trong `profiles` theo user.id → nếu có, role = profiles.role
2. Không có → tìm trong `students` theo auth\_user\_id = user.id → "student"
3. Không có ở cả 2 → TỪ CHỐI, redirect /login?error=unauthorized
```
Helper dùng chung: `lib/auth/guards.ts`
Đã tạo và review kỹ, export `requireRole(allowedRoles: UserRole\[])`,
internal `resolveRole()` theo đúng thứ tự trên. Trả về discriminated
union `GuardResult`:
```typescript
{ authorized: true, context: { supabase, user, role } }
| { authorized: false, error: string }
```
Mọi Server Action xử lý dữ liệu theo role phải dùng helper này, KHÔNG
tự viết lại logic check quyền. Pattern chuẩn:
```typescript
const guard = await requireRole(\["admin", "teacher"]);
if (!guard.authorized) return <giá trị lỗi đúng kiểu return gốc của hàm>;
const { supabase, user, role } = guard.context;
// nếu cần ownership check thêm (VD: teacher chỉ sửa được lớp/session của mình):
if (role === "teacher") {
  // lấy resource liên quan, null-check trước khi so sánh field .teacher\_id === user.id
}
```
Nguyên tắc IDOR quan trọng
Next.js Server Actions là POST endpoint gọi được trực tiếp — middleware
(`proxy.ts`) chỉ chặn được điều hướng TRANG, không chặn được tham số bên
trong 1 Server Action. Mọi hàm nhận ID (studentId, teacherId, sessionId...)
và role không phải admin PHẢI tự kiểm tra ownership, không tin tham số
client truyền vào (dùng `user.id` từ session, không dùng tham số).
6. Lịch sử các lỗi bảo mật đã tìm thấy & xử lý
⚠️ Bản trước của mục này claim "đã fix hết 20 hàm CRITICAL+HIGH, 12 hàm
MEDIUM" — SAI một phần. Đã grep lại từng hàm trên code thật ngày 2026-09-12,
danh sách dưới đây là kết quả xác minh thật, không phải suy diễn.

Đã sửa xong, xác nhận đúng trên code thật (2026-09-12):
`signIn()` (auth.ts): backdoor cấp quyền admin khi email chứa "admin"
dù sai mật khẩu — đã xóa.
`getCurrentProfile()` (auth.ts): trả về profile admin giả khi lỗi —
đã sửa trả về `null`.
Logic xác định role (auth.ts, proxy.ts): mặc định gán "teacher" khi
không xác định được — đã sửa theo đúng thứ tự fail-closed ở mục 5.
IDOR ở `attendance.ts` (`getAttendanceSheet`, `saveAttendanceSheet`) và
`teachers.ts` (`getTeacherPersonalEarnings`) — có ownership check (tự viết
thủ công, không dùng `requireRole()` dùng chung, nhưng vẫn an toàn).
File `lib/supabase/proxy.ts` (code thừa từ template Supabase cũ) — đã xóa.
`createInvoice`/`enrollStudentInClass`/`createStudent`/
`convertLeadToStudentAction` (admin+sale), `markInvoiceAsPaid`/
`resolveNegativeDebt`/`cancelPendingInvoice`/`deleteInvoice`/
`updateEnrollmentBalance`/`updateStudent`/`deleteStudent`/
`removeStudentFromClass`/`createClass`/`updateClass`/`deleteClass`/
`deleteClassSession` (admin only), `createClassSession` (admin+teacher +
ownership check, status mặc định "scheduled") — đều đã dùng `requireRole()`.
`getTeacherPayroll`, `getFinancialHubData`, `getStudentLedgerHistory`,
`getAdminDashboardData`, `getAnalyticsReportData`, `getInvoices`,
`getClassById`, `getClassesByTeacher`, `getTeacherSessions` — đã dùng
`requireRole()` + ownership check khi cần.

**PHÁT HIỆN THÊM ngày 2026-09-12 (bản trước báo sai là "đã fix"):**
- `createTeacher()`, `updateTeacher()`, `getTeachers()` (teachers.ts):
  **hoàn toàn KHÔNG có kiểm tra đăng nhập/quyền nào** trước đó —
  `createTeacher()` dùng service role (`createAdminClient()`), nghĩa là
  BẤT KỲ AI (kể cả chưa đăng nhập) gọi thẳng Server Action này đều tạo
  được 1 tài khoản Teacher thật. Đã thêm `requireRole(["admin"])` cả 3.
- `getStudents()`, `getStudentById()`, `getLowBalanceStudents()`
  (students.ts): **không có kiểm tra quyền nào**, lộ toàn bộ thông tin học
  sinh. Đã thêm `requireRole(["admin","sale"])`.
- `createInvoice`, `markInvoiceAsPaid`, `cancelPendingInvoice`,
  `resolveNegativeDebt`, `deleteInvoice` (invoices.ts): **claim "đã dùng
  requireRole()" ở bản cũ là SAI — thực tế cả 5 hàm không có kiểm tra
  quyền nào**. Đã thêm `requireRole()` đúng như phân quyền đã định (admin+
  sale cho `createInvoice`, admin-only cho 4 hàm còn lại).
- `cleanUpTestPendingInvoices()`: **claim "đã xóa hoàn toàn" ở bản cũ là
  SAI — hàm vẫn còn nguyên trong `invoices.ts` tới 2026-09-12**, không có
  kiểm tra quyền, xóa hàng loạt hóa đơn theo tên. Giờ đã xóa thật.
- `app/api/test-security/route.ts`: 1 API Route công khai (không phải
  Server Action) hoàn toàn không có trong tài liệu cũ nào — nhận
  `sessionId`/`teacherId` qua query string rồi gọi thẳng
  `getAttendanceSheet`/`getTeacherPersonalEarnings`. Không khai thác được
  trực tiếp (2 hàm đó tự có ownership check) nhưng là công cụ dò IDOR bỏ
  quên trong code. Đã xóa.
- `types/database.ts` lệch schema thật (thiếu `Enrollment.status/paused_at`,
  `Class.end_date`, `Student.updated_at`) — đã bổ sung.

Nhóm LOW còn lại (không gấp): các hàm đọc danh mục chung không nhạy cảm,
`leads.ts:submitLead` cố ý public (cần thêm Captcha/rate-limit sau).

**🔴 PHÁT HIỆN NGHIÊM TRỌNG NHẤT — 3 trigger tầng Database, không nằm
trong bất kỳ file migration nào của repo, không AI trước nào nhắc tới:**
1. `on_auth_user_created` (`auth.users`) → `handle_new_user()`: mặc định
   gán `profiles.role = 'teacher'` khi tạo `auth.users` không kèm `role`
   trong metadata — **y hệt lỗi fail-open đã "fix" ở tầng code nhưng còn
   sống ở tầng DB**. Đồng thời làm hỏng việc tạo tài khoản học sinh
   (role='student' vi phạm CHECK constraint của `profiles.role` → cả giao
   dịch tạo `auth.users` bị rollback).
2. `on_attendance_balance_change` (`attendance`) → trùng lặp với logic trừ
   buổi thủ công trong `saveAttendanceSheet()` → **mỗi lần điểm danh,
   `balance_sessions` bị trừ 2 lần**.
3. `on_invoice_paid_trigger` (`invoices`) → trùng lặp với logic cộng buổi
   thủ công trong `createInvoice()`/`markInvoiceAsPaid()` → **mỗi lần xác
   nhận thanh toán, học sinh được cộng gấp đôi số buổi đã mua**.

Cả 3 đã được chủ dự án tự chạy SQL sửa ngày 2026-09-12 (file
`supabase/migrations/20260912_fix_duplicate_deduction_triggers_and_failopen_role.sql`),
đã xác minh lại trên DB thật: 2 trigger #2/#3 đã bị xóa, `handle_new_user()`
đã fail-closed đúng. **Trước thời điểm này, mọi điểm danh/thanh toán đã xử
lý trong quá khứ có thể đã bị trừ/cộng buổi sai — nên rà soát lại
`balance_sessions` của các học sinh đã có giao dịch trước ngày 2026-09-12
nếu số liệu trông bất thường.**
7. "Cuộc chiến dữ liệu giả" — đã gần như dọn xong
Phát hiện lớn nhất trong dự án: rất nhiều nơi hiển thị dữ liệu
mock/seed/demo hardcode thay vì dữ liệu thật từ Supabase, gây hàng loạt
hiện tượng: tạo lớp/học sinh xong F5 mất, xóa/sửa báo lỗi
`invalid input syntax for type uuid`, học sinh/lớp/giáo viên ảo tự xuất
hiện lại sau khi xóa.
Nguyên nhân gốc (đã tìm và sửa hết — nhóm "phải dọn ngay"):
`lib/context/app-data-context.tsx`: global client store có cơ chế
tự động nhồi lại dữ liệu mẫu vào `localStorage` khi thấy thiếu —
đây là nguyên nhân sâu xa nhất khiến bug tái diễn ở nhiều trang. Đã
xóa cơ chế này, đổi state mặc định về `\[]`, thêm bước dọn 1 lần các
ID giả còn sót trong localStorage cũ của trình duyệt.
`getTeachers()`, `getTeacherPayroll()` (teachers.ts) và
`getTeacherOptions()` (classes.ts): tự merge giáo viên mẫu
(`INITIAL\_APP\_TEACHERS`) vào kết quả trả về từ server — đã xóa.
`classes-client.tsx`, `students-client.tsx`: ưu tiên sai thứ tự (global
store mock > dữ liệu thật từ server) — đã sửa ưu tiên đúng
(server data là nguồn chân lý, global store chỉ đồng bộ theo).
`getStudents()` có fallback `generateSeedStudents()` khi bảng rỗng,
`getClassById()` có fallback `FALLBACK\_MOCK\_CLASSES` — đã xóa cả 2.
`add-student-dialog.tsx` (tab "Thêm học sinh mới" nhanh): tạo ID giả
`"std-" + Date.now()` thay vì gọi Server Action thật — đã sửa gọi
đúng `createStudent()` và dùng UUID thật trả về.
`class-detail-client.tsx`: hiển thị học sinh ảo "HS-0000" khi lớp chưa
có học sinh thật — đã sửa, giờ hiện đúng trạng thái rỗng.
Bug phụ phát sinh trong lúc sửa: lỗi React crash khi render
`class.schedule` (mảng object `{day, start\_time, end\_time}`) trực tiếp
thay vì `.map()` định dạng chuỗi — đã sửa trong
`students-client.tsx`.
Còn lại — backlog, KHÔNG cần làm ngay (đã xác nhận với chủ dự án):
Tính năng Tuyển sinh (`app/admin/admissions`): 100% chưa có bảng DB
thật (không có bảng `leads` trên Supabase). Đã quyết định: để nguyên
hiện trạng, sẽ xây lại hoàn toàn thật khi build phân hệ Sale (xem mục 8).
Tài liệu/Bài tập/Chấm điểm của Teacher (`resources`, `assignments`,
`grading`): hoàn toàn là `useState` mock, không Server Action, không
query DB — để dành xây thật sau (xem mục 9). Lưu ý: bảng
`assignments`/`materials`/`submissions` đã có sẵn trên Supabase,
có thể tiết kiệm công sức khi build.
⚠️ **Sửa lại 1 claim sai:** `lib/data/students-seed.ts` **KHÔNG hề là code
chết** — vẫn được import bởi `lib/context/app-data-context.tsx` (biến
`INITIAL_APP_STUDENTS`) và `lib/data/admissions-seed.ts`. KHÔNG xóa file
này nếu chưa gỡ 2 nơi import đó trước.

`app/admin/finance/finance-client.tsx` đã dọn xong ngày 2026-09-12: toàn
bộ khối tính lại Sổ Cái/KPI/Nhật ký giao dịch từ global store (có 3 chỗ
bịa số: tên hardcode → tiền giả "khang"/"huy"/"đức anh", SĐT giả
"0912345678", phí mặc định 200.000đ) đã bị xóa, dùng thẳng dữ liệu thật từ
`getFinancialHubData()`.

Còn sót lại (chưa dọn, ghi nhận 2026-09-12): `DEFAULT_CASH_FLOW_12_MONTHS`/
`DEFAULT_AI_ADVISOR` (`app/admin/analytics/analytics-client.tsx`),
`DEFAULT_OFFICIAL_CLASSES`/`DEFAULT_FIXED_TRIAL_SLOTS`
(`components/admissions/conversions-tab.tsx`, `types/admissions.ts`),
`getCenterBankSettings()` trả tài khoản ngân hàng giả khi query lỗi
(`lib/actions/settings.ts`).
8. Kiến trúc Tuyển sinh (Admissions) — quyết định & kế hoạch tương lai
Quyết định kiến trúc: Sale sẽ là chủ sở hữu duy nhất tính năng
Tuyển sinh. Admin không thao tác chi tiết, chỉ xem báo cáo tổng
hợp. Đây là áp dụng nguyên tắc chung: "1 tính năng = 1 chủ sở hữu
code/data, phân hệ khác chỉ đọc dữ liệu tổng hợp."
Code hiện tại ở `app/admin/admissions` sẽ cần viết lại gần như từ
đầu phần backend khi chuyển sang Sale (vì chưa từng có bảng thật),
chỉ giữ lại UI/luồng nghiệp vụ hiện có làm tham khảo thiết kế.
Luồng nghiệp vụ dự kiến (mô tả sơ bộ bởi chủ dự án, chưa chốt kỹ):
Lead nhập (form/Sale nhập tay) → "Mới tiếp nhận" → "Đang chăm sóc"/"Hẹn
gọi lại"/"Không có nhu cầu" → "Học thử/Test đầu vào" → "Ghi danh &
Chuyển đổi" (thanh toán qua mã QR, hệ thống tự xác nhận khi nhận được
tiền qua khớp lệnh chuyển khoản — phần tích hợp ngân hàng cần thiết kế
riêng, khá phức tạp).
Sơ bộ sẽ cần: bảng `leads`, bảng `lead\_interactions` (lịch sử chăm
sóc/gọi điện), nối với `invoices` sẵn có khi ghi danh thành công.
Chưa thiết kế schema chi tiết — để dành làm kỹ khi thực sự bắt tay
code phân hệ Sale.
9. Kiến trúc Tài liệu (Resources) của Teacher — quyết định tương lai
Tài liệu gắn với 1 lớp cụ thể (`class\_id`), giáo viên phụ trách lớp
đó quản lý/đăng tải.
Admin cũng có toàn quyền xem/đăng/quản lý mọi tài liệu (để kiểm
duyệt nội dung; và vì trung tâm nhỏ/1 giáo viên kiêm admin thường tự
quản lý tài liệu).
Ý tưởng tương lai (đã nói rõ là CHƯA cần làm ngay): chia sẻ tài liệu
giữa các giáo viên/lớp với cơ chế chấp nhận/từ chối — thiết kế hiện tại
(bảng đơn giản theo `class\_id`) không cản trở việc thêm tính năng này
sau bằng 1 bảng phụ (`resource\_shares`).
Nên tận dụng bảng `materials` đã có sẵn trên Supabase (xem mục 4) khi
build thật, thay vì tạo bảng mới từ đầu.
10. File AGENTS.md — đã soạn và giao cho chủ dự án
Claude đã soạn 1 file `AGENTS.md` hoàn chỉnh, gắn đúng với dự án này
(không phải bản mẫu chung), bao gồm: tech stack, convention thư mục/đặt
tên, data model, mô hình phân quyền + nguyên tắc IDOR, business rules,
checklist known issues, git workflow đề xuất, nguyên tắc kiến trúc khi mở
rộng phân hệ mới. File này được thiết kế để dán vào bên dưới phần
đầu đã có sẵn trong `AGENTS.md` gốc của repo (phần `<!-- BEGIN:nextjs-agent-rules -->` tự sinh bởi `next dev`, không được xóa —
và phần "Workflow Preference" đã có sẵn: không dùng browser tools/subagent
sau khi sửa code, chỉ báo hoàn thành để người dùng tự test).
Nếu AI mới cần nội dung đầy đủ của file AGENTS.md này, hãy hỏi chủ dự
án gửi lại — nó đã được lưu vào repo.
11. Trạng thái hiện tại — Trang Báo cáo & AI Insights + Đồng bộ trạng thái học sinh
### 11.1 Đã hoàn thành

**a) Sửa lỗi số liệu Analytics (khép giai đoạn dọn dữ liệu giả cũ):**
- `getAnalyticsReportData()` trong `lib/actions/analytics.ts`: đã thêm `updated\_at`
  vào query, migration cột `updated\_at` + trigger tự động đã chạy thật trên bảng
  `students`.
- `renewalRate`: TÍNH THẬT 100%, dùng đúng công thức — nhóm mẫu số là học sinh có
  tổng `balance\_sessions <= 0` (đã hết buổi), tử số là trong nhóm đó ai có `>= 2`
  hóa đơn `status = 'paid'`. Đây là công thức xấp xỉ đã chấp nhận (chưa kiểm tra
  thứ tự hóa đơn thứ 2 phải SAU khi hết buổi).
- `customerRetentionRate` và `churnRate`: ĐÃ TẮT tạm thời, trả về dạng
  `{ available: false, reason: "Cần hoàn thiện tính năng tự động cập nhật trạng
  thái học sinh theo buổi/khóa học" }`. Lý do tắt: công thức cũ dựa vào cột
  `students.status`, nhưng cột này KHÔNG được cập nhật trong vận hành thực tế
  (gần như luôn là `active`) → số liệu sẽ luôn sai lệch nặng (CRR ~100%, churn ~0%)
  nếu bật lại mà chưa có Mục 11.2 bên dưới. UI hiển thị "Sắp ra mắt" đúng pattern
  đã dùng cho `funnelStages`/`funnelDropBox`/`churnReasons`.
- Đã gỡ bỏ hoàn toàn việc `lib/utils/payroll-calculator.ts`
  (`calculateTeacherPayrollFromClasses`) ĐÈ số liệu lương thật bằng số tự bịa
  (giả định mọi buổi trong lịch đã "completed", tự gán lương 220k nếu thiếu) tại
  2 nơi: `components/finance/payroll-tab.tsx` và `app/admin/teachers/teachers-client.tsx`.
  Cả 2 giờ luôn dùng thẳng `initialPayroll` (dữ liệu thật từ `getTeacherPayroll()`).
  File `payroll-calculator.ts` vẫn còn tồn tại trong repo nhưng không còn được gọi
  ở đâu — CHƯA xóa file, để đó.

**b) Việc 2 — Tự động chuyển trạng thái Active → Paused → Dropped theo buổi/khóa:**

Quyết định kiến trúc quan trọng: **trạng thái Pause/Dropped là thuộc tính của TỪNG
LƯỢT GHI DANH (`enrollments`), không phải của học sinh (`students`)** — vì 1 học
sinh có thể active ở lớp này, paused ở lớp khác cùng lúc.

Đã thêm cột (migration đã chạy thật trên Supabase):
```sql

ALTER TABLE enrollments ADD COLUMN status TEXT NOT NULL DEFAULT 'active'

&#x20; CHECK (status IN ('active', 'paused', 'dropped'));

ALTER TABLE enrollments ADD COLUMN paused\_at TIMESTAMPTZ;

ALTER TABLE classes ADD COLUMN end\_date DATE;

```
Lưu ý: từng có 1 cột trùng tên `course\_end\_date` được tạo nhầm rồi xóa
(`ALTER TABLE classes DROP COLUMN course\_end\_date;`) — tên CHUẨN DUY NHẤT đang
dùng là `end\_date`.

Quy tắc nghiệp vụ đã chốt:
- Lớp tính theo buổi (`end\_date` = null): hết `balance\_sessions` (`<= 0`) → Pause.
- Lớp tính theo khóa (`end\_date` có giá trị): quá ngày `end\_date` → Pause.
- Sau 7 ngày kể từ lúc Pause → tự động Dropped (tính TẠI THỜI ĐIỂM ĐỌC dữ liệu,
  KHÔNG dùng cron/job chạy nền — quyết định vì ưu tiên "miễn phí, ít hạ tầng, ít
  sai sót" cho quy mô hiện tại).
- Admin luôn có thể ghi đè tay bất kỳ trạng thái nào (`updateEnrollmentStatus`).
- Tính "khách hàng quay lại" sau khi Pause được tính theo TỪNG lượt ghi danh
  (enrollment) bị Pause đó, không gộp theo học sinh.

Code đã viết, đã chạy `tsc --noEmit` sạch (nhưng CHƯA có ai test thật đầu-cuối,
xem mục 11.3):
- `lib/utils/enrollment-status.ts`: `getEffectiveEnrollmentStatus()`,
  `getEffectiveStudentStatus()`, `syncStudentStatusFromEnrollments()` — hàm dùng
  chung, tính trạng thái thật tại thời điểm gọi, không sửa/xóa dữ liệu lịch sử.
- `lib/actions/enrollments.ts` (file mới): `updateEnrollmentStatus()` — cho Admin
  ghi đè tay, dùng `requireRole(\["admin"])`.
- `lib/actions/attendance.ts` (`saveAttendanceSheet`): sau khi trừ
  `balance\_sessions`, tự chuyển `enrollments.status = 'paused'` nếu về `<= 0`;
  bắt lỗi từng dòng update, trả lỗi rõ ràng nếu có học sinh cập nhật thất bại
  (không còn luôn trả `success: true` bất kể có lỗi ngầm hay không).
- `lib/actions/students.ts` (`updateEnrollmentBalance`): nếu Admin sửa tay
  `balance\_sessions` tăng lại `> 0`, tự đưa `status` về `'active'`.
- Cả 3 hàm trên đều gọi `syncStudentStatusFromEnrollments()` sau khi update thành
  công, để đồng bộ lại `students.status` (giữ cột này như 1 "cache" tổng quát,
  KHÔNG xóa cột `students.status`, các màn hình cũ đọc cột này vẫn chạy được).

**c) Việc A1 — Tự động sinh buổi học (`class\_sessions`):**

Trước đây bảng `class\_sessions` HOÀN TOÀN TRỐNG (0 dòng) — không có cơ chế nào
tự tạo, chỉ tạo tay từng buổi qua modal. Đây là lý do gốc khiến "Lịch dạy học"
bên Teacher luôn trống dù đã set `schedule` cho lớp.

Đã viết `lib/utils/session-generator.ts` — hàm `ensureSessionsGenerated(supabase,
classId)`:
- Đọc `classes.schedule` (JSON: `\[{ day: "T2"|"T3".."CN", start\_time, end\_time }]`),
  `classes.start\_date`, `classes.end\_date`.
- Khoảng ngày cần đảm bảo có session: từ `max(start\_date, hôm nay)` tới
  `end\_date` (nếu có) hoặc `hôm nay + 30 ngày` (nếu lớp tính theo buổi, không có
  hạn — 30 ngày là số đã chọn, có thể chỉnh nếu cần).
- Chỉ INSERT các buổi còn thiếu (so khớp `session\_date` + `start\_time`), KHÔNG
  đụng session cũ đã có (đặc biệt các session `completed`/`cancelled`).
- Gọi ở 3 nơi: sau `createClass`/`updateClass`, trước khi trả dữ liệu ở
  `getTeacherSessions()` và `getClassSessions()`.

⚠️ Nợ kỹ thuật đã ghi nhận, CHƯA xử lý: `getClassSessions()` khi gọi KHÔNG kèm
`classId` (dùng cho trang Điểm danh Admin) hiện quét lại TOÀN BỘ lớp trong hệ
thống mỗi lần tải trang — chấp nhận được với số lớp ít hiện tại, nhưng cần tối ưu
(giới hạn phạm vi quét) trước khi số lớp tăng nhiều.

### 11.2 Đã xác nhận xong (2026-09-12, qua truy vấn Supabase trực tiếp)

1. **A1 (sinh buổi học tự động): CONFIRMED HOẠT ĐỘNG ĐÚNG.** Truy vấn `class_sessions`
   thật: 59 buổi `scheduled` đã sinh đúng cho 4 lớp thật theo `schedule`, cửa sổ 30
   ngày áp dụng đúng cho lớp không có `end_date`. `session-generator.ts` set rõ
   `status: "scheduled"` khi insert.
2. **Test RLS: KHÔNG bị chặn — nhưng vì lý do đáng lo hơn dự đoán.** RLS trên
   `students`/`enrollments` (và toàn bộ 7 bảng lõi) chỉ có 1 policy
   `USING(true) WITH CHECK(true)` cho `authenticated` — không hề chặn ai cả. Đây
   không phải "đã cấu hình đúng", mà là RLS chưa có tác dụng bảo vệ thật (xem
   AGENTS.md Mục 5.4 để biết chi tiết + việc cần làm sau).

### 11.3 A2 — Dọn dẹp số liệu giả/fallback trong toàn bộ codebase

Đã điều tra toàn diện, phát hiện khối lượng lớn các chỗ tự động điền số cứng khi
thiếu dữ liệu thật (VD: `?? 12`, `|| 24`, `|| 3`, các card mock trong
`components/analytics/` có hằng số `DEFAULT\_\*` với doanh thu/tỷ lệ giả, tên rác
test bị lọc cứng trong code thay vì xóa DB, 3 màn hình Teacher (bài tập/chấm
điểm/tài nguyên) hoàn toàn là mock `useState`, chưa nối Supabase).

**Đợt 1 — ĐÃ XONG, xác nhận 2026-09-12** (bản cũ ghi "chờ kết quả" — đã có kết
quả, đã review kỹ diff, phát hiện + vá thêm 2 chỗ Antigravity sót:
`class-detail-client.tsx` và `finance-client.tsx` còn `|| 3`/`|| 200000` hardcode
ở 2 vị trí ngoài phạm vi 2 prompt gốc, đã sửa).

**Đợt 2 — ĐÃ XONG 2026-09-12** (đúng 3 file bản cũ liệt kê):
- `lib/services/global-enrollment-dispatcher.ts`: xác nhận **code chết 100%**
  (không nơi nào gọi `handleCompleteEnrollment`, còn ghi vào key localStorage
  khác hẳn key thật `educenter_global_store_v4`) — đã xóa file.
- `lib/context/app-data-context.tsx`: chỉ sửa đúng 4 hàm đang được Admin/Teacher
  UI thật gọi (`addClass`, `enrollStudentToClass`, `addOrUpdateStudent`,
  `markInvoicePaid`) — 8 vị trí `|| 200000`/`?? 12`/`"P.201"` hardcode đã đổi
  thành `?? 0`/"Chưa xếp phòng"/"Chưa có lịch học". **CỐ Ý KHÔNG đụng** 3 hàm
  thuộc Admissions (`completeEnrollment`, `moveToConversion`,
  `topUpStudentTuition`) vì tính năng này sẽ viết lại hoàn toàn khi build Sale
  (xem mục 8) — sửa bây giờ là làm thừa.

**Đợt 3 — KHÔNG PHẢI dọn dẹp, là tính năng CHƯA XÂY:** `app/teacher/assignments`,
`app/teacher/grading`, `app/teacher/resources` — nội dung mock `useState`
(materials/assignments/submissions), nhưng **CÓ gọi Server Action thật**
(`getCurrentProfile()` + `getClassesByTeacher()`) để lấy danh sách lớp — không
phải "hoàn toàn ngắt kết nối DB" như bản cũ mô tả. Xếp vào Nhóm B, xây thật khi
mở nhánh song song.

Còn sót lại sau A2 (chưa dọn, ưu tiên thấp — xem AGENTS.md Mục 7):
`DEFAULT_CASH_FLOW_12_MONTHS`/`DEFAULT_AI_ADVISOR` (analytics-client.tsx),
`DEFAULT_OFFICIAL_CLASSES`/`DEFAULT_FIXED_TRIAL_SLOTS` (admissions), fallback
tài khoản ngân hàng giả trong `getCenterBankSettings()`.

### 11.4 A3 + A4 — Đã điều tra xong 2026-09-12, kế hoạch cụ thể

**A3 — Tạo tài khoản đăng nhập:**
- `createCenterUser()` **không tồn tại** — tên hàm thật là `createAccountByAdmin()`
  (`lib/actions/auth.ts:159-228`, hỗ trợ admin/teacher/sale/student, có check
  quyền đúng) nhưng **không ai gọi cả** — code chết.
- `createTeacher()` tự viết logic riêng tạo `auth.users` + `profiles` (không dùng
  `createAccountByAdmin()`) — trùng lặp không cần thiết, nhưng đã hoạt động đúng
  sau khi thêm `requireRole()` (xem mục 6).
- `createStudent()` không tạo login — đúng thiết kế (ghi danh trước, cấp login
  sau, tách biệt qua `students.auth_user_id` nullable).
- **Lỗ hổng UX thật:** `teacher-dialog.tsx` ẩn hẳn email/mật khẩu khi sửa giáo
  viên đã tồn tại → Admin không xem lại được email đăng nhập, không reset được
  mật khẩu hộ giáo viên quên.
- **Kế hoạch:** (1) giữ `createAccountByAdmin()` — KHÔNG xóa, đây chính là cơ chế
  cần dùng để cấp tài khoản học sinh sau này (nhánh `role:"student", studentId`);
  (2) thêm vào `teacher-dialog.tsx` (chế độ sửa): hiện email read-only + nút
  "Đặt lại mật khẩu" (Server Action mới dùng
  `createAdminClient().auth.admin.updateUserById()`, admin-only).
- **Câu hỏi mở (chủ dự án đang cân nhắc, xem thêm cuối mục 14):** có nên tự động
  tạo tài khoản học sinh ngay khi ghi danh không? Phân tích: KHÔNG nên làm ngay
  bây giờ — (a) form ghi danh hiện chưa thu thập email/SĐT riêng của học sinh
  (chỉ có `parent_phone`), cần email/phone thật để tạo `auth.users`; (b) RLS
  đang "bật nhưng rỗng ruột" (mục 5.4 AGENTS.md) — cấp login hàng loạt cho 1
  nhóm người dùng lớn, ít tin cậy hơn (học sinh/phụ huynh) trước khi có policy
  per-role thật sẽ làm tăng đáng kể rủi ro thực tế; (c) `app/student/` chưa có
  route nào (404 khi redirect); (d) cần cấu hình SMTP thật để gửi email
  mời/đặt mật khẩu. → Nên làm sau, khi build phân hệ Student thật, không phải
  trước khi mở nhánh song song.

**A4 — Hồ sơ cá nhân + Quên mật khẩu:**
- Teacher **đã có** `app/teacher/profile` hoạt động thật (gọi đúng
  `updateProfile()`/`updatePassword()` — 2 hàm này KHÔNG chết như có thể nhầm
  tưởng, đang dùng thật).
- Admin **chưa có gì** — `admin-header.tsx` không có menu người dùng nào.
- "Quên mật khẩu" **có code sẵn nhưng chết hoàn toàn**: `forgot-password-form.tsx`,
  `login-form.tsx`, `update-password-form.tsx` gọi đúng `resetPasswordForEmail()`
  nhưng không route nào import — boilerplate sót từ template Supabase gốc,
  giống hệt kiểu `lib/supabase/proxy.ts` đã xóa trước đây.
- **Kế hoạch:** (1) tạo `app/admin/profile` sao chép pattern `app/teacher/profile`
  (tái dùng `updateProfile()`/`updatePassword()` sẵn có); (2) nối lại route
  `/forgot-password` (dùng `forgot-password-form.tsx` có sẵn) + link trên
  `/login` + route nhận link reset dùng `update-password-form.tsx` có sẵn.
- **Cần chủ dự án xác nhận trước khi làm (2):** Supabase Auth đã cấu hình SMTP
  thật để gửi email reset mật khẩu chưa, hay vẫn dùng SMTP mặc định (giới hạn
  số lượng, dễ vào spam)? Việc này ở Supabase Dashboard → Auth → Email/SMTP,
  ngoài phạm vi code.

### 11.5 Backlog Nhóm B (giao được cho người phụ trách phân hệ, không lo xung đột)

- Hoàn thiện UI trang "Lớp học của tôi" bên Teacher (hiện là dạng chọn lớp bên
  trái/xem bảng học sinh bên phải trên CÙNG 1 trang, KHÔNG chuyển trang, KHÔNG có
  nút điểm danh hay xem chi tiết — đã xóa fallback giả sau A2 Đợt 1, nhưng còn
  thiếu chức năng thao tác thật).
- Admin thêm/bớt lớp cho học sinh đã có sẵn (dùng lại `enrollStudentInClass()`
  có sẵn, chỉ thiếu UI/nút bấm).
- Sau khi Admin tạo học sinh mới, thêm nút/nhắc "Tạo hóa đơn ngay" (gọi
  `createInvoice()` có sẵn) — vì kiến trúc doanh thu hiện ĐÚNG (chỉ tính từ
  `invoices.status = 'paid'`), chỉ thiếu bước nhắc UI, không phải lỗi.
- 3 màn hình Teacher mock (assignments/grading/resources) — xây thật, nối
  Supabase (xem 11.3 Đợt 3).

### 11.6 Thứ tự ưu tiên xử lý tiếp theo (cập nhật 2026-09-12 — xem mục 14 để biết đã xong tới đâu)

1. ~~Xử lý 2 việc còn treo ở mục 11.2~~ — ĐÃ XONG.
2. ~~A2 Đợt 1 + Đợt 2~~ — ĐÃ XONG.
3. ~~Điều tra A3 + A4~~ — ĐÃ XONG, đang chờ chủ dự án xác nhận 2 câu hỏi mở
   (auto-tạo tài khoản học sinh khi nào; đã có SMTP thật chưa) rồi mới code.
4. Thiết kế RLS thật theo từng role cho 7 bảng lõi (AGENTS.md Mục 5.4) — nên làm
   trước khi mở nhánh song song, vì càng nhiều người/role truy cập DB càng cần
   lớp bảo vệ thứ 2 thật sự hoạt động, không phải "bật nhưng rỗng ruột".
5. Code A3 + A4 theo kế hoạch đã chốt ở mục 11.4.
6. Mở nhánh `develop`/`feature/*`, giao Nhóm B cho từng người phụ trách phân hệ.
12. Git hiện tại
Nhánh chính: `master`. Remote:
`https://github.com/truongviethai26082005-arch/Webdemo.git`.
Toàn bộ thay đổi tính tới cuối phiên 2026-09-12 (xem mục 14) vẫn đang
**uncommitted local trên `master`** (đã xác nhận qua `git status` — không tin
theo trí nhớ, luôn tự kiểm tra lại) — cần chủ dự án tự xem diff và commit tay
theo từng nhóm (bảo mật riêng, dọn dữ liệu giả riêng, doc riêng), Claude không
tự commit/push (mục 13).
Kế hoạch git khi chuyển sang code song song 4 người (CHƯA làm,
bước tiếp theo sau khi xong mục 11):
Tạo nhánh `develop` từ `master`.
Mỗi phân hệ code trên nhánh riêng: `feature/admin`, `feature/teacher`,
`feature/sale`, `feature/student`.
Merge về `develop` thường xuyên (hằng ngày, không để dồn nhiều ngày
— diff do AI tạo thường lớn, để lâu khó merge).
Khi cần sửa file dùng chung (schema/types, `lib/supabase/\*`,
`proxy.ts`, `components/ui/\*`, `lib/auth/guards.ts`): báo trước
trong nhóm, làm nhanh, merge sớm.
Chỉ merge `develop` → `master` khi ổn định.
13. Cách làm việc đã thiết lập giữa chủ dự án — Claude — Antigravity
Quy trình lặp lại xuyên suốt dự án, nên tiếp tục theo đúng cách này:
Chủ dự án mô tả vấn đề/yêu cầu cho Claude.
Claude phân tích, đưa ra đánh giá kỹ thuật, và soạn prompt cụ thể,
chi tiết, có ràng buộc rõ ràng để chủ dự án copy dán cho Antigravity.
Antigravity thực hiện, không tự commit/push, báo cáo lại diff đầy
đủ + kết quả `npx tsc --noEmit`.
Chủ dự án gửi kết quả lại cho Claude review kỹ (Claude luôn đọc kỹ
diff, tìm lỗi tiềm ẩn, xác nhận đúng/sai trước khi cho phép tiếp tục).
Chủ dự án tự test tay theo checklist Claude đưa ra.
Nếu pass, mới commit + push.
Các nguyên tắc quan trọng Claude luôn áp dụng khi soạn prompt cho
Antigravity:
Luôn yêu cầu Antigravity không tự commit/push.
Với thay đổi lớn/mơ hồ: yêu cầu điều tra + báo cáo trước, chưa sửa
vội (investigate-only), rồi mới ra prompt fix sau khi đã hiểu rõ.
Với ràng buộc kiểu dữ liệu trả về: luôn nhắc giữ nguyên kiểu return
gốc của hàm (null/mảng rỗng/`{error}`) khi thêm logic từ chối quyền,
tránh phá vỡ code gọi hàm đó ở nơi khác.
Luôn giới hạn phạm vi sửa rõ ràng theo từng file/hàm cụ thể, tránh để
AI tự refactor lan sang chỗ không liên quan.
Khi tìm thấy vấn đề mới ngoài phạm vi đang làm: yêu cầu chỉ liệt kê,
không tự sửa, để người dùng xác nhận trước.

14. Phiên làm việc 2026-09-12 — audit toàn diện + vá nhiều lỗ hổng nghiêm trọng

**Bối cảnh:** phiên này KHÔNG dùng Antigravity — Claude Code trực tiếp đọc/sửa
code (khác quy trình mục 13), vì chủ dự án yêu cầu tự làm luôn thay vì soạn
prompt. Bắt đầu từ việc xác nhận Mục 7 (AGENTS.md) và Mục 6 (tài liệu này) có
đúng thực tế không — phát hiện SAI, dẫn tới 1 đợt audit toàn diện.

**Đã sửa (theo đúng thứ tự phát hiện):**
1. AGENTS.md Mục 7: cập nhật đúng — 5 lỗi bảo mật gốc thực ra ĐÃ fix (tài liệu
   cũ báo sai là chưa fix).
2. `class-detail-client.tsx`, `finance-client.tsx`: 2 chỗ Antigravity sót lại
   sau A2 Đợt 1 (xem mục 11.3).
3. `finance-client.tsx`: bỏ hẳn khối tính lại Sổ Cái/KPI từ global store (xem
   mục 7 ở trên).
4. `lib/actions/invoices.ts`: phát hiện + vá 5 hàm hoàn toàn không có kiểm tra
   quyền (xem mục 6).
5. `lib/services/global-enrollment-dispatcher.ts`: xóa (code chết).
6. `lib/context/app-data-context.tsx`: dọn 8 vị trí bịa số trong 4 hàm thật
   (xem mục 11.3 Đợt 2).
7. Agent điều tra A3+A4 (mục 11.4).
8. Agent audit toàn diện AGENTS.md + context-handoff.md — phát hiện hàng loạt
   claim sai (xem mục 6, 7 đã sửa lại ở trên), và phát hiện thêm:
   - `lib/actions/teachers.ts` (`createTeacher`, `updateTeacher`, `getTeachers`):
     không có kiểm tra quyền nào — đã vá.
   - `lib/actions/students.ts` (`getStudents`, `getStudentById`,
     `getLowBalanceStudents`): không có kiểm tra quyền — đã vá.
   - `app/api/test-security/route.ts`: API Route công khai bị bỏ quên — đã xóa.
   - `types/database.ts` lệch schema — đã bổ sung `Enrollment.status/paused_at`,
     `Class.end_date`, `Student.updated_at`.
9. **🔴 Phát hiện nghiêm trọng nhất phiên này:** 3 trigger Database không nằm
   trong bất kỳ file migration nào — 1 fail-open (`handle_new_user` mặc định
   role `teacher`), 2 gây double-deduction/double-credit `balance_sessions`
   (điểm danh trừ buổi 2 lần, thanh toán cộng buổi 2 lần). Claude không có
   quyền ghi DB trực tiếp (bị chặn bởi permission "Modify Shared Resources") —
   đã đưa SQL cho chủ dự án tự chạy trên Supabase Dashboard, **đã xác nhận chạy
   xong và verify lại đúng trong phiên này**.
10. Backfill 6 file migration còn thiếu vào `supabase/migrations/` (cột/bảng đã
    tồn tại thật trên DB nhưng repo không có file `.sql` ghi lại) — bao gồm cả
    file sửa 3 trigger ở mục 9.
11. Viết lại AGENTS.md + tài liệu này (file bạn đang đọc) cho khớp thực tế.

**Việc đã xử lý xong trong phiên 2026-09-12 (xem mục 15 để biết chi tiết audit
đợt 2):** A3 (quản lý tài khoản Teacher) + A4 (hồ sơ Admin, quên mật khẩu) đã
code xong; quyết định hoãn RLS thật + tự động tạo tài khoản học sinh tới gần
lúc lên thật (không phải chưa quyết — đã quyết định hoãn có lý do, xem mục 15);
SMTP xác nhận chưa cần vì web chưa thương mại; đã tạo + push `develop` +
`feature/admin|teacher|sale|student` lên GitHub; đã tạo route placeholder
`app/sale`, `app/student`; đã commit toàn bộ (7 commit tách nhóm) lên `master`.

15. Audit đợt 2 — rà soát logic nghiệp vụ + frontend trước khi họp team (2026-09-13)

Chủ dự án yêu cầu rà soát lại TOÀN BỘ code trước buổi họp triển khai song song.
Giao 2 agent độc lập: 1 rà soát logic nghiệp vụ (`lib/actions/*.ts`,
`lib/utils/*.ts`), 1 rà soát frontend (dialog, sidebar, các trang mới). Phát
hiện ~25 bug thật, một số nghiêm trọng không kém đợt audit bảo mật hôm trước.

### 15.1 Đã sửa ngay trong phiên này (data-corruption, mức độ cao + phạm vi hẹp)

- **`saveAttendanceSheet` (attendance.ts) — trừ buổi 2 lần mỗi lần lưu lại.**
  Code cũ trừ `-1` cho MỌI học sinh `present` ở MỌI lần lưu, không kiểm tra đã
  từng lưu trước đó chưa — sửa/lưu lại 1 buổi điểm danh (kể cả chỉ sửa ghi chú)
  là trừ thêm 1 buổi nữa. Đã sửa: so sánh trạng thái CŨ (trước khi ghi đè) với
  trạng thái MỚI, chỉ trừ/hoàn đúng phần THAY ĐỔI.
- **`absent_unexcused` (vắng không phép) trước đó KHÔNG trừ buổi** — sai với
  đúng quy tắc đã ghi ở AGENTS.md Mục 6 (chỉ code cũ lọc theo `status ===
  "present"`, bỏ sót `absent_unexcused`). Đã sửa cùng lúc với fix trên.
- **Buổi học `cancelled` vẫn điểm danh được** — `saveAttendanceSheet` không hề
  kiểm tra `sessionData.status`. Đã thêm chặn: buổi hủy thì từ chối lưu điểm
  danh.
- **`markInvoiceAsPaid` không chống double-click/double-confirm** — xác nhận
  thanh toán 2 lần cho cùng 1 hóa đơn sẽ cộng buổi 2 lần. Đã thêm điều kiện chỉ
  cho phép chuyển từ `pending` sang `paid` (`.eq("status","pending")`), lần 2
  trả lỗi rõ ràng thay vì cộng buổi tiếp.
- **`deleteClassSession` không hoàn buổi khi xóa 1 ca đã điểm danh** — Admin xóa
  nhầm 1 buổi đã điểm danh present/absent_unexcused thì học sinh mất buổi vĩnh
  viễn dù buổi học đó coi như chưa từng tồn tại. Đã thêm bước hoàn `+1` buổi cho
  đúng các học sinh đã bị trừ trước khi xóa session.

### 15.2 CÒN TREO — cần bạn xác nhận/ưu tiên trước khi sửa tiếp (không sửa vội vì phạm vi rộng hoặc cần quyết định thiết kế)

**Nhóm frontend — dialog bỏ qua lỗi Server Action, ghi dữ liệu giả vào store khi thất bại** (cùng 1 anti-pattern lặp lại ở 4 file — nên sửa chung 1 đợt):
- `components/classes/class-dialog.tsx`: `createClass`/`updateClass` trả về
  `{error}` (không throw), nhưng code không kiểm tra `result.error` — tạo/sửa
  lớp thất bại (vd lỗi quyền, lỗi DB) vẫn ghi 1 lớp giả (`cls-<timestamp>`) vào
  store cục bộ và đóng dialog như đã thành công. Lớp giả này biến mất sau khi
  F5 (do cơ chế lọc ID giả), khiến Admin tưởng nhầm là lớp bị xóa.
- `components/teachers/teacher-dialog.tsx`: cùng lỗi bỏ qua `result.error`.
  Thêm 1 lỗi riêng: khi sửa giáo viên, ghi 1 email GIẢ
  (`<uuid>@educenter.vn`) vào store dù email thật đã có sẵn trong `loginEmail`
  — nên dùng đúng `loginEmail` thay vì bịa.
- `components/students/student-dialog.tsx`: sửa 1 học sinh bất kỳ sẽ âm thầm
  ghi đè `remainingSessions` của họ về **12** trong store cục bộ (do
  `sessionsNum` mặc định 12 khi field trống ở chế độ sửa) — hiển thị sai số
  buổi trên UI dù DB thật không đổi. Cũng chưa reset `classId`/`initialSessions`
  giữa các lần mở dialog (mở thêm mới → chọn lớp A → hủy → sửa học sinh khác →
  bị dính lớp A).
- `components/classes/add-student-dialog.tsx`: ghi danh vào store TRƯỚC khi gọi
  Server Action, nếu Server Action lỗi thì KHÔNG rollback — học sinh vẫn hiện
  đã vào lớp trên UI dù DB không có bản ghi enrollment.
- Nguyên nhân gốc chung: các Server Action trả `{error}` chứ không throw
  exception, nhưng UI code cũ giả định "không throw = thành công". Hướng sửa
  chung: mọi nơi gọi Server Action dạng này đều phải kiểm tra
  `if (result?.error) { hiện lỗi, KHÔNG ghi store }` trước khi coi là thành
  công.

**Nhóm logic nghiệp vụ — cần quyết định thiết kế trước khi sửa:**
- **Đổi giáo viên phụ trách 1 lớp (`updateClass`) không cập nhật lại
  `teacher_id` trên các `class_sessions` đã sinh trước đó** — giáo viên MỚI bị
  từ chối xem/điểm danh các buổi cũ (do check ownership theo `teacher_id`),
  giáo viên CŨ vẫn được tính lương cho buổi họ không còn dạy. Cần quyết định:
  cập nhật lại `teacher_id` hàng loạt cho session tương lai khi đổi giáo viên?
  Chỉ áp dụng cho session `scheduled`, giữ nguyên session `completed` (lịch sử)?
- **Đổi `schedule` của lớp không dọn session cũ theo lịch cũ** — session theo
  lịch cũ vẫn còn (session "ma"), đồng thời có thể tạo trùng session nếu chỉ
  đổi giờ học (khóa chống trùng hiện chỉ dựa vào `session_date + start_time`).
  `class_sessions` cũng CHƯA có ràng buộc UNIQUE trong DB cho tổ hợp
  `(class_id, session_date, start_time)` — 2 người tải trang cùng lúc có thể
  sinh trùng session (race condition ở `ensureSessionsGenerated`).
- **Công thức lương "Thưởng − Phạt" chưa hề implement thật** — `payroll-tab.tsx`
  chỉ lưu Thưởng/Phạt vào `useState` cục bộ, KHÔNG gửi lên server, mất khi F5.
  Cần thêm cột `bonus`/`penalty` (migration) + Server Action ghi thật nếu muốn
  dùng công thức đầy đủ đã ghi ở AGENTS.md Mục 6.
- **`getTeacherPersonalEarnings` và `getTeacherPayroll` tính khác công thức
  nhau** khi có giáo viên dạy thay (substitute) — 1 bên tính theo `class_id`
  thuộc về giáo viên, 1 bên tính theo đúng `session.teacher_id` — ra 2 số tiền
  khác nhau cho cùng 1 tháng. Cần thống nhất 1 công thức duy nhất.
- **`getFinancialHubData`/`analytics.ts` cộng dồn `balance_sessions` xuyên suốt
  các lớp của 1 học sinh (netting)** — học sinh dư 10 buổi ở lớp A và âm 9 buổi
  ở lớp B bị tính thành "dư 1 buổi", làm sai lệch KPI tổng buổi còn lại, tỷ lệ
  gia hạn (`renewalRate`), và danh sách "sắp hết buổi". Về nghiệp vụ nên tính
  theo TỪNG lượt ghi danh (enrollment) riêng biệt, không gộp theo học sinh.
- **Lệch múi giờ UTC vs Việt Nam ở nhiều nơi** (`dashboard.ts`, `sessions.ts`
  `getTodaySessions`, `analytics.ts` `monthlyRevenue`) dùng
  `new Date().toISOString().split("T")[0]` (giờ UTC) thay vì giờ Việt Nam như
  `session-generator.ts` đã làm đúng (`Intl.DateTimeFormat` với
  `timeZone:"Asia/Ho_Chi_Minh"`) — giữa nửa đêm và 7h sáng, "Lịch học hôm nay"
  có thể hiện nhầm sang ngày hôm trước. Nên gộp thành 1 helper dùng chung.
- **`/update-password`**: `proxy.ts` fail-closed đúng nhưng vô tình khóa luôn
  người dùng đang thao tác link reset mật khẩu nếu tài khoản đó chưa có role
  xác định được (vd tài khoản student trước khi migration/link `auth_user_id`
  chạy) — cần thêm `/update-password` vào danh sách ngoại lệ không chặn của
  `proxy.ts`.

**Việc dọn dẹp nhỏ, không gấp:**
- `app/admin/invoices/invoices-client.tsx`: code chết hoàn toàn (trang đã
  redirect sang `/admin/finance`), không ai import — có thể xóa.
- `payroll-tab.tsx`: bộ chọn tháng/năm đổi label nhưng không gọi lại
  `getTeacherPayroll()` — hiện sai số liệu dưới nhãn tháng khác.
- `schedule-client.tsx`/`earnings-client.tsx` (Teacher): vẫn còn vài fallback
  giờ học bịa (`|| "18:00"`) và hiển thị buổi `cancelled` lẫn vào danh sách
  "sắp diễn ra".
- `lib/utils/payroll-calculator.ts`: xác nhận lại vẫn là code chết, nên xóa hẳn
  vì có nguy cơ bị import nhầm lại (chứa toàn số liệu bịa).

**Việc BẮT BUỘC làm ngay khi tiếp tục phiên sau (theo đúng thứ tự):**
1. Chủ dự án tự xem diff các fix ở mục 15.1 + toàn bộ thay đổi trong phiên và
   commit tay (Claude không tự commit trừ khi được yêu cầu rõ — mục 13).
2. **Rà soát lại `balance_sessions` của các học sinh có giao dịch điểm
   danh/thanh toán TRƯỚC ngày 2026-09-12** — có thể đã bị trừ/cộng sai do bug
   trigger double-deduction/double-credit (đã sửa ở tầng DB) VÀ bug
   double-deduction ở tầng code khi lưu lại điểm danh (đã sửa ở mục 15.1).
3. Xử lý nhóm frontend ở mục 15.2 (4 dialog bỏ qua lỗi Server Action) — nên làm
   sớm vì ảnh hưởng trực tiếp tới độ tin cậy dữ liệu Admin nhìn thấy hằng ngày.
4. Các mục cần quyết định thiết kế ở 15.2 (đổi giáo viên, đổi lịch học, công
   thức lương, netting buổi theo học sinh, timezone) — ưu tiên theo mức độ ảnh
   hưởng thực tế, không nhất thiết làm hết trước khi mở nhánh song song.
5. Tự chạy `npx tsc --noEmit` trên máy thật sau khi áp dụng thêm bất kỳ fix nào
   (sandbox Claude Code không đủ RAM để tự chạy lệnh này).

---
Tài liệu này được Claude tổng hợp dựa trên toàn bộ lịch sử hội thoại tới
thời điểm hiện tại. Nếu có thông tin nào không khớp với trạng thái thực
tế của code/git, ưu tiên tin vào code thật trong repo. **Đã bị phát hiện sai ở
nhiều chỗ trong quá khứ (xem cảnh báo đầu file) — luôn tự xác minh, không suy
diễn "tài liệu nói vậy nên chắc đúng".**