import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const authService = {
  getProfile: async (): Promise<User> => {
    const { data } = await axiosInstance.get<{
      success?: boolean;
      data?: User;
      user?: User;
    }>("/auth/me");
    return (data?.data || data?.user || data) as User;
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<{ success: boolean; data: LoginResponse }>("/auth/login", credentials);
    // Based on the guide, response might just be the envelope or the data directly.
    // Assuming enveloped response: { success: true, data: { token, account: {...} } }
    // but the guide says POST /auth/login -> { token, account: {...} }. 
    // Usually enveloped: 
    return data.data ? data.data : (data as unknown as LoginResponse);
  },

  forgotPassword: async (credentials: ForgotPasswordCredentials): Promise<any> => {
    const { data } = await axiosInstance.post("/auth/forgot-password", credentials);
    return data;
  },

  verifyOtp: async (credentials: VerifyOtpCredentials): Promise<{ resetToken: string }> => {
    const { data } = await axiosInstance.post<{
      success?: boolean;
      data?: { resetToken: string };
      resetToken?: string;
    }>("/auth/verify-otp", credentials);
    const resetToken = data?.data?.resetToken || data?.resetToken || "";
    return { resetToken };
  },

  resetPassword: async (credentials: ResetPasswordCredentials): Promise<any> => {
    const { data } = await axiosInstance.post("/auth/reset-password", credentials);
    return data;
  },

  resendOtp: async (credentials: ResendOtpCredentials): Promise<any> => {
    const { data } = await axiosInstance.post("/auth/resend-otp", credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  updateFcmToken: async (fcmToken: string): Promise<any> => {
    const { data } = await axiosInstance.patch("/auth/fcm-token", { fcmToken });
    return data;
  },
};

// React Query Hooks
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: authService.verifyOtp,
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: authService.resendOtp,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authService.logout,
  });
};

export const useUpdateFcmTokenMutation = () => {
  return useMutation({
    mutationFn: (fcmToken: string) => authService.updateFcmToken(fcmToken),
  });
};

export const useGetProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getProfile,
    enabled: options?.enabled ?? true,
  });
};

