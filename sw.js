/* =========================================
   WANDERLUST — SERVICE WORKER
   Offline support via Cache API
   ========================================= */

const CACHE_NAME = 'wanderlust-v1';
const STATIC_ASSETS = [
  './',
  './travel_recommendation.html',
  './travel_recommendation.css',
  './travel_recommendation.js',
  './destinations.html',
  './destinations.css',
  './destinations.js',
  './about.html',
  './contact.html',
  './favorites.html',
  './bookings.html',
  './compare.html',
  './budget.html',
  './packing.html',
  './packing.css',
  './packing.js',
  './country-legal-requirements.js',
  './journal.html',
  './account.html',
  './account.css',
  './account.js',
  './login.html',
  './signup.html',
  './auth.css',
  './auth.js',
  './privacy.html',
  './terms.html',
  './manifest.json',
  './travel_recommendation_api.json',
  './itineraries.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('unsplash.com') || event.request.url.includes('images.unsplash.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          return new Response('', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
    );
    return;
  }

  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 408 }));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
