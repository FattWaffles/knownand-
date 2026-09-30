/* Hero H03C "Bitmap composite" (spec: website/hero-versions/H03C-bitmap-composite/SPEC.md).
   Three print layers on one clock:
     1. #heroEcho (behind): HalftoneHero preset 'echo', round magenta dots on a hex grid, smeared down.
        It has no timer of its own: PixelHero's onRender drives it, so it blooms and refocuses in lockstep.
     2. Edge plate: reflex blue full cells, the word moved +1,+1 under the ink. Slips and thins on DISSOLVE.
     3. The solid ink word (Archivo 800, wdth 112; 75 on phones) with full-cell bits, and a vermilion cursor.
   Freeze a frame with ?hero=hold|dissolve|void|build&heroWord=TRUSTED. */
(function () {
  const $ = (s) => document.querySelector(s);
  const css = (name, fb) => (getComputedStyle(document.documentElement).getPropertyValue(name) || fb).trim() || fb;
  const INK = css('--ink', '#000000');
  const BLUE = css('--blue', '#1B34F0');
  const VERMILION = css('--verm', '#CE280A');
  const MAGENTA = css('--mag', '#B4009C');

  const BITS = [
    { color: 'ink', weight: 0.3 }, { color: BLUE, weight: 0.25 },
    { color: VERMILION, weight: 0.25 }, { color: MAGENTA, weight: 0.2 }
  ];
  const HERO_WORDS = ['TRUSTED', 'UNDERSTOOD', 'OBVIOUS', 'RECOGNIZED', 'COVETED', 'RELATABLE'];

  const heroEcho = window.HalftoneHero ? window.HalftoneHero.mount($('#heroEcho'), {
    preset: 'echo', words: HERO_WORDS, ink: INK, pigment: MAGENTA
  }) : null;

  let heroWord = null, lastCell = 0;
  heroWord = window.PixelHero ? window.PixelHero.mount($('#particleWord'), {
    preset: 'bitmap', words: HERO_WORDS,
    accessibleEl: $('#particleWordAccessible'),
    pauseButton: $('#heroPause'), labels: { pause: 'Pause motion', play: 'Play motion' },
    family: 'Archivo', weight: 800, stretch: 112,
    ink: INK, pigment: VERMILION, // pigment = the cursor block
    padCells: 0, dots: null, seam: 0, bits: 'cell', palette: BITS, wordColor: 'ink',
    // exterior: the plate is the word's outer stair-step only, so it never closes a counter at 4px cells
    edgePlate: { color: BLUE, source: 'offset', offset: [1, 1], slip: 1, thin: 0.7, exterior: true },
    onRender: (f) => {
      if (heroEcho) heroEcho.follow(f.phase, f.tick, f.index, f.prev);
      if (heroWord && heroWord.state().cell !== lastCell) alignDots(); // desktop 8px ↔ phone 4px cells
    },
    void: { density: 9 },
    mobileBelow: 721,
    mobile: { stretch: 75, seam: 0, void: { density: 34 }, dissolve: { ambient: 0.38 } }
  }) : null;

  /* The lattice starts at the field's top-left corner. Put the band's dot grid on it: a dot in the middle of
     every third 8px cell, or inside one 4px cell (shifted 2px) when the engine is in phone mode. */
  function alignDots() {
    const stage = $('.stage'), field = $('.hero-field');
    if (!stage || !field) return;
    lastCell = heroWord ? heroWord.state().cell : 8;
    const shift = lastCell < 8 ? -2 : 0;
    const s = stage.getBoundingClientRect(), f = field.getBoundingClientRect();
    const wrap = (v) => (((Math.round(v) % 24) + 24) % 24) + 'px';
    stage.style.setProperty('--dot-x', wrap(f.left - s.left + shift));
    stage.style.setProperty('--dot-y', wrap(f.top - s.top + shift));
  }
  alignDots();
  window.addEventListener('resize', alignDots);
  window.addEventListener('load', alignDots);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignDots).catch(() => {});
})();
