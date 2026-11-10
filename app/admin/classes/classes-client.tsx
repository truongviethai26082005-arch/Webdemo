"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  DollarSign,
  Edit,
  Trash2,
  ArrowRight,
  School,
  LayoutGrid,
  List,
  AlertTriangle,
  TrendingUp,
  DoorOpen,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Filter,
  Building2,
  CalendarDays,
  Wrench,
  Monitor,
  Mic,
  Wind,
  PenTool,
  Check,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/lib/utils/vietqr";
import { classSizeLight, BREAK_EVEN_MIN_STUDENTS, STANDARD_MIN_STUDENTS } from "@/lib/utils/traffic-light";
import { ClassDialog } from "@/components/classes/class-dialog";
import { deleteClass } from "@/lib/actions/classes";
import { useAppData, INITIAL_APP_CLASSES } from "@/lib/context/app-data-context";
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

interface ClassesClientProps {
  initialClasses: any[];
  teachers: any[];
  initialTab?: string;
}

const parseSchedule = (schedule: any): any[] => {
  if (!schedule) return [];
  if (Array.isArray(schedule)) return schedule;
  if (typeof schedule === "string") {
    const trimmed = schedule.trim();
    if (!trimmed) return [];
    if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
      return [trimmed];
    }
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return [];
};

