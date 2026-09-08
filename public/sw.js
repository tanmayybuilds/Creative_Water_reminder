// Basic Service Worker placeholder for offline caching readiness
const CACHE_NAME = "lockin-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Let the browser handle standard requests; offline caching logic to be expanded in later steps
});
