/* Renders content.js into index.html, runs the live clocks, the progress
   bars and the floating-badge parallax. Nothing in here is content. */

/* Old deep links (knownand.com/#/sapphire/2) belonged to the case-study
   viewer; send them on. Lives here, not inline, so the CSP can stay strict. */
if (/^#\/[a-z]/i.test(location.hash)) location.replace(VIEWER + location.hash);
/* The log site's own hashes (#e-<entry>, #<tag>) from when it was the root go to /case-studies/. */
else if (/^#(e-[a-z0-9-]+|web3|product|research|brand|web)$/i.test(location.hash)) location.replace(CASES + location.hash);

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const S = window.SITE, B = window.BUILDING, D = window.SHIPPED, L = window.LEARNING, SEC = window.SECURITY, AB = window.ABOUT, N = window.NEXT;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ext = (url) => (/^https?:/.test(url) ? ' rel="noopener"' : '');
  const fmtDate = (d) => {
    let h = d.getHours(), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}, ${h}:${pad(d.getMinutes())} ${ap}`;
  };
  const fmtDur = (ms, withMs) => {
    if (ms < 0) ms = 0;
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4); ms -= m * 6e4;
    const s = Math.floor(ms / 1e3); const r = Math.floor(ms - s * 1e3);
    return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s` + (withMs ? ` <small>${String(r).padStart(3, '0')}ms</small>` : '');
  };

  /* Program icons: tile colour + drawing. Letter tiles use the maker's
     own colour pairs; the rest are simplified marks. */
  const rays = () => { let s = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r1 = i % 2 ? 5.5 : 4, r2 = i % 2 ? 9 : 10.5; s += `<line x1="${(12 + r1 * Math.cos(a)).toFixed(2)}" y1="${(12 + r1 * Math.sin(a)).toFixed(2)}" x2="${(12 + r2 * Math.cos(a)).toFixed(2)}" y2="${(12 + r2 * Math.sin(a)).toFixed(2)}"/>`; } return s; };
  const svg = (inner, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${inner}</svg>`;
  const ICONS = {
    claude:       { bg: '#D97757', svg: svg(`<g stroke="#fff" stroke-width="2.1" stroke-linecap="round">${rays()}</g>`) },
    figma:        { bg: '#1E1E1E', svg: svg(`<path d="M12 3H9a3 3 0 0 0 0 6h3z" fill="#F24E1E"/><path d="M12 3h3a3 3 0 0 1 0 6h-3z" fill="#FF7262"/><path d="M12 9H9a3 3 0 0 0 0 6h3z" fill="#A259FF"/><circle cx="15" cy="12" r="3" fill="#1ABCFE"/><path d="M12 15H9a3 3 0 1 0 3 3z" fill="#0ACF83"/>`) },
    photoshop:    { bg: '#001E36', fg: '#31A8FF', text: 'Ps' },
    illustrator:  { bg: '#330000', fg: '#FF9A00', text: 'Ai' },
    aftereffects: { bg: '#00005B', fg: '#9999FF', text: 'Ae' },
    procreate:    { bg: '#0B0B0B', svg: svg(`<defs><linearGradient id="g-pc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF5DA2"/><stop offset=".5" stop-color="#7B61FF"/><stop offset="1" stop-color="#5DE2FF"/></linearGradient></defs><path d="M4.5 17c3-8.5 6-8.5 8-4.5s4 4.5 7-3" stroke="url(#g-pc)" stroke-width="3.6" stroke-linecap="round" fill="none"/>`) },
    github:       { bg: '#151515', svg: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="#fff" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>` },
    solana:       { bg: '#0B0B0B', svg: svg(`<defs><linearGradient id="g-sol" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/></linearGradient></defs><g fill="url(#g-sol)"><path d="M7 4h14l-4 3.6H3z"/><path d="M3 10.2h14l4 3.6H7z"/><path d="M7 16.4h14l-4 3.6H3z"/></g>`) },
    autocad:      { bg: '#B71C1C', fg: '#fff', text: 'A' },
    godot:        { bg: '#478CBF', svg: svg(`<rect x="10.5" y="4" width="3" height="4" rx="1" fill="#fff"/><rect x="4" y="7" width="16" height="11" rx="5.5" fill="#fff"/><circle cx="9" cy="12.5" r="1.9" fill="#478CBF"/><circle cx="15" cy="12.5" r="1.9" fill="#478CBF"/>`) },
    shopify:      { bg: '#96BF48', svg: svg(`<path d="M8.5 9V7.5a3.5 3.5 0 0 1 7 0V9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M6 9h12l1 11.5H5z" fill="#fff"/><text x="12" y="17.6" font-size="7.5" font-weight="700" fill="#96BF48" text-anchor="middle" font-family="Space Grotesk, sans-serif">S</text>`) },
  };

  /* decode-in labels, from the previous version: the real text sits in a
     visually hidden twin; the visible twin churns *$&%# glyphs and settles
     left to right. Reduced motion gets the plain text. */
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

  /* social tags on project rows */
  const SOC = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    x: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M12.2 1.5h2.2L9.6 7l5.6 7.5h-4.4L7.4 9.9 3.4 14.5H1.2l5.1-5.9L1 1.5h4.5l3.1 4.1zm-.8 11.7h1.2L4.7 2.8H3.4z"/></svg>',
    linkedin: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3.6 2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM2.2 6.2h2.8V14H2.2zM6.6 6.2h2.7v1.1c.4-.7 1.3-1.3 2.6-1.3 2.8 0 3.3 1.8 3.3 4.2V14h-2.8v-3.4c0-.8 0-1.9-1.2-1.9s-1.3.9-1.3 1.8V14H6.6z"/></svg>',
    discord: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M13.5 3.3A12 12 0 0 0 10.6 2.4l-.4.8a11 11 0 0 0-4.4 0l-.4-.8a12 12 0 0 0-2.9.9C.6 6.1.1 8.8.4 11.5a12 12 0 0 0 3.6 1.8l.8-1.2a8 8 0 0 1-1.2-.6l.3-.2a8.6 8.6 0 0 0 8.2 0l.3.2-1.2.6.8 1.2a12 12 0 0 0 3.6-1.8c.3-3.1-.5-5.8-2.1-8.2zM5.7 9.9c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5zm4.6 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5z"/></svg>',
    web: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.3"/><path d="M1.7 8h12.6M8 1.7c2 2 2 10.6 0 12.6M8 1.7c-2 2-2 10.6 0 12.6"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 1.8v12.4c0 .5.5.8.9.5l9.6-6.2c.4-.2.4-.8 0-1L3.9 1.3c-.4-.3-.9 0-.9.5z"/></svg>',
    appstore: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9.2 2.5 4.6 10.4M6.8 2.5l4.6 7.9M2.2 10.4h11.6M3.8 13l.6-1M12.2 13l-.6-1"/></svg>',
    itch: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 3.5h11M3 3.5v3.2a1.7 1.7 0 0 0 3.4 0 1.7 1.7 0 0 0 3.3 0 1.7 1.7 0 0 0 3.3 0V3.5M3.6 8v5h8.8V8"/></svg>',
  };
  const SOC_LABEL = { github: 'GitHub', x: 'X', linkedin: 'LinkedIn', discord: 'Discord', web: 'Site', play: 'Google Play', appstore: 'App Store', itch: 'itch.io' };
  const socials = (list) => (list && list.length)
    ? `<span class="socs">${list.map((t) => `<a class="soc" href="${t.url}"${ext(t.url)}>${SOC[t.kind] || SOC.web}<span>${t.label || SOC_LABEL[t.kind] || t.kind}</span></a>`).join('')}</span>`
    : '';

  /* top + hero */
  $('#brand').textContent = S.domain;
  $('#nav').innerHTML = S.nav.map((n) => `<a href="${n.url}">${n.label}</a>`).join('<span>·</span>');
  $('#pill-name').textContent = S.name;
  $('#pill-role').innerHTML = `<b>${S.studio}</b><span class="dot">·</span>${scr(S.role)}`;
  $('#h1').textContent = S.headline;
  $('#sub').innerHTML = S.sub;
  const cta = $('#cta'); cta.href = S.cta.url; $('span', cta).textContent = S.cta.label;

  /* badges: a left column and a bottom-right cluster, like the reference */
  const L_POS = [[-14, 56], [-4, 64], [-12, 72], [-2, 80], [-14, 88], [0, 96]];
  const R_POS = [[196, 88], [150, 86], [106, 90], [60, 78], [18, 84]];
  let li = 0, ri = 0;
  const badges = S.stack.map((b, i) => {
    const left = b.side === 'l';
    const [x, y] = left ? (L_POS[li++] || [0, 60]) : (R_POS[ri++] || [0, 80]);
    const ic = ICONS[b.icon] || { bg: '#151515', fg: '#fff', text: b.label.slice(0, 2) };
    const tilt = ((i * 37) % 24) - 12, depth = (0.45 + ((i * 53) % 10) / 16).toFixed(2), delay = -((i * 0.7) % 5.5).toFixed(1);
    return `<span class="badge" title="${b.label}" aria-hidden="true" data-depth="${depth}"
      style="${left ? 'left' : 'right'}:${x}px;top:${y}%;--tilt:${tilt}deg;--d:${delay}s;background:${ic.bg};color:${ic.fg || '#fff'}">${ic.svg || ic.text}</span>`;
  }).join('');
  $('#badges').insertAdjacentHTML('beforeend', badges);
  $('#stack-list').textContent = 'Programs: ' + S.stack.map((b) => b.label).join(', ') + '.';

  /* currently building */
  $('#building').innerHTML = B.map((b, i) => `
    <div class="row" data-start="${b.started}">
      <div class="proj"><div class="num">${i + 1}</div><div>
        <h3>${b.title}<span class="tag building">${b.status || 'Building'}</span>${socials(b.social)}</h3>
        <p>${b.text}</p>
        <p class="meta">${b.kind} · Started ${fmtDate(new Date(b.started))}${b.note ? ' · ' + b.note : ''}</p>
      </div></div>
      <div class="time" data-label="Building time"><b class="clock" aria-live="off">—</b><span>Counting live</span></div>
      <div class="pct-wrap" data-label="Completed">
        <div class="pct"><b>${b.progress}%</b><span>in progress</span></div>
        <div class="bar" role="progressbar" aria-valuenow="${b.progress}" aria-valuemin="0" aria-valuemax="100"><i data-w="${b.progress}%"></i></div>
      </div>
    </div>`).join('');

  /* shipped */
  $('#shipped').innerHTML = D.map((d, i) => `
    <div class="row">
      <div class="proj"><div class="num">${i + 1}</div><div>
        <h3>${d.url ? `<a href="${d.url}">${d.title} <span class="ext" aria-hidden="true">↗</span></a>` : d.title}${socials(d.social)}</h3>
        <p class="meta">${d.sub}</p>
      </div></div>
      <div class="kind" data-label="Kind"><i></i>${d.kind}</div>
      <div class="stat" data-label="Result"><b>${d.stat}</b><span>${d.label}</span></div>
    </div>`).join('');

  /* two-column cell grids (learning, security) */
  const cells = (items, render) => {
    const n = items.length, lastRow = n % 2 ? n - 1 : n - 2;
    return items.map((it, i) => `<div class="cell${i >= lastRow ? ' last' : ''}${i === n - 2 && n % 2 === 0 ? ' last-md' : ''}">${render(it, i)}</div>`).join('');
  };
  $('#learn-eyebrow').textContent = L.eyebrow;
  $('#learn-title').textContent = L.title;
  $('#learn-text').textContent = L.text;
  $('#cells').innerHTML = cells(L.items, (it, i) => `
      <span class="idx">${pad(i + 1)}</span><span class="imp">↑ Improving</span>
      <div class="glyph" aria-hidden="true">${it.glyph}</div>
      <div><h3>${it.name}</h3><p>${it.text}</p></div>`);
  $('#steps').innerHTML = L.steps.map((s) => `<span>${s}</span>`).join('<i aria-hidden="true">→</i>');

  /* security layer + certifications */
  $('#sec-eyebrow').textContent = SEC.eyebrow;
  $('#sec-title').textContent = SEC.title;
  $('#sec-text').textContent = SEC.text;
  const check = svg('<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>');
  $('#sec-cells').innerHTML = cells(SEC.items, (it, i) => `
      <span class="idx">${pad(i + 1)}</span>
      <div class="glyph check" aria-hidden="true">${check}</div>
      <div><h3>${it.name}</h3><p>${it.text}</p></div>`);
  const certs = $('#certs');
  if (SEC.certs && SEC.certs.length) {
    certs.hidden = false;
    certs.innerHTML = '<span class="eyebrow">Certifications</span>' + SEC.certs.map((c) => {
      const body = `<b>${c.name}</b>${c.issuer ? ' ' + c.issuer : ''}${c.year ? ' · ' + c.year : ''}`;
      return c.url ? `<a class="pill pill-lite" href="${c.url}"${ext(c.url)}>${body}</a>` : `<span class="pill pill-lite">${body}</span>`;
    }).join('');
  }

  /* about */
  $('#about-eyebrow').textContent = AB.eyebrow;
  $('#about-title').textContent = AB.title;
  $('#about-paras').innerHTML = AB.paras.map((p) => `<p>${p}</p>`).join('');
  const auto = { 'auto:building': B.length, 'auto:brands': (window.BRANDS || []).length };
  $('#stats').innerHTML = AB.stats.map((s) => `<div><b>${auto[s.n] ?? s.n}</b><span>${s.label}</span></div>`).join('');

  /* next + footer */
  $('#next-eyebrow').textContent = N.eyebrow;
  $('#next-title').textContent = N.title;
  $('#next-text').textContent = N.text;
  $('#next-pill').textContent = N.pill;
  /* weekly sign-up, beside the meeting button */
  const NL = window.NEWSLETTER;
  if (NL) {
    const form = $('#signup'), input = $('#nl-email'), status = $('#nl-status');
    $('#nl-line').textContent = [NL.title, NL.note].filter(Boolean).join(' ');
    input.placeholder = NL.placeholder || 'you@example.com';
    input.name = NL.field || 'email';
    $('button', form).textContent = NL.button || 'Sign up';
    if (NL.action) { form.action = NL.action; form.method = 'post'; }
    form.addEventListener('submit', (e) => {
      const v = input.value.trim();
      if (!v || !input.checkValidity()) { e.preventDefault(); status.textContent = 'Enter an email address.'; input.focus(); return; }
      if (NL.action) { status.textContent = 'Sending…'; return; }
      e.preventDefault();
      const subject = encodeURIComponent('Sign up for the weekly');
      const body = encodeURIComponent(`Please add ${v} to the Known, and weekly.`);
      status.textContent = 'Opening your mail app to finish signing up.';
      location.href = `mailto:${NL.mailto}?subject=${subject}&body=${body}`;
    });
  }

  $('#year').textContent = new Date().getFullYear();
  $('#foot-studio').textContent = S.studio;
  $('#foot-links').innerHTML = S.links.map((l) => `<a href="${l.url}"${ext(l.url)}>${l.label}</a>`).join('');

  /* theme: same switch and storage key as the rest of the site (head.js
     applies the saved choice before first paint). Dark is the default. */
  const root = document.documentElement, tbtn = $('#theme');
  const isDark = () => root.dataset.theme !== 'light';
  const paintTheme = () => { tbtn.setAttribute('aria-pressed', String(isDark())); $('meta[name=theme-color]').setAttribute('content', isDark() ? '#050505' : '#F3EEE4'); };
  tbtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('known-theme', next); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  /* decode-in: role pill on load, eyebrows and live labels on first view */
  if (!REDUCED) {
    document.querySelectorAll('.eyebrow, .live').forEach((el) => {
      if (el.querySelector('.scr') || el.closest('[hidden]')) return;
      const t = el.textContent.trim(); if (!t) return;
      const keep = el.querySelector('i'); // the live dot
      el.innerHTML = (keep ? keep.outerHTML : '') + scr(t);
    });
    document.querySelectorAll('#pill-role .scr').forEach((el, i) => decode(el, 250 + i * 160));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { decode(en.target, 0); io.unobserve(en.target); } }), { threshold: .5 });
      document.querySelectorAll('.eyebrow .scr, .live .scr').forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll('.eyebrow .scr, .live .scr').forEach((el) => decode(el, 0));
    }
  }

  /* live clocks */
  const clocks = [...document.querySelectorAll('.row[data-start]')].map((r) => ({ el: $('.clock', r), t0: Date.parse(r.dataset.start) }));
  const tick = () => { const now = Date.now(); clocks.forEach((c) => { c.el.innerHTML = fmtDur(now - c.t0, !REDUCED); }); };
  tick(); setInterval(tick, REDUCED ? 1000 : 100);

  /* bars grow in after first paint */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.bar i').forEach((i) => { i.style.width = i.dataset.w; });
  }));

  /* Program icons: they flee the cursor (chase them), spring back home,
     bump into each other and the hero's edges, and every bump pops a tiny
     prismatic burst (the lattice's prism colours) on a canvas over the hero.
     On phones/tablets the "Enable phone motion" button turns tilt into
     gravity. Reduced motion: the icons stay put. */
  const els = [...document.querySelectorAll('.badge')];
  const heroIn = $('#badges');
  if (!REDUCED && els.length) {
    const R = 23, FLEE = 150, PRISM = ['#FF3B30', '#FFD60A', '#34C759', '#34E2FF', '#2F6BFF', '#B4009C'];
    let bodies = [], W = 0, H = 0, running = false, lastT = 0, active = false;
    const mouse = { x: -1e4, y: -1e4, t: -1e4 }, grav = { x: 0, y: 0 }, particles = [];
    const burst = document.createElement('canvas'); burst.className = 'burst'; burst.setAttribute('aria-hidden', 'true');
    heroIn.appendChild(burst);
    const bctx = burst.getContext('2d');
    const visible = () => getComputedStyle(els[0]).display !== 'none';

    function layout() {
      active = visible();
      if (!active) { els.forEach((el) => { el.classList.remove('phys'); el.style.transform = ''; }); return; }
      const box = heroIn.getBoundingClientRect();
      W = box.width; H = box.height;
      const dpr = Math.min(2, devicePixelRatio || 1);
      burst.width = Math.round(W * dpr); burst.height = Math.round(H * dpr);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bodies = els.map((el) => {
        el.classList.add('phys'); el.style.transform = 'none';
        const r = el.getBoundingClientRect();
        const hx = r.left - box.left + r.width / 2, hy = r.top - box.top + r.height / 2;
        return { el, hx, hy, x: hx, y: hy, vx: 0, vy: 0, a: 0, va: 0, tilt: parseFloat(el.style.getPropertyValue('--tilt')) || 0 };
      });
      bodies.forEach(place);
    }
    function place(b) { b.el.style.transform = `translate(${(b.x - b.hx).toFixed(1)}px, ${(b.y - b.hy).toFixed(1)}px) rotate(${(b.tilt + b.a).toFixed(1)}deg)`; }
    function pop(x, y, n = 10) {
      if (particles.length > 180) return;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + Math.random() * .5, sp = 1.4 + Math.random() * 1.8;
        particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, col: PRISM[i % PRISM.length], r: 1.5 + Math.random() * 1.3 });
      }
    }
    function step(dt) {
      const k = dt * 60; let moving = false;
      for (const b of bodies) {
        b.vx += (b.hx - b.x) * 0.02 * k; b.vy += (b.hy - b.y) * 0.02 * k;           // spring home
        const dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < FLEE && d > .01) { const f = (1 - d / FLEE) * 3.4 * k; b.vx += dx / d * f; b.vy += dy / d * f; }  // flee the cursor
        b.vx += grav.x * k; b.vy += grav.y * k;                                         // tilt gravity
        const damp = Math.pow(.94, k); b.vx *= damp; b.vy *= damp;
        b.x += b.vx * k; b.y += b.vy * k;
        if (b.x < R) { b.x = R; if (b.vx < -1.2) pop(b.x - R, b.y, 7); b.vx = -b.vx * .6; }
        if (b.x > W - R) { b.x = W - R; if (b.vx > 1.2) pop(b.x + R, b.y, 7); b.vx = -b.vx * .6; }
        if (b.y < R) { b.y = R; if (b.vy < -1.2) pop(b.x, b.y - R, 7); b.vy = -b.vy * .6; }
        if (b.y > H - R) { b.y = H - R; if (b.vy > 1.2) pop(b.x, b.y + R, 7); b.vy = -b.vy * .6; }
        b.va = b.va * .9 + b.vx * .35; b.a += b.va * k;
        if (Math.abs(b.vx) + Math.abs(b.vy) > .04 || Math.abs(b.x - b.hx) + Math.abs(b.y - b.hy) > .6) moving = true;
      }
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = R * 2 + 2;
        if (d < min && d > .001) {
          const nx = dx / d, ny = dy / d, ov = (min - d) / 2;
          a.x -= nx * ov; a.y -= ny * ov; c.x += nx * ov; c.y += ny * ov;
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = -rv * .9;
            a.vx -= nx * imp; a.vy -= ny * imp; c.vx += nx * imp; c.vy += ny * imp;
            if (-rv > 1.1) pop(a.x + nx * R, a.y + ny * R);
          }
        }
      }
      bodies.forEach(place);
      return moving;
    }
    function drawBursts(dt) {
      bctx.clearRect(0, 0, W, H);
      if (!particles.length) return false;
      bctx.globalCompositeOperation = isDark() ? 'lighter' : 'source-over';
      const k = dt * 60;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * k; p.y += p.vy * k; p.vx *= .92; p.vy *= .92; p.life -= .045 * k;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        bctx.globalAlpha = p.life; bctx.fillStyle = p.col;
        bctx.beginPath(); bctx.arc(p.x, p.y, p.r * (.6 + p.life * .6), 0, Math.PI * 2); bctx.fill();
      }
      bctx.globalAlpha = 1;
      return true;
    }
    function loop(t) {
      const dt = Math.min(.033, (t - lastT) / 1000 || .016); lastT = t;
      const m = step(dt), p = drawBursts(dt);
      if (m || p || t - mouse.t < 400) requestAnimationFrame(loop); else running = false;
    }
    function wake() { if (!running && active) { running = true; lastT = performance.now(); requestAnimationFrame(loop); } }

    addEventListener('mousemove', (e) => {
      if (!active) return;
      const box = heroIn.getBoundingClientRect();
      mouse.x = e.clientX - box.left; mouse.y = e.clientY - box.top; mouse.t = performance.now();
      wake();
    }, { passive: true });
    addEventListener('mouseleave', () => { mouse.x = -1e4; mouse.y = -1e4; });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout); else layout();
    layout();

    const btn = $('#motion');
    if ('DeviceOrientationEvent' in window && matchMedia('(pointer: coarse)').matches) {
      btn.hidden = false;
      btn.addEventListener('click', async () => {
        try {
          if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            const r = await DeviceOrientationEvent.requestPermission();
            if (r !== 'granted') { btn.textContent = 'Motion blocked'; return; }
          }
          addEventListener('deviceorientation', (e) => {
            const clamp = (v) => Math.max(-1, Math.min(1, v));
            grav.x = clamp((e.gamma || 0) / 30) * .5; grav.y = clamp(((e.beta || 0) - 45) / 30) * .5;
            mouse.t = performance.now(); wake();
          });
          btn.textContent = 'Motion on'; btn.disabled = true;
        } catch (_) { btn.textContent = 'Motion unavailable'; }
      });
    }
  }
})();
