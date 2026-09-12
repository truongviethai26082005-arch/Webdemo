-- center_settings chứa số tài khoản ngân hàng nhận học phí (VietQR) — trước đó RLS bị tắt hoàn
-- toàn, khiến anon key public đọc/ghi được trực tiếp qua REST API (rủi ro chiếm đoạt học phí).
-- lib/actions/settings.ts chỉ có getCenterBankSettings() (đọc), không có hàm ghi nào -> chỉ thêm
-- policy SELECT, không thêm policy ghi nào (RLS mặc định chặn hết ghi).
ALTER TABLE public.center_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bank settings" ON public.center_settings
  FOR SELECT USING (true);

-- 3 bảng đang trống dữ liệu, chưa có code nào đọc/ghi thật (UI Teacher hiện là mock useState) ->
-- bật RLS không kèm policy nào là an toàn tạm thời (chặn hết truy cập REST API công khai), sẽ
-- thiết kế policy thật khi build tính năng Tài liệu/Bài tập/Chấm điểm của Teacher.
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
