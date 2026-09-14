"use client";

import { requestNotificationPermission } from "@/config/request-notification-permission";
import { messaging, onMessage } from "@/config/firebase";
import { useAppSelector } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsKeys } from "@/features/notifications/api/notifications.service";
import toast from "react-hot-toast";

const NotificationPermission = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const hasRequested = useRef(false);
  const queryClient = useQueryClient();

  // 1. Ask for permission & register FCM token when entering the dashboard
  useEffect(() => {
    if (isAuthenticated && pathname.startsWith("/dashboard") && !hasRequested.current) {
      hasRequested.current = true;
      requestNotificationPermission();
    }
  }, [isAuthenticated, pathname]);

  // 2. Foreground Notification Listener
  useEffect(() => {
    if (typeof window === "undefined" || !messaging) return;

    const unsubscribe = onMessage(messaging, async (payload) => {
      console.log("Foreground notification received:", payload);

      // Refresh the notifications bell
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });

      const title =
        payload.notification?.title ||
        (payload.data?.title as string) ||
        "New Notification";
      const body =
        payload.notification?.body || (payload.data?.body as string) || "";
      const icon =
        payload.notification?.icon ||
        (payload.data?.icon as string) ||
        "/images/logo.png";
      const targetUrl =
        payload.fcmOptions?.link ||
        (payload.data?.url as string) ||
        "/dashboard";

      // 1. In-app toast
      toast(`${title}${body ? `: ${body}` : ""}`, {
        icon: "🔔",
      });

      // 2. Native OS browser notification via active service worker
      if (Notification.permission !== "granted") return;

      try {
        // navigator.serviceWorker.ready resolves with the active service worker registration
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon,
          badge: "/images/logo.png",
          data: { url: targetUrl },
        });
      } catch (e) {
        console.error("Error displaying native notification:", e);
        // Fallback: direct Notification API (no icon click handling)
        new Notification(title, { body, icon });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return null;
};

export default NotificationPermission;