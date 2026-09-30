/* Motion previews for the log entries. anime.js (vendor/anime.iife.min.js,
   MIT, animejs.com, the most-starred animation library on GitHub) drives a
   small looping scene per project, built from that entry's own screenshots,
   so the work moves before you click into it.

   entries.js picks the scene with `motion: '<name>'`:
     chat    a drawn phone runs the Quote On flow: say the job, the AI asks
             for a rate instead of guessing, the draft quote fills in (Quote On)
     portal  the Sapphire mosaic, then a cursor goes into the casting-list
             request form and the create-campaign form, feature by feature
     tiles   one screenshot revealed as a grid of flipping tiles
     phones  a row of phone screens that take turns in focus
     score   slow pan over the page + a counter card, 40 to 72 (courseware)
     pins    slow pan + finding pins dropping in with a running count (Selig)
     rank    no screenshot: a drawn panel of three ranked actions (Profitmind)
     logo    slow zoom + a light sweep across the logo (RobotFac3)
     icon    the app icon hops in place (Cat in a Box)

   The static <figure> from site.js stays as it is for reduced-motion users,
   without JS, or if the library fails to load. A scene is built the first
   time it scrolls into view, pauses while off screen or when the tab is
   hidden, and a "Motion on/off" button in the sidebar stops everything. */

