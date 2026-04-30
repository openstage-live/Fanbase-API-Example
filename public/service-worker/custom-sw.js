const VERSION = '1.0.6'; // Increment this when you make changes to ensure the service worker is not cached.

// Import Workbox if available (it will be injected by Vite PWA)
// This allows us to work alongside Workbox's caching strategies
if (typeof importScripts === 'function') {
  // Workbox will be available via the main service worker
  console.log('Custom SW loaded alongside Workbox, version:', VERSION);
}

// Don't override install/activate events - let Workbox handle them
// Only add our custom functionality on top

// Add message handling for communication with the app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Add background sync support (optional, for offline actions)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any offline actions that need to be synced
      // when the device comes back online
      Promise.resolve(),
    );
  }
});

// Handle fetch events for additional offline functionality
// This works alongside Workbox's caching strategies
self.addEventListener('fetch', (event) => {
  // Only handle specific cases that Workbox doesn't cover
  // For example, handling API calls with custom offline behavior

  if (event.request.url.includes('/api/') && event.request.method === 'POST') {
    // Handle offline API calls (e.g., queue them for later)
    event.respondWith(
      fetch(event.request).catch(() => {
        // Store the request for background sync when online
        console.log('API call failed, could implement background sync here');
        return new Response(JSON.stringify({ error: 'Offline', queued: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }),
    );
  }

  // Let Workbox handle all other requests
});
