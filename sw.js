const CACHE = "dandiya-scanner-v1";
const SHELL = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Never cache database calls
  if (url.hostname.endsWith("supabase.co")) return;
  // Page itself: network first (so updates show), cache as fallback
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      caches.open(CACHE).then(c => c.put("./", r.clone()));
      return r;
    }).catch(() => caches.match("./")));
    return;
  }
  // Everything else (icons, scanner library): cache first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
    return r;
  })));
});
