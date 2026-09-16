"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckSquare, Pencil, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Task } from "../types/tasks.types";
import { cn } from "@/lib/utils";

export type KanbanStatus = "To Do" | "In Progress" | "Done";

interface KanbanColumnConfig {
  id: KanbanStatus;
  title: string;
  emptyTitle: string;
}

const COLUMNS: KanbanColumnConfig[] = [
  { id: "To Do", title: "To do", emptyTitle: "No tasks in To Do" },
  { id: "In Progress", title: "In progress", emptyTitle: "No tasks in progress" },
  { id: "Done", title: "Done", emptyTitle: "No tasks in Done" },
];

interface KanbanViewProps {
  tasks: Task[];
  onMoveStatus: (id: string, newStatus: KanbanStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

export default function KanbanView({
  tasks,
  onMoveStatus,
  onEditTask,
  onDeleteTask,
  onSelectTask,
}: KanbanViewProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    const id = task._id || task.id || "";
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, columnId: KanbanStatus) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, columnId: KanbanStatus) => {
    // Only reset if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn((prev) => (prev === columnId ? null : prev));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;

    if (taskId) {
      onMoveStatus(taskId, targetStatus);
    }

    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-1 select-none">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const isColumnDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, column.id)}
            onDragLeave={(e) => handleDragLeave(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            className={cn(
              "bg-[#141C24] border rounded-xl p-3.5 flex flex-col gap-3 h-[640px] transition-all duration-200 relative",
              isColumnDragOver
                ? "border-[#66859E] ring-2 ring-[#66859E]/40 bg-[#17222D]/95 shadow-xl scale-[1.005]"
                : "border-[#0F1F3D]/20"
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-1 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  {column.title}
                </h2>
                {isColumnDragOver && (
                  <span className="text-[10px] uppercase font-bold text-[#66859E] bg-[#66859E]/10 px-2 py-0.5 rounded-full animate-pulse">
                    Drop Zone
                  </span>
                )}
              </div>
              <span className="text-xs text-[#919191] font-medium bg-white/5 px-2 py-0.5 rounded-md">
                {columnTasks.length}
              </span>
            </div>

            {/* Scrollable Tasks Container */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1.5 flex-1 min-h-0">
              {/* Drop target indicator when dragging over */}
              {isColumnDragOver && draggedTaskId && (
                <div className="border-2 border-dashed border-[#66859E] bg-[#66859E]/15 rounded-[8px] p-3.5 text-center text-xs font-semibold text-[#849EB2] flex items-center justify-center gap-2 animate-pulse flex-shrink-0">
                  <span>Drop task into {column.title}</span>
                </div>
              )}

              {columnTasks.map((task) => {
                const taskId = task._id || task.id || "";
                const isBeingDragged = draggedTaskId === taskId;

                return (
                  <div
                    key={taskId}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectTask(task)}
                    className={cn(
                      "bg-[#0C1116] rounded-[8px] p-3 border transition-all flex flex-col justify-between group flex-shrink-0 cursor-grab active:cursor-grabbing",
                      isBeingDragged
                        ? "opacity-30 border-dashed border-[#66859E] scale-[0.98] bg-[#0C1116]/40"
                        : "border-white/5 hover:border-[#66859E]/40 hover:shadow-md"
                    )}
                  >
                    {/* Top Row: Title, Priority, Drag handle, Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-[#919191]/40 group-hover:text-[#919191] mt-0.5 flex-shrink-0 transition-colors" />
                        <h3 className="text-xs sm:text-[13px] font-medium text-white leading-tight break-words flex-1">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {renderPriorityBadge(task.priority)}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          title="Edit task"
                          className="p-1 rounded text-[#919191] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(taskId);
                          }}
                          title="Delete task"
                          className="p-1 rounded text-[#919191] hover:text-[#FF3E46] hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-[#919191] font-normal mt-1.5 line-clamp-1">
                      {task.description || "No description provided."}
                    </p>

                    {/* Due Date */}
                    <p className="text-[11px] text-[#919191] font-normal mt-2">
                      Due {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "N/A"}
                    </p>

                    {/* Quick Move Buttons based on column */}
                    <div
                      className="flex items-center gap-2 mt-3 pt-1 flex-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {column.id === "To Do" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onMoveStatus(taskId, "In Progress")}
                            className="bg-[#FF9D00]/10 border border-[#FF9D00] text-[#FF9D00] text-[11px] font-medium px-2.5 py-1 rounded-[8px] hover:bg-[#FF9D00]/20 transition-all cursor-pointer"
                          >
                            In Progress
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveStatus(taskId, "Done")}
                            className="bg-[#42CD7F]/10 border border-[#42CD7F] text-[#42CD7F] text-[11px] font-medium px-2.5 py-1 rounded-[8px] hover:bg-[#42CD7F]/20 transition-all cursor-pointer"
                          >
                            Done →
                          </button>
                        </>
                      )}

                      {column.id === "In Progress" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onMoveStatus(taskId, "To Do")}
                            className="bg-[#FF3E46]/10 border border-[#FF3E46] text-[#FF3E46] text-[11px] font-medium px-2.5 py-1 rounded-[8px] hover:bg-[#FF3E46]/20 transition-all cursor-pointer"
                          >
                            ← To Do
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveStatus(taskId, "Done")}
                            className="bg-[#42CD7F]/10 border border-[#42CD7F] text-[#42CD7F] text-[11px] font-medium px-2.5 py-1 rounded-[8px] hover:bg-[#42CD7F]/20 transition-all cursor-pointer"
                          >
                            Done →
                          </button>
                        </>
                      )}

                      {column.id === "Done" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onMoveStatus(taskId, "To Do")}
                            className="bg-[#FF3E46]/10 border border-[#FF3E46] text-[#FF3E46] text-[11px] font-medium px-2.5 py-1 rounded-[8px] hover:bg-[#FF3E46]/20 transition-all cursor-pointer"
                          >
                            ← To Do
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveStatus(taskId, "In Progress")}
                            className="bg-[#FF9D00]/10 border border-[#FF9D00] text-[#FF9D00] text-[11px] font-medium px-2.5 py-1 rounded-[8px] hover:bg-[#FF9D00]/20 transition-all cursor-pointer"
                          >
                            ← In Progress
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {columnTasks.length === 0 && !isColumnDragOver && (
                <EmptyState
                  icon={CheckSquare}
                  title={column.emptyTitle}
                  className="py-12 border-0 bg-transparent min-h-0"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
