/* ==========================================================================
   GYM BADGE — shared interface helpers

   Loaded before every other app script, so each screen file can use the
   same toast, the same element builder and the same escaping without
   each one carrying its own copy.

   Nothing here reaches for the network, so it all works offline.
   ========================================================================== */
(function (global) {
  "use strict";

  function h(html) {
    var t = document.createElement("template");
    t.innerHTML = String(html == null ? "" : html).trim();
    return t.content.firstChild;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  /* One message at a time, so the screen never fills up with notices. */
  function toast(msg) {
    var old = document.querySelector(".toast");
    if (old) old.remove();
    var t = h('<div class="toast">' + esc(msg) + "</div>");
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2300);
  }

  global.GBUI = { h: h, esc: esc, $: $, toast: toast };
})(typeof window !== "undefined" ? window : this);
