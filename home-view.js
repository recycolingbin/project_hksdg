import { ROOMS, STORAGE_SPOTS, storageSpot, storageShelf, shelvesFor, placementLabel } from './home-layout.js';
import { productLabel } from './domain.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function resolveHomeView(inventory, selectedId, navigation = {}) {
  const item = inventory.find(row => row.id === selectedId) || null;
  const room = item ? storageSpot(item).room : ROOMS.find(room => room.name === navigation.room)?.name || ROOMS[0].name;
  const spots = STORAGE_SPOTS.filter(spot => spot.room === room);
  const spot = item ? storageSpot(item) : spots.find(spot => spot.id === navigation.spotId) || spots[0];
  return { item, room, spots, spot, shelf: item ? storageShelf(item) : null };
}

function furnitureArt(spot) {
  const surface = ['dining-table', 'study-desk'].includes(spot.id);
  return `<span class="storage-art ${surface ? 'art-surface' : 'art-cabinet'} ${spot.location !== 'Pantry' ? 'art-cold' : ''}" aria-hidden="true"><span></span><span></span><span></span></span>`;
}

function foodButton(row, item, thumb, className = '') {
  return `<button class="shelf-product ${row.id === item?.id ? 'selected-product' : ''} ${className}" data-home-select="${escape(row.id)}" aria-label="Find ${escape(productLabel(row))}" ${row.id === item?.id ? 'aria-current="true"' : ''}>${thumb(row, true)}<span><strong>${escape(row.name)}</strong><small>${escape(row.brand)} · ${row.quantity} ${row.quantity === 1 ? 'unit' : 'units'}</small></span><span class="food-direction" aria-hidden="true">&#8594;</span></button>`;
}

function interiorHTML(inventory, item, spot, shelf, thumb) {
  const placed = inventory.filter(row => row.storageSpot === spot.id);
  const unassigned = placed.filter(row => row.storageShelf === undefined);
  const suggested = inventory.filter(row => row.storageSpot === undefined && storageSpot(row).id === spot.id);
  return `<section class="home-interior" aria-labelledby="interior-title">
    <div class="interior-heading"><div><span class="home-kicker">SHELF VIEW</span><h2 id="interior-title">${escape(spot.name)}</h2><p>${escape(spot.room)} <span aria-hidden="true">/</span> ${shelvesFor(spot).length} ${shelvesFor(spot).length === 1 ? 'surface' : 'layers'}</p></div><span class="interior-pill">${spot.location === 'Fridge' ? 'Chilled' : spot.location === 'Freezer' ? 'Frozen' : 'Dry storage'}</span></div>
    ${item ? `<div class="home-location-banner ${shelf ? 'location-confirmed' : ''}" role="status">${shelf ? `<span class="location-check" aria-hidden="true">&#10003;</span><div><strong>${escape(item.name)} is on the ${escape(shelf.name.toLowerCase())}</strong><span>${escape(placementLabel(item))}</span></div>` : `<div><strong>${item.storageSpot === undefined ? 'Suggested location, not yet confirmed' : 'Storage saved. Shelf not assigned.'}</strong><span>No shelf is assumed. Edit the location to save where this food belongs.</span></div>`}<button class="button secondary small-button" data-action="edit-item" data-id="${escape(item.id)}">Edit location</button></div>` : ''}
    <div class="storage-cutaway ${spot.location !== 'Pantry' ? 'cutaway-fridge' : ''} ${shelvesFor(spot).length === 1 ? 'cutaway-surface' : ''}">
    <div class="cutaway-top"><span></span><span>FRONT VIEW</span><span></span></div>
    <div class="cutaway-body">${shelvesFor(spot).map((layer, index) => {
      const active = shelf?.id === layer.id;
      const items = placed.filter(row => row.storageShelf === layer.id);
      const drawer = ['crisper', 'upper', 'lower'].includes(layer.id);
      return `<div class="cutaway-layer ${active ? 'selected-layer' : ''} ${drawer ? 'is-drawer' : ''}" ${active ? 'aria-current="location"' : ''}>
        <div class="layer-caption"><span class="layer-number">${String(index + 1).padStart(2, '0')}</span><strong>${escape(layer.name)}</strong><span class="layer-count">${items.length} ${items.length === 1 ? 'batch' : 'batches'}</span>${active ? '<span class="layer-here">FOUND HERE</span>' : ''}</div>
        <div class="shelf-contents">${items.length ? items.map(row => foodButton(row, item, thumb)).join('') : '<span class="shelf-empty">No food assigned</span>'}</div>
      </div>`;
    }).join('')}</div><div class="cutaway-plinth"></div></div>
    ${unassigned.length ? `<div class="home-unassigned"><div class="home-section-label"><h3>Shelf not assigned</h3><span>${unassigned.length}</span></div><p>Saved in this storage, but not on a specific layer.</p><div class="home-food-grid">${unassigned.map(row => foodButton(row, item, thumb)).join('')}</div></div>` : ''}
    ${suggested.length ? `<div class="home-unassigned suggested-food"><div class="home-section-label"><h3>Suggested placements</h3><span>${suggested.length}</span></div><p>Based on storage type only. Select food and edit its location to confirm.</p><div class="home-food-grid">${suggested.map(row => foodButton(row, item, thumb)).join('')}</div></div>` : ''}
    <p class="home-demo-note">Demo layout · Food appears on a shelf only after you save its layer. “No food assigned” does not mean your physical shelf is empty.</p>
  </section>`;
}

