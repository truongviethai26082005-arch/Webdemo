Nhật ký làm việc — Phân hệ Tuyển sinh (Sale)
> File này CHỈ dành cho người phụ trách phân hệ Sale ghi lại tiến độ, quyết
> định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác sửa
> file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án.
>
> **File này đã được tổng hợp lại ngày 2026-09-15** để gọn hơn — mục "Trạng
> thái hiện tại" ngay dưới đây đủ để nắm toàn bộ tình hình mà không cần đọc
> hết "Nhật ký" chi tiết bên dưới. Chỉ đọc "Nhật ký" khi cần tra lại lý do/
> chi tiết kỹ thuật của 1 quyết định cụ thể.

## Trạng thái hiện tại — Tổng hợp (cập nhật 2026-09-15)

### Đã xây xong, đang hoạt động thật (đã kiểm chứng qua dữ liệu thật trên Supabase)

| Trang/Tính năng | Route | Ghi chú |
|---|---|---|
| Lịch làm việc hôm nay | `/sale/daily-tasks` | Tổng hợp việc cần làm trong ngày |
| Phễu Tuyển sinh (CRM 3 tab) | `/sale/admissions` | Leads, Học thử, Chốt đơn + biểu đồ phễu SVG + KPI bar |
| Học sinh chờ xếp lớp | `/sale/admissions/waiting-list` | Đã đóng tiền, chưa có lớp phù hợp |
| Tài khoản Học sinh | `/sale/accounts` | Sale toàn quyền tạo/đặt lại mật khẩu học sinh |
| Phản ánh & Góp ý | `/sale/feedback` | **Mới 2026-09-15**, code xong, **DB CHƯA chạy migration** |
| Thêm nhanh Lead | Nút nổi (FAB), mọi trang Sale | `quickCreateLead()` |

5 bảng DB riêng của Sale: `leads`, `lead_interactions`, `trial_slots`,
`lead_trials` (đã chạy migration, có dữ liệu thật) + `feedback_tickets`
(đã viết migration, **CHƯA CHẠY**, xem "Việc cần làm tiếp" bên dưới).

### Việc chủ dự án cần làm tiếp

1. **Chạy migration `feedback_tickets`** — file
   `supabase/migrations/20260915_create_sale_feedback_tickets_schema.sql`,
   dán vào Supabase Dashboard → SQL Editor → Run. Trước khi chạy, trang
   `/sale/feedback` sẽ báo lỗi khi tạo/xem phản ánh (bảng chưa tồn tại) —
   đúng kiểu lỗi đã từng gặp với `leads` trước đây.
2. Quyết định có muốn đầu tư 1 dịch vụ đọc biến động số dư ngân hàng
   (Casso/SePay...) để tự động hóa xác nhận thanh toán hay không — hiện tại
   vẫn xác nhận thủ công (nút "Xác nhận thành công", đã hoạt động đúng).
3. Xác nhận có muốn xóa hẳn `app/admin/admissions` (giao diện mock cũ, đã mồ
   côi route từ khi `app/admin/page.tsx` đổi redirect) hay giữ lại tham khảo.
4. Toàn bộ thay đổi của phân hệ Sale vẫn đang **uncommitted trên git** — tự
   xem diff và commit khi sẵn sàng (Claude không tự commit/push).

### Quyết định kiến trúc đã chốt (áp dụng khi viết code Sale mới)

- **Tách `stage`** (đang ở giai đoạn nào của phễu: inquiry/trial/conversion/
  enrolled/waiting_class) **khỏi `status`** (kết quả chăm sóc: new/contacted/
  callback/no_demand/converted) — 2 khái niệm độc lập, không lẫn vào nhau.
- **Chốt đơn luôn tách 2 bước:** Bước 1 ghi nhận thanh toán ngay (tạo học
  sinh + hóa đơn `paid`) bất kể đã có lớp hay chưa; Bước 2 xếp lớp CHỈ khi có
  lớp phù hợp và còn chỗ, nếu không thì vào "chờ xếp lớp" — không bao giờ tạo
  `class_id`/`enrollments` giả để "cho có".
- **Không dùng cron/job nền** — mọi trạng thái tự động (VD: hết hạn bảo lưu,
  ca học thử đầy/mở lại) đều tính TẠI THỜI ĐIỂM ĐỌC dữ liệu, theo đúng ưu
  tiên "miễn phí, ít hạ tầng" của dự án.
