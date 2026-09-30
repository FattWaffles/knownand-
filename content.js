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

   CASES points at the log site (live: /case-studies/); an entry there is
   reached with #e-<slug of its title>. The Figma-style viewer the shipped
   rows used to open was retired on 2026-09-30. */

/* CASES is the rest of the site (the log: dated work, CV, blog). Josie,
   2026-09-30: this page is the home page only; clicking into case studies
   opens the rest. Shipped rows link to the matching log entry. */
const CASES = 'case-studies/';
const A = 'assets/';
const GH = 'https://github.com/FattWaffles';

window.SITE = {
  domain: 'knownand.com',
  name: 'Josie Rigali',
  studio: 'Known, and',
  /* The top-left mark reads "Known, and <word>" and the word cycles (Josie,
     2026-09-30). The list is the viewer's original six plus her Valued + Seen;
     prune or reorder here. */
  brandWords: ['Trusted', 'Seen', 'Understood', 'Valued', 'Recognized', 'Coveted', 'Relatable', 'Obvious'],
  role: 'Brand incubator and systems design engineer',   /* Josie, 2026-09-30 */
  nav: [
    { label: 'Work', url: '#work' },
    { label: 'Security', url: '#security' },
    { label: 'About', url: '#about' },
    /* Pricing left the nav and footer 2026-09-30 (Josie: "hide the pricing
       from the main site"). The page sits at a private address, sent to
       clients directly; see HANDOFF.md. */
    { label: 'Case studies', url: CASES },
    /* quick links (Josie, 2026-09-30): icon only, label is the tooltip + screen-reader name */
    { label: 'GitHub', url: GH, icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/josephinerigali/', icon: 'linkedin' },
  ],
  headline: 'I build brands that behave like products',
  sub: 'Identity, interfaces, motion, 3D, research and emerging technology, brought together as one system. <a href="' + CASES + '">Known, and</a> is my lab art collective. Innovation from a unique perspective. Follow below for my active work and the numbers as I go through design and development sprint cycles.',
  /* Hero button. Josie, 2026-09-30: "book a meeting", leading to the
     research + development inbox. Best practice is a booking page; when one
     exists (Cal.com, Calendly), put its URL here and the button opens it. */
  cta: { label: 'Book a meeting', url: 'https://calendly.com/rigaliresearchdevelopment' },   /* Calendly (Josie, 2026-09-30: "should open to calendly"); calendly.com/rigalij is her other page */

  /* Floating program icons either side of the hero. `icon` names a drawing
     in site.js (claude, figma, photoshop, illustrator, aftereffects,
     procreate, github, solana, autocad, godot, shopify, blender, chatgpt, mistral,
     alephalpha, cohere, qwen, kimi, deepseek, ethereum, zcash, monero, and
     twelve more coins that are drawn but not listed: bitcoin, cardano, xrp,
     litecoin, dogecoin, polkadot, avalanche, chainlink, polygon, bnb, tron,
     stellar, sui). `side` l = left column, top to bottom;
     r = bottom-right cluster, outer to inner. */
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
    { label: 'Blender',       icon: 'blender',      side: 'r' },
    /* AI models used in ideation (Josie, 2026-09-30); the privacy page
       (section 4, "When models are used") and the article page list the
       same set, so keep the three in step. */
    { label: 'ChatGPT',       icon: 'chatgpt',      side: 'l' },
    { label: 'Mistral',       icon: 'mistral',      side: 'r' },
    { label: 'Aleph Alpha',   icon: 'alephalpha',   side: 'l' },
    { label: 'Cohere',        icon: 'cohere',       side: 'r' },
    { label: 'Qwen',          icon: 'qwen',         side: 'l' },
    { label: 'Kimi K3',       icon: 'kimi',         side: 'r' },
    { label: 'DeepSeek',      icon: 'deepseek',     side: 'l' },
    /* Chains and coins. Sixteen went in 2026-09-30 ("any major crypto coin
       but base"); the same night Josie cut it to these four ("take out a
       lot of the crypto coins but solana, zcash, eth and monero"). The
       other twelve drawings are still in site.js (ICONS), so any of them
       comes back with one line here. Base is left out on purpose. Solana
       sits above with the tools. */
    { label: 'Ethereum',      icon: 'ethereum',     side: 'l' },
    { label: 'Zcash',         icon: 'zcash',        side: 'r' },
    { label: 'Monero',        icon: 'monero',       side: 'r' },
  ],

  links: [
    { label: 'Case studies', url: CASES },
    { label: 'Open roles', url: 'roles.html' },
    { label: 'Using AI', url: 'using-ai-as-a-digital-artist-and-researcher.html' },
    { label: 'Site source', url: GH + '/knownand-' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/josephinerigali/' },
    { label: 'GitHub', url: GH },
    { label: 'Email', url: 'mailto:rigaliresearchdevelopment@gmail.com' },
    { label: 'Terms', url: 'terms.html' },
    { label: 'Privacy', url: 'privacy.html' },
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
    title: 'What is crypto: more than a currency', kind: 'Article series, part 1',
    text: 'Writing article 1 of a plain-language series on what a wallet, a signature and a chain actually do, drawn from building RobotFac3.',
    started: '2026-09-28T09:00:00',      /* PLACEHOLDER */
    progress: 15,                         /* PLACEHOLDER */
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
  { title: 'Quote On', kind: 'Android app', stat: '50', label: 'screens designed', url: CASES + '#e-quote-on',
    sub: 'Android app for tradespeople. A spoken job description becomes a priced draft quote. Designed the flows, the AI chat behaviour, 50 screens and a starter component set. The AI requests a rate when none is on file.' },
  { title: 'Sapphire Studios', kind: 'Web platform', stat: '4', label: 'products: two portals, style guide, login', url: CASES + '#e-sapphire-studios',
    sub: 'Agency and creator portals for a TikTok Marketing Partner: casting, campaigns, scripts and payments in one system. Led design for both portals, the shared style guide and the v2 login.' },
  { title: 'Profitmind', kind: 'Research', stat: '3', label: 'ranked actions, each with its reason', url: CASES + '#e-profitmind',
    sub: 'UX and AI research for a retail stock-and-pricing platform. Friction workshops and prompt research, then a redesign around three ranked actions with the reason for each.' },
  { title: 'Legacy courseware turnaround', kind: 'Research', stat: '40 → 72', label: 'usability score; 8 clicks to 2', url: CASES + '#e-legacy-courseware-turnaround',
    sub: 'UX research across three learning platforms for an education publisher, name withheld. Interviews, usability tests, accessibility audits and the scorecard leadership tracked. Opening an eBook went from eight clicks to two.' },
  { title: 'Selig Sealing UX audit', kind: 'UX audit', stat: '31', label: 'findings, 12 high priority', url: CASES + '#e-selig-sealing-ux-audit',
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
    /* `url` makes the name a link (Josie, 2026-09-30: "add it to the website") */
    { glyph: 'Eth', name: 'Using AI, in the open', text: 'Where the models enter my work, where they stop, and the rules I hold to', url: 'using-ai-as-a-digital-artist-and-researcher.html' },
  ],
  steps: ['Research', 'Design', 'Build', 'Ship'],
};

/* Security. Josie, 2026-09-30: less sales, more showing how much she
   understands: custom security-first builds for fintech, crypto and
   AI-assisted software. Each cell states a threat and the design answer, drawn from
   real work: RobotFac3's security core (its public README and the
   "fix all 35 findings from the adversarial review" commit), the Quote On
   guardrail, and the client baseline in security-dev-outline/outline.md. */
window.SECURITY = {
  eyebrow: 'Security',
  title: 'Security-first builds for fintech, crypto and AI-assisted software.',
  text: 'Most of what I build now touches money, wallets, agents or code an AI helped write. Each fails in its own way, and the design has to account for that before the first screen is drawn.',
  items: [
    { name: 'Wallets and signing', text: 'A person approves every signature. The app shows what a transaction does in plain words before it is signed, holds no keys and sends nothing on its own. In RobotFac3 the wallet sends; the browser only prepares.' },
    { name: 'Agents with a payment policy', text: 'An agent that can pay gets a strict grammar for payment sentences, a leak check and an injection detector. Anything outside the grammar stops and asks a person.' },
    { name: 'AI that asks', text: 'Quote On: with no rate on file, the AI requests one. Rules like that are designed into the flow, written down and tested like any other feature.' },
    { name: 'Written with AI, then reviewed', text: 'AI-written code ships after an adversarial review and regression tests. RobotFac3 v0.2: 35 findings from one review, all fixed, each covered by a test.' },
    { name: 'Fewer strangers in the code', text: 'Hand-written Solana layer, standard-library relay, no npm, no CDN, no web fonts. The relay allow-lists files and RPC methods, refuses wrong Host headers and cross-origin posts, and never reuses a connection.' },
    { name: 'Client baseline', text: 'Every client build starts the same way: MFA and domain lock, SPF, DKIM and DMARC, per-client isolation, backups and a written incident plan. The client owns the domain, the data and the code.' },
    /* Josie, 2026-09-30 (later): fintech language, and the compliance line. A
       certified security engineer is on the team; the certification is not
       named on purpose (Josie: "so we don't get typecast"). */
    { name: 'Payments, identity and compliance', text: 'Card and identity data go straight to the processor or the KYC provider and never pass through code we wrote. A certified security engineer is on every build. The proposal names the standards that apply to you, and the build is reviewed against them before launch.' },
    /* Josie, 2026-09-30 (later): the brand-incubator reason for the AI rule,
       and both halves of it in one cell (every model for ideation, sovereign
       models only for client material). The tier diagram is in privacy.html. */
    { name: 'Your idea stays off the model', text: 'A brand is built to surprise, and what a model has seen it can reproduce. So unreleased work, client files and data never go into one. Ideation draws on every model worth using, on prompts that name nothing, because each thinks differently and that range is part of the craft. Client material reaches only models designed for data sovereignty. <a href="privacy.html#tiers">Where each model sits</a>.' },
  ],
  /* Certifications: add rows here and they render below the grid.
     { name: 'Name', issuer: 'Issuer', year: '2026', url: 'https://...' } */
  certs: [],
};

/* Weekly sign-up (the form beside the Book a meeting button). With `action`
   empty the form opens the visitor's mail app with a ready-made subscribe
   email to `mailto` (no data leaves the page). When a list provider exists
   (Buttondown, Beehiiv, Mailchimp...), put its form endpoint in `action` and
   its field name in `field`, and add its origin to the form-action list in
   the Content-Security-Policy meta in index.html. */
window.NEWSLETTER = {
  title: 'New tech, new products, what shipped.',
  placeholder: 'you@example.com',
  button: 'Tech blog sign up',
  action: '',
  field: 'email',
  mailto: 'rigaliresearchdevelopment@gmail.com',
  note: 'Weekly. Unsubscribe by replying.',
};

/* Per-project updates (Josie, 2026-09-30: "subscribe to get updates on the
   project" on current and recently finished projects). Every BUILDING row
   gets the pill; the first `recent` SHIPPED rows do too (the list is newest
   first; 5 = the rows with case studies). Set `follow: true` or `false` on
   a row to override. With `action` empty the pill is a mailto link with the
   project in the subject, to the same inbox as the weekly sign-up, and the
   visitor's mail app supplies their address. With a list provider, set
   `action` + `field` (as for NEWSLETTER): the pill then opens a small email
   form on the row, posting `field` and a hidden `project`. Add the provider
   origin to form-action in the CSP meta in index.html. */
window.FOLLOW = {
  label: 'Get updates',
  recent: 5,
  action: '',
  field: 'email',
  mailto: 'rigaliresearchdevelopment@gmail.com',
};

window.ABOUT = {
  eyebrow: 'About me',
  title: 'I build brands as systems, and show the work as it happens.',
  paras: [
    'I am Josie Rigali, the brand incubator and systems design engineer behind Known, and. I design brands that behave like products: identity, interfaces, motion, 3D, research and emerging technology as one system.',
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

/* Open roles page (roles.html; rendered by page.js). Josie, 2026-09-30:
   "add the 10% discount for referral that fills a role at our dev design
   collective... a looking to fill contractor roles page" and the seven
   roles: RAG engineer, crypto/blockchain expert, junior dev, junior UX
   researcher, illustrator, motion designer, sales. Each is a contract role,
   brought in per project. `code` is the mark in the black circle, `kind`
   the small magenta label top right. Remove a role from `roles` to take it
   off the page; the pricing page's referral cell (its own data file) names
   the same list, so keep the two in step. Apply / refer links are mailto with the role in the
   subject, so nothing is typed on the page. The referral terms in
   `refer.items` are reasonable defaults for Josie to confirm: when the
   discount is applied (once the person is brought on) and what it applies
   to (the next fixed-price engagement or retainer month). */
window.ROLES = {
  eyebrow: 'Open roles',
  title: 'Contract roles,\nopen now.',
  text: 'Known, and is a network of people who do good work, brought in per project. The studio grows by adding people who hold the same standard, so every client gets beautiful, usable design and a build that holds. The roles below are open now. Each is a contract role, scoped in writing before work starts. Know someone who fits? Refer them, and once they join, your next engagement is 10% off.',
  email: 'rigaliresearchdevelopment@gmail.com',
  apply: 'Apply',
  referLabel: 'Refer someone',
  roles: [
    { code: 'RAG', kind: 'Engineering', name: 'RAG engineer',
      text: 'Retrieval pipelines over client knowledge: chunking, embeddings, evaluation and the checks that keep answers grounded in the source.' },
    { code: 'Web3', kind: 'Engineering', name: 'Crypto and blockchain expert',
      text: 'Smart contracts, wallets and on-chain integrations for product work, with the security review that goes with them.' },
    { code: 'Dev', kind: 'Engineering', name: 'Junior developer',
      text: 'Front-end and automation builds from designed flows. You ship inside a five-day sprint, with review on everything.' },
    { code: 'UXR', kind: 'Research', name: 'Junior UX researcher',
      text: 'Interviews, usability tests and the write-up. You help build the map every engagement starts with.' },
    { code: 'Ill', kind: 'Design', name: 'Illustrator',
      text: 'Brand illustration and icon systems that hold together across print, screen and motion.' },
    { code: 'Mo', kind: 'Design', name: 'Motion designer',
      text: 'Interface motion, brand animation and social pieces. Legibility comes first and the motion serves it.' },
    { code: 'Sales', kind: 'Growth', name: 'Sales',
      text: 'Fit Session bookings and the conversations before them. You know design and automation well enough to scope honestly.' },
  ],
  refer: {
    eyebrow: '10% referral discount',
    title: 'Know someone who fits?',
    text: 'Refer a person we bring on for one of these roles and your next engagement with the studio is 10% off. The short version is below; your proposal states the discount when it applies.',
    items: [
      { name: '10% off your next engagement', text: 'The discount comes off your next fixed-price engagement or your next retainer month, whichever you book first.' },
      { name: 'One introduction is enough', text: 'Email us their name and the role, or have them name you when they apply. Either way counts.' },
      { name: 'Applied once they are brought on', text: 'The discount is confirmed when the person signs their first contract with the studio. We tell you when that happens.' },
    ],
  },
  cta: { label: 'Apply for a role', subject: 'Role: ' },
  cta2: { label: 'Refer someone', subject: 'Referral: ' },
  ctaText: 'Send a short note and a link to your work, or the name of the person you are referring and the role. A person reads every message and replies within one business day.',
};

/* Article page (using-ai-as-a-digital-artist-and-researcher.html; linked
   from the privacy policy). Josie, 2026-09-30: her ideation process, "which
   I will outline in a video as well as write a paper on... pretend like it's
   already made and link it".
   >>> PLACEHOLDERS: set `video` and `paper` to their URLs when they exist
   and two buttons appear at the end of the article; until then `note`
   shows there. The article text itself is in the html file. */
window.ARTICLE = { video: '', paper: '', note: 'The video and the paper are linked here on publication.' };
