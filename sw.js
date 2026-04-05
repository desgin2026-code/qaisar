// ============================================================
// Service Worker — سنتر القيصر
// يشتغل الاتنين: OneSignal (إشعارات) + PWA Cache (بدون نت)
// ============================================================

// ===== OneSignal (لازم يكون أول سطر) =====
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ===== PWA Cache =====
const CACHE_NAME = 'qaisar-v1';

// تثبيت وتخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/qaisar/',
        '/qaisar/index.html'
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// تفعيل وحذف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // OneSignal و Firebase و external APIs — دايماً من النت
  if (
    url.includes('onesignal.com') ||
    url.includes('firestore') ||
    url.includes('firebase') ||
    url.includes('wa.me')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && (
          url.includes('/qaisar/') ||
          url.includes('chart.js') ||
          url.includes('cairo') ||
          url.includes('qrcode')
        )) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match('/qaisar/index.html') || caches.match('/qaisar/');
      });
    })
  );
});
