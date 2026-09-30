/* All content for the log site lives here. Edit this file only.
   Dates are shown as written. Leave `date` as 'Contract' for the courseware
   entry: Josie asked that the dates she worked there stay off the site.
   VIEWER points at the Figma-style case-study viewer; deep links are #/<id>. */

const VIEWER = '../case-study-viewer/index.html';
const A = 'assets/';

window.SITE = {
  name: 'Josie Rigali',
  intro: [
    'I design brands that behave like products: identity, interfaces, motion, 3D, research and emerging technology, brought together as one system. <a href="' + VIEWER + '">Known</a> is my studio.',
    'Before Known I spent 10+ years designing inside beauty, retail, education and AI companies, from email and motion to UX research and design systems.',
    'Off the clock I build games and hackathon projects: a block puzzle made of cats I drew, and a browser concept for the web, Web3 and AI agents.',
  ],
  links: [
    { label: 'LinkedIn', short: 'LN', url: 'https://www.linkedin.com/in/josephinerigali/' },
    { label: 'GitHub', short: 'GH', url: 'https://github.com/FattWaffles' },
    { label: 'Email', short: 'Mail', url: 'mailto:info@knownand.com' },
  ],

  /* Brand call-outs (Josie, 2026-09-30: "a list of all brand call outs that
     I worked for"). Shown under the intro as one row of small-caps names,
     in this order. The courseware publisher is left out on purpose: its
     entry says the name is withheld. */
  brands: [
    'Estée Lauder', 'Clinique', 'Neutrogena', 'Kenvue', 'Bath & Body Works',
    'L\'Oréal USA', 'SalonCentric', 'Conversant', 'AdParlor',
    'It\'s a 10 Haircare', 'Ascent Protein', 'Dr Brew Kombucha', 'FoodKick',
    'Selig Group', 'Sapphire Studios', 'Profitmind',
  ],

  /* Hero, copied from rosekuan.com: a grey name line over a dark role line in
     tight tracking, a long pause, then three hairline rows of small caps.
     The left labels decode in from *$&%# glyphs on load. */
  hero: { name: 'Josie Rigali', role: 'Brand Systems Designer + Creative Technologist' },
  /* Rows, left label then right value:
     - `value`  plain text
     - `clock`  a live HH:MM:SS. Put an IANA zone here ('America/New_York') and
                change the label to 'In <city>'. Empty = the visitor's own zone.
     - `links`  the SITE.links above, shown by `short` with an arrow */
  meta: [
    { label: 'Brand systems', value: 'Identity · Product · Motion · 3D · AI' },
    { label: 'In the studio', clock: '' },
    { label: 'Online', links: true },
  ],
};

/* Tag colours use only the palette: blue, vermilion, magenta and black. */
window.TAGS = [
  { id: 'web3', label: 'web3 + blockchain', color: 'solid' },
  { id: 'product', label: 'product design', color: 'blue' },
  { id: 'research', label: 'research', color: 'mag' },
  { id: 'brand', label: 'brand', color: 'verm' },
  { id: 'web', label: 'web', color: 'ink' },
];

/* Newest first, except the web3 projects, which sit at the top (Josie,
   2026-09-30: "put web3 projects at the top"). `img` is one image; `imgs` is a row of phone screens.
   `small` shows an icon at its natural size instead of full width.
   `motion` names the animated preview scene built by motion.js (chat, portal,
   tiles, phones, score, pins, rank, logo, icon); leave it out for a plain image.
   `shots` holds extra screenshots a scene needs beyond `img`. */
