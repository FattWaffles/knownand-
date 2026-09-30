/* All content for the "ships" version lives here. Edit this file only.
   Built 2026-09-30 in the style of pcships.com: a build-in-public dashboard.
   Copy rule (Josie, 2026-09-30): direct, research-paper register. State
   what was done and what resulted. No "x isn't y, it's z" constructions.

   >>> PLACEHOLDERS TO SET, JOSIE <<<
   1. In BUILDING, every `started` date/time and every `progress` % is a
      guess so the live clocks and bars have something to show. Change them
      to the real ones. Dates are local time, YYYY-MM-DDTHH:MM:SS.
   2. SECURITY.certs is empty. Add each certification as
      { name: '...', issuer: '...', year: '2026', url: '...' } and the
      Certifications row appears under the security grid.

   VIEWER points at the Figma-style case-study viewer; deep links are #/<id>.
   CASES points at the log site (live: /case-studies/). */

const VIEWER = 'case-study-viewer/index.html';
/* CASES is the rest of the site (the log: dated work, CV, blog). Josie,
   2026-09-30: this page is the home page only; clicking into case studies
   opens the rest. Shipped rows link straight into the viewer's studies. */
const CASES = 'case-studies/';
const A = 'assets/';
const GH = 'https://github.com/FattWaffles';

