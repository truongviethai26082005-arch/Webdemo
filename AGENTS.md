<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Workflow Preference
- Do NOT use browser tools or subagents (auto-screenshot / browser verification) after editing code.
- Whenever code changes are done, simply report completion to the user so they can test in their own browser.

<!--
  HƯỚNG DẪN GHÉP FILE:
  Giữ nguyên phần <!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->
  ở đầu file AGENTS.md hiện tại của bạn (nó tự sinh bởi `next dev`, sẽ tự tạo lại nếu xóa).
  Dán toàn bộ nội dung bên dưới vào NGAY SAU block đó, và sau phần "Workflow Preference"
  đã có sẵn.
-->

# Ngữ cảnh dự án — LMS Quản lý Trung tâm

## 1. Tổng quan

Website quản lý trung tâm dạy thêm (LMS-style), gồm **4 phân hệ theo role**: `admin`, `teacher`, `sale`, `student`.

- **Trạng thái hiện tại:** `admin` và `teacher` đang trong giai đoạn hoàn thiện. `sale` và `student` **chưa có route nào** — sẽ được xây mới, theo đúng pattern mà `admin`/`teacher` đã thiết lập.
- **Cách team làm việc:** code hoàn toàn dựa vào AI ("vibe code"). Nhiều người sẽ code song song theo từng phân hệ để tránh mất thời gian, nhưng cần tuân thủ nghiêm ngặt các quy tắc trong file này để tránh xung đột Git và xung đột kiến trúc.
- **Nguyên tắc tối cao khi AI code trong dự án này:** đọc kỹ mục 5 (Authorization) và mục 7 (Known Issues) trước khi động vào bất kỳ code nào liên quan tới đăng nhập, phân quyền, hoặc dữ liệu của Teacher/Student — đây là nơi đã phát sinh nhiều lỗi bảo mật nghiêm trọng trong quá khứ.

## 2. Tech Stack

- **Framework:** Next.js 16.x (bản canary/RC) — App Router, dùng `page.tsx` / `layout.tsx`. Đây là bản rất mới, **nhiều API có thể khác với kiến thức huấn luyện của AI** — luôn ưu tiên đọc tài liệu trong `node_modules/next/dist/docs/` trước khi dùng API không chắc chắn (params là Promise, cách đặt tên file middleware là `proxy.ts` chứ không phải `middleware.ts`, v.v.)
- **Ngôn ngữ:** TypeScript, React 19
- **Styling:** Tailwind CSS + `tailwindcss-animate`
- **UI Components:** shadcn/ui (dựng trên Radix UI + `class-variance-authority` + `clsx` + `tailwind-merge`), cấu hình trong `components.json`
- **Backend/DB/Auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Khác:** `framer-motion` (animation), `lucide-react` (icon), `next-themes` (theme)

## 3. Cấu trúc thư mục & Convention

### Route (theo phân hệ)
```
app/<role>/<feature>/page.tsx
app/<role>/layout.tsx
```
Ví dụ đã có: `app/admin/{admissions,analytics,attendance,classes,dashboard,finance,invoices,payroll,students,teachers}`, `app/teacher/{assignments,attendance,classes,earnings,grading,profile,resources,schedule}`.

Khi xây `sale` và `student`, **bắt buộc theo đúng khuôn này**: `app/sale/layout.tsx`, `app/sale/page.tsx`, các feature con là subfolder riêng — không gộp chung logic vào folder của role khác.

### Component
```
components/<feature>/<ten-file-kebab-case>.tsx
components/ui/<shadcn-primitive>.tsx   ← chỉ chứa primitive của shadcn, KHÔNG chứa logic nghiệp vụ
components/layout/<role>-header.tsx, <role>-sidebar.tsx
```

### Server Actions (cách gọi API chuẩn của dự án — KHÔNG dùng API Routes cho logic nghiệp vụ)
```
lib/actions/<domain>.ts
```
Convention quan sát được từ code thật:
- Bắt đầu bằng `"use server";`
- Function trả về object dạng `{ error: string }` khi thất bại, hoặc `{ success: true, ...data }` / data trực tiếp khi thành công — giữ nguyên pattern này, không tự đổi sang throw exception.
- Sau khi mutate dữ liệu, gọi `revalidatePath(...)` để refresh cache.
- Luôn `const supabase = await createClient();` ở đầu function (client tạo mới mỗi lần gọi, không cache ở module scope).

⚠️ **Quy tắc bắt buộc cho MỌI component gọi Server Action loại này (áp dụng cho code Sale/Student sau này):** vì Server Action trả về `{ error }` thay vì throw exception, component gọi nó **PHẢI kiểm tra `if (result?.error)` trước khi coi là thành công** — không được giả định "không có exception = thành công". Lỗi thật đã xảy ra ở `class-dialog.tsx`, `teacher-dialog.tsx`, `student-dialog.tsx`, `add-student-dialog.tsx` (2026-09-13): các dialog này bỏ qua `result.error`, khi Server Action thất bại vẫn ghi dữ liệu giả vào state cục bộ và đóng dialog như đã thành công (xem docs/context-handoff.md Mục 15.2 để biết chi tiết từng file). Khi viết dialog mới cho Sale/Student, PHẢI theo pattern:
```typescript
const result = await someServerAction(formData);
if (result?.error) {
  setError(result.error); // hiện lỗi, KHÔNG đóng dialog, KHÔNG ghi vào store
  return;
}
// chỉ tới đây mới coi là thành công
```

