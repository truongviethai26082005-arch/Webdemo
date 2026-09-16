"use client";

import { useState } from "react";
import { Lead, Class } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CenterBankSettings, formatVND } from "@/lib/utils/vietqr";
import { ConversionCheckoutModal } from "@/components/sale/conversion-checkout-modal";
import { Sparkles, QrCode, Award, CheckCircle2, UserCheck, Phone } from "lucide-react";

interface ConversionsTabProps {
  leads: Lead[];
  classes: Class[];
  bankSettings: CenterBankSettings;
  onRefresh: () => void;
  checkoutLead?: Lead | null;
  onClearCheckoutLead?: () => void;
}

export function ConversionsTab({
  leads,
  classes,
  bankSettings,
  onRefresh,
  checkoutLead,
  onClearCheckoutLead,
}: ConversionsTabProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(checkoutLead || null);
  const [modalOpen, setModalOpen] = useState(Boolean(checkoutLead));

  // Lọc các lead ở stage = 'conversion' hoặc đã test điểm
  const readyLeads = leads.filter(
    (l) => l.stage === "conversion" || (l.test_score !== null && l.test_score !== undefined)
  );

  const handleOpenCheckout = (lead: Lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedLead(null);
      onClearCheckoutLead?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-emerald-500/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-bold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Giai Đoạn Ghi Danh &amp; Chốt Gói Học Phí
          </div>
          <p className="text-xs text-muted-foreground">
            Áp dụng quy tắc <strong>Tách 2 Bước</strong>: Ghi nhận nộp tiền vào hệ thống Admin ngay lập tức, sau đó xếp lớp linh hoạt hoặc đưa vào danh sách chờ.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Sẵn sàng chốt</div>
            <div className="text-lg font-black text-primary">{readyLeads.length}</div>
          </div>
          <div className="h-6 w-[1px] bg-border" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Đã chốt xong</div>
            <div className="text-lg font-black text-emerald-600">
              {leads.filter((l) => l.stage === "enrolled" || l.stage === "waiting_class").length}
            </div>
          </div>
        </div>
      </div>

      {/* Table of Ready Leads */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
              <TableHead className="font-bold">Học sinh &amp; Phụ huynh</TableHead>
              <TableHead className="font-bold">Phụ trách</TableHead>
              <TableHead className="font-bold">SĐT liên hệ</TableHead>
              <TableHead className="font-bold">Môn học quan tâm</TableHead>
              <TableHead className="font-bold">Điểm &amp; Xếp loại học thử</TableHead>
              <TableHead className="font-bold">Giai đoạn</TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readyLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                  Chưa có học sinh nào sẵn sàng chốt gói. Hãy hoàn tất đánh giá học thử ở tab "Học thử" để chuyển qua đây!
                </TableCell>
              </TableRow>
            ) : (
              readyLeads.map((lead) => {
                const isConverted = lead.stage === "enrolled" || lead.stage === "waiting_class";
                return (
                  <TableRow key={lead.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <div className="font-bold text-foreground">{lead.full_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {lead.grade ? `${lead.grade} • ` : ""}
                        Phụ huynh: {lead.parent_name || "—"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-[11px] font-semibold text-foreground">
                        {lead.assigned_sale?.full_name || "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono font-semibold text-foreground">{lead.phone}</span>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {lead.course_interest || "Chưa rõ"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{lead.target_goal || "—"}</div>
                    </TableCell>

                    <TableCell>
                      {lead.test_score !== null && lead.test_score !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-bold text-xs bg-muted/40">
                            {lead.test_score} điểm
                          </Badge>
                          <span className="text-[11px] text-muted-foreground capitalize">
                            {lead.trial_result || ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Chưa kiểm tra</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isConverted ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200 text-[10px]">
                          {lead.stage === "enrolled" ? "N3. ✓ Đã vào lớp" : "N3. ⏳ Chờ xếp lớp"}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-200 text-[10px]">
                          N2. Chờ chốt (sau học thử)
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {isConverted ? (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hoàn tất
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="text-[11px] h-8 font-bold gap-1.5 bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xs"
                          onClick={() => handleOpenCheckout(lead)}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Chốt học &amp; VietQR
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Chốt Đơn & Xuất VietQR */}
      <ConversionCheckoutModal
        lead={selectedLead}
        classes={classes}
        bankSettings={bankSettings}
        open={modalOpen}
        onOpenChange={handleCloseModal}
        onSuccess={() => {
          onRefresh();
          handleCloseModal(false);
        }}
      />
    </div>
  );
}
