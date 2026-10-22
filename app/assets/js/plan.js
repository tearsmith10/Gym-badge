/* ==========================================================================
   GYM BADGE — My Routine

   The plan is the member's own week, not a fixed two day template. It is
   organised by day, week, month or a longer block, and the member can add
   days, add exercises, edit them, remove them, and mark what they actually
   completed.

   Two kinds of exercise live here:
     • library exercises  — picked from the shared catalogue
     • personal exercises — created by the member for their own plan

   If a member wants their exercise to appear for everyone, they submit it
   for review. It is NOT published automatically. Submissions sit in a
   moderation queue until an administrator approves them.
   ========================================================================== */
(function (global) {
  "use strict";

  var D = window.GBData, S = window.GBStore;

  var h = window.GBUI.h, esc = window.GBUI.esc, $ = window.GBUI.$;
  var toast = window.GBUI.toast;
  function today() { return S.today(); }
  function dateKey(d) {
    var x = d instanceof Date ? d : new Date(d);
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }

  /* ---------------- plan storage ----------------
     A plan is { days: [ { id, name, date, items: [ {ex, sets, reps, note, done} ] } ] } */
  function plan() {
    var p = S.routine();
    if (!p || !p.days || !p.days.length) p = null;
    if (!p) {
      p = { days: defaultDays(), view: "week" };
      S.setRoutine(p);
    }
    return p;
  }

  /* A real starting week, so nobody opens an empty screen. It is the
     beginner Overall Fitness program: two days of full body work, plus two
     lighter days for conditioning and mobility. */
  function defaultDays() {
    var base = new Date();
    var plan = window.GBPrograms ? window.GBPrograms.byId("overall") : null;
    var days = [];
    if (plan) {
      plan.split.forEach(function (d, i) {
        var when = new Date(base.getTime() + i * 86400000);
        days.push({
          id: "d" + i,
          name: d.name,
          date: dateKey(when),
          items: d.items.map(function (it) {
            return { ex: it.ex, sets: it.sets, reps: it.reps, rest: it.rest, note: "", done: false };
          })
        });
      });
      return days;
    }
    var names = ["Upper body", "Lower body", "Conditioning", "Mobility"];
    for (var i = 0; i < 4; i++) {
      var d = new Date(base.getTime() + i * 86400000);
      days.push({ id: "d" + i, name: names[i], date: dateKey(d), items: [] });
    }
    return days;
  }

  function savePlan(p) { S.setRoutine(p); }

  function dayById(p, id) {
    for (var i = 0; i < p.days.length; i++) if (p.days[i].id === id) return p.days[i];
    return null;
  }

  function exById(id) {
    var all = D.exercises.concat(S.myExercises());
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* ---------------- screen ----------------
     The screen is built by buildScreen and rebuilt by render, so every
     control can go back to the top and redraw the plan. */
  function screen(shell, go) {
    function render() { buildScreen(shell, go, render); }
    render();
  }

  function buildScreen(shell, go, render) {
    var p = plan();
    var node = h("<div></div>");

    /* View switch: day / week / month / block */
    var viewBar = h('<div class="chips mb"></div>');
    [["day", "Day"], ["week", "Week"], ["month", "Month"], ["block", "12 weeks"]].forEach(function (v) {
      var b = h('<button class="chip' + (p.view === v[0] ? " on" : "") + '">' + v[1] + "</button>");
      b.onclick = function () { p.view = v[0]; savePlan(p); render(); };
      viewBar.appendChild(b);
    });
    node.appendChild(viewBar);

    /* The days in scope depend on the view. */
    var scope = scopeDays(p);
    var dayBar = h('<div class="days"></div>');
    scope.forEach(function (d) {
      var b = h('<button class="daypill' + (d.id === (p.currentDay || (scope[0] && scope[0].id)) ? " on" : "") + '">' +
        esc(d.name) + "</button>");
      b.onclick = function () { p.currentDay = d.id; savePlan(p); render(); };
      dayBar.appendChild(b);
    });
    var addDay = h('<button class="daypill" style="border-style:dashed">+ Day</button>');
    addDay.onclick = function () {
      GBDialog.prompt("Give this training day a name, so you recognise it on your plan.", "Session " + (p.days.length + 1), {
        title: "Add a training day",
        okLabel: "Add day"
      }).then(function (name) {
        if (!name) return;
        var d = new Date();
        d.setDate(d.getDate() + p.days.length);
        p.days.push({ id: "d" + Date.now().toString(36), name: name, date: dateKey(d), items: [] });
        p.currentDay = p.days[p.days.length - 1].id;
        savePlan(p);
        toast("Day added");
        render();
      });
    };
    dayBar.appendChild(addDay);
    node.appendChild(dayBar);

    var current = dayById(p, p.currentDay) || scope[0];
    if (!current) { current = p.days[0]; p.currentDay = current.id; savePlan(p); }

    if (!current) {
      node.appendChild(h('<p class="sub">No training days yet. Add one to start your plan.</p>'));
      shell("workout", "My Routine", node);
      return;
    }

    node.appendChild(h('<div class="sub mb">' + esc(current.name) + " · " + esc(current.date) + "</div>"));

    /* Manage the day: rename it, copy it, or take it off the plan. */
    var dayTools = h('<div class="rr" style="gap:8px;margin:-6px 0 10px"></div>');
    var rename = h('<button class="btn btn-ghost btn-sm">Rename day</button>');
    rename.onclick = function () {
      GBDialog.prompt("What do you want to call this training day?", current.name, {
        title: "Rename this day",
        okLabel: "Save name"
      }).then(function (name) {
        if (!name) return;
        current.name = name;
        savePlan(p);
        toast("Day renamed");
        render();
      });
    };
    dayTools.appendChild(rename);

    var copy = h('<button class="btn btn-ghost btn-sm">Copy day</button>');
    copy.onclick = function () {
      var d = new Date();
      d.setDate(d.getDate() + p.days.length);
      var copyDay = {
        id: "d" + Date.now().toString(36),
        name: current.name,
        date: dateKey(d),
        note: current.note || "",
        items: current.items.map(function (it) {
          return { ex: it.ex, sets: it.sets, reps: it.reps, rest: it.rest, note: it.note, done: false };
        })
      };
      p.days.push(copyDay);
      p.currentDay = copyDay.id;
      savePlan(p);
      toast("Day copied — the exercises are unmarked");
      render();
    };
    dayTools.appendChild(copy);

    if (p.days.length > 1) {
      var removeDay = h('<button class="btn btn-ghost btn-sm">Delete day</button>');
      removeDay.onclick = function () {
        GBDialog.confirm("Take “" + current.name + "” off your routine?", {
          title: "Delete this day",
          okLabel: "Delete day",
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          p.days = p.days.filter(function (d) { return d.id !== current.id; });
          p.currentDay = p.days[0] && p.days[0].id;
          savePlan(p);
          toast("Day deleted");
          render();
        });
      };
      dayTools.appendChild(removeDay);
    }
    node.appendChild(dayTools);

    /* Items */
    var list = h('<div class="list"></div>');
    if (!current.items.length) {
      list.appendChild(h('<div class="row" style="flex-direction:column;align-items:flex-start;gap:4px">' +
        "<b>Nothing on this day yet</b><small>Add an exercise from the library, or build a custom one.</small></div>"));
    }
    current.items.forEach(function (it, idx) {
      var ex = exById(it.ex);
      var name = ex ? ex.name : it.ex;
      /* A real photograph of the movement, with a tick once it is done. */
      var first = ex && (ex.gallery || [])[0];
      var icon = first
        ? '<span class="ex-thumb' + (it.done ? " done" : "") + '"><img alt="" src="/app/assets/img/ex/thumb/' +
          esc(first.replace(/^ex\//, "")) + '" decoding="async">' +
          (it.done ? '<i class="tick">✓</i>' : "") + "</span>"
        : (it.done ? "✅" : "▫️");
      var row = h('<div class="row"><div class="ri">' + icon + "</div>" +
        '<div class="rm"><b>' + esc(name) + "</b><small>" +
        esc([it.sets, it.reps, it.rest ? it.rest + " rest" : "", it.note].filter(Boolean).join(" · ")) +
        "</small></div></div>");
      var acts = h('<div class="rr"></div>');
      var done = h('<button class="btn btn-ghost btn-sm">' + (it.done ? "Done" : "Mark done") + "</button>");
      done.onclick = function () {
        it.done = !it.done;
        savePlan(p);
        toast(it.done ? "Logged ✓" : "Moved back to your plan");
        render();
      };
      var edit = h('<button class="row-del" aria-label="Edit">✎</button>');
      edit.onclick = function () { editItem(p, current, idx, render); };
      var del = h('<button class="row-del" aria-label="Remove">✕</button>');
      del.onclick = function () {
        GBDialog.confirm("Take " + name + " off " + current.name + "?", {
          title: "Remove this exercise",
          okLabel: "Remove",
          danger: true
        }).then(function (yes) {
          if (!yes) return;
          current.items.splice(idx, 1);
          savePlan(p);
          toast("Removed");
          render();
        });
      };
      acts.appendChild(done);
      acts.appendChild(edit);
      /* Move it earlier or later in the day. Order matters in a session. */
      if (current.items.length > 1) {
        var up = h('<button class="row-del" aria-label="Move earlier">↑</button>');
        up.onclick = function () {
          if (idx === 0) return;
          var moved = current.items.splice(idx, 1)[0];
          current.items.splice(idx - 1, 0, moved);
          savePlan(p);
          render();
        };
        var down = h('<button class="row-del" aria-label="Move later">↓</button>');
        down.onclick = function () {
          if (idx === current.items.length - 1) return;
          var moved = current.items.splice(idx, 1)[0];
          current.items.splice(idx + 1, 0, moved);
          savePlan(p);
          render();
        };
        acts.appendChild(up);
        acts.appendChild(down);
      }
      acts.appendChild(del);
      row.querySelector(".rm").after(acts);
      list.appendChild(row);
    });
    node.appendChild(list);

    /* A note for the whole day, for the things you want to remember. */
    var noteWrap = h('<div class="card mt"><h3>Note for this day</h3>' +
      '<textarea id="dayNote" rows="2" placeholder="Warming up on the bike first, or heavy legs tomorrow…"></textarea>' +
      '<button class="btn btn-ghost btn-sm mt" id="dayNoteSave">Save note</button></div>');
    node.appendChild(noteWrap);
    setTimeout(function () {
      var ta = $("#dayNote", node);
      if (!ta) return;
      ta.value = current.note || "";
      $("#dayNoteSave", node).onclick = function () {
        current.note = ta.value.trim();
        savePlan(p);
        toast("Note saved");
        render();
      };
    }, 0);

    /* Add exercise */
    var add = h('<button class="btn btn-primary mt">+ Add Exercise</button>');
    add.onclick = function () { addExerciseSheet(p, current, render); };
    node.appendChild(add);

    var sub = h('<button class="btn btn-ghost mt">Submit an exercise to the shared library</button>');
    sub.onclick = function () { submitSheet(render); };
    node.appendChild(sub);

    /* What the member has sent for review, and where it has got to. */
    var sent = S.submissions();
    if (sent.length) {
      node.appendChild(h('<div class="eyebrow" style="margin:20px 0 10px">Sent for review</div>'));
      var sentList = h('<div class="list"></div>');
      sent.slice(0, 6).forEach(function (s) {
        sentList.appendChild(h('<div class="row"><div class="ri">⏳</div><div class="rm"><b>' + esc(s.name) +
          "</b><small>" + esc(s.category || "Exercise") + " · " +
          (s.status === "pending" ? "waiting for review" : esc(s.status)) + "</small></div></div>"));
      });
      node.appendChild(sentList);
    }

    node.appendChild(weeklySummary(p));

    node.appendChild(h('<p class="faint small mt center">Everything you add here is saved to your account and syncs across your devices.</p>'));

    shell("workout", "My Routine", node);
  }

  /* How the routine is going: how many movements are planned, how many are
     done, and how many days are left this week. */
  function weeklySummary(p) {
    var planned = 0, done = 0;
    p.days.forEach(function (d) {
      (d.items || []).forEach(function (it) {
        planned++;
        if (it.done) done++;
      });
    });
    var thisWeek = p.days.filter(function (d) { return inThisWeek(d.date); });
    var weekLeft = thisWeek.filter(function (d) {
      return (d.items || []).some(function (it) { return !it.done; });
    }).length;
    var card = h('<div class="card mt"><h3>Where your week stands</h3>' +
      '<div class="statgrid">' +
      '<div class="stat"><b>' + planned + "</b><small>Movements planned</small></div>" +
      '<div class="stat"><b>' + done + "</b><small>Marked done</small></div>" +
      '<div class="stat"><b>' + weekLeft + "</b><small>Days left this week</small></div>" +
      "</div>" +
      (planned ? '<div class="macro"><div class="mlabel"><span>Progress</span><b>' + done + " / " + planned + "</b></div>" +
        '<div class="mbar"><i style="width:' + Math.round((done / planned) * 100) + '%"></i></div></div>' : "") +
      "</div>");
    return card;
  }

  /* Add a movement to the day the member is looking at, or to the first
     day if none is chosen. Used from The Guides screen. */
  function addToRoutine(ex) {
    var p = plan();
    var day = dayById(p, p.currentDay) || p.days[0];
    if (!day) return null;
    var already = (day.items || []).some(function (it) { return it.ex === ex.id; });
    if (already) return null;
    day.items = day.items || [];
    day.items.push({
      ex: ex.id,
      sets: 3,
      reps: ex.reps || (ex.type === "time" ? "60 seconds" : "10 reps"),
      rest: ex.rest || "",
      note: "",
      done: false
    });
    savePlan(p);
    return day.name;
  }

  /* Which days are in view for the chosen range. */
  function scopeDays(p) {
    var days = p.days.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (p.view === "day") return days.slice(0, 1);
    if (p.view === "week") {
      var week = days.filter(function (d) { return inThisWeek(d.date); });
      return week.length ? week : days.slice(0, 3);
    }
    if (p.view === "month") {
      var month = days.filter(function (d) { return inThisMonth(d.date); });
      return month.length ? month : days.slice(0, 6);
    }
    return days;
  }
  function inThisWeek(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var now = new Date();
    var monday = new Date(now.getTime());
    var day = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - day);
    var end = new Date(monday.getTime() + 7 * 86400000);
    return d >= monday && d < end;
  }
  function inThisMonth(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    var now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  /* ---------------- add an exercise to a day ---------------- */
  function addExerciseSheet(p, day, rerender) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Add an exercise</h3><button class="iconbtn" style="margin-left:auto" id="axX">✕</button></div>'));

    var search = h('<div class="search">🔍<input id="axQ" placeholder="Search the library" autocomplete="off"></div>');
    panel.appendChild(search);

    var custom = h('<button class="btn btn-ghost mt">Create a custom exercise</button>');
    panel.appendChild(custom);

    var results = h('<div class="list mt"></div>');
    panel.appendChild(results);

    function paint(q) {
      results.innerHTML = "";
      var rows = D.exercises.concat(S.myExercises()).filter(function (e) {
        return !q || e.name.toLowerCase().indexOf(q.toLowerCase()) > -1;
      }).slice(0, 40);
      if (!rows.length) {
        results.appendChild(h('<div class="row"><div class="rm"><b>No exercise found</b><small>Create a custom one instead.</small></div></div>'));
        return;
      }
      rows.forEach(function (ex) {
        var first = (ex.gallery || [])[0];
        var icon = first
          ? '<span class="ex-thumb"><img alt="" src="/app/assets/img/ex/thumb/' +
            esc(first.replace(/^ex\//, "")) + '" decoding="async"></span>'
          : "💪";
        var r = h('<button class="row"><div class="ri">' + icon + '</div><div class="rm"><b>' + esc(ex.name) + "</b><small>" +
          esc(ex.category || (ex.muscles || []).slice(0, 2).join(", ")) + "</small></div></button>");
        r.onclick = function () { detailSheet(ex, day, rerender, overlay); };
        results.appendChild(r);
      });
    }
    paint("");
    setTimeout(function () {
      var i = $("#axQ", panel);
      if (i) i.oninput = function () { paint(this.value.trim()); };
    }, 0);

    custom.onclick = function () { customSheet(day, rerender, overlay); };

    $("#axX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* Sets, reps, rest and notes for the chosen exercise. */
  function detailSheet(ex, day, rerender, overlay) {
    var box = h('<div class="mt"></div>');
    var title = h('<div class="eyebrow" style="margin:14px 0 8px">' + esc(ex.name) + "</div>");
    box.appendChild(title);
    box.appendChild(h('<div class="field"><label>Sets</label><input id="axSets" type="number" inputmode="numeric" value="3"></div>'));
    box.appendChild(h('<div class="field"><label>Reps or duration</label><input id="axReps" placeholder="' +
      (ex.reps || ex.sets || "8 to 12") + '"></div>'));
    box.appendChild(h('<div class="field"><label>Rest between sets</label><input id="axRest" placeholder="' +
      (ex.rest || "60 to 90 seconds") + '"></div>'));
    box.appendChild(h('<div class="field"><label>Notes or modifications</label><textarea id="axNote" rows="2" placeholder="Anything you want to remember about this one"></textarea></div>'));
    var add = h('<button class="btn btn-primary">Add to my plan</button>');
    add.onclick = function () {
      day.items.push({
        ex: ex.id,
        sets: parseInt($("#axSets", box).value, 10) || 3,
        reps: $("#axReps", box).value.trim(),
        rest: $("#axRest", box).value.trim(),
        note: $("#axNote", box).value.trim(),
        done: false
      });
      savePlan(plan());
      overlay.remove();
      toast("Added to " + day.name);
      rerender();
    };
    box.appendChild(add);
    overlay.querySelector(".sheet").appendChild(box);
    overlay.querySelector(".sheet").scrollTop = 0;
  }

  /* A brand new exercise the member invents. */
  function customSheet(day, rerender, overlay) {
    var box = h('<div class="mt"></div>');
    box.appendChild(h('<div class="eyebrow" style="margin:14px 0 8px">New exercise</div>'));
    box.appendChild(h('<div class="field"><label>Name</label><input id="cxName" placeholder="Single leg Romanian deadlift"></div>'));
    box.appendChild(h('<div class="field"><label>Category</label><select id="cxCat">' +
      ["Upper body", "Lower body", "Core", "Cardio", "Shoulders", "Mobility"].map(function (c) {
        return '<option>' + c + "</option>";
      }).join("") + "</select></div>"));
    box.appendChild(h('<div class="field"><label>What is it for</label><input id="cxPurpose" placeholder="Hamstrings and glutes, balance out your squats"></div>'));
    box.appendChild(h('<div class="field"><label>Sets</label><input id="cxSets" type="number" inputmode="numeric" value="3"></div>'));
    box.appendChild(h('<div class="field"><label>Reps or duration</label><input id="cxReps" placeholder="8 to 10 reps"></div>'));
    box.appendChild(h('<div class="field"><label>Notes</label><textarea id="cxNote" rows="2" placeholder="How you do it"></textarea></div>'));

    var save = h('<button class="btn btn-primary">Save to my plan</button>');
    save.onclick = function () {
      var name = $("#cxName", box).value.trim();
      if (!name) return toast("Give your exercise a name");
      var ex = {
        name: name,
        unit: "reps", type: "count",
        category: $("#cxCat", box).value,
        difficulty: "Beginner",
        muscles: [], equipment: ["Your own setup"],
        purpose: $("#cxPurpose", box).value.trim(),
        start: "", steps: [],
        sets: "3 sets", reps: $("#cxReps", box).value.trim(), rest: "60 to 90 seconds",
        breathing: "", mistakes: [], safety: [], easier: [],
        gallery: []
      };
      var saved = S.addExercise(ex);
      day.items.push({
        ex: saved.id, sets: parseInt($("#cxSets", box).value, 10) || 3,
        reps: ex.reps, rest: "", note: $("#cxNote", box).value.trim(), done: false
      });
      savePlan(plan());
      overlay.remove();
      toast("Saved to your plan ✓");
      rerender();
    };
    box.appendChild(save);
    box.appendChild(h('<p class="faint small mt">Your own exercise stays private to you. ' +
      "Use the button below if you want it reviewed for the shared library.</p>"));
    overlay.querySelector(".sheet").appendChild(box);
  }

  /* Edit an item already on the day. */
  function editItem(p, day, idx, rerender) {
    var it = day.items[idx];
    var ex = exById(it.ex);
    var box = h('<div class="mt"></div>');
    box.appendChild(h('<div class="eyebrow" style="margin:14px 0 8px">Edit ' + esc(ex ? ex.name : it.ex) + "</div>"));
    box.appendChild(h('<div class="field"><label>Sets</label><input id="eiSets" type="number" inputmode="numeric" value="' + (it.sets || 3) + '"></div>'));
    box.appendChild(h('<div class="field"><label>Reps or duration</label><input id="eiReps" value="' + esc(it.reps || "") + '"></div>'));
    box.appendChild(h('<div class="field"><label>Rest between sets</label><input id="eiRest" value="' + esc(it.rest || "") + '"></div>'));
    box.appendChild(h('<div class="field"><label>Notes</label><textarea id="eiNote" rows="2">' + esc(it.note || "") + "</textarea></div>"));
    var save = h('<button class="btn btn-primary">Save changes</button>');
    save.onclick = function () {
      it.sets = parseInt($("#eiSets", box).value, 10) || it.sets;
      it.reps = $("#eiReps", box).value.trim();
      it.rest = $("#eiRest", box).value.trim();
      it.note = $("#eiNote", box).value.trim();
      savePlan(p);
      toast("Updated");
      rerender();
    };
    box.appendChild(save);
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    overlay.firstChild.appendChild(box);
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* Send an exercise to the shared library. It is queued for review. */
  function submitSheet(rerender) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Submit to the shared library</h3><button class="iconbtn" style="margin-left:auto" id="sbX">✕</button></div>'));
    panel.appendChild(h('<p class="sub mb">Your submission is reviewed by the Gym Badge team before it appears for everyone. ' +
      "It is not published automatically.</p>"));
    panel.appendChild(h('<div class="field"><label>Exercise name</label><input id="sbName" placeholder="Single leg Romanian deadlift"></div>'));
    panel.appendChild(h('<div class="field"><label>Category</label><select id="sbCat">' +
      ["Upper body", "Lower body", "Core", "Cardio", "Shoulders", "Mobility"].map(function (c) {
        return "<option>" + c + "</option>";
      }).join("") + "</select></div>"));
    panel.appendChild(h('<div class="field"><label>What it is for</label><input id="sbPurpose" placeholder="Hamstrings and glutes"></div>'));
    panel.appendChild(h('<div class="field"><label>How you do it</label><textarea id="sbSteps" rows="4" placeholder="Step by step"></textarea></div>'));
    var send = h('<button class="btn btn-primary">Send for review</button>');
    send.onclick = function () {
      var name = $("#sbName", panel).value.trim();
      if (!name) return toast("Give your exercise a name");
      var sub = {
        name: name,
        category: $("#sbCat", panel).value,
        purpose: $("#sbPurpose", panel).value.trim(),
        steps: $("#sbSteps", panel).value.trim()
      };
      /* Keep a local copy, then send it to the review queue on the server.
         It is never published for everyone until an administrator approves it. */
      S.addSubmission(sub);
      send.disabled = true;
      send.textContent = "Sending…";
      fetch("/api/exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub)
      }).then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, j: j }; });
      }).then(function (res) {
        overlay.remove();
        if (res.ok) toast("Sent for review — we will let you know");
        else toast((res.j && res.j.error) || "Saved on this device — we will send it when you are back online");
      }).catch(function () {
        overlay.remove();
        toast("Saved on this device — we will send it when you are back online");
      });
    };
    panel.appendChild(send);
    $("#sbX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  global.GBPlan = {
    screen: screen, plan: plan, savePlan: savePlan, exById: exById, dateKey: dateKey,
    addToRoutine: addToRoutine
  };
})(typeof window !== "undefined" ? window : this);
