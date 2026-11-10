import {
  RoomItem,
  InventoryItem,
  IncidentReport,
  ClassPrepTask,
} from "@/lib/types/facilities";

export const INITIAL_ROOMS: RoomItem[] = [
  {
    id: "room-101",
    name: "P.101",
    floor: "Tầng 1",
    type: "standard",
    capacity: 25,
    status: "available",
    furniture: {
      studentDesks: 13,
      studentChairs: 25,
      teacherDesk: true,
      teacherChair: true,
      podium: true,
    },
    devices: [
      { name: "Máy chiếu Epson Full HD 3500lm + Màn chiếu điện", type: "projector", category: "display", status: "good" },
      { name: "Bộ Micro không dây trợ giảng Shure & Loa âm trần", type: "audio", category: "audio", status: "good" },
      { name: "Bảng từ ceramic trắng chống lóa 3.2m", type: "board", category: "teaching", status: "good" },
      { name: "Khay bút viết bảng 3 màu (Xanh/Đỏ/Đen) & Bông lau", type: "supplies", category: "teaching", status: "good" },
      { name: "Điều hòa Daikin Inverter 2HP", type: "ac", category: "climate_power", status: "good", note: "Bảo dưỡng định kỳ 15/09" },
      { name: "2 Quạt đảo trần Panasonic & Hệ thống đèn LED 500 Lux", type: "fan_lighting", category: "climate_power", status: "good" },
      { name: "Hệ thống ổ cắm điện đa năng bàn GV & dãy bàn HS", type: "outlet", category: "climate_power", status: "good" },
    ],
    note: "Phòng sảnh Tầng 1, thích hợp cho các lớp Toán & Khoa học, lối đi rộng rãi",
    lastInspected: "2026-10-25",
  },
  {
    id: "room-102",
    name: "P.102",
    floor: "Tầng 1",
    type: "standard",
    capacity: 25,
    status: "in_use",
    furniture: {
      studentDesks: 13,
      studentChairs: 25,
      teacherDesk: true,
      teacherChair: true,
      podium: true,
    },
    devices: [
      { name: "Smart TV Sony 75 inch 4K HDR", type: "screen", category: "display", status: "good" },
      { name: "Loa Soundbar trợ giảng Sony & Micro cầm tay", type: "audio", category: "audio", status: "good" },
      { name: "Bảng từ trắng Hàn Quốc 3m", type: "board", category: "teaching", status: "good" },
      { name: "Hộp bút dạ Thiên Long + Bông lau nam châm", type: "supplies", category: "teaching", status: "good" },
      { name: "Điều hòa Daikin 2HP", type: "ac", category: "climate_power", status: "warning", note: "Làm mát hơi chậm, cần vệ sinh lưới lọc bụi" },
      { name: "Hệ thống 6 đèn tuýp LED chống cận & Ổ cắm phụ", type: "lighting", category: "climate_power", status: "good" },
    ],
    note: "Màn hình 4K sắc nét cho bài giảng trình chiếu tương tác cao",
    lastInspected: "2026-10-24",
  },
  {
    id: "room-201",
    name: "P.201",
    floor: "Tầng 2",
    type: "multimedia",
    capacity: 30,
    status: "available",
    furniture: {
      studentDesks: 15,
      studentChairs: 30,
      teacherDesk: true,
      teacherChair: true,
      podium: true,
    },
    devices: [
      { name: "Máy chiếu Laser Panasonic 4500lm + Màn chiếu lớn 120 inch", type: "projector", category: "display", status: "good" },
      { name: "Bộ 2 Micro không dây Sennheiser & Ampli + Loa vòm", type: "audio", category: "audio", status: "good", note: "Pin sạc dock 100%" },
      { name: "Bảng kính từ cao cấp 4m", type: "board", category: "teaching", status: "good" },
      { name: "Khay bút dạ cao cấp & Bút laser trình chiếu Logitech", type: "supplies", category: "teaching", status: "good" },
      { name: "2 Điều hòa âm trần Daikin 2.5HP", type: "ac", category: "climate_power", status: "good" },
      { name: "Đèn LED panel âm trần chuẩn học đường & 4 cụm ổ cắm", type: "lighting", category: "climate_power", status: "good" },
    ],
    note: "Phòng học đa phương tiện chất lượng cao, chuyên sâu các môn mũi nhọn",
    lastInspected: "2026-10-26",
  },
  {
    id: "room-202",
    name: "P.202",
    floor: "Tầng 2",
    type: "standard",
    capacity: 25,
    status: "available",
    furniture: {
      studentDesks: 13,
      studentChairs: 25,
      teacherDesk: true,
      teacherChair: true,
      podium: false,
    },
    devices: [
      { name: "Màn hình tương tác thông minh ViewSonic 86 inch 4K cảm ứng", type: "screen", category: "display", status: "good" },
      { name: "Loa trợ giảng di động kèm Micro không dây", type: "audio", category: "audio", status: "good" },
      { name: "Bảng trượt thông minh 2 lớp", type: "board", category: "teaching", status: "good" },
      { name: "Bút cảm ứng tương tác + Bút viết bảng và bông lau", type: "supplies", category: "teaching", status: "good" },
      { name: "Điều hòa Panasonic Inverter 2HP", type: "ac", category: "climate_power", status: "good" },
      { name: "Quạt treo tường điều khiển từ xa & Đèn LED", type: "fan_lighting", category: "climate_power", status: "good" },
    ],
    note: "Phòng công nghệ tương tác trực quan cho học sinh tiểu học & THCS",
    lastInspected: "2026-10-25",
  },
  {
    id: "room-301",
    name: "P.301",
    floor: "Tầng 3",
    type: "multimedia",
    capacity: 25,
    status: "available",
    furniture: {
      studentDesks: 13,
      studentChairs: 25,
      teacherDesk: true,
      teacherChair: true,
      podium: true,
    },
    devices: [
      { name: "Smart TV Samsung QLED 65 inch 4K", type: "screen", category: "display", status: "good" },
      { name: "Hệ thống âm thanh ngoại ngữ: 25 tai nghe Sony + Ampli luyện nghe", type: "audio", category: "audio", status: "good" },
      { name: "Micro không dây cài áo giáo viên", type: "audio", category: "audio", status: "good" },
      { name: "Bảng từ trắng 3.2m chống lóa", type: "board", category: "teaching", status: "good" },
      { name: "Điều hòa Daikin 2HP & 2 Quạt trần", type: "ac", category: "climate_power", status: "good" },
      { name: "Hệ thống đèn LED ánh sáng vàng-trắng dịu mắt", type: "lighting", category: "climate_power", status: "good" },
    ],
    note: "Chuyên dụng cho các lớp Tiếng Anh IELTS, Cambridge & Luyện nghe",
    lastInspected: "2026-10-26",
  },
  {
    id: "room-302",
    name: "P.302",
    floor: "Tầng 3",
    type: "standard",
    capacity: 32,
    status: "available",
    furniture: {
      studentDesks: 16,
      studentChairs: 32,
      teacherDesk: true,
      teacherChair: true,
      podium: true,
    },
    devices: [
      { name: "Máy chiếu siêu gần Sony Laser + Màn chiếu quang học", type: "projector", category: "display", status: "good" },
      { name: "Hệ thống loa âm trần Bosch & Micro không dây", type: "audio", category: "audio", status: "good" },
      { name: "Bảng từ ceramic trắng 4m", type: "board", category: "teaching", status: "good" },
      { name: "2 Điều hòa Daikin 2.5HP", type: "ac", category: "climate_power", status: "good" },
      { name: "Hệ thống đèn trần 8 bóng & Ổ cắm điện chống giật", type: "power", category: "climate_power", status: "good" },
    ],
    note: "Phòng học diện tích lớn, dành cho các lớp đông học viên & thi thử",
    lastInspected: "2026-10-26",
  },
  {
    id: "room-lab",
    name: "Phòng Lab & STEM",
    floor: "Tầng 3",
    type: "lab",
    capacity: 24,
    status: "available",
    furniture: {
      studentDesks: 12,
      studentChairs: 24,
      teacherDesk: true,
      teacherChair: true,
      podium: true,
    },
    devices: [
      { name: "24 Bộ máy tính để bàn Intel Core i5 / RAM 16GB", type: "computer", category: "display", status: "good" },
      { name: "Màn chiếu trung tâm & Máy in công nghiệp HP LaserJet Pro", type: "printer", category: "teaching", status: "good", note: "Sẵn sàng in tài liệu tại chỗ" },
      { name: "Micro trợ giảng không dây & Hệ thống loa âm tường", type: "audio", category: "audio", status: "good" },
      { name: "Điều hòa trung tâm Daikin 3HP & Hệ thống thông gió", type: "ac", category: "climate_power", status: "good" },
      { name: "Cụm ổ cắm chuyên dụng chống quá tải cho 24 máy tính", type: "power", category: "climate_power", status: "good" },
    ],
    note: "Phòng thực hành máy tính, in ấn tài liệu & khảo sát đánh giá",
    lastInspected: "2026-10-27",
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Giáo trình & Tài liệu học tập (Mục 4)
  {
    id: "inv-gt-toan9-cb",
    name: "Giáo trình Toán 9 - Chuyên đề Hình học & Đại số (Tập 1)",
    category: "curriculum",
    quantity: 65,
    unit: "quyển",
    minThreshold: 20,
    location: "Kệ sách A - Phòng Học vụ",
    subject: "Toán 9",
    status: "in_stock",
    note: "Tài liệu phát đầu khóa + bài tập về nhà",
  },
  {
    id: "inv-gt-toan7-cb",
    name: "Tài liệu bồi dưỡng Toán 7 - Nâng cao & Phát triển tư duy",
    category: "curriculum",
    quantity: 42,
    unit: "quyển",
    minThreshold: 15,
    location: "Kệ sách A - Phòng Học vụ",
    subject: "Toán 7",
    status: "in_stock",
  },
  {
    id: "inv-gt-eng6-e1",
    name: "Sách bài tập English Plus 6 (Coursebook & Workbook)",
    category: "curriculum",
    quantity: 38,
    unit: "bộ",
    minThreshold: 20,
    location: "Kệ sách B - Phòng Học vụ",
    subject: "Tiếng Anh",
    status: "in_stock",
  },
  {
    id: "inv-gt-eng6-e2",
    name: "Bộ đề luyện chuyên sâu Tiếng Anh 6 - Ngữ pháp & Từ vựng",
    category: "curriculum",
    quantity: 12,
    unit: "quyển",
    minThreshold: 25,
    location: "Kệ sách B - Phòng Học vụ",
    subject: "Tiếng Anh",
    status: "low_stock",
    note: "Cần in thêm 30 bản cho lớp 6E2 tuần tới!",
  },
  {
    id: "inv-gt-phieu-toan9",
    name: "Đề thi & Phiếu bài tập in sẵn Toán 9 (Tuần 8)",
    category: "curriculum",
    quantity: 90,
    unit: "bộ",
    minThreshold: 30,
    location: "Hộc tủ in ấn - Tầng 1",
    subject: "Toán 9",
    status: "in_stock",
  },

  // Thiết bị dạy & học di động (Mục 2)
  {
    id: "inv-dev-mic-01",
    name: "Bộ Micro không dây trợ giảng Shure PGX (2 tay mic kèm pin sạc)",
    category: "device",
    quantity: 5,
    unit: "bộ",
    minThreshold: 2,
    location: "Tủ thiết bị - Sảnh lễ tân",
    status: "in_stock",
    note: "Đã sạc đầy pin 100%",
  },
  {
    id: "inv-dev-laser-pen",
    name: "Bút trình chiếu Laser Logitech R400 (kèm pin AAA)",
    category: "device",
    quantity: 6,
    unit: "chiếc",
    minThreshold: 2,
    location: "Hộc bàn quản lý ca",
    status: "in_stock",
  },
  {
    id: "inv-dev-hdmi-cables",
    name: "Cáp nối HDMI 5m bọc dù + Đầu chuyển Type-C / Lightning / iPad",
    category: "device",
    quantity: 8,
    unit: "sợi",
    minThreshold: 3,
    location: "Hộc cáp kết nối - P. Học vụ",
    status: "in_stock",
  },
  {
    id: "inv-dev-speaker-bt",
    name: "Loa di động Marshall trợ giảng các lớp ngoại khóa & sân khấu",
    category: "device",
    quantity: 2,
    unit: "chiếc",
    minThreshold: 1,
    location: "Tủ thiết bị - Sảnh lễ tân",
    status: "in_stock",
  },

  // Bút viết bảng & Vật tư tiêu hao (Mục 2 & 4)
  {
    id: "inv-stat-marker-blue",
    name: "Bút viết bảng Thiên Long WB-03 (Mực Xanh)",
    category: "stationery",
    quantity: 48,
    unit: "cây",
    minThreshold: 15,
    location: "Tủ văn phòng phẩm",
    status: "in_stock",
  },
  {
    id: "inv-stat-marker-red",
    name: "Bút viết bảng Thiên Long WB-03 (Mực Đỏ)",
    category: "stationery",
    quantity: 24,
    unit: "cây",
    minThreshold: 10,
    location: "Tủ văn phòng phẩm",
    status: "in_stock",
  },
  {
    id: "inv-stat-marker-black",
    name: "Bút viết bảng Thiên Long WB-03 (Mực Đen)",
    category: "stationery",
    quantity: 36,
    unit: "cây",
    minThreshold: 15,
    location: "Tủ văn phòng phẩm",
    status: "in_stock",
  },
  {
    id: "inv-stat-eraser",
    name: "Bông lau bảng từ tính cao cấp (hút nam châm dính mặt bảng)",
    category: "stationery",
    quantity: 14,
    unit: "chiếc",
    minThreshold: 6,
    location: "Tủ văn phòng phẩm",
    status: "in_stock",
  },
  {
    id: "inv-stat-math-ruler",
    name: "Bộ thước kẻ giáo viên bảng lớn (Thước 1m, Ê-ke, Compa, Thước đo độ)",
    category: "stationery",
    quantity: 4,
    unit: "bộ",
    minThreshold: 2,
    location: "Tủ thiết bị Toán - P.101 & P.201",
    subject: "Toán",
    status: "in_stock",
  },
  {
    id: "inv-stat-paper-a4",
    name: "Giấy in Double A A4 70gsm phục vụ in đề thi & tài liệu (Ram 500 tờ)",
    category: "stationery",
    quantity: 18,
    unit: "ram",
    minThreshold: 5,
    location: "Kho giấy in - Tầng 3",
    status: "in_stock",
  },
  {
    id: "inv-stat-paper-a3",
    name: "Giấy A3 trắng & Bút màu Marker phục vụ bài tập nhóm/thực hành",
    category: "stationery",
    quantity: 10,
    unit: "tập",
    minThreshold: 3,
    location: "Kho giấy in - Tầng 3",
    status: "in_stock",
  },

  // Nước uống & Phục vụ giáo viên
  {
    id: "inv-amen-water-gv",
    name: "Nước khoáng Lavie 350ml phục vụ Giáo viên giảng dạy",
    category: "amenity",
    quantity: 72,
    unit: "chai",
    minThreshold: 24,
    location: "Tủ mát phòng chờ GV",
    status: "in_stock",
  },
  {
    id: "inv-amen-water-cup",
    name: "Ly giấy uống nước học viên dùng tại cây nước lọc nóng lạnh",
    category: "amenity",
    quantity: 15,
    unit: "cây",
    minThreshold: 5,
    location: "Cây nước nóng lạnh các tầng",
    status: "in_stock",
  },
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: "inc-01",
    roomName: "P.102",
    title: "Điều hòa Daikin làm mát chậm, có tiếng ồn nhỏ",
    description: "Sau 20 phút bật nhiệt độ 22°C vẫn chưa đủ mát, cần vệ sinh lưới lọc bụi và kiểm tra gas làm lạnh.",
    severity: "normal",
    status: "fixing",
    reportedBy: "Cô Trần Thị Mai (GV Toán)",
    reportedAt: "2026-10-25 19:40",
    note: "Đã liên hệ đội bảo trì điện lạnh xử lý trước ca chiều mai.",
  },
  {
    id: "inc-02",
    roomName: "P.201",
    title: "Cáp HDMI kết nối máy chiếu bị chập chờn",
    description: "Giáo viên cắm laptop thỉnh thoảng chớp màn hình xanh, cần thay sợi cáp HDMI mới bọc chống nhiễu.",
    severity: "urgent",
    status: "resolved",
    reportedBy: "Thầy Nguyễn Tiến Dũng (GV Lý)",
    reportedAt: "2026-10-24 18:15",
    resolvedAt: "2026-10-25 09:00",
    resolutionNote: "Đã thay cáp HDMI Ugreen 5m mới, test hình ảnh 4K ổn định 100%.",
  },
  {
    id: "inc-03",
    roomName: "P.301",
    title: "Micro không dây số 2 sắp hết pin dự phòng",
    description: "Cần bổ sung thêm vỉ pin sạc AA cho phòng ngoại ngữ để đảm bảo tiết học 90 phút không ngắt quãng.",
    severity: "low",
    status: "resolved",
    reportedBy: "Cô Emily Nguyễn (GV Tiếng Anh)",
    reportedAt: "2026-10-23 17:00",
    resolvedAt: "2026-10-23 17:20",
    resolutionNote: "Đã cấp 4 viên pin Eneloop sạc đầy vào dock sạc của phòng.",
  },
];

