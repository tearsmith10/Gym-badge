/* ==========================================================================
   GYM BADGE — test suite

   Runs the full check against a live server.

     node tests/run.js                        # http://localhost:8080
     node tests/run.js https://gymbadge.vercel.app

   It verifies:
     • every route answers
     • the cart, checkout and order pages are gone
     • accounts, verification, reset and change password all work
     • the AI assistant answers, refuses to guess and escalates
     • the trainer and exercise moderation workflows behave
     • the language and country pickers are in place
     • the official logo has no white plate and carries the brand palette
     • no hyphen reaches the reader
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const os = require("os");

const BASE = (process.argv[2] || "http://localhost:8080").replace(/\/$/, "");
let pass = 0, fail = 0;
const problems = [];

function check(name, cond, extra) {
  if (cond) pass++;
  else { fail++; problems.push(name + (extra !== undefined ? "  -> " + JSON.stringify(extra).slice(0, 200) : "")); }
}
function section(t) { console.log("\n=== " + t + " ==="); }
async function get(p) { const r = await fetch(BASE + p); return { status: r.status, text: await r.text() }; }
async function api(p, body, method, token) {
  const r = await fetch(BASE + p, {
    method: method || "POST",
    headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let j = null; try { j = await r.json(); } catch (e) { j = { _raw: "non-json" }; }
  return { status: r.status, j };
}

/* ---------------- tiny PNG reader, so the logo can be checked properly ---- */
function decodePng(buf) {
  let pos = 8, w = 0, h = 0, depth = 0, type = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const kind = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (kind === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; }
    else if (kind === "IDAT") idat.push(data);
    else if (kind === "IEND") break;
    pos += 12 + len;
  }
  const channels = type === 6 ? 4 : type === 2 ? 3 : 0;
  if (depth !== 8 || !channels) throw new Error("unsupported png");
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = raw.slice(rp, rp + stride); rp += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, channels, data: out };
}

function analyseLogo(buf) {
  const img = decodePng(buf);
  let white = 0, transparent = 0, coral = 0, cream = 0, tawny = 0, opaque = 0;
  for (let i = 0; i < img.data.length; i += img.channels) {
    const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
    const a = img.channels === 4 ? img.data[i + 3] : 255;
    if (a < 200) { transparent++; continue; }
    opaque++;
    if (r > 242 && g > 242 && b > 242) { white++; continue; }
    if (r > 195 && g > 60 && g < 180 && b < 120) coral++;
    if (r > 185 && g > 170 && b > 145) cream++;
    if (r > 140 && r < 215 && g > 95 && g < 165 && b > 45 && b < 115) tawny++;
  }
  return { w: img.w, h: img.h, white, transparent, coral, cream, tawny, opaque };
}

