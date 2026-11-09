// Service worker del Calcolatore Macro: salva l'app sul telefono per usarla offline.
// Cambia VERSION a ogni pubblicazione: alla riapertura successiva l'app si aggiorna.
const VERSION = 'macro-v3.0.0';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // solo i file dell'app; Open Food Facts e i caratteri Google passano direttamente dalla rete
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // prima la rete (per ricevere gli aggiornamenti), se non c'è la copia salvata
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
