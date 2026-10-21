/* ==========================================================================
   GYM BADGE — website state (session, currency, membership)
   Mirrors the app's store.js model but scoped to the marketing site.
   Everything lives in localStorage so the site state persists across pages
   with no backend. Namespaced under `gb_web_`.

   There is no cart, no order basket and no payment screen here — Gym Badge
   is a membership and training product, not a shop. The only thing you can
   buy is access to the Premium plan, and that happens on the plan page.

   On go-live, swap the read/write methods for API calls — keep signatures.
   ========================================================================== */
(function (global) {
  "use strict";

  var K = {
    user: "gb_web_user",
    cur: "gb_web_currency",
    subs: "gb_web_subscriptions",
    bookings: "gb_web_bookings",
    country: "gb_web_country"
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  /* ---- Session ---- */
  function getUser() { return read(K.user, null); }
  function setUser(u) {
    u = u || {};
    u.joined = u.joined || new Date().toISOString();
    write(K.user, u);
    global.dispatchEvent(new CustomEvent("auth:change", { detail: u }));
    return u;
  }
  function updateUser(patch) {
    var u = getUser();
    if (!u) return null;
    for (var k in patch) u[k] = patch[k];
    return setUser(u);
  }
  function clearUser() {
    try { localStorage.removeItem(K.user); } catch (e) {}
    global.dispatchEvent(new CustomEvent("auth:change", { detail: null }));
  }
  function isAuthed() { return !!getUser(); }

  /* ---- Currency (shared with the pricing selector) ---- */
  function getCur() { return read(K.cur, "USD"); }
  function setCur(code) {
    write(K.cur, code);
    global.dispatchEvent(new CustomEvent("currency:change", { detail: code }));
  }

  /* ---- Trainer bookings ----
     item: { id, trainerId, trainerName, when, mode, status, note } */
  function getBookings() { return read(K.bookings, []); }
  function saveBookings(list) { write(K.bookings, list || []); }
  function addBooking(b) {
    var all = getBookings();
    b.id = b.id || ("tb" + Date.now().toString(36));
    b.at = b.at || new Date().toISOString();
    b.status = b.status || "confirmed";
    all.unshift(b);
    saveBookings(all);
    return b;
  }
  function cancelBooking(id) { saveBookings(getBookings().filter(function (b) { return b.id !== id; })); }
  function rescheduleBooking(id, when) {
    saveBookings(getBookings().map(function (b) {
      return b.id === id ? Object.assign({}, b, { when: when, status: "rescheduled" }) : b;
    }));
  }

  /* ---- Country (separate from language: one country, many languages) --- */
  function getCountry() { return read(K.country, { code: "NG", name: "Nigeria", dial: "+234" }); }
  function setCountry(c) { write(K.country, c || { code: "NG", name: "Nigeria", dial: "+234" }); }

  /* ---- Membership (the plan the user is on) ---- */
  function getSub() { return read(K.subs, { plan: "free" }); }
  function setSub(plan) {
    write(K.subs, { plan: plan, since: new Date().toISOString() });
    global.dispatchEvent(new CustomEvent("plan:change", { detail: plan }));
  }

  window.GBWeb = {
    getUser: getUser, setUser: setUser, updateUser: updateUser,
    clearUser: clearUser, isAuthed: isAuthed,
    getCur: getCur, setCur: setCur,
    getSub: getSub, setSub: setSub,
    getBookings: getBookings, addBooking: addBooking,
    cancelBooking: cancelBooking, rescheduleBooking: rescheduleBooking,
    getCountry: getCountry, setCountry: setCountry,
    __fmt: function (v) {
      if (window.GBI18n) return window.GBI18n.fmtNumber(v);
      return String(v);
    }
  };
})(typeof window !== "undefined" ? window : this);
