/* ==========================================================================
   GYM BADGE — app shell, router & screens
   Rebuilt to match the Figma design: three dark themes (Ember / Midnight /
   Dark), real photography, 5-tab shell (Workout · Exercise · Library ·
   Progress · You).
   The six required features stay wired up, all under world class names:
     My Profile (onboarding) · My Workout Log (logging) · Gym Equipment (NFC equipment) ·
     My Plate Truth (food scan) · Body Goals (projection) · Find a Gym (gyms).
   Vanilla JS, offline first, everything persists through GBStore.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.GBData, S = window.GBStore, P = window.GBPay;
  var root = document.getElementById("app");
  var IMG = "/app/assets/img/";

  /* ---------------- tiny helpers ---------------- */
  function h(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]; }); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  var toast = window.GBUI.toast;
  function img(src, alt, cls) { return '<img class="' + (cls || "") + '" src="' + IMG + src + '" alt="' + esc(alt || "") + '" decoding="async">'; }

  /* ---------------- router ---------------- */
  var routes = {};
  function route(name, fn) { routes[name] = fn; }

  /* Where the app has been, so the back button always goes somewhere real.
     A plain history.back() does nothing when the app was opened straight
     from a link, so we keep our own short stack and fall back to the
     screen's parent. */
  var navStack = [];

  function go(name, param) {
    var next = "#/" + name + (param ? "/" + param : "");
    var here = location.hash;
    if (here && here !== next && here !== "#/" && here !== "#") navStack.push(here);
    if (navStack.length > 40) navStack.shift();
    location.hash = next;
  }

  /* Go back one step inside the app. If there is no step to go back to —
     a deep link, or the first screen — we go to the screen's parent. */
  function goBack(fallback) {
    if (navStack.length) {
      var prev = navStack.pop();
      location.hash = prev;
      return true;
    }
    if (fallback) { go(fallback); return true; }
    return false;
  }

  function current() {
    var m = location.hash.replace(/^#\/?/, "").split("/");
    return { name: m[0] || "", param: m[1] || "" };
  }
  function render() {
    var r = current();
    var fn = routes[r.name] || routes.workout;
    root.innerHTML = "";
    fn(r.param);
    // Localise whatever the route just painted. Missing keys fall back to
    // English verbatim, so the meaning never changes with the language.
    if (window.GBI18n) window.GBI18n.apply(root);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", function () {
    /* If the phone's own back button moved us, keep our stack in step. */
    if (navStack.length && navStack[navStack.length - 1] === location.hash) navStack.pop();
    render();
  });
  window.addEventListener("lang:change", function () { render(); });

  /* ---------------- chrome ---------------- */
  var ICON = {
    workout: '<path d="M4 9v6M7.5 6.5v11M16.5 6.5v11M20 9v6M7.5 12h9"/>',
    exercise:'<circle cx="12" cy="4.6" r="2.1"/><path d="M12 7v6M12 13l-3.2 7.5M12 13l3.2 7.5M6 9.4l6-1 6 1"/>',
    library: '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v18H6.5A2.5 2.5 0 004 18.5z"/><path d="M8 3v18"/>',
    progress:'<path d="M4 20V5M4 20h16"/><path d="M8 16l4-5 3 3 4-6"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4 3.4-6 7.5-6s7.5 2 7.5 6"/>'
  };
  var TABS = [
    { id:"workout",  label:"My Routine" },
    { id:"exercise", label:"The Guides" },
    { id:"library",  label:"Programs" },
    { id:"progress", label:"Progress" },
    { id:"profile",  label:"You" }
  ];
  function tabbar(active) {
    var nav = h('<nav class="tabbar"></nav>');
    TABS.forEach(function (t) {
      var b = h('<button class="tab' + (t.id === active ? " on" : "") + '" aria-label="' + t.label + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + ICON[t.id] + "</svg><span>" + t.label + "</span></button>");
      b.onclick = function () { go(t.id); };
      nav.appendChild(b);
    });
    return nav;
  }
  /* ---------------- coming soon ----------------
     One short, honest note about what is being built next. It lives at the
     foot of the profile screen, once, rather than on every screen. */
  var SOON = [
    "Going live with other Gymbadgers around the world, for daily, weekly, monthly and yearly routines.",
    "Yoga exercises with trainers."
  ];
  function soonBlock() {
    var box = h('<div class="soon"><div class="soon-h">Coming soon</div><ul class="soon-list"></ul></div>');
    var ul = box.querySelector(".soon-list");
    SOON.forEach(function (t) { ul.appendChild(h("<li>" + esc(t) + "</li>")); });
    return box;
  }

  /* Where each tab lives, so a back button with no history still has
     somewhere sensible to go. */
  var TAB_HOME = {
    profile: "profile", workout: "workout", exercise: "exercise",
    library: "library", progress: "progress"
  };

  function shell(active, title, body, opts) {
    opts = opts || {};
    var scr = h('<div class="screen"></div>');
    if (title !== null) {
      var bar = h('<div class="topbar"></div>');
      if (opts.back) {
        var bk = h('<button class="back" aria-label="Back">‹</button>');
        bk.onclick = function () {
          if (!goBack(opts.backTo || TAB_HOME[active])) toast("There is nothing to go back to");
        };
        bar.appendChild(bk);
      }
      bar.appendChild(h('<div class="tt">' + esc(title) + "</div>"));
      if (opts.action) { bar.appendChild(h('<div class="sp"></div>')); bar.appendChild(opts.action); }
      scr.appendChild(bar);
    }
    if (opts.banner) scr.appendChild(h('<div class="banner">' + opts.banner + "</div>"));
    scr.appendChild(body);
    root.appendChild(scr);
    root.appendChild(tabbar(active));
  }
  function iconBtn(txt, fn) { var b = h('<button class="iconbtn">' + esc(txt) + "</button>"); b.onclick = fn; return b; }

  /* The Settings screen lives in its own file (settings.js) so it stays
     readable, but it still needs the app shell to paint. Expose the few
     primitives it borrows. */
  window.GBAppShell = {
    h: h,
    esc: esc,
    $: $,
    toast: toast,
    img: img,
    shell: shell,
    go: go,
    render: render,
    /* Full re-render of the current route (clears the screen first). */
    rerender: function () { render(); },
    rowBtn: rowBtn
  };

  /* =======================================================================
     SEED DATA — the training plan, photographs and tools
  ======================================================================= */
  /* The training programs live in programs.js, so the routine screen and
     the program covers read one source. Loading a program writes its days
     and movements into the member's own My Routine, so a new member opens
     a real, usable week rather than an empty screen. */
  var MUSCLES = [
    { n:"Cardio",     x:18, y:16 }, { n:"Shoulders", x:74, y:20 }, { n:"Chest", x:72, y:29 },
    { n:"Biceps",     x:80, y:35 }, { n:"Forearm",   x:84, y:44 }, { n:"Abs",   x:70, y:44 },
    { n:"Obliques",   x:78, y:50 }, { n:"Quads",     x:68, y:66 }, { n:"Adductors", x:62, y:76 }
  ];
  var MAXES = { kcal:2000, carbs:250, protein:120, fat:65, fiber:30 };

  function exById(id) { for (var i = 0; i < D.exercises.length; i++) if (D.exercises[i].id === id) return D.exercises[i]; return null; }
  function exName(id) { var e = exById(id); return e ? e.name : id; }
  function exUnit(id) { var e = exById(id); return e ? e.unit : ""; }
  function exIcon(t) { return t === "time" ? "⏱️" : t === "weight" ? "🏋️" : "💪"; }

  /* Gender-aware imagery.
     A member who told us how they present sees pictures that match, and
     anyone who did not tell us sees inclusive imagery. This only changes
     which photograph is shown - never the instruction, the exercise or
     what the member should be able to do. */
  function memberGender() {
    var u = S.user() || {};
    var g = String(u.gender || "").toLowerCase();
    if (g === "female" || g === "woman" || g === "women") return "female";
    if (g === "male" || g === "man" || g === "men") return "male";
    return "any";
  }
  function modelImage(kind) {
    var g = memberGender();
    if (g === "female") return "coach/model-female.jpg";
    if (g === "male") return "coach/model-male.jpg";
    // No preference given: use the inclusive placeholder, and pick a
    // different model per surface so the same photo is not everywhere.
    return kind === "welcome" ? "coach/model-female.jpg" : "coach/model-male.jpg";
  }
  function modelAlt() {
    var g = memberGender();
    if (g === "female") return "Female athlete training";
    if (g === "male") return "Male athlete training";
    return "Athlete training";
  }
  function relDay(d) {
    var t = S.today();
    if (d === t) return "Today";
    var y = new Date(); y.setDate(y.getDate() - 1);
    if (d === y.toISOString().slice(0, 10)) return "Yesterday";
    return d;
  }
  function suggestBump(log) {
    var ex = exById(log.ex);
    if (!ex) return 1;
    if (ex.type === "time") return 5;
    if (ex.type === "weight") return 2.5;
    return Math.max(1, Math.round(log.val * 0.1));
  }
  function targetVal(log) { return log.val + suggestBump(log); }
  function verdictPill(v) {
    if (v === "good") return '<span class="pill ok">Fits goal</span>';
    if (v === "watch") return '<span class="pill warn">Watch portion</span>';
    return '<span class="pill bad">Off plan</span>';
  }
  function macroBar(label, val, goal) {
    var pct = Math.min(100, Math.round((val / goal) * 100));
    return '<div class="macro"><div class="mlabel"><span>' + label + "</span><b>" + Math.round(val) + " / " + goal + '</b></div><div class="mbar"><i style="width:' + pct + '%"></i></div></div>';
  }
  function rowBtn(ic, k, d, fn) {
    var r = h('<button class="row"><div class="ri">' + ic + '</div><div class="rm"><b>' + esc(k) + "</b>" + (d ? "<small>" + esc(d) + "</small>" : "") + '</div><div class="rr"><span class="chev">›</span></div></button>');
    if (fn) r.onclick = fn;
    return r;
  }
  /* A real, scannable QR code for the member's badge code. The encoder
     lives in assets/qr.js so the website and the app share one. */
  function qrSvg(code) {
    if (window.GBQR) return window.GBQR.svg(code, { size: 190 });
    return "";
  }
  function badgeCode(seed) {
    var x = 0, s = String(seed || "athlete");
    for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0;
    return "GB-" + (x.toString(36).toUpperCase() + "000000").slice(0, 6);
  }

  /* =======================================================================
     WELCOME  +  ONBOARDING (feature #1)
  ======================================================================= */
  route("welcome", function () {
    var s = h('<div class="screen"><div class="welcome"></div></div>');
    var w = s.firstChild;
    w.appendChild(h('<img class="logo" src="/assets/img/logo.png" alt="Gym Badge">'));
    w.appendChild(h('<div class="brandbig">Gymbadge</div><p class="tagline">Train · Track · Triumph</p>'));
    w.appendChild(h('<div class="hero-photos" style="margin-top:26px">' +
      '<div class="ph">' + img(modelImage("welcome"), modelAlt()) + "</div>" +
      '<div class="ph">' + img("ex/gobletsquat-1.jpg", "Training") + "</div>" +
      '<div class="ph">' + img(modelImage("welcome2"), modelAlt()) + "</div></div>"));
    var start = h('<button class="btn btn-primary btn-lg">Get started</button>');
    start.onclick = function () { go("ob", "0"); };
    var have = h('<button class="btn btn-ghost" style="margin-top:10px">I already have an account</button>');
    have.onclick = function () { S.set({ seenIntro: true, user: S.user() || { type:"individual", name:"Athlete" } }); go("workout"); };
    w.appendChild(start); w.appendChild(have);
    w.appendChild(h('<p class="faint small" style="margin-top:22px">Free to start · Photo upload optional · Cancel anytime</p>'));
    root.appendChild(s);
  });

  var OB = [
    { k:"gender",     q:"What's your <span class='hl'>gender</span>?", s:"So we can tailor your plan and calorie maths.", type:"photo" },
    { k:"experience", q:"How would you describe your gym <span class='hl'>experience</span>?", s:"This helps us customise your workouts and recommendations.",
      opts:[["Beginner","Training for less than 6 months","🔰"],["Intermediate","Training 6 months – 2 years","⚡"],["Advanced","Training for more than 2 years","🔥"]] },
    { k:"objective",  q:"What's your current fitness <span class='hl'>objective</span>?", s:"Choose the main goal you want to achieve.",
      opts:[["Overall Fitness","Improve my overall fitness","💚"],["Get Lean","Lose body fat and get lean","🏃"],["Build Muscle","Build strength and muscle mass","💪"]] },
    { k:"place",      q:"Where do you <span class='hl'>train</span>?", s:"We'll match exercises to the space you have.",
      opts:[["Small or home gym","Dumbbells, bands and a bench","🏠"],["Commercial gym","Full machines and free weights","🏢"],["Outdoors","Parks, tracks and bodyweight","🌳"]] },
    { k:"days",       q:"How many <span class='hl'>days</span> a week?", s:"Consistency beats intensity — pick what you'll actually keep.",
      opts:[["2 days","A solid starting rhythm","2️⃣"],["3 days","The sweet spot for most people","3️⃣"],["4+ days","Chasing serious progress","4️⃣"]] },
    { k:"weight",     q:"What's your current <span class='hl'>weight</span>?", s:"We track trends over time — never judgement.", type:"number", unit:"kg", ph:"72" },
    { k:"height",     q:"How <span class='hl'>tall</span> are you?", s:"Used for BMI free, strength relative targets.", type:"number", unit:"cm", ph:"176" },
    { k:"age",        q:"How <span class='hl'>old</span> are you?", s:"Recovery and calorie targets adjust with age.", type:"number", unit:"years", ph:"28" },
    { k:"reminder",   q:"Set a <span class='hl'>reminder</span>", s:"A nudge at the right time is what makes it stick.",
      opts:[["Morning","06:00 – 09:00","🌅"],["Lunchtime","11:00 – 14:00","☀️"],["Evening","17:00 – 21:00","🌙"]] },
    { k:"acctype",    q:"How are you <span class='hl'>joining</span>?", s:"This shapes your setup.",
      opts:[["I'm an individual","Gym goer tracking my own progress","🧍"],["Gym or fitness hub","Register a company, branches & equipment","🏢"],["Personal trainer","Get hired by members near you","🏋️"]] }
  ];

  route("ob", function (param) {
    var i = parseInt(param || "0", 10) || 0;
    if (i >= OB.length) return finishOnboarding();
    var step = OB[i];
    var s = h('<div class="screen"></div>');

    var top = h('<div class="obbar"><button class="back" id="obBack" aria-label="Back">‹</button><button class="skip" id="obSkip">Skip</button></div>');
    s.appendChild(top);
    s.appendChild(h('<div class="track"><i style="width:' + Math.round(((i + 1) / OB.length) * 100) + '%"></i></div>'));
    s.appendChild(h('<div class="stepsline"><span>Step ' + (i + 1) + " of " + OB.length + "</span><span>" + esc(step.k === "acctype" ? "Almost there" : "My Profile") + "</span></div>"));
    s.appendChild(h('<h1 class="headline">' + step.q + "</h1>"));
    s.appendChild(h('<p class="sub" style="margin:10px 0 22px">' + esc(step.s) + "</p>"));

    var chosen = (S.get().user && S.get().user[step.k]) || null;

    if (step.type === "photo") {
      var grid = h('<div class="opt-photo"></div>');
      [["Female", "coach/model-female.jpg"], ["Male", "coach/model-male.jpg"]].forEach(function (g) {
        var p = h('<div class="p' + (chosen === g[0] ? " on" : "") + '">' + img(g[1], g[0]) + '<div class="tick">✓</div><div class="cap">' + g[0] + "</div></div>");
        p.onclick = function () {
          grid.querySelectorAll(".p").forEach(function (x) { x.classList.remove("on"); });
          p.classList.add("on"); chosen = g[0];
        };
        grid.appendChild(p);
      });
      s.appendChild(grid);
    } else if (step.type === "number") {
      var f = h('<div class="field"><label>Enter in ' + esc(step.unit) + '</label><input id="obNum" type="number" inputmode="decimal" placeholder="' + esc(step.ph || "") + '" value="' + (chosen || "") + '"></div>');
      s.appendChild(f);
      var rf = h('<div class="chips mb"></div>');
      [step.ph, step.unit === "kg" ? "60" : step.unit === "cm" ? "165" : "22"].forEach(function (q) {
        if (!q) return;
        var c = h('<div class="chip">' + q + "</div>");
        c.onclick = function () { var inp = $("#obNum", s); inp.value = q; inp.focus(); };
        rf.appendChild(c);
      });
      s.appendChild(rf);
    } else {
      step.opts.forEach(function (o) {
        var c = h('<div class="opt' + (chosen === o[0] ? " on" : "") + '"><div class="oi">' + o[2] + '</div><div class="om"><b>' + esc(o[0]) + "</b><small>" + esc(o[1]) + '</small></div><div class="radio"></div></div>');
        c.onclick = function () {
          s.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("on"); });
          c.classList.add("on"); chosen = o[0];
        };
        s.appendChild(c);
      });
    }

    var next = h('<button class="btn btn-primary btn-lg">' + (i === OB.length - 1 ? "Finish setup" : "Next") + "</button>");
    next.onclick = function () {
      if (step.type === "number") chosen = parseFloat($("#obNum", s).value) || chosen;
      if (!chosen) return toast("Pick an option to continue");
      var u = S.user() || {};
      u[step.k] = chosen;
      u.type = u.type || "individual";
      u.name = u.name || "Athlete";
      if (step.k === "acctype") {
        if (chosen === "Gym or fitness hub") u.type = "gym";
        else if (chosen === "Personal trainer") u.type = "trainer";
        else u.type = "individual";
      }
      if (step.k === "objective") u.goal = chosen;
      S.setUser(u);
      if (i === OB.length - 1) finishOnboarding(); else go("ob", String(i + 1));
    };
    var foot = h('<div class="ob-foot"></div>');
    foot.appendChild(next);
    s.appendChild(foot);
    s.querySelector("#obBack").onclick = function () { i === 0 ? go("welcome") : go("ob", String(i - 1)); };
    s.querySelector("#obSkip").onclick = function () { i === OB.length - 1 ? finishOnboarding() : go("ob", String(i + 1)); };
    root.appendChild(s);
  });

  function finishOnboarding() {
    var u = S.user() || {}; u.type = u.type || "individual"; u.name = u.name || "Athlete";
    S.set({ seenIntro: true, user: u });
    go("pricing");
  }

  /* =======================================================================
     MY ROUTINE  (tab) — your own training week (feature #2)
  ======================================================================= */
    route("workout", function () {
    if (!S.user()) return go("welcome");
    if (window.GBPlan) window.GBPlan.screen(function (a, title, body, opts) { shell(a, title, body, opts); }, go);
    else shell("workout", "My Routine", h('<p class="sub">Your plan is unavailable.</p>'));
  });

  /* Choose exercise to log */
  route("log", function () {
    var node = h("<div></div>");
    node.appendChild(h('<p class="sub mb">Pick an exercise — Gym Badge remembers your last number so you can beat it.</p>'));
    if (!S.isPremium() && S.trialsLeft() <= 5) node.appendChild(h('<div class="banner">' + S.trialsLeft() + ' free logs left today. <a href="#/pricing">Upgrade for unlimited →</a></div>'));

    /* With a catalogue this size, search is the fastest way in. */
    var q = "";
    var onlyFav = false;
    var search = h('<div class="search">🔍<input id="logQ" placeholder="Search the exercises" autocomplete="off"></div>');
    node.appendChild(search);

    var chipRow = h('<div class="chips mb"></div>');
    var favChip = h('<button class="chip">★ Favourites</button>');
    favChip.onclick = function () {
      onlyFav = !onlyFav;
      favChip.classList.toggle("on", onlyFav);
      paint();
    };
    chipRow.appendChild(favChip);
    node.appendChild(chipRow);

    var count = h('<p class="faint small mb"></p>');
    node.appendChild(count);

    var list = h('<div class="list"></div>');
    node.appendChild(list);

    var empty = h('<div class="empty" hidden><b>Nothing matches that</b><br>Try a different word, or clear the filter.</div>');
    node.appendChild(empty);

    function paint() {
      var rows = D.exercises.concat(S.myExercises()).filter(function (ex) {
        if (onlyFav && !S.isFavourite("exercises", ex.id)) return false;
        if (!q) return true;
        var hay = (ex.name + " " + (ex.category || "") + " " + (ex.muscles || []).join(" ") + " " +
                   (ex.equipment || []).join(" ")).toLowerCase();
        return hay.indexOf(q.toLowerCase()) >= 0;
      });
      count.textContent = rows.length + (rows.length === 1 ? " exercise" : " exercises");
      list.innerHTML = "";
      empty.hidden = rows.length > 0;
      rows.forEach(function (ex) {
        var last = S.lastFor(ex.id);
        var fav = S.isFavourite("exercises", ex.id);
        var sub = last ? "Last: " + last.val + " " + ex.unit + " · " + relDay(last.date) : "Not logged yet";
        var first = (ex.gallery || [])[0];
        var icon = first
          ? '<span class="ex-thumb"><img alt="" src="/app/assets/img/ex/thumb/' +
            esc(first.replace(/^ex\//, "")) + '" decoding="async"></span>'
          : exIcon(ex.type);
        var r = h('<div class="row"><div class="ri">' + icon + "</div>" +
          '<button class="rm row-main" type="button"><b>' + esc(ex.name) + "</b><small>" + esc(sub) + "</small></button>" +
          '<button class="fav-btn' + (fav ? " on" : "") + '" type="button" aria-label="' +
          (fav ? "Remove from favourites" : "Add to favourites") + '">★</button>' +
          '<div class="rr"><span class="chev">›</span></div></div>');
        r.querySelector(".row-main").onclick = function () { go("logdetail", ex.id); };
        r.querySelector(".fav-btn").onclick = function () {
          S.toggleFavourite("exercises", ex.id);
          paint();
        };
        /* The whole row opens the log, except the star. */
        r.onclick = function (e) {
          if (e.target && e.target.closest && e.target.closest(".fav-btn")) return;
          go("logdetail", ex.id);
        };
        list.appendChild(r);
      });
    }

    setTimeout(function () {
      var input = $("#logQ", node);
      if (input) input.oninput = function () { q = input.value; paint(); };
    }, 0);

    paint();
    shell("workout", "My Workout Log", node, { back: true, backTo: "workout" });
  });

  route("logdetail", function (param) {
    var ex = exById(param) || D.exercises[0];
    var last = S.lastFor(ex.id);
    var node = h("<div></div>");
    if (last) {
      var tv = targetVal(last);
      node.appendChild(h('<div class="beat"><div class="last">Your last best · ' + relDay(last.date) + '</div><div class="now">' + last.val + " " + esc(ex.unit) + '</div><div class="why">Beat it → aim for <b class="hl">' + tv + " " + esc(ex.unit) + "</b></div></div>"));
    } else {
      node.appendChild(h('<div class="card"><h3>First time for ' + esc(ex.name) + '</h3><p class="sub">Log it now and Gym Badge sets your next target automatically.</p></div>'));
    }
    node.appendChild(h('<div class="field"><label>How much did you do? (' + esc(ex.unit) + ')</label><input id="val" type="number" inputmode="decimal" placeholder="' + (last ? targetVal(last) : "0") + '"></div>'));
    var quick = h('<div class="chips mb"></div>');
    (ex.type === "time" ? [10, 20, 30, 60] : ex.type === "weight" ? [20, 40, 60, 80] : [10, 25, 50, 100]).forEach(function (q) {
      var c = h('<div class="chip">' + q + "</div>");
      c.onclick = function () { $("#val", node).value = q; };
      quick.appendChild(c);
    });
    node.appendChild(quick);
    var save = h('<button class="btn btn-primary btn-lg">Save &amp; beat tomorrow</button>');
    save.onclick = function () {
      var v = parseFloat($("#val", node).value);
      if (!v || v <= 0) return toast("Enter what you did");
      if (!S.canTrial()) return toast("Free plan limit reached — upgrade for unlimited");
      S.addLog({ ex: ex.id, val: v });
      toast(last && v >= last.val ? "New personal best 🏆" : "Logged! 🎉");
      go("workout");
    };
    node.appendChild(save);
    shell("workout", ex.name, node, { back: true, backTo: "log" });
  });

  /* =======================================================================
     EXERCISE (tab) — muscle map + Gym Equipment equipment (feature #3)
  ======================================================================= */
    route("exercise", function () {
    if (window.GBLibrary) {
      window.GBLibrary.screen(function (a, title, body, opts) { shell(a, title, body, opts); }, go);
      return;
    }
    shell("exercise", "The Guides", h('<p class="sub">The library is unavailable.</p>'));
  });

  /* One exercise in full — instructions, safety and the photo gallery. */
  route("exercisedetail", function (param) {
    if (window.GBLibrary) {
      window.GBLibrary.detail(function (a, title, body, opts) { shell(a, title, body, opts); }, go, param);
      return;
    }
    go("exercise");
  });

  /* ---------- 3. My Trainer ---------- */
  route("trainers", function () {
    if (window.GBTrainers) {
      window.GBTrainers.directory(function (a, title, body, opts) { shell(a, title, body, opts); }, go);
      return;
    }
    shell("exercise", "My Trainer", h('<p class="sub">The trainer directory is unavailable.</p>'));
  });

  route("trainer", function (param) {
    if (window.GBTrainers) {
      window.GBTrainers.profile(function (a, title, body, opts) { shell(a, title, body, opts); }, go, param);
      return;
    }
    go("trainers");
  });


  /* ---------- the gym floor: every machine, and one machine in full ---------- */
  route("equipmentlist", function () {
    if (window.GBEquipment) {
      window.GBEquipment.floor(function (a, title, body, opts) { shell(a, title, body, opts); }, go);
      return;
    }
    shell("exercise", "Gym Floor", h('<p class="sub">The gym floor is unavailable.</p>'), { back: true, backTo: "exercise" });
  });

  route("equipment", function (param) {
    if (window.GBEquipment) {
      window.GBEquipment.machine(function (a, title, body, opts) { shell(a, title, body, opts); }, go, param);
      return;
    }
    go("equipmentlist");
  });

  /* =======================================================================
     LIBRARY (tab) — programs + the AI tools
  ======================================================================= */
  route("library", function () {
    var node = h("<div></div>");
    node.appendChild(h('<h2 class="headline" style="margin-bottom:4px">The <span class="hl">vault</span></h2>'));
    node.appendChild(h('<p class="sub mb">Structured plans and every tool, one tap away.</p>'));

    var PROGRAMS = window.GBPrograms ? window.GBPrograms.list() : [];
    var FILTERS = ["All plans", "2 days", "3 days", "4 days"];
    var active = "All plans";
    var chips = h('<div class="chips mb"></div>');
    var grid = h('<div id="vaultGrid"></div>');

    function paint() {
      grid.innerHTML = "";
      var byDays = {};
      PROGRAMS.filter(function (p) { return active === "All plans" || p.days === parseInt(active, 10); }).forEach(function (p) {
        (byDays[p.daysLabel] = byDays[p.daysLabel] || []).push(p);
      });
      if (!Object.keys(byDays).length) { grid.appendChild(h('<p class="sub center">No plans for that rhythm yet.</p>')); return; }
      Object.keys(byDays).forEach(function (d) {
        grid.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">' + esc(d) + "</div>"));
        var covers = h('<div class="covers"></div>');
        byDays[d].forEach(function (p) {
          var c = h('<button class="cover">' + img(p.img, p.name) + '<div class="ov"><div class="tag ' + p.tag + '">' + esc(p.name) + '</div><div class="sub2">' + esc(p.sub) + "</div></div></button>");
          c.onclick = function () { openProgram(p); };
          covers.appendChild(c);
        });
        grid.appendChild(covers);
      });
    }

    /* Loading a program writes its days and movements into the member's own
       My Routine. It changes their plan, so it asks first. */
    function openProgram(p) {
      var now = Date.now();
      var days = p.split.map(function (d, i) {
        var when = new Date();
        when.setDate(when.getDate() + i);
        var y = when.getFullYear();
        var m = String(when.getMonth() + 1).padStart(2, "0");
        var day = String(when.getDate()).padStart(2, "0");
        return {
          id: "pd" + p.id + i + now.toString(36),
          name: d.name,
          date: y + "-" + m + "-" + day,
          items: d.items.map(function (it) {
            return { ex: it.ex, sets: it.sets, reps: it.reps, rest: it.rest, note: "", done: false };
          })
        };
      });
      var total = days.reduce(function (n, d) { return n + d.items.length; }, 0);
      GBDialog.confirm(p.name + " runs " + p.daysLabel.toLowerCase() + " with " + total +
        " movements. It replaces the days in your routine, and you can change anything afterwards.", {
        title: "Load this program",
        okLabel: "Load program"
      }).then(function (yes) {
        if (!yes) return;
        S.setRoutine({ days: days, view: "week", currentDay: days[0].id });
        toast("Loaded “" + p.name + "” into My Routine");
        go("workout");
      });
    }

    FILTERS.forEach(function (t) {
      var c = h('<button class="chip' + (t === active ? " on" : "") + '">' + t + "</button>");
      c.onclick = function () {
        active = t;
        chips.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on"); paint();
      };
      chips.appendChild(c);
    });
    node.appendChild(chips);
    node.appendChild(grid);
    paint();

    node.appendChild(h('<div class="eyebrow" style="margin:24px 0 12px">Your tools</div>'));
    var tools = h('<div class="list"></div>');
    /* Every tool carries a real photograph, so you can see what it is
       before you tap it. */
    function tool(photo, name, sub, route) {
      var src = photo.charAt(0) === "/" ? photo : "/app/assets/img/" + photo;
      var r = h('<button class="row"><div class="ri">' +
        '<span class="thumb"><img alt="" src="' + esc(src) + '" decoding="async"></span>' +
        '</div><div class="rm"><b>' + esc(name) + "</b><small>" + esc(sub) +
        '</small></div><div class="rr"><span class="chev">›</span></div></button>');
      r.onclick = function () { go(route); };
      return r;
    }
    tools.appendChild(tool("ex/pushup-2.jpg", "My Workout Log", "Beat your last number", "log"));
    tools.appendChild(tool("eq/eq4-bench-press-1.jpg", "Gym Equipment", "Live status for every machine", "equipmentlist"));
    tools.appendChild(tool("meal/jollof-rice-1.jpg", "My Plate Truth", "See your plate for what it is", "plate"));
    tools.appendChild(tool("/assets/img/people/member-lift.jpg", "Body Goals", "Meet the body you're building", "future"));
    tools.appendChild(tool("/assets/img/people/gym-floor.jpg", "Find a Gym", "Find a gym and book a slot", "find"));
    tools.appendChild(tool("coach/coach-ada-okafor.jpg", "My Trainer", "Coaches you can trust", "trainers"));
    tools.appendChild(tool("logo.png", "Your Badge ID", "Profile, streak and settings", "profile"));
    node.appendChild(tools);

    shell("library", "Workout Programs", node);
  });

  /* My Plate Truth — food scan (feature #4) */
  /* =======================================================================
     MY PLATE TRUTH — food explained, plainly (feature #4)
   ======================================================================= */
  route("plate", function () {
    var node = h("<div></div>");
    node.appendChild(h('<p class="sub mb">Scan a plate or pick a food. Either way you get the same guide: what it is, what it does for you, and how it fits your goal.</p>'));

    /* ---- the scanner ---- */
    var scanFrame = h('<div class="scanframe scan-food">📷<div class="scanline"></div>' +
      '<span class="scan-hint">Point the camera at your plate</span></div>');
    node.appendChild(scanFrame);
    var scanBtn = h('<button class="btn btn-primary btn-lg">Scan my meal</button>');
    scanBtn.onclick = function () {
      if (window.GBScanner) {
        window.GBScanner.open(function (name) { if (name) openFood(name); else render(); });
      } else {
        toast("The scanner is unavailable, pick a food from the list");
      }
    };
    node.appendChild(scanBtn);
    var photoBtn = h('<button class="btn btn-ghost mt">📁 Use a photo from my device</button>');
    photoBtn.onclick = function () {
      if (window.GBScanner) {
        window.GBScanner.open(function (name) { if (name) openFood(name); else render(); });
      } else {
        toast("The scanner is unavailable, pick a food from the list");
      }
    };
    node.appendChild(photoBtn);
    node.appendChild(h('<div class="eyebrow" style="margin:22px 0 10px">Or pick a food</div>'));

    if (!S.isPremium() && S.foodScansLeft() <= 5) {
      node.appendChild(h('<div class="banner">' + S.foodScansLeft() + " free scans left today · <a href=\"#/pricing\">upgrade</a></div>"));
    }

    /* Recently eaten, so the food you eat most is one tap away. */
    var recent = S.recentFoods(5);
    if (recent.length) {
      node.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">Recently eaten</div>'));
      var recentRow = h('<div class="food-grid"></div>');
      recent.forEach(function (f) {
        var rf = D.foods[f.name] || {};
        var c = h('<button class="food-tile"><div class="ph">' +
          img(rf.photo || "meal/jollof-rice-1.jpg", f.name) + "</div><b>" + esc(f.name) + "</b></button>");
        c.onclick = function () { openFood(f.name); };
        recentRow.appendChild(c);
      });
      node.appendChild(recentRow);
    }

    // Search + pick
    var search = h('<div class="search">🔍<input id="foodQ" placeholder="Search a food or meal" autocomplete="off"></div>');
    node.appendChild(search);

    var chipRow = h('<div class="chips mb"></div>');
    var onlyFav = false;
    var favChip = h('<button class="chip">★ Favourites</button>');
    favChip.onclick = function () {
      onlyFav = !onlyFav;
      favChip.classList.toggle("on", onlyFav);
      paint($("#foodQ", node) ? $("#foodQ", node).value.trim() : "");
    };
    chipRow.appendChild(favChip);
    var customBtn = h('<button class="chip">+ Add your own food</button>');
    customBtn.onclick = function () { customFoodSheet(); };
    chipRow.appendChild(customBtn);
    node.appendChild(chipRow);

    var grid = h('<div class="food-grid"></div>');
    node.appendChild(grid);

    var list = h('<div class="list mt"></div>');
    node.appendChild(list);

    function paint(q) {
      grid.innerHTML = "";
      list.innerHTML = "";
      var names = Object.keys(D.foods).filter(function (n) {
        if (onlyFav && !S.isFavourite("foods", n)) return false;
        return !q || n.toLowerCase().indexOf(q.toLowerCase()) > -1;
      });
      // A photograph of each food, so you can see what you are tapping.
      names.forEach(function (name) {
        var f = D.foods[name];
        var c = h('<button class="food-tile"><div class="ph">' +
          img(f.photo || "meal/jollof-rice-1.jpg", name) + "</div><b>" + esc(name) + "</b></button>");
        c.onclick = function () { openFood(name); };
        grid.appendChild(c);
      });
      names.forEach(function (name) {
        var f = D.foods[name];
        var fav = S.isFavourite("foods", name);
        var r = h('<div class="row"><div class="ri"><span class="thumb"><img alt="" src="/app/assets/img/' +
          esc(f.photo || "meal/jollof-rice-1.jpg") + '" decoding="async"></span></div>' +
          '<button class="rm row-main" type="button"><b>' + esc(name) +
          "</b><small>" + esc(f.portion || "") + " · " + f.kcal + " kcal</small></button>" +
          '<button class="fav-btn' + (fav ? " on" : "") + '" type="button" aria-label="' +
          (fav ? "Remove from favourites" : "Add to favourites") + '">★</button>' +
          '<div class="rr"><span class="chev">›</span></div></div>');
        r.querySelector(".row-main").onclick = function () { openFood(name); };
        r.querySelector(".fav-btn").onclick = function () {
          S.toggleFavourite("foods", name);
          paint(q);
        };
        r.onclick = function (e) {
          if (e.target && e.target.closest && e.target.closest(".fav-btn")) return;
          openFood(name);
        };
        list.appendChild(r);
      });
      if (!names.length) {
        list.appendChild(h('<div class="row"><div class="rm"><b>No food found</b><small>Try a different word, or add the food yourself.</small></div></div>'));
      }
    }
    paint("");

    setTimeout(function () {
      var i = $("#foodQ", node);
      if (i) i.oninput = function () { paint(this.value.trim()); };
    }, 0);

    // Today's intake
    if (S.foodLogs().length) {
      var tot = { kcal:0, carbs:0, protein:0, fat:0, fiber:0 };
      var hist = h('<div class="list"></div>');
      S.foodLogs().slice(0, 10).forEach(function (f) {
        ["kcal","carbs","protein","fat","fiber"].forEach(function (k) { tot[k] += f[k] || 0; });
        var row = h('<div class="row"><div class="rm"><b>' + esc(f.name) + '</b><small>' +
          f.kcal + " kcal · C " + f.carbs + "g · P " + f.protein + "g · F " + f.fat + 'g</small></div>' +
          '<div class="rr">' + verdictPill(f.verdict) +
          '<button class="row-del" aria-label="Remove">✕</button></div></div>');
        row.querySelector(".row-del").onclick = function () {
          S.removeFood(f.id);
          toast("Removed from today's intake");
          render();
        };
        hist.appendChild(row);
      });
      node.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">Today\'s intake</div>'));
      node.appendChild(hist);
      node.appendChild(h('<div class="card mt"><h3>Daily totals</h3>' +
        macroBar("Calories", tot.kcal, MAXES.kcal) +
        macroBar("Carbs", tot.carbs, MAXES.carbs) +
        macroBar("Protein", tot.protein, MAXES.protein) +
        macroBar("Fat", tot.fat, MAXES.fat) +
        macroBar("Fiber", tot.fiber, MAXES.fiber) + "</div>"));
    }

    node.appendChild(h('<p class="faint small mt center">This is general nutrition education, not a personal diet plan. ' +
      "For medical or dietary advice, speak to a qualified professional.</p>"));

    shell("library", "My Plate Truth", node, { back: true, backTo: "library" });

    /* ---------------- one food, explained ---------------- */
    function openFood(name) {
      var f = D.foods[name];
      if (!f) return;
      var sheet = h('<div class="sheet-bg"><div class="sheet"></div></div>');
      var panel = sheet.firstChild;

      panel.appendChild(h('<div class="sheet-head"><h3>' + esc(name) + '</h3><button class="iconbtn" style="margin-left:auto" id="fdX">✕</button></div>'));

      var foodPhotos = f.photos && f.photos.length ? f.photos : (f.photo ? [f.photo] : []);
      if (foodPhotos.length) {
        var gal = h('<div class="gal food-gal"><div class="gal-track"></div>' +
          '<button type="button" class="gal-nav gal-prev" aria-label="Previous photo">‹</button>' +
          '<button type="button" class="gal-nav gal-next" aria-label="Next photo">‹</button>' +
          '<div class="gal-dots" role="tablist" aria-label="Photo position"></div></div>');
        var ftrack = gal.querySelector(".gal-track");
        var fdots = gal.querySelector(".gal-dots");
        var findex = 0;
        foodPhotos.forEach(function (src, i) {
          var s = h('<div class="gal-slide"><img alt="' + esc(name) + ' photo ' + (i + 1) + ' of ' + foodPhotos.length + '" src="/app/assets/img/' + esc(src) + '"></div>');
          ftrack.appendChild(s);
          var d = h('<button type="button" class="gal-dot" role="tab" aria-label="Photo ' + (i + 1) + '"></button>');
          d.onclick = function () { fshow(i); };
          fdots.appendChild(d);
        });
        function fshow(i) {
          findex = (i + foodPhotos.length) % foodPhotos.length;
          ftrack.style.transform = "translateX(" + (-findex * 100) + "%)";
          fdots.querySelectorAll(".gal-dot").forEach(function (d, n) { d.classList.toggle("on", n === findex); });
          ftrack.querySelectorAll(".gal-slide").forEach(function (s, n) { s.classList.toggle("on", n === findex); });
        }
        gal.querySelector(".gal-prev").onclick = function () { fshow(findex - 1); };
        gal.querySelector(".gal-next").onclick = function () { fshow(findex + 1); };
        gal.setAttribute("tabindex", "0");
        gal.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") { e.preventDefault(); fshow(findex - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); fshow(findex + 1); }
        });
        fshow(0);
        panel.appendChild(gal);
      }

      // The numbers, then the explanation
      panel.appendChild(h('<div class="macros">' +
        '<div class="mchip"><b>' + f.kcal + "</b><small>kcal</small></div>" +
        '<div class="mchip"><b>' + f.carbs + "g</b><small>carbs</small></div>" +
        '<div class="mchip"><b>' + f.protein + "g</b><small>protein</small></div>" +
        '<div class="mchip"><b>' + f.fat + "g</b><small>fat</small></div>" +
        '<div class="mchip"><b>' + f.fiber + "g</b><small>fibre</small></div>" +
        "</div>"));

      panel.appendChild(h('<p class="sub" style="margin-bottom:14px">' + esc(f.simple || f.what || "") + "</p>"));

      function block(title, body) {
        if (!body) return;
        panel.appendChild(h('<div class="nut-block"><h4>' + esc(title) + "</h4><p>" + esc(body) + "</p></div>"));
      }
      function listBlock(title, items) {
        if (!items || !items.length) return;
        var b = h('<div class="nut-block"><h4>' + esc(title) + '</h4><ul class="plist"></ul></div>');
        var ul = b.querySelector(".plist");
        items.forEach(function (i) { ul.appendChild(h("<li>" + esc(i) + "</li>")); });
        panel.appendChild(b);
      }

      block("What it is", f.what);
      listBlock("Usual ingredients", f.ingredients);
      block("Portion size", f.portion);
      listBlock("What it gives you", f.contributions);
      block("How it helps you", f.benefits);
      block("How it fits your goal", f.goals);
      block("Practical serving sizes", f.servings);
      listBlock("Easy swaps", f.swaps);
      listBlock("Allergens to watch for", f.allergens);
      block("Cultural and regional variations", f.culture);
      listBlock("Good meal combinations", f.combinations);

      var log = h('<button class="btn btn-primary btn-lg mt">Add to today\'s intake</button>');
      log.onclick = function () {
        if (!S.canScanFood()) return toast("Free limit reached — upgrade for unlimited");
        S.addFood({ name: name, kcal: f.kcal, carbs: f.carbs, protein: f.protein,
                    fat: f.fat, fiber: f.fiber, verdict: f.verdict });
        sheet.remove();
        toast("Added to today\'s intake ✓");
        render();
      };
      panel.appendChild(log);

      /* Star it, so the food you eat often is always one tap away. */
      var favBtn = h('<button class="btn btn-ghost mt">★ Add to favourites</button>');
      if (S.isFavourite("foods", name)) favBtn.textContent = "★ In your favourites";
      favBtn.onclick = function () {
        var on = S.toggleFavourite("foods", name);
        favBtn.textContent = on ? "★ In your favourites" : "★ Add to favourites";
        toast(on ? "Saved to your favourites" : "Removed from your favourites");
      };
      panel.appendChild(favBtn);

      $("#fdX", panel).onclick = function () { sheet.remove(); };
      sheet.onclick = function (e) { if (e.target === sheet) sheet.remove(); };
      document.body.appendChild(sheet);
    }

    /* ---------------- a food the member adds themselves ----------------
       Some food is not in our list, or the numbers on the packet are
       different. Add it once and it is yours from then on. */
    function customFoodSheet() {
      var sheet = h('<div class="sheet-bg"><div class="sheet"></div></div>');
      var panel = sheet.firstChild;
      panel.appendChild(h('<div class="sheet-head"><h3>Add your own food</h3>' +
        '<button class="iconbtn" style="margin-left:auto" id="cfX">✕</button></div>'));
      panel.appendChild(h('<p class="sub mb">Use the numbers on the packet. We will work out the rest.</p>'));
      panel.appendChild(h('<div class="field"><label>Name of the food</label><input id="cfName" type="text" placeholder="e.g. Suya skewer"></div>'));
      panel.appendChild(h('<div class="field"><label>How much you ate (portion)</label><input id="cfPortion" type="text" placeholder="e.g. 2 skewers"></div>'));
      panel.appendChild(h('<div class="field"><label>Calories (kcal)</label><input id="cfKcal" type="number" inputmode="numeric" placeholder="420"></div>'));
      panel.appendChild(h('<div class="field"><label>Carbs (g)</label><input id="cfCarbs" type="number" inputmode="decimal" placeholder="40"></div>'));
      panel.appendChild(h('<div class="field"><label>Protein (g)</label><input id="cfProtein" type="number" inputmode="decimal" placeholder="28"></div>'));
      panel.appendChild(h('<div class="field"><label>Fat (g)</label><input id="cfFat" type="number" inputmode="decimal" placeholder="18"></div>'));
      panel.appendChild(h('<div class="field"><label>Fibre (g)</label><input id="cfFiber" type="number" inputmode="decimal" placeholder="4"></div>'));

      var save = h('<button class="btn btn-primary btn-lg mt">Save this food</button>');
      save.onclick = function () {
        var name = ($("#cfName", panel).value || "").trim();
        if (!name) return toast("Give the food a name");
        var kcal = parseFloat($("#cfKcal", panel).value);
        if (!kcal || kcal <= 0) return toast("Enter the calories");
        var carbs = parseFloat($("#cfCarbs", panel).value) || 0;
        var protein = parseFloat($("#cfProtein", panel).value) || 0;
        var fat = parseFloat($("#cfFat", panel).value) || 0;
        var fiber = parseFloat($("#cfFiber", panel).value) || 0;
        var portion = ($("#cfPortion", panel).value || "").trim() || "1 serving";

        /* Work out a simple verdict from the numbers, the same way the
           built-in foods are judged. */
        var verdict = "fine";
        if (protein < 8 && carbs > 45) verdict = "watch";
        if (fiber >= 6 && protein >= 15) verdict = "good";

        D.foods[name] = {
          kcal: Math.round(kcal), carbs: Math.round(carbs), protein: Math.round(protein),
          fat: Math.round(fat), fiber: Math.round(fiber), verdict: verdict,
          portion: portion,
          simple: "A food you added yourself.",
          what: name + ", as you added it, with the numbers from the packet.",
          contributions: ["Carbs " + Math.round(carbs) + "g for energy",
                          "Protein " + Math.round(protein) + "g to repair and build muscle",
                          "Fat " + Math.round(fat) + "g for hormones and fullness",
                          "Fibre " + Math.round(fiber) + "g for digestion"],
          goals: "How it fits your goal depends on the rest of your day and how much of it you eat.",
          servings: "Use the portion you wrote above.",
          swaps: "Wholegrain or higher-fibre versions usually carry more fibre for the same energy.",
          allergens: "Check the packet if you react to any common allergen."
        };
        S.addFood({ name: name, kcal: Math.round(kcal), carbs: Math.round(carbs),
                    protein: Math.round(protein), fat: Math.round(fat),
                    fiber: Math.round(fiber), verdict: verdict });
        sheet.remove();
        toast("Added — it is in your list now");
        render();
      };
      panel.appendChild(save);

      $("#cfX", panel).onclick = function () { sheet.remove(); };
      sheet.onclick = function (e) { if (e.target === sheet) sheet.remove(); };
      document.body.appendChild(sheet);
    }
  });

  /* Body Goals — projection (feature #5) */
  route("future", function () {
    var node = h("<div></div>");
    node.appendChild(h('<p class="sub mb">Pick the physique you\'re training for. Gym Badge builds the plan to get you there.</p>'));
    if (!S.isPremium() && S.projectionsLeft() <= 5) node.appendChild(h('<div class="banner">' + S.projectionsLeft() + ' free projections left today · <a href="#/pricing">upgrade</a></div>'));

    var arch = h('<div class="grid3"></div>');
    D.archetypes.forEach(function (a) {
      var c = h('<div class="opt" style="flex-direction:column;text-align:center;gap:6px;padding:12px 8px"><div class="oi" style="width:40px;height:40px">' + a.icon + "</div><b style=\"font-size:.82rem\">" + esc(a.name) + "</b></div>");
      c.onclick = function () {
        arch.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on"); S.setGoalArch(a.id);
      };
      arch.appendChild(c);
    });
    node.appendChild(arch);

    var preview = h('<div class="ph mt" style="aspect-ratio:3/4;position:relative">' + img(modelImage("projection"), "Your projection") + '<div style="position:absolute;inset:auto 0 0 0;padding:16px;background:linear-gradient(to top,rgba(0,0,0,.6),transparent);color:#fff"><b>Your projection appears here</b><div class="small" style="opacity:.85">Estimates only — not a medical tool.</div></div></div>');
    node.appendChild(preview);

    var fileInp = h('<input type="file" accept="image/*" hidden>');
    var use = h('<button class="btn btn-ghost mt">Use my photo (optional)</button>');
    use.onclick = function () { fileInp.click(); };
    fileInp.onchange = function () {
      var f = this.files && this.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        var im = preview.querySelector("img"); if (im) im.src = rd.result;
        toast("Using your photo for this projection");
      };
      rd.readAsDataURL(f);
    };
    node.appendChild(use); node.appendChild(fileInp);

    var gen = h('<button class="btn btn-primary btn-lg mt">Generate my projection</button>');
    gen.onclick = function () {
      if (!S.goalArch()) return toast("Pick a goal physique first");
      if (!S.canProject()) return toast("Free limit reached — upgrade for unlimited");
      go("projection");
    };
    node.appendChild(gen);
    shell("library", "Body Goals", node, { back: true, backTo: "library" });
  });

  route("projection", function () {
    var arch = D.archetypes[0];
    D.archetypes.forEach(function (a) { if (a.id === S.goalArch()) arch = a; });
    var u = S.user() || {};
    var node = h("<div></div>");
    node.appendChild(h('<div class="ph" style="aspect-ratio:3/4;position:relative">' + img(u.gender === "Female" ? "coach/model-female.jpg" : "coach/model-male.jpg", arch.name) + '<div style="position:absolute;inset:auto 0 0 0;padding:16px;background:linear-gradient(to top,rgba(0,0,0,.65),transparent);color:#fff"><b style="font-size:1.05rem">' + esc(arch.name) + " — you, in ~12 weeks</b></div></div>"));
    node.appendChild(h('<div class="card mt"><h3>Your plan to get there</h3><p class="sub" style="margin-bottom:10px">Personalised from your goal' + (u.weight ? ", weight " + esc(u.weight) + "kg" : "") + (u.height ? ", height " + esc(u.height) + "cm" : "") + '.</p><div class="list">' +
      '<div class="row"><div class="ri">🏋️</div><div class="rm"><b>Training</b><small>4×/week · progressive overload</small></div></div>' +
      '<div class="row"><div class="ri">🍽️</div><div class="rm"><b>Nutrition</b><small>High protein · slight surplus</small></div></div>' +
      '<div class="row"><div class="ri">😴</div><div class="rm"><b>Recovery</b><small>7–9h sleep · 2 rest days</small></div></div>' +
      '<div class="row"><div class="ri">📈</div><div class="rm"><b>Check in</b><small>Reassess in 4 weeks</small></div></div>' +
      "</div></div>"));
    var b = h('<button class="btn btn-primary btn-lg">Save this goal</button>');
    b.onclick = function () { toast("Goal saved to your badge 🎯"); go("progress"); };
    node.appendChild(b);
    node.appendChild(h('<p class="faint small center mt">Not a medical tool. Projections are estimates, not guarantees.</p>'));
    shell("library", "Body Goals", node, { back: true, backTo: "library" });
  });

  /* =======================================================================
     PROGRESS (tab)
  ======================================================================= */
  route("progress", function () {
    var node = h("<div></div>");
    node.appendChild(h('<h2 class="headline" style="margin-bottom:14px">Your <span class="hl">progress</span></h2>'));

    var stats = h('<div class="statgrid"></div>');
    stats.appendChild(h('<div class="stat"><b>' + S.logs().length + '</b><small>Workouts logged</small></div>'));
    stats.appendChild(h('<div class="stat"><b>' + S.streak() + '</b><small>Day streak</small></div>'));
    node.appendChild(stats);

    // Momentum sparkline
    var recent = S.logs().slice(0, 14).reverse();
    if (recent.length > 1) {
      var maxV = Math.max.apply(null, recent.map(function (l) { return l.val; }));
      var pts = recent.map(function (l, i) { return (i / (recent.length - 1)) * 100 + "," + (36 - (l.val / maxV) * 32); }).join(" ");
      node.appendChild(h('<div class="card"><h3>Momentum</h3><svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%;height:64px;margin-top:8px"><polyline points="' + pts + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'));
    }

    if (S.logs().length) {
      node.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">Recent sessions</div>'));
      var hist = h('<div class="list"></div>');

      /* Filter the history down to one movement. */
      var used = {};
      S.logs().forEach(function (l) { used[l.ex] = true; });
      var filter = "";
      if (Object.keys(used).length > 1) {
        var chips = h('<div class="chips mb"></div>');
        var allChip = h('<button class="chip on">Everything</button>');
        allChip.onclick = function () {
          filter = "";
          chips.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
          allChip.classList.add("on");
          paintHist();
        };
        chips.appendChild(allChip);
        Object.keys(used).forEach(function (id) {
          var c = h('<button class="chip">' + esc(exName(id)) + "</button>");
          c.onclick = function () {
            filter = id;
            chips.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
            c.classList.add("on");
            paintHist();
          };
          chips.appendChild(c);
        });
        node.appendChild(chips);
      }

      function paintHist() {
        hist.innerHTML = "";
        var rows = S.logs().filter(function (l) { return !filter || l.ex === filter; }).slice(0, 20);
        rows.forEach(function (l) {
          var row = h('<div class="row"><div class="ri">' + exIcon("count") + '</div><div class="rm"><b>' +
            esc(exName(l.ex)) + " · " + l.val + " " + esc(exUnit(l.ex)) + "</b><small>" + relDay(l.date) +
            (l.edited ? " · edited" : "") + "</small></div></div>");
          var acts = h('<div class="rr"></div>');
          var del = h('<button class="row-del" aria-label="Delete this entry">✕</button>');
          del.onclick = function () {
            S.removeLog(l.id);
            toast("Entry removed");
            render();
          };
          acts.appendChild(del);
          row.querySelector(".rm").after(acts);
          hist.appendChild(row);
        });
        if (!rows.length) {
          hist.appendChild(h('<div class="row"><div class="rm"><b>Nothing here</b><small>No entries for that movement yet.</small></div></div>'));
        }
      }
      paintHist();
      node.appendChild(hist);

      /* How much work went in this week. */
      var vol = S.volumeThisWeek();
      node.appendChild(h('<div class="card mt"><h3>This week</h3>' +
        '<div class="statgrid">' +
        '<div class="stat"><b>' + vol.sets + "</b><small>Sets logged</small></div>" +
        '<div class="stat"><b>' + vol.total + "</b><small>Total volume</small></div>" +
        '<div class="stat"><b>' + S.streak() + "</b><small>Day streak</small></div>" +
        "</div>" +
        '<p class="faint small mt">Total volume is the sum of what you logged. It is a rough measure of effort, not a score.</p></div>'));
    } else {
      node.appendChild(h('<div class="card center"><div style="font-size:2.4rem">📅</div><h3 class="mt">Your workout history will show up here</h3><p class="sub mb">Log your first set to start the timeline.</p><button class="btn btn-primary" id="goWorkout">Go to workout</button></div>'));
    }

    node.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">This week</div>'));
    node.appendChild(progressCard());

    node.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">Nutrition</div>'));
    var tot = { kcal:0, carbs:0, protein:0, fat:0, fiber:0 };
    S.foodLogs().forEach(function (f) { ["kcal","carbs","protein","fat","fiber"].forEach(function (k) { tot[k] += f[k] || 0; }); });
    if (S.foodLogs().length) {
      node.appendChild(h('<div class="card"><h3>Today\'s intake</h3>' +
        macroBar("Calories", tot.kcal, MAXES.kcal) + macroBar("Carbs", tot.carbs, MAXES.carbs) +
        macroBar("Protein", tot.protein, MAXES.protein) + macroBar("Fat", tot.fat, MAXES.fat) +
        macroBar("Fiber", tot.fiber, MAXES.fiber) + "</div>"));
    } else {
      node.appendChild(h('<div class="card"><h3>No meals scanned yet</h3><p class="sub">Scan a meal with My Plate Truth to see your macros.</p></div>'));
    }
    var pt = h('<button class="btn btn-ghost">Open My Plate Truth</button>');
    pt.onclick = function () { go("plate"); };
    node.appendChild(pt);

    shell("progress", "Progress", node);
    setTimeout(function () { var g = $("#goWorkout"); if (g) g.onclick = function () { go("workout"); }; }, 0);
  });

  /* Weekly progress photos (local-first, mirrored when signed in) */
  function progressCard() {
    var card = h('<div class="card"><h3>Weekly photos</h3><p class="sub mb">Add this week\'s photo — it appears the moment you pick it.</p>' +
      '<div class="prog-grid" id="progGrid"></div>' +
      '<button class="btn btn-primary" id="addProg">Add this week\'s photo</button>' +
      '<input type="file" id="progFile" accept="image/*" hidden>' +
      '<div class="faint small mt center" id="progNote"></div></div>');
    var grid = card.querySelector("#progGrid"), fileInp = card.querySelector("#progFile"), note = card.querySelector("#progNote");
    function photos() { return S.get().progress || []; }
    function paint() {
      var list = photos();
      grid.innerHTML = list.length ? "" : '<div class="faint small" style="grid-column:1/-1;text-align:center;padding:8px 0">No photos yet — your first one starts the timeline.</div>';
      list.forEach(function (p) {
        var cell = h('<figure class="prog-cell"><img alt="' + esc(p.week || "Progress photo") + '" src="' + p.dataUrl + '"><figcaption>' + esc(p.week || "") + '<button class="prog-del" type="button" aria-label="Delete">×</button></figcaption></figure>');
        cell.querySelector(".prog-del").onclick = function () {
          GBDialog.confirm("Delete " + (p.week || "this photo") + "?", {
            title: "Delete this photo",
            okLabel: "Delete",
            danger: true
          }).then(function (yes) {
            if (!yes) return;
            S.set({ progress: photos().filter(function (x) { return x.id !== p.id; }) });
            paint();
          });
        };
        grid.appendChild(cell);
      });
      note.textContent = list.length ? list.length + " photo" + (list.length > 1 ? "s" : "") + " · newest first" : "";
    }
    card.querySelector("#addProg").onclick = function () { fileInp.click(); };
    fileInp.onchange = function () {
      var f = this.files && this.files[0]; this.value = "";
      if (!f) return;
      if (!/^image\//.test(f.type)) return toast("Please choose an image file");
      var reader = new FileReader();
      reader.onload = function () {
        var im = new Image();
        im.onload = function () {
          var max = 720, sc = Math.min(1, max / Math.max(im.width, im.height));
          var c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(im.width * sc)); c.height = Math.max(1, Math.round(im.height * sc));
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          var dataUrl; try { dataUrl = c.toDataURL("image/jpeg", 0.82); } catch (e) { return toast("Couldn't read that image"); }
          var entry = { id: "p" + Date.now(), at: new Date().toISOString(), week: "Week " + (photos().length + 1), dataUrl: dataUrl };
          S.set({ progress: [entry].concat(photos()) }); paint(); toast(entry.week + " added ✓");
        };
        im.onerror = function () { toast("That file isn't a readable image"); };
        im.src = reader.result;
      };
      reader.readAsDataURL(f);
    };
    paint();
    return card;
  }

  /* =======================================================================
     PROFILE (tab) — Badge ID + Find a Gym (feature #6)
  ======================================================================= */
  route("profile", function () {
    var u = S.user() || {};
    var node = h("<div></div>");

    var avatarSrc = u.avatar || "avatar.jpg";
    node.appendChild(h('<div class="center"><div class="avatar">' + img(avatarSrc, "You") + '</div><h3 style="font-size:1.1rem">' + esc(u.name || "Athlete") + '</h3><div class="sub">@' + esc(u.username || "user") + ' · ' + esc(u.type || "individual") + '</div><div class="mt"><span class="pill ' + (S.isPremium() ? "volt" : "") + '">' + esc(String(S.plan()).toUpperCase()) + "</span></div></div>"));

    // Now playing — visible to the community
    if (u.music && u.music.title) {
      var np = h('<div class="now-playing mt" style="margin-left:auto;margin-right:auto;max-width:320px">' +
        '<div class="np-art">' + (u.music.art ? '<img src="' + esc(u.music.art) + '" alt="">' : "🎵") + "</div>" +
        '<div class="np-tx"><b>' + esc(u.music.title) + "</b><small>" + esc(u.music.artist || "") + "</small></div>" +
        '<span class="pill">' + esc(u.music.provider || "music") + "</span></div>");
      node.appendChild(np);
    }

    // Digital Badge ID
    var code = badgeCode(u.username || u.name || "athlete");
    node.appendChild(h('<div class="card center mt"><div class="badge-mark"><img src="/assets/img/logo.png" alt="Gym Badge"></div><h3 style="font-size:1.1rem">Your Badge ID</h3><div class="sub">Scan at any GymBadge partner gym</div><div class="qr">' + qrSvg(code) + '</div><div style="margin-top:10px"><span class="mono-code">' + esc(code) + '</span></div><button class="btn btn-ghost btn-sm" id="copyBadge" style="margin-top:12px">Copy code</button></div>'));

    node.appendChild(h('<div class="list mt">' +
      '<div class="row"><div class="ri">🎯</div><div class="rm"><b>Goal</b><small>' + esc(u.goal || "Not set") + '</small></div></div>' +
      '<div class="row"><div class="ri">⚖️</div><div class="rm"><b>Weight</b><small>' + esc(u.weight ? u.weight + " kg" : "Not set") + '</small></div></div>' +
      '<div class="row"><div class="ri">📏</div><div class="rm"><b>Height</b><small>' + esc(u.height ? u.height + " cm" : "Not set") + '</small></div></div>' +
      '<div class="row"><div class="ri">🔥</div><div class="rm"><b>Streak</b><small>' + S.streak() + ' days</small></div></div></div>'));

    /* ---- Your Gym Badge Journey: tenure from the account creation date ---- */
    var tenure = window.GBTrainers ? window.GBTrainers.tenure() : null;
    if (tenure) {
      var L = window.GBI18n;
      var fmt = function (v) { return L ? L.fmtNumber(v) : String(v); };
      var journey = h('<div class="card mt">' +
        '<div class="eyebrow" style="margin-bottom:10px">Your GymBadge Journey</div>' +
        '<div class="journey-grid">' +
          '<div class="jn"><b>' + fmt(tenure.days) + "</b><small>days</small></div>" +
          '<div class="jn"><b>' + fmt(tenure.weeks) + "</b><small>weeks</small></div>" +
          '<div class="jn"><b>' + fmt(tenure.months) + "</b><small>months</small></div>" +
          '<div class="jn"><b>' + fmt(tenure.years) + "</b><small>years</small></div>" +
        "</div>" +
        '<p class="faint small" style="margin:12px 0 0">Member since ' +
        (L ? L.fmtDate(tenure.joined, { year: "numeric", month: "long", day: "numeric" }) : tenure.joined.toDateString()) +
        ". This updates every time you open the app.</p></div>");
      node.appendChild(journey);
    }

    /* ---- My Trainer: who you train with, what is next, what came before ---- */
    node.appendChild(h('<div class="eyebrow" style="margin:22px 0 10px">My Trainer</div>'));
    if (window.GBTrainers) {
      node.appendChild(window.GBTrainers.yourTrainerSection());
      window.GBTrainers.setProfileRerender(function () { render(); });
    } else {
      node.appendChild(h('<div class="list"><div class="row"><div class="rm"><b>My Trainer</b><small>Book a coach to see your sessions here</small></div></div></div>'));
    }
    var findT = h('<button class="btn btn-ghost mt">Browse Trainers</button>');
    findT.onclick = function () { go("trainers"); };
    node.appendChild(findT);

    var list = h('<div class="list mt"></div>');
    list.appendChild(rowBtn("✏️", "My Profile", "Name, goal, weight, height", function () { go("editprofile"); }));
    list.appendChild(rowBtn("📍", "Find a Gym", "Nearest gyms & slot booking", function () { go("find"); }));
    list.appendChild(rowBtn("⚙️", "Settings", "Account, security, language, music", function () { go("settings"); }));
    list.appendChild(rowBtn("🔒", "Security", "Password, email recovery, devices", function () { go("settings"); }));
    list.appendChild(rowBtn("❓", "Help & support", "FAQ, contact the team", function () { go("support"); }));
    list.appendChild(rowBtn("ℹ️", "About Gym Badge", "Version, terms, privacy", function () { go("support"); }));
    node.appendChild(list);

    // Theme — three dark modes, no light.
    var themeCard = h('<div class="card mt"><h3>Appearance</h3><p class="sub mb">Ember, Midnight or Dark. Every one of them is built for the gym.</p><div class="chips" id="themeChips"></div></div>');
    node.appendChild(themeCard);
    var chipHost = themeCard.querySelector("#themeChips");
    var modes = window.GBTheme ? window.GBTheme.modes : ["ember", "midnight", "dark"];
    modes.forEach(function (m) {
      var c = h('<button class="chip">' + (window.GBTheme ? window.GBTheme.label(m) : m) + "</button>");
      if (window.GBTheme && window.GBTheme.get() === m) c.classList.add("on");
      c.onclick = function () {
        if (window.GBTheme) window.GBTheme.set(m);
        chipHost.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
      };
      chipHost.appendChild(c);
    });

    var up = h('<button class="btn btn-primary mt">Manage plan</button>');
    up.onclick = function () { go("pricing"); };
    node.appendChild(up);
    var out = h('<button class="btn btn-danger mt">Log out</button>');
    out.onclick = function () { S.set({ user: null }); go("welcome"); };
    node.appendChild(out);

    /* The foot of the app: what is coming, and the version line. */
    node.appendChild(soonBlock());
    node.appendChild(h('<p class="faint small center mt">Gym Badge v2 · <a href="#" id="resetAll">Reset demo data</a></p>'));

    shell("profile", "Profile", node);
    setTimeout(function () {
      var cb = $("#copyBadge");
      if (cb) cb.onclick = function () {
        var done = function () { cb.textContent = "Copied ✓"; setTimeout(function () { cb.textContent = "Copy code"; }, 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done); else done();
      };
      var r = $("#resetAll");
      if (r) r.onclick = function (e) { e.preventDefault(); S.reset(); go("welcome"); };
    }, 0);
  });

  route("editprofile", function () {
    var u = S.user() || {};
    var node = h("<div></div>");
    node.appendChild(h('<div class="field"><label>Name</label><input id="pName" value="' + esc(u.name || "") + '" placeholder="Your name"></div>'));
    node.appendChild(h('<div class="field"><label>Username</label><input id="pUser" value="' + esc(u.username || "") + '" placeholder="username"></div>'));
    node.appendChild(h('<div class="grid2">' +
      '<div class="field"><label>Weight (kg)</label><input id="pWeight" type="number" inputmode="decimal" value="' + esc(u.weight || "") + '"></div>' +
      '<div class="field"><label>Height (cm)</label><input id="pHeight" type="number" inputmode="decimal" value="' + esc(u.height || "") + '"></div></div>'));
    node.appendChild(h('<div class="field"><label>Age</label><input id="pAge" type="number" inputmode="numeric" value="' + esc(u.age || "") + '"></div>'));
    node.appendChild(h('<div class="field"><label>Phone number</label><input id="pPhone" type="tel" inputmode="tel" placeholder="' +
      (window.GBCountries ? "e.g. " + GBCountries.formatPhone("8012345678", u.countryCode || "NG") : "+234 801 234 5678") +
      '" value="' + esc(u.phone || "") + '"><span class="hint">Used for booking notifications only. Never shown publicly.</span></div>'));
    var gf = h('<div class="field"><label>Goal</label><select id="pGoal"></select></div>');
    node.appendChild(gf);
    D.goals.forEach(function (g) { var o = document.createElement("option"); o.textContent = g; if (g === u.goal) o.selected = true; $("#pGoal", gf).appendChild(o); });
    var gf2 = h('<div class="field"><label>Country</label><div id="pCountryPicker"></div>' +
      '<span class="hint" id="pCountryDial"></span></div>');
    node.appendChild(gf2);
    var countryState = { code: u.countryCode || "NG", name: u.country || "Nigeria" };
    if (window.GBCountries) {
      var found = GBCountries.find(countryState.code);
      if (found) { countryState = { code: found.code, name: found.name }; }
      $("#pCountryPicker", gf2).appendChild(window.GBCountries.picker({
        value: countryState.code,
        onChange: function (c) {
          countryState = { code: c.code, name: c.name };
          var d = $("#pCountryDial", gf2);
          if (d) d.textContent = "International dialling code " + (c.dial || "not listed");
        }
      }));
      var dialEl = $("#pCountryDial", gf2);
      if (dialEl) dialEl.textContent = "International dialling code " + (found ? found.dial : "+234");
    }
    var save = h('<button class="btn btn-primary btn-lg">Save changes</button>');
    save.onclick = function () {
      var nu = Object.assign({}, u, {
        name: $("#pName", node).value.trim() || u.name || "Athlete",
        username: $("#pUser", node).value.trim() || u.username || "user",
        weight: parseFloat($("#pWeight", node).value) || u.weight,
        height: parseFloat($("#pHeight", node).value) || u.height,
        age: parseFloat($("#pAge", node).value) || u.age,
        goal: $("#pGoal", node).value,
        country: countryState.name,
        countryCode: countryState.code,
        phone: $("#pPhone", node) ? $("#pPhone", node).value.trim() : (u.phone || "")
      });
      S.setUser(nu); toast("Saved ✓"); go("profile");
    };
    node.appendChild(save);
    shell("profile", "My Profile", node, { back: true, backTo: "profile" });
  });

  route("prefs", function () {
    var node = h("<div></div>");
    var prefs = S.get().prefs || {};
    var ROWS = [
      { k:"metric",   label:"Metric (kg / cm)",  on:"On",  off:"Off" },
      { k:"remind",   label:"Training reminders", on:"7:00 AM", off:"Off" },
      { k:"haptics",  label:"Sound &amp; haptics", on:"On", off:"Off" },
      { k:"autoplay", label:"Autoplay exercise videos", on:"WiFi only", off:"Off" }
    ];
    var list = h('<div class="list"></div>');
    ROWS.forEach(function (r) {
      var on = prefs[r.k] !== false;
      var row = h('<button class="row"><div class="rm"><b>' + r.label + '</b></div><div class="rr"><span class="pill ' + (on ? "ok" : "") + '">' + (on ? r.on : r.off) + "</span></div></button>");
      row.onclick = function () {
        var nextVal = !(prefs[r.k] !== false);
        prefs[r.k] = nextVal; S.set({ prefs: prefs });
        toast(r.label.replace(/&amp;/g, "&") + (nextVal ? " on" : " off"));
        render();
      };
      list.appendChild(row);
    });
    node.appendChild(list);
    node.appendChild(h('<p class="faint small mt center">Tap a row to switch it. Preferences sync with your badge automatically.</p>'));

    // Full settings (account, security, language, music, privacy)
    var more = h('<button class="btn btn-primary btn-lg mt">Open all settings</button>');
    more.onclick = function () { go("settings"); };
    node.appendChild(more);
    shell("profile", "Preferences", node, { back: true, backTo: "profile" });
  });

  /* =======================================================================
     SETTINGS — account, security, language, music, privacy, support
   ======================================================================= */
  route("settings", function () {
    if (window.GBAppSettings) {
      window.GBAppSettings.render();
    } else {
      // settings.js may still be loading — try again on the next tick.
      setTimeout(function () {
        if (window.GBAppSettings) window.GBAppSettings.render();
        else shell("profile", "Settings", h('<p class="sub">Settings are unavailable.</p>'), { back: true, backTo: "profile" });
      }, 60);
    }
  });

  /* ---- music OAuth callback (also handles a direct visit, not just popup) ---- */
  route("music-callback", function () {
    var node = h("<div></div>");
    node.appendChild(h('<div class="center" style="padding:30px 10px"><div style="font-size:2.6rem">🎧</div>' +
      '<h3 class="mt">Finishing sign in…</h3><p class="sub mt" id="mcMsg">Talking to your music service.</p></div>'));
    shell("profile", "Music", node, { back: true, backTo: "profile" });

    setTimeout(function () {
      var M = window.GBMusic;
      if (!M) return;
      var params = M.parseCallback(location.href);
      var provider = params.provider;
      if (!provider) {
        try {
          var pk = JSON.parse(localStorage.getItem("gb_music_pkce") || "null");
          provider = pk && pk.provider;
        } catch (e) {}
      }
      if (params.error) {
        $("#mcMsg", node).textContent = params.error_description || params.error || "Sign in was cancelled.";
        return;
      }
      if (!params.code) {
        $("#mcMsg", node).textContent = "No authorisation code came back. Try again.";
        return;
      }
      M.exchange(provider, params.code).then(function (tok) {
        M.saveMusic({
          provider: provider,
          token: tok.access_token,
          refreshToken: tok.refresh_token || null,
          expiresAt: tok.expires_in ? Date.now() + tok.expires_in * 1000 : 0
        });
        $("#mcMsg", node).textContent = "Connected. Pulling your track…";
        return M.refreshNowPlaying();
      }).then(function () {
        toast("Music connected ✓");
        go("settings");
      }).catch(function (err) {
        $("#mcMsg", node).textContent = (err && err.message) || "Could not finish connecting.";
      });
    }, 250);
  });

  route("support", function () {
    var node = h("<div></div>");
    var list = h('<div class="list"></div>');
    [["How do I scan equipment?", "Tap your phone on the NFC tag or scan the QR by the machine."],
     ["What is My Workout Log?", "Gym Badge remembers your last number and sets the next target to beat."],
     ["How do projections work?", "Estimates from your goal and body data — never a guarantee."],
     ["Delete my data", "You can export or delete everything from My Profile."]].forEach(function (f) {
      list.appendChild(h('<div class="row" style="flex-direction:column;align-items:flex-start;gap:4px"><b>' + f[0] + '</b><small>' + f[1] + "</small></div>"));
    });
    node.appendChild(list);
    var mail = h('<a class="btn btn-primary mt" href="mailto:hello@gymbadge.app" style="text-decoration:none">Email support</a>');
    node.appendChild(mail);
    shell("profile", "Help & support", node, { back: true, backTo: "profile" });
  });

  /* =======================================================================
     YOUR FLOOR — gym locator (feature #6 detail)
  ======================================================================= */
  route("find", function () {
    var node = h("<div></div>");
    var map = h('<div class="map"><div class="me" style="left:48%;top:46%">📍</div></div>');
    D.gyms.forEach(function (g) { map.appendChild(h('<div class="pin" style="left:' + g.x + "%;top:" + g.y + '%">🏋️</div>')); });
    node.appendChild(map);
    node.appendChild(h('<p class="sub mb">Gyms near you · <b class="hl">you</b></p>'));

    var list = h('<div class="list"></div>');
    D.gyms.slice().sort(function (a, b) { return a.dist - b.dist; }).forEach(function (g) {
      /* A real photograph of the gym, so you know what you are walking into. */
      var face = g.photo
        ? '<span class="gym-thumb"><img alt="" src="/app/assets/img/' + esc(g.photo) + '" decoding="async"></span>'
        : "📍";
      var r = h('<button class="row"><div class="ri">' + face + '</div><div class="rm"><b>' + esc(g.name) + "</b><small>" + g.dist + " km · " + esc(g.tags.join(" · ")) + '</small></div><div class="rr"><span class="pill ' + (g.open ? "ok" : "bad") + '">' + (g.open ? "Open" : "Closed") + "</span></div></button>");
      r.onclick = function () { openSlots(g); };
      list.appendChild(r);
    });
    node.appendChild(list);

    var bk = S.bookings();
    if (bk.length) {
      node.appendChild(h('<div class="eyebrow" style="margin:18px 0 10px">Your bookings</div>'));
      var bl = h('<div class="list"></div>');
      bk.forEach(function (b) {
        var rr = h('<div class="row"><div class="ri">📅</div><div class="rm"><b>' + esc(b.gym) + '</b><small>' + esc(b.slot) + " · " + relDay(b.date) + '</small></div><div class="rr"><button class="btn btn-ghost btn-sm">Cancel</button></div></div>');
        rr.querySelector("button").onclick = function () { S.cancelBooking(b.id); toast("Booking cancelled"); render(); };
        bl.appendChild(rr);
      });
      node.appendChild(bl);
    }
    shell("profile", "Find a Gym", node, { back: true, backTo: "profile" });
  });

  function openSlots(g) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Book · ' + esc(g.name) + '</h3><button class="iconbtn" style="margin-left:auto" id="slotX">✕</button></div>'));
    panel.appendChild(h('<p class="sub mb">Pick a time — walk in knowing the floor is ready for you.</p>'));
    var chips = h('<div class="chips"></div>');
    var chosen = null;
    ["06:00", "08:00", "10:00", "12:00", "17:00", "19:00", "21:00"].forEach(function (s) {
      var c = h('<button class="chip">' + s + "</button>");
      c.onclick = function () { chips.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); }); c.classList.add("on"); chosen = s; };
      chips.appendChild(c);
    });
    panel.appendChild(chips);
    var book = h('<button class="btn btn-primary mt">Confirm booking</button>');
    book.onclick = function () {
      if (!chosen) return toast("Pick a time first");
      S.addBooking({ gym: g.name, slot: chosen, date: S.today() });
      overlay.remove(); toast("Booked ✓ " + g.name + " · today " + chosen); render();
    };
    panel.appendChild(book);
    $("#slotX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* =======================================================================
     GYMBADGE PRO — membership (not a storefront)
  ======================================================================= */
  route("pricing", function () {
    var node = h("<div></div>");
    var cur = S.get().currency || "NGN";
    node.appendChild(h('<div class="center"><span class="pro-badge">GYMBADGE PRO</span><h2 class="headline mt" style="margin-top:12px">Workouts made <span class="hl">simple</span></h2><p class="sub">Unlock the full engine — My Workout Log, Gym Equipment, My Plate Truth and Body Goals.</p></div>'));
    node.appendChild(h('<div class="card center mt"><div style="font-size:1.4rem;letter-spacing:.1em">★★★★★</div><p class="sub">Loved by 48k+ active members</p></div>'));
    node.appendChild(h('<ul class="feat card"><li><i>✓</i> My Workout Log · unlimited logging and history</li><li><i>✓</i> Gym Equipment · live NFC equipment status</li><li><i>✓</i> My Plate Truth · unlimited meal scans</li><li><i>✓</i> Body Goals · unlimited projections</li></ul>'));

    // Currency
    var curBar = h('<div class="field"><label>Show amounts in</label><select id="curSel"></select></div>');
    ["NGN","USD","EUR","GBP","GHS","KES","ZAR","INR","AED","JPY","BRL","MXN"].forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; if (c === cur) o.selected = true;
      $("#curSel", curBar).appendChild(o);
    });
    node.appendChild(curBar);

    var yearly = 24500, monthly = 5430;
    var planHost = h('<div></div>');
    [["yearly", "Yearly Plan", yearly, true], ["monthly", "Monthly", monthly, false]].forEach(function (pl) {
      var price = P.fmt(cur, P.ngnTo(cur, pl[2]));
      var card = h('<div class="plan' + (pl[3] ? " best" : "") + '">' + (pl[3] ? '<span class="besttag">BEST VALUE</span>' : "") +
        '<div class="prow"><span class="pname">' + pl[1] + '</span><span class="pprice">' + price + '</span></div>' +
        '<div class="permo">' + (pl[3] ? "Only " + P.fmt(cur, P.ngnTo(cur, Math.round(pl[2] / 12))) + "/mo" : "Billed monthly") + "</div>" +
        (pl[3] ? '<span class="trial">7 day free trial</span>' : "") + "</div>");
      card.onclick = function () { openUpgrade({ id: pl[0], name: pl[1], ngn: pl[2] }, cur); };
      planHost.appendChild(card);
    });
    node.appendChild(planHost);

    var start = h('<button class="btn btn-primary btn-lg mt">Start my free trial</button>');
    start.onclick = function () { openUpgrade({ id: "yearly", name: "Yearly Plan", ngn: yearly }, cur); };
    node.appendChild(start);
    node.appendChild(h('<p class="faint small center mt">Terms of use · Privacy policy · Cancel anytime</p>'));

    shell("profile", "GymBadge Pro", node, { back: true, backTo: "profile" });
    setTimeout(function () { var c = $("#curSel", node); if (c) c.onchange = function () { S.set({ currency: this.value }); render(); }; }, 0);
  });

  function openUpgrade(plan, cur) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Upgrade · ' + esc(plan.name) + '</h3><button class="iconbtn" style="margin-left:auto" id="closeX">✕</button></div>'));
    panel.appendChild(h('<div class="card"><div class="sub">Membership</div><div style="font-size:1.5rem;font-weight:700;color:var(--accent)">' + P.fmt(cur, P.ngnTo(cur, plan.ngn)) + '<span class="sub" style="font-size:.88rem">/mo</span></div><div class="faint small">≈ ' + P.fmt("NGN", plan.ngn) + " billed in NGN</div></div>"));
    var grid = h('<div class="paygrid"></div>');
    var chosen = null;
    P.RAILS.forEach(function (r) {
      var row = h('<div class="pay"><div class="pi">' + r.icon + '</div><div class="pm"><b>' + esc(r.name) + "</b><small>" + esc(r.provider) + '</small></div><div class="tick">✓</div></div>');
      row.onclick = function () { grid.querySelectorAll(".pay").forEach(function (x) { x.classList.remove("on"); }); row.classList.add("on"); chosen = r; };
      grid.appendChild(row);
    });
    panel.appendChild(grid);
    var pay = h('<button class="btn btn-primary btn-lg mt">Confirm upgrade</button>');
    pay.onclick = function () {
      if (!chosen) return toast("Choose how you want to pay");
      pay.textContent = "Activating…";
      P.upgrade(chosen.id, plan.ngn, cur).then(function (res) {
        if (res.ok) {
          S.setPlan("premium");
          panel.innerHTML = '<div class="center" style="padding:26px 10px"><div style="font-size:3rem">🎉</div><h3 class="mt">You\'re in!</h3><p class="sub mt">' + esc(plan.name) + " activated" + (res.demo ? " (demo mode — no real charge)" : "") + '</p><div class="faint small mt">' + esc(res.ref || "") + '</div><button class="btn btn-primary mt" id="doneBtn">Start training</button></div>';
          $("#doneBtn", panel).onclick = function () { overlay.remove(); go("workout"); };
        } else { pay.textContent = "Confirm upgrade"; toast("Could not activate — try again"); }
      });
    };
    panel.appendChild(pay);
    if (P.DEMO) panel.appendChild(h('<p class="faint small center mt">Demo mode: no real charge.</p>'));
    $("#closeX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    var splash = document.getElementById("splash");
    setTimeout(function () { if (splash) splash.classList.add("hide"); }, 650);
    if (!location.hash) location.hash = S.user() ? "#/workout" : "#/welcome";
    render();
    if (window.GBChat) {
      window.GBChat.mount();
      // Repaint the assistant when the member changes language.
      window.addEventListener("lang:change", function () {
        if (window.GBChat) window.GBChat.mount();
      });
    }
  }
  boot();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/app/sw.js").catch(function () {}); });
  }
})();
