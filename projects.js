/* All case-study content lives here. Edit this file only; the dashboard,
   the 30-second cards and the Figma-style viewer all read from it.
   dataNote: "sample" = illustrative figures, "real" = real figures. */

const A = 'assets/';
const desk = (src, name, note, w = 1440, h = 1024) => ({ src: A + src, name, note, w, h });
const phone = (src, name, note) => ({ src: A + 'instaquote/' + src, name, note, w: 412, h: 892 });

window.PROJECTS = [
  {
    id: 'sapphire',
    no: '001',
    title: 'Sapphire Studios',
    line: 'One portal for a creator agency: casting, campaigns, scripts and payments in one place.',
    hook: 'The back office for an official TikTok Marketing Partner.',
    context: [
      { fact: 'Sapphire is an official TikTok Marketing Partner. It makes UGC ads for paid media teams.', source: 'Yahoo Finance, Aug 2021', url: 'https://finance.yahoo.com/news/sapphire-named-tiktok-marketing-partner-143000049.html' },
      { fact: 'Its Dr. Squatch campaigns pushed TikTok spend past seven figures in 2021.', source: 'Yahoo Finance, Aug 2021', url: 'https://finance.yahoo.com/news/sapphire-named-tiktok-marketing-partner-143000049.html' },
      { fact: 'The creator portal is live. Creators sign up and work through it today.', source: 'studios.sapphireapps.com', url: 'https://studios.sapphireapps.com/creator/signup' },
      { fact: 'UGC, produced, AI-generated and animated content under one roof.', source: 'sapphirestudios.co', url: 'https://sapphirestudios.co/' },
    ],
    tags: ['Product design', 'Design system'],
    year: '2024–25',
    facts: { Role: 'Design lead', Scope: 'Agency portal, creator portal, style guide, login v2', Tools: 'Figma, FigJam' },
    shots: { kind: 'desktop', src: [A + 'sapphire/creators-mosaic.png'] },
    quick: {
      before: 'Campaigns ran across spreadsheets, email and DMs.',
      after: 'One portal where the agency casts, briefs and pays creators.',
    },
    dataNote: 'sample',
    overview: {
      problem: 'The agency ran every creator campaign across spreadsheets, email and DMs. Casting one campaign took days, and creators never knew where they stood.',
      role: 'Design lead. I designed the agency and creator portals, the shared style guide and the v2 login, working across the creative, data and strategy teams.',
      process: ['Map the agency workflow', 'Build the style guide first', 'Agency portal', 'Creator portal', 'Login + interface v2'],
      decisions: [
        'A casting list with columns you can switch on and off, so a manager builds a shortlist in one view.',
        'Card "mosaic" and list views of the same creators: faces for casting, rows for admin.',
        'An announcements feed for creators, to replace the same DM sent 200 times.',
        'One style guide (type, colour, inputs, buttons) shared by both portals.',
      ],
      results: [
        { v: '3 days → 4 hrs', l: 'to cast a campaign' },
        { v: '+38%', l: 'creator reply rate' },
        { v: '−52%', l: 'support DMs' },
        { v: '45', l: 'screens from one style guide' },
      ],
      next: 'Bring the script engine and review sheets into the same system.',
    },
    pages: [
      {
        name: 'Agency portal',
        summary: 'Where the agency team casts creators and runs campaigns.',
        frames: [
          desk('sapphire/creators-mosaic.png', 'Creators / Mosaic', 'Faces first. Casting is a visual job, so the default view is cards.'),
          desk('sapphire/creators-list.png', 'Creators / List', 'Same data as rows for admin work: bulk actions, quick view, message.'),
          desk('sapphire/casting-list.png', 'New casting list', 'Column toggles on the left let a manager shape the shortlist without leaving the page.'),
          desk('sapphire/campaign-details.png', 'Campaign details', 'Brief, budget and deadlines in one place. Tabs keep scripts, creators and payments one click away.'),
          desk('sapphire/create-campaign.png', 'Create campaign', 'Notifications are set per role at creation, so nobody is chased later.', 1440, 1027),
          desk('sapphire/creator-profile.png', 'Creator profile', 'Everything casting needs: sizes, languages, rates, shipping.'),
        ],
      },
      {
        name: 'Creator portal',
        summary: 'What creators see. Dark theme, fewer choices.',
        frames: [desk('sapphire/creator-announcements.png', 'Announcements', 'One feed replaces hundreds of repeat DMs. Portal, agency and casting updates are tagged.')],
      },
      {
        name: 'Login v2',
        summary: 'A calmer front door with a creator quote beside the form.',
        frames: [
          desk('sapphire/login.png', 'Login / Desktop', 'Social proof from a real creator sits next to the form.', 1280, 832),
          desk('sapphire/login-mobile.png', 'Login / Mobile', 'Same form, single column.', 320, 832),
        ],
      },
      {
        name: 'Style guide',
        summary: 'Built first, so 45 screens stayed consistent.',
        frames: [
          desk('sapphire/guide-colors.png', 'Colors', 'Neutral, primary and accent sets plus the nav gradients.', 1346, 1130),
          desk('sapphire/guide-inputs.png', 'Input fields', 'Every state drawn once: enabled, disabled, active, error.', 1600, 832),
          desk('sapphire/guide-buttons.png', 'Buttons', 'Enabled and hover states for each button type.', 380, 860),
        ],
      },
    ],
  },

  {
    id: 'instaquote',
    no: '002',
    title: 'InstaQuote',
    line: 'An Android app where a tradie talks through a job and gets a priced quote draft in minutes.',
    hook: 'Tradies lose 10 to 15 hours a week to admin. This gives the evenings back.',
    context: [
      { fact: 'Trade-software vendors in New Zealand and Australia put admin at 10 to 15 hours a week, mostly after hours.', source: 'Zynoff press release, Scoop NZ, Apr 2025', url: 'https://www.scoop.co.nz/stories/BU2504/S00096/zynoff-the-job-management-platform-that-saves-tradies-hours-every-week.htm' },
    ],
    tags: ['Product design', 'AI UX', 'Android'],
    year: '2026',
    facts: { Role: 'Product designer', Scope: '50 screens, AI chat behaviour, starter components', Tools: 'Figma, Claude' },
    shots: { kind: 'phone', src: ['chat-start', 'chat-photo', 'chat-draft', 'job-costing'].map((s) => A + 'instaquote/' + s + '.png') },
    quick: {
      before: 'Quotes written at night, from memory, often under-priced.',
      after: 'Say the job out loud, check the draft, send it.',
    },
    dataNote: 'sample',
    overview: {
      problem: 'Small trade businesses lose their evenings to quoting. Quotes are slow, inconsistent and often under-priced because the real cost of labour is a guess.',
      role: 'Product designer. Flows, AI chat behaviour, 50 screens and the starter component set.',
      process: ['Working prototype', 'User-flow doc', 'Founder meeting notes', 'AI build guide', 'Screens + components'],
      decisions: [
        'One question at a time, with quick replies. Nobody fills in a form on a roof.',
        'Type it, say it or photograph it. The AI reads the photo and says what it cannot see.',
        'The AI lists its assumptions on every draft, so the owner checks them before anything is sent.',
        'Guardrail: no rate on file means the AI asks. It never guesses a price.',
        'The owner can override any system price, and only owners see cost to business.',
      ],
      results: [
        { v: '45 → 6 min', l: 'to draft a quote' },
        { v: '5 steps', l: 'from install to first quote' },
        { v: '0', l: 'prices the AI is allowed to invent' },
        { v: '+11%', l: 'average margin on quoted jobs' },
      ],
      next: 'Subcontractor quoting and the learning loop that tunes pricing from accepted quotes.',
    },
    pages: [
      {
        name: 'Onboarding',
        summary: 'Five short steps. Each one makes the first quote more accurate.',
        frames: [
          phone('onboarding-email.png', '1.1 Email', 'One field. Account details come later.'),
          phone('onboarding-trade.png', '1.2 Primary trade', 'Trade sets the language and the default line items.'),
          phone('onboarding-defaults.png', '1.5 Set your defaults', 'Rates and markup are captured once, then reused on every quote.'),
        ],
      },
      {
        name: 'Dashboard + pricing',
        summary: 'Home for a returning user, and how pricing is taught to the app.',
        frames: [
          phone('dashboard.png', '2.2 Dashboard', 'Recent quotes first. One big button: new quote.'),
          phone('pricing-structure.png', '2.5 Pricing structure', 'Per item for countable things, per hour for the rest. Plain examples next to each choice.'),
        ],
      },
      {
        name: 'AI chat',
        summary: 'The core of the app: a conversation that ends in a quote.',
        frames: [
          phone('chat-start.png', 'C1 Chat start', 'Greeting plus three example jobs, so the first message is never a blank page.'),
          phone('chat-photo.png', 'C3 Photo upload', 'The AI says what it can see and what it cannot. It asks about the rest.'),
          phone('chat-draft.png', 'C6 Draft ready', 'A structured quote card inside the chat, with assumptions listed.'),
          phone('chat-guardrail.png', 'C8 Guardrail', 'No rate on file for this job type, so the AI stops and asks. It will not guess.'),
        ],
      },
      {
        name: 'Job costing',
        summary: 'What the job really costs, by task, person and material.',
        frames: [
          phone('job-costing.png', '11.1 Job costing', 'Hours are benchmarked, then adjusted for the person doing the work.'),
          phone('owner-override.png', '11.4 Owner override', 'The owner has the last word on price. The system records why.'),
        ],
      },
    ],
  },

  {
    id: 'profitmind',
    no: '003',
    title: 'Profitmind',
    line: 'UX research and redesign for an AI platform that tells retailers what to stock and how to price it.',
    hook: 'The AI found the money. The redesign got people to act on it.',
    context: [
      { fact: 'Profitmind raised a $9M Series A led by Accenture Ventures in February 2026. Andrew Ng\'s AI Fund is among its backers.', source: 'Profitmind announcement', url: 'https://www.profitmind.com/resources/profitmind-announces-series-a-round' },
      { fact: 'It serves retailers from $20 million to $100 billion in revenue, on three continents.', source: 'Profitmind announcement', url: 'https://www.profitmind.com/resources/profitmind-announces-series-a-round' },
      { fact: 'The platform is sold through Microsoft Marketplace and Azure.', source: 'Business Wire, Feb 2026', url: 'https://www.businesswire.com/news/home/20260224353292/en/Profitmind-Raises-$9-Million-Series-A-Led-by-Accenture-Ventures-to-Scale-an-AI-Platform-for-Retail-Decision-Making' },
      { fact: 'Trade press on its assortment and inventory agents.', source: 'Sourcing Journal', url: 'https://sourcingjournal.com/topics/technology/profitmind-ai-agentic-commerce-9-million-funding-round-dr-mark-chrystal-retail-technology-assortment-inventory-1234815239/' },
    ],
    tags: ['UX research', 'AI research', 'B2B SaaS'],
    year: '2025–26',
    facts: { Role: 'UX + AI researcher (contract)', Scope: 'Assortment intelligence', Tools: 'Figma, FigJam' },
    shots: { kind: 'html', html: 'pmOverview' },
    quick: {
      before: 'The AI found the money. Buyers could not see why, so they did not act.',
      after: 'Three things to do today, the reason for each, and a human sign-off.',
    },
    dataNote: 'sample',
    confidential: 'Screens are redrawn and all figures are changed. The real product and data are confidential.',
    overview: {
      problem: 'The platform found millions in pricing and stock opportunities, but buyers could not see why the AI recommended something, so they did not act on it. Features kept landing without a shared picture of the product.',
      role: 'UX and AI researcher on contract. I led user research and AI prompt research, ran friction workshops, and turned findings into numbers the machine-learning team could build against.',
      process: ['Stakeholder calls', 'Friction workshops', 'Dashboard audit', 'Competitor review', 'Prompt testing', 'Testing with buyers', 'Redesign'],
      decisions: [
        'Prompt research: rewrote how the AI phrases each insight, then tested versions for clarity and trust.',
        'Lead with "Key areas to focus on": three actions, each with the reason in plain words.',
        'Split Hindsight (what happened) from Overview (what to do next). They were one tab.',
        'An "Optimized from insights" view that only counts insights a person has approved.',
        'Drill down from category to product, so a buyer can check the AI against what they know.',
      ],
      results: [
        { v: '14 → 4 min', l: 'to a first decision' },
        { v: '3 → 9', l: 'insights acted on per session' },
        { v: '2.6 → 4.1', l: 'trust in AI advice (of 5)' },
        { v: '58% → 91%', l: 'task success in testing' },
      ],
      next: 'Show confidence for each insight and let buyers teach the model why they rejected one.',
    },
    pages: [
      {
        name: 'Research',
        board: {
          sections: [
            { title: 'Methods', color: 'blue', notes: ['Weekly calls with product, engineering and leadership', 'Friction workshops with the team', 'Audit of the live dashboard, screen by screen', 'Review of competing retail analytics tools', 'Prompt tests: the same insight, worded several ways', 'Task-based testing with retail buyers'] },
            { title: 'What buyers said', color: 'verm', notes: ['"I see the number. I do not see the reason."', '"Which of these do I do first?"', '"Did someone check this, or is it just the computer?"', '"I want to see the products, not only the category."'] },
            { title: 'What the audit found', color: 'mag', notes: ['What happened and what to do next were mixed in one tab', 'Tables came first; the three actions that mattered were buried', 'Nothing separated AI suggestions a person had approved from ones nobody had seen', 'New features were added faster than the navigation could hold them'] },
            { title: 'Design principles', color: 'ink', notes: ['Say why, in plain words', 'Rank it: three things, not thirty', 'A person approves before the numbers count', 'Always let them drill down and check'] },
          ],
        },
        summary: 'Four methods, run in weekly cycles.',
      },
      {
        name: 'AI interaction map',
        summary: 'Who does what: the AI, the buyer and the system.',
        frames: [{ html: 'pmAtlas', name: 'AI interaction map', w: 1440, h: 780, note: 'Mapped with the AI Interaction Atlas. The gap it exposed: AI insights counted toward projections before any person had looked at them.' }],
      },
      {
        name: 'Redesign',
        summary: 'Redrawn with sample data.',
        frames: [
          { html: 'pmOverview', name: 'Assortment overview', w: 1440, h: 1024, note: 'Three ranked actions with the reason for each. Charts support the list; they do not replace it.' },
          { html: 'pmHindsight', name: 'Hindsight / Optimized', w: 1440, h: 1024, note: 'Switch between actual data and the optimized view. "Approved only" keeps unreviewed AI output out of the totals.' },
        ],
      },
    ],
  },

  {
    id: 'edu',
    no: '004',
    title: 'Legacy courseware turnaround',
    line: 'Came into a learning platform built around 2010, cut the redundancy and built the scorecard that proved it worked.',
    hook: 'Three legacy platforms, one scorecard that shows leadership where learners get stuck.',
    context: [
      { fact: 'The average usability (SUS) score across more than 500 studies is 68. Anything under 51 is an F.', source: 'MeasuringU', url: 'https://measuringu.com/sus/' },
      { fact: 'A score of 40 sits in the bottom 15% of all tested products. A 72 is above the midpoint.', source: 'MeasuringU', url: 'https://measuringu.com/sus/' },
    ],
    tags: ['UX research', 'Legacy software', 'Metrics'],
    year: '',
    facts: { Client: 'A major education publisher (name withheld)', Role: 'UX researcher (contract)', Scope: 'Three platforms: higher-ed, K-12, homework' },
    shots: { kind: 'doc', src: [A + 'edu/scorecard-v1.jpg', A + 'edu/platform-detail.jpg'] },
    quick: {
      before: 'Eight clicks to open an eBook. Up to 26 minutes to find a resource.',
      after: 'Two clicks. Two seconds. A usability score up from 40 to 72.',
    },
    dataNote: 'real',
    confidential: 'Figures are real. The company and product names are withheld.',
    overview: {
      problem: 'Courseware built around 2010 and extended by many teams since. Instructors needed eight clicks to open an eBook and up to 26 minutes to find a resource. The same feature existed in several versions, and leadership had no shared view of usability.',
      role: 'UX researcher on contract across three platforms: higher-ed courseware, K-12 courseware and a homework platform. Student and teacher interviews, usability tests, accessibility audits, and the readouts product teams used to decide.',
      process: ['Student + teacher interviews', 'Usability testing', 'Accessibility audits', 'Find the redundancies', 'Build the scorecard', 'Research readouts'],
      decisions: [
        'An "Open eBook" button in the main navigation and one eBook section with search. Eight clicks became two.',
        'A new assignment creator that replaced several overlapping flows. Create and edit now take about half the time.',
        'One scorecard per platform: usability score against the goal of 85, and three key tasks tracked by time, ease and failure rate.',
        'Unresolved problems stay on the scorecard (LMS set-up, accessibility), so they cannot quietly disappear.',
      ],
      results: [
        { v: '26 min → 2 s', l: 'to find a resource, 2022 → 2024' },
        { v: '8 → 2', l: 'clicks to open an eBook' },
        { v: '10 → 5 min', l: 'to create an assignment' },
        { v: '40 → 72', l: 'usability score the scorecard tracks, 2020–23' },
      ],
      next: 'LMS integration still fails for most first-time users. That is the next task on the scorecard.',
    },
    pages: [
      {
        name: 'Scorecard',
        summary: 'The leadership view: one page, plain language.',
        frames: [
          { src: A + 'edu/scorecard-v1.jpg', name: 'Scorecard / Summary', w: 1400, h: 1283, note: 'Every chart has a "what this means" line, so the page works without a researcher in the room.' },
          { src: A + 'edu/scorecard-overall.jpg', name: 'Scorecard / Full', w: 1400, h: 2010, note: 'Time on task over four years, then each pain point with the fix that shipped.' },
        ],
      },
      {
        name: 'Platform views',
        summary: 'Click a platform to see its tasks.',
        frames: [
          { src: A + 'edu/platform-overview.jpg', name: 'Platform overview', w: 1400, h: 1350, note: 'Three platforms against one goal. Strengths and critical issues side by side.' },
          { src: A + 'edu/platform-detail.jpg', name: 'Platform detail', w: 1400, h: 1544, note: 'Three tasks per platform, each measured by time, ease and failure rate, before and after.' },
        ],
      },
    ],
  },

  {
    id: 'selig',
    no: '005',
    title: 'Selig Sealing',
    line: 'A page-by-page audit of a B2B lead-generation site: what is broken, how to fix it and what to do first.',
    hook: 'A 130-year-old manufacturer whose website was costing it leads.',
    context: [
      { fact: 'Selig Group: founded 1890, 600+ employees, 7 manufacturing sites, 10,000+ brands served, 200+ patents.', source: 'Selig Group, Our Story', url: 'https://www.seliggroup.com/about-us/our-story/' },
      { fact: 'It sells into food, beverage, wine and spirits, personal care, healthcare and chemical packaging.', source: 'Selig Group, Our Story', url: 'https://www.seliggroup.com/about-us/our-story/' },
      { fact: 'The company\'s current site runs six top-level navigation items.', source: 'seliggroup.com, checked Sept 2026', url: 'https://www.seliggroup.com/' },
    ],
    tags: ['UX audit', 'Accessibility', 'SEO'],
    year: '2022',
    facts: { Role: 'UX auditor', Scope: 'Navigation, homepage, products, datasheets', Tools: 'Figma audit kit' },
    shots: { kind: 'doc', src: ['navigation', 'homepage', 'products'].map((s) => A + 'selig/' + s + '.png') },
    quick: {
      before: 'A lead-gen site that read as an outdated template.',
      after: 'A ranked fix list the client could hand straight to developers.',
    },
    dataNote: 'sample',
    overview: {
      problem: 'The site is the company\'s lead-generation tool, but first impressions were "outdated" and "a free template". The navigation was overloaded, datasheets had two competing paths, and the download pop-up had no way to register.',
      role: 'UX auditor. I also built a reusable audit kit in Figma: issue, solution and priority components with annotation bubbles.',
      process: ['First-impression test', 'Audience needs', 'Page-by-page audit', 'Rank by priority', 'Report'],
      decisions: [
        'Cut the main navigation to four items and fold the rest underneath.',
        'One consistent hero call to action in every language, and translate above the fold.',
        'A set of WCAG-compliant colour pairs and defined button states.',
        'Merge the two datasheet paths and add "Register" to the download pop-up.',
        'Empty and error states for search. "Conduction Seal" returned nothing, silently.',
      ],
      results: [
        { v: '31', l: 'findings, 12 high priority' },
        { v: '4 max', l: 'main navigation items, down from 9' },
        { v: '6 → 3', l: 'clicks to a datasheet' },
        { v: '+22%', l: 'projected lead-form conversion' },
      ],
      next: 'Re-audit after launch against the same checklist.',
    },
    pages: [
      {
        name: 'Audit report',
        summary: 'Each page: findings, suggestion, priority.',
        frames: [
          { src: A + 'selig/overview.png', name: 'Overview', w: 595, h: 882, note: 'First impressions and who the site is for, before any findings.' },
          { src: A + 'selig/navigation.png', name: 'Navigation', w: 595, h: 921, note: 'Too many items, and a language switch with no way back.' },
          { src: A + 'selig/homepage.png', name: 'Homepage', w: 595, h: 1312, note: 'Inconsistent calls to action and an untranslated hero.' },
          { src: A + 'selig/products.png', name: 'Products', w: 595, h: 882, note: 'Silent empty results and contrast failures in the filter.' },
          { src: A + 'selig/datasheets.png', name: 'Datasheets', w: 595, h: 1115, note: 'Two paths to the same place. One is twice as long.' },
        ],
      },
    ],
  },
];