window.ENTRIES = [
  {
    date: 'September 2026', tag: 'web3', title: 'RobotFac3',   /* static logo: Josie undid the 'logo' motion preview 2026-09-30 */
    text: 'A browser concept for the web, Web3 and AI agents, with one set of security rules for all three. I lead product vision, UI direction and community on a team of three. The built-in agent is scripted for now, and a person approves every signature. Entries for the hackathon close Oct 12.',
    img: { src: A + 'robotfac3-logo.jpg', alt: 'RobotFac3 wordmark around a robot head, off-white and red on black.', w: 1200, h: 600 },
    caption: 'Logo: AI-generated draft.',
  },
  {
    date: 'September 2026', tag: 'web3', title: 'Cat in a Box', motion: 'icon',
    text: 'A relaxing block puzzle made of cats I drew. Drag cat pieces onto an 8x8 grid to clear rows and columns; when a line cuts through a big cat, the leftover cells break into kittens. I designed the game, drew the art and built it in Godot with AI help. It is a signed Android test build, not on a store yet.',
    img: { src: A + 'catblast-icon.png', alt: 'App icon: a grumpy orange and purple cat in an open cardboard box.', w: 560, h: 560, small: true },
  },
  {
    date: '2026–27', tag: 'brand', title: 'NFC cards, then a booth',
    text: 'Tap-to-open business cards first. The long game is a walk-in brand booth.',
  },
  {
    date: 'September 2026', tag: 'web', title: 'Websites + CRM with Veruthia',
    text: 'Brand and design from Known, development and security from Veruthia, for contractors. In progress.',
  },
  {
    date: 'September 2026', tag: 'web', title: 'Pet wellness launch',
    text: 'A custom Shopify theme built around one flagship product, a daily food topper for dogs. In progress.',
  },
  {
    date: 'September 2026', tag: 'web', title: 'Strategist website',
    text: 'A brand-led 2026 website for a growth and exit strategist. In progress.',
  },
  {
    date: '2026', tag: 'product', title: 'Quote On', url: VIEWER + '#/instaquote', motion: 'chat',
    text: 'An Android app where a tradie talks through a job and gets a priced quote draft in minutes. I designed the flows, the AI chat behaviour, 50 screens and the starter component set. One guardrail runs through it: with no rate on file, the AI asks. It never guesses a price.',
    imgs: [
      { src: A + 'chat-start.png', alt: 'Chat start screen with four example jobs.' },
      { src: A + 'chat-guardrail.png', alt: 'The AI has no rate on file for this job and asks for one instead of guessing.' },
      { src: A + 'chat-draft.png', alt: 'A draft quote card inside the chat, with assumptions listed.' },
    ],
    caption: 'Sample job, customer and figures.',
  },
  {
    date: '2025–26', tag: 'research', title: 'Profitmind', url: VIEWER + '#/profitmind', motion: 'rank',
    text: 'UX and AI research for a platform that tells retailers what to stock and how to price it. The AI found the money; buyers could not see why, so they did not act. I ran friction workshops and prompt research, then led a redesign around three ranked actions with the reason for each. The case-study screens are redrawn with sample data.',
  },
  {
    date: '2024–25', tag: 'product', title: 'Sapphire Studios', url: VIEWER + '#/sapphire', motion: 'portal',
    text: 'One portal for a creator agency, an official TikTok Marketing Partner: casting, campaigns, scripts and payments in one place. I led design for the agency portal, the creator portal, the shared style guide and the v2 login.',
    img: { src: A + 'creators-mosaic.png', alt: 'Creators page in the agency portal, shown as a mosaic of cards.', w: 1440, h: 1024 },
    shots: { casting: A + 'casting-list.png', campaign: A + 'create-campaign.png' },
    caption: 'Sample data on the screens.',
  },
  {
    date: 'Contract', tag: 'research', title: 'Legacy courseware turnaround', url: VIEWER + '#/edu', motion: 'score',
    text: 'UX research across three learning platforms for a major education publisher, name withheld. Interviews, usability tests and accessibility audits, then the scorecard leadership used to track it. Eight clicks to open an eBook became two, and the usability score the scorecard tracks went from 40 to 72.',
    img: { src: A + 'scorecard-v1.jpg', alt: 'Usability scorecard summary page with a what-this-means line under each chart.', w: 1400, h: 1283 },
    caption: 'Real figures. Company and product names withheld.',
  },
  {
    date: '2023–24', tag: 'brand', title: 'Neutrogena.com rebrand',
    text: 'Lead designer for the NTG.com rebrand at Kenvue: creative direction, e-commerce and the design system, built to ADA and North American brand standards.',
  },
  {
    date: '2022–23', tag: 'brand', title: 'Ad-platform style guides',
    text: 'Motion, icons and templates for Bath & Body Works email, social and landing pages, plus brand guides for Conversant and AdParlor.',
  },
  {
    date: '2022', tag: 'research', title: 'Selig Sealing UX audit', url: VIEWER + '#/selig', motion: 'pins',
    text: 'A page-by-page audit of a 130-year-old manufacturer\'s lead-generation site: 31 findings, 12 high priority, ranked so the client could hand them straight to developers. I also built a reusable audit kit in Figma.',
    img: { src: A + 'navigation.png', alt: 'Audit page for the site navigation, with findings and priority labels.', w: 595, h: 921 },
  },
  {
    date: '2020–22', tag: 'brand', title: 'Salon pro campaigns',
    text: 'Art direction, email and motion for SalonCentric (L\'Oréal USA): emails, web, social, decks and motion for the professional salon market, tuned with analytics.',
  },
  {
    date: '2017–20', tag: 'brand', title: 'Beauty email + landing pages',
    text: 'Email, landing pages and social for Estée Lauder, Clinique and FoodKick brand redesigns and seasonal campaigns.',
  },
];