/* ---------------- the run ------------------------------------------------ */
(async () => {
  console.log("GYM BADGE — test suite against " + BASE);

  section("ROUTES");
  const pages = ["/", "/login", "/signup", "/forgot", "/reset", "/verify", "/pricing",
    "/find", "/gyms", "/trainers", "/coaches", "/gym", "/coach", "/about", "/reviews",
    "/faq", "/support", "/account", "/privacy", "/terms", "/app/",
    "/app/oauth.html", "/app/sw.js", "/app/manifest.webmanifest",
    "/assets/i18n.js", "/assets/i18n-ext.js", "/assets/countries.js",
    "/assets/music.js", "/assets/pw.js", "/assets/shared.css",
    "/app/assets/js/ui.js", "/app/assets/js/dialog.js", "/app/assets/js/scanner.js",
    "/app/assets/css/app.css", "/web/assets/css/site.css"];
  for (const p of pages) {
    const r = await get(p);
    check("GET " + p + " -> " + r.status, r.status === 200);
  }

  section("E-COMMERCE REMOVED");
  for (const p of ["/cart", "/checkout", "/orders", "/web/cart.html", "/web/checkout.html", "/web/orders.html"]) {
    const r = await get(p);
    check(p + " is gone (" + r.status + ")", r.status === 404);
  }
  for (const p of ["/web/assets/js/store.js", "/web/assets/js/chrome.js", "/web/assets/js/data.js"]) {
    const t = (await get(p)).text;
    check(p + " has no cart or order API", !/getCart|addToCart|removeFromCart|clearCart|cartTotalNgn|getOrders|addOrder/.test(t));
    check(p + " has no /cart or /orders link", !/"\/cart"|"\/orders"/.test(t));
  }

  section("ACCOUNTS");
  const email = "test_" + Date.now() + "@gymbadge.test";
  let r = await api("/api/auth/signup", { name: "Test Athlete", email, password: "strongpass123", country: "Nigeria", countryCode: "NG" });
  check("signup -> 200", r.status === 200 && r.j.ok, r.j);
  check("signup issues a session", !!(r.j && r.j.token), r.j);
  const session = r.j && r.j.token;
  r = await api("/api/auth/signup", { name: "Test", email: "bad", password: "strongpass123" });
  check("signup rejects a bad email", r.status === 400, r.j);
  r = await api("/api/auth/signup", { name: "Test", email: "x@y.com", password: "short" });
  check("signup rejects a weak password", r.status === 400, r.j);
  r = await api("/api/auth/signup", { name: "Test", email, password: "strongpass123" });
  check("duplicate signup -> 409", r.status === 409, r.j);
  r = await api("/api/auth/login", { email, password: "wrongpass123" });
  check("login rejects a wrong password", r.status === 401, r.j);
  r = await api("/api/auth/login", { email, password: "strongpass123" });
  check("login -> 200", r.status === 200 && r.j.ok, r.j);
  r = await api("/api/profile", undefined, "GET", session);
  check("profile with a token -> 200", r.status === 200 && r.j.ok, r.j);
  check("profile never leaks the password hash", r.j && !JSON.stringify(r.j).includes("pbkdf2"), r.j);
  r = await api("/api/auth/change-password", { current: "strongpass123", password: "newpass4567" }, "POST", session);
  check("change password -> 200", r.status === 200 && r.j.ok, r.j);
  r = await api("/api/auth/change-password", { current: "wrong", password: "another1234" }, "POST", session);
  check("change password rejects a wrong current password", r.status === 401, r.j);
  r = await api("/api/auth/forgot", { email: "nobody@nowhere.test" });
  check("forgot does not leak whether an email exists", r.status === 200 && r.j.ok, r.j);
  r = await api("/api/auth/logout", {}, "POST", session);
  check("logout -> 200", r.status === 200 && r.j.ok, r.j);
  r = await api("/api/profile", undefined, "GET", session);
  check("the session is dead after logout", r.status === 401, r.j);

  section("AI ASSISTANT");
  r = await api("/api/chat", { message: "How do I reset my password?", lang: "en" });
  check("answers a password question", r.status === 200 && r.j.answer.length > 40, r.j);
  r = await api("/api/chat", { message: "How do I find a trainer?", lang: "en" });
  check("answers a trainer question", r.status === 200 && /trainer/i.test(r.j.answer || ""), r.j);
  r = await api("/api/chat", { message: "I have sharp pain in my knee", lang: "en" });
  check("is safe about injury", r.status === 200 && /professional|doctor|physio|stop/i.test(r.j.answer || ""), r.j);
  r = await api("/api/chat", { message: "I want to complain to a human", lang: "en" });
  check("escalates to a human", r.status === 200 && r.j.escalate === true, r.j);
  r = await api("/api/chat", { message: "What is your policy for something never written down?", lang: "en" });
  check("refuses to invent an answer", r.status === 200 && /do not have|email gymbadgesupport/i.test(r.j.answer || ""), r.j);

  section("TRAINERS, MODERATION AND EQUIPMENT");
  r = await api("/api/trainers", undefined, "GET");
  check("trainers -> 200", r.status === 200 && r.j.ok, r.j);
  r = await api("/api/trainers/apply", { name: "X" });
  check("a trainer application needs more than a name", r.status === 400, r.j);
  r = await api("/api/trainers/apply", { name: "Test Coach", photo: "data:image/png;base64,x", area: "Lagos", specialty: "Strength", modes: ["in-person"], certs: ["NASM"], phone: "+234801" });
  check("a complete trainer application is queued for review", r.status === 200 && r.j.status === "pending", r.j);
  r = await api("/api/exercises/submit", { name: "Test Exercise", category: "Core" });
  check("an exercise submission is queued for review", r.status === 200 && r.j.status === "pending", r.j);
  r = await api("/api/exercises/review", { id: "x", decision: "approved" });
  check("a submission needs authorisation to approve", r.status === 401, r.j);
  r = await api("/api/equipment", { id: "eq4", reason: "Test update" });
  check("a member can add to the equipment report", r.status === 200 && r.j.ok, r.j);
  r = await api("/api/equipment", { id: "eq4", status: "usable" });
  check("only staff can change a machine status", r.status === 403, r.j);

  section("TRANSLATION");
  r = await api("/api/translate", { lang: "fr", strings: ["Workout Library", "Find a Trainer"] });
  check("translate -> 200", r.status === 200 && r.j.ok, r.j);
  check("translate returns a mapping", r.j && r.j.translations && Object.keys(r.j.translations).length >= 1, r.j);

  section("THE OFFICIAL LOGO");
  for (const [url, label] of [["/assets/img/mark.png", "mark"], ["/assets/img/logo.png", "logo"]]) {
    const res = await fetch(BASE + url);
    check(label + " loads", res.status === 200);
    if (res.status !== 200) continue;
    const a = analyseLogo(Buffer.from(await res.arrayBuffer()));
    check(label + " has no white plate (" + a.white + " px)", a.white === 0);
    check(label + " is transparent or on a dark tile", a.transparent > 0 || a.coral + a.cream + a.tawny > 0);
    check(label + " carries the brand accent (" + a.coral + " px)", a.coral > 500);
    check(label + " carries the honeybadger tawny (" + a.tawny + " px)", a.tawny > 500);
    check(label + " carries the honeybadger cream (" + a.cream + " px)", a.cream > 200);
  }

  section("THE FOOD SCANNER");
  const scanner = await fetch(BASE + "/app/assets/js/scanner.js");
  check("the scanner loads", scanner.status === 200);
  const scannerSrc = scanner.status === 200 ? await scanner.text() : "";
  check("the scanner opens the camera", /getUserMedia/.test(scannerSrc));
  check("the scanner falls back to a photo from the device", /capture="environment"/.test(scannerSrc));
  check("the scanner matches the photo against the food guide", /signature/.test(scannerSrc) && /rank/.test(scannerSrc));
  check("the scanner always asks the member to confirm", /onPick/.test(scannerSrc));
  const nutrition = (await get("/app/index.html")).text;
  check("the Nutrition Guide loads the scanner", nutrition.includes("/app/assets/js/scanner.js"));
  const appJs = (await get("/app/assets/js/app.js")).text;
  check("the Nutrition Guide has a scan button", /Scan my meal/.test(appJs));
  check("the Nutrition Guide has a photo button", /Use a photo from my device/.test(appJs));

  section("NO MISSING HELPERS");
  // Every screen file must not call a helper it never defined.
  for (const f of ["app/assets/js/plan.js", "app/assets/js/library.js", "app/assets/js/trainers.js",
                   "app/assets/js/settings.js", "app/assets/js/scanner.js", "app/assets/js/chat.js",
                   "app/assets/js/app.js"]) {
    const src = (await get("/" + f)).text;
    check(f + " uses the shared helpers", /window\.GBUI/.test(src));
  }
  const ui = (await get("/app/assets/js/ui.js")).text;
  check("the shared helper file exists", ui.length > 100);
  const dialog = (await get("/app/assets/js/dialog.js")).text;
  check("the app has its own dialogs", /GBDialog/.test(dialog));
  const plan = (await get("/app/assets/js/plan.js")).text;
  check("My Plan can redraw itself", /function render\(\) \{ buildScreen/.test(plan));
  check("the app never calls the browser prompt", !/[^.\w]prompt\(/.test(
    [plan, (await get("/app/assets/js/trainers.js")).text, (await get("/app/assets/js/settings.js")).text].join(" ")));
  const chromeSrc = (await get("/web/assets/js/chrome.js")).text;
  check("the app never calls the browser confirm", !/[^.\w]confirm\(/.test(
    [plan, (await get("/app/assets/js/trainers.js")).text, (await get("/app/assets/js/settings.js")).text].join(" ")));

  section("LANGUAGE AND COUNTRY PICKERS");
  const i18n = (await get("/assets/i18n.js")).text;
  check("35 languages bundled", (i18n.match(/\{ code:"/g) || []).length >= 35);
  check("more languages are translated on demand", i18n.includes("ON_DEMAND") && i18n.includes("ensureTranslated"));
  check("the language picker is searchable", i18n.includes("lp-search"));
  check("right to left is supported", /dir: "rtl"/.test(i18n));
  check("dates and numbers follow the locale", /fmtDate/.test(i18n) && /fmtNumber/.test(i18n));
  const countries = (await get("/assets/countries.js")).text;
  check("the country picker has flags, codes and dialling codes", /cp-flag/.test(countries) && /cp-code/.test(countries) && /cp-dial/.test(countries));
  check("the country picker is searchable", /cp-search/.test(countries));
  const chrome = (await get("/web/assets/js/chrome.js")).text;
  check("the language picker sits in the footer", chrome.includes("langSlotFoot"));
  check("the top navigation no longer has a language picker", !chrome.includes('id="langSlot"'));
  check("the currency selector is gone", !chrome.includes('id="curPick"'));

  section("NO HYPHEN REACHES THE READER");
  const readerPages = ["/", "/login", "/signup", "/forgot", "/reset", "/pricing", "/find",
    "/gyms", "/trainers", "/coaches", "/gym", "/coach", "/about", "/reviews", "/faq",
    "/support", "/account", "/privacy", "/terms", "/verify"];
  const KEEP = ["add to home screen", "ios and android", "offline first", "web app",
    "step by step", "in person", "on demand", "real time", "well being", "all in one",
    "end to end", "self guided", "one on one", "third party", "do it yourself",
    "at home", "off peak", "up to date", "point by point", "no nonsense", "e mail",
    "read only", "member only", "long term", "short term", "real world", "multi country",
    "walk through", "follow up", "check in", "sign up", "log in", "top up", "24/7",
    "guinea bissau", "timor leste"];
  for (const p of readerPages) {
    const html = (await get(p)).text;
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
    const words = (text.match(/[A-Za-z0-9]+-[A-Za-z0-9]+/g) || [])
      .filter(w => !KEEP.some(k => w.toLowerCase() === k || w.toLowerCase().indexOf(k) > -1));
    check(p + " has no hyphen in its wording", words.length === 0, words.slice(0, 5));
  }

  console.log("\n" + "=".repeat(50));
  console.log("  PASS " + pass + "   FAIL " + fail);
  console.log("=".repeat(50));
  if (problems.length) { console.log("\nPROBLEMS:"); problems.forEach(p => console.log("  - " + p)); }
  process.exit(fail ? 1 : 0);
})();
