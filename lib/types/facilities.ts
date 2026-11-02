export type RoomStatus = "available" | "in_use" | "maintenance" | "cleaning";
export type DeviceHealth = "good" | "warning" | "broken";
export type RoomType = "standard" | "multimedia" | "lab" | "hall";

export type DeviceCategory =
  | "display"        // Máy chiếu, Màn chiếu, Tivi thông minh, Màn hình tương tác
  | "teaching"       // Bảng từ trắng, Bảng phấn, Bảng thông minh, Bút viết bảng, Bông lau bảng
  | "audio"          // Loa, Micro (không dây/có dây), Ampli
  | "climate_power"  // Máy lạnh/Điều hòa, Quạt, Hệ thống đèn chiếu sáng, Ổ cắm điện
  | "furniture"      // Bàn ghế học sinh, bàn giáo viên, bục giảng
  | "other";

export interface RoomDevice {
  name: string;
  type: string;
  category?: DeviceCategory;
  status: DeviceHealth;
  quantity?: number;
  note?: string;
}

export interface RoomFurniture {
  studentDesks: number;     // Bàn học sinh
  studentChairs: number;    // Ghế học sinh
  teacherDesk: boolean;     // Bàn giáo viên
  teacherChair: boolean;    // Ghế giáo viên
  podium: boolean;          // Bục giảng
}

export interface RoomItem {
  id: string;
  name: string;
  floor: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  furniture?: RoomFurniture;
  devices: RoomDevice[];
  note?: string;
  lastInspected?: string;
}

export type PrepTaskCategory =
  | "room_furniture"       // 1. Quản lý phòng & Bàn ghế nội thất
  | "hardware_tech"        // 2. Trang thiết bị dạy & học (Hiển thị, âm thanh, điện & điều hòa)
  | "teaching_supplies"    // 3. Dụng cụ giảng dạy (Bảng, bút viết, bông lau)
  | "curriculum_materials" // 4. Giáo trình & Vật dụng chuẩn bị buổi học (Đề thi in sẵn, sách, A4, bút màu)
  | "inspection_check";    // 5. Kiểm tra tình trạng đầu/cuối buổi & vệ sinh

export interface ClassPrepTask {
  id: string;
  label: string;
  category: PrepTaskCategory | "room" | "device" | "curriculum" | "supplies";
  checked: boolean;
  required?: boolean;
}

export interface ClassPrepItem {
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  roomName: string;
  timeSlot: string;
  dayOfWeek: string;
  dateStr?: string;
  studentCount: number;
  roomCapacity: number;
  curriculumName: string;
  curriculumCopiesRequired: number; // = studentCount + 1
  curriculumPrinted: boolean;
  tasks: ClassPrepTask[];
  status: "pending" | "in_progress" | "ready";
  prepNote?: string;
  preparedBy?: string;
  updatedAt?: string;
}

export type InventoryCategory = "curriculum" | "device" | "stationery" | "amenity";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  subject?: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "in_use";
  note?: string;
}

export type IncidentSeverity = "urgent" | "normal" | "low";
export type IncidentStatus = "pending" | "fixing" | "resolved";

export interface IncidentReport {
  id: string;
  roomName: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  note?: string;
}
