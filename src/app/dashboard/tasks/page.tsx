"use client";

import { useState } from "react";
import { Plus, Search, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DeleteModal from "@/components/shared/delete-modal";
import SuccessModal from "@/components/shared/success-modal";
import { cn } from "@/lib/utils";

const INITIAL_TASKS = [
  {
    id: "t1",
    title: "Schedule annual review meeting",
    client: "Jacob Thompson",
    due: "2026-06-14",
    priority: "Medium",
    priorityStyle: "bg-[#33BBFF] text-white border-0",
    status: "In Progress",
    statusStyle: "bg-[#FF9D00] text-black border-0 font-semibold",
  },
  {
    id: "t2",
    title: "Follow up on 1035 exchange paperwork",
    client: "Eleanor Vance",
    due: "2026-06-20",
    priority: "High",
    priorityStyle: "bg-[#FF3E46] text-white border-0",
    status: "Pending",
    statusStyle: "bg-[#FFE600] text-black border-0 font-semibold",
  },
  {
    id: "t3",
    title: "Send beneficiary update forms",
    client: "Marcus Brody",
    due: "2026-07-01",
    priority: "Low",
    priorityStyle: "bg-[#42CD7F] text-white border-0",
    status: "Completed",
    statusStyle: "bg-[#42CD7F] text-white border-0",
  },
];

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tasksList, setTasksList] = useState(INITIAL_TASKS);

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const filteredTasks = tasksList.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const confirmDeleteTask = () => {
    if (deletingTaskId) {
      setTasksList(tasksList.filter((t) => t.id !== deletingTaskId));
      setDeletingTaskId(null);
      setIsSuccessOpen(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-7 h-7 text-[#6887A0]" />
          <h1 className="text-2xl lg:text-[32px] font-semibold text-white tracking-tight leading-tight">
            Tasks Management
          </h1>
        </div>

        <button className="h-9 px-4 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-90 rounded-[12px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter & Search Header (#394A58) */}
      <div className="w-full bg-[#394A58] p-3 rounded-[12px] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-[12px] border-0 text-white text-xs w-full max-w-[400px]">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-transparent text-xs text-white placeholder-[#919191] outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <Select value={priorityFilter} onValueChange={(val: string | null) => setPriorityFilter(val || "all")}>
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal min-w-[130px] justify-between shadow-none">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                All priorities
              </SelectItem>
              <SelectItem value="High" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                High
              </SelectItem>
              <SelectItem value="Medium" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Medium
              </SelectItem>
              <SelectItem value="Low" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Low
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val: string | null) => setStatusFilter(val || "all")}>
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-[12px] text-xs font-normal min-w-[130px] justify-between shadow-none">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-[12px]">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                All statuses
              </SelectItem>
              <SelectItem value="In Progress" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                In Progress
              </SelectItem>
              <SelectItem value="Pending" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Pending
              </SelectItem>
              <SelectItem value="Completed" className="text-white hover:bg-white/10 cursor-pointer text-xs">
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="w-full bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader className="bg-[#394A58] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent h-10">
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Title
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Client
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Due Date
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Priority
                </TableHead>
                <TableHead className="text-white font-medium text-xs sm:text-sm h-10 px-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors h-14"
                >
                  <TableCell className="px-6 py-3.5 text-sm font-medium text-white">
                    {task.title}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-sm text-white">
                    {task.client}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
      />

      {/* Success Popup */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Task Deleted!"
        description="The task has been deleted successfully."
      />
    </div>
  );
}