export function homeHTML(inventory, selectedId, thumb, navigation = {}) {
  const { item, room, spots, spot, shelf } = resolveHomeView(inventory, selectedId, navigation);
  return `<div class="page-heading"><div><span class="eyebrow">A PLACE FOR EVERYTHING</span><h1>Your home, organized<span>.</span></h1><p>Choose a room. Open a storage spot. Find exactly what you need.</p></div><a class="button secondary" href="#inventory">Manage inventory</a></div>
    <section class="home-room-picker" aria-label="Choose a room">${ROOMS.map((entry, index) => {
      const count = inventory.filter(row => row.storageSpot !== undefined && storageSpot(row).room === entry.name).length;
      return `<button class="home-room-card ${room === entry.name ? 'selected-room' : ''}" data-home-room="${escape(entry.name)}" aria-pressed="${room === entry.name}"><span class="room-plan room-plan-${index}" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>${escape(entry.name)}</strong><small>${count} saved ${count === 1 ? 'batch' : 'batches'}</small></span><span class="room-selected-mark" aria-hidden="true">${room === entry.name ? '&#10003;' : '&#8594;'}</span></button>`;
    }).join('')}</section>
    <div class="home-layout"><aside class="card home-controls" aria-label="Find food"><span class="home-kicker">QUICK FIND</span><h2>Looking for something?</h2>
      <label class="home-search-label" for="home-search">Search food</label><input id="home-search" type="search" placeholder="Try milk, rice, chocolate..." autocomplete="off" aria-controls="home-food-list">
      <div class="home-search-summary" role="status" id="home-search-summary">${inventory.length} food ${inventory.length === 1 ? 'batch' : 'batches'}</div>
      <div class="home-food-list" id="home-food-list">${inventory.map(row => `<div data-home-query="${escape(`${productLabel(row)} ${placementLabel(row)}`.toLowerCase())}">${foodButton(row, item, thumb)}</div>`).join('')}</div>
      <p id="home-no-results" hidden>No matching food. Try a different name, brand, room, or shelf.</p>
      ${!inventory.length ? '<p class="home-empty">Your inventory is empty. Add food to start organizing your home.</p><button class="button secondary" data-action="manual">Add food</button>' : ''}
    </aside><div class="home-visuals"><section class="home-storage-picker" aria-labelledby="home-storage-title"><div class="home-section-label"><h2 id="home-storage-title">${escape(room)}</h2><span>Choose storage</span></div><div class="home-storage-cards" role="group" aria-label="Storage in ${escape(room)}">${spots.map(entry => {
      const count = inventory.filter(row => row.storageSpot === entry.id).length;
      return `<button class="home-storage-card ${entry.id === spot.id ? 'selected-storage' : ''}" data-home-spot="${entry.id}" aria-pressed="${entry.id === spot.id}">${furnitureArt(entry)}<span><strong>${escape(entry.name)}</strong><small>${count} saved ${count === 1 ? 'batch' : 'batches'}</small></span><span class="storage-open" aria-hidden="true">${entry.id === spot.id ? 'Open' : '&#8594;'}</span></button>`;
    }).join('')}</div></section>${interiorHTML(inventory, item, spot, shelf, thumb)}</div></div>`;
}

export function mountHome(root, onSelect, onNavigate) {
  root.querySelectorAll('[data-home-select]').forEach(button => button.addEventListener('click', () => onSelect(button.dataset.homeSelect)));
  root.querySelectorAll('[data-home-room]').forEach(button => button.addEventListener('click', () => onNavigate({ room: button.dataset.homeRoom }, `[data-home-room="${button.dataset.homeRoom}"]`)));
  root.querySelectorAll('[data-home-spot]').forEach(button => button.addEventListener('click', () => {
    const spot = STORAGE_SPOTS.find(spot => spot.id === button.dataset.homeSpot);
    onNavigate({ room: spot.room, spotId: spot.id }, `[data-home-spot="${spot.id}"]`);
  }));
  const search = root.querySelector('#home-search');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    root.querySelectorAll('[data-home-query]').forEach(row => {
      row.hidden = !row.dataset.homeQuery.includes(query);
      if (!row.hidden) count += 1;
    });
    root.querySelector('#home-search-summary').textContent = `${count} matching food ${count === 1 ? 'batch' : 'batches'}`;
    root.querySelector('#home-no-results').hidden = count !== 0;
  });
}