/**
 * Tạo danh sách task chuẩn bị lớp học mặc định theo đúng 5 hạng mục yêu cầu
 */
export function generateDefaultTasks(
  subject: string,
  studentCount: number,
  curriculumCopies: number,
  roomName: string
): ClassPrepTask[] {
  const isMath = subject.toLowerCase().includes("toán");
  const isEnglish = subject.toLowerCase().includes("anh");

  const tasks: ClassPrepTask[] = [
    // ─── 1. Bàn ghế & Nội thất (Furniture) ───
    {
      id: "task-furn-seats",
      label: `Kê đủ ${studentCount} chỗ ngồi học sinh (bàn ghế ngay ngắn, khoảng cách thông thoáng)`,
      category: "room_furniture",
      checked: true,
      required: true,
    },
    {
      id: "task-furn-teacher",
      label: "Chuẩn bị 1 bàn giáo viên, ghế tựa & bục giảng sạch sẽ, ngăn nắp",
      category: "room_furniture",
      checked: true,
      required: true,
    },
    {
      id: "task-furn-hygiene",
      label: "Kiểm tra vệ sinh sàn phòng học sạch sẽ, thu gom rác & sọt rác trống",
      category: "room_furniture",
      checked: false,
    },

    // ─── 2. Trang thiết bị dạy & học (Hardware & Tech Supplies) ───
    {
      id: "task-tech-ac",
      label: `Bật điều hòa ${roomName} (24-26°C), quạt và hệ thống đèn LED chiếu sáng trước giờ học 15 phút`,
      category: "hardware_tech",
      checked: true,
      required: true,
    },
    {
      id: "task-tech-screen",
      label: "Bật máy chiếu / TV thông minh, kiểm tra cáp HDMI và kết nối trình chiếu màn hình",
      category: "hardware_tech",
      checked: true,
      required: true,
    },
    {
      id: "task-tech-audio",
      label: "Bật micro không dây, thử âm lượng loa trợ giảng rõ tiếng & kiểm tra pin sạc đầy",
      category: "hardware_tech",
      checked: true,
      required: true,
    },
    {
      id: "task-tech-power",
      label: "Kiểm tra ổ cắm điện tại bàn giáo viên và các dãy bàn hoạt động bình thường, an toàn",
      category: "hardware_tech",
      checked: false,
    },

    // ─── 3. Dụng cụ giảng dạy & Bảng viết (Teaching Supplies) ───
    {
      id: "task-teach-board",
      label: "Lau sạch bảng từ trắng / bảng phấn, không để đọng vết mực cũ",
      category: "teaching_supplies",
      checked: true,
      required: true,
    },
    {
      id: "task-teach-markers",
      label: "Chuẩn bị sẵn 3 bút viết bảng (Xanh, Đỏ, Đen) mực đậm & 1 bông lau bảng từ tính",
      category: "teaching_supplies",
      checked: true,
      required: true,
    },

    // ─── 4. Giáo trình & Vật dụng chuẩn bị buổi học (Classroom Prep & Materials) ───
    {
      id: "task-curr-print",
      label: `In ấn & xếp sẵn ${curriculumCopies} bộ tài liệu / đề thi (${studentCount} học viên + 1 giáo viên)`,
      category: "curriculum_materials",
      checked: false,
      required: true,
    },
    {
      id: "task-curr-table",
      label: "Đặt giáo trình, sách bài tập và danh sách điểm danh lên bàn giáo viên",
      category: "curriculum_materials",
      checked: false,
    },
    {
      id: "task-curr-supplies",
      label: "Chuẩn bị giấy A4 nháp & bút màu cho học sinh thực hành",
      category: "curriculum_materials",
      checked: false,
    },
    {
      id: "task-curr-water",
      label: "Chuẩn bị 1 chai nước khoáng cho giáo viên & kiểm tra bình nước lọc học sinh",
      category: "curriculum_materials",
      checked: true,
    },

    // ─── 5. Kiểm tra Tình trạng & Bảo trì (Maintenance Checklist) ───
    {
      id: "task-check-devices",
      label: "Nghiệm thu thiết bị: Điều hòa làm mát đều, máy chiếu sáng rõ không chớp, loa không rè",
      category: "inspection_check",
      checked: true,
      required: true,
    },
    {
      id: "task-check-incident",
      label: "Ghi nhận sự cố hỏng hóc (nếu có) vào hệ thống bảo trì để kỹ thuật xử lý kịp thời",
      category: "inspection_check",
      checked: true,
    },
  ];

  if (isMath) {
    tasks.push({
      id: "task-sup-math-tools",
      label: "Chuẩn bị bộ thước kẻ giáo viên bảng lớn (Thước 1m, Ê-ke, Compa bảng)",
      category: "curriculum_materials",
      checked: false,
    });
  }

  if (isEnglish) {
    tasks.push({
      id: "task-dev-listening",
      label: "Kiểm tra file Audio nghe trên máy & bộ thẻ Flashcard từ vựng",
      category: "hardware_tech",
      checked: true,
    });
  }

  return tasks;
}

