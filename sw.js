const CACHE_NAME = 'shadows-pwa-v6';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const cached = await caches.match(e.request);
      const fetchPromise = fetch(e.request).then(async (res) => {
        try {
          const cache = await caches.open(CACHE_NAME);
          cache.put(e.request, res.clone());
        } catch {}
        return res;
      });
      return cached || await fetchPromise;
    } catch {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