/* CV page. Employment rows, highlights, selected work. */
window.CV = {
  employment: [
    { org: 'Known', role: 'Founder, brand + product design', dates: 'Now' },
    { org: 'Profitmind', role: 'UX + AI researcher (contract)', dates: '2025 – 2026' },
    { org: 'Sapphire Studios', role: 'Design lead', dates: '2024 – 2025' },
    { org: 'Kenvue', role: 'Lead designer, Neutrogena.com rebrand', dates: '2023 – 2024' },
    { org: 'Bath & Body Works', role: 'Motion, iconography, templates', dates: '2022 – 2023' },
    { org: 'Selig Group', role: 'UX auditor', dates: '2022' },
    { org: 'Cengage', role: 'UX researcher (contract)', dates: '' },
    { org: 'SalonCentric', role: 'Art direction, email, motion', dates: '2020 – 2022' },
    { org: 'Freelance', role: 'UX/UI for It\'s a 10 Haircare, Ascent Protein, Dr Brew Kombucha', dates: '2018 – 2023' },
    { org: 'Estée Lauder, Clinique, FoodKick', role: 'Email, landing pages, motion', dates: '2017 – 2020' },
  ],
  highlights: {
    text: 'My reach is wide for a designer. I research, I design the system and the screens, and I ship the brand work around them. If something needs doing, I will learn the tool and do it.',
    points: [
      'Led design for a creator agency portal that replaced spreadsheets, email and DMs with one place to cast, brief and pay creators.',
      'Researched how retail buyers read AI recommendations, then redesigned around three ranked actions with the reason for each.',
      'Cut a courseware eBook from eight clicks to two and built the scorecard leadership used to track usability from 40 to 72.',
      'Designed an AI quoting flow with one hard rule: no rate on file means the AI asks. It never invents a price.',
    ],
  },
  work: [
    { label: 'Sapphire Studios: agency + creator portals', url: VIEWER + '#/sapphire' },
    { label: 'Quote On: AI quoting app for tradies', url: VIEWER + '#/instaquote' },
    { label: 'Profitmind: UX + AI research', url: VIEWER + '#/profitmind' },
    { label: 'Legacy courseware turnaround', url: VIEWER + '#/edu' },
    { label: 'Selig Sealing: UX audit', url: VIEWER + '#/selig' },
  ],
  tools: 'Figma, FigJam, Shopify, Godot, Claude, HTML/CSS/JS.',
};
