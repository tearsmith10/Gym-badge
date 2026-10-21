/* ==========================================================================
   GYM BADGE — trainers, bookings and account tenure

   Three things live here:

   1. FIND A TRAINER  — the directory, a trainer profile, and booking.
   2. YOUR TRAINER    — the member's own trainer section: who they are booked
      with, what is coming up, what has already happened, and the actions
      they can take. It replaces the old cart section in the profile.
   3. YOUR GYM BADGE JOURNEY — how long the member has been with us, worked
      out from the account creation date with real calendar arithmetic, so
      month boundaries, leap years and time zones are all handled correctly.

   Trainer registration is deliberately stricter than member registration.
   A trainer must supply a photograph, their professional details, where
   they work, the services they offer, how they deliver them, their
   qualifications and their booking contact. Nothing is published straight
   away: the application goes to the moderation queue and the trainer
   carries a pending status until an administrator reviews it.
   ========================================================================== */
(function (global) {
  "use strict";

  var S = window.GBStore, I = window.GBI18n;

  function h(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]; }); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  /* ---------------- account tenure ----------------
     All counts are measured from the account creation timestamp. Nothing is
     incremented by hand, so the numbers are always right when a member
     comes back. */
  function tenure() {
    var u = S.user() || {};
    var joined = u.joined || u.createdAt || u.signupAt;
    if (!joined) return null;

    var start = new Date(joined);
    if (isNaN(start.getTime())) return null;
    var now = new Date();

    // Whole days elapsed, using calendar dates so a member who signs up
    // late at night does not lose a day to the clock.
    var startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    var todayDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.max(0, Math.round((todayDay - startDay) / 86400000));

    // Calendar months, only counting a month once the day of the month has
    // been reached. 31 Jan -> 28 Feb is one month, not two.
    var months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    months = Math.max(0, months);

    var years = Math.floor(months / 12);

    return {
      joined: start,
      days: days,
      weeks: Math.floor(days / 7),
      months: months,
      years: years,
      label: joinLabel(days, months, years)
    };
  }

  function joinLabel(days, months, years) {
    if (days <= 0) return "Joined today";
    var bits = [];
    if (years > 0) bits.push(years + (years === 1 ? " year" : " years"));
    else if (months > 0) bits.push(months + (months === 1 ? " month" : " months"));
    else bits.push(days + (days === 1 ? " day" : " days"));
    return "Member for " + bits.join(", ");
  }

  /* ---------------- trainer directory ---------------- */
  function list() {
    return S.get().trainers || [];
  }

  /* The three states a trainer application can be in. Only verified
     trainers are shown to members, and only verified trainers get the
     verified badge. */
  var VERIFICATION = {
    pending:  { label: "Verification pending", pill: "warn", icon: "⏳",
                desc: "We are checking your qualifications. You will hear from us soon." },
    verified: { label: "Verified", pill: "ok", icon: "✓",
                desc: "Your qualifications have been checked." },
    rejected: { label: "More information needed", pill: "bad", icon: "⚠️",
                desc: "We need a little more before we can approve your profile." }
  };

  function verification(status) {
    return VERIFICATION[status] || VERIFICATION.pending;
  }

  function refresh() {
    return fetch("/api/trainers", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && Array.isArray(j.trainers) && j.trainers.length) {
          S.set({ trainers: j.trainers });
          return j.trainers;
        }
        return list();
      })
      .catch(function () { return list(); });
  }

  function find(id) {
    var all = list();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* ---------------- bookings ---------------- */
  function bookings() { return S.get().bookings || []; }

  function bookTrainer(trainerId, when, mode) {
    var t = find(trainerId);
    if (!t) return Promise.reject(new Error("Trainer not found"));
    var b = {
      id: "tb" + Date.now().toString(36),
      trainerId: trainerId,
      trainerName: t.name,
      when: when || defaultSlot(),
      mode: mode || t.modes[0] || "in-person",
      status: "confirmed",
      at: new Date().toISOString()
    };
    var all = bookings();
    all.unshift(b);
    S.set({ bookings: all });
    return Promise.resolve(b);
  }

  function defaultSlot() {
    var d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }

  function cancelBooking(id) {
    var all = bookings().filter(function (b) { return b.id !== id; });
    S.set({ bookings: all });
  }

  function rescheduleBooking(id, when) {
    var all = bookings().map(function (b) { return b.id === id ? Object.assign({}, b, { when: when, status: "rescheduled" }) : b; });
    S.set({ bookings: all });
  }

  /* ---------------- screens ---------------- */
  function directory(shell, go) {
    var node = h("<div></div>");
    node.appendChild(h('<div class="search">🔍<input id="trQ" placeholder="Search trainers by name or specialty" autocomplete="off"></div>'));
    var chips = h('<div class="chips mb"></div>');
    var state = { q: "", verified: false, mode: "all" };
    [["all", "All"], ["in-person", "In person"], ["online", "Online"]].forEach(function (m) {
      var b = h('<button class="chip' + (m[0] === "all" ? " on" : "") + '">' + m[1] + "</button>");
      b.onclick = function () {
        state.mode = m[0];
        chips.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        paint();
      };
      chips.appendChild(b);
    });
    var v = h('<button class="chip">✓ Verified only</button>');
    v.onclick = function () {
      state.verified = !state.verified;
      v.classList.toggle("on", state.verified);
      paint();
    };
    chips.appendChild(v);
    node.appendChild(chips);

    var listBox = h('<div class="list"></div>');
    node.appendChild(listBox);
    var empty = h('<div class="empty" hidden><b>No trainers match that</b><br>Try a different search, or apply to join as a trainer.</div>');
    node.appendChild(empty);

    function paint() {
      var rows = list().filter(function (t) {
        if (state.verified && t.status !== "verified") return false;
        if (state.mode !== "all" && (t.modes || []).indexOf(state.mode) === -1) return false;
        if (state.q) {
          var hay = (t.name + " " + t.specialty + " " + t.city + " " + (t.certs || []).join(" ")).toLowerCase();
          if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
        }
        return true;
      });
      listBox.innerHTML = "";
      empty.hidden = rows.length > 0;
      rows.forEach(function (t) {
        var r = h('<button class="row"><div class="ri">🧑‍🏫</div><div class="rm"><b>' + esc(t.name) +
          (t.status === "verified" ? ' <span class="pill ok" style="font-size:.6rem">Verified</span>' : "") +
          '</b><small>' + esc(t.specialty || "") + " · " + esc(t.city || "") + " · ★ " + (t.rating || 5) + "</small></div>" +
          '<div class="rr"><span class="chev">›</span></div></button>');
        r.onclick = function () { go("trainer", t.id); };
        listBox.appendChild(r);
      });
    }

    paint();
    setTimeout(function () {
      var i = $("#trQ", node);
      if (i) i.oninput = function () { state.q = this.value.trim(); paint(); };
    }, 0);

    var apply = h('<button class="btn btn-ghost mt">Apply to join as a trainer</button>');
    apply.onclick = function () { applySheet(rerender); };
    node.appendChild(apply);

    shell("exercise", "Find a Trainer", node);

    function rerender() { directory(shell, go); }

    refresh().then(function () { paint(); });
  }

  function profile(shell, go, id) {
    var t = find(id);
    if (!t) { go("trainers"); return; }
    var node = h("<div></div>");

    node.appendChild(h('<div class="card center">' +
      '<div class="tr-ava">' + (t.photo ? '<img src="' + esc(t.photo) + '" alt="' + esc(t.name) + '">' : esc((t.name || "T").charAt(0))) + "</div>" +
      '<h2 style="font-size:1.2rem;margin-top:8px">' + esc(t.name) + "</h2>" +
      '<div class="sub">' + esc(t.specialty || "") + " · " + esc(t.city || "") + "</div>" +
      (t.status === "verified" ? '<span class="pill ok" style="margin-top:8px">✓ Verified trainer</span>' :
        '<span class="pill ' + verification(t.status).pill + '" style="margin-top:8px">' +
        verification(t.status).icon + " " + esc(verification(t.status).label) + "</span>") +
      '<p class="sub" style="margin-top:8px">' + esc(verification(t.status).desc) + "</p>" +
      "</div>"));

    if (t.bio) node.appendChild(h('<div class="card mt"><h3>About</h3><p class="sub">' + esc(t.bio) + "</p></div>"));

    if (t.certs && t.certs.length) {
      var c = h('<div class="card mt"><h3>Qualifications</h3><ul class="plist good"></ul></div>');
      var ul = c.querySelector(".plist");
      t.certs.forEach(function (x) { ul.appendChild(h("<li>" + esc(x) + "</li>")); });
      node.appendChild(c);
    }

    var facts = h('<div class="list mt"></div>');
    facts.appendChild(h('<div class="row"><div class="rm"><b>Where they train</b></div><div class="rr">' +
      esc(t.area || t.city || "—") + "</div></div>"));
    facts.appendChild(h('<div class="row"><div class="rm"><b>How they deliver</b></div><div class="rr">' +
      esc((t.modes || []).join(" and ") || "—") + "</div></div>"));
    facts.appendChild(h('<div class="row"><div class="rm"><b>Experience</b></div><div class="rr">' +
      (t.years || 0) + " years</div></div>"));
    facts.appendChild(h('<div class="row"><div class="rm"><b>Session fee</b></div><div class="rr">' +
      (t.rate ? esc(t.rate) : "—") + "</div></div>"));
    node.appendChild(facts);

    var book = h('<button class="btn btn-primary btn-lg mt">Book a session</button>');
    book.onclick = function () { bookSheet(t, function () { go("profile"); }); };
    node.appendChild(book);

    shell("exercise", t.name, node, { back: true });
  }

  function bookSheet(t, done) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Book with ' + esc(t.name) + "</h3><button class=\"iconbtn\" style=\"margin-left:auto\" id=\"bkX\">✕</button></div>"));

    panel.appendChild(h('<div class="field"><label>Date and time</label><input id="bkWhen" type="datetime-local" value="' +
      new Date(defaultSlot()).toISOString().slice(0, 16) + '"></div>'));

    panel.appendChild(h('<div class="field"><label>How would you like to train?</label><select id="bkMode">' +
      (t.modes || ["in-person"]).map(function (m) {
        return '<option value="' + esc(m) + '">' + (m === "online" ? "Online" : "In person") + "</option>";
      }).join("") + "</select></div>"));

    panel.appendChild(h('<div class="field"><label>Anything they should know?</label><textarea id="bkNote" rows="2" placeholder="Goals, injuries, schedule"></textarea></div>'));

    var go2 = h('<button class="btn btn-primary">Confirm booking</button>');
    go2.onclick = function () {
      var when = $("#bkWhen", panel).value;
      if (!when) return toast("Pick a date and time");
      bookTrainer(t.id, new Date(when).toISOString(), $("#bkMode", panel).value).then(function () {
        overlay.remove();
        toast("Session booked with " + t.name + " ✓");
        done();
      });
    };
    panel.appendChild(go2);
    $("#bkX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* ---------------- apply to join as a trainer ---------------- */
  function applySheet(done) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Apply to join as a trainer</h3><button class="iconbtn" style="margin-left:auto" id="apX">✕</button></div>'));
    panel.appendChild(h('<p class="sub mb">Trainer applications are reviewed by the Gym Badge team, so we need a little more from you than a member sign up. ' +
      "Your application stays private until it is approved.</p>"));

    // Photo is mandatory for a trainer.
    var photoBox = h('<div class="field"><label>Profile photograph (required)</label><div class="uploader" id="apPhoto">' +
      '<span class="up-ic">📷</span><span class="up-txt">Upload a clear photo of you</span>' +
      '<span class="up-sub">This is what members see. A face helps a lot.</span></div></div>');
    panel.appendChild(photoBox);
    var photoData = null;
    var fileInp = h('<input type="file" accept="image/*" hidden>');
    panel.appendChild(fileInp);
    photoBox.querySelector("#apPhoto").onclick = function () { fileInp.click(); };
    fileInp.onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var im = new Image();
        im.onload = function () {
          var sc = Math.min(1, 320 / Math.max(im.width, im.height));
          var c = document.createElement("canvas");
          c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          photoData = c.toDataURL("image/jpeg", 0.85);
          photoBox.querySelector("#apPhoto").innerHTML =
            '<img src="' + photoData + '" alt="Your trainer photograph" style="width:100%;height:160px;object-fit:cover;border-radius:12px">';
        };
        im.src = e.target.result;
      };
      reader.readAsDataURL(f);
    };

    panel.appendChild(h('<div class="field"><label>Full name</label><input id="apName" placeholder="Your full name"></div>'));
    panel.appendChild(h('<div class="field"><label>Professional headline</label><input id="apHead" placeholder="Strength and conditioning coach"></div>'));
    panel.appendChild(h('<div class="field"><label>Where do you work?</label><input id="apArea" placeholder="Lekki Phase 1, Lagos"></div>'));

    // Country picker, distinct from language.
    panel.appendChild(h('<div class="field"><label>Country</label><div id="apCountry"></div></div>'));
    var country = { code: (S.user() || {}).countryCode || "NG", name: (S.user() || {}).country || "Nigeria" };
    if (window.GBCountries) {
      var cp = window.GBCountries.picker({
        value: country.code,
        onChange: function (c) { country = { code: c.code, name: c.name }; }
      });
      $("#apCountry", panel).appendChild(cp);
    }

    panel.appendChild(h('<div class="field"><label>Services you provide</label><input id="apServices" placeholder="Strength and conditioning, weight loss, pre and postnatal"></div>'));

    panel.appendChild(h('<div class="field"><label>How do you deliver your sessions?</label><div class="chips" id="apModes"></div></div>'));
    var modes = [];
    [["in-person", "In person"], ["online", "Online"], ["both", "Both"]].forEach(function (m) {
      var b = h('<button class="chip">' + m[1] + "</button>");
      b.onclick = function () {
        if (m[0] === "both") {
          modes = modes.length === 2 ? [] : ["in-person", "online"];
        } else {
          modes = modes.indexOf(m[0]) > -1 ? modes.filter(function (x) { return x !== m[0]; }) : modes.concat([m[0]]);
        }
        $("#apModes", panel).querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); });
        if (m[0] === "both") {
          if (modes.length === 2) {
            $("#apModes", panel).children[0].classList.add("on");
            $("#apModes", panel).children[1].classList.add("on");
          }
        } else {
          b.classList.toggle("on", modes.indexOf(m[0]) > -1);
        }
      };
      $("#apModes", panel).appendChild(b);
    });

    panel.appendChild(h('<div class="field"><label>Qualifications and certifications</label><textarea id="apCerts" rows="2" placeholder="NASM-CPT, BSc Physiotherapy"></textarea></div>'));
    panel.appendChild(h('<div class="field"><label>Contact number for bookings</label><input id="apPhone" type="tel" placeholder="+234 801 234 5678"></div>'));
    panel.appendChild(h('<div class="field"><label>How many years have you coached?</label><input id="apYears" type="number" inputmode="numeric" value="3"></div>'));
    panel.appendChild(h('<p class="faint small">Your contact number is only shared with a member once they have booked you. ' +
      "It is never shown publicly.</p>"));

    var send = h('<button class="btn btn-primary">Send application for review</button>');
    send.onclick = function () {
      if (!photoData) return toast("A profile photograph is required for trainers");
      if (!$("#apName", panel).value.trim()) return toast("Enter your full name");
      if (!$("#apArea", panel).value.trim()) return toast("Tell us where you work");
      if (!$("#apServices", panel).value.trim()) return toast("List the services you offer");
      if (!modes.length) return toast("Choose how you deliver your sessions");
      if (!$("#apCerts", panel).value.trim()) return toast("Add your qualifications");
      if (!$("#apPhone", panel).value.trim()) return toast("Add a contact number for bookings");

      var app = {
        id: "tr" + Date.now().toString(36),
        name: $("#apName", panel).value.trim(),
        headline: $("#apHead", panel).value.trim(),
        specialty: $("#apServices", panel).value.trim(),
        area: $("#apArea", panel).value.trim(),
        country: country.name, countryCode: country.code,
        modes: modes,
        certs: $("#apCerts", panel).value.split(",").map(function (x) { return x.trim(); }).filter(Boolean),
        phone: $("#apPhone", panel).value.trim(),
        years: parseInt($("#apYears", panel).value, 10) || 0,
        photo: photoData,
        status: "pending",
        at: new Date().toISOString()
      };
      var apps = S.get().trainerApplications || [];
      apps.unshift(app);
      S.set({ trainerApplications: apps });
      overlay.remove();
      toast("Application sent — we will review it");
      done();
    };
    panel.appendChild(send);

    $("#apX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* ---------------- "Your Trainer" section for the profile ---------------- */
  function yourTrainerSection() {
    var all = bookings();
    var now = Date.now();
    var upcoming = all.filter(function (b) { return new Date(b.when).getTime() >= now - 3600000; });
    var past = all.filter(function (b) { return new Date(b.when).getTime() < now - 3600000; });

    var wrap = h('<div class="list"></div>');
    if (!all.length) {
      wrap.appendChild(h('<div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">' +
        "<b>You have not booked a trainer yet</b>" +
        "<small>Book a coach and your sessions, plans and history all appear here.</small>" +
        '<a class="btn btn-primary btn-sm" href="#/trainers" style="margin-top:8px">Find a Trainer</a></div>'));
      return wrap;
    }

    upcoming.forEach(function (b) {
      var t = find(b.trainerId);
      var row = h('<div class="row"><div class="ri">🧑‍🏫</div><div class="rm"><b>' + esc(b.trainerName || "Your trainer") + "</b><small>" +
        esc(fmtWhen(b.when)) + " · " + (b.mode === "online" ? "Online" : "In person") +
        " · " + esc(String(b.status || "confirmed")) + "</small></div></div>");
      var acts = h('<div class="rr"></div>');
      var view = h('<button class="btn btn-ghost btn-sm">Details</button>');
      view.onclick = function () { sessionSheet(b, t); };
      var resched = h('<button class="btn btn-ghost btn-sm">Reschedule</button>');
      resched.onclick = function () { rescheduleSheet(b); };
      var cancel = h('<button class="row-del" aria-label="Cancel session">✕</button>');
      cancel.onclick = function () {
        if (!confirm("Cancel this session?")) return;
        cancelBooking(b.id);
        toast("Session cancelled");
        rerenderProfile();
      };
      acts.appendChild(view);
      acts.appendChild(resched);
      acts.appendChild(cancel);
      row.querySelector(".rm").after(acts);
      wrap.appendChild(row);
    });

    if (past.length) {
      wrap.appendChild(h('<div class="row" style="background:var(--surface-2)"><div class="rm"><b>Earlier sessions</b></div></div>'));
      past.slice(0, 6).forEach(function (b) {
        var row = h('<div class="row"><div class="ri">✅</div><div class="rm"><b>' + esc(b.trainerName || "Your trainer") + "</b><small>" +
          esc(fmtWhen(b.when)) + " · " + (b.mode === "online" ? "Online" : "In person") + "</small></div></div>");
        var view = h('<button class="btn btn-ghost btn-sm">Details</button>');
        view.onclick = function () { sessionSheet(b, find(b.trainerId)); };
        row.querySelector(".rm").after(h('<div class="rr"></div>')).after(view);
        wrap.appendChild(row);
      });
    }
    return wrap;
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat(I && I.locale ? I.locale() : "en", {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      }).format(new Date(iso));
    } catch (e) { return new Date(iso).toLocaleString(); }
  }

  function sessionSheet(b, t) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Session details</h3><button class="iconbtn" style="margin-left:auto" id="ssX">✕</button></div>'));
    panel.appendChild(h('<div class="list">' +
      '<div class="row"><div class="rm"><b>Trainer</b></div><div class="rr">' + esc(b.trainerName || "—") + "</div></div>" +
      '<div class="row"><div class="rm"><b>When</b></div><div class="rr">' + esc(fmtWhen(b.when)) + "</div></div>" +
      '<div class="row"><div class="rm"><b>How</b></div><div class="rr">' + (b.mode === "online" ? "Online" : "In person") + "</div></div>" +
      '<div class="row"><div class="rm"><b>Status</b></div><div class="rr">' + esc(String(b.status || "confirmed")) + "</div></div>" +
      (b.note ? '<div class="row" style="flex-direction:column;align-items:flex-start"><b>Your note</b><small>' + esc(b.note) + "</small></div>" : "") +
      (t && t.phone ? '<div class="row"><div class="rm"><b>Contact</b></div><div class="rr">' + esc(t.phone) + "</div></div>" : "") +
      "</div>"));
    if (t) {
      var open = h('<a class="btn btn-ghost mt" href="#/trainer/' + esc(t.id) + '">View trainer profile</a>');
      open.style.textDecoration = "none";
      panel.appendChild(open);
    }
    $("#ssX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  function rescheduleSheet(b) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;
    panel.appendChild(h('<div class="sheet-head"><h3>Reschedule</h3><button class="iconbtn" style="margin-left:auto" id="rsX">✕</button></div>'));
    panel.appendChild(h('<div class="field"><label>New date and time</label><input id="rsWhen" type="datetime-local" value="' +
      new Date(b.when).toISOString().slice(0, 16) + '"></div>'));
    var save = h('<button class="btn btn-primary">Save new time</button>');
    save.onclick = function () {
      var v = $("#rsWhen", panel).value;
      if (!v) return toast("Pick a new time");
      rescheduleBooking(b.id, new Date(v).toISOString());
      overlay.remove();
      toast("Session rescheduled");
      rerenderProfile();
    };
    panel.appendChild(save);
    $("#rsX", panel).onclick = function () { overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  /* The profile screen asks us to repaint after a change. */
  var rerenderProfile = function () {};
  function setProfileRerender(fn) { rerenderProfile = fn; }

  global.GBTrainers = {
    directory: directory,
    profile: profile,
    applySheet: applySheet,
    yourTrainerSection: yourTrainerSection,
    tenure: tenure,
    joinLabel: joinLabel,
    refresh: refresh,
    list: list,
    find: find,
    verification: verification,
    VERIFICATION: VERIFICATION,
    bookings: bookings,
    bookTrainer: bookTrainer,
    cancelBooking: cancelBooking,
    rescheduleBooking: rescheduleBooking,
    setProfileRerender: setProfileRerender
  };
})(typeof window !== "undefined" ? window : this);
