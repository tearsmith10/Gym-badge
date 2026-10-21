/* GYM BADGE — state store (localStorage, offline first) */
window.GBStore = (function () {
  "use strict";
  var KEY = "gymbadge.v1";

  var defaults = {
    user: null,          // profile object
    plan: "free",        // free | premium | elite | corporate
    logs: [],            // exercise logs
    foodLogs: [],        // scanned/food entries
    scans: { date:"", n:0 },      // food scan daily counter
    trials: { date:"", n:0 },     // generic trial counter
    projections: { date:"", n:0 },// body projection counter
    seenIntro: false,
    progress: [],         // weekly fitness progress photos {id, at, week, dataUrl}
    currency: "NGN",
    lang: "en",           // UI language code (see assets/i18n.js)
    prefs: {},            // workout + notification preferences
    music: { provider: null, token: null, refreshToken: null, expiresAt: 0, currentTrack: null },
    bookings: [],         // gym slot bookings {id, gym, slot, date}
    reported: []          // equipment ids the member reported
  };

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return Object.assign({}, defaults, JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(defaults));
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  function bumpDaily(bucketKey, limitFree) {
    var b = state[bucketKey];
    if (b.date !== today()) { b.date = today(); b.n = 0; }
    if (isPremium()) return true;               // premium = unlimited
    if (limitFree != null && b.n >= limitFree) return false;
    b.n++; save(); return true;
  }

  function remaining(bucketKey, limitFree) {
    if (isPremium()) return Infinity;
    var b = state[bucketKey];
    var used = b.date === today() ? b.n : 0;
    return Math.max(0, limitFree - used);
  }

  function isPremium() { return state.plan === "premium" || state.plan === "elite" || state.plan === "corporate"; }

  /* Free-tier meter. Kept high on purpose: the AI features are free to use
     while we're testing, and the paywall stays a soft nudge, never a wall.
     Flip TESTING to false (or drop the numbers) to restore a hard paywall. */
  var LIMITS = { scans: 500, trials: 500, projections: 500 };

  var api = {
    get: function () { return state; },
    set: function (patch) { Object.assign(state, patch); save(); },
    save: save,
    isPremium: isPremium,
    today: today,

    // profile
    setUser: function (u) { state.user = u; save(); },
    user: function () { return state.user; },

    // plan
    setPlan: function (p) { state.plan = p; save(); },
    plan: function () { return state.plan; },

    // exercise logs
    logs: function () { return state.logs; },
    addLog: function (log) {
      log.id = "l" + Date.now();
      log.date = today();
      state.logs.unshift(log); save(); return log;
    },
    lastFor: function (exId) {
      for (var i = 0; i < state.logs.length; i++) if (state.logs[i].ex === exId) return state.logs[i];
      return null;
    },

    // food
    foodLogs: function () { return state.foodLogs; },
    addFood: function (f) { f.id = "f" + Date.now(); f.date = today(); state.foodLogs.unshift(f); save(); return f; },

    // daily counters (freemium meter — generous while testing)
    canScanFood: function () { return bumpDaily("scans", LIMITS.scans); },
    foodScansLeft: function () { return remaining("scans", LIMITS.scans); },
    /* Alias, so a screen can ask for the remaining scans either way. */
    scansLeft: function () { return remaining("scans", LIMITS.scans); },
    canTrial: function () { return bumpDaily("trials", LIMITS.trials); },
    trialsLeft: function () { return remaining("trials", LIMITS.trials); },
    canProject: function () { return bumpDaily("projections", LIMITS.projections); },
    projectionsLeft: function () { return remaining("projections", LIMITS.projections); },

    // streak (simple consecutive-day count)
    streak: function () {
      var days = {};
      state.logs.forEach(function (l) { days[l.date] = 1; });
      var n = 0, d = new Date();
      for (;;) {
        var k = d.toISOString().slice(0, 10);
        if (days[k]) { n++; d.setDate(d.getDate() - 1); } else break;
        if (n > 400) break;
      }
      return n;
    },

    reset: function () { state = JSON.parse(JSON.stringify(defaults)); save(); },

    // gym slot bookings
    bookings: function () { return state.bookings; },
    addBooking: function (b) { b.id = "b" + Date.now(); state.bookings.unshift(b); save(); return b; },
    cancelBooking: function (id) { state.bookings = state.bookings.filter(function (x) { return x.id !== id; }); save(); },

    // equipment fault reports
    reported: function () { return state.reported; },
    reportFault: function (id) { if (state.reported.indexOf(id) < 0) { state.reported.push(id); save(); } },

    // preferences (units, reminders, haptics, autoplay…)
    prefs: function () { return state.prefs || {}; },
    setPref: function (k, v) {
      state.prefs = state.prefs || {};
      state.prefs[k] = v;
      save();
      return state.prefs;
    },

    // language
    lang: function () { return state.lang || "en"; },
    setLang: function (code) { state.lang = code || "en"; save(); },

    // music sync (see assets/music.js)
    music: function () { return state.music || { provider: null, token: null, currentTrack: null }; },
    setMusic: function (patch) {
      state.music = Object.assign({}, state.music || {}, patch || {});
      save();
      return state.music;
    },

    // avatar image (data URL) lives on the user record
    setAvatar: function (dataUrl) {
      state.user = state.user || {};
      state.user.avatar = dataUrl;
      save();
    }
  };

  return api;
})();
