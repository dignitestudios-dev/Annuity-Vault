import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface NotificationItem {
  id: string;
  _id?: string;
  type: "Anniversary" | "Task" | "System";
  title: string;
  message: string;
  relatedName?: string;
  relatedEntity?: {
    type: "Contract" | "Task";
    id?: string;
    _id?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: {
    notifications: NotificationItem[];
    unreadCount: number;
  };
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface NotificationsParams {
  type?: "Anniversary" | "Task" | "System";
  page?: number;
  limit?: number;
}

export const notificationsKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsKeys.all, "list"] as const,
  list: (filters: NotificationsParams) => [...notificationsKeys.lists(), filters] as const,
};

const getNotifications = async (params: NotificationsParams): Promise<NotificationsResponse> => {
  const { data } = await axiosInstance.get<NotificationsResponse>("/notifications", { params });
  if (data?.data?.notifications) {
    data.data.notifications = data.data.notifications.map((n: any) => ({
      ...n,
      id: n.id || n._id || "",
      relatedEntity: n.relatedEntity
        ? {
            ...n.relatedEntity,
            id: n.relatedEntity.id || n.relatedEntity._id || "",
          }
        : undefined,
    }));
  }
  return data;
};

const markAsRead = async (id: string): Promise<void> => {
  if (!id || id === "undefined" || id === "null") {
    console.warn("Attempted to mark notification as read with undefined ID");
    return;
  }
  await axiosInstance.patch(`/notifications/${id}/read`);
};

const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.patch(`/notifications/read-all`);
};

export const useNotifications = (params: NotificationsParams) => {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => getNotifications(params),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
};