### Supabase clients (3 client khác nhau, dùng đúng chỗ — đây là điểm dễ gây lỗi bảo mật nếu dùng nhầm)
| File | Dùng ở đâu | Quyền |
|---|---|---|
| `lib/supabase/client.ts` | Client Components | Quyền theo RLS + session user hiện tại |
| `lib/supabase/server.ts` | Server Components, Server Actions | Quyền theo RLS + session user hiện tại (đọc cookie) |
| `lib/supabase/admin.ts` (`createAdminClient()`) | **Chỉ dùng trong Server Action, không bao giờ expose ra client** | Service role — **bỏ qua toàn bộ RLS**. Chỉ dùng cho các thao tác cần quyền cao như "Admin tạo tài khoản hộ người khác" |

⚠️ **Không bao giờ gọi `createAdminClient()` để phục vụ một request thông thường của user** (ví dụ lấy dữ liệu để hiển thị) — chỉ dùng cho các thao tác quản trị đặc biệt (tạo user, reset password hộ...). Dùng sai chỗ này sẽ vô hiệu hóa toàn bộ RLS.

### Types
`types/database.ts` phải luôn khớp chính xác với schema thật trên Supabase. Khi đổi schema (thêm cột, thêm bảng, mở rộng enum), **bắt buộc cập nhật file này trong cùng 1 lần thay đổi** — không để lệch.

### Naming convention
- File/folder: `kebab-case` (ví dụ `create-lead-dialog.tsx`)
- React component: `PascalCase`
- Function/biến: `camelCase`
- Route/feature folder tên số ít theo domain (`payroll`, `grading`, không phải `payrolls`)

## 4. Data Model (tóm tắt schema hiện tại — `types/database.ts`)

| Bảng | Vai trò | Ghi chú quan trọng |
|---|---|---|
| `profiles` | Tài khoản **nhân sự nội bộ**: admin, teacher, sale | Liên kết `auth.users.id`. Có `role`, `salary_per_session`, thông tin ngân hàng |
| `students` | **Học sinh** (đối tượng được quản lý, không phải nhân sự) | Sẽ bổ sung cột `auth_user_id` để liên kết tài khoản đăng nhập riêng của học sinh. Có `status`: active/paused/dropped |
| `classes` | Lớp học | `teacher_id`, `fee_per_session`, `schedule` |
| `enrollments` | Học sinh ghi danh vào lớp | Có `balance_sessions` — số buổi còn lại |
| `class_sessions` | Buổi học cụ thể | `status`: scheduled / completed / cancelled |
| `attendance` | Điểm danh | `status`: present / absent_excused / absent_unexcused |
| `invoices` | Hóa đơn học phí | `status`: pending / paid |

**Enum `UserRole`:** `'admin' | 'teacher' | 'sale' | 'student'` — đã mở rộng xong trong `types/database.ts` (xác minh 2026-09-12). Lưu ý: `'student'` ở đây là **role đăng nhập**, khác với bảng `students` (danh sách học sinh) — một bản ghi `students` có thể có hoặc chưa có tài khoản đăng nhập (`auth_user_id` có thể `null`). Cột `profiles.role` chỉ cho phép `admin/teacher/sale` (CHECK constraint) — role `student` KHÔNG có dòng trong `profiles`, chỉ tồn tại qua liên kết `students.auth_user_id`.

## 5. Authorization Model — QUY TẮC BẮT BUỘC

### 5.1. Nguyên tắc tối cao: LUÔN FAIL-CLOSED, KHÔNG BAO GIỜ FAIL-OPEN

> Khi hệ thống **không chắc chắn** về danh tính hoặc quyền của một request — vì bất kỳ lý do gì (lỗi kết nối, không tìm thấy profile, role không rõ, tham số bất thường) — **luôn từ chối truy cập**, không bao giờ mặc định cấp một quyền nào đó (kể cả quyền thấp nhất) để "cho chạy được".

Đây là bài học từ 3 lỗi thực tế đã xảy ra trong dự án này:
1. `signIn()` từng cho đăng nhập thành công với quyền admin khi Supabase báo lỗi đăng nhập, chỉ vì email chứa chữ "admin".
2. `getCurrentProfile()` từng trả về một profile admin giả khi gặp exception thay vì báo lỗi.
3. Logic xác định role từng mặc định gán `"teacher"` cho bất kỳ ai không tìm thấy trong `profiles` lẫn `students`.

