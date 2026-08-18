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
    return response.data.data || response.data;
  },

  createClient: async (data: CreateClientDTO): Promise<Client> => {
    const response = await axiosInstance.post("/clients", data);
    return response.data.data || response.data;
  },

  updateClient: async ({ id, data }: { id: string; data: UpdateClientDTO }): Promise<Client> => {
    const response = await axiosInstance.patch(`/clients/${id}`, data);
    return response.data.data || response.data;
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

export const exportClients = async (format: "pdf" | "csv", search?: string, status?: string) => {
  const response = await clientsService.getClients({ search, status, limit: 1000 });
  const clients = response.data;
  
  if (format === "csv") {
    const headers = ["Client Name", "Email", "Phone", "Status", "Date Added", "Contracts Count"];
    const csvContent = [
      headers.join(","),
      ...clients.map(c => [
        `${c.firstName} ${c.lastName}`,
        c.email || "N/A",
        c.phone || "N/A",
        c.status || "N/A",
        new Date(c.createdAt).toLocaleDateString(),
        c.contractsCount || 0
      ].map(field => `"${(field || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clients_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "pdf") {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Clients Export", 14, 15);
    
    const tableData = clients.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.email || "N/A",
      c.phone || "N/A",
      c.status || "N/A",
      new Date(c.createdAt).toLocaleDateString(),
      (c.contractsCount || 0).toString()
    ]);

    autoTable(doc, {
      head: [["Client Name", "Email", "Phone", "Status", "Date Added", "Contracts"]],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`Clients_Export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};

