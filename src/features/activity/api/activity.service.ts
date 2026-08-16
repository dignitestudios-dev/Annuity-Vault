import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface AuditLogUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
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

export const useAuditLogs = (filters: AuditLogsParams) => {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => getAuditLogs(filters),
  });
};

export const exportAuditLogs = async (format: "pdf" | "csv", search?: string, action?: string, module?: string) => {
  const response = await axiosInstance.get("/audit-logs/export", {
    params: { format, search, action, module },
    responseType: "blob",
  });
  
  const blob = new Blob([response.data], {
    type: format === "pdf" ? "application/pdf" : "text/csv",
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const disposition = response.headers['content-disposition'];
  let filename = `audit-logs.${format}`;
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches != null && matches[1]) { 
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