Cả 3 lỗi đều cùng một dạng: **suy luận ra một quyền hợp lệ khi lẽ ra phải từ chối**. Khi viết bất kỳ đoạn code nào liên quan tới xác thực/phân quyền, hãy tự hỏi: *"Nếu trường hợp này xảy ra ngoài dự kiến, code có đang vô tình cấp quyền không?"*

### 5.2. Cách xác định role sau khi đăng nhập (thứ tự bắt buộc)

```
1. Tìm bản ghi trong `profiles` theo user.id
   → Nếu có → role = profiles.role  (admin | teacher | sale)
2. Không có ở bước 1 → Tìm trong `students` theo `auth_user_id = user.id`
   → Nếu có → role = "student"
3. Không có ở cả 2 bước trên → TỪ CHỐI truy cập
   → redirect `/login?error=unauthorized`, KHÔNG gán bất kỳ role nào
```

### 5.3. Middleware (`proxy.ts`) chỉ bảo vệ ĐIỀU HƯỚNG TRANG, không bảo vệ Server Actions

Next.js Server Actions có thể được gọi trực tiếp (về bản chất là 1 POST endpoint) — việc middleware chặn được `pathname` (`/admin/*`, `/teacher/*`...) **không đồng nghĩa** với việc một Server Action bên trong trang đó đã được bảo vệ khỏi tham số bị giả mạo (ví dụ 1 giáo viên gọi action với `sessionId` của giáo viên khác).

**→ Mọi Server Action xử lý dữ liệu gắn với 1 người dùng cụ thể (teacher, và sau này là sale/student) đều BẮT BUỘC tự kiểm tra quyền sở hữu ngay trong thân hàm, không được tin vào việc "middleware đã chặn" hay "UI không hiển thị nút đó".**

Pattern chuẩn cần áp dụng cho mọi Server Action loại này:
```typescript
"use server";

export async function suaDoiDuLieuNhayCam(resourceId: string, ...) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập" };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role === "admin") {
    // admin: full access
  } else if (profile?.role === "teacher") {
    // BẮT BUỘC: kiểm tra resource này thuộc về đúng user hiện tại
    // ví dụ: lấy session/resource trước, so sánh resource.teacher_id === user.id
    // nếu không khớp → return { error: "Không có quyền truy cập" };
    // KHÔNG dùng tham số ID do client truyền vào để xác định "của ai" —
    // luôn dùng user.id lấy được từ session server-side.
  } else {
    return { error: "Không có quyền truy cập" };
  }
  // ... logic thực sự
}
```

Đã áp dụng đúng pattern này ở: `lib/actions/attendance.ts` (`getAttendanceSheet`, `saveAttendanceSheet`), `lib/actions/teachers.ts` (`getTeacherPersonalEarnings` — khóa cứng `teacherId = user.id`, bỏ qua tham số client truyền vào nếu role là teacher). Xem mục 7 để biết danh sách đầy đủ các hàm đã/chưa áp dụng `requireRole()` — **danh sách này từng bị tài liệu cũ báo sai (claim "đã fix" nhưng thực tế chưa), nên trước khi tin bất kỳ dòng nào ở mục 7 là "đã xong", hãy tự grep lại code thật.**

Khi xây `sale` và `student`, áp dụng đúng nguyên tắc tương tự: Sale chỉ thao tác được lead/admissions do chính mình phụ trách (nếu có phân chia theo nhân viên); Student chỉ xem được dữ liệu của chính bản ghi `students` liên kết với `auth_user_id` của mình.

### 5.4. Row Level Security (RLS) — HIỆN TRẠNG THẬT (đã kiểm tra trực tiếp trên Supabase 2026-09-12)

⚠️ **RLS đã "bật" (`rls_enabled = true`) trên toàn bộ 7 bảng lõi** (`profiles`, `students`, `classes`, `enrollments`, `class_sessions`, `attendance`, `invoices`) — nhưng **KHÔNG bảo vệ gì cả**: mỗi bảng chỉ có đúng 1 policy `"Authenticated users full access"` — `FOR ALL TO authenticated USING (true) WITH CHECK (true)`. Nghĩa là bất kỳ ai đã đăng nhập (Teacher, Sale, Student sau này) đều đọc/sửa/xóa được **mọi dòng** qua REST API trực tiếp của Supabase, bỏ qua hoàn toàn `requireRole()`/ownership check ở tầng Server Action. **Lớp bảo vệ thứ 2 này trên thực tế chưa hề tồn tại** — toàn bộ an toàn hiện tại chỉ dựa vào tầng ứng dụng (mục 5.2/5.3).

4 bảng `center_settings`, `materials`, `assignments`, `submissions` đã được bật RLS đúng cách ngày 2026-09-12 (`center_settings` có policy SELECT công khai vì chứa số tài khoản ngân hàng cần hiển thị VietQR, không có policy ghi nào; 3 bảng còn lại chặn hết vì chưa có tính năng thật dùng tới).

