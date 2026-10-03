// Offline support: the app shell is cached so the map opens without internet.
const CACHE = "bharat-bhramanam-c94bf9739e";
const SHELL = ["./", "index.html", "fonts/bricolage-grotesque-latin-500-normal.woff2", "fonts/bricolage-grotesque-latin-700-normal.woff2", "fonts/bricolage-grotesque-latin-800-normal.woff2", "fonts/bricolage-grotesque-latin-ext-500-normal.woff2", "fonts/bricolage-grotesque-latin-ext-700-normal.woff2", "fonts/bricolage-grotesque-latin-ext-800-normal.woff2", "fonts/cormorant-garamond-latin-500-italic.woff2", "fonts/cormorant-garamond-latin-600-italic.woff2", "fonts/cormorant-garamond-latin-ext-500-italic.woff2", "fonts/cormorant-garamond-latin-ext-600-italic.woff2", "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/ibm-plex-mono-latin-ext-400-normal.woff2", "fonts/ibm-plex-mono-latin-ext-500-normal.woff2", "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2", "fonts/ibm-plex-sans-latin-ext-400-normal.woff2", "fonts/ibm-plex-sans-latin-ext-500-normal.woff2", "fonts/ibm-plex-sans-latin-ext-600-normal.woff2", "styles.css", "app.js", "relief.webp", "vendor/d3.min.js", "vendor/topojson.min.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin === location.origin && !url.pathname.startsWith("/api/") && !url.pathname.endsWith("/config.js")){
    e.respondWith(caches.match(req, {ignoreSearch:true}).then(hit => hit || fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })).catch(() => caches.match("index.html")));
  }
});