(function () {
  const A = window.anime;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const entryId = (e) => e.id || slug(e.title);
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const { animate, createTimeline, stagger } = A || {};

  /* The pressed well holds one 16:10 box (2:1 for the logo). The entry's alt
     text labels the stage. If the entry links to a case study, the stage is
     that link and an "Open" chip shows on hover. */
  function stage(fig, e, cls, inner, label) {
    const box = `<div class="stage ${cls}" role="img" aria-label="${esc(label)}">${inner}</div>`;
    fig.className = 'shot motion';
    fig.innerHTML = e.url
      ? `<a class="go" href="${e.url}" tabindex="-1" aria-label="Open case study: ${esc(e.title)}">${box}<span class="open">Open case study</span></a>`
      : box;
    return fig.querySelector('.stage');
  }
  const LAZY = 'loading="lazy" decoding="async"';
  const picture = (im) => `<img class="pan" src="${im.src}" alt="" width="${im.w || ''}" height="${im.h || ''}" ${LAZY}>`;
  const pan = (img) => animate(img, { scale: [1, 1.08], translateY: ['0%', '-7%'], duration: 9000, ease: 'inOutSine', alternate: true, loop: true, autoplay: false });
  const tl = (opts) => createTimeline({ loop: true, autoplay: false, defaults: { ease: 'outExpo' }, ...opts });
  /* A counting number. reset() puts the text back to the start value; call it
     from the timeline's onLoop, because anime rewinds the tween at a loop wrap
     without firing onUpdate, so the text would keep the previous loop's end. */
  const count = (obj, el, from, to, duration, ease, fmt) => ({
    target: obj,
    params: { v: [from, to], duration, ease: ease || 'outQuart', onUpdate: () => { el.textContent = fmt ? fmt(obj.v) : Math.round(obj.v); } },
    reset: () => { el.textContent = fmt ? fmt(from) : Math.round(from); },
  });
  /* A player that can be handed to the observer before its timeline exists
     (the chat scene measures text after the web font loads). */
  const lazy = () => {
    const P = {
      tl: null, want: false,
      get paused() { return !P.want; },
      play() { P.want = true; if (P.tl) P.tl.play(); },
      pause() { P.want = false; if (P.tl) P.tl.pause(); },
      cancel() { P.want = false; if (P.tl && P.tl.cancel) P.tl.cancel(); P.tl = null; },
      set(tl) { if (P.tl && P.tl.cancel) P.tl.cancel(); P.tl = tl; if (P.want) tl.play(); },
    };
    return P;
  };
  const rect = (el, root) => { const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };

  const S = {};

  /* Sapphire: the creators mosaic arrives as a 6x4 grid of tiles flipping in
     from the centre, drifts, then folds away from the last tile. */
  S.tiles = (fig, e) => {
    const im = e.img, C = 6, R = 4;
    let html = '';
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      html += `<div class="tile" style="left:${c * 100 / C}%;top:${r * 100 / R}%;width:${100 / C}%;height:${100 / R}%">` +
        `<img src="${im.src}" alt="" ${LAZY} style="width:${C * 100}%;height:${R * 100}%;left:${-c * 100}%;top:${-r * 100}%"></div>`;
    }
    const st = stage(fig, e, 'tiles', html, im.alt);
    const T = [...st.querySelectorAll('.tile')], I = [...st.querySelectorAll('.tile img')];
    const t = tl({ loopDelay: 500 });
    t.add(T, { opacity: [0, 1], rotateX: [-90, 0], duration: 700, delay: stagger(45, { grid: [C, R], from: 'center' }) }, 0)
      .add(I, { scale: [1, 1.06], duration: 4200, ease: 'inOutSine' }, 1500)
      .add(T, { opacity: [1, 0], rotateX: [0, 90], duration: 600, ease: 'inQuad', delay: stagger(40, { grid: [C, R], from: 'last' }) }, 5900)
      .add(I, { scale: [1.06, 1], duration: 1500, ease: 'inOutSine' }, 5900);
    return [t];
  };

  /* Three phone screens rise in, then each takes a turn in focus. */
  S.phones = (fig, e) => {
    const st = stage(fig, e, 'phones',
      e.imgs.map((i) => `<img src="${i.src}" alt="" ${LAZY}>`).join(''),
      e.imgs.map((i) => i.alt).join(' '));
    const ph = [...st.querySelectorAll('img')];
    const t = tl({ loopDelay: 700 });
    t.add(ph, { opacity: [0, 1], translateY: [44, 0], duration: 800, delay: stagger(130) }, 0);
    const state = ph.map(() => ({ s: 1, y: 0, o: 1 }));
    let at = 1400;
    ph.forEach((_, i) => {
      ph.forEach((p, j) => {
        const to = j === i ? { s: 1.06, y: -8, o: 1 } : { s: 1, y: 0, o: .5 };
        const f = state[j];
        t.add(p, { scale: [f.s, to.s], translateY: [f.y, to.y], opacity: [f.o, to.o], duration: 550 }, at);
        state[j] = to;
      });
      at += 1700;
    });
    ph.forEach((p, j) => { const f = state[j]; t.add(p, { scale: [f.s, 1], translateY: [f.y, 0], opacity: [f.o, 1], duration: 500 }, at); });
    return [t];
  };

  /* Quote On: a drawn phone runs the core flow in the wording of the real
     screens. Say the job, the AI asks for a rate instead of guessing one, then
     the draft quote fills in inside the chat. Sample persona and figures.
     The message column is measured once the web font is in, then scrolled by
     the timeline so new messages push older ones up like a real chat. */
  S.chat = (fig, e) => {
    const T = {
      ai1: "G'day Bodie! What job are we quoting today? Type it, say it, or snap a photo.",
      chips: ['Rough-in, new build', 'Switchboard upgrade', 'Bathroom reno', 'Heat pump install'],
      you1: 'Switchboard upgrade, 3-bed house in Richmond.',
      ai2: "I don't have a rate from you for switchboard upgrades, and I won't guess your price. What do you want to do?",
      opts: ['Enter my rate', 'Use the NZ market average'],
      you2: '$95 an hour.',
      ai3: 'Here is your draft. I made two assumptions, so have a look before it goes anywhere.',
      lines: [['Labour · 6 h × $95', '$570.00'], ['Switchboard + breakers', '$640.00'], ['Sundries + cable', '$120.00'], ['Travel', '$45.00']],
      sums: [['Subtotal', '$1,375.00'], ['GST 15%', '$206.25']],
      total: 1581.25,
      steps: ['Say the job. Type it, speak it or send a photo.', 'No rate on file? The AI asks. It never invents a price.', 'The draft quote lands in the chat, assumptions listed.'],
    };
    const chars = (str) => str.split('').map((c) => `<span>${esc(c)}</span>`).join('');
    const money = (v) => '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const label = 'Quote On chat preview. ' + T.steps.join(' ') + ' Sample job and figures.';
    const st = stage(fig, e, 'chat', `
      <div class="phone"><div class="scr">
        <div class="bar"><div class="seg"><span class="on">CHAT</span><span>QUOTE</span></div></div>
        <div class="area"><div class="col">
          <div class="msg ai" data-m><div class="txt">${chars(T.ai1)}</div></div>
          <div class="chips" data-m>${T.chips.map((c) => `<i class="chip">${c}</i>`).join('')}</div>
          <div class="msg you" data-m>${T.you1}</div>
          <div class="msg ai" data-m><div class="txt">${chars(T.ai2)}</div></div>
          <div class="opts" data-m><i class="opt dark">${T.opts[0]}</i><i class="opt line">${T.opts[1]}</i></div>
          <div class="msg you" data-m>${T.you2}</div>
          <div class="msg ai" data-m><div class="txt">${chars(T.ai3)}</div></div>
          <div class="card" data-m>
            <div class="id">QT-2026-004 <b>DRAFT</b></div>
            <h4>Switchboard upgrade, 3-bed, Richmond</h4>
            ${T.lines.map(([l, v]) => `<div class="ln"><span>${l}</span><b>${v}</b></div>`).join('')}
            ${T.sums.map(([l, v], i) => `<div class="ln${i ? '' : ' sum'}"><span>${l}</span><b>${v}</b></div>`).join('')}
            <div class="ln tot"><span>Total (NZD)</span><b class="tv">$0.00</b></div>
            <div class="tags"><i>2 assumptions to check</i><i>1 exclusion</i></div>
            <div class="btns"><i class="dark">View quote</i><i class="line">Change something</i></div>
          </div>
        </div><div class="typing"><i></i><i></i><i></i></div></div>
        <div class="in">Generate a quote for...</div>
      </div></div>
      <div class="steps">${T.steps.map((t, i) => `<div class="step"><b>${i + 1}</b><span>${t}</span></div>`).join('')}</div>
      <i class="cur"></i>`, label);
    const $ = (s) => st.querySelector(s), $$ = (s) => [...st.querySelectorAll(s)];
    const area = $('.area'), col = $('.col'), typing = $('.typing'), cur = $('.cur');
    const M = $$('[data-m]'), chips = $$('.chip'), opts = $$('.opt'), steps = $$('.step');
    const ai = (i) => $$('.msg.ai .txt')[i].querySelectorAll('span');
    const lines = $$('.card .ln'), btns = $$('.card .btns i');
    const tv = count({ v: 0 }, $('.tv'), 0, T.total, 900, 'outQuart', money);
    const P = lazy();

    const build = () => {
      const H = area.clientHeight;
      /* Scroll so a message's bottom sits at the bottom of the area. A block
         taller than the area (the quote card on a short phone) shows its top
         first; a second scroll reveals its bottom later. */
      const bottom = (m) => Math.min(0, H - (m.offsetTop + m.offsetHeight) - 6);
      const pos = M.map((m) => Math.max(bottom(m), -m.offsetTop));
      const cardEnd = bottom(M[7]);
      const at = (el, step) => { const r = rect(el, st); return { x: r.x + r.w / 2, y: r.y + r.h / 2 + pos[step] }; };
      const c1 = at(chips[1], 1), o1 = at(opts[0], 4);
      const t = tl({ loopDelay: 900, onLoop: () => tv.reset() });
      /* y tracks the column's translateY in build order, so every scroll tween
         has an explicit from value and loops reset cleanly. */
      let y = 0;
      const scroll = (to, when, dur = 500) => { t.add(col, { translateY: [y, pos[to]], duration: dur, ease: 'inOutQuart' }, when); y = pos[to]; };
      const think = (when, last) => {
        /* If the last visible bubble sits where the typing dots go, nudge the column up first */
        const m = M[last], shift = Math.max(0, m.offsetTop + m.offsetHeight + y - (H - 40));
        if (shift) { t.add(col, { translateY: [y, y - shift], duration: 300, ease: 'inOutQuart' }, when); y -= shift; }
        t.add(typing, { opacity: [0, 1], scale: [.7, 1], duration: 250 }, when).add(typing, { opacity: [1, 0], duration: 150, ease: 'inQuad' }, when + 650);
      };
      const bubble = (i, when) => t.add(M[i], { opacity: [0, 1], scale: [.85, 1], translateY: [8, 0], duration: 350 }, when);
      const type = (n, when) => t.add(ai(n), { opacity: [0, 1], duration: 40, ease: 'linear', delay: stagger(13) }, when);
      const step = (i, when) => t.add(steps[i], { translateX: [-8, 0], duration: 350, onBegin: () => steps[i].classList.add('on') }, when);
      const move = (from, to, when, dur) => t.add(cur, { translateX: [from.x, to.x], translateY: [from.y, to.y], duration: dur, ease: 'inOutSine' }, when);
      const tap = (el, when) => t.add(cur, { scale: [1, .6], duration: 110, ease: 'inQuad' }, when).add(cur, { scale: [.6, 1], duration: 160 }, when + 110)
        .add(el, { scale: [1, .95], duration: 110, onBegin: () => el.classList.add('on') }, when).add(el, { scale: [.95, 1], duration: 180 }, when + 110);
      const home = { x: st.clientWidth * .5, y: st.clientHeight * .96 };
      const endY = Math.min(cardEnd, pos[7]);

      // reset for each loop: column back to the top, chips and steps off
      t.add(col, { translateY: [endY, 0], opacity: [0, 1], duration: 1, onBegin: () => { chips.concat(opts).forEach((n) => n.classList.remove('on')); steps.forEach((n) => n.classList.remove('on')); } }, 0);
      t.add(typing, { opacity: [0, 1], scale: [.7, 1], duration: 250 }, 200).add(typing, { opacity: [1, 0], duration: 150, ease: 'inQuad' }, 850);
      bubble(0, 900); type(0, 950); step(0, 900);
      t.add(chips, { opacity: [0, 1], translateY: [6, 0], duration: 300, delay: stagger(80) }, 2400);
      t.add(cur, { opacity: [0, 1], duration: 200 }, 3000); move(home, c1, 3000, 700); tap(chips[1], 3750);
      t.add(cur, { opacity: [1, 0], duration: 200 }, 4050);
      t.add(chips.filter((c) => c !== chips[1]), { opacity: [1, .35], duration: 300 }, 4100);
      bubble(2, 4200); scroll(2, 4200);
      think(4900, 2); bubble(3, 5700); type(1, 5750); scroll(3, 5700); step(1, 5700);
      t.add(opts, { opacity: [0, 1], translateY: [6, 0], duration: 300, delay: stagger(120) }, 7300); scroll(4, 7300);
      t.add(cur, { opacity: [0, 1], duration: 200 }, 7800); move(home, o1, 7800, 700); tap(opts[0], 8550);
      t.add(cur, { opacity: [1, 0], duration: 200 }, 8850);
      bubble(5, 9000); scroll(5, 9000);
      think(9600, 5); bubble(6, 10400); type(2, 10450); scroll(6, 10400);
      bubble(7, 11700); scroll(7, 11700, 600); step(2, 11700);
      t.add(lines, { opacity: [0, 1], translateX: [-8, 0], duration: 300, delay: stagger(90) }, 12000);
      t.add(tv.target, tv.params, 12500);
      if (cardEnd < y) { t.add(col, { translateY: [y, cardEnd], duration: 700, ease: 'inOutQuart' }, 12900); y = cardEnd; }
      t.add(btns, { opacity: [0, 1], scale: [.9, 1], duration: 300, delay: stagger(100) }, 13200);
      t.add(btns[0], { scale: [1, 1.05], duration: 220, ease: 'inOutSine' }, 13900).add(btns[0], { scale: [1.05, 1], duration: 220, ease: 'inOutSine' }, 14120);
      t.add(col, { opacity: [1, 0], duration: 500, ease: 'inQuad' }, 17200);
      P.set(t);
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(build);
    return [P];
  };

  /* Sapphire: start on the creators mosaic, click into Creators, then move
     through the New Casting List request form and the Create Campaign form,
     zooming to each feature with a caption card. Screens are 1440 wide. */
  S.portal = (fig, e) => {
    const im = e.img, sh = e.shots || {};
    const CARDS = [
      ['Creators › New casting list', 'The request form', 'Title, client, campaign and a short brief. Four fields to ask for creators.'],
      ['Page details', 'Column toggles', 'Age, socials, sizes, follower counts, approval. The shortlist takes shape in one view.'],
      ['Campaigns › Create campaign', 'Notifications per role', 'SMS or email for talent managers, account managers and leads, set once at creation.'],
      ['Campaign details', 'Budget to shipping', 'Budget, duration, dimension, both due dates and whether product ships.'],
    ];
    const st = stage(fig, e, 'portal', `
      <img class="pg s0" src="${im.src}" alt="" width="1440" height="1024" ${LAZY}>
      <img class="pg s1" src="${sh.casting}" alt="" width="1440" height="1024" ${LAZY}>
      <img class="pg s2" src="${sh.campaign}" alt="" width="1440" height="1027" ${LAZY}>
      ${CARDS.map(([k, tt, d]) => `<div class="stat feat"><div class="k">${k}</div><div class="t">${tt}</div><div class="d">${d}</div></div>`).join('')}
      <i class="cur"></i>`, im.alt + ' Then, zoomed in turn: ' + CARDS.map((c) => c[1] + ', ' + c[2]).join(' ') + ' Sample data.');
    const $ = (s) => st.querySelector(s);
    const s1 = $('.s1'), s2 = $('.s2'), cur = $('.cur'), cards = [...st.querySelectorAll('.feat')];
    const W = st.clientWidth, H = st.clientHeight, R = 1024 / 1440;
    /* View of a screen: centre (cx, cy) as fractions of the image at zoom z, clamped to the stage */
    const fit = (cx, cy, z0) => {
      const z = W < 420 ? Math.max(1.25, z0 * .75) : z0;   // a phone-width stage zooms less, so the caption card covers less of the screen
      const ih = W * R;
      return { x: Math.min(0, Math.max(W - W * z, W / 2 - cx * W * z)), y: Math.min(0, Math.max(H - ih * z, H / 2 - cy * ih * z)), z };
    };
    const ID = { x: 0, y: 0, z: 1 };
    const go = (img, a, b, when, dur) => t.add(img, { translateX: [a.x, b.x], translateY: [a.y, b.y], scale: [a.z, b.z], duration: dur, ease: 'inOutQuart' }, when);
    const show = (i, when) => t.add(cards[i], { opacity: [0, 1], translateY: [14, 0], duration: 500 }, when);
    const hide = (i, when) => t.add(cards[i], { opacity: [1, 0], translateY: [0, 8], duration: 300, ease: 'inQuad' }, when);
    const form = fit(.28, .26, 2.2), toggles = fit(.28, .66, 2), notif = fit(.45, .6, 1.7), notif2 = fit(.45, .62, 1.78), details = fit(.85, .47, 1.5);
    const nav = { x: .066 * W, y: .264 * W * R };   // the Creators item in the mosaic's nav
    const t = tl({ loopDelay: 700 });
    t.add(cur, { opacity: [0, 1], translateX: [W * .5, nav.x], translateY: [H * .8, nav.y], duration: 900, ease: 'inOutSine' }, 300)
      .add(cur, { scale: [1, .6], duration: 110, ease: 'inQuad' }, 1250).add(cur, { scale: [.6, 1], duration: 160 }, 1360)
      .add(cur, { opacity: [1, 0], duration: 250 }, 1500)
      .add(s1, { opacity: [0, 1], duration: 500 }, 1500);
    show(0, 1900);
    go(s1, ID, form, 2600, 1000);
    hide(0, 5200); show(1, 5500); go(s1, form, toggles, 5400, 1100);
    hide(1, 8200); show(2, 8500);
    t.add(s2, { opacity: [0, 1], duration: 600 }, 8400).add(s1, { opacity: [1, 0], duration: 600 }, 8400);
    go(s2, notif, notif2, 8400, 3200);
    hide(2, 11400); show(3, 11700); go(s2, notif2, details, 11600, 1100);
    hide(3, 14400);
    t.add(s2, { opacity: [1, 0], duration: 600, ease: 'inQuad' }, 14600);
    go(s1, toggles, ID, 15200, 1);
    return [t];
  };

  /* Courseware: slow pan over the scorecard; a card counts the usability
     score from 40 to 72 and eight clicks shrink to two. */
  S.score = (fig, e) => {
    const im = e.img;
    const st = stage(fig, e, 'pan', picture(im) + `
      <div class="stat">
        <div class="k">Usability score</div>
        <div class="big"><b class="num">40</b><span class="of">/ 100</span></div>
        <div class="bar"><i class="fill"></i></div>
        <div class="k k2">Clicks to open an eBook</div>
        <div class="dots">${'<i></i>'.repeat(8)}<b class="clk">8</b></div>
      </div>`, im.alt);
    const $ = (s) => st.querySelector(s);
    const stat = $('.stat'), fill = $('.fill'), dots = [...st.querySelectorAll('.dots i')];
    const n = count({ v: 40 }, $('.num'), 40, 72, 1600);
    const c = count({ v: 8 }, $('.clk'), 8, 2, 700);
    const t = tl({ loopDelay: 1000, onLoop: () => { n.reset(); c.reset(); } });
    t.add(stat, { opacity: [0, 1], translateY: [18, 0], duration: 600 }, 300)
      .add(dots, { opacity: [0, 1], scale: [.3, 1], duration: 300, delay: stagger(40) }, 600)
      .add(n.target, n.params, 900)
      .add(fill, { width: ['40%', '72%'], duration: 1600, ease: 'outQuart' }, 900)
      .add(dots.slice(2), { opacity: [1, 0], scale: [1, .3], duration: 320, ease: 'inQuad', delay: stagger(90, { from: 'last' }) }, 2700)
      .add(c.target, c.params, 2800)
      .add(stat, { opacity: [1, 0], translateY: [0, 10], duration: 400, ease: 'inQuad' }, 6200);
    return [pan($('img.pan')), t];
  };

  /* Selig: slow pan over the audit page; numbered pins drop in (vermilion =
     high priority) while the badge counts to 31 findings. Pin places are
     illustrative, the counts are the real ones. */
  S.pins = (fig, e) => {
    const im = e.img;
    const P = [[24, 30, 'hi'], [50, 20, ''], [72, 40, 'hi'], [38, 62, ''], [80, 72, '']];
    const st = stage(fig, e, 'pan', picture(im) +
      P.map(([x, y, k], i) => `<span class="pin ${k}" style="left:${x}%;top:${y}%"><i class="ring"></i><b>${i + 1}</b></span>`).join('') +
      `<div class="stat mini"><b class="cnt">0</b> findings · <b>12</b> high priority</div>`, im.alt);
    const pins = [...st.querySelectorAll('.pin')], rings = [...st.querySelectorAll('.ring')];
    const badge = st.querySelector('.stat');
    const n = count({ v: 0 }, st.querySelector('.cnt'), 0, 31, 1700);
    const t = tl({ loopDelay: 1000, onLoop: () => n.reset() });
    t.add(badge, { opacity: [0, 1], translateY: [-10, 0], duration: 500 }, 200)
      .add(pins, { opacity: [0, 1], scale: [0, 1], translateY: [-18, 0], duration: 650, ease: 'outBack', delay: stagger(240) }, 400)
      .add(rings, { scale: [1, 2.6], opacity: [.8, 0], duration: 900, ease: 'outQuad', delay: stagger(240) }, 800)
      .add(n.target, n.params, 400)
      .add(pins.concat(badge), { opacity: [1, 0], duration: 400, ease: 'inQuad' }, 5600);
    return [pan(st.querySelector('img.pan')), t];
  };

  /* Profitmind: no screenshot may be shown, so the preview is a drawn panel.
     Three ranked actions slide in, each reason types out, a cursor taps the
     first one. Labels are generic sample text, not client data. */
  S.rank = (fig, e, still) => {
    const rows = [['Restock', 'sells out every week', 78], ['Reprice', 'priced above the market', 56], ['Bundle', 'often bought together', 34]];
    const st = stage(fig, e, 'rank' + (still ? ' still' : ''), `<div class="panel">
        <div class="ph"><span class="ttl">Ranked actions</span><span class="chip">Sample data</span></div>
        ${rows.map(([r, w, b], i) => `<div class="rrow"><i class="hl"></i><b class="rk">${i + 1}</b><span class="rb"><span class="rt">${r}</span><span class="rw">Why: ${w}</span></span><i class="rbar"><i style="width:${b}%"></i></i></div>`).join('')}
        <i class="cur"></i>
      </div>`, 'Three ranked actions, each with its reason. Sample data.');
    if (still) return [];
    const $$ = (s) => [...st.querySelectorAll(s)];
    const panel = st.querySelector('.panel'), R = $$('.rrow'), W = $$('.rw'), B = $$('.rbar i'), K = $$('.rk');
    const cur = st.querySelector('.cur'), hl = R[0].querySelector('.hl');
    const t = tl({ loopDelay: 900 });
    t.add(panel, { opacity: [0, 1], translateY: [14, 0], duration: 600 }, 0)
      .add(R, { opacity: [0, 1], translateX: [-24, 0], duration: 650, delay: stagger(170) }, 250)
      .add(W, { maxWidth: [0, 260], duration: 700, ease: 'inOutSine', delay: stagger(170) }, 700)
      .add(B, { scaleX: [0, 1], duration: 800, delay: stagger(170) }, 600)
      .add(cur, { opacity: [0, 1], translateX: [120, 0], translateY: [90, 0], duration: 800, ease: 'inOutSine' }, 2400)
      .add(cur, { scale: [1, .7], duration: 160, ease: 'inQuad' }, 3250)
      .add(cur, { scale: [.7, 1], duration: 200, ease: 'outQuad' }, 3410)
      .add(hl, { opacity: [0, 1], duration: 250 }, 3350)
      .add(K[0], { scale: [1, 1.2], duration: 180 }, 3350)
      .add(K[0], { scale: [1.2, 1], duration: 260 }, 3530)
      .add(cur, { opacity: [1, 0], duration: 300, ease: 'inQuad' }, 4600)
      .add(panel, { opacity: [1, 0], translateY: [0, 8], duration: 400, ease: 'inQuad' }, 5600);
    return [t];
  };

  /* RobotFac3: a slow breathe on the logo, a light sweep every few seconds,
     and a Guy Fawkes mask that drops onto the robot's face plate and stays
     for five seconds of each loop (Josie's ask, 2026-09-30). The mask is a
     hand-drawn SVG; the face plate sits at about 41–58% across and 37–67%
     down the 2:1 logo. */
  const MASK = `<svg class="mask" viewBox="0 0 100 120" aria-hidden="true">
    <path class="face" d="M50 3C25 3 9 22 9 52c0 32 19 60 41 64 22-4 41-32 41-64C91 22 75 3 50 3z"/>
    <path class="shade" d="M50 3C25 3 9 22 9 52c0 32 19 60 41 64V3z"/>
    <ellipse class="blush" cx="29" cy="68" rx="9" ry="5.5"/><ellipse class="blush" cx="71" cy="68" rx="9" ry="5.5"/>
    <path class="line" d="M21 41c8-9 17-9 24-3M55 38c7-6 16-6 24 3"/>
    <path class="ink" d="M23 49c7-6 15-6 22 0-7 5-15 5-22 0zM55 49c7-6 15-6 22 0-7 5-15 5-22 0z"/>
    <path class="soft" d="M50 52l-4 14h8z"/>
    <path class="ink" d="M50 79c-6-8-17-7-24-11 2 7 12 10 19 9 2 0 4 1 5 2 1-1 3-2 5-2 7 1 17-2 19-9-7 4-18 3-24 11z"/>
    <path class="line" d="M36 87c8 5 20 5 28 0"/>
    <path class="ink" d="M46 93h8l-3 18h-2z"/>
  </svg>`;
  S.logo = (fig, e) => {
    const im = e.img;
    const st = stage(fig, e, 'logo', picture(im) + '<i class="sweep"></i>' + MASK, im.alt + ' A Guy Fawkes mask drops onto the robot for five seconds.');
    const mask = st.querySelector('.mask');
    const t = tl({ loopDelay: 1400 });
    t.add(mask, { opacity: [0, 1], scale: [.6, 1], rotate: [-10, 0], translateY: [-14, 0], duration: 550, ease: 'outBack' }, 1500)
      .add(mask, { rotate: [0, 2.5], duration: 900, ease: 'inOutSine' }, 2200)
      .add(mask, { rotate: [2.5, -2.5], duration: 1800, ease: 'inOutSine' }, 3100)
      .add(mask, { rotate: [-2.5, 0], duration: 900, ease: 'inOutSine' }, 4900)
      .add(mask, { opacity: [1, 0], scale: [1, .8], translateY: [0, 12], duration: 400, ease: 'inQuad' }, 6500);
    return [
      animate(st.querySelector('img'), { scale: [1, 1.04], duration: 7000, ease: 'inOutSine', alternate: true, loop: true, autoplay: false }),
      animate(st.querySelector('.sweep'), { translateX: ['-140%', '520%'], duration: 1500, ease: 'inOutSine', loop: true, loopDelay: 3600, autoplay: false }),
      t,
    ];
  };

  /* Cat in a Box: the icon squashes, hops, lands and wobbles, then waits. */
  S.icon = (fig) => {
    const img = fig.querySelector('img');
    if (!img) return [];
    fig.classList.add('motion', 'hop');
    const t = tl({ loopDelay: 2600 });
    t.add(img, { scaleX: [1, 1.12], scaleY: [1, .86], duration: 170, ease: 'inQuad' }, 0)
      .add(img, { scaleX: [1.12, .94], scaleY: [.86, 1.1], translateY: [0, -26], duration: 280, ease: 'outQuad' }, 170)
      .add(img, { scaleX: [.94, 1.1], scaleY: [1.1, .9], translateY: [-26, 0], duration: 260, ease: 'inQuad' }, 450)
      .add(img, { scaleX: [1.1, 1], scaleY: [.9, 1], duration: 500, ease: 'outElastic(1, .5)' }, 710)
      .add(img, { rotate: [0, -6], duration: 110, ease: 'inOutSine' }, 760)
      .add(img, { rotate: [-6, 6], duration: 160, ease: 'inOutSine' }, 870)
      .add(img, { rotate: [6, -3], duration: 130, ease: 'inOutSine' }, 1030)
      .add(img, { rotate: [-3, 0], duration: 120, ease: 'inOutSine' }, 1160);
    return [t];
  };

  /* ---------- Motion switch ----------
     One "Motion on/off" button under the theme toggle (every page with a
     sidebar) pauses every scene and the icon turns, and is remembered like
     the theme. A live change of prefers-reduced-motion does the same. */
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  let motionOn = true;
  try { motionOn = localStorage.getItem('known-motion') !== 'off'; } catch (err) {}
  const allowed = () => !!A && motionOn && !rmq.matches;
  const listeners = [];
  const sync = () => { document.documentElement.classList.toggle('motion-off', !allowed()); listeners.forEach((f) => f(allowed())); };
  const themeBtn = document.getElementById('theme');
  if (themeBtn && A) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'motion-toggle'; b.id = 'motion-toggle';
    const paint = () => { b.setAttribute('aria-pressed', String(motionOn)); b.textContent = motionOn ? 'Motion on' : 'Motion off'; };
    b.addEventListener('click', () => {
      motionOn = !motionOn;
      try { localStorage.setItem('known-motion', motionOn ? 'on' : 'off'); } catch (err) {}
      paint(); sync();
    });
    paint();
    themeBtn.insertAdjacentElement('afterend', b);
  }
  if (rmq.addEventListener) rmq.addEventListener('change', sync);
  document.documentElement.classList.toggle('motion-off', !allowed());

  /* ---------- Sidebar icons (Josie, 2026-09-30: "these icons should move") ----------
     Every square in the Project Explorer turns a quarter turn on its own
     clock, the way the lattice squares do: a rest of a few seconds, then a
     90-degree turn with the same ease. A rounded square looks the same after
     a quarter turn, so the loop never snaps, and the CSS hover turn (a CSS
     transform, which wins over this SVG transform attribute) still works.
     The loops only run while the tree is displayed (on phones it hides
     behind the Explorer button). */
  (function navIcons() {
    if (!A) return;
    const tree = document.querySelector('.tree');
    const sq = tree ? [...tree.querySelectorAll('.sq')] : [];
    if (!sq.length) return;
    const anims = sq.map((r, i) => {
      const o = { a: 0 };
      return animate(o, {
        a: [0, 90], duration: 520, ease: 'inOutCubic',
        delay: 600 + ((i * 733) % 2600), loop: true, loopDelay: 2800 + ((i * 1237) % 4600), autoplay: false,
        onUpdate: () => r.setAttribute('transform', `rotate(${o.a})`),
      });
    });
    const shown = () => tree.offsetParent !== null;
    const apply = () => { const on = allowed() && shown(); anims.forEach((x) => (on ? x.play() : x.pause())); };
    listeners.push(apply);
    const side = tree.closest('.side');
    if (side && 'MutationObserver' in window) new MutationObserver(apply).observe(side, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', apply);
    apply();
  })();

  /* ---------- Scenes ----------
     A scene is built the first time its figure scrolls into view, so a
     figure hidden by a tag filter at load is never measured at zero size.
     It is rebuilt if the stage's width has changed since, and paused while
     off screen. anime.js itself pauses when the tab is hidden. */
  const scenes = [];
  const setPlaying = (sc, on) => { (sc.players || []).forEach((p) => (on ? p.play() : p.pause())); sc.fig.classList.toggle('playing', on); };
  const buildScene = (sc) => {
    (sc.players || []).forEach((p) => { p.pause(); if (p.cancel) p.cancel(); });
    sc.players = sc.build(sc.fig, sc.e);
    sc.width = sc.fig.clientWidth;
  };
  const wake = (sc) => {
    if (!sc.seen || !allowed()) { setPlaying(sc, false); return; }
    if (!sc.players || sc.fig.clientWidth !== sc.width) buildScene(sc);
    setPlaying(sc, true);
  };
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((list) => list.forEach((x) => { const sc = x.target._scene; if (sc) { sc.seen = x.isIntersecting; wake(sc); } }), { rootMargin: '80px 0px' })
    : null;

  /* Wire one entry card to its scene. The log page does this for every card
     at load; desktop.js calls attach() for a card it puts in a window, and
     release() when that window closes. */
  function attach(art, e) {
    const build = e && e.motion && S[e.motion];
    if (!build || !art) return null;
    let fig = art.querySelector('figure.shot');
    if (!fig) {
      if (e.motion !== 'rank') return null;
      fig = document.createElement('figure');
      fig.className = 'shot';
      const cap = art.querySelector('.caption');
      cap ? art.insertBefore(fig, cap) : art.appendChild(fig);
      S.rank(fig, e, true);   // the still panel until motion is allowed and the entry is on screen
    }
    const sc = { fig, e, build, players: null, width: 0, seen: !io };
    fig._scene = sc;
    scenes.push(sc);
    if (io) io.observe(fig); else wake(sc);
    return sc;
  }
  function release(art) {
    if (!art) return;
    art.querySelectorAll('figure.shot').forEach((fig) => {
      const sc = fig._scene;
      if (!sc) return;
      if (io) io.unobserve(fig);
      (sc.players || []).forEach((p) => { p.pause(); if (p.cancel) p.cancel(); });
      const i = scenes.indexOf(sc);
      if (i > -1) scenes.splice(i, 1);
      fig._scene = null;
    });
  }
  (window.ENTRIES || []).forEach((e) => attach(document.getElementById('e-' + entryId(e)), e));
  listeners.push(() => scenes.forEach(wake));
  window.MOTION = { attach, release, allowed };

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => scenes.forEach((sc) => { if (sc.players && sc.fig.clientWidth !== sc.width) wake(sc); }), 250); });
})();