/* "Now" log. Newest first. */
window.NOW = [
  { date: 'Sep 2026', tag: 'hackathon', status: 'In progress', title: 'RobotFac3', text: 'A Solana browser concept where you and an agent share one set of guardrails. Entries close Oct 12.' },
  { date: 'Sep 2026', tag: 'website', status: 'In progress', title: 'Pet wellness launch', text: 'A custom Shopify theme built around one flagship product, a daily food topper for dogs.' },
  { date: 'Sep 2026', tag: 'website', status: 'In progress', title: 'Strategist website', text: 'A brand-led 2026 website for a growth and exit strategist.' },
  { date: 'Sep 2026', tag: 'website', status: 'In progress', title: 'The Known site', text: 'Bitmap hero, this file viewer and a plain-language services page.' },
  { date: 'Sep 2026', tag: 'product', status: 'In design', title: 'InstaQuote', text: 'AI chat flow and job costing for an Android quoting app for tradies.', project: 'instaquote' },
  { date: 'Sep 2026', tag: 'game', status: 'In design', title: 'Cat in a Box: Schrödinger mode', text: 'Planned cat states and boosts. Boxed cats would show two shapes until you touch them.' },
  { date: 'Sep 2026', tag: 'build', status: 'In progress', title: 'Websites + CRM with Veruthia', text: 'Brand and design from Known, development and security from Veruthia, for contractors.' },
  { date: '2026–27', tag: 'experiment', status: 'Exploring', title: 'NFC cards, then a booth', text: 'Tap-to-open business cards first. The long game is a walk-in brand booth.' },
];

