/* Pixel sky: a very light dithered cloud field drifting behind the page.
   Value noise -> ordered (Bayer) dither -> 4px cells in the palette blue,
   drawn on a fixed canvas under the content. Reference: a halftone-dithered
   bitmap sky, blue dots on white. Opacity and ink come from CSS
   (--sky-opacity, --sky-ink) so light and dark mode each get their own.
   Honours prefers-reduced-motion: one still frame, no animation. */

(function () {
  const CELL = 4;          // css px per pixel cell
  const FPS = 10;          // low frame rate suits the pixel look
  const DRIFT = 1.6;       // cells per second, left to right
  const SCALE = 0.028;     // noise frequency: smaller = bigger clouds
  const THRESH = 0.50;     // above = cloud (clear), below = sky (blue)
  const SPREAD = 0.42;     // how wide the dithered edge is

  const canvas = document.createElement('canvas');
  canvas.id = 'sky';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  /* Bayer 8x8 ordered-dither matrix, normalised to -0.5..0.5 */
  const B = [
    [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21],
  ].map((r) => r.map((v) => v / 64 - 0.5));

  /* Value noise on an integer lattice with a fixed hash, so it never changes between loads */
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = ((h ^ (h >>> 13)) * 1274126177) | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = (t) => t * t * (3 - 2 * t);
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = fade(x - xi), yf = fade(y - yi);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }
  /* Three octaves; each octave drifts at its own speed for a slow churn */
  function clouds(x, y, t) {
    return 0.55 * noise((x + t * DRIFT) * SCALE, y * SCALE)
         + 0.30 * noise((x + t * DRIFT * 1.6) * SCALE * 2.1 + 31, y * SCALE * 2.1 + 17)
         + 0.15 * noise((x + t * DRIFT * 2.4) * SCALE * 4.3 + 73, y * SCALE * 4.3 + 59);
  }

  let W = 0, H = 0, img = null, ink = [27, 52, 240];

  function readInk() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--sky-ink').trim();
    const m = v.match(/^#([0-9a-f]{6})$/i);
    if (m) ink = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  }

  function size() {
    W = Math.ceil(innerWidth / CELL);
    H = Math.ceil(innerHeight / CELL);
    canvas.width = W;
    canvas.height = H;
    img = ctx.createImageData(W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = ink[0]; d[i + 1] = ink[1]; d[i + 2] = ink[2]; }
  }

  function draw(t) {
    const d = img.data;
    let i = 3;
    for (let y = 0; y < H; y++) {
      const row = B[y & 7];
      for (let x = 0; x < W; x++, i += 4) {
        const v = clouds(x, y, t) + row[x & 7] * SPREAD;
        d[i] = v < THRESH ? 255 : 0;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0;
  function frame(now) {
    if (now - last >= 1000 / FPS) { last = now; draw(now / 1000); }
    requestAnimationFrame(frame);
  }

  readInk();
  size();
  if (still) draw(0); else requestAnimationFrame(frame);

  let rs;
  addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => { size(); if (still) draw(0); }, 120); });
  /* Ink changes with the theme */
  const recolor = () => { readInk(); size(); if (still) draw(0); };
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
})();
