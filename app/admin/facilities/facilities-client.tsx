"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  CalendarDays,
  Building2,
  Users,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  BookOpen,
  Plus,
  Search,
  Filter,
  Monitor,
  Mic,
  Wind,
  Check,
  Clock,
  ShieldCheck,
  LayoutGrid,
  Calendar as CalendarIcon,
  Sparkles,
  PenTool,
  CheckSquare,
  Square,
  ArrowUpDown,
  ArrowRight,
  ExternalLink,
  Edit,
  GraduationCap,
  DoorOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppData, INITIAL_APP_CLASSES } from "@/lib/context/app-data-context";
import { ClassDialog } from "@/components/classes/class-dialog";
import {
  RoomItem,
  ClassPrepItem,
  ClassPrepTask,
  InventoryItem,
  IncidentReport,
  RoomStatus,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/types/facilities";
import {
  INITIAL_ROOMS,
  INITIAL_INVENTORY,
  INITIAL_INCIDENTS,
  generateDefaultTasks,
  parseScheduleDays,
  formatDateToYMD,
  parseYMDToDate,
  getWeekDaysForDate,
  WeekDayItem,
} from "@/lib/data/facilities-seed";

interface FacilitiesClientProps {
  initialClasses?: any[];
  initialTeachers?: any[];
}

// ─── Phân loại & Màu sắc môn học/sự kiện ──────────────────────────────────────
const EVENT_CATEGORIES = [
  { id: "lecture",  label: "Lớp học chính khóa", color: "#2563eb" }, // Blue
  { id: "exam",     label: "Lịch thi / Khảo sát", color: "#dc2626" }, // Red
  { id: "exercise", label: "Bài tập / Thực hành", color: "#d97706" }, // Amber
  { id: "meeting",  label: "Phụ đạo / Họp lớp", color: "#7c3aed" }, // Violet
  { id: "personal", label: "Lớp ngoại khóa",     color: "#059669" }, // Emerald
  { id: "other",    label: "Khác",               color: "#64748b" }, // Slate
];

// Giờ hiển thị: 07:00 → 21:00
const HOUR_SLOTS = Array.from({ length: 15 }, (_, i) => i + 7);
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 480;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 480;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function dayNumFromDateStr(dateStr: string): number {
  const parts = dateStr.split("-");
  return parseInt(parts[2] || "1", 10);
}

function formatWeekRange(weekDays: WeekDayItem[]): string {
  if (!weekDays || weekDays.length === 0) return "";
  const first = weekDays[0].shortDate;
  const last  = weekDays[weekDays.length - 1].shortDate;
  return `${first} - ${last}`;
}

// Hàm đếm sĩ số chuẩn xác đồng bộ với Quản lý lớp học
function getActualEnrolledCount(cls: any): number {
  if (!cls) return 0;
  if (typeof cls.enrollment_count === "number") return cls.enrollment_count;
  if (typeof cls.currentStudents === "number") return cls.currentStudents;
  if (typeof cls.currentEnrolled === "number") return cls.currentEnrolled;
  if (Array.isArray(cls.enrollments)) {
    if (cls.enrollments.length === 0) return 0;
    if (typeof cls.enrollments[0]?.count === "number") {
      return cls.enrollments[0].count;
    }
    return cls.enrollments.filter((e: any) => !e.status || e.status === "active").length;
  }
  return 0;
}

export function FacilitiesClient({ initialClasses = [], initialTeachers = [] }: FacilitiesClientProps) {
  // Đồng bộ hai chiều với AppDataContext
  const {
    classes: contextClasses,
    setClasses: setContextClasses,
    teachers: globalTeachers,
  } = useAppData();

  // Đảm bảo đồng bộ initialClasses từ Server/Supabase vào store chung
  useEffect(() => {
    if (initialClasses && initialClasses.length > 0 && setContextClasses) {
      setContextClasses(initialClasses);
    }
  }, [initialClasses, setContextClasses]);

  // Nguồn dữ liệu lớp học đồng bộ duy nhất
  const allClasses = useMemo(() => {
    if (contextClasses && contextClasses.length > 0) return contextClasses;
    if (initialClasses && initialClasses.length > 0) return initialClasses;
    return INITIAL_APP_CLASSES;
  }, [contextClasses, initialClasses]);

  const teacherList = useMemo(() => {
    if (initialTeachers && initialTeachers.length > 0) return initialTeachers;
    if (globalTeachers && globalTeachers.length > 0) return globalTeachers;
    return [];
  }, [initialTeachers, globalTeachers]);

  // ─── Modal ClassDialog để Tạo / Sửa lớp học đồng bộ với Quản lý lớp học ────
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);

  const handleOpenAddClass = () => {
    setEditingClass(null);
    setIsClassDialogOpen(true);
  };

  const handleOpenEditClass = (clsOrId: any) => {
    const target =
      typeof clsOrId === "string"
        ? allClasses.find((c: any) => c.id === clsOrId || c.name === clsOrId)
        : clsOrId;
    if (target) {
      setEditingClass(target);
      setIsClassDialogOpen(true);
    }
  };

  // ─── Top Main Navigation ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"calendar" | "inventory" | "incidents">("calendar");

  // Chế độ xem trong tab "Lịch học & Chuẩn bị lớp": Xem dạng Thẻ lớp học hoặc Lịch biểu tuần
  const [scheduleViewMode, setScheduleViewMode] = useState<"cards" | "calendar">("cards");

  // ─── State: Rooms ──────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<RoomItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_facilities_rooms");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_ROOMS;
  });

  const saveRooms = (newRooms: RoomItem[]) => {
    setRooms(newRooms);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_rooms", JSON.stringify(newRooms));
    }
  };

  // ─── State: Inventory ──────────────────────────────────────────────────────
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_facilities_inventory");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_INVENTORY;
  });

  const saveInventory = (newInv: InventoryItem[]) => {
    setInventory(newInv);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_inventory", JSON.stringify(newInv));
    }
  };

  // ─── State: Incidents ──────────────────────────────────────────────────────
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_facilities_incidents");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_INCIDENTS;
  });

  const saveIncidents = (newInc: IncidentReport[]) => {
    setIncidents(newInc);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_incidents", JSON.stringify(newInc));
    }
  };

  // ─── State: Class Prep Tasks (Lưu theo classEventId) ───────────────────────
  const [prepRecords, setPrepRecords] = useState<Record<string, ClassPrepItem>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_facilities_preps");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return {};
  });

  const savePrepRecords = (newRecords: Record<string, ClassPrepItem>) => {
    setPrepRecords(newRecords);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_preps", JSON.stringify(newRecords));
    }
  };

  // ─── Calendar Navigation state ─────────────────────────────────────────────
  const todayYMD = useMemo(() => formatDateToYMD(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayYMD);

  const currentDateObj  = useMemo(() => parseYMDToDate(selectedDate), [selectedDate]);
  const currentWeekDays = useMemo<WeekDayItem[]>(
    () => getWeekDaysForDate(currentDateObj),
    [currentDateObj]
  );

  function prevWeek() {
    const d = parseYMDToDate(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(formatDateToYMD(d));
  }
  function nextWeek() {
    const d = parseYMDToDate(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(formatDateToYMD(d));
  }
  function goToday() { setSelectedDate(todayYMD); }

  // ─── Filter & Search state cho danh sách lớp ──────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("all");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // ─── Build Cal Events từ danh sách lớp (Đồng bộ Quản lý lớp học) ────────────
  type CalEvent = {
    id: string;
    classId: string;
    className: string;
    subject: string;
    teacherName: string;
    roomName: string;
    dayName: string;
    dateStr: string;
    timeSlot: string;
    startMin: number;
    endMin: number;
    studentCount: number;
    roomCapacity: number;
    category: string;
    originalClass: any;
  };

  const events = useMemo<CalEvent[]>(() => {
    const list: CalEvent[] = [];

    allClasses.forEach((cls: any) => {
      const scheduleInfo = parseScheduleDays(cls.schedule);
      const { days, timeSlot } = scheduleInfo;

      const roomObj = rooms.find((r) => r.name === (cls.room || "P.101")) || rooms[0];
      const roomCapacity = roomObj ? roomObj.capacity : 25;

      currentWeekDays.forEach((wd) => {
        if (days.includes(wd.dayName)) {
          const parts    = timeSlot.split("-").map((s: string) => s.trim());
          const startMin = parseTimeToMinutes(parts[0]);
          const endMin   = parseTimeToMinutes(parts[1] || "");
          const duration = endMin > startMin ? endMin - startMin : 90;

          let category = "lecture";
          const subj = (cls.subject || "").toLowerCase();
          if (subj.includes("thi") || subj.includes("kiểm tra")) category = "exam";
          else if (subj.includes("bài tập") || subj.includes("thực hành")) category = "exercise";
          else if (subj.includes("họp")) category = "meeting";

          const studentCount = getActualEnrolledCount(cls);

          list.push({
            id: `${cls.id}_${wd.dateStr}`,
            classId: cls.id,
            className: cls.name || "Lớp học",
            subject: cls.subject || "Học phần",
            teacherName:
              cls.teacherName || cls.teacher?.full_name || "Giáo viên phụ trách",
            roomName: cls.room || "P.101",
            dayName: wd.dayName,
            dateStr: wd.dateStr,
            timeSlot,
            startMin,
            endMin: startMin + duration,
            studentCount,
            roomCapacity,
            category,
            originalClass: cls,
          });
        }
      });
    });

    return list;
  }, [allClasses, currentWeekDays, rooms]);

  const filteredEvents = events;

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    filteredEvents.forEach((ev) => {
      const idx = currentWeekDays.findIndex((w) => w.dateStr === ev.dateStr);
      if (idx >= 0) map[idx].push(ev);
    });
    return map;
  }, [filteredEvents, currentWeekDays]);

  // Tự động đồng bộ trạng thái phòng học dựa trên lịch lớp hôm nay và sự cố bảo trì
  const synchronizedRooms = useMemo(() => {
    return rooms.map((room) => {
      // 1. Kiểm tra sự cố bảo trì khẩn cấp
      const hasUrgentIncident = incidents.some(
        (inc) => inc.roomName === room.name && inc.status !== "resolved" && inc.severity === "urgent"
      );
      if (hasUrgentIncident) {
        return { ...room, status: "maintenance" as RoomStatus, currentOccupant: "Đang có sự cố kỹ thuật" };
      }

      // 2. Kiểm tra có lớp học hôm nay không
      const todayClasses = events.filter((ev) => ev.roomName === room.name && ev.dateStr === todayYMD);
      if (todayClasses.length > 0 && room.status !== "maintenance") {
        const nextClass = todayClasses[0];
        return {
          ...room,
          status: "in_use" as RoomStatus,
          currentOccupant: `${nextClass.className} (${nextClass.timeSlot})`,
        };
      }

      return { ...room, currentOccupant: undefined };
    });
  }, [rooms, incidents, events, todayYMD]);

  // Danh sách các ca học được lọc theo Search, Day, Room, Status cho chế độ Danh Sách Lớp
  const filteredClassCards = useMemo(() => {
    return filteredEvents.filter((ev) => {
      // 1. Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = ev.className.toLowerCase().includes(q);
        const matchSubj = ev.subject.toLowerCase().includes(q);
        const matchTeacher = ev.teacherName.toLowerCase().includes(q);
        const matchRoom = ev.roomName.toLowerCase().includes(q);
        if (!matchName && !matchSubj && !matchTeacher && !matchRoom) return false;
      }

      // 2. Day filter
      if (selectedDayFilter !== "all") {
        if (selectedDayFilter === "today") {
          if (ev.dateStr !== todayYMD) return false;
        } else if (ev.dayName !== selectedDayFilter) {
          return false;
        }
      }

      // 3. Room filter
      if (selectedRoomFilter !== "all" && ev.roomName !== selectedRoomFilter) {
        return false;
      }

      // 4. Status filter
      if (selectedStatusFilter !== "all") {
        const prep = prepRecords[ev.id];
        const status = prep ? prep.status : "pending";
        if (status !== selectedStatusFilter) return false;
      }

      return true;
    });
  }, [filteredEvents, searchTerm, selectedDayFilter, selectedRoomFilter, selectedStatusFilter, prepRecords, todayYMD]);

  // ─── Modal: Chuẩn bị CSVC & Lớp học khi click vào sự kiện ───────────────────
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  // Lấy hoặc khởi tạo ClassPrepItem cho event được chọn
  const currentPrepItem = useMemo<ClassPrepItem | null>(() => {
    if (!selectedEvent) return null;
    if (prepRecords[selectedEvent.id]) {
      return prepRecords[selectedEvent.id];
    }
    // Khởi tạo mới từ default tasks
    const tasks = generateDefaultTasks(
      selectedEvent.subject,
      selectedEvent.studentCount,
      selectedEvent.studentCount + 1,
      selectedEvent.roomName
    );
    const checkedCount = tasks.filter((t) => t.checked).length;
    const initialStatus =
      checkedCount === tasks.length
        ? "ready"
        : checkedCount > 0
        ? "in_progress"
        : "pending";

    return {
      classId: selectedEvent.classId,
      className: selectedEvent.className,
      subject: selectedEvent.subject,
      teacherName: selectedEvent.teacherName,
      roomName: selectedEvent.roomName,
      timeSlot: selectedEvent.timeSlot,
      dayOfWeek: selectedEvent.dayName,
      dateStr: selectedEvent.dateStr,
      studentCount: selectedEvent.studentCount,
      roomCapacity: selectedEvent.roomCapacity,
      curriculumName: `Giáo trình & Đề cương ${selectedEvent.subject}`,
      curriculumCopiesRequired: selectedEvent.studentCount + 1,
      curriculumPrinted: true,
      tasks,
      status: initialStatus,
      preparedBy: "Trợ giảng trực ca",
    };
  }, [selectedEvent, prepRecords]);

  // Toggle 1 task trong modal chuẩn bị CSVC
  const toggleTask = (taskId: string) => {
    if (!selectedEvent || !currentPrepItem) return;
    const updatedTasks = currentPrepItem.tasks.map((t) =>
      t.id === taskId ? { ...t, checked: !t.checked } : t
    );
    const allChecked = updatedTasks.every((t) => t.checked);
    const someChecked = updatedTasks.some((t) => t.checked);
    const newStatus: "pending" | "in_progress" | "ready" = allChecked
      ? "ready"
      : someChecked
      ? "in_progress"
      : "pending";

    const updatedItem: ClassPrepItem = {
      ...currentPrepItem,
      tasks: updatedTasks,
      status: newStatus,
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    savePrepRecords({
      ...prepRecords,
      [selectedEvent.id]: updatedItem,
    });
  };

  // Đánh dấu hoàn tất toàn bộ checklist
  const markAllTasks = (checked: boolean) => {
    if (!selectedEvent || !currentPrepItem) return;
    const updatedTasks = currentPrepItem.tasks.map((t) => ({ ...t, checked }));
    const updatedItem: ClassPrepItem = {
      ...currentPrepItem,
      tasks: updatedTasks,
      status: checked ? "ready" : "pending",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    savePrepRecords({
      ...prepRecords,
      [selectedEvent.id]: updatedItem,
    });
  };

  // ─── Đổi phòng học cho lớp trực tiếp từ Cơ sở vật chất ──────────────────────
  const handleQuickChangeRoom = (classId: string, newRoom: string) => {
    if (!setContextClasses) return;
    setContextClasses((prev) =>
      prev.map((c) => (c.id === classId || c.name === classId ? { ...c, room: newRoom } : c))
    );
    if (selectedEvent) {
      const roomObj = rooms.find((r) => r.name === newRoom);
      setSelectedEvent({
        ...selectedEvent,
        roomName: newRoom,
        roomCapacity: roomObj ? roomObj.capacity : selectedEvent.roomCapacity,
      });
    }
  };

  // ─── Modal Báo hỏng thiết bị ────────────────────────────────────────────────
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportRoomName, setReportRoomName] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSeverity, setReportSeverity] = useState<IncidentSeverity>("normal");
  const [reportBy, setReportBy] = useState("Trợ giảng / Ban quản lý");

  const openReportModal = (roomName?: string) => {
    setReportRoomName(roomName || selectedEvent?.roomName || "P.101");
    setReportTitle("");
    setReportDescription("");
    setReportSeverity("normal");
    setReportModalOpen(true);
  };

  const handleCreateIncident = () => {
    if (!reportTitle.trim()) return;
    const newIncident: IncidentReport = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      roomName: reportRoomName,
      title: reportTitle.trim(),
      description: reportDescription.trim() || "Cần kỹ thuật kiểm tra và xử lý gấp.",
      severity: reportSeverity,
      status: "pending",
      reportedBy: reportBy,
      reportedAt: new Date().toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    saveIncidents([newIncident, ...incidents]);

    if (reportSeverity === "urgent") {
      const updatedRooms = rooms.map((r) =>
        r.name === reportRoomName ? { ...r, status: "maintenance" as RoomStatus } : r
      );
      saveRooms(updatedRooms);
    }

    setReportModalOpen(false);
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: IncidentStatus) => {
    const updated = incidents.map((inc) => {
      if (inc.id === id) {
        return {
          ...inc,
          status: newStatus,
          resolvedAt:
            newStatus === "resolved"
              ? new Date().toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : inc.resolvedAt,
          resolutionNote:
            newStatus === "resolved"
              ? "Đã kiểm tra kỹ thuật và khắc phục hoàn tất."
              : inc.resolutionNote,
        };
      }
      return inc;
    });
    saveIncidents(updated);
  };

  // ─── Modal Thêm phòng mới ───────────────────────────────────────────────────
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState("Tầng 2");
  const [newRoomCapacity, setNewRoomCapacity] = useState(25);
  const [newRoomType, setNewRoomType] = useState<"standard" | "multimedia" | "lab">("standard");

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: RoomItem = {
      id: `room-${Date.now().toString().slice(-4)}`,
      name: newRoomName.trim(),
      floor: newRoomFloor,
      type: newRoomType,
      capacity: newRoomCapacity,
      status: "available",
      furniture: {
        studentDesks: Math.ceil(newRoomCapacity / 2),
        studentChairs: newRoomCapacity,
        teacherDesk: true,
        teacherChair: true,
        podium: true,
      },
      devices: [
        { name: "Smart TV 4K / Máy chiếu Full HD", type: "screen", category: "display", status: "good" },
        { name: "Loa trợ giảng & Micro không dây", type: "audio", category: "audio", status: "good" },
        { name: "Bảng từ ceramic chống lóa 3.2m", type: "board", category: "teaching", status: "good" },
        { name: "Điều hòa Inverter 2HP", type: "ac", category: "climate_power", status: "good" },
        { name: "Hệ thống đèn LED chiếu sáng 500 Lux & Ổ cắm điện", type: "lighting", category: "climate_power", status: "good" },
      ],
      lastInspected: formatDateToYMD(new Date()),
      note: "Phòng học mới bổ sung",
    };
    saveRooms([...rooms, newRoom]);
    setAddRoomModalOpen(false);
    setNewRoomName("");
  };

  const handleToggleRoomStatus = (roomId: string) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        const nextStatus: RoomStatus =
          r.status === "available"
            ? "in_use"
            : r.status === "in_use"
            ? "maintenance"
            : "available";
        return { ...r, status: nextStatus };
      }
      return r;
    });
    saveRooms(updated);
  };

  // ─── Modal Cập nhật tồn kho vật tư ──────────────────────────────────────────
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [addQty, setAddQty] = useState(10);

  const handleAddStock = () => {
    if (!selectedInventoryItem) return;
    const updated = inventory.map((item) => {
      if (item.id === selectedInventoryItem.id) {
        const newQty = item.quantity + addQty;
        const newStatus =
          newQty <= 0
            ? "out_of_stock"
            : newQty <= item.minThreshold
            ? "low_stock"
            : "in_stock";
        return { ...item, quantity: newQty, status: newStatus as any };
      }
      return item;
    });
    saveInventory(updated);
    setStockModalOpen(false);
  };

  // ─── Layout constants ───────────────────────────────────────────────────────
  const SLOT_HEIGHT = 64; // px per hour
  const FIRST_HOUR  = HOUR_SLOTS[0]; // 7
  const weekRange = formatWeekRange(currentWeekDays);

  const totalRoomsAvailable = synchronizedRooms.filter((r) => r.status === "available").length;
  const totalRoomsInUse = synchronizedRooms.filter((r) => r.status === "in_use").length;
  const totalRoomsMaintenance = synchronizedRooms.filter((r) => r.status === "maintenance").length;
  const pendingIncidentsCount = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="space-y-4">
      {/* ════════════════════════════════════════════════════════════════
          TOP NAVIGATION TABS
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "calendar"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Lịch học & Chuẩn bị lớp
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-foreground/20 text-primary-foreground font-black">
              {filteredEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "inventory"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            2. Giáo trình & Vật tư
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-bold">
              {inventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("incidents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "incidents"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Wrench className="w-4 h-4" />
            3. Sổ Báo hỏng & Bảo trì
            {pendingIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-black animate-pulse">
                {pendingIncidentsCount}
              </span>
            )}
          </button>
        </div>

        {/* Nút hành động nhanh: Tạo lớp mới (Đồng bộ Quản lý lớp) & Báo hỏng */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenAddClass}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + Thêm lớp học mới
          </Button>

          <Link href="/admin/classes">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/5"
            >
              Quản lý Lớp học
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={() => openReportModal()}
            className="h-9 px-3 text-xs font-bold gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <AlertTriangle className="w-4 h-4" />
            Báo sự cố thiết bị
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB 1: LỊCH HỌC & CHUẨN BỊ LỚP (TÍCH HỢP QUẢN LÝ LỚP HỌC)
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          {/* Controls Bar: Switch View & Quick Filters */}
          <div className="bg-card rounded-2xl border border-border p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Toggle: Danh sách lớp vs Lịch biểu tuần */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Hiển thị:</span>
              <div className="flex items-center bg-muted/80 rounded-xl p-0.5 border border-border/60">
                <button
                  onClick={() => setScheduleViewMode("cards")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scheduleViewMode === "cards"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                  Danh sách Lớp học ({filteredClassCards.length})
                </button>
                <button
                  onClick={() => setScheduleViewMode("calendar")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scheduleViewMode === "calendar"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                  Lịch biểu tuần ({filteredEvents.length})
                </button>
              </div>
            </div>

            {/* Bộ lọc nhanh ngày & phòng */}
            <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
              {/* Lọc theo ngày */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">Thứ:</span>
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-xs font-semibold"
                >
                  <option value="all">Tất cả các ngày</option>
                  <option value="today">Hôm nay (Thứ 3)</option>
                  <option value="Thứ 2">Thứ 2</option>
                  <option value="Thứ 3">Thứ 3</option>
                  <option value="Thứ 4">Thứ 4</option>
                  <option value="Thứ 5">Thứ 5</option>
                  <option value="Thứ 6">Thứ 6</option>
                  <option value="Thứ 7">Thứ 7</option>
                  <option value="Chủ Nhật">Chủ Nhật</option>
                </select>
              </div>

              {/* Lọc theo phòng */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">Phòng:</span>
                <select
                  value={selectedRoomFilter}
                  onChange={(e) => setSelectedRoomFilter(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-xs font-semibold"
                >
                  <option value="all">Tất cả phòng</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.floor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc theo trạng thái CSVC */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">CSVC:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-xs font-semibold"
                >
                  <option value="all">Mọi trạng thái</option>
                  <option value="ready">🟢 Đã sẵn sàng</option>
                  <option value="in_progress">🟡 Đang chuẩn bị</option>
                  <option value="pending">⚪ Chờ chuẩn bị</option>
                </select>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm lớp, GV, phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CHẾ ĐỘ 1: DANH SÁCH LỚP HỌC (CLASS CARDS VIEW) - ĐỒNG BỘ
          ════════════════════════════════════════════════════════════ */}
          {scheduleViewMode === "cards" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Đang đồng bộ <strong>{allClasses.length}</strong> lớp học từ Quản lý Lớp học.{" "}
                  <span className="text-primary font-bold">Nhấp vào thẻ để tích chọn Cơ sở vật chất.</span>
                </span>
                <span className="font-semibold text-foreground">
                  Tuần hiện tại: {weekRange}
                </span>
              </div>

              {filteredClassCards.length === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Không tìm thấy ca học phù hợp</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Vui lòng thử điều chỉnh lại bộ lọc theo thứ trong tuần, phòng học hoặc thêm lớp học mới.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleOpenAddClass}
                    className="h-8 text-xs font-semibold bg-primary text-primary-foreground"
                  >
                    + Thêm lớp học mới ngay
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClassCards.map((ev) => {
                    const cat = EVENT_CATEGORIES.find((c) => c.id === ev.category) || EVENT_CATEGORIES[0];
                    const prep = prepRecords[ev.id];
                    const totalTasks = prep ? prep.tasks.length : 14;
                    const checkedTasks = prep ? prep.tasks.filter((t) => t.checked).length : 8;
                    const percent = Math.round((checkedTasks / totalTasks) * 100);
                    const prepStatus = prep ? prep.status : percent === 100 ? "ready" : "in_progress";
                    const isOverCapacity = ev.studentCount > ev.roomCapacity;

                    return (
                      <div
                        key={ev.id}
                        className="bg-card rounded-2xl border border-border p-4.5 shadow-xs hover:shadow-md hover:border-primary/60 transition-all flex flex-col justify-between group space-y-3"
                      >
                        {/* Header card lớp */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0" onClick={() => setSelectedEvent(ev)}>
                              <div className="flex items-center gap-1.5 flex-wrap cursor-pointer">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                                  {ev.className}
                                </h3>
                              </div>
                              <p className="text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                                Môn: {ev.subject} · GV: {ev.teacherName}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  prepStatus === "ready"
                                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-300"
                                    : "bg-amber-500/15 text-amber-600 border-amber-300"
                                }`}
                              >
                                {prepStatus === "ready" ? "✓ Đã sẵn sàng" : "Đang chuẩn bị"}
                              </span>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditClass(ev.originalClass);
                                }}
                                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                                title="Sửa thông tin lớp học (đồng bộ Quản lý lớp)"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Thời gian & Phòng học */}
                          <div
                            onClick={() => setSelectedEvent(ev)}
                            className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/50 cursor-pointer"
                          >
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                                Lịch học:
                              </span>
                              <span className="font-bold text-foreground">
                                {ev.dayName} ({ev.timeSlot})
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                                Phòng học:
                              </span>
                              <span className="font-bold text-primary flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {ev.roomName}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                                Sĩ số học viên:
                              </span>
                              <span className="font-bold text-foreground">
                                {ev.studentCount} học viên
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                                Sức chứa phòng:
                              </span>
                              <span
                                className={`font-bold ${
                                  isOverCapacity ? "text-red-600" : "text-foreground"
                                }`}
                              >
                                {ev.roomCapacity} chỗ {isOverCapacity && "(Quá tải!)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Thanh tiến độ CSVC */}
                        <div
                          onClick={() => setSelectedEvent(ev)}
                          className="space-y-1.5 pt-1 border-t border-border/50 cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Tiến độ CSVC: {checkedTasks}/{totalTasks} mục
                            </span>
                            <span className="font-bold font-mono text-foreground">{percent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            Ngày: {ev.dateStr}
                          </span>
                          <button
                            onClick={() => setSelectedEvent(ev)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                          >
                            Tích chọn CSVC ➔
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              CHẾ ĐỘ 2: LỊCH BIỂU THEO TUẦN (TIMETABLE CALENDAR GRID)
          ════════════════════════════════════════════════════════════ */}
          {scheduleViewMode === "calendar" && (
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-270px)] min-h-[620px]">
              {/* Calendar view */}
              <div className="flex-1 flex flex-col min-w-0 bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
                {/* Toolbar tuần */}
                <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-border bg-card/90 shrink-0 gap-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToday} className="h-8 px-3 text-xs font-semibold">
                      Hôm nay
                    </Button>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevWeek}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextWeek}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm font-bold text-foreground select-none">
                      Tuần: {weekRange}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground mr-1">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Đã chuẩn bị xong
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Đang chuẩn bị
                      </span>
                    </div>
                    <div className="text-xs bg-muted px-2.5 py-1 rounded-md text-muted-foreground font-medium">
                      Nhấp vào ca học để <strong className="text-foreground">Tích chọn CSVC</strong>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-auto">
                  {/* Day headers */}
                  <div className="sticky top-0 z-20 flex bg-card border-b border-border shadow-xs">
                    <div className="w-14 shrink-0" />
                    {currentWeekDays.map((wd, i) => (
                      <div
                        key={wd.dateStr}
                        className="flex-1 text-center py-2 border-l border-border/60 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setSelectedDate(wd.dateStr)}
                      >
                        <div className={`text-[11px] font-semibold ${wd.isToday ? "text-primary" : "text-muted-foreground"}`}>
                          {DAY_LABELS[i]}
                        </div>
                        <div
                          className={`text-sm font-black w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all ${
                            wd.isToday
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {dayNumFromDateStr(wd.dateStr)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time grid */}
                  <div className="relative flex min-w-[700px]">
                    {/* Hour labels */}
                    <div className="w-14 shrink-0 select-none bg-muted/5">
                      {HOUR_SLOTS.map((h) => (
                        <div key={h} className="relative" style={{ height: SLOT_HEIGHT }}>
                          <span className="absolute -top-2.5 left-2 text-[10px] text-muted-foreground font-semibold">
                            {String(h).padStart(2, "0")}:00
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {currentWeekDays.map((wd, dayIdx) => {
                      const dayEvents = eventsByDay[dayIdx] || [];
                      return (
                        <div
                          key={wd.dateStr}
                          className={`flex-1 relative border-l border-border/50 ${
                            wd.isToday ? "bg-primary/[0.02]" : ""
                          }`}
                        >
                          {/* Hour lines */}
                          {HOUR_SLOTS.map((h) => (
                            <div
                              key={h}
                              className="border-t border-border/40"
                              style={{ height: SLOT_HEIGHT }}
                            />
                          ))}

                          {/* Events */}
                          {dayEvents.map((ev) => {
                            const cat = EVENT_CATEGORIES.find((c) => c.id === ev.category) || EVENT_CATEGORIES[0];
                            const topPx = (ev.startMin - FIRST_HOUR * 60) * (SLOT_HEIGHT / 60);
                            const heightPx = Math.max((ev.endMin - ev.startMin) * (SLOT_HEIGHT / 60), 40);

                            const prepItem = prepRecords[ev.id];
                            const prepStatus = prepItem ? prepItem.status : "in_progress";
                            const checkedCount = prepItem
                              ? prepItem.tasks.filter((t) => t.checked).length
                              : 8;
                            const totalCount = prepItem ? prepItem.tasks.length : 14;

                            return (
                              <div
                                key={ev.id}
                                onClick={() => setSelectedEvent(ev)}
                                className="absolute left-1 right-1 rounded-xl p-2 cursor-pointer overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md z-10 border border-white/20 text-white flex flex-col justify-between"
                                style={{
                                  top: topPx,
                                  height: Math.max(heightPx, 52),
                                  backgroundColor: cat.color,
                                }}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-[11px] font-bold leading-tight truncate">
                                      {ev.subject || ev.className}
                                    </p>
                                    <span className="text-[9px] bg-black/25 px-1.5 py-0.2 rounded font-mono font-medium">
                                      {ev.timeSlot}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-white/90">
                                    <span className="font-semibold bg-white/20 px-1 rounded flex items-center gap-0.5">
                                      <Building2 className="w-2.5 h-2.5" />
                                      {ev.roomName}
                                    </span>
                                    <span>· {ev.studentCount} HS</span>
                                  </div>
                                </div>

                                {/* Badge trạng thái chuẩn bị CSVC */}
                                <div className="mt-1 flex items-center justify-between text-[9px] bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                                  <span className="flex items-center gap-1 font-semibold truncate">
                                    {prepStatus === "ready" ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                                        <span>CSVC Sẵn sàng</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                                        <span>Chuẩn bị ({checkedCount}/{totalCount})</span>
                                      </>
                                    )}
                                  </span>
                                  <span className="text-white/70 underline hover:text-white">Tích CSVC</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Room quick monitor */}
              <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
                {/* Tình trạng các phòng học hôm nay (Đồng bộ theo lịch lớp) */}
                <div className="bg-card rounded-2xl border border-border p-3.5 shadow-xs space-y-2.5 flex-1">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold text-foreground">
                      Trạng thái phòng ({synchronizedRooms.length})
                    </span>
                    <span className="text-[10px] text-muted-foreground">Tự động đồng bộ</span>
                  </div>
                  <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                    {synchronizedRooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => handleToggleRoomStatus(room.id)}
                        className="flex flex-col p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">{room.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {room.floor} · {room.capacity} chỗ
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              room.status === "available"
                                ? "bg-emerald-500/15 text-emerald-600"
                                : room.status === "in_use"
                                ? "bg-blue-500/15 text-blue-600"
                                : "bg-amber-500/15 text-amber-600"
                            }`}
                          >
                            {room.status === "available"
                              ? "Trống"
                              : room.status === "in_use"
                              ? "Đang có lớp"
                              : "Bảo trì"}
                          </span>
                        </div>
                        {room.currentOccupant && (
                          <p className="text-[10px] text-blue-600 font-semibold truncate pt-0.5 border-t border-border/40">
                            ● {room.currentOccupant}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 2: GIÁO TRÌNH & VẬT TƯ (MATERIALS & INVENTORY)
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "inventory" && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                2. Giáo trình, Đề thi & Vật tư chuẩn bị buổi học
              </h3>
              <p className="text-xs text-muted-foreground">
                Kiểm soát số lượng tồn kho theo đúng lịch học và số lượng học viên
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Tổng cộng: <strong className="text-foreground">{inventory.length}</strong> hạng mục
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Tên tài liệu / Vật tư</th>
                  <th className="py-2.5 px-3">Phân loại</th>
                  <th className="py-2.5 px-3">Số lượng tồn</th>
                  <th className="py-2.5 px-3">Định mức tối thiểu</th>
                  <th className="py-2.5 px-3">Vị trí lưu trữ</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-foreground">{item.name}</p>
                      {item.note && (
                        <p className="text-[10px] text-amber-600 font-medium">{item.note}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {item.category === "curriculum"
                          ? "Giáo trình/Đề thi"
                          : item.category === "device"
                          ? "Thiết bị di động"
                          : item.category === "stationery"
                          ? "Văn phòng phẩm"
                          : "Phục vụ"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-sm font-bold text-foreground">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{item.location}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : item.status === "low_stock"
                            ? "bg-amber-500/15 text-amber-600 font-black animate-pulse"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {item.status === "in_stock"
                          ? "Còn đủ"
                          : item.status === "low_stock"
                          ? "Sắp hết - Cần in thêm"
                          : "Hết hàng"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInventoryItem(item);
                          setStockModalOpen(true);
                        }}
                        className="h-7 px-2.5 text-xs font-semibold"
                      >
                        + Nhập thêm
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 3: SỔ BÁO HỎNG & BẢO TRÌ (INCIDENT LOG)
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "incidents" && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                3. Sổ Ghi nhận Sự cố Thiết bị & Lịch bảo trì
              </h3>
              <p className="text-xs text-muted-foreground">
                Tiếp nhận báo hỏng hóc từ giáo viên / trợ giảng và cập nhật tiến độ xử lý
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openReportModal()}
              className="h-8 px-3 text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              + Ghi nhận sự cố mới
            </Button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs bg-foreground text-background px-2 py-0.5 rounded">
                      {inc.roomName}
                    </span>
                    <h4 className="text-sm font-bold text-foreground">{inc.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inc.severity === "urgent"
                          ? "bg-red-500 text-white font-black"
                          : inc.severity === "normal"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-slate-500/15 text-slate-600"
                      }`}
                    >
                      {inc.severity === "urgent"
                        ? "Khẩn cấp"
                        : inc.severity === "normal"
                        ? "Bình thường"
                        : "Thấp"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inc.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Báo bởi: <strong className="text-foreground">{inc.reportedBy}</strong> · Lúc: {inc.reportedAt}
                  </p>
                  {inc.resolutionNote && (
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {inc.resolutionNote} ({inc.resolvedAt})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {inc.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateIncidentStatus(inc.id, "fixing")}
                      className="h-8 px-3 text-xs font-semibold text-blue-600 border-blue-200"
                    >
                      Bắt đầu sửa
                    </Button>
                  ) : inc.status === "fixing" ? (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateIncidentStatus(inc.id, "resolved")}
                      className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Đã khắc phục xong
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 text-xs">
                      ✓ Đã giải quyết
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: TÍCH CHỌN CƠ SỞ VẬT CHẤT & CHUẨN BỊ BUỔI HỌC (ĐỒNG BỘ)
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
          {selectedEvent && currentPrepItem && (() => {
            const checkedCount = currentPrepItem.tasks.filter((t) => t.checked).length;
            const totalCount = currentPrepItem.tasks.length;
            const percent = Math.round((checkedCount / totalCount) * 100);

            const groupedTasks = {
              room_furniture: currentPrepItem.tasks.filter(
                (t) => t.category === "room_furniture" || t.category === "room"
              ),
              hardware_tech: currentPrepItem.tasks.filter(
                (t) => t.category === "hardware_tech" || t.category === "device"
              ),
              teaching_supplies: currentPrepItem.tasks.filter(
                (t) => t.category === "teaching_supplies" || t.category === "supplies"
              ),
              curriculum_materials: currentPrepItem.tasks.filter(
                (t) => t.category === "curriculum_materials" || t.category === "curriculum"
              ),
              inspection_check: currentPrepItem.tasks.filter(
                (t) => t.category === "inspection_check"
              ),
            };

            const isOverCapacity = selectedEvent.studentCount > selectedEvent.roomCapacity;

            return (
              <>
                {/* Header modal */}
                <div className="px-6 py-4 border-b border-border bg-card flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Dropdown đổi nhanh phòng học đồng bộ sang Quản lý lớp học */}
                      <select
                        value={selectedEvent.roomName}
                        onChange={(e) => handleQuickChangeRoom(selectedEvent.classId, e.target.value)}
                        className="px-2.5 py-0.5 rounded-md text-xs font-black bg-primary text-primary-foreground border-none focus:outline-none cursor-pointer"
                        title="Đổi phòng học cho lớp này"
                      >
                        {rooms.map((r) => (
                          <option key={r.id} value={r.name} className="bg-background text-foreground">
                            {r.name} ({r.floor})
                          </option>
                        ))}
                      </select>

                      <h2 className="text-base font-black text-foreground">
                        {selectedEvent.className}
                      </h2>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          currentPrepItem.status === "ready"
                            ? "bg-emerald-500/15 text-emerald-600 border border-emerald-300"
                            : "bg-amber-500/15 text-amber-600 border border-amber-300"
                        }`}
                      >
                        {currentPrepItem.status === "ready"
                          ? "✓ Đã sẵn sàng phục vụ lớp"
                          : `Đang chuẩn bị (${percent}%)`}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                      <span>Môn: <strong className="text-foreground">{selectedEvent.subject}</strong></span>
                      <span>·</span>
                      <span>GV: <strong className="text-foreground">{selectedEvent.teacherName}</strong></span>
                      <span>·</span>
                      <span>{selectedEvent.dayName} ({selectedEvent.timeSlot})</span>
                      <span>·</span>
                      <span className={isOverCapacity ? "text-red-600 font-bold" : "text-muted-foreground"}>
                        {selectedEvent.studentCount} HS / {selectedEvent.roomCapacity} chỗ {isOverCapacity && "(Quá tải!)"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEditClass(selectedEvent.originalClass)}
                      className="h-8 px-2 text-xs font-semibold text-primary"
                      title="Sửa thông tin lớp trong Quản lý lớp học"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Sửa lớp
                    </Button>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Thanh tiến độ chuẩn bị */}
                <div className="px-6 py-2.5 bg-muted/40 border-b border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">
                      Tiến độ CSVC: {checkedCount}/{totalCount} mục ({percent}%)
                    </span>
                    <div className="w-32 h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAllTasks(true)}
                      className="text-primary hover:underline font-bold text-xs"
                    >
                      Tích chọn tất cả
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => markAllTasks(false)}
                      className="text-muted-foreground hover:underline text-xs"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {/* Body checklist cuộn được */}
                <div className="px-6 py-4 overflow-y-auto space-y-4 flex-1">
                  {/* Nhóm 1: Bàn ghế & Nội thất */}
                  {groupedTasks.room_furniture.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        1. Bàn ghế & Nội thất ({selectedEvent.studentCount} học viên / {selectedEvent.roomCapacity} chỗ)
                      </h4>
                      <div className="space-y-1.5">
                        {groupedTasks.room_furniture.map((task) => (
                          <ChecklistRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhóm 2: Trang thiết bị dạy & học */}
                  {groupedTasks.hardware_tech.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-blue-500" />
                        2. Trang thiết bị công nghệ (Máy chiếu/TV, Âm thanh, Điều hòa)
                      </h4>
                      <div className="space-y-1.5">
                        {groupedTasks.hardware_tech.map((task) => (
                          <ChecklistRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhóm 3: Dụng cụ giảng dạy & Bảng */}
                  {groupedTasks.teaching_supplies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-amber-500" />
                        3. Bảng viết, Bút dạ & Bông lau bảng
                      </h4>
                      <div className="space-y-1.5">
                        {groupedTasks.teaching_supplies.map((task) => (
                          <ChecklistRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhóm 4: Giáo trình & Tài liệu in sẵn */}
                  {groupedTasks.curriculum_materials.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        4. Giáo trình & Tài liệu chuẩn bị buổi học
                      </h4>
                      <div className="space-y-1.5">
                        {groupedTasks.curriculum_materials.map((task) => (
                          <ChecklistRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhóm 5: Kiểm tra & Nghiệm thu */}
                  {groupedTasks.inspection_check.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        5. Kiểm tra Tình trạng & Nghiệm thu đầu/cuối buổi
                      </h4>
                      <div className="space-y-1.5">
                        {groupedTasks.inspection_check.map((task) => (
                          <ChecklistRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-3 border-t border-border bg-card flex items-center justify-between gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReportModal(selectedEvent.roomName)}
                    className="h-9 px-3 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Báo sự cố phòng {selectedEvent.roomName}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEvent(null)}
                      className="h-9 px-4 text-xs font-semibold"
                    >
                      Đóng
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedEvent(null)}
                      className="h-9 px-5 text-xs font-bold bg-primary text-primary-foreground"
                    >
                      Xác nhận đã chuẩn bị
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: CLASS DIALOG (TẠO MỚI / SỬA LỚP HỌC ĐỒNG BỘ 2 CHIỀU)
      ════════════════════════════════════════════════════════════════ */}
      <ClassDialog
        isOpen={isClassDialogOpen}
        onClose={() => {
          setIsClassDialogOpen(false);
          setEditingClass(null);
        }}
        teachers={teacherList}
        existingClasses={allClasses}
        editingClass={editingClass}
        onSaved={() => {
          setIsClassDialogOpen(false);
          setEditingClass(null);
        }}
      />

      {/* ════════════════════════════════════════════════════════════════
          MODAL: BÁO SỰ CỐ / HỎNG HÓC THIẾT BỊ (Mục 5)
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-red-600 font-black text-sm">
              <AlertTriangle className="w-4 h-4" />
              Ghi nhận Sự cố Thiết bị Phòng học
            </div>
            <button
              onClick={() => setReportModalOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">Phòng học gặp sự cố:</label>
              <select
                value={reportRoomName}
                onChange={(e) => setReportRoomName(e.target.value)}
                className="w-full h-9 rounded-lg border border-border px-3 bg-background text-xs font-semibold"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.floor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Tên thiết bị / Sự cố hỏng hóc:
              </label>
              <Input
                placeholder="Ví dụ: Điều hòa làm mát yếu, Máy chiếu không lên hình, Micro rè..."
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Mức độ khẩn cấp:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["urgent", "normal", "low"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setReportSeverity(sev)}
                    className={`py-1.5 px-2 rounded-lg border font-bold text-center transition-all ${
                      reportSeverity === sev
                        ? sev === "urgent"
                          ? "bg-red-500 text-white border-red-500"
                          : sev === "normal"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-slate-700 text-white border-slate-700"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {sev === "urgent" ? "Khẩn cấp" : sev === "normal" ? "Bình thường" : "Thấp"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Mô tả chi tiết hiện tượng:</label>
              <Textarea
                placeholder="Mô tả cụ thể hiện tượng để đội kỹ thuật/bảo trì chuẩn bị linh kiện xử lý kịp thời..."
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Người báo cáo:</label>
              <Input
                value={reportBy}
                onChange={(e) => setReportBy(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReportModalOpen(false)}
              className="h-9 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateIncident}
              disabled={!reportTitle.trim()}
              className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              Gửi yêu cầu bảo trì
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: THÊM PHÒNG HỌC MỚI (Mục 1)
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={addRoomModalOpen} onOpenChange={setAddRoomModalOpen}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 font-black text-sm text-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              Thêm Phòng học mới
            </div>
            <button
              onClick={() => setAddRoomModalOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">Mã / Tên phòng:</label>
              <Input
                placeholder="Ví dụ: P.203, P.305..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">Vị trí tầng:</label>
                <select
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border px-3 bg-background text-xs font-semibold"
                >
                  <option value="Tầng 1">Tầng 1</option>
                  <option value="Tầng 2">Tầng 2</option>
                  <option value="Tầng 3">Tầng 3</option>
                  <option value="Tầng 4">Tầng 4</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Sức chứa (chỗ):</label>
                <Input
                  type="number"
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(parseInt(e.target.value) || 20)}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Loại phòng:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["standard", "multimedia", "lab"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewRoomType(t)}
                    className={`py-1.5 px-2 rounded-lg border font-bold text-center transition-all ${
                      newRoomType === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t === "standard" ? "Tiêu chuẩn" : t === "multimedia" ? "Đa PT" : "Lab & STEM"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddRoomModalOpen(false)}
              className="h-9 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim()}
              className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground"
            >
              Thêm phòng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: NHẬP THÊM VẬT TƯ / GIÁO TRÌNH (Mục 4)
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent className="sm:max-w-sm p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 font-black text-sm text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              Nhập thêm số lượng vật tư
            </div>
            <button
              onClick={() => setStockModalOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedInventoryItem && (
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-foreground text-sm">{selectedInventoryItem.name}</p>
                <p className="text-muted-foreground mt-0.5">
                  Tồn kho hiện tại:{" "}
                  <strong className="text-foreground font-mono">
                    {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                  </strong>
                </p>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Số lượng bổ sung ({selectedInventoryItem.unit}):
                </label>
                <Input
                  type="number"
                  value={addQty}
                  onChange={(e) => setAddQty(parseInt(e.target.value) || 0)}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStockModalOpen(false)}
              className="h-9 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleAddStock}
              className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground"
            >
              Cập nhật kho
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Component hiển thị dòng checklist CSVC có checkbox tương tác ───────────────
function ChecklistRow({
  task,
  onToggle,
}: {
  task: ClassPrepTask;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
        task.checked
          ? "bg-emerald-500/5 border-emerald-300 dark:border-emerald-800"
          : "bg-card border-border/70 hover:bg-muted/40"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
          task.checked
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-muted-foreground/40 bg-background"
        }`}
      >
        {task.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>

      <div className="flex-1 text-xs">
        <p
          className={`leading-relaxed font-medium transition-colors ${
            task.checked
              ? "line-through text-muted-foreground"
              : "text-foreground font-semibold"
          }`}
        >
          {task.label}
        </p>
      </div>

      {task.required && (
        <span className="text-[10px] font-bold text-red-500 shrink-0">Bắt buộc</span>
      )}
    </div>
  );
}
