/* ==========================================================================
   GYM BADGE — password field helper (shared)

   Wraps a password <input> with an eye button so the user can reveal or
   hide what they are typing. The button is keyboard accessible, announces
   its state, and never stores or logs the value.

   Usage
   -----
     GBPW.enhance(inputEl);                 // adds the eye button
     GBPW.enhanceAll(root);                 // every [type=password] inside

   The module also auto-wires itself on DOM ready so no page has to call
   anything — every password field on the site and in the app gets the eye.
   ========================================================================== */
(function (global) {
  "use strict";

  var ICON_EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M2.2 12S5.8 5.5 12 5.5 21.8 12 21.8 12 18.2 18.5 12 18.5 2.2 12 2.2 12z"/>' +
    '<circle cx="12" cy="12" r="3.2"/></svg>';
  var ICON_EYE_OFF =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M9.9 5.7A9.6 9.6 0 0112 5.5c6.2 0 9.8 6.5 9.8 6.5a17 17 0 01-3.4 4.3"/>' +
    '<path d="M6.3 7.4A16.6 16.6 0 002.2 12S5.8 18.5 12 18.5a9.4 9.4 0 004-.9"/>' +
    '<path d="M10 10a2.9 2.9 0 004.1 4.1"/>' +
    '<path d="M3 3l18 18"/></svg>';

  function labelFor(input) {
    if (input.getAttribute("data-pw-label")) return input.getAttribute("data-pw-label");
    if (input.id) {
      var lab = document.querySelector('label[for="' + input.id + '"]');
      if (lab && lab.textContent.trim()) return lab.textContent.trim();
    }
    if (input.placeholder) return input.placeholder;
    return "password";
  }

  function enhance(input) {
    if (!input || input.type !== "password") return null;
    if (input.dataset.pwEnhanced === "1") return input._pwBtn;
    // If a wrapper already carries an eye button (e.g. server-rendered
    // markup), wire that one instead of adding a second.
    var existing = input.parentNode && input.parentNode.querySelector
      ? input.parentNode.querySelector(".pw-eye")
      : null;
    if (existing) {
      input.dataset.pwEnhanced = "1";
      input._pwBtn = existing;
      if (!existing.dataset.pwWired) {
        existing.dataset.pwWired = "1";
        wireToggle(existing, input);
      }
      return existing;
    }
    input.dataset.pwEnhanced = "1";

    var wrap = document.createElement("span");
    wrap.className = "pw-field";
    if (input.parentNode) input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    if (!input.classList.contains("pw-input")) input.classList.add("pw-input");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pw-eye";
    btn.setAttribute("aria-label", "Show password");
    btn.setAttribute("aria-pressed", "false");
    btn.title = "Show password";
    btn.innerHTML = '<span class="eye-on">' + ICON_EYE + '</span><span class="eye-off">' + ICON_EYE_OFF + '</span>';

    wireToggle(btn, input);
    wrap.appendChild(btn);
    input._pwBtn = btn;
    input._pwLabel = labelFor(input);
    return btn;
  }

  function wireToggle(btn, input) {
    var shown = false;
    btn.addEventListener("click", function () {
      shown = !shown;
      input.type = shown ? "text" : "password";
      btn.classList.toggle("on", shown);
      btn.setAttribute("aria-pressed", shown ? "true" : "false");
      var l = shown ? "Hide password" : "Show password";
      btn.setAttribute("aria-label", l);
      btn.title = l;
      // keep the caret where the user left it
      try {
        var n = input.value.length;
        input.focus();
        if (input.setSelectionRange) input.setSelectionRange(n, n);
      } catch (e) {}
    });
  }

  function enhanceAll(root) {
    var scope = root || document;
    var list = scope.querySelectorAll('input[type="password"]');
    Array.prototype.forEach.call(list, function (inp) { enhance(inp); });
  }

  global.GBPW = { enhance: enhance, enhanceAll: enhanceAll };

  /* Auto-wire. */
  if (global.document) {
    function boot() { enhanceAll(document); }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
    // SPA screens render late — rescan when focus lands and periodically.
    document.addEventListener("focusin", function () { enhanceAll(document); });
    setInterval(function () {
      if (document.querySelector('input[type="password"]')) enhanceAll(document);
    }, 1500);
  }
})(typeof window !== "undefined" ? window : this);
