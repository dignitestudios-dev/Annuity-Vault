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
  profilePicture?: File | string | null;
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

export interface MicrosoftCalendarStatus {
  connected: boolean;
}

export interface MicrosoftCalendarConnect {
  authUrl: string;
}

export interface MicrosoftCalendarSyncResult {
  tasksCount: number;
  anniversariesCount: number;
}

export type GoogleCalendarStatus = MicrosoftCalendarStatus;
export type GoogleCalendarConnect = MicrosoftCalendarConnect;

export const settingsKeys = {
  all: ["settings"] as const,
  profile: () => [...settingsKeys.all, "profile"] as const, // This would normally merge with auth/me
  notificationPreferences: () => [...settingsKeys.all, "notification-preferences"] as const,
  security: () => [...settingsKeys.all, "security"] as const,
  microsoftCalendar: () => [...settingsKeys.all, "microsoft-calendar"] as const,
  googleCalendar: () => [...settingsKeys.all, "microsoft-calendar"] as const,
};

// =======================
// Profile & Password
// =======================
export const useProfile = () => {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        success?: boolean;
        data?: User;
        user?: User;
      }>("/auth/me");
      return (data?.data || data?.user || data) as User;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfilePayload | FormData) => {
      let dataToSend: any;
      let headers: Record<string, string> | undefined = undefined;

      if (payload instanceof FormData) {
        dataToSend = payload;
        headers = { "Content-Type": "multipart/form-data" };
      } else if (payload.profilePicture instanceof File) {
        const formData = new FormData();
        if (payload.name) formData.append("name", payload.name);
        if (payload.phone) formData.append("phone", payload.phone);
        if (payload.jobTitle) formData.append("jobTitle", payload.jobTitle);
        if (payload.firm) formData.append("firm", payload.firm);
        formData.append("profilePicture", payload.profilePicture);
        dataToSend = formData;
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        dataToSend = payload;
      }

      const { data } = await axiosInstance.patch(
        "/settings/profile",
        dataToSend,
        headers ? { headers } : undefined
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
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
// Microsoft Calendar
// =======================
export const useMicrosoftCalendarStatus = () => {
  return useQuery({
    queryKey: settingsKeys.microsoftCalendar(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: MicrosoftCalendarStatus }>("/settings/microsoft-calendar/status");
      return data.data;
    },
  });
};

export const connectMicrosoftCalendar = async (): Promise<MicrosoftCalendarConnect> => {
  const { data } = await axiosInstance.get<{ data: MicrosoftCalendarConnect }>("/settings/microsoft-calendar/connect");
  return data.data;
};

export const useDisconnectMicrosoftCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.delete<{ message: string; data: null }>("/settings/microsoft-calendar/disconnect");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.microsoftCalendar() });
    },
  });
};

export const useSyncMicrosoftCalendar = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post<{
        success: boolean;
        message: string;
        data: MicrosoftCalendarSyncResult;
      }>("/settings/microsoft-calendar/sync");
      return data;
    },
  });
};

// Aliases for backwards compatibility
export const useGoogleCalendarStatus = useMicrosoftCalendarStatus;
export const connectGoogleCalendar = connectMicrosoftCalendar;
export const useDisconnectGoogleCalendar = useDisconnectMicrosoftCalendar;

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
