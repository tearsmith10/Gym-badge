  /* ==========================================================================
   GYM BADGE — shared site chrome
   One source of truth for the nav + footer across every marketing page, so
   adding pages never duplicates markup. Also owns:
     - global search (gyms / coaches / features / pages)
     - account menu, kept in sync with GBWeb
     - the language picker (flags) for every page
     - the mobile burger + theme toggle wiring

   Pages call GBChrome.mount() after their content is in place. Nav and footer
   render into <div id="site-nav"> and <div id="site-footer"> (created if the
   page already ships static markup, we replace it to stay in sync).
   ========================================================================== */
(function (global) {
  "use strict";

  var ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>'
  };

  var NAV_LINKS = [
    ["/find", "Find a gym"],
    ["/coaches", "Coaches"],
    ["/#features", "Features"],
    ["/pricing", "Pricing"],
    ["/gyms", "For gyms"],
    ["/trainers", "For trainers"],
    ["/faq", "Help"]
  ];

  var CURRENCIES = [
    ["USD", "$ US Dollar"], ["NGN", "₦ Naira"], ["GBP", "£ Pound"], ["EUR", "€ Euro"],
    ["GHS", "₵ Cedi"], ["KES", "KSh Shilling"], ["ZAR", "R Rand"], ["EGP", "E£ Pound"],
    ["CAD", "C$ Dollar"], ["AUD", "A$ Dollar"], ["INR", "₹ Rupee"], ["AED", "د.إ Dirham"],
    ["BRL", "R$ Real"], ["MXN", "$ Peso"], ["JPY", "¥ Yen"], ["Other", "More coming soon"]
  ];

  function path() { return (location.pathname || "/").replace(/\/index\.html$/, "/"); }

  function isActive(href) {
    if (href === "/") return path() === "/";
    var base = href.split("#")[0];
    return base !== "/" && path().indexOf(base) === 0;
  }

  function navHTML() {
    var user = window.GBWeb ? GBWeb.getUser() : null;
    var links = NAV_LINKS.map(function (l) {
      return '<a href="' + l[0] + '"' + (isActive(l[0]) ? ' aria-current="page"' : "") + '>' + l[1] + "</a>";
    }).join("");

    var account = user
      ? '<div class="acct" id="acctBtn" tabindex="0" role="button" aria-label="Account">' +
          '<span class="ava">' + initials(user.name || user.email || "U") + "</span>" +
          '<span class="acct-name">' + firstName(user.name || user.email || "Account") + "</span>" +
          (user.verified === false ? '<span class="acct-flag" title="Email not verified">!</span>' : "") +
          '<div class="acct-menu" id="acctMenu">' +
            '<a href="/account">My account</a>' +
            '<a href="/app/#/settings">Settings</a>' +
            '<a href="/account#plan">My plan</a>' +
            '<a href="/account#identity">Verify identity</a>' +
            '<button id="signOutBtn" type="button">Sign out</button>' +
          "</div>" +
        "</div>"
      : '<a class="btn btn-outline btn-sm" href="/login">Sign in</a>' +
        '<a class="btn btn-primary btn-sm" href="/signup">Get started</a>';

    return (
      '<div class="announce" id="announce">' +
        '<div class="wrap announce-in">' +
          '<span class="an-item"><b>4.9★</b> loved by 12,000+ lifters</span>' +
          '<span class="an-item hide-sm">Premium from any currency · cancel anytime</span>' +
          '<a class="an-item an-cta" href="/app/">Install the app — iOS &amp; Android →</a>' +
        "</div>" +
      "</div>" +
      '<header class="nav" id="nav"><div class="wrap nav-in">' +
        '<a class="brand" href="/">' +
          '<img class="mark" src="/assets/img/logo.png" alt="Gym Badge logo"><span>Gym&nbsp;Badge</span>' +
        "</a>" +
        '<nav class="nav-links" aria-label="Primary">' + links + "</nav>" +
        '<div class="nav-tools">' +
          '<button class="icon-btn" id="searchBtn" aria-label="Search">' + ICON.search + "</button>" +
          '<button class="theme-toggle" data-theme-toggle aria-label="Switch theme"><span class="dot"></span><span class="lbl">Theme</span></button>' +
          '<div id="langSlot"></div>' +
          '<div class="nav-cta" id="navCta">' + account + "</div>" +
        "</div>" +
        '<button class="burger" aria-label="Menu">☰</button>' +
      "</div></header>"
    );
  }

  function footerHTML() {
    var col = function (title, links) {
      return '<div class="foot-col"><h5>' + title + "</h5>" +
        links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") + "</div>";
    };
    var cur = (window.GBWeb && GBWeb.getCur()) || "USD";
    var soc = function (name, path) {
      return '<a class="soc" href="https://x.com/gymbadge" target="_blank" rel="noopener" aria-label="' + name + '">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + path + "</svg></a>";
    };
    return (
      '<footer class="footer"><div class="wrap">' +
        '<div class="foot-grid">' +
          '<div class="foot-brand">' +
            '<a class="brand" href="/"><img class="mark" src="/assets/img/logo.png" alt=""><span>Gym&nbsp;Badge</span></a>' +
            "<p>The training companion that remembers every set, taps every machine, and shows you the body you're building.</p>" +
            '<div class="foot-social" aria-label="Social links">' +
              soc("X", '<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20z"/>') +
              soc("Instagram", '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.8.3 1.9.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.1-.8-.3-1.9-.3-1.3-.1-1.7-.1-4.8-.1zm0 3a5 5 0 110 10 5 5 0 010-10zm0 1.8a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4zm6.4-2.1a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>') +
              soc("YouTube", '<path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.7.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.9.2 7.6.3 7.6.3s4.6 0 7.7-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.7 15.1V8.6l6.2 3.3-6.2 3.2z"/>') +
              soc("TikTok", '<path d="M16.6 2h-3.1v13.3a2.6 2.6 0 11-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.9 5.9 0 00-.8-.1 5.8 5.8 0 105.8 5.8V8.9a7.5 7.5 0 004.4 1.4V7.2a4.4 4.4 0 01-4.5-4.4V2z"/>') +
            "</div>" +
            '<div class="foot-news" id="footNews">' +
              '<div class="fn-title">Training tips &amp; community news</div>' +
              '<form class="fn-form" id="newsForm" novalidate>' +
                '<input type="email" id="newsEmail" placeholder="you@email.com" aria-label="Email address" required>' +
                '<button class="btn btn-primary btn-sm" type="submit">Subscribe</button>' +
              "</form>" +
              '<div class="fn-note" id="newsNote">One or two emails a month. Unsubscribe anytime — no data is sold, ever.</div>' +
            "</div>" +
          "</div>" +
          col("Product", [["/#features", "Features"], ["/pricing", "Pricing"], ["/find", "Find a gym"], ["/coaches", "Coaches"], ["/reviews", "Reviews"], ["/app/", "Open web app"]]) +
          col("For business", [["/gyms", "Gyms & companies"], ["/trainers", "Trainers"], ["/pricing#corporate", "Seat packages"], ["/support", "Partnerships"]]) +
          col("Help", [["/faq", "FAQ & help"], ["/support", "Contact support"], ["/forgot", "Reset password"], ["/account", "My account"]]) +
          col("Company", [["/about", "About"], ["/reviews", "Reviews"], ["/privacy", "Privacy"], ["/terms", "Terms"]]) +
        "</div>" +
        '<div class="foot-app">' +
          '<div class="fa-copy"><b>Train anywhere — install Gym Badge</b>' +
            "<span>Identical experience on iPhone &amp; Android. Works offline, syncs when you're back.</span></div>" +
          '<div class="fa-actions">' +
            '<button class="btn btn-primary btn-sm" id="installBtn" type="button">Install app</button>' +
            '<a class="btn btn-outline btn-sm" href="/app/">Open in browser</a>' +
          "</div>" +
        "</div>" +
        '<div class="foot-bottom">' +
          "<span>© 2026 Gym Badge. All rights reserved. Made for every body, everywhere.</span>" +
          '<span class="foot-tools">' +
            '<label class="cur-pick" aria-label="Language">' +
              '<span class="cur-label">Language</span>' +
              '<span id="langSlotFoot"></span>' +
            "</label>" +
          "</span>" +
        "</div>" +
      "</div></footer>"
    );
  }

  function initials(s) {
    var p = String(s).trim().split(/[\s@.]+/).filter(Boolean);
    return ((p[0] || "?")[0] + (p[1] ? p[1][0] : "")).toUpperCase();
  }
  function firstName(s) { return String(s).split(/[\s@]+/)[0]; }

  /* ---------- Search ---------- */
  function searchIndex() {
    var idx = [];
    idx.push({ t: "Find a gym", s: "gym locator browse day pass", u: "/find", k: "page" });
    idx.push({ t: "Coaches", s: "trainers personal trainer hire", u: "/coaches", k: "page" });
    idx.push({ t: "Pricing & plans", s: "price cost premium subscription", u: "/pricing", k: "page" });
    idx.push({ t: "Reviews", s: "testimonials ratings stars", u: "/reviews", k: "page" });
    idx.push({ t: "Help & FAQ", s: "support questions contact", u: "/faq", k: "page" });
    (GBCatalog ? GBCatalog.GYMS : []).forEach(function (g) {
      idx.push({ t: g.name, s: (g.city + " " + g.tags.join(" ") + " " + g.blurb).toLowerCase(), u: "/gym?id=" + g.id, k: "Gym", photo: g.photo });
    });
    (GBCatalog ? GBCatalog.COACHES : []).forEach(function (c) {
      idx.push({ t: c.name, s: (c.specialty + " " + c.city + " " + c.blurb).toLowerCase(), u: "/coach?id=" + c.id, k: "Coach", photo: c.photo });
    });
    return idx;
  }

  function openSearch() {
    var ov = document.getElementById("searchOv");
    if (ov) { ov.classList.add("on"); var i = document.getElementById("searchInput"); if (i) i.focus(); return; }
    ov = document.createElement("div");
    ov.id = "searchOv"; ov.className = "search-ov";
    ov.innerHTML =
      '<div class="search-panel" role="dialog" aria-label="Search">' +
        '<div class="search-bar">' + ICON.search +
          '<input id="searchInput" type="text" placeholder="Search gyms, coaches, pages…" autocomplete="off">' +
          '<button class="icon-btn" id="searchClose" aria-label="Close">' + ICON.close + "</button>" +
        "</div>" +
        '<div class="search-results" id="searchResults"></div>' +
      "</div>";
    document.body.appendChild(ov);
    var input = document.getElementById("searchInput");
    function render(q) {
      var res = document.getElementById("searchResults");
      q = (q || "").trim().toLowerCase();
      var list = q ? searchIndex().filter(function (r) {
        return r.t.toLowerCase().indexOf(q) > -1 || (r.s && r.s.indexOf(q) > -1);
      }).slice(0, 8) : searchIndex().slice(0, 6);
      if (!list.length) { res.innerHTML = '<div class="sr-empty">No matches for “' + esc(q) + '”.</div>'; return; }
      res.innerHTML = list.map(function (r) {
        return '<a class="sr-row" href="' + r.u + '">' +
          (r.photo ? '<span class="sr-thumb" data-photo="' + r.photo + '"></span>' : '<span class="sr-k">' + (r.k || "Page") + "</span>") +
          '<span class="sr-t">' + esc(r.t) + "</span></a>";
      }).join("");
      // lazy photo thumbs
      res.querySelectorAll("[data-photo]").forEach(function (el) {
        if (window.GBPeople) el.innerHTML = GBPeople.art(el.getAttribute("data-photo"));
      });
    }
    input.addEventListener("input", function () { render(input.value); });
    document.getElementById("searchClose").addEventListener("click", closeSearch);
    ov.addEventListener("click", function (e) { if (e.target === ov) closeSearch(); });
    render("");
    input.focus();
    document.addEventListener("keydown", escClose);
  }
  function escClose(e) { if (e.key === "Escape") closeSearch(); }
  function closeSearch() {
    var ov = document.getElementById("searchOv");
    if (ov) ov.remove();
    document.removeEventListener("keydown", escClose);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Wiring ---------- */
  // Wires elements inside a freshly-rendered nav. Only nav-scoped handlers.
  function wireNav() {
    var nav = document.getElementById("nav");
    var burger = nav && nav.querySelector(".burger");
    if (burger) burger.addEventListener("click", function () { nav.classList.toggle("open"); });

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      function paint() {
        var m = window.GBTheme ? GBTheme.get() : "default";
        var lbl = btn.querySelector(".lbl");
        if (lbl) lbl.textContent = window.GBTheme ? GBTheme.label(m) : "Theme";
      }
      btn.addEventListener("click", function () { if (window.GBTheme) { GBTheme.next(); paint(); } });
      paint();
    });

    var sb = document.getElementById("searchBtn");
    if (sb) sb.addEventListener("click", openSearch);

    var acct = document.getElementById("acctBtn");
    if (acct) {
      acct.addEventListener("click", function (e) { e.stopPropagation(); acct.classList.toggle("open"); });
      acct.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); acct.classList.toggle("open"); }
      });
    }
    var so = document.getElementById("signOutBtn");
    if (so) so.addEventListener("click", function (e) {
      e.preventDefault();
      if (global.GBAuth) GBAuth.logout().then(function () { location.href = "/"; });
      else { GBWeb.clearUser(); location.href = "/"; }
    });
  }

  // Newsletter + document-level listeners + reveal. Bound exactly once.
  var _bound = false;
  function wireOnce() {
    if (_bound) return;
    _bound = true;

    var nf = document.getElementById("newsForm");
    if (nf) nf.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("newsEmail").value.trim();
      var note = document.getElementById("newsNote");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { note.textContent = "Please enter a valid email address."; note.className = "fn-note err"; return; }
      nf.remove();
      note.textContent = "You're in — check your inbox to confirm. " + v;
      note.className = "fn-note ok";
    });

    // Currency selector → keeps prices across the site in one pick.
    document.addEventListener("change", function (e) {
      if (e.target && e.target.id === "curPick" && window.GBWeb) GBWeb.setCur(e.target.value);
    });

    // PWA install (footer button) — captures the browser's install prompt.
    // Website pages don't carry a manifest link of their own, so attach the
    // app manifest here: same origin, start_url /app/ — Chrome/Edge then fire
    // beforeinstallprompt on any page and the button installs the app.
    if (!document.querySelector('link[rel="manifest"]')) {
      var lm = document.createElement("link");
      lm.rel = "manifest"; lm.href = "/app/manifest.webmanifest";
      document.head.appendChild(lm);
    }
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      var at = document.createElement("link");
      at.rel = "apple-touch-icon"; at.href = "/app/assets/img/icon-180.png";
      document.head.appendChild(at);
    }
    var _installEvt = null;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      _installEvt = e;
      var b = document.getElementById("installBtn");
      if (b) b.textContent = "Install app — it's free";
    });
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "installBtn") {
        if (_installEvt) {
          _installEvt.prompt();
          _installEvt.userChoice.then(function () { _installEvt = null; });
        } else {
          location.href = "/app/"; // iOS: Share → Add to Home Screen
        }
      }
    });

    // Back-to-top
    var top = document.createElement("button");
    top.className = "to-top"; top.type = "button";
    top.setAttribute("aria-label", "Back to top");
    top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(top);
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    window.addEventListener("scroll", function () {
      top.classList.toggle("on", window.scrollY > 640);
    }, { passive: true });

    // Session/auth client for every page (adds real sign in state to the nav).
    if (!global.GBAuth && !document.getElementById("gbAuthScript")) {
      var s = document.createElement("script");
      s.id = "gbAuthScript"; s.src = "/assets/auth.js"; s.async = true;
      document.head.appendChild(s);
    }

    // store.js dispatches these on window — listen there so the account
    // menu updates live (document listeners would never see them).
    global.addEventListener("auth:change", navReflow);
    document.addEventListener("click", function (e) {
      var a = document.getElementById("acctBtn");
      if (a && !a.contains(e.target)) a.classList.remove("open");
    });
  }

  function navReflow() {
    var host = document.getElementById("site-nav");
    if (host) { host.innerHTML = navHTML(); wireNav(); }
  }

  /* ---------- Scroll reveal (available on every page) ---------- */
  var _io = null;
  function observeReveals() {
    var els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!_io) {
      _io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); _io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
    }
    els.forEach(function (el) { _io.observe(el); });
  }

  function mount() {
    // Remove any pre-existing static OR previously-injected nav/footer so
    // markup stays a single source of truth and never doubles up.
    document.querySelectorAll(".nav, .footer, #site-nav, #site-footer").forEach(function (n) { n.remove(); });

    // Animated aurora backdrop — one shared layer behind every page.
    if (!document.querySelector(".aurora")) {
      var au = document.createElement("div");
      au.className = "aurora";
      au.setAttribute("aria-hidden", "true");
      au.innerHTML = '<span class="a-shot s1"></span><span class="a-shot s2"></span><span class="a-shot s3"></span>' +
        '<span class="a-blob b1"></span><span class="a-blob b2"></span><span class="a-blob b3"></span>';
      document.body.insertBefore(au, document.body.firstChild);
    }

    var navHost = document.createElement("div");
    navHost.id = "site-nav";
    navHost.innerHTML = navHTML();
    document.body.insertBefore(navHost, document.body.firstChild);

    var footHost = document.createElement("div");
    footHost.id = "site-footer";
    footHost.innerHTML = footerHTML();
    document.body.appendChild(footHost);

    wireNav();
    wireOnce();
    observeReveals();
    mountLangPicker();
    mountFootLang();
    applyLang();
    if (global.GBChat) global.GBChat.mount();
  }

  /* The footer carries its own language picker, in place of the old
     currency selector. */
  function mountFootLang() {
    if (!window.GBI18n) return;
    var slot = document.getElementById("langSlotFoot");
    if (!slot) return;
    slot.innerHTML = "";
    slot.appendChild(GBI18n.picker({
      className: "lang-picker foot-lang",
      onChange: function () {
        navReflow();
        mountLangPicker();
        mountFootLang();
        applyLang();
      }
    }));
  }

  /* ---------- language picker (flags) + translation pass ---------- */
  function mountLangPicker() {
    if (!window.GBI18n) return;
    var slot = document.getElementById("langSlot");
    if (!slot) return;
    slot.innerHTML = "";
    var picker = GBI18n.picker({
      onChange: function () {
        // Re-render the chrome so every label flips, then re-translate the
        // page body. The footer is rebuilt too so its links follow suit.
        navReflow();
        mountLangPicker();
        applyLang();
      }
    });
    slot.appendChild(picker);
  }

  function applyLang() {
    if (!window.GBI18n) return;
    GBI18n.apply(document.body);
  }

  global.GBChrome = {
    mount: mount, refresh: mount, openSearch: openSearch,
    observeReveals: observeReveals, icon: ICON
  };
})(typeof window !== "undefined" ? window : this);
