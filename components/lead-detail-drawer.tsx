"use client";

import { Lead } from "@/types/admissions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Receipt, Phone, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailDrawer({ lead, isOpen, onClose }: LeadDetailDrawerProps) {
  if (!lead) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full bg-card sm:max-w-md w-full p-0 border-l border-border/80">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex justify-between items-start gap-4">
            <div>
              <SheetTitle className="text-xl font-bold">{lead.name}</SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {lead.phone}
              </SheetDescription>
            </div>
            <Badge variant="secondary" className="font-semibold text-xs py-1 px-2 border-primary/20 text-primary bg-primary/10">
              {lead.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Section */}
          <section className="space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Nguồn khách</span>
                <p className="font-medium text-foreground">{lead.source}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Sales phụ trách</span>
                <p className="font-medium text-foreground">{lead.assignee}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-muted-foreground text-xs">Khóa học quan tâm</span>
                <p className="font-medium text-primary">{lead.courseInterested}</p>
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Lịch sử chăm sóc
            </h4>
            <div className="space-y-4 pl-2 border-l-2 border-border/50 ml-2">
              {lead.history.map((item, idx) => (
                <div key={item.id} className="relative pl-4">
                  <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1.5 ring-4 ring-card" />
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">{item.user}</span>
                      <span className="text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <SheetFooter className="p-4 border-t border-border/50 bg-muted/20 mt-auto flex-col sm:flex-col gap-2">
          <Button variant="outline" className="w-full flex justify-start items-center gap-2 text-blue-500 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 font-semibold h-11">
            <MessageCircle className="w-4 h-4" /> Gửi tin nhắn Zalo
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:text-primary h-11">
              <Calendar className="w-4 h-4 mr-2" /> Xếp lịch học
            </Button>
            <Button className="flex-1 font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md shadow-primary/25 h-11">
              <Receipt className="w-4 h-4 mr-2" /> Tạo hóa đơn
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
