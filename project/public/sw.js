/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'restaurant-menu-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force activation of the new service worker immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Fetch and cache but don't fail the install if one asset fails
      return Promise.allSettled(
        ASSETS.map((asset) =>
          fetch(asset)
            .then((res) => {
              if (res.ok) {
                return cache.put(asset, res);
              }
            })
            .catch((err) => console.warn(`Failed to preload asset during install: ${asset}`, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old service worker cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediately take control of all active clients
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Skip browser-sync or dev socket connections
  const url = new URL(e.request.url);
  if (url.pathname.includes('socket.io') || url.pathname.includes('vite') || url.hostname.includes('localhost') && url.port === '5173') {
    return;
  }

  // Network-First falling back to Cache
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Only cache successful basic GET responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline or connection failed - return cached fallback
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If we can't find it in cache and it's a page navigation, return root index
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
