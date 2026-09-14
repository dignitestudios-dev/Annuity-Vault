"use client";

import { Calendar as CalendarIcon, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  due: string;
  priority: string;
  priorityStyle: string;
  status: string;
  statusStyle: string;
  clientName?: string;
}

interface ViewTaskDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export default function ViewTaskDialog({
  task,
  isOpen,
  onClose,
  clientName,
}: ViewTaskDialogProps) {
  if (!task) return null;

  const displayClientName = task.clientName || clientName;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C1116] border border-white/10 text-white sm:max-w-[525px] rounded-[12px] shadow-2xl">
        <DialogHeader className="pb-2 space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                task.priorityStyle
              )}
            >
              {task.priority}
            </Badge>
            <Badge
              className={cn(
                "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                task.statusStyle
              )}
            >
              {task.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans leading-snug">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Details Metadata Grid */}
          <div
            className={cn(
              "grid gap-3 bg-[#141C24] p-3.5 rounded-[12px] border border-white/5",
              displayClientName ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-[#6887A0]" />
              <div>
                <p className="text-[11px] text-[#919191]">Due Date</p>
                <p className="text-xs sm:text-sm font-medium text-white">
                  {task.due || "N/A"}
                </p>
              </div>
            </div>

            {displayClientName && (
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#6887A0]" />
                <div>
                  <p className="text-[11px] text-[#919191]">Client</p>
                  <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[150px]">
                    {displayClientName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Full Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider text-[#919191]">
              Full Description
            </h4>
            <div className="bg-[#141C24] p-3.5 rounded-[12px] border border-white/5 min-h-[90px]">
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 flex items-center justify-end w-full border-t border-white/10">
          <Button
            type="button"
            onClick={onClose}
            className="h-10 px-6 bg-[#2B343D] hover:bg-[#394551] text-white rounded-[12px] text-xs font-medium border-0 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
