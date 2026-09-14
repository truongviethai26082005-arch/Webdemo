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

## Rà soát toàn bộ tính năng Tuyển sinh HIỆN TẠI (mock, `app/admin/admissions`) — 2026-09-14

> Mục đích phần này: để AI code Sale không cần dò lại từ đầu code cũ. Đây là
> kết quả đọc kỹ toàn bộ 16 file liên quan (10 component + 1 page + 1 client +
> 2 action + 1 seed + 1 type + context/store toàn cục), **không sửa file nào**.
> ⚠️ Toàn bộ tính năng này **100% dữ liệu giả, không đụng bảng DB thật nào**
> (không có bảng `leads`) — chỉ tham khảo GIAO DIỆN/Ý TƯỞNG NGHIỆP VỤ, tuyệt
> đối không copy phần xử lý dữ liệu.

### 1. Cấu trúc & luồng nghiệp vụ (theo thiết kế mock)

**Entry point:** `app/admin/page.tsx:4` redirect `/admin` → `/admin/admissions`
— tức trang chủ Admin HIỆN NAY chính là màn hình mock này. **Khi dời tính
năng sang `app/sale/`, bắt buộc phải đổi lại redirect này, nếu không Admin sẽ
gặp 404 ngay ở trang chủ.**

**Phễu 3 bước** (`components/admissions/admissions-funnel-bar.tsx:16-44`) — 1
thanh 3 tab có progress bar + badge "chờ xử lý" (không phải kanban):
1. `leads` — Tiếp nhận & Chăm sóc Lead
2. `trials` — Xếp lịch học thử / Ghép lớp & Test năng lực
3. `conversions` — Ghi danh & Chuyển đổi / Chốt gói & VietQR 1 chạm

**Enum nghiệp vụ đáng tham khảo** (`types/admissions.ts`):
- `LeadStatus`: `new | contacted | callback | no_demand | converted | ready_to_enroll`
- `TrialStatus`: `scheduled | attended | no_demand`
- `LeadSource`: `facebook_ads | fanpage | zalo | referral | walkin | hotline | other`
- `InteractionChannel`: `call | zalo | in_person | email`
- `FeedbackSentiment`: `high_interest | price_concern | schedule_conflict | need_consult | other`

**Type dữ liệu chính** (tên field, để tham khảo khi thiết kế schema thật):
`Lead`, `InteractionLog`, `TrialRegistration`, `TrialClass`,
`EnrollmentSubjectChoice`, `EnrollmentConversion`, `FixedTrialSlot` — định
nghĩa đầy đủ ở `types/admissions.ts:1-170`.

**Component chính:**
| File | Chức năng |
|---|---|
| `leads-tab.tsx` | Bảng lead + filter, drawer chi tiết, sửa/xóa, hẹn gọi lại, deep-link Zalo/Messenger từ SĐT. Tự động chuyển `no_demand` sau 3 lần gọi nhỡ liên tiếp. |
| `trials-tab.tsx` | Slider "ca học thử cố định" (sĩ số x/max), đăng ký ca, chấm điểm sau học thử, xử lý "không có nhu cầu", **cơ chế "đợt" (batch rollover)** khi 1 ca lặp lại theo tuần. |
| `conversions-tab.tsx` | Bảng ghi danh + 4 KPI card, chọn lớp chính thức + gói buổi ngay trên từng dòng. |
| `convert-student-dialog.tsx` | Bảng tổng hợp học phí + QR VietQR (dùng `getCenterBankSettings()` THẬT) + nút "Xác nhận thành công". |
| `create-lead-dialog.tsx`, `log-interaction-dialog.tsx`, `schedule-trial-dialog.tsx`, `assessment-dialog.tsx` | Form nhập lead / nhật ký CRM / xếp ca học thử (chọn nhiều ca) / chấm điểm. |
| `interactions-tab.tsx` | **Dead code — không nơi nào import**, có thể bỏ qua hoàn toàn. |

### 2. Dữ liệu thật sự đi đâu (data flow)

