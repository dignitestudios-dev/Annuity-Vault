import { getToken, messaging } from "./firebase";
import { authService } from "@/features/auth/api/auth.service";

export const requestNotificationPermission = async () => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Wait until the Service Worker is fully activated before subscribing to push notifications
    const activeRegistration = await navigator.serviceWorker.ready;

    if (!activeRegistration) {
      return;
    }

    if (!messaging) {
      console.warn("Firebase messaging is not initialized.");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: activeRegistration,
    });

    console.log("[FCM] Obtained FCM Token:", token);

    if (!token) {
      return;
    }

    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      const response = await authService.updateFcmToken(token);
      console.log("[FCM] Sent token to backend:", response);
    }

    return token;
  } catch (error) {
    console.error("[FCM] Error Requesting Notification Permission:", error);
    return;
  }
};