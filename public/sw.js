/**
 * Service Worker for PWA and Offline Support
 */

const CACHE_NAME = "tikoncha-chat-v1";
const OFFLINE_URL = "/offline.html";

const CACHE_URLS = ["/", "/index.html", "/offline.html", "/manifest.json"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_URLS).catch(() => {
                // Ignore pre-cache failures.
            });
        }),
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                }),
            );
        }),
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    if (
        event.request.url.startsWith("ws://") ||
        event.request.url.startsWith("wss://")
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();

                if (
                    response.status === 200 &&
                    event.request.url.startsWith("http")
                ) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    if (event.request.mode === "navigate") {
                        return caches.match(OFFLINE_URL);
                    }

                    return new Response("Network error", {
                        status: 408,
                        headers: { "Content-Type": "text/plain" },
                    });
                });
            }),
    );
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
