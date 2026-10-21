/* ==========================================================================
   GYM BADGE — people.js
   Photo-ready image pipeline with a face-free fallback.

   WHY THIS EXISTS
   We can't ship copyrighted stock photography, and the app must work fully
   offline. So every image resolves in two steps:

     1. A real photo you provide at  /assets/img/people/<id>.jpg
     2. Else an abstract gradient tile with a fitness glyph (never a face,
        never a caricature, never a blank box).

   TO USE REAL PHOTOS
      Drop properly-licensed photographs into the folder(s) below using these
      exact filenames (square, ~800x800, JPG or WebP):

        web/assets/img/people/   -> website
        app/assets/img/people/   -> app (offline-cached after first load)

      Free, no-attribution-required sources:  https://unsplash.com  ·
      https://www.pexels.com  ·  https://commons.wikimedia.org
      Read each licence, or use your own photography. This keeps you clear of
      copyright claims for worldwide commercial use.

   IDs used across the product:
      member-run, member-lift, member-yoga, member-rest,
      trainer-1..4, member-1..8, gym-floor, coach-hero
   ========================================================================== */
(function (global) {
  "use strict";

  // Where to look for real photos, in order.
  var ROOTS = ["/assets/img/people/", "/app/assets/img/people/", "/web/assets/img/people/"];

  var IDS = [
    "member-run", "member-lift", "member-yoga", "member-rest", "coach-hero",
    "gym-floor", "trainer-1", "trainer-2", "trainer-3", "trainer-4",
    "member-1", "member-2", "member-3", "member-4", "member-5",
    "member-6", "member-7", "member-8"
  ];

  // Cache probe results so we don't re-request the same file.
  var probeCache = {};
  function probe(url) {
    if (probeCache[url] !== undefined) return Promise.resolve(probeCache[url]);
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { probeCache[url] = true; resolve(true); };
      img.onerror = function () { probeCache[url] = false; resolve(false); };
      img.src = url;
    });
  }

  // Find a real photo for an id, else null.
  function findPhoto(id) {
    var chain = Promise.resolve(null);
    ROOTS.forEach(function (root) {
      chain = chain.then(function (found) {
        if (found) return found;
        var url = root + id + ".jpg";
        return probe(url).then(function (ok) { return ok ? url : null; });
      });
    });
    return chain;
  }

  /* ---- face-free fallback art --------------------------------------
     A deterministic gradient tile with a fitness glyph. Gyms/coaches get a
     dumbbell, people get the badge shield. No human shapes anywhere. */
  var GLYPH = {
    dumbbell: "M6.5 12h11M3.5 9v6M6.5 6.5v11M17.5 6.5v11M20.5 9v6",
    shield: "M12 3l7 2.8v5.4c0 4.6-3 7.9-7 9.3-4-1.4-7-4.7-7-9.3V5.8L12 3z"
  };
  function hashHue(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return h % 360;
  }
  function fallbackMarkup(id) {
    var hue = hashHue(id);
    var glyph = (id.indexOf("gym") === 0 || id.indexOf("coach") === 0) ? GLYPH.dumbbell : GLYPH.shield;
    var uid = "fb" + hue;
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + hue + ' 42% 30%)"/>' +
      '<stop offset="1" stop-color="hsl(' + ((hue + 42) % 360) + ' 48% 16%)"/>' +
      "</linearGradient></defs>" +
      '<rect width="100" height="100" fill="url(#' + uid + ')"/>' +
      '<circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"/>' +
      '<circle cx="50" cy="50" r="27" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1.5"/>' +
      '<g transform="translate(50 50) scale(1.05) translate(-12 -12)" fill="none" ' +
      'stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + glyph + '"/></g></svg>';
  }

  /* Build a photo-ready element for an id.
     opts: { cls, alt, imgCls, aspect } */
  function img(id, opts) {
    opts = opts || {};
    var wrap = document.createElement("div");
    wrap.className = "ph ph-loading" + (opts.cls ? " " + opts.cls : "");
    if (opts.aspect) wrap.style.aspectRatio = opts.aspect;
    wrap.setAttribute("data-people", id);
    // Render the fallback immediately so there is never an empty box.
    wrap.innerHTML = '<div class="ph-fallback">' + fallbackMarkup(id) + "</div>";

    // Upgrade to a real photo if one is present.
    findPhoto(id).then(function (url) {
      if (!url) { wrap.classList.remove("ph-loading"); wrap.classList.add("ph-generated"); return; }
      var im = document.createElement("img");
      im.className = "ph-img" + (opts.imgCls ? " " + opts.imgCls : "");
      im.alt = opts.alt || "";
      im.loading = "lazy";
      im.decoding = "async";
      im.src = url;
      im.onload = function () {
        wrap.classList.add("ph-ready");
        wrap.classList.remove("ph-loading");
        wrap.appendChild(im);
      };
    });
    return wrap;
  }

  // Synchronous generated-only markup (for places that just need art now).
  function art(id) { return fallbackMarkup(id); }

  global.GBPeople = { img: img, art: art, ids: IDS, findPhoto: findPhoto };
})(typeof window !== "undefined" ? window : this);
