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

**Enum `UserRole` sẽ mở rộng:** `'admin' | 'teacher' | 'sale' | 'student'`. Lưu ý: `'student'` ở đây là **role đăng nhập**, khác với bảng `students` (danh sách học sinh) — một bản ghi `students` có thể có hoặc chưa có tài khoản đăng nhập (`auth_user_id` có thể `null`).

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

Áp dụng ngay cho (đang trong danh sách cần fix — xem mục 7): `lib/actions/attendance.ts` (`getAttendanceSheet`, `saveAttendanceSheet`), `lib/actions/teachers.ts` (`getTeacherPersonalEarnings` — khóa cứng `teacherId = user.id`, bỏ qua tham số client truyền vào nếu role là teacher).

Khi xây `sale` và `student`, áp dụng đúng nguyên tắc tương tự: Sale chỉ thao tác được lead/admissions do chính mình phụ trách (nếu có phân chia theo nhân viên); Student chỉ xem được dữ liệu của chính bản ghi `students` liên kết với `auth_user_id` của mình.

### 5.4. Row Level Security (RLS) — lớp bảo vệ thứ 2 (làm sau khi ổn định app-level check)

Dự kiến bật RLS trên `attendance`, `class_sessions`, `profiles` (có thể mở rộng `invoices`, `enrollments` sau). Lưu ý: `createAdminClient()` (service role) **bỏ qua hoàn toàn RLS** theo thiết kế — chỉ dùng cho thao tác quản trị đặc biệt. Sau khi bật RLS, cần test lại toàn bộ tính năng vì policy sai có thể chặn nhầm truy vấn hợp lệ.

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

- [ ] **[Bảo mật – nghiêm trọng]** `signIn()` trong `lib/actions/auth.ts`: khi Supabase báo lỗi đăng nhập, code đang fallback cấp quyền admin nếu email chứa "admin" — bất kể mật khẩu đúng/sai. **Phải xóa hoàn toàn nhánh xử lý này.**
- [ ] **[Bảo mật – nghiêm trọng]** `getCurrentProfile()` trong `lib/actions/auth.ts`: khi gặp lỗi/exception, đang trả về 1 profile admin giả (`demo-admin-id`) thay vì `null`/throw lỗi. **Phải sửa để trả về `null` khi không xác thực được, gọi nơi dùng hàm này phải xử lý trường hợp `null` bằng cách từ chối truy cập.**
- [ ] **[Bảo mật – nghiêm trọng]** Logic xác định role (trong `auth.ts` và `proxy.ts`) đang mặc định gán `"teacher"` cho user không tìm thấy trong `profiles` lẫn `students`. **Phải đổi theo đúng thứ tự ở mục 5.2, mặc định là từ chối (`/login?error=unauthorized`), không gán role nào.**
- [ ] **[Bảo mật – IDOR]** `lib/actions/attendance.ts` (`getAttendanceSheet`, `saveAttendanceSheet`) chưa xác nhận có kiểm tra `session.teacher_id === user.id` khi role là teacher. Cần bổ sung theo pattern ở mục 5.3.
- [ ] **[Bảo mật – IDOR]** `lib/actions/teachers.ts` (`getTeacherPersonalEarnings`): cần khóa cứng `teacherId = user.id` khi role là teacher, không dùng tham số client truyền vào.
- [ ] **[Dọn dẹp]** Xóa `lib/supabase/proxy.ts` (hàm `updateSession` cũ, không được gọi ở đâu, trỏ sai đường dẫn `/auth/login` thay vì `/login`) — code thừa từ template Supabase ban đầu.
- [ ] **[Hạ tầng DB]** Chạy migration trên Supabase (lưu file `.sql` vào repo, ví dụ `supabase/migrations/`, để cả team đồng bộ schema):
  ```sql
  ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);
  -- Cập nhật CHECK constraint của profiles.role để cho phép 'sale'
  ```
