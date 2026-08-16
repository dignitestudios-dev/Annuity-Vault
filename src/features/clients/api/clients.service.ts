import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Client, ClientsResponse, CreateClientDTO, UpdateClientDTO } from "../types/clients.types";

export const clientsService = {
  getClients: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<ClientsResponse> => {
    const response = await axiosInstance.get("/clients", { params });
    return response.data;
  },

  getClient: async (id: string): Promise<Client> => {
    const response = await axiosInstance.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: CreateClientDTO): Promise<Client> => {
    const response = await axiosInstance.post("/clients", data);
    return response.data;
  },

  updateClient: async ({ id, data }: { id: string; data: UpdateClientDTO }): Promise<Client> => {
    const response = await axiosInstance.patch(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/clients/${id}`);
  },
};

export function useClients(params?: { search?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => clientsService.getClients(params),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsService.updateClient,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsService.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
