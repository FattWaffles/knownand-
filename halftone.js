/*!
 * HalftoneHero — FUKT-style halftone-screen hero word for "Known, And".
 * Classic script, no dependencies. Exposes window.HalftoneHero. Mirrors the PixelHero phase model
 * (HOLD -> DISSOLVE -> VOID -> BUILD on stepped ticks) and controller API.
 *
 *   var hero = HalftoneHero.mount(canvas, { preset: 'fukt', accessibleEl: span, pauseButton: btn });
 *   hero.play(); hero.pause(); hero.toggle(); hero.isPaused(); hero.setWord(2);
 *   hero.jump('dissolve');          // freeze (paused) at the middle tick of a phase, deterministic
 *   hero.seek('build', 3);          // freeze at an exact tick of a phase
 *   hero.setSpeed(0.5);             // tick interval = tickMs / mult
 *   hero.setOptions({ smear: 3 });  // live re-tune (deep-merged into the mount options)
 *   hero.follow('dissolve', 3, 1, 0); // slave mode (clock: 'external'): draw exactly this phase / tick / word / prev word
 *   hero.state(); hero.destroy();
 *
 * The screen: each word is rasterised (family / weight / stretch) into a small alpha field at
 * `samples` samples per lattice cell. Per frame the outgoing/incoming fields are cross-faded, blurred
 * (separable 3-pass box ~ gaussian, sigmaX = blur, sigmaY = blur * smear, in cells) and sampled at
 * every lattice point; one dot per point, radius = rMax * sqrt(density) (area-proportional, like a
 * real screen). The blur is done in JS, not ctx.filter, so it is identical in every browser
 * (Safari < 18 has no ctx.filter) and exactly deterministic.
 * Redraws only on ticks. Canvas stays transparent (the page supplies the white ground).
 */