**Việc còn treo:** thiết kế policy thật theo từng role cho 7 bảng lõi (vd: Teacher chỉ SELECT/UPDATE được `class_sessions`/`attendance` của lớp mình dạy) — cần hiểu rõ nghiệp vụ từng role để không khóa nhầm quyền hợp lệ, nên làm sau khi A3/A4 và các phân hệ Sale/Student ổn định. Lưu ý: `createAdminClient()` (service role) **bỏ qua hoàn toàn RLS** theo thiết kế — chỉ dùng cho thao tác quản trị đặc biệt.

## 6. Business Rules

### Phân quyền dữ liệu
- **Admin:** Toàn quyền xem/sửa doanh thu, học phí, tất cả lớp học, tất cả giáo viên, sửa lương/buổi của bất kỳ ai. Tập trung vào quản trị — vận hành trung tâm.
- **Teacher:** Cô lập dữ liệu hoàn toàn theo `teacher_id = user.id`. Chỉ xem được buổi dạy, điểm danh, thu nhập/lương của chính mình — không thấy thông tin giáo viên khác hay tài chính chung.
- **Sale (định hướng):** Sẽ là **chủ sở hữu duy nhất** của tính năng tuyển sinh/admissions (leads, trials, conversions...). Admin **không** thao tác chi tiết tính năng này, chỉ xem **báo cáo tổng hợp** (tự động tổng hợp, hoặc khi Sale bấm "gửi báo cáo").
  - **Nguyên tắc kiến trúc áp dụng chung cho toàn dự án:** *"1 tính năng = 1 chủ sở hữu duy nhất về mặt code/data. Các phân hệ khác cần xem thông tin liên quan chỉ được đọc dữ liệu tổng hợp (report/view riêng), không thao tác trực tiếp lên bảng dữ liệu chi tiết của phân hệ đó."* Áp dụng tương tự cho các trường hợp tương lai (VD: Admin xem báo cáo payroll tổng hợp, không sửa trực tiếp logic tính lương của Teacher).
  - Tính năng admissions hiện đang nằm tạm ở `app/admin/admissions` — team đã tạm dừng phát triển thêm ở đây, sẽ di chuyển toàn bộ sang `app/sale/` khi bắt đầu code phân hệ Sale.
- **Student (định hướng):** Chỉ xem dữ liệu của chính bản thân (lịch học, điểm danh, công nợ...) thông qua liên kết `auth_user_id` với bảng `students`.

### Công thức tính lương giáo viên (`lib/utils/payroll-calculator.ts`, `lib/actions/teachers.ts`)
```
Lương = (Số buổi có status = 'completed' × Thù lao/buổi) + Thưởng − Phạt
```
Chỉ tính buổi `completed`. Buổi `scheduled` (chưa diễn ra) và `cancelled` (bị hủy) **không** tính lương.

### Quy tắc `balance_sessions` (số buổi học còn lại của học sinh)
- Đóng học phí → `balance_sessions` cộng dồn theo số buổi mua.
- `balance_sessions < 0` → cảnh báo "Âm buổi / nợ học phí khẩn cấp" trên Dashboard.
- `balance_sessions <= 2` → cảnh báo để bộ phận Sale/tuyển sinh chủ động liên hệ gia hạn.

### Quy tắc điểm danh & trừ buổi
Khi lưu điểm danh, `class_sessions.status` tự động chuyển thành `completed`.

| Trạng thái điểm danh | Trừ `balance_sessions`? | Lý do |
|---|---|---|
| `present` (có mặt) | ✅ Có | Buổi học đã diễn ra, tiêu tốn tài nguyên (giáo viên, phòng) |
| `absent_unexcused` (vắng không phép) | ✅ Có | Trung tâm đã bố trí giáo viên/lớp học cho học sinh; không trừ sẽ khuyến khích nghỉ tùy tiện không báo trước |
| `absent_excused` (vắng có phép) | ❌ Không (bảo lưu buổi) | Khuyến khích học sinh báo nghỉ trước, tạo thiện chí |

Buổi `class_sessions.status = 'cancelled'` (trung tâm/giáo viên hủy lớp): **không tạo dòng điểm danh**, **không trừ buổi học sinh**, **không tính lương giáo viên** — lỗi thuộc về trung tâm, không phạt học sinh lẫn không trả lương giáo viên cho buổi không diễn ra.


## 7. Known Issues — CẦN XỬ LÝ Ở GIAI ĐOẠN NỀN TẢNG (ưu tiên cao nhất, làm trước khi 4 người code song song)

⚠️ **Lịch sử mục này từng bị 1 phiên AI trước báo sai** (claim "đã fix hết" nhưng thực tế nhiều hàm chưa có kiểm tra quyền nào) — mọi dòng `[x]` dưới đây đã được xác minh lại trực tiếp trên code/DB thật ngày 2026-09-12, không suy ra từ tài liệu cũ.

