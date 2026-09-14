importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js"
);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp({
  apiKey: "AIzaSyCTUr0TayQbS_-j4FYXfZhnuJxr9HCNODo",
  authDomain: "annuity-valt.firebaseapp.com",
  projectId: "annuity-valt",
  storageBucket: "annuity-valt.firebasestorage.app",
  messagingSenderId: "534879208435",
  appId: "1:534879208435:web:da60a3c47c6f07d43e4886",
});

const messaging = firebase.messaging();
// 👀 Background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload);
  const title =
    payload.notification?.title ||
    payload.data?.title ||
    payload.title ||
    "Annuity Vault";
  const body =
    payload.notification?.body ||
    payload.data?.body ||
    payload.body ||
    "";
  const icon =
    payload.notification?.icon ||
    payload.data?.icon ||
    "/images/logo.png";

  self.registration.showNotification(title, {
    body,
    icon,
    data: { url: payload.fcmOptions?.link || payload.data?.url || "/dashboard" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});
