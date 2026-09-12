"use client";

import { useState } from "react";
import { UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateAccountDialog } from "@/components/accounts/create-account-dialog";

interface AccountsClientProps {
  students: any[];
}

export function AccountsClient({ students }: AccountsClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-5 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Cấp tài khoản đăng nhập
          </CardTitle>
          <CardDescription className="text-xs">
            Dùng cho Admin, Tuyển sinh (Sale), hoặc gán tài khoản cho 1 học sinh đã có sẵn trong hệ thống.
            Tài khoản Giáo viên vẫn nên tạo ở trang "Đội ngũ Giáo viên" (có kèm lương/thù lao).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <Button onClick={() => setIsOpen(true)} className="gap-2 text-xs font-semibold">
            <UserPlus className="w-4 h-4" />
            + Tạo tài khoản mới
          </Button>
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
