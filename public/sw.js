// Minimal service worker: cache shell assets so the app launches offline-y.
// Realtime + API calls are network-first and bypass the cache.

const CACHE = "spritzulator-v1";
const SHELL = ["/", "/manifest.webmanifest", "/grain.svg", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/_next/data")) return;
  if (url.hostname.endsWith("supabase.co")) return;

  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached)
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && SHELL.includes(url.pathname)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((c) => c || new Response("", { status: 504 })))
  );
});
