import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
  Contract,
  GetContractsResponse,
  GetContractResponse,
  CreateContractDTO,
  UpdateContractDTO,
} from "../types/contracts.types";

export interface GetContractsParams {
  page?: number;
  limit?: number;
  search?: string;
  client?: string;
  provider?: string;
  contractType?: string;
  status?: string;
  isArchived?: boolean;
  lastName?: string;
  productName?: string;
  anniversaryFrom?: string;
  anniversaryTo?: string;
  qualified?: boolean | string;
  outOfSurrenderFrom?: string;
  outOfSurrenderTo?: string;
  incomeMode?: string;
  annuitantNotOwner?: boolean | string;
  annuitantDobFrom?: string;
  annuitantDobTo?: string;
  ridersOrFeatures?: string;
  [key: string]: any;
}

export const useContracts = (params?: GetContractsParams) => {
  return useQuery({
    queryKey: ["contracts", params],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      if (params) {
        for (const [key, val] of Object.entries(params)) {
          if (val !== "" && val !== null && val !== undefined) {
            cleanParams[key] = val;
          }
        }
      }
      const response = await axiosInstance.get<GetContractsResponse>("/contracts", {
        params: cleanParams,
      });
      return {
        data: response.data.data.map(c => ({...c, id: c._id})),
        total: response.data.pagination.totalItems,
      };
    },
  });
};

export const useContract = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const response = await axiosInstance.get<GetContractResponse>(`/contracts/${id}`);
      return {...response.data.data, id: response.data.data._id};
    },
    enabled: !!id && enabled,
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
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
        predicate: (query) => query.queryKey[1] !== id,
      });
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

export const exportContracts = async (
  format: "pdf" | "csv",
  filters?: Record<string, any>
) => {
  const cleanParams: Record<string, any> = { format };
  if (filters) {
    for (const [key, val] of Object.entries(filters)) {
      if (val !== "" && val !== null && val !== undefined) {
        cleanParams[key] = val;
      }
    }
  }

  try {
    const response = await axiosInstance.get("/contracts/export", {
      params: cleanParams,
      responseType: "blob",
    });

    const mimeType = format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;";
    const extension = format === "pdf" ? "pdf" : "csv";
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Contracts_Export_${new Date().toISOString().split("T")[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || "Export failed");
      } catch (e: any) {
        throw new Error(e.message || "Export failed");
      }
    }
    throw err;
  }
};

