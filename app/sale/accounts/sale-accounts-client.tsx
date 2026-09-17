"use client";

import { useState } from "react";
import { StudentAccountItem } from "@/lib/actions/accounts";
import { Student } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateStudentAccountDialog } from "@/components/sale/create-student-account-dialog";
import { ResetPasswordDialog } from "@/components/sale/reset-password-dialog";
import { KeyRound, UserPlus, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface SaleAccountsClientProps {
  studentAccounts: StudentAccountItem[];
  allStudents: Student[];
}

export function SaleAccountsClient({
  studentAccounts,
  allStudents,
}: SaleAccountsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<StudentAccountItem | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const filtered = studentAccounts.filter((acc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      acc.full_name.toLowerCase().includes(q) ||
      (acc.email && acc.email.toLowerCase().includes(q)) ||
      (acc.parent_phone && acc.parent_phone.includes(q))
    );
  });

  const handleRefresh = () => {
    router.refresh();
  };

  const handleOpenReset = (acc: StudentAccountItem) => {
    setResetTarget(acc);
    setResetOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-200 dark:border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-bold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Quản Trị Tài Khoản Học Sinh &amp; Hỗ Trợ Phụ Huynh
          </div>
          <p className="text-xs text-muted-foreground">
            Chuyên viên Tuyển sinh chủ động cấp tài khoản và đặt lại mật khẩu cho học sinh/phụ huynh khi cần hỗ trợ đăng nhập vào LMS.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="text-xs font-bold gap-1.5 shrink-0 bg-primary text-primary-foreground shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Cấp tài khoản mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="relative min-w-[260px] max-w-md flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên học sinh, email, SĐT phụ huynh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 rounded-xl"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Đã cấp: <strong className="text-foreground">{studentAccounts.length}</strong> / {allStudents.length} học sinh
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
              <TableHead className="font-bold">Họ và tên học sinh</TableHead>
              <TableHead className="font-bold">Email đăng nhập</TableHead>
              <TableHead className="font-bold">SĐT phụ huynh</TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                  Không tìm thấy tài khoản học sinh nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((acc) => (
                <TableRow key={acc.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-bold text-foreground">{acc.full_name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{acc.email || "—"}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{acc.parent_phone || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenReset(acc)}
                    >
                      <KeyRound className="w-3 h-3 text-primary" />
                      Đặt lại mật khẩu
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <CreateStudentAccountDialog
        students={allStudents}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleRefresh}
      />

      <ResetPasswordDialog
        target={resetTarget}
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open);
          if (!open) setResetTarget(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
