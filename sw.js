const CACHE_NAME = 'washi-shell-r14-clean';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
