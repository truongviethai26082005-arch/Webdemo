"use client";

import { useState } from "react";
import { FastLeadIntakeModal } from "@/components/sale/fast-lead-intake-modal";
import { Zap, Plus } from "lucide-react";

export function FastLeadIntakeFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
        title="Thêm nhanh khách hàng mới (Hotline/Zalo)"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all"
      >
        <Zap className="w-4 h-4" />
        <span>+ Thêm nhanh Lead</span>
      </button>

      <FastLeadIntakeModal open={open} onOpenChange={setOpen} />
    </>
  );
}
