(function () {
  const P = window.PROJECTS, NOW = window.NOW, SC = window.PM_SCREENS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isMobile = () => matchMedia('(max-width: 820px)').matches;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NOTE = { sample: 'Sample figures. The numbers are illustrative, not client data.', real: 'Real figures.' };

  /* ---------- Dashboard ---------- */
  const GLYPHS = '%&$#*@!+';
  const noise = (t) => t.replace(/\S/g, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
  function scramble(el, text, ms = 650) {
    if (calm) { el.textContent = text; return; }
    const t0 = performance.now();
    cancelAnimationFrame(el._raf);
    (function tick(now) {
      const k = Math.min(1, (now - t0) / ms), n = Math.floor(text.length * k);
      el.textContent = text.slice(0, n) + noise(text.slice(n));
      if (k < 1) el._raf = requestAnimationFrame(tick);
    })(t0);
  }

  /* The hero word lives in hero.js (H03C bitmap composite). */

  $$('.cipher').forEach((el) => {
    const text = el.dataset.text;
    el.setAttribute('aria-label', text);
    el.textContent = noise(text);
    const row = el.closest('.row');
    if (matchMedia('(hover: none)').matches) setTimeout(() => scramble(el, text, 900), 1200);
    else {
      row.addEventListener('mouseenter', () => scramble(el, text, 400));
      row.addEventListener('mouseleave', () => { cancelAnimationFrame(el._raf); el.textContent = noise(text); });
    }
  });

  const clock = $('#clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB'); };
  tick(); setInterval(tick, 1000);

  function shotsHTML(p) {
    const s = p.shots;
    if (s.kind === 'html') return `<div class="shot-html"><div class="scaled">${SC[s.html]()}</div></div>`;
    return s.src.map((src) => `<img src="${src}" alt="" loading="lazy">`).join('');
  }
  $('#work-list').innerHTML = P.map((p) => `
    <article class="proj" id="p-${p.id}">
      <button class="proj-row" data-open="${p.id}">
        <span class="proj-no">${p.no}</span>
        <span><span class="proj-title">${esc(p.title)}</span><span class="proj-open">Open file ↗</span><br><span class="proj-hook">${esc(p.hook)}</span><br><span class="proj-line">${esc(p.line)}</span></span>
        <span class="proj-side">${p.tags.map(esc).join(' · ')}${p.year ? '<br>' + esc(p.year) : ''}</span>
      </button>
      <div class="panel ${p.shots.kind}" role="button" tabindex="0" data-open="${p.id}" aria-label="Open the ${esc(p.title)} file">${shotsHTML(p)}<span class="panel-stat"><b>${esc(p.overview.results[0].v)}</b><small>${esc(p.overview.results[0].l)}${p.dataNote === 'sample' ? ' <i>sample</i>' : ''}</small></span><span class="panel-cta">Open file ↗</span></div>
      <div class="quick">
        <div class="quick-ba">
          <div><small>Before</small><p>${esc(p.quick.before)}</p></div>
          <div class="after"><small>After</small><p>${esc(p.quick.after)}</p></div>
        </div>
        <div class="quick-stats">${p.overview.results.slice(0, 3).map((r) => `<div><b>${esc(r.v)}</b><small>${esc(r.l)}</small></div>`).join('')}</div>
        <div class="quick-foot"><span class="badge ${p.dataNote}">${p.dataNote === 'real' ? 'Real figures' : 'Sample figures'}</span><button class="btn" data-open="${p.id}">Open the full file</button></div>
      </div>
    </article>`).join('');

  function fitShots() {
    $$('.shot-html').forEach((el) => {
      const k = el.clientWidth / 1440;
      el.firstElementChild.style.transform = `scale(${k})`;
      el.style.height = 1024 * k + 'px';
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (t) openFile(t.dataset.open, 0, true);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.panel')) { e.preventDefault(); openFile(e.target.dataset.open, 0, true); }
  });

  function setView(v) {
    document.body.classList.toggle('view-quick', v === 'quick');
    $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
    fitShots();
  }
  $$('.seg button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  setView(new URLSearchParams(location.search).get('view') === 'quick' ? 'quick' : 'full');

  // More work + brands
  $('#more-list').innerHTML = (window.MORE || []).map((m) => `
    <div class="more-row">
      <span class="proj-no">${m.no}</span>
      <span><span class="more-title">${esc(m.title)}</span><span class="more-line">${esc(m.line)}</span></span>
      <span class="more-co">${esc(m.company)}</span>
      <span class="more-role">${esc(m.role)}</span>
      <span class="more-year">${esc(m.year)}</span>
    </div>`).join('');
  // Online games + side quests
  $('#side-list').innerHTML = (window.SIDE || []).map((s) => `
    <article class="side-card">
      <div class="side-art${s.icon ? ' is-icon' : ''}"><img src="${s.img}" alt="${esc(s.alt)}" loading="lazy"></div>
      <div class="side-body">
        <div class="side-meta"><span class="now-tag t-${s.tag}">${esc(s.kind)}</span><span class="side-year">${esc(s.year)}</span><span class="now-status${s.live ? '' : ' exploring'}">${esc(s.status)}</span></div>
        <h3>${esc(s.title)}</h3>
        <p class="side-line">${esc(s.line)}</p>
        <ul class="side-points">${s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <div class="side-foot"><span class="chips">${s.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</span>${s.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>
        ${s.credit ? `<p class="side-credit">${esc(s.credit)}</p>` : ''}
      </div>
    </article>`).join('');
  $('#brand-list').innerHTML = (window.BRANDS || []).map((b) => `<li><span>${esc(b.name)}</span><small>${esc(b.note)}</small></li>`).join('');

  // Now log
  let nowTag = 'all';
  function renderNow() {
    const tags = ['all', ...new Set(NOW.map((n) => n.tag))];
    $('#now-chips').innerHTML = tags.map((t) => `<button class="chip${t === nowTag ? ' on' : ''}" data-tag="${t}">${t}</button>`).join('');
    $('#now-list').innerHTML = NOW.filter((n) => nowTag === 'all' || n.tag === nowTag).map((n) => `
      <div class="now-item">
        <span class="now-date">${esc(n.date)}</span>
        <div><h3>${esc(n.title)}</h3><span class="now-tag t-${n.tag}">${n.tag}</span><p>${esc(n.text)}${n.project ? ` <a href="#/${n.project}/0" style="color:var(--blue)">See the file ↗</a>` : ''}</p></div>
        <span class="now-status ${n.status === 'Exploring' ? 'exploring' : ''}">${esc(n.status)}</span>
      </div>`).join('');
  }
  $('#now-chips').addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { nowTag = c.dataset.tag; renderNow(); } });
  renderNow();

  /* ---------- Viewer ---------- */
  const fv = $('#viewer'), canvas = $('.fv-canvas'), world = $('.fv-world');
  const S = { p: null, pages: [], i: 0, x: 0, y: 0, z: 1, sel: null, bounds: { w: 1, h: 1 }, board: false };

  function overviewBoard(p) {
    const o = p.overview;
    return {
      title: p.title, hook: p.hook, line: p.line, stamp: p.confidential || NOTE[p.dataNote], real: p.dataNote === 'real',
      sections: [
        { title: 'The problem', color: 'verm', span: 7, big: o.problem },
        { title: 'My role', color: 'blue', span: 5, big: o.role },
        { title: 'How it went', color: 'gray', span: 12, flow: o.process },
        { title: 'Key decisions', color: 'mag', span: 12, notes: o.decisions },
        { title: 'Results', color: 'ink', span: 12, stats: o.results },
        ...(p.context ? [{ title: 'Out in the world', color: 'blue', span: 12, links: p.context }] : []),
        { title: 'What is next', color: 'verm', span: 6, big: o.next },
        { title: 'About this file', color: 'gray', span: 6, big: 'The pages on the left hold the real screens. Click a frame to read the comment on it.' },
      ],
    };
  }
  function boardHTML(b) {
    return `<div class="board">
      <div class="b-title"><div><h2>${esc(b.title)}</h2>${b.hook ? `<p class="b-hook">${esc(b.hook)}</p>` : ''}${b.line ? `<p>${esc(b.line)}</p>` : ''}</div>${b.stamp ? `<div class="b-stamp${b.real ? ' real' : ''}">${esc(b.stamp)}</div>` : ''}</div>
      ${b.sections.map((s) => `<section class="b-sec ${s.color} span${s.span || 6}"><h3>${esc(s.title)}</h3>
        ${s.big ? `<p class="b-big">${esc(s.big)}</p>` : ''}
        ${s.flow ? `<div class="flow">${s.flow.map((f) => `<span>${esc(f)}</span>`).join('<b>→</b>')}</div>` : ''}
        ${s.notes ? `<div class="stickies">${s.notes.map((n) => `<div class="sticky">${esc(n)}</div>`).join('')}</div>` : ''}
        ${s.links ? `<div class="linkcards">${s.links.map((c) => `<a class="linkcard" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.fact)}<small>${esc(c.source)} ↗</small></a>`).join('')}</div>` : ''}
        ${s.stats ? `<div class="stats">${s.stats.map((r) => `<div class="stat"><b>${esc(r.v)}</b><span>${esc(r.l)}</span></div>`).join('')}</div>` : ''}
      </section>`).join('')}
    </div>`;
  }

  function layout(frames) {
    const big = frames.some((f) => f.w > 1000), perRow = big ? 3 : 5, gap = big ? 180 : 120, rowGap = 260;
    let x = 0, y = 0, rowH = 0, n = 0, W = 0;
    const pos = frames.map((f) => {
      if (n === perRow) { x = 0; y += rowH + rowGap; rowH = 0; n = 0; }
      const at = { x, y }; x += f.w + gap; rowH = Math.max(rowH, f.h); n++; W = Math.max(W, x - gap);
      return at;
    });
    return { pos, w: W, h: y + rowH };
  }

  function renderWorld() {
    const pg = S.pages[S.i];
    S.sel = null; S.board = !!pg.board;
    canvas.classList.toggle('is-board', S.board);
    canvas.scrollTop = 0;
    if (S.board) {
      world.innerHTML = boardHTML(pg.board);
      const b = world.firstElementChild;
      S.bounds = { w: b.offsetWidth, h: b.offsetHeight };
    } else {
      const L = layout(pg.frames);
      S.bounds = { w: L.w, h: L.h };
      world.innerHTML = pg.frames.map((f, i) => `
        <div class="fr${f.w < 700 ? ' narrow' : ''}" data-i="${i}" style="left:${L.pos[i].x}px;top:${L.pos[i].y}px;width:${f.w}px;height:${f.h}px">
          <div class="fr-label">${esc(f.name)}</div>
          <div class="fr-body">${f.html ? `<div class="fr-html" data-w="${f.w}" data-h="${f.h}"><div class="scaled">${SC[f.html]()}</div></div>` : `<img src="${f.src}" alt="${esc(f.name)}" draggable="false">`}</div>
          ${f.note ? `<button class="pin" aria-label="Comment on ${esc(f.name)}"><span>${i + 1}</span></button><div class="bubble"><b>Josie</b>${esc(f.note)}</div><p class="fr-cap">${esc(f.note)}</p>` : ''}
        </div>`).join('');
    }
    if (isMobile()) $$('.fr-html', world).forEach((el) => {
      const k = el.clientWidth / +el.dataset.w;
      el.firstElementChild.style.cssText = `width:${el.dataset.w}px;transform:scale(${k})`;
      el.style.height = +el.dataset.h * k + 'px';
    });
  }

  function renderChrome() {
    const pg = S.pages[S.i];
    $$('.fv-name').forEach((n) => (n.textContent = S.p.title));
    $('.fv-pages').innerHTML = S.pages.map((g, i) => `<li class="${i === S.i ? 'on' : ''}"><button data-page="${i}"><span class="ic">${g.board ? '◆' : ''}</span>${String(i).padStart(2, '0')}  ${esc(g.name)}</button></li>`).join('');
    $('.fv-pagesel').innerHTML = S.pages.map((g, i) => `<option value="${i}"${i === S.i ? ' selected' : ''}>${String(i).padStart(2, '0')} ${esc(g.name)}</option>`).join('');
    $('.fv-pagename').textContent = `${String(S.i).padStart(2, '0')} ${pg.name}`;
    const layers = pg.board ? pg.board.sections.map((s) => s.title) : pg.frames.map((f) => f.name);
    $('.fv-layers').innerHTML = layers.map((n, i) => `<li data-l="${i}"><button data-layer="${i}"><span class="ic">${pg.board ? '▢' : '#'}</span>${esc(n)}</button></li>`).join('');
    inspect();
  }

  function inspect() {
    const pg = S.pages[S.i], f = S.sel != null && !pg.board ? pg.frames[S.sel] : null;
    const facts = Object.entries(S.p.facts).map(([k, v]) => `<div><small>${esc(k)}</small>${esc(v)}</div>`).join('');
    $('.fv-inspect').innerHTML = (f ? `
      <div class="ins-sec"><h4>Frame</h4><p style="margin-bottom:10px">${esc(f.name)}</p>
        <div class="ins-grid"><div class="ins-field"><i>W</i>${f.w}</div><div class="ins-field"><i>H</i>${f.h}</div></div></div>
      ${f.note ? `<div class="ins-sec"><h4>Comment</h4><p>${esc(f.note)}</p></div>` : ''}` : `
      <div class="ins-sec"><h4>Page</h4><p><b>${esc(pg.name)}</b><br>${esc(pg.summary || '')}</p></div>`) + `
      <div class="ins-sec"><h4>File</h4><div class="ins-facts">${facts}</div></div>
      ${S.p.context ? `<div class="ins-sec ins-links"><h4>Public sources</h4>${[...new Map(S.p.context.map((c) => [c.url, c])).values()].map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.source)} ↗</a>`).join('')}</div>` : ''}
      <div class="ins-sec"><div class="ins-note ${S.p.dataNote}">${esc(S.p.confidential || NOTE[S.p.dataNote])}</div></div>
      <div class="ins-sec ins-keys"><h4 style="color:var(--tx)">Getting around</h4>Scroll to pan<br><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + scroll to zoom<br>Double-click a frame to zoom in<br><kbd>←</kbd> <kbd>→</kbd> change page · <kbd>Shift</kbd>+<kbd>1</kbd> fit<br><kbd>Esc</kbd> back to all work</div>`;
    $$('.fr', world).forEach((el) => el.classList.toggle('sel', +el.dataset.i === S.sel));
    $$('.fv-layers li').forEach((el) => el.classList.toggle('on', !pg.board && +el.dataset.l === S.sel));
  }

  const clampZ = (z) => Math.min(4, Math.max(0.04, z));
  function apply() {
    if (isMobile()) return;
    world.style.transform = `translate(${S.x}px,${S.y}px) scale(${S.z})`;
    world.style.setProperty('--iz', 1 / S.z);
    $('.fv-zoom').textContent = Math.round(S.z * 100) + '%';
    if (S.board) { canvas.style.backgroundSize = `${28 * S.z}px ${28 * S.z}px`; canvas.style.backgroundPosition = `${S.x}px ${S.y}px`; }
  }
  function zoomToRect(r, pad = 90, maxZ = 1) {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    pad = Math.min(pad, cw * 0.07);
    S.z = clampZ(Math.min((cw - pad * 2) / r.w, (ch - pad * 2 - 40) / r.h, maxZ));
    S.x = (cw - r.w * S.z) / 2 - r.x * S.z;
    S.y = (ch - 40 - r.h * S.z) / 2 - r.y * S.z;
    apply();
  }
  function fit() {
    if (S.board) { // boards read like a page: fit the width, start at the top
      const cw = canvas.clientWidth; S.z = clampZ(Math.min((cw - 80) / S.bounds.w, 1));
      S.x = (cw - S.bounds.w * S.z) / 2; S.y = 40; apply();
    } else zoomToRect({ x: 0, y: 0, w: S.bounds.w, h: S.bounds.h });
  }
  function zoomAt(cx, cy, f) {
    const r = canvas.getBoundingClientRect(), px = cx - r.left, py = cy - r.top, nz = clampZ(S.z * f);
    S.x = px - (px - S.x) * (nz / S.z); S.y = py - (py - S.y) * (nz / S.z); S.z = nz; apply();
  }
  function frameRect(i) { const el = $(`.fr[data-i="${i}"]`, world); return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; }

  function goPage(i, keepHash) {
    S.i = Math.min(S.pages.length - 1, Math.max(0, i));
    renderWorld(); renderChrome(); fit();
    if (!keepHash) history.replaceState(history.state, '', `#/${S.p.id}/${S.i}`);
  }
  function show(id, i) {
    const p = P.find((x) => x.id === id); if (!p) return false;
    S.p = p; S.pages = [{ name: 'Overview', board: overviewBoard(p), summary: 'The short version: problem, process, decisions and results.' },
      ...p.pages.map((g) => (g.board ? { ...g, board: { title: g.name, line: g.summary, sections: g.board.sections } } : g))];
    fv.hidden = false; document.body.classList.add('locked');
    goPage(i || 0, true); canvas.focus({ preventScroll: true });
    return true;
  }
  function hide() { fv.hidden = true; document.body.classList.remove('locked'); }
  function openFile(id, i, push) { if (show(id, i) && push) history.pushState({ fv: 1 }, '', `#/${id}/${i || 0}`); }
  function closeFile() { hide(); if (history.state && history.state.fv) history.back(); else history.replaceState(null, '', location.pathname + location.search); }
  function route() { const m = location.hash.match(/^#\/([\w-]+)(?:\/(\d+))?/); if (!(m && show(m[1], +m[2] || 0))) hide(); }
  addEventListener('popstate', route);
  addEventListener('hashchange', route);

  // Chrome clicks
  fv.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.matches('.fv-back')) return closeFile();
    if (b.dataset.page) return goPage(+b.dataset.page);
    if (b.dataset.layer) {
      const i = +b.dataset.layer;
      if (S.board) { const el = $$('.b-sec', world)[i]; return zoomToRect({ x: el.offsetLeft, y: el.offsetTop - 50, w: el.offsetWidth, h: el.offsetHeight + 50 }, 60); }
      S.sel = i; inspect(); return zoomToRect(frameRect(i), 110);
    }
    if (b.dataset.tool === 'prev') return goPage(S.i - 1);
    if (b.dataset.tool === 'next') return goPage(S.i + 1);
    if (b.dataset.tool === 'comment') { canvas.classList.toggle('no-comments'); return b.classList.toggle('on', !canvas.classList.contains('no-comments')); }
    if (b.dataset.z === 'in') return zoomAt(innerWidth / 2, innerHeight / 2, 1.25);
    if (b.dataset.z === 'out') return zoomAt(innerWidth / 2, innerHeight / 2, 0.8);
    if (b.dataset.z === 'fit') return fit();
    if (b.matches('.fv-share')) {
      const done = (t) => { const el = document.createElement('div'); el.className = 'fv-toast'; el.textContent = t; canvas.appendChild(el); setTimeout(() => el.remove(), 1600); };
      (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => done('Link copied'), () => done(location.href));
    }
  });
  $('.tool[data-tool="comment"]').classList.add('on');
  $('.fv-pagesel').addEventListener('change', (e) => goPage(+e.target.value));

  // Pan, zoom, select
  canvas.addEventListener('wheel', (e) => {
    if (isMobile()) return; e.preventDefault();
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
    else { S.x -= e.deltaX; S.y -= e.deltaY; apply(); }
  }, { passive: false });

  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (isMobile() || e.target.closest('.fv-toolbar, a')) return;
    drag = { sx: e.clientX, sy: e.clientY, x: S.x, y: S.y, moved: false, target: e.target };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true; canvas.classList.add('panning'); S.x = drag.x + dx; S.y = drag.y + dy; apply();
  });
  canvas.addEventListener('pointerup', () => {
    if (!drag) return;
    if (!drag.moved && !S.board) { const fr = drag.target.closest && drag.target.closest('.fr'); S.sel = fr ? +fr.dataset.i : null; inspect(); }
    drag = null; canvas.classList.remove('panning');
  });
  canvas.addEventListener('dblclick', (e) => { const fr = e.target.closest('.fr'); if (fr && !isMobile()) zoomToRect(frameRect(+fr.dataset.i), 110); });

  addEventListener('keydown', (e) => {
    if (fv.hidden || e.target.matches('select, input')) return;
    if (e.key === 'Escape') { if (S.sel != null) { S.sel = null; inspect(); } else closeFile(); }
    else if (e.key === 'ArrowRight') goPage(S.i + 1);
    else if (e.key === 'ArrowLeft') goPage(S.i - 1);
    else if (e.shiftKey && e.code === 'Digit1') fit();
    else if (e.key === '+' || e.key === '=') zoomAt(innerWidth / 2, innerHeight / 2, 1.25);
    else if (e.key === '-') zoomAt(innerWidth / 2, innerHeight / 2, 0.8);
  });

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitShots(); if (!fv.hidden) goPage(S.i, true); }, 120); });
  addEventListener('load', fitShots);
  fitShots();
  route();
})();
