/* ==========================================================================
   GYM BADGE — theme engine
   Three modes, all dark by design (there is no light mode):
     "ember"    -> brand: near-black with the signal-coral accent (matches the
                   marketing site and the logo). This is the default.
     "midnight" -> deep navy with the mint accent.
     "dark"     -> true black with the electric cyan accent.
   Persists the choice and applies data-theme to <html>.
   ========================================================================== */
(function () {
  "use strict";
  var KEY = "gymbadge.theme";
  var modes = ["ember", "midnight", "dark"];
  var current = "ember";

  var CHROME = { "ember": "#121211", "midnight": "#0a1420", "dark": "#0b0b0d" };
  var LABELS = { "ember": "Ember", "midnight": "Midnight", "dark": "Dark" };

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "default") v = "ember";            // migrate the old two-mode ids
      return modes.indexOf(v) >= 0 ? v : "ember";
    } catch (e) { return "ember"; }
  }
  function apply(mode) {
    current = mode;
    document.documentElement.setAttribute("data-theme", mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", CHROME[mode] || CHROME["ember"]);
    // Reflect state on any toggle buttons present.
    var btns = document.querySelectorAll("[data-theme-toggle]");
    btns.forEach(function (b) { b.setAttribute("data-mode", mode); });
    // Notify listeners (e.g. the hero re-draws to pick up new ink/accent).
    try { window.dispatchEvent(new CustomEvent("themechange", { detail: mode })); } catch (e) {}
  }
  function set(mode) {
    if (modes.indexOf(mode) < 0) mode = "ember";
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    apply(mode);
  }
  function next() {
    var i = modes.indexOf(current);
    set(modes[(i + 1) % modes.length]);
    return current;
  }
  function label(mode) { return LABELS[mode] || "Ember"; }

  // Apply immediately to avoid a flash of the wrong theme.
  apply(read());

  window.GBTheme = { get: function () { return current; }, set: set, next: next, label: label, modes: modes };
})();
