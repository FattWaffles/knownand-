/* Pricing data, loaded by the private pricing page only. Moved out of content.js on
   2026-09-30 when Josie hid pricing from the site ("lets hide the pricing
   from the main site"). content.js loads on every page, so the prices
   would otherwise ship in the home page source. The page is unlisted: no
   nav or footer link, noindex, out of the sitemap and the home page schema.
   Since the same night the page and this file sit at private addresses,
   sent to clients directly. HANDOFF.md ("Pricing hidden") has the address
   and how to list it again. */

/* Pricing page (rendered by page.js). Josie, 2026-09-30:
   "add the pricing page". The four engagements are the ones in her
   service outline (v3, July 2026) and website copy.

   Prices set 2026-09-30 (Josie), raised $250 each the same day: $750 Fit
   Session (credited to the first sprint), $4,750 sprint, $2,750 Known Layer
   ($7,000 with a sprint), retainer $1,750 (2 days) or $3,250 (4 days). Five working days per
   fixed-price project, 24/7 human support, prices move with availability,
   10% off the next engagement for referring someone who fills an open
   role (roles.html, window.ROLES below). An empty `price`
   reads "Priced per engagement" over `unit`; `note` shows only once a
   price is set.
   The `how` items state the studio's terms in one line each; the wording
   on payment and notice periods defers to the proposal on purpose, so
   nothing here promises a schedule Josie has not set. */
window.PRICING = {
  eyebrow: 'Pricing',
  title: 'Four ways in.\nOne method underneath.',
  text: 'Every engagement starts with a map of how the work moves: where it shows up, what flows between steps, what people keep, what AI does and what plain systems handle. The map decides what to design, build and automate. Each price is fixed before work starts. Projects ship in five working days. A person answers support, any hour, any day. Known, and is building a network of people who do good work.',
  /* The call-out beside the lede (Josie, 2026-09-30: "there should be some
     type of call out here on the right side of the hero"): a raised block on
     the grid, the whole block links to `url`. Delete `callout` and the lede
     goes back to its full ten cells. */
  callout: { eyebrow: 'Referral', big: '10% off', text: 'Refer someone who fills one of our open roles. The discount comes off your next engagement.', more: 'See the open roles', url: 'roles.html' },
  plans: [
    { name: 'The Fit Session', kind: 'Audit', price: '$750', unit: 'fixed price, credited to your first sprint', time: '2 working days',
      text: 'A short paid review of one product or workflow: where context leaks, where the experience fights the user, where AI is guessing.',
      includes: [
        'A working session and a review of the current product or workflow',
        'A map of how the work moves today',
        'A ranked plan: what to design, build or automate first',
        'The map is yours to keep, whatever you decide next',
      ],
      cta: 'Book a Fit Session' },
    { name: 'Design + Automate Sprint', kind: 'Build', price: '$4,750', unit: 'fixed price per 5-day sprint', time: '5 working days',
      text: 'The build. Design of the experience (flows, interface, copy) and the automation underneath it, grounded in the context captured in the Fit Session.',
      includes: [
        'One workflow and one interface per sprint, scoped from the map. Larger work runs as more sprints',
        'Flows, interface and copy',
        'Automation wired to specific jobs, with approval gates and a stop switch',
        'Adversarial review and regression tests on anything AI helped write',
        'Hand-off: source, design files and a written record of each decision',
      ],
      cta: 'Book a sprint' },
    { name: 'The Known Layer', kind: 'System', price: '$2,750', unit: 'fixed price, or $7,000 with a sprint', time: '5 working days, after a sprint',
      text: 'The durable version: the documented context that keeps outputs on-brand as the business grows, without you in the loop for every one.',
      includes: [
        'Voice documentation with approved and rejected examples',
        'Reusable prompts and workflow maps',
        'Review checks before anything leaves the building',
        'Handed over as files you own',
      ],
      cta: 'Book the Known Layer' },
    { name: 'Studio Retainer', kind: 'Ongoing', price: '$1,750', unit: 'per month for 2 studio days. $3,250 for 4 days and the priority queue', time: 'Month to month',
      text: 'Ongoing design and automation work: maintenance, updates as context changes, and the next things on the list.',
      includes: [
        'Two or four studio days each month, set in the proposal',
        '24/7 human support: a person replies to live-site incidents within two hours, any day',
        'Monitoring, so nothing drifts',
        'Every correction becomes a rule',
        'Notice period set in the proposal',
      ],
      cta: 'Start a retainer' },
  ],
  how: {
    eyebrow: 'Terms in brief',
    title: 'How pricing works',
    text: 'The short version. The <a href="terms.html">terms of service</a> carry the full wording, and each proposal carries the specifics.',
    items: [
      { name: 'Fixed before work starts', text: 'Each engagement is quoted as a fixed price in a written proposal. The proposal lists what is included, what is out of scope and when it is done.' },
      { name: '5-day turnaround', text: 'Fixed-price projects ship in five working days. The clock starts when the deposit and materials arrive. Larger work is split into 5-day sprints, each priced on its own.' },
      { name: '24/7 human support', text: 'A person answers every message. Live-site incidents get a reply within two hours, any day of the week. Everything else gets a reply within one business day. The incident plan in the security baseline covers what happens next.' },
      { name: 'The Fit Session comes first', text: 'New clients start with a Fit Session. Its map is the basis for every later quote, so nothing is priced on a guess.' },
      { name: 'You own the result', text: 'On final payment the deliverables are yours: domain, data, design files and code. Studio tools and templates used inside them are licensed to you for good.' },
      { name: 'Security baseline included', text: 'Every build ships with MFA and domain lock, SPF, DKIM and DMARC, per-client isolation, backups and a written incident plan. No extra line on the invoice.' },
      { name: 'AI under one rule', text: 'Client material only reaches AI models designed for data sovereignty. The rule and what it means today are in the <a href="privacy.html#ai">privacy policy</a>.' },
      { name: 'Payment', text: 'Payment terms and schedule are set in each proposal. Third-party costs such as fonts, stock, hosting and domains are passed through at cost, with your approval first.' },
      { name: 'Prices change with availability', text: 'Prices rise when the calendar is full and drop when it opens. A signed proposal keeps its price. Subscribe below for updates on new services and prices.' },
      { name: '10% referral discount', text: 'Refer someone who fills one of our open contract roles and your next engagement is 10% off. Open now: RAG engineer, crypto and blockchain expert, junior developer, junior UX researcher, illustrator, motion designer and sales. <a href="roles.html">See the roles</a>. Known, and is building a network of people who do good work. That is how the studio scales, keeps the same quality, and makes sure everyone in it gets beautiful, usable design.' },
    ],
  },
  cta: { label: 'Book a Fit Session', url: 'https://calendly.com/rigaliresearchdevelopment' },
  /* Subscribe button (Josie, 2026-09-30): updates on new services and price
     changes. mailto for now; swap `url` for a provider form when one exists. */
  subscribe: { label: 'Subscribe for updates', url: 'mailto:rigaliresearchdevelopment@gmail.com?subject=Subscribe%3A%20Known%2C%20and%20services%20and%20prices' },
  ctaText: 'Two working days, one map of how your work moves, and a ranked plan for what to design, build or automate first. The map is yours to keep. Prices change with availability. Subscribe for updates on new services and prices.',
  note: 'Prices in US dollars, before tax. Prices change with availability. A signed proposal keeps its price.',
};
