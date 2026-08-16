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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
    },
  });
};

export const useAddContractNote = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const response = await axiosInstance.post(`/contracts/${id}/notes`, { body });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
    },
  });
};

export const exportContracts = async (format: "pdf" | "csv", search?: string, contractType?: string, status?: string) => {
  const response = await axiosInstance.get("/contracts/export", {
    params: { format, search, contractType, status },
    responseType: "blob",
  });
  
  const blob = new Blob([response.data], {
    type: format === "pdf" ? "application/pdf" : "text/csv",
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const disposition = response.headers['content-disposition'];
  let filename = `contracts.${format}`;
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
