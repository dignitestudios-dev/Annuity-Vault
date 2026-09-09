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
  const response = await axiosInstance.get<AnniversariesResponse>("/anniversaries", {
    params: { search, window: timeWindow, limit: 100 },
  });
  
  const anniversaries = response.data.data.rows;
  
  if (format === "csv") {
    const headers = ["Client Name", "Contract Number", "Provider", "Anniversary Date", "Days Until"];
    const csvContent = [
      headers.join(","),
      ...anniversaries.map(a => [
        a.client ? `${a.client.firstName} ${a.client.lastName}` : "N/A",
        a.contractNumber || "N/A",
        a.provider || "N/A",
        a.anniversaryDate ? new Date(a.anniversaryDate).toLocaleDateString() : "N/A",
        a.daysUntil
      ].map(field => `"${(field || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Anniversaries_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "pdf") {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Anniversaries Export", 14, 15);
    
    const tableData = anniversaries.map(a => [
      a.client ? `${a.client.firstName} ${a.client.lastName}` : "N/A",
      a.contractNumber || "N/A",
      a.provider || "N/A",
      a.anniversaryDate ? new Date(a.anniversaryDate).toLocaleDateString() : "N/A",
      a.daysUntil.toString()
    ]);

    autoTable(doc, {
      head: [["Client Name", "Contract No.", "Provider", "Anniversary Date", "Days Until"]],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`Anniversaries_Export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};
