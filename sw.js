/* سند — يحفظ صفحة الغلاف والأيقونات في الجوال عشان تفتح بسرعة
   (بيانات النظام نفسها ما تنحفظ هنا، تروح للشيت مباشرة) */
var CACHE = 'sanad-v7';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* ملفات الغلاف: من النت أول (عشان أي تحديث يوصل)، ولو ما فيه نت من المحفوظ */
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); }); }));
});

/* v7.3: إشعارات الجوال — يوصل من Firebase ويطلع حتى لو التطبيق مسكّر */
self.addEventListener('push', function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { try { d = { data: { b: e.data.text() } }; } catch (y) {} }
  var m = d.data || d, n = d.notification || {};
  e.waitUntil(self.registration.showNotification(m.t || n.title || 'سند', {
    body: m.b || n.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: m.tag || 'sanad', renotify: true,
    dir: 'auto', vibrate: [200, 100, 200], data: { u: m.u || './' }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var u = new URL((e.notification.data && e.notification.data.u) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ws) {
    for (var i = 0; i < ws.length; i++) if (ws[i].url.indexOf(self.registration.scope) === 0 && 'focus' in ws[i]) return ws[i].focus();
    return self.clients.openWindow(u);
  }));
});