/* Short mentions: past work without a full case study. From the resume. */
window.MORE = [
  { no: '006', title: 'Neutrogena.com rebrand', company: 'Kenvue', role: 'Creative direction, e-commerce, design system', year: '2023–24', line: 'Lead designer for the NTG.com rebrand, built to ADA and North American brand standards.' },
  { no: '007', title: 'Ad-platform style guides', company: 'Bath & Body Works', role: 'Motion, iconography, templates', year: '2022–23', line: 'Motion, icons and templates for email, social and landing pages, plus brand guides for Conversant and AdParlor.' },
  { no: '008', title: 'Salon pro campaigns', company: 'SalonCentric (L\'Oréal USA)', role: 'Art direction, email, motion', year: '2020–22', line: 'Emails, web, social, decks and motion for the professional salon market, tuned with analytics.' },
  { no: '009', title: 'Beauty email + landing pages', company: 'Estée Lauder, Clinique, FoodKick', role: 'Email, landing pages, motion', year: '2017–20', line: 'Email, landing pages and social for brand redesigns and seasonal campaigns.' },
  { no: '010', title: 'Freelance UX/UI', company: 'It\'s a 10 Haircare', role: 'Research, prototypes, A/B tests', year: '2018–23', line: 'Research, personas, responsive wireframes, prototypes and A/B tests.' },
  { no: '011', title: 'Freelance UX/UI', company: 'Ascent Protein', role: 'Research, prototypes, A/B tests', year: '2018–23', line: 'Research, personas, responsive wireframes, prototypes and A/B tests.' },
  { no: '012', title: 'Freelance UX/UI', company: 'Dr Brew Kombucha', role: 'Research, prototypes, A/B tests', year: '2018–23', line: 'Research, personas, responsive wireframes, prototypes and A/B tests.' },
];

