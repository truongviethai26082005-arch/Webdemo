"use client";

import { useState } from "react";
import { Lead, LeadStatus } from "@/types/admissions";
import { MOCK_LEADS } from "./mock-data";
import { KanbanColumn } from "./kanban-column";
import { LeadDetailDrawer } from "./lead-detail-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

const COLUMNS: LeadStatus[] = [
  "Lead Mới",
  "Đang Tư Vấn",
  "Lịch Học Thử",
  "Thành Công",
  "Thất Bại"
];

export function AdmissionsBoard() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesAssignee = assigneeFilter === "all" || lead.assignee === assigneeFilter;

    return matchesSearch && matchesSource && matchesAssignee;
  });

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Filter Bar */}
      <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div className="flex flex-1 w-full gap-3 flex-col sm:flex-row">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border"
            />
          </div>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px] bg-background/50 border-border">
              <SelectValue placeholder="Nguồn khách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Zalo">Zalo</SelectItem>
              <SelectItem value="Điền Form">Điền Form</SelectItem>
              <SelectItem value="Giới thiệu">Giới thiệu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[180px] bg-background/50 border-border">
              <SelectValue placeholder="Sales phụ trách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Sales</SelectItem>
              <SelectItem value="Trần Sales">Trần Sales</SelectItem>
              <SelectItem value="Lê Sales">Lê Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md shadow-primary/25 font-bold whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> Thêm Lead Mới
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-h-0 items-stretch w-max pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={filteredLeads.filter(l => l.status === status)}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
