"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

import { useDashboardSummary } from "@/features/dashboard/api/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function PendingTasksCard() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full bg-[#141C24] rounded-[12px]" />;
  }

  const tasks = data?.pendingTasks || [];

  return (
    <Card className="bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] flex flex-col overflow-hidden shadow-sm h-full">
      {/* Card Header */}
      <div className="h-[51px] bg-[#394A58] px-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-sm font-semibold text-white font-sans">
          Pending Tasks
        </h3>
        <Link
          href="/dashboard/tasks"
          className="text-xs font-medium text-white hover:underline flex items-center gap-1 font-sans"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>

      {/* Card List Items */}
      <div className="p-4 flex flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="p-5 text-sm text-[#8C8C8C] text-center font-sans">
            No pending tasks.
          </div>
        ) : (
          tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="w-full bg-[#0C1116] rounded-[8px] p-3 flex items-start gap-3 border border-white/5 hover:bg-[#0C1116]/80 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-white mt-1.5 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-medium text-white font-sans leading-snug truncate">
                  {task.title} — {task.clientName}
                </span>
                <span className="text-xs font-normal text-[#8C8C8C] font-sans mt-0.5">
                  Due {new Date(task.dueDate).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
