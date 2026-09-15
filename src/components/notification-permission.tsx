"use client";

import { requestNotificationPermission } from "@/config/request-notification-permission";
import { messaging, onMessage } from "@/config/firebase";
import { useAppSelector } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsKeys } from "@/features/notifications/api/notifications.service";

// Module-level SW registration cache to avoid repeated lookups
let swRegistrationCache: ServiceWorkerRegistration | null = null;

/**
 * Resolves a potentially relative URL path to a full absolute URL for OS notification bridges.
 */
function toAbsoluteUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin).href;
  }
  return path;
}

export async function showBrowserNotification(
  title: string,
  body: string,
  icon: string = "/images/logo.png",
  targetUrl: string = "/dashboard"
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[FCM] This browser does not support notifications.");
    return false;
  }

  // Ensure permission is granted or request it if default
  let currentPermission = Notification.permission;
  if (currentPermission === "default") {
    currentPermission = await Notification.requestPermission();
  }

  if (currentPermission !== "granted") {
    console.warn("[FCM] Notification permission is not granted:", currentPermission);
    return false;
  }

  const absoluteIcon = toAbsoluteUrl(icon || "/images/logo.png");
  const absoluteBadge = toAbsoluteUrl("/images/logo.png");
  const resolvedUrl = toAbsoluteUrl(targetUrl || "/dashboard");

  // ── Strategy 1: Service Worker showNotification (Primary & Standard) ───────────
  if ("serviceWorker" in navigator) {
    try {
      let reg = swRegistrationCache;

      if (!reg || !reg.active) {
        reg = (await navigator.serviceWorker.getRegistration()) || null;
      }

      if (!reg) {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        reg = await navigator.serviceWorker.ready;
      }

      if (reg) {
        swRegistrationCache = reg;
        await reg.showNotification(title, {
          body,
          icon: absoluteIcon,
          badge: absoluteBadge,
          tag: `annuity-vault-${Date.now()}`,
          renotify: true,
          requireInteraction: false,
          data: { url: resolvedUrl },
        } as any);

        console.log("[FCM] ✅ Native notification displayed via Service Worker");
        return true;
      }
    } catch (swErr) {
      console.warn("[FCM] SW showNotification failed, trying fallback:", swErr);
    }
  }

  // ── Strategy 2: Direct Notification constructor (Fallback) ───────────────────
  try {
    const notification = new Notification(title, {
      body,
      icon: absoluteIcon,
      tag: `annuity-vault-${Date.now()}`,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      window.location.href = resolvedUrl;
      notification.close();
    };

    console.log("[FCM] ✅ Native notification displayed via Notification constructor fallback");
    return true;
  } catch (directErr) {
    console.error("[FCM] ❌ Direct Notification API failed:", directErr);
    return false;
  }
}

const NotificationPermission = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // 1. Ask for permission & register FCM token whenever visiting the dashboard
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const isDashboard = pathname.startsWith("/dashboard");
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("auth-token");

    if (isDashboard && (isAuthenticated || hasToken)) {
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