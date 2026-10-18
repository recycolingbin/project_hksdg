import { CATEGORIES, LOCATIONS, STORAGE_KEY, dateAfter, daysUntil, initialState, BARCODE_PRODUCTS, addItems, validateState, validItem, statistics, normalizeProduct, normalizeWorkspace, productLabel } from './domain.js';
import { SAMPLES, getSample, sampleDetections, sampleAnnotations, sampleDisplaySize } from './samples.js';
import { STORAGE_SPOTS, shelvesFor, spotLabel, placementLabel } from './home-layout.js';
import { homeHTML, mountHome } from './home-view.js';

const paths = {
  focus: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="4"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 12h18"/><path d="M8 8h8v8H8z" opacity=".4"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 5 9-5M12 12v9M7.5 5l9 5"/>',
  bag: '<path d="M5 7h14l2 14H3zM8 8V6a4 4 0 0 1 8 0v2"/>',
  chart: '<path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/>',
  sprout: '<path d="M12 21v-9M12 16C2 16 2 9 3 6c7 0 10 4 9 10ZM12 12c-1-7 3-10 9-10 1 6-2 10-9 10Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 3m0 3h.01"/>',
  'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevrons: '<path d="m9 8 3-3 3 3m-6 8 3 3 3-3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  camera: '<path d="M8 5 6 8H3v12h18V8h-3l-2-3z"/><circle cx="12" cy="13" r="4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  leaf: '<path d="M20 3C8 1 1 7 5 16c9 5 17-1 15-13ZM3 21 15 9"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14z"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  barcode: '<path d="M3 4v16M7 4v16M10 4v16M14 4v16M17 4v16M21 4v16"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>'
};
const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.box}</svg>`;
document.querySelectorAll('[data-icon]').forEach(element => element.innerHTML = icon(element.dataset.icon));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const labelHTML = item => {
  const product = normalizeProduct(item);
  return `<span class="product-label" title="${escape(productLabel(product))}"><span class="label-brand">${escape(product.brand)}</span><span class="label-divider"> | </span><span class="label-name">${escape(product.name)}</span><span class="label-divider"> | </span><span class="label-category">${escape(product.category)}</span></span>`;
};
const reviewHTML = item => item.reviewNote ? `<small class="product-review">Review: ${escape(item.reviewNote)}</small>` : '';
const emojis = { avocado: '\u{1F951}', milk: '\u{1F95B}', leaf: '\u{1F96C}', eggs: '\u{1F95A}', pasta: '\u{1F35D}', coffee: '\u{2615}', apple: '\u{1F34E}', rice: '\u{1F35A}', yogurt: '\u{1F963}', tea: '\u{1F375}', banana: '\u{1F34C}', tomato: '\u{1F345}', oats: '\u{1F33E}', chocolate: '\u{1F36B}', candy: '\u{1F36C}', can: '\u{1F96B}', box: '\u{1F4E6}' };
const thumb = (item, small = false) => `<span class="product-thumb ${small ? 'compact' : ''} ${escape(item.icon)}" aria-hidden="true">${emojis[item.icon] || emojis.box}</span>`;
const main = document.querySelector('#main');
const modal = document.querySelector('#modal');
let toastTimer;
let state;
let storageAvailable = true;
let startupMessage = '';
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  state = saved ? JSON.parse(saved) : initialState();
  if (!validateState(state)) throw new Error('The saved workspace has an unsupported format.');
  state = normalizeWorkspace(state);
} catch (error) {
  console.error('Unable to load workspace:', error);
  state = initialState();
  storageAvailable = false;
  startupMessage = 'Saved data could not be loaded. Changes are in memory only. Export them before closing, or reset the demo to restore storage.';
}

let page = 'scanner';
let inventoryFilter = 'All items';
let search = '';
let draft = [];
let scanStatus = 'idle';
let scanSource = 'Sample';
let scanStep = 0;
let selected = new Set();
let activeSample = getSample('basket');
let choosingSample = false;
let scanTimer;
let exportUrl = null;
let homeSelectedId = '';
let homeNavigation = {};

function toast(message) {
  const element = document.querySelector('#toast');
  clearTimeout(toastTimer);
  element.textContent = message;
  element.hidden = false;
  toastTimer = setTimeout(() => element.hidden = true, 5500);
}

function persist(next) {
  if (!validateState(next)) throw new Error('The workspace could not be saved because its data is invalid.');
  state = normalizeWorkspace(next);
  if (storageAvailable) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (error) {
      console.error('Unable to save workspace:', error);
      storageAvailable = false;
      toast('Browser storage is unavailable. Changes are in memory only; export your data before closing.');
    }
  }
  updateSidebar();
}

function updateSidebar() {
  document.querySelector('#inventory-count').textContent = state.inventory.length;
  document.querySelector('#shopping-count').textContent = state.shopping.filter(item => !item.checked).length;
  document.querySelector('#notification-dot').hidden = statistics(state).soon + statistics(state).expired === 0;
  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
    if (link.dataset.page === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function expiryBadge(item) {
  const days = daysUntil(item.expiry);
  const label = days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Use today' : days === 1 ? 'Use tomorrow' : `${days} days left`;
  return `<span class="freshness ${days < 0 ? 'expired' : days <= 3 ? 'soon' : ''}"><i></i>${label}</span>`;
}

function statsHTML() {
  const stats = statistics(state);
  return `<div class="stats-grid">
    <div class="stat-card"><span class="stat-icon green">${icon('box')}</span><div><span class="stat-label">In your kitchen</span><div class="stat-value">${stats.total}<span>items in stock</span></div></div><span class="stat-footnote">${state.inventory.length} product batches</span></div>
    <button class="stat-card" data-action="alerts"><span class="stat-icon amber">${icon('clock')}</span><div><span class="stat-label">${stats.expired ? 'Need your attention' : 'Use a little sooner'}</span><div class="stat-value">${stats.soon + stats.expired}<span>${stats.expired ? 'soon or past expiry' : 'expiring in 3 days'}</span></div></div>${icon('arrow-up-right', 'stat-arrow')}</button>
    <a class="stat-card" href="#shopping"><span class="stat-icon lilac">${icon('bag')}</span><div><span class="stat-label">For your next shop</span><div class="stat-value">${state.shopping.filter(item => !item.checked).length}<span>items on your list</span></div></div>${icon('arrow-up-right', 'stat-arrow')}</a>
  </div>`;
}

function annotationHTML() {
  return sampleAnnotations(activeSample.id).map(annotation => {
    const item = draft.find(product => product.id === annotation.productId);
    if (!item) throw new Error(`A scan result is missing for annotation ${annotation.number}.`);
    const label = `${annotation.number}. ${productLabel(item)} (${item.quantity} ${item.quantity === 1 ? 'unit' : 'units'})`;
    return `<div class="detection-box ${item.confidence < 85 ? 'needs-review' : ''}" data-product-id="${escape(item.id)}" style="left:${annotation.left}%;top:${annotation.top}%;width:${annotation.width}%;height:${annotation.height}%" role="img" aria-label="${escape(label)}" title="${escape(label)}"><span><b>${annotation.number}</b><span class="bbox-name">${escape(productLabel(item))}</span></span></div>`;
  }).join('');
}

function scanHTML() {
  const busy = scanStatus === 'scanning';
  const ready = scanStatus === 'ready';
  const saved = scanStatus === 'saved';
  const display = sampleDisplaySize(activeSample);
  return `<div class="scanner-layout">
    <section class="card scanner-card" aria-labelledby="scanner-title">
      <div class="card-header"><div class="section-title">${icon('scan')}<h2 id="scanner-title">Your kitchen, in focus</h2></div><span class="subtle-pill">${icon('sparkle')} Smart scanner</span></div>
      <div class="scan-canvas sample-scene ${busy ? 'is-scanning' : ''} ${ready || saved ? 'has-results' : ''}">
        <div class="photo-frame sample-photo-frame" style="aspect-ratio:${display.width} / ${display.height};width:${Math.min(100, display.width / display.height / 1.45 * 100)}%">
          ${sampleImageHTML(activeSample, `${activeSample.title}; bundled demo photo, results are simulated`, 'grocery-image')}
          ${ready || saved ? annotationHTML() : ''}
        </div>
        <span class="photo-tag">${icon('image')}${escape(activeSample.title)}</span>
        <div class="viewfinder"><i></i><i></i><i></i><i></i></div>
        ${busy ? '<div class="scan-line"></div>' : ''}
        <div class="canvas-bottom"><span class="canvas-status"><i></i>${busy ? 'Simulating recognition' : ready || saved ? 'Demo scan complete' : 'A fresh perspective on your groceries'}</span><span class="canvas-ratio">PHOTO SCAN</span></div>
      </div>
      <div class="scan-controls"><button class="button primary" data-action="demo-scan" ${busy ? 'disabled' : ''}>${icon(busy ? 'clock' : 'scan')}${busy ? ['Finding your groceries...', 'Reading product labels...', 'Preparing your results...'][scanStep] : ready || saved ? 'Scan sample again' : 'Try a demo scan'}${!busy ? icon('arrow') : ''}</button><button class="button secondary" data-action="choose-sample" ${busy ? 'disabled' : ''}>${icon('image')}<span>Choose sample (${SAMPLES.length})</span></button></div>
      <div class="scan-disclaimer">${icon('info')}Sample-only demo: choose one of ${SAMPLES.length} bundled photos. Numbered boxes match the result list after scanning; dashed boxes need review. Boxes are hand-positioned, not live AI. Uploads, camera capture and dropped images are disabled.</div>
    </section>
    <section class="card results-card" aria-labelledby="results-title">
      <div class="card-header"><div class="section-title"><h2 id="results-title">Scan results</h2>${ready || saved ? `<span class="count-badge">${draft.length}</span>` : ''}</div><span class="live-label"><i></i>${busy ? 'Scanning' : ready ? 'Ready to review' : saved ? 'Saved' : 'Ready'}</span></div>
      ${ready ? resultsHTML() : saved ? `<div class="scan-empty saved-state"><div class="empty-orbit">${icon('check')}</div><h3>Nicely stocked.</h3><p>Your reviewed items are now in your kitchen inventory.</p><a class="text-link" href="#inventory">Take a look ${icon('arrow')}</a></div><div class="result-tip">${icon('leaf')}Keep an eye on estimated dates. They are a guide, not a food-safety guarantee.</div>` : busy ? `<div class="scan-empty scanning-state"><div class="empty-orbit"><span class="spinner"></span></div><h3>A little kitchen magic.</h3><p>${['Locating the preset grocery items.', 'Simulating label and product matching.', 'Adding estimated shelf-life dates.'][scanStep]}</p><div class="progress-track"><span style="width:${(scanStep + 1) * 30}%"></span></div><span class="micro-copy">Demo simulation · no AI service connected</span></div>` : `<div class="scan-empty"><div class="empty-orbit">${icon('focus')}<span class="orbit-dot"></span><span class="orbit-dot second"></span></div><h3>Good things come into focus.</h3><p>Scan your groceries and turn<br>the everyday into organized.</p><div class="scan-steps"><span><b>1</b>Snap</span><i></i><span><b>2</b>Review</span><i></i><span><b>3</b>Stock</span></div></div><div class="result-tip">${icon('leaf')}One photo. Multiple groceries.<br>Less effort, less food waste.</div>`}
    </section>
  </div>`;
}

function resultsHTML() {
  return `<div class="results-summary">${icon('check')}${draft.length} product types · ${draft.reduce((total, item) => total + item.quantity, 0)} units<span>Simulated</span></div><p class="label-key">Brand | Item name | Category</p><div class="detected-list">${draft.map((item, index) => `<div class="detected-item"><input type="checkbox" aria-label="Include ${escape(productLabel(item))}" data-select="${item.id}" ${selected.has(item.id) ? 'checked' : ''}>${thumb(item, true)}<div class="detected-info"><strong><span class="detection-number" aria-label="Box ${index + 1}">${index + 1}</span>${labelHTML(item)}</strong><span>${item.quantity} ${item.quantity === 1 ? 'unit' : 'units'} · ${item.confidence}% match ${item.confidence < 85 ? '<b class="review-label">Review</b>' : ''}</span>${reviewHTML(item)}</div><button class="icon-button" data-action="edit-detection" data-id="${item.id}" aria-label="Edit ${escape(productLabel(item))}">${icon('edit')}</button></div>`).join('')}</div><div class="review-note">${icon('info')}Sample-specific, hand-authored results and numbered boxes, not live recognition. One box may group several units. Unclear products and counts need review; hidden items may be missing. Confidence scores and dates are simulated. Check all labels, quantities and printed dates.</div><button class="button primary add-scan" data-action="save-scan" ${selected.size ? '' : 'disabled'}>${icon('plus')}Add ${selected.size} ${selected.size === 1 ? 'product' : 'products'} to inventory</button><button class="text-link barcode-link" data-action="barcode">${icon('barcode')}Try barcode fallback</button>`;
}

function inventoryRows(limit) {
  const query = search.toLowerCase().trim();
  const items = state.inventory.filter(item => {
    const filterMatch = inventoryFilter === 'All items' || (inventoryFilter === 'Use soon' ? daysUntil(item.expiry) <= 3 : item.category === inventoryFilter);
    return filterMatch && `${productLabel(item)} ${item.location} ${placementLabel(item)}`.toLowerCase().includes(query);
  }).sort((a, b) => a.expiry.localeCompare(b.expiry));
  const visible = limit ? items.slice(0, limit) : items;
  if (!visible.length) return `<div class="empty-table">${icon('search')}<h3>${state.inventory.length ? 'Nothing in this corner of the kitchen.' : 'A fresh start for your kitchen.'}</h3><p>${state.inventory.length ? 'Try another search or category.' : 'Scan groceries or add your first item manually.'}</p></div>`;
  return `<div class="table-scroll"><table><thead><tr><th>BRAND | ITEM NAME | CATEGORY</th><th>QUANTITY</th><th>FRESHNESS</th><th>STORAGE</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${visible.map(item => `<tr><td><div class="product-cell">${thumb(item, true)}<div><strong>${labelHTML(item)}</strong><span>${item.estimated ? 'Estimated shelf life' : 'Confirmed expiry date'}</span>${reviewHTML(item)}</div></div></td><td><span class="quantity-number">${item.quantity}</span><span class="unit-label"> ${item.quantity === 1 ? 'unit' : 'units'}</span></td><td>${expiryBadge(item)}</td><td><span class="storage-label">${icon(item.location === 'Pantry' ? 'box' : 'home')}${escape(item.location)}</span></td><td><div class="row-actions"><button class="icon-button" data-action="edit-item" data-id="${escape(item.id)}" aria-label="Edit ${escape(productLabel(item))}">${icon('edit')}</button><button class="icon-button" data-action="consume" data-id="${escape(item.id)}" aria-label="${daysUntil(item.expiry) < 0 ? 'Remove' : 'Use'} one ${escape(productLabel(item))}">${icon('minus')}</button><button class="icon-button" data-action="shop-item" data-id="${escape(item.id)}" aria-label="Add ${escape(productLabel(item))} to shopping list">${icon('bag')}</button></div></td></tr>`).join('')}</tbody></table></div>${limit && items.length > limit ? `<div class="table-bottom">Showing ${visible.length} of ${items.length} product batches<a class="text-link" href="#inventory">View all inventory ${icon('arrow')}</a></div>` : ''}`;
}

function inventoryHTML(full = false) {
  return `<section class="card inventory-card"><div class="inventory-heading"><div><div class="section-title"><h2>${full ? 'Everything in your kitchen' : 'Your pantry, at a glance'}</h2><span class="count-badge">${state.inventory.length}</span></div><p>A place for everything. A little less forgotten.</p></div><button class="button secondary small-button" data-action="manual">${icon('plus')}Add item</button></div><div class="inventory-toolbar"><div class="filter-tabs" role="group" aria-label="Filter inventory">${['All items', 'Produce', 'Dairy & eggs', 'Pantry', ...(full ? ['Beverages'] : []), 'Use soon'].map(filter => `<button data-filter="${escape(filter)}" class="${inventoryFilter === filter ? 'selected' : ''}" aria-pressed="${inventoryFilter === filter}">${filter === 'Use soon' ? icon('clock') : ''}${escape(filter)}</button>`).join('')}</div><label class="search-box">${icon('search')}<input id="inventory-search" type="search" placeholder="Search your pantry..." aria-label="Search inventory" value="${escape(search)}"></label></div><div id="inventory-rows" aria-live="polite">${inventoryRows(full ? undefined : 4)}</div></section>`;
}

function scannerPage() {
  return `<div class="page-heading"><div><span class="eyebrow">${icon('sprout')} A LITTLE MORE MINDFUL, EVERY DAY</span><h1>One photo. A smarter pantry<span>.</span></h1><p>Know what you have. Love what you use. Waste a little less.</p></div><button class="button secondary heading-action" data-action="manual">${icon('plus')}Add manually</button></div>${statsHTML()}${scanHTML()}<div class="section-between"><span>${icon('check')}Your kitchen, a little more together.</span><a href="#inventory" class="text-link">Manage inventory ${icon('arrow')}</a></div>${inventoryHTML()}`;
}

function shoppingPage() {
  const low = state.inventory.filter(item => item.quantity === 1 && !state.shopping.some(row => productLabel(row).toLowerCase() === productLabel(item).toLowerCase()));
  const checked = state.shopping.filter(item => item.checked).length;
  return `<div class="page-heading"><div><span class="eyebrow">${icon('bag')} BUY WHAT YOU NEED</span><h1>A more thoughtful shop<span>.</span></h1><p>A little planning goes a long way. Your list stays on this device.</p></div><button class="button secondary" data-action="clear-checked" ${checked ? '' : 'disabled'}>${icon('check')}Clear completed (${checked})</button></div><div class="shopping-layout"><section class="card shopping-card"><div class="card-header"><h2>Your shopping list</h2><span class="count-badge">${state.shopping.filter(item => !item.checked).length} to get</span></div><form id="shopping-form" class="shopping-add"><label class="field">Brand<input name="brand" maxlength="60" placeholder="Unbranded"></label><label class="field">Item name<input name="name" required maxlength="80" placeholder="What do you need?"></label><label class="field">Category<select name="category">${['Uncategorized', ...CATEGORIES].map(category => `<option>${escape(category)}</option>`).join('')}</select></label><button class="button primary" type="submit">${icon('plus')}Add</button></form><div class="shopping-items">${state.shopping.length ? state.shopping.map(item => `<div class="shopping-row ${item.checked ? 'completed' : ''}"><label><input type="checkbox" data-shopping-check="${escape(item.id)}" ${item.checked ? 'checked' : ''}>${labelHTML(item)}</label><button class="icon-button" data-action="delete-shopping" data-id="${escape(item.id)}" aria-label="Remove ${escape(productLabel(item))}">${icon('trash')}</button></div>`).join('') : '<div class="empty-table"><h3>A clean slate.</h3><p>Add an item above, or choose a refill reminder.</p></div>'}</div><p class="panel-footnote">${icon('info')}Checking off an item does not add it to inventory. Scan or add your purchases when you get home.</p></section><section class="card refill-card"><div class="card-header"><h2>A little low on these</h2>${icon('bag')}</div><p class="card-intro">One unit left in each batch. Add a refill if you need one.</p>${low.length ? low.map(item => `<div class="refill-row">${thumb(item, true)}<div><strong>${labelHTML(item)}</strong><span>1 unit left · ${escape(item.location)}</span></div><button class="icon-button refill-add" data-action="shop-item" data-id="${escape(item.id)}" aria-label="Add ${escape(productLabel(item))} to shopping list">${icon('plus')}</button></div>`).join('') : '<p class="card-intro">All low-stock items are already on your list.</p>'}</section></div>`;
}

function insightsPage() {
  const stats = statistics(state);
  const total = stats.total;
  const recent = state.scans.slice(0, 5).map(scan => ({
    ...scan,
    source: escape(scan.sampleName ? `${scan.source} · ${scan.sampleName}` : scan.source)
  }));
  return `<div class="page-heading"><div><span class="eyebrow">${icon('chart')} SMALL HABITS, FRESH PERSPECTIVES</span><h1>Get to know your kitchen<span>.</span></h1><p>Real counts from your local demo workspace. No invented impact scores.</p></div><button class="button secondary" data-action="export">${icon('download')}Export data</button></div>${statsHTML()}<div class="insights-layout"><section class="card"><div class="card-header"><h2>A well-rounded pantry</h2>${icon('box')}</div><div class="category-chart">${CATEGORIES.map((category, index) => { const count = state.inventory.filter(item => item.category === category).reduce((sum, item) => sum + item.quantity, 0); return `<div class="chart-row"><div><strong>${escape(category)}</strong><span>${count} units</span></div><div class="chart-track"><span class="chart-color-${index}" style="width:${total ? count / total * 100 : 0}%"></span></div></div>`; }).join('')}</div><div class="insight-note">${icon('leaf')}You have marked <strong>${state.used} ${state.used === 1 ? 'unit' : 'units'} as used</strong> in this demo. This is not a verified measure of food waste prevented.</div></section><section class="card"><div class="card-header"><h2>Your recent scans</h2><span class="count-badge">${state.scans.length}</span></div>${recent.length ? `<div class="recent-scans">${recent.map(scan => `<div class="recent-scan"><span class="stat-icon green">${icon('scan')}</span><div><strong>${scan.count} ${scan.count === 1 ? 'product' : 'products'} added</strong><span>${escape(new Date(scan.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))} · ${scan.source}</span></div><span class="subtle-pill">Demo</span></div>`).join('')}</div>` : `<div class="empty-table">${icon('scan')}<h3>Your first scan is a fresh start.</h3><p>Review a demo scan and add products to see it here.</p><a href="#scanner" class="text-link">Try the scanner ${icon('arrow')}</a></div>`}</section></div><div class="card data-card"><div><h2>Your data, your device.</h2><p>${storageAvailable ? 'Inventory and lists are saved in this browser. There is no cloud sync or account.' : 'Browser storage is unavailable. Export your changes before closing this tab.'}</p></div><button class="button secondary" data-action="reset">${icon('trash')}Reset demo</button></div>`;
}

function render() {
  const names = { scanner: 'Overview', inventory: 'My inventory', home: 'My home', shopping: 'Shopping list', insights: 'Kitchen insights' };
  document.querySelector('#breadcrumb-current').textContent = names[page];
  document.title = `${names[page]} — VisionStock`;
  updateSidebar();
  main.innerHTML = `${!storageAvailable ? '<div class="storage-warning" role="alert">Browser storage is unavailable. Your changes are in memory only. Export them from Kitchen insights before closing.</div>' : ''}${page === 'scanner' ? scannerPage() : page === 'home' ? homeHTML(state.inventory, homeSelectedId, thumb, homeNavigation) : page === 'inventory' ? `<div class="page-heading"><div><span class="eyebrow">${icon('box')} A HOME FOR YOUR GROCERIES</span><h1>A little more organized<span>.</span></h1><p>Keep the good stuff in sight, and the forgotten things to a minimum.</p></div><a class="button primary" href="#scanner">${icon('scan')}Scan groceries</a></div>${statsHTML()}${inventoryHTML(true)}` : page === 'shopping' ? shoppingPage() : insightsPage()}`;
  if (page === 'home') mountHome(main, id => {
    homeSelectedId = id;
    homeNavigation = {};
    render();
    const detail = main.querySelector('#interior-title');
    detail.setAttribute('tabindex', '-1');
    detail.focus({ preventScroll: true });
    detail.scrollIntoView({ block: 'nearest' });
  }, (navigation, focusSelector) => {
    homeSelectedId = '';
    homeNavigation = navigation;
    render();
    main.querySelector(focusSelector).focus({ preventScroll: true });
  });
  enhanceInventoryLocations();
}

function enhanceInventoryLocations() {
  main.querySelectorAll('tr').forEach(row => {
    const id = row.querySelector('[data-action="edit-item"]')?.dataset.id;
    if (!id) return;
    const item = state.inventory.find(entry => entry.id === id);
    const cell = row.querySelector('.storage-label')?.parentElement;
    if (!item || !cell) return;
    cell.innerHTML = `<span class="storage-label">${escape(placementLabel(item))}</span><button class="text-link home-find" data-action="find-home" data-id="${escape(id)}" aria-label="Find ${escape(productLabel(item))} in home">${icon('home')}Find in home</button>`;
  });
}

function route() {
  const requested = location.hash.slice(1);
  page = ['scanner', 'inventory', 'home', 'shopping', 'insights'].includes(requested) ? requested : 'scanner';
  setMobileMenu(false);
  render();
}

const mobileLayout = window.matchMedia('(max-width: 760px)');

function setMobileMenu(open) {
  const sidebar = document.querySelector('#sidebar');
  sidebar.classList.toggle('open', open);
  sidebar.inert = mobileLayout.matches && !open;
  if (sidebar.inert) sidebar.setAttribute('aria-hidden', 'true');
  else sidebar.removeAttribute('aria-hidden');
  document.querySelector('#menu-button').setAttribute('aria-expanded', String(open));
}

function showModal(title, content, className = '') {
  clearExport();
  modal.className = className;
  document.querySelector('#modal-content').innerHTML = `<div class="modal-header"><h2 id="modal-title">${escape(title)}</h2><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div>${content}`;
  if (!modal.open) modal.showModal();
}

function closeModal() {
  clearExport();
  modal.close();
}

function clearExport() {
  if (exportUrl) URL.revokeObjectURL(exportUrl);
  exportUrl = null;
}

function productForm(item, mode) {
  const product = normalizeProduct(item || { name: '', quantity: 1, category: 'Produce', location: 'Fridge', expiry: dateAfter(5), estimated: true });
  showModal(mode === 'detection' ? 'Review detected product' : mode === 'barcode' ? 'Review barcode product' : item ? 'Edit inventory item' : 'Add a little something', `<form id="product-form" data-mode="${mode}" data-id="${escape(item?.id || '')}" data-product-icon="${escape(product.icon || 'box')}"><p class="modal-intro">Brand | Item name | Category. ${mode === 'detection' ? 'These are preset demo details. Correct them before adding.' : 'Keep each detail in its own field.'} Leave brand blank if unknown.</p><label class="field">Brand<input name="brand" value="${escape(product.brand === 'Unbranded' ? '' : product.brand)}" maxlength="60" placeholder="Unbranded"></label><label class="field">Item name<input name="name" value="${escape(product.name)}" required maxlength="80" placeholder="e.g. Cherry tomatoes"></label><div class="form-grid"><label class="field">Category<select name="category">${CATEGORIES.map(category => `<option ${product.category === category ? 'selected' : ''}>${escape(category)}</option>`).join('')}</select></label><label class="field">Quantity<input name="quantity" type="number" min="1" max="999" step="1" value="${product.quantity}" required></label><label class="field">Storage<select name="location">${LOCATIONS.map(location => `<option ${product.location === location ? 'selected' : ''}>${location}</option>`).join('')}</select></label><label class="field">Expiry / use-by date<input name="expiry" type="date" value="${escape(product.expiry)}" required></label></div><label class="field">Review note<input name="reviewNote" value="${escape(product.reviewNote)}" maxlength="200" placeholder="e.g. Check quantity or unreadable label"></label><label class="field">Date source<select name="estimated"><option value="true" ${product.estimated ? 'selected' : ''}>Estimated shelf life</option><option value="false" ${!product.estimated ? 'selected' : ''}>Printed expiry (I have checked)</option></select></label><p class="form-note">${icon('info')}Freshness estimates are a planning guide, not a safety assessment. Always check the label and condition of your food.</p><div class="form-error" role="alert" hidden></div><div class="modal-actions"><button type="button" class="button secondary" data-action="close-modal">Cancel</button><button type="submit" class="button primary">${icon('check')}${mode === 'detection' || mode === 'inventory' ? 'Save changes' : 'Add to inventory'}</button></div></form>`);
  const storageField = document.createElement('label');
  storageField.className = 'field';
  storageField.innerHTML = `Home storage spot<select name="storageSpot">${storageOptions(product.location, product.storageSpot)}</select>`;
  document.querySelector('#product-form [name="reviewNote"]').closest('label').before(storageField);
  const shelfField = document.createElement('label');
  shelfField.className = 'field';
  shelfField.innerHTML = `Shelf / layer<select name="storageShelf" ${product.storageSpot === undefined ? 'disabled' : ''}>${shelfOptions(product.storageSpot, product.storageShelf)}</select><small>Choose a specific home storage spot first. Leave the layer unassigned if you have not checked it.</small>`;
  storageField.after(shelfField);
}

function shelfOptions(spotId, selectedShelf) {
  const spot = STORAGE_SPOTS.find(spot => spot.id === spotId);
  return `<option value="">Layer not assigned</option>${spot ? shelvesFor(spot).map(shelf => `<option value="${shelf.id}" ${shelf.id === selectedShelf ? 'selected' : ''}>${escape(shelf.name)}</option>`).join('') : ''}`;
}

function storageOptions(location, selectedSpot) {
  return `<option value="" ${selectedSpot === undefined ? 'selected' : ''}>Suggested demo placement (not confirmed)</option>${STORAGE_SPOTS.filter(spot => spot.location === location).map(spot => `<option value="${spot.id}" ${spot.id === selectedSpot ? 'selected' : ''}>${escape(spotLabel(spot))}</option>`).join('')}`;
}

function alerts() {
  const items = state.inventory.filter(item => daysUntil(item.expiry) <= 3).sort((a, b) => a.expiry.localeCompare(b.expiry));
  showModal('A little freshness check', `<p class="modal-intro">Products expiring within three days or already past their date. Estimated dates are not food-safety guarantees.</p><div class="alert-items">${items.length ? items.map(item => `<div class="alert-row">${thumb(item)}<div><strong>${labelHTML(item)}</strong><span>${escape(item.location)} · ${item.estimated ? 'Estimated date' : 'Confirmed date'}</span>${reviewHTML(item)}</div>${expiryBadge(item)}</div>`).join('') : '<div class="empty-table"><h3>Looking fresh.</h3><p>No items are due within the next three days.</p></div>'}</div><div class="modal-actions"><button class="button primary" data-action="view-soon">Review inventory ${icon('arrow')}</button></div>`);
}

function beginScan() {
  if (scanStatus === 'scanning') return;
  const sampleId = activeSample.id;
  getSample(sampleId);
  draft = [];
  selected.clear();
  scanStatus = 'scanning';
  scanStep = 0;
  if (page !== 'scanner') location.hash = 'scanner';
  else render();
  clearInterval(scanTimer);
  scanTimer = setInterval(() => {
    scanStep += 1;
    if (scanStep === 3) {
      clearInterval(scanTimer);
      draft = sampleDetections(sampleId);
      selected = new Set(draft.map(item => item.id));
      scanStatus = 'ready';
      toast(`Demo scan complete. Review ${draft.length} preset product types for ${activeSample.title}.`);
    }
    if (page === 'scanner') render();
  }, 850);
}

function chooseSample() {
  if (scanStatus === 'scanning') throw new Error('Wait for the current scan to finish before changing samples.');
  showModal('Choose a sample photo', `<p class="modal-intro">Explore ${SAMPLES.length} bundled scenes. Each has different, editable preset results. Selecting a photo clears unsaved scan results; your inventory is unchanged. External images cannot be imported.</p><div class="sample-grid">${SAMPLES.map(entry => `<button class="sample-option ${entry.id === activeSample.id ? 'selected' : ''}" data-action="select-sample" data-id="${entry.id}" aria-pressed="${entry.id === activeSample.id}">${sampleThumbnailHTML(entry)}<strong>${escape(entry.title)}</strong><span>${entry.id === activeSample.id ? 'Selected' : 'Use this sample'}</span></button>`).join('')}</div><p id="sample-status" class="modal-intro" role="status"></p>`, 'sample-modal');
}

function sampleImageHTML(entry, alt, className = '') {
  const display = sampleDisplaySize(entry);
  const style = entry.rotation === 90 ? ` style="position:absolute;left:50%;top:50%;width:${entry.width / display.width * 100}%;height:${entry.height / display.height * 100}%;max-width:none;transform:translate(-50%,-50%) rotate(90deg)"` : '';
  return `<img src="/${encodeURI(entry.file)}" alt="${escape(alt)}" class="${className}"${style}>`;
}

function sampleThumbnailHTML(entry) {
  if (entry.rotation !== 90) return `<img src="/${encodeURI(entry.file)}" alt="" loading="lazy">`;
  const display = sampleDisplaySize(entry);
  return `<span class="rotated-sample-thumbnail" style="aspect-ratio:${display.width}/${display.height}">${sampleImageHTML(entry, '')}</span>`;
}

async function selectSample(id) {
  if (scanStatus === 'scanning') throw new Error('Wait for the current scan to finish before changing samples.');
  if (choosingSample) throw new Error('A sample is already loading. Please wait.');
  const entry = getSample(id);
  choosingSample = true;
  const status = document.querySelector('#sample-status');
  const image = new Image();
  image.src = `/${encodeURI(entry.file)}`;
  try {
    if (status) status.textContent = `Loading ${entry.title}...`;
    await image.decode();
    if (!image.naturalWidth) throw new Error('The sample photo has no readable dimensions.');
    if (!modal.open || !status?.isConnected) return;
    activeSample = entry;
    scanStatus = 'idle';
    draft = [];
    selected.clear();
    closeModal();
    render();
    toast(`${entry.title} selected. Start a demo scan when ready.`);
  } catch (error) {
    console.error('Sample could not be loaded:', error);
    const message = `Unable to load ${entry.title}. Check that the bundled image is available and try again.`;
    if (status?.isConnected) {
      status.textContent = message;
      status.className = 'form-error';
      status.setAttribute('role', 'alert');
    }
    throw new Error(message);
  } finally {
    choosingSample = false;
  }
}

function addToShopping(details) {
  const product = normalizeProduct(details);
  const label = productLabel(product);
  const existing = state.shopping.find(item => productLabel(item).toLowerCase() === label.toLowerCase());
  if (existing && !existing.checked) { toast(`${label} is already on your shopping list.`); return; }
  const shopping = existing ? state.shopping.map(item => item.id === existing.id ? { ...item, checked: false } : item) : [...state.shopping, { id: crypto.randomUUID(), brand: product.brand, name: product.name, category: product.category, checked: false }];
  persist({ ...state, shopping });
  render();
  toast(`${label} added to your next shop.`);
}

const actions = {
  'find-home': id => {
    if (!state.inventory.some(item => item.id === id)) throw new Error('This food item is no longer in inventory.');
    homeSelectedId = id;
    if (page === 'home') render();
    else location.hash = 'home';
  },
  'demo-scan': beginScan,
  'choose-sample': chooseSample,
  'select-sample': selectSample,
  alerts,
  manual: () => productForm(null, 'manual'),
  'edit-item': id => productForm(state.inventory.find(item => item.id === id), 'inventory'),
  'edit-detection': id => productForm(draft.find(item => item.id === id), 'detection'),
  'close-modal': closeModal,
  'view-soon': () => { inventoryFilter = 'Use soon'; search = ''; closeModal(); if (page === 'inventory') render(); else location.hash = 'inventory'; },
  'save-scan': () => {
    if (scanStatus !== 'ready') return;
    const items = draft.filter(item => selected.has(item.id));
    if (!items.length) throw new Error('Select at least one product to add.');
    persist({ ...state, inventory: addItems(state.inventory, items), scans: [{ id: crypto.randomUUID(), at: new Date().toISOString(), count: items.length, source: scanSource, sampleId: activeSample.id, sampleName: activeSample.title }, ...state.scans] });
    scanStatus = 'saved';
    render();
    toast(`${items.length} reviewed products added to your kitchen${storageAvailable ? ' and saved on this device' : ' for this session'}.`);
  },
  consume: id => {
    const item = state.inventory.find(item => item.id === id);
    if (!item) return;
    const expired = daysUntil(item.expiry) < 0;
    persist({ ...state, inventory: state.inventory.flatMap(row => row.id !== id ? [row] : row.quantity > 1 ? [{ ...row, quantity: row.quantity - 1 }] : []), used: state.used + (expired ? 0 : 1) });
    render();
    toast(`One ${productLabel(item)} ${expired ? 'removed from inventory' : 'marked as used'}.`);
  },
  'shop-item': id => { const item = state.inventory.find(row => row.id === id); if (item) addToShopping(item); },
  'delete-shopping': id => { persist({ ...state, shopping: state.shopping.filter(item => item.id !== id) }); render(); toast('Item removed from your shopping list.'); },
  'clear-checked': () => { persist({ ...state, shopping: state.shopping.filter(item => !item.checked) }); render(); toast('Completed items cleared.'); },
  barcode: () => showModal('Barcode fallback', `<p class="modal-intro">Demo lookup only. Enter one of the sample barcodes below; this does not use a live product database or camera barcode reader.</p><form id="barcode-form"><label class="field">Product barcode<input name="barcode" inputmode="numeric" pattern="[0-9]{13}" maxlength="13" required placeholder="Enter a 13-digit sample barcode"></label><div class="sample-barcodes"><button type="button" class="button secondary" data-action="barcode-sample" data-id="1234567890128">Oat milk · 1234567890128</button><button type="button" class="button secondary" data-action="barcode-sample" data-id="4006381333931">Rolled oats · 4006381333931</button></div><div class="form-error" role="alert" hidden></div><div class="modal-actions"><button class="button primary" type="submit">${icon('barcode')}Look up product</button></div></form>`),
  'barcode-sample': id => { document.querySelector('[name="barcode"]').value = id; },
  export: () => {
    const json = JSON.stringify(state, null, 2);
    showModal('Take your kitchen with you', `<p class="modal-intro">Download your workspace as JSON, or copy it from the field below if downloads are unavailable in your browser preview.</p><label class="field">Workspace JSON<textarea id="export-json" class="export-json" readonly spellcheck="false">${escape(json)}</textarea></label><div class="modal-actions"><button class="button secondary" data-action="copy-export">Copy JSON</button><a class="button primary" id="export-download" download="visionstock-${dateAfter(0)}.json">${icon('download')}Download JSON</a></div>`);
    exportUrl = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    document.querySelector('#export-download').href = exportUrl;
  },
  'copy-export': async () => {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable. Select the JSON text and copy it manually.');
    await navigator.clipboard.writeText(document.querySelector('#export-json').value);
    toast('Workspace JSON copied to your clipboard.');
  },
  reset: () => showModal('Start fresh?', '<p class="modal-intro">This removes your saved demo inventory, shopping list, and scan history in this browser and restores the sample kitchen. Export your data first if you want to keep it.</p><div class="modal-actions"><button class="button secondary" data-action="close-modal">Keep my kitchen</button><button class="button danger" data-action="confirm-reset">Reset demo data</button></div>'),
  'confirm-reset': () => {
    clearInterval(scanTimer);
    const next = initialState();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); storageAvailable = true; }
    catch (error) { console.error('Unable to reset saved workspace:', error); throw new Error('The browser could not reset saved data. Check your storage permissions and try again.'); }
    state = next;
    scanStatus = 'idle';
    draft = [];
    selected.clear();
    inventoryFilter = 'All items';
    search = '';
    homeSelectedId = '';
    homeNavigation = {};
    activeSample = getSample('basket');
    scanSource = 'Sample';
    closeModal();
    render();
    toast('A fresh start. The sample kitchen has been restored.');
  }
};

document.addEventListener('click', async event => {
  const actionButton = event.target.closest('[data-action]');
  if (actionButton && !actionButton.disabled) {
    try { await actions[actionButton.dataset.action]?.(actionButton.dataset.id); }
    catch (error) { console.error('Action failed:', error); toast(error.message || 'Something went wrong. Please try again.'); }
  }
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    inventoryFilter = filter.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => { button.classList.toggle('selected', button.dataset.filter === inventoryFilter); button.setAttribute('aria-pressed', String(button.dataset.filter === inventoryFilter)); });
    document.querySelector('#inventory-rows').innerHTML = inventoryRows(page === 'scanner' ? 4 : undefined);
    enhanceInventoryLocations();
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'inventory-search') {
    search = event.target.value;
    document.querySelector('#inventory-rows').innerHTML = inventoryRows(page === 'scanner' ? 4 : undefined);
    enhanceInventoryLocations();
  }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('#product-form [name="location"]')) {
    document.querySelector('#product-form [name="storageSpot"]').innerHTML = storageOptions(target.value);
  }
  if (target.matches('#product-form [name="location"], #product-form [name="storageSpot"]')) {
    const spotId = document.querySelector('#product-form [name="storageSpot"]').value;
    const shelf = document.querySelector('#product-form [name="storageShelf"]');
    shelf.innerHTML = shelfOptions(spotId);
    shelf.disabled = !spotId;
  }
  if (target.dataset.select) {
    if (target.checked) selected.add(target.dataset.select);
    else selected.delete(target.dataset.select);
    const button = document.querySelector('[data-action="save-scan"]');
    button.disabled = !selected.size;
    button.innerHTML = `${icon('plus')}Add ${selected.size} ${selected.size === 1 ? 'product' : 'products'} to inventory`;
  }
  if (target.dataset.shoppingCheck) {
    try {
      persist({ ...state, shopping: state.shopping.map(item => item.id === target.dataset.shoppingCheck ? { ...item, checked: target.checked } : item) });
      render();
    } catch (error) { console.error('Unable to update list:', error); toast(error.message); }
  }
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (!['product-form', 'shopping-form', 'barcode-form'].includes(form.id)) return;
  event.preventDefault();
  const data = new FormData(form);
  try {
    if (form.id === 'product-form') {
      const mode = form.dataset.mode;
      const previous = mode === 'detection' ? draft.find(item => item.id === form.dataset.id) : state.inventory.find(item => item.id === form.dataset.id);
      const product = normalizeProduct({ ...previous, id: previous?.id || crypto.randomUUID(), brand: String(data.get('brand')).trim(), name: String(data.get('name')).trim(), reviewNote: String(data.get('reviewNote')).trim(), quantity: Number(data.get('quantity')), category: String(data.get('category')), location: String(data.get('location')), expiry: String(data.get('expiry')), estimated: data.get('estimated') === 'true', icon: previous?.icon || form.dataset.productIcon || 'box' });
      if (data.get('storageSpot')) product.storageSpot = String(data.get('storageSpot'));
      else delete product.storageSpot;
      if (data.get('storageShelf')) product.storageShelf = String(data.get('storageShelf'));
      else delete product.storageShelf;
      if (!validItem(product)) throw new Error('Enter valid brand and item details without pipe (|) separators, a whole-number quantity from 1 to 999, a valid expiry date, and a compatible storage spot and shelf.');
      if (mode === 'detection') draft = draft.map(item => item.id === product.id ? product : item);
      else persist({ ...state, inventory: previous ? state.inventory.map(item => item.id === product.id ? product : item) : addItems(state.inventory, [product]) });
      closeModal();
      render();
      toast(mode === 'detection' ? 'Product details updated. Add the reviewed products when you are ready.' : previous ? 'Your product details have been updated.' : `${productLabel(product)} added to your kitchen.`);
    } else if (form.id === 'shopping-form') {
      const name = String(data.get('name')).trim();
      if (!name) throw new Error('Enter a product name for your shopping list.');
      addToShopping({ name, brand: String(data.get('brand')).trim(), category: String(data.get('category')) });
    } else {
      const product = BARCODE_PRODUCTS[String(data.get('barcode'))];
      if (!product) throw new Error('No demo product matches this barcode. Try a sample barcode, or add the product manually.');
      productForm({ id: crypto.randomUUID(), name: product.name, category: product.category, location: product.location, quantity: 1, expiry: dateAfter(product.days), estimated: true, icon: product.icon }, 'barcode');
    }
  } catch (error) {
    console.error('Form could not be submitted:', error);
    const inline = form.querySelector('.form-error');
    if (inline) { inline.textContent = error.message; inline.hidden = false; }
    else toast(error.message);
  }
});

document.addEventListener('dragover', event => {
  if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
});
document.addEventListener('drop', event => {
  if (!event.dataTransfer?.files.length) return;
  event.preventDefault();
  toast('External images cannot be imported. Use Choose sample to select a bundled photo.');
});
modal.addEventListener('close', clearExport);
modal.addEventListener('click', event => { if (event.target === modal) { const rect = modal.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeModal(); } });
document.querySelector('#help-button').addEventListener('click', () => showModal('Meet your more mindful kitchen', `<div class="help-step"><span>01</span><div><h3>Choose a fresh perspective</h3><p>Use Choose sample to browse ${SAMPLES.length} bundled photos, including the original basket and 16 additional scenes. File uploads, camera capture and drag-and-drop imports are disabled.</p></div></div><div class="help-step"><span>02</span><div><h3>A little human review</h3><p>Each sample has its own hand-authored product list, not live AI recognition. Check unclear labels, quantities and dates. Hidden items may be missing. The barcode fallback remains a two-product demo lookup.</p></div></div><div class="help-step"><span>03</span><div><h3>A place for everything</h3><p>Add reviewed products to inventory, mark units used, and build a shopping list. Changing samples clears unsaved results but never changes your inventory. Matching batches merge; different expiry dates stay separate.</p></div></div><p class="form-note">${icon('info')}Freshness estimates are not a food-safety guarantee. Inventory is saved in this browser only. No AI, cloud services, external notifications or price comparison is connected.</p><div class="modal-actions"><button class="button primary" data-action="close-modal">Sounds fresh ${icon('check')}</button></div>`));
document.querySelector('#notifications-button').addEventListener('click', alerts);
document.querySelector('#menu-button').addEventListener('click', () => {
  setMobileMenu(!document.querySelector('#sidebar').classList.contains('open'));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMobileMenu(false);
});
mobileLayout.addEventListener('change', () => setMobileMenu(false));
window.addEventListener('hashchange', () => { if (location.hash !== '#main') route(); });
window.addEventListener('beforeunload', () => { clearExport(); clearInterval(scanTimer); });
document.querySelector('#today').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
route();
if (startupMessage) toast(startupMessage);
