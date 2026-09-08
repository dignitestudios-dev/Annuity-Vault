import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<{ success: boolean; data: LoginResponse }>("/auth/login", credentials);
    // Based on the guide, response might just be the envelope or the data directly.
    // Assuming enveloped response: { success: true, data: { token, account: {...} } }
    // but the guide says POST /auth/login -> { token, account: {...} }. 
    // Usually enveloped: 
    return data.data ? data.data : (data as unknown as LoginResponse);
  },

  forgotPassword: async (credentials: ForgotPasswordCredentials): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", credentials);
  },

  verifyOtp: async (credentials: VerifyOtpCredentials): Promise<{ resetToken: string }> => {
    const { data } = await axiosInstance.post<{ success: boolean; data: { resetToken: string } }>("/auth/verify-otp", credentials);
    return data.data ? data.data : (data as unknown as { resetToken: string });
  },

  resetPassword: async (credentials: ResetPasswordCredentials): Promise<void> => {
    await axiosInstance.post("/auth/reset-password", credentials);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  }
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