window.SITE = {
  domain: 'knownand.com',
  name: 'Josie Rigali',
  studio: 'Known, and',
  role: 'Brand Systems Designer + Creative Technologist',
  nav: [
    { label: 'Work', url: '#work' },
    { label: 'Security', url: '#security' },
    { label: 'About', url: '#about' },
    { label: 'Case studies', url: CASES },
  ],
  headline: 'I build brands that behave like products',
  sub: 'Identity, interfaces, motion, 3D, research and emerging technology, brought together as one system. <a href="' + CASES + '">Known, and</a> is my studio. I share the work and the numbers as I go.',
  /* Hero button. Josie, 2026-09-30: "book a meeting", leading to the
     research + development inbox. Best practice is a booking page; when one
     exists (Cal.com, Calendly), put its URL here and the button opens it. */
  cta: { label: 'Book a meeting', url: 'mailto:rigaliresearchdevelopment@gmail.com?subject=' + encodeURIComponent('Book a meeting with Known, and') },

  /* Floating program icons either side of the hero. `icon` names a drawing
     in site.js (claude, figma, photoshop, illustrator, aftereffects,
     procreate, github, solana, autocad, godot, shopify). `side` l = left
     column, top to bottom; r = bottom-right cluster, outer to inner. */
  stack: [
    { label: 'Claude',        icon: 'claude',       side: 'l' },
    { label: 'Figma',         icon: 'figma',        side: 'l' },
    { label: 'Photoshop',     icon: 'photoshop',    side: 'l' },
    { label: 'Illustrator',   icon: 'illustrator',  side: 'l' },
    { label: 'After Effects', icon: 'aftereffects', side: 'l' },
    { label: 'Procreate',     icon: 'procreate',    side: 'l' },
    { label: 'GitHub',        icon: 'github',       side: 'r' },
    { label: 'Solana',        icon: 'solana',       side: 'r' },
    { label: 'AutoCAD',       icon: 'autocad',      side: 'r' },
    { label: 'Godot',         icon: 'godot',        side: 'r' },
    { label: 'Shopify',       icon: 'shopify',      side: 'r' },
  ],

  links: [
    { label: 'Case studies', url: CASES },
    { label: 'Site source', url: GH + '/knownand-' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/josephinerigali/' },
    { label: 'GitHub', url: GH },
    { label: 'Email', url: 'mailto:rigaliresearchdevelopment@gmail.com' },
  ],
};

/* Brand call-outs, counted in the About stats. Courseware publisher left out
   on purpose (name withheld). */
window.BRANDS = [
  'Estée Lauder', 'Clinique', 'Neutrogena', 'Kenvue', 'Bath & Body Works',
  'L\'Oréal USA', 'SalonCentric', 'Conversant', 'AdParlor',
  'It\'s a 10 Haircare', 'Ascent Protein', 'Dr Brew Kombucha', 'FoodKick',
  'Selig Group', 'Sapphire Studios', 'Profitmind',
];

/* Currently building. Order is display order. `note` is optional.
   `social` is a list of { kind, url, label? } shown as tags on the row; kinds
   drawn in site.js: github, x, linkedin, discord, web, play, appstore, itch.
   Only real, live links go here (2026-09-30: robotfac3.com does not resolve
   yet, so it is left out). Shipped rows take the same field. */
window.BUILDING = [
  {
    title: 'RobotFac3', kind: 'Browser concept',
    text: 'A browser for the web, Web3 and AI agents with one shared security core. Zero-dependency prototype for Colosseum. Product vision, UI direction and community on a team of three.',
    started: '2026-09-01T09:00:00',      /* PLACEHOLDER */
    progress: 70,                         /* PLACEHOLDER */
    note: 'Hackathon entries close 12 Oct 2026',
    social: [{ kind: 'github', url: GH + '/ROBOTFAC3-human-agent-browser-w3-w2' }],
  },
  {
    title: 'Personal agent harnesses', kind: 'Research + build',
    text: 'Building and researching personal harnesses for AI agents: the rules, tools, memory and review steps an agent works inside, tested on my own projects first.',
    started: '2026-09-20T09:00:00',      /* PLACEHOLDER */
    progress: 20,                         /* PLACEHOLDER */
  },
  {
    title: 'Cat in a Box', kind: 'Android game',
    text: 'A block puzzle made of cats I drew, built in Godot with AI help. Design, art and build by me. Signed Android test build.',
    started: '2026-07-14T10:00:00',      /* PLACEHOLDER */
    progress: 80,                         /* PLACEHOLDER */
  },
  {
    title: 'Websites + CRM with Veruthia', kind: 'Web + CRM',
    text: 'Brand and design from Known, and; development and security from Veruthia. For home-service contractors.',
    started: '2026-09-08T09:30:00',      /* PLACEHOLDER */
    progress: 30,                         /* PLACEHOLDER */
  },
  {
    title: 'Pet wellness launch', kind: 'Shopify theme',
    text: 'A custom Shopify theme built around one flagship product, a daily food topper for dogs.',
    started: '2026-09-15T09:00:00',      /* PLACEHOLDER */
    progress: 40,                         /* PLACEHOLDER */
  },
  {
    title: 'Strategist website', kind: 'Website',
    text: 'A brand-led 2026 website for a growth and exit strategist.',
    started: '2026-09-22T09:00:00',      /* PLACEHOLDER */
    progress: 25,                         /* PLACEHOLDER */
  },
];

/* Shipped. `sub` reads as an abstract: context, method, result.
   `stat` is the big figure, `label` the line under it. */
window.SHIPPED = [
  { title: 'Quote On', kind: 'Android app', stat: '50', label: 'screens designed', url: VIEWER + '#/instaquote',
    sub: 'Android app for tradespeople. A spoken job description becomes a priced draft quote. Designed the flows, the AI chat behaviour, 50 screens and a starter component set. The AI requests a rate when none is on file.' },
  { title: 'Sapphire Studios', kind: 'Web platform', stat: '4', label: 'products: two portals, style guide, login', url: VIEWER + '#/sapphire',
    sub: 'Agency and creator portals for a TikTok Marketing Partner: casting, campaigns, scripts and payments in one system. Led design for both portals, the shared style guide and the v2 login.' },
  { title: 'Profitmind', kind: 'Research', stat: '3', label: 'ranked actions, each with its reason', url: VIEWER + '#/profitmind',
    sub: 'UX and AI research for a retail stock-and-pricing platform. Friction workshops and prompt research, then a redesign around three ranked actions with the reason for each.' },
  { title: 'Legacy courseware turnaround', kind: 'Research', stat: '40 → 72', label: 'usability score; 8 clicks to 2', url: VIEWER + '#/edu',
    sub: 'UX research across three learning platforms for an education publisher, name withheld. Interviews, usability tests, accessibility audits and the scorecard leadership tracked. Opening an eBook went from eight clicks to two.' },
  { title: 'Selig Sealing UX audit', kind: 'UX audit', stat: '31', label: 'findings, 12 high priority', url: VIEWER + '#/selig',
    sub: 'Page-by-page audit of a 130-year-old manufacturer\'s lead-generation site. 31 findings, 12 high priority, ranked for direct hand-off to developers. Reusable audit kit built in Figma.' },
  { title: 'Neutrogena.com rebrand', kind: 'Brand + web', stat: 'ADA', label: 'compliant design system',
    sub: 'Lead designer at Kenvue: creative direction, e-commerce and the design system, built to ADA and North American brand standards.' },
  { title: 'Ad-platform style guides', kind: 'Brand', stat: '3', label: 'brand guides + motion kits',
    sub: 'Motion, icons and templates for Bath & Body Works email, social and landing pages. Brand guides for Conversant and AdParlor.' },
  { title: 'Salon pro campaigns', kind: 'Campaigns', stat: '2', label: 'years, tuned with analytics',
    sub: 'Art direction, email and motion for SalonCentric (L\'Oréal USA) across email, web, social and decks, tuned with analytics.' },
  { title: 'Beauty email + landing pages', kind: 'Campaigns', stat: '3', label: 'brands, redesigns + seasonal',
    sub: 'Email, landing pages and social for Estée Lauder, Clinique and FoodKick redesigns and seasonal campaigns.' },
];

window.LEARNING = {
  eyebrow: 'Learning in public',
  title: 'Still learning. Always building.',
  text: 'I share what I am learning and building, including the tools I am upgrading each day.',
  items: [
    { glyph: 'AI', name: 'AI agents', text: 'Defining what the agent may do and what it must ask first' },
    { glyph: 'W3', name: 'Web3 + wallets', text: 'One security core for web, Web3 and agents' },
    { glyph: 'Gd', name: 'Godot', text: 'Shipping a game I designed and drew' },
    { glyph: '3D', name: '3D + motion', text: 'Brand systems that move' },
    { glyph: 'Sh', name: 'Shopify', text: 'Themes built around one flagship product' },
  ],
  steps: ['Research', 'Design', 'Build', 'Ship'],
};

/* Security. Josie, 2026-09-30: "less sales and more telling how much I
   understand, like custom security-first builds for crypto and vibe coded
   software." Each cell states a threat and the design answer, drawn from
   real work: RobotFac3's security core (its public README and the
   "fix all 35 findings from the adversarial review" commit), the Quote On
   guardrail, and the client baseline in security-dev-outline/outline.md. */
window.SECURITY = {
  eyebrow: 'Security',
  title: 'Security-first builds for crypto and vibe-coded software.',
  text: 'Most of what I build now touches wallets, agents or code an AI helped write. Each fails in its own way, and the design has to account for that before the first screen is drawn.',
  items: [
    { name: 'Wallets and signing', text: 'A person approves every signature. The app shows what a transaction does in plain words before it is signed, holds no keys and sends nothing on its own. In RobotFac3 the wallet sends; the browser only prepares.' },
    { name: 'Agents with a payment policy', text: 'An agent that can pay gets a strict grammar for payment sentences, a leak check and an injection detector. Anything outside the grammar stops and asks a person.' },
    { name: 'AI that asks', text: 'Quote On: with no rate on file, the AI requests one. Rules like that are designed into the flow, written down and tested like any other feature.' },
    { name: 'Vibe-coded, then reviewed', text: 'AI-written code ships after an adversarial review and regression tests. RobotFac3 v0.2: 35 findings from one review, all fixed, each covered by a test.' },
    { name: 'Fewer strangers in the code', text: 'Hand-written Solana layer, standard-library relay, no npm, no CDN, no web fonts. The relay allow-lists files and RPC methods, refuses wrong Host headers and cross-origin posts, and never reuses a connection.' },
    { name: 'Client baseline', text: 'Every client build starts the same way: MFA and domain lock, SPF, DKIM and DMARC, per-client isolation, backups and a written incident plan. The client owns the domain, the data and the code.' },
  ],
  /* Certifications: add rows here and they render below the grid.
     { name: 'Name', issuer: 'Issuer', year: '2026', url: 'https://...' } */
  certs: [],
};

window.ABOUT = {
  eyebrow: 'About me',
  title: 'I build brands as systems, and show the work as it happens.',
  paras: [
    'I am Josie Rigali, the Brand Systems Designer and Creative Technologist behind Known, and. I design brands that behave like products: identity, interfaces, motion, 3D, research and emerging technology as one system.',
    'Before Known, and I spent 10+ years designing inside beauty, retail, education and AI companies, from email and motion to UX research and design systems. Off the clock I build games and hackathon projects.',
  ],
  /* `n` can be a string or 'auto:building' / 'auto:brands' (counted live) */
  stats: [
    { n: '10+', label: 'years designing' },
    { n: 'auto:brands', label: 'brands worked with' },
    { n: 'auto:building', label: 'projects in progress' },
  ],
};

window.NEXT = {
  eyebrow: 'Next from Known, and',
  title: 'Something new is cooking.',
  text: 'Tap-to-open NFC business cards first. The long game is a walk-in brand booth. Both are on the bench for 2026–27.',
  pill: 'Stay tuned. Make it known.',
};
