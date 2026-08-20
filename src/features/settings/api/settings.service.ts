import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

// =======================
// Types
// =======================
export interface ProfilePayload {
  name?: string;
  phone?: string;
  jobTitle?: string;
  firm?: string;
}

export interface PasswordPayload {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface NotificationPreferences {
  anniversaryAlerts: {
    days30: boolean;
    days60: boolean;
    days90: boolean;
    days180: boolean;
  };
  taskDueDates: boolean;
  systemAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorAuthentication: boolean;
  sessionTimeout: string;
  auditRetention: string;
  encryptionAtRest: boolean;
}

export interface GoogleCalendarStatus {
  connected: boolean;
}

export interface GoogleCalendarConnect {
  authUrl: string;
}

export const settingsKeys = {
  all: ["settings"] as const,
  profile: () => [...settingsKeys.all, "profile"] as const, // This would normally merge with auth/me
  notificationPreferences: () => [...settingsKeys.all, "notification-preferences"] as const,
  security: () => [...settingsKeys.all, "security"] as const,
  googleCalendar: () => [...settingsKeys.all, "google-calendar"] as const,
};

// =======================
// Profile & Password
// =======================
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfilePayload) => {
      const { data } = await axiosInstance.patch("/settings/profile", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] }); // assuming profile affects auth/me
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (payload: PasswordPayload) => {
      const { data } = await axiosInstance.patch("/settings/password", payload);
      return data;
    },
  });
};

// =======================
// Notification Preferences
// =======================
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: settingsKeys.notificationPreferences(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: NotificationPreferences }>("/settings/notification-preferences");
      return data.data;
    },
    retry: false, // 403 for admin
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<NotificationPreferences>) => {
      const { data } = await axiosInstance.patch("/settings/notification-preferences", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notificationPreferences() });
    },
  });
};

// =======================
// Security & Legal
// =======================
export const useSecuritySettings = () => {
  return useQuery({
    queryKey: settingsKeys.security(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: SecuritySettings }>("/settings/security");
      return data.data;
    },
  });
};

// =======================
// Google Calendar
// =======================
export const useGoogleCalendarStatus = () => {
  return useQuery({
    queryKey: settingsKeys.googleCalendar(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: GoogleCalendarStatus }>("/settings/google-calendar/status");
      return data.data;
    },
  });
};

export const connectGoogleCalendar = async (): Promise<GoogleCalendarConnect> => {
  const { data } = await axiosInstance.get<{ data: GoogleCalendarConnect }>("/settings/google-calendar/connect");
  return data.data;
};

export const useDisconnectGoogleCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete("/settings/google-calendar/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.googleCalendar() });
    },
  });
};

// =======================
// Data Management
// =======================
export const useResetData = () => {
  return useMutation({
    mutationFn: async (password: string) => {
      await axiosInstance.post("/settings/data/reset", { password });
    },
  });
};

export const exportAllData = async (): Promise<void> => {
  const response = await axiosInstance.get("/settings/data/export", {
    responseType: "blob",
  });
  
  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AnnuityVault_Export_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
