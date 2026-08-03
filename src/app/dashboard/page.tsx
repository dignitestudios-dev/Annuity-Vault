"use client";

import MetricCards from "@/features/dashboard/components/metric-cards";
import AnniversariesCard from "@/features/dashboard/components/anniversaries-card";
import PendingTasksCard from "@/features/dashboard/components/pending-tasks-card";
import RecentActivityCard from "@/features/dashboard/components/recent-activity-card";
import ClientsTableCard from "@/features/dashboard/components/clients-table-card";

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-8">
      {/* Page Title */}
      <h1 className="text-2xl lg:text-3xl font-semibold text-white tracking-tight font-sans">
        Dashboard
      </h1>

      {/* Top 5 Metric Cards */}
      <MetricCards />

      {/* Middle Row: Anniversaries, Pending Tasks, Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <AnniversariesCard />
        </div>
        <div className="lg:col-span-5">
          <PendingTasksCard />
        </div>
        <div className="lg:col-span-3">
          <RecentActivityCard />
        </div>
      </div>

      {/* Bottom Row: Clients Table */}
      <ClientsTableCard />
    </div>
  );
}
