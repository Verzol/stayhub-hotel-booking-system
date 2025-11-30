/**
 * Service Worker for StayHub
 * Handles caching, offline support, and background tasks
 */

const CACHE_NAME = 'stayhub-v1';
const API_CACHE_NAME = 'stayhub-api-v1';
const STATIC_CACHE_NAME = 'stayhub-static-v1';

// URLs to cache on install
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Take control of all pages
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with caching strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE_NAME);

  // Check cache first
  const cachedResponse = await cache.match(request);

  // For GET requests, try cache first
  if (cachedResponse) {
    // Check if cache is still valid (less than 5 minutes old for API responses)
    const cacheDate = cachedResponse.headers.get('sw-cache-date');
    if (cacheDate) {
      const age = Date.now() - parseInt(cacheDate);
      const maxAge = 5 * 60 * 1000; // 5 minutes

      if (age < maxAge) {
        // Serve from cache
        return cachedResponse;
      }
    } else {
      // No cache date, serve anyway but refresh in background
      fetchAndCache(request, cache);
      return cachedResponse;
    }
  }

  // Fetch from network
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const responseToCache = response.clone();

      // Add cache date header
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, cachedResponse);
    }

    return response;
  } catch (error) {
    // Network failed, try cache as fallback
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Network error', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle static asset requests
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);

  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch from network
  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return offline page or error
    const offlineResponse = await cache.match('/');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

/**
 * Fetch and cache in background (for stale-while-revalidate)
 */
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', Date.now().toString());

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, cachedResponse);
    }
  } catch (error) {
    console.error('[Service Worker] Background fetch failed:', error);
  }
}

/**
 * Clear API cache
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    caches.delete(API_CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