function formatClassDate(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function isClassCompleted(cls: any): boolean {
  if (cls.status === "completed") return true;
  const todayStr = new Date().toISOString().split("T")[0];
  const end = cls.endDate || cls.end_date;
  if (end && end < todayStr) return true;
  const completed = cls.completedSessions ?? cls.completed_sessions ?? 0;
  const planned = cls.totalPlannedSessions ?? cls.total_planned_sessions ?? 0;
  if (planned > 0 && completed >= planned) return true;
  return false;
}

function getClassStatusStyle(cls: any, count: number, max: number) {
  if (isClassCompleted(cls)) {
    return {
      text: "⚪ Đã kết thúc",
      variant: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold",
      progressColor: "bg-slate-400",
    };
  }
  const light = classSizeLight(count, cls.startDate || cls.start_date);
  if (light === "green") {
    return {
      text: count >= max ? "🟢 Sĩ số chuẩn · Đã đầy lớp" : `🟢 Sĩ số chuẩn (≥${STANDARD_MIN_STUDENTS} HS)`,
      variant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      progressColor: "bg-emerald-500",
    };
  }
  if (light === "yellow") {
    return {
      text: `🟡 Đạt hòa vốn, chưa đủ chuẩn ${STANDARD_MIN_STUDENTS} HS`,
      variant: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      progressColor: "bg-amber-500",
    };
  }
  if (light === "red") {
    return {
      text: `🔴 Dưới ${BREAK_EVEN_MIN_STUDENTS} HS, sắp khai giảng`,
      variant: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      progressColor: "bg-rose-500",
    };
  }
  return {
    text: count === 0 ? "⚪ Chưa có học sinh" : `Dưới ${BREAK_EVEN_MIN_STUDENTS} HS`,
    variant: "bg-muted text-muted-foreground border-border",
    progressColor: "bg-muted-foreground/40",
  };
}

// ─── Helpers Calendar ─────────────────────────────────────────────────────────
const HOUR_SLOTS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 -> 21:00
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

function getScheduleDayIndex(dayStr: string): number | null {
  if (!dayStr) return null;
  const s = dayStr.trim().toLowerCase();
  if (s === "t2" || s.includes("thứ 2") || s.includes("thứ hai") || s === "2" || s.includes("mon")) return 0;
  if (s === "t3" || s.includes("thứ 3") || s.includes("thứ ba") || s === "3" || s.includes("tue")) return 1;
  if (s === "t4" || s.includes("thứ 4") || s.includes("thứ tư") || s === "4" || s.includes("wed")) return 2;
  if (s === "t5" || s.includes("thứ 5") || s.includes("thứ năm") || s === "5" || s.includes("thu")) return 3;
  if (s === "t6" || s.includes("thứ 6") || s.includes("thứ sáu") || s === "6" || s.includes("fri")) return 4;
  if (s === "t7" || s.includes("thứ 7") || s.includes("thứ bảy") || s === "7" || s.includes("sat")) return 5;
  if (s === "cn" || s.includes("chủ nhật") || s.includes("chu nhat") || s === "cn" || s.includes("sun")) return 6;
  return null;
}

interface ScheduleSessionEntry {
  dayIndex: number;
  startTime: string;
  endTime: string;
  timeSlot: string;
}

function extractScheduleSessions(schedule: any): ScheduleSessionEntry[] {
  const sessions: ScheduleSessionEntry[] = [];
  if (!schedule) return sessions;

  if (Array.isArray(schedule)) {
    schedule.forEach((item: any) => {
      if (typeof item === "object" && item !== null) {
        const dayIdx = getScheduleDayIndex(item.day || "");
        if (dayIdx !== null) {
          const startTime = item.start_time || "18:00";
          const endTime = item.end_time || "19:30";
          sessions.push({
            dayIndex: dayIdx,
            startTime,
            endTime,
            timeSlot: `${startTime} - ${endTime}`,
          });
        }
      } else if (typeof item === "string") {
        sessions.push(...extractScheduleSessions(item));
      }
    });
    return sessions;
  }

  if (typeof schedule === "string") {
    let str = schedule.trim();
    if (str.startsWith("[") || str.startsWith("{")) {
      try {
        const parsed = JSON.parse(str);
        return extractScheduleSessions(parsed);
      } catch (e) { /* ignore */ }
    }

    const timeMatch = str.match(/\((.*?)\)/) || str.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
    let startTime = "18:00";
    let endTime = "19:30";
    let timeSlot = "18:00 - 19:30";

    if (timeMatch) {
      timeSlot = timeMatch[1].trim();
      const parts = timeSlot.split("-").map((p) => p.trim());
      if (parts[0]) startTime = parts[0];
      if (parts[1]) endTime = parts[1];
    }

    const lower = str.toLowerCase();
    const dayTokens = [
      { token: ["t2", "thứ 2", "thứ hai"], idx: 0 },
      { token: ["t3", "thứ 3", "thứ ba"], idx: 1 },
      { token: ["t4", "thứ 4", "thứ tư"], idx: 2 },
      { token: ["t5", "thứ 5", "thứ năm"], idx: 3 },
      { token: ["t6", "thứ 6", "thứ sáu"], idx: 4 },
      { token: ["t7", "thứ 7", "thứ bảy"], idx: 5 },
      { token: ["cn", "chủ nhật"], idx: 6 },
    ];

    dayTokens.forEach(({ token, idx }) => {
      if (token.some((t) => lower.includes(t))) {
        sessions.push({ dayIndex: idx, startTime, endTime, timeSlot });
      }
    });
  }

  return sessions;
}

export function ClassesClient({ initialClasses = [], teachers = [], initialTab = "classes" }: ClassesClientProps) {
  const {
    classes: globalClasses,
    setClasses: setGlobalClasses,
    teachers: globalTeachers,
  } = useAppData();

  useEffect(() => {
    if (initialClasses && initialClasses.length > 0 && setGlobalClasses) {
      setGlobalClasses(initialClasses);
    }
  }, [initialClasses, setGlobalClasses]);

  // Nguồn dữ liệu lớp học đồng bộ duy nhất
  const classes = useMemo(() => {
    if (globalClasses && globalClasses.length > 0) return globalClasses;
    if (initialClasses && initialClasses.length > 0) return initialClasses;
    return INITIAL_APP_CLASSES;
  }, [globalClasses, initialClasses]);

  const teacherList = teachers && teachers.length > 0 ? teachers : globalTeachers;

  // ─── Phân hệ chính (Tab Navigation) ─────────────────────────────────────────
  const [mainTab, setMainTab] = useState<"classes" | "schedule" | "inventory" | "incidents">(() => {
    if (initialTab === "classes") return "classes";
    if (initialTab === "inventory") return "inventory";
    if (initialTab === "incidents") return "incidents";
    return "schedule";
  });

  // ─── State: Rooms, Inventory, Incidents (Facilities data) ────────────────────
  const [rooms, setRooms] = useState<RoomItem[]>(INITIAL_ROOMS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [prepRecords, setPrepRecords] = useState<Record<string, ClassPrepItem>>({});
  const [checkedDevicesMap, setCheckedDevicesMap] = useState<Record<string, string[]>>({});
  const [isMounted, setIsMounted] = useState(false);

  // Chỉ đọc từ localStorage sau khi component đã mount trên client (tránh triệt để lỗi Hydration Mismatch)
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedRooms = localStorage.getItem("crm_facilities_rooms");
      if (savedRooms) setRooms(JSON.parse(savedRooms));

      const savedInv = localStorage.getItem("crm_facilities_inventory");
      if (savedInv) setInventory(JSON.parse(savedInv));

      const savedInc = localStorage.getItem("crm_facilities_incidents");
      if (savedInc) setIncidents(JSON.parse(savedInc));

      const savedPreps = localStorage.getItem("crm_facilities_preps");
      if (savedPreps) setPrepRecords(JSON.parse(savedPreps));

      const savedDevices = localStorage.getItem("crm_facilities_checked_devices");
      if (savedDevices) setCheckedDevicesMap(JSON.parse(savedDevices));
    } catch (e) {
      // ignore
    }
  }, []);

  const saveRooms = (newRooms: RoomItem[]) => {
    setRooms(newRooms);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_rooms", JSON.stringify(newRooms));
    }
  };

  const saveInventory = (newInv: InventoryItem[]) => {
    setInventory(newInv);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_inventory", JSON.stringify(newInv));
    }
  };

  const saveIncidents = (newInc: IncidentReport[]) => {
    setIncidents(newInc);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_incidents", JSON.stringify(newInc));
    }
  };

  const savePrepRecords = (newRecords: Record<string, ClassPrepItem>) => {
    setPrepRecords(newRecords);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_preps", JSON.stringify(newRecords));
    }
  };

  const saveCheckedDevices = (map: Record<string, string[]>) => {
    setCheckedDevicesMap(map);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_facilities_checked_devices", JSON.stringify(map));
    }
  };

  const todayYMD = useMemo(() => formatDateToYMD(new Date()), []);

  // ─── Filter & Search state cho Danh sách lớp học ────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [csvcFilter, setCsvcFilter] = useState("all"); // 'all' | 'ready' | 'in_progress' | 'pending'
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // ─── Filter & Search state cho Tab 3 (Sổ Báo hỏng & Bảo trì) ────────────
  const [incidentSeverityFilter, setIncidentSeverityFilter] = useState<string>("all");
  const [incidentStatusFilter, setIncidentStatusFilter] = useState<string>("all"); // 'all' | 'unresolved' | 'resolved'
  const [incidentRoomFilter, setIncidentRoomFilter] = useState<string>("all");
  const [incidentSearch, setIncidentSearch] = useState<string>("");

  const incidentCounts = useMemo(() => {
    const total = incidents.length;
    const urgent = incidents.filter((i) => i.severity === "urgent").length;
    const normal = incidents.filter((i) => i.severity === "normal").length;
    const low = incidents.filter((i) => i.severity === "low").length;
    const pending = incidents.filter((i) => i.status === "pending").length;
    const fixing = incidents.filter((i) => i.status === "fixing").length;
    const resolved = incidents.filter((i) => i.status === "resolved").length;
    return { total, urgent, normal, low, pending, fixing, resolved };
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // 1. Lọc theo mức độ nghiêm trọng: Khẩn cấp, Bình thường, Thấp
      if (incidentSeverityFilter !== "all" && inc.severity !== incidentSeverityFilter) {
        return false;
      }
      // 2. Lọc theo trạng thái: Chưa sửa (pending), Đang sửa (fixing), Đã giải quyết (resolved)
      if (incidentStatusFilter !== "all" && inc.status !== incidentStatusFilter) {
        return false;
      }
      // 3. Lọc theo phòng học
      if (incidentRoomFilter !== "all" && inc.roomName !== incidentRoomFilter) {
        return false;
      }
      // 4. Tìm kiếm từ khóa
      if (incidentSearch.trim()) {
        const q = incidentSearch.toLowerCase().trim();
        const matchTitle = (inc.title || "").toLowerCase().includes(q);
        const matchRoom = (inc.roomName || "").toLowerCase().includes(q);
        const matchDesc = (inc.description || "").toLowerCase().includes(q);
        const matchReporter = (inc.reportedBy || "").toLowerCase().includes(q);
        if (!matchTitle && !matchRoom && !matchDesc && !matchReporter) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, incidentSeverityFilter, incidentStatusFilter, incidentRoomFilter, incidentSearch]);

  // ─── Filter & Search state cho Tab 2 (Kho Giáo trình & Vật tư) ───────────
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>("all");
  const [invStatusFilter, setInvStatusFilter] = useState<string>("all");
  const [invSearch, setInvSearch] = useState<string>("");

  const INVENTORY_CATEGORIES = [
    { key: "curriculum", label: "Giáo trình & Đề thi", icon: "📚" },
    { key: "device", label: "Thiết bị giảng dạy", icon: "🎙️" },
    { key: "stationery", label: "Văn phòng phẩm", icon: "✏️" },
    { key: "amenity", label: "Tiện ích & Nước uống", icon: "☕" },
  ];

  const invCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: inventory.length,
      curriculum: 0,
      device: 0,
      stationery: 0,
      amenity: 0,
    };
    inventory.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // 1. Lọc theo Phân loại tiếng Việt
      if (invCategoryFilter !== "all" && item.category !== invCategoryFilter) {
        return false;
      }
      // 2. Lọc theo Trạng thái tồn kho
      if (invStatusFilter !== "all" && item.status !== invStatusFilter) {
        return false;
      }
      // 3. Tìm kiếm từ khóa
      if (invSearch.trim()) {
        const q = invSearch.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchLocation = (item.location || "").toLowerCase().includes(q);
        const matchNote = (item.note || "").toLowerCase().includes(q);
        if (!matchName && !matchLocation && !matchNote) {
          return false;
        }
      }
      return true;
    });
  }, [inventory, invCategoryFilter, invStatusFilter, invSearch]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);

  // Đếm sĩ số học viên thực tế từ enrollments
  const getActualEnrolledCount = (cls: any) => {
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
  };

  // Thống kê Lớp học & Cơ sở vật chất tích hợp
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((acc, c) => acc + getActualEnrolledCount(c), 0);
    const nearCapacityClasses = classes.filter((c) => {
      const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 15;
      const count = getActualEnrolledCount(c);
      return count / max >= 0.8 && count / max < 1;
    }).length;

    // CSVC stats
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === "available").length;
    const inUseRooms = rooms.filter((r) => r.status === "in_use").length;
    const maintenanceRooms = rooms.filter((r) => r.status === "maintenance").length;

    const readyPrepCount = classes.filter((c) => {
      const p =
        prepRecords[c.id] ||
        prepRecords[`${c.id}_${todayYMD}`] ||
        Object.values(prepRecords).find((item) => item.classId === c.id);
      return p && p.status === "ready";
    }).length;

    const inProgressPrepCount = classes.filter((c) => {
      const p =
        prepRecords[c.id] ||
        prepRecords[`${c.id}_${todayYMD}`] ||
        Object.values(prepRecords).find((item) => item.classId === c.id);
      return p && p.status === "in_progress";
    }).length;

    const pendingIncidents = incidents.filter((i) => i.status !== "resolved").length;

    return {
      totalClasses,
      totalStudents,
      nearCapacityClasses,
      totalRooms,
      availableRooms,
      inUseRooms,
      maintenanceRooms,
      readyPrepCount,
      inProgressPrepCount,
      pendingIncidents,
    };
  }, [classes, rooms, prepRecords, incidents, todayYMD]);

  // Lọc lớp học Tab 1 (theo tìm kiếm, giáo viên, trạng thái sĩ số và tình trạng CSVC)
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.room && c.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.teacher?.full_name && c.teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTeacher = teacherFilter === "all" || c.teacher_id === teacherFilter;

      let matchStatus = true;
      const completed = isClassCompleted(c);
      const count = getActualEnrolledCount(c);
      const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 15;
      const ratio = count / max;

      if (statusFilter === "completed") {
        matchStatus = completed;
      } else if (statusFilter === "active") {
        matchStatus = !completed && count > 0;
      } else if (statusFilter === "empty") {
        matchStatus = !completed && count === 0;
      } else if (statusFilter === "near_full") {
        matchStatus = !completed && ratio >= 0.8 && ratio < 1;
      } else if (statusFilter === "full") {
        matchStatus = !completed && ratio >= 1;
      }

      let matchCsvc = true;
      const prep =
        prepRecords[c.id] ||
        prepRecords[`${c.id}_${todayYMD}`] ||
        Object.values(prepRecords).find((item) => item.classId === c.id);
      const prepStatus = prep ? prep.status : "pending";
      if (csvcFilter === "ready") {
        matchCsvc = prepStatus === "ready";
      } else if (csvcFilter === "in_progress") {
        matchCsvc = prepStatus === "in_progress";
      } else if (csvcFilter === "pending") {
        matchCsvc = prepStatus === "pending";
      }

      return matchSearch && matchTeacher && matchStatus && matchCsvc;
    });
  }, [classes, searchTerm, teacherFilter, statusFilter, csvcFilter, prepRecords, todayYMD]);

  async function handleDelete(id: string, name: string) {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${name}"? Thao tác này sẽ xóa dữ liệu ghi danh của lớp.`)) {
      const res = await deleteClass(id);
      if (res.error) {
        alert(res.error);
      } else {
        setGlobalClasses((prev) => prev.filter((c) => c.id !== id));
      }
    }
  }

  // ─── State & Helpers cho Tab 2 (Lịch học & Chuẩn bị CSVC) ───────────────────
  const [selectedDate, setSelectedDate] = useState<string>(todayYMD);
  const [schedRoomFilter, setSchedRoomFilter] = useState<string>("all");
  const [schedStatusFilter, setSchedStatusFilter] = useState<string>("all");

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

    classes.forEach((cls: any) => {
      const sessions = extractScheduleSessions(cls.schedule);
      const roomObj =
        rooms.find(
          (r) =>
            r.name === cls.room ||
            r.name.toLowerCase() === `p.${(cls.room || "").toLowerCase()}` ||
            (cls.room && r.name.includes(cls.room))
        ) || rooms[0];
      const roomCapacity = roomObj ? roomObj.capacity : 25;
      const studentCount = getActualEnrolledCount(cls);

      sessions.forEach((sess) => {
        const wd = currentWeekDays[sess.dayIndex];
        if (!wd) return;

        const startMin = parseTimeToMinutes(sess.startTime);
        const endMin = parseTimeToMinutes(sess.endTime);
        const duration = endMin > startMin ? endMin - startMin : 90;

        list.push({
          id: `${cls.id}_${wd.dateStr}_${sess.startTime.replace(":", "")}`,
          classId: cls.id,
          className: cls.name || "Lớp học",
          subject: cls.subject || cls.name || "Học phần",
          teacherName: cls.teacherName || cls.teacher?.full_name || "Giáo viên",
          roomName: cls.room || roomObj?.name || "P.101",
          dayName: wd.dayName,
          dateStr: wd.dateStr,
          timeSlot: sess.timeSlot,
          startMin,
          endMin: startMin + duration,
          studentCount,
          roomCapacity,
          category: "lecture",
          originalClass: cls,
        });
      });
    });

    return list;
  }, [classes, currentWeekDays, rooms]);

  // Helper lấy danh sách thiết bị phòng chuẩn xác
  const getRoomDevices = (roomName: string) => {
    const roomObj =
      rooms.find(
        (r) =>
          r.name === roomName ||
          r.name.toLowerCase() === `p.${(roomName || "").toLowerCase()}` ||
          (roomName && r.name.includes(roomName))
      ) || rooms[0];

    return roomObj?.devices && roomObj.devices.length > 0
      ? roomObj.devices
      : [
          { name: "Máy chiếu Epson Full HD 3500lm + Màn chiếu điện", type: "projector", category: "display", status: "good" as const },
          { name: "Bộ Micro không dây trợ giảng Shure & Loa âm trần", type: "audio", category: "audio", status: "good" as const },
          { name: "Bảng từ ceramic trắng chống lóa 3.2m", type: "board", category: "teaching", status: "good" as const },
          { name: "Điều hòa Daikin Inverter 2HP", type: "ac", category: "climate_power", status: "good" as const },
          { name: "Khay bút viết bảng 3 màu (Xanh/Đỏ/Đen) & Bông lau", type: "supplies", category: "teaching", status: "good" as const },
          { name: "Giáo trình & Đề cương in sẵn cho học viên", type: "curriculum", category: "curriculum", status: "good" as const },
        ];
  };

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    events.forEach((ev) => {
      if (schedRoomFilter !== "all" && ev.roomName !== schedRoomFilter) return;
      if (schedStatusFilter !== "all") {
        const isReady =
          prepRecords[ev.id]?.status === "ready" ||
          (checkedDevicesMap[ev.id] !== undefined &&
            checkedDevicesMap[ev.id].length === getRoomDevices(ev.roomName).length &&
            getRoomDevices(ev.roomName).length > 0);
        const status = isReady ? "ready" : "in_progress";
        if (status !== schedStatusFilter) return;
      }
      const idx = currentWeekDays.findIndex((w) => w.dateStr === ev.dateStr);
      if (idx >= 0) map[idx].push(ev);
    });
    return map;
  }, [events, currentWeekDays, schedRoomFilter, schedStatusFilter, prepRecords, checkedDevicesMap, rooms]);

  // Đồng bộ trạng thái phòng học tự động
  const synchronizedRooms = useMemo(() => {
    return rooms.map((room) => {
      const hasUrgentIncident = incidents.some(
        (inc) => inc.roomName === room.name && inc.status !== "resolved" && inc.severity === "urgent"
      );
      if (hasUrgentIncident) {
        return { ...room, status: "maintenance" as RoomStatus, currentOccupant: "Đang bảo trì sự cố" };
      }

      const todayClasses = events.filter((ev) => ev.roomName === room.name && ev.dateStr === todayYMD);
      if (todayClasses.length > 0 && room.status !== "maintenance") {
        return {
          ...room,
          status: "in_use" as RoomStatus,
          currentOccupant: `${todayClasses[0].className} (${todayClasses[0].timeSlot})`,
        };
      }

      return { ...room, currentOccupant: undefined };
    });
  }, [rooms, incidents, events, todayYMD]);

  // ─── Modal: Tích chọn CSVC & Chuẩn bị lớp ───────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [modalCheckedDevices, setModalCheckedDevices] = useState<string[]>([]);

  const openClassModal = (ev: CalEvent) => {
    const devices = getRoomDevices(ev.roomName);
    let checked: string[];
    if (checkedDevicesMap[ev.id] !== undefined) {
      checked = checkedDevicesMap[ev.id];
    } else if (prepRecords[ev.id]?.status === "ready") {
      checked = devices.map((d) => d.name);
    } else {
      // Mặc định ban đầu chưa tích đủ (4/6 thiết bị) -> trạng thái 'in_progress'
      checked = devices.slice(2).map((d) => d.name);
    }
    setModalCheckedDevices(checked);
    setSelectedEvent(ev);
  };

  const currentPrepItem = useMemo<ClassPrepItem | null>(() => {
    if (!selectedEvent) return null;
    if (prepRecords[selectedEvent.id]) {
      return prepRecords[selectedEvent.id];
    }
    const tasks = generateDefaultTasks(
      selectedEvent.subject,
      selectedEvent.studentCount,
      selectedEvent.studentCount + 1,
      selectedEvent.roomName
    );
    const checkedCount = tasks.filter((t) => t.checked).length;
    const initialStatus =
      checkedCount === tasks.length ? "ready" : checkedCount > 0 ? "in_progress" : "pending";

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

    savePrepRecords({ ...prepRecords, [selectedEvent.id]: updatedItem });
  };

  const markAllTasks = (checked: boolean) => {
    if (!selectedEvent || !currentPrepItem) return;
    const updatedTasks = currentPrepItem.tasks.map((t) => ({ ...t, checked }));
    const updatedItem: ClassPrepItem = {
      ...currentPrepItem,
      tasks: updatedTasks,
      status: checked ? "ready" : "pending",
      updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    savePrepRecords({ ...prepRecords, [selectedEvent.id]: updatedItem });
  };

  const handleQuickChangeRoom = (classId: string, newRoom: string) => {
    if (!setGlobalClasses) return;
    setGlobalClasses((prev) =>
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

  // Mở nhanh modal chuẩn bị CSVC trực tiếp từ Tab 1 (Danh sách lớp)
  const openPrepForClass = (cls: any) => {
    const scheduleInfo = parseScheduleDays(cls.schedule);
    const roomObj = rooms.find((r) => r.name === (cls.room || "P.101")) || rooms[0];
    const eventMock: CalEvent = {
      id: `${cls.id}_${todayYMD}`,
      classId: cls.id,
      className: cls.name,
      subject: cls.subject || "Học phần",
      teacherName: cls.teacherName || cls.teacher?.full_name || "Giáo viên",
      roomName: cls.room || "P.101",
      dayName: "Hôm nay",
      dateStr: todayYMD,
      timeSlot: scheduleInfo.timeSlot,
      startMin: 480,
      endMin: 570,
      studentCount: getActualEnrolledCount(cls),
      roomCapacity: roomObj.capacity,
      category: "lecture",
      originalClass: cls,
    };
    openClassModal(eventMock);
  };

  // ─── Modal Báo hỏng thiết bị (Đồng bộ chọn thiết bị, sự cố và người báo cáo) ──
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportRoomName, setReportRoomName] = useState("");
  const [reportDeviceName, setReportDeviceName] = useState("");
  const [reportCustomDevice, setReportCustomDevice] = useState("");
  const [reportIssue, setReportIssue] = useState("");
  const [reportCustomIssue, setReportCustomIssue] = useState("");
  const [reportSeverity, setReportSeverity] = useState<IncidentSeverity>("normal");
  const [reportReporterSelect, setReportReporterSelect] = useState("hai bang (Quản trị viên)");
  const [reportCustomReporter, setReportCustomReporter] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const PRESET_REPORTERS = [
    "hai bang (Quản trị viên)",
    "Mr. Michael (Giáo viên)",
    "Cô Hoàng Lan (Quản lý Học vụ & CSVC)",
    "Thầy Tuấn (Trợ giảng trực ca)",
    "Kỹ thuật viên IT / Tòa nhà",
    "Khác (Tự nhập tên...)",
  ];

  const getSuggestedIssues = (devName: string): { label: string; severity?: IncidentSeverity }[] => {
    const lower = (devName || "").toLowerCase();
    if (lower.includes("màn hình") || lower.includes("tivi") || lower.includes("tv")) {
      return [
        { label: "Không lên nguồn / Màn hình đen", severity: "urgent" },
        { label: "Không nhận tín hiệu HDMI / Dây cáp lỏng", severity: "urgent" },
        { label: "Màn hình cảm ứng bị đơ / Lệch cảm ứng", severity: "normal" },
        { label: "Hình ảnh bị sọc / Chớp nháy liên tục", severity: "normal" },
        { label: "Loa màn hình bị rè hoặc mất tiếng", severity: "normal" },
      ];
    }
    if (lower.includes("máy chiếu") || lower.includes("màn chiếu")) {
      return [
        { label: "Máy chiếu không lên nguồn / Đèn báo đỏ", severity: "urgent" },
        { label: "Bóng chiếu mờ tối / Sai lệch màu sắc", severity: "normal" },
        { label: "Không nhận tín hiệu từ laptop GV", severity: "urgent" },
        { label: "Màn chiếu điện bị kẹt không hạ xuống", severity: "normal" },
        { label: "Quạt tản nhiệt kêu to bất thường", severity: "normal" },
      ];
    }
    if (lower.includes("micro") || lower.includes("loa") || lower.includes("soundbar") || lower.includes("tai nghe")) {
      return [
        { label: "Micro hết pin / Dock sạc không vào điện", severity: "urgent" },
        { label: "Micro mất kết nối / Chập chờn ngắt quãng", severity: "urgent" },
        { label: "Loa bị rè / Tiếng hú rít chói tai", severity: "normal" },
        { label: "Mất toàn bộ âm thanh trợ giảng", severity: "urgent" },
      ];
    }
    if (lower.includes("điều hòa")) {
      return [
        { label: "Làm mát yếu / Phả ra hơi nóng", severity: "normal" },
        { label: "Chảy nước ở dàn lạnh trong phòng", severity: "urgent" },
        { label: "Điều khiển hết pin / Liệt nút bấm", severity: "normal" },
        { label: "Điều hòa kêu to / Rung lắc bất thường", severity: "normal" },
      ];
    }
    if (lower.includes("bảng")) {
      return [
        { label: "Ray trượt bảng bị kẹt cứng / Khó kéo đẩy", severity: "normal" },
        { label: "Bề mặt bảng bị ố mờ / Khó lau sạch", severity: "low" },
        { label: "Khay đựng bút bị gãy / Lỏng ốc vít", severity: "low" },
      ];
    }
    if (lower.includes("bút") || lower.includes("bông lau")) {
      return [
        { label: "Bút cảm ứng hết pin / Mất kết nối", severity: "urgent" },
        { label: "Hết mực bút lông viết bảng (Cần cấp thêm)", severity: "normal" },
        { label: "Bông lau bảng bị mòn rách / Bám bẩn", severity: "low" },
      ];
    }
    if (lower.includes("bàn") || lower.includes("ghế")) {
      return [
        { label: "Bàn/Ghế học sinh bị gãy / Lung lay lỏng vít", severity: "normal" },
        { label: "Mặt bàn bị kênh / Bong mép dán", severity: "low" },
        { label: "Thiếu ghế cho học sinh trong lớp", severity: "urgent" },
      ];
    }
    if (lower.includes("đèn") || lower.includes("điện") || lower.includes("quạt") || lower.includes("ổ cắm")) {
      return [
        { label: "Bóng đèn LED chớp nháy / Không sáng", severity: "normal" },
        { label: "Ổ cắm điện bị chập / Lỏng phích cắm", severity: "urgent" },
        { label: "Quạt treo tường không quay / Kẹt tuốc năng", severity: "normal" },
      ];
    }
    return [
      { label: "Thiết bị không hoạt động / Mất nguồn", severity: "urgent" },
      { label: "Hoạt động chập chờn / Có tiếng kêu lạ", severity: "normal" },
      { label: "Phụ kiện đi kèm bị hỏng / Thiếu đồ", severity: "normal" },
      { label: "Cần bảo trì / Vệ sinh định kỳ", severity: "low" },
    ];
  };

  const openReportModal = (roomName?: string, defaultDev?: string) => {
    const targetRoom = roomName || selectedEvent?.roomName || "P.101";
    setReportRoomName(targetRoom);
    const devs = getRoomDevices(targetRoom);
    const firstDev = defaultDev || (devs.length > 0 ? devs[0].name : "Máy chiếu");
    setReportDeviceName(firstDev);
    setReportCustomDevice("");
    const suggested = getSuggestedIssues(firstDev);
    setReportIssue(suggested.length > 0 ? suggested[0].label : "");
    if (suggested.length > 0 && suggested[0].severity) {
      setReportSeverity(suggested[0].severity);
    } else {
      setReportSeverity("normal");
    }
    setReportCustomIssue("");
    setReportReporterSelect("hai bang (Quản trị viên)");
    setReportCustomReporter("");
    setReportDescription("");
    setReportModalOpen(true);
  };

  const handleCreateIncident = () => {
    const dev = reportDeviceName === "other" ? reportCustomDevice.trim() : reportDeviceName;
    const issue = reportIssue === "other" ? reportCustomIssue.trim() : reportIssue;

    if (!dev && !issue) return;

    const fullTitle = dev && issue ? `${dev}: ${issue}` : dev || issue || "Sự cố thiết bị";
    const reportedBy =
      reportReporterSelect === "Khác (Tự nhập tên...)"
        ? reportCustomReporter.trim() || "Cán bộ CSVC"
        : reportReporterSelect;

    const newIncident: IncidentReport = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      roomName: reportRoomName,
      title: fullTitle,
      description: reportDescription.trim() || "Cần kỹ thuật kiểm tra và xử lý.",
      severity: reportSeverity,
      status: "pending",
      reportedBy: reportedBy,
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
          resolvedAt: newStatus === "resolved" ? new Date().toLocaleString("vi-VN") : undefined,
          resolutionNote: newStatus === "resolved" ? "Đã kiểm tra kỹ thuật và khắc phục hoàn tất." : undefined,
        };
      }
      return inc;
    });
    saveIncidents(updated);
  };

  const handleDeleteIncident = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi sự cố này?")) {
      const updated = incidents.filter((inc) => inc.id !== id);
      saveIncidents(updated);
    }
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

  const weekRange = formatWeekRange(currentWeekDays);
  const pendingIncidentsCount = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="space-y-5" suppressHydrationWarning>
      {/* ════════════════════════════════════════════════════════════════
          PRIMARY TAB BAR: TÍCH HỢP TOÀN BỘ LỚP HỌC & CƠ SỞ VẬT CHẤT
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border/70 gap-1 flex-wrap">
          <button
            onClick={() => setMainTab("classes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mainTab === "classes"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <School className="w-4 h-4" />
            Danh sách lớp ({classes.length})
          </button>

          <button
            onClick={() => setMainTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mainTab === "schedule"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            1. Lịch học & Chuẩn bị CSVC
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-foreground/20 text-primary-foreground font-black">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setMainTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mainTab === "inventory"
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
            onClick={() => setMainTab("incidents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              mainTab === "incidents"
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

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setEditingClass(null);
              setIsDialogOpen(true);
            }}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tạo lớp học mới
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => openReportModal()}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <AlertTriangle className="w-4 h-4" />
            Báo sự cố thiết bị
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB 1: DANH SÁCH LỚP HỌC & ĐÀO TẠO (QUẢN LÝ LỚP HỌC GỐC)
      ════════════════════════════════════════════════════════════════ */}
      {mainTab === "classes" && (
        <div className="space-y-6">
          {/* Top 3 Quick Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tổng số lớp học
                </span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground tracking-tight my-1">
                  {stats.totalClasses}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Bao quát tất cả bộ môn tại trung tâm
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tổng học sinh đang học
                </span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground tracking-tight my-1">
                  {stats.totalStudents}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Trung bình {(stats.totalStudents / (stats.totalClasses || 1)).toFixed(1)} HS / lớp
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lớp gần đầy sĩ số (≥80%)
                </span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground tracking-tight my-1">
                  {stats.nearCapacityClasses}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Cần lên kế hoạch mở thêm lớp mới
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Search & Filters */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên lớp, phòng, GV..."
                  className="pl-9 h-9 text-xs rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tất cả giáo viên ({teacherList.length})</option>
                {teacherList.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang học (có học sinh)</option>
                <option value="empty">Lớp trống (0 học sinh)</option>
                <option value="near_full">Sắp đầy (≥ 80%)</option>
                <option value="full">Đã đầy (100%)</option>
                <option value="completed">Đã kết thúc</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center bg-muted/80 rounded-xl p-0.5 border border-border/60">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className={`h-8 px-2.5 text-xs font-semibold rounded-lg ${viewMode === "grid" ? "shadow-xs" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                  Lưới
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  className={`h-8 px-2.5 text-xs font-semibold rounded-lg ${viewMode === "table" ? "shadow-xs" : ""}`}
                  onClick={() => setViewMode("table")}
                >
                  <List className="w-3.5 h-3.5 mr-1" />
                  Bảng
                </Button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((cls) => {
                const count = getActualEnrolledCount(cls);
                const max = cls.maxCapacity ?? cls.max_students ?? cls.maxStudents ?? 15;
                const percentage = Math.min(Math.round((count / max) * 100), 100);
                const statusStyle = getClassStatusStyle(cls, count, max);
                const scheduleArray = parseSchedule(cls.schedule);

                return (
                  <Card
                    key={cls.id}
                    className="rounded-2xl border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Class Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                          <h3 className="font-black text-sm text-foreground hover:text-primary transition-colors">
                            {cls.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span className="font-semibold">{cls.teacher?.full_name || cls.teacherName || "Chưa có GV"}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.variant}`}>
                          {statusStyle.text}
                        </span>
                      </div>

                      {/* Info Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <DoorOpen className="w-3.5 h-3.5 text-primary" />
                            Phòng học:
                          </span>
                          <span className="font-bold text-foreground">
                            {cls.room ? (cls.room.startsWith("P.") ? cls.room : `Phòng ${cls.room}`) : "Chưa xếp phòng"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            Lịch học:
                          </span>
                          <span className="font-semibold text-foreground text-right truncate max-w-[180px]">
                            {scheduleArray.length > 0 ? (
                              typeof scheduleArray[0] === "string" ? (
                                scheduleArray[0]
                              ) : (
                                `${scheduleArray.map((s) => s.day).join(", ")} (${scheduleArray[0].start_time || "18:00"} - ${scheduleArray[0].end_time || "20:00"})`
                              )
                            ) : (
                              "Chưa xếp lịch"
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            Học phí / buổi:
                          </span>
                          <span className="font-black text-primary font-mono">{formatVND(cls.fee_per_session)}</span>
                        </div>
                      </div>

                      {/* Sĩ số progress bar */}
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground font-sans text-[11px] font-semibold">Sĩ số học viên:</span>
                          <span className="font-bold text-foreground">
                            {count} / {max} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${statusStyle.progressColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Class Details & Actions */}
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-1">
                        <Link href={`/admin/classes/${cls.id}`}>
                          <Button size="sm" variant="outline" className="h-8 px-3 text-xs font-semibold gap-1 rounded-xl">
                            Xem chi tiết lớp học
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingClass(cls);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(cls.id, cls.name)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <tr className="bg-muted/40 text-muted-foreground text-xs font-semibold">
                    <TableHead className="py-3 px-4">Tên lớp học</TableHead>
                    <TableHead>Phòng học</TableHead>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Lịch học</TableHead>
                    <TableHead>Học phí</TableHead>
                    <TableHead className="w-48">Sĩ số (Đèn giao thông)</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </tr>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {filteredClasses.map((cls) => {
                    const count = getActualEnrolledCount(cls);
                    const max = cls.maxCapacity ?? cls.max_students ?? cls.maxStudents ?? 15;
                    const percentage = Math.min(Math.round((count / max) * 100), 100);
                    const statusStyle = getClassStatusStyle(cls, count, max);
                    const scheduleArray = parseSchedule(cls.schedule);

                    return (
                      <TableRow key={cls.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3 px-4 font-bold text-foreground">
                          {cls.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-semibold">
                            {cls.room ? (cls.room.startsWith("P.") ? cls.room : `P.${cls.room}`) : "Chưa xếp phòng"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {cls.teacher?.full_name || cls.teacherName || "Chưa phân công"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {scheduleArray.length > 0 ? (
                            typeof scheduleArray[0] === "string" ? (
                              scheduleArray[0]
                            ) : (
                              `${scheduleArray.map((s) => s.day).join(", ")}`
                            )
                          ) : (
                            "Chưa xếp lịch"
                          )}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-primary text-xs">
                          {formatVND(cls.fee_per_session)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-foreground">{count}/{max} HS</span>
                              <span className="text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${statusStyle.progressColor}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${statusStyle.variant}`}>
                              {statusStyle.text}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/classes/${cls.id}`}>
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2.5 font-semibold">
                                Chi tiết
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setEditingClass(cls);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(cls.id, cls.name)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 2: LỊCH HỌC & CHUẨN BỊ CƠ SỞ VẬT CHẤT
      ════════════════════════════════════════════════════════════════ */}
      {mainTab === "schedule" && (
        <div className="space-y-4">
          {/* Controls Bar: Bộ lọc Lịch biểu tuần */}
          <div className="bg-card rounded-2xl border border-border p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToday} className="h-8 px-3 text-xs font-semibold">
                Hôm nay
              </Button>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevWeek} title="Tuần trước">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextWeek} title="Tuần sau">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/60 rounded-xl border border-border/60">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground select-none">Tuần: {weekRange}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">Phòng:</span>
                <select
                  value={schedRoomFilter}
                  onChange={(e) => setSchedRoomFilter(e.target.value)}
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

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">CSVC:</span>
                <select
                  value={schedStatusFilter}
                  onChange={(e) => setSchedStatusFilter(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-xs font-semibold"
                >
                  <option value="all">Mọi trạng thái</option>
                  <option value="ready">🟢 Đã sẵn sàng</option>
                  <option value="in_progress">🟡 Đang chuẩn bị</option>
                  <option value="pending">⚪ Chờ chuẩn bị</option>
                </select>
              </div>

              <span className="text-xs text-muted-foreground hidden lg:inline ml-2 pl-2 border-l border-border/70">
                Nhấp vào ca học để <strong className="text-foreground">Tích chọn CSVC</strong>
              </span>
            </div>
          </div>

          {/* Lịch biểu thời gian tuần */}
          <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-270px)] min-h-[620px]">
            <div className="flex-1 flex flex-col min-w-0 bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/90 shrink-0">
                <span className="text-xs font-bold text-foreground">
                  Thời khóa biểu tuần ({events.length} ca học)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Khung giờ: 07:00 – 21:00 · Tự động đồng bộ với sĩ số & phòng học
                </span>
              </div>

                <div className="flex-1 overflow-auto">
                  <div className="sticky top-0 z-20 flex bg-card border-b border-border shadow-xs">
                    <div className="w-14 shrink-0" />
                    {currentWeekDays.map((wd, i) => (
                      <div
                        key={wd.dateStr}
                        className="flex-1 text-center py-2 border-l border-border/60 cursor-pointer hover:bg-muted/30"
                        onClick={() => setSelectedDate(wd.dateStr)}
                      >
                        <div className={`text-[11px] font-semibold ${wd.isToday ? "text-primary" : "text-muted-foreground"}`}>
                          {DAY_LABELS[i]}
                        </div>
                        <div
                          className={`text-sm font-black w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                            wd.isToday ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground"
                          }`}
                        >
                          {dayNumFromDateStr(wd.dateStr)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative flex min-w-[770px]">
                    <div className="w-14 shrink-0 select-none bg-muted/5">
                      {HOUR_SLOTS.map((h) => (
                        <div key={h} className="relative" style={{ height: 64 }}>
                          <span className="absolute -top-2.5 left-2 text-[10px] text-muted-foreground font-semibold">
                            {String(h).padStart(2, "0")}:00
                          </span>
                        </div>
                      ))}
                    </div>

                    {currentWeekDays.map((wd, dayIdx) => {
                      const dayEvents = eventsByDay[dayIdx] || [];
                      return (
                        <div
                          key={wd.dateStr}
                          className={`flex-1 relative border-l border-border/50 ${wd.isToday ? "bg-primary/[0.02]" : ""}`}
                        >
                          {HOUR_SLOTS.map((h) => (
                            <div key={h} className="border-t border-border/40" style={{ height: 64 }} />
                          ))}

                          {dayEvents.map((ev) => {
                            const topPx = (ev.startMin - 7 * 60) * (64 / 60);
                            const heightPx = Math.max((ev.endMin - ev.startMin) * (64 / 60), 40);
                            const devs = getRoomDevices(ev.roomName);
                            const isReady =
                              prepRecords[ev.id]?.status === "ready" ||
                              (checkedDevicesMap[ev.id] !== undefined &&
                                checkedDevicesMap[ev.id].length === devs.length &&
                                devs.length > 0);
                            const prepStatus = isReady ? "ready" : "in_progress";

                            return (
                              <div
                                key={ev.id}
                                onClick={() => openClassModal(ev)}
                                className="absolute left-1 right-1 rounded-xl p-2 cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:z-20 z-10 border border-blue-400/50 text-white flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xs group"
                                style={{ top: topPx, height: Math.max(heightPx, 56) }}
                                title={`${ev.className} (${ev.subject})\nGiờ học: ${ev.timeSlot}\nPhòng: ${ev.roomName}\nGV: ${ev.teacherName}\nSĩ số: ${ev.studentCount} học viên`}
                              >
                                <div className="min-w-0">
                                  {/* Hàng 1: Phòng học & Trạng thái CSVC */}
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-extrabold bg-white/20 px-1.5 py-0.2 rounded text-[10px] text-white">
                                      {ev.roomName}
                                    </span>
                                    {prepStatus === "ready" ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                                        Sẵn sàng
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30 animate-pulse" />
                                        Chuẩn bị
                                      </span>
                                    )}
                                  </div>

                                  {/* Tên lớp học - cho phép xuống dòng thay vì bị cắt chữ */}
                                  <p className="text-[11px] font-black tracking-tight leading-snug line-clamp-2 text-white drop-shadow-xs">
                                    {ev.className}
                                  </p>

                                  {/* Giờ học */}
                                  <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-blue-100">
                                    <Clock className="w-3 h-3 opacity-80 shrink-0" />
                                    <span className="font-mono text-[9px] font-semibold">{ev.timeSlot}</span>
                                  </div>

                                  {/* Giáo viên / Sĩ số nếu thẻ đủ chiều cao */}
                                  {heightPx >= 78 && (
                                    <div className="text-[10px] text-blue-100/90 truncate mt-1 flex items-center gap-1">
                                      <span className="truncate">{ev.teacherName.split("(")[0].trim()}</span>
                                      <span className="opacity-70">·</span>
                                      <span className="font-bold shrink-0">{ev.studentCount} HS</span>
                                    </div>
                                  )}
                                </div>

                                {heightPx >= 88 && (
                                  <div className="mt-1 pt-1 border-t border-white/15 flex items-center justify-between text-[9px] text-blue-100">
                                    <span className="truncate opacity-90">Chi tiết & CSVC</span>
                                    <ChevronRight className="w-3 h-3 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Trạng thái phòng đồng bộ */}
              <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
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
                        className="flex flex-col p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">{room.name}</p>
                            <p className="text-[10px] text-muted-foreground">{room.floor} · {room.capacity} chỗ</p>
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
                            {room.status === "available" ? "Trống" : room.status === "in_use" ? "Đang có lớp" : "Bảo trì"}
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
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 2: GIÁO TRÌNH & VẬT TƯ (BỘ LỌC PHÂN LOẠI TIẾNG VIỆT)
      ════════════════════════════════════════════════════════════════ */}
      {mainTab === "inventory" && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">2. Kho Giáo trình, Đề thi & Vật tư lớp học</h3>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {filteredInventory.length} mặt hàng
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Theo dõi số lượng tồn kho theo số lượng học viên & phân loại vật tư
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              Tổng kho: <strong>{inventory.length}</strong> mặt hàng
            </span>
          </div>

          {/* BỘ LỌC PHÂN LOẠI TIẾNG VIỆT & TRẠNG THÁI */}
          <div className="space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/70">
            {/* Hàng 1: Lọc theo Phân loại tiếng Việt */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  Phân loại:
                </span>
                <button
                  type="button"
                  onClick={() => setInvCategoryFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invCategoryFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Tất cả ({invCategoryCounts.all})
                </button>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setInvCategoryFilter(cat.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      invCategoryFilter === cat.key
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-background border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label} ({invCategoryCounts[cat.key] || 0})</span>
                  </button>
                ))}
              </div>

              {/* Nút đặt lại bộ lọc */}
              {(invCategoryFilter !== "all" || invStatusFilter !== "all" || invSearch.trim() !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setInvCategoryFilter("all");
                    setInvStatusFilter("all");
                    setInvSearch("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 font-medium"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            {/* Hàng 2: Lọc Trạng thái tồn kho (Dropdown) + Ô Tìm kiếm từ khóa */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-border/50">
              <div className="sm:col-span-4">
                <select
                  value={invStatusFilter}
                  onChange={(e) => setInvStatusFilter(e.target.value)}
                  className="w-full h-8 text-xs font-semibold px-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">Tất cả tình trạng tồn kho</option>
                  <option value="in_stock">🟢 Còn đủ</option>
                  <option value="low_stock">🟡 Sắp hết</option>
                  <option value="out_of_stock">🔴 Hết hàng</option>
                </select>
              </div>

              <div className="sm:col-span-8 relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Tìm theo tên giáo trình, đề thi, vật tư, vị trí lưu trữ..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-lg bg-background"
                />
              </div>
            </div>
          </div>

          {/* BẢNG DỮ LIỆU KHO (ĐÃ XÓA CỘT PHÂN LOẠI) */}
          {filteredInventory.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-2">
              <ClipboardList className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-bold text-foreground">Không tìm thấy mặt hàng nào</p>
              <p className="text-[11px] text-muted-foreground">
                Không có vật tư, giáo trình nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Tên tài liệu / Vật tư</th>
                    <th className="py-2.5 px-3">Số lượng tồn</th>
                    <th className="py-2.5 px-3">Định mức</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-bold text-foreground">
                        <div>{item.name}</div>
                        {item.location && (
                          <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                            📍 Vị trí: {item.location}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {item.minThreshold} {item.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === "in_stock"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : item.status === "out_of_stock"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-amber-500/15 text-amber-600"
                          }`}
                        >
                          {item.status === "in_stock"
                            ? "Còn đủ"
                            : item.status === "out_of_stock"
                            ? "Hết hàng"
                            : "Sắp hết"}
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
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 3: SỔ BÁO HỎNG & BẢO TRÌ (BỘ LỌC ĐA NĂNG & TÍCH CHỌN GIẢI QUYẾT)
      ════════════════════════════════════════════════════════════════ */}
      {mainTab === "incidents" && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">3. Sổ Ghi nhận Sự cố Thiết bị & Lịch bảo trì</h3>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {incidents.length} sự cố
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tiếp nhận báo hỏng, lọc theo mức độ ưu tiên và tích chọn xác nhận đã hoàn thành xử lý
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openReportModal()}
              className="h-8 px-3.5 text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Ghi nhận sự cố mới
            </Button>
          </div>

          {/* BỘ LỌC ĐA NĂNG: MỨC ĐỘ (KHẨN CẤP / BÌNH THƯỜNG / THẤP) & TRẠNG THÁI */}
          <div className="space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/70">
            {/* Hàng 1: Lọc theo Mức độ nghiêm trọng */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  Mức độ:
                </span>
                <button
                  type="button"
                  onClick={() => setIncidentSeverityFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    incidentSeverityFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Tất cả ({incidentCounts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentSeverityFilter("urgent")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    incidentSeverityFilter === "urgent"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-background border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Khẩn cấp ({incidentCounts.urgent})
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentSeverityFilter("normal")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    incidentSeverityFilter === "normal"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-background border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Bình thường ({incidentCounts.normal})
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentSeverityFilter("low")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    incidentSeverityFilter === "low"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-background border border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Thấp ({incidentCounts.low})
                </button>
              </div>

              {/* Nút đặt lại bộ lọc nếu đang áp dụng lọc */}
              {(incidentSeverityFilter !== "all" ||
                incidentStatusFilter !== "all" ||
                incidentRoomFilter !== "all" ||
                incidentSearch.trim() !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setIncidentSeverityFilter("all");
                    setIncidentStatusFilter("all");
                    setIncidentRoomFilter("all");
                    setIncidentSearch("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 font-medium"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            {/* Hàng 2: Lọc Trạng thái (Dropdown) + Lọc Phòng (Dropdown) + Tìm kiếm từ khóa */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-border/50">
              {/* Lọc Trạng thái dạng Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={incidentStatusFilter}
                  onChange={(e) => setIncidentStatusFilter(e.target.value)}
                  className="w-full h-8 text-xs font-semibold px-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái ({incidentCounts.total})</option>
                  <option value="pending">⏳ Chưa sửa ({incidentCounts.pending})</option>
                  <option value="fixing">🔧 Đang sửa chữa ({incidentCounts.fixing})</option>
                  <option value="resolved">✅ Đã giải quyết ({incidentCounts.resolved})</option>
                </select>
              </div>

              {/* Lọc Phòng học dạng Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={incidentRoomFilter}
                  onChange={(e) => setIncidentRoomFilter(e.target.value)}
                  className="w-full h-8 text-xs font-semibold px-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">Tất cả phòng học</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.floor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ô tìm kiếm từ khóa */}
              <div className="sm:col-span-6 relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Tìm theo thiết bị, mô tả sự cố, người báo..."
                  value={incidentSearch}
                  onChange={(e) => setIncidentSearch(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-lg bg-background"
                />
              </div>
            </div>
          </div>

          {/* DANH SÁCH SỰ CỐ VỚI BỘ CHỌN TRẠNG THÁI DẠNG DROPDOWN GIỐNG BỘ LỌC */}
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-2">
              <ClipboardList className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-bold text-foreground">Không tìm thấy sự cố nào</p>
              <p className="text-[11px] text-muted-foreground">
                Không có dữ liệu phù hợp với bộ lọc mức độ hoặc từ khóa tìm kiếm hiện tại.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.map((inc) => {
                const isResolved = inc.status === "resolved";
                const isFixing = inc.status === "fixing";
                const isPending = inc.status === "pending";

                return (
                  <div
                    key={inc.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isResolved
                        ? "bg-emerald-500/[0.03] border-emerald-300/60 dark:border-emerald-800/60"
                        : isFixing
                        ? "bg-blue-500/[0.03] border-blue-200 dark:border-blue-900/50 shadow-xs"
                        : inc.severity === "urgent"
                        ? "bg-red-500/[0.03] border-red-200 dark:border-red-900/50 shadow-xs"
                        : "bg-muted/20 border-border/80"
                    }`}
                  >
                    {/* Thông tin sự cố */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs bg-foreground text-background px-2 py-0.5 rounded">
                          {inc.roomName}
                        </span>
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {inc.title}
                        </h4>

                        {/* Huy hiệu Mức độ nghiêm trọng */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            inc.severity === "urgent"
                              ? "bg-red-500 text-white border-red-500"
                              : inc.severity === "low"
                              ? "bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {inc.severity === "urgent"
                            ? "🔴 Khẩn cấp"
                            : inc.severity === "low"
                            ? "⚪ Thấp"
                            : "🟡 Bình thường"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">{inc.description}</p>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span>
                          Báo bởi: <strong>{inc.reportedBy}</strong> · Lúc: {inc.reportedAt}
                        </span>
                        {isResolved && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã giải quyết: {inc.resolvedAt || "Hoàn tất"}
                          </span>
                        )}
                        {isFixing && (
                          <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5" />
                            Đang tiến hành xử lý kỹ thuật
                          </span>
                        )}
                      </div>
                    </div>

                    {/* VÙNG THAO TÁC: MENU DROPDOWN CHỌN TRẠNG THÁI (GIỐNG BỘ LỌC) */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
                          Trạng thái:
                        </span>
                        <select
                          value={inc.status}
                          onChange={(e) => handleUpdateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                          className={`h-8.5 px-3 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-xs ${
                            isPending
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-500/15"
                              : isFixing
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-500/15"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-500/15"
                          }`}
                        >
                          <option value="pending" className="bg-background text-foreground font-semibold">
                            Chưa sửa
                          </option>
                          <option value="fixing" className="bg-background text-foreground font-semibold">
                            Đang sửa chữa
                          </option>
                          <option value="resolved" className="bg-background text-foreground font-semibold">
                            Đã giải quyết
                          </option>
                        </select>
                      </div>

                      {/* Nút xóa bản ghi sự cố */}
                      <button
                        type="button"
                        onClick={() => handleDeleteIncident(inc.id)}
                        title="Xóa sự cố này"
                        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: TÍCH CHỌN CƠ SỞ VẬT CHẤT & CHUẨN BỊ BUỔI HỌC (CHUẨN ẢNH 3)
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-xl p-6 rounded-3xl space-y-5 bg-card border border-border shadow-2xl">
          {selectedEvent && (() => {
            const roomObj =
              rooms.find(
                (r) =>
                  r.name === selectedEvent.roomName ||
                  r.name.toLowerCase() === `p.${(selectedEvent.roomName || "").toLowerCase()}` ||
                  (selectedEvent.roomName && r.name.includes(selectedEvent.roomName))
              ) || rooms[0];

            const devicesList = getRoomDevices(selectedEvent.roomName);

            const isAllChecked =
              devicesList.length > 0 && modalCheckedDevices.length === devicesList.length;

            const toggleDev = (name: string) => {
              setModalCheckedDevices((prev) =>
                prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
              );
            };

            const toggleAll = (select: boolean) => {
              setModalCheckedDevices(select ? devicesList.map((d) => d.name) : []);
            };

            const handleSaveCSVC = () => {
              const newStatus: "ready" | "in_progress" = isAllChecked ? "ready" : "in_progress";

              // 1. Cập nhật checkedDevicesMap
              const newMap = { ...checkedDevicesMap, [selectedEvent.id]: modalCheckedDevices };
              saveCheckedDevices(newMap);

              // 2. Cập nhật prepRecords
              const existingPrep = prepRecords[selectedEvent.id];
              const updatedItem: ClassPrepItem = {
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
                tasks: (existingPrep?.tasks || []).map((t) => ({ ...t, checked: isAllChecked })),
                status: newStatus,
                preparedBy: "Cán bộ CSVC",
                updatedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              };

              savePrepRecords({ ...prepRecords, [selectedEvent.id]: updatedItem });
              setSelectedEvent(null);
            };

            const roomTypeName =
              roomObj?.type === "multimedia"
                ? "Phòng học Đa phương tiện"
                : roomObj?.type === "lab"
                ? "Phòng Lab & STEM"
                : "Phòng học Tiêu chuẩn";

            return (
              <div className="space-y-4">
                {/* 1. Header Lớp học & Buổi học */}
                <div className="pr-8 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                        {selectedEvent.className}
                      </h2>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        Môn học: <strong className="text-foreground">{selectedEvent.subject}</strong> · Giáo viên: <strong className="text-foreground">{selectedEvent.teacherName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedEvent.dayName} · {selectedEvent.timeSlot}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-muted text-foreground border border-border">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      {roomObj?.name || selectedEvent.roomName} ({roomObj?.floor || "Tầng 1"}) · {roomTypeName}
                    </span>

                    {/* Trạng thái CSVC của buổi học - cập nhật tức thì theo số thiết bị đã tích */}
                    {isAllChecked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-400/60 ml-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        CSVC Sẵn sàng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-400/60 ml-auto">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Đang chuẩn bị ({modalCheckedDevices.length}/{devicesList.length})
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Chỉ số tóm tắt buổi học */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Sĩ số lớp:</span>
                    <strong className="text-sm font-extrabold text-foreground">{selectedEvent.studentCount} học viên</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Sức chứa phòng:</span>
                    <strong className="text-sm font-extrabold text-foreground">{roomObj?.capacity || 25} chỗ</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Bàn ghế HS:</span>
                    <strong className="text-sm font-extrabold text-foreground">{roomObj?.furniture?.studentDesks || Math.ceil((roomObj?.capacity || 25) / 2)} bàn</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Tiến độ CSVC:</span>
                    <strong className={`text-sm font-extrabold ${isAllChecked ? "text-emerald-600" : "text-amber-600"}`}>
                      {modalCheckedDevices.length}/{devicesList.length} thiết bị
                    </strong>
                  </div>
                </div>

                {/* 3. BÀN GHẾ & NỘI THẤT */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wide">
                    <Users className="w-4 h-4 text-primary" />
                    <span>1. Bàn ghế & Nội thất phòng học</span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/70 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-muted-foreground">Sức chứa: </span>
                        <strong className="text-foreground">{roomObj?.capacity || 25} chỗ</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bàn học sinh: </span>
                        <strong className="text-foreground">
                          {roomObj?.furniture?.studentDesks || Math.ceil((roomObj?.capacity || 25) / 2)} bàn
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bàn ghế GV: </span>
                        <strong className="text-foreground">
                          {roomObj?.furniture?.teacherDesk ? "1 bộ hoàn chỉnh" : "Chưa trang bị"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bục giảng: </span>
                        <strong className="text-foreground">
                          {roomObj?.furniture?.podium ? "Có trang bị" : "Không"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TRANG THIẾT BỊ DẠY HỌC (TÍCH CHỌN) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wide">
                      <Monitor className="w-4 h-4 text-primary" />
                      <span>2. Trang thiết bị dạy học (Tích chọn sẵn sàng)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleAll(true)}
                        className="text-primary hover:underline font-bold"
                      >
                        Chọn hết
                      </button>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => toggleAll(false)}
                        className="text-muted-foreground hover:underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {devicesList.map((dev, idx) => {
                      const isChecked = modalCheckedDevices.includes(dev.name);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleDev(dev.name)}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? "bg-primary/5 border-primary/40 hover:bg-primary/10 shadow-xs"
                              : "bg-card border-border/70 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                                isChecked
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-background hover:border-primary"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs truncate font-medium text-foreground">
                              {dev.name}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 shrink-0">
                            {dev.status === "warning" ? "Cần bảo dưỡng" : dev.status === "broken" ? "Hỏng" : "Tốt"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Footer thao tác */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    Kiểm tra gần nhất: {roomObj?.lastInspected || todayYMD}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const rName = roomObj?.name || selectedEvent.roomName;
                        setSelectedEvent(null);
                        openReportModal(rName);
                      }}
                      className="h-9 px-3 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Báo hỏng
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveCSVC}
                      className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-xs hover:bg-primary/90"
                    >
                      Xác nhận & Lưu CSVC
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Class Create / Edit Dialog */}
      <ClassDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingClass(null);
        }}
        teachers={teacherList}
        existingClasses={classes}
        editingClass={editingClass}
        onSaved={() => {
          setIsDialogOpen(false);
          setEditingClass(null);
        }}
      />

      {/* Modal Báo hỏng thiết bị */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-lg p-6 rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl">
          <div className="flex items-center gap-2 text-red-600 font-black text-sm border-b border-border pb-3 pr-8">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Ghi nhận Sự cố Thiết bị Phòng học
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Chọn phòng học */}
            <div>
              <label className="font-bold text-foreground block mb-1">1. Phòng học gặp sự cố:</label>
              <select
                value={reportRoomName}
                onChange={(e) => {
                  const newRoom = e.target.value;
                  setReportRoomName(newRoom);
                  const devs = getRoomDevices(newRoom);
                  if (devs.length > 0) {
                    setReportDeviceName(devs[0].name);
                    const suggested = getSuggestedIssues(devs[0].name);
                    if (suggested.length > 0) {
                      setReportIssue(suggested[0].label);
                      if (suggested[0].severity) setReportSeverity(suggested[0].severity);
                    }
                  }
                }}
                className="w-full h-9 rounded-xl border border-border px-3 bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.name}>{r.name} ({r.floor})</option>
                ))}
              </select>
            </div>

            {/* 2. Chọn Tên thiết bị */}
            <div>
              <label className="font-bold text-foreground block mb-1">2. Tên thiết bị gặp sự cố:</label>
              <select
                value={reportDeviceName}
                onChange={(e) => {
                  const newDev = e.target.value;
                  setReportDeviceName(newDev);
                  if (newDev !== "other") {
                    const suggested = getSuggestedIssues(newDev);
                    if (suggested.length > 0) {
                      setReportIssue(suggested[0].label);
                      if (suggested[0].severity) setReportSeverity(suggested[0].severity);
                    }
                  } else {
                    setReportIssue("other");
                  }
                }}
                className="w-full h-9 rounded-xl border border-border px-3 bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <optgroup label="Thiết bị trong phòng này">
                  {getRoomDevices(reportRoomName).map((dev, idx) => (
                    <option key={idx} value={dev.name}>{dev.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Hạng mục & Thiết bị khác">
                  <option value="Bàn ghế học sinh / Giáo viên">Bàn ghế học sinh / Giáo viên</option>
                  <option value="Hệ thống đèn chiếu sáng / Quạt">Hệ thống đèn chiếu sáng / Quạt</option>
                  <option value="Ổ cắm điện / Nguồn điện phòng học">Ổ cắm điện / Nguồn điện phòng học</option>
                  <option value="other">Thiết bị khác (Tự nhập tay)...</option>
                </optgroup>
              </select>

              {reportDeviceName === "other" && (
                <Input
                  placeholder="Nhập tên thiết bị (ví dụ: Chuột máy tính, Cáp Type-C, Tai nghe...)"
                  value={reportCustomDevice}
                  onChange={(e) => setReportCustomDevice(e.target.value)}
                  className="mt-2 h-9 text-xs rounded-xl"
                  autoFocus
                />
              )}
            </div>

            {/* 3. Chọn Sự cố thường gặp */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-foreground block">
                  3. Sự cố hỏng hóc thường gặp (Nhấp chọn nhanh):
                </label>
                <span className="text-[10px] text-muted-foreground">Đỡ phải gõ tay</span>
              </div>

              {/* Danh sách chip sự cố thường gặp */}
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-2 bg-muted/30 rounded-xl border border-border/60">
                {getSuggestedIssues(reportDeviceName === "other" ? reportCustomDevice : reportDeviceName).map((item, idx) => {
                  const isSelected = reportIssue === item.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setReportIssue(item.label);
                        if (item.severity) setReportSeverity(item.severity);
                      }}
                      className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg border transition-all select-none ${
                        isSelected
                          ? "bg-red-500 text-white font-bold border-red-500 shadow-xs"
                          : "bg-card text-foreground hover:bg-muted border-border/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setReportIssue("other")}
                  className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                    reportIssue === "other"
                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                      : "bg-card text-muted-foreground hover:bg-muted border-dashed border-border"
                  }`}
                >
                  + Sự cố khác (Tự nhập...)
                </button>
              </div>

              {reportIssue === "other" && (
                <Input
                  placeholder="Mô tả tóm tắt sự cố (ví dụ: Chập điện bốc mùi khét, Nút nguồn bị lún...)"
                  value={reportCustomIssue}
                  onChange={(e) => setReportCustomIssue(e.target.value)}
                  className="mt-2 h-9 text-xs rounded-xl"
                  autoFocus
                />
              )}
            </div>

            {/* 4. Mức độ khẩn cấp */}
            <div>
              <label className="font-bold text-foreground block mb-1">4. Mức độ khẩn cấp:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["urgent", "normal", "low"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setReportSeverity(sev)}
                    className={`py-1.5 px-2 rounded-xl border font-bold text-center text-xs transition-all ${
                      reportSeverity === sev
                        ? sev === "urgent"
                          ? "bg-red-500 text-white border-red-500 shadow-xs"
                          : sev === "normal"
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {sev === "urgent" ? "🔴 Khẩn cấp" : sev === "normal" ? "🟡 Bình thường" : "⚪ Thấp"}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Người báo cáo (Chọn luôn không cần nhập tay) */}
            <div>
              <label className="font-bold text-foreground block mb-1">5. Người báo cáo:</label>
              <select
                value={reportReporterSelect}
                onChange={(e) => setReportReporterSelect(e.target.value)}
                className="w-full h-9 rounded-xl border border-border px-3 bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {PRESET_REPORTERS.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>

              {reportReporterSelect === "Khác (Tự nhập tên...)" && (
                <Input
                  placeholder="Nhập họ và tên người báo cáo..."
                  value={reportCustomReporter}
                  onChange={(e) => setReportCustomReporter(e.target.value)}
                  className="mt-2 h-9 text-xs rounded-xl"
                  autoFocus
                />
              )}
            </div>

            {/* 6. Mô tả thêm (tùy chọn) */}
            <div>
              <label className="font-bold text-foreground block mb-1">6. Ghi chú hiện tượng thêm (Tùy chọn):</label>
              <Textarea
                rows={2}
                placeholder="Ghi chú thêm vị trí phòng, thời điểm phát hiện hoặc yêu cầu linh kiện..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setReportModalOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-xl">
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateIncident}
              disabled={
                (reportDeviceName === "other" && !reportCustomDevice.trim()) ||
                (reportIssue === "other" && !reportCustomIssue.trim()) ||
                (!reportDeviceName && !reportIssue)
              }
              className="h-9 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
            >
              Gửi yêu cầu bảo trì
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Modal Nhập thêm vật tư */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent className="sm:max-w-sm p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 font-black text-sm text-foreground border-b border-border pb-3 pr-8">
            <BookOpen className="w-4 h-4 text-primary" />
            Nhập thêm vật tư
          </div>

          {selectedInventoryItem && (
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-foreground text-sm">{selectedInventoryItem.name}</p>
                <p className="text-muted-foreground mt-0.5">
                  Tồn kho hiện tại: <strong className="text-foreground font-mono">{selectedInventoryItem.quantity} {selectedInventoryItem.unit}</strong>
                </p>
              </div>
              <div>
                <label className="font-bold text-foreground block mb-1">Số lượng bổ sung ({selectedInventoryItem.unit}):</label>
                <Input type="number" value={addQty} onChange={(e) => setAddQty(parseInt(e.target.value) || 0)} className="h-9 text-xs font-mono font-bold" />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setStockModalOpen(false)} className="h-9 text-xs font-semibold">Hủy</Button>
            <Button size="sm" onClick={handleAddStock} className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground">Cập nhật kho</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChecklistRow({ task, onToggle }: { task: ClassPrepTask; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
        task.checked ? "bg-emerald-500/5 border-emerald-300 dark:border-emerald-800" : "bg-card border-border/70 hover:bg-muted/40"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
          task.checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/40 bg-background"
        }`}
      >
        {task.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>

      <div className="flex-1 text-xs">
        <p className={`leading-relaxed font-medium ${task.checked ? "line-through text-muted-foreground" : "text-foreground font-semibold"}`}>
          {task.label}
        </p>
      </div>

      {task.required && <span className="text-[10px] font-bold text-red-500 shrink-0">Bắt buộc</span>}
    </div>
  );
}
