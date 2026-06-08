/* A-VI Command — Service Worker v1.0 */
const CACHE_NAME = 'avi-v1';
const STATIC_ASSETS = [
  './a-vi-command.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@0.447.0/dist/umd/lucide.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* ไม่ cache API calls (proxy) */
  if (url.hostname.includes('supasiao') || url.hostname.includes('workers.dev')) {
    return;
  }

  /* Cache-first สำหรับ assets, Network-first สำหรับ HTML */
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./a-vi-command.html'))
    );
  } else {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }))
    );
  }
});
