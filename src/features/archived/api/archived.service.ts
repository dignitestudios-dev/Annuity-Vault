import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type ArchivedType = "clients" | "contracts" | "notes" | "documents";

export interface ArchivedItem {
  id: string;
  label: string;
  subtitle: string;
  archivedAt: string;
  daysLeft: number;
}

export interface ArchivedResponse {
  data: ArchivedItem[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ArchivedParams {
  type: ArchivedType;
  page?: number;
  limit?: number;
  search?: string;
}

export const archivedKeys = {
  all: ["archived"] as const,
  lists: () => [...archivedKeys.all, "list"] as const,
  list: (type: ArchivedType, filters: Omit<ArchivedParams, "type">) => [...archivedKeys.lists(), type, filters] as const,
};

const getArchived = async ({ type, ...params }: ArchivedParams): Promise<ArchivedResponse> => {
  const { data } = await axiosInstance.get<ArchivedResponse>(`/archived/${type}`, { params });
  return data;
};

const restoreArchived = async ({ type, id }: { type: ArchivedType; id: string }): Promise<void> => {
  await axiosInstance.patch(`/archived/${type}/${id}/restore`);
};

const deleteArchived = async ({ type, id }: { type: ArchivedType; id: string }): Promise<void> => {
  await axiosInstance.delete(`/archived/${type}/${id}`);
};

export const useArchived = (params: ArchivedParams) => {
  const { type, ...filters } = params;
  return useQuery({
    queryKey: archivedKeys.list(type, filters),
    queryFn: () => getArchived(params),
  });
};

export const useRestoreArchived = (type: ArchivedType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreArchived({ type, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: archivedKeys.lists() });
    },
  });
};

export const useDeleteArchived = (type: ArchivedType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteArchived({ type, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: archivedKeys.lists() });
    },
  });
};
