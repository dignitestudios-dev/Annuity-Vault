"use client";

import { Plus, CheckSquare } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  due: string;
  priority: string;
  priorityStyle: string;
  status: string;
  statusStyle: string;
}

interface TasksTabProps {
  tasks: TaskItem[];
}

export default function TasksTab({ tasks }: TasksTabProps) {
  return (
    <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
      {/* Header Row (#394A58) */}
      <div className="h-[65px] bg-[#394A58] px-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg lg:text-xl font-semibold text-white tracking-tight">
          Tasks
        </h3>
        <button className="h-8 px-3.5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white font-medium hover:opacity-90 rounded-[12px] text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm">
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full">
          <TableHeader className="bg-transparent border-b border-white/10">
            <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Title
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Due
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Priority
              </TableHead>
              <TableHead className="text-[#8C8C8C] font-medium text-xs sm:text-sm h-10 px-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12">
                  <EmptyState 
                    icon={CheckSquare}
                    title="No tasks found"
                    className="py-6 border-0 bg-transparent min-h-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14"
                >
                  <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                    {task.title}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