**Không chạm DB.** Nằm rải rác ở 2 React state + 3 key `localStorage` khác
nhau — đây là nguồn gốc phần lớn bug ở mục 4:
1. `admissions-client.tsx` — state cục bộ `leads/logs/trials/conversions`,
   seed từ `lib/data/admissions-seed.ts`, lưu `localStorage["educenter_admissions_data_v6"]`.
2. `lib/context/app-data-context.tsx` — state TOÀN CỤC `conversions/leads/trials`,
   cũng seed từ đúng các hằng số đó, lưu `localStorage["educenter_global_store_v4"]`.
3. `trials-tab.tsx` — `trialSlots` lưu riêng ở `localStorage["educenter_trial_slots_v1"]`.

Seed data gồm 9 lead giả, 4 log giả, và **50 bản ghi trial bịa** để 2 lớp mẫu
hiển thị "gần đầy chỗ" cho đẹp mắt (`admissions-seed.ts`).

Hai hàm lõi của luồng "chốt đơn" — `moveToConversion()` và
`completeEnrollment()` (`app-data-context.tsx`) — **chỉ setState, không gọi
Server Action nào**, kể cả `completeEnrollment` tạo `studentId`/`invoiceId`
giả kiểu `STU-${Date.now()}`/`HD-${...}` hoàn toàn không ghi DB.

Server Action THẬT duy nhất có liên quan tới luồng này là
`convertLeadToStudentAction` (`lib/actions/admissions.ts`) — gọi từ
`convert-student-dialog.tsx`, xem chi tiết cách nó bị dùng sai ở Bug B4/B5
bên dưới.

### 3. `submitLead()` (`lib/actions/leads.ts`) — KHÔNG liên quan tới màn hình Tuyển sinh

Dễ nhầm vì tên giống nhau nhưng đây là 2 thứ khác hẳn nhau:
- Chỉ được gọi từ `components/landing/lead-modal.tsx` — form ở **trang landing
  marketing bán phần mềm**, đối tượng là "trung tâm khác muốn mua EMS", không
  phải phụ huynh/học sinh.
- Payload khác hẳn `Lead` type: `{fullName, centerName, phone, email, scale, category?, note?}`.
- Insert vào bảng `leads` (snake_case) — **bảng này không tồn tại trên DB
  thật**. Lỗi insert bị nuốt bằng `console.warn`, hàm **vẫn trả về
  `{success:true, message:"Đăng ký thành công!"}`** — người dùng thấy thành
  công dù dữ liệu chỉ nằm trong log server, không lưu đâu cả.
- Không có auth check (cố ý public, theo `docs/context-handoff.md`), nhưng
  chưa có rate-limit/captcha.
- ⚠️ **Quan trọng cho Sale:** tên bảng `leads` đã bị hàm này "chiếm chỗ" với
  1 schema hoàn toàn khác (B2B). Khi thiết kế bảng `leads` thật cho phễu Tuyển
  sinh phụ huynh, phải đổi tên bảng đích của `submitLead()` trước (hoặc đổi
  tên bảng lead phụ huynh), và sửa để nó không báo "thành công" giả khi insert
  lỗi — không được để 2 nghiệp vụ khác nhau dùng chung 1 tên bảng.

### 4. Bug / bất nhất đã phát hiện (chỉ để biết, KHÔNG cần sửa — code này sẽ bị thay thế)

- **B1 (nghiêm trọng nhất):** `conversions-tab.tsx` ưu tiên đọc store toàn cục
  thay vì prop cục bộ (`globalConversions.length > 0 ? globalConversions : propConversions`)
  — vì store toàn cục luôn có sẵn dữ liệu seed, **prop cục bộ không bao giờ
  được dùng thật**. Bài học: kiến trúc "nhiều nguồn dữ liệu cho cùng 1 thứ" dễ
  âm thầm vô hiệu hóa 1 nguồn mà không ai nhận ra.
