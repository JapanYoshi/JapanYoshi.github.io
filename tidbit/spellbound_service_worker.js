const toCache = [
  "./",
  "./readlex_spellbound.json",
  "./shavian-fonts/space-mono-shavian-r.otf",
  "./shavian-fonts/space-mono-shavian-b.otf",
  "./shavian-info/p.wav",
  "./shavian-info/t.wav",
  "./shavian-info/k.wav",
  "./shavian-info/f.wav",
  "./shavian-info/th.wav",
  "./shavian-info/s.wav",
  "./shavian-info/sh.wav",
  "./shavian-info/ch.wav",
  "./shavian-info/y.wav",
  "./shavian-info/ng.wav",
  "./shavian-info/b.wav",
  "./shavian-info/d.wav",
  "./shavian-info/g.wav",
  "./shavian-info/v.wav",
  "./shavian-info/dh.wav",
  "./shavian-info/z.wav",
  "./shavian-info/zh.wav",
  "./shavian-info/jh.wav",
  "./shavian-info/w.wav",
  "./shavian-info/h.wav",
  "./shavian-info/l.wav",
  "./shavian-info/m.wav",
  "./shavian-info/ih.wav",
  "./shavian-info/eh.wav",
  "./shavian-info/ae.wav",
  "./shavian-info/ax.wav",
  "./shavian-info/ao.wav",
  "./shavian-info/uh.wav",
  "./shavian-info/aw.wav",
  "./shavian-info/aa.wav",
  "./shavian-info/r.wav",
  "./shavian-info/n.wav",
  "./shavian-info/iy.wav",
  "./shavian-info/ey.wav",
  "./shavian-info/ay.wav",
  "./shavian-info/ah.wav",
  "./shavian-info/ow.wav",
  "./shavian-info/uw.wav",
  "./shavian-info/oy.wav",
  "./shavian-info/au.wav",
  "./shavian-info/ar.wav",
  "./shavian-info/or.wav",
  "./shavian-info/er.wav",
  "./shavian-info/yr.wav",
  "./shavian-info/rr.wav",
  "./shavian-info/ir.wav",
  "./shavian-info/ia.wav",
  "./shavian-info/yu.wav",
  "./shingo_click.wav",
  "./shingo_delete.wav",
  "./shingo_hit.wav",
  "./shingo_graze.wav",
  "./shingo_miss.wav",
  "./shingo_win.wav",
  "./shingo_lose.wav",
  "./dummy.mp3",
];
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("cacheSpellbound2gd4me").then((cache) => {
      return cache.addAll(toCache);
    })
  );
});
self.addEventListener("fetch", event => {
  event.respondWith(
    (async () => {
      const r = await caches.match(event.request);
      console.log("Service Worker: fetching resource at", event.request.url);
      if (r) return r;

      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })()
  );
});