- **"1 tính năng 1 chủ sở hữu"** — khi Sale cần tạo/sửa dữ liệu thuộc lãnh
  địa Admin (học sinh, hóa đơn, ghi danh, tài khoản đăng nhập), luôn tái
  dùng đúng Server Action đã có sẵn (`createStudent`, `createInvoice`,
  `enrollStudentInClass`, `createAccountByAdmin`, `resetStudentPassword`) —
  KHÔNG tự viết luồng lưu trữ song song.
- **Web-to-Lead API: đã xây rồi GỠ BỎ hoàn toàn** (chủ dự án quyết định vì
  không nắm rõ cách vận hành) — hiện KHÔNG tồn tại trong hệ thống, không cần
  nhắc lại hay khôi phục trừ khi chủ dự án yêu cầu lại từ đầu.
- **Kênh phản ánh/nguồn Lead luôn bắt buộc chọn thật, không có giá trị mặc
  định** (bài học từ lỗi "nguồn tiếp nhận" — xem Nhật ký 2026-09-15).

### Vấn đề đã phát hiện & vá (tóm tắt — chi tiết đầy đủ ở Nhật ký nếu cần)

- Lỗ hổng sĩ số ca học thử (`registerLeadTrials` không kiểm tra server-side).
- "Nguồn tiếp nhận" tự bịa giá trị mặc định khi Sale quên chọn.
- Xung đột z-index: `SelectContent` (`z-50`) bị `DialogOverlay` (`z-[60]`)
  che khuất — đã vá tại 8 vị trí bằng cách ghi đè `className="z-[70]"`,
  KHÔNG sửa file `components/ui/*` dùng chung.
- 3 lỗ hổng hạ tầng dùng chung đã vá TRƯỚC khi bàn giao Sale (2026-09-14):
  `createStudent()` từng tự bịa số buổi + nuốt lỗi ghi danh;
  `createAccountByAdmin()` từng có mật khẩu mặc định `"password123"`;
  `submitLead()` (form landing page B2B, không liên quan phụ huynh) từng
  trùng tên bảng `leads` với Sale — đã đổi sang `landing_page_leads`.
- **Sale được xác nhận có quyền quản lý đầy đủ tài khoản đăng nhập học sinh**
  (không chỉ xem) — dùng 3 hàm có sẵn: `getStudentAccountsOverview()`,
  `createAccountByAdmin({..., role: "student"})` (chặn cứng ở server, Sale
  không thể tạo tài khoản Admin/Teacher/Sale dù truyền gì), `resetStudentPassword()`.

### Liên kết với Admin/Teacher/Student

5 điểm nối duy nhất, đều qua Server Action dùng chung đã có sẵn (xác nhận
bằng grep toàn bộ repo, không suy đoán):

| Sale gọi hàm | Ảnh hưởng |
|---|---|
| `createStudent()` | Admin thấy ngay ở `/admin/students` |
| `createInvoice()` | Cộng doanh thu `/admin/finance`, `/admin/invoices` |
| `enrollStudentInClass()` | Admin thấy sĩ số lớp; Teacher thấy học sinh trong lớp/điểm danh |
| `createAccountByAdmin()` / `resetStudentPassword()` | Mở/đổi khả năng đăng nhập của Student |

4 bảng riêng của Sale (`leads`, `lead_interactions`, `trial_slots`,
`lead_trials`) và bảng mới `feedback_tickets` — **không phân hệ nào khác đọc/
ghi trực tiếp**, cô lập hoàn toàn trong `lib/actions/admissions.ts` và
`lib/actions/feedback.ts`.

⚠️ **Khoảng trống lớn nhất còn lại:** `app/sale/layout.tsx` chặn cứng chỉ
role `"sale"` mới vào được — dù các Server Action đã cho phép cả `"admin"`
gọi (`requireRole(["sale","admin"])`), **Admin hiện KHÔNG có bất kỳ trang nào
đọc được báo cáo/dữ liệu tổng hợp từ Sale** (đúng như kiến trúc gốc dự định
"Admin xem báo cáo tổng hợp Tuyển sinh" nhưng chưa từng có UI nào làm việc
đó). `students.note` (Sale ghi khi chốt đơn) có hiển thị ở `/admin/students`
nhưng KHÔNG hiển thị bên Teacher ở đâu cả.

