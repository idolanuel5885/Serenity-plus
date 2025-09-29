self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  // Force the waiting service worker to become active
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  // Claim control of all clients (tabs)
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // This service worker doesn't do any caching for now,
  // but it's here to enable PWA features.
  // You can add caching strategies here later.
  event.respondWith(fetch(event.request))
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Serenity Plus'
  const options = {
    body: data.body || 'You have a new notification!',
    icon: data.icon || '/icons/meditation-1.svg',
    badge: data.badge || '/icons/meditation-1.svg',
    data: data.data,
    tag: data.tag,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})


