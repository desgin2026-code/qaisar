const CACHE_NAME = 'qaisar-v1';
const URLS_TO_CACHE = [
  '/qaisar/',
  '/qaisar/index.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

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

  // Firebase و external APIs — دايماً من النت
  if (url.includes('firestore') || url.includes('firebase') || url.includes('wa.me')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // خزّن الملفات المهمة
        if (response.ok && (url.includes('/qaisar/') || url.includes('chart.js') || url.includes('cairo') || url.includes('qrcode'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // لو مفيش نت — رجّع من الكاش
        return caches.match('/qaisar/index.html') || caches.match('/qaisar/');
      });
    })
  );
});
