/**
 * HeartBeats Music Player - Service Worker
 * Optimized for performance and offline usage
 */

const CACHE_NAME = 'heartbeats-player-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './styles/mobile.css',
  './styles/desktop.css',
  './js/main.js',
  './js/songs.js',
  './placeholder.png',
  './manifest.json',
  './favicon.ico',
  './Zaroor by my premika.mp3',
  './yarra by jannu.mp3',
  './naina.mp3',
  './BULLYA.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - optimized cache strategy for different resource types
self.addEventListener('fetch', event => {
  // Handle audio files differently - offline-first approach
  if (event.request.url.match(/\.(mp3|ogg|wav)$/i)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return cached audio file if it exists
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try to fetch it from network and cache it
        return fetch(event.request)
          .then(response => {
            // Clone the response and cache it for future
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return a fallback response
            console.log('Failed to fetch audio: ' + event.request.url);
            // Could return a fallback audio file if desired
            return new Response('', {status: 503, statusText: 'Audio unavailable offline'});
          });
      })
    );
    return; // Important - exit early for audio files
  }
  
  // Regular assets - network first, fall back to cache, then offline page
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache valid responses from same origin (to conserve cache space)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to return from cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the request is for a page, return the offline page
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // Otherwise return a basic error
          return new Response('Network error', {status: 503, statusText: 'Service Unavailable'});
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});