- [ ] **[Route]** Chưa tạo `app/sale/`, `app/student/`. Nếu bật logic redirect cho 2 role này trước khi có route, user sẽ gặp lỗi 404. Cân nhắc tạo trang placeholder tối thiểu, hoặc chưa cấp tài khoản `sale`/`student` cho tới khi route sẵn sàng.
- [ ] **[Git]** Các thay đổi fix bảo mật (`auth.ts`, `types/database.ts`, `proxy.ts`, `app/layout.tsx`) đang uncommitted local — commit riêng (không gộp feature khác), ví dụ: `fix: khắc phục lỗ hổng bypass đăng nhập và mở rộng UserRole`, push lên `master` ngay vì đây là fix bảo mật.
- [ ] **[Tính năng – chưa gấp]** UI cho Admin tạo tài khoản (dùng `createAdminClient()` đã có sẵn ở backend) chưa được gắn vào Form/Modal/nút bấm nào.
- [ ] **[Sau này]** Thiết lập RLS trên `attendance`, `class_sessions`, `profiles` làm lớp bảo vệ thứ 2 (xem mục 5.4).

## 8. Git Workflow

- **Nhánh chính hiện tại:** `master` (repo: `github.com/truongviethai26082005-arch/Webdemo.git`)
- **Khuyến nghị khi chuyển sang code song song 4 người:**
  1. Tạo nhánh `develop` từ `master`.
  2. Mỗi phân hệ làm trên nhánh riêng: `feature/admin`, `feature/teacher`, `feature/sale`, `feature/student`.
  3. Merge về `develop` thường xuyên (ít nhất mỗi ngày, không để tích lũy nhiều ngày rồi mới merge — diff do AI tạo ra thường lớn, để lâu sẽ rất khó merge/review).
  4. Chỉ merge `develop` → `master` khi đã ổn định.
- **Khi cần sửa file dùng chung** (schema/types, `lib/supabase/*`, `proxy.ts`, `components/ui/*`): báo trước trong nhóm, làm nhanh, merge sớm, các nhánh khác `pull`/`rebase` về ngay để tránh conflict lớn.
- **Commit message:** rõ ràng, tách riêng fix bảo mật khỏi feature mới (không gộp chung 1 commit).
- Trước khi merge PR đụng vào file chung, nên có người review riêng (đặc biệt các thay đổi liên quan `profiles`, auth, middleware).

## 9. Nguyên tắc kiến trúc khi mở rộng phân hệ mới (Sale, Student)

1. Theo đúng khuôn mẫu route/component/Server Action đã có ở `admin`/`teacher` (mục 3).
2. Áp dụng đúng mô hình phân quyền fail-closed + ownership check (mục 5).
3. Áp dụng nguyên tắc "1 tính năng = 1 chủ sở hữu" khi tính năng có thể chồng lấn giữa 2 phân hệ (mục 6, ví dụ Sale/Admin với admissions).
4. Next.js 16 là bản canary — luôn kiểm tra `node_modules/next/dist/docs/` khi dùng API/convention mới, không code theo kiến thức Next.js 13/14 cũ (đúng như block hướng dẫn tự sinh ở đầu file AGENTS.md).
5. Trước khi tạo bảng/cột mới trong Supabase, cập nhật `types/database.ts` trong cùng lần thay đổi, và lưu SQL migration vào repo.

## 10. Behavioral Guidelines khi AI code (giữ nguyên từ CLAUDE.md gốc — nhắc lại để không bị bỏ sót)

- **Think before coding:** nêu rõ giả định, nếu có nhiều cách hiểu thì trình bày cả các lựa chọn thay vì tự chọn 1 cách âm thầm.
- **Simplicity first:** code tối thiểu đủ giải quyết vấn đề, không thêm tính năng/abstraction không được yêu cầu.
- **Surgical changes:** chỉ sửa đúng phần liên quan tới yêu cầu, không "tiện tay" refactor code xung quanh, không tự ý sửa file dùng chung ngoài phạm vi được giao (xem thêm mục 5.3 và mục 8 về ranh giới file).
- **Goal-driven execution:** với mỗi task, nêu kế hoạch ngắn dạng bước → cách kiểm chứng.
- **Không dùng browser tools/subagent để tự verify sau khi sửa code** — chỉ báo hoàn thành để người dùng tự test.