**Bảo mật ứng dụng (đã fix, xác minh 2026-09-12):**
- [x] `signIn()` (`lib/actions/auth.ts`): đã xóa backdoor cấp quyền admin khi email chứa "admin".
- [x] `getCurrentProfile()` (`lib/actions/auth.ts`): trả `null` khi lỗi, không còn profile giả.
- [x] Logic xác định role (`auth.ts`, `proxy.ts`): fail-closed đúng thứ tự mục 5.2, không mặc định gán role nào.
- [x] IDOR `lib/actions/attendance.ts` (`getAttendanceSheet`, `saveAttendanceSheet`): có ownership check `teacher_id === user.id`.
- [x] IDOR `lib/actions/teachers.ts` (`getTeacherPersonalEarnings`): khóa cứng `teacherId = user.id` khi role teacher.
- [x] IDOR `lib/actions/teachers.ts` (`createTeacher`, `updateTeacher`, `getTeachers`): **trước đó hoàn toàn KHÔNG có kiểm tra đăng nhập/quyền nào** — ai cũng tạo được tài khoản Teacher thật (kể cả chưa đăng nhập, vì `createTeacher` dùng service role qua `createAdminClient()`), sửa/xem lương-STK ngân hàng của bất kỳ giáo viên nào. Đã thêm `requireRole(["admin"])` cho cả 3 hàm.
- [x] Thiếu quyền `lib/actions/students.ts` (`getStudents`, `getStudentById`, `getLowBalanceStudents`): không có kiểm tra quyền, lộ toàn bộ danh sách + thông tin học sinh. Đã thêm `requireRole(["admin","sale"])`.
- [x] Thiếu quyền `lib/actions/invoices.ts` (`createInvoice`, `markInvoiceAsPaid`, `cancelPendingInvoice`, `resolveNegativeDebt`, `deleteInvoice`): không có kiểm tra quyền nào. Đã thêm `requireRole()` (admin+sale cho `createInvoice`, admin-only cho 4 hàm còn lại).
- [x] Xóa `cleanUpTestPendingInvoices()` (hàm test xóa hàng loạt hóa đơn không kiểm soát) — **tài liệu cũ từng báo đã xóa nhưng thực tế vẫn còn trong code tới 2026-09-12**, giờ đã xóa thật.
- [x] Xóa `app/api/test-security/route.ts` — 1 API Route công khai (không phải Server Action) nhận `sessionId`/`teacherId` qua query string rồi gọi thẳng `getAttendanceSheet`/`getTeacherPersonalEarnings`, vi phạm quy tắc "không dùng API Routes cho logic nghiệp vụ" ở mục 3. Không bị khai thác trực tiếp (2 hàm đó tự có ownership check) nhưng là công cụ dò IDOR bỏ quên trong code, đã xóa.
- [x] Xóa `lib/supabase/proxy.ts` (code thừa từ template Supabase ban đầu, trỏ sai `/auth/login`).
- [x] `types/database.ts` bị lệch schema thật — thiếu `Enrollment.status/paused_at`, `Class.end_date`, `Student.updated_at`. Đã bổ sung.

**🔴 Bảo mật/toàn vẹn dữ liệu tầng Database — đã fix 2026-09-13 (chủ dự án tự chạy SQL, Claude không có quyền ghi DB trực tiếp):**
- [x] 3 trigger Postgres từng chạy thật nhưng KHÔNG được ghi lại ở bất kỳ file migration nào — đã xác minh xóa/sửa xong trên DB thật:
  1. `on_auth_user_created` → `handle_new_user()`: từng mặc định gán `profiles.role = 'teacher'` khi tạo `auth.users` không kèm `role` — đã sửa chỉ insert `profiles` khi role hợp lệ (admin/teacher/sale).
  2. `on_attendance_balance_change`: từng trùng lặp với logic trừ buổi trong `saveAttendanceSheet()` gây trừ buổi 2 lần — đã xóa trigger.
  3. `on_invoice_paid_trigger`: từng trùng lặp với logic cộng buổi trong `createInvoice()`/`markInvoiceAsPaid()` gây cộng buổi 2 lần — đã xóa trigger.
