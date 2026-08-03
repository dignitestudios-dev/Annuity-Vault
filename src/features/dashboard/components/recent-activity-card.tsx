"use client";

import { Card } from "@/components/ui/card";

const ACTIVITIES = [
  {
    action: "Update in contracts",
    date: "2026-06-18",
  },
  {
    action: "Create in notes",
    date: "2026-06-18",
  },
  {
    action: "Update in tasks",
    date: "2026-06-17",
  },
  {
    action: "Delete in notes",
    date: "2026-04-06",
  },
];

export default function RecentActivityCard() {
  return (
    <Card className="bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] flex flex-col overflow-hidden shadow-sm h-full">
      {/* Card Header */}
      <div className="h-[51px] bg-[#394A58] px-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-sm font-semibold text-white font-sans">
          Recent Activity
        </h3>
      </div>

      {/* Card List Items */}
      <div className="flex flex-col divide-y divide-white/10">
        {ACTIVITIES.map((activity, index) => (
          <div
            key={index}
            className="px-5 py-3.5 flex flex-col gap-1 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm font-medium text-white font-sans capitalize leading-tight">
              {activity.action}
            </span>
            <span className="text-xs font-normal text-[#8C8C8C] font-sans">
              {activity.date}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
