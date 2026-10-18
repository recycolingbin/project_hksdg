import { ROOMS, STORAGE_SPOTS, storageSpot, storageShelf, shelvesFor, placementLabel } from './home-layout.js';
import { productLabel } from './domain.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let view = { yaw: -30, tilt: 55, zoom: 1 };

function box(spot, selected, shelf, item, thumb) {
  const surface = ['dining-table', 'study-desk'].includes(spot.id);
  return `<div class="home-box ${selected ? 'is-target' : ''} ${surface ? 'is-table' : 'is-cabinet'} furniture-${spot.id}" style="--x:${spot.x}px;--z:${spot.z}px;--w:${spot.width}px;--d:${spot.depth}px;--h:${spot.height}px;--furniture:${spot.color}">
    ${(surface ? ['top'] : ['front', 'back', 'left', 'right', 'top']).map(face => `<span class="box-face box-${face}"></span>`).join('')}
    ${surface ? ['nw', 'ne', 'sw', 'se'].map(corner => `<span class="table-leg leg-${corner}"></span>`).join('') : shelvesFor(spot).map(layer => `<span class="model-shelf ${selected && shelf?.id === layer.id ? 'target-shelf' : ''}" style="--level:${layer.level};--shelf-height:${spot.height * (layer.level - .5)}px"></span>`).join('')}
    ${selected && shelf ? `<span class="shelf-food" style="--food-height:${Math.round(spot.height * (shelf.level - .5) + 12)}px">${thumb(item, true)}</span>` : ''}
    ${spot.id === 'study-desk' ? '<span class="desk-notebook"></span>' : ''}
    <span class="furniture-name">${escape(spot.name)}</span>
    ${selected ? `<span class="food-beacon" aria-hidden="true">${shelf ? escape(shelf.name) : 'HERE'}</span>` : ''}
  </div>`;
}

function interiorHTML(inventory, item, spot, shelf, thumb) {
  const placed = inventory.filter(row => row.storageSpot === spot.id);
  const unassigned = placed.filter(row => row.storageShelf === undefined);
  return `<section class="home-interior" aria-labelledby="interior-title">
    <div class="interior-heading"><div><span class="eyebrow">INSIDE YOUR STORAGE</span><h2 id="interior-title">${escape(spot.name)}</h2><p>${escape(spot.room)} <span aria-hidden="true">/</span> ${shelf ? escape(shelf.name) : 'Layer not assigned'}</p></div><span class="interior-pill">${spot.location === 'Fridge' ? 'CHILLED' : spot.location === 'Freezer' ? 'FROZEN' : 'DRY STORAGE'}</span></div>
    <div class="storage-cutaway ${spot.location !== 'Pantry' ? 'cutaway-fridge' : ''}">
    <div class="cutaway-top"><span></span><span>${escape(spot.name)} · front view</span><span></span></div>
    <div class="cutaway-body">${shelvesFor(spot).map((layer, index) => {
      const active = shelf?.id === layer.id;
      const items = placed.filter(row => row.storageShelf === layer.id);
      const drawer = ['crisper', 'upper', 'lower'].includes(layer.id);
      return `<div class="cutaway-layer ${active ? 'selected-layer' : ''} ${drawer ? 'is-drawer' : ''}" ${active ? 'aria-current="location"' : ''}>
        <div class="layer-caption"><span class="layer-number">${String(index + 1).padStart(2, '0')}</span><strong>${escape(layer.name)}</strong>${active ? '<span class="layer-here">YOUR ITEM</span>' : ''}</div>
        <div class="shelf-contents">${items.length ? items.map(row => `<button class="shelf-product ${row.id === item.id ? 'selected-product' : ''}" data-home-select="${escape(row.id)}" aria-label="Locate ${escape(productLabel(row))} on ${escape(layer.name)}">${thumb(row, true)}<span>${escape(row.name)}<small>${row.quantity} ${row.quantity === 1 ? 'unit' : 'units'}</small></span></button>`).join('') : '<span class="shelf-empty">No food assigned to this layer</span>'}</div>
      </div>`;
    }).join('')}</div><div class="cutaway-plinth"></div></div>
    ${!shelf ? '<p class="layer-warning">This item has no saved layer. Choose <strong>Change storage spot</strong> and set its shelf / layer. No shelf is assumed.</p>' : `<p class="layer-confirmation">Find <strong>${escape(item.name)}</strong> on the <strong>${escape(shelf.name.toLowerCase())}</strong>. The same layer is highlighted in the 3D home.</p>`}
    ${unassigned.length ? `<details class="unassigned-food"><summary>${unassigned.length} ${unassigned.length === 1 ? 'batch' : 'batches'} in this storage without a layer</summary>${unassigned.map(row => `<button data-home-select="${escape(row.id)}">${escape(productLabel(row))}</button>`).join('')}</details>` : ''}
  </section>`;
}

