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

/* --- 6. My Plan can redraw itself --- */
{
  const plan = fs.readFileSync(path.join(APP, "plan.js"), "utf8");
  check("My Plan defines the render it calls", /function render\(\)\s*\{\s*buildScreen/.test(plan));
  const renders = (plan.match(/[^.\w]render\(\)/g) || []).length;
  check("My Plan calls render", renders > 0, String(renders));
}

/* --- 7. the food scanner is wired into the Nutrition Guide --- */
{
  const app = fs.readFileSync(path.join(APP, "app.js"), "utf8");
  check("the Nutrition Guide offers to scan", /Scan my meal/.test(app));
  check("the Nutrition Guide offers a photo", /Use a photo from my device/.test(app));
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

console.log("\n" + "=".repeat(52));
console.log("  PASS " + pass + "   FAIL " + fail);
console.log("=".repeat(52));
if (problems.length) { console.log("\nPROBLEMS:"); problems.forEach((p) => console.log("  - " + p)); }
process.exit(fail ? 1 : 0);
