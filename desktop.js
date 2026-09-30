/* Desktop home page (2026-09-30). Josie: "add a desktop look but keep the
   left nav; when a folder is clicked it will open up" the way bryanvtran.com
   does, "I only want the desktop type of experience, not the UI or styling".

   So the home page is a desktop on the lattice. Folders (one per tag, plus
   Blog and Links) and files (about.txt, log.txt, CV) sit in a column at the
   right. Click one and a window opens. Windows drag by their bar, stack (the
   last one touched is on top), shade to the bar (the second square, or a
   double-click on the bar), zoom to the desktop (the third square) and
   close (the first square, or Escape). The Project Explorer opens the same
   windows, so the nav still works as before. Deep links: #e-<id> opens an
   entry, #<tag> a folder, #cv, #blog, #p-<id>, #links, #log.

   Everything is drawn in the site's own tokens (desktop.css): windows are
   frosted panes like the nav, icons are the lattice squares, labels the mono
   small caps. Cards, the CV and posts come from site.js (window.KNOWN); the
   motion previews from motion.js (window.MOTION). The old page is log.html. */

(function () {
  const desk = document.getElementById('desktop');
  const K = window.KNOWN;
  if (!desk || !K || !window.ENTRIES) return;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAGS = window.TAGS || [];
  const tagById = Object.fromEntries(TAGS.map((t) => [t.id, t]));
  const posts = (window.BLOG && window.BLOG.posts) || [];
  const postById = Object.fromEntries(posts.map((p) => [p.id, p]));
  const byId = {}, byTag = {};
  window.ENTRIES.forEach((e) => { const id = K.entryId(e); byId[id] = e; (byTag[e.tag] = byTag[e.tag] || []).push(e); });
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => rmq.matches || document.documentElement.classList.contains('motion-off');
  const phone = () => matchMedia('(max-width: 720px)').matches;
  const blogTitle = (window.BLOG && window.BLOG.title) || 'Blog';

  /* Icons: the lattice motif at desktop size. A folder is four squares, a
     file one; the CV and link files carry a detail cut in the page colour. */
  const one = (extra = '') => `<svg class="ic" viewBox="0 0 64 64" aria-hidden="true"><rect class="sq" x="10" y="10" width="44" height="44" rx="11"/>${extra}</svg>`;
  const ICON = {
    folder: `<svg class="ic" viewBox="0 0 64 64" aria-hidden="true"><rect class="sq" x="6" y="6" width="23" height="23" rx="6"/><rect class="sq" x="35" y="6" width="23" height="23" rx="6"/><rect class="sq" x="6" y="35" width="23" height="23" rx="6"/><rect class="sq" x="35" y="35" width="23" height="23" rx="6"/></svg>`,
    file: one(),
    cv: one('<path class="ln" d="M24 28h16M24 37h10"/>'),
    link: one('<path class="ln" d="M26 38l12-12M29 26h9v9"/>'),
  };

  /* ---------- What sits on the desktop ---------- */
  const items = [{ id: 'about', label: 'about.txt', icon: 'file' }];
  TAGS.forEach((t) => { if (byTag[t.id]) items.push({ id: 'folder:' + t.id, label: t.label, icon: 'folder' }); });
  items.push({ id: 'log', label: 'log.txt', icon: 'file' });
  if (window.CV) items.push({ id: 'cv', label: 'CV', icon: 'cv' });
  if (posts.length) items.push({ id: 'blog', label: blogTitle, icon: 'folder' });
  if (window.SITE && window.SITE.links) items.push({ id: 'links', label: 'Links', icon: 'folder' });
  $('#icons', desk).innerHTML = items.map((it) =>
    `<button class="icon" type="button" data-open="${it.id}"><span class="glyph">${ICON[it.icon]}</span><span class="lbl">${esc(it.label)}</span></button>`).join('');

  /* ---------- Window contents ---------- */
  const fileBtn = (id, icon, name, sub) =>
    `<button class="file" type="button" data-open="${id}">${ICON[icon]}<span class="nm">${esc(name)}</span>${sub ? `<span class="dt">${esc(sub)}</span>` : ''}</button>`;
  const files = (inner) => `<div class="files">${inner}</div>`;

  function spec(id) {
    if (id.startsWith('folder:')) {
      const t = tagById[id.slice(7)], list = t && byTag[t.id];
      if (!list) return null;
      return { title: t.label, w: 520, hash: t.id, html: files(list.map((e) => fileBtn('entry:' + K.entryId(e), 'file', e.title, e.date)).join('')) };
    }
    if (id.startsWith('entry:')) {
      const e = byId[id.slice(6)];
      if (!e) return null;
      return {
        title: e.title, w: 640, hash: 'e-' + K.entryId(e), html: K.entryHtml(e),
        after: (el) => { if (window.MOTION) window.MOTION.attach(el.querySelector('article.entry'), e); },
      };
    }
    if (id === 'cv' && window.CV) return { title: 'CV', w: 640, hash: 'cv', html: `<div class="cv">${K.cvHtml(window.CV)}</div>` };
    if (id === 'blog') return { title: blogTitle, w: 520, hash: 'blog', html: files(posts.map((p) => fileBtn('post:' + p.id, 'file', p.title, p.date)).join('')) };
    if (id.startsWith('post:')) {
      const p = postById[id.slice(5)];
      if (!p) return null;
      const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
      return { title: p.title, w: 680, hash: 'p-' + p.id, html: `<article class="post"><p class="date"><span>${esc(p.date)}</span>${tags}</p>${K.md(p.body || '')}</article>` };
    }
    if (id === 'links') return {
      title: 'Links', w: 420, hash: 'links',
      html: files(window.SITE.links.map((l) => `<a class="file" href="${l.url}"${l.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${ICON.link}<span class="nm">${esc(l.label)}</span></a>`).join('')),
    };
    if (id === 'log') return {
      title: 'log.txt', w: 560, hash: 'log',
      html: `<ol class="loglist">${window.ENTRIES.map((e) => `<li><span class="d">${esc(e.date)}</span><span class="t"><button type="button" data-open="entry:${K.entryId(e)}">${esc(e.title)}</button>${K.pill(e.tag)}</span></li>`).join('')}</ol>`,
    };
    return null;
  }

  /* ---------- Windows ---------- */
  const layer = $('#wins', desk);
  const wins = new Map();          // id -> element
  let z = 10, cascade = 0;

  const barHtml = (title) => `<div class="bar"><span class="lights"><button class="lt close" type="button" aria-label="Close"></button><button class="lt shade" type="button" aria-label="Shade"></button><button class="lt zoom" type="button" aria-label="Zoom"></button></span><span class="ttl">${esc(title)}</span></div>`;

  const shown = () => [...layer.querySelectorAll('.win')].filter((w) => !w.hidden && !w.classList.contains('out'));
  const topWin = () => shown().reduce((a, w) => (!a || +w.style.zIndex > +a.style.zIndex ? w : a), null);

  /* New windows open near the middle, each one a step down and right of the
     last (macOS style). The about window, open at load, sits centred. */
  function place(el, opener, centre) {
    if (phone()) return;
    const W = desk.clientWidth, H = desk.clientHeight;
    el.classList.remove('max');
    const w = Math.min(parseFloat(el.dataset.w) || el.offsetWidth, W - 32);
    el.style.width = w + 'px';
    const h = el.offsetHeight;
    const k = centre ? 0 : (cascade++ % 6) + 1;
    let x = Math.round((W - w) / 2 + (k ? -96 + k * 28 : 0));
    let y = Math.round(Math.max(24, (H - h) / 2 - 24) + (k ? -72 + k * 28 : 0));
    x = clamp(x, 16, Math.max(16, W - w - 16));
    y = clamp(y, 16, Math.max(16, H - h - 16));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    /* Open from the icon or row that was clicked, like a window unfolding
       out of its file */
    if (!still()) {
      let ox = '50%', oy = '50%';
      if (opener) {
        const a = opener.getBoundingClientRect(), b = el.getBoundingClientRect();
        ox = Math.round(a.left + a.width / 2 - b.left) + 'px';
        oy = Math.round(a.top + a.height / 2 - b.top) + 'px';
      }
      el.style.transformOrigin = `${ox} ${oy}`;
      el.classList.add('in');
      el.addEventListener('animationend', () => el.classList.remove('in'), { once: true });
    }
  }

  function front(el) {
    el.style.zIndex = ++z;
    layer.querySelectorAll('.win.top').forEach((w) => w.classList.remove('top'));
    el.classList.add('top');
    syncTree(el.dataset.id);
  }

  function setHash(el) {
    const h = el && el.dataset.hash;
    history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
  }

  function open(id, opener) {
    let el = wins.get(id);
    if (el) {
      if (el.hidden) { el.hidden = false; place(el, opener); }
      el.classList.remove('shaded');
    } else {
      const s = spec(id);
      if (!s) return null;
      el = document.createElement('section');
      el.className = 'win';
      el.dataset.id = id;
      el.dataset.w = s.w;
      el.dataset.hash = s.hash || '';
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', s.title);
      el.tabIndex = -1;
      el.innerHTML = barHtml(s.title) + `<div class="body">${s.html}</div>`;
      layer.appendChild(el);
      wins.set(id, el);
      place(el, opener);
      if (s.after) s.after(el);
    }
    el._opener = opener || null;
    front(el);
    setHash(el);
    paintIcons();
    el.focus({ preventScroll: true });
    closeNav();
    return el;
  }

  function close(el) {
    if (!el || el.classList.contains('out')) return;
    const keep = el.dataset.keep === '1';
    if (window.MOTION) el.querySelectorAll('article.entry').forEach((a) => window.MOTION.release(a));
    const done = () => {
      el.classList.remove('out', 'top', 'max', 'shaded');
      if (keep) el.hidden = true; else { wins.delete(el.dataset.id); el.remove(); }
      paintIcons();
      const t = topWin();
      if (t) front(t); else syncTree(null);
      setHash(t);
      const back = el._opener;
      if (back && back.isConnected && (!t || !t.contains(document.activeElement))) back.focus({ preventScroll: true });
    };
    if (!still() && !phone()) { el.classList.add('out'); el.addEventListener('animationend', done, { once: true }); }
    else done();
  }

  function zoom(el) {
    if (el.classList.toggle('max')) {
      el._geo = { left: el.style.left, top: el.style.top, width: el.style.width };
      el.style.left = el.style.top = el.style.width = '';
    } else if (el._geo) Object.assign(el.style, el._geo);
    el.classList.remove('shaded');
  }

  /* The about window is in the page already (site.js fills its hero), so
     the desktop adopts it instead of building it. Closing hides it. */
  const about = $('.win[data-id="about"]', layer);
  if (about) {
    about.insertAdjacentHTML('afterbegin', barHtml(about.getAttribute('aria-label') || 'about.txt'));
    about.dataset.keep = '1';
    about.dataset.w = about.dataset.w || '640';
    about.dataset.hash = '';
    about.setAttribute('role', 'region');
    about.tabIndex = -1;
    wins.set('about', about);
    place(about, null, true);
    front(about);
    paintIcons();
  }

  /* ---------- Pointer work on the windows ---------- */
  layer.addEventListener('pointerdown', (ev) => {
    const el = ev.target.closest('.win');
    if (!el) return;
    if (!el.classList.contains('top')) front(el);
    const bar = ev.target.closest('.bar');
    if (!bar || ev.button !== 0 || ev.target.closest('button') || phone() || el.classList.contains('max')) return;
    ev.preventDefault();
    const sx = ev.clientX, sy = ev.clientY, x0 = el.offsetLeft, y0 = el.offsetTop;
    const W = desk.clientWidth, H = desk.clientHeight, w = el.offsetWidth;
    el.classList.add('drag');
    const move = (e) => {
      el.style.left = clamp(x0 + e.clientX - sx, 96 - w, W - 96) + 'px';
      el.style.top = clamp(y0 + e.clientY - sy, 0, H - 36) + 'px';
    };
    const up = () => { el.classList.remove('drag'); bar.removeEventListener('pointermove', move); };
    try { bar.setPointerCapture(ev.pointerId); } catch (e) {}
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up, { once: true });
    bar.addEventListener('pointercancel', up, { once: true });
  });
  layer.addEventListener('dblclick', (ev) => {
    const el = ev.target.closest('.win');
    if (el && ev.target.closest('.bar') && !ev.target.closest('button') && !phone()) el.classList.toggle('shaded');
  });
  layer.addEventListener('click', (ev) => {
    const b = ev.target.closest('.lt');
    if (!b) return;
    const el = b.closest('.win');
    if (b.classList.contains('close')) close(el);
    else if (b.classList.contains('shade')) el.classList.toggle('shaded');
    else if (b.classList.contains('zoom')) zoom(el);
  });

  /* Anything with data-open (desktop icons, files in a folder, log rows) opens a window */
  desk.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-open]');
    if (!b || !desk.contains(b)) return;
    ev.preventDefault();
    open(b.dataset.open, b);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    const t = topWin();
    if (t) { ev.preventDefault(); close(t); }
  });

  /* ---------- The Project Explorer opens the same windows ----------
     A folder row opens its folder (the chevron alone still folds it, that is
     site.js). An entry row opens the entry, CV the CV, a post row the post.
     Links stay links. Runs in the capture phase so site.js's own handler,
     which would fold the folder or follow the href, does not. */
  const tree = $('#tree');
  const folderIdFor = (li) => {
    const first = li.querySelector('ul a.row');
    if (!first) return null;
    if (first.dataset.entry) { const e = byId[first.dataset.entry]; return e ? 'folder:' + e.tag : null; }
    if (first.dataset.post) return 'blog';
    return 'links';
  };
  if (tree) tree.addEventListener('click', (ev) => {
    const b = ev.target.closest('button.row');
    if (b) {
      if (ev.target.closest('.tw')) return;
      const li = b.parentElement;
      const id = folderIdFor(li);
      if (!id) return;
      ev.stopPropagation();
      li.classList.add('open');
      li.setAttribute('aria-expanded', 'true');
      open(id, b);
      return;
    }
    const a = ev.target.closest('a.row');
    if (!a) return;
    let id = null;
    if (a.dataset.entry) id = 'entry:' + a.dataset.entry;
    else if (a.dataset.post) id = a.dataset.post === 'index' ? 'blog' : 'post:' + a.dataset.post;
    else if (/(^|\/)cv\.html$/.test(a.getAttribute('href') || '')) id = 'cv';
    if (!id) return;
    ev.preventDefault();
    ev.stopPropagation();
    open(id, a);
  }, true);

  function closeNav() {
    const side = $('.side'), tg = $('#tree-toggle');
    if (side) side.classList.remove('open');
    if (tg) tg.setAttribute('aria-expanded', 'false');
  }

  /* The tree row for the top window is selected, and its folder is open */
  function syncTree(id) {
    if (!tree) return;
    tree.querySelectorAll('.row.sel').forEach((n) => n.classList.remove('sel'));
    if (!id) return;
    let row = null;
    if (id.startsWith('entry:')) row = tree.querySelector(`a[data-entry="${CSS.escape(id.slice(6))}"]`);
    else if (id.startsWith('post:')) row = tree.querySelector(`a[data-post="${CSS.escape(id.slice(5))}"]`);
    else if (id === 'cv') row = tree.querySelector('a[href$="cv.html"]');
    else if (id === 'blog') row = tree.querySelector('a[data-post="index"]');
    else if (id.startsWith('folder:') || id === 'links') {
      row = [...tree.querySelectorAll('li.folder')].map((li) => (folderIdFor(li) === id ? li.querySelector(':scope > .row') : null)).find(Boolean) || null;
    }
    if (!row) return;
    row.classList.add('sel');
    const li = row.closest('li.folder');
    if (li) { li.classList.add('open'); li.setAttribute('aria-expanded', 'true'); }
  }

  /* Desktop icons whose window is open are marked */
  function paintIcons() {
    desk.querySelectorAll('.icon[data-open]').forEach((b) => {
      const w = wins.get(b.dataset.open);
      b.classList.toggle('on', !!w && !w.hidden);
    });
  }

  /* ---------- Deep links ---------- */
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    let id = null;
    if (h.startsWith('e-')) id = 'entry:' + h.slice(2);
    else if (h.startsWith('p-')) id = 'post:' + h.slice(2);
    else if (tagById[h]) id = 'folder:' + h;
    else if (['cv', 'blog', 'links', 'log', 'about'].includes(h)) id = h;
    if (id) open(id);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* Keep windows on the desktop when it shrinks */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (phone()) return;
      const W = desk.clientWidth, H = desk.clientHeight;
      shown().forEach((el) => {
        if (el.classList.contains('max')) return;
        el.style.left = clamp(el.offsetLeft, 96 - el.offsetWidth, Math.max(0, W - 96)) + 'px';
        el.style.top = clamp(el.offsetTop, 0, Math.max(0, H - 36)) + 'px';
      });
    }, 150);
  });
})();