function decorationHTML() {
  return `<div class="home-rug rug-dining"></div><div class="home-rug rug-study"></div>
    ${[[-240, 105], [-45, 105], [-145, 185], [145, 185]].map(([x, z]) => `<div class="home-chair" style="--x:${x}px;--z:${z}px"><span></span></div>`).join('')}
    ${[[-255, -45], [255, 180], [255, -45]].map(([x, z]) => `<div class="home-plant" style="--x:${x}px;--z:${z}px"><span class="plant-pot"></span><span class="plant-leaves"></span></div>`).join('')}
    <div class="home-window"><span></span></div><div class="home-counter"><span class="counter-sink"></span><span class="counter-hob"></span></div>`;
}

export function homeHTML(inventory, selectedId, thumb) {
  const item = inventory.find(row => row.id === selectedId);
  const target = item ? storageSpot(item) : null;
  const shelf = item ? storageShelf(item) : null;
  return `<div class="page-heading"><div><span class="eyebrow">YOUR FOOD, IN ITS PLACE</span><h1>Find it at home<span>.</span></h1><p>A rotatable 3D demo home. Select food to reveal where it is stored.</p></div><a class="button secondary" href="#inventory">Back to inventory</a></div>
    <div class="home-layout"><section class="card home-controls"><h2>What are you looking for?</h2>
    <label class="field">Food item<select id="home-food"><option value="">Choose an inventory item</option>${inventory.map(row => `<option value="${escape(row.id)}" ${row.id === selectedId ? 'selected' : ''}>${escape(productLabel(row))} (${row.quantity})</option>`).join('')}</select></label>
    <div class="home-result" role="status">${item ? `${thumb(item)}<h3>${escape(productLabel(item))}</h3><p><strong>${escape(placementLabel(item))}</strong></p><p>${item.quantity} ${item.quantity === 1 ? 'unit' : 'units'} · ${escape(item.location)}</p><p>${item.storageSpot === undefined ? 'Suggested demo placement, not yet confirmed. Edit the item to save its exact spot.' : 'Saved placement in this demo home.'}${shelf ? '' : ' Shelf / layer not assigned.'}</p><button class="button secondary" data-action="edit-item" data-id="${escape(item.id)}">Change storage spot</button>` : `<p>${inventory.length ? 'Choose a food item above, or use Find in home from inventory.' : 'Your inventory is empty. Add food first to locate it here.'}</p>`}</div>
    <p class="form-note">Fixed demo layout, not a scan of your house. Cupboards, tables and desks use Pantry storage; chilled and frozen items stay in their compatible appliance.</p></section>
    <div class="home-visuals"><section class="card home-model-card"><div class="home-model-toolbar"><div><span class="eyebrow">THE LITTLE HOME</span><h2>Demo home · 4 rooms</h2></div><button class="button secondary small-button" id="home-reset">Reset view</button></div>
    <p id="home-instructions">Drag to rotate · use arrow keys when the model is focused · adjust zoom below.</p>
    <div class="home-viewport" tabindex="0" role="group" aria-label="Rotatable 3D home model" aria-describedby="home-instructions">
      <div class="home-fit"><div class="home-world">
        <div class="home-foundation"></div>
        ${ROOMS.map(room => `<div class="home-room ${target?.room === room.name ? 'active-room' : ''}" style="--x:${room.x}px;--z:${room.z}px;--floor:${room.color}"><span>${escape(room.name)}</span></div>`).join('')}
        <div class="home-wall wall-north"></div><div class="home-wall wall-west"></div>
        ${decorationHTML()}
        ${STORAGE_SPOTS.map(spot => box(spot, spot.id === target?.id, shelf, item, thumb)).join('')}
        ${item && !shelf ? `<div class="home-food-marker" style="--x:${target.x}px;--z:${target.z}px;--height:${target.height + 45}px"><span>${thumb(item, true)}</span></div>` : ''}
      </div></div>
    </div><div class="home-view-settings"><label>Rotation <input id="home-yaw" type="range" min="-180" max="180" step="1" value="${view.yaw}"></label><label>Tilt <input id="home-tilt" type="range" min="15" max="85" value="${view.tilt}"></label><label>Zoom <input id="home-zoom" type="range" min="60" max="150" value="${view.zoom * 100}"></label></div>
    <p class="home-legend"><span></span> Selected storage opens to reveal its shelves. A saved layer glows green, with your food on that layer. Rotate to see inside, or use the front view below.</p></section>
    ${item ? interiorHTML(inventory, item, target, shelf, thumb) : '<section class="card home-interior-placeholder"><span class="eyebrow">A PLACE FOR EVERYTHING</span><h2>Look a little closer.</h2><p>Select food to open its storage and explore each shelf, drawer, or surface.</p></section>'}</div></div>`;
}

