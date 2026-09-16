"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap, CheckCircle } from "lucide-react";

export interface AIFeatureDetail {
  id: string;
  title: string;
  badge: "Beta" | "Sắp ra mắt";
  iconName: string;
  description: string;
  highlight: string;
  benefits: string[];
}

interface AIHubPreviewModalProps {
  feature: AIFeatureDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLeadModal: () => void;
}

export function AIHubPreviewModal({
  feature,
  open,
  onOpenChange,
  onOpenLeadModal,
}: AIHubPreviewModalProps) {
  if (!feature) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

        <div className="p-6 sm:p-7 space-y-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EduCenter AI-Hub</span>
              </div>
              <Badge
                variant="outline"
                className={
                  feature.badge === "Beta"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-xs font-bold"
                }
              >
                {feature.badge}
              </Badge>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {feature.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/15 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Giá trị thực tế mang lại</span>
            </div>
            <p className="text-xs text-foreground font-medium">
              {feature.highlight}
            </p>
            <div className="space-y-1.5 pt-1">
              {feature.benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-2.5">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => {
                  onOpenLeadModal();
                }, 150);
              }}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Đăng ký Trải nghiệm Trước Tính năng này
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 rounded-xl text-xs font-medium"
            >
              Đóng xem sau
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
