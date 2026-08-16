import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { DashboardSummaryResponse } from "../types/dashboard.types";

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await axiosInstance.get("/dashboard/summary");
    return response.data;
  },
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardService.getSummary,
  });
}
