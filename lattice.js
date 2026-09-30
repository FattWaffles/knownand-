/* Lattice: the page's motion layer. After a p5.js GIF by M:PY (@M_Pierini) that
   Josie sent on 2026-09-30: a black field, a grid of thin lines with dots at
   the crossings, cream rounded squares in the cells that turn at their own
   pace, and prismatic (red / yellow / cyan / blue) fringes on whatever moves.

   One fixed canvas under the page draws
   - the grid, registered to the document so it scrolls with the content,
   - the crossing dots, a few of which swell and settle,
   - short prismatic glints that run along the lines,
   - inside every element with class "band" (the hero's pause), a field of
     turning squares. Each square rests, then turns 45 degrees with an ease,
     and its edges split into red and blue while it moves.
   Colours and the cell size come from CSS variables (--grid, --node, --sq,
   --prism-*, --cell) so the light theme and phones just work. Every phase is a
   hash of the cell, not a random number, so the field is steady while you
   scroll. prefers-reduced-motion gets one still frame. */

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'lattice';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FPS = 30;

  let W = 0, H = 0, dpr = 1, C = 72, ox = 0, col = {};   // ox: the grid's x origin, so a line lands on the text column's left edge
  let bands = [], bandTick = 0;

  /* ---------- helpers ---------- */
  const hash = (i, j, k) => {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1597334677)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
  const ease = (u) => (u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  function rgba(hex, a) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function readColours() {
    const s = getComputedStyle(document.documentElement);
    const v = (n, d) => (s.getPropertyValue(n).trim() || d);
    col = {
      grid: v('--grid', '#262626'), node: v('--node', '#F3EEE4'), sq: v('--sq', '#F3EEE4'),
      r: v('--prism-r', '#FF3B30'), y: v('--prism-y', '#FFD60A'), c: v('--prism-c', '#34E2FF'), b: v('--prism-b', '#2F6BFF'),
      nodeA: parseFloat(v('--node-alpha', '.55')), sqA: parseFloat(v('--sq-alpha', '1')),
    };
    C = parseFloat(v('--cell', '72')) || 72;
  }
  function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColours();
    alignBands();
  }
  /* The grid registers to the main column: one vertical line on its left edge.
     On the desktop that is 288px (4 cells of 72); on phones it is the 16px gutter. */
  function originX() {
    const m = document.querySelector('main');
    if (!m) return 0;
    const left = m.getBoundingClientRect().left + parseFloat(getComputedStyle(m).paddingLeft || 0);
    return ((left % C) + C) % C;
  }
  /* Bands snap to the grid: top on a cell line, height a whole number of rows,
     so the squares always sit in complete cells. Re-run after fonts load and
     every couple of seconds in case the layout above them moved. */
  function alignBands() {
    ox = originX();
    bands = [...document.querySelectorAll('.band')];
    for (const el of bands) {
      const cur = parseFloat(el.style.marginTop) || 0;
      const top = el.getBoundingClientRect().top + (window.scrollY || 0) - cur;
      const mt = (C - (top % C)) % C;
      const h = parseInt(el.dataset.rows || '2', 10) * C;
      if (Math.abs(mt - cur) > .5) el.style.marginTop = mt + 'px';
      if (el.style.height !== h + 'px') el.style.height = h + 'px';
    }
  }

  /* ---------- one frame ---------- */
  function draw(t) {
    const sy = window.scrollY || 0;
    const off = ((sy % C) + C) % C;           // grid registered to the document
    ctx.clearRect(0, 0, W, H);

    // grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = col.grid;
    ctx.beginPath();
    for (let x = ox - C; x <= W + C; x += C) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
    for (let y = -off; y <= H + C; y += C) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
    ctx.stroke();

    const j0 = Math.floor(sy / C) - 1, j1 = j0 + Math.ceil(H / C) + 3;
    const i1 = Math.ceil(W / C) + 1, i0 = -1;

    // glints: short prismatic runs along a segment, timed per segment
    if (!still) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.6;
      const len = C * .42;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) for (let d = 0; d < 2; d++) {
        const R = 18 + 42 * hash(i, j, 11 + d);
        const u = ((t / 1000 + R * hash(i, j, 21 + d)) % R) / .9;    // 0..1 while running, else > 1
        if (u > 1) continue;
        const x0 = i * C + ox, y0 = j * C - sy;
        const p = u * C;
        const flip = hash(i, j, 31 + d) < .5;
        let ax, ay, bx, by;
        if (d === 0) { ax = x0 + p - len / 2; ay = y0 + .5; bx = ax + len; by = ay; }
        else { ax = x0 + .5; ay = y0 + p - len / 2; bx = ax; by = ay + len; }
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        const stops = flip ? [col.b, col.c, col.y, col.r] : [col.r, col.y, col.c, col.b];
        g.addColorStop(0, rgba(stops[0], 0)); g.addColorStop(.25, stops[0]); g.addColorStop(.5, stops[1]);
        g.addColorStop(.7, stops[2]); g.addColorStop(.85, stops[3]); g.addColorStop(1, rgba(stops[3], 0));
        ctx.globalAlpha = Math.sin(Math.PI * u) * .9;
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
      ctx.restore();
    }

    // crossing dots: a base dot everywhere, a swell now and then
    for (let j = j0; j <= j1; j++) {
      const y = j * C - sy;
      if (y < -8 || y > H + 8) continue;
      for (let i = i0; i <= i1; i++) {
        const x = i * C + ox;
        let r = 1.2, a = col.nodeA;
        if (!still) {
          const Q = 4 + 9 * hash(i, j, 1);
          const u = ((t / 1000 + Q * hash(i, j, 2)) % Q) / 1.5;
          if (u < 1) { const s = Math.sin(Math.PI * u); r = 1.2 + 3.4 * s; a = col.nodeA + (1 - col.nodeA) * s; }
        }
        ctx.fillStyle = rgba(col.node, a);
        ctx.beginPath(); ctx.arc(x + .5, y + .5, r, 0, Math.PI * 2); ctx.fill();
      }
    }

    // bands: turning squares in the cells inside each .band
    if (++bandTick % 60 === 0) alignBands();
    const side = C * .52, rad = side * .24;
    for (const el of bands) {
      const b = el.getBoundingClientRect();
      if (b.bottom < 0 || b.top > H || b.width < C) continue;
      const ia = Math.ceil((b.left - ox - .5) / C), ib = Math.floor((b.right - ox + .5) / C) - 1;
      const ja = Math.ceil((b.top + sy - .5) / C), jb = Math.floor((b.bottom + sy + .5) / C) - 1;
      for (let j = ja; j <= jb; j++) for (let i = ia; i <= ib; i++) {
        const cx = (i + .5) * C + ox + .5, cy = (j + .5) * C - sy + .5;
        // schedule: rest, then a 45 degree turn that eases; at rest, squares sit at 0 or 45
        let ang = (hash(i, j, 3) < .5 ? Math.PI / 4 : 0), speed = 0;
        if (!still) {
          const P = 2.2 + 4 * hash(i, j, 4), D = .7 + .6 * hash(i, j, 5);
          const tt = t / 1000 + P * hash(i, j, 6);
          const n = Math.floor(tt / P), f = tt - n * P;
          const dir = hash(i, j, 7) < .5 ? 1 : -1;
          let e = 0;
          if (f > P - D) { const u = (f - (P - D)) / D; e = ease(u); speed = Math.abs(Math.sin(Math.PI * u)); }
          ang += dir * (n + e) * Math.PI / 4;
        }
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(ang);
        // prismatic split: red one way, blue the other, wider while turning
        const d = .9 + 2.2 * speed, fa = .22 + .6 * speed;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = rgba(col.r, fa); rrect(-side / 2 - d, -side / 2, side, side, rad); ctx.fill();
        ctx.fillStyle = rgba(col.b, fa); rrect(-side / 2 + d, -side / 2, side, side, rad); ctx.fill();
        ctx.fillStyle = rgba(col.y, fa * .5); rrect(-side / 2, -side / 2 - d * .6, side, side, rad); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = rgba(col.sq, col.sqA); rrect(-side / 2, -side / 2, side, side, rad); ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ---------- run ---------- */
  let last = 0;
  function loop(t) {
    if (t - last >= 1000 / FPS) { last = t; draw(t); }
    requestAnimationFrame(loop);
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('DOMContentLoaded', alignBands);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignBands);
  new MutationObserver(() => { readColours(); if (still) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (still) {
    draw(0);
    addEventListener('scroll', () => draw(0), { passive: true });
    setTimeout(() => { alignBands(); draw(0); }, 50);
  } else {
    requestAnimationFrame(loop);
  }
})();
