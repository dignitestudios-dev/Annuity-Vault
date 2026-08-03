"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const TASKS = [
  {
    title: "Annual Review — Adam Smith",
    dueDate: "Due 2025-01-20",
  },
  {
    title: "Anniversary Follow-Up — Margaret Holloway",
    dueDate: "Due 2025-05-15",
  },
  {
    title: "Follow Up — Sandra Collins",
    dueDate: "Due 2025-02-01",
  },
  {
    title: "Suitability Update — Patricia Nguyen",
    dueDate: "Due 2025-08-01",
  },
];

export default function PendingTasksCard() {
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
        {TASKS.map((task) => (
          <div
            key={task.title}
            className="w-full bg-[#0C1116] rounded-[8px] p-3 flex items-start gap-3 border border-white/5 hover:bg-[#0C1116]/80 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-white mt-1.5 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-medium text-white font-sans leading-snug truncate">
                {task.title}
              </span>
              <span className="text-xs font-normal text-[#8C8C8C] font-sans mt-0.5">
                {task.dueDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
