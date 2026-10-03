/* =========================================================
   Service Worker – macht die App offline nutzbar.
   Eigene Dateien: "Netzwerk zuerst" – mit Internet siehst du
   immer die neueste Version, ohne Internet die zuletzt geladene.
   Firebase-Bibliothek: "Cache zuerst" (die Version ändert sich nie).
   Neue Dateien in FILES eintragen und CACHE hochzählen.
   Die Termine selbst speichert Firestore offline (nicht hier).
   ========================================================= */

const CACHE = "mischa-therapie-v3";

const FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/firebase-config.js",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

const FIREBASE_SDK = [
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all([
        cache.addAll(FILES),
        // Die Firebase-Dateien werden sonst beim nächsten Laden nachgeholt
        cache.addAll(FIREBASE_SDK).catch((err) => console.warn("Firebase-SDK nicht gecacht:", err))
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Firebase-Bibliothek: Cache zuerst
  if (FIREBASE_SDK.includes(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
      )
    );
    return;
  }

  // Alles andere von fremden Servern (z. B. Firestore selbst) nicht anfassen
  if (new URL(request.url).origin !== location.origin) return;

  // Eigene Dateien: Netzwerk zuerst – am Browser-Cache vorbei, sonst kommt evtl. eine alte Version
  event.respondWith(
    fetch(request, { cache: "no-cache" })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request, { ignoreSearch: true })
          .then((cached) => cached || (request.mode === "navigate" ? caches.match("./index.html") : null))
          .then((response) => response || Response.error())
      )
  );
});
