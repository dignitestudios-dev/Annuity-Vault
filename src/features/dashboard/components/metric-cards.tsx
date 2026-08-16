"use client";

import { Users, FileText, Calendar, CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

import { useDashboardSummary } from "@/features/dashboard/api/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricCards() {
  const { data, isLoading, isError } = useDashboardSummary();

  const kpis = data?.kpis;

  const METRICS = [
    {
      title: "Total Clients",
      value: kpis?.totalClients?.toString() || "0",
      subtext: "Total",
      icon: Users,
    },
    {
      title: "Active Contracts",
      value: kpis?.activeContracts?.toString() || "0",
      subtext: "Across all Clients",
      icon: FileText,
    },
    {
      title: "Assets Under Management",
      value: kpis ? `$${kpis.assetsUnderManagement.toLocaleString()}` : "$0",
      subtext: "Total AUM",
      icon: FileText,
    },
    {
      title: "Anniversaries",
      value: kpis?.anniversariesNext30Days?.toString() || "0",
      subtext: "Next 30 Days",
      icon: Calendar,
    },
    {
      title: "Open Tasks",
      value: kpis?.openTasks?.toString() || "0",
      subtext: "Pending",
      icon: CheckSquare,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[94px] w-full bg-[#141C24] rounded-[12px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.title}
            className="bg-[#141C24] border-0 rounded-[12px] pt-0 pb-3 px-4 flex flex-col justify-between min-h-[94px] min-w-0 shadow-sm relative overflow-hidden group hover:bg-[#192430] transition-colors"
          >
            {/* Top Row: Title */}
            <div className="w-full flex items-center justify-between pt-2.5">
              <span className="text-[13px] sm:text-[14px] font-medium text-[#919191] font-sans truncate">
                {metric.title}
              </span>
            </div>

            {/* Middle Row: Value + Icon Badge on the Right */}
            <div className="w-full flex items-center justify-between gap-2 -mt-1">
              <span className="text-lg sm:text-[20px] xl:text-[21px] font-bold text-white leading-tight font-sans tracking-tight truncate">
                {metric.value}
              </span>

              {/* Icon Badge Container matching Figma (38px x 38px #0C1116) */}
              <div className="w-[38px] h-[38px] rounded-[4px] bg-[#0C1116] flex items-center justify-center flex-shrink-0">
                <Icon className="w-[20px] h-[20px] text-[#6887A0]" />
              </div>
            </div>

            {/* Bottom Row: Subtext / Description */}
            <div className="w-full flex items-center -mt-1">
              <span className="text-[11px] font-normal text-[#919191] opacity-70 font-sans truncate leading-none">
                {metric.subtext}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
