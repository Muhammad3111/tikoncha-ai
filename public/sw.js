/**
 * Service Worker for PWA and Offline Support
 */

const CACHE_NAME = "tikoncha-chat-v1";
const OFFLINE_URL = "/offline.html";
const LOG_PREFIX = "[Mobile Debug][SW]";

const CACHE_URLS = ["/", "/index.html", "/offline.html", "/manifest.json"];

const stringifyPayload = (payload) => {
    if (payload === null || typeof payload === "undefined") {
        return "";
    }

    if (typeof payload === "string") {
        return payload;
    }

    try {
        return JSON.stringify(payload);
    } catch (_error) {
        return String(payload);
    }
};

const swLog = (level, label, payload) => {
    const logger =
        typeof console[level] === "function"
            ? console[level].bind(console)
            : console.log.bind(console);
    const payloadText = stringifyPayload(payload);
    const message = payloadText
        ? `${LOG_PREFIX} ${label}: ${payloadText}`
        : `${LOG_PREFIX} ${label}`;
    logger(message);
};

self.addEventListener("install", (event) => {
    swLog("log", "Service Worker installing");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            swLog("log", "Service Worker caching files", CACHE_URLS);
            return cache.addAll(CACHE_URLS).catch((error) => {
                swLog("error", "Service Worker cache failed", {
                    message: error?.message || String(error),
                    stack: error?.stack,
                });
            });
        }),
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    swLog("log", "Service Worker activating");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        swLog("log", "Service Worker deleting old cache", {
                            cacheName,
                        });
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
