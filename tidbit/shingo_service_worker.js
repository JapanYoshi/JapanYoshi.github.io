const cacheName = "cacheShingo2gd4me";

const toCache = [
  "./shingo.html",
  "./readlex_shingo.json",
  "./shavian-fonts/mikadoshavianbold.otf",
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
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll(toCache),
      ),
  );
});

const putInCache = async (request, response) => {
  const cache = await caches.open(cacheName);
}

// fallbackUrl will be fetched if the real request fails
const fetchWithCache = async ({request, fallbackUrl}) => {
  try {
    const responseFromNetwork = await fetch(request);
    // Fetched from network, clone and cache it
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (e) {
    // Get cached resource
    const responseFromCache = await caches.match(request);
    if (responseFromCache) return responseFromCache;
    
    // Not found in cache! Fallback...
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) return fallbackResponse;

    // Can't even get fallback response, just rawdog it
    return new Response("Network error while trying to fetch " + request.url, {
      status: 400,
      headers: {"Content-Type": "text/plain"},
    });
  }
}

self.addEventListener("fetch", event => {
  event.respondWith(
    fetchWithCache({
      request: event.request,
      fallbackUrl: "https://2gd4.me/404.html",
    })
  );
});