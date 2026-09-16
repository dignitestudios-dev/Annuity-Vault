"use client";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, FileText, Download, Calendar as CalendarIcon, List as ListIcon, LayoutGrid, Pencil, Trash2, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import NewTaskDialog from "@/features/tasks/components/new-task-dialog";
import { Task } from "@/features/tasks/types/tasks.types";
import { useInfiniteTasks, useUpdateTask, useDeleteTask, exportTasks } from "@/features/tasks/api/tasks.service";
import { format, parseISO } from "date-fns";
import EditTaskDialog from "@/features/tasks/components/edit-task-dialog";
import TaskDetailsDialog from "@/features/tasks/components/task-details-dialog";
import DateTasksDialog from "@/features/tasks/components/date-tasks-dialog";
import KanbanView from "@/features/tasks/components/kanban-view";
import SuccessModal from "@/components/shared/success-modal";
import DeleteModal from "@/components/shared/delete-modal";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import toast from "react-hot-toast";

// Seed initial task items matching the Figma design screenshot accurately

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function TasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as "kanban" | "list" | "calendar" | null;
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"kanban" | "list" | "calendar">(
    tabParam && ["kanban", "list", "calendar"].includes(tabParam) ? tabParam : "kanban"
  );

  // Month Navigation State
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => new Date().getMonth());

  const {
    data: infiniteTasksData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteTasks({
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    priority: priorityFilter !== "all" ? (priorityFilter as any) : undefined,
  });
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const tasksList: Task[] = useMemo(() => {
    return infiniteTasksData?.pages.flatMap((page) => page.data) || [];
  }, [infiniteTasksData]);

  const totalItems = infiniteTasksData?.pages[0]?.pagination?.totalItems ?? tasksList.length;

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentEl = loadMoreRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Synchronize activeTab when tabParam in searchParams updates
  useEffect(() => {
    if (tabParam && ["kanban", "list", "calendar"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: "kanban" | "list" | "calendar") => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Modal / Dialog States
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskInitialDate, setNewTaskInitialDate] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDetailsTask, setSelectedDetailsTask] = useState<Task | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  // Navigation Handlers for Months
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  // Task Status Transition Handler (with optimistic updates via useUpdateTask)
  const handleMoveStatus = (id: string, newStatus: "To Do" | "In Progress" | "Done") => {
    updateTaskMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update task status");
        },
      }
    );
  };

  // Add Task Handler
  const handleAddTask = () => {
    refetch();
    setFeedbackModal({
      isOpen: true,
      title: "Task Created!",
      desc: "You have successfully created the task!",
    });
  };

  // Update Task Handler
  const handleUpdateTask = () => {
    refetch();
    setEditingTask(null);
    setFeedbackModal({
      isOpen: true,
      title: "Task Updated!",
      desc: "The task details have been updated successfully.",
    });
  };


  // Confirm Delete Task Handler
  const confirmDeleteTask = () => {
    if (deletingTaskId) {
      deleteTaskMutation.mutate(deletingTaskId, {
        onSuccess: () => {
          refetch();
          setDeletingTaskId(null);
        }
      });
    }
  };

  // Filter tasks based on search, status, priority
  const filteredTasks = tasksList.filter((task) => {
    const clientMatch = task.client && `${task.client.firstName || ""} ${task.client.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientMatch;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Helper for priority badge rendering
  const renderPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "Urgent":
        return (
          <Badge className="bg-[#FF0000] text-white font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0 hover:bg-[#FF0000]">
            Urgent
          </Badge>
        );
      case "High":
        return (
          <Badge className="bg-[#FFB302] text-[#181818] font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0 hover:bg-[#FFB302]">
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-[#33BBFF] text-white font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0 hover:bg-[#33BBFF]">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-[#CACACA] text-[#181818] font-medium text-[11px] px-2.5 py-0.5 rounded-[8px] border-0 hover:bg-[#CACACA]">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  // Calendar Days Calculation
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun, 1 = Mon...

  // Format month string e.g. "2026-06"
  const formattedMonthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}`;

  return (
    <div className="w-full flex flex-col gap-5 max-w-[1440px] mx-auto pb-12 font-sans">
      {/* 1. Top Header Row (Title & Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-white tracking-tight leading-tight">
          Task Management
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={async () => {
              await exportTasks(
                "pdf",
                searchTerm || undefined,
                statusFilter !== "all" ? statusFilter : undefined,
                priorityFilter !== "all" ? priorityFilter : undefined
              );
              setFeedbackModal({
                isOpen: true,
                title: "PDF Export Complete",
                desc: "Your task management overview has been downloaded as a PDF report.",
              });
            }}
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#919191]" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={async () => {
              await exportTasks(
                "csv",
                searchTerm || undefined,
                statusFilter !== "all" ? statusFilter : undefined,
                priorityFilter !== "all" ? priorityFilter : undefined
              );
              setFeedbackModal({
                isOpen: true,
                title: "CSV Export Complete",
                desc: "Your task records have been exported to CSV format successfully.",
              });
            }}
            className="h-10 px-4 bg-[#141C24] hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#919191]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="h-10 px-5 bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white hover:opacity-95 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar (#394A58 Container) */}
      <div className="w-full bg-[#394A58] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 bg-[#141C24] rounded-xl text-white text-xs sm:text-sm flex-1 min-w-[240px] max-w-[738px]">
          <Search className="w-4 h-4 text-[#919191] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#919191] outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val: string | null) => setStatusFilter(val || "all")}
          >
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-xl text-xs sm:text-sm font-normal min-w-[140px] justify-between shadow-none focus:ring-0">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-xl">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                All Statuses
              </SelectItem>
              <SelectItem value="To Do" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                To Do
              </SelectItem>
              <SelectItem value="In Progress" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                In Progress
              </SelectItem>
              <SelectItem value="Done" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                Done
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onValueChange={(val: string | null) => setPriorityFilter(val || "all")}
          >
            <SelectTrigger className="h-10 px-3.5 bg-[#141C24] border-0 text-white rounded-xl text-xs sm:text-sm font-normal min-w-[140px] justify-between shadow-none focus:ring-0">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-[#141C24] border border-white/10 text-white rounded-xl">
              <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                All Priorities
              </SelectItem>
              <SelectItem value="Urgent" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                Urgent
              </SelectItem>
              <SelectItem value="High" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                High
              </SelectItem>
              <SelectItem value="Medium" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                Medium
              </SelectItem>
              <SelectItem value="Low" className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm">
                Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. View Switcher Tabs (Kanban, List, Calendar) + Priority Legend for Calendar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="bg-[#394A58] p-1 rounded-xl flex items-center gap-1 w-fit">
          <button
            onClick={() => handleTabChange("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer",
              activeTab === "kanban"
                ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                : "text-[#919191] hover:text-white"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => handleTabChange("list")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer",
              activeTab === "list"
                ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                : "text-[#919191] hover:text-white"
            )}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>List</span>
          </button>

          <button
            onClick={() => handleTabChange("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer",
              activeTab === "calendar"
                ? "bg-gradient-to-r from-[#66859E] to-[#849EB2] text-white shadow-sm"
                : "text-[#919191] hover:text-white"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>

        {/* Calendar View Legend */}
        {activeTab === "calendar" && (
          <div className="flex items-center gap-4 text-xs font-medium text-[#919191]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span>
              <span className="text-white">Urgent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB302]"></span>
              <span className="text-white">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#33BBFF]"></span>
              <span className="text-white">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CACACA]"></span>
              <span className="text-white">Low</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Tab Content Area */}
      {/* KANBAN VIEW TAB */}
      {activeTab === "kanban" && (
        <div className="w-full flex flex-col gap-4">
          <KanbanView
            tasks={filteredTasks}
            onMoveStatus={handleMoveStatus}
            onEditTask={setEditingTask}
            onDeleteTask={setDeletingTaskId}
            onSelectTask={setSelectedDetailsTask}
          />

          {/* Scroll / Load More trigger for Kanban */}
          {hasNextPage && (
            <div className="mt-4 flex flex-col items-center justify-center gap-2 py-2">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-xs text-[#919191]">
                  <Loader className="w-4 h-4 text-white" />
                  <span>Loading more tasks...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  className="h-8 px-4 bg-[#202B36] hover:bg-[#2A3745] text-white text-xs font-medium rounded-lg transition-colors border border-white/10 cursor-pointer"
                >
                  Load More Tasks ({totalItems - tasksList.length} remaining)
                </button>
              )}
            </div>
          )}
          <div ref={activeTab === "kanban" ? loadMoreRef : undefined} className="h-4 w-full" />
        </div>
      )}

      {/* LIST VIEW TAB CONTENT */}
      {activeTab === "list" && (
        <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl overflow-hidden shadow-sm mt-1">
          <div className="overflow-x-auto w-full">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-[#394A58] border-b border-white/10">
                <TableRow className="border-b border-white/10 hover:bg-transparent h-[40px]">
                  <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[40%]">
                    Title
                  </TableHead>
                  <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[18%]">
                    Due
                  </TableHead>
                  <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[16%]">
                    Priority
                  </TableHead>
                  <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 w-[14%]">
                    Status
                  </TableHead>
                  <TableHead className="text-white font-medium text-xs sm:text-sm px-6 py-2 text-right w-[12%]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task._id}
                    className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors h-[66px] cursor-pointer"
                    onClick={() => setSelectedDetailsTask(task)}
                  >
                    <TableCell className="px-6 py-2.5 max-w-[320px] sm:max-w-[420px]">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-medium text-white leading-snug break-words">
                          {task.title}
                        </span>
                        <span className="text-[12px] text-[#919191] font-normal leading-relaxed break-words whitespace-pre-line mt-0.5">
                          {task.description || "No description provided."}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-2.5 text-xs sm:text-sm text-white font-normal whitespace-nowrap">
                      {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "N/A"}
                    </TableCell>

                    <TableCell className="px-6 py-2.5 whitespace-nowrap">
                      {renderPriorityBadge(task.priority)}
                    </TableCell>

                    <TableCell className="px-6 py-2.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-[8px] text-[12px] font-medium capitalize inline-block",
                          task.status === "To Do" && "bg-[#FF3E46]/10 border border-[#FF3E46] text-[#FF3E46]",
                          task.status === "In Progress" && "bg-[#FF9D00]/10 border border-[#FF9D00] text-[#FF9D00]",
                          task.status === "Done" && "bg-[#42CD7F]/10 border border-[#42CD7F] text-[#42CD7F]"
                        )}
                      >
                        {task.status}
                      </span>
                    </TableCell>

                    <TableCell
                      className="px-6 py-2.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingTask(task)}
                          title="Edit Task"
                          className="w-9 h-9 flex items-center justify-center rounded-[6px] bg-[#6887A0] text-white hover:bg-[#5b7890] transition-colors cursor-pointer shadow-sm"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingTaskId(task._id!)}
                          title="Delete Task"
                          className="w-9 h-9 flex items-center justify-center rounded-[6px] bg-[#FF0000] text-white hover:bg-red-600 transition-colors cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12">
                      <EmptyState 
                        icon={CheckSquare}
                        title="No tasks found matching your filter criteria"
                        className="py-6 border-0 bg-transparent min-h-0"
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 py-4 flex flex-col items-center justify-center gap-2 border-t border-white/10">
            <div className="text-xs text-[#919191]">
              Showing {tasksList.length} of {totalItems} tasks
            </div>
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-xs text-[#919191] py-1">
                <Loader className="w-4 h-4 text-white" />
                <span>Loading more tasks...</span>
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className="h-8 px-4 bg-[#202B36] hover:bg-[#2A3745] text-white text-xs font-medium rounded-lg transition-colors border border-white/10 cursor-pointer"
              >
                Load More Tasks ({totalItems - tasksList.length} remaining)
              </button>
            )}
            <div ref={activeTab === "list" ? loadMoreRef : undefined} className="h-4 w-full" />
          </div>
        </div>
      )}

      {/* CALENDAR VIEW TAB CONTENT */}
      {activeTab === "calendar" && (
        <div className="w-full bg-[#141C24] border border-[#0F1F3D]/20 rounded-xl p-5 shadow-sm mt-1">
          {/* Calendar Header: Month Navigation & Controls */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {MONTH_NAMES[currentMonthIndex]} {currentYear}
              </h2>
              <div className="flex items-center gap-1 bg-[#394A58] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentYear(new Date().getFullYear());
                    setCurrentMonthIndex(new Date().getMonth());
                  }}
                  className="px-2 py-0.5 rounded text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Go to current month"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-[#919191]">
              Click any date box to view or manage tasks for that day
            </div>
          </div>

          {/* Weekday Names Bar */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="text-xs font-medium text-white py-1">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty Offset Boxes for Month Start */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-[100px] rounded-xl border border-white/5 bg-[#0C1116]/40 opacity-40"
              />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateStr = `${formattedMonthStr}-${String(dayNum).padStart(2, "0")}`;
              const dayTasks = filteredTasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));
              const hasTasks = dayTasks.length > 0;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedCalendarDate(dateStr)}
                  className={cn(
                    "h-[105px] p-2 rounded-xl transition-all flex flex-col gap-1 cursor-pointer border relative group",
                    hasTasks
                      ? "bg-[#394A58] border-white/10 hover:border-[#6887A0]"
                      : "bg-[#0C1116] border-white/5 hover:bg-[#141C24] hover:border-white/10"
                  )}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{dayNum}</span>
                    {hasTasks && (
                      <span className="text-[10px] bg-[#141C24] text-white px-1.5 py-0.2 rounded-full font-medium">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills inside Day Box */}
                  <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar flex-1 pt-0.5">
                    {dayTasks.slice(0, 3).map((t) => {
                      const borderColor =
                        t.priority === "Urgent"
                          ? "border-[#FF0000]"
                          : t.priority === "High"
                          ? "border-[#FFB302]"
                          : t.priority === "Medium"
                          ? "border-[#33BBFF]"
                          : "border-[#CACACA]";

                      const dotColor =
                        t.priority === "Urgent"
                          ? "bg-[#FF0000]"
                          : t.priority === "High"
                          ? "bg-[#FFB302]"
                          : t.priority === "Medium"
                          ? "bg-[#33BBFF]"
                          : "bg-[#CACACA]";

                      return (
                        <div
                          key={t.id}
                          className={cn(
                            "bg-[#141C24] border px-1.5 py-1 rounded-[4px] flex items-center justify-between gap-1 shadow-sm text-[10px] text-white hover:opacity-90",
                            borderColor
                          )}
                        >
                          <span className="truncate flex-1 font-normal leading-tight">
                            {t.title}
                          </span>
                          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColor)} />
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-[#919191] font-medium pl-0.5">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MODAL DIALOGS SYSTEM */}

      {/* Create New Task Dialog */}
      <NewTaskDialog
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setNewTaskInitialDate(undefined);
        }}
        onSuccess={handleAddTask}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSuccess={handleUpdateTask}
      />

      {/* Task Details Dialog (View Full Details) */}
      <TaskDetailsDialog
        task={selectedDetailsTask}
        isOpen={!!selectedDetailsTask}
        onClose={() => setSelectedDetailsTask(null)}
        onEdit={(taskToEdit) => setEditingTask(taskToEdit)}
        onDelete={(idToDelete) => setDeletingTaskId(idToDelete)}
      />

      {/* Date Tasks Dialog (Clicking on Calendar Date) */}
      <DateTasksDialog
        dateString={selectedCalendarDate}
        tasks={filteredTasks.filter((t) => t.dueDate && selectedCalendarDate && t.dueDate.startsWith(selectedCalendarDate))}
        isOpen={!!selectedCalendarDate}
        onClose={() => setSelectedCalendarDate(null)}
        onSelectTask={(task) => setSelectedDetailsTask(task)}
        onEditTask={(task) => setEditingTask(task)}
        onDeleteTask={(id) => setDeletingTaskId(id)}
        onAddNewTaskForDate={(dStr) => {
          setNewTaskInitialDate(dStr);
          setIsNewTaskOpen(true);
        }}
      />

      {/* Reusable Success/Feedback Modal */}
      <SuccessModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        description={feedbackModal.desc}
      />

      {/* Reusable Delete Modal */}
      <DeleteModal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        cancelText="No, keep it"
        confirmText="Yes, Delete Now"
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-10">
        <Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" />
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