export function mountHome(root, onSelect) {
  const viewport = root.querySelector('.home-viewport');
  const world = root.querySelector('.home-world');
  const fit = root.querySelector('.home-fit');
  const yaw = root.querySelector('#home-yaw');
  const tilt = root.querySelector('#home-tilt');
  const zoom = root.querySelector('#home-zoom');
  function update() {
    world.style.transform = `rotateX(${view.tilt}deg) rotateZ(${view.yaw}deg) scale(${view.zoom})`;
    world.style.setProperty('--counter-yaw', `${-view.yaw}deg`);
    world.style.setProperty('--counter-tilt', `${-view.tilt}deg`);
    fit.style.transform = `scale(${Math.min(1, viewport.clientWidth / 850)})`;
    yaw.value = view.yaw;
    tilt.value = view.tilt;
    zoom.value = view.zoom * 100;
  }
  const observer = new ResizeObserver(update);
  observer.observe(viewport);
  root.querySelector('#home-food').addEventListener('change', event => onSelect(event.target.value));
  root.querySelectorAll('[data-home-select]').forEach(button => button.addEventListener('click', () => onSelect(button.dataset.homeSelect)));
  for (const [input, key, divisor] of [[yaw, 'yaw', 1], [tilt, 'tilt', 1], [zoom, 'zoom', 100]]) {
    input.addEventListener('input', () => { view[key] = Number(input.value) / divisor; update(); });
  }
  root.querySelector('#home-reset').addEventListener('click', () => { view = { yaw: -30, tilt: 55, zoom: 1 }; update(); });
  let drag = null;
  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, ...view };
    viewport.setPointerCapture(event.pointerId);
    viewport.focus();
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    view.yaw = ((drag.yaw + (event.clientX - drag.x) * .5 + 180) % 360 + 360) % 360 - 180;
    view.tilt = Math.max(15, Math.min(85, drag.tilt - (event.clientY - drag.y) * .3));
    update();
  });
  viewport.addEventListener('lostpointercapture', () => { drag = null; });
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    view.yaw = ((view.yaw + (event.key === 'ArrowRight' ? 10 : event.key === 'ArrowLeft' ? -10 : 0) + 540) % 360) - 180;
    view.tilt = Math.max(15, Math.min(85, view.tilt + (event.key === 'ArrowDown' ? 5 : event.key === 'ArrowUp' ? -5 : 0)));
    update();
  });
  update();
  return () => observer.disconnect();
}
