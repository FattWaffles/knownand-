/* Renders the sidebar tree, the tag filter and the log from entries.js.
   The theme toggle sets data-theme on <html>; head.js applies the saved choice
   before first paint so the page does not flash.

   Sidebar = a Project Explorer-style tree (folders per tag, one "file" per entry,
   then CV and Links). Clicking a folder folds it. Clicking a file jumps to that
   entry in the log, or over to index.html from the CV page. */

(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const tagById = Object.fromEntries((window.TAGS || []).map((t) => [t.id, t]));
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const entryId = (e) => e.id || slug(e.title);
  const onIndex = !!$('#log');
  const onCv = !!$('#cv');
  const onBlog = !!$('#blog');

  function pill(tagId) {
    const t = tagById[tagId] || { label: tagId, color: 'ink' };
    return `<span class="tag" data-color="${t.color}">${t.label}</span>`;
  }

  /* One log card. The log page lists them; desktop.js (the desktop home
     page) renders the same card inside a window. */
  function entryHtml(e) {
    const title = e.url ? `<a class="title" href="${e.url}">${e.title}</a>` : `<span class="title">${e.title}</span>`;
    let media = '';
    if (e.img) {
      media = `<figure class="shot${e.img.small ? ' small' : ''}"><img src="${e.img.src}" alt="${e.img.alt || ''}" width="${e.img.w || ''}" height="${e.img.h || ''}" loading="lazy"></figure>`;
    } else if (e.imgs) {
      media = `<figure class="shot row">${e.imgs.map((i) => `<img src="${i.src}" alt="${i.alt || ''}" loading="lazy">`).join('')}</figure>`;
    }
    const cap = e.caption ? `<p class="caption">${e.caption}</p>` : '';
    return `<article class="entry" id="e-${entryId(e)}" data-tag="${e.tag}">
        <p class="date">${e.date}</p>
        <p class="head">${pill(e.tag)} ${title}</p>
        <p class="text">${e.text}</p>
        ${media}${cap}
      </article>`;
  }

  /* Icons: the lattice motif (after the M:PY GIF). A file is one rounded
     square, a folder is four; they turn 45 degrees on hover, when selected and
     when open (CSS). Details on the CV and link squares are cut in the page
     colour. The old glass / soft sprites are kept in versions/. */
  const sq = (extra = '') => `<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><rect class="sq" x="3" y="3" width="10" height="10" rx="2.6"/>${extra}</svg>`;
  const I = {
    folder: `<svg class="ic ic-folder" viewBox="0 0 16 16" aria-hidden="true"><rect class="sq" x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect class="sq" x="9" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect class="sq" x="1.5" y="9" width="5.5" height="5.5" rx="1.5"/><rect class="sq" x="9" y="9" width="5.5" height="5.5" rx="1.5"/></svg>`,
    file: sq(),
    cv: sq('<path class="ln" d="M6 7h4M6 9.4h2.6"/>'),
    link: sq('<path class="ln" d="M6.4 9.6l3.2-3.2M7.2 6.4h2.4v2.4"/>'),
    chev: `<svg class="ic ic-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  /* ---------- Sidebar tree ---------- */
  const tree = $('#tree');
  if (tree && window.ENTRIES) {
    const byTag = {};
    window.ENTRIES.forEach((e) => (byTag[e.tag] = byTag[e.tag] || []).push(e));

    const fileRow = (e) => {
      const id = entryId(e);
      const href = (onIndex ? '' : 'index.html') + '#e-' + id;
      return `<li role="treeitem"><a class="row" href="${href}" data-entry="${id}"><span class="tw"></span>${I.file}<span class="lbl">${e.title}</span></a></li>`;
    };
    const folder = (label, inner, open = true) =>
      `<li class="folder${open ? ' open' : ''}" role="treeitem" aria-expanded="${open}">
        <button class="row" type="button"><span class="tw">${I.chev}</span>${I.folder}<span class="lbl">${label}</span></button>
        <ul role="group">${inner}</ul>
      </li>`;

    let html = '';
    window.TAGS.forEach((t) => {
      const list = byTag[t.id] || [];
      if (list.length) html += folder(t.label, list.map(fileRow).join(''));
    });
    html += `<li role="treeitem"><a class="row${onCv ? ' sel' : ''}" href="cv.html"><span class="tw"></span>${I.cv}<span class="lbl">CV</span></a></li>`;
    /* Blog folder (posts.js): "All posts" then one row per post. On blog.html the
       rows switch posts in place; elsewhere they go to blog.html#p-<id>. */
    const posts = (window.BLOG && window.BLOG.posts) || [];
    if (posts.length) {
      const base = onBlog ? '' : 'blog.html';
      html += folder(window.BLOG.title || 'Blog',
        `<li role="treeitem"><a class="row" href="blog.html" data-post="index"><span class="tw"></span>${I.cv}<span class="lbl">All posts</span></a></li>` +
        posts.map((p) => `<li role="treeitem"><a class="row" href="${base}#p-${p.id}" data-post="${p.id}"><span class="tw"></span>${I.file}<span class="lbl">${p.title}</span></a></li>`).join(''));
    }
    html += folder('Links', window.SITE.links.map((l) =>
      `<li role="treeitem"><a class="row" href="${l.url}"${l.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span class="tw"></span>${I.link}<span class="lbl">${l.label}</span></a></li>`
    ).join(''));
    tree.innerHTML = html;

    tree.addEventListener('click', (ev) => {
      const b = ev.target.closest('button.row');
      if (b) {
        const li = b.parentElement;
        const open = !li.classList.contains('open');
        li.classList.toggle('open', open);
        li.setAttribute('aria-expanded', String(open));
        return;
      }
      const a = ev.target.closest('a[data-entry]');
      if (a && onIndex) {
        ev.preventDefault();
        history.replaceState(null, '', '#e-' + a.dataset.entry);
        showEntry(a.dataset.entry);
        $('.side').classList.remove('open');
      }
    });
  }
  const toggle = $('#tree-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = $('.side').classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const btn = $('#theme');
  if (btn) {
    /* Dark is the default for this version; only an explicit "light" flips it */
    const isDark = () => root.dataset.theme !== 'light';
    const sync = () => btn.setAttribute('aria-pressed', String(isDark()));
    btn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('known-theme', next); } catch (e) {}
      sync();
    });
    sync();
  }

  /* ---------- Home page: hero (rosekuan.com treatment) ----------
     Name over role, then the meta rows. The label text decodes in from random
     glyphs, left to right, the way the row labels on rosekuan.com arrive. */
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
      let s = '';
      for (let i = 0; i < n; i++) s += text[i] === ' ' ? ' ' : i < fixed ? text[i] : churn[i];
      el.textContent = s;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }

  const hero = $('#hero');
  if (hero && window.SITE && window.SITE.hero) {
    const S = window.SITE;
    const arrow = '<svg class="arr" viewBox="0 0 8 8" aria-hidden="true"><path d="M1.5 6.5 6.5 1.5M2.6 1.5h3.9v3.9"/></svg>';
    const ext = (u) => (u.startsWith('http') ? ' target="_blank" rel="noopener"' : '');
    /* Real text for screen readers, an aria-hidden copy that animates */
    const scr = (t) => `<span class="sr-only">${t}</span><span class="scr" aria-hidden="true" data-text="${t}">${t}</span>`;
    const rows = (S.meta || []).map((m) => {
      let right;
      if (m.links) right = S.links.map((l) => `<a href="${l.url}"${ext(l.url)}>${l.short || l.label}${arrow}</a>`).join('');
      else if ('clock' in m) right = `<time class="clock" data-tz="${m.clock || ''}">--:--:--</time>`;
      else right = m.value;
      return `<div class="row"><span class="k">${scr(m.label)}</span><span class="v">${right}</span></div>`;
    }).join('');
    /* The band is the pause between heading and rows: lattice.js snaps it to the grid and fills it with turning squares */
    hero.innerHTML = `<h1><span class="name">${scr(S.hero.name)}</span> <span class="role">${scr(S.hero.role)}</span></h1><div class="band" data-rows="2" aria-hidden="true"></div><div class="meta">${rows}</div>`;

    const clocks = [...hero.querySelectorAll('.clock')];
    if (clocks.length) {
      const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' };
      const fmt = clocks.map((c) => {
        try { return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: c.dataset.tz || undefined }); }
        catch (e) { return new Intl.DateTimeFormat('en-GB', opts); }
      });
      const tick = () => { const d = new Date(); clocks.forEach((c, i) => { c.textContent = fmt[i].format(d); c.dateTime = d.toISOString(); }); };
      tick();
      setInterval(tick, 1000);
    }

    /* Heading lines first, then the row labels, each a beat later */
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.querySelectorAll('.scr').forEach((el, i) => decode(el, 100 + i * 160));
    }
  }

  /* ---------- Home page: intro, filter, log ---------- */
  const intro = $('#intro');
  if (intro && window.SITE) intro.innerHTML = window.SITE.intro.map((p) => `<p>${p}</p>`).join('');

  const filter = $('#filter');
  const log = $('#log');
  let currentTag = 'all';

  function applyFilter(tag) {
    currentTag = tag;
    let shown = 0;
    log.querySelectorAll('.entry').forEach((el) => {
      const on = tag === 'all' || el.dataset.tag === tag;
      el.hidden = !on;
      if (on) shown++;
    });
    $('.empty', log).hidden = shown > 0;
    filter.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.tag === tag;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function showEntry(id) {
    const el = document.getElementById('e-' + id);
    if (!el) return;
    if (el.hidden) applyFilter('all');
    document.querySelectorAll('.entry.sel, .tree .row.sel').forEach((n) => n.classList.remove('sel'));
    el.classList.add('sel');
    const row = tree && tree.querySelector(`a[data-entry="${id}"]`);
    if (row) {
      row.classList.add('sel');
      const li = row.closest('li.folder');
      if (li && !li.classList.contains('open')) { li.classList.add('open'); li.setAttribute('aria-expanded', 'true'); }
    }
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function fromHash() {
    const h = location.hash.slice(1);
    if (h.startsWith('e-')) { applyFilter('all'); showEntry(h.slice(2)); }
    else applyFilter(tagById[h] ? h : 'all');
  }

  if (filter && log && window.ENTRIES) {
    const all = [{ id: 'all', label: 'all', color: 'blue' }, ...window.TAGS];
    filter.innerHTML = all
      .map((t) => `<button type="button" class="tag" data-color="${t.color}" data-tag="${t.id}" aria-pressed="false">${t.label}</button>`)
      .join('');

    log.innerHTML = window.ENTRIES.map(entryHtml).join('') + '<p class="empty" hidden>Nothing with that tag yet.</p>';

    filter.addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-tag]');
      if (!b) return;
      const tag = b.dataset.tag;
      history.replaceState(null, '', tag === 'all' ? location.pathname : '#' + tag);
      document.querySelectorAll('.entry.sel, .tree .row.sel').forEach((n) => n.classList.remove('sel'));
      applyFilter(tag);
    });
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- CV page ---------- */
  /* The CV sections. cv.html fills #cv with them; desktop.js puts them in a window. */
  function cvHtml(c) {
    return `
      <section>
        <h2>Employment</h2>
        <div class="emp">
          ${c.employment.map((r) => `<div class="org">${r.org}</div><div class="role"><b>${r.role}</b>${r.dates ? `<span class="dates">${r.dates}</span>` : ''}</div>`).join('')}
        </div>
      </section>
      <section>
        <h2>Highlights</h2>
        <p>${c.highlights.text}</p>
        <ul>${c.highlights.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      </section>
      <section>
        <h2>Selected work</h2>
        <ul class="plain">${c.work.map((w) => `<li><a href="${w.url}">${w.label}</a></li>`).join('')}</ul>
      </section>
      <section>
        <h2>Tools</h2>
        <p>${c.tools}</p>
      </section>`;
  }
  const cv = $('#cv');
  if (cv && window.CV) cv.innerHTML = cvHtml(window.CV);

  /* ---------- Blog page ----------
     posts.js holds BLOG.posts (newest first), each with a Markdown body.
     No hash = the list, one card per post; #p-<id> = that post. Clicks on
     post links (cards, tree rows, the back link) switch in place. */
  const blog = $('#blog');
  if (blog && window.BLOG) {
    const P = window.BLOG.posts || [];
    const byId = Object.fromEntries(P.map((p) => [p.id, p]));
    const name = (window.SITE && window.SITE.name) || '';
    const tagList = (p) => (p.tags || []).map((t) => `<span class="tag">${t}</span>`).join('');
    const card = (p) => `<article class="entry frost">
        <p class="date">${p.date}</p>
        <p class="head"><a class="title" href="#p-${p.id}" data-post="${p.id}">${p.title}</a></p>
        <p class="text">${p.summary || ''}</p>
        ${p.tags && p.tags.length ? `<p class="tags">${tagList(p)}</p>` : ''}
      </article>`;

    function route() {
      const h = location.hash.slice(1);
      const p = h.startsWith('p-') ? byId[h.slice(2)] : null;
      document.querySelectorAll('.tree .row.sel').forEach((n) => n.classList.remove('sel'));
      const row = tree && tree.querySelector(`a[data-post="${p ? p.id : 'index'}"]`);
      if (row) row.classList.add('sel');
      const title = window.BLOG.title || 'Blog';
      if (p) {
        blog.innerHTML = `<p class="back"><a href="blog.html" data-post="index">&larr; All posts</a></p>
          <h1>${p.title}</h1>
          <article class="post frost"><p class="date"><span>${p.date}</span>${tagList(p)}</p>${md(p.body || '')}</article>`;
        document.title = `${p.title} · ${name}`;
      } else {
        blog.innerHTML = `<h1>${title}</h1>` +
          (window.BLOG.intro ? `<p class="lede">${window.BLOG.intro}</p>` : '') +
          (P.length ? P.map(card).join('') : '<p class="empty">No posts yet.</p>');
        document.title = `${title} · ${name}`;
      }
    }
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-post]');
      if (!a) return;
      ev.preventDefault();
      const id = a.dataset.post;
      history.pushState(null, '', id === 'index' ? location.pathname : '#p-' + id);
      route();
      window.scrollTo(0, 0);
      $('.side').classList.remove('open');
    });
    window.addEventListener('popstate', route);
    route();
  }

  /* Small Markdown renderer for post bodies. Blocks: # headings (# = h2),
     paragraphs, - and 1. lists, > quotes, --- rules, ![alt](src) images and
     fenced code (``` or ~~~, optional language). Inline: `code`, **bold**,
     *em*, [text](url). Anything else is passed through as written. */
  function md(src) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const keep = [];
    const stash = (html) => `\u0000${keep.push(html) - 1}\u0000`;
    src = src.replace(/\r\n?/g, '\n')
      .replace(/^(```|~~~)(\w*)[ \t]*\n([\s\S]*?)\n\1[ \t]*$/gm, (m, f, lang, code) =>
        stash(`<pre class="code"${lang ? ` data-lang="${lang}"` : ''}><code>${esc(code)}</code></pre>`));
    const inline = (s) => s
      .replace(/`([^`\n]+)`/g, (m, c) => stash(`<code>${esc(c)}</code>`))
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\w*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
    const out = [];
    let para = [], list = null;
    const endP = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
    const endL = () => { if (list) { out.push(`<${list.t}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.t}>`); list = null; } };
    const block = (html) => { endP(); endL(); out.push(html); };
    src.split('\n').forEach((line) => {
      let m;
      if (!line.trim()) { endP(); endL(); return; }
      if ((m = line.match(/^\u0000(\d+)\u0000$/))) { block(keep[+m[1]]); return; }
      if ((m = line.match(/^(#{1,3})\s+(.*)/))) { const n = m[1].length + 1; block(`<h${n}>${inline(m[2])}</h${n}>`); return; }
      if ((m = line.match(/^>\s?(.*)/))) { block(`<blockquote><p>${inline(m[1])}</p></blockquote>`); return; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { block('<hr>'); return; }
      if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) { block(`<figure class="shot"><img src="${m[2]}" alt="${m[1]}" loading="lazy"></figure>`); return; }
      if ((m = line.match(/^\s*[-*]\s+(.*)/))) { endP(); if (!list || list.t !== 'ul') { endL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); return; }
      if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { endP(); if (!list || list.t !== 'ol') { endL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); return; }
      if (list && /^\s{2,}/.test(line)) { list.items[list.items.length - 1] += ' ' + line.trim(); return; }
      endL(); para.push(line.trim());
    });
    endP(); endL();
    return out.join('\n').replace(/\u0000(\d+)\u0000/g, (m, i) => keep[+i]);
  }

  /* Shared with desktop.js, which renders the same cards, CV and posts
     inside desktop windows. */
  window.KNOWN = { md, pill, entryId, entryHtml, cvHtml };
})();
