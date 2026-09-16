import { AppStudent } from "@/lib/context/app-data-context";
import { EnrollmentConversion } from "@/types/admissions";

// Danh sách họ, đệm, tên tiếng Việt phong phú để sinh dữ liệu mẫu thực tế
const HO_DEM = [
  "Nguyễn Văn", "Trần Đình", "Lê Hoàng", "Phạm Minh", "Hoàng Gia", 
  "Vũ Quốc", "Phan Anh", "Đặng Tuấn", "Bùi Quang", "Đỗ Nhật",
  "Hồ Hải", "Ngô Thành", "Dương Trí", "Lý Kiến", "Võ Đức",
  "Đinh Trọng", "Lâm Phúc", "Trịnh Hữu", "Mai Bảo", "Lương Tiến"
];

const TEN_NAM = [
  "Nam", "Bảo", "Duy", "Huy", "Khang", "Khoa", "Kiên", "Lâm", "Long", 
  "Minh", "Phong", "Phúc", "Quân", "Quang", "Sang", "Sơn", "Tài", "Tâm", 
  "Thắng", "Thịnh", "Thông", "Toàn", "Trí", "Trung", "Tú", "Tuấn", "Tùng", "Việt"
];

const TEN_NU = [
  "Anh", "Châu", "Chi", "Diệp", "Dung", "Dương", "Giang", "Hà", "Hân",
  "Hiền", "Hòa", "Hương", "Khánh", "Lam", "Lan", "Linh", "Ly", "Mai",
  "Mi", "My", "Nga", "Ngân", "Ngọc", "Nhi", "Nhung", "Oanh", "Phương", "Quỳnh", "Thảo", "Trang", "Trâm", "Vy", "Yến"
];

const HO_PHU_HUYNH = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"
];

const TEN_PHU_HUYNH = [
  "Văn Hùng", "Tuấn Anh", "Văn Nam", "Hữu Đạt", "Quốc Bảo", "Trọng Tấn", "Minh Trí", "Đức Thịnh",
  "Thị Mai", "Thị Lan", "Thu Hương", "Ngọc Ánh", "Hải Yến", "Thanh Hằng", "Kim Oanh", "Thị Nga"
];

function generatePhone(index: number): string {
  const prefixes = ["091", "090", "098", "097", "093", "086", "088", "079", "038", "035"];
  const p = prefixes[index % prefixes.length];
  const tail = String(1000000 + ((index * 3741 + 8293) % 9000000)).slice(1);
  return `${p}${tail}`;
}

export interface SeedClassConfig {
  classId: string;
  className: string;
  room: string;
  schedule: string;
  feePerSession: number;
  count: number;
  startId: number;
}

export const CLASS_CONFIGS: SeedClassConfig[] = [
  {
    classId: "class-toan-9a1",
    className: "Lớp Toán 9A1 (Chuyên sâu)",
    room: "P.201",
    schedule: "Thứ 4 & Thứ 7 (18:00 - 19:30)",
    feePerSession: 200000,
    count: 18,
    startId: 101,
  },
  {
    classId: "class-toan-9a2",
    className: "Lớp Toán 9A2 (Đại trà)",
    room: "P.102",
    schedule: "Thứ 3 & Thứ 6 (19:30 - 21:00)",
    feePerSession: 180000,
    count: 25, // ĐẦY LỚP (25/25)
    startId: 201,
  },
  {
    classId: "class-toan-7a1",
    className: "Lớp Toán 7A1 (Cơ bản)",
    room: "P.102",
    schedule: "Chủ Nhật (19:30 - 21:00)",
    feePerSession: 160000,
    count: 14,
    startId: 301,
  },
  {
    classId: "class-anh-6e1",
    className: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
    room: "P.301",
    schedule: "Thứ 2 & Thứ 5 (17:30 - 19:00)",
    feePerSession: 160000,
    count: 15,
    startId: 401,
  },
  {
    classId: "class-anh-6e2",
    className: "Lớp Tiếng Anh 6-E2 (Chuyên sâu)",
    room: "P.302",
    schedule: "Thứ 4 & Thứ 7 (09:00 - 10:30)",
    feePerSession: 180000,
    count: 30, // ĐẦY LỚP (30/30)
    startId: 501,
  },
  {
    classId: "class-ly-10l1",
    className: "Lớp Vật Lý 10-L1 (Ôn luyện Cấp 3)",
    room: "P.202",
    schedule: "Thứ 3 & Thứ 6 (18:00 - 19:30)",
    feePerSession: 180000,
    count: 14,
    startId: 601,
  },
  {
    classId: "class-van-9v1",
    className: "Lớp Ngữ Văn 9V1 (Luyện thi vào 10)",
    room: "P.101",
    schedule: "Thứ 2 & Thứ 5 (19:30 - 21:00)",
    feePerSession: 170000,
    count: 12,
    startId: 701,
  },
];