- **B2:** `moveToConversion` bị gọi 2 lần cho cùng 1 hành động (1 lần từ
  `trials-tab`, 1 lần từ `admissions-client`) → tạo 2 bản ghi conversion cho
  cùng 1 lead ở 2 store khác nhau.
- **B3:** Sau khi "chốt đơn" thành công, 2 nơi set trạng thái lead khác nhau
  cho cùng 1 lead (`"contacted"` vs `"converted"`) — do đọc/ghi từ 2 store
  không đồng bộ.
- **B4 (vi phạm trực tiếp quy tắc ở AGENTS.md Mục 3):**
  `convert-student-dialog.tsx` gọi `convertLeadToStudentAction` trong
  `try/catch`, nhưng hàm này trả về `{success:false, error}` thay vì throw —
  nên `catch` không bao giờ chạy, `result.error` bị vứt bỏ hoàn toàn. Dialog
  vẫn báo "🎉 thành công" dù Server Action thật sự thất bại (vd do không đúng
  quyền, hoặc lỗi DB). **Đây chính là lỗi mẫu mà quy tắc `if (result?.error)`
  ở AGENTS.md Mục 3 được viết ra để ngăn chặn — khi code Sale thật, PHẢI check
  kết quả, không dùng try/catch cho Server Action kiểu `{error}`.**
- **B5:** Vì B4 không được check, khi `classId` không xác định được, code
  fallback về 1 ID lớp bịa (`"class-toan-9a1"`). `createStudent()` chạy được
  (tạo học sinh thật trong DB), nhưng bước tạo `enrollments` sau đó thất bại
  — lỗi chỉ bị `console.error`, hàm vẫn trả `{success:true}`. Kết quả: học
  sinh có thật trong bảng `students` nhưng không thuộc lớp nào, không có
  `balance_sessions`. **Bài học kép:** (a) không được "đoán" 1 ID giả khi
  thiếu dữ liệu thật (đúng AGENTS.md Mục 11.1) — nếu chưa xác định được lớp,
  phải đi đúng nhánh "chờ xếp lớp" đã thiết kế ở phần trên, không fallback
  bừa; (b) nếu 1 bước trong chuỗi tạo dữ liệu thất bại, phải trả lỗi rõ ràng
  cho toàn bộ thao tác, không nuốt lỗi ở bước phụ rồi báo thành công.
- **B6:** Vẫn còn các hằng số giả đã bị AGENTS.md Mục 7 liệt kê nhưng chưa dọn:
  `DEFAULT_FIXED_TRIAL_SLOTS` (4 ca học thử bịa, có cả tên giáo viên thật),
  `DEFAULT_OFFICIAL_CLASSES` (7 lớp bịa kèm sĩ số/học phí giả) — đây chính là
  đường đi MẶC ĐỊNH khi `globalClasses` rỗng (trình duyệt mới), không phải
  edge case hiếm gặp.
- **B7:** Học phí bị suy ra bằng cách "đoán" theo tên môn học (substring hack)
  lặp lại ở 3 nơi khác nhau (`className.includes("Toán") ? 2400000 : ...`) —
  không hề đọc `classes.fee_per_session` thật. Khi code thật: luôn tính học
  phí từ dữ liệu lớp thật, không suy đoán qua tên.
- **B8:** Điểm test/ngày tháng bịa khi thiếu dữ liệu (`?? 8.5`, fallback ngày
  cứng `"2026-09-08T14:30:00"`) — vi phạm AGENTS.md Mục 11.1, cùng nhóm lỗi
  với B6/B7.
- **B9:** Trang `page.tsx` đã fetch sẵn `getClasses()`/`getTeacherOptions()`
  **thật** và truyền xuống, nhưng `schedule-trial-dialog.tsx` nhận prop rồi
  **không dùng dòng nào** — chỉ đọc thẳng hằng số giả. Bài học: khi thấy dữ
  liệu thật đã có sẵn ở prop, ưu tiên dùng nó thay vì hằng số cứng.
