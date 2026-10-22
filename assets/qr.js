/* ==========================================================================
   GYM BADGE — QR code generator

   A real, scannable QR code encoder (byte mode, error correction level M),
   written from the ISO/IEC 18004 specification so the app works offline and
   the site does not need a third-party script.

   It is used for two things:
     • the download page, so a desktop visitor can scan the app link
       straight onto their phone
     • the member's badge code in the app

   Usage:  window.GBQR.svg("https://example.com/app/", { ecl: "M" })
           window.GBQR.matrix("text", { version: 4, mask: 2 })   // for tests
   ========================================================================== */
(function (global) {
  "use strict";

  /* Error correction levels, in the order the specification numbers them. */
  var ECL = { L: 0, M: 1, Q: 2, H: 3 };
  /* The 2 bits that encode the level inside the format information. */
  var ECL_FORMAT_BITS = [1, 0, 3, 2];
  /* Penalty weight for the format information bits. */
  var PENALTY_N1 = 3, PENALTY_N2 = 3, PENALTY_N3 = 40, PENALTY_N4 = 10;

  /* Number of error correction codewords per block, by level and version.
     The level order matches ECL above: L, M, Q, H. */
  var ECC_CODEWORDS_PER_BLOCK = [
    /* L */ [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    /* M */ [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    /* Q */ [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    /* H */ [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  /* Number of error correction blocks, by level and version. */
  var NUM_EC_BLOCKS = [
    /* L */ [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    /* M */ [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    /* Q */ [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    /* H */ [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  /* ---------------- small helpers ---------------- */

  function utf8Bytes(text) {
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
        var c2 = text.charCodeAt(i + 1);
        var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        i++;
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return out;
  }

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  /* ---------------- geometry ---------------- */

  function numRawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  function numDataCodewords(ver, ecl) {
    return Math.floor(numRawDataModules(ver) / 8) -
      ECC_CODEWORDS_PER_BLOCK[ecl][ver] * NUM_EC_BLOCKS[ecl][ver];
  }

  function alignPatternPositions(ver) {
    if (ver === 1) return [];
    var numAlign = Math.floor(ver / 7) + 2;
    var step = (ver === 32) ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = ver * 4 + 17 - 7; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  /* ---------------- Reed-Solomon ---------------- */

  /* Multiply in GF(256) with the primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
     (0x11d). The shift is one bit at a time, so the result always fits in a
     byte and the reduction never loses information. */
  function rsMultiply(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
  }

  function rsDivisor(degree) {
    var result = new Uint8Array(degree);
    result[degree - 1] = 1;
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = rsMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = rsMultiply(root, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    var result = new Uint8Array(divisor.length);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ result[0];
      result.copyWithin(0, 1);
      result[result.length - 1] = 0;
      for (var j = 0; j < result.length; j++) result[j] ^= rsMultiply(divisor[j], factor);
    }
    return result;
  }

  /* Build the final codeword sequence: the data codewords and the error
     correction codewords, interleaved across the blocks as the
     specification requires. This is the whole stream, not just the
     correction part. */
  function addEccAndInterleave(data, ver, ecl) {
    var numBlocks = NUM_EC_BLOCKS[ecl][ver];
    var blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl][ver];
    var rawCodewords = Math.floor(numRawDataModules(ver) / 8);
    var numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    var shortBlockLen = Math.floor(rawCodewords / numBlocks);

    var blocks = [];
    var div = rsDivisor(blockEccLen);
    var k = 0;
    for (var i = 0; i < numBlocks; i++) {
      var len = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
      var dat = Array.prototype.slice.call(data, k, k + len);
      k += len;
      var ecc = rsRemainder(dat, div);
      if (i < numShortBlocks) dat = dat.concat([0]);
      blocks.push(dat.concat(Array.prototype.slice.call(ecc)));
    }

    var result = [];
    for (var i = 0; i < blocks[0].length; i++) {
      for (var j = 0; j < blocks.length; j++) {
        /* The padding byte that balances the short blocks is skipped. */
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(blocks[j][i]);
      }
    }
    return result;
  }

  /* ---------------- encoding ---------------- */

  function encodeData(bytes, ver, ecl) {
    var bits = [];
    function push(val, len) {
      for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    }
    var capacityBits = numDataCodewords(ver, ecl) * 8;
    push(0x4, 4);                                   /* byte mode */
    push(bytes.length, ver <= 9 ? 8 : 16);         /* character count */
    for (var i = 0; i < bytes.length; i++) push(bytes[i], 8);
    push(0, Math.min(4, capacityBits - bits.length));            /* terminator */
    push(0, (8 - (bits.length % 8)) % 8);                        /* byte align */
    var pad = 0xec;
    while (bits.length < capacityBits) {
      push(pad, 8);
      pad ^= 0xec ^ 0x11;
    }
    var codewords = new Uint8Array(capacityBits / 8);
    for (var i = 0; i < bits.length; i++) {
      codewords[i >>> 3] |= bits[i] << (7 - (i & 7));
    }
    return codewords;
  }

  /* ---------------- the matrix ---------------- */

  function buildMatrix(text, opts) {
    opts = opts || {};
    var ecl = ECL[opts.ecl || "M"];
    if (ecl === undefined) ecl = ECL.M;
    var bytes = utf8Bytes(String(text));

    var version = opts.version || 0;
    if (!version) {
      for (version = 1; version <= 40; version++) {
        var ccBits = version <= 9 ? 8 : 16;
        if (4 + ccBits + bytes.length * 8 <= numDataCodewords(version, ecl) * 8) break;
      }
      if (version > 40) throw new Error("QR: too much data for one code");
    }

    var size = version * 4 + 17;
    var modules = [], isFunction = [];
    for (var i = 0; i < size; i++) {
      modules.push(new Array(size).fill(false));
      isFunction.push(new Array(size).fill(false));
    }

    function setFn(x, y, dark) {
      if (x < 0 || x >= size || y < 0 || y >= size) return;
      modules[y][x] = !!dark;
      isFunction[y][x] = true;
    }

    function drawFinder(x, y) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFn(x + dx, y + dy, dist !== 2 && dist !== 4);
        }
      }
    }

    function drawAlignment(x, y) {
      for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
          setFn(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }

    /* Timing patterns */
    for (var i = 0; i < size; i++) {
      setFn(6, i, i % 2 === 0);
      setFn(i, 6, i % 2 === 0);
    }
    /* Finder patterns (with their separators) */
    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);
    /* Alignment patterns */
    var pos = alignPatternPositions(version);
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var corner = (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0);
        if (!corner) drawAlignment(pos[i], pos[j]);
      }
    }
    /* Reserve the format information area */
    drawFormatBits(0, true);
    /* Reserve the version information area */
    if (version >= 7) drawVersionBits();

    function drawFormatBits(mask, reserveOnly) {
      var data = (ECL_FORMAT_BITS[ecl] << 3) | mask;
      var rem = data;
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((data << 10) | rem) ^ 0x5412;
      for (var i = 0; i <= 5; i++) setFn(8, i, getBit(bits, i));
      setFn(8, 7, getBit(bits, 6));
      setFn(8, 8, getBit(bits, 7));
      setFn(7, 8, getBit(bits, 8));
      for (var i = 9; i < 15; i++) setFn(14 - i, 8, getBit(bits, i));
      for (var i = 0; i < 8; i++) setFn(size - 1 - i, 8, getBit(bits, i));
      for (var i = 8; i < 15; i++) setFn(8, size - 15 + i, getBit(bits, i));
      setFn(8, size - 8, true);
      return bits;
    }

    function drawVersionBits() {
      var rem = version;
      for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var bits = (version << 12) | rem;
      for (var i = 0; i < 18; i++) {
        var bit = getBit(bits, i);
        var a = size - 11 + (i % 3), b = Math.floor(i / 3);
        setFn(a, b, bit);
        setFn(b, a, bit);
      }
    }

    /* Place the codewords */
    var data = encodeData(bytes, version, ecl);
    var all = addEccAndInterleave(data, version, ecl);
    var bitIndex = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!isFunction[y][x] && bitIndex < all.length * 8) {
            modules[y][x] = getBit(all[bitIndex >>> 3], 7 - (bitIndex & 7));
            bitIndex++;
          }
        }
      }
    }

    /* Try every mask and keep the one with the lowest penalty score. */
    var bestMask = opts.mask;
    var bestModules = null, bestScore = Infinity;

    function applyMask(mask) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          if (isFunction[y][x]) continue;
          var invert;
          switch (mask) {
            case 0: invert = (x + y) % 2 === 0; break;
            case 1: invert = y % 2 === 0; break;
            case 2: invert = x % 3 === 0; break;
            case 3: invert = (x + y) % 3 === 0; break;
            case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
            case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
            default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          }
          if (invert) modules[y][x] = !modules[y][x];
        }
      }
    }

    function penaltyCountPatterns(runHistory) {
      var n = runHistory[1];
      var core = n > 0 && runHistory[2] === n && runHistory[3] === n * 3 && runHistory[4] === n && runHistory[5] === n;
      return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
             (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
    }
    function penaltyAddHistory(runLength, runHistory) {
      if (runHistory[0] === 0) runLength += size;
      runHistory.pop();
      runHistory.unshift(runLength);
    }
    function penaltyTerminate(runColor, runLength, runHistory) {
      if (runColor) {
        penaltyAddHistory(runLength, runHistory);
        runLength = 0;
      }
      runLength += size;
      penaltyAddHistory(runLength, runHistory);
      return penaltyCountPatterns(runHistory);
    }
    function penaltyScore() {
      var result = 0;
      var i, x, y;
      for (y = 0; y < size; y++) {
        var runColor = false, runLen = 0;
        var history = [0, 0, 0, 0, 0, 0, 0];
        for (x = 0; x < size; x++) {
          if (modules[y][x] === runColor) {
            runLen++;
            if (runLen === 5) result += PENALTY_N1;
            else if (runLen > 5) result++;
          } else {
            penaltyAddHistory(runLen, history);
            if (!runColor) result += penaltyCountPatterns(history) * PENALTY_N3;
            runColor = modules[y][x];
            runLen = 1;
          }
        }
        result += penaltyTerminate(runColor, runLen, history) * PENALTY_N3;
      }
      for (x = 0; x < size; x++) {
        var runColor2 = false, runLen2 = 0;
        var history2 = [0, 0, 0, 0, 0, 0, 0];
        for (y = 0; y < size; y++) {
          if (modules[y][x] === runColor2) {
            runLen2++;
            if (runLen2 === 5) result += PENALTY_N1;
            else if (runLen2 > 5) result++;
          } else {
            penaltyAddHistory(runLen2, history2);
            if (!runColor2) result += penaltyCountPatterns(history2) * PENALTY_N3;
            runColor2 = modules[y][x];
            runLen2 = 1;
          }
        }
        result += penaltyTerminate(runColor2, runLen2, history2) * PENALTY_N3;
      }
      for (y = 0; y < size - 1; y++) {
        for (x = 0; x < size - 1; x++) {
          var c = modules[y][x];
          if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) result += PENALTY_N2;
        }
      }
      var dark = 0;
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (modules[y][x]) dark++;
      var total = size * size;
      var k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      result += k * PENALTY_N4;
      return result;
    }

    if (bestMask !== undefined && bestMask !== null) {
      applyMask(bestMask);
      drawFormatBits(bestMask);
      bestModules = modules.map(function (row) { return row.slice(); });
    } else {
      for (var mask = 0; mask < 8; mask++) {
        applyMask(mask);
        drawFormatBits(mask);
        var score = penaltyScore();
        if (score < bestScore) {
          bestScore = score;
          bestMask = mask;
          bestModules = modules.map(function (row) { return row.slice(); });
        }
        applyMask(mask);   /* XOR again to undo */
      }
    }

    return { size: size, modules: bestModules, version: version, ecl: opts.ecl || "M", mask: bestMask };
  }

  /* ---------------- public API ---------------- */

  function matrix(text, opts) {
    return buildMatrix(text, opts);
  }

  /* An SVG string. Quiet zone of 4 modules, as the specification asks. */
  function svg(text, opts) {
    opts = opts || {};
    var q = buildMatrix(text, opts);
    var dark = opts.dark || "#0f172a";
    var light = opts.light || "#ffffff";
    var quiet = opts.quiet === undefined ? 4 : opts.quiet;
    var total = q.size + quiet * 2;
    var parts = [];
    for (var y = 0; y < q.size; y++) {
      for (var x = 0; x < q.size; x++) {
        if (q.modules[y][x]) parts.push("M" + (x + quiet) + " " + (y + quiet) + "h1v1h-1z");
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total +
      '" shape-rendering="crispEdges" role="img" aria-label="QR code" ' +
      'style="width:100%;height:auto;max-width:' + (opts.size || 220) + 'px;background:' + light + '">' +
      '<rect width="' + total + '" height="' + total + '" fill="' + light + '"/>' +
      '<path d="' + parts.join("") + '" fill="' + dark + '"/></svg>';
  }

  global.GBQR = { svg: svg, matrix: matrix };
})(typeof window !== "undefined" ? window : this);
