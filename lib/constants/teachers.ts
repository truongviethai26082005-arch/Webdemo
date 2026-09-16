export interface AppTeacher {
  id: string;
  name: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  salary_per_session: number;
  bank_name?: string;
  bank_account_no?: string;
  role?: string;
  created_at: string;
  classes?: Array<{ id: string; name: string }>;
}

export const INITIAL_APP_TEACHERS: AppTeacher[] = [
  {
    id: "teacher-01",
    name: "Thầy Nguyễn Tiến Dũng",
    full_name: "Thầy Nguyễn Tiến Dũng",
    email: "dung.nguyen@educenter.vn",
    phone: "0901234567",
    subject: "Toán",
    salary_per_session: 250000,
    bank_name: "Vietcombank",
    bank_account_no: "10182938475",
    role: "teacher",
    created_at: "2025-08-15T08:00:00Z",
  },
  {
    id: "teacher-02",
    name: "Cô Trần Thị Mai",
    full_name: "Cô Trần Thị Mai",
    email: "mai.tran@educenter.vn",
    phone: "0912345679",
    subject: "Toán",
    salary_per_session: 220000,
    bank_name: "Techcombank",
    bank_account_no: "19034567890",
    role: "teacher",
    created_at: "2025-09-01T08:00:00Z",
  },
  {
    id: "teacher-03",
    name: "Cô Emily Nguyễn",
    full_name: "Cô Emily Nguyễn",
    email: "emily.nguyen@educenter.vn",
    phone: "0987654321",
    subject: "Tiếng Anh",
    salary_per_session: 250000,
    bank_name: "MB Bank",
    bank_account_no: "03456789012",
    role: "teacher",
    created_at: "2025-10-10T08:00:00Z",
  },
  {
    id: "teacher-04",
    name: "Cô Nguyễn Thu Phương",
    full_name: "Cô Nguyễn Thu Phương",
    email: "phuong.nguyen@educenter.vn",
    phone: "0934567890",
    subject: "Tiếng Anh",
    salary_per_session: 230000,
    bank_name: "ACB",
    bank_account_no: "7890123456",
    role: "teacher",
    created_at: "2025-11-05T08:00:00Z",
  },
  {
    id: "teacher-05",
    name: "Thầy Lê Văn Hùng",
    full_name: "Thầy Lê Văn Hùng",
    email: "hung.le@educenter.vn",
    phone: "0978901234",
    subject: "Vật Lý",
    salary_per_session: 240000,
    bank_name: "VPBank",
    bank_account_no: "98765432101",
    role: "teacher",
    created_at: "2025-12-01T08:00:00Z",
  },
  {
    id: "teacher-06",
    name: "Thầy Hải",
    full_name: "Thầy Hải",
    email: "hai.teacher@educenter.vn",
    phone: "0909888999",
    subject: "Toán",
    salary_per_session: 250000,
    bank_name: "BIDV",
    bank_account_no: "65010002345678",
    role: "teacher",
    created_at: "2026-01-10T08:00:00Z",
  },
];
