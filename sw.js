// Service worker for Jogos da Ranny: caches the menu and every game so they open offline,
// fetching pages from the network first so updates show up when online.
const CACHE = 'jogos-v4';
const GAMES = ['bus', 'setas', 'parafusos', 'hexa', 'trio', 'pixel'];
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  ...GAMES.flatMap(g => [g + '/', g + '/index.html'])];

self.addEventListener('install', e => {
  // Cache each file separately so one missing file doesn't break install
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const save = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; };
  if (req.mode === 'navigate') {
    // Network first for pages, cached copy when offline
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // Cache first for icons and fonts
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(save)));
});
