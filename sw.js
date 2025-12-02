const CACHE_NAME = 'gym-scheduler-v1.0.0';
const RUNTIME_CACHE = 'gym-scheduler-runtime';

// Files to cache immediately - ADD BASE PATH TO ALL
const PRECACHE_URLS = [
  '/gym-scheduler-app/',
  '/gym-scheduler-app/index.html',
  '/gym-scheduler-app/offline.html',
  '/gym-scheduler-app/manifest.json',
  '/gym-scheduler-app/css/styles.css',
  '/gym-scheduler-app/js/app.js',
  '/gym-scheduler-app/js/components/GymScheduler.js',
  '/gym-scheduler-app/js/components/ActualsModal.js',
  '/gym-scheduler-app/js/components/Icons.js',
  '/gym-scheduler-app/js/data/exercises.js',
  '/gym-scheduler-app/js/data/quotes.js',
  '/gym-scheduler-app/js/utils/storage.js',
  '/gym-scheduler-app/js/utils/calendar.js',
  '/gym-scheduler-app/js/utils/dateUtils.js',
  '/gym-scheduler-app/icons/icon-192x192.png',
  '/gym-scheduler-app/icons/icon-512x512.png',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests except allowed CDNs
  const url = new URL(event.request.url);
  const isOwnOrigin = url.origin === self.location.origin;
  const isAllowedCDN = url.hostname === 'unpkg.com' || url.hostname === 'cdn.tailwindcss.com';
  
  if (!isOwnOrigin && !isAllowedCDN) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/gym-scheduler-app/offline.html');
        }
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for future implementation
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  }
});

async function syncWorkouts() {
  // Placeholder for future sync functionality
  console.log('Background sync triggered');
}
