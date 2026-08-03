"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const ANNIVERSARIES = [
  {
    days: "10d",
    name: "Margaret Williams",
    carrier: "Symetra • IM-897769",
    date: "2026-06-23",
    countdown: "in 10 days",
  },
  {
    days: "40d",
    name: "Thomas Lopez",
    carrier: "Symetra • IX-187337",
    date: "2026-07-20",
    countdown: "in 40 days",
  },
  {
    days: "90d",
    name: "Edward Wright",
    carrier: "Brighthouse • VR-104342",
    date: "2026-08-30",
    countdown: "in 90 days",
  },
  {
    days: "142d",
    name: "Christopher Mitchell",
    carrier: "Lincoln Financial • IM-746162",
    date: "2026-10-30",
    countdown: "in 142 days",
  },
];

export default function AnniversariesCard() {
  return (
    <Card className="bg-[#141C24] border border-[#0F1F3D]/12 rounded-[12px] flex flex-col overflow-hidden shadow-sm h-full">
      {/* Card Header */}
      <div className="h-[51px] bg-[#394A58] px-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-sm font-semibold text-white font-sans">
          Upcoming Contract Anniversaries
        </h3>
        <Link
          href="/dashboard/anniversaries"
          className="text-xs font-medium text-white hover:underline flex items-center gap-1 font-sans"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>

      {/* Card List Items */}
      <div className="flex flex-col divide-y divide-white/10">
        {ANNIVERSARIES.map((item) => (
          <div
            key={item.name}
            className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-[38px] h-[38px] rounded-[8px] bg-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 font-sans">
                {item.days}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white font-sans leading-tight">
                  {item.name}
                </span>
                <span className="text-xs font-normal text-[#8C8C8C] font-sans mt-0.5">
                  {item.carrier}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white font-sans leading-tight">
                {item.date}
              </span>
              <span className="text-xs font-normal text-[#8C8C8C] font-sans mt-0.5">
                {item.countdown}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
