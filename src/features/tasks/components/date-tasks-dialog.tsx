"use client";

import { Calendar as CalendarIcon, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface DateTasksDialogProps {
  dateString: string | null;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTaskForDate: (dateStr: string) => void;
}

export default function DateTasksDialog({
  dateString,
  tasks,
  isOpen,
  onClose,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onAddNewTaskForDate,
}: DateTasksDialogProps) {
  if (!dateString) return null;

  const renderPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "Urgent":
        return (
          <Badge className="bg-[#FF0000] text-white font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0">
            Urgent
          </Badge>
        );
      case "High":
        return (
          <Badge className="bg-[#FFB302] text-[#181818] font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0">
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-[#33BBFF] text-white font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-[#CACACA] text-[#181818] font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0">
            Low
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0C1116] border border-white/10 text-white sm:max-w-[550px] p-7 rounded-[12px] shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-[#6887A0]" />
            <DialogTitle className="text-xl font-bold text-white tracking-tight font-sans">
              Tasks for {dateString}
            </DialogTitle>
          </div>

          <Button
            type="button"
            onClick={() => {
              onClose();
              onAddNewTaskForDate(dateString);
            }}
            className="h-8 px-3 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Button>
        </DialogHeader>

        <div className="space-y-3 py-3 max-h-[420px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
              <CalendarIcon className="w-10 h-10 text-[#919191] opacity-60" />
              <p className="text-sm text-white font-medium">No tasks scheduled for this date</p>
              <p className="text-xs text-[#919191]">Click "Add Task" above to create a task due on {dateString}.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => {
                  onClose();
                  onSelectTask(task);
                }}
                className="bg-[#141C24] rounded-[10px] p-3.5 border border-white/10 hover:border-[#66859E]/40 transition-all flex flex-col gap-2 cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#849EB2] transition-colors leading-tight">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {renderPriorityBadge(task.priority)}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wider",
                        task.status === "To do" && "bg-[#FF3E46]/10 text-[#FF3E46] border border-[#FF3E46]/30",
                        task.status === "In progress" && "bg-[#FF9D00]/10 text-[#FF9D00] border border-[#FF9D00]/30",
                        task.status === "Done" && "bg-[#42CD7F]/10 text-[#42CD7F] border border-[#42CD7F]/30"
                      )}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#919191] line-clamp-2 leading-relaxed">
                  {task.description}
                </p>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#919191]">
                  <span>Client: {task.client?.name || "General Client"}</span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditTask(task);
                      }}
                      className="p-1 rounded text-[#919191] hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Task"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (task._id) onDeleteTask(task._id);
                      }}
                      className="p-1 rounded text-[#919191] hover:text-[#FF3E46] hover:bg-white/10 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
