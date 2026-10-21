/* GYM BADGE — service worker (offline first, self-updating) */
var CACHE = "gymbadge-v13";
var IMGS = [
  "/app/assets/img/avatar.jpg",
  "/app/assets/img/coach/model-male.jpg",
  "/app/assets/img/coach/model-female.jpg",
  "/app/assets/img/ex/goblet-squat.jpg",
  "/app/assets/img/ex/lat-pulldown.jpg",
  "/app/assets/img/ex/bench-dips.jpg",
  "/app/assets/img/ex/leg-curl.jpg",
  "/app/assets/img/ex/crunches.jpg",
  "/app/assets/img/ex/incline-press.jpg",
  "/app/assets/img/ex/squat.jpg",
  "/app/assets/img/ex/dumbbell-row.jpg",
  "/app/assets/img/ex/full-body.jpg",
  "/app/assets/img/ex/cardio.jpg",
  "/app/assets/img/ex/legs.jpg",
  "/app/assets/img/ex/calisthenics.jpg",
  "/app/assets/img/lib/program-1.jpg",
  "/app/assets/img/lib/program-2.jpg",
  "/app/assets/img/lib/program-3.jpg",
  "/app/assets/img/lib/program-5.jpg",
  "/app/assets/img/lib/program-7.jpg",
  "/app/assets/img/lib/program-9.jpg",
  "/app/assets/img/meal/meal-1.jpg",
  "/app/assets/img/meal/meal-2.jpg",
  "/app/assets/img/meal/meal-3.jpg"
];
var ASSETS = [
  "/app/",
  "/app/index.html",
  "/app/oauth.html",
  "/app/manifest.webmanifest",
  "/assets/theme.js",
  "/assets/auth.js",
  "/assets/people.js",
  "/assets/i18n.js",
  "/assets/i18n-ext.js",
  "/assets/countries.js",
  "/assets/pw.js",
  "/assets/music.js",
  "/assets/shared.css",
  "/app/assets/css/app.css",
  "/app/assets/js/data.js",
  "/app/assets/js/store.js",
  "/app/assets/js/payments.js",
  "/app/assets/js/settings.js",
  "/app/assets/js/app.js",
  "/app/assets/img/logo.png",
  "/app/assets/img/icon-192.png",
  "/assets/img/logo.png",
  "/assets/img/bg/aurora-1.jpg",
  "/assets/img/bg/aurora-2.jpg",
  "/assets/img/bg/aurora-3.jpg"
].concat(IMGS);

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Cache each asset on its own so a single bad URL can never break install.
      return Promise.all(ASSETS.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// The app shell, HTML, scripts, styles and the worker must always be able to
// refresh — otherwise installed users stay stuck on an old build forever.
function isFresh(request) {
  if (request.mode === "navigate") return true;
  var d = request.destination;
  return d === "script" || d === "style" || d === "document" || d === "worker";
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // leave cross-origin alone

  if (isFresh(req)) {
    // Network-first: newest app shell + code whenever we are online.
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          if (hit) return hit;
          if (req.mode === "navigate") return caches.match("/app/index.html");
          return Response.error();
        });
      })
    );
    return;
  }

  // Cache-first for static assets (images, fonts, icons), refreshed in the background.
  e.respondWith(
    caches.match(req).then(function (hit) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      }).catch(function () { return hit; });
      return hit || network;
    })
  );
});
