/* GYM BADGE — service worker (offline first, self-updating) */
var CACHE = "gymbadge-v23";
var IMGS = [
  "/app/assets/img/avatar.jpg",
  "/app/assets/img/coach/model-male.jpg",
  "/app/assets/img/coach/model-female.jpg",
  "/app/assets/img/ex/bandlateralraise-1.jpg",
  "/app/assets/img/ex/benchdips-1.jpg",
  "/app/assets/img/ex/benchpress-1.jpg",
  "/app/assets/img/ex/bentoverrow-1.jpg",
  "/app/assets/img/ex/bicepcurl-1.jpg",
  "/app/assets/img/ex/bicyclecrunch-1.jpg",
  "/app/assets/img/ex/birddog-1.jpg",
  "/app/assets/img/ex/bulgariansplitsquat-1.jpg",
  "/app/assets/img/ex/burpee-1.jpg",
  "/app/assets/img/ex/calfraise-1.jpg",
  "/app/assets/img/ex/catcow-1.jpg",
  "/app/assets/img/ex/chinup-1.jpg",
  "/app/assets/img/ex/crunches-1.jpg",
  "/app/assets/img/ex/cycling-1.jpg",
  "/app/assets/img/ex/deadbug-1.jpg",
  "/app/assets/img/ex/deadlift-1.jpg",
  "/app/assets/img/ex/dumbbellpress-1.jpg",
  "/app/assets/img/ex/dumbbellrow-1.jpg",
  "/app/assets/img/ex/dumbbellsquat-1.jpg",
  "/app/assets/img/ex/facepull-1.jpg",
  "/app/assets/img/ex/glutebridge-1.jpg",
  "/app/assets/img/ex/gobletsquat-1.jpg",
  "/app/assets/img/ex/highknees-1.jpg",
  "/app/assets/img/ex/hipcircle-1.jpg",
  "/app/assets/img/ex/hipflexorstretch-1.jpg",
  "/app/assets/img/ex/hollowhold-1.jpg",
  "/app/assets/img/ex/inclinepress-1.jpg",
  "/app/assets/img/ex/jumprope-1.jpg",
  "/app/assets/img/ex/latpulldown-1.jpg",
  "/app/assets/img/ex/legcurl-1.jpg",
  "/app/assets/img/ex/legextension-1.jpg",
  "/app/assets/img/ex/legpress-1.jpg",
  "/app/assets/img/ex/lunge-1.jpg",
  "/app/assets/img/ex/lyinglegraise-1.jpg",
  "/app/assets/img/ex/mountainclimber-1.jpg",
  "/app/assets/img/ex/plank-1.jpg",
  "/app/assets/img/ex/pullup-1.jpg",
  "/app/assets/img/ex/pushup-1.jpg",
  "/app/assets/img/ex/renegaderow-1.jpg",
  "/app/assets/img/ex/romanianandeadlift-1.jpg",
  "/app/assets/img/ex/rowing-1.jpg",
  "/app/assets/img/ex/russiantwist-1.jpg",
  "/app/assets/img/ex/shoulderpress-1.jpg",
  "/app/assets/img/ex/shoulderwallslide-1.jpg",
  "/app/assets/img/ex/sideplank-1.jpg",
  "/app/assets/img/ex/situp-1.jpg",
  "/app/assets/img/ex/squat-1.jpg",
  "/app/assets/img/ex/stepup-1.jpg",
  "/app/assets/img/ex/thoracicrotation-1.jpg",
  "/app/assets/img/ex/treadmill-1.jpg",
  "/app/assets/img/ex/walkinglunge-1.jpg",
  "/app/assets/img/ex/wallpushup-1.jpg",
  "/app/assets/img/ex/wallsit-1.jpg",
  "/app/assets/img/ex/worldsgreateststretch-1.jpg",
  "/app/assets/img/lib/program-1.jpg",
  "/app/assets/img/lib/program-2.jpg",
  "/app/assets/img/lib/program-3.jpg",
  "/app/assets/img/lib/program-5.jpg",
  "/app/assets/img/lib/program-7.jpg",
  "/app/assets/img/lib/program-9.jpg",
  "/app/assets/img/meal/jollof-rice-1.jpg",
  "/app/assets/img/meal/grilled-chicken-1.jpg",
  "/app/assets/img/meal/beans-1.jpg",
  "/app/assets/img/meal/banana-1.jpg",
  "/app/assets/img/meal/pizza-1.jpg",
  "/app/assets/img/meal/burger-1.jpg",
  "/app/assets/img/meal/salad-1.jpg",
  "/app/assets/img/meal/suya-1.jpg",
  "/app/assets/img/meal/swallow-1.jpg",
  "/app/assets/img/meal/egg-1.jpg",
  "/app/assets/img/meal/oatmeal-1.jpg",
  "/app/assets/img/coach/coach-ada-okafor.jpg",
  "/app/assets/img/coach/coach-tunde-bakare.jpg",
  "/app/assets/img/coach/coach-zainab-musa.jpg",
  "/app/assets/img/coach/coach-amara-nwosu.jpg",
  "/app/assets/img/coach/coach-kwame-asante.jpg",
  "/app/assets/img/coach/coach-naledi-dlamini.jpg",
  "/app/assets/img/gym/thumb/g1.jpg",
  "/app/assets/img/gym/thumb/g2.jpg",
  "/app/assets/img/gym/thumb/g3.jpg",
  "/app/assets/img/gym/thumb/g4.jpg",
  "/app/assets/img/gym/thumb/g5.jpg"
];
var ASSETS = [
  "/app/",
  "/app/index.html",
  "/app/oauth.html",
  "/app/manifest.webmanifest",
  "/assets/theme.js",
  "/assets/auth.js",
  "/assets/people.js",
  "/assets/qr.js",
  "/assets/i18n.js",
  "/assets/i18n-ext.js",
  "/assets/countries.js",
  "/assets/pw.js",
  "/assets/music.js",
  "/assets/shared.css",
  "/app/assets/css/app.css",
  "/app/assets/js/data.js",
  "/app/assets/js/exercises-more.js",
  "/app/assets/js/programs.js",
  "/app/assets/js/equipment-data.js",
  "/app/assets/js/store.js",
  "/app/assets/js/payments.js",
  "/app/assets/js/settings.js",
  "/app/assets/js/dialog.js",
  "/app/assets/js/ui.js",
  "/app/assets/js/scanner.js",
  "/app/assets/js/equipment.js",
  "/app/assets/js/library.js",
  "/app/assets/js/plan.js",
  "/app/assets/js/trainers.js",
  "/app/assets/js/chat.js",
  "/app/assets/js/app.js",
  "/app/assets/img/logo.png?v=23",
  "/app/assets/img/icon-192.png?v=23",
  "/app/assets/img/icon-maskable-512.png?v=23",
  "/assets/img/logo.png?v=23",
  "/assets/img/logo.svg?v=23",
  "/assets/img/favicon-32.png?v=23",
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

  // The API is never served from the cache. It is live data — the trainer
  // directory, the review queues — and a stale copy would show members a
  // directory that has already changed. The app keeps its own offline copy
  // in local storage, so the network is the only source here.
  if (url.pathname.indexOf("/api/") === 0) {
    e.respondWith(
      fetch(req).catch(function () {
        return new Response(JSON.stringify({ ok: false, offline: true }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

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
