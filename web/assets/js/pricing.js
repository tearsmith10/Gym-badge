/* ==========================================================================
   GYM BADGE — Pricing engine (single source of truth)
   Base currency: NGN. Premium = ₦5,000 / month.
   Rates below are indicative reference rates (1 USD ≈ ₦1,550) for display.
   Wire to a live FX feed (e.g. openexchangerates) before production launch.
   ========================================================================== */
(function (global) {
  "use strict";

  var BASE_NGN = 5000; // Premium, per month, in Naira

  // Indicative display rates: value = how many units of currency per 1 NGN.
  var CURRENCIES = [
    { code: "NGN", symbol: "₦",    name: "Nigerian Naira",        perNgn: 1,        country: "Nigeria" },
    { code: "USD", symbol: "$",    name: "US Dollar",             perNgn: 1 / 1550, country: "Global" },
    { code: "EUR", symbol: "€",    name: "Euro",                  perNgn: 1 / 1680, country: "Eurozone" },
    { code: "GBP", symbol: "£",    name: "British Pound",         perNgn: 1 / 1980, country: "United Kingdom" },
    { code: "CAD", symbol: "CA$",  name: "Canadian Dollar",       perNgn: 1 / 2130, country: "Canada" },
    { code: "AUD", symbol: "A$",   name: "Australian Dollar",     perNgn: 1 / 2380, country: "Australia" },
    { code: "GHS", symbol: "GH₵",  name: "Ghanaian Cedi",         perNgn: 1 / 128,  country: "Ghana" },
    { code: "KES", symbol: "KSh",  name: "Kenyan Shilling",       perNgn: 1 / 20,   country: "Kenya" },
    { code: "ZAR", symbol: "R",    name: "South African Rand",    perNgn: 1 / 8.6,  country: "South Africa" },
    { code: "EGP", symbol: "E£",   name: "Egyptian Pound",        perNgn: 1 / 32,   country: "Egypt" },
    { code: "INR", symbol: "₹",    name: "Indian Rupee",          perNgn: 1 / 13,   country: "India" },
    { code: "AED", symbol: "د.إ",  name: "UAE Dirham",            perNgn: 1 / 421,  country: "UAE" },
    { code: "SAR", symbol: "﷼",    name: "Saudi Riyal",           perNgn: 1 / 413,  country: "Saudi Arabia" },
    { code: "BRL", symbol: "R$",   name: "Brazilian Real",        perNgn: 1 / 5.5,  country: "Brazil" },
    { code: "MXN", symbol: "MX$",  name: "Mexican Peso",          perNgn: 1 / 11.5, country: "Mexico" },
    { code: "JPY", symbol: "¥",    name: "Japanese Yen",          perNgn: 1 / 9.6,  country: "Japan" }
  ];

  function fmt(n, code) {
    var c = byCode(code) || CURRENCIES[1];
    var dp = (code === "JPY" || code === "NGN" || code === "KES") ? 0 : 2;
    try {
      return c.symbol + n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
    } catch (e) {
      return c.symbol + n.toFixed(dp);
    }
  }

  function byCode(code) {
    for (var i = 0; i < CURRENCIES.length; i++) if (CURRENCIES[i].code === code) return CURRENCIES[i];
    return null;
  }

  // Convert an NGN amount into a target currency.
  function convertFromNgn(ngn, code) {
    var c = byCode(code);
    if (!c) return ngn;
    return ngn * c.perNgn;
  }

  // Format a base-NGN price in the chosen currency.
  function price(ngn, code) {
    return fmt(convertFromNgn(ngn, code), code);
  }

  /* ---- Consumer plans ---- */
  var PLANS = {
    free: {
      key: "free",
      name: "Starter",
      ngn: 0,
      blurb: "Everything you need to start building the habit.",
      features: [
        ["One More logging · unlimited while we test", true],
        ["Tap In equipment status · free to try", true],
        ["Plate Truth food scan · free to try", true],
        ["Tomorrow You projections · free to try", true],
        ["Your Floor gym locator & bookings", true],
        ["Streaks & progress badges", true],
        ["Full history & wearable sync", false]
      ]
    },
    premium: {
      key: "premium",
      name: "Premium",
      ngn: BASE_NGN,
      featured: true,
      blurb: "The full training + nutrition engine. Cancel anytime.",
      features: [
        ["Unlimited One More logging & full history", true],
        ["NFC / QR equipment tap & live status", true],
        ["AI food & diet scan — unlimited", true],
        ["AI body goal projections — unlimited", true],
        ["Smart rest day & meal reminders", true],
        ["Wearable sync (HealthKit / Health Connect)", true],
        ["Priority support", true],
        ["Offline first sync", true]
      ]
    },
    elite: {
      key: "elite",
      name: "Elite",
      ngn: 9500,
      blurb: "For competitors and coaches who want the edge.",
      features: [
        ["Everything in Premium", true],
        ["Personal trainer matching (v2.0)", true],
        ["Advanced recovery & load analytics", true],
        ["Custom macro & periodisation plans", true],
        ["Family / +2 seats included", true],
        ["Early access to new features", true]
      ]
    }
  };

  /* ---- Corporate / employee seat packages ----
     Priced on head count AND level of "unlimitedness" (feature tier).
     Each tier can be scaled to 5, 10, 20 or 50+ seats. ---- */
  var CORP_TIERS = [
    {
      key: "team",
      name: "Team",
      seats: 5,
      ngnPerSeat: 4000,           // ₦20,000 / mo for 5
      tag: "Small crews, studios, departments",
      features: [
        "Everything in Premium, per seat",
        "Shared streaks & team leaderboard",
        "Group booking & attendance dashboard",
        "CSV roster upload (5 / 10 / 20 seats)",
        "Email support, 48h response"
      ]
    },
    {
      key: "business",
      name: "Business",
      seats: 10,
      ngnPerSeat: 3500,           // ₦35,000 / mo for 10
      tag: "Gyms & companies, recommended",
      featured: true,
      features: [
        "Everything in Team, per seat",
        "Unlimited logging & food scans for staff",
        "Equipment backend access (maintenance records)",
        "NFC tag kit + LiveFloor dashboard",
        "Admin seat management & SSO ready",
        "Named account manager"
      ]
    },
    {
      key: "enterprise",
      name: "Enterprise",
      seats: 20,
      ngnPerSeat: 3000,           // ₦60,000 / mo for 20
      tag: "Multi branch, expatriate & large teams",
      features: [
        "Everything in Business, per seat",
        "Unlimited seats scaling (50 / 100 / 500+)",
        "Expat & multi country currency billing",
        "Custom integrations & API access",
        "SLA, security review & invoicing / PO",
        "On site onboarding & training"
      ]
    }
  ];

  /* ---- Payment methods (Stripe first) ---- */
  var PAY_METHODS = [
    { key: "card",   name: "Credit & debit card",        via: "Stripe",  icon: "card",   primary: true },
    { key: "apple",  name: "Apple Pay / Google Pay",     via: "Stripe",  icon: "phone",  primary: true },
    { key: "bank",   name: "Bank transfer",              via: "Stripe",  icon: "bank" },
    { key: "pi",     name: "Pi Network (PI)",            via: "Pi SDK",  icon: "pi" },
    { key: "usdt",   name: "USDT / USDC stablecoin",     via: "Stripe Crypto", icon: "coin" }
  ];

  var api = {
    BASE_NGN: BASE_NGN,
    CURRENCIES: CURRENCIES,
    PLANS: PLANS,
    CORP_TIERS: CORP_TIERS,
    PAY_METHODS: PAY_METHODS,
    price: price,
    fmt: fmt,
    byCode: byCode,
    convertFromNgn: convertFromNgn
  };

  // UMD-ish export: browser global + CommonJS.
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.GBPricing = api;
})(typeof window !== "undefined" ? window : this);
