/* ==========================================================================
   GYM BADGE — settings screen (app)

   Every setting a member can change lives here:
     • Account   — avatar upload, name, email, country
     • Security  — change password (with eye toggle), forgot password /
                   email recovery, verification resend, sign out everywhere
     • Training  — units, morning & evening reminders, haptics, autoplay
     • Language  — flags picker, changes the whole app instantly
     • Music     — connect Spotify / YouTube Music / Audiomack, now playing
     • Privacy   — export your data, delete it
     • Support   — FAQ, email, about

   The screen is deliberately built from the same GBStore + GBI18n + GBMusic
   modules the rest of the app uses, so a change here is reflected in the
   profile, the community view and the service worker cache at once.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.GBData, S = window.GBStore, L = window.GBI18n, M = window.GBMusic;

  /* The app shell lives in app.js. Borrow the primitives we need so this
     file stays self-contained and readable. */
  var SH = window.GBAppShell || {};
  var h = SH.h || function (html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
  var esc = SH.esc || function (s) { return String(s == null ? "" : s); };
  var $ = SH.$ || function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var toast = (window.GBUI && window.GBUI.toast) || SH.toast || function () {};
  var shell = SH.shell || function () {};
  var go = SH.go || function () {};
  /* Re-render the current route through the app router so the screen is
     cleared first (avoids painting the tab bar twice). */
  var rerender = SH.rerender || function () { paintSettings(); };

  /* Icons (inline so the app has no icon-font dependency) */
  var ICON = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.2 12S5.8 5.5 12 5.5 21.8 12 21.8 12 18.2 18.5 12 18.5 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3.2"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 5.7A9.6 9.6 0 0112 5.5c6.2 0 9.8 6.5 9.8 6.5a17 17 0 01-3.4 4.3"/><path d="M6.3 7.4A16.6 16.6 0 002.2 12S5.8 18.5 12 18.5a9.4 9.4 0 004-.9"/><path d="M10 10a2.9 2.9 0 004.1 4.1"/><path d="M3 3l18 18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="4"/><path d="M12 12h8M17 12v3M20 12v2"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16V11a6 6 0 10-12 0v5l-1.5 2.5h15L18 16z"/><path d="M10 19.5a2.2 2.2 0 004 0"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l8 3.5v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3.5z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4 3.4-6 7.5-6s7.5 2 7.5 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  };

  function row(icon, title, sub, right, onClick) {
    var el = h('<button class="set-row"><span class="set-ic">' + icon + "</span>" +
      '<span class="set-tx"><b>' + esc(title) + "</b>" +
      (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" +
      '<span class="set-right">' + (right || "") + "</span></button>");
    if (onClick) el.onclick = onClick;
    return el;
  }

  function section(title, note) {
    var s = h('<div class="set-sec"><div class="eyebrow">' + esc(title) + "</div>" +
      (note ? '<p class="faint small" style="margin:6px 0 10px">' + esc(note) + "</p>" : "") + "</div>");
    return s;
  }

  function toggle(key, title, sub, onLabel, offLabel, onChange) {
    var prefs = S.prefs();
    var on = prefs[key] !== false;
    var pill = h('<span class="pill ' + (on ? "ok" : "") + '">' + esc(on ? onLabel : offLabel) + "</span>");
    var el = row("", title, sub, "", null);
    el.querySelector(".set-right").appendChild(pill);
    el.onclick = function () {
      var next = !(prefs[key] !== false);
      S.setPref(key, next);
      if (onChange) onChange(next);
      rerender();
    };
    return el;
  }

  /* ---------------- password field with eye ---------------- */
  function pwField(id, label, placeholder, value) {
    var wrap = h('<div class="field"><label>' + esc(label) + "</label>" +
      '<div class="pw-wrap">' +
        '<input id="' + id + '" type="password" placeholder="' + esc(placeholder || "") + '"' +
        (value ? ' value="' + esc(value) + '"' : "") + " autocomplete=\"off\">" +
        '<button type="button" class="pw-eye" aria-label="Show password" aria-pressed="false" title="Show password">' +
          '<span class="eye-on">' + ICON.eye + "</span>" +
          '<span class="eye-off">' + ICON.eyeOff + "</span>" +
        "</button>" +
      "</div></div>");
    return wrap;
  }

  function wireEye(root) {
    // The shared GBPW helper owns the eye button behaviour everywhere, so
    // the app and the website behave identically. It reuses an existing
    // .pw-eye if the markup already has one, so no duplicate buttons.
    if (window.GBPW) window.GBPW.enhanceAll(root);
  }

  /* ---------------- avatar upload ---------------- */
  function shrinkImage(file, cb, max) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var im = new Image();
      im.onload = function () {
        var maxPx = max || 320;
        var sc = Math.min(1, maxPx / Math.max(im.width, im.height));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(im.width * sc));
        c.height = Math.max(1, Math.round(im.height * sc));
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        try { cb(c.toDataURL("image/jpeg", 0.84)); }
        catch (err) { cb(null); }
      };
      im.onerror = function () { cb(null); };
      im.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------------- screen ---------------- */
  function paintSettings() {
    var node = h("<div></div>");
    var u = S.user() || {};

    /* ============ ACCOUNT ============ */
    node.appendChild(section("Account", "Your badge identity — visible to other members in the community."));

    var av = h('<div class="set-avatar-row">' +
      '<div class="set-avatar" id="setAv"></div>' +
      '<div class="set-avatar-tx">' +
        '<b>' + esc(u.name || "Athlete") + "</b>" +
        '<small>Tap the camera to upload a profile picture. Trainers are found by their photo.</small>' +
        '<div class="chips mt" id="avActions"></div>' +
      "</div></div>");
    var avBox = $("#setAv", av);
    if (u.avatar) {
      avBox.innerHTML = '<img src="' + esc(u.avatar) + '" alt="Your profile picture">';
    } else {
      avBox.innerHTML = '<span class="set-avatar-ph">' + esc((u.name || "A").charAt(0).toUpperCase()) + "</span>";
    }
    var fileInp = h('<input type="file" accept="image/*" hidden>');
    av.appendChild(fileInp);
    var camBtn = h('<button class="chip">📷 Upload photo</button>');
    var rmBtn = h('<button class="chip">Remove</button>');
    if (u.avatar) $("#avActions", av).appendChild(rmBtn);
    $("#avActions", av).appendChild(camBtn);
    camBtn.onclick = function () { fileInp.click(); };
    rmBtn.onclick = function () {
      var copy = Object.assign({}, u); delete copy.avatar;
      S.setUser(copy); toast("Profile photo removed"); rerender();
    };
    fileInp.onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      shrinkImage(f, function (dataUrl) {
        if (!dataUrl) return toast("That file isn't a readable image");
        var copy = Object.assign({}, u, { avatar: dataUrl });
        S.setUser(copy);
        toast("Profile photo updated ✓");
        rerender();
      });
    };
    node.appendChild(av);

    var acct = h('<div class="list"></div>');
    acct.appendChild(row(ICON.user, "First Rep", "Name, goal, weight, height", "", function () { go("editprofile"); }));
    acct.appendChild(row(ICON.mail, "Email address", u.email || "Not set", "", function () { go("account-email"); }));
    node.appendChild(acct);

    /* ============ SECURITY ============ */
    node.appendChild(section("Security", "Change your password, or recover it if you cannot get in."));

    var sec = h('<div class="card"></div>');
    sec.appendChild(pwField("curPass", "Current Password", "Your current password"));
    sec.appendChild(pwField("newPass", "New Password", "At least 8 characters"));
    sec.appendChild(pwField("cfmPass", "Confirm Password", "Repeat the new password"));

    var pwr = h('<div class="pw-rules"><span>At least 8 characters, with letters and numbers.</span></div>');
    sec.appendChild(pwr);
    var newInp = $("#newPass", sec);
    if (newInp) {
      newInp.addEventListener("input", function () {
        var v = this.value;
        var ok = v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
        pwr.firstChild.textContent = !v ? "At least 8 characters, with letters and numbers."
          : ok ? "✓ Strong enough"
          : v.length < 8 ? "Needs at least 8 characters."
          : "Needs letters and numbers.";
        pwr.className = "pw-rules" + (v && ok ? " ok" : v ? " warn" : "");
      });
    }

    var saveBtn = h('<button class="btn btn-primary btn-lg">Change Password</button>');
    saveBtn.onclick = function () {
      var cu = $("#curPass", sec).value;
      var nw = $("#newPass", sec).value;
      var cf = $("#cfmPass", sec).value;
      if (!cu) return toast("Enter your current password");
      if (!nw || nw.length < 8 || !/[A-Za-z]/.test(nw) || !/\d/.test(nw)) {
        return toast("New password needs 8+ characters, letters and numbers");
      }
      if (nw !== cf) return toast("Passwords do not match");
      if (nw === cu) return toast("New password must be different");
      if (typeof GBAuth !== "undefined" && GBAuth.token && GBAuth.token().indexOf("local$") !== 0) {
        // real account — change it on the server
        GBAuth.changePassword(cu, nw).then(function (res) {
          if (!res.ok) { toast(res.error || "Could not update the password"); return; }
          toast("Password updated ✓");
          rerender();
        }).catch(function () { toast("Network hiccup — try again"); });
        return;
      }
      // local / offline account
      var copy = Object.assign({}, u, { password: nw });
      S.setUser(copy);
      toast("Password updated ✓");
      rerender();
    };
    sec.appendChild(saveBtn);

    var forgot = h('<button class="btn btn-ghost mt">🔑 Forgot Password?</button>');
    forgot.onclick = function () {
      var email = u.email;
      if (typeof GBAuth !== "undefined" && GBAuth.forgot) {
        var send = function (em) {
          if (!em) return;
          GBAuth.forgot(em).then(function (res) {
            if (!res.ok) return toast(res.error || "Could not start recovery");
            toast(res.devResetLink
              ? "Reset link ready — open it in a minute"
              : "Reset link sent to " + em);
            if (res.devResetLink) showLink(res.devResetLink);
          }).catch(function () { toast("Network hiccup — try again"); });
        };
        if (email) {
          send(email);
        } else {
          GBDialog.prompt("Enter the email address on your account.", "", {
            title: "Reset your password",
            okLabel: "Send the link"
          }).then(send);
        }
      } else {
        showLink("https://gymbadge.app/forgot");
      }
    };
    sec.appendChild(forgot);

    var resend = h('<button class="btn btn-ghost mt">📧 Resend verification email</button>');
    resend.onclick = function () {
      if (typeof GBAuth === "undefined" || !GBAuth.resendVerification) return toast("Email is not available offline");
      GBAuth.resendVerification(u.email || "").then(function (res) {
        toast(res.devVerifyLink ? "Verification link ready" : "Verification email sent ✓");
        if (res.devVerifyLink) showLink(res.devVerifyLink);
      }).catch(function () { toast("Network hiccup — try again"); });
    };
    sec.appendChild(resend);
    node.appendChild(sec);

    /* ============ TRAINING ============ */
    node.appendChild(section("Training", "Units and the nudges that keep you coming back."));
    var tr = h('<div class="list"></div>');
    tr.appendChild(toggle("metric", "Metric (kg / cm)", "Use kilograms and centimetres", "On", "Off"));
    tr.appendChild(toggle("imperial", "Imperial (lb / ft)", "Use pounds and feet", "On", "Off"));
    tr.appendChild(toggle("remind_am", "Morning notifications", "A nudge early in the day", "On", "Off"));
    tr.appendChild(toggle("remind_pm", "Evening notifications", "A nudge after work", "On", "Off"));
    tr.appendChild(toggle("haptics", "Sound & haptics", "Vibration on every logged set", "On", "Off"));
    tr.appendChild(toggle("autoplay", "Autoplay exercise videos", "Play the next clip automatically", "WiFi only", "Off"));
    node.appendChild(tr);

    /* Reminder time + the exercises they train most */
    var freq = frequentExercises();
    var rem = h('<div class="card mt"></div>');
    rem.appendChild(h('<div class="sub" style="margin-bottom:10px"><b style="color:var(--text)">Your usual sessions</b> — we suggest these in your notifications.</div>'));
    if (freq.length) {
      var fc = h('<div class="chips"></div>');
      freq.forEach(function (e) {
        var c = h('<span class="chip" style="cursor:default">' + esc(e.name) + " · " + e.n + "×</span>");
        fc.appendChild(c);
      });
      rem.appendChild(fc);
    } else {
      rem.appendChild(h('<p class="faint small">Log a few workouts and your most frequent exercises will show up here.</p>'));
    }
    node.appendChild(rem);

    /* ============ LANGUAGE + COUNTRY ============ */
    node.appendChild(section("Language & country", "Pick the language you want, and the country you are in. The meaning never changes, only the words."));
    var langCard = h('<div class="card"></div>');
    if (L && L.picker) {
      var lp = L.picker({
        className: "lang-picker full",
        onChange: function (code) {
          // GBI18n.set() fires "lang:change", and the app router re-renders
          // the current route from that event. Re-rendering here as well
          // would paint the screen twice, so we only persist the choice.
          S.setLang(code);
          toast("Language changed");
        }
      });
      langCard.appendChild(lp);
    } else {
      langCard.appendChild(h('<p class="faint small">Language engine unavailable.</p>'));
    }

    // Country is a separate control: one country can have many languages.
    var countryState = { code: (S.user() || {}).countryCode || "NG", name: (S.user() || {}).country || "Nigeria" };
    var countryBlock = h('<div class="mt"><div class="eyebrow" style="margin-bottom:8px">Country</div>' +
      '<div id="setCountry"></div><span class="faint small" id="setCountryDial"></span></div>');
    langCard.appendChild(countryBlock);
    if (window.GBCountries) {
      var found = window.GBCountries.find(countryState.code);
      if (found) countryState = { code: found.code, name: found.name };
      $("#setCountry", countryBlock).appendChild(window.GBCountries.picker({
        value: countryState.code,
        onChange: function (c) {
          countryState = { code: c.code, name: c.name };
          var u2 = Object.assign({}, S.user() || {});
          u2.country = c.name; u2.countryCode = c.code;
          S.setUser(u2);
          $("#setCountryDial", countryBlock).textContent =
            "International dialling code " + (c.dial || "not listed");
        }
      }));
      var cf = window.GBCountries.find(countryState.code);
      $("#setCountryDial", countryBlock).textContent =
        "International dialling code " + (cf ? cf.dial : "+234");
    }
    node.appendChild(langCard);

    /* ============ MUSIC ============ */
    node.appendChild(section("Music", "Connect your music account and share what you are listening to with the community."));
    var mus = S.music();
    var mc = h('<div class="card"></div>');

    if (mus.provider && mus.token) {
      var pv = M.provider(mus.provider);
      var track = mus.currentTrack;
      var now = h('<div class="now-playing">' +
        '<div class="np-art">' + (track && track.art ? '<img src="' + esc(track.art) + '" alt="">' : (pv ? pv.icon : "🎵")) + "</div>" +
        '<div class="np-tx"><b>' + esc(track && track.title ? track.title : "Connected") + "</b>" +
        "<small>" + esc(track && track.artist ? track.artist : (pv ? pv.name : "")) + "</small></div>" +
        '<span class="pill ok">' + esc(pv ? pv.name : mus.provider) + "</span>" +
        "</div>");
      mc.appendChild(now);

      var refresh = h('<button class="btn btn-ghost mt">Refresh now playing</button>');
      refresh.onclick = function () {
        refresh.textContent = "Checking…";
        M.refreshNowPlaying().then(function (t) {
          toast(t ? "Now playing: " + t.title : "Nothing playing right now");
          rerender();
        }).catch(function () { toast("Could not reach " + (pv ? pv.name : "the provider")); rerender(); });
      };
      mc.appendChild(refresh);

      var disc = h('<button class="btn btn-danger mt">Disconnect</button>');
      disc.onclick = function () {
        M.disconnect();
        toast("Disconnected");
        rerender();
      };
      mc.appendChild(disc);
    } else {
      mc.appendChild(h('<p class="sub mb">Sign in with one of your music accounts to see what you are playing on your profile.</p>'));
      var prov = h('<div class="prov-list"></div>');
      (M.providers ? M.providers() : []).forEach(function (p) {
        var b = h('<button class="prov"><span class="prov-ic" style="background:' + p.color + '">' + p.icon + "</span>" +
          "<span class=\"prov-tx\"><b>" + esc(p.name) + "</b><small>" +
          (M.configured && M.configured(p.id) ? "Tap to sign in" : "Not configured on this deployment") +
          "</small></span><span class=\"chev\">›</span></button>");
        b.onclick = function () {
          b.classList.add("busy");
          M.connect(p.id).then(function () {
            toast("Signed in to " + p.name);
            rerender();
          }).catch(function (err) {
            b.classList.remove("busy");
            toast((err && err.message) || "Could not connect " + p.name);
          });
        };
        prov.appendChild(b);
      });
      mc.appendChild(prov);
    }
    node.appendChild(mc);

    /* ============ PRIVACY & DATA ============ */
    node.appendChild(section("Privacy & data", "Your logs and photos are yours. Export or delete them at any time."));
    var pv = h('<div class="list"></div>');
    pv.appendChild(row(ICON.shield, "Export my data", "A copy of every log, photo and measurement", "", function () { exportData(); }));
    pv.appendChild(row(ICON.shield, "Delete all my data", "Wipes logs, photos and progress from this device", "", function () { deleteData(); }));
    node.appendChild(pv);

    /* ============ SUPPORT ============ */
    node.appendChild(section("Support"));
    var sup = h('<div class="list"></div>');
    sup.appendChild(row(ICON.mail, "Email support", "support@gymbadge.app", "", function () {
      location.href = "mailto:support@gymbadge.app?subject=Gym%20Badge%20support";
    }));
    sup.appendChild(row("❓", "Help & support", "FAQ, privacy, terms", "", function () { go("support"); }));
    sup.appendChild(row("ℹ️", "About Gym Badge", "Version 2 · offline first", "", function () { go("support"); }));
    node.appendChild(sup);

    var out = h('<button class="btn btn-danger mt">Log out</button>');
    out.onclick = function () {
      if (typeof GBAuth !== "undefined" && GBAuth.logout) {
        GBAuth.logout().then(function () { S.set({ user: null }); go("welcome"); });
      } else {
        S.set({ user: null }); go("welcome");
      }
    };
    node.appendChild(out);

    shell("profile", "Settings", node, { back: true, backTo: "profile" });
    wireEye(node);
  }

  /* ---------------- helpers used by the screen ---------------- */
  function frequentExercises() {
    var counts = {};
    S.logs().forEach(function (l) {
      var n = exName(l.ex);
      if (!n) return;
      counts[n] = (counts[n] || 0) + 1;
    });
    return Object.keys(counts).map(function (n) { return { name: n, n: counts[n] }; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
  }
  function exName(id) {
    var all = (D.exercises || []).concat(S.myExercises());
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i].name;
    return null;
  }
  function showLink(url) {
    var sheet = h('<div class="sheet-bg"><div class="sheet"><div class="sheet-head"><h3>Open this link</h3>' +
      '<button class="iconbtn" style="margin-left:auto" id="lkX">✕</button></div>' +
      '<p class="sub mb">Copy it into a new tab if it does not open automatically.</p>' +
      '<div class="field"><input id="lkUrl" readonly value="' + esc(url) + '"></div>' +
      '<a class="btn btn-primary" id="lkGo" href="' + esc(url) + '" style="text-decoration:none">Open link</a>' +
      "</div></div>");
    document.body.appendChild(sheet);
    $("#lkX", sheet).onclick = function () { sheet.remove(); };
    sheet.onclick = function (e) { if (e.target === sheet) sheet.remove(); };
  }
  function exportData() {
    var payload = {
      exportedAt: new Date().toISOString(),
      user: S.user(),
      logs: S.logs(),
      foodLogs: S.foodLogs ? S.foodLogs() : [],
      bookings: S.bookings ? S.bookings() : [],
      progress: S.get().progress || [],
      plan: S.plan()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gymbadge-data-" + S.today() + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast("Your data has been exported ✓");
  }
  function deleteData() {
    if (!GBDialog.confirm("Delete every log, photo and measurement on this device? This cannot be undone.", { title: "Delete everything", okLabel: "Delete", danger: true })) return;
    S.set({ logs: [], foodLogs: [], bookings: [], progress: [], reported: [] });
    toast("All your data has been deleted");
    rerender();
  }

  /* ---------------- mount ---------------- */
  window.GBAppSettings = { render: paintSettings, section: section, row: row, pwField: pwField, wireEye: wireEye };
})();
