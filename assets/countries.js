/* ==========================================================================
   GYM BADGE — country catalogue + searchable country picker

   A country is NOT a language. Nigeria speaks English, Yoruba, Hausa, Igbo
   and more; Switzerland speaks four official languages. So this is a
   completely separate control from the language picker.

   Each country carries:
     flag    – emoji flag, renders everywhere with no image request
     name    – English name
     code    – ISO 3166-1 alpha-2 country code
     dial    – international dialling code
     langs   – the languages actually spoken there (for reference)

   Usage
   -----
     GBCountries.list()                     -> all countries
     GBCountries.find(code)                -> one country
     GBCountries.picker({ onChange })       -> a <div> you can drop in
     GBCountries.format(phone, countryCode) -> "+234 801 234 5678"
   ========================================================================== */
(function (global) {
  "use strict";

  /* [name, ISO alpha-2, dialling code] */
  var RAW = [
    ["Nigeria", "NG", "+234"], ["Ghana", "GH", "+233"], ["Kenya", "KE", "+254"],
    ["South Africa", "ZA", "+27"], ["Egypt", "EG", "+20"], ["United Kingdom", "GB", "+44"],
    ["United States", "US", "+1"], ["Canada", "CA", "+1"], ["Australia", "AU", "+61"],
    ["Germany", "DE", "+49"], ["France", "FR", "+33"], ["Spain", "ES", "+34"],
    ["Italy", "IT", "+39"], ["Portugal", "PT", "+351"], ["Netherlands", "NL", "+31"],
    ["Belgium", "BE", "+32"], ["Ireland", "IE", "+353"], ["Poland", "PL", "+48"],
    ["Sweden", "SE", "+46"], ["Norway", "NO", "+47"], ["Denmark", "DK", "+45"],
    ["Finland", "FI", "+358"], ["Switzerland", "CH", "+41"], ["Austria", "AT", "+43"],
    ["United Arab Emirates", "AE", "+971"], ["Saudi Arabia", "SA", "+966"],
    ["Qatar", "QA", "+974"], ["Kuwait", "KW", "+965"], ["Bahrain", "BH", "+973"],
    ["Oman", "OM", "+968"], ["Jordan", "JO", "+962"], ["Lebanon", "LB", "+961"],
    ["Türkiye", "TR", "+90"], ["Israel", "IL", "+972"], ["Iran", "IR", "+98"],
    ["Iraq", "IQ", "+964"], ["Morocco", "MA", "+212"], ["Algeria", "DZ", "+213"],
    ["Tunisia", "TN", "+216"], ["Senegal", "SN", "+221"], ["Ivory Coast", "CI", "+225"],
    ["Cameroon", "CM", "+237"], ["Gabon", "GA", "+241"], ["Congo", "CG", "+242"],
    ["Democratic Republic of the Congo", "CD", "+243"], ["Angola", "AO", "+244"],
    ["Uganda", "UG", "+256"], ["Tanzania", "TZ", "+255"], ["Rwanda", "RW", "+250"],
    ["Burundi", "BI", "+257"], ["Ethiopia", "ET", "+251"], ["Somalia", "SO", "+252"],
    ["Djibouti", "DJ", "+253"], ["Eritrea", "ER", "+291"], ["Sudan", "SD", "+249"],
    ["South Sudan", "SS", "+211"], ["Zambia", "ZM", "+260"], ["Zimbabwe", "ZW", "+263"],
    ["Malawi", "MW", "+265"], ["Botswana", "BW", "+267"], ["Namibia", "NA", "+264"],
    ["Mozambique", "MZ", "+258"], ["Madagascar", "MG", "+261"], ["Mauritius", "MU", "+230"],
    ["Seychelles", "SC", "+248"], ["Sierra Leone", "SL", "+232"], ["Liberia", "LR", "+231"],
    ["Guinea", "GN", "+224"], ["Gambia", "GM", "+220"], ["Ghana (Accra)", "GH", "+233"],
    ["India", "IN", "+91"], ["Pakistan", "PK", "+92"], ["Bangladesh", "BD", "+880"],
    ["Sri Lanka", "LK", "+94"], ["Nepal", "NP", "+977"], ["Bhutan", "BT", "+975"],
    ["Maldives", "MV", "+960"], ["Afghanistan", "AF", "+93"], ["Uzbekistan", "UZ", "+998"],
    ["Kazakhstan", "KZ", "+7"], ["Turkmenistan", "TM", "+993"], ["Kyrgyzstan", "KG", "+996"],
    ["Tajikistan", "TJ", "+992"], ["China", "CN", "+86"], ["Hong Kong", "HK", "+852"],
    ["Macau", "MO", "+853"], ["Taiwan", "TW", "+886"], ["Japan", "JP", "+81"],
    ["South Korea", "KR", "+82"], ["North Korea", "KP", "+850"], ["Mongolia", "MN", "+976"],
    ["Vietnam", "VN", "+84"], ["Thailand", "TH", "+66"], ["Cambodia", "KH", "+855"],
    ["Laos", "LA", "+856"], ["Myanmar", "MM", "+95"], ["Malaysia", "MY", "+60"],
    ["Singapore", "SG", "+65"], ["Indonesia", "ID", "+62"], ["Philippines", "PH", "+63"],
    ["Brunei", "BN", "+673"], ["Timor Leste", "TL", "+670"], ["Papua New Guinea", "PG", "+675"],
    ["Fiji", "FJ", "+679"], ["Samoa", "WS", "+685"], ["Tonga", "TO", "+676"],
    ["Vanuatu", "VU", "+678"], ["Solomon Islands", "SB", "+677"], ["New Zealand", "NZ", "+64"],
    ["United Arab Emirates (Dubai)", "AE", "+971"], ["Russia", "RU", "+7"],
    ["Ukraine", "UA", "+380"], ["Belarus", "BY", "+375"], ["Poland (Warsaw)", "PL", "+48"],
    ["Romania", "RO", "+40"], ["Bulgaria", "BG", "+359"], ["Serbia", "RS", "+381"],
    ["Croatia", "HR", "+385"], ["Slovenia", "SI", "+386"], ["Slovakia", "SK", "+421"],
    ["Czechia", "CZ", "+420"], ["Hungary", "HU", "+36"], ["Greece", "GR", "+30"],
    ["Cyprus", "CY", "+357"], ["Malta", "MT", "+356"], ["Albania", "AL", "+355"],
    ["Bosnia and Herzegovina", "BA", "+387"], ["North Macedonia", "MK", "+389"],
    ["Moldova", "MD", "+373"], ["Georgia", "GE", "+995"], ["Armenia", "AM", "+374"],
    ["Azerbaijan", "AZ", "+994"], ["Iceland", "IS", "+354"], ["Luxembourg", "LU", "+352"],
    ["Estonia", "EE", "+372"], ["Latvia", "LV", "+371"], ["Lithuania", "LT", "+370"],
    ["Japan (Tokyo)", "JP", "+81"], ["Indonesia (Jakarta)", "ID", "+62"],
    ["Brazil", "BR", "+55"], ["Argentina", "AR", "+54"], ["Chile", "CL", "+56"],
    ["Colombia", "CO", "+57"], ["Peru", "PE", "+51"], ["Venezuela", "VE", "+58"],
    ["Ecuador", "EC", "+593"], ["Bolivia", "BO", "+591"], ["Paraguay", "PY", "+595"],
    ["Uruguay", "UY", "+598"], ["Cuba", "CU", "+53"], ["Dominican Republic", "DO", "+1 809"],
    ["Haiti", "HT", "+509"], ["Jamaica", "JM", "+1 876"], ["Trinidad and Tobago", "TT", "+1 868"],
    ["Barbados", "BB", "+1 246"], ["Bahamas", "BS", "+1 242"], ["Guyana", "GY", "+592"],
    ["Suriname", "SR", "+597"], ["Belize", "BZ", "+501"], ["New Caledonia", "NC", "+687"],
    ["French Polynesia", "PF", "+689"], ["Réunion", "RE", "+262"], ["Mauritania", "MR", "+222"],
    ["Mali", "ML", "+223"], ["Niger", "NE", "+227"], ["Chad", "TD", "+235"],
    ["Benin", "BJ", "+229"], ["Togo", "TG", "+228"], ["Guinea Bissau", "GW", "+245"],
    ["Cabo Verde", "CV", "+238"], ["Sao Tome and Principe", "ST", "+239"],
    ["Equatorial Guinea", "GQ", "+240"], ["Central African Republic", "CF", "+236"],
    ["Burkina Faso", "BF", "+226"], ["Mauritius (Port Louis)", "MU", "+230"],
    ["Other", "XX", ""]
  ];

  /* Regional indicators turn a two-letter code into an emoji flag. */
  function flagOf(code) {
    if (!code || code.length !== 2 || code === "XX") return "🏳️";
    var base = 0x1f1e6;
    return String.fromCodePoint(
      base + code.charCodeAt(0) - 65,
      base + code.charCodeAt(1) - 65
    );
  }

  var LIST = RAW.map(function (r) {
    return { name: r[0], code: r[1], dial: r[2], flag: flagOf(r[1]) };
  });

  function find(code) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].code === code) return LIST[i];
    return null;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Group the list so the picker reads like a country list, not a dump. */
  var REGIONS = [
    ["Africa", ["NG", "GH", "KE", "ZA", "EG", "SN", "CI", "CM", "GA", "CG", "CD", "AO",
      "UG", "TZ", "RW", "BI", "ET", "SO", "DJ", "ER", "SD", "SS", "ZM", "ZW", "MW",
      "BW", "NA", "MZ", "MG", "MU", "SC", "SL", "LR", "GN", "GM", "MR", "ML", "NE",
      "TD", "BJ", "TG", "GW", "CV", "ST", "GQ", "CF", "BF", "MA", "DZ", "TN"]],
    ["Americas", ["US", "CA", "MX", "BR", "AR", "CL", "CO", "PE", "VE", "EC", "BO",
      "PY", "UY", "CU", "DO", "HT", "JM", "TT", "BB", "BS", "GY", "SR", "BZ"]],
    ["Europe", ["GB", "IE", "FR", "DE", "ES", "PT", "IT", "NL", "BE", "LU", "CH", "AT",
      "SE", "NO", "DK", "FI", "IS", "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "CY",
      "MT", "HR", "SI", "RS", "BA", "AL", "MK", "UA", "MD", "BY", "RU"]],
    ["Middle East & Asia", ["AE", "SA", "QA", "KW", "BH", "OM", "JO", "LB", "IL", "IR",
      "IQ", "TR", "AF", "PK", "IN", "BD", "LK", "NP", "BT", "MV", "UZ", "TM", "KG",
      "TJ", "KZ", "CN", "HK", "MO", "TW", "JP", "KR", "KP", "MN", "VN", "TH", "KH",
      "LA", "MM", "MY", "SG", "BN", "PH", "ID", "TL", "PG", "FJ", "WS", "TO", "VU",
      "SB", "NZ", "NC", "PF", "RE", "AU"]],
    ["Other", ["XX"]]
  ];

  /* ---------------- searchable picker ---------------- */
  function picker(opts) {
    opts = opts || {};
    var wrap = document.createElement("div");
    wrap.className = opts.className || "country-picker";

    var search = document.createElement("input");
    search.type = "search";
    search.className = "cp-search";
    search.placeholder = opts.placeholder || "Search country or code";
    search.setAttribute("aria-label", "Search country or code");
    wrap.appendChild(search);

    var list = document.createElement("div");
    list.className = "cp-list";
    list.setAttribute("role", "listbox");
    wrap.appendChild(list);

    var selected = opts.value || "";

    function rowsFor(query) {
      var q = (query || "").trim().toLowerCase();
      var out = [];
      REGIONS.forEach(function (region) {
        var group = [];
        region[1].forEach(function (code) {
          var c = find(code);
          if (!c) return;
          if (q && c.name.toLowerCase().indexOf(q) === -1 &&
              c.code.toLowerCase().indexOf(q) === -1 &&
              c.dial.indexOf(q) === -1) return;
          group.push(c);
        });
        if (group.length) out.push({ region: region[0], countries: group });
      });
      return out;
    }

    function paint(query) {
      list.innerHTML = "";
      var groups = rowsFor(query);
      if (!groups.length) {
        list.appendChild(Object.assign(document.createElement("div"), {
          className: "cp-empty", textContent: "No country matches that search."
        }));
        return;
      }
      groups.forEach(function (g) {
        var head = document.createElement("div");
        head.className = "cp-group";
        head.textContent = g.region;
        list.appendChild(head);
        g.countries.forEach(function (c) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "cp-item" + (c.code === selected ? " on" : "");
          b.setAttribute("role", "option");
          b.setAttribute("aria-selected", c.code === selected ? "true" : "false");
          b.innerHTML = '<span class="cp-flag">' + c.flag + "</span>" +
            '<span class="cp-name">' + esc(c.name) + "</span>" +
            '<span class="cp-code">' + esc(c.code) + "</span>" +
            '<span class="cp-dial">' + esc(c.dial) + "</span>";
          b.onclick = function () {
            selected = c.code;
            if (opts.onChange) opts.onChange(c);
          };
          list.appendChild(b);
        });
      });
    }

    search.oninput = function () { paint(this.value); };
    paint("");

    return wrap;
  }

  /* "+234" + "8012345678" -> "+234 801 234 5678" */
  function formatPhone(raw, countryCode) {
    var c = find(countryCode);
    var dial = c && c.dial ? c.dial : "";
    var digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";
    var out = "";
    for (var i = 0; i < digits.length; i += 3) {
      out += (i ? " " : "") + digits.slice(i, i + 3);
    }
    return (dial ? dial + " " : "") + out;
  }

  window.GBCountries = {
    list: function () { return LIST.slice(); },
    find: find,
    flagOf: flagOf,
    picker: picker,
    formatPhone: formatPhone
  };
})(typeof window !== "undefined" ? window : this);
