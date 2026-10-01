// Offline cache. Bump VERSION after uploading changed files so phones pick them up.
var VERSION = "ready-check-v1";
var FILES = ["./", "index.html", "manifest.webmanifest", "fonts/fonts.css",
  "fonts/unbounded-latin.woff2", "fonts/unbounded-latin-ext.woff2",
  "fonts/figtree-latin.woff2", "fonts/figtree-latin-ext.woff2",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon-32.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
// Network first, cache as fallback: updates arrive when online, app still opens offline.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
