/* GYM BADGE — payments (Stripe first)
   Stripe is the primary processor for cards, Apple Pay, Google Pay and bank
   transfer. Pi Network and stablecoins remain available as alternatives.

   DEMO mode is on while no keys are present — the full UI/flow runs, but no
   money moves. To go live:
     1. Put your Stripe publishable key in KEYS.stripePublishable.
     2. Create PaymentIntents on YOUR backend (never in the browser) and return
        the client_secret — see createIntent() below.
     3. Confirm with Stripe.js / the Payment Element or the Payment Request
        Button (Apple/Google Pay).
   Stripe handles PCI compliance, SCA/3DS and multi-currency for you.
*/
window.GBPay = (function () {
  "use strict";

  var KEYS = {
    stripePublishable: "",      // e.g. "pk_live_..."
    stripeBackend: "",          // your server that creates PaymentIntents
    piNetworkAppId: "",         // optional Pi alternative
    cryptoBackend: ""           // optional stablecoin alternative
  };

  var DEMO = !KEYS.stripePublishable;

  // Ways to activate a membership. primary:true = the default, recommended path.
  var RAILS = [
    { id:"card",   name:"Credit / debit card",     provider:"Stripe",         icon:"💳", primary:true },
    { id:"apple",  name:"Apple Pay · Google Pay",  provider:"Stripe",         icon:"🍎", primary:true },
    { id:"bank",   name:"Bank transfer",           provider:"Stripe",         icon:"🏦" },
    { id:"pi",     name:"Pi Network (PI)",         provider:"Pi SDK",         icon:"π" },
    { id:"usdt",   name:"USDT / USDC stablecoin",  provider:"Stripe Crypto",  icon:"🪙" }
  ];

  /* ---- Currency helpers (display only; backend locks the real rate) ---- */
  function ngnTo(code, ngn) {
    var perNgn = {
      NGN:1, USD:1/1550, EUR:1/1680, GBP:1/1980, CAD:1/2130, AUD:1/2380,
      GHS:1/128, KES:1/20, ZAR:1/8.6, EGP:1/32, INR:1/13, AED:1/421,
      SAR:1/413, BRL:1/5.5, MXN:1/11.5, JPY:1/9.6
    }[code];
    return perNgn == null ? ngn : ngn * perNgn;
  }
  function fmt(code, amt) {
    var sym = { NGN:"₦",USD:"$",EUR:"€",GBP:"£",CAD:"CA$",AUD:"A$",GHS:"GH₵",KES:"KSh",ZAR:"R",EGP:"E£",INR:"₹",AED:"د.إ",SAR:"﷼",BRL:"R$",MXN:"MX$",JPY:"¥" }[code] || "";
    var dp = (code==="JPN"||code==="JPY"||code==="NGN"||code==="KES") ? 0 : 2;
    try { return sym + amt.toLocaleString(undefined,{minimumFractionDigits:dp,maximumFractionDigits:dp}); }
    catch(e){ return sym + amt.toFixed(dp); }
  }
  // Stripe settles in the smallest currency unit (kobo/cents).
  function toMinor(code, amt) {
    var zeroDecimal = (code === "JPY" || code === "NGN" || code === "KES");
    return zeroDecimal ? Math.round(amt) : Math.round(amt * 100);
  }

  /* ---- Stripe flow ------------------------------------------------------
     LIVE:
       const res = await fetch(KEYS.stripeBackend + "/create-intent", {
         method:"POST", headers:{ "Content-Type":"application/json" },
         body: JSON.stringify({ amount: minor, currency: code.toLowerCase(), plan })
       });
       const { clientSecret } = await res.json();
       const stripe = Stripe(KEYS.stripePublishable);
       // Card + bank via Payment Element, or Apple/Google Pay via
       // stripe.paymentRequestButton — both confirm the same clientSecret.
       const { error } = await stripe.confirmCardPayment(clientSecret, {...});
  ---------------------------------------------------------------------- */
  function createIntent(minor, currency) {
    if (DEMO) return Promise.resolve({ clientSecret: "demo_secret_" + Date.now() });
    return fetch(KEYS.stripeBackend + "/create-intent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: minor, currency: String(currency).toLowerCase() })
    }).then(function (r) { return r.json(); });
  }

  function payStripe(railId, amountNgn, currency) {
    var minor = toMinor(currency, ngnTo(currency, amountNgn));
    return createIntent(minor, currency).then(function (intent) {
      if (DEMO) return { ok:true, ref:"DEMO-STRIPE-" + Date.now().toString().slice(-6), demo:true, rail:"Stripe" };
      // LIVE: confirm with Stripe.js here (Payment Element or Payment Request
      // Button). On success Stripe fires webhooks to your backend to mark the
      // subscription active — do not trust the client for entitlements.
      return { ok:false, reason:"Add your Stripe confirm step" };
    });
  }

  function payPi(amountNgn, currency) {
    if (DEMO) return Promise.resolve({ ok:true, ref:"DEMO-PI-" + Date.now().toString().slice(-6), demo:true, rail:"Pi Network" });
    // LIVE: pi.createPayment({...}) with the Pi SDK.
    return Promise.resolve({ ok:false, reason:"Add your Pi SDK step" });
  }

  function upgrade(railId, amountNgn, currency) {
    switch (railId) {
      case "card":
      case "apple":
      case "bank":
      case "usdt":   // Stripe Crypto / Payment Element path
        return payStripe(railId, amountNgn, currency);
      case "pi":
        return payPi(amountNgn, currency);
      default:
        return Promise.resolve({ ok:false, reason:"Unknown payment method" });
    }
  }

  return { RAILS:RAILS, KEYS:KEYS, DEMO:DEMO, upgrade:upgrade, ngnTo:ngnTo, fmt:fmt, toMinor:toMinor };
})();
