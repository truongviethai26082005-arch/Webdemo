"use client";

import { Lead, LeadStatus } from "@/types/admissions";
import { LeadCard } from "./lead-card";

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function KanbanColumn({ status, leads, onLeadClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[320px] bg-muted/30 rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
        <h3 className="font-bold text-sm text-foreground">{status}</h3>
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
        {leads.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
            <span className="text-xs text-muted-foreground">Trống</span>
          </div>
        )}
      </div>
    </div>
  );
}
