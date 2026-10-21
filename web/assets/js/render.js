/* ==========================================================================
   GYM BADGE — shared UI render helpers
   Small pure functions that turn data.js records into HTML. Used by the
   find / coach / detail / reviews pages so cards, stars and rating blocks
   render identically everywhere. Depends on GBCatalog + GBPricing.
   ========================================================================== */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function stars(rating) {
    var full = Math.round(rating);
    var out = "";
    for (var i = 1; i <= 5; i++) out += '<span' + (i <= full ? "" : ' class="off"') + ">★</span>";
    return '<span class="stars" aria-label="' + rating + ' out of 5">' + out + "</span>";
  }

  function rating(rating, count) {
    return '<span class="rating">' + stars(rating) + "<b>" + rating.toFixed(1) + "</b>" +
      (count != null ? "<span>(" + count + ")</span>" : "") + "</span>";
  }

  function money(ngn) {
    if (!window.GBPricing) return "₦" + ngn.toLocaleString();
    return GBPricing.price(ngn, (window.GBWeb && GBWeb.getCur()) || "USD");
  }

  // Photo-ready media block for a people.js id.
  function photo(id, alt, cls) {
    var inner = window.GBPeople ? GBPeople.art(id) : "";
    var box = '<div class="ph ' + (cls || "") + '" data-photo="' + id + '">' +
      '<div class="ph-fallback">' + inner + "</div></div>";
    return box;
  }

  // Hydrate any [data-photo] blocks that already have a real photo file.
  function hydratePhotos(root) {
    if (!window.GBPeople) return;
    (root || document).querySelectorAll("[data-photo]:not([data-hydrated])").forEach(function (box) {
      box.setAttribute("data-hydrated", "1");
      var id = box.getAttribute("data-photo");
      GBPeople.findPhoto(id).then(function (url) {
        if (!url) return;
        var im = document.createElement("img");
        im.className = "ph-img"; im.alt = box.getAttribute("data-alt") || ""; im.src = url;
        im.onload = function () { box.classList.add("ph-ready"); box.appendChild(im); };
      });
    });
  }

  function gymCard(g) {
    var open = g.open
      ? '<span class="pill pill-open">Open now</span>'
      : '<span class="pill pill-closed">Closed</span>';
    var verified = g.verified ? '<span class="pill pill-verified">Verified</span>' : "";
    return (
      '<a class="gcard reveal" href="/gym?id=' + encodeURIComponent(g.id) + '">' +
        '<div class="gph">' + photo(g.photo, g.name) +
          '<span class="status">' + open + "</span>" +
          '<button class="fav" type="button" aria-label="Save ' + esc(g.name) + '" data-fav="' + esc(g.id) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>' +
          "</button>" +
        "</div>" +
        '<div class="body">' +
          "<div>" + verified + "</div>" +
          "<h3>" + esc(g.name) + "</h3>" +
          '<div class="loc">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' +
            esc(g.area) + ", " + esc(g.city) + " · " + g.dist + " km</div>" +
          rating(g.rating, g.reviews) +
          '<p class="blurb">' + esc(g.blurb) + "</p>" +
          '<div class="tags">' + g.tags.slice(0, 4).map(function (t) { return '<span class="tagchip">' + esc(t) + "</span>"; }).join("") + "</div>" +
          '<div class="foot">' +
            '<span class="price"><b>' + money(g.dayPassNgn) + '</b> <small>day pass</small></span>' +
            '<span class="btn btn-primary btn-sm">View gym</span>' +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }

  function coachCard(c) {
    var verified = c.verified ? '<span class="pill pill-verified">Verified</span>' : "";
    return (
      '<a class="gcard reveal" href="/coach?id=' + encodeURIComponent(c.id) + '">' +
        '<div class="gph" style="aspect-ratio:16/10">' + photo(c.photo, c.name) + "</div>" +
        '<div class="body">' +
          "<div>" + verified + "</div>" +
          "<h3>" + esc(c.name) + "</h3>" +
          '<div class="loc">' + esc(c.specialty) + " · " + esc(c.city) + "</div>" +
          rating(c.rating, c.reviews) +
          '<p class="blurb">' + esc(c.blurb) + "</p>" +
          '<div class="tags">' + c.certs.slice(0, 2).map(function (t) { return '<span class="tagchip">' + esc(t) + "</span>"; }).join("") + "</div>" +
          '<div class="foot">' +
            '<span class="price"><b>' + money(c.rateNgn) + '</b> <small>/ session</small></span>' +
            '<span class="btn btn-primary btn-sm">View coach</span>' +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }

  function reviewCard(r) {
    return (
      '<article class="review reveal">' +
        '<div class="rv-head">' +
          '<div class="rv-ava" data-photo="' + esc(r.avatar) + '"><div class="ph-fallback">' +
            (window.GBPeople ? GBPeople.art(r.avatar) : "") + "</div></div>" +
          "<div><div class='rv-name'>" + esc(r.name) + "</div>" +
            "<div class='rv-where'>" + esc(r.where) + "</div></div>" +
        "</div>" +
        stars(r.rating) +
        '<div class="rv-title">' + esc(r.title) + "</div>" +
        '<div class="rv-text">' + esc(r.text) + "</div>" +
        '<div class="rv-date">' + esc(r.date) + " · Verified member</div>" +
      "</article>"
    );
  }

  // Star-rating distribution block (from an array of ratings).
  function ratingSummary(reviews) {
    var counts = [0, 0, 0, 0, 0];
    var sum = 0;
    reviews.forEach(function (r) { counts[r.rating - 1]++; sum += r.rating; });
    var avg = reviews.length ? sum / reviews.length : 0;
    var bars = "";
    for (var s = 5; s >= 1; s--) {
      var pct = reviews.length ? Math.round((counts[s - 1] / reviews.length) * 100) : 0;
      bars +=
        '<div class="rev-bar"><span>' + s + ' ★</span><div class="track">' +
          '<div class="fill" style="width:' + pct + '%"></div></div><span>' + counts[s - 1] + "</span></div>";
    }
    return (
      '<div class="rev-summary">' +
        "<div><div class='rev-big'>" + avg.toFixed(1) + "</div>" +
          stars(avg) +
          "<div class='muted' style='margin-top:6px'>" + reviews.length + " verified reviews</div></div>" +
        '<div class="rev-bars">' + bars + "</div>" +
      "</div>"
    );
  }

  function checkList(items) {
    var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    return '<ul class="check-list">' + items.map(function (t) {
      return "<li>" + check + "<span>" + esc(t) + "</span></li>";
    }).join("") + "</ul>";
  }

  window.GBUI = {
    esc: esc, stars: stars, rating: rating, money: money, photo: photo,
    hydratePhotos: hydratePhotos, gymCard: gymCard, coachCard: coachCard,
    reviewCard: reviewCard, ratingSummary: ratingSummary, checkList: checkList
  };
})(typeof window !== "undefined" ? window : this);