- [x] `saveAttendanceSheet()` — sửa thêm bug tầng code (độc lập với 3 trigger trên): lưu/sửa lại 1 buổi điểm danh nhiều lần từng trừ buổi nhiều lần (không so sánh trạng thái cũ/mới); `absent_unexcused` từng không trừ buổi (sai quy tắc mục 6); buổi `cancelled` từng vẫn điểm danh được. Đã sửa cả 3 ngày 2026-09-13.
- [x] `markInvoiceAsPaid()` — thêm chặn xác nhận thanh toán 2 lần cho cùng 1 hóa đơn (từng cộng buổi 2 lần nếu bấm xác nhận lặp lại).
- [x] `deleteClassSession()` — thêm hoàn buổi cho học sinh đã điểm danh trước khi xóa (từng mất buổi vĩnh viễn nếu Admin xóa nhầm 1 ca đã điểm danh).
- [x] Xóa `app/admin/invoices/invoices-client.tsx` và `lib/utils/payroll-calculator.ts` (2 file code chết đã xác nhận, `payroll-calculator.ts` chứa số liệu bịa — nguy cơ bị import nhầm lại).
- [x] `proxy.ts` — thêm ngoại lệ cho `/update-password`: trước đó 1 tài khoản có session hợp lệ nhưng chưa xác định được role (vd đang xử lý link đặt lại mật khẩu) sẽ bị đá về `/login?error=unauthorized` giữa chừng, không hoàn tất đổi mật khẩu được.
- [ ] `getCenterBankSettings()` (`lib/actions/settings.ts`) trả về `DEFAULT_CENTER_BANK_SETTINGS` (số tài khoản giả) khi query lỗi thay vì báo lỗi rõ ràng — vi phạm mục 11.1. Ưu tiên thấp hơn, gộp vào đợt dọn dữ liệu giả tiếp theo.
- [ ] Còn 1 số hằng số mock chưa dọn: `DEFAULT_CASH_FLOW_12_MONTHS`/`DEFAULT_AI_ADVISOR` (`app/admin/analytics/analytics-client.tsx`), `DEFAULT_OFFICIAL_CLASSES`/`DEFAULT_FIXED_TRIAL_SLOTS` (`components/admissions/conversions-tab.tsx`, `types/admissions.ts`).

**Nghiệp vụ Admin/Teacher còn treo (2026-09-13) — KHÔNG chặn code song song Sale/Student, để người phụ trách Admin/Teacher xử lý tiếp khi quay lại phân hệ đó. Chi tiết đầy đủ ở `docs/context-handoff.md` Mục 15.2:**
- [ ] 4 dialog bỏ qua `result.error` từ Server Action, ghi dữ liệu giả vào store khi thất bại: `class-dialog.tsx`, `teacher-dialog.tsx` (còn ghi email giả), `student-dialog.tsx` (còn reset nhầm số buổi về 12), `add-student-dialog.tsx`. **Xem quy tắc bắt buộc mới ở mục 3 (Server Actions) để không lặp lại lỗi này khi viết dialog cho Sale/Student.**
- [ ] Đổi giáo viên phụ trách hoặc đổi lịch học của 1 lớp (`updateClass`) không đồng bộ lại `class_sessions` đã sinh trước đó (giáo viên mới bị chặn xem buổi cũ, giáo viên cũ vẫn được tính lương buổi không dạy; đổi lịch để lại session "ma" theo lịch cũ).
- [ ] Công thức lương "Thưởng − Phạt" (mục 6) chưa persist thật — `payroll-tab.tsx` chỉ lưu tạm ở state, mất khi F5. Cần thêm cột DB nếu muốn dùng thật.
- [ ] `getTeacherPersonalEarnings` và `getTeacherPayroll` tính thu nhập giáo viên theo 2 công thức khác nhau khi có dạy thay — ra 2 số khác nhau cho cùng 1 tháng.
- [ ] `getFinancialHubData`/`analytics.ts` cộng dồn `balance_sessions` xuyên suốt các lớp của 1 học sinh thay vì tính riêng từng lượt ghi danh — làm sai KPI tổng buổi còn lại và tỷ lệ gia hạn.
- [ ] Vài chỗ tính "hôm nay" bằng giờ UTC thay vì giờ Việt Nam (`dashboard.ts`, `sessions.ts:getTodaySessions`, `analytics.ts:monthlyRevenue`) — có thể lệch ngày/tháng gần nửa đêm.
- [ ] `payroll-tab.tsx`: đổi tháng/năm trên bộ lọc chỉ đổi nhãn hiển thị, không gọi lại dữ liệu — hiện sai số dưới nhãn tháng khác.

**Hạ tầng/quy trình:**
- [x] Migration cho `students.auth_user_id`, `students.updated_at` (+trigger), `students.birth_date`/`note`, `enrollments.status`/`paused_at`, `classes.end_date`, RLS `center_settings`/`materials`/`assignments`/`submissions` — cột/bảng đã tồn tại thật trên DB, file `.sql` backfill vào repo (xem `supabase/migrations/`).
- [x] **[Route]** Đã tạo `app/sale/` (`/sale/admissions`), `app/student/` (`/student/dashboard`) — placeholder tối thiểu, có kiểm tra quyền đúng, tránh lỗi 404 khi cấp tài khoản 2 role này.
- [x] **[Git]** Đã commit (7 commit tách nhóm) + tạo và push `develop`/`feature/admin`/`feature/teacher`/`feature/sale`/`feature/student` lên GitHub.
- [x] **[Tính năng]** `createAccountByAdmin()` (`lib/actions/auth.ts`) — đã gắn UI thật tại `app/admin/accounts` (menu "Quản lý Tài khoản"), cho phép Admin tạo tài khoản Admin/Teacher/Sale, hoặc gán tài khoản đăng nhập cho 1 học sinh đã có sẵn (role Student). Nhân tiện vá 1 lỗi tương tác mới: `createAccountByAdmin()` từng `.insert()` thẳng vào `profiles`, nay đổi sang `.upsert()` vì trigger `handle_new_user()` (đã sửa ngày 2026-09-12) giờ tự tạo sẵn 1 dòng `profiles` cơ bản ngay khi tạo `auth.users` — insert thẳng sẽ lỗi trùng khóa chính.
- [ ] **[Sau này]** Thiết lập RLS thật theo từng role cho 7 bảng lõi (xem mục 5.4 — hiện đang "bật nhưng rỗng ruột"). Cố ý hoãn tới gần lúc lên thật/có khách hàng thật — làm quá sớm khi Sale/Student chưa code xong dễ đoán sai policy, chặn nhầm chính team.

