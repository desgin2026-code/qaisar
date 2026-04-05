// ============================================================
// Service Worker — سنتر القيصر
// ============================================================
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'qaisar-v2';

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

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (
    url.includes('onesignal.com') ||
    url.includes('firestore') ||
    url.includes('firebase') ||
    url.includes('wa.me')
  ) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(response => {
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
      return caches.match(event.request).then(cached => {
        return cached || caches.match('/qaisar/index.html') || caches.match('/qaisar/');
      });
    })
  );
});
