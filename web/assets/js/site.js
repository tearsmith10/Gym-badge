/* ==========================================================================
   GYM BADGE — website hero animation
   Draws the Week 1 → Week 10 transformation as a living scene: the gym floor,
   the kit, and a phone whose screen fills in as the weeks advance. Re-draws
   on theme change.

   Nav, footer, theme toggle, mobile menu and scroll-reveal all live in
   chrome.js (GBChrome.mount) — this file is intentionally hero-only so the
   two never double-wire the same controls.
   ========================================================================== */
(function () {
  "use strict";

  var host = document.getElementById("heroBg");
  var railHost = document.getElementById("weekRail");
  if (!host) return;   // not the homepage → nothing to do

  var NS = "http://www.w3.org/2000/svg";
  var WEEKS = 10;

  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("viewBox", "0 0 1200 640");
  svg.setAttribute("aria-hidden", "true");
  host.appendChild(svg);

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  var defs = el("defs", {});
  defs.innerHTML =
    '<linearGradient id="gAccent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5502c"/><stop offset="1" stop-color="#ff8a5c"/></linearGradient>' +
    '<radialGradient id="gGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e5502c" stop-opacity=".2"/><stop offset="100%" stop-color="#e5502c" stop-opacity="0"/></radialGradient>';
  svg.appendChild(defs);

  // Soft backdrop wash (theme-aware tint, not a neon gradient).
  var wash = el("rect", { x:0, y:0, width:1200, height:640, fill:"url(#gAccent)", "fill-opacity":"0.05" });
  svg.appendChild(wash);

  // Faint guide grid.
  var grid = el("g", { stroke: css("--line") || "#d3ccbc", "stroke-opacity":"0.5", "stroke-width":"1", fill:"none" });
  for (var gy = 0; gy <= 640; gy += 48) grid.appendChild(el("line", { x1:0, y1:gy, x2:1200, y2:gy }));
  svg.appendChild(grid);

  var scene = el("g", {});
  svg.appendChild(scene);

  function draw(p) {
    var ink = css("--ink") || "#16161a";
    var accent = css("--accent") || "#e5502c";
    while (scene.firstChild) scene.removeChild(scene.firstChild);
    // Recolour gradients to the live accent (light/dark themes differ).
    var gs = defs.querySelectorAll("#gGlow stop");
    if (gs.length > 1) { gs[0].setAttribute("stop-color", accent); gs[1].setAttribute("stop-color", accent); }
    var ga = defs.querySelectorAll("#gAccent stop");
    if (ga.length) ga[0].setAttribute("stop-color", accent);
    // Depth: key-light glow + soft light beams behind the scene.
    scene.appendChild(el("ellipse", { cx:940, cy:270, rx:430, ry:350, fill:"url(#gGlow)" }));
    scene.appendChild(el("path", { d:"M700,-60 L860,-60 L1170,640 L1010,640 Z", fill:accent, "fill-opacity":"0.055" }));
    scene.appendChild(el("path", { d:"M884,-60 L948,-60 L1240,640 L1176,640 Z", fill:accent, "fill-opacity":"0.035" }));
    // Floor plane.
    scene.appendChild(el("rect", { x:0, y:550, width:1200, height:90, fill:ink, "fill-opacity":"0.05" }));
    scene.appendChild(el("line", { x1:0, y1:550, x2:1200, y2:550, stroke:css("--line-strong") || "#d3ccbc", "stroke-width":"2" }));
    // Gym kit staged in the background: squat rack, plate tree, kettlebell.
    var kit = el("g", { stroke:ink, "stroke-opacity":"0.2", "stroke-width":"4", fill:"none", "stroke-linecap":"round" });
    kit.appendChild(el("line", { x1:170, y1:352, x2:170, y2:550, "stroke-width":"6" }));
    kit.appendChild(el("line", { x1:290, y1:352, x2:290, y2:550, "stroke-width":"6" }));
    kit.appendChild(el("line", { x1:170, y1:356, x2:290, y2:356, "stroke-width":"5" }));
    kit.appendChild(el("line", { x1:146, y1:396, x2:314, y2:396, "stroke-width":"4" }));
    kit.appendChild(el("circle", { cx:154, cy:396, r:15 }));
    kit.appendChild(el("circle", { cx:173, cy:396, r:10 }));
    kit.appendChild(el("circle", { cx:306, cy:396, r:15 }));
    kit.appendChild(el("circle", { cx:287, cy:396, r:10 }));
    kit.appendChild(el("line", { x1:150, y1:548, x2:190, y2:548, "stroke-width":"6" }));
    kit.appendChild(el("line", { x1:270, y1:548, x2:310, y2:548, "stroke-width":"6" }));
    kit.appendChild(el("line", { x1:668, y1:430, x2:668, y2:548, "stroke-width":"5" }));
    kit.appendChild(el("line", { x1:638, y1:548, x2:698, y2:548, "stroke-width":"6" }));
    kit.appendChild(el("ellipse", { cx:668, cy:470, rx:24, ry:7 }));
    kit.appendChild(el("ellipse", { cx:668, cy:492, rx:24, ry:7 }));
    kit.appendChild(el("ellipse", { cx:668, cy:514, rx:24, ry:7 }));
    kit.appendChild(el("circle", { cx:668, cy:436, r:6 }));
    kit.appendChild(el("circle", { cx:986, cy:563, r:17, "stroke-width":"5" }));
    kit.appendChild(el("path", { d:"M976 551 q10 -20 20 0", "stroke-width":"5" }));
    scene.appendChild(kit);

    // The phone — your badge, filling in week by week.
    var phone = el("g", {});
    phone.appendChild(el("ellipse", { cx:930, cy:508, rx:92, ry:12, fill:ink, "fill-opacity":"0.13" }));
    phone.appendChild(el("rect", { x:852, y:168, width:156, height:316, rx:30,
      fill:css("--surface") || "#ffffff", stroke:css("--line-strong") || "#d3ccbc", "stroke-width":"2" }));
    phone.appendChild(el("rect", { x:864, y:194, width:132, height:264, rx:18,
      fill:css("--bg") || "#f4f1ea", stroke:css("--line") || "#e2ddd1", "stroke-width":"1.5" }));
    phone.appendChild(el("rect", { x:906, y:204, width:48, height:8, rx:4, fill:ink, "fill-opacity":"0.25" }));
    var wk = el("text", { x:930, y:262, "text-anchor":"middle", "font-size":"30", "font-weight":"800",
      "font-family":"inherit", fill:ink, "letter-spacing":"1" });
    wk.textContent = "WEEK " + (1 + Math.round(p * (WEEKS - 1)));
    phone.appendChild(wk);
    // progress bar filling with the weeks
    phone.appendChild(el("rect", { x:880, y:282, width:100, height:9, rx:4.5, fill:css("--line") || "#e2ddd1" }));
    phone.appendChild(el("rect", { x:880, y:282, width:Math.max(6, 100 * p), height:9, rx:4.5, fill:accent }));
    // stat lines
    phone.appendChild(el("rect", { x:880, y:312, width:72, height:10, rx:5, fill:css("--line-strong") || "#d3ccbc", "fill-opacity":"0.65" }));
    phone.appendChild(el("rect", { x:880, y:334, width:88, height:10, rx:5, fill:css("--line-strong") || "#d3ccbc", "fill-opacity":"0.45" }));
    phone.appendChild(el("rect", { x:880, y:356, width:56, height:10, rx:5, fill:css("--line-strong") || "#d3ccbc", "fill-opacity":"0.3" }));
    // badge mark on the screen
    phone.appendChild(el("circle", { cx:930, cy:428, r:27, fill:accent, "fill-opacity":"0.14" }));
    phone.appendChild(el("path", { d:"M930 414l11 4.2v8.4c0 7-4.6 12-11 14.4-6.4-2.4-11-7.4-11-14.4v-8.4l11-4.2z",
      fill:"none", stroke:accent, "stroke-width":"2.4", "stroke-linejoin":"round" }));
    phone.appendChild(el("path", { d:"M924 428l4.5 4.5 8-8.5", fill:"none", stroke:accent, "stroke-width":"2.6", "stroke-linecap":"round", "stroke-linejoin":"round" }));
    scene.appendChild(phone);

    // Progress arc rising with the week.
    var arcY = 470 - p * 150;
    var arcD = "M180 " + (arcY + 40) + " Q600 " + (arcY - 90 - p * 50) + " 1020 " + (arcY + 20);
    var arc = el("path", { d: arcD, fill: "none", stroke: "url(#gAccent)", "stroke-width": "3", "stroke-linecap": "round", "stroke-dasharray": "10 12", "stroke-opacity": "0.7" });
    scene.appendChild(arc);
  }

  // Week chips — labels only, no percentages.
  var chips = [];
  if (railHost) {
    for (var w = 1; w <= WEEKS; w++) {
      var chip = document.createElement("div");
      chip.className = "weekchip";
      chip.innerHTML = '<div class="w">WEEK ' + w + "</div>";
      railHost.appendChild(chip);
      chips.push(chip);
    }
  }

  var week = 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function render() {
    draw(week / (WEEKS - 1));
    chips.forEach(function (c, i) { c.classList.toggle("on", i === week); });
  }
  function tick() { week = (week + 1) % WEEKS; render(); }

  render();
  // Redraw when the theme changes so the scene picks up new ink/accent.
  window.addEventListener("themechange", render);
  if (!reduce) setInterval(tick, 950);
})();
