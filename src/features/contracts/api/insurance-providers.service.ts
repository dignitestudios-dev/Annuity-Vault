import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface InsuranceProvider {
  _id: string;
  name: string;
  createdBy?: string;
  createdByType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetInsuranceProvidersResponse {
  success: boolean;
  data: InsuranceProvider[];
}

export const useInsuranceProviders = (search?: string) => {
  return useQuery({
    queryKey: ["insurance-providers", search],
    queryFn: async () => {
      const response = await axiosInstance.get<GetInsuranceProvidersResponse>(
        "/insurance-providers",
        {
          params: search ? { search } : undefined,
        }
      );
      return response.data?.data || [];
    },
  });
};

export const useCreateInsuranceProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await axiosInstance.post<{
        success: boolean;
        data: InsuranceProvider;
        message?: string;
      }>("/insurance-providers", { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-providers"] });
    },
  });
};
