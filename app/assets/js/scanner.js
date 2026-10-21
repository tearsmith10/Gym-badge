/* ==========================================================================
   GYM BADGE — food scanner

   The scanner in My Plate Truth. Photograph a plate and it works out
   what is most likely on it, then opens the full food guide for it.

   How the recognition works
   -------------------------
   The photo is reduced to a small colour signature and compared against the
   reference photographs of every food in the guide. That gives a ranked
   shortlist, and the member confirms which one it is. The guide is always
   shown for the food the member picks, never a guess they did not accept.

   When the server has a vision model configured the photo is also sent to
   it for a better first guess. Without one the local matcher still works
   completely offline.
   ========================================================================== */
(function (global) {
  "use strict";

  var D = global.GBData, S = global.GBStore;

  var h = window.GBUI.h, esc = window.GBUI.esc, $ = window.GBUI.$;
  var toast = window.GBUI.toast;

  /* ---------------- colour signature ----------------
     A tiny image is reduced to a grid of average colours. Two plates with
     the same food look broadly the same, so matching on this gives a
     sensible shortlist without any network call. */
  function signature(source, size) {
    size = size || 16;
    var w = 0, hgt = 0;
    if (source.naturalWidth) { w = source.naturalWidth; hgt = source.naturalHeight; }
    else { w = source.width; hgt = source.height; }
    var c = document.createElement("canvas");
    c.width = size; c.height = size;
    var g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(source, 0, 0, size, size);
    var d = g.getImageData(0, 0, size, size).data;
    var cells = [];
    for (var i = 0; i < d.length; i += 4) {
      cells.push([d[i], d[i + 1], d[i + 2]]);
    }
    return cells;
  }

  function distance(a, b) {
    var n = Math.min(a.length, b.length);
    var total = 0;
    for (var i = 0; i < n; i++) {
      var dr = a[i][0] - b[i][0], dg = a[i][1] - b[i][1], db = a[i][2] - b[i][2];
      total += dr * dr + dg * dg + db * db;
    }
    return Math.sqrt(total / (n * 3));
  }

  /* Cache the reference signatures so repeated scans stay instant. */
  var REF = null;
  function referenceSignatures() {
    if (REF) return Promise.resolve(REF);
    var names = Object.keys(D.foods);
    var jobs = names.map(function (name) {
      var f = D.foods[name];
      if (!f.photo) return Promise.resolve(null);
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
          try { resolve({ name: name, sig: signature(img) }); }
          catch (e) { resolve(null); }
        };
        img.onerror = function () { resolve(null); };
        img.src = "/app/assets/img/" + f.photo;
      });
    });
    return Promise.all(jobs).then(function (rows) {
      REF = rows.filter(Boolean);
      return REF;
    });
  }

  function rank(sig) {
    return referenceSignatures().then(function (refs) {
      return refs.map(function (r) {
        return { name: r.name, score: distance(sig, r.sig) };
      }).sort(function (a, b) { return a.score - b.score; });
    });
  }

  /* Optional server vision, used only to improve the first suggestion. */
  function serverGuess(dataUrl) {
    return fetch("/api/food-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return (j && j.ok && j.name) ? j.name : null; })
      .catch(function () { return null; });
  }

  /* ---------------- the scanner screen ---------------- */
  function open(onPick) {
    var overlay = h('<div class="sheet-bg"><div class="sheet"></div></div>');
    var panel = overlay.firstChild;

    panel.appendChild(h('<div class="sheet-head"><h3>Scan your meal</h3>' +
      '<button class="iconbtn" style="margin-left:auto" id="scX">✕</button></div>'));

    var stage = h('<div class="scan-stage"></div>');
    panel.appendChild(stage);

    var video = null, stream = null, shot = null;

    function setStatus(text, kind) {
      stage.innerHTML = '<p class="scan-status ' + (kind || "") + '">' + esc(text) + "</p>";
    }

    function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("This browser cannot open the camera. Use the photo picker below, or pick a food from the list.", "warn");
        return;
      }
      setStatus("Opening the camera…");
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then(function (s) {
          stream = s;
          video = h('<video class="scan-video" playsinline autoplay muted></video>');
          video.srcObject = s;
          stage.innerHTML = "";
          stage.appendChild(video);
          var bar = h('<div class="scan-bar"></div>');
          stage.appendChild(bar);
          var shutter = h('<button class="btn btn-primary btn-lg scan-shutter">📸 Take the photo</button>');
          shutter.onclick = function () { capture(); };
          stage.appendChild(shutter);
          var skip = h('<button class="btn btn-ghost mt">Use a photo from my device</button>');
          skip.onclick = function () { file.click(); };
          stage.appendChild(skip);
          video.play().catch(function () {});
        })
        .catch(function (err) {
          var why = (err && err.name === "NotAllowedError")
            ? "Camera permission was declined."
            : "The camera is not available on this device.";
          setStatus(why + " Use a photo from your device below, or pick a food from the list.", "warn");
          var b = h('<button class="btn btn-primary">Use a photo from my device</button>');
          b.onclick = function () { file.click(); };
          stage.appendChild(b);
        });
    }

    function stopCamera() {
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    }

    function capture() {
      if (!video) return;
      var c = document.createElement("canvas");
      c.width = video.videoWidth || 640;
      c.height = video.videoHeight || 480;
      c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
      shot = c.toDataURL("image/jpeg", 0.82);
      stopCamera();
      analyse(shot);
    }

    function analyse(dataUrl) {
      setStatus("Looking at your plate…");
      var img = new Image();
      img.onload = function () {
        var sig;
        try { sig = signature(img); } catch (e) { sig = null; }
        var local = sig ? rank(sig) : Promise.resolve([]);
        Promise.all([local, serverGuess(dataUrl)]).then(function (res) {
          var ranked = res[0];
          var serverName = res[1];
          var names = ranked.map(function (r) { return r.name; });
          if (serverName && names.indexOf(serverName) === -1) names.unshift(serverName);
          if (!names.length) names = Object.keys(D.foods);
          showShortlist(dataUrl, names.slice(0, 6));
        });
      };
      img.onerror = function () {
        showShortlist(dataUrl, Object.keys(D.foods).slice(0, 6));
      };
      img.src = dataUrl;
    }

    function showShortlist(dataUrl, names) {
      stage.innerHTML = "";
      var shotBox = h('<div class="scan-shot"><img alt="Your meal" src="' + dataUrl + '"></div>');
      stage.appendChild(shotBox);
      stage.appendChild(h('<p class="scan-status">This looks closest to. Pick the one that is right and we will explain it.</p>'));
      var grid = h('<div class="scan-picks"></div>');
      names.forEach(function (name) {
        var f = D.foods[name];
        var b = h('<button class="scan-pick"><div class="ph">' +
          img2(f.photo || "meal/meal-1.jpg", name) + "</div><b>" + esc(name) + "</b></button>");
        b.onclick = function () {
          overlay.remove();
          onPick(name);
        };
        grid.appendChild(b);
      });
      stage.appendChild(grid);
      var again = h('<button class="btn btn-ghost mt">Take another photo</button>');
      again.onclick = function () { startCamera(); };
      stage.appendChild(again);
      var manual = h('<button class="btn btn-ghost mt">Choose from the list instead</button>');
      manual.onclick = function () { overlay.remove(); onPick(null); };
      stage.appendChild(manual);
    }

    function img2(src, alt) {
      return '<img src="/app/assets/img/' + src + '" alt="' + esc(alt) + '">';
    }

    var file = h('<input type="file" accept="image/*" capture="environment" hidden>');
    panel.appendChild(file);
    file.onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      stopCamera();
      var reader = new FileReader();
      reader.onload = function (e) { analyse(e.target.result); };
      reader.readAsDataURL(f);
    };

    var pick = h('<button class="btn btn-ghost mt">Choose a food from the list</button>');
    pick.onclick = function () { overlay.remove(); onPick(null); };
    panel.appendChild(pick);

    $("#scX", panel).onclick = function () { stopCamera(); overlay.remove(); };
    overlay.onclick = function (e) { if (e.target === overlay) { stopCamera(); overlay.remove(); } };

    document.body.appendChild(overlay);
    startCamera();
  }

  global.GBScanner = {
    open: open,
    signature: signature,
    distance: distance,
    rank: rank
  };
})(typeof window !== "undefined" ? window : this);
