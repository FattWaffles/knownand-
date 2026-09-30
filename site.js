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
  const socials = (list, extra = '') => ((list && list.length) || extra)
    ? `<span class="socs">${(list || []).map((t) => `<a class="soc" href="${t.url}"${ext(t.url)}>${SOC[t.kind] || SOC.web}<span>${t.label || SOC_LABEL[t.kind] || t.kind}</span></a>`).join('')}${extra}</span>`
    : '';

  /* per-project updates (Josie, 2026-09-30: "subscribe to get updates on the
     project" on current and recently finished projects). FOLLOW in content.js
     sets the label, how many shipped rows count as recent, and the route: a
     mailto link naming the project or, with a list provider, a small form on
     the row that the pill opens. */
  const F = window.FOLLOW || {};
  const BELL = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.3a4 4 0 0 0-8 0c0 4.7-2 6-2 6h12s-2-1.3-2-6"/><path d="M9.2 14a1.3 1.3 0 0 1-2.3 0"/></svg>';
  const follow = (title) => F.label
    ? `<a class="soc follow" href="mailto:${F.mailto}?subject=${encodeURIComponent('Updates on ' + title)}&amp;body=${encodeURIComponent(`Please send me updates on ${title} from Known, and.`)}" title="${F.label} on ${title} by email">${BELL}<span>${F.label}</span></a>`
    : '';
  const followForm = (title, id) => (F.label && F.action)
    ? `<form class="signup follow-form" action="${F.action}" method="post" hidden><label class="sr" for="fl-${id}">Email address for updates on ${title}</label><input id="fl-${id}" type="email" name="${F.field || 'email'}" autocomplete="email" inputmode="email" placeholder="you@example.com" required><input type="hidden" name="project" value="${title}"><button class="btn btn-lite" type="submit">${F.label}</button></form>`
    : '';
  const wantsFollow = (row, i, n = Infinity) => (row.follow != null ? !!row.follow : i < n);
  const recent = (d, i) => wantsFollow(d, i, F.recent || 0);

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
  $('#pill-role').innerHTML = scr(S.role);   /* role only; "Known, and" came out of the pill (Josie, 2026-09-30) */
  $('#h1').textContent = S.headline;
  $('#sub').innerHTML = S.sub;
  const cta = $('#cta'); cta.href = S.cta.url; $('span', cta).textContent = S.cta.label;

  /* program icon tiles: rounded squares in the lattice's style, placed and
     moved by the simulation below (hero coordinates on wide screens, tray
     coordinates on narrow ones) */
  const hero = document.querySelector('.hero');
  hero.insertAdjacentHTML('beforeend', '<div class="tiles" aria-hidden="true">' + S.stack.map((b, i) => {
    const ic = ICONS[b.icon] || { bg: '#151515', fg: '#fff', text: b.label.slice(0, 2) };
    const tilt = ((i * 37) % 24) - 12;
    return `<span class="badge" data-side="${b.side}" title="${b.label}" style="--tilt:${tilt}deg;background:${ic.bg};color:${ic.fg || '#fff'}">${ic.svg || ic.text}</span>`;
  }).join('') + '</div>');
  $('#stack-list').textContent = 'Programs: ' + S.stack.map((b) => b.label).join(', ') + '.';

  /* currently building */
  $('#building').innerHTML = B.map((b, i) => `
    <div class="row" data-start="${b.started}">
      <div class="proj"><div class="num">${i + 1}</div><div>
        <h3>${b.title}<span class="tag building">${b.status || 'Building'}</span>${socials(b.social, wantsFollow(b, i) ? follow(b.title) : '')}</h3>
        <p>${b.text}</p>
        <p class="meta">${b.kind} · Started ${fmtDate(new Date(b.started))}${b.note ? ' · ' + b.note : ''}</p>
        ${wantsFollow(b, i) ? followForm(b.title, 'b' + i) : ''}
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
          ${d.url || (d.social && d.social.length) || recent(d, i) ? `<div class="acc-links">${d.url ? `<a class="acc-link" href="${d.url}">Read the case study <span class="ext" aria-hidden="true">↗</span></a>` : ''}${socials(d.social, recent(d, i) ? follow(d.title) : '')}</div>` : ''}
          ${recent(d, i) ? followForm(d.title, 's' + i) : ''}
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
  /* with a list provider the updates pill opens the row's form instead of mail */
  if (F.action) document.addEventListener('click', (ev) => {
    const a = ev.target.closest('.soc.follow'), row = a && a.closest('.row'), form = row && $('.follow-form', row);
    if (!form) return;
    ev.preventDefault();
    form.hidden = !form.hidden;
    if (!form.hidden) $('input[type=email]', form).focus();
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
     styles.css): no grid (Josie, 2026-09-30: "break the grid", "more reactive
     and have interesting gravity", "just for the mobile version"). The tray
     is a small system: Claude sits at the centre, four tools turn on an inner
     orbit and seven on an outer one, the inner ring faster, each orbit
     breathing a little so nothing lines up twice. A spring holds each tile
     to its moving orbit point, so the whole thing keeps slowly turning while
     the hero is on screen. Reactions, all through the same springs and bumps:
     - press and hold (or drag): the finger is a gravity well; the orbits let
       go, every tile falls toward it and swirls round it (they keep off the
       fingertip, so they ring it); lift and they fly on for a beat, then the
       orbits take them back;
     - tap: the tile under the finger twitches and a wave runs out through the
       others, each pushed as it passes, a signal through a mesh;
     - scroll: inertia (an accelerating page shoves them the other way) plus
       a wind while the page moves, so a flick slides the cluster to one
       wall and the stop lets it drift back into orbit; a small rattle while
       moving.
     Nothing is drawn on bumps (Josie, 2026-09-30: "no rainbow from
     collision"); the red/blue edge split widens with speed (--sp), like the
     lattice's turning squares, so a swirl or a passing wave shows in the
     rims. Phone tilt was tried and dropped earlier (Josie: "let's not do the
     tilt"). Reduced motion: the constellation sits still at its start. */
  const els = [...document.querySelectorAll('.badge')];
  const heroIn = $('#badges');
  if (els.length) {
    const FLEE = 150, HOME = .02, INERTIA = .14, KICK = 3, JITTER = .45,
          WIND = .05, WINDMAX = 1.2, WELL_G = .5, WELL_SWIRL = .22, WAVE = 9, PULSE = 2.2, PULSE_REACH = 360,
          TURN_IN = 22, TURN_OUT = 58;   // seconds per orbit, inner and outer ring
    let R = 24, bodies = [], W = 0, H = 0, cx = 0, cy = 0, T = 0, obs = null, running = false, lastT = 0, active = 'off', lastMode = '', inView = true;
    let scrollDelta = 0, scrollV = 0, lastY = scrollY;
    const mouse = { x: -1e4, y: -1e4 };
    const well = { on: false, x: 0, y: 0, x0: 0, y0: 0, k: 0, dir: 1, t0: 0, moved: 0, id: null };   // the finger, tray mode
    const pulses = [];                                                                              // tap waves in flight
    const tilesBox = hero.querySelector('.tiles');
    /* roam: .tiles is absolute over the hero. tray: .tiles is a relative box (narrow screens). */
    const mode = () => { const p = getComputedStyle(tilesBox).position; return p === 'absolute' ? 'roam' : p === 'relative' ? 'tray' : 'off'; };
    const on = () => active !== 'off';
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));

    function measure() {
      const hb = hero.getBoundingClientRect(); W = hb.width; H = hb.height;
      const parts = ['.ava', '.pills', 'h1', '.sub', '.cta-row', '.nl-line'].map((q) => heroIn.querySelector(q)).filter(Boolean).map((el) => el.getBoundingClientRect());
      obs = { x0: Math.min(...parts.map((r) => r.left)) - hb.left - 10, x1: Math.max(...parts.map((r) => r.right)) - hb.left + 10,
              y0: Math.min(...parts.map((r) => r.top)) - hb.top - 10, y1: Math.max(...parts.map((r) => r.bottom)) - hb.top + 10 };
    }
    /* tray: centre tile, an inner ring of up to four, the rest on an outer
       ring; ellipses, since the tray is wide and low. The tray's height comes
       from the outer ring. */
    function trayMeasure() {
      W = tilesBox.clientWidth; obs = null;
      const bIn = R * 2.3, aIn = R * 2.9, bOut = bIn + R * 2 + 6, aOut = Math.max(bOut, Math.min(150, W / 2 - R - 14));
      tilesBox.style.height = Math.round(2 * (bOut + R) + 36) + 'px';
      H = tilesBox.clientHeight; cx = W / 2; cy = H / 2;
      const n = bodies.length, inner = Math.min(4, Math.max(0, n - 1)), outer = Math.max(0, n - 1 - inner);
      bodies.forEach((b, i) => {
        if (i === 0) { b.ring = 0; b.ax = b.ay = b.ph = b.w = 0; }
        else if (i <= inner) { b.ring = 1; b.ax = aIn; b.ay = bIn; b.ph = .4 + (i - 1) * Math.PI * 2 / inner; b.w = Math.PI * 2 / TURN_IN; }
        else { b.ring = 2; b.ax = aOut; b.ay = bOut; b.ph = -.2 + (i - 1 - inner) * Math.PI * 2 / outer; b.w = Math.PI * 2 / TURN_OUT; }
      });
      orbitHomes();
      bodies.forEach((b) => { if (b.fresh) { b.x = b.hx; b.y = b.hy; b.fresh = false; } });
    }
    /* where each tile's orbit point is right now */
    function orbitHomes() {
      for (const b of bodies) {
        if (b.ring === 0) { b.hx = cx + Math.sin(T * .5) * 4; b.hy = cy + Math.cos(T * .37) * 3; continue; }
        const th = b.ph + T * b.w, wob = 1 + .04 * Math.sin(T * .6 + b.ph * 3);
        b.hx = cx + Math.cos(th) * b.ax * wob; b.hy = cy + Math.sin(th) * b.ay * wob;
      }
    }
    function layout() {
      active = mode();
      if (active !== lastMode) { bodies = []; lastMode = active; }   // the box changed shape: start over
      if (!on()) { els.forEach((el) => { el.style.transform = ''; el.style.removeProperty('--sp'); }); tilesBox.style.height = ''; return; }
      R = els[0].offsetWidth / 2 || R;
      if (active === 'tray') {
        if (!bodies.length) bodies = els.map((el) => ({ el, x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, hx: 0, hy: 0, tilt: 0, ring: 0, ax: 0, ay: 0, ph: 0, w: 0, fresh: true }));
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
      lastY = scrollY; scrollDelta = 0; scrollV = 0;
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
      const REST = tray ? .45 : .95;   // tray walls and bumps are soft, the hero's are lively
      const MAXV = tray ? 5.5 : 4.2;
      /* tray: the orbits turn; the page's scroll speed this frame and its
         change (the tray's acceleration). Inertia: the tiles keep their
         screen position, so an accelerating page pushes them the other way;
         wind: a moving page keeps pushing. The well ramps in fast on a press
         and fades after the lift, so the tiles coast before the orbits pull. */
      let kick = 0, wind = 0, jit = 0, reach = 0;
      if (tray) {
        T += dt; orbitHomes();
        const v = scrollDelta / k; scrollDelta = 0;
        kick = clamp((v - scrollV) * INERTIA, KICK); scrollV = v;
        wind = clamp(v * WIND, WINDMAX);
        jit = Math.min(1, Math.abs(v) / 15) * JITTER;
        well.k += ((well.on ? 1 : 0) - well.k) * Math.min(1, (well.on ? .25 : .08) * k);
        reach = Math.max(W, H);
        for (const p of pulses) p.r += WAVE * k;
      }
      for (const b of bodies) {
        if (tray) {
          const spring = HOME * (1 - .97 * well.k);   // the orbit lets go while the finger holds
          b.vx += (b.hx - b.x) * spring * k; b.vy += (b.hy - b.y) * spring * k;
          if (kick) { b.vy += kick * rnd(.7, 1.3); b.vx += kick * rnd(-.35, .35); }   // each tile a little different
          if (wind) b.vy += wind * k;
          if (jit) { b.vx += rnd(-jit, jit) * k; b.vy += rnd(-jit, jit) * k; }        // the rattle while the page moves
          b.vx += rnd(-.03, .03) * k; b.vy += rnd(-.03, .03) * k;                       // never quite still
          if (well.on) {
            const dx = well.x - b.x, dy = well.y - b.y, d = Math.hypot(dx, dy) || .01, nx = dx / d, ny = dy / d;
            const s = Math.max(0, 1 - d / reach);
            const g = WELL_G * (.5 + .5 * s) * well.k * k;          // pull, a little stronger close in
            b.vx += nx * g; b.vy += ny * g;
            const sw = WELL_SWIRL * s * well.k * well.dir * k;      // and round it
            b.vx += -ny * sw; b.vy += nx * sw;
            const ex = R * 1.3;                                     // keep off the fingertip
            if (d < ex) { const push = (ex - d) * .5; b.x -= nx * push; b.y -= ny * push; const rv = b.vx * nx + b.vy * ny; if (rv > 0) { b.vx -= nx * rv; b.vy -= ny * rv; } }
          }
          for (const p of pulses) {
            if (p.hit.has(b)) continue;
            const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
            if (d > p.r) continue;
            p.hit.add(b);
            if (d < R * 1.5) { b.a += (Math.random() < .5 ? -18 : 18); b.vy -= 1; }   // the tapped tile twitches
            else { const f = .4 + PULSE * Math.max(0, 1 - d / PULSE_REACH); b.vx += dx / d * f; b.vy += dy / d * f; }
          }
        } else {
          const dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < FLEE && d > .01) { const f = (1 - d / FLEE) * 3.2 * k; b.vx += dx / d * f; b.vy += dy / d * f; }
        }
        let sp = Math.hypot(b.vx, b.vy);
        if (sp > MAXV) { b.vx *= MAXV / sp; b.vy *= MAXV / sp; sp = MAXV; }
        else if (tray) { const damp = Math.pow(well.on ? .92 : .9, k); b.vx *= damp; b.vy *= damp; }   // settle onto the orbit; looser round the finger
        else if (sp > .8) { const damp = Math.pow(.975, k); b.vx *= damp; b.vy *= damp; }   // shed the cursor's push, keep the drift
        else if (sp < .35) { b.vx += rnd(-.06, .06) * k; b.vy += rnd(-.06, .06) * k; }      // never quite still
        b.x += b.vx * k; b.y += b.vy * k;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * REST; }
        if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) * REST; }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * REST; }
        if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy) * REST; }
        bounceRect(b);
        if (tray) b.a += (clamp(b.vx * 4, 14) - b.a) * Math.min(1, .2 * k);   // lean into the slide, straight at rest
        else { b.va = b.va * .92 + b.vx * .25; b.a += b.va * k; }
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
      if (tray) {
        bodies.forEach((b) => { b.x = Math.max(R, Math.min(W - R, b.x)); b.y = Math.max(R, Math.min(H - R, b.y)); });   // bumps never push a tile through the tray wall
        for (let i = pulses.length - 1; i >= 0; i--) if (pulses[i].r > PULSE_REACH + 60) pulses.splice(i, 1);   // a wave that has passed everything
      }
      bodies.forEach((b) => place(b, Math.hypot(b.vx, b.vy)));
    }
    function loop(t) {
      if (!on() || !inView || document.hidden) { running = false; return; }
      const dt = Math.min(.033, (t - lastT) / 1000 || .016); lastT = t;
      step(dt);
      requestAnimationFrame(loop);
    }
    function wake() { if (!running && on() && !REDUCED && inView && !document.hidden) { running = true; lastT = performance.now(); requestAnimationFrame(loop); } }

    addEventListener('mousemove', (e) => {
      if (active !== 'roam') return;
      const hb = hero.getBoundingClientRect();
      mouse.x = e.clientX - hb.left; mouse.y = e.clientY - hb.top;
    }, { passive: true });
    addEventListener('mouseleave', () => { mouse.x = -1e4; mouse.y = -1e4; });
    /* tray: a finger (or a pressed mouse) on the tray is the gravity well; a
       quick tap that barely moved is a pulse instead. touch-action: pan-y on
       .tiles (styles.css) keeps vertical scrolling with the browser, which
       then cancels the pointer, so a scroll through the tray is just a scroll. */
    const trayPt = (e) => { const r = tilesBox.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    tilesBox.addEventListener('pointerdown', (e) => {
      if (active !== 'tray' || REDUCED || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const p = trayPt(e);
      Object.assign(well, { on: true, x: p.x, y: p.y, x0: p.x, y0: p.y, t0: performance.now(), moved: 0, dir: Math.random() < .5 ? -1 : 1, id: e.pointerId });
      try { tilesBox.setPointerCapture(e.pointerId); } catch (_) { /* fine without it */ }
      wake();
    });
    tilesBox.addEventListener('pointermove', (e) => {
      if (!well.on || e.pointerId !== well.id) return;
      const p = trayPt(e);
      well.moved = Math.max(well.moved, Math.hypot(p.x - well.x0, p.y - well.y0)); well.x = p.x; well.y = p.y;
    });
    const release = (e) => {
      if (!well.on || e.pointerId !== well.id) return;
      well.on = false;
      if (e.type === 'pointerup' && performance.now() - well.t0 < 220 && well.moved < 8) pulses.push({ x: well.x, y: well.y, r: 0, hit: new Set() });
      wake();
    };
    tilesBox.addEventListener('pointerup', release);
    tilesBox.addEventListener('pointercancel', release);
    /* the page scrolled: hand the tray the distance and make sure the loop is up.
       A loop that was asleep (tray off screen) gets only this event's distance,
       so scrolling that happened while it slept is not one big kick. */
    addEventListener('scroll', () => {
      const y = scrollY, dy = y - lastY; lastY = y;
      if (active !== 'tray') return;
      if (!running) { scrollDelta = dy; scrollV = 0; } else scrollDelta += dy;
      wake();
    }, { passive: true });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); wake(); }, 120); });
    document.addEventListener('visibilitychange', wake);
    if ('IntersectionObserver' in window) new IntersectionObserver((en) => { inView = en[0].isIntersecting; wake(); }).observe(hero);
    const start = () => { layout(); wake(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    start();
  }
})();
