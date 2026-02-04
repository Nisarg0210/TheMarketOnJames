const CACHE_NAME = "market-on-v3";
const OFFLINE_URL = "/offline";

const STATIC_ASSETS = [
    "/",
    "/offline",
    "/globals.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

// Install: Cache static assets and offline page
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    self.clients.claim();
});

// Fetch: Strategy Router
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Core Pages (Network First -> Cache -> Offline Fallback)
    // Used for Schedule, Inventory, Dashboard to ensure freshness but allow offline viewing
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Update cache with fresh version
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    // If offline, try cache
                    return caches.match(request).then((cachedResponse) => {
                        // If not in cache, show offline page
                        return cachedResponse || caches.match(OFFLINE_URL);
                    });
                })
        );
        return;
    }

    // 2. Static Assets (Stale-While-Revalidate)
    // Images, CSS, JS - serve fast from cache, update in background
    if (
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "image" ||
        request.destination === "font"
    ) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // 3. Default: Network Only
    // API calls, POST requests, etc.
});