## 8. Git Workflow

- **Nhánh chính:** `master` (repo: `github.com/truongviethai26082005-arch/Webdemo.git`)
- **Đã tạo và push lên GitHub ngày 2026-09-12:** `develop`, `feature/admin`, `feature/teacher`, `feature/sale`, `feature/student` — đều đang ở cùng điểm xuất phát với `master` (đã bao gồm toàn bộ fix bảo mật + dọn dữ liệu giả + A3/A4 của phiên 2026-09-12). Mỗi người trong team `git checkout feature/<phân-hệ-của-mình>` để bắt đầu, không cần tự tạo nhánh.
- **Quy trình làm việc song song:**
  1. Mỗi phân hệ code trên đúng nhánh `feature/<role>` của mình.
  2. Merge về `develop` thường xuyên (ít nhất mỗi ngày, không để tích lũy nhiều ngày rồi mới merge — diff do AI tạo ra thường lớn, để lâu sẽ rất khó merge/review).
  3. Chỉ merge `develop` → `master` khi đã ổn định và test kỹ.
- **Khi cần sửa file dùng chung** (schema/types, `lib/supabase/*`, `proxy.ts`, `components/ui/*`): báo trước trong nhóm, làm nhanh, merge sớm, các nhánh khác `pull`/`rebase` về ngay để tránh conflict lớn.
- **Commit message:** rõ ràng, tách riêng fix bảo mật khỏi feature mới (không gộp chung 1 commit).
- Trước khi merge PR đụng vào file chung, nên có người review riêng (đặc biệt các thay đổi liên quan `profiles`, auth, middleware).

## 9. Nguyên tắc kiến trúc khi mở rộng phân hệ mới (Sale, Student)

1. Theo đúng khuôn mẫu route/component/Server Action đã có ở `admin`/`teacher` (mục 3).
2. Áp dụng đúng mô hình phân quyền fail-closed + ownership check (mục 5).
3. Áp dụng nguyên tắc "1 tính năng = 1 chủ sở hữu" khi tính năng có thể chồng lấn giữa 2 phân hệ (mục 6, ví dụ Sale/Admin với admissions).
4. Next.js 16 là bản canary — luôn kiểm tra `node_modules/next/dist/docs/` khi dùng API/convention mới, không code theo kiến thức Next.js 13/14 cũ (đúng như block hướng dẫn tự sinh ở đầu file AGENTS.md).
5. Trước khi tạo bảng/cột mới trong Supabase, cập nhật `types/database.ts` trong cùng lần thay đổi, và lưu SQL migration vào repo.

### Quy tắc bắt buộc: Đồng bộ khi Lead chuyển đổi thành Học sinh (Sale → Admin/Teacher)
Khi phân hệ Sale được xây dựng, hàm xử lý "Ghi danh & Chuyển đổi" (khi
khách hàng thanh toán thành công) BẮT BUỘC phải:
1. Gọi `createStudent()` (đã phân quyền admin+sale) để tạo bản ghi học
   sinh thật trong bảng `students` — KHÔNG tự tạo cơ chế lưu trữ riêng.
2. Gọi `enrollStudentInClass()` (đã phân quyền admin+sale) với đúng
   `class_id` khách hàng đã chọn, để tạo bản ghi `enrollments` thật.
3. Gọi `revalidatePath()` cho các trang thuộc phân hệ khác bị ảnh hưởng:
   `/admin/students`, `/admin/classes/[id]`, `/admin/dashboard`,
   `/teacher/classes` — để Admin/Teacher thấy dữ liệu mới ngay lập tức,
   không cần đợi cache hết hạn.
4. Khi thiết kế bảng `leads` (tương lai), thêm cột `converted_student_id`
   (FK tới `students.id`, nullable) để giữ dấu vết liên kết Lead → Học
   sinh, phục vụ báo cáo/truy vết.

Nguyên tắc chung rút ra: khi 1 hành động ở phân hệ A cần tạo/sửa dữ liệu
thuộc "lãnh địa" của phân hệ B, PHẢI tái sử dụng đúng Server Action đã có
sẵn của phân hệ B (đã được phân quyền đúng), không tự viết luồng dữ liệu
song song riêng — tránh 2 nguồn dữ liệu không đồng bộ.

## 10. Behavioral Guidelines khi AI code (giữ nguyên từ CLAUDE.md gốc — nhắc lại để không bị bỏ sót)

