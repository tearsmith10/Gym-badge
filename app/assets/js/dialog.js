/* ==========================================================================
   GYM BADGE — dialogs

   The app never uses the browser's own confirm() or prompt(). Those are
   blocked in some embedded browsers, they look nothing like the rest of
   the product, and they stop the member seeing what is about to happen.

   These are the same in app sheets used everywhere else, they work the same
   on every device, and they return a promise so the caller can carry on.
   ========================================================================== */
(function (global) {
  "use strict";

  function h(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function build(title, message, withInput, initial, okLabel, danger) {
    return new Promise(function (resolve) {
      var overlay = h('<div class="sheet-bg dlg-bg"><div class="sheet dlg"></div></div>');
      var panel = overlay.firstChild;

      panel.appendChild(h('<div class="sheet-head"><h3>' + esc(title) + "</h3>" +
        '<button class="iconbtn" style="margin-left:auto" data-dlg="x">✕</button></div>'));

      panel.appendChild(h('<p class="dlg-msg">' + esc(message) + "</p>"));

      var input = null;
      if (withInput) {
        panel.appendChild(h('<div class="field"><label>Name</label>' +
          '<input id="dlgIn" type="text" value="' + esc(initial || "") + '" autocomplete="off"></div>'));
        input = panel.querySelector("#dlgIn");
        setTimeout(function () { if (input) { input.focus(); input.select(); } }, 60);
      }

      var actions = h('<div class="dlg-actions"></div>');
      var cancel = h('<button class="btn btn-ghost" data-dlg="cancel">Cancel</button>');
      var ok = h('<button class="btn ' + (danger ? "btn-danger" : "btn-primary") + '" data-dlg="ok">' +
        esc(okLabel || "Save") + "</button>");
      actions.appendChild(cancel);
      actions.appendChild(ok);
      panel.appendChild(actions);

      function close(value) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener("keydown", onKey);
        resolve(value);
      }
      function onKey(e) {
        if (e.key === "Escape") close(withInput ? null : false);
        if (e.key === "Enter" && withInput) close(input ? input.value.trim() : "");
      }

      cancel.onclick = function () { close(withInput ? null : false); };
      ok.onclick = function () { close(withInput ? (input ? input.value.trim() : "") : true); };
      overlay.querySelector('[data-dlg="x"]').onclick = function () { close(withInput ? null : false); };
      overlay.onclick = function (e) { if (e.target === overlay) close(withInput ? null : false); };
      document.addEventListener("keydown", onKey);

      document.body.appendChild(overlay);
    });
  }

  global.GBDialog = {
    confirm: function (message, opts) {
      opts = opts || {};
      return build(opts.title || "Are you sure?", message, false, "", opts.okLabel || "Yes", opts.danger);
    },
    prompt: function (message, initial, opts) {
      opts = opts || {};
      return build(opts.title || "Give it a name", message, true, initial, opts.okLabel || "Save", false);
    }
  };
})(typeof window !== "undefined" ? window : this);
