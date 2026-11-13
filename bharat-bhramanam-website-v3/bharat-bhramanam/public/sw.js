// Bharat Bhramanam service worker: the app opens without internet, and photos you have seen stay available.
const VERSION = "20261113-8d055a41";
const SHELL = 'bb-shell-' + VERSION, PHOTOS = 'bb-photos-v1', PHOTO_LIMIT = 500;
const FILES = ["./","index.html","app.js","app.css","fonts/anek-latin.woff2","fonts/anek-latin-ext.woff2","img/relief-l-s.webp","img/relief-d-s.webp","img/relief-l.webp","img/relief-d.webp","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== PHOTOS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function trim() { const c = await caches.open(PHOTOS), keys = await c.keys(); for (let i = 0; i < keys.length - PHOTO_LIMIT; i++) await c.delete(keys[i]); }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/') || url.pathname.endsWith('/config.js')) return;             // always from the network
    if (req.mode === 'navigate') { e.respondWith(fetch(req).then(res => { if (res.ok && (url.pathname === '/' || url.pathname.endsWith('/index.html'))) { const copy = res.clone(); caches.open(SHELL).then(c => c.put('index.html', copy)); } return res; }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))); return; }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); } return res; })));
    return;
  }
  if (url.hostname === 'upload.wikimedia.org') {
    e.respondWith(caches.open(PHOTOS).then(c => c.match(req.url).then(hit => hit || fetch(req).then(res => { if (res.ok && res.type !== 'opaque') { c.put(req.url, res.clone()); trim(); } return res; }))));
  }
});
