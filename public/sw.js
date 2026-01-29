const CACHE_NAME = "market-on-cache-v2";
const OFFLINE_URL = "/offline";

const URLS_TO_CACHE = [
    "/",
    "/offline",
    "/schedule/my-shifts",
    "/globals.css",
    "/icon.png",
    "/icon-512.png"
];

// Install Event
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Event - Stale-while-revalidate for assets, Network-first for pages
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Handle Page Navigations
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(request).then((response) => {
                    return response || caches.match(OFFLINE_URL);
                });
            })
        );
        return;
    }

    // Handle Assets (Images, CSS, etc.)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(request);
        })
    );
});

// Push Notification Event
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : { title: "New Notification", body: "Something happened in Market ON!" };

    const options = {
        body: data.body,
        icon: "/icon.png",
        badge: "/icon.png",
        vibrate: [100, 50, 100],
        data: {
            url: data.url || "/"
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
