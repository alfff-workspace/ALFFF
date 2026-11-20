// ALFFF service worker: lets the app install and open offline. API calls are never touched.
const CACHE = 'alfff-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // leave Claude API + fonts alone
  e.respondWith(fetch(r).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); return res; }).catch(() => caches.match(r).then((m) => m || caches.match('index.html'))));
});
