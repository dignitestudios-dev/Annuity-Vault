"use client";

import { useEffect } from "react";
import { useGetProfile } from "@/features/auth/api/auth.service";
import { useAppDispatch } from "@/store";
import { updateUser } from "@/store/slices/auth.slice";
import { requestNotificationPermission } from "@/config/request-notification-permission";
import { Skeleton } from "@/components/ui/skeleton";
import MetricCards from "@/features/dashboard/components/metric-cards";
import AnniversariesCard from "@/features/dashboard/components/anniversaries-card";
import PendingTasksCard from "@/features/dashboard/components/pending-tasks-card";
import RecentActivityCard from "@/features/dashboard/components/recent-activity-card";
import ClientsTableCard from "@/features/dashboard/components/clients-table-card";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data: profile, isLoading: isProfileLoading, isSuccess: isProfileSuccess } = useGetProfile();

  useEffect(() => {
    if (isProfileSuccess && profile) {
      dispatch(updateUser(profile));
      if (typeof window !== "undefined") {
        localStorage.setItem("auth-user", JSON.stringify(profile));
      }
      // If notification permission is off / default, prompt for permission
      if (typeof window !== "undefined" && "Notification" in window) {
        requestNotificationPermission();
      }
    }
  }, [isProfileSuccess, profile, dispatch]);

  if (isProfileLoading) {
    return (
      <div className="w-full flex flex-col gap-6 max-w-[1440px] mx-auto pb-8">
        <Skeleton className="h-9 w-48 bg-[#141C24] rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[94px] w-full bg-[#141C24] rounded-[12px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-[300px] w-full bg-[#141C24] rounded-[12px]" />
          <Skeleton className="lg:col-span-5 h-[300px] w-full bg-[#141C24] rounded-[12px]" />
          <Skeleton className="lg:col-span-3 h-[300px] w-full bg-[#141C24] rounded-[12px]" />
        </div>
        <Skeleton className="h-[400px] w-full bg-[#141C24] rounded-[12px]" />
      </div>
    );
  }

  if (!isProfileSuccess) {
    return null;
  }

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
