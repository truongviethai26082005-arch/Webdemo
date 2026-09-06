import { Lead } from "@/types/admissions";

export const MOCK_LEADS: Lead[] = [
  {
    id: "L001",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    status: "Lead Mới",
    source: "Facebook",
    assignee: "Trần Sales",
    courseInterested: "IELTS 6.5",
    createdAt: "2023-10-25",
    history: [
      {
        id: "H001",
        date: "2023-10-25 09:00",
        user: "Hệ thống",
        note: "Khách điền form từ Facebook Ads",
      }
    ]
  },
  {
    id: "L002",
    name: "Trần Thị B",
    phone: "0912345678",
    status: "Đang Tư Vấn",
    source: "Zalo",
    assignee: "Lê Sales",
    courseInterested: "Giao tiếp cơ bản",
    createdAt: "2023-10-24",
    history: [
      {
        id: "H002",
        date: "2023-10-24 14:30",
        user: "Lê Sales",
        note: "Đã gọi điện, khách kêu học phí hơi cao, đang suy nghĩ thêm.",
      }
    ]
  },
  {
    id: "L003",
    name: "Lê Văn C",
    phone: "0987654321",
    status: "Lịch Học Thử",
    source: "Giới thiệu",
    assignee: "Trần Sales",
    courseInterested: "TOEIC 500",
    createdAt: "2023-10-22",
    history: [
      {
        id: "H003",
        date: "2023-10-23 10:00",
        user: "Trần Sales",
        note: "Đã hẹn học thử vào thứ 7 tuần này lúc 18h.",
      }
    ]
  },
  {
    id: "L004",
    name: "Phạm Thị D",
    phone: "0934567890",
    status: "Thành Công",
    source: "Điền Form",
    assignee: "Lê Sales",
    courseInterested: "IELTS 7.0",
    createdAt: "2023-10-20",
    history: [
      {
        id: "H004",
        date: "2023-10-25 11:00",
        user: "Lê Sales",
        note: "Khách đã đóng học phí và xếp lớp thành công.",
      }
    ]
  }
];
