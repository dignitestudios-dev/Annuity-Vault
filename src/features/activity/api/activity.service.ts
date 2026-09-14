import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface AuditLogUser {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuditLogItem {
  _id: string;
  performedBy: AuditLogUser;
  performedByType: string;
  action: string;
  module: string;
  recordId: string;
  recordLabel: string;
  change: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
}

export const activityKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (filters: AuditLogsParams) => [...activityKeys.lists(), filters] as const,
};

const getAuditLogs = async (params: AuditLogsParams): Promise<AuditLogsResponse> => {
  const { data } = await axiosInstance.get<AuditLogsResponse>("/audit-logs", { params });
  return data;
};

const getAuditLogsById = async (id: string, params?: AuditLogsParams): Promise<AuditLogsResponse> => {
  const { data } = await axiosInstance.get<AuditLogsResponse>(`/clients/${id}/activity`, { params });
  return data;
};

export const useAuditLogs = (filters: AuditLogsParams) => {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => getAuditLogs(filters),
  });
};
export const useAuditLogsById = (id: string, params?: AuditLogsParams) => {
  return useQuery({
    queryKey: ["audit-logs-by-id", id, params],
    queryFn: () => getAuditLogsById(id, params),
    enabled: !!id,
  });
};

export const exportAuditLogs = async (format: "pdf" | "csv", search?: string, action?: string, module?: string) => {
  const response = await axiosInstance.get<AuditLogsResponse>("/audit-logs", {
    params: { search, action, module, limit: 100 },
  });
  
  const logs = response.data.data;
  
  if (format === "csv") {
    const headers = ["Date", "User", "Action", "Module", "Record", "Details"];
    const csvContent = [
      headers.join(","),
      ...logs.map(log => {
        const user = log.performedBy;
        const userName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "System";
        return [
          new Date(log.createdAt).toLocaleString(),
          userName,
          log.action,
          log.module,
          log.recordLabel || "N/A",
          log.change || "N/A"
        ].map(field => `"${(field || "").toString().replace(/"/g, '""')}"`).join(",")
      })
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AuditLogs_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (format === "pdf") {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Audit Logs Export", 14, 15);
    
    const tableData = logs.map(log => {
      const user = log.performedBy;
      const userName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : "System";
      return [
        new Date(log.createdAt).toLocaleString(),
        userName,
        log.action,
        log.module,
        log.recordLabel || "N/A",
        log.change || "N/A"
      ];
    });

    autoTable(doc, {
      head: [["Date", "User", "Action", "Module", "Record", "Details"]],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`AuditLogs_Export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};
