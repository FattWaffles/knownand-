/* Technical blog. Edit this file only; blog.html renders it.
   Posts newest first. `body` is Markdown inside a template literal:
   # heading, ## smaller, - lists, 1. lists, > quotes, **bold**, *em*,
   [links](url), ![alt](image), --- rule, and fenced code with ~~~lang.
   Inline code uses backticks, written as \` inside the template literal.
   `id` is the URL: blog.html#p-<id>.

   The two posts below are DRAFTS written from this site's own code, to show
   the format. Rewrite them in your voice or delete them. */

window.BLOG = {
  title: 'Blog',
  intro: 'Notes on how things are built: this site, my projects, the tools. Short, with code.',
  posts: [
    {
      id: 'decode-in',
      date: '30 Sep 2026',
      title: 'Text that decodes in',
      tags: ['javascript', 'motion', 'accessibility'],
      summary: 'The hero lines arrive as a churn of *$&%# glyphs that settle into words. One function, two rules.',
      body: `
The hero on the home page arrives as a churn of \`*$&%#\` glyphs that settle into words, left to right. It is a small effect and it took one function.

# How it works

Each animated span keeps its real text in a data attribute. On every frame the function works out how far along it is (0 to 1), fixes that fraction of the characters from the left, and fills the rest with random glyphs. The random fill is regenerated only every 45ms, so it flickers at a readable rate instead of every frame. Spaces stay spaces, so the word shapes are there from the start.

~~~js
const GLYPHS = '*$&%#';

function decode(el, delay) {
  const text = el.dataset.text, n = text.length;
  const dur = 600 + n * 45;
  const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  let start = null, last = 0, churn = '';

  function frame(t) {
    if (start === null) start = t + delay;
    const p = Math.min(1, Math.max(0, (t - start) / dur));
    const fixed = Math.floor(p * n);
    if (t - last > 45 || !churn) {
      churn = Array.from({ length: n }, rnd).join('');
      last = t;
    }
    let s = '';
    for (let i = 0; i < n; i++) {
      s += text[i] === ' ' ? ' ' : i < fixed ? text[i] : churn[i];
    }
    el.textContent = p < 1 ? s : text;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
~~~

Duration scales with length (600ms plus 45ms a character), so a long label and a short one finish at about the same pace. Each line starts 160ms after the one before it.

# Two rules

- **Screen readers get the real text.** Every animated span has a visually hidden twin with the plain string, and the animated one is \`aria-hidden\`. Nobody hears "star dollar ampersand".
- **Reduced motion means no animation.** If \`prefers-reduced-motion\` is set, the text is simply there.
`,
    },
    {
      id: 'pixel-sky',
      date: '30 Sep 2026',
      title: 'A pixel sky in 4px cells',
      tags: ['canvas', 'javascript', 'dither'],
      summary: 'The faint sky behind this site is drawn, not loaded: value noise, a Bayer matrix and one colour.',
      body: `
The background of this site is a very faint sky: blue dots on white, drifting left to right. It is drawn on a canvas, not loaded as an image, so it fits any window and stays crisp when each pixel is 4px wide.

# Three steps

1. **Value noise.** A hash on an integer grid gives a fixed random value per lattice point, and a smoothstep blends between them. Three octaves stacked (0.55, 0.30, 0.15) make clouds with soft edges and a little grain. The hash is fixed, so the sky is the same on every visit.
2. **Ordered dither.** Each cell compares its noise value against a threshold, nudged by an 8×8 Bayer matrix. That turns a smooth field into on/off cells with the classic halftone look.
3. **Cells.** One canvas pixel per cell, scaled up with \`image-rendering: pixelated\`, so a 4px cell stays a hard square.

In outline:

~~~js
// 8x8 Bayer matrix, normalised to -0.5..0.5
const B = BAYER.map((row) => row.map((v) => v / 64 - 0.5));

function isSky(x, y, t) {
  const v = clouds(x, y, t);              // 0..1 from three octaves of value noise
  const nudge = B[y & 7][x & 7] * SPREAD; // tiles every 8 cells
  return v + nudge < THRESH;              // true = blue cell, false = clear
}
~~~

# Keeping it quiet

- It runs at 10 frames a second. A pixel look does not need 60, and the low rate is part of the feel.
- The drift is 1.6 cells a second, about the speed of a slow cursor.
- Opacity is a CSS variable (\`--sky-opacity\`: .075 in light mode, .06 in dark), so the sky reads as texture, not a picture. The ink colour is read from CSS too, so dark mode gets the lighter blue.
- \`prefers-reduced-motion\` gets one still frame and no timer.

The whole thing is about 120 lines. The knobs are six constants at the top of the file: cell size, frame rate, drift, noise scale, threshold and spread.
`,
    },
  ],
};