export function parseScheduleDays(schedule: any): { days: string[]; timeSlot: string } {
  if (!schedule) return { days: ["Thứ 2"], timeSlot: "18:00 - 19:30" };

  if (typeof schedule === "string") {
    const timeMatch = schedule.match(/\((.*?)\)/);
    const timeSlot = timeMatch ? timeMatch[1].trim() : "18:00 - 19:30";

    const days: string[] = [];
    const lower = schedule.toLowerCase();
    if (lower.includes("thứ 2") || lower.includes("thứ hai") || lower.includes("t2")) days.push("Thứ 2");
    if (lower.includes("thứ 3") || lower.includes("thứ ba") || lower.includes("t3")) days.push("Thứ 3");
    if (lower.includes("thứ 4") || lower.includes("thứ tư") || lower.includes("t4")) days.push("Thứ 4");
    if (lower.includes("thứ 5") || lower.includes("thứ năm") || lower.includes("t5")) days.push("Thứ 5");
    if (lower.includes("thứ 6") || lower.includes("thứ sáu") || lower.includes("t6")) days.push("Thứ 6");
    if (lower.includes("thứ 7") || lower.includes("thứ bảy") || lower.includes("t7")) days.push("Thứ 7");
    if (lower.includes("chủ nhật") || lower.includes("cn")) days.push("Chủ Nhật");

    if (days.length === 0) days.push("Thứ 2");
    return { days, timeSlot };
  }

  if (Array.isArray(schedule) && schedule.length > 0) {
    const days = schedule.map((s: any) => s.day || "Thứ 2");
    const first = schedule[0];
    const timeSlot = first.start_time && first.end_time ? `${first.start_time} - ${first.end_time}` : "18:00 - 19:30";
    return { days, timeSlot };
  }

  return { days: ["Thứ 2"], timeSlot: "18:00 - 19:30" };
}