// Danh sách học sinh cố định ưu tiên cho các bài kiểm tra thực tế
const PINNED_STUDENTS: Record<string, Partial<AppStudent>> = {
  "std-01": {
    id: "std-01",
    name: "Nguyễn Minh Khang",
    studentName: "Nguyễn Minh Khang",
    full_name: "Nguyễn Minh Khang",
    dob: "2010-04-12",
    birth_date: "2010-04-12",
    parentName: "Nguyễn Văn Hùng",
    parent_name: "Nguyễn Văn Hùng",
    phone: "0912345678",
    parentPhone: "0912345678",
    parent_phone: "0912345678",
    classId: "class-toan-9a1",
    className: "Lớp Toán 9A1 (Chuyên sâu)",
    room: "P.201",
    schedule: "Thứ 4 & Thứ 7 (18:00 - 19:30)",
    totalSessions: 12,
    remainingSessions: 10,
    tuitionStatus: "paid",
    status: "enrolled",
    created_at: "2026-09-01",
    enrolledAt: "2026-09-01",
  },
  "std-02": {
    id: "std-02",
    name: "Hoàng Gia Huy",
    studentName: "Hoàng Gia Huy",
    full_name: "Hoàng Gia Huy",
    dob: "2009-11-05",
    birth_date: "2009-11-05",
    parentName: "Hoàng Tuấn Anh",
    parent_name: "Hoàng Tuấn Anh",
    phone: "0905123987",
    parentPhone: "0905123987",
    parent_phone: "0905123987",
    classId: "class-toan-9a1",
    className: "Lớp Toán 9A1 (Chuyên sâu)",
    room: "P.201",
    schedule: "Thứ 4 & Thứ 7 (18:00 - 19:30)",
    totalSessions: 24,
    remainingSessions: 14,
    tuitionStatus: "paid",
    status: "enrolled",
    created_at: "2026-09-02",
    enrolledAt: "2026-09-02",
  },
  "std-03": {
    id: "std-03",
    name: "Lê Đức Phúc",
    studentName: "Lê Đức Phúc",
    full_name: "Lê Đức Phúc",
    dob: "2010-06-20",
    birth_date: "2010-06-20",
    parentName: "Lê Văn Tùng",
    parent_name: "Lê Văn Tùng",
    phone: "0918889999",
    parentPhone: "0918889999",
    parent_phone: "0918889999",
    classId: "class-toan-9a1",
    className: "Lớp Toán 9A1 (Chuyên sâu)",
    room: "P.201",
    schedule: "Thứ 4 & Thứ 7 (18:00 - 19:30)",
    totalSessions: 12,
    remainingSessions: 8,
    tuitionStatus: "paid",
    status: "enrolled",
    created_at: "2026-09-03",
    enrolledAt: "2026-09-03",
  },
  "std-04": {
    id: "std-04",
    name: "Trần Đức Anh",
    studentName: "Trần Đức Anh",
    full_name: "Trần Đức Anh",
    dob: "2013-08-10",
    birth_date: "2013-08-10",
    parentName: "Trần Văn Nam",
    parent_name: "Trần Văn Nam",
    phone: "0912111222",
    parentPhone: "0912111222",
    parent_phone: "0912111222",
    classId: "class-anh-6e1",
    className: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
    room: "P.301",
    schedule: "Thứ 2 & Thứ 5 (17:30 - 19:00)",
    totalSessions: 24,
    remainingSessions: 24,
    tuitionStatus: "paid",
    status: "enrolled",
    created_at: "2026-09-04",
    enrolledAt: "2026-09-04",
  },
};

