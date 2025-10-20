// ===== CÀI ĐẶT & KÍCH HOẠT =====
self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// ===== FETCH =====
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

// ===== NHẬN THÔNG BÁO PUSH =====
self.addEventListener('push', event => {
  console.log('📩 Push received:', event.data ? event.data.text() : '(no payload)');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Thông báo mới", body: event.data.text() };
  }

  const title = data.title || "📊 Theo dõi cân nặng";
  const body = data.body || "Hãy nhập cân nặng hôm nay để duy trì thói quen tốt 💪";
  const icon = data.icon || "icon-192.png";

  const options = {
    body,
    icon,
    badge: icon,
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ===== KHI NHẤN VÀO THÔNG BÁO =====
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