export function getVietnameseDayOfWeek(date: Date = new Date()): string {
  const dayIndex = date.getDay();
  switch (dayIndex) {
    case 0: return "Chủ Nhật";
    case 1: return "Thứ 2";
    case 2: return "Thứ 3";
    case 3: return "Thứ 4";
    case 4: return "Thứ 5";
    case 5: return "Thứ 6";
    case 6: return "Thứ 7";
    default: return "Thứ 2";
  }
}

export function formatDateToYMD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseYMDToDate(ymd: string): Date {
  const parts = ymd.split("-");
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date();
}

export function formatDateVietnameseFull(date: Date = new Date()): string {
  const dayName = getVietnameseDayOfWeek(date);
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${dayName}, ${d}/${m}/${y}`;
}

export interface WeekDayItem {
  dateStr: string; // "YYYY-MM-DD"
  dayName: string; // "Thứ 2"
  shortDate: string; // "27/10"
  isToday: boolean;
}

export function getWeekDaysForDate(targetDate: Date = new Date()): WeekDayItem[] {
  const current = new Date(targetDate.getTime());
  const dayOfWeek = current.getDay();
  
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current.setDate(current.getDate() + diffToMonday));

  const todayStr = formatDateToYMD(new Date());
  const days: WeekDayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateStr = formatDateToYMD(d);
    const dayName = getVietnameseDayOfWeek(d);
    const shortDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

    days.push({
      dateStr,
      dayName,
      shortDate,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}
