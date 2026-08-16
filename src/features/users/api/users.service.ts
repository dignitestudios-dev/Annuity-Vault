import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "Admin" | "Advisor";
  status: "Active" | "Inactive";
  jobTitle?: string;
  firm?: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "Active" | "Inactive";
}

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (filters: UsersQuery) => [...usersKeys.lists(), filters] as const,
};

const getUsers = async (params: UsersQuery): Promise<UsersResponse> => {
  const { data } = await axiosInstance.get<UsersResponse>("/users", {
    params: {
      page: params.page || 1,
      limit: params.limit || 100,
      search: params.search || undefined,
      status: params.status || undefined,
    },
  });
  return data;
};

export const useUsers = (filters: UsersQuery = {}) => {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => getUsers(filters),
  });
};