### Backlog — đã phân tích khả thi, CHƯA code (chỉ làm khi có nhu cầu thật)

1. **Tra cứu Slot lớp học real-time cho Sale** — khả thi cao nhất, effort
   thấp: dữ liệu (`classes.room/max_students`) và logic tính sĩ số đã có sẵn
   ở Admin (`classes-client.tsx`), chỉ cần "mở khóa" cho Sale đọc. Đi kèm: vá
   `enrollStudentInClass()` hiện KHÔNG kiểm tra `max_students` trước khi ghi
   danh (lỗ hổng cùng dạng với sĩ số ca học thử đã vá).
2. **Quản lý vòng đời học viên** (bảo lưu/chuyển lớp/thôi học) — effort cao
   nhất, đụng tài chính (lãnh địa Admin), nên chia 2 giai đoạn: Sale chỉ tạo
   "yêu cầu", Admin duyệt + tính bù trừ tài chính thật.
3. **Phản ánh & Góp ý Giai đoạn 2/3** — mức khẩn cấp thật, cảnh báo quá hạn,
   định tuyến sang Admin/Teacher (cần trang mới bên các phân hệ đó trước).
4. RLS thật theo từng role cho các bảng Sale — hoãn có chủ đích, giống hiện
   trạng 7 bảng lõi (AGENTS.md Mục 5.4).

---

## Đặc tả luồng nghiệp vụ Phễu Tuyển sinh (chốt với chủ dự án ngày 2026-09-14)

**Luồng tổng quát:**
```
Học sinh điền form đăng ký (hoặc Sale nhập tay hộ) → dữ liệu vào ĐẦU phễu
  → đi qua các giai đoạn chăm sóc trong phễu
  → cuối phễu, học sinh đồng ý chốt học
  → tùy lớp/hình thức học (theo buổi hay theo khóa) → tạo mã QR chuyển khoản
    (số tiền + nội dung chuyển khoản cá nhân hóa riêng cho từng hóa đơn)
  → khi khách chuyển khoản thành công → Sale xác nhận (thủ công hiện tại)
  → đẩy dữ liệu sang Admin & Teacher (nếu đã có lớp phù hợp)
```

### Quyết định kiến trúc quan trọng: TÁCH "xác nhận đã thanh toán" khỏi "xếp vào lớp cụ thể"

**Bước 1 — Ghi nhận thanh toán (LUÔN LUÔN làm ngay, bất kể đã có lớp hay chưa):**
1. Gọi `createStudent()` để tạo bản ghi học sinh thật.
2. Gọi `createInvoice()` để ghi nhận hóa đơn đã thanh toán — đảm bảo doanh
   thu/công nợ trên Admin luôn chính xác NGAY LẬP TỨC.
3. KHÔNG tự viết luồng lưu trữ riêng — tái sử dụng đúng 2 hàm có sẵn.

**Bước 2 — Xếp vào lớp cụ thể (CHỈ làm khi đã có lớp phù hợp VÀ còn chỗ trống):**
- Có lớp đúng môn/khung giờ và còn chỗ → gọi ngay `enrollStudentInClass()`.
- Chưa có lớp phù hợp hoặc đã đầy → học sinh vào trạng thái "đã đóng tiền,
  chờ xếp lớp" (`leads.stage = 'waiting_class'`) — KHÔNG tạo `enrollments`/
  `class_id` giả để "cho có". Khi có lớp mới/còn chỗ, quay lại xếp lớp qua
  trang "Học sinh chờ xếp lớp".

