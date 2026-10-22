/* GYM BADGE — state store (localStorage, offline first) */
window.GBStore = (function () {
  "use strict";
  var KEY = "gymbadge.v1";

  var defaults = {
    user: null,          // profile object
    plan: "free",        // membership tier: free | premium | elite | corporate
    routine: null,       // My Routine: { days: [...], view, currentDay }
    myExercises: [],     // exercises the member created themselves
    submissions: [],     // exercises sent to the shared library, awaiting review
    goalArch: "",        // the goal physique the member picked
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
    trainerApplications: [], // trainer sign ups, held for review
    trainers: [],         // the trainer directory, cached from the API
    favourites: {},       // { exercises: [], foods: [], trainers: [] }
    reviews: [],          // ratings left for trainers
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

    /* My Routine — the member's own training week.
       It lives under "routine" so it can never collide with the
       membership tier in "plan". */
    routine: function () { return state.routine || null; },
    setRoutine: function (r) { state.routine = r; save(); return r; },

    /* Exercises the member created for themselves. They stay private
       until they are sent for review. */
    myExercises: function () { return state.myExercises || []; },
    addExercise: function (ex) {
      ex.id = "mx" + Date.now().toString(36);
      state.myExercises = state.myExercises || [];
      state.myExercises.unshift(ex);
      save();
      return ex;
    },
    removeExercise: function (id) {
      state.myExercises = (state.myExercises || []).filter((x) => x.id !== id);
      // It also comes off the routine, so nothing is left pointing at it.
      if (state.routine && state.routine.days) {
        state.routine.days.forEach(function (d) {
          d.items = (d.items || []).filter(function (it) { return it.ex !== id; });
        });
      }
      save();
    },

    /* Exercises sent to the shared library. They are NOT published
       automatically, they wait for an administrator. */
    submissions: function () { return state.submissions || []; },
    addSubmission: function (s) {
      s.id = "s" + Date.now().toString(36);
      s.status = "pending";
      s.at = new Date().toISOString();
      state.submissions = state.submissions || [];
      state.submissions.unshift(s);
      save();
      return s;
    },

    /* The goal physique the member picked for Body Goals. */
    goalArch: function () { return state.goalArch || ""; },
    setGoalArch: function (id) { state.goalArch = id || ""; save(); },

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
    /* Edit or remove a logged set. A mistake in the log should be fixable,
       not permanent. */
    removeLog: function (id) {
      state.logs = state.logs.filter(function (l) { return l.id !== id; });
      save();
    },
    updateLog: function (id, val) {
      for (var i = 0; i < state.logs.length; i++) {
        if (state.logs[i].id === id) {
          state.logs[i].val = val;
          state.logs[i].edited = true;
          save();
          return state.logs[i];
        }
      }
      return null;
    },
    /* Every log, newest first, and the ones from this week. */
    logsThisWeek: function () {
      var start = new Date();
      start.setDate(start.getDate() - 6);
      var cut = start.toISOString().slice(0, 10);
      return state.logs.filter(function (l) { return l.date >= cut; });
    },
    /* Rough measure of effort this week: how many sets were logged and the
       sum of the numbers in them. */
    volumeThisWeek: function () {
      var logs = api.logsThisWeek();
      var total = 0;
      logs.forEach(function (l) { total += Number(l.val) || 0; });
      return { sets: logs.length, total: Math.round(total) };
    },

    // food
    foodLogs: function () { return state.foodLogs; },
    addFood: function (f) { f.id = "f" + Date.now(); f.date = today(); state.foodLogs.unshift(f); save(); return f; },
    removeFood: function (id) {
      state.foodLogs = state.foodLogs.filter(function (f) { return f.id !== id; });
      save();
    },
    /* The foods the member has eaten recently, most recent first, without
       duplicates. */
    recentFoods: function (limit) {
      var seen = {}, out = [];
      state.foodLogs.forEach(function (f) {
        var key = (f.name || "").toLowerCase();
        if (!key || seen[key]) return;
        seen[key] = true;
        out.push(f);
      });
      return out.slice(0, limit || 6);
    },

    /* Favourites — exercises, foods and trainers the member has starred. */
    favourites: function (kind) {
      state.favourites = state.favourites || {};
      return state.favourites[kind] || [];
    },
    isFavourite: function (kind, id) {
      return api.favourites(kind).indexOf(id) >= 0;
    },
    toggleFavourite: function (kind, id) {
      state.favourites = state.favourites || {};
      var list = state.favourites[kind] || (state.favourites[kind] = []);
      var at = list.indexOf(id);
      if (at >= 0) list.splice(at, 1); else list.push(id);
      save();
      return at < 0;
    },

    /* Reviews left for a trainer, kept with their sessions. */
    reviews: function () { return state.reviews || []; },
    addReview: function (r) {
      r.id = "r" + Date.now().toString(36);
      r.at = new Date().toISOString();
      state.reviews = state.reviews || [];
      state.reviews.unshift(r);
      save();
      return r;
    },
    reviewFor: function (trainerId) {
      var all = state.reviews || [];
      for (var i = 0; i < all.length; i++) if (all[i].trainerId === trainerId) return all[i];
      return null;
    },

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