// Hàm sinh danh sách học sinh đầy đủ, thực tế và đồng bộ theo Single Source of Truth
export function generateSeedStudents(): AppStudent[] {
  const result: AppStudent[] = [];

  CLASS_CONFIGS.forEach((cfg) => {
    for (let i = 0; i < cfg.count; i++) {
      const studentId = `std-${cfg.classId.replace("class-", "")}-${String(i + 1).padStart(2, "0")}`;
      
      // Nếu là học sinh đặc biệt đã có
      if (cfg.classId === "class-toan-9a1" && i === 0 && PINNED_STUDENTS["std-01"]) {
        const p = PINNED_STUDENTS["std-01"];
        result.push({
          id: p.id!,
          name: p.name!,
          studentName: p.studentName || p.name!,
          full_name: p.full_name!,
          dob: p.dob,
          birth_date: p.birth_date,
          parentName: p.parentName,
          parent_name: p.parent_name,
          phone: p.phone,
          parentPhone: p.parentPhone,
          parent_phone: p.parent_phone,
          classId: cfg.classId,
          className: cfg.className,
          room: cfg.room,
          schedule: cfg.schedule,
          totalSessions: p.totalSessions || 12,
          remainingSessions: p.remainingSessions || 10,
          tuitionStatus: "paid",
          status: "enrolled",
          created_at: p.created_at || "2026-09-01",
          enrolledAt: p.enrolledAt || "2026-09-01",
          enrollments: [
            {
              id: `enr-${p.id}`,
              class_id: cfg.classId,
              balance_sessions: p.remainingSessions || 10,
              joined_at: p.created_at || "2026-09-01",
              status: "enrolled",
              class: { id: cfg.classId, name: cfg.className, fee_per_session: cfg.feePerSession },
            },
          ],
        });
        continue;
      }

      if (cfg.classId === "class-toan-9a1" && i === 1 && PINNED_STUDENTS["std-02"]) {
        const p = PINNED_STUDENTS["std-02"];
        result.push({
          id: p.id!,
          name: p.name!,
          studentName: p.studentName || p.name!,
          full_name: p.full_name!,
          dob: p.dob,
          birth_date: p.birth_date,
          parentName: p.parentName,
          parent_name: p.parent_name,
          phone: p.phone,
          parentPhone: p.parentPhone,
          parent_phone: p.parent_phone,
          classId: cfg.classId,
          className: cfg.className,
          room: cfg.room,
          schedule: cfg.schedule,
          totalSessions: p.totalSessions || 24,
          remainingSessions: p.remainingSessions || 14,
          tuitionStatus: "paid",
          status: "enrolled",
          created_at: p.created_at || "2026-09-02",
          enrolledAt: p.enrolledAt || "2026-09-02",
          enrollments: [
            {
              id: `enr-${p.id}`,
              class_id: cfg.classId,
              balance_sessions: p.remainingSessions || 14,
              joined_at: p.created_at || "2026-09-02",
              status: "enrolled",
              class: { id: cfg.classId, name: cfg.className, fee_per_session: cfg.feePerSession },
            },
          ],
        });
        continue;
      }

      if (cfg.classId === "class-toan-9a1" && i === 2 && PINNED_STUDENTS["std-03"]) {
        const p = PINNED_STUDENTS["std-03"];
        result.push({
          id: p.id!,
          name: p.name!,
          studentName: p.studentName || p.name!,
          full_name: p.full_name!,
          dob: p.dob,
          birth_date: p.birth_date,
          parentName: p.parentName,
          parent_name: p.parent_name,
          phone: p.phone,
          parentPhone: p.parentPhone,
          parent_phone: p.parent_phone,
          classId: cfg.classId,
          className: cfg.className,
          room: cfg.room,
          schedule: cfg.schedule,
          totalSessions: p.totalSessions || 12,
          remainingSessions: p.remainingSessions || 8,
          tuitionStatus: "paid",
          status: "enrolled",
          created_at: p.created_at || "2026-09-03",
          enrolledAt: p.enrolledAt || "2026-09-03",
          enrollments: [
            {
              id: `enr-${p.id}`,
              class_id: cfg.classId,
              balance_sessions: p.remainingSessions || 8,
              joined_at: p.created_at || "2026-09-03",
              status: "enrolled",
              class: { id: cfg.classId, name: cfg.className, fee_per_session: cfg.feePerSession },
            },
          ],
        });
        continue;
      }

      if (cfg.classId === "class-anh-6e1" && i === 0 && PINNED_STUDENTS["std-04"]) {
        const p = PINNED_STUDENTS["std-04"];
        result.push({
          id: p.id!,
          name: p.name!,
          studentName: p.studentName || p.name!,
          full_name: p.full_name!,
          dob: p.dob,
          birth_date: p.birth_date,
          parentName: p.parentName,
          parent_name: p.parent_name,
          phone: p.phone,
          parentPhone: p.parentPhone,
          parent_phone: p.parent_phone,
          classId: cfg.classId,
          className: cfg.className,
          room: cfg.room,
          schedule: cfg.schedule,
          totalSessions: p.totalSessions || 24,
          remainingSessions: p.remainingSessions || 24,
          tuitionStatus: "paid",
          status: "enrolled",
          created_at: p.created_at || "2026-09-04",
          enrolledAt: p.enrolledAt || "2026-09-04",
          enrollments: [
            {
              id: `enr-${p.id}`,
              class_id: cfg.classId,
              balance_sessions: p.remainingSessions || 24,
              joined_at: p.created_at || "2026-09-04",
              status: "enrolled",
              class: { id: cfg.classId, name: cfg.className, fee_per_session: cfg.feePerSession },
            },
          ],
        });
        continue;
      }

      // Tạo tên học sinh ngẫu nhiên nhưng nhất quán theo chỉ số
      const isMale = (cfg.startId + i) % 2 === 0;
      const hoDem = HO_DEM[(cfg.startId + i * 3) % HO_DEM.length];
      const ten = isMale 
        ? TEN_NAM[(cfg.startId + i * 5) % TEN_NAM.length]
        : TEN_NU[(cfg.startId + i * 7) % TEN_NU.length];
      const studentName = `${hoDem} ${ten}`;

      // Tên phụ huynh
      const hoPh = HO_PHU_HUYNH[(cfg.startId + i * 2) % HO_PHU_HUYNH.length];
      const tenPh = TEN_PHU_HUYNH[(cfg.startId + i) % TEN_PHU_HUYNH.length];
      const parentName = `${hoPh} ${tenPh}`;

      const parentPhone = generatePhone(cfg.startId + i);
      const totalSessions = ((cfg.startId + i) % 3 === 0) ? 24 : 12;
      
      // Số buổi còn lại (một vài bạn có ít buổi để kiểm tra cảnh báo tái tục)
      let remainingSessions = ((cfg.startId + i * 4) % (totalSessions - 2)) + 3;
      if (i === 3 || i === 7) remainingSessions = 1;
      if (i === 5) remainingSessions = 2;

      const day = String(1 + ((cfg.startId + i * 2) % 25)).padStart(2, "0");
      const joinedDate = `2026-09-${day}`;

      result.push({
        id: studentId,
        name: studentName,
        studentName,
        full_name: studentName,
        dob: `2011-05-${day}`,
        birth_date: `2011-05-${day}`,
        parentName,
        parent_name: parentName,
        phone: parentPhone,
        parentPhone,
        parent_phone: parentPhone,
        classId: cfg.classId,
        className: cfg.className,
        room: cfg.room,
        schedule: cfg.schedule,
        totalSessions,
        remainingSessions,
        tuitionStatus: "paid",
        status: "enrolled",
        created_at: joinedDate,
        enrolledAt: joinedDate,
        enrollments: [
          {
            id: `enr-${studentId}`,
            class_id: cfg.classId,
            balance_sessions: remainingSessions,
            joined_at: joinedDate,
            status: "enrolled",
            class: {
              id: cfg.classId,
              name: cfg.className,
              fee_per_session: cfg.feePerSession,
            },
          },
        ],
      });
    }
  });

  return result;
}

