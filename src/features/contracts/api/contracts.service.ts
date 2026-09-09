import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
  Contract,
  GetContractsResponse,
  GetContractResponse,
  CreateContractDTO,
  UpdateContractDTO,
} from "../types/contracts.types";

interface GetContractsParams {
  page?: number;
  limit?: number;
  search?: string;
  client?: string;
  provider?: string;
  contractType?: string;
  status?: string;
  isArchived?: boolean;
}

export const useContracts = (params?: GetContractsParams) => {
  return useQuery({
    queryKey: ["contracts", params],
    queryFn: async () => {
      const response = await axiosInstance.get<GetContractsResponse>("/contracts", {
        params,
      });
      return {
        data: response.data.data.map(c => ({...c, id: c._id})),
        total: response.data.pagination.totalItems,
      };
    },
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const response = await axiosInstance.get<GetContractResponse>(`/contracts/${id}`);
      return {...response.data.data, id: response.data.data._id};
    },
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractData: CreateContractDTO) => {
      const response = await axiosInstance.post("/contracts", contractData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateContract = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractData: UpdateContractDTO) => {
      const response = await axiosInstance.patch(`/contracts/${id}`, contractData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/contracts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Document & Note Endpoints
export const useAddContractDocument = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axiosInstance.post(`/contracts/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
    },
  });
};

export const useDeleteContractDocument = (contractId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      const response = await axiosInstance.delete(`/contracts/${contractId}/documents/${docId}`);
      return response.data;
    },
    onSuccess: (_data, docId) => {
      queryClient.setQueryData<Contract>(["contracts", contractId], (old) => {
        if (!old) return old;
        return {
          ...old,
          documents: (old.documents || []).filter((d) => d._id !== docId),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
    },
  });
};

export const useAddContractNote = (contractId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string | { body: string }) => {
      const payload = typeof body === "string" ? { body } : body;
      const response = await axiosInstance.post(`/contracts/${contractId}/notes`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
    },
  });
};

export const useDeleteContractNote = (contractId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const response = await axiosInstance.delete(`/contracts/${contractId}/notes/${noteId}`);
      return response.data;
    },
    onSuccess: (_data, noteId) => {
      queryClient.setQueryData<Contract>(["contracts", contractId], (old) => {
        if (!old) return old;
        return {
          ...old,
          contractNotes: (old.contractNotes || []).filter((n) => n._id !== noteId),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
    },
  });
};

export const exportContracts = async (format: "pdf" | "csv", search?: string, contractType?: string, status?: string) => {
  const response = await axiosInstance.get<GetContractsResponse>("/contracts", {
    params: { search, contractType, status, limit: 100 },
  });
  
  const contracts = response.data.data;
  
  if (format === "csv") {
    const headers = ["Contract Number", "Policy Number", "Client Name", "Provider", "Type", "Status", "Premium Amount", "Contract Value", "Start Date"];
    const csvContent = [
      headers.join(","),
      ...contracts.map(c => [
        c.contractNumber || "N/A",
        c.policyNumber || "N/A",
        c.client ? `${c.client.firstName} ${c.client.lastName}` : "N/A",
        c.provider || "N/A",
        c.contractType || "N/A",
        c.status || "N/A",
        c.premiumAmount || 0,
        c.contractValue || 0,
        c.startDate ? new Date(c.startDate).toLocaleDateString() : "N/A"
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Contracts_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "pdf") {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Contracts Export", 14, 15);
    
    const tableData = contracts.map(c => [
      c.contractNumber || "N/A",
      c.client ? `${c.client.firstName} ${c.client.lastName}` : "N/A",
      c.provider || "N/A",
      c.contractType || "N/A",
      c.status || "N/A",
      `$${(c.contractValue || 0).toLocaleString()}`,
      c.startDate ? new Date(c.startDate).toLocaleDateString() : "N/A"
    ]);

    autoTable(doc, {
      head: [["Contract No.", "Client", "Provider", "Type", "Status", "Value", "Start Date"]],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`Contracts_Export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};
