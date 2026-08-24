"use client";

import { Card } from "@/components/ui/card";

import { useDashboardSummary } from "@/features/dashboard/api/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Activity } from "lucide-react";

export default function RecentActivityCard() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full bg-[#141C24] rounded-[12px]" />;
  }

  const activities = data?.recentActivity || [];

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
        {activities.length === 0 ? (
          <EmptyState 
            icon={Activity}
            title="No recent activity"
            className="py-12 border-0 bg-transparent min-h-0"
          />
        ) : (
          activities.slice(0, 5).map((activity: any) => (
            <div
              key={activity._id || activity.id}
              className="px-5 py-3.5 flex flex-col gap-1 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-medium text-white font-sans capitalize leading-tight">
                {activity.action} in {activity.module || activity.entityType}
              </span>
              <span className="text-xs font-normal text-[#8C8C8C] font-sans">
                {new Date(activity.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })} by {activity.performedBy?.name || activity.userName || "Unknown"}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
