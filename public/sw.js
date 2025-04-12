const CACHE_NAME = 'pedidos-app-cache-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Estratégia de cache: Network First (tenta buscar da rede, se falhar usa o cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Verifica se a resposta é válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clona a resposta para poder armazená-la no cache e também devolvê-la
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            // Armazena a resposta no cache para uso futuro
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Se falhar na busca da rede, tenta recuperar do cache
        return caches.match(event.request);
      })
  );
});

// Atualiza o cache quando o Service Worker é ativado
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