- **B10:** Ca học thử mới tạo ở `trials-tab.tsx` (lưu `localStorage` riêng)
  không hề xuất hiện ở `schedule-trial-dialog.tsx` (đọc thẳng hằng số cứng) —
  2 nơi lẽ ra phải cùng 1 nguồn dữ liệu lại tách rời nhau.
- **B11:** Khi 1 lead chuyển từ giai đoạn "lead" sang "học thử" sang "chuyển
  đổi", code cũ **xóa hẳn bản ghi cũ** (`filter`) thay vì giữ lại lịch sử —
  làm mất truy vết nguồn gốc (`source`, `assignedStaff`, ghi chú gốc). Khi
  thiết kế bảng thật: 1 lead nên là 1 bản ghi xuyên suốt cả phễu (đổi
  `status`/`stage`), không xóa rồi tạo mới ở mỗi giai đoạn.
- **B12:** Nhân sự phụ trách (`assignedStaff`) mặc định hardcode 1 cái tên cố
  định, không đọc từ `profiles` (role sale) thật.

### 5. Đánh giá: giữ ý tưởng gì / bỏ hẳn gì khi xây lại thật

**Đáng giữ (ý tưởng nghiệp vụ/UX, viết lại code từ đầu):**
- Mô hình phễu 3 giai đoạn có progress bar + badge "chờ xử lý" — trực quan,
  hợp bảng dữ liệu nhiều cột hơn kanban.
- Bộ enum `LeadStatus`/`LeadSource`/`FeedbackSentiment` — vocabulary nghiệp vụ
  hợp lý để làm enum DB thật (lưu ý: nên tách riêng `stage` (đang ở giai đoạn
  nào của phễu) khỏi `status` (kết quả chăm sóc), vì 2 khái niệm này bị lẫn
  vào nhau trong bản mock, gây ra một phần nguyên nhân B3).
- Nhật ký chăm sóc `InteractionLog` (kênh liên hệ + cảm xúc + hành động tiếp
  theo + nhắc hẹn) — nên là bảng `lead_interactions` thật.
- Quy tắc "gọi nhỡ 3 lần liên tiếp → tự chuyển không có nhu cầu" — quy tắc
  nghiệp vụ hay, giữ lại.
- Khái niệm "ca học thử cố định" lặp lại theo tuần + cơ chế "đợt" (batch) khi
  ca cũ đầy — giải đúng bài toán thật, giữ lại ý tưởng, viết lại bằng bảng
  thật (không localStorage).
- Cho phép 1 lead đăng ký nhiều ca học thử, và chọn nhiều môn cùng lúc khi
  chốt đơn — phản ánh đúng thực tế phụ huynh học nhiều môn.
- Deep-link gọi Zalo/Messenger thẳng từ số điện thoại lead — tiện, giữ lại.
- Giao diện chốt đơn kèm mã QR VietQR — giữ nguyên UI, thay toàn bộ phần ghi
  dữ liệu giả bằng luồng thật (Bước 1/Bước 2 đã thiết kế ở phần trên).

**Phải bỏ hẳn, không tái sử dụng:**
- Toàn bộ `lib/data/admissions-seed.ts` và mọi hằng số `DEFAULT_*`
  (`DEFAULT_FIXED_TRIAL_SLOTS`, `DEFAULT_OFFICIAL_CLASSES`) — dữ liệu bịa.
- Mọi công thức tính tiền/điểm/ngày theo kiểu suy đoán/fallback cứng (B7, B8).
- `moveToConversion()`/`completeEnrollment()` trong `app-data-context.tsx` —
  viết lại thành Server Action thật, tái dùng đúng `createStudent()` +
  `enrollStudentInClass()` + `createInvoice()` như đã thiết kế ở phần Bước
  1/Bước 2 phía trên.
- Kiến trúc "2 React store + 3 key localStorage cho cùng 1 tập dữ liệu" — đây
  là nguyên nhân gốc của phần lớn bug ở mục 4 (B1, B2, B10). Dùng thẳng
  Server Action + DB thật làm nguồn dữ liệu duy nhất, không cần store toàn
  cục riêng cho admissions.