/* Online games + side quests: hackathons and games outside client work. Status words stay honest:
   RobotFac3's agent is scripted, and Cat in a Box (project name CatBlast) is not on any store yet. */
window.SIDE = [
  {
    id: 'robotfac3', title: 'RobotFac3', kind: 'Hackathon', tag: 'hackathon', year: '2026', status: 'In progress', live: true,
    line: 'A browser concept for the web, Web3 and AI agents, with one set of security rules for all three.',
    points: [
      'The hackathon build is the Solana part. Type a Solana name, connect Phantom only when you need it, and see each SOL payment in plain words before you sign.',
      'A built-in agent follows the same guardrails, and a person approves every signature. For now the agent is scripted. No AI model is connected yet.',
      'I lead product vision, UI direction and community on a team of three, with a security engineer and an ops and project lead.',
      'It is a local web prototype with 27 passing tests, built for an online crypto hackathon. Entries close Oct 12, 2026.',
    ],
    tags: ['Solana', 'AI agents', 'Product + UI'],
    img: A + 'side/robotfac3-logo.jpg', alt: 'RobotFac3 wordmark around a robot head, off-white and red on black.',
    credit: 'Logo: AI-generated draft.',
    links: [],
  },
  {
    id: 'catblast', title: 'Cat in a Box', kind: 'Mobile game', tag: 'game', year: '2025–26', status: 'Android build', live: false, icon: true,
    line: 'A relaxing block puzzle made of cats I drew.',
    points: [
      'Drag cat pieces onto an 8x8 grid to clear rows and columns. When a line cuts through a big cat, the leftover cells break into kittens.',
      'I designed the game, drew all the art and built it in Godot with AI help.',
      'Endless mode is playable. A Schrödinger\'s cat version with boxed cats and boosts is in design.',
      'Planned for the Solana dApp Store on Seeker phones. Not published yet. For now it is a signed Android build for testing.',
    ],
    tags: ['Game design', 'Illustration', 'Godot', 'Android'],
    img: A + 'side/catblast-icon.png', alt: 'App icon: a grumpy orange and purple cat in an open cardboard box.',
    links: [{ label: 'About the Solana dApp Store', url: 'https://docs.solanamobile.com/solana-mobile-stack/dapp-store' }],
  },
];

/* Brands worked with (in-house, contract and freelance). From the resume and the case studies. */
window.BRANDS = [
  { name: 'Neutrogena', note: 'Kenvue' },
  { name: 'Bath & Body Works', note: 'Style guides' },
  { name: 'L\'Oréal USA', note: 'SalonCentric' },
  { name: 'Estée Lauder', note: 'Email' },
  { name: 'Clinique', note: 'Campaigns' },
  { name: 'FoodKick', note: 'Campaigns' },
  { name: 'It\'s a 10 Haircare', note: 'Freelance' },
  { name: 'Ascent Protein', note: 'Freelance' },
  { name: 'Dr Brew Kombucha', note: 'Freelance' },
  { name: 'Sapphire Studios', note: 'Portals' },
  { name: 'Cengage', note: 'UX research' },
  { name: 'Profitmind', note: 'AI research' },
  { name: 'Selig Group', note: 'UX audit' },
];
