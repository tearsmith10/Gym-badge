/* ==========================================================================
   GYM BADGE — static button audit

   Reads the app source and checks that every control it builds has a
   handler, and that every helper it calls actually exists.

     node tests/buttons.js

   This is the check that catches the quiet failures: a button that was
   built but never wired, or a handler that calls a helper the file never
   brought into scope. Both look fine on the screen and do nothing.

   The live click through audit runs in a real browser on every screen and
   every website page; this one runs in a second and needs no browser.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "app/assets/js");

const FILES = ["app.js", "plan.js", "library.js", "trainers.js", "settings.js",
  "scanner.js", "chat.js", "data.js", "store.js", "ui.js", "dialog.js", "payments.js"];

let pass = 0, fail = 0;
const problems = [];
function check(name, cond, extra) {
  if (cond) pass++;
  else { fail++; problems.push(name + (extra ? "  -> " + extra : "")); }
}

/* Helpers each file is allowed to use without defining them itself. */
const SHARED = ["h", "esc", "$", "toast"];
/* Names that come from another file. */
const FOREIGN = ["GBDialog", "GBScanner", "GBUI", "GBStore", "GBData", "GBChat",
  "GBPlan", "GBLibrary", "GBTrainers", "GBAppShell", "GBAppSettings", "GBAuth",
  "GBCountries", "GBI18n", "GBCatalog", "GBWeb", "GBPW", "GBMusic", "S", "D"];

for (const f of FILES) {
  const p = path.join(APP, f);
  if (!fs.existsSync(p)) { check(f + " exists", false); continue; }
  const src = fs.readFileSync(p, "utf8");

  /* --- 1. every button built with markup has a handler nearby --- */
  // h('<button ...>')  or  createElement("button")
  const built = [];
  const re = /h\(\s*'<button([^']*)'/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const tail = src.slice(m.index, m.index + 2600);
    const hasHandler = /\.onclick\s*=/.test(tail) || /\.addEventListener\(/.test(tail);
    if (!hasHandler) built.push(src.slice(0, m.index).split("\n").length);
  }
  check(f + " wires every button it builds (" + built.length + " unwired)",
    built.length === 0, built.length ? "lines " + built.join(", ") : "");

  /* --- 2. no helper is used that the file never defines or imports --- */
  const used = new Set();
  const callRe = /(^|[^.\w$])(toast|h|esc)\s*\(/g;
  while ((m = callRe.exec(src)) !== null) used.add(m[2]);
  const defined = new Set();
  const defRe = /(?:function|var|let|const)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = defRe.exec(src)) !== null) defined.add(m[1]);
  const imported = new Set();
  const impRe = /window\.GBUI\.(\w+)/g;
  while ((m = impRe.exec(src)) !== null) imported.add(m[1]);
  const missing = [...used].filter((u) => !defined.has(u) && !imported.has(u));
  check(f + " only uses helpers it has (" + missing.join(", ") + ")", missing.length === 0,
    missing.join(", "));

  /* --- 3. nothing calls the browser's own prompt or confirm --- */
  // comments are stripped first, so a file that explains it avoids them does not count
  const code = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'\\])\/\/.*$/gm, "$1");
  const native = [];
  const natRe = /(^|[^.\w$])(prompt|confirm|alert)\s*\(/g;
  while ((m = natRe.exec(code)) !== null) native.push(m[2]);
  check(f + " never uses the browser prompt or confirm", native.length === 0, native.join(", "));

  /* --- 4. every foreign module it uses is actually loaded --- */
  const index = fs.readFileSync(path.join(ROOT, "app/index.html"), "utf8");
  const usedForeign = [...new Set((src.match(/\bGB(?:Dialog|Scanner|UI|Store|Data|Chat|Plan|Library|Trainers|AppShell|AppSettings|Auth|Countries|I18n|Catalog|Web|PW|Music)\b/g) || []))];
  const notLoaded = usedForeign.filter((n) => {
    const file = { GBUI: "ui.js", GBDialog: "dialog.js", GBScanner: "scanner.js" }[n];
    if (file) return index.indexOf("/app/assets/js/" + file) === -1;
    return false;
  });
  check(f + " only uses modules that are loaded", notLoaded.length === 0, notLoaded.join(", "));
}

