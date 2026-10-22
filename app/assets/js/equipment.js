/* ==========================================================================
   GYM BADGE — the gym floor

   A browsable list of every machine on the floor, with its real photograph
   and its live status. Tap a machine for the full report: why it is out of
   service, what was reported, when it is expected back, what to do in the
   meantime and who is dealing with it.

   The screen keeps its own history so the back button always goes back to
   the floor, never out of the app.
   ========================================================================== */
(function (global) {
  "use strict";

  var D = window.GBData;
  var h = window.GBUI.h, esc = window.GBUI.esc, $ = window.GBUI.$;
  var toast = window.GBUI.toast;

  /* The store is looked up when the screen paints, not when this file
     loads, so the order the scripts are read in does not matter. */
  function S() { return window.GBStore; }

  function list() { return D.equipment || []; }

  /* Photographs are set after the row is in the document. A lazy image
     created while it is still detached never starts loading, which leaves
     the floor full of empty squares. */
  var pending = [];
  function thumb(src, alt) {
    var box = h('<span class="eq-thumb"><img alt="' + esc(alt || "") + '" decoding="async"></span>');
    var img = box.querySelector("img");
    pending.push(function () { img.src = src; });
    return box;
  }
  function flush() {
    pending.forEach(function (f) { f(); });
    pending = [];
  }

  function statusMeta(status) {
    return (D.statusMeta && D.statusMeta[status]) || { label: status, pill: "", icon: "•", desc: "" };
  }

  /* ---------- the floor: every machine ---------- */
  function floor(shell, go) {
    var node = h("<div></div>");
    node.appendChild(h('<h2 class="headline" style="margin-bottom:4px">The gym <span class="hl">floor</span></h2>'));
    node.appendChild(h('<p class="sub mb">Every machine on the floor, with a real photograph of it and its live status. Tap one for the full report.</p>'));

    var zone = "All";
    var onlyProblem = false;

    var chipRow = h('<div class="chips mb"></div>');
    var zones = ["All"].concat(D.equipmentZones || []);
    zones.forEach(function (z) {
      var c = h('<button class="chip' + (z === zone ? " on" : "") + '">' + esc(z) + "</button>");
      c.onclick = function () {
        zone = z;
        chipRow.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        paint();
      };
      chipRow.appendChild(c);
    });
    var trouble = h('<button class="chip">Needs attention</button>');
    trouble.onclick = function () {
      onlyProblem = !onlyProblem;
      trouble.classList.toggle("on", onlyProblem);
      paint();
    };
    chipRow.appendChild(trouble);
    node.appendChild(chipRow);

    var count = h('<p class="faint small mb"></p>');
    node.appendChild(count);

    var listBox = h('<div class="list"></div>');
    node.appendChild(listBox);

    function paint() {
      var rows = list().filter(function (e) {
        if (zone !== "All" && e.zone !== zone) return false;
        if (onlyProblem && e.status === "usable") return false;
        return true;
      });
      count.textContent = rows.length + (rows.length === 1 ? " machine" : " machines");
      listBox.innerHTML = "";
      rows.forEach(function (e) {
        var m = statusMeta(e.status);
        var reported = S().reported().indexOf(e.id) >= 0;
        var r = h('<button class="row eq-row"><div class="ri"></div><div class="rm"><b>' + esc(e.name) + "</b><small>" +
          esc(e.zone) + " · " + esc(m.label) +
          (e.uses ? " · " + e.uses + " uses today" : "") +
          (reported ? " · you reported this" : "") +
          '</small></div><div class="rr"><span class="pill ' + m.pill + '" style="font-size:.68rem">' + esc(m.label) + '</span><span class="chev">›</span></div></button>');
        var icon = r.querySelector(".ri");
        if (e.photos && e.photos[0]) {
          /* The list shows a small picture; the machine's own page shows
             the full size one. */
          icon.appendChild(thumb("/app/assets/img/eq/thumb/" + e.photos[0].replace(/^eq\//, ""), e.name));
        } else icon.innerHTML = m.icon;
        r.onclick = function () { go("equipment", e.id); };
        listBox.appendChild(r);
      });
      if (!rows.length) {
        listBox.appendChild(h('<div class="row"><div class="rm"><b>Nothing here</b><small>Try another zone or turn the filter off.</small></div></div>'));
      }
    }
    paint();

    shell("exercise", "Gym Floor", node, { back: true, backTo: "exercise" });
    flush();
  }

  /* ---------- one machine, in full ---------- */
  function machine(shell, go, id) {
    var eq = null;
    list().forEach(function (e) { if (e.id === id) eq = e; });
    if (!eq) { go("equipmentlist"); return; }

    var m = statusMeta(eq.status);
    var node = h("<div></div>");

    /* The photograph of the machine, so you know which one you are looking at. */
    if (eq.photos && eq.photos.length) {
      var gal = h('<div class="gal eq-gal"><div class="gal-track"></div>' +
        '<button type="button" class="gal-nav gal-prev" aria-label="Previous photo">‹</button>' +
        '<button type="button" class="gal-nav gal-next" aria-label="Next photo">‹</button>' +
        '<div class="gal-dots" role="tablist" aria-label="Photo position"></div></div>');
      var track = gal.querySelector(".gal-track");
      var dots = gal.querySelector(".gal-dots");
      var index = 0;
      eq.photos.forEach(function (src, i) {
        var s = h('<div class="gal-slide"><img alt="' + esc(eq.name) + ' photo ' + (i + 1) + ' of ' + eq.photos.length + '" src="/app/assets/img/' + esc(src) + '" decoding="async"></div>');
        track.appendChild(s);
        var d = h('<button type="button" class="gal-dot" role="tab" aria-label="Photo ' + (i + 1) + '"></button>');
        d.onclick = function () { show(i); };
        dots.appendChild(d);
      });
      function show(i) {
        index = (i + eq.photos.length) % eq.photos.length;
        track.style.transform = "translateX(" + (-index * 100) + "%)";
        dots.querySelectorAll(".gal-dot").forEach(function (d, n) { d.classList.toggle("on", n === index); });
        track.querySelectorAll(".gal-slide").forEach(function (s, n) { s.classList.toggle("on", n === index); });
      }
      gal.querySelector(".gal-prev").onclick = function () { show(index - 1); };
      gal.querySelector(".gal-next").onclick = function () { show(index + 1); };
      gal.setAttribute("tabindex", "0");
      gal.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
      });
      show(0);
      node.appendChild(gal);
    }

    node.appendChild(h('<div class="card center mt"><div style="font-size:2rem;margin-bottom:6px">' + m.icon +
      '</div><h3 style="font-size:1.05rem">' + esc(eq.name) + '</h3><div class="sub mb">' + esc(eq.zone) +
      '</div><span class="pill ' + m.pill + '" style="font-size:.84rem">' + esc(m.label) + "</span>" +
      '<p class="sub mt">' + esc(m.desc) + "</p></div>"));

    node.appendChild(h('<div class="list">' +
      '<div class="row"><div class="rm"><b>Last maintenance</b></div><div class="rr">' + esc(eq.lastMaint) + "</div></div>" +
      '<div class="row"><div class="rm"><b>Uses logged today</b></div><div class="rr">' + eq.uses + "</div></div>" +
      '<div class="row"><div class="rm"><b>Availability</b></div><div class="rr">' + (eq.status === "usable" ? "✅ Safe to use" : "⛔ Avoid for now") + "</div></div>" +
      '<div class="row"><div class="rm"><b>Last status update</b></div><div class="rr">' +
        (eq.updatedAt ? esc(String(eq.updatedAt).slice(0, 10)) : "Not recorded") + "</div></div></div>"));

    var rep = eq.report || {};
    var statusCard = h('<div class="card mt"><h3>Status report</h3></div>');
    function addLine(label, value) {
      var text = (value === undefined || value === null || value === "") ? "" : String(value).trim();
      var rowEl = h('<div class="sr-line"><b>' + esc(label) + "</b><small></small></div>");
      rowEl.querySelector("small").textContent = text ||
        "The gym has not provided this information yet.";
      if (!text) rowEl.classList.add("unknown");
      statusCard.appendChild(rowEl);
    }
    addLine("Current status", m.label);
    addLine("Reason for unavailability", rep.reason);
    addLine("Reported issue", rep.reportedIssue);
    addLine("Date reported", rep.reportedAt);
    addLine("Expected back", rep.expectedBack);
    addLine("Safety notice", rep.safety);
    addLine("Next action", rep.nextAction);
    addLine("Responsible team", rep.responsible);
    node.appendChild(statusCard);

    var reported = S().reported().indexOf(eq.id) >= 0;
    var btn = h('<button class="btn ' + (reported ? "btn-primary" : "btn-ghost") + ' mt">' +
      (reported ? "Reported ✓ — gym notified" : "Report an issue") + "</button>");
    btn.onclick = function () {
      if (reported) return toast("Already reported — the gym knows 🙌");
      S().reportFault(eq.id);
      toast("Thanks — the gym has been notified 🙌");
      go("equipment", eq.id);
    };
    node.appendChild(btn);

    shell("exercise", eq.name, node, { back: true, backTo: "equipmentlist" });
    flush();
  }

  global.GBEquipment = { floor: floor, machine: machine, list: list };
})(typeof window !== "undefined" ? window : this);
