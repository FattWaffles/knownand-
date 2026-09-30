/* Renders content.js into index.html, runs the live clocks, the progress
   bars and the floating-badge parallax. Nothing in here is content. */

/* Old deep links (knownand.com/#/sapphire/2) belonged to the case-study
   viewer, retired 2026-09-30; send them to the matching log entry. Lives
   here, not inline, so the CSP can stay strict. */
const OLD_VIEWER = { sapphire: 'sapphire-studios', instaquote: 'quote-on', profitmind: 'profitmind', edu: 'legacy-courseware-turnaround', selig: 'selig-sealing-ux-audit' };
const oldLink = location.hash.match(/^#\/([a-z]+)/i);
if (oldLink) { const s = OLD_VIEWER[oldLink[1].toLowerCase()]; location.replace(CASES + (s ? '#e-' + s : '')); }
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
    blender:      { bg: '#E87D0D', svg: svg(`<path d="M3.5 7.5h7.5M2.5 12h6M5.5 3.5l5.2 4.6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="14.2" cy="14" r="5.4" fill="#265787" stroke="#fff" stroke-width="2.6"/><circle cx="14.2" cy="14" r="1.6" fill="#fff"/>`) },
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
  $('#nav').innerHTML = S.nav.map((n) => n.icon
    ? `<a class="ico" href="${n.url}"${ext(n.url)} aria-label="${n.label}" title="${n.label}">${SOC[n.icon] || SOC.web}</a>`
    : `<a href="${n.url}">${n.label}</a>`).join('<span>·</span>');
  /* brand mark: "Known, and <word>"; the word cycles with the decode churn
     (Josie, 2026-09-30: the rotation from the viewer's old hero). Reduced
     motion shows the first word only. */
  const brand = $('#brand'), WORDS = S.brandWords || [];
  if (brand && WORDS.length) {
    brand.setAttribute('aria-label', 'Known, and: home');
    brand.innerHTML = `Known, and <span class="w" aria-hidden="true" data-text="${WORDS[0]}">${WORDS[0]}</span>`;
    if (!REDUCED && WORDS.length > 1) {
      const w = $('.w', brand); let wi = 0;
      setInterval(() => { wi = (wi + 1) % WORDS.length; w.dataset.text = WORDS[wi]; decode(w, 0); }, 3400);
    }
  }
  $('#pill-name').textContent = S.name;
  $('#pill-role').innerHTML = `<b>${S.studio}</b><span class="dot">·</span>${scr(S.role)}`;
  $('#h1').textContent = S.headline;
  $('#sub').innerHTML = S.sub;
  const cta = $('#cta'); cta.href = S.cta.url; $('span', cta).textContent = S.cta.label;

  /* program icon tiles: rounded squares in the lattice's style, placed and
     moved by the simulation below (hero coordinates on wide screens, tray
     coordinates on narrow ones). The Tilt chip under the tray is the narrow
     screens' motion button; CSS hides it on wide screens. */
  const hero = document.querySelector('.hero');
  hero.insertAdjacentHTML('beforeend', '<div class="tiles" aria-hidden="true">' + S.stack.map((b, i) => {
    const ic = ICONS[b.icon] || { bg: '#151515', fg: '#fff', text: b.label.slice(0, 2) };
    const tilt = ((i * 37) % 24) - 12;
    return `<span class="badge" data-side="${b.side}" title="${b.label}" style="--tilt:${tilt}deg;background:${ic.bg};color:${ic.fg || '#fff'}">${ic.svg || ic.text}</span>`;
  }).join('') + '</div><button class="tilt-btn" id="tilt" type="button" hidden aria-pressed="false">Tilt</button>');
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

  /* shipped: an accordion (Josie, 2026-09-30). The newest project starts
     open; opening another closes it. The header row is one button (title,
     kind, result, arrow); the abstract, the case-study link and any social
     tags sit in the raised panel underneath. The arrow is a soft-shadow
     chevron on the surface colour; it turns and its light flips when open. */
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 9l6.5 6.5L18.5 9"/></svg>';
  const ship = $('#shipped');
  ship.innerHTML = D.map((d, i) => `
    <div class="row acc${i === 0 ? ' open' : ''}">
      <button class="acc-head" type="button" id="acc-h-${i}" aria-expanded="${i === 0}" aria-controls="acc-p-${i}">
        <div class="proj"><div class="num">${i + 1}</div><div><h3>${d.title}</h3></div></div>
        <div class="kind" data-label="Kind"><i></i>${d.kind}</div>
        <div class="stat" data-label="Result"><b>${d.stat}</b><span>${d.label}</span></div>
        <span class="arrow">${ARROW}</span>
      </button>
      <div class="acc-body" id="acc-p-${i}" role="region" aria-labelledby="acc-h-${i}"${i ? ' inert' : ''}>
        <div class="acc-panel"><div class="acc-box">
          <p>${d.sub}</p>
          ${d.url || (d.social && d.social.length) ? `<div class="acc-links">${d.url ? `<a class="acc-link" href="${d.url}">Read the case study <span class="ext" aria-hidden="true">↗</span></a>` : ''}${socials(d.social)}</div>` : ''}
        </div></div>
      </div>
    </div>`).join('');
  const setOpen = (row, on) => {
    row.classList.toggle('open', on);
    $('.acc-head', row).setAttribute('aria-expanded', String(on));
    const body = $('.acc-body', row);
    if (on) body.removeAttribute('inert'); else body.setAttribute('inert', '');
  };
  ship.addEventListener('click', (ev) => {
    const head = ev.target.closest('.acc-head');
    if (!head || !ship.contains(head)) return;
    const row = head.parentElement, wasOpen = row.classList.contains('open');
    ship.querySelectorAll('.row.acc.open').forEach((r) => setOpen(r, false));
    if (!wasOpen) setOpen(row, true);
  });

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
  const paintTheme = () => { tbtn.setAttribute('aria-pressed', String(isDark())); $('meta[name=theme-color]').setAttribute('content', isDark() ? '#050505' : '#FFFFFF'); };
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

  /* Program icon tiles. Wide screens: they roam the hero, drift, bounce off
     the hero's edges, each other and the text block, and flee the cursor.
     Narrow screens (the .tiles box is a relative tray under the sign-up, see
     styles.css): the tiles sit in a grid of home slots; tap Tilt and the
     phone's tilt from that pose becomes gravity, so they slide and pile up
     inside the tray, and levelling the phone sends them back to their slots.
     The red/blue edge split widens with speed (--sp), like the lattice's
     turning squares. Nothing is drawn on bumps (Josie, 2026-09-30: "no
     rainbow from collision"). Reduced motion: the tiles sit still at their
     starting places and the tilt buttons stay hidden. */
  const els = [...document.querySelectorAll('.badge')];
  const heroIn = $('#badges');
  if (els.length) {
    const FLEE = 150, MAXV = 4.2, GAP = 10, COLS = 6, SLACK = 60, HOME = .02, GMAX = .35;
    let R = 24, bodies = [], W = 0, H = 0, obs = null, running = false, lastT = 0, active = 'off', lastMode = '', inView = true, tiltOn = false;
    const mouse = { x: -1e4, y: -1e4 }, grav = { x: 0, y: 0 }, gTarget = { x: 0, y: 0 };
    const tilesBox = hero.querySelector('.tiles');
    /* roam: .tiles is absolute over the hero. tray: .tiles is a relative box (narrow screens). */
    const mode = () => { const p = getComputedStyle(tilesBox).position; return p === 'absolute' ? 'roam' : p === 'relative' ? 'tray' : 'off'; };
    const on = () => active !== 'off';
    const rnd = (a, b) => a + Math.random() * (b - a);

    function measure() {
      const hb = hero.getBoundingClientRect(); W = hb.width; H = hb.height;
      const parts = ['.ava', '.pills', 'h1', '.sub', '.cta-row', '.nl-line'].map((q) => heroIn.querySelector(q)).filter(Boolean).map((el) => el.getBoundingClientRect());
      obs = { x0: Math.min(...parts.map((r) => r.left)) - hb.left - 10, x1: Math.max(...parts.map((r) => r.right)) - hb.left + 10,
              y0: Math.min(...parts.map((r) => r.top)) - hb.top - 10, y1: Math.max(...parts.map((r) => r.bottom)) - hb.top + 10 };
    }
    /* tray: a grid of up to COLS columns, centred, with SLACK px of room to slide in */
    function trayMeasure() {
      W = tilesBox.clientWidth; obs = null;
      const n = els.length, size = R * 2;
      const cols = Math.max(1, Math.min(n, COLS, Math.floor((W - 20 + GAP) / (size + GAP))));
      const rows = Math.ceil(n / cols);
      const gw = cols * size + (cols - 1) * GAP, gh = rows * size + (rows - 1) * GAP;
      tilesBox.style.height = (gh + SLACK) + 'px';
      H = tilesBox.clientHeight;
      bodies.forEach((b, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        b.hx = (W - gw) / 2 + R + c * (size + GAP);
        b.hy = (H - gh) / 2 + R + r * (size + GAP);
        if (b.fresh) { b.x = b.hx; b.y = b.hy; b.fresh = false; }
      });
    }
    function layout() {
      active = mode();
      if (active !== lastMode) { bodies = []; lastMode = active; }   // the box changed shape: start over
      if (!on()) { els.forEach((el) => { el.style.transform = ''; el.style.removeProperty('--sp'); }); tilesBox.style.height = ''; return; }
      R = els[0].offsetWidth / 2 || R;
      if (active === 'tray') {
        if (!bodies.length) bodies = els.map((el) => ({ el, x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, hx: 0, hy: 0, tilt: 0, fresh: true }));
        trayMeasure();
      } else {
        tilesBox.style.height = '';
        measure();
        if (!bodies.length) {
          const L = els.filter((e) => e.dataset.side === 'l'), Rr = els.filter((e) => e.dataset.side !== 'l');
          const col = (list, x0, x1) => list.map((el, k) => {
            const x = Math.max(R + 4, Math.min(W - R - 4, (x0 + x1) / 2 + (k % 2 ? 14 : -14)));
            const y = H * (0.3 + 0.62 * (list.length > 1 ? k / (list.length - 1) : .5));
            const ang = rnd(0, Math.PI * 2), sp = REDUCED ? 0 : rnd(.45, .75);
            return { el, x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, a: 0, va: 0, hx: 0, hy: 0, tilt: parseFloat(el.style.getPropertyValue('--tilt')) || 0 };
          });
          bodies = [...col(L, 0, obs.x0), ...col(Rr, obs.x1, W)];
        }
      }
      bodies.forEach((b) => { b.x = Math.max(R, Math.min(W - R, b.x)); b.y = Math.max(R, Math.min(H - R, b.y)); place(b, 0); });
    }
    function place(b, sp) {
      b.el.style.transform = `translate(${(b.x - R).toFixed(1)}px, ${(b.y - R).toFixed(1)}px) rotate(${(b.tilt + b.a).toFixed(1)}deg)`;
      b.el.style.setProperty('--sp', Math.min(1, sp / 2.4).toFixed(2));
    }
    function bounceRect(b) {   // keep the tile out of the text block
      if (!obs) return;
      const x0 = obs.x0 - R, x1 = obs.x1 + R, y0 = obs.y0 - R, y1 = obs.y1 + R;
      if (b.x <= x0 || b.x >= x1 || b.y <= y0 || b.y >= y1) return;
      const dl = b.x - x0, dr = x1 - b.x, dt = b.y - y0, db = y1 - b.y, m = Math.min(dl, dr, dt, db);
      if (m === dl) { b.x = x0; b.vx = -Math.abs(b.vx) * .95; }
      else if (m === dr) { b.x = x1; b.vx = Math.abs(b.vx) * .95; }
      else if (m === dt) { b.y = y0; b.vy = -Math.abs(b.vy) * .95; }
      else { b.y = y1; b.vy = Math.abs(b.vy) * .95; }
    }
    function step(dt) {
      const k = dt * 60, tray = active === 'tray';
      grav.x += (gTarget.x - grav.x) * Math.min(1, .15 * k); grav.y += (gTarget.y - grav.y) * Math.min(1, .15 * k);   // smooth the tilt
      const g = Math.hypot(grav.x, grav.y);
      /* tray: the pull back to the home slots fades out as the phone tilts, so a
         level phone re-forms the grid and a tilted one lets the tiles slide */
      const home = tray ? HOME * Math.max(0, 1 - Math.max(0, g - .03) / .09) : 0;
      const REST = tray ? .45 : .95;   // tray walls and bumps are soft, the hero's are lively
      for (const b of bodies) {
        if (tray) { b.vx += (b.hx - b.x) * home * k; b.vy += (b.hy - b.y) * home * k; }
        else {
          const dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < FLEE && d > .01) { const f = (1 - d / FLEE) * 3.2 * k; b.vx += dx / d * f; b.vy += dy / d * f; }
        }
        b.vx += grav.x * k; b.vy += grav.y * k;
        let sp = Math.hypot(b.vx, b.vy);
        if (sp > MAXV) { b.vx *= MAXV / sp; b.vy *= MAXV / sp; sp = MAXV; }
        else if (tray) { const damp = Math.pow(.9, k); b.vx *= damp; b.vy *= damp; }             // settle, no drift
        else if (sp > .8) { const damp = Math.pow(.975, k); b.vx *= damp; b.vy *= damp; }   // shed the cursor's push, keep the drift
        else if (sp < .35) { b.vx += rnd(-.06, .06) * k; b.vy += rnd(-.06, .06) * k; }      // never quite still
        b.x += b.vx * k; b.y += b.vy * k;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * REST; }
        if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) * REST; }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * REST; }
        if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy) * REST; }
        bounceRect(b);
        b.va = b.va * (tray ? .85 : .92) + b.vx * .25;
        if (tray) b.va -= b.a * home * 2 * k;   // straighten up when back home
        b.a += b.va * k;
      }
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = R * 2 + 2;
        if (d < min && d > .001) {
          const nx = dx / d, ny = dy / d, ov = (min - d) / 2;
          a.x -= nx * ov; a.y -= ny * ov; c.x += nx * ov; c.y += ny * ov;
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = -rv * REST;
            a.vx -= nx * imp; a.vy -= ny * imp; c.vx += nx * imp; c.vy += ny * imp;
          }
        }
      }
      bodies.forEach((b) => place(b, Math.hypot(b.vx, b.vy)));
    }
    /* tray, tilt off: everything back in its slot and still, so the loop can stop */
    const settled = () => bodies.every((b) => Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.va) < .02 && Math.hypot(b.hx - b.x, b.hy - b.y) < .5 && Math.abs(b.a) < .5);
    function loop(t) {
      if (!on() || !inView || document.hidden) { running = false; return; }
      const dt = Math.min(.033, (t - lastT) / 1000 || .016); lastT = t;
      step(dt);
      if (active === 'tray' && !tiltOn && settled()) {
        bodies.forEach((b) => { b.x = b.hx; b.y = b.hy; b.vx = b.vy = b.va = b.a = 0; place(b, 0); });
        running = false; return;
      }
      requestAnimationFrame(loop);
    }
    function wake() { if (!running && on() && !REDUCED && inView && !document.hidden) { running = true; lastT = performance.now(); requestAnimationFrame(loop); } }

    addEventListener('mousemove', (e) => {
      if (active !== 'roam') return;
      const hb = hero.getBoundingClientRect();
      mouse.x = e.clientX - hb.left; mouse.y = e.clientY - hb.top;
    }, { passive: true });
    addEventListener('mouseleave', () => { mouse.x = -1e4; mouse.y = -1e4; });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); wake(); }, 120); });
    document.addEventListener('visibilitychange', wake);
    if ('IntersectionObserver' in window) new IntersectionObserver((en) => { inView = en[0].isIntersecting; wake(); }).observe(hero);
    const start = () => { layout(); wake(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    start();

    /* Phone tilt as gravity. #motion is the wide-screen button (a tablet with a
       coarse pointer, roaming tiles); #tilt sits under the tray on narrow
       screens. iOS asks for permission on the first tap. The pose the phone is
       held in at that moment counts as level; a second tap turns tilt off and
       the tiles go home. */
    const tiltBtns = ['#motion', '#tilt'].map((q) => $(q)).filter(Boolean);
    let neutral = null, listening = false;
    function onTilt(e) {
      if (!tiltOn) return;
      const beta = e.beta || 0, gamma = e.gamma || 0;
      if (!neutral) neutral = { beta, gamma };
      const dead = (v) => (Math.abs(v) < 2 ? 0 : v - Math.sign(v) * 2);   // 2deg of hand shake ignored
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      gTarget.x = clamp(dead(gamma - neutral.gamma) / 25) * GMAX;
      gTarget.y = clamp(dead(beta - neutral.beta) / 25) * GMAX;
      wake();
    }
    function setTilt(next) {
      tiltOn = next; neutral = null;
      if (!tiltOn) { gTarget.x = gTarget.y = 0; }
      tiltBtns.forEach((b) => { b.textContent = tiltOn ? 'Tilt on' : 'Tilt'; b.setAttribute('aria-pressed', String(tiltOn)); });
      wake();
    }
    const fail = (msg) => tiltBtns.forEach((b) => { b.textContent = msg; b.disabled = true; });
    if (!REDUCED && 'DeviceOrientationEvent' in window && matchMedia('(pointer: coarse)').matches) {
      tiltBtns.forEach((btn) => {
        btn.hidden = false;
        btn.addEventListener('click', async () => {
          if (tiltOn) { setTilt(false); return; }
          try {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
              const r = await DeviceOrientationEvent.requestPermission();
              if (r !== 'granted') { fail('Tilt blocked'); return; }
            }
            if (!listening) { addEventListener('deviceorientation', onTilt); listening = true; }
            setTilt(true);
          } catch (_) { fail('Tilt unavailable'); }
        });
      });
    }
  }
})();
