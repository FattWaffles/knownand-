/* Shell for the secondary pages (pricing.html, terms.html, privacy.html),
   added 2026-09-30: the same top bar, rotating mark, footer and theme switch
   as index.html, rendered from content.js. site.js expects the home page's
   hero and tables, so these pages load this file in its place. The pricing
   page's cards come from window.PRICING (content.js). Nothing in here is
   content. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const S = window.SITE;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ext = (url) => (/^https?:/.test(url) ? ' rel="noopener"' : '');
  const pad = (n) => String(n).padStart(2, '0');
  const here = location.pathname.split('/').pop() || 'index.html';
  /* the home page's section links (#work, #about) point back at the home page */
  const href = (u) => (u.charAt(0) === '#' ? './' + u : u);
  const SOC = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    linkedin: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3.6 2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM2.2 6.2h2.8V14H2.2zM6.6 6.2h2.7v1.1c.4-.7 1.3-1.3 2.6-1.3 2.8 0 3.3 1.8 3.3 4.2V14h-2.8v-3.4c0-.8 0-1.9-1.2-1.9s-1.3.9-1.3 1.8V14H6.6z"/></svg>',
  };

  /* decode-in labels, same as site.js */
  const GLYPHS = '*$&%#';
  function decode(el, delay) {
    const text = el.dataset.text || el.textContent;
    const n = text.length;
    const dur = 600 + n * 45;
    const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    let start = null, last = 0, churn = '';
    function frame(t) {
      if (start === null) start = t + delay;
      const p = Math.min(1, Math.max(0, (t - start) / dur));
      const fixed = Math.floor(p * n);
      if (t - last > 45 || !churn) { churn = ''; for (let i = 0; i < n; i++) churn += rnd(); last = t; }
      let out = '';
      for (let i = 0; i < n; i++) out += text[i] === ' ' ? ' ' : i < fixed ? text[i] : churn[i];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }
  const scr = (t) => (REDUCED ? t : `<span class="sr">${t}</span><span class="scr" aria-hidden="true" data-text="${t}">${t}</span>`);

  /* top bar */
  $('#nav').innerHTML = S.nav.map((n) => n.icon
    ? `<a class="ico" href="${n.url}"${ext(n.url)} aria-label="${n.label}" title="${n.label}">${SOC[n.icon] || ''}</a>`
    : `<a href="${href(n.url)}"${n.url === here ? ' aria-current="page"' : ''}>${n.label}</a>`).join('<span>·</span>');
  const brand = $('#brand'), WORDS = S.brandWords || [];
  if (brand && WORDS.length) {
    brand.setAttribute('aria-label', 'Known, and: home');
    brand.innerHTML = `Known, and <span class="w" aria-hidden="true" data-text="${WORDS[0]}">${WORDS[0]}</span>`;
    if (!REDUCED && WORDS.length > 1) {
      const w = $('.w', brand); let wi = 0;
      setInterval(() => { wi = (wi + 1) % WORDS.length; w.dataset.text = WORDS[wi]; decode(w, 0); }, 3400);
    }
  }

  /* footer */
  $('#year').textContent = new Date().getFullYear();
  $('#foot-studio').textContent = S.studio;
  $('#foot-links').innerHTML = S.links.map((l) => `<a href="${l.url}"${ext(l.url)}${l.url === here ? ' aria-current="page"' : ''}>${l.label}</a>`).join('');

  /* theme: same switch and storage key as the rest of the site */
  const root = document.documentElement, tbtn = $('#theme');
  const isDark = () => root.dataset.theme !== 'light';
  const paintTheme = () => { tbtn.setAttribute('aria-pressed', String(isDark())); $('meta[name=theme-color]').setAttribute('content', isDark() ? '#050505' : '#FFFFFF'); };
  tbtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('known-theme', next); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  /* pricing cards (pricing.html only) */
  const P = window.PRICING, plans = $('#plans');
  if (P && plans) {
    $('#p-eyebrow').textContent = P.eyebrow;
    $('#p-title').textContent = P.title;
    $('#p-text').innerHTML = P.text;
    const priced = P.plans.some((p) => p.price);
    plans.innerHTML = P.plans.map((p, i) => `
      <article class="plan">
        <div class="plan-top"><span class="idx">${pad(i + 1)}</span><span class="tag">${p.kind}</span></div>
        <h2>${p.name}</h2>
        <p class="plan-text">${p.text}</p>
        <div class="price">${p.price ? `<b>${p.price}</b>` : '<b class="ask">Priced per engagement</b>'}<span>${p.unit}</span></div>
        <p class="plan-time"><i aria-hidden="true"></i>${p.time}</p>
        <ul>${p.includes.map((x) => `<li>${x}</li>`).join('')}</ul>
        ${p.cta ? `<a class="btn btn-lite" href="${P.cta.url}"${ext(P.cta.url)}>${p.cta}</a>` : ''}
      </article>`).join('');
    $('#how-eyebrow').textContent = P.how.eyebrow;
    $('#how-title').textContent = P.how.title;
    $('#how-text').innerHTML = P.how.text;
    const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const n = P.how.items.length, lastRow = n % 2 ? n - 1 : n - 2;
    $('#how').innerHTML = P.how.items.map((it, i) => `<div class="cell${i >= lastRow ? ' last' : ''}${i === n - 2 && n % 2 === 0 ? ' last-md' : ''}">
      <span class="idx">${pad(i + 1)}</span>
      <div class="glyph check" aria-hidden="true">${check}</div>
      <div><h3>${it.name}</h3><p>${it.text}</p></div></div>`).join('');
    const cta = $('#p-cta'); cta.href = P.cta.url; cta.textContent = P.cta.label;
    $('#p-cta-text').textContent = P.ctaText || '';
    $('#p-note').textContent = priced ? (P.note || '') : '';
  }

  /* decode-in: eyebrows on first view, like the home page */
  if (!REDUCED) {
    document.querySelectorAll('.eyebrow').forEach((el) => {
      const t = el.textContent.trim(); if (!t) return;
      el.innerHTML = scr(t);
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { decode(en.target, 0); io.unobserve(en.target); } }), { threshold: .5 });
      document.querySelectorAll('.eyebrow .scr').forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll('.eyebrow .scr').forEach((el) => decode(el, 0));
    }
  }

  /* legal pages: mark the section in view in the contents list */
  const toc = $('.toc');
  if (toc && 'IntersectionObserver' in window) {
    const links = [...toc.querySelectorAll('a')];
    const byId = Object.fromEntries(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { links.forEach((a) => a.removeAttribute('aria-current')); const a = byId[en.target.id]; if (a) a.setAttribute('aria-current', 'true'); } });
    }, { rootMargin: '-72px 0px -70% 0px' });
    document.querySelectorAll('.prose h2[id]').forEach((h) => io.observe(h));
  }
})();
