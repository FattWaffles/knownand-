/* Pre-render step 1 of 2. Open the site in a browser (local server or knownand.com), open the
   console, paste this whole file, press Enter. It downloads tools/prerender.json. Then run
   `python3 tools/prerender.py` from the site folder and commit index.html (step 2).
   Why: the dashboard lists are built by app.js. Most AI crawlers do not run JavaScript, so
   index.html carries a static copy of the rendered lists, which app.js overwrites on load. */
(() => {
  const ids = ['side-list', 'now-chips', 'now-list', 'work-list', 'more-list', 'brand-list'];
  const out = {};
  for (const id of ids) {
    const c = document.getElementById(id).cloneNode(true);
    c.querySelectorAll('.shot-html,.scaled').forEach((e) => e.removeAttribute('style')); // viewport-specific, app.js recomputes
    out[id] = c.innerHTML;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' }));
  a.download = 'prerender.json'; a.click();
  console.log('Saved prerender.json. Move it to tools/ and run: python3 tools/prerender.py');
})();
