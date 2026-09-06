self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  let data = { title: "myurusdream.be", body: "Nieuw bericht", url: "/", badge: 1 };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* keep default */
  }
  const existing = await self.registration.getNotifications();
  const count = Math.max(1, Number(data.badge) || existing.length + 1);
  if (self.navigator && self.navigator.setAppBadge) {
    try {
      await self.navigator.setAppBadge(count);
    } catch {
      /* ignore */
    }
  }
  await self.registration.showNotification(data.title || "myurusdream.be", {
    body: data.body || "Nieuw bericht",
    icon: "/3.png",
    badge: "/3.png",
    image: "/5.png",
    tag: data.noticeId || "myurusdream-" + Date.now(),
    renotify: true,
    vibrate: [120, 80, 120],
    data: { url: data.url || "/" },
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge().catch(() => undefined);
  }
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.focus();
          return client;
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