- **Think before coding:** nêu rõ giả định, nếu có nhiều cách hiểu thì trình bày cả các lựa chọn thay vì tự chọn 1 cách âm thầm.
- **Simplicity first:** code tối thiểu đủ giải quyết vấn đề, không thêm tính năng/abstraction không được yêu cầu.
- **Surgical changes:** chỉ sửa đúng phần liên quan tới yêu cầu, không "tiện tay" refactor code xung quanh, không tự ý sửa file dùng chung ngoài phạm vi được giao (xem thêm mục 5.3 và mục 8 về ranh giới file).
- **Goal-driven execution:** với mỗi task, nêu kế hoạch ngắn dạng bước → cách kiểm chứng.
- **Không dùng browser tools/subagent để tự verify sau khi sửa code** — chỉ báo hoàn thành để người dùng tự test.
### 11 — Quy tắc bắt buộc khi làm việc với AI coding agent (Claude Code / khác)

**11.1. Không tự bịa số liệu khi thiếu dữ liệu thật:**
Khi 1 giá trị/cột dữ liệu chưa có hoặc null, KHÔNG tự động điền số mặc định
"cho đẹp" (VD: `?? 12`, `|| 24`, hằng số DEFAULT_*). Phải làm 1 trong 2:
(a) hiển thị đúng sự thật — nếu là số đếm thì `?? 0`, nếu là dữ liệu cấu hình
chưa nhập thì hiện rõ "Chưa có dữ liệu"/"Sắp ra mắt", KHÔNG che giấu trạng thái
trống bằng số giả; hoặc (b) hỏi lại người dùng nếu không chắc cách xử lý đúng
là gì. Đây là lỗi đã xảy ra nhiều lần trong dự án này (xem AGENTS.md mục 11.3)
— tuyệt đối tránh lặp lại.

**11.2. Thay đổi liên quan tới database (Supabase) luôn tách làm 2 bước riêng:**
Bước 1 — viết/sửa code. Bước 2 — chạy migration SQL. KHÔNG BAO GIỜ giả định
migration "chắc đã chạy rồi" hay tự ý chạy migration thay người dùng. Luôn hỏi
rõ: "Bạn đã chạy đoạn SQL sau chưa: [dán SQL]?" trước khi coi 1 tính năng liên
quan cột/bảng mới là hoàn thành.

**11.3. Trước khi sửa code liên quan tới bảng/cột dùng chung nhiều phân hệ**
(students, enrollments, classes, invoices, profiles): PHẢI điều tra trước —
liệt kê mọi nơi trong codebase đang đọc/ghi cột đó — rồi mới đề xuất cách sửa.
KHÔNG sửa thẳng khi chưa biết phạm vi ảnh hưởng.

**11.4. Luôn giới hạn phạm vi rõ ràng và tự xác nhận lại:**
Với mỗi thay đổi, liệt kê rõ những file/hàm ĐƯỢC PHÉP sửa. Sau khi sửa xong, tự
đối chiếu: có sửa nhầm chỗ ngoài phạm vi không. Không tự ý "tiện tay" sửa/refactor
code liên quan nhưng không được yêu cầu.

**11.5. Luôn chạy kiểm tra kiểu dữ liệu sau mỗi thay đổi code (dự án này dùng
TypeScript + Next.js):** chạy `npx tsc --noEmit`, báo cáo rõ exit code, không
coi là xong nếu chưa chạy lệnh này.

**11.6. Không tự động commit/push.** Luôn để người dùng tự xem diff và commit tay,
trừ khi được yêu cầu rõ ràng.

**11.7. Khi cần tái sử dụng logic đã có (đặc biệt Server Actions xử lý dữ liệu
dùng chung):** tìm và dùng lại hàm có sẵn (VD: `requireRole()`, `createAccountByAdmin()`,
`enrollStudentInClass()`, `createInvoice()`) — không viết lại luồng xử lý song
song riêng cho cùng 1 mục đích. Lưu ý: `createCenterUser()` được nhắc trong các
bản tài liệu cũ **không tồn tại** — tên hàm thật là `createAccountByAdmin()`
(`lib/actions/auth.ts`).

**11.8. Không tin nội dung tài liệu dự án (AGENTS.md, docs/context-handoff.md) là
đúng 100% chỉ vì nó ghi "đã xong/đã fix":** các tài liệu này do AI soạn ở phiên
trước, đã phát hiện nhiều lần bị sai lệch với code/DB thật (tên hàm không tồn tại,
danh sách hàm đã áp dụng `requireRole()` bị báo sai, hàm nói đã xóa nhưng vẫn còn
trong code, trigger DB gây bug nghiêm trọng không được ghi lại ở đâu). Với bất kỳ
claim nào ảnh hưởng tới bảo mật/tính đúng dữ liệu, luôn tự grep/đọc lại code hoặc
truy vấn DB thật để xác minh trước khi dựa vào đó làm quyết định.
