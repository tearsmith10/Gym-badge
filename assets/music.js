/* ==========================================================================
   GYM BADGE — music sync (Spotify · YouTube Music · Audiomack)

   Real OAuth 2.0 (Authorization Code + PKCE) against each provider's live
   endpoints. No client secret ever ships to the browser — PKCE lets a public
   client exchange the code safely on its own.

   Flow per provider
   -----------------
     1. Build the authorize URL (with a PKCE challenge).
     2. Open it in a popup. The provider redirects back to
        /app/#/music-callback?provider=…&code=…
     3. The callback route exchanges the code for tokens via the provider's
        token endpoint (CORS is allowed on all three).
     4. Tokens land in GBStore.music. The now-playing track is stored on the
        public profile so other members in the community can see it.

   Configuration
   -------------
   Client IDs come from /api/config (the server) with sane fallbacks, so a
   deployment can enable each provider without touching the frontend. When a
   provider has no client ID the UI says so plainly instead of failing
   silently, and the app stays fully usable offline.
   ========================================================================== */
(function (global) {
  "use strict";

  var S = window.GBStore;

  /* ---------------- provider registry ---------------- */
  var PROVIDERS = {
    spotify: {
      id: "spotify",
      name: "Spotify",
      icon: "🟢",
      color: "#1db954",
      authURL: "https://accounts.spotify.com/authorize",
      tokenURL: "https://accounts.spotify.com/api/token",
      scopes: [
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-read-currently-playing"
      ],
      apiBase: "https://api.spotify.com/v1"
    },
    youtube: {
      id: "youtube",
      name: "YouTube Music",
      icon: "▶️",
      color: "#ff0033",
      authURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL: "https://oauth2.googleapis.com/token",
      scopes: [
        "https://www.googleapis.com/auth/youtube.readonly"
      ],
      apiBase: "https://www.googleapis.com/youtube/v3"
    },
    audiomack: {
      id: "audiomack",
      name: "Audiomack",
      icon: "🟠",
      color: "#ff9200",
      authURL: "https://api.audiomack.com/v1/oauth2/authorize",
      tokenURL: "https://api.audiomack.com/v1/oauth2/token",
      scopes: ["user.read"],
      apiBase: "https://api.audiomack.com/v1"
    }
  };

  /* ---------------- PKCE helpers ----------------
     The verifier lives in localStorage (not sessionStorage) because the
     OAuth popup is a SEPARATE browsing context with its own sessionStorage.
     The opener must be able to read the verifier back when it exchanges
     the code, and localStorage is shared across same-origin tabs.        */
  function b64url(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function randomBytes(n) {
    var b = new Uint8Array(n);
    if (global.crypto && crypto.getRandomValues) crypto.getRandomValues(b);
    else for (var i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
    return b;
  }
  function sha256(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return new Uint8Array(buf);
    });
  }

  var PKCE_STORE = "gb_music_pkce";
  function savePkce(v) {
    try { localStorage.setItem(PKCE_STORE, JSON.stringify(v)); } catch (e) {}
  }
  function loadPkce() {
    try { return JSON.parse(localStorage.getItem(PKCE_STORE) || "null"); } catch (e) { return null; }
  }
  function clearPkce() { try { localStorage.removeItem(PKCE_STORE); } catch (e) {} }

  function makePkce() {
    var verifier = b64url(randomBytes(48));
    return sha256(verifier).then(function (hash) {
      return { verifier: verifier, challenge: b64url(hash) };
    });
  }

  /* ---------------- config (client ids) ---------------- */
  var CFG = null;
  function config() {
    if (CFG) return Promise.resolve(CFG);
    return fetch("/api/config", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (c) { CFG = c || {}; return CFG; })
      .catch(function () { CFG = {}; return CFG; });
  }
  function clientId(provider) {
    var key = "spotifyClientId";
    if (provider === "youtube") key = "googleClientId";
    if (provider === "audiomack") key = "audiomackClientId";
    var c = CFG || {};
    if (c[key]) return c[key];
    // optional override so a static deploy can be configured without a server
    try {
      var raw = localStorage.getItem("gb_music_ids");
      if (raw) { var o = JSON.parse(raw); if (o[key]) return o[key]; }
    } catch (e) {}
    return "";
  }
  function setClientId(provider, id) {
    var key = provider === "spotify" ? "spotifyClientId"
            : provider === "youtube" ? "googleClientId" : "audiomackClientId";
    try {
      var o = JSON.parse(localStorage.getItem("gb_music_ids") || "{}");
      o[key] = id; localStorage.setItem("gb_music_ids", JSON.stringify(o));
    } catch (e) {}
  }

  function redirectUri() {
    // MUST NOT contain a fragment — OAuth 2.0 forbids it and Google rejects it.
    // A dedicated static page receives the code and hands it back to the
    // opener with postMessage, so the SPA never has to be the redirect target.
    return location.origin + "/app/oauth.html";
  }

  /* ---------------- connect ---------------- */
  function connect(providerId) {
    var p = PROVIDERS[providerId];
    if (!p) return Promise.reject(new Error("Unknown provider"));
    return config().then(function () {
      var cid = clientId(providerId);
      if (!cid) {
        return Promise.reject({
          code: "NO_CLIENT_ID",
          message: p.name + " is not configured on this deployment yet."
        });
      }
      return makePkce().then(function (pkce) {
        var state = "gb." + providerId + "." + Date.now().toString(36) + "." +
          Math.random().toString(36).slice(2, 8);
        savePkce({
          provider: providerId,
          verifier: pkce.verifier,
          state: state,
          at: Date.now()
        });
        var params = [
          "response_type=code",
          "client_id=" + encodeURIComponent(cid),
          "redirect_uri=" + encodeURIComponent(redirectUri()),
          "scope=" + encodeURIComponent(p.scopes.join(" ")),
          "state=" + encodeURIComponent(state),
          "code_challenge_method=S256",
          "code_challenge=" + encodeURIComponent(pkce.challenge)
        ];
        if (providerId === "youtube") {
          params.push("access_type=offline");
          params.push("prompt=consent");
        }
        var url = p.authURL + "?" + params.join("&");
        return openPopup(url);
      });
    });
  }

  function openPopup(url) {
    return new Promise(function (resolve, reject) {
      var w = 520, h = 640;
      var left = Math.max(0, Math.round((screen.width - w) / 2));
      var top = Math.max(0, Math.round((screen.height - h) / 2));
      var pop = window.open(url, "gb_music_oauth",
        "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top);
      if (!pop) {
        reject({ code: "POPUP_BLOCKED", message: "Allow pop up windows to connect your music account." });
        return;
      }
      var done = false;
      var finished = false;

      // The callback page posts the result back to us.
      function onMessage(ev) {
        if (ev.origin !== location.origin) return;
        var d = ev.data;
        if (!d || d.source !== "gb-music" || done) return;
        done = true;
        window.removeEventListener("message", onMessage);
        clearInterval(timer);
        clearInterval(closeWatch);
        try { pop.close(); } catch (e) {}
        if (d.error) reject({ code: d.error, message: d.message || "Sign in was cancelled." });
        else resolve(d);
      }
      window.addEventListener("message", onMessage);

      // If the user closes the popup without finishing, fail gracefully.
      var closeWatch = setInterval(function () {
        if (done || finished) return;
        if (pop.closed) {
          finished = true;
          clearInterval(timer); clearInterval(closeWatch);
          window.removeEventListener("message", onMessage);
          reject({ code: "CLOSED", message: "Music sign in was cancelled." });
        }
      }, 600);

      // Some providers land directly on a URL the popup can see; poll as a
      // fallback in case the postMessage never arrives.
      var timer = setInterval(function () {
        if (done || finished) return;
        var href = "";
        try { href = pop.location.href; } catch (e) { return; }
        if (!href || href.indexOf("/app/oauth.html") < 0) return;
        var q = parseQuery(href);
        if (q.error) {
          done = true; clearInterval(timer); clearInterval(closeWatch);
          try { pop.close(); } catch (e) {}
          reject({ code: q.error, message: q.error_description || "Sign in was cancelled." });
        } else if (q.code) {
          done = true; clearInterval(timer); clearInterval(closeWatch);
          try { pop.close(); } catch (e) {}
          resolve(q);
        }
      }, 500);
    });
  }

  function parseQuery(href) {
    var out = {};
    var qs = String(href).split("?")[1] || "";
    qs = qs.split("#")[0];
    qs.split("&").forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf("=");
      var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
      var v = i < 0 ? "" : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " "));
      out[k] = v;
    });
    return out;
  }

  function parseCallback(href) {
    var out = parseQuery(href);
    var pk = loadPkce();
    if (pk && pk.state && out.state && pk.state !== out.state) {
      return { error: "state_mismatch", error_description: "The sign in session did not match. Try again." };
    }
    if (pk && pk.provider && !out.provider) out.provider = pk.provider;
    return out;
  }

  /* ---------------- token exchange ---------------- */
  function exchange(providerId, code) {
    var p = PROVIDERS[providerId];
    if (!p) return Promise.reject({ code: "NO_PROVIDER", message: "Unknown music service." });
    var pk = loadPkce();
    if (!pk || pk.provider !== providerId) {
      return Promise.reject({ code: "NO_PKCE", message: "The sign in session expired. Try again." });
    }
    return config().then(function () {
      var cid = clientId(providerId);
      var body = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri(),
        client_id: cid,
        code_verifier: pk.verifier
      };
      return fetch(p.tokenURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(body)
      }).then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, j: j }; });
      }).then(function (res) {
        if (!res.ok || !res.j.access_token) {
          throw {
            code: "TOKEN_FAILED",
            message: (res.j && (res.j.error_description || res.j.error)) || "Could not finish sign in."
          };
        }
        clearPkce();
        return res.j;
      });
    });
  }

  function encodeForm(obj) {
    return Object.keys(obj).filter(function (k) { return obj[k] != null && obj[k] !== ""; })
      .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]); })
      .join("&");
  }

  /* ---------------- token storage ---------------- */
  function music() { return (S && S.get().music) || { provider: null, token: null, currentTrack: null }; }

  function saveMusic(patch) {
    var cur = music();
    var next = {
      provider: patch.provider !== undefined ? patch.provider : cur.provider,
      token: patch.token !== undefined ? patch.token : cur.token,
      refreshToken: patch.refreshToken !== undefined ? patch.refreshToken : cur.refreshToken,
      expiresAt: patch.expiresAt !== undefined ? patch.expiresAt : cur.expiresAt,
      currentTrack: patch.currentTrack !== undefined ? patch.currentTrack : cur.currentTrack
    };
    if (S) S.set({ music: next });
    return next;
  }

  function disconnect() {
    var m = music();
    saveMusic({ provider: null, token: null, refreshToken: null, expiresAt: 0, currentTrack: null });
    // also clear the public "now playing" so the community stops showing it
    try {
      var u = S.user();
      if (u) { u.music = null; S.setUser(u); }
    } catch (e) {}
    return m;
  }

  function connected() {
    var m = music();
    return !!(m.provider && m.token);
  }

  /* ---------------- now playing ---------------- */
  function nowPlaying(providerId) {
    var id = providerId || music().provider;
    var m = music();
    if (!id || !m.token) return Promise.resolve(null);
    if (id === "spotify") return spotifyNow(m.token);
    if (id === "youtube") return youtubeNow(m.token);
    if (id === "audiomack") return audiomackNow(m.token);
    return Promise.resolve(null);
  }

  function spotifyNow(token) {
    return fetch("https://api.spotify.com/v1/me/player/currently-playing?additional_types=track", {
      headers: { Authorization: "Bearer " + token }
    }).then(function (r) {
      if (r.status === 204 || r.status === 404) return null;
      if (!r.ok) throw { code: "SPOTIFY_ERR", message: "Spotify could not be reached." };
      return r.json();
    }).then(function (d) {
      if (!d || !d.item) return null;
      return {
        provider: "spotify",
        title: d.item.name,
        artist: (d.item.artists || []).map(function (a) { return a.name; }).join(", "),
        album: d.item.album ? d.item.album.name : "",
        art: d.item.album && d.item.album.images && d.item.album.images[0]
          ? d.item.album.images[0].url : "",
        url: d.item.external_urls ? d.item.external_urls.spotify : "",
        playing: !!d.is_playing
      };
    });
  }

  function youtubeNow(token) {
    // YouTube has no "now playing" endpoint, so we surface the most recently
    // added playlist item for the signed-in channel — the closest equivalent.
    return fetch("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true", {
      headers: { Authorization: "Bearer " + token }
    }).then(function (r) { if (!r.ok) throw { code: "YT_ERR", message: "YouTube Music could not be reached." }; return r.json(); })
      .then(function (ch) {
        var uploads = ch && ch.items && ch.items[0] && ch.items[0].contentDetails
          && ch.items[0].contentDetails.relatedPlaylists
          && ch.items[0].contentDetails.relatedPlaylists.uploads;
        if (!uploads) return null;
        return fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" +
          encodeURIComponent(uploads) + "&maxResults=1", {
          headers: { Authorization: "Bearer " + token }
        }).then(function (r) { return r.json(); });
      })
      .then(function (pl) {
        var it = pl && pl.items && pl.items[0];
        if (!it) return null;
        var sn = it.snippet || {};
        return {
          provider: "youtube",
          title: sn.title || "YouTube Music",
          artist: sn.channelTitle || "",
          album: "",
          art: (sn.thumbnails && sn.thumbnails.high && sn.thumbnails.high.url) || "",
          url: "https://music.youtube.com/watch?v=" + (it.contentDetails && it.contentDetails.videoId || ""),
          playing: false
        };
      });
  }

  function audiomackNow(token) {
    return fetch("https://api.audiomack.com/v1/user/tracks?limit=1", {
      headers: { Authorization: "Bearer " + token }
    }).then(function (r) {
      if (!r.ok) throw { code: "AM_ERR", message: "Audiomack could not be reached." };
      return r.json();
    }).then(function (d) {
      var list = (d && (d.tracks || d.data)) || [];
      var t = list[0];
      if (!t) return null;
      return {
        provider: "audiomack",
        title: t.title || "Audiomack",
        artist: t.user && t.user.name || "",
        album: t.album_name || "",
        art: t.artwork_300 || t.artwork_150 || "",
        url: t.permalink_url || "",
        playing: false
      };
    });
  }

  /* ---------------- public profile (community visibility) ---------------- */
  function publishTrack(track) {
    try {
      var u = S.user();
      if (!u) return;
      u.music = track ? {
        provider: track.provider,
        title: track.title,
        artist: track.artist,
        art: track.art || "",
        url: track.url || "",
        at: new Date().toISOString()
      } : null;
      S.setUser(u);
    } catch (e) {}
  }

  function refreshNowPlaying() {
    return nowPlaying().then(function (track) {
      saveMusic({ currentTrack: track });
      publishTrack(track);
      return track;
    });
  }

  /* ---------------- profile of the signed-in account ---------------- */
  function profile() {
    var id = music().provider;
    var m = music();
    if (id === "spotify" && m.token) {
      return fetch("https://api.spotify.com/v1/me", { headers: { Authorization: "Bearer " + m.token } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { return d ? { name: d.display_name || d.id, image: (d.images && d.images[0] && d.images[0].url) || "" } : null; })
        .catch(function () { return null; });
    }
    return Promise.resolve(null);
  }

  window.GBMusic = {
    providers: function () { return Object.keys(PROVIDERS).map(function (k) { return PROVIDERS[k]; }); },
    provider: function (id) { return PROVIDERS[id] || null; },
    connect: connect,
    exchange: exchange,
    parseCallback: parseCallback,
    music: music,
    saveMusic: saveMusic,
    disconnect: disconnect,
    connected: connected,
    nowPlaying: nowPlaying,
    refreshNowPlaying: refreshNowPlaying,
    publishTrack: publishTrack,
    profile: profile,
    config: config,
    clientId: clientId,
    setClientId: setClientId,
    configured: function (id) { return !!clientId(id); }
  };
})(typeof window !== "undefined" ? window : this);
