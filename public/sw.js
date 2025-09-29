const CACHE_NAME = 'melissa-charge-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Ajouter une fonction pour envoyer des notifications avec actions depuis le service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_CHARGE_REMINDER') {
    self.registration.showNotification('💡 Melissa, pense à charger !', {
      body: 'Il est temps de brancher ton téléphone pour éviter la panne de batterie.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'charge-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'charged',
          title: '✅ C\'est fait !',
        },
        {
          action: 'snooze',
          title: '⏰ Plus tard (1h)',
        }
      ]
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'charged') {
    // Envoyer un message à l'app principale
    clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'charged' });
      });
    });
  } else if (event.action === 'snooze') {
    // Reporter la notification d'1 heure
    setTimeout(() => {
      self.registration.showNotification('💡 Melissa, pense à charger !', {
        body: 'Rappel: Il est temps de brancher ton téléphone.',
        icon: '/icon-192x192.png',
        tag: 'charge-reminder'
      });
    }, 60 * 60 * 1000); // 1 heure
  } else {
    // Ouvrir l'app
    clients.openWindow('/');
  }
});
