// ============================ SERVICE WORKER ============================
importScripts("https://cdn.bootcdn.net/ajax/libs/workbox-sw/7.3.0/workbox-sw.js");

// Generate cache version based on date
function generateCacheVersion() {
  const d = new Date();
  return `v${d.getFullYear().toString().slice(-2)}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`;
}

const CACHE_VERSION = generateCacheVersion();
const MAX_ENTRIES = 300;
const OFFLINE_FALLBACK_URL = "/offline.html";

// Cache names
const CACHE_NAMES = {
  html: `${CACHE_VERSION}-html`,
  font: `${CACHE_VERSION}-font`,
  cdn: `${CACHE_VERSION}-cdn`,
  imgBucket: `${CACHE_VERSION}-img-bucket`,
  imgStatic: `${CACHE_VERSION}-img-static`,
  static: `${CACHE_VERSION}-static`,
  manifest: `${CACHE_VERSION}-manifest`,
  offline: `${CACHE_VERSION}-offline`,
};

if (workbox) {
  console.log("✅ Workbox loaded");

  // Non-cacheable files
  workbox.routing.registerRoute(
    /^https:\/\/cuterwrite\.top\/(index|sitemap)\.xml$/,
    new workbox.strategies.NetworkOnly()
  );

  // HTML Pages
  workbox.routing.registerRoute(
    /\.html$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE_NAMES.html,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: MAX_ENTRIES, maxAgeSeconds: 30 * 86400 }),
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    })
  );

  // Fonts
  workbox.routing.registerRoute(
    /\.(woff2?|ttf|otf|eot)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE_NAMES.font,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: MAX_ENTRIES, maxAgeSeconds: 30 * 86400 }),
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    })
  );

  // CDN Assets
  workbox.routing.registerRoute(
    /^https:\/\/(?:cdn\.bootcdn\.net|unpkg\.com|cdn\.jsdelivr\.net)/,
    new workbox.strategies.CacheFirst({
      cacheName: CACHE_NAMES.cdn,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: MAX_ENTRIES, maxAgeSeconds: 30 * 86400 }),
      ],
    })
  );

  // Image Bucket
  workbox.routing.registerRoute(
    /^https:\/\/(?:cuterwrite-1302252842\.file\.myqcloud\.com|s2\.loli\.net)/,
    new workbox.strategies.CacheFirst({
      cacheName: CACHE_NAMES.imgBucket,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: MAX_ENTRIES, maxAgeSeconds: 30 * 86400 }),
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    })
  );

  // Static Images
  workbox.routing.registerRoute(
    /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE_NAMES.imgStatic,
    })
  );

  // CSS & JS
  workbox.routing.registerRoute(
    /\.(css|js)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE_NAMES.static,
    })
  );

  // Manifest
  workbox.routing.registerRoute(
    /\/manifest\.json$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: CACHE_NAMES.manifest,
    })
  );

  // Offline Fallback
  workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === 'document') {
      const cache = await caches.open(CACHE_NAMES.offline);
      const cachedResponse = await cache.match(OFFLINE_FALLBACK_URL);
      return cachedResponse || Response.error();
    }
    return Response.error();
  });

  // Default Fallback
  workbox.routing.setDefaultHandler(
    new workbox.strategies.NetworkFirst({ networkTimeoutSeconds: 3 })
  );
} else {
  console.log("❌ Workbox failed to load");
}

// Prefetch feed content
async function prefetchFromFeed() {
  try {
    const res = await fetch('/index.xml');
    const xmlText = await res.text();
    const links = [...xmlText.matchAll(/<link>(.*?)<\/link>/g)]
      .map(m => m[1])
      .filter(url => url.startsWith('http'))
      .slice(0, 10);

    const cache = await caches.open(CACHE_NAMES.html);
    for (const url of links) {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(new Request(url), response.clone());
        console.log('[Prefetch] Cached:', url);
      }
    }
  } catch (err) {
    console.warn('[Prefetch] Failed:', err);
  }
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await prefetchFromFeed();

      try {
        const cache = await caches.open(CACHE_NAMES.offline);
        const offlineRes = await fetch(OFFLINE_FALLBACK_URL);
        if (offlineRes.ok) {
          await cache.put(OFFLINE_FALLBACK_URL, offlineRes);
          console.log('[SW] Cached offline fallback');
        }
      } catch (e) {
        console.warn('[SW] Offline fallback failed to cache:', e);
      }
    })()
  );
});

// Push Notification
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notification";
  const options = {
    body: data.body || "You have a new message.",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