- `components/admissions/interactions-tab.tsx` (dead code, bỏ qua).
- Cách `convert-student-dialog.tsx` gọi Server Action bằng `try/catch` mà
  không check `result.error` (B4) — viết lại đúng theo pattern bắt buộc ở
  AGENTS.md Mục 3.

## Sale được quyền quản lý tài khoản đăng nhập của học sinh — 2026-09-14

Đã xác nhận với chủ dự án: Sale được cấp quyền **quản lý đầy đủ** tài khoản
đăng nhập của học sinh (không chỉ xem) — vì Sale là người trực tiếp làm
việc/hỗ trợ học sinh & phụ huynh hằng ngày (thông báo tài khoản, hỗ trợ khi
quên mật khẩu...). Backend đã sẵn sàng, chỉ còn thiếu UI phía Sale (việc này
để người code Sale tự làm khi xây màn hình quản lý học sinh của họ — không
làm sẵn UI thay, đúng nguyên tắc "Nhóm 3" mỗi phân hệ tự code route/component
của mình).

**3 hàm đã guard `requireRole(["admin","sale"])` sẵn, gọi thẳng, KHÔNG viết
luồng riêng:**
1. `getStudentAccountsOverview()` (`lib/actions/accounts.ts`) — trả về danh
   sách học sinh ĐÃ có tài khoản, kèm email đăng nhập thật + SĐT phụ huynh.
   Dùng để hiển thị/tra cứu khi cần thông báo cho học sinh.
2. `createAccountByAdmin({ email, password, fullName, role: "student", phone?, studentId? })`
   (`lib/actions/auth.ts`) — tạo tài khoản đăng nhập mới cho học sinh (gắn
   vào 1 bản ghi `students` đã có qua `studentId`, hoặc tạo mới hồ sơ học
   sinh nếu bỏ trống `studentId`). **Lưu ý quan trọng:** hàm này chặn cứng ở
   tầng server — Sale gọi với `role` khác `"student"` (vd `"admin"`) sẽ luôn
   bị từ chối, dù UI có lỡ cho phép chọn hay không. `password` bắt buộc ≥ 8
   ký tự, không có mặc định (xem mục "Đã vá" bên dưới) — Sale phải tự sinh
   mật khẩu (gợi ý: sinh ngẫu nhiên rồi hiển thị 1 lần cho Sale copy gửi học
   sinh, giống cách `create-account-dialog.tsx` hiện làm ở Admin — có thể
   tham khảo file đó, không bắt buộc copy y nguyên UI).
3. `resetStudentPassword(studentId, newPassword)` (`lib/actions/students.ts`)
   — đổi mật khẩu 1 học sinh cụ thể, dùng khi học sinh/phụ huynh báo quên mật
   khẩu. `newPassword` bắt buộc ≥ 8 ký tự.

Có thể tham khảo cách Admin đã dùng 3 hàm này ở `app/admin/accounts/`
(`accounts-client.tsx`, `components/accounts/create-account-dialog.tsx`,
`components/accounts/reset-student-password-dialog.tsx`) — sao chép Ý TƯỞNG
giao diện (bảng + dialog + check `result.error`), không cần y hệt.

## Đã vá trước 2 lỗi hạ tầng dùng chung — 2026-09-14 (trước khi bàn giao Sale)

Sau khi rà soát ở trên, phát hiện 2 lỗi nằm ở đúng phần hạ tầng Sale BẮT BUỘC
phải kế thừa/đụng tới (không phải ở code mock sẽ bị bỏ) — đã vá ngay để Sale
không kế thừa lại lỗi:

1. **`createStudent()` (`lib/actions/students.ts`) — hàm Sale bắt buộc tái
   sử dụng theo AGENTS.md Mục 9.** Trước đây: (a) tự bịa `initial_sessions = 12`
   khi thiếu dữ liệu (vi phạm Mục 11.1); (b) nếu ghi `enrollments` thất bại,
   chỉ `console.error` rồi **vẫn trả `success:true`** — tạo ra học sinh thật
   trong DB nhưng không có lớp/không có buổi học nào (đây chính là nguyên
   nhân của Bug B5 ở phần audit trên). Đã sửa: nếu có `class_id` thì bắt buộc
   phải kèm số buổi hợp lệ (không mặc định); nếu ghi `enrollments` thất bại,
   tự động xóa lại bản ghi `students` vừa tạo (hoàn tác) và trả lỗi rõ ràng
   thay vì báo thành công giả. **Lưu ý:** phần UI mock cũ
   (`convert-student-dialog.tsx`) vẫn còn tự fallback `class_id` giả
   (`"class-toan-9a1"`) và vẫn nuốt lỗi bằng `try/catch` rỗng (Bug B4) —
   KHÔNG sửa file này vì toàn bộ dialog đó sẽ bị bỏ khi xây Sale thật (xem
   mục 5 phần "Phải bỏ hẳn"); chỉ hàm `createStudent()` dùng chung là được vá.
   Khi Sale gọi đúng `createStudent()`/`enrollStudentInClass()` theo luồng đã
   thiết kế ở trên (Bước 1/Bước 2), sẽ không còn gặp lại lỗi này.
2. **`createAccountByAdmin()` (`lib/actions/auth.ts`) — bỏ mật khẩu mặc định
   `"password123"` (2026-09-14).** Nếu sau này Sale quyết định dùng lại hàm
   này để tự cấp tài khoản đăng nhập cho học sinh ngay khi chốt đơn (tùy
   chọn, xem AGENTS.md Mục 9 điểm 5), **bắt buộc phải tự sinh/truyền vào 1
   mật khẩu thật (tối thiểu 8 ký tự)** — hàm sẽ báo lỗi nếu thiếu, không còn
   tự bịa mật khẩu mặc định như trước (rủi ro bảo mật nếu cấp hàng loạt cho
   khách hàng thật với mật khẩu ai cũng đoán được).
3. **`submitLead()` (`lib/actions/leads.ts`)** trước đây ghi (thử) vào bảng
   tên `"leads"` — đúng tên mà Sale gần như chắc chắn sẽ đặt cho bảng lead
   của phễu Tuyển sinh phụ huynh. Bảng `leads` thật chưa tồn tại nên trước
   đây chỉ im lặng thất bại, nhưng ngay khi Sale tạo bảng `leads` thật, hàm
   landing-page này (nghiệp vụ khác hẳn — form B2B "trung tâm muốn mua phần
   mềm", không phải phụ huynh) sẽ bắt đầu âm thầm ghi dữ liệu sai định dạng
   vào đó. Đã đổi tên bảng đích sang `"landing_page_leads"` để giải phóng tên
   `leads` cho Sale dùng an toàn. **Sale có thể đặt tên bảng phễu tuyển sinh
   là `leads` mà không lo xung đột.**

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-14 — Rà soát tính năng Tuyển sinh mock + vá 2 lỗi hạ tầng dùng chung trước bàn giao

- Đã rà soát toàn bộ 16 file của tính năng Tuyển sinh mock hiện tại, ghi kết
  quả đầy đủ vào phần trên (cấu trúc, data flow, `submitLead()`, 12 bug, đánh
  giá giữ/bỏ).
- Phát hiện 2 bug trong đó nằm ở hạ tầng dùng chung Sale sẽ kế thừa
  (`createStudent()` tự bịa số buổi + nuốt lỗi ghi danh; `submitLead()` trùng
  tên bảng `leads` với bảng Sale sắp tạo) → đã vá cả hai ngay (chi tiết ở mục
  trên), không đợi tới lúc Sale code mới phát hiện.
- Còn treo: chưa thiết kế/migrate bảng `leads`/`lead_interactions` thật —
  việc này thuộc về người code Sale khi bắt đầu (xem "Hiện trạng khi bắt đầu"
  ở đầu file).
