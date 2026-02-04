// Service Worker for Push Notifications

self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installé");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activé");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[SW] Push reçu:", event);

  let data = {
    title: "StreamFlix",
    body: "Nouvelle notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {},
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (error) {
    console.error("[SW] Erreur parsing push data:", error);
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: "open",
        title: "Voir",
      },
      {
        action: "close",
        title: "Fermer",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification cliquée:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Open the app or focus existing window
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already an open window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle background sync for offline notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "check-new-episodes") {
    console.log("[SW] Sync: check-new-episodes");
    // Background sync logic would go here
  }
});