// Hàm sinh danh sách enrollment cho từng lớp từ mảng học sinh
export function getEnrollmentsForClass(classId: string, students: AppStudent[]) {
  return students
    .filter((s) => s.classId === classId || s.enrollments?.some((e) => e.class_id === classId))
    .map((s) => {
      const enr = s.enrollments?.find((e) => e.class_id === classId);
      return {
        id: enr?.id || `enr-${s.id}`,
        student_id: s.id,
        class_id: classId,
        balance_sessions: s.remainingSessions ?? enr?.balance_sessions ?? 12,
        joined_at: s.created_at || s.enrolledAt || "2026-09-01",
        status: s.status || "enrolled",
        student: {
          id: s.id,
          full_name: s.studentName || s.full_name || s.name || "Học sinh",
          parent_name: s.parent_name || s.parentName || "Phụ huynh",
          parent_phone: s.parent_phone || s.parentPhone || s.phone || "",
        },
      };
    });
}

// Hàm sinh toàn bộ hồ sơ Chuyển đổi & Ghi danh (Single Source of Truth với Quản lý lớp)
export function generateSeedConversions(students: AppStudent[]): EnrollmentConversion[] {
  // 1. Chuyển đổi toàn bộ học sinh đã vào các lớp chính thức thành Completed Enrollments
  const convertedList: EnrollmentConversion[] = students.map((s) => {
    const feePerSession = s.enrollments?.[0]?.class?.fee_per_session || 180000;
    const sessions = s.totalSessions || 12;
    const totalTuition = sessions * feePerSession;
    const joinedDate = s.created_at || s.enrolledAt || "2026-09-02";
    const dateFormatted = `${joinedDate}T10:00:00`;

    return {
      id: `conv-${s.id}`,
      leadId: `lead-${s.id}`,
      studentName: s.studentName || s.full_name || s.name || "Học sinh",
      parentName: s.parentName || s.parent_name || "Phụ huynh",
      parentPhone: s.phone || s.parentPhone || s.parent_phone || "",
      classId: s.classId || "class-toan-9a1",
      className: s.className || "Lớp học chính thức",
      depositAmount: 0,
      tuitionPackageSessions: sessions,
      tuitionFee: totalTuition,
      isDepositPaid: true,
      isTuitionPaid: true,
      status: "converted",
      convertedAt: dateFormatted,
      createdAt: `${joinedDate}T08:00:00`,
      dueDate: dateFormatted,
      convertedToStudentId: s.id,
      subjects: [
        {
          trialClassId: s.classId || "class-toan-9a1",
          className: s.className || "Lớp học chính thức",
          officialClassId: s.classId || "class-toan-9a1",
          officialClassName: s.className || "Lớp học chính thức",
          testScore: 8.5,
          tuitionFee: totalTuition,
          isSelected: true,
          sessions,
          packageLabel: `Gói ${sessions} buổi`,
          feePerSession,
        },
      ],
    };
  });

  // 2. Bổ sung các Lead đang chờ chốt (Pending Conversions)
  const pendingList: EnrollmentConversion[] = [
    {
      id: "conv-pending-01",
      leadId: "lead-06",
      studentName: "Phạm Thảo Linh",
      parentName: "Trần Bích Hạnh",
      parentPhone: "0945678123",
      classId: "class-toan-7a1",
      className: "Lớp Toán 7A1 (Cơ bản)",
      depositAmount: 500000,
      tuitionPackageSessions: 12,
      tuitionFee: 1920000,
      isDepositPaid: false,
      isTuitionPaid: false,
      status: "pending_deposit",
      createdAt: "2026-09-08T10:00:00",
      dueDate: "2026-09-12T18:00:00",
      subjects: [
        {
          trialClassId: "class-toan-7a1",
          className: "Lớp Toán 7A1 (Cơ bản)",
          officialClassId: "class-toan-7a1",
          officialClassName: "Lớp Toán 7A1 (Cơ bản)",
          testScore: 8.0,
          tuitionFee: 1920000,
          isSelected: true,
          sessions: 12,
          packageLabel: "Gói 12 buổi",
          feePerSession: 160000,
        },
      ],
    },
    {
      id: "conv-pending-02",
      leadId: "lead-ta6-spec-2",
      studentName: "Vũ Phương Thảo",
      parentName: "Vũ Hải Đăng",
      parentPhone: "0913222333",
      classId: "class-anh-6e1",
      className: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
      depositAmount: 500000,
      tuitionPackageSessions: 12,
      tuitionFee: 1920000,
      isDepositPaid: false,
      isTuitionPaid: false,
      status: "pending_deposit",
      createdAt: "2026-09-09T09:30:00",
      dueDate: "2026-09-15T17:00:00",
      subjects: [
        {
          trialClassId: "class-anh-6e1",
          className: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
          officialClassId: "class-anh-6e1",
          officialClassName: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
          testScore: 8.5,
          tuitionFee: 1920000,
          isSelected: true,
          sessions: 12,
          packageLabel: "Gói 12 buổi",
          feePerSession: 160000,
        },
      ],
    },
    {
      id: "conv-pending-03",
      leadId: "lead-05",
      studentName: "Đỗ Quốc Đạt",
      parentName: "Đỗ Mạnh Cường",
      parentPhone: "0978112233",
      classId: "class-toan-9a1",
      className: "Lớp Toán 9A1 (Chuyên sâu)",
      depositAmount: 0,
      tuitionPackageSessions: 12,
      tuitionFee: 2400000,
      isDepositPaid: false,
      isTuitionPaid: false,
      status: "pending_deposit",
      createdAt: "2026-09-09T14:15:00",
      dueDate: "2026-09-14T20:00:00",
      subjects: [
        {
          trialClassId: "class-toan-9a1",
          className: "Lớp Toán 9A1 (Chuyên sâu)",
          officialClassId: "class-toan-9a1",
          officialClassName: "Lớp Toán 9A1 (Chuyên sâu)",
          testScore: 7.5,
          tuitionFee: 2400000,
          isSelected: true,
          sessions: 12,
          packageLabel: "Gói 12 buổi",
          feePerSession: 200000,
        },
      ],
    },
  ];

  // Thứ tự hiển thị: Các Lead chờ xử lý đặt lên trước để nhân viên dễ thấy, sau đó là toàn bộ học sinh đã hoàn tất ghi danh
  return [...pendingList, ...convertedList];
}
