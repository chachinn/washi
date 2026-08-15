const CACHE_NAME = 'washi-shell-v1.0';
const INTERNAL_BUILD = '20260816-loader-cache-hardening1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const isExperienceLoader = url.pathname.endsWith('/js/release-version.js');

  if (!isNavigation && !isExperienceLoader) return;

  event.respondWith((async () => {
    try {
      return await fetch(request, { cache: 'no-store' });
    } catch (error) {
      return fetch(request);
    }
  })());
});
