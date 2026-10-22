/* ==========================================================================
   GYM BADGE — The Guides

   A searchable, filterable catalogue of every movement, with a full coaching
   guide for each one: purpose, muscles, equipment, starting position, step
   by step instructions, sets and rest, breathing, the mistakes people make,
   safety notes, easier modifications, and a demonstration gallery.

   Written for beginners first, because most people using Gym Badge have
   never had a coach. Nothing here promises a result; progress depends on
   the person, their consistency, recovery, nutrition and the programme they
   choose.
   ========================================================================== */
(function (global) {
  "use strict";

  var D = window.GBData, S = window.GBStore, I = window.GBI18n;

  var h = window.GBUI.h, esc = window.GBUI.esc, $ = window.GBUI.$;
  var toast = window.GBUI.toast;

  /* ---------------- image carousel ----------------
     Left and right buttons, touch swipe, keyboard arrows, visible position
     dots, responsive sizing and real alt text. When a movement has fewer
     than five genuine demonstration photographs we say so instead of
     showing an unrelated picture. */
  function carousel(ex, opts) {
    opts = opts || {};
    var want = 5;
    var photos = (ex.gallery || []).slice();

    /* No photograph yet: say so once, plainly, rather than filling the
       carousel with repeated placeholders. */
    if (!photos.length) {
      return h('<div class="gal gal-empty"><div class="gal-missing"><span>📷</span>' +
        "<small>No demonstration photo of this movement yet. The written guide below is complete.</small></div></div>");
    }

    var wrap = h('<div class="gal" role="group" aria-label="' + esc(ex.name) + ' demonstration photos">' +
      '<div class="gal-track"></div>' +
      '<button type="button" class="gal-nav gal-prev" aria-label="Previous photo">‹</button>' +
      '<button type="button" class="gal-nav gal-next" aria-label="Next photo">‹</button>' +
      '<div class="gal-dots" role="tablist" aria-label="Photo position"></div></div>');
    var track = wrap.querySelector(".gal-track");
    var dots = wrap.querySelector(".gal-dots");
    var index = 0;

    var slides = photos.map(function (src, i) {
      var s = h('<div class="gal-slide"><img alt="' + esc(ex.name) + ' demonstration photo ' + (i + 1) + ' of ' + photos.length + '"></div>');
      s.querySelector("img").src = "/app/assets/img/" + src;
      return s;
    });
    /* Honest padding: one "more coming" tile, never a substitute photo. */
    if (slides.length < want) {
      slides.push(h('<div class="gal-slide gal-missing"><span>📷</span><small>More demonstration photos coming soon</small></div>'));
    }
    slides.forEach(function (s) { track.appendChild(s); });

    slides.forEach(function (s, i) {
      var d = h('<button type="button" class="gal-dot" role="tab" aria-label="Photo ' + (i + 1) + '"></button>');
      d.onclick = function () { show(i); };
      dots.appendChild(d);
    });

    function show(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.querySelectorAll(".gal-dot").forEach(function (d, n) {
        d.classList.toggle("on", n === index);
        d.setAttribute("aria-selected", n === index ? "true" : "false");
      });
      slides.forEach(function (s, n) { s.classList.toggle("on", n === index); });
    }

    wrap.querySelector(".gal-prev").onclick = function () { show(index - 1); };
    wrap.querySelector(".gal-next").onclick = function () { show(index + 1); };
    wrap.setAttribute("tabindex", "0");
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    });

    // Touch swipe
    var startX = null;
    wrap.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    show(0);
    if (opts.extra) opts.extra(wrap);
    return wrap;
  }

  /* ---------------- the library screen ---------------- */
  var CATEGORIES = ["All", "Upper body", "Lower body", "Core", "Cardio", "Shoulders", "Mobility"];

  function screen(shell, go) {
    var node = h("<div></div>");
    var state = { q: "", cat: "All", diff: "All", mine: false, fav: false };
    var DIFFS = ["All", "Beginner", "Intermediate", "Advanced"];

    node.appendChild(h('<div class="search">🔍<input id="libQ" placeholder="Search the guides" autocomplete="off"></div>'));

    var catRow = h('<div class="chips mb"></div>');
    CATEGORIES.forEach(function (c) {
      var b = h('<button class="chip' + (c === state.cat ? " on" : "") + '">' + esc(c) + "</button>");
      b.onclick = function () {
        state.cat = c;
        catRow.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        paint();
      };
      catRow.appendChild(b);
    });
    node.appendChild(catRow);

    var diffRow = h('<div class="chips mb"></div>');
    DIFFS.forEach(function (d) {
      var b = h('<button class="chip' + (d === state.diff ? " on" : "") + '">' + esc(d) + "</button>");
      b.onclick = function () {
        state.diff = d;
        diffRow.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        paint();
      };
      diffRow.appendChild(b);
    });
    node.appendChild(diffRow);

    var count = h('<p class="faint small mb"></p>');
    node.appendChild(count);

    var list = h('<div class="list"></div>');
    node.appendChild(list);

    var empty = h('<div class="empty" hidden><b>No exercises match that</b><br>Try a different word, or add your own exercise below.</div>');
    node.appendChild(empty);

    /* A filter for the member's own exercises, so they can find what they
       created and take it out again if they do not want it any more. */
    var mineRow = h('<div class="chips mb"></div>');
    var mineBtn = h('<button class="chip">My exercises</button>');
    mineBtn.onclick = function () {
      state.mine = !state.mine;
      mineBtn.classList.toggle("on", state.mine);
      paint();
    };
    mineRow.appendChild(mineBtn);
    var favBtn = h('<button class="chip">★ Favourites</button>');
    favBtn.onclick = function () {
      state.fav = !state.fav;
      favBtn.classList.toggle("on", state.fav);
      paint();
    };
    mineRow.appendChild(favBtn);
    node.appendChild(mineRow);

    function all() {
      return D.exercises.concat(S.myExercises());
    }

    function isMine(ex) { return String(ex.id || "").indexOf("mx") === 0; }

    function matches(ex) {
      if (state.mine && !isMine(ex)) return false;
      if (state.fav && !S.isFavourite("exercises", ex.id)) return false;
      if (state.cat !== "All" && (ex.category || "") !== state.cat) return false;
      if (state.diff !== "All" && (ex.difficulty || "Beginner") !== state.diff) return false;
      if (state.q) {
        var hay = (ex.name + " " + (ex.category || "") + " " + (ex.muscles || []).join(" ") + " " +
                   (ex.equipment || []).join(" ") + " " + (ex.purpose || "")).toLowerCase();
        if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
      }
      return true;
    }

    function paint() {
      var rows = all().filter(matches);
      count.textContent = rows.length + (rows.length === 1 ? " exercise" : " exercises");
      list.innerHTML = "";
      empty.hidden = rows.length > 0;
      rows.forEach(function (ex) {
        var last = S.lastFor(ex.id);
        var mine = isMine(ex);
        var fav = S.isFavourite("exercises", ex.id);
        var r = h('<div class="row"><div class="ri">' +
          (ex.type === "time" ? "⏱️" : ex.type === "weight" ? "🏋️" : "💪") + "</div>" +
          '<button class="rm row-main" type="button"><b>' + esc(ex.name) + "</b><small>" +
          esc(ex.category || (ex.muscles || []).slice(0, 2).join(", ")) +
          (ex.difficulty ? " · " + esc(ex.difficulty) : "") +
          (last ? " · last " + last.val + " " + esc(ex.unit) : "") +
          (mine ? " · yours" : "") +
          "</small></button>" +
          '<button class="fav-btn' + (fav ? " on" : "") + '" type="button" aria-label="' +
          (fav ? "Remove from favourites" : "Add to favourites") + '">★</button>' +
          '<div class="rr"><span class="chev">›</span></div></div>');
        r.querySelector(".row-main").onclick = function () { go("exercisedetail", ex.id); };
        r.querySelector(".fav-btn").onclick = function () {
          S.toggleFavourite("exercises", ex.id);
          paint();
        };
        /* The whole row opens the guide, except the star. */
        r.onclick = function (e) {
          if (e.target && e.target.closest && e.target.closest(".fav-btn")) return;
          go("exercisedetail", ex.id);
        };
        list.appendChild(r);
      });
    }

    paint();
    setTimeout(function () {
      var q = $("#libQ", node);
      if (q) q.oninput = function () { state.q = this.value.trim(); paint(); };
    }, 0);

    shell("exercise", "The Guides", node);
    return node;
  }

  /* ---------------- one exercise, in full ---------------- */
  function detail(shell, go, id) {
    var ex = null;
    D.exercises.concat(S.myExercises()).forEach(function (e) {
      if (e.id === id) ex = e;
    });
    if (!ex) { go("exercise"); return; }
    var node = h("<div></div>");

    // Header
    node.appendChild(h('<div class="card center">' +
      '<h2 style="font-size:1.25rem">' + esc(ex.name) + "</h2>" +
      '<div class="sub">' + esc(ex.category || "") + (ex.difficulty ? " · " + esc(ex.difficulty) : "") + "</div>" +
      (ex.muscles && ex.muscles.length ? '<div class="chips mt" style="justify-content:center">' +
        ex.muscles.map(function (m) { return '<span class="chip" style="cursor:default">' + esc(m) + "</span>"; }).join("") + "</div>" : "") +
      "</div>"));

    // Gallery
    node.appendChild(carousel(ex));

    // Why
    node.appendChild(h('<div class="card mt"><h3>What it is for</h3><p class="sub">' + esc(ex.purpose || "") + "</p></div>"));

    // Equipment
    node.appendChild(h('<div class="card mt"><h3>Equipment</h3><p class="sub">' +
      esc((ex.equipment && ex.equipment.length ? ex.equipment : ["None needed"]).join(", ")) + "</p></div>"));

    // Start position
    node.appendChild(h('<div class="card mt"><h3>Starting position</h3><p class="sub">' + esc(ex.start || "") + "</p></div>"));

    // Steps
    var steps = h('<div class="card mt"><h3>Step by step</h3><ol class="steps-list"></ol></div>');
    var ol = steps.querySelector(".steps-list");
    (ex.steps || []).forEach(function (s) { ol.appendChild(h("<li>" + esc(s) + "</li>")); });
    node.appendChild(steps);

    // Volume
    node.appendChild(h('<div class="list mt">' +
      '<div class="row"><div class="rm"><b>Sets and reps</b></div><div class="rr">' + esc(ex.sets || ex.reps || "—") + "</div></div>" +
      '<div class="row"><div class="rm"><b>Rest between sets</b></div><div class="rr">' + esc(ex.rest || "60 to 90 seconds") + "</div></div>" +
      (ex.breathing ? '<div class="row"><div class="rm"><b>Breathing</b></div><div class="rr" style="max-width:60%;text-align:right">' + esc(ex.breathing) + "</div></div>" : "") +
      "</div>"));

    // Mistakes
    if (ex.mistakes && ex.mistakes.length) {
      var mm = h('<div class="card mt"><h3>Common mistakes</h3><ul class="plist bad"></ul></div>');
      var ul = mm.querySelector(".plist");
      ex.mistakes.forEach(function (m) { ul.appendChild(h("<li>" + esc(m) + "</li>")); });
      node.appendChild(mm);
    }

    // Safety
    if (ex.safety && ex.safety.length) {
      var sf = h('<div class="card mt"><h3>Safety and precautions</h3><ul class="plist"></ul></div>');
      var ul2 = sf.querySelector(".plist");
      ex.safety.forEach(function (m) { ul2.appendChild(h("<li>" + esc(m) + "</li>")); });
      node.appendChild(sf);
    }

    // Easier versions
    if (ex.easier && ex.easier.length) {
      var es = h('<div class="card mt"><h3>Easier versions</h3><ul class="plist good"></ul></div>');
      var ul3 = es.querySelector(".plist");
      ex.easier.forEach(function (m) { ul3.appendChild(h("<li>" + esc(m) + "</li>")); });
      node.appendChild(es);
    }

    // Honest note
    node.appendChild(h('<p class="faint small mt center">Progress depends on your own circumstances, consistency, recovery and nutrition. ' +
      "Start at the level that lets you keep good form, and only add load when the movement feels easy.</p>"));

    // Log it
    var logBtn = h('<button class="btn btn-primary btn-lg mt">Log this exercise</button>');
    logBtn.onclick = function () { go("logdetail", ex.id); };
    node.appendChild(logBtn);

    /* Put it in your own routine, and star it for later. */
    var acts = h('<div class="rr" style="gap:10px;margin-top:10px"></div>');
    var favBtn = h('<button class="btn btn-ghost">★ Add to favourites</button>');
    favBtn.onclick = function () {
      var on = S.toggleFavourite("exercises", ex.id);
      favBtn.textContent = on ? "★ In your favourites" : "★ Add to favourites";
      toast(on ? "Saved to your favourites" : "Removed from your favourites");
    };
    if (S.isFavourite("exercises", ex.id)) favBtn.textContent = "★ In your favourites";
    acts.appendChild(favBtn);

    var addBtn = h('<button class="btn btn-ghost">Add to My Routine</button>');
    addBtn.onclick = function () {
      if (!window.GBPlan) return toast("Your routine is unavailable");
      var added = window.GBPlan.addToRoutine(ex);
      if (added) toast("Added to " + added + " in My Routine");
    };
    acts.appendChild(addBtn);
    node.appendChild(acts);

    /* A movement the member created can be taken out again. */
    if (String(ex.id || "").indexOf("mx") === 0) {
      var del = h('<button class="btn btn-ghost mt">Delete this exercise</button>');
      del.onclick = function () {
        GBDialog.confirm("Delete \u201c" + ex.name + "\u201d? It will be taken off your routine too.", {
          title: "Delete your exercise",
          okLabel: "Delete",
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          S.removeExercise(ex.id);
          toast("Deleted");
          go("exercise");
        });
      };
      node.appendChild(del);
    }

    shell("exercise", ex.name, node, { back: true });
  }

  global.GBLibrary = { screen: screen, detail: detail, carousel: carousel, CATEGORIES: CATEGORIES };
})(typeof window !== "undefined" ? window : this);
