/* ==========================================================================
   GYM BADGE — AI support assistant

   A live chat panel that answers the questions the FAQ does not cover:
   account and sign in, password resets, finding your plan, exercise
   instructions, the nutrition guide, trainer discovery and booking, plans
   and pricing, language and country settings, and technical problems.

   Rules the assistant follows
   ----------------------------
   • It answers from Gym Badge's own knowledge base. If the answer is not in
     there, it says so and offers a human.
   • It never invents a price, a policy, a trainer credential or a feature
     that does not exist.
   • It answers in the language the member selected, when we have it.
   • It asks a clarifying question when the question is too broad.
   • It escalates to a human when it cannot verify an answer.
   • If a member mentions pain or an injury, it stops giving exercise
     advice, encourages them to see a qualified professional, and points
     them to support. It does not give a diagnosis.

   The AI key lives on the server. The browser only ever talks to
   /api/chat, which applies rate limiting and returns the answer.
   ========================================================================== */
(function (global) {
  "use strict";

  var S = window.GBStore, I = window.GBI18n;

  var h = window.GBUI.h, esc = window.GBUI.esc, $ = window.GBUI.$;
  var toast = window.GBUI.toast;

  var SUPPORT_EMAIL = "gymbadgesupport@gmail.com";
  var STATE = { open: false, messages: [], sending: false, escalated: false };

  /* The assistant works on the website too, where there is no app store.
     The language is read from whichever source is available. */
  function lang() {
    if (S && typeof S.lang === "function") return S.lang();
    if (I && I.current) return I.current().code;
    return "en";
  }

  /* ---------------- mount ---------------- */
  function mount() {
    if (document.getElementById("gbChat")) return;

    var fab = h('<button class="gb-chat-fab" id="gbChatFab" aria-label="Open support chat" aria-expanded="false">' +
      '<span class="gb-chat-ic">💬</span><span class="gb-chat-label">Help</span></button>');
    document.body.appendChild(fab);

    var panel = h('<div class="gb-chat" id="gbChat" hidden>' +
      '<div class="gb-chat-head">' +
        '<div class="gb-chat-title"><b>Gym Badge assistant</b><small>Answers about your account, training and nutrition</small></div>' +
        '<button class="iconbtn" id="gbChatClose" aria-label="Close chat">✕</button>' +
      "</div>" +
      '<div class="gb-chat-log" id="gbChatLog" role="log" aria-live="polite"></div>' +
      '<div class="gb-chat-quick" id="gbChatQuick"></div>' +
      '<form class="gb-chat-form" id="gbChatForm">' +
        '<input id="gbChatInput" placeholder="Ask about anything in Gym Badge" autocomplete="off" aria-label="Your question">' +
        '<button type="submit" class="gb-chat-send" aria-label="Send">➤</button>' +
      "</form>" +
      '<div class="gb-chat-foot">' + esc(SUPPORT_EMAIL) + "</div>" +
      "</div>");
    document.body.appendChild(panel);

    fab.onclick = function () { toggle(); };
    $("#gbChatClose", panel).onclick = function () { toggle(false); };

    var log = $("#gbChatLog", panel);
    var quick = $("#gbChatQuick", panel);

    function bubble(role, text, extra) {
      var b = h('<div class="gb-bubble gb-' + role + '"><div class="gb-bubble-body"></div></div>');
      b.querySelector(".gb-bubble-body").innerHTML = text;
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }
    STATE.bubble = bubble;

    if (!STATE.messages.length) {
      var greet = "Hi — I'm the Gym Badge assistant. I can help with your account, workouts, exercise technique, nutrition, trainers and plans. What do you need?";
      bubble("bot", esc(greet));
      ["How do I reset my password?",
       "How do I find a trainer?",
       "How do I add an exercise to my plan?",
       "What does the Nutrition Guide show?"].forEach(function (q) {
        var b = h('<button class="gb-quick">' + esc(q) + "</button>");
        b.onclick = function () { ask(q); };
        quick.appendChild(b);
      });
    } else {
      STATE.messages.forEach(function (m) { bubble(m.role, esc(m.text)); });
    }

    $("#gbChatForm", panel).addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = $("#gbChatInput", panel);
      var v = inp.value.trim();
      if (!v) return;
      inp.value = "";
      ask(v);
    });

    function toggle(force) {
      STATE.open = force === undefined ? !STATE.open : force;
      panel.hidden = !STATE.open;
      fab.setAttribute("aria-expanded", STATE.open ? "true" : "false");
      fab.classList.toggle("on", STATE.open);
      if (STATE.open) setTimeout(function () { $("#gbChatInput", panel).focus(); }, 60);
    }
    STATE.toggle = toggle;
  }

  /* ---------------- ask ---------------- */
  function ask(text) {
    if (STATE.sending) return;
    STATE.sending = true;
    STATE.messages.push({ role: "user", text: text });
    if (STATE.bubble) STATE.bubble("user", esc(text));

    var thinking = STATE.bubble
      ? STATE.bubble("bot", '<span class="gb-typing"><i></i><i></i><i></i></span>')
      : null;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        lang: lang(),
        history: STATE.messages.slice(-8)
      })
    }).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, j: j }; });
    }).then(function (res) {
      if (thinking) thinking.remove();
      STATE.sending = false;
      var j = res.j || {};
      if (res.status === 429) {
        push("bot", "You've asked a few questions very quickly. Give it a moment, or email " + SUPPORT_EMAIL + " and we'll pick it up.");
        return;
      }
      if (!j.ok) {
        push("bot", "I could not reach the assistant just then. You can email " + SUPPORT_EMAIL +
          " and a human will reply within one business day.");
        return;
      }
      push("bot", j.answer || "I do not have a confident answer for that one.");
      if (j.escalate) {
        push("bot", "This one needs a person. Email " + SUPPORT_EMAIL +
          (j.ticket ? " and quote ticket <b>" + esc(j.ticket) + "</b>" : "") +
          " and we will reply within one business day.");
        STATE.escalated = true;
      }
      if (j.followUp) {
        push("bot", '<span class="gb-ask">To narrow this down: ' + esc(j.followUp) + "</span>");
      }
    }).catch(function () {
      if (thinking) thinking.remove();
      STATE.sending = false;
      push("bot", "Something went wrong reaching the assistant. Please try again, or email " + SUPPORT_EMAIL + ".");
    });
  }

  function push(role, html) {
    STATE.messages.push({ role: role, text: html.replace(/<[^>]+>/g, "") });
    if (STATE.bubble) STATE.bubble(role, html);
  }

  global.GBChat = {
    mount: mount,
    ask: ask,
    toggle: function () { if (STATE.toggle) STATE.toggle(); },
    supportEmail: SUPPORT_EMAIL
  };
})(typeof window !== "undefined" ? window : this);
