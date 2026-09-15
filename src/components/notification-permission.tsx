"use client";

import { requestNotificationPermission } from "@/config/request-notification-permission";
import { messaging, onMessage } from "@/config/firebase";
import { useAppSelector } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsKeys } from "@/features/notifications/api/notifications.service";
import toast from "react-hot-toast";

export async function showBrowserNotification(
  title: string,
  body: string,
  icon: string = "/images/logo.png",
  targetUrl: string = "/dashboard"
): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("[FCM] This browser does not support notifications.");
    return false;
  }

  if (Notification.permission !== "granted") {
    console.warn("[FCM] Notification permission not granted:", Notification.permission);
    return false;
  }

  // ── Strategy 1: Direct Notification API ────────────────────────────────────
  // Always works when the page is in the foreground (user just clicked a button).
  // This is the most reliable path and should be tried first.
  try {
    const n = new Notification(title, { body, icon });
    n.onclick = () => {
      window.focus();
      window.location.href = targetUrl;
    };
    console.log("[FCM] ✅ Native notification shown via Notification API");
    return true;
  } catch (directErr) {
    // Some browsers (e.g. Chrome on Android) don't allow new Notification() without SW
    console.warn("[FCM] Direct Notification() failed, trying SW:", directErr);
  }

  // ── Strategy 2: Service Worker showNotification ─────────────────────────────
  // Required on mobile Chrome; also works for background notifications.
  // getRegistration() takes the *scope* the SW covers, which defaults to "/".
  if (!("serviceWorker" in navigator)) return false;

  try {
    // Use scope "/" — that is the default scope for a SW registered from root
    const registration =
      swRegistrationCache ||
      (await navigator.serviceWorker.getRegistration("/")) ||
      (await navigator.serviceWorker.ready);

    if (!registration) throw new Error("No SW registration found");

    swRegistrationCache = registration;

    await registration.showNotification(title, {
      body,
      icon,
      badge: "/images/logo.png",
      data: { url: targetUrl },
      requireInteraction: false,
    });

    console.log("[FCM] ✅ Native notification shown via Service Worker");
    return true;
  } catch (swErr) {
    console.error("[FCM] ❌ Both notification strategies failed:", swErr);
    return false;
  }
}

// Module-level SW registration cache to avoid repeated lookups
let swRegistrationCache: ServiceWorkerRegistration | null = null;

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

  // 2. Dev helper: expose window.testNotification() in the browser console
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      (window as any).testNotification = () =>
        showBrowserNotification(
          "🔔 Test Notification",
          "Browser notifications are working correctly!",
          "/images/logo.png",
          "/dashboard"
        );
      console.info("[FCM] Dev helper ready — run window.testNotification() in the console to test.");
    }
  }, []);

  // 3. Foreground message listener — fires when the app tab is open & in focus
  useEffect(() => {
    if (typeof window === "undefined" || !messaging) return;

    const unsubscribe = onMessage(messaging, async (payload) => {
      console.log("[FCM] Foreground notification received:", payload);

      // Refresh the notifications bell badge
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

      // In-app toast (always shown)
      toast(`${title}${body ? `: ${body}` : ""}`, { icon: "🔔" });

      // Native browser notification (shown even when tab is in foreground)
      await showBrowserNotification(title, body, icon, targetUrl);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return null;
};

export default NotificationPermission;