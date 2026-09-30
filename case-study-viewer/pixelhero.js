/*!
 * PixelHero — stepped pixel-lattice hero word for "Known, And".
 * Classic script, no dependencies. Exposes window.PixelHero.
 *
 *   var hero = PixelHero.mount(canvas, { preset: 'secondPlate', accessibleEl: span, pauseButton: btn });
 *   hero.pause(); hero.play(); hero.toggle(); hero.setWord(2); hero.isPaused(); hero.destroy();
 *
 * Rendering rules: integer device pixels only. setTransform(1,0,0,1,0,0), integer dpr (1..3),
 * fillRect with integer x/y/w/h, no arcs, no alpha blending (opacity tiers are pre-mixed solid
 * colours against the white ground), no smoothing. Redraws only on clock ticks.
 */
(function (global) {
  'use strict';

  var PHASES = ['hold', 'dissolve', 'void', 'build'];
  var HOLD = 0, DISSOLVE = 1, VOID = 2, BUILD = 3;
  var SS = 8; // raster samples per lattice cell (independent of dpr, so the lattice shape never changes with dpr)

  /* ---------------------------------------------------------------- presets */
  var presets = {
    // Halftone direction ("Second Plate"): ink bitmap + pigment Plate 02 fringe.
    secondPlate: {
      family: 'Archivo', weight: 900, stretch: 62, fallback: '"Arial Narrow", Arial, sans-serif',
      cell: 8, cellMobile: 6, capFrac: 0.72, padCells: 1, threshold: 0.5, seam: 0,
      mobile: { weight: 700, tracking: 0.5 },
      height: { desktop: 224, mobile: 96 },
      timings: { hold: 2640, dissolve: 640, void: 480, build: 720 },
      fringe: { min: 0.15, max: 0.5, reach: 2, maxNeighbours: 2, size: 0.625, minCell: 8, slip: 1 },
      proof: null, cursor: null, dots: null,
      dissolve: { rampFrom: 0, rampTo: 0.6, alpha: 1.25, xShare: 0.7, maxDist: 12, ambient: 0.25,
        steps: [{ sizes: [3, 2], tier: 1 }, { sizes: [2, 1], tier: 0.25 }] },
      void: { density: 26, uniform: 0.72, sizes: [1, 2, 2], sizesMobile: [1, 1, 2], tiers: [[1, 0.75], [0.25, 0.25]],
        pigment: 0.04, lattice: 1, reseed: 1 },
      build: { readThrough: null, freeLeave: true }
    },
    // Vellum: ink at three certainty tiers + solid pigment proof sliver (+1,+1) under the ink.
    vellum: {
      family: 'Archivo', weight: 800, stretch: 80, fallback: '"Arial Narrow", Arial, sans-serif',
      cell: 8, cellMobile: 4, capFrac: 0.72, padCells: 1, threshold: 0.5, seam: 0,
      height: { desktop: 224, mobile: 72 },
      timings: { hold: 2400, dissolve: 640, void: 400, build: 800 },
      fringe: null, proof: { dx: 1, dy: 1 }, cursor: null, dots: null,
      dissolve: { tear: 0.2, alpha: 1.25, xShare: 0.7, maxDist: 12, ambient: 0.25,
        steps: [{ sizes: [0.999], tier: 0.45 }, { sizes: [3, 2], tier: 0.45 }, { sizes: [2, 1], tier: 0.15 }] },
      void: { density: 24, uniform: 0.7, sizes: [1, 2, 3], sizesMobile: [1, 2], tiers: [[1, 0.5], [0.45, 0.2], [0.15, 0.3]],
        pigment: 0.01, lattice: 1, reseed: 1 },
      build: { readThrough: { out: 0.15, in: 0.45, placeBy: 0.5 }, freeLeave: true }
    },
    // Bitmap: seamed sprite cells, dot lattice, pigment cursor block after the word.
    bitmap: {
      family: 'Archivo', weight: 800, stretch: 112, fallback: 'Arial, sans-serif',
      cell: 8, cellMobile: 4, capFrac: 0.72, padCells: 1, threshold: 0.5, seam: 1,
      mobile: { stretch: 75 },
      height: { desktop: 144, mobile: 80 },
      timings: { hold: 2400, dissolve: 480, void: 320, build: 800 },
      fringe: null, proof: null,
      cursor: { w: 6, h: 2, gap: 1, blinkMs: 560, solidAfterMs: 5000 },
      dots: { every: 8, color: '#D6D6D9' },
      dissolve: { tear: 0.3, alpha: 1.25, xShare: 0.7, maxDist: 10, ambient: 0.25,
        steps: [{ sizes: [4, 3], tier: 0.3 }, { sizes: [3, 2], tier: 0.3 }] },
      void: { density: 60, uniform: 0.72, sizes: [1, 2, 3], sizesMobile: [1, 2], tiers: [[1, 1]],
        pigment: 0, lattice: 4, latticeMobile: 2, reseed: 1 },
      build: { readThrough: null, freeLeave: true }
    },
    // Poster Press: solid ink slab, pigment never enters the word.
    posterPress: {
      family: 'Big Shoulders Display', weight: 900, stretch: null, fallback: 'Impact, "Arial Narrow", sans-serif',
      cell: 12, cellMobile: 6, capFrac: 0.8, padCells: 1, threshold: 0.5, seam: 0,
      height: { desktop: 240, mobile: 90 },
      timings: { hold: 2640, dissolve: 720, void: 640, build: 1200 },
      fringe: null, proof: null, cursor: null, dots: null,
      dissolve: { tear: 0.3, alpha: 1.25, xShare: 0.7, maxDist: 10, ambient: 0.2,
        steps: [{ sizes: [0.5], tier: 1 }, { sizes: [0.334], tier: 0.28 }, { sizes: [0.2], tier: 0.28 }] },
      void: { density: 36, uniform: 1, sizes: [1, 2], tiers: [[1, 1]], pigment: 0, lattice: 4, reseed: 2 },
      build: { readThrough: null, freeLeave: true }
    }
  };
  presets.halftone = presets.secondPlate;
  presets.poster = presets.posterPress;

  var DEFAULTS = {
    words: ['UNDERSTOOD', 'TRUSTED', 'DESIRED', 'CHOSEN'],
    tickMs: 80,
    mobileBelow: 600,          // canvas CSS width below this uses cellMobile / sizesMobile
    align: 'left',             // 'left' | 'center'
    background: '#FFFFFF',     // tiers are pre-mixed against this
    ink: null, pigment: null,  // override CSS --ink / --pigment
    accessibleEl: null, pauseButton: null,
    labels: { pause: 'PAUSE', play: 'PLAY' },
    reducedMotion: null,       // null = follow prefers-reduced-motion
    reducedCutMs: 4000,
    fontTimeout: 3000,
    debugParams: true,         // read ?hero= and ?heroWord=
    seed: 1,
    tracking: 0,               // extra space between glyphs, in cells (0 = native kerning via fillText)
    onWord: null,              // function(index, word)
    // BITMAP LOCAL EXTENSION (see "bitmap extension" below; all null = original behaviour)
    palette: null,             // [{ color: 'ink'|'pigment'|hex, weight }]: each torn / free bit is one solid colour from this
    wordColor: null,           // 'ink' | 'pigment' | hex: the formed word + build cells (null = ink)
    bits: null,                // 'cell': every bit is exactly one full lattice cell, opacity 1, on the word's lattice
    edgePlate: null,           // { color, source: 'offset'|'fringe'|'both', offset: [dx, dy] cells, slip: cells, fringeMin, thin, exterior }
                               // a second plate of full solid cells printed off-register under the word (see bitmap extension).
                               // exterior (default true): keep the plate out of the glyphs' enclosed counters
    onRender: null             // function({ phase, tick, index, prev, cycle, frozen }): after every full redraw (slave layers follow it)
  };

  /* ---------------------------------------------------------------- utils */
  function merge(base, over) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    if (!over) return out;
    for (k in over) {
      var v = over[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && !(typeof Element !== 'undefined' && v instanceof Element) &&
          base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) out[k] = merge(base[k], v);
      else out[k] = v;
    }
    return out;
  }
  function h32(a, b, c) {
    var h = (a | 0) ^ 0x9e3779b9;
    h = Math.imul(h ^ (b | 0), 0x85ebca6b); h ^= h >>> 13;
    h = Math.imul(h ^ (c | 0), 0xc2b2ae35); h ^= h >>> 16;
    h = Math.imul(h, 0x27d4eb2d); h ^= h >>> 15;
    return h >>> 0;
  }
  function rnd(a, b, c) { return h32(a, b, c) / 4294967296; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var STRETCH = [[50, 'ultra-condensed'], [62.5, 'extra-condensed'], [75, 'condensed'], [87.5, 'semi-condensed'],
    [100, 'normal'], [112.5, 'semi-expanded'], [125, 'expanded'], [150, 'extra-expanded'], [200, 'ultra-expanded']];
  function stretchKeyword(s) {
    if (s == null || s === '') return 'normal';
    var n = parseFloat(s);
    if (isNaN(n)) return String(s);
    var best = STRETCH[0], bd = Infinity;
    for (var i = 0; i < STRETCH.length; i++) { var d = Math.abs(STRETCH[i][0] - n); if (d < bd) { bd = d; best = STRETCH[i]; } }
    return best[1];
  }

  var _cc = null;
  function toRGB(str, fb) {
    if (!str) return fb;
    str = String(str).trim();
    if (!_cc) _cc = document.createElement('canvas').getContext('2d');
    _cc.fillStyle = '#010203'; _cc.fillStyle = str;
    var s = _cc.fillStyle;
    if (s === '#010203' && str.toLowerCase() !== '#010203') return fb;
    var m;
    if (s.charAt(0) === '#') return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)];
    if ((m = s.match(/rgba?\(([^)]+)\)/))) { var p = m[1].split(','); return [+p[0], +p[1], +p[2]]; }
    return fb;
  }
  function mix(fg, bg, a) {
    var r = Math.round(bg[0] + (fg[0] - bg[0]) * a), g = Math.round(bg[1] + (fg[1] - bg[1]) * a), b = Math.round(bg[2] + (fg[2] - bg[2]) * a);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function pareto(u, alpha, maxD) { // heavy-tailed integer distance, minimum 1 cell
    var x = 1 / Math.pow(1 - u * 0.999, 1 / alpha);
    return clamp(Math.round(x) - 1 || 1, 1, maxD);
  }

  /* ---------------------------------------------------------------- mount */
  function mount(canvas, options) {
    if (!canvas || !canvas.getContext) throw new Error('PixelHero.mount: canvas element required');
    options = options || {};
    var base = typeof options.preset === 'string' ? presets[options.preset] : (options.preset || presets.secondPlate);
    if (!base) throw new Error('PixelHero.mount: unknown preset ' + options.preset);
    var oBase = merge(merge(DEFAULTS, base), options);
    var o = oBase, kw = 'normal', familyStack = '';
    function applyMode(mobile) { // mobile: {...} in a preset/options overrides any key below mobileBelow
      o = mobile && oBase.mobile ? merge(oBase, oBase.mobile) : oBase;
      kw = stretchKeyword(o.stretch);
      familyStack = '"' + o.family + '", ' + (o.fallback || 'sans-serif');
    }
    applyMode(false);

    var ctx = canvas.getContext('2d', { alpha: true });
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.imageRendering = 'pixelated';

    var words = (o.words || DEFAULTS.words).map(function (w) { return String(w).toUpperCase(); });
    var mqReduced = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var reduced = o.reducedMotion != null ? !!o.reducedMotion : !!(mqReduced && mqReduced.matches);

    // debug freeze
    var freezePhase = -1, params = null;
    if (o.debugParams) {
      try { params = new URLSearchParams(global.location.search); } catch (e) { params = null; }
      if (params) {
        var hp = (params.get('hero') || '').toLowerCase();
        if (PHASES.indexOf(hp) >= 0) freezePhase = PHASES.indexOf(hp);
        var hw = (params.get('heroWord') || '').toUpperCase();
        if (hw && words.indexOf(hw) >= 0) o.startWord = words.indexOf(hw);
      }
    }
    var frozen = freezePhase >= 0;

    // state
    var S = {
      dpr: 1, W: 0, H: 0, cssW: 0, cssH: 0, cd: 8, cellCSS: 8, seamDev: 0, cols: 0, rows: 0, mobile: false,
      rasters: [], ink: [11, 11, 12], pigment: [27, 52, 240], bg: [255, 255, 255], tierCache: {},
      wi: (o.startWord | 0) % words.length, prev: 0, phase: HOLD, t: 0, cycle: 0,
      ticks: [1, 1, 1, 1], ready: false, destroyed: false,
      userPaused: false, hiddenPaused: false, offscreen: false,
      timer: 0, runTicks: 0, cursorOn: true, lastVoidSeed: 0
    };
    S.prev = (S.wi - 1 + words.length) % words.length;

    function computeTicks() {
      var tm = o.tickMs, T = o.timings;
      S.ticks = [Math.max(1, Math.round(T.hold / tm)), Math.max(1, Math.round(T.dissolve / tm)),
        Math.max(1, Math.round(T.void / tm)), Math.max(1, Math.round(T.build / tm))];
    }
    computeTicks();

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      S.bg = toRGB(o.background, [255, 255, 255]);
      S.ink = toRGB(o.ink || cs.getPropertyValue('--ink'), [11, 11, 12]);
      S.pigment = toRGB(o.pigment || cs.getPropertyValue('--pigment'), [27, 52, 240]);
      S.tierCache = {};
      S.pigCol = mix(S.pigment, S.bg, 1);
      S.dotCol = o.dots ? mix(toRGB(o.dots.color, [214, 214, 217]), S.bg, 1) : null;
      extColors();
    }

    /* ---------- bitmap extension (local to the Bitmap fork; API unchanged)
     * palette   [{ color, weight }]: every torn bit (DISSOLVE) and free bit (VOID, ambient, BUILD leaving) is
     *           ONE solid colour, a seeded weighted choice per bit. The choice is keyed by the cycle and the
     *           bit's index only (never by tick or position), so a bit keeps its colour while it moves.
     * wordColor 'ink' | 'pigment' | hex for the formed word and the build cells (default ink).
     * bits      'cell': every mark in every phase is exactly one full lattice cell (S.cd, minus the seam),
     *           snapped to the word's cell lattice, fully opaque: no sub-cell sizes, no opacity tiers,
     *           no Plate 02 fringe.
     * edgePlate { color, source, offset: [dx, dy], slip, fringeMin, thin }: "Second Plate" in Bitmap language. A plate
     *           of FULL solid cells (same size as every other mark) in one pigment, printed under the ink word:
     *           source 'offset' = the word mask moved by offset cells, minus the mask (a stair-step sliver on the far
     *           edges); 'fringe' = the partial-coverage edge cells (cov in [fringeMin, threshold)), moved by offset;
     *           'both' = the union. HOLD: in register. DISSOLVE: slips +slip cells along x and thins by up to
     *           `thin` (seeded, whole cells) while the ink tears. VOID: gone. BUILD: returns (still slipped) cell by
     *           cell with the incoming word, then snaps back into register on HOLD.
     * onRender  called after every full redraw with the master clock state, so a slave layer (the halftone
     *           echo behind the word) can seek to the exact same phase / tick / word. */
    function namedRGB(c) {
      if (c === 'ink') return S.ink;
      if (c === 'pigment') return S.pigment;
      return toRGB(c, S.ink);
    }
    function extColors() {
      S.wordCol = o.wordColor ? mix(namedRGB(o.wordColor), S.bg, 1) : null;
      S.plateCol = o.edgePlate ? mix(namedRGB(o.edgePlate.color || 'pigment'), S.bg, 1) : null;
      S.pal = null;
      if (o.palette && o.palette.length) {
        var tot = 0, i, list = [];
        for (i = 0; i < o.palette.length; i++) {
          var e = o.palette[i], w = e && e.weight != null ? +e.weight : 1;
          if (!e || !(w > 0)) continue;
          tot += w; list.push({ col: mix(namedRGB(e.color), S.bg, 1), at: tot });
        }
        if (list.length) S.pal = { list: list, total: tot };
      }
    }
    function wordInk() { return S.wordCol || tier(1); }
    function bitColor(colorSeed, i, dom) { // one solid colour per bit: seeded weighted choice
      var L = S.pal.list, u = rnd(colorSeed, i, dom) * S.pal.total;
      for (var k = 0; k < L.length; k++) if (u < L[k].at) return L[k].col;
      return L[L.length - 1].col;
    }
    function colorSeed() { return h32(o.seed + 0x5b, S.cycle, 911); } // same for dissolve, void and build of one cycle
    /* ---------- bitmap extension end */
    function tier(a) {
      var k = a.toFixed(3);
      return S.tierCache[k] || (S.tierCache[k] = mix(S.ink, S.bg, a));
    }

    /* ---------- geometry + raster */
    function measure() {
      var r = canvas.getBoundingClientRect();
      var cssW = Math.max(1, r.width), cssH = Math.max(1, r.height);
      var dpr = clamp(Math.round(global.devicePixelRatio || 1), 1, 3);
      var changed = cssW !== S.cssW || cssH !== S.cssH || dpr !== S.dpr;
      S.cssW = cssW; S.cssH = cssH; S.dpr = dpr;
      S.W = Math.round(cssW * dpr); S.H = Math.round(cssH * dpr);
      if (canvas.width !== S.W) canvas.width = S.W;
      if (canvas.height !== S.H) canvas.height = S.H;
      S.mobile = cssW < oBase.mobileBelow;
      applyMode(S.mobile);
      S.cellCSS = S.mobile && o.cellMobile ? o.cellMobile : o.cell;
      S.cd = Math.max(1, Math.round(S.cellCSS * dpr));
      S.seamDev = o.seam > 0 ? Math.max(1, Math.round(o.seam * dpr)) : 0;
      // at least 1x1: a zero-width canvas (hidden pane, collapsed parent) gave cols 0 and hung the edge-plate flood fill
      S.cols = Math.max(1, Math.floor(S.W / S.cd)); S.rows = Math.max(1, Math.floor(S.H / S.cd));
      return changed;
    }

    function fontString(px, fam) {
      return (o.weight || 800) + ' ' + (kw === 'normal' ? '' : kw + ' ') + px.toFixed(2) + 'px ' + fam;
    }

    function setFont(c, px) {
      c.font = fontString(px, familyStack);
      if ('fontStretch' in c) { try { c.fontStretch = kw; } catch (e) { /* ignore */ } }
      if ('fontKerning' in c) c.fontKerning = 'normal';
    }
    function inkExtent(c, word, trackPx) {
      if (!trackPx) {
        var m = c.measureText(word);
        return { left: m.actualBoundingBoxLeft, width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight };
      }
      var x = 0, first = null, right = 0;
      for (var i = 0; i < word.length; i++) {
        var mm = c.measureText(word[i]);
        if (first === null) first = mm.actualBoundingBoxLeft;
        right = x + mm.actualBoundingBoxRight;
        x += mm.width + trackPx;
      }
      return { left: first || 0, width: (first || 0) + right };
    }
    function drawWord(c, word, x, y, trackPx) {
      if (!trackPx) { c.fillText(word, x, y); return; }
      for (var i = 0; i < word.length; i++) { c.fillText(word[i], x, y); x += c.measureText(word[i]).width + trackPx; }
    }

    function rasterizeAll() {
      var cols = S.cols, rows = S.rows;
      var off = document.createElement('canvas');
      off.width = Math.max(1, cols * SS); off.height = Math.max(1, rows * SS);
      var c = off.getContext('2d', { willReadFrequently: true });
      c.textBaseline = 'alphabetic';
      setFont(c, 100);
      var capRatio = (c.measureText('H').actualBoundingBoxAscent || 72) / 100;
      var pad = o.padCells | 0;
      var reserve = (o.cursor ? o.cursor.w + o.cursor.gap : 0) + (o.fringe ? o.fringe.slip : 0) + (o.proof ? o.proof.dx : 0);
      var availCols = cols - pad * 2 - reserve;
      var capRows = Math.max(4, Math.round(rows * o.capFrac));
      var px, trackPx, fits = false;
      for (; capRows >= 4; capRows--) {
        px = (capRows * SS) / capRatio;
        setFont(c, px);
        trackPx = (o.tracking || 0) * SS;
        var widest = 0;
        for (var i = 0; i < words.length; i++) widest = Math.max(widest, inkExtent(c, words[i], trackPx).width);
        if (widest <= availCols * SS) { fits = true; break; }
      }
      if (!fits) capRows = 4;
      var capTop = Math.floor((rows - capRows) / 2);
      if (o.proof) capTop = Math.max(0, Math.floor((rows - capRows - o.proof.dy) / 2));
      var baseY = (capTop + capRows) * SS;
      S.capTop = capTop; S.capRows = capRows;
      S.rasters = words.map(function (word, wi) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, off.width, off.height);
        c.fillStyle = '#000';
        var ext = inkExtent(c, word, trackPx);
        var startCol = o.align === 'center' ? Math.max(pad, Math.floor((cols - reserve - ext.width / SS) / 2)) : pad;
        drawWord(c, word, startCol * SS + ext.left, baseY, trackPx);
        var data = c.getImageData(0, 0, off.width, off.height).data;
        var n = cols * rows, cov = new Float32Array(n), mask = new Uint8Array(n);
        var cells = [], firstCol = cols, lastCol = -1, minRow = rows, maxRow = -1, stride = off.width * 4;
        for (var r = 0; r < rows; r++) {
          for (var cc = 0; cc < cols; cc++) {
            var sum = 0, y0 = r * SS, x0 = cc * SS;
            for (var yy = 0; yy < SS; yy++) {
              var row = (y0 + yy) * stride + x0 * 4 + 3;
              for (var xx = 0; xx < SS; xx++) sum += data[row + xx * 4];
            }
            var v = sum / (SS * SS * 255), idx = r * cols + cc;
            cov[idx] = v;
            if (v >= o.threshold) {
              mask[idx] = 1; cells.push(idx);
              if (cc < firstCol) firstCol = cc; if (cc > lastCol) lastCol = cc;
              if (r < minRow) minRow = r; if (r > maxRow) maxRow = r;
            }
          }
        }
        // Plate 02 fringe: sub-threshold coverage, de-clustered off straight runs.
        var fringe = [];
        if (o.fringe) {
          var F = o.fringe, cand = new Uint8Array(n);
          for (var k = 0; k < n; k++) if (!mask[k] && cov[k] >= F.min && cov[k] < F.max) cand[k] = 1;
          for (k = 0; k < n; k++) {
            if (!cand[k]) continue;
            var rr = (k / cols) | 0, c0 = k % cols, cnt = 0;
            for (var d = -F.reach; d <= F.reach; d++) {
              if (!d) continue;
              if (c0 + d >= 0 && c0 + d < cols && cand[k + d]) cnt++;
              if (rr + d >= 0 && rr + d < rows && cand[k + d * cols]) cnt++;
            }
            if (cnt <= F.maxNeighbours) fringe.push(k);
          }
        }
        // Vellum proof sliver: mask shifted (+dx,+dy) minus the mask itself.
        var sliver = [];
        if (o.proof) {
          for (k = 0; k < cells.length; k++) {
            var ci = cells[k], pr = ((ci / cols) | 0) + o.proof.dy, pc = (ci % cols) + o.proof.dx;
            if (pr < rows && pc < cols && !mask[pr * cols + pc]) sliver.push(pr * cols + pc);
          }
        }
        // Bitmap extension: edge plate cells (full cells, never under the mask itself).
        // `enclosed` = white cells sealed inside a glyph (the counters of O, D, ...). They are found by
        // flooding the white cells in from the border; anything the flood never reaches is a counter.
        // With EP.exterior (the default) the plate is kept out of them, so an off-register plate can never
        // close up a counter — which is what happens at 4px cells, where a counter is only ~3 cells wide.
        var enclosed = null;
        if (o.edgePlate && o.edgePlate.exterior !== false) {
          enclosed = new Uint8Array(n);
          var reach = new Uint8Array(n), stack = [], si, pk, pr0, pc0;
          for (var bc = 0; bc < cols; bc++) {
            if (!mask[bc]) { reach[bc] = 1; stack.push(bc); }
            var bi = (rows - 1) * cols + bc;
            if (!mask[bi] && !reach[bi]) { reach[bi] = 1; stack.push(bi); }
          }
          for (var br = 0; br < rows; br++) {
            var l = br * cols, rr0 = l + cols - 1;
            if (!mask[l] && !reach[l]) { reach[l] = 1; stack.push(l); }
            if (!mask[rr0] && !reach[rr0]) { reach[rr0] = 1; stack.push(rr0); }
          }
          while (stack.length) {
            pk = stack.pop(); pr0 = (pk / cols) | 0; pc0 = pk % cols;
            if (pc0 > 0 && !mask[pk - 1] && !reach[pk - 1]) { reach[pk - 1] = 1; stack.push(pk - 1); }
            if (pc0 < cols - 1 && !mask[pk + 1] && !reach[pk + 1]) { reach[pk + 1] = 1; stack.push(pk + 1); }
            if (pr0 > 0 && !mask[pk - cols] && !reach[pk - cols]) { reach[pk - cols] = 1; stack.push(pk - cols); }
            if (pr0 < rows - 1 && !mask[pk + cols] && !reach[pk + cols]) { reach[pk + cols] = 1; stack.push(pk + cols); }
          }
          for (si = 0; si < n; si++) if (!mask[si] && !reach[si]) enclosed[si] = 1;
        }
        var plate = [];
        if (o.edgePlate) {
          var EP = o.edgePlate, src = EP.source || 'offset', off2 = EP.offset || [1, 1], seen = new Uint8Array(n);
          var addP = function (r0, c0) {
            var pr2 = r0 + (off2[1] | 0), pc2 = c0 + (off2[0] | 0);
            if (pr2 < 0 || pc2 < 0 || pr2 >= rows || pc2 >= cols) return;
            var pi = pr2 * cols + pc2;
            if (mask[pi] || seen[pi]) return;
            if (enclosed && enclosed[pi]) return;
            seen[pi] = 1; plate.push(pi);
          };
          if (src === 'offset' || src === 'both') for (k = 0; k < cells.length; k++) addP((cells[k] / cols) | 0, cells[k] % cols);
          if (src === 'fringe' || src === 'both') {
            var fmin = EP.fringeMin != null ? EP.fringeMin : 0.15;
            for (k = 0; k < n; k++) if (!mask[k] && cov[k] >= fmin && cov[k] < o.threshold) addP((k / cols) | 0, k % cols);
          }
        }
        // Seeded build order.
        var order = cells.slice();
        for (k = order.length - 1; k > 0; k--) {
          var j = Math.floor(rnd(o.seed + 17, wi, k) * (k + 1)); var tmp = order[k]; order[k] = order[j]; order[j] = tmp;
        }
        var rank = new Int32Array(n).fill(-1);
        for (k = 0; k < order.length; k++) rank[order[k]] = k;
        return { word: word, cov: cov, mask: mask, cells: cells, fringe: fringe, sliver: sliver, rank: rank, plate: plate, enclosed: enclosed,
          firstCol: firstCol, lastCol: lastCol, minRow: minRow, maxRow: maxRow };
      });
    }

    /* ---------- drawing primitives (device px, integers only) */
    function rect(x, y, w, h, col) {
      ctx.fillStyle = col;
      ctx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0));
    }
    function cell(idx, col) {
      var cd = S.cd, c = idx % S.cols, r = (idx / S.cols) | 0;
      rect(c * cd, r * cd, cd - S.seamDev, cd - S.seamDev, col);
    }
    function dots(x0, y0, x1, y1) {
      if (!o.dots) return;
      var step = Math.max(1, Math.round(o.dots.every * S.dpr));
      var offp = Math.max(0, Math.floor((S.cd - S.seamDev) / 2) - (S.dpr > 1 ? Math.floor(S.dpr / 2) : 0));
      ctx.fillStyle = S.dotCol;
      var sx = Math.ceil((x0 - offp) / step), sy = Math.ceil((y0 - offp) / step);
      for (var y = sy * step + offp; y < y1 && y < S.H; y += step)
        for (var x = sx * step + offp; x < x1 && x < S.W; x += step) ctx.fillRect(x, y, S.dpr, S.dpr);
    }
    function sizeDev(s) { // s < 1 => fraction of a cell, else CSS px
      var v = s < 1 ? s * S.cellCSS : s;
      return Math.max(1, Math.round(v)) * S.dpr;
    }
    function snap(v) { return Math.floor(v / S.dpr) * S.dpr; }

    /* ---------- free pixels */
    function freeCount() {
      var V = o.void;
      return Math.round((V.density || 0) * (S.cssW * S.cssH) / 10000);
    }
    function drawFree(seed, count, keep, R) {
      var V = o.void, cellMode = o.bits === 'cell', cs = colorSeed(); // bitmap extension
      var sizes = (S.mobile && V.sizesMobile) || V.sizes || [1, 2];
      var latt = cellMode ? S.cd : Math.max(1, ((S.mobile && V.latticeMobile) || V.lattice || 1)) * S.dpr;
      var lc = Math.max(1, Math.floor(S.W / latt)), lr = Math.max(1, Math.floor(S.H / latt));
      var tiers = V.tiers || [[1, 1]], tw = 0, i;
      for (i = 0; i < tiers.length; i++) tw += tiers[i][1];
      var nU = Math.round(count * (V.uniform == null ? 0.72 : V.uniform));
      var bx0 = 0, bx1 = S.W, by0 = 0, by1 = S.H;
      if (R && R.lastCol >= 0) { bx0 = R.firstCol * S.cd; bx1 = (R.lastCol + 1) * S.cd; by0 = R.minRow * S.cd; by1 = (R.maxRow + 1) * S.cd; }
      for (i = 0; i < count; i++) {
        if (keep < 1 && rnd(seed, i, 99) >= keep) continue;
        var x, y;
        if (i < nU) {
          x = Math.floor(rnd(seed, i, 1) * lc) * latt; y = Math.floor(rnd(seed, i, 2) * lr) * latt;
        } else {
          var cl = ((i - nU) / 9) | 0;
          var cx = bx0 + rnd(seed, cl, 11) * (bx1 - bx0), cy = by0 + rnd(seed, cl, 12) * (by1 - by0);
          var sp = Math.max(latt, 3 * S.dpr);
          var dx = (rnd(seed, i, 3) < 0.5 ? -1 : 1) * pareto(rnd(seed, i, 4), 1.1, 12) * sp * 1.5;
          var dy = (rnd(seed, i, 5) < 0.5 ? -1 : 1) * pareto(rnd(seed, i, 6), 1.1, 8) * sp;
          x = Math.floor((cx + dx) / latt) * latt; y = Math.floor((cy + dy) / latt) * latt;
        }
        var s = cellMode ? S.cd - S.seamDev : sizeDev(sizes[Math.floor(rnd(seed, i, 7) * sizes.length)]);
        if (x < 0 || y < 0 || x + s > S.W || y + s > S.H) continue;
        var col;
        if (S.pal) col = bitColor(cs, i, 32);                  // bitmap extension: one solid palette colour
        else if (cellMode) col = tier(1);                      // bitmap extension: solid ink, no tiers
        else if (V.pigment && rnd(seed, i, 8) < V.pigment) col = S.pigCol;
        else {
          var u = rnd(seed, i, 9) * tw, a = tiers[0][0];
          for (var k = 0; k < tiers.length; k++) { if (u < tiers[k][1]) { a = tiers[k][0]; break; } u -= tiers[k][1]; }
          col = tier(a);
        }
        rect(x, y, s, s, col);
      }
    }

    /* ---------- layers */
    function drawFringe(R, slip) {
      if (!o.fringe || !R.fringe.length || o.bits === 'cell') return; // bitmap extension: no sub-cell fringe
      var cd = S.cd, s = Math.max(S.dpr, Math.round(cd * o.fringe.size / S.dpr) * S.dpr), off = snap((cd - s) / 2);
      for (var i = 0; i < R.fringe.length; i++) {
        var k = R.fringe[i], c = (k % S.cols) + slip, r = (k / S.cols) | 0;
        if (c >= S.cols) continue;
        rect(c * cd + off, r * cd + off, s, s, S.pigCol);
      }
    }
    function drawSliver(R) {
      if (!o.proof) return;
      for (var i = 0; i < R.sliver.length; i++) cell(R.sliver[i], S.pigCol);
    }
    // Bitmap extension: the edge plate. Every mark is one full lattice cell in one solid pigment.
    // slip = extra x shift in cells; keep = fraction of plate cells drawn (seeded per cell, whole cells only).
    function drawPlate(R, slip, keep, seed) {
      if (!o.edgePlate || !R.plate || !R.plate.length) return;
      for (var i = 0; i < R.plate.length; i++) {
        var k = R.plate[i];
        if (keep < 1 && rnd(seed, k, 61) >= keep) continue;
        var c = (k % S.cols) + (slip | 0);
        if (c < 0 || c >= S.cols) continue;
        var t = ((k / S.cols) | 0) * S.cols + c;
        if (R.enclosed && R.enclosed[t]) continue; // the slip must not carry a cell into a counter either
        cell(t, S.plateCol);
      }
    }
    function cursorRect(R) {
      var C = o.cursor, cd = S.cd;
      var c0 = Math.min(S.cols - C.w, R.lastCol + 1 + C.gap), r0 = S.capTop + S.capRows - C.h;
      return { c0: c0, r0: r0, x: c0 * cd, y: r0 * cd, w: C.w * cd, h: C.h * cd };
    }
    function drawCursor(R, on) {
      if (!o.cursor || R.lastCol < 0) return;
      var q = cursorRect(R), C = o.cursor;
      ctx.clearRect(q.x, q.y, q.w, q.h);
      dots(q.x, q.y, q.x + q.w, q.y + q.h);
      if (!on) return;
      for (var r = 0; r < C.h; r++) for (var c = 0; c < C.w; c++) cell((q.r0 + r) * S.cols + q.c0 + c, S.pigCol);
    }
    function cursorShouldShow() {
      var C = o.cursor; if (!C) return false;
      if (reduced || frozen || S.userPaused) return true;
      if (S.runTicks * o.tickMs >= C.solidAfterMs) return true;
      var period = Math.max(1, Math.round(C.blinkMs / o.tickMs));
      return (Math.floor(S.runTicks / period) % 2) === 0;
    }

    function cycleSeed() { return h32(o.seed, S.cycle, S.wi * 131 + 7); }

    function drawFormed(R) {
      if (o.fringe && S.cellCSS >= o.fringe.minCell) drawFringe(R, 0);
      drawSliver(R);
      drawPlate(R, 0, 1, 0);                        // bitmap extension: plate in register, under the ink
      var ink = wordInk();
      for (var i = 0; i < R.cells.length; i++) cell(R.cells[i], ink);
    }

    function drawDissolve(R, t) {
      var D = o.dissolve, N = S.ticks[DISSOLVE], p = (t + 1) / N, seed = cycleSeed();
      var cd = S.cd, cols = S.cols, span = Math.max(1, R.lastCol - R.firstCol);
      if (o.fringe) drawFringe(R, o.fringe.slip);   // Plate 02 slips +1 cell, under the ink
      drawSliver(R);                                // proof never grows
      if (o.edgePlate) drawPlate(R, o.edgePlate.slip == null ? 1 : o.edgePlate.slip, 1 - p * (o.edgePlate.thin == null ? 0.5 : o.edgePlate.thin), seed); // bitmap extension: plate slips
      var ink = wordInk(), torn = [], cellMode = o.bits === 'cell', cs = colorSeed();
      for (var i = 0; i < R.cells.length; i++) {
        var idx = R.cells[i], c = idx % cols, r = (idx / cols) | 0;
        var P = D.rampTo != null ? D.rampFrom + (D.rampTo - D.rampFrom) * ((c - R.firstCol) / span) : D.tear;
        var u = rnd(seed, idx, 1), tt = P > 0 ? u / (2 * P) : Infinity;
        if (p < tt) { cell(idx, ink); continue; }
        torn.push(idx, Math.floor((p - tt) * N));
      }
      for (var j = 0; j < torn.length; j += 2) {
        var id = torn[j], age = torn[j + 1], st = D.steps[Math.min(age, D.steps.length - 1)];
        var cc = id % cols, rr = (id / cols) | 0;
        var dist = pareto(rnd(seed, id, 4), D.alpha, D.maxDist) + Math.floor(age / 3);
        var sign = rnd(seed, id, 3) < 0.5 ? -1 : 1;
        if (rnd(seed, id, 2) < D.xShare) cc += sign * dist; else rr += sign * dist;
        if (cellMode) { // bitmap extension: the torn cell travels whole, one solid colour, on the cell lattice
          if (cc < 0 || rr < 0 || cc >= cols || rr >= S.rows) continue;
          cell(rr * cols + cc, S.pal ? bitColor(cs, id, 31) : ink);
          continue;
        }
        var s = sizeDev(st.sizes[Math.floor(rnd(seed, id, 5) * st.sizes.length)]);
        s = Math.min(s, cd);
        var ox = snap(rnd(seed, id, 6) * (cd - s + 1)), oy = snap(rnd(seed, id, 7) * (cd - s + 1));
        var x = cc * cd + ox, y = rr * cd + oy;
        if (x < 0 || y < 0 || x + s > S.W || y + s > S.H) continue;
        rect(x, y, s, s, tier(st.tier));
      }
      if (D.ambient) drawFree(h32(seed, 5, t), Math.round(freeCount() * D.ambient * p), 1, R);
    }

    function voidSeed(t) { return h32(cycleSeed(), 77, Math.floor(t / Math.max(1, o.void.reseed || 1))); }

    function drawVoid(t) {
      var seed = voidSeed(t);
      S.lastVoidSeed = seed;
      drawFree(seed, freeCount(), 1, S.rasters[S.wi]);
    }

    function drawBuild(Rout, Rin, t) {
      var N = S.ticks[BUILD], frac = (t + 1) / N, B = o.build, last = t >= N - 1;
      if (B.freeLeave) drawFree(S.lastVoidSeed || h32(o.seed, 1, 1), freeCount(), 1 - frac, Rout);
      var rt = B.readThrough, n = Rin.cells.length, full = wordInk(), k, idx;
      if (o.bits === 'cell') rt = null; // bitmap extension: no tinted read-through tiers
      if (o.edgePlate) drawPlate(Rin, o.edgePlate.slip == null ? 1 : o.edgePlate.slip, frac, h32(o.seed + 0x61, S.cycle, 3)); // bitmap extension: plate returns, still slipped
      if (!rt) {
        var lim = Math.ceil(frac * n);
        for (k = 0; k < n; k++) { idx = Rin.cells[k]; if (Rin.rank[idx] < lim) cell(idx, full); }
        return;
      }
      // Read-through: outgoing word at rt.out; incoming cells snap in at rt.in (seeded order) until placeBy,
      // then settle to full ink in the same order; last tick = incoming only, full ink.
      var pb = rt.placeBy || 0.5;
      var placed = Math.ceil(Math.min(1, frac / pb) * n);
      var settled = last ? n : Math.floor(Math.max(0, (frac - pb) / (1 - pb)) * n);
      if (!last) { var oc = tier(rt.out); for (k = 0; k < Rout.cells.length; k++) cell(Rout.cells[k], oc); }
      var mid = tier(rt.in);
      for (k = 0; k < n; k++) {
        idx = Rin.cells[k]; var rk = Rin.rank[idx];
        if (rk < placed) cell(idx, rk < settled ? full : mid);
      }
    }

    function render() {
      if (!S.ready || !S.rasters.length) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, S.W, S.H);
      dots(0, 0, S.W, S.H);
      var R = S.rasters[S.wi];
      if (S.phase === HOLD) { drawFormed(R); S.cursorOn = cursorShouldShow(); drawCursor(R, S.cursorOn); }
      else if (S.phase === DISSOLVE) drawDissolve(R, S.t);
      else if (S.phase === VOID) drawVoid(S.t);
      else drawBuild(S.rasters[S.prev], R, S.t);
      if (typeof o.onRender === 'function') { // bitmap extension: master clock report for slave layers
        try { o.onRender({ phase: PHASES[S.phase], tick: S.t, index: S.wi, prev: S.prev, cycle: S.cycle, frozen: frozen }); } catch (e) { /* ignore */ }
      }
    }

    /* ---------- word + clock */
    function announce() {
      if (o.accessibleEl) o.accessibleEl.textContent = words[S.wi].toLowerCase();
      if (typeof o.onWord === 'function') { try { o.onWord(S.wi, words[S.wi]); } catch (e) { /* ignore */ } }
      try { canvas.dispatchEvent(new CustomEvent('pixelhero:word', { detail: { index: S.wi, word: words[S.wi] } })); } catch (e) { /* ignore */ }
    }

    function tick() {
      if (S.destroyed || !S.ready) return;
      S.runTicks++;
      if (reduced) return;
      S.t++;
      if (S.t >= S.ticks[S.phase]) {
        S.t = 0;
        S.phase = (S.phase + 1) % 4;
        if (S.phase === BUILD) { S.prev = S.wi; S.wi = (S.wi + 1) % words.length; announce(); }
        if (S.phase === HOLD) S.cycle++;
      }
      if (S.phase === HOLD && S.t > 0) {
        if (o.cursor) { var on = cursorShouldShow(); if (on !== S.cursorOn) { S.cursorOn = on; drawCursor(S.rasters[S.wi], on); } }
        return; // static hold: nothing redrawn
      }
      render();
    }
    function reducedCut() {
      if (S.destroyed || !S.ready) return;
      S.prev = S.wi; S.wi = (S.wi + 1) % words.length; S.phase = HOLD; S.t = 0;
      announce(); render();
    }

    function shouldRun() { return S.ready && !frozen && !S.userPaused && !S.hiddenPaused && !S.offscreen && !S.destroyed; }
    function sync() {
      var run = shouldRun();
      if (run && !S.timer) S.timer = setInterval(reduced ? reducedCut : tick, reduced ? o.reducedCutMs : o.tickMs);
      else if (!run && S.timer) { clearInterval(S.timer); S.timer = 0; }
    }
    function restartTimer() { if (S.timer) { clearInterval(S.timer); S.timer = 0; } sync(); }

    function toHold() {
      if (S.phase === DISSOLVE || S.phase === VOID) { /* keep current word */ }
      S.phase = HOLD; S.t = 0; render();
    }

    function updateButton() {
      var b = o.pauseButton; if (!b) return;
      b.setAttribute('aria-pressed', S.userPaused ? 'true' : 'false');
      var label = S.userPaused ? o.labels.play : o.labels.pause;
      var slot = b.querySelector('[data-label]');
      if (slot) slot.textContent = label; else b.textContent = label;
    }

    /* ---------- observers */
    var ro = null, io = null, resizeT = 0;
    function onResize() {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        if (S.destroyed) return;
        readColors();
        if (measure() && S.ready) { rasterizeAll(); render(); }
      }, 120);
    }
    function onVis() { S.hiddenPaused = !!document.hidden; sync(); }
    function onBtn(e) { if (e) e.preventDefault(); api.toggle(); }
    function onMq() { var nr = o.reducedMotion != null ? !!o.reducedMotion : mqReduced.matches; if (nr !== reduced) { reduced = nr; toHold(); restartTimer(); } }

    if (global.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(canvas); }
    else global.addEventListener('resize', onResize);
    if (global.IntersectionObserver) {
      io = new IntersectionObserver(function (en) { S.offscreen = !en[en.length - 1].isIntersecting; sync(); }, { threshold: 0 });
      io.observe(canvas);
    }
    document.addEventListener('visibilitychange', onVis);
    if (mqReduced && mqReduced.addEventListener) mqReduced.addEventListener('change', onMq);
    if (o.pauseButton) {
      o.pauseButton.addEventListener('click', onBtn);
      if (frozen) o.pauseButton.setAttribute('aria-disabled', 'false');
    }
    S.hiddenPaused = !!document.hidden;

    /* ---------- boot */
    readColors(); measure(); updateButton();
    if (o.accessibleEl) o.accessibleEl.textContent = words[S.wi].toLowerCase();

    function ensureFont() {
      if (!document.fonts || !document.fonts.load) return Promise.resolve(false);
      var spec = fontString(100, '"' + o.family + '"');
      var text = words.join('');
      var t0 = Date.now();
      function attempt() {
        return document.fonts.load(spec, text).then(function (faces) {
          if (faces && faces.length) return true;
          if (Date.now() - t0 > o.fontTimeout) return false;
          return sleep(120).then(attempt);
        }, function () { return false; });
      }
      return attempt();
    }

    ensureFont().then(function (ok) {
      if (S.destroyed) return;
      S.fontOk = ok;
      S.ready = true;
      measure(); rasterizeAll();
      if (frozen) {
        S.cycle = 0;
        if (freezePhase === BUILD) { S.prev = (S.wi - 1 + words.length) % words.length; }
        S.phase = freezePhase;
        S.t = Math.floor((S.ticks[freezePhase] - 1) / 2);
        if (freezePhase === BUILD) { // give the leaving free pixels the preceding void's seed
          var keepWi = S.wi; S.wi = S.prev; S.lastVoidSeed = voidSeed(S.ticks[VOID] - 1); S.wi = keepWi;
        }
      }
      render(); sync();
      if (!ok && document.fonts && document.fonts.addEventListener) {
        var late = function () {
          if (S.destroyed) return;
          if (document.fonts.check(fontString(40, '"' + o.family + '"'))) {
            document.fonts.removeEventListener('loadingdone', late);
            S.fontOk = true; rasterizeAll(); render();
          }
        };
        document.fonts.addEventListener('loadingdone', late);
        S.lateFont = late;
      }
    });

    var api = {
      pause: function () { if (S.userPaused) return; S.userPaused = true; toHold(); sync(); updateButton(); },
      play: function () { if (!S.userPaused) return; S.userPaused = false; S.phase = HOLD; S.t = 0; sync(); updateButton(); render(); },
      toggle: function () { if (S.userPaused) api.play(); else api.pause(); },
      isPaused: function () { return S.userPaused; },
      setWord: function (i) {
        S.prev = S.wi; S.wi = ((i | 0) % words.length + words.length) % words.length;
        S.phase = HOLD; S.t = 0; announce(); render();
      },
      state: function () {
        return { phase: PHASES[S.phase], tick: S.t, word: words[S.wi], index: S.wi, cell: S.cellCSS, dpr: S.dpr,
          cols: S.cols, rows: S.rows, capRows: S.capRows, fontLoaded: !!S.fontOk, reduced: reduced, frozen: frozen,
          running: !!S.timer };
      },
      destroy: function () {
        S.destroyed = true;
        if (S.timer) clearInterval(S.timer); S.timer = 0;
        clearTimeout(resizeT);
        if (ro) ro.disconnect(); else global.removeEventListener('resize', onResize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        if (mqReduced && mqReduced.removeEventListener) mqReduced.removeEventListener('change', onMq);
        if (o.pauseButton) o.pauseButton.removeEventListener('click', onBtn);
        if (S.lateFont && document.fonts) document.fonts.removeEventListener('loadingdone', S.lateFont);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    return api;
  }

  global.PixelHero = { mount: mount, presets: presets, defaults: DEFAULTS, stretchKeyword: stretchKeyword, version: '1.0.0' };
})(window);
