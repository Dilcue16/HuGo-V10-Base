/* HuGo PWA Service Worker v1.0
   Bulacan Police Provincial Human Rights Affairs Office
   BULPPO, PRO 3 */

const CACHE_NAME = 'hugo-pwa-v1.0';
const OFFLINE_URL = 'offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
];

/* ─── INSTALL ─── */
self.addEventListener('install', (event) => {
  console.log('[HuGo SW] Installing service worker v1.0');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[HuGo SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))).catch(err => {
        console.warn('[HuGo SW] Some assets failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* ─── ACTIVATE ─── */
self.addEventListener('activate', (event) => {
  console.log('[HuGo SW] Activating service worker v1.0');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[HuGo SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ─── FETCH ─── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Skip camera/microphone API calls — always go to network
  if (url.pathname.includes('getUserMedia') || url.pathname.includes('mediaDevices')) return;

  // For navigation requests — serve from cache, fallback to network, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        }).catch(() => caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // For static assets — cache first, network fallback
  if (
    url.origin === self.location.origin ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'unpkg.com'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') return response;
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        }).catch(() => {
          if (request.destination === 'image') return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#0C447C"/><text x="50" y="55" font-size="12" fill="white" text-anchor="middle">Offline</text></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
        });
      })
    );
    return;
  }

  // For Anthropic API calls — always network only (never cache)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline — AI features require internet connection.' }), { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // Default — network first
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

/* ─── PUSH NOTIFICATIONS (for priority flags) ─── */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'HuGo — Priority Flag';
  const options = {
    body: data.body || 'A new priority flag has been submitted.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: data.tag || 'hugo-notification',
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View report' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
  }
});

/* ─── BACKGROUND SYNC (for offline submission queue) ─── */
self.addEventListener('sync', (event) => {
  if (event.tag === 'hugo-sync-submissions') {
    console.log('[HuGo SW] Background sync triggered — processing queued submissions');
    event.waitUntil(syncQueuedSubmissions());
  }
});

async function syncQueuedSubmissions() {
  try {
    const db = await openDB();
    const queue = await getQueue(db);
    for (const submission of queue) {
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission)
        });
        await removeFromQueue(db, submission.id);
        console.log('[HuGo SW] Synced submission:', submission.id);
      } catch (err) {
        console.warn('[HuGo SW] Failed to sync submission:', submission.id);
      }
    }
  } catch (err) {
    console.warn('[HuGo SW] Background sync error:', err);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('hugo-queue', 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore('queue', { keyPath: 'id' });
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = reject;
  });
}

function getQueue(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue', 'readonly');
    const req = tx.objectStore('queue').getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = reject;
  });
}

function removeFromQueue(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('queue', 'readwrite');
    const req = tx.objectStore('queue').delete(id);
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}

console.log('[HuGo SW] Service worker loaded — BULPPO PRO 3');
