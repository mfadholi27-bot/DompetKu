'use strict';

const CACHE_NAME = 'finku-v2-11-0';
const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key =>
          (key.startsWith('dompetku-') || key.startsWith('finku-')) &&
          key !== CACHE_NAME
        ).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          cache.put('./index.html', response.clone()).catch(() => {});
          return response;
        }
      } catch (_) {}
      return (await cache.match('./index.html')) || (await cache.match('./'));
    }

    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});
