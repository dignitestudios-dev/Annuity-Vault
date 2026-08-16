import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface AnniversaryClient {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface AnniversaryItem {
  client?: AnniversaryClient;
  contractId: string;
  contractNumber: string;
  provider: string;
  anniversaryDate: string;
  daysUntil: number;
}

export interface AnniversaryStats {
  next30Days: number;
  next60Days: number;
  next90Days: number;
  next120Days: number;
}

export interface AnniversariesResponse {
  data: {
    stats: AnniversaryStats;
    rows: AnniversaryItem[];
  };
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AnniversariesParams {
  page?: number;
  limit?: number;
  search?: string;
  window?: 30 | 60 | 90 | 120;
}

export const anniversariesKeys = {
  all: ["anniversaries"] as const,
  lists: () => [...anniversariesKeys.all, "list"] as const,
  list: (filters: AnniversariesParams) => [...anniversariesKeys.lists(), filters] as const,
};

const getAnniversaries = async (params: AnniversariesParams): Promise<AnniversariesResponse> => {
  const { data } = await axiosInstance.get<AnniversariesResponse>("/anniversaries", { params });
  return data;
};

export const useAnniversaries = (filters: AnniversariesParams) => {
  return useQuery({
    queryKey: anniversariesKeys.list(filters),
    queryFn: () => getAnniversaries(filters),
  });
};

export const exportAnniversaries = async (format: "pdf" | "csv", search?: string, timeWindow?: number) => {
  const response = await axiosInstance.get("/anniversaries/export", {
    params: { format, search, window: timeWindow },
    responseType: "blob",
  });
  
  // Create a blob from the response data
  const blob = new Blob([response.data], {
    type: format === "pdf" ? "application/pdf" : "text/csv",
  });
  
  // Create a link element, use it to download the file and remove it
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  // Extract filename from header if available, else default
  const disposition = response.headers['content-disposition'];
  let filename = `anniversaries.${format}`;
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
