"use client";

import { Calendar as CalendarIcon, User, UserCheck, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskItem } from "./new-task-dialog";
import { cn } from "@/lib/utils";

interface TaskDetailsDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailsDialog({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailsDialogProps) {
  if (!task) return null;

  const renderPriorityBadge = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "Urgent":
        return (
          <Badge className="bg-[#FF0000] text-white font-medium text-xs px-3 py-1 rounded-[8px] border-0">
            Urgent
          </Badge>
        );
      case "High":
        return (
          <Badge className="bg-[#FFB302] text-[#181818] font-medium text-xs px-3 py-1 rounded-[8px] border-0">
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-[#33BBFF] text-white font-medium text-xs px-3 py-1 rounded-[8px] border-0">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-[#CACACA] text-[#181818] font-medium text-xs px-3 py-1 rounded-[8px] border-0">
            Low
          </Badge>
        );
    }
  };

  const renderStatusBadge = (status: TaskItem["status"]) => {
    return (
      <span
        className={cn(
          "px-3 py-1 rounded-[8px] text-xs font-medium inline-block",
          status === "To do" && "bg-[#FF3E46]/10 border border-[#FF3E46] text-[#FF3E46]",
          status === "In progress" && "bg-[#FF9D00]/10 border border-[#FF9D00] text-[#FF9D00]",
          status === "Done" && "bg-[#42CD7F]/10 border border-[#42CD7F] text-[#42CD7F]"
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C1116] border border-white/10 text-white sm:max-w-[525px] p-7 rounded-[12px] shadow-2xl">
        <DialogHeader className="pb-2 space-y-3">
          <div className="flex items-center gap-2">
            {renderPriorityBadge(task.priority)}
            {renderStatusBadge(task.status)}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans leading-snug">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Details Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#141C24] p-3.5 rounded-[12px] border border-white/5">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-[#6887A0]" />
              <div>
                <p className="text-[11px] text-[#919191]">Due Date</p>
                <p className="text-xs sm:text-sm font-medium text-white">{task.due}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-[#6887A0]" />
              <div>
                <p className="text-[11px] text-[#919191]">Assigned To</p>
                <p className="text-xs sm:text-sm font-medium text-white">{task.assignedTo || "Jordan Reed"}</p>
              </div>
            </div>

            {task.client && (
              <div className="flex items-center gap-2.5 col-span-2 pt-2 border-t border-white/5">
                <User className="w-4 h-4 text-[#6887A0]" />
                <div>
                  <p className="text-[11px] text-[#919191]">Client</p>
                  <p className="text-xs sm:text-sm font-medium text-white">{task.client}</p>
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
                {task.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 flex flex-row items-center justify-between gap-3 w-full border-t border-white/10 sm:justify-between">
          <Button
            type="button"
            onClick={() => {
              onClose();
              onDelete(task.id);
            }}
            className="h-10 px-4 bg-[#FF0000] hover:bg-red-600 text-white rounded-[12px] text-xs font-medium border-0 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-[#2B343D] hover:bg-[#394551] text-white rounded-[12px] text-xs font-medium border-0 cursor-pointer"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="h-10 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] hover:opacity-95 text-white rounded-[12px] text-xs font-medium border-0 flex items-center gap-2 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-white" />
              <span>Edit Task</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
