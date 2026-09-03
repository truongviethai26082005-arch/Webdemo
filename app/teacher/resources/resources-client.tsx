"use client";

import { useState } from "react";
import {
  FolderArchive,
  Plus,
  Search,
  FileText,
  Presentation,
  Video,
  Link as LinkIcon,
  Download,
  Trash2,
  ExternalLink,
  BookOpen,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Resource {
  id: string;
  title: string;
  classId: string;
  className: string;
  type: "slide" | "pdf" | "video" | "link";
  url: string;
  size?: string;
  createdAt: string;
  description?: string;
}

interface TeacherResourcesClientProps {
  classes: any[];
}

export function TeacherResourcesClient({ classes }: TeacherResourcesClientProps) {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "res-1",
      title: "Slide Bài 01: Nhập môn & Cấu trúc ngữ pháp cơ bản",
      classId: classes[0]?.id || "c1",
      className: classes[0]?.name || "Lớp Tiếng Anh Giao Tiếp",
      type: "slide",
      url: "https://docs.google.com/presentation",
      size: "4.8 MB",
      createdAt: "2026-09-01",
      description: "Slide bài giảng trình chiếu tuần 1",
    },
    {
      id: "res-2",
      title: "Giáo trình bài tập bổ trợ & Flashcards từ vựng",
      classId: classes[0]?.id || "c1",
      className: classes[0]?.name || "Lớp Tiếng Anh Giao Tiếp",
      type: "pdf",
      url: "https://drive.google.com",
      size: "2.1 MB",
      createdAt: "2026-09-02",
      description: "Tài liệu đọc thêm dành cho học viên ôn luyện tại nhà",
    },
    {
      id: "res-3",
      title: "Video hướng dẫn phát âm chuẩn IPA & Ngữ điệu",
      classId: classes[1]?.id || classes[0]?.id || "c2",
      className: classes[1]?.name || classes[0]?.name || "Lớp Ngữ Pháp Nâng Cao",
      type: "video",
      url: "https://youtube.com",
      size: "Link Video",
      createdAt: "2026-08-28",
      description: "Video bài giảng thu sẵn để học sinh xem trước khi lên lớp",
    },
  ]);

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New resource form state
  const [newTitle, setNewTitle] = useState("");
  const [newClassId, setNewClassId] = useState(classes[0]?.id || "");
  const [newType, setNewType] = useState<"slide" | "pdf" | "video" | "link">("slide");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filteredResources = resources.filter((res) => {
    const matchClass = selectedClassFilter === "all" || res.classId === selectedClassFilter;
    const matchType = selectedTypeFilter === "all" || res.type === selectedTypeFilter;
    const matchSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchType && matchSearch;
  });

  function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle) return;

    const chosenClass = classes.find((c) => c.id === newClassId);
    const newRes: Resource = {
      id: "res-" + Date.now(),
      title: newTitle,
      classId: newClassId,
      className: chosenClass?.name || "Lớp học",
      type: newType,
      url: newUrl || "https://drive.google.com",
      size: newType === "video" || newType === "link" ? "Liên kết" : "3.2 MB",
      createdAt: new Date().toISOString().split("T")[0],
      description: newDesc,
    };

    setResources([newRes, ...resources]);
    setIsDialogOpen(false);
    setNewTitle("");
    setNewUrl("");
    setNewDesc("");
  }

  function handleDeleteResource(id: string) {
    setResources(resources.filter((r) => r.id !== id));
  }

  function getTypeIcon(type: Resource["type"]) {
    switch (type) {
      case "slide":
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-500" />;
      case "video":
        return <Video className="w-5 h-5 text-purple-500" />;
      case "link":
        return <LinkIcon className="w-5 h-5 text-blue-500" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Upload Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Kho Tài Nguyên Học Tập</h3>
            <p className="text-xs text-muted-foreground">
              Đăng tải slide bài giảng, file PDF, giáo trình và tài liệu ôn tập cho từng lớp học
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 text-xs font-bold h-9 rounded-xl shadow-md shadow-primary/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Tải Lên Tài Liệu Mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
            <SelectTrigger className="h-9 w-44 text-xs rounded-xl">
              <SelectValue placeholder="Chọn lớp học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các lớp</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
            <SelectTrigger className="h-9 w-40 text-xs rounded-xl">
              <SelectValue placeholder="Loại tài liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại tài liệu</SelectItem>
              <SelectItem value="slide">Slide Bài Giảng</SelectItem>
              <SelectItem value="pdf">Tài Liệu PDF / Word</SelectItem>
              <SelectItem value="video">Video Bài Giảng</SelectItem>
              <SelectItem value="link">Liên kết Web</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm tài liệu, slide..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <Card className="p-12 text-center border border-border/80 rounded-2xl shadow-soft">
          <FolderArchive className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-base font-bold text-foreground">Chưa có tài liệu học tập nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Bấm nút "+ Tải Lên Tài Liệu Mới" để chia sẻ bài giảng và tài liệu với học sinh.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <Card
              key={res.id}
              className="border border-border/80 bg-card shadow-soft hover:shadow-card transition-all rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 shrink-0">
                    {getTypeIcon(res.type)}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 truncate max-w-[150px]">
                    {res.className}
                  </Badge>
                </div>

                <CardTitle className="text-sm font-bold text-foreground mt-3 leading-snug line-clamp-2">
                  {res.title}
                </CardTitle>
                {res.description && (
                  <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {res.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
                  <span className="font-mono">{res.createdAt}</span>
                  <span className="font-semibold">{res.size}</span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs gap-1.5 rounded-xl border-border hover:bg-muted"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Mở tài liệu
                    </Button>
                  </a>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteResource(res.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
                    title="Xóa tài liệu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tải Lên Tài Nguyên Mới</DialogTitle>
            <DialogDescription className="text-xs">
              Thêm slide bài giảng, bài tập hoặc tài liệu tham khảo cho lớp học
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddResource} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tên tài liệu / Slide bài giảng *</Label>
              <Input
                placeholder="VD: Slide Buổi 03: Ngữ pháp Thì Quá khứ Đơn"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Lớp học phụ trách *</Label>
              <Select value={newClassId} onValueChange={setNewClassId}>
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loại tài liệu</Label>
                <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                  <SelectTrigger className="h-9 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slide">Slide Bài Giảng</SelectItem>
                    <SelectItem value="pdf">File PDF / Word</SelectItem>
                    <SelectItem value="video">Video Hướng Dẫn</SelectItem>
                    <SelectItem value="link">Liên kết Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Đường dẫn tài liệu (Drive/URL)</Label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ghi chú / Hướng dẫn học viên</Label>
              <Input
                placeholder="VD: Đọc trước trang 12 đến 20 trước khi lên lớp"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" className="text-xs font-bold rounded-xl">
                Lưu Tài Liệu
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
