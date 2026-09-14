"use client";

import { useState } from "react";
import { Plus, CheckSquare, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import NewTaskDialog from "@/features/tasks/components/new-task-dialog";
import SuccessModal from "@/components/shared/success-modal";
import { cn } from "@/lib/utils";
import ViewTaskDialog, { TaskItem } from "./view-task-dialog";

interface TasksTabProps {
  clientId?: string;
  clientName?: string;
  tasks: TaskItem[];
  isLoading?: boolean;
}

export default function TasksTab({ clientId, clientName, tasks = [], isLoading = false }: TasksTabProps) {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (isLoading) {
    return (
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
        <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
          <div className="w-[180px] h-6 bg-[#4A5D6E] animate-pulse rounded-[6px]"></div>
          <div className="w-[130px] h-8 bg-[#4A5D6E] animate-pulse rounded-[12px]"></div>
        </div>
        <div className="flex flex-col w-full">
          <div className="h-10 border-b border-white/10 w-full px-6 flex items-center gap-6">
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-24 h-4 bg-[#192430] animate-pulse rounded-[4px]"></div>
            <div className="w-16 h-4 bg-[#192430] animate-pulse rounded-[4px] ml-auto"></div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-white/10 w-full px-6 flex items-center gap-6">
              <div className="w-full h-5 bg-[#192430] animate-pulse rounded-[6px]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
      {/* Header Row (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight">
          Tasks
        </h3>
        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="h-8 px-3.5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full">
          <TableHeader className="bg-transparent border-b border-white/10">
            <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Title
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Description
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Due
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Priority
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans">
                Status
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6 font-sans text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <EmptyState 
                    icon={CheckSquare}
                    title="No tasks found"
                    className="py-6 border-0 bg-transparent min-h-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              safeTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <TableCell className="px-6 py-3.5 text-sm font-medium text-white max-w-[200px] truncate">
                    {task.title}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-[#919191] max-w-[260px] truncate" title={task.description}>
                    {task.description || "--"}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white whitespace-nowrap">
                    {task.due}
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                        task.priorityStyle
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <Badge
                      className={cn(
                        "px-2.5 py-0.5 rounded-[8px] text-xs font-medium capitalize",
                        task.statusStyle
                      )}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="px-6 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      title="View Task Details"
                      className="w-8 h-8 inline-flex items-center justify-center rounded-[6px] bg-[#2B343D] text-[#919191] hover:text-white hover:bg-[#394551] transition-colors cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Task Dialog (Full Details & Description) */}
      <ViewTaskDialog
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        clientName={clientName}
      />

      {/* New Task Dialog (pre-selected for this client) */}
      <NewTaskDialog
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        defaultClient={clientId ? { id: clientId, name: clientName || "" } : undefined}
        onSuccess={() => setIsSuccessOpen(true)}
      />

      {/* Reusable Success Popup Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Task Created!"
        description="Your new task has been created successfully!"
      />
    </div>
  );
}
