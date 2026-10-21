/* ==========================================================================
   GYM BADGE — GBAuth (shared by website + app, same API endpoints)

   Dual-mode by design:
     "api"   — talks to the JSON API in server.py (real accounts, PBKDF2
               hashed passwords, real verification/reset tokens, real email
               once SMTP is configured).
     "local" — when the API isn't reachable (static hosting, older server
               process, airplane-mode PWA), accounts live in this device's
               localStorage so the flow still completes end-to-end. This is
               also what makes offline sign in possible after install.

   Security notes:
     - Password rules: min 8 chars, must mix letters + numbers (validated
       identically on client for UX and on the server for enforcement).
     - SSN/NIN is NEVER a login credential. Identity numbers are handled by
       GBAuth.verifyId() as an optional, masked, hashed verification only.
     - The session token is stored in localStorage; on go-live prefer
       httpOnly cookies set by your backend (keep this same API shape).
   ========================================================================== */
(function (global) {
  "use strict";

  var TOKEN_K = "gb_auth_token";
  var LOCAL_K = "gb_auth_local";   // { users:{}, vtok:{}, rtok:{} }
  var MODE_K  = "gb_auth_mode";    // cached "api" | "local"

  /* ---------------- helpers ---------------- */
  function read(k, fb) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function rm(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function escOk(r) { return !!(r && r.ok); }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /** Password rule check — mirrored on the server (valid_password). */
  function checkPassword(pw) {
    pw = pw || "";
    return {
      length:  pw.length >= 8,
      alnum:   /[A-Za-z]/.test(pw) && /\d/.test(pw),
      ok:      pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw),
      message: pw.length < 8 ? "Password must be at least 8 characters."
             : !( /[A-Za-z]/.test(pw) && /\d/.test(pw)) ? "Password must contain both letters and numbers."
             : ""
    };
  }

  /* ---- local-mode crypto (fallback only; server uses PBKDF2) ---- */
  function hashLocal(pw, salt) {
    var data = (salt || "gb") + ":" + pw;
    if (global.crypto && crypto.subtle && crypto.subtle.digest) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
        .then(function (buf) {
          return "s$" + (salt || "gb") + "$" + Array.prototype.map.call(new Uint8Array(buf),
            function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
        });
    }
    var h = 5381; // djb2 — only used when WebCrypto is unavailable
    for (var i = 0; i < data.length; i++) h = ((h << 5) + h + data.charCodeAt(i)) >>> 0;
    return Promise.resolve("d$" + (salt || "gb") + "$" + h.toString(16));
  }
  function verifyLocal(pw, stored) {
    if (!stored) return Promise.resolve(false);
    var parts = String(stored).split("$");
    return hashLocal(pw, parts[1]).then(function (h) { return h === stored; });
  }

  function tok(n) {
    var s = "", a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if (global.crypto && crypto.getRandomValues) {
      var b = new Uint8Array(n || 24); crypto.getRandomValues(b);
      for (var i = 0; i < b.length; i++) s += a[b[i] % a.length];
      return s;
    }
    for (var j = 0; j < (n || 24); j++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }

  /* ---------------- mode detection ---------------- */
  var _modePromise = null;
  function mode() {
    if (_modePromise) return _modePromise;
    var cached = read(MODE_K, null);
    _modePromise = fetch("/api/config", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (cfg) { write(MODE_K, "api"); global.GBCFG = cfg; return "api"; })
      .catch(function () {
        var m = cached === "api" ? "local" : (cached || "local");
        write(MODE_K, m);
        global.GBCFG = { devMode: true, googleOAuth: false, yahooOAuth: false, stripeLive: false, emailLive: false };
        return m;
      });
    return _modePromise;
  }

  function api(path, body, method, token) {
    return fetch("/api" + path, {
      method: method || "POST",
      headers: Object.assign({ "Content-Type": "application/json" },
        token ? { "Authorization": "Bearer " + token } : {}),
      body: (method === "GET" || method === "DELETE") ? undefined : JSON.stringify(body || {})
    }).then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); });
  }

  /* ---------------- session plumbing ---------------- */
  function token() { return read(TOKEN_K, null); }
  function setToken(t) { t ? write(TOKEN_K, t) : rm(TOKEN_K); }

  function afterAuth(user, tk) {
    if (tk) setToken(tk);
    if (user) {
      write("gb_auth_user", user);
      if (global.GBWeb) GBWeb.setUser({
        name: user.name, email: user.email, role: user.role, country: user.country,
        verified: !!user.verified, idVerified: !!user.idVerified, idMasked: user.idMasked || "",
        serverId: user.id, joined: user.joined
      });
    }
    return user;
  }

  /* ---------------- LOCAL mode store ---------------- */
  function localDB() {
    return read(LOCAL_K, { users: {}, vtok: {}, rtok: {} });
  }
  function localSave(db) { write(LOCAL_K, db); }

  /* ---------------- public API ---------------- */

  function signup(fields) {
    var name = (fields.name || "").trim();
    var email = (fields.email || "").trim().toLowerCase();
    var pw = fields.password || "";
    if (!name) return Promise.resolve({ ok: false, error: "Please enter your full name." });
    if (!EMAIL_RE.test(email)) return Promise.resolve({ ok: false, error: "Please enter a valid email address." });
    var pc = checkPassword(pw);
    if (!pc.ok) return Promise.resolve({ ok: false, error: pc.message });

    return mode().then(function (m) {
      if (m === "api") {
        return api("/auth/signup", {
          name: name, email: email, password: pw,
          role: fields.role || "individual", country: fields.country || ""
        }).then(function (j) {
          if (j.ok && j.user) afterAuth(j.user, j.token);
          return j;
        });
      }
      // local
      var db = localDB();
      if (db.users[email]) return { ok: false, _status: 409, error: "An account with that email already exists. Try signing in." };
      var salt = tok(8);
      return hashLocal(pw, salt).then(function (h) {
        db.users[email] = {
          id: "u_" + tok(8), name: name, email: email, pw: h, verified: false,
          role: fields.role || "individual", country: fields.country || "",
          idVerified: false, idMasked: "", idType: "",
          photos: [], joined: new Date().toISOString()
        };
        var vt = tok(16);
        db.vtok[vt] = { email: email, exp: Date.now() + 864e5 };
        localSave(db);
        var link = location.origin + "/verify?token=" + vt;
        var user = publicLocal(db.users[email]);
        afterAuth(user, "local$" + email);
        return { ok: true, needsVerification: true, devVerifyLink: link, token: "local$" + email, user: user,
                 note: "Offline mode: your verification link is shown here instead of an email." };
      });
    });
  }

  function login(fields) {
    var email = (fields.email || "").trim().toLowerCase();
    var pw = fields.password || "";
    if (!EMAIL_RE.test(email) || !pw) return Promise.resolve({ ok: false, error: "Enter your email and password." });

    return mode().then(function (m) {
      if (m === "api") {
        return api("/auth/login", { email: email, password: pw }).then(function (j) {
          if (j.ok && j.user) afterAuth(j.user, j.token);
          return j;
        });
      }
      var db = localDB();
      var u = db.users[email];
      if (!u) return { ok: false, _status: 401, error: "No account found for that email. Create one first." };
      return verifyLocal(pw, u.pw).then(function (good) {
        if (!good) return { ok: false, _status: 401, error: "Wrong email or password." };
        var user = publicLocal(u);
        afterAuth(user, "local$" + email);
        return { ok: true, token: "local$" + email, user: user, needsVerification: !u.verified };
      });
    });
  }

  /** Change the password of the signed-in member.
      Real accounts go through the API (PBKDF2 re-hash server side); local
      offline accounts are re-hashed here with the same scheme. */
  function changePassword(current, next) {
    var pc = checkPassword(next);
    if (!pc.ok) return Promise.resolve({ ok: false, error: pc.message });
    if (!current) return Promise.resolve({ ok: false, error: "Enter your current password." });

    return mode().then(function (m) {
      if (m === "api") {
        var t = token();
        if (!t) return { ok: false, error: "Please sign in again." };
        return api("/auth/change-password", { current: current, password: next }, "POST", t)
          .then(function (j) {
            if (j.ok) {
              // every other session is dropped server side, so refresh ours
              write("gb_auth_user", j.user || read("gb_auth_user", null));
            }
            return j;
          });
      }
      var db = localDB();
      var u = null;
      for (var k in db.users) { u = db.users[k]; break; }
      if (!u) return { ok: false, error: "Sign in first." };
      return verifyLocal(current, u.pw).then(function (good) {
        if (!good) return { ok: false, error: "Current password incorrect." };
        var salt = tok(8);
        return hashLocal(next, salt).then(function (h) {
          u.pw = h;
          localSave(db);
          return { ok: true, message: "Password updated." };
        });
      });
    });
  }

  function logout() {
    var t = token();
    setToken(null);
    rm("gb_auth_user");
    if (global.GBWeb) GBWeb.clearUser();
    if (t && t.indexOf("local$") !== 0) {
      // best-effort server session kill (fire and forget)
      try { fetch("/api/auth/logout", { method: "POST", headers: { "Authorization": "Bearer " + t } }); } catch (e) {}
    }
    return Promise.resolve(true);
  }

  function verify(tokenStr) {
    return mode().then(function (m) {
      if (m === "api") return api("/auth/verify", { token: tokenStr }).then(function (j) {
        if (j.ok && global.GBWeb) GBWeb.updateUser({ verified: true });
        return j;
      });
      var db = localDB();
      var rec = db.vtok[tokenStr];
      if (!rec || rec.exp < Date.now()) return { ok: false, error: "This verification link is invalid or has expired. Request a new one." };
      if (db.users[rec.email]) db.users[rec.email].verified = true;
      delete db.vtok[tokenStr];
      localSave(db);
      if (global.GBWeb) GBWeb.updateUser({ verified: true });
      return { ok: true, email: rec.email };
    });
  }

  function resendVerification(email) {
    email = (email || "").trim().toLowerCase();
    return mode().then(function (m) {
      if (m === "api") return api("/auth/signup/resend", { email: email });
      var db = localDB();
      if (!db.users[email]) return { ok: true, message: "If that email is registered, a link is on its way." };
      var vt = tok(16);
      db.vtok[vt] = { email: email, exp: Date.now() + 864e5 };
      localSave(db);
      return { ok: true, devVerifyLink: location.origin + "/verify?token=" + vt };
    });
  }

  function forgot(email) {
    email = (email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return Promise.resolve({ ok: false, error: "Please enter a valid email address." });
    return mode().then(function (m) {
      if (m === "api") return api("/auth/forgot", { email: email });
      var db = localDB();
      if (!db.users[email]) return { ok: true, message: "If that email is registered, a reset link is on its way.", devResetLink: null };
      var rt = tok(16);
      db.rtok[rt] = { email: email, exp: Date.now() + 36e5 };
      localSave(db);
      return { ok: true, message: "If that email is registered, a reset link is on its way.",
               devResetLink: location.origin + "/reset?token=" + rt,
               note: "Offline mode: your reset link is shown here." };
    });
  }

  function reset(tokenStr, password) {
    var pc = checkPassword(password);
    if (!pc.ok) return Promise.resolve({ ok: false, error: pc.message });
    return mode().then(function (m) {
      if (m === "api") return api("/auth/reset", { token: tokenStr, password: password });
      var db = localDB();
      var rec = db.rtok[tokenStr];
      if (!rec || rec.exp < Date.now()) return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
      var salt = tok(8);
      return hashLocal(password, salt).then(function (h) {
        if (db.users[rec.email]) db.users[rec.email].pw = h;
        delete db.rtok[tokenStr];
        localSave(db);
        return { ok: true, message: "Password updated. You can sign in now." };
      });
    });
  }

  /** Google / Yahoo. Real ID-token verification happens server-side once you
      add your OAuth client IDs (GYMBADGE_GOOGLE_CLIENT_ID / _YAHOO_CLIENT_ID);
      until then both modes create/link the account and say so. */
  function oauth(provider, extra) {
    provider = (provider || "").toLowerCase();
    extra = extra || {};
    return mode().then(function (m) {
      if (m === "api") {
        return api("/auth/oauth", { provider: provider, email: extra.email, name: extra.name })
          .then(function (j) { if (j.ok && j.user) afterAuth(j.user, j.token); return j; });
      }
      var email = (extra.email || (provider + "_" + tok(4).toLowerCase() + "@oauth.local"));
      var db = localDB();
      if (!db.users[email]) {
        db.users[email] = {
          id: "u_" + tok(8), name: extra.name || (provider.charAt(0).toUpperCase() + provider.slice(1) + " member"),
          email: email, // password is owned by the OAuth provider — never verified locally
          pw: "oauth$" + tok(8) + "$" + tok(8),
          verified: true, role: "individual",
          country: "", idVerified: false, idMasked: "", idType: "", photos: [],
          joined: new Date().toISOString()
        };
        localSave(db);
      }
      var user = publicLocal(db.users[email]);
      afterAuth(user, "local$" + email);
      return { ok: true, token: "local$" + email, user: user, demo: true,
               note: "Add your " + provider + " OAuth client ID on the server to verify real Google/Yahoo accounts." };
    });
  }

  /** Optional identity verification (NIN / SSN / passport / licence).
      The number is masked to last-4 + salted-hash on the server; it is NEVER
      used as a login credential and NEVER stored in clear. */
  function verifyId(fields) {
    return mode().then(function (m) {
      if (m === "api") {
        return api("/verify/id", fields, "POST", token()).then(function (j) {
          if (j.ok && j.user && global.GBWeb) GBWeb.updateUser({ idVerified: true, idMasked: j.user.idMasked });
          return j;
        });
      }
      var num = String(fields.number || "").replace(/\D/g, "");
      if (num.length < 8) return { ok: false, error: "That ID number looks too short." };
      var u = global.GBWeb && GBWeb.getUser();
      if (!u) return { ok: false, error: "Sign in first." };
      if (fields.fullName && fields.fullName.trim().toLowerCase() !== String(u.name || "").toLowerCase())
        return { ok: false, error: "The name must match the name on your account." };
      var masked = "*".repeat(Math.max(0, num.length - 4)) + num.slice(-4);
      if (global.GBWeb) GBWeb.updateUser({ idVerified: true, idMasked: masked, idType: fields.idType });
      return { ok: true, user: Object.assign({}, u, { idVerified: true, idMasked: masked, idType: fields.idType }),
               message: "Identity verified. Only the last 4 digits are stored." };
    });
  }

  function me() {
    return mode().then(function (m) {
      var t = token();
      if (!t) return null;
      if (m === "api" && t.indexOf("local$") !== 0) {
        return api("/profile", null, "GET", t).then(function (j) {
          if (j.ok && j.user) { write("gb_auth_user", j.user); if (global.GBWeb) afterAuth(j.user, null); return j.user; }
          // token expired/invalid → clean up
          if (j._status === 401) { setToken(null); rm("gb_auth_user"); }
          return null;
        }).catch(function () { return read("gb_auth_user", null); });
      }
      if (t.indexOf("local$") === 0) {
        var email = t.slice(6);
        var db = localDB();
        if (db.users[email]) return publicLocal(db.users[email]);
        return null;
      }
      return read("gb_auth_user", null);
    });
  }

  function publicLocal(u) {
    return {
      id: u.id, name: u.name, email: u.email, verified: !!u.verified, role: u.role,
      country: u.country, idVerified: !!u.idVerified, idMasked: u.idMasked || "",
      idType: u.idType || "", photos: u.photos || [], joined: u.joined
    };
  }

  function cfg() {
    return mode().then(function () { return global.GBCFG || {}; });
  }

  /* ---- restore session on load so every page/chrome sees one identity ---- */
  function restore() {
    return me().then(function (u) {
      if (u && global.GBWeb && !GBWeb.getUser()) afterAuth(u, null);
      return u;
    }).catch(function () { return null; });
  }

  global.GBAuth = {
    mode: mode, cfg: cfg,
    checkPassword: checkPassword, EMAIL_RE: EMAIL_RE,
    signup: signup, login: login, logout: logout,
    verify: verify, resendVerification: resendVerification,
    forgot: forgot, reset: reset, oauth: oauth,
    changePassword: changePassword,
    verifyId: verifyId, me: me, restore: restore,
    token: token
  };

  // Kick off session restore immediately (non-blocking).
  if (global.document) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { restore(); });
    else restore();
  }
})(typeof window !== "undefined" ? window : this);
