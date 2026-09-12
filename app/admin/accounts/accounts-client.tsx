"use client";

import { useState } from "react";
import { UserPlus, KeyRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateAccountDialog } from "@/components/accounts/create-account-dialog";
import type { AccountListItem } from "@/lib/actions/accounts";

interface AccountsClientProps {
  students: any[];
  accounts: AccountListItem[];
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  sale: "Tuyển sinh",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function AccountsClient({ students, accounts }: AccountsClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const studentsWithLogin = (students || []).filter((s: any) => s.auth_user_id);

  return (
    <div className="space-y-6">
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-5 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Tài khoản nhân sự nội bộ
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Admin, Giáo viên, Tuyển sinh — {accounts.length} tài khoản
              </CardDescription>
            </div>
            <Button onClick={() => setIsOpen(true)} className="gap-2 text-xs font-semibold shrink-0">
              <UserPlus className="w-4 h-4" />
              + Tạo tài khoản mới
            </Button>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email đăng nhập</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                  Chưa có tài khoản nào
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-semibold text-xs text-foreground">{acc.full_name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{acc.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {ROLE_LABEL[acc.role] || acc.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{acc.phone || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(acc.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-5 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Học sinh đã có tài khoản đăng nhập
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {studentsWithLogin.length} / {students.length} học sinh đã được cấp tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {studentsWithLogin.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có học sinh nào được cấp tài khoản đăng nhập.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studentsWithLogin.map((s: any) => (
                <Badge key={s.id} variant="outline" className="text-xs py-1 px-2.5">
                  {s.full_name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAccountDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        students={students}
      />
    </div>
  );
}