(function (global) {
  'use strict';

  var PHASES = ['hold', 'dissolve', 'void', 'build'];
  var HOLD = 0, DISSOLVE = 1, VOID = 2, BUILD = 3;
  var INK = '#0B0B0C';

  /* ---------------------------------------------------------------- presets */
  var presets = {
    // Second Plate: the literal FUKT two-plate. The word is an ink screen (dot size builds the letter,
    // core dots overlap to solid black); Plate 02 is a second, pigment-blue screen on the same lattice,
    // mis-registered +1 cell and knocked out under the ink, so blue shows only as the offset sliver + halo.
    secondPlate: {
      family: 'Archivo', weight: 900, stretch: 62, fallback: '"Arial Narrow", Arial, sans-serif',
      pigment: '#1B34F0', color: 'ink',
      cell: 8, cellMobile: 3, capFrac: 0.72, padCells: 1, haloInset: 1,
      mobile: { weight: 900, tracking: 0.5, padCells: 0, haloInset: 1, softness: 0.45 },
      bands: [{ below: 1120, weight: 800 }],
      height: { desktop: 224, mobile: 96 },
      timings: { hold: 2640, dissolve: 640, void: 480, build: 720 },
      grid: 'hex', shape: 'round', dot: 0.6, gain: 1.35, levels: 0, minDensity: 0.07,
      softness: 0.45, bloom: 2.0, smear: 1.8, smearOut: 1.5, haze: 0.3, drift: [0.6, 0.5], scatter: 0.55,
      offset: [0, 0],
      plate2: { color: 'pigment', offset: [1, 1], gain: 1.3, knockout: 0.55, dot: 0.52 },
      core: null, proof: null, cursor: null
    },
    // Vellum: an ink screen where dot size carries certainty (core dots overlap to solid black); the
    // solid vermilion proof sliver (+1,+1 cell, under the ink) only when formed, kept solid on purpose.
    vellum: {
      family: 'Archivo', weight: 800, stretch: 80, fallback: '"Arial Narrow", Arial, sans-serif',
      pigment: '#CE280A', color: 'ink',
      cell: 6, cellMobile: 3, capFrac: 0.72, padCells: 1, haloInset: 1,
      mobile: { tracking: 0.35, softness: 0.45 },
      height: { desktop: 224, mobile: 72 },
      timings: { hold: 2400, dissolve: 640, void: 400, build: 800 },
      grid: 'hex', shape: 'round', dot: 0.62, gain: 1.4, levels: 0, minDensity: 0.07,
      softness: 0.45, bloom: 2.2, smear: 1.8, smearOut: 1.5, haze: 0.3, drift: [0.5, 0.35], scatter: 0.55,
      offset: [0, 0],
      core: null, proof: { dx: 1, dy: 1, color: 'pigment', threshold: 0.5 }, cursor: null
    },
    // Bitmap: round ink dots on the fork's square 8px lattice, sized by coverage across ~2 cells of
    // edge softness, so the screen reads against the square cells; the vermilion cursor block after the word.
    bitmap: {
      family: 'Archivo', weight: 800, stretch: 112, fallback: 'Arial, sans-serif',
      pigment: '#CE280A', color: 'ink',
      cell: 8, cellMobile: 4, capFrac: 0.72, padCells: 0, haloInset: 1, mobileBelow: 721,
      mobile: { stretch: 75, softness: 0.6 },
      height: { desktop: 144, mobile: 80 },
      timings: { hold: 2400, dissolve: 480, void: 320, build: 800 },
      grid: 'square', shape: 'round', dot: 0.56, gain: 1.3, levels: 0, minDensity: 0.07,
      softness: 0.7, bloom: 2.2, smear: 1.5, smearOut: 1.5, haze: 0.3, drift: [0.5, 0.25], scatter: 0.5,
      offset: [0, 0],
      core: null, proof: null,
      cursor: { w: 6, h: 2, gap: 1, blinkMs: 560, solidAfterMs: 5000, color: 'pigment' }
    },
    // Poster Press: round ink dots on the fork's cell (12 / 8 / 4px), pigment never enters the word.
    // Low bloom so the narrow Big Shoulders counters survive the transitions.
    posterPress: {
      family: 'Big Shoulders Display', weight: 900, stretch: null, fallback: 'Impact, "Arial Narrow", sans-serif',
      pigment: '#B4009C', color: 'ink',
      cell: 12, cellMobile: 4, capFrac: 0.84, padCells: 2, haloInset: 1, tracking: 0.6,
      cellAt: function (w) { return w < 680 ? 4 : w < 1200 ? 8 : 12; },
      mobileBelow: 1200, mobile: { weight: 800, softness: 0.45 },
      height: { desktop: 240, mobile: 90 },
      timings: { hold: 2640, dissolve: 720, void: 640, build: 1200 },
      grid: 'hex', shape: 'round', dot: 0.6, gain: 1.35, levels: 0, minDensity: 0.07,
      softness: 0.4, bloom: 1.0, smear: 1.6, smearOut: 1.3, haze: 0.24, drift: [0.4, 0.3], scatter: 0.6,
      offset: [0, 0],
      core: null, proof: null, cursor: null
    },
    // FUKT: the pure reference study. Round blue dots on a hex grid, strong vertical smear, no core.
    fukt: {
      family: 'Archivo', weight: 900, stretch: 62, fallback: '"Arial Narrow", Arial, sans-serif',
      pigment: '#1B34F0', color: 'pigment',
      cell: 7, cellMobile: 3, capFrac: 0.72, padCells: 1,
      mobile: { tracking: 0.5, padCells: 0, softness: 0.55, smear: 2.6 },
      height: { desktop: 224, mobile: 96 },
      timings: { hold: 2640, dissolve: 640, void: 480, build: 720 },
      grid: 'hex', shape: 'round', dot: 0.52, gain: 1.2, levels: 0,
      softness: 0.75, bloom: 2.8, smear: 3.0, smearOut: 1.3, haze: 0.42, drift: [0.6, 0.6],
      offset: [0, 0],
      core: null, proof: null, cursor: null
    }
  };
  // Echo: the FUKT screen as a print layer BEHIND the Bitmap word (Bitmap composite). Same face, cell and
  // fit as the Bitmap PixelHero (reserve = its 6+1 cell cursor), so the screen is the same word; offset
  // down-right and smeared vertically so it peeks out as a halftone shadow. Runs on an external clock:
  // the Bitmap PixelHero drives it through follow() from its onRender hook, so it never ticks on its own.
  presets.echo = {
    family: 'Archivo', weight: 800, stretch: 112, fallback: 'Arial, sans-serif',
    pigment: '#B4009C', color: 'pigment',
    cell: 8, cellMobile: 4, capFrac: 0.72, padCells: 0, haloInset: 0, reserve: 7, mobileBelow: 721,
    // 4px cells: the counters are only ~3 cells wide, so the screen has to stay out of them — smaller
    // offset, less gain and a shorter tail than on desktop, or the word stops reading as a solid word.
    mobile: { stretch: 75, dot: 0.5, gain: 0.95, minDensity: 0.1, bloom: 2.0, smear: 2.0, haze: 0.34, offset: [0.5, 1] },
    height: { desktop: 160, mobile: 64 },
    timings: { hold: 2400, dissolve: 480, void: 320, build: 800 },
    grid: 'hex', shape: 'round', dot: 0.46, gain: 1.0, levels: 0, minDensity: 0.08,
    softness: 0.55, bloom: 2.8, smear: 2.6, smearOut: 1.3, haze: 0.42, drift: [0.6, 0.6], scatter: 0,
    smearDir: 'down', // no halo above the cap line: this is a second impression under the word, not a glow
    counterClear: 0.92, // the bowls of O / D stay white while the word is legible; it fades out with the word
    offset: [0.5, 1.5],
    core: null, proof: null, cursor: null, clock: 'external'
  };
  presets.halftone = presets.secondPlate;
  presets.poster = presets.posterPress;

  var DEFAULTS = {
    words: ['UNDERSTOOD', 'TRUSTED', 'DESIRED', 'CHOSEN'],
    tickMs: 80,
    mobileBelow: 600,        // canvas CSS width below this uses cellMobile + `mobile` overrides
    align: 'left',           // 'left' | 'center'
    padCells: 1, padLeftCells: null, tracking: 0, capFrac: 0.72,
    reserve: 0,              // extra right-hand cells kept free when fitting (match a master engine's cursor)
    haloInset: 0,            // extra left inset, in cells, so the soft halo (not the stem) starts on the pad edge
    samples: 3,              // raster samples per lattice cell (2..4)
    grid: 'hex',             // 'hex' (offset rows) | 'square'
    shape: 'round',          // 'round' | 'square' (integer device-px squares)
    dot: 0.5,                // round: radius at density 1, in cells (0.5 = hex neighbours touch). square: side at density 1, in cells
    seam: 0,                 // square shape: CSS px kept clear between full squares
    gain: 1.2,               // density multiplier before clamping (cores saturate)
    minDensity: 0.04,        // below this, no dot
    levels: 0,               // quantize density to N steps (0 = continuous)
    softness: 0.5,           // HOLD blur sigma, in cells
    bloom: 3,                // max blur sigma (VOID), in cells
    smear: 2,                // vertical blur multiplier (sigmaY = sigma * smear)
    smearDir: 'both',        // 'both' = symmetric vertical blur | 'down' = one-sided kernel: the tail only runs
                             // downward (no halo above the cap line), and the shift it causes is cancelled
    smearDownMax: 2,         // cells: above this vertical sigma, 'down' falls back to a symmetric blur
    counterClear: 0,         // 0..1: while the word is formed, knock the screen out of the glyphs' enclosed
                             // counters by this much, so an offset screen can never close a bowl
    smearOut: 1.5,           // extra vertical smear multiplier reached at the end of DISSOLVE / in VOID
    haze: 0.45,              // density level of the VOID haze (x the field)
    scatter: 0,              // 0..1: seeded dot dropout through DISSOLVE/VOID/BUILD (more at the thin edges), so the
                             // blurred field breaks into drifting specks instead of a flat tint slab
    drift: [0.5, 0.4],       // max field drift through DISSOLVE/VOID/BUILD, in cells [x, y]
    offset: [0, 0],          // screen offset from the word, in cells [x, y]
    color: 'ink',            // screen dot colour: 'ink' | 'pigment' | CSS colour
    ink: null, pigment: null, // override (else CSS --ink / --pigment, else #0B0B0C / #1B34F0)
    accent: 0,               // probability a screen dot is drawn in pigment instead (seeded, per lattice point)
    plate2: null,            // { color, offset: [x, y] cells, gain, dot, knockout } a second screen on the same lattice,
                             // under the main one; its dots are skipped where the main density >= knockout
    core: null,              // { layer: 'over'|'under', color: 'ink', threshold: 0.5 } sharp bitmap of the word
    proof: null,             // { dx, dy, color: 'pigment', threshold } solid sliver under everything, formed only
    cursor: null,            // { w, h, gap, blinkMs, solidAfterMs, color } cells, after the word, HOLD only
    dots: null,              // { every: px, color } 1px lattice dots behind (the Bitmap fork's CSS does this itself)
    background: null,        // null = transparent canvas; else a fill colour
    accessibleEl: null, pauseButton: null,
    labels: { pause: 'PAUSE', play: 'PLAY' },
    reducedMotion: null,     // null = follow prefers-reduced-motion
    reducedCutMs: 4000,
    fontTimeout: 3000,
    startWord: 0, seed: 1, speed: 1,
    onWord: null, onFrame: null,
    clock: 'own'             // 'own' | 'external': external never runs a timer; the host calls follow() per master frame
  };

  /* ---------------------------------------------------------------- utils */
  function isPlain(v) {
    return v && typeof v === 'object' && !Array.isArray(v) && !(typeof Element !== 'undefined' && v instanceof Element);
  }
  function merge(base, over) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    if (!over) return out;
    for (k in over) {
      var v = over[k];
      if (isPlain(v) && isPlain(base[k])) out[k] = merge(base[k], v);
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
  function ease(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); }
  function lerp(a, b, t) { return a + (b - a) * t; }
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

  // 3-pass box blur approximating a gaussian of the given sigma (in samples), zero padding.
  function boxSizes(sigma) {
    var n = 3, wIdeal = Math.sqrt(12 * sigma * sigma / n + 1), wl = Math.floor(wIdeal);
    if (wl % 2 === 0) wl--;
    var wu = wl + 2, m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
    var out = [];
    for (var i = 0; i < n; i++) out.push(((i < m ? wl : wu) - 1) >> 1);
    return out;
  }
  function boxH(src, dst, w, h, r) {
    var inv = 1 / (2 * r + 1);
    for (var y = 0; y < h; y++) {
      var o = y * w, acc = 0, x;
      for (x = 0; x < r && x < w; x++) acc += src[o + x];
      for (x = 0; x < w; x++) {
        if (x + r < w) acc += src[o + x + r];
        if (x - r - 1 >= 0) acc -= src[o + x - r - 1];
        dst[o + x] = acc * inv;
      }
    }
  }
  function boxV(src, dst, w, h, r) {
    var inv = 1 / (2 * r + 1);
    for (var x = 0; x < w; x++) {
      var acc = 0, y;
      for (y = 0; y < r && y < h; y++) acc += src[y * w + x];
      for (y = 0; y < h; y++) {
        if (y + r < h) acc += src[(y + r) * w + x];
        if (y - r - 1 >= 0) acc -= src[(y - r - 1) * w + x];
        dst[y * w + x] = acc * inv;
      }
    }
  }
  // One-sided vertical box: the window is src[y - r .. y], so a mark only ever bleeds DOWNWARD.
  // It also moves the field down by r / 2 samples; blur() reports the total so the caller can cancel it.
  function boxVDown(src, dst, w, h, r) {
    var n = r + 1, inv = 1 / n;
    for (var x = 0; x < w; x++) {
      var acc = 0, y;
      for (y = 0; y < h; y++) {
        acc += src[y * w + x];
        if (y - n >= 0) acc -= src[(y - n) * w + x];
        dst[y * w + x] = acc * inv;
      }
    }
  }
  // Returns the downward shift, in raster samples, that a one-sided vertical blur introduced (0 otherwise).
  function blur(buf, tmp, w, h, sx, sy, down) {
    var i, bs, shift = 0;
    if (sx > 0.35) { bs = boxSizes(sx); for (i = 0; i < 3; i++) if (bs[i] > 0) { boxH(buf, tmp, w, h, bs[i]); buf.set(tmp); } }
    if (sy > 0.35) {
      bs = boxSizes(sy);
      for (i = 0; i < 3; i++) if (bs[i] > 0) {
        if (down) { boxVDown(buf, tmp, w, h, bs[i]); shift += bs[i] / 2; }
        else boxV(buf, tmp, w, h, bs[i]);
        buf.set(tmp);
      }
    }
    return shift;
  }

  /* ---------------------------------------------------------------- mount */
  function mount(canvas, options) {
    if (!canvas || !canvas.getContext) throw new Error('HalftoneHero.mount: canvas element required');
    options = options || {};
    var presetName = typeof options.preset === 'string' ? options.preset : null;
    var base = presetName ? presets[presetName] : (options.preset || presets.fukt);
    if (!base) throw new Error('HalftoneHero.mount: unknown preset ' + options.preset);
    var userOpts = options;
    var oBase, o, kw = 'normal', familyStack = '';
    function buildBase() { oBase = merge(merge(DEFAULTS, base), userOpts); }
    buildBase();
    o = oBase;
    function applyMode(cssW) {
      o = oBase;
      if (oBase.bands && cssW) {
        var bs = oBase.bands.slice().sort(function (a, b) { return b.below - a.below; });
        for (var bi = 0; bi < bs.length; bi++) if (cssW < bs[bi].below) o = merge(o, bs[bi]);
      }
      if (cssW && cssW < oBase.mobileBelow && oBase.mobile) o = merge(o, oBase.mobile);
      kw = stretchKeyword(o.stretch);
      familyStack = '"' + o.family + '", ' + (o.fallback || 'sans-serif');
    }
    applyMode(0);

    var ctx = canvas.getContext('2d', { alpha: true });
    canvas.setAttribute('aria-hidden', 'true');

    var words = (o.words || DEFAULTS.words).map(function (w) { return String(w).toUpperCase(); });
    var mqReduced = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var reduced = o.reducedMotion != null ? !!o.reducedMotion : !!(mqReduced && mqReduced.matches);

    var S = {
      dpr: 1, W: 0, H: 0, cssW: 0, cssH: 0, cell: 8, cols: 0, rows: 0, spc: 3, rw: 0, rh: 0, sampleCss: 1,
      rasters: [], mix: null, tmp: null, fieldKey: '', smearShift: 0, ink: INK, pigment: '#1B34F0',
      wi: 0, prev: 0, phase: HOLD, t: 0, ticks: [1, 1, 1, 1], speed: 1,
      ready: false, destroyed: false, userPaused: false, hiddenPaused: false, offscreen: false,
      timer: 0, runTicks: 0, cursorOn: true, lastDots: 0, lastMs: 0, fontOk: false, capTop: 0, capRows: 0
    };
    S.wi = ((o.startWord | 0) % words.length + words.length) % words.length;
    S.prev = (S.wi - 1 + words.length) % words.length;
    S.speed = o.speed || 1;

    function computeTicks() {
      var tm = o.tickMs, T = o.timings;
      S.ticks = [Math.max(1, Math.round(T.hold / tm)), Math.max(1, Math.round(T.dissolve / tm)),
        Math.max(1, Math.round(T.void / tm)), Math.max(1, Math.round(T.build / tm))];
    }
    computeTicks();

    function cssVar(name) { try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch (e) { return ''; } }
    function readColors() {
      S.ink = o.ink || cssVar('--ink') || INK;
      S.pigment = o.pigment || cssVar('--pigment') || '#1B34F0';
    }
    function col(c) { return !c || c === 'ink' ? S.ink : c === 'pigment' ? S.pigment : c; }

    /* ---------- geometry + raster */
    function measure() {
      var r = canvas.getBoundingClientRect();
      var cssW = Math.max(1, Math.round(r.width)), cssH = Math.max(1, Math.round(r.height));
      var dpr = clamp(global.devicePixelRatio || 1, 1, 3);
      var changed = cssW !== S.cssW || cssH !== S.cssH || dpr !== S.dpr;
      S.cssW = cssW; S.cssH = cssH; S.dpr = dpr;
      S.W = Math.round(cssW * dpr); S.H = Math.round(cssH * dpr);
      if (canvas.width !== S.W) canvas.width = S.W;
      if (canvas.height !== S.H) canvas.height = S.H;
      applyMode(cssW);
      var cell = typeof o.cellAt === 'function' ? o.cellAt(cssW) : (cssW < oBase.mobileBelow && o.cellMobile ? o.cellMobile : o.cell);
      if (cell !== S.cell) changed = true;
      S.cell = Math.max(2, cell);
      S.spc = clamp(o.samples | 0 || 3, 2, 4);
      S.cols = Math.max(1, Math.floor(cssW / S.cell)); S.rows = Math.max(1, Math.floor(cssH / S.cell));
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
      var cols = S.cols, rows = S.rows, SS = S.spc;
      var rw = cols * SS, rh = rows * SS;
      S.rw = rw; S.rh = rh; S.sampleCss = S.cell / SS;
      var off = document.createElement('canvas');
      off.width = rw; off.height = rh;
      var c = off.getContext('2d', { willReadFrequently: true });
      c.textBaseline = 'alphabetic';
      setFont(c, 100);
      var capRatio = (c.measureText('H').actualBoundingBoxAscent || 72) / 100;
      var padR = o.padCells | 0, padL = (o.padLeftCells != null ? o.padLeftCells | 0 : padR) + (o.haloInset | 0);
      var reserve = (o.reserve | 0) + (o.cursor ? o.cursor.w + o.cursor.gap : 0) + (o.proof ? o.proof.dx : 0) + (o.core && o.offset ? Math.ceil(Math.abs(o.offset[0])) : 0) +
        (o.plate2 && o.plate2.offset ? Math.ceil(Math.abs(o.plate2.offset[0])) : 0);
      var availCols = cols - padL - padR - reserve;
      var capRows = Math.max(3, Math.round(rows * o.capFrac)), px = 10, trackPx = 0, fits = false;
      for (; capRows >= 3; capRows--) {
        px = (capRows * SS) / capRatio;
        setFont(c, px);
        trackPx = (o.tracking || 0) * SS;
        var widest = 0;
        for (var i = 0; i < words.length; i++) widest = Math.max(widest, inkExtent(c, words[i], trackPx).width);
        if (widest <= availCols * SS) { fits = true; break; }
      }
      if (!fits) capRows = 3;
      var capTop = Math.floor((rows - capRows) / 2);
      if (o.proof) capTop = Math.max(0, Math.floor((rows - capRows - o.proof.dy) / 2));
      S.capTop = capTop; S.capRows = capRows;
      var baseY = (capTop + capRows) * SS;
      S.rasters = words.map(function (word, wi) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, rw, rh);
        c.fillStyle = '#000';
        var ext = inkExtent(c, word, trackPx);
        var startCol = o.align === 'center' ? Math.max(padL, Math.floor((cols - reserve - ext.width / SS) / 2)) : padL;
        drawWord(c, word, startCol * SS + ext.left, baseY, trackPx);
        var data = c.getImageData(0, 0, rw, rh).data;
        var f = new Float32Array(rw * rh);
        for (var k = 0; k < f.length; k++) f[k] = data[k * 4 + 3] / 255;
        // Sharp cell mask (core / proof / cursor anchor) on the square cell grid.
        var n = cols * rows, cov = new Float32Array(n), lastCol = -1;
        for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) {
          var sum = 0;
          for (var yy = 0; yy < SS; yy++) { var ro = (r * SS + yy) * rw + cc * SS; for (var xx = 0; xx < SS; xx++) sum += f[ro + xx]; }
          var v = sum / (SS * SS); cov[r * cols + cc] = v;
          if (v >= 0.5 && cc > lastCol) lastCol = cc;
        }
        // Enclosed counters (the bowls of O, D, R, ...) at raster resolution: threshold the field, flood the
        // white samples in from the border, and anything the flood never reaches is a counter. The screen is
        // knocked out there while the word is formed (o.counterClear), so a down-offset, down-smeared echo
        // can bleed under and below the letters without ever closing a bowl.
        var encl = null;
        if (o.counterClear > 0) {
          encl = new Uint8Array(rw * rh);
          var reach = new Uint8Array(rw * rh), st = new Int32Array(rw * rh), sp = 0, q, qx, qy;
          var seed = function (i) { if (f[i] < 0.5 && !reach[i]) { reach[i] = 1; st[sp++] = i; } };
          for (var bx = 0; bx < rw; bx++) { seed(bx); seed((rh - 1) * rw + bx); }
          for (var by = 0; by < rh; by++) { seed(by * rw); seed(by * rw + rw - 1); }
          while (sp > 0) {
            q = st[--sp]; qx = q % rw; qy = (q / rw) | 0;
            if (qx > 0) seed(q - 1);
            if (qx < rw - 1) seed(q + 1);
            if (qy > 0) seed(q - rw);
            if (qy < rh - 1) seed(q + rw);
          }
          for (var ei = 0; ei < encl.length; ei++) if (f[ei] < 0.5 && !reach[ei]) encl[ei] = 1;
        }
        return { word: word, field: f, cov: cov, encl: encl, lastCol: lastCol, wi: wi };
      });
      S.mix = new Float32Array(rw * rh); S.tmp = new Float32Array(rw * rh); S.fieldKey = '';
    }

    /* ---------- phase parameters (pure function of phase / tick) */
    function params(phase, t) {
      var N = S.ticks[phase], p = (t + 1) / N;
      var D = S.ticks[DISSOLVE], V = S.ticks[VOID], B = S.ticks[BUILD];
      var total = D + V + B, g = 0;
      if (phase === DISSOLVE) g = (t + 1) / total; else if (phase === VOID) g = (D + t + 1) / total; else if (phase === BUILD) g = (D + V + t + 1) / total;
      var dr = Math.sin(Math.PI * g), dv = o.drift || [0, 0];
      var P = { a: S.wi, b: S.wi, mix: 0, sigma: o.softness, smearMul: 1, level: 1, dx: dv[0] * dr, dy: dv[1] * dr,
        core: 1, coreTear: 0, formed: false, p: p, scatter: 0, frame: phase * 997 + t };
      var sc = o.scatter || 0;
      if (phase === HOLD) { P.formed = true; P.dx = P.dy = 0; }
      else if (phase === DISSOLVE) {
        var e = p * p; // ease-in: legible first, then the melt accelerates
        P.b = (S.wi + 1) % words.length;
        P.sigma = lerp(o.softness, o.bloom, e); P.smearMul = lerp(1, o.smearOut, e); P.level = lerp(1, o.haze, p);
        P.coreTear = clamp(p * 1.8, 0, 1); // core tears away in the first half
        P.scatter = sc * e;
      } else if (phase === VOID) {
        P.b = (S.wi + 1) % words.length;
        P.sigma = o.bloom; P.smearMul = o.smearOut; P.level = o.haze; P.mix = 0.5 * p; P.core = 0; P.scatter = sc;
      } else {
        var eb = ease(p), last = t >= N - 1;
        P.a = S.prev; P.b = S.wi;
        P.mix = 0.5 + 0.5 * eb; P.sigma = lerp(o.bloom, o.softness, eb); P.smearMul = lerp(o.smearOut, 1, eb);
        P.level = lerp(o.haze, 1, eb);
        P.core = last ? 1 : clamp((p - 0.6) / 0.4, 0, 1); // ink core snaps back last
        P.scatter = sc * (1 - eb);
        if (last) { P.formed = true; P.mix = 1; P.sigma = o.softness; P.smearMul = 1; P.level = 1; P.dx = P.dy = 0; P.scatter = 0; }
      }
      return P;
    }

    function field(P) {
      var key = [P.a, P.b, P.mix.toFixed(4), P.sigma.toFixed(4), (P.smearMul * o.smear).toFixed(4), S.rw, S.rh].join('|');
      if (key === S.fieldKey) return S.mix; // S.smearShift still belongs to this key
      var A = S.rasters[P.a].field, Bf = S.rasters[P.b].field, m = P.mix, buf = S.mix, n = buf.length, i;
      if (m <= 0) buf.set(A); else if (m >= 1) buf.set(Bf);
      else for (i = 0; i < n; i++) buf[i] = A[i] + (Bf[i] - A[i]) * m;
      var sx = P.sigma * S.spc, syCells = P.sigma * o.smear * P.smearMul, sy = syCells * S.spc;
      // One-sided only while the tail is short enough to sit inside the field: a one-sided box of sigma s
      // also carries the field down by ~s, so past smearDownMax the VOID bloom would be pushed off the
      // canvas. Above it the blur goes back to symmetric, which is what a haze should do anyway.
      S.smearShift = blur(buf, S.tmp, S.rw, S.rh, sx, sy, o.smearDir === 'down' && syCells <= o.smearDownMax);
      S.fieldKey = key;
      return buf;
    }

    // How enclosed (0..1) the point is, in the CURRENT word's counters; cross-faded like the field itself.
    function enclosedAt(P, x, y) {
      var EA = S.rasters[P.a].encl; if (!EA) return 0;
      var EB = S.rasters[P.b].encl;
      var ix = Math.round(x / S.sampleCss - 0.5), iy = Math.round(y / S.sampleCss - 0.5);
      if (ix < 0 || iy < 0 || ix >= S.rw || iy >= S.rh) return 0;
      var k = iy * S.rw + ix, a = EA[k], b = EB ? EB[k] : a;
      return a + (b - a) * P.mix;
    }

    function sample(F, x, y) { // x, y in CSS px
      var fx = x / S.sampleCss - 0.5, fy = y / S.sampleCss - 0.5;
      var x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0, w = S.rw, h = S.rh;
      function at(xx, yy) { return xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : F[yy * w + xx]; }
      var a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
      return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }

    /* ---------- drawing */
    function cellRect(c, r, inset) { // integer device-px rect of a square lattice cell
      var d = S.dpr, cs = S.cell;
      var x0 = Math.round(c * cs * d), y0 = Math.round(r * cs * d), x1 = Math.round((c + 1) * cs * d), y1 = Math.round((r + 1) * cs * d);
      var s = inset ? Math.max(1, Math.round(inset * d)) : 0;
      return [x0, y0, Math.max(1, x1 - x0 - s), Math.max(1, y1 - y0 - s)];
    }
    function drawDotsLattice() {
      if (!o.dots) return;
      var step = Math.max(2, o.dots.every || 8), d = S.dpr, sz = Math.max(1, Math.round(d));
      ctx.fillStyle = o.dots.color || '#D6D6D9';
      for (var y = Math.floor(step / 2); y < S.cssH; y += step)
        for (var x = Math.floor(step / 2); x < S.cssW; x += step) ctx.fillRect(Math.round(x * d), Math.round(y * d), sz, sz);
    }
    function drawCells(R, thr, dx, dy, col, keep) {
      var cols = S.cols, rows = S.rows, cov = R.cov, mask = null, k;
      ctx.fillStyle = col;
      if (dx || dy) { // proof sliver: shifted mask minus mask
        for (k = 0; k < cov.length; k++) {
          if (cov[k] < thr) continue;
          var r = ((k / cols) | 0) + dy, c = (k % cols) + dx;
          if (r >= rows || c >= cols || cov[r * cols + c] >= thr) continue;
          var q = cellRect(c, r); ctx.fillRect(q[0], q[1], q[2], q[3]);
        }
        return;
      }
      for (k = 0; k < cov.length; k++) {
        if (cov[k] < thr) continue;
        if (keep < 1 && rnd(o.seed + 41, R.wi, k) >= keep) continue;
        var qq = cellRect(k % cols, (k / cols) | 0); ctx.fillRect(qq[0], qq[1], qq[2], qq[3]);
      }
      return mask;
    }
    function drawCore(P, layer) {
      var C = o.core; if (!C || (C.layer || 'over') !== layer) return;
      var thr = C.threshold || 0.5;
      if (S.phase === DISSOLVE) drawCells(S.rasters[S.wi], thr, 0, 0, col(C.color), 1 - P.coreTear);
      else if (S.phase === BUILD) { if (P.core > 0) drawCells(S.rasters[S.wi], thr, 0, 0, col(C.color), P.core); }
      else if (S.phase === HOLD) drawCells(S.rasters[S.wi], thr, 0, 0, col(C.color), 1);
    }
    // One screen pass on the lattice. `pl` = { color, offset: [x, y], gain, dot, knockout } for Plate 02
    // (null = the main screen). Plate 02 samples the same field shifted by its offset and skips any dot
    // whose lattice point the main screen already covers (density >= knockout).
    function screenPass(F, P, pl) {
      var cs = S.cell, d = S.dpr, hex = o.grid !== 'square';
      var rowH = hex ? cs * Math.sqrt(3) / 2 : cs;
      var nRows = Math.ceil(S.cssH / rowH) + 1, nCols = Math.ceil(S.cssW / cs) + 1;
      // A one-sided ('down') smear also carries the field down; cancel that here so `offset` keeps its meaning
      // and only the tail — never the leading edge — moves.
      var off = o.offset || [0, 0], ox = (off[0] + P.dx) * cs, oy = (off[1] + P.dy) * cs - (S.smearShift || 0) * S.sampleCss;
      var po = pl && pl.offset ? pl.offset : [0, 0], pox = ox + po[0] * cs, poy = oy + po[1] * cs;
      var gainMain = o.gain * P.level, gain = pl ? (pl.gain || o.gain) * P.level : gainMain;
      var minD = o.minDensity, L = o.levels | 0, square = !pl && o.shape === 'square';
      var dot = pl ? (pl.dot || o.dot || 0.5) : (o.dot || 0.56);
      var rMax = dot * cs * d, count = 0, accent = pl ? 0 : (o.accent || 0), knock = pl ? (pl.knockout != null ? pl.knockout : 0.3) : 0;
      var main = col(pl ? pl.color : o.color), acc = S.pigment, scat = P.scatter || 0, seed = o.seed + (pl ? 131 : 0);
      // 1 while the word is sharp, 0 in the VOID haze: the counter knockout fades out with the word itself,
      // so it is a pure function of the phase/tick and stays in lockstep with no extra state.
      var solid = o.bloom > o.softness ? (o.bloom - P.sigma) / (o.bloom - o.softness) : 1;
      var clr = (o.counterClear || 0) * (solid < 0 ? 0 : solid > 1 ? 1 : solid);
      var pathMain = new Path2D(), pathAcc = accent ? new Path2D() : null;
      var sideMax = Math.max(1, Math.round((o.dot || 1) * cs * d) - (o.seam ? Math.max(1, Math.round(o.seam * d)) : 0));
      ctx.fillStyle = main;
      for (var r = 0; r < nRows; r++) {
        var cy = (r + 0.5) * rowH, shift = hex && (r & 1) ? cs / 2 : 0;
        for (var c = -1; c < nCols; c++) {
          var cx = (c + 0.5) * cs + shift;
          if (cx < 0 || cx > S.cssW) continue;
          var v = sample(F, cx - pox, cy - poy) * gain;
          if (v < minD) continue;
          if (clr > 0) { // knock the screen out of the counters while the word is legible
            var ec = enclosedAt(P, cx, cy);
            if (ec > 0) { v *= 1 - clr * ec; if (v < minD) continue; }
          }
          if (pl && sample(F, cx - ox, cy - oy) * gainMain >= knock) continue;
          if (v > 1) v = 1;
          if (scat > 0) { // seeded dropout, heavier where the screen is thin: the field breaks into specks
            var drop = scat * (0.25 + 0.75 * (1 - v));
            if (rnd(seed + 53, r * 4099 + c, P.frame) < drop) continue;
            v *= 1 - 0.35 * scat * rnd(seed + 59, r * 4099 + c, P.frame);
          }
          if (L > 0) { v = Math.round(v * L) / L; if (v <= 0) continue; }
          var isAcc = accent && rnd(o.seed + 7, r, c) < accent;
          count++;
          if (square) {
            var side = Math.max(1, Math.round(sideMax * Math.sqrt(v)));
            var cell0x = Math.round((cx - cs / 2) * d), cell0y = Math.round((cy - rowH / 2) * d);
            var inner = Math.round(cs * d);
            var x0 = cell0x + ((inner - side) >> 1), y0 = cell0y + ((inner - side) >> 1);
            if (isAcc) { ctx.fillStyle = acc; ctx.fillRect(x0, y0, side, side); ctx.fillStyle = main; }
            else ctx.fillRect(x0, y0, side, side);
          } else {
            var rad = rMax * Math.sqrt(v);
            if (rad < 0.4) { count--; continue; }
            var p = isAcc ? pathAcc : pathMain, X = cx * d, Y = cy * d;
            p.moveTo(X + rad, Y); p.arc(X, Y, rad, 0, 6.283185307179586);
          }
        }
      }
      if (!square) {
        ctx.fillStyle = main; ctx.fill(pathMain);
        if (pathAcc) { ctx.fillStyle = acc; ctx.fill(pathAcc); }
      }
      return count;
    }
    function drawScreen(P) {
      var F = field(P), n = 0;
      if (o.plate2) n += screenPass(F, P, o.plate2);
      n += screenPass(F, P, null);
      S.lastDots = n;
    }
    function cursorShouldShow() {
      var C = o.cursor; if (!C) return false;
      if (reduced || S.userPaused) return true;
      if (S.runTicks * o.tickMs >= C.solidAfterMs) return true;
      var period = Math.max(1, Math.round(C.blinkMs / o.tickMs));
      return (Math.floor(S.runTicks / period) % 2) === 0;
    }
    function drawCursor(R) {
      var C = o.cursor; if (!C || R.lastCol < 0) return;
      var c0 = Math.min(S.cols - C.w, R.lastCol + 1 + C.gap), r0 = S.capTop + S.capRows - C.h;
      var a = cellRect(c0, r0), b = cellRect(c0 + C.w - 1, r0 + C.h - 1);
      ctx.fillStyle = col(C.color || 'pigment');
      ctx.fillRect(a[0], a[1], b[0] + b[2] - a[0], b[1] + b[3] - a[1]);
    }

    function render() {
      if (!S.ready || !S.rasters.length) return;
      var t0 = (global.performance && performance.now) ? performance.now() : Date.now();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, S.W, S.H);
      if (o.background) { ctx.fillStyle = o.background; ctx.fillRect(0, 0, S.W, S.H); }
      drawDotsLattice();
      var P = params(S.phase, S.t), R = S.rasters[S.wi];
      if (o.proof && P.formed) drawCells(R, o.proof.threshold || 0.5, o.proof.dx | 0, o.proof.dy | 0, col(o.proof.color || 'pigment'));
      drawCore(P, 'under');
      drawScreen(P);
      drawCore(P, 'over');
      if (o.cursor && S.phase === HOLD) { S.cursorOn = cursorShouldShow(); if (S.cursorOn) drawCursor(R); }
      S.lastMs = ((global.performance && performance.now) ? performance.now() : Date.now()) - t0;
      if (typeof o.onFrame === 'function') { try { o.onFrame(api.state()); } catch (e) { /* ignore */ } }
    }

    /* ---------- word + clock */
    function announce() {
      if (o.accessibleEl) o.accessibleEl.textContent = words[S.wi].toLowerCase();
      if (typeof o.onWord === 'function') { try { o.onWord(S.wi, words[S.wi]); } catch (e) { /* ignore */ } }
      try { canvas.dispatchEvent(new CustomEvent('halftonehero:word', { detail: { index: S.wi, word: words[S.wi] } })); } catch (e) { /* ignore */ }
    }
    function tick() {
      if (S.destroyed || !S.ready) return;
      S.runTicks++;
      S.t++;
      if (S.t >= S.ticks[S.phase]) {
        S.t = 0;
        S.phase = (S.phase + 1) % 4;
        if (S.phase === BUILD) { S.prev = S.wi; S.wi = (S.wi + 1) % words.length; announce(); }
      }
      if (S.phase === HOLD && S.t > 0) {
        if (o.cursor) { var on = cursorShouldShow(); if (on !== S.cursorOn) render(); }
        return; // static hold
      }
      render();
    }
    function reducedCut() {
      if (S.destroyed || !S.ready) return;
      S.prev = S.wi; S.wi = (S.wi + 1) % words.length; S.phase = HOLD; S.t = 0;
      announce(); render();
    }
    function shouldRun() { return o.clock !== 'external' && S.ready && !S.userPaused && !S.hiddenPaused && !S.offscreen && !S.destroyed; }
    function sync() {
      var run = shouldRun();
      if (run && !S.timer) S.timer = setInterval(reduced ? reducedCut : tick, reduced ? o.reducedCutMs : Math.max(10, o.tickMs / S.speed));
      else if (!run && S.timer) { clearInterval(S.timer); S.timer = 0; }
    }
    function restartTimer() { if (S.timer) { clearInterval(S.timer); S.timer = 0; } sync(); }
    function updateButton() {
      var b = o.pauseButton; if (!b) return;
      b.setAttribute('aria-pressed', S.userPaused ? 'true' : 'false');
      var label = S.userPaused ? o.labels.play : o.labels.pause;
      var slot = b.querySelector('[data-label]');
      if (slot) slot.textContent = label; else b.textContent = label;
    }
    function phaseIndex(ph) {
      if (typeof ph === 'number') return clamp(ph | 0, 0, 3);
      var i = PHASES.indexOf(String(ph).toLowerCase());
      if (i < 0) throw new Error('HalftoneHero: unknown phase ' + ph);
      return i;
    }
    function seekTo(phase, t) {
      var pi = phaseIndex(phase);
      var baseWord = S.phase === BUILD ? S.prev : S.wi, before = S.wi;
      if (pi === BUILD) { S.prev = baseWord; S.wi = (baseWord + 1) % words.length; }
      else { S.wi = baseWord; S.prev = (baseWord - 1 + words.length) % words.length; }
      S.phase = pi;
      S.t = t == null ? Math.floor((S.ticks[pi] - 1) / 2) : clamp(t | 0, 0, S.ticks[pi] - 1);
      if (!S.userPaused) { S.userPaused = true; sync(); updateButton(); }
      if (S.wi !== before) announce();
      render();
    }

    /* ---------- observers */
    var ro = null, io = null, resizeT = 0;
    function relayout() { readColors(); measure(); if (S.ready) { rasterizeAll(); render(); } }
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
    function onMq() {
      var nr = o.reducedMotion != null ? !!o.reducedMotion : mqReduced.matches;
      if (nr !== reduced) { reduced = nr; S.phase = HOLD; S.t = 0; render(); restartTimer(); }
    }

    if (global.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(canvas); }
    else global.addEventListener('resize', onResize);
    if (global.IntersectionObserver) {
      io = new IntersectionObserver(function (en) { S.offscreen = !en[en.length - 1].isIntersecting; sync(); }, { threshold: 0 });
      io.observe(canvas);
    }
    document.addEventListener('visibilitychange', onVis);
    if (mqReduced && mqReduced.addEventListener) mqReduced.addEventListener('change', onMq);
    if (o.pauseButton) o.pauseButton.addEventListener('click', onBtn);
    S.hiddenPaused = !!document.hidden;

    /* ---------- boot */
    readColors(); measure(); updateButton();
    if (o.accessibleEl) o.accessibleEl.textContent = words[S.wi].toLowerCase();

    var fontSpecLoaded = '';
    function ensureFont() {
      if (!document.fonts || !document.fonts.load) return Promise.resolve(false);
      var spec = fontString(100, '"' + o.family + '"');
      var text = words.join(''), t0 = Date.now();
      fontSpecLoaded = spec;
      function attempt() {
        return document.fonts.load(spec, text).then(function (faces) {
          if (faces && faces.length) return true;
          if (Date.now() - t0 > o.fontTimeout) return false;
          return sleep(120).then(attempt);
        }, function () { return false; });
      }
      return attempt();
    }
    var lateFont = null;
    ensureFont().then(function (ok) {
      if (S.destroyed) return;
      S.fontOk = ok; S.ready = true;
      measure(); rasterizeAll(); render(); sync();
      if (!ok && document.fonts && document.fonts.addEventListener) {
        lateFont = function () {
          if (S.destroyed) return;
          if (document.fonts.check(fontString(40, '"' + o.family + '"'))) {
            document.fonts.removeEventListener('loadingdone', lateFont);
            S.fontOk = true; rasterizeAll(); render();
          }
        };
        document.fonts.addEventListener('loadingdone', lateFont);
      }
    });

    var api = {
      play: function () {
        if (!S.userPaused) return;
        S.userPaused = false;
        if (reduced && S.phase !== HOLD) { S.phase = HOLD; S.t = 0; render(); }
        sync(); updateButton();
      },
      pause: function () { // like PixelHero: pausing shows the formed word
        if (S.userPaused) return;
        S.userPaused = true; S.phase = HOLD; S.t = 0; sync(); updateButton(); render();
      },
      toggle: function () { if (S.userPaused) api.play(); else api.pause(); },
      isPaused: function () { return S.userPaused; },
      setWord: function (i) {
        S.prev = S.wi; S.wi = ((i | 0) % words.length + words.length) % words.length;
        S.phase = HOLD; S.t = 0; announce(); render();
      },
      jump: function (phase) { seekTo(phase, null); },
      follow: function (phase, tick, index, prev) { // slave mode: mirror a master clock frame exactly, no events
        var pi = phaseIndex(phase), n = words.length;
        S.phase = pi;
        S.wi = ((index | 0) % n + n) % n;
        S.prev = prev == null ? (S.wi - 1 + n) % n : ((prev | 0) % n + n) % n;
        S.t = clamp(tick | 0, 0, S.ticks[pi] - 1);
        render();
      },
      seek: function (phase, tick) { seekTo(phase, tick == null ? 0 : tick); },
      setSpeed: function (mult) { S.speed = clamp(+mult || 1, 0.05, 20); restartTimer(); },
      setOptions: function (partial) {
        if (!partial) return;
        userOpts = merge(userOpts, partial);
        buildBase();
        if (partial.words) words = partial.words.map(function (w) { return String(w).toUpperCase(); });
        if (partial.reducedMotion !== undefined) {
          reduced = partial.reducedMotion != null ? !!partial.reducedMotion : !!(mqReduced && mqReduced.matches);
          if (reduced) { S.phase = HOLD; S.t = 0; }
        }
        S.wi %= words.length; S.prev %= words.length;
        applyMode(S.cssW); computeTicks();
        S.t = Math.min(S.t, S.ticks[S.phase] - 1);
        var needFont = S.ready && fontString(100, '"' + o.family + '"') !== fontSpecLoaded;
        relayout(); restartTimer();
        if (needFont) ensureFont().then(function (ok) { if (!S.destroyed) { S.fontOk = ok; relayout(); } });
      },
      state: function () {
        return { phase: PHASES[S.phase], tick: S.t, ticks: { hold: S.ticks[0], dissolve: S.ticks[1], void: S.ticks[2], build: S.ticks[3] },
          word: words[S.wi], index: S.wi, prev: S.prev, preset: presetName, cell: S.cell, dpr: S.dpr, cols: S.cols, rows: S.rows,
          capRows: S.capRows, grid: o.grid, shape: o.shape, dots: S.lastDots, frameMs: S.lastMs, speed: S.speed,
          fontLoaded: !!S.fontOk, reduced: reduced, paused: S.userPaused, running: !!S.timer, ready: S.ready };
      },
      render: function () { render(); },
      destroy: function () {
        S.destroyed = true;
        if (S.timer) clearInterval(S.timer); S.timer = 0;
        clearTimeout(resizeT);
        if (ro) ro.disconnect(); else global.removeEventListener('resize', onResize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        if (mqReduced && mqReduced.removeEventListener) mqReduced.removeEventListener('change', onMq);
        if (o.pauseButton) o.pauseButton.removeEventListener('click', onBtn);
        if (lateFont && document.fonts) document.fonts.removeEventListener('loadingdone', lateFont);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    return api;
  }

  global.HalftoneHero = { mount: mount, presets: presets, defaults: DEFAULTS, phases: PHASES.slice(),
    stretchKeyword: stretchKeyword, version: '1.0.0' };
})(window);
