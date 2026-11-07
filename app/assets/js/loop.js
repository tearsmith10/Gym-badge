/* ==========================================================================
   GYM BADGE — Plate → Program loop + Badge + Proof helpers
   
   GBLoop: nutrition delta → adjusted next session (offline-first).
   GBProof: sign and verify workout proofs.
   GBCoach: coach note feed.
   ========================================================================== */
(function (global) {
  "use strict";

  var S = global.GBStore;
  var KEY = "gymbadge.loop.v1";

  function store() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }

  /* Plate → Program: record a meal, compute delta, store adjustment */
  function recordMeal(food) {
    return new Promise(function (resolve) {
      var day = store();
      var today = new Date().toISOString().slice(0, 10);
      var entry = day[today] || { protein: 0, kcal: 0 };
      entry.protein += Number(food.protein || food.p || 0);
      entry.kcal += Number(food.kcal || food.c || 0);
      if (!entry.protein && !entry.kcal) { entry.protein += 15; entry.kcal += 300; } // placeholder meal
      day[today] = entry;
      save(day);
      var base = (S.user && S.user()) || {};
      var targets = {
        proteinTarget: Number(base.proteinTarget || 120),
        kcalTarget: Number(base.kcalTarget || 2400)
      };
      // Try server for a real adjustment; fall back to offline rule
      fetch("/api/coach/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (global.GBAuth && GBAuth.token ? GBAuth.token() : "") },
        body: JSON.stringify({ protein: entry.protein, proteinTarget: targets.proteinTarget, kcal: entry.kcal, kcalTarget: targets.kcalTarget })
      }).then(function (r) { return r.json(); }).then(function (d) {
        resolve(d.ok ? d : offlineAdjust(entry.protein, targets.proteinTarget));
      }).catch(function () { resolve(offlineAdjust(entry.protein, targets.proteinTarget)); });
    });
  }

  function offlineAdjust(protein, proteinTarget) {
    var gap = Math.max(0, Math.round((proteinTarget || 120) - protein));
    if (proteinTarget && protein < proteinTarget * 0.7) {
      return { ok: true, proteinGap: gap, intensity: "reduced", advice: gap + "g protein to go — lighter session, protein-rich meal next." };
    }
    return { ok: true, proteinGap: gap, intensity: "normal", advice: gap + "g protein to go — session as planned." };
  }

  function today() { return store()[new Date().toISOString().slice(0, 10)] || null; }

  global.GBLoop = { recordMeal: recordMeal, today: today, offlineAdjust: offlineAdjust };

  /* Proof-of-work */
  global.GBProof = {
    sign: function (exercise, machine, sets) {
      return fetch("/api/proof/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (global.GBAuth && GBAuth.token ? GBAuth.token() : "") },
        body: JSON.stringify({ exercise: exercise, machine: machine || "", sets: sets })
      }).then(function (r) { return r.json(); });
    },
    verify: function (id) {
      return fetch("/api/proof/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
      }).then(function (r) { return r.json(); });
    }
  };

  /* Coach feed (between-set notes) */
  global.GBCoach = {
    feed: function () {
      return fetch("/api/coach/feed", {
        headers: { "Authorization": "Bearer " + (global.GBAuth && GBAuth.token ? GBAuth.token() : "") }
      }).then(function (r) { return r.json(); }).catch(function () { return { ok: false, notes: [] }; });
    }
  };
})(window);
