"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

import { useDashboardSummary } from "@/features/dashboard/api/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";
function calculateDaysDifference(dateString: string) {
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function AnniversariesCard() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full bg-[#141C24] rounded-[12px]" />;
  }

  const anniversaries = data?.upcomingAnniversaries || [];

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
        {anniversaries.length === 0 ? (
          <EmptyState 
            icon={Calendar}
            title="No upcoming anniversaries"
            className="py-12 border-0 bg-transparent min-h-0"
          />
        ) : (
          anniversaries.slice(0, 5).map((item: any) => {
            const diffDays = calculateDaysDifference(item.anniversaryDate);
            const daysDisplay = diffDays > 0 ? `${diffDays}d` : diffDays === 0 ? "Today" : `${Math.abs(diffDays)}d ago`;
            const countdown = diffDays > 0 ? `in ${diffDays} days` : diffDays === 0 ? "Today" : `${Math.abs(diffDays)} days ago`;

            return (
              <div
                key={item.contractId || item.id || Math.random().toString()}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-[38px] h-[38px] rounded-[8px] bg-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 font-sans">
                    {daysDisplay}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white font-sans leading-tight">
                      {item.client?.firstName ? `${item.client.firstName} ${item.client.lastName}` : item.clientName || "Unknown Client"}
                    </span>
                    <span className="text-xs font-normal text-[#8C8C8C] font-sans mt-0.5">
                      {item.provider || item.contractNumber || item.contractType}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-white font-sans leading-tight">
                    {new Date(item.anniversaryDate).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </span>
                  <span className="text-xs font-normal text-[#8C8C8C] font-sans mt-0.5">
                    {countdown}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
