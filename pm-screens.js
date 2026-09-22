/* Redrawn ProfitMind screens. Everything here is sample data drawn in HTML,
   so no confidential product screens or figures are shown. */
(function () {
  const side = (on) => `
    <aside class="pm-side">
      <div class="pm-brand">Assortment<br>Intelligence</div>
      ${['Executive summary', 'Opportunities', 'Reports', 'Assortment', 'Product matching', 'Price alerts', 'Settings']
        .map((t) => `<div class="pm-nav${t === on ? ' on' : ''}">${t}</div>`).join('')}
      <div class="pm-sample">Sample data</div>
    </aside>`;

  const kpis = `
    <div class="pm-kpis">
      <div class="pm-kpi"><small>Opportunities found</small><b>$8.2M</b><span>41 open</span></div>
      <div class="pm-kpi"><small>Next 5 weeks</small><b>$1.9M</b><span>17 insights</span></div>
      <div class="pm-kpi"><small>Next 52 weeks</small><b>$6.3M</b><span>24 insights</span></div>
      <div class="pm-kpi"><small>Market matched</small><b>71%</b><span>6,180 products</span></div>
    </div>`;

  const tabs = (on) => `<div class="pm-tabs">${['Overview', 'Revenue', 'Profit', 'Hindsight']
    .map((t) => `<span class="${t === on ? 'on' : ''}">${t}</span>`).join('')}</div>`;

  const focus = [
    ['Grow Lighting into white space', '+$1.4M profit', '+$2.9M revenue', 'Pendant and floor lamps sell through 2× faster than the rest of the range, and you carry 40% fewer than competitors.'],
    ['Expand Rugs by 18 products', '+$0.8M profit', '+$1.6M revenue', 'Mid-price rugs are out of stock 3 weeks in 10. Shoppers leave rather than trade up.'],
    ['Free up cash in Storage', '+$610K cash', '', '22% of Storage stock is older than 90 days. Marking down 31 products releases the cash with little margin loss.'],
  ];
  const bars = [['Lighting', 92, 58], ['Rugs', 70, 40], ['Bedding', 38, 22], ['Storage', 26, 30], ['Decor', 18, 9]];

  window.PM_SCREENS = {
    pmOverview: () => `
      <div class="pm">${side('Assortment')}
        <main class="pm-main">${kpis}${tabs('Overview')}
          <div class="pm-grid">
            <section class="pm-card pm-focus">
              <h3>Key areas to focus on <em>Quarter to date</em></h3>
              ${focus.map((f, i) => `
                <div class="pm-f">
                  <div class="pm-n">${i + 1}</div>
                  <div class="pm-fb"><b>${f[0]}</b>
                    <div class="pm-chips"><i class="g">${f[1]}</i>${f[2] ? `<i class="b">${f[2]}</i>` : ''}</div>
                    <p><strong>Why:</strong> ${f[3]}</p></div>
                  <button>Review</button>
                </div>`).join('')}
            </section>
            <section class="pm-card">
              <h3>Opportunity value by category</h3>
              <div class="pm-bars">${bars.map((b) => `
                <div class="pm-bar"><span>${b[0]}</span><div><i style="width:${b[1]}%"></i><i class="p" style="width:${b[2]}%"></i></div></div>`).join('')}
              </div>
              <div class="pm-legend"><i></i>Revenue <i class="p"></i>Profit</div>
            </section>
          </div>
          <div class="pm-grid two">
            <section class="pm-card"><h3>White space</h3><div class="pm-stat">+60% <small>products in "occasion" pieces</small></div>
              <ul><li>Material: natural fibres up 45%</li><li>Style: print holds a steady 25% lift</li></ul></section>
            <section class="pm-card"><h3>Productivity</h3><div class="pm-stat">5.2× <small>stock turn, above the market</small></div>
              <ul><li>$9M of stock is older than 90 days</li><li>12% overstocked, 18% understocked</li></ul></section>
          </div>
        </main></div>`,

    pmHindsight: () => {
      const rows = [
        ['Lighting', '$4.82M', '+12%', '412', '68%', '44%', 'Approved'],
        ['Rugs', '$3.10M', '+7%', '268', '61%', '41%', 'Approved'],
        ['Bedding', '$2.74M', '−3%', '390', '52%', '38%', 'Pending'],
        ['Storage', '$1.96M', '−9%', '344', '39%', '33%', 'Approved'],
        ['Decor', '$1.41M', '+2%', '510', '47%', '46%', 'Rejected'],
        ['Outdoor', '$0.98M', '+21%', '122', '72%', '42%', 'Pending'],
      ];
      return `
      <div class="pm">${side('Assortment')}
        <main class="pm-main">${kpis}${tabs('Hindsight')}
          <div class="pm-sub">${['Optimized', 'White space', 'Productivity', 'Market', 'Attributes'].map((t, i) => `<span class="${i ? '' : 'on'}">${t}</span>`).join('')}</div>
          <section class="pm-card">
            <div class="pm-toggle">
              <label><i class="radio"></i>Actual data</label>
              <label><i class="radio on"></i>Optimized from insights</label>
              <label class="sw"><i class="switch"></i>Approved insights only</label>
              <span class="pm-ghost">Download</span>
            </div>
            <div class="pm-strip">
              <div><small>Projected revenue</small><b>$15.9M</b></div><div><small>vs actual</small><b class="up">+$1.2M</b></div>
              <div><small>Insights counted</small><b>3 of 6</b></div><div><small>Waiting for review</small><b>2</b></div>
            </div>
            <table class="pm-table">
              <thead><tr><th>Category</th><th>Revenue</th><th>vs last year</th><th>Products</th><th>Sell-through</th><th>Margin</th><th>Insight</th></tr></thead>
              <tbody>${rows.map((r) => `<tr>${r.slice(0, 6).map((c, i) => `<td class="${i === 2 ? (c[0] === '+' ? 'up' : 'down') : ''}">${c}</td>`).join('')}<td><i class="pill ${r[6].toLowerCase()}">${r[6]}</i></td></tr>`).join('')}</tbody>
            </table>
            <p class="pm-foot">Only approved insights change the projected numbers. Pending and rejected insights are shown but never counted.</p>
          </section>
        </main></div>`;
    },

    pmAtlas: () => {
      const cols = [
        ['AI tasks', 'blue', ['Detect pricing and stock opportunities', 'Rank them by value', 'Explain each one in plain words', 'Forecast the impact']],
        ['Human actions', 'verm', ['Review the ranked list', 'Approve, edit or reject', 'Drill down to check products', 'Decide what ships']],
        ['System ops', 'ink', ['Nightly data refresh', 'Recalculate without rejected insights', 'Route insights to the category owner']],
        ['Data', 'ink', ['In: sales, stock, competitor prices', 'Out: ranked insights, projected impact', 'Log: who approved what, and when']],
        ['Constraints', 'mag', ['Never change a price automatically', 'Always show the reason', 'Unreviewed insights never count in totals']],
        ['Touchpoints', 'ink', ['Executive summary', 'Assortment overview', 'Price alerts', 'Export for buying meetings']],
      ];
      const flow = ['Data in', 'AI finds + explains', 'Buyer reviews', 'Approve / reject', 'System recalculates', 'Report'];
      return `
      <div class="atlas">
        <h2>AI interaction map <small>Assortment intelligence</small></h2>
        <div class="atlas-flow">${flow.map((f, i) => `<span class="${i === 2 || i === 3 ? 'human' : ''}">${f}</span>`).join('<b>→</b>')}</div>
        <div class="atlas-cols">${cols.map((c) => `<section class="${c[1]}"><h3>${c[0]}</h3><ul>${c[2].map((t) => `<li>${t}</li>`).join('')}</ul></section>`).join('')}</div>
        <div class="atlas-gap"><b>Missing human-review step, found by mapping:</b> AI insights counted toward projected revenue the moment they were generated. The redesign adds an approval step, and only approved insights change the numbers.</div>
      </div>`;
    },
  };
})();
