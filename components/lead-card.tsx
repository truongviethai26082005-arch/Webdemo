"use client";

import { Lead } from "@/types/admissions";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  // Semantic Colors mapped from state
  let statusColor = "bg-muted text-muted-foreground border-border";
  switch (lead.status) {
    case "Thành Công":
      statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
      break;
    case "Thất Bại":
      statusColor = "bg-destructive/10 text-destructive border-destructive/20";
      break;
    case "Đang Tư Vấn":
    case "Lịch Học Thử":
      statusColor = "bg-primary/10 text-primary border-primary/20";
      break;
    case "Lead Mới":
      statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      break;
  }

  return (
    <div
      onClick={() => onClick(lead)}
      className="bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm text-foreground">{lead.name}</h4>
        <Badge variant="outline" className={cn("text-[10px] font-medium border", statusColor)}>
          {lead.status}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{lead.createdAt}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-primary px-2 py-0.5 bg-primary/5 rounded-md">
          {lead.courseInterested}
        </span>
        <div className="text-[10px] flex items-center text-muted-foreground group-hover:text-primary transition-colors">
          Chi tiết <MoveRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </div>
  );
}