**Báo cáo cho Admin (đọc tổng hợp, KHÔNG thao tác trực tiếp dữ liệu Sale):**
lọc `students` có hóa đơn `paid` nhưng CHƯA có `enrollments` active tương
ứng — về lý thuyết Admin tự query ra được từ 2 bảng `students`/`invoices`,
nhưng **thực tế chưa có trang nào bên Admin làm việc này** (xem "Khoảng trống
lớn nhất còn lại" ở trên).

### Xử lý "lớp chưa đủ sĩ số để khai giảng" — không cần đổi schema

`lib/utils/session-generator.ts` chỉ tự sinh buổi học khi lớp đã có
`start_date`. Admin có thể tạo lớp và cho ghi danh (đếm sĩ số) TRƯỚC khi đặt
ngày khai giảng; khi đủ sĩ số mới đặt `start_date`, Teacher mới thấy lớp
trong "Lịch dạy học". Trạng thái "chưa có buổi học nào" tự nhiên là tín hiệu
"đang chờ đủ sĩ số", không cần cờ trạng thái riêng.

### Tích hợp xác nhận thanh toán tự động qua ngân hàng — CHƯA giải quyết

Cần 1 dịch vụ trung gian đọc biến động số dư ngân hàng thật (Casso/SePay/
VietQR Pro webhook...), đòi hỏi chủ dự án tự đăng ký + lấy API key (thường có
phí) trước khi Claude viết code nối vào — không phải thứ "tự nhiên có sẵn"
chỉ vì xây xong phễu. Về bản chất giống Web-to-Lead webhook đã gỡ bỏ (hệ
thống ngoài gọi vào webhook của mình), nhưng gắn tiền thật nên rủi ro cao
hơn nhiều — cần chủ dự án chủ động quyết định trước.

**Phần ĐÃ CÓ SẴN, không cần xây thêm:** mỗi hóa đơn khi chốt đơn đã có mã
VietQR cá nhân hóa riêng (`generateVietQRUrl()` trong `conversion-checkout-modal.tsx`,
memo `"HP {SĐT} {tên học sinh}"` + đúng số tiền gói học).

**Bài học khi xây cơ chế xác nhận thanh toán (tự động hoặc thủ công):** 1
thao tác xác nhận có thể bị gọi 2 lần cho cùng 1 giao dịch — BẮT BUỘC kiểm
tra hóa đơn CHƯA ở trạng thái `paid` trước khi xử lý, không giả định "gọi 1
lần duy nhất" (bug đã vá ở `markInvoiceAsPaid()`, xem AGENTS.md Mục 7).

---

## [Lịch sử — đã xử lý xong] Audit tính năng Tuyển sinh mock cũ (`app/admin/admissions`)

> Rút gọn ngày 2026-09-15 — mục đích ban đầu (giúp AI code Sale không cần dò
> lại code mock cũ) đã hoàn thành, hệ thống thật đã xây xong và thay thế
> toàn bộ. Chi tiết đầy đủ (12 bug B1-B12, data flow qua 3 key localStorage...)
> có thể xem lại qua lịch sử git của file này nếu thực sự cần tra cứu.

Toàn bộ `app/admin/admissions` (UI cũ) **100% dữ liệu giả, không đụng bảng DB
thật nào** — chỉ dùng tham khảo giao diện/luồng nghiệp vụ, không copy phần xử
lý dữ liệu. Hiện đã mồ côi route (Admin không còn trỏ vào đây), file vẫn còn
trong repo chờ chủ dự án quyết định xóa hay giữ.

**Ý tưởng đã giữ lại và xây thật:** mô hình phễu 3 giai đoạn có progress bar;
tách `stage` khỏi `status`; nhật ký chăm sóc CRM (kênh + cảm xúc + hẹn gọi
lại); quy tắc "gọi nhỡ 3 lần liên tiếp → tự no_demand"; "ca học thử cố định"
lặp theo tuần + cơ chế mở đợt; 1 lead đăng ký nhiều ca/nhiều môn; deep-link
Zalo/Messenger; giao diện chốt đơn kèm VietQR.

**Bài học lớn nhất rút ra (đã áp dụng xuyên suốt code Sale thật):** kiến trúc
"nhiều nguồn dữ liệu cho cùng 1 thứ" (mock cũ dùng 2 React store + 3 key
`localStorage`) là nguyên nhân gốc của phần lớn bug — dùng thẳng Server
Action + DB thật làm nguồn dữ liệu duy nhất. Và: Server Action trả về
`{error}` chứ không throw — component gọi nó PHẢI kiểm tra `result?.error`
trước khi coi là thành công (không dùng `try/catch` để bắt lỗi kiểu này) —
quy tắc này đã được ghi chính thức vào AGENTS.md Mục 3.

---

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-15 — Xây tính năng "Phản ánh & Góp ý" (Giai đoạn 1 — MVP)

Theo lộ trình đã thống nhất: Sale tự ghi nhận + tự đánh dấu xử lý, CHƯA có
định tuyến sang bộ phận khác/SLA tự động (để dành nếu thực tế cần).

**Đã tạo (chỉ trong phạm vi Sale + `types/database.ts` chỉ thêm mới):**
- `supabase/migrations/20260915_create_sale_feedback_tickets_schema.sql` —
  bảng `feedback_tickets` mới, độc lập hoàn toàn. **CHƯA CHẠY.**
- `types/database.ts`: thêm `FeedbackCategory`, `FeedbackStatus`,
  `FeedbackChannel`, `FeedbackTicket`.
- `lib/actions/feedback.ts` (mới): `getFeedbackTickets`,
  `getFeedbackTicketsByStudent`, `createFeedbackTicket`,
  `updateFeedbackTicketStatus`, `getFeedbackKpiStats` — đều
  `requireRole(["sale","admin"])`.
- `app/sale/feedback/page.tsx` + `feedback-client.tsx`, 2 dialog
  (`create-feedback-dialog.tsx`, `update-feedback-status-dialog.tsx`).
- Thêm mục "Phản ánh & Góp ý" vào `sale-sidebar.tsx`.
- Thêm khối "Lịch sử phản ánh/góp ý" vào `lead-detail-drawer.tsx` — chỉ hiện
  khi Lead đã có `converted_student_id`.

**Kênh phản ánh (`FeedbackChannel`) tách riêng khỏi `InteractionChannel`**
theo góp ý thực tế của chủ dự án (kênh khiếu nại thật của trung tâm giáo dục
đa dạng hơn nhật ký chăm sóc Lead): `in_person`, `hotline`, `zalo`,
`facebook`, `system` (LMS/web nội bộ), `email` — nhất quán với cách
`LeadSource` đã tách riêng `zalo`/`fanpage`.

`npx tsc --noEmit` sạch (exit code 0) sau toàn bộ thay đổi.

### 2026-09-15 — Vá xung đột z-index: danh sách Select bị ẩn sau Dialog

**Nguyên nhân xác nhận qua ảnh chụp màn hình chủ dự án gửi:** `dialog.tsx`
đặt `DialogOverlay` ở `z-[60]`, `select.tsx` đặt `SelectContent` chỉ ở
`z-50` — Select trong Dialog bị lớp phủ tối đè lên, danh sách tồn tại thật
trong DOM nhưng gần như vô hình, không bấm chọn được. Lỗi có sẵn từ trước,
chỉ lộ ra khi thực sự mở Select bên trong Dialog.

**Cách vá — không sửa `components/ui/*` dùng chung:** ghi đè
`className="z-[70]"` trực tiếp trên từng `<SelectContent>` tại nơi Sale dùng
(`cn()` dùng `tailwind-merge`, tự ưu tiên class truyền sau). Áp dụng cho 8 vị
trí: `create-lead-dialog.tsx`, `fast-lead-intake-modal.tsx`,
`callback-resolution-dialog.tsx`, `create-student-account-dialog.tsx`,
`assign-class-dialog.tsx`, `conversion-checkout-modal.tsx`,
`trial-assessment-dialog.tsx` (2 vị trí). Không cần sửa `leads-tab.tsx`
(Select không nằm trong Dialog) và `lead-detail-drawer.tsx` (nằm trong
`Sheet`, cùng `z-50` với Select, không bị đè).

Cũng bổ sung thiếu tùy chọn "Nguồn khác" (`other`) trong dropdown "Thêm
nhanh Lead" (trước đó chỉ có 6/7 giá trị `LeadSource`).

**Lưu ý cho dialog Sale mới có `Select` trong `Dialog`:** luôn nhớ thêm
`className="z-[70]"` cho `SelectContent`.

### 2026-09-15 — Vá lỗi "nguồn tiếp nhận" tự bịa mặc định

**Đã vá lỗi thật (đúng AGENTS.md Mục 11.1 — không tự bịa dữ liệu mặc định):**
`create-lead-dialog.tsx` và `fast-lead-intake-modal.tsx` trước đây pre-select
sẵn `source = "facebook_ads"`/`"hotline"` — Sale không đổi tay là lưu sai
nguồn thật, làm sai lệch số liệu "kênh nào hiệu quả nhất". Đã sửa: bỏ giá
trị mặc định, bắt buộc chọn (như tên/SĐT), validate cả UI lẫn Server Action
(`createLead()`, `quickCreateLead()` — bỏ hẳn fallback ngầm, trả lỗi rõ ràng
nếu thiếu).

### 2026-09-15 — Gỡ bỏ hoàn toàn Web-to-Lead API + thiết kế lại biểu đồ phễu

**Web-to-Lead API — đã xây (2026-09-14), tích hợp UI + thêm xác thực
(2026-09-15 sáng), rồi GỠ BỎ HOÀN TOÀN (2026-09-15 chiều)** theo yêu cầu chủ
dự án — không nắm rõ cách vận hành nên quyết định không dùng, tránh 1 tính
năng không ai hiểu/bảo trì nằm trong hệ thống. Đã xác nhận trước khi xóa
(grep toàn repo): không file nào khác phụ thuộc. Đã xóa: `app/api/leads/webhook/route.ts`
(và thư mục `app/api/`), `app/sale/webhook/` (trang cấu hình), mục "Kết nối
Landing Page" khỏi sidebar, biến `SALE_LEADS_WEBHOOK_SECRET` khỏi
`.env.local`. **Kết quả ròng: tính năng này KHÔNG tồn tại trong hệ thống.**
2 đường tạo Lead còn lại (Tiếp nhận Lead mới / Thêm nhanh Lead) không hề phụ
thuộc các file đã xóa, hoạt động bình thường.

**Thiết kế lại `admissions-funnel-chart.tsx`** theo đúng dạng phễu hình thang
thu hẹp dần (SVG, 4 màu categorical trùng màu KPI bar cùng trang) thay vì
thanh ngang, tham khảo giao diện CRM Kstudy chủ dự án gửi ảnh chụp. Giữ
nguyên props/API cũ.

**Rà soát liên kết chéo phân hệ** (xác nhận bằng grep, không suy đoán): 4
bảng Sale chỉ được đọc/ghi bởi `lib/actions/admissions.ts`. Điểm nối duy
nhất sang Admin/Teacher/Student là qua các hàm dùng chung (xem "Liên kết với
Admin/Teacher/Student" ở đầu file). Phát hiện: `students.note` (Sale ghi khi
chốt đơn) hiển thị ở `/admin/students` nhưng KHÔNG hiển thị bên Teacher.

### 2026-09-14 — Vá lỗ hổng sĩ số ca học thử + đính chính 1 nhận định sai của chính phiên trước

**Đã vá (chỉ sửa `lib/actions/admissions.ts`):**
- `registerLeadTrials()`: trước đây KHÔNG kiểm tra sĩ số ở server, chỉ tin
  giao diện đã disable nút khi đầy — gọi thẳng Server Action vẫn đăng ký
  vượt sĩ số được. Đã thêm kiểm tra thật trước khi insert, tự động cập nhật
  `trial_slots.status = 'full'` khi chạm sĩ số tối đa.
- `recordTrialAssessment()`: khi hủy 1 lượt đăng ký, tự kiểm tra lại — nếu
  ca đang `full` mà đã có chỗ trống, tự mở lại `status = 'active'`.

**Đính chính 1 nhận định sai ở nhật ký phiên trước:** từng nghi ngờ "bậc 'Chờ
chốt đơn' trong biểu đồ phễu đếm THIẾU vì Sale có thể chốt đơn thẳng từ
`stage = trial`, bỏ qua `stage = conversion`". Khi rà lại bằng số cụ thể,
phát hiện nhận định này SAI — công thức `conversionCount + enrolledCount +
waitingClassCount` đã cộng gộp đúng mọi Lead đạt tới ngưỡng đó hay xa hơn,
không phụ thuộc có literally đi qua giá trị `conversion` hay không. Biểu đồ
phễu đã đúng từ đầu, không cần sửa. **Bài học:** trước khi báo 1 nghi vấn là
"lỗ hổng cần vá", nên tự tay chạy thử công thức với số cụ thể, tránh vá nhầm
chỗ không thực sự hỏng.

### 2026-09-14 — Điều tra lỗi "tạo Lead báo lỗi liên tục" — nguyên nhân: migration DB chưa chạy

**Triệu chứng:** tạo Lead/nhập thông tin khách hàng bị từ chối, báo lỗi liên
tục bất kể nhập gì.

**Nguyên nhân gốc:** migration `20260914_create_sale_admissions_schema.sql`
đã viết vào repo nhưng CHƯA từng chạy lên Supabase thật (xác nhận qua
`list_tables`: 4 bảng Sale hoàn toàn chưa tồn tại). Mọi lời gọi
`supabase.from("leads")...` bị Postgres báo "relation does not exist".

**Đã xử lý:** đưa nguyên văn SQL cho chủ dự án tự chạy (Claude không tự ghi
DB — chủ dự án chủ động từ chối cho chạy qua MCP). **✅ Xác nhận xong cùng
phiên:** chủ dự án chạy xong + gửi ảnh tạo Lead thành công, Claude verify lại
bằng `list_tables` (chỉ đọc) — khớp đúng.

**Đã thêm cùng phiên (sau khi migration chạy xong):** `admissions-funnel-chart.tsx`
bản đầu tiên (thanh ngang, sau này thiết kế lại thành hình phễu — xem mục
2026-09-15).

### 2026-09-14 — Bổ sung Thêm nhanh Lead (FAB) & Lịch làm việc hôm nay (Daily Tasks)

- **Thêm nhanh Lead (Manual Fast Intake):** `components/sale/fast-lead-intake-modal.tsx`
  + nút nổi `FastLeadIntakeFab` gắn vào layout Sale.
- **Lịch làm việc hôm nay:** `app/sale/daily-tasks/page.tsx`, `daily-tasks-client.tsx`,
  `callback-resolution-dialog.tsx`. Tự động tổng hợp: hẹn gọi lại hôm nay/trễ
  hẹn, ca học thử cần điểm danh/chấm điểm, Lead mới cần gọi trong 15p đầu,
  học sinh chờ xếp lớp.
- Cập nhật `sale-sidebar.tsx` đưa "Lịch làm việc hôm nay" lên đầu menu; tạo
  `app/sale/page.tsx` chuyển hướng vào `/sale/daily-tasks`.

*(Lưu ý: nhật ký gốc của phiên này cũng ghi "bổ sung Web-to-Lead API" —
tính năng đó đã bị gỡ bỏ hoàn toàn ở phiên 2026-09-15, xem mục tương ứng
phía trên, không còn tồn tại trong hệ thống.)*

### 2026-09-14 — Triển khai hoàn chỉnh Phân hệ Sale (DB, Server Actions, Phễu CRM 3 Tab, Chờ xếp lớp, Quản trị tài khoản)

- **Database:** migration `20260914_create_sale_admissions_schema.sql` (4
  bảng thật: `leads`, `lead_interactions`, `trial_slots`, `lead_trials` +
  RLS); đồng bộ `types/database.ts`.
- **Server Actions:** `lib/actions/admissions.ts` hoàn chỉnh — CRUD Lead,
  CRM `logInteraction()` (auto `no_demand` sau 3 lần gọi nhỡ), quản lý ca
  học thử (batch rollover), chấm điểm, chốt đơn 2 bước
  (`completeLeadConversion`, tái dùng `createStudent`+`createInvoice`+
  `enrollStudentInClass`, không bịa ID giả).
- **Giao diện Sale:** Layout & Sidebar; Phễu Tuyển sinh (KPI, 3 tab, VietQR
  động); Học sinh chờ xếp lớp; Quản trị Tài khoản Học sinh.
- **Admin Root:** `app/admin/page.tsx` chuyển hướng về `/admin/dashboard`
  (thay vì admissions mock cũ).
- `npx tsc --noEmit` sạch.

### 2026-09-14 — Rà soát tính năng Tuyển sinh mock + vá 2 lỗi hạ tầng dùng chung trước bàn giao

Rà soát toàn bộ 16 file tính năng Tuyển sinh mock cũ (kết quả đã rút gọn ở
mục "[Lịch sử]" phía trên). Phát hiện + vá ngay 2 bug nằm ở hạ tầng dùng
chung Sale sẽ kế thừa: `createStudent()` (tự bịa số buổi + nuốt lỗi ghi
danh) và `submitLead()` (trùng tên bảng `leads` với Sale sắp tạo, đã đổi
sang `landing_page_leads`).