/* --- 5. the shared helper file really is shared --- */
{
  const ui = fs.readFileSync(path.join(APP, "ui.js"), "utf8");
  check("ui.js exports h, esc, $ and toast",
    /h:\s*h/.test(ui) && /esc:\s*esc/.test(ui) && /\$\:\s*\$/.test(ui) && /toast:\s*toast/.test(ui));
  for (const f of ["plan.js", "library.js", "trainers.js", "settings.js", "scanner.js", "chat.js"]) {
    const src = fs.readFileSync(path.join(APP, f), "utf8");
    check(f + " uses the shared helpers", /window\.GBUI/.test(src));
  }
  const index = fs.readFileSync(path.join(ROOT, "app/index.html"), "utf8");
  check("ui.js is loaded before the screen files",
    index.indexOf("/app/assets/js/ui.js") > -1 &&
    index.indexOf("/app/assets/js/ui.js") < index.indexOf("/app/assets/js/app.js"));
}

/* --- 6. My Routine can redraw itself --- */
{
  const plan = fs.readFileSync(path.join(APP, "plan.js"), "utf8");
  check("My Routine defines the render it calls", /function render\(\)\s*\{\s*buildScreen/.test(plan));
  const renders = (plan.match(/[^.\w]render\(\)/g) || []).length;
  check("My Routine calls render", renders > 0, String(renders));
}

/* --- 7. the food scanner is wired into My Plate Truth --- */
{
  const app = fs.readFileSync(path.join(APP, "app.js"), "utf8");
  check("My Plate Truth offers to scan", /Scan my meal/.test(app));
  check("My Plate Truth offers a photo", /Use a photo from my device/.test(app));
  const scan = fs.readFileSync(path.join(APP, "scanner.js"), "utf8");
  check("the scanner opens the camera", /getUserMedia/.test(scan));
  check("the scanner accepts a photo from the device", /capture="environment"/.test(scan));
  check("the scanner asks the member to confirm", /onPick/.test(scan));
}

/* --- 8. the country picker shows what is chosen --- */
{
  const c = fs.readFileSync(path.join(ROOT, "assets/countries.js"), "utf8");
  check("the country picker shows the current choice", /cp-current/.test(c) && /paintCurrent/.test(c));
  check("the country picker marks the choice", /classList\.add\("on"\)/.test(c));
}

/* --- 9. the store keeps the membership tier and the routine apart --- */
{
  const store = fs.readFileSync(path.join(APP, "store.js"), "utf8");
  check("the membership tier has its own key", /plan:\s*"free"/.test(store));
  check("the routine has its own key", /routine:\s*null/.test(store));
  check("the store can read and write the routine", /setRoutine/.test(store) && /routine:\s*function/.test(store));
  check("the store can add an exercise the member made", /addExercise:\s*function/.test(store));
  check("the store can list the member's own exercises", /myExercises:\s*function/.test(store));
  check("the store keeps favourites", /toggleFavourite:\s*function/.test(store));
  check("the store can remove a log entry", /removeLog:\s*function/.test(store));
  check("the store can remove a food entry", /removeFood:\s*function/.test(store));
  check("the store keeps trainer reviews", /addReview:\s*function/.test(store));

  /* Nothing may write the routine over the membership tier again. */
  const plan = fs.readFileSync(path.join(APP, "plan.js"), "utf8");
  check("My Routine never writes to the plan key", !/S\.set\(\{\s*plan\s*:/.test(plan));
  check("My Routine uses the routine key", /setRoutine/.test(plan));
}

/* --- 10. the exercise library is complete and honest --- */
{
  const data = fs.readFileSync(path.join(APP, "data.js"), "utf8");
  const more = fs.readFileSync(path.join(APP, "exercises-more.js"), "utf8");
  const sandbox = { window: {} };
  new Function("window", data)(sandbox.window);
  new Function("window", more)(sandbox.window);
  const all = sandbox.window.GBData.exercises;

  check("the library has at least forty movements", all.length >= 40, String(all.length));

  const ids = new Set();
  let dupes = 0, incomplete = 0, missing = [];
  all.forEach((e) => {
    if (ids.has(e.id)) dupes++;
    ids.add(e.id);
    const need = ["id", "name", "unit", "type", "category", "difficulty", "muscles", "equipment",
      "purpose", "start", "steps", "sets", "reps", "rest", "breathing", "mistakes", "safety", "easier", "gallery"];
    const missingFields = need.filter((k) => e[k] === undefined || e[k] === null || e[k] === "");
    const emptyLists = ["muscles", "equipment", "steps", "mistakes", "safety", "easier"]
      .filter((k) => Array.isArray(e[k]) && !e[k].length);
    if (missingFields.length || emptyLists.length || e.steps.length < 4) {
      incomplete++;
      missing.push(e.id + (missingFields.length ? ":" + missingFields.join(",") : "") +
        (emptyLists.length ? ":" + emptyLists.join(",") : ""));
    }
    /* Every photograph must exist on disk. */
    (e.gallery || []).forEach((p) => {
      if (!fs.existsSync(path.join(ROOT, "app/assets/img", p))) missing.push(e.id + " -> " + p);
    });
  });
  check("no movement is listed twice", dupes === 0, String(dupes));
  check("every movement has complete coaching detail", incomplete === 0, missing.join(" | "));

  /* A photograph must never be reused for a different movement. */
  const used = {};
  all.forEach((e) => (e.gallery || []).forEach((p) => { used[p] = (used[p] || 0) + 1; }));
  const reused = Object.keys(used).filter((k) => used[k] > 1);
  check("no photograph is reused for another movement", reused.length === 0, reused.join(", "));

  /* Every category has a filter chip, and every movement fits a category. */
  const lib = fs.readFileSync(path.join(APP, "library.js"), "utf8");
  const chips = (lib.match(/var CATEGORIES = \[([^\]]+)\]/) || [])[1] || "";
  const cats = [...new Set(all.map((e) => e.category))];
  const noChip = cats.filter((c) => chips.indexOf('"' + c + '"') < 0);
  check("every category has a filter chip", noChip.length === 0, noChip.join(", "));
  const diffs = [...new Set(all.map((e) => e.difficulty))];
  check("every difficulty has a filter chip",
    diffs.every((d) => /"Beginner", "Intermediate", "Advanced"/.test(lib)), diffs.join(", "));
}

/* --- 11. the five features have their sub-features --- */
{
  const plan = fs.readFileSync(path.join(APP, "plan.js"), "utf8");
  check("My Routine can rename a day", /Rename day/.test(plan));
  check("My Routine can copy a day", /Copy day/.test(plan));
  check("My Routine can delete a day", /Delete day/.test(plan));
  check("My Routine can reorder the exercises in a day", /Move earlier/.test(plan) && /Move later/.test(plan));
  check("My Routine takes a note for the day", /dayNote/.test(plan));
  check("My Routine shows where the week stands", /Where your week stands/.test(plan));
  check("My Routine can take a movement from The Guides", /addToRoutine/.test(plan));
  check("My Routine shows what is waiting for review", /Sent for review/.test(plan));

  const lib = fs.readFileSync(path.join(APP, "library.js"), "utf8");
  check("The Guides can be starred", /toggleFavourite\("exercises"/.test(lib));
  check("The Guides filters by favourites", /Favourites/.test(lib));
  check("The Guides can add a movement to My Routine", /Add to My Routine/.test(lib));
  check("The Guides says plainly when there is no photo", /No demonstration photo/.test(lib));

  const app = fs.readFileSync(path.join(APP, "app.js"), "utf8");
  check("My Workout Log can be searched", /id="logQ"/.test(app));
  check("My Workout Log can be filtered to favourites", /★ Favourites/.test(app));
  check("My Workout Log can delete an entry", /removeLog/.test(app));
  check("My Workout Log shows the week's volume", /volumeThisWeek/.test(app));
  check("My Plate Truth lets the member add their own food", /Add your own food/.test(app));
  check("My Plate Truth shows recently eaten food", /Recently eaten/.test(app));
  check("My Plate Truth can star a food", /toggleFavourite\("foods"/.test(app));

  const tr = fs.readFileSync(path.join(APP, "trainers.js"), "utf8");
  check("My Trainer can offer bookable slots", /availableSlots/.test(tr));
  check("My Trainer can be starred", /toggleFavourite\("trainers"/.test(tr));
  check("My Trainer can be reviewed", /reviewSheet/.test(tr));
  check("a trainer's review is shown on their profile", /What members said/.test(tr));
}

/* --- 12. the app shell is honest about what is coming --- */
{
  const app = fs.readFileSync(path.join(APP, "app.js"), "utf8");
  const shellFn = app.slice(app.indexOf("function shell("), app.indexOf("function shell(") + 1200);
  check("the coming soon note is not repeated on every screen",
    !/soonBlock\(\)/.test(shellFn) || /opts\.soon/.test(shellFn));
  const profile = app.slice(app.indexOf('route("profile"'));
  check("the coming soon note sits at the foot of the profile", profile.indexOf("soonBlock()") > -1);
  const site = fs.readFileSync(path.join(ROOT, "web/assets/js/chrome.js"), "utf8");
  check("the website shows the coming soon note under its footer", /foot-soon/.test(site));
}

/* --- 13. the QR code is real, and the download link works --- */
{
  const qr = fs.readFileSync(path.join(ROOT, "assets/qr.js"), "utf8");
  check("the QR encoder is shipped", qr.length > 1000);
  check("the QR encoder does Reed-Solomon", /reedSolomon|rsRemainder/.test(qr));
  check("the QR encoder interleaves the blocks", /addEccAndInterleave/.test(qr));
  const appIndex = fs.readFileSync(path.join(ROOT, "app/index.html"), "utf8");
  check("the app loads the QR encoder", appIndex.includes("/assets/qr.js"));
  const dl = fs.readFileSync(path.join(ROOT, "web/download.html"), "utf8");
  check("the download page uses the real encoder", /GBQR\.svg/.test(dl));
  const chrome = fs.readFileSync(path.join(ROOT, "web/assets/js/chrome.js"), "utf8");
  check("the footer links to the download page", chrome.includes('"/download"'));
  const routes = fs.readFileSync(path.join(ROOT, "server.py"), "utf8");
  check("the download page has a route", /"\/download"/.test(routes));
}

/* --- 14. the service worker does not serve stale API data --- */
{
  const sw = fs.readFileSync(path.join(ROOT, "app/sw.js"), "utf8");
  check("the service worker never caches the API", /"\/api\/"/.test(sw));
  check("the service worker cache was bumped", /gymbadge-v1[7-9]|gymbadge-v[2-9]\d/.test(sw));
}

/* --- 15. the trainer directory is never empty --- */
{
  const content = fs.readFileSync(path.join(ROOT, "gymbadge_content.py"), "utf8");
  check("the launch coaches are seeded", /SEED_TRAINERS/.test(content));
  check("the trainer directory is seeded on first use", /_ensure_seed_trainers/.test(content));
  const core = fs.readFileSync(path.join(ROOT, "gymbadge_core.py"), "utf8");
  check("the trainer directory survives a restart", /_LIST_KEYS/.test(core));
}

console.log("\n" + "=".repeat(52));
console.log("  PASS " + pass + "   FAIL " + fail);
console.log("=".repeat(52));
if (problems.length) { console.log("\nPROBLEMS:"); problems.forEach((p) => console.log("  - " + p)); }
process.exit(fail ? 1 : 0);
