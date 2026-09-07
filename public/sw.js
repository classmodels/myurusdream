self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  event.waitUntil(showPush(event));
});

async function showPush(event) {
  let title = "myurusdream.be";
  let body = "Nieuw bericht";
  let url = "/";
  let badge = 1;
  try {
    if (event.data) {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      url = data.url || url;
      badge = Number(data.badge) || 1;
    }
  } catch {
    try {
      body = event.data ? event.data.text() : body;
    } catch {
      /* keep default */
    }
  }
  const origin = self.location.origin;
  await self.registration.showNotification(title, {
    body,
    icon: origin + "/3.png",
    data: { url },
  });
  if (self.navigator && self.navigator.setAppBadge) {
    try {
      await self.navigator.setAppBadge(badge);
    } catch {
      /* iOS older */
    }
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge().catch(() => undefined);
  }
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(self.clients.openWindow(target));
});
