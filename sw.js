const CACHE = 'gitar-v11';
const FILES = ['./', './index.html', './style.css', './music.js', './audio.js', './chords.js', './theory.js', './core.js', './sap.js', './makam.js', './kulak.js', './akor.js', './klasik.js', './eslik.js', './main.js', './manifest.json', './icon-192.png', './icon-512.png', './icon.svg', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // önce ağ (güncel kod), olmazsa önbellek: çevrimdışı da çalışır
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
