import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, STORAGE_SPOTS, storageSpot, storageShelf, shelvesFor, validStorageSpot, spotLabel, placementLabel } from './home-layout.js';
import { initialState, validItem, validateState, addItems } from './domain.js';
import { homeHTML } from './home-view.js';

test('demo layout has unique compatible storage spots in four rooms', () => {
  assert.equal(ROOMS.length, 4);
  assert.equal(new Set(STORAGE_SPOTS.map(spot => spot.id)).size, STORAGE_SPOTS.length);
  for (const spot of STORAGE_SPOTS) {
    assert.ok(ROOMS.some(room => room.name === spot.room));
    assert.ok(spot.width > 0 && spot.depth > 0 && spot.height > 0);
    assert.equal(validStorageSpot({ location: spot.location, storageSpot: spot.id }), true);
    assert.equal(spotLabel(spot), `${spot.room} / ${spot.name}`);
  }
});

test('legacy food gets compatible suggested placements without mutating saved data', () => {
  for (const location of ['Fridge', 'Freezer', 'Pantry']) {
    const item = { location };
    assert.equal(storageSpot(item).location, location);
    assert.equal('storageSpot' in item, false);
  }
  assert.ok(validateState(initialState()));
});

test('exact storage spots validate and survive persistence; incompatible spots are rejected', () => {
  const state = initialState();
  const item = { ...state.inventory.find(row => row.location === 'Pantry'), storageSpot: 'study-desk' };
  assert.ok(validItem(item));
  assert.equal(storageSpot(JSON.parse(JSON.stringify(item))).id, 'study-desk');
  for (const storageSpot of [null, '', 'missing', 'kitchen-fridge', 42]) {
    assert.equal(validItem({ ...item, storageSpot }), false);
    assert.throws(() => addItems([], [{ ...item, storageSpot }]), /Check/);
  }
  assert.throws(() => storageSpot({ location: 'Fridge', storageSpot: 'study-desk' }), /compatible/);
});

test('batches in different furniture stay separate; matching demo defaults merge', () => {
  const item = initialState().inventory.find(row => row.location === 'Pantry');
  assert.equal(addItems([item], [{ ...item, storageSpot: 'study-desk' }], () => 'desk').length, 2);
  const merged = addItems([item], [{ ...item, storageSpot: 'pantry-shelves' }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, item.quantity * 2);
  assert.equal(merged[0].storageSpot, 'pantry-shelves');
  assert.equal('storageSpot' in item, false);
});

test('home view highlights exactly the selected spot, distinguishes suggestions, and escapes labels', () => {
  const inventory = initialState().inventory;
  const selected = { ...inventory[0], brand: '<script>', storageSpot: 'kitchen-fridge' };
  const html = homeHTML([selected], selected.id, () => '');
  assert.equal((html.match(/home-box is-target/g) || []).length, 1);
  assert.ok(html.includes('Kitchen / Refrigerator'));
  assert.ok(html.includes('Saved placement'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(homeHTML(inventory, inventory[0].id, () => '').includes('not yet confirmed'));
  assert.ok(!homeHTML(inventory, 'removed-id', () => '').includes('food-beacon'));
  assert.ok(homeHTML([], '', () => '').includes('Your inventory is empty'));
});

test('each appliance, cupboard, and surface exposes unique ordered layers', () => {
  for (const spot of STORAGE_SPOTS) {
    const shelves = shelvesFor(spot);
    assert.ok(shelves.length > 0);
    assert.equal(new Set(shelves.map(shelf => shelf.id)).size, shelves.length);
    shelves.forEach((shelf, index) => {
      assert.ok(shelf.level > 0 && shelf.level <= 1);
      if (index) assert.ok(shelf.level < shelves[index - 1].level);
    });
  }
  assert.equal(shelvesFor(STORAGE_SPOTS[0]).length, 4);
  assert.equal(shelvesFor(STORAGE_SPOTS[2]).length, 3);
});

test('layers require an explicit compatible spot and survive workspace serialization', () => {
  const state = initialState();
  const item = { ...state.inventory[0], storageSpot: 'kitchen-fridge', storageShelf: 'crisper' };
  assert.ok(validItem(item));
  const restored = JSON.parse(JSON.stringify({ ...state, inventory: [item] }));
  assert.ok(validateState(restored));
  assert.equal(storageShelf(restored.inventory[0]).name, 'Crisper drawer');
  assert.equal(placementLabel(item), 'Kitchen / Refrigerator / Crisper drawer');
  for (const change of [
    { storageSpot: undefined }, { storageShelf: null }, { storageShelf: '' },
    { storageShelf: 'upper' }, { storageShelf: 'surface' }, { storageShelf: 1 },
    { location: 'Pantry', storageSpot: 'study-desk' }
  ]) assert.equal(validItem({ ...item, ...change }), false);
  assert.equal(storageShelf(state.inventory[0]), null);
  assert.throws(() => storageShelf({ ...item, storageShelf: 'missing' }), /valid shelf/);
});

test('food on different or unassigned shelves never merges; same shelf does', () => {
  const item = { ...initialState().inventory[0], storageSpot: 'kitchen-fridge', storageShelf: 'top' };
  for (const storageShelf of ['middle', 'bottom', 'crisper', undefined]) {
    assert.equal(addItems([item], [{ ...item, storageShelf }], () => 'other-layer').length, 2);
  }
  const merged = addItems([item], [item]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, item.quantity * 2);
  assert.equal(item.quantity, initialState().inventory[0].quantity);
});

test('selected shelf is highlighted in both views and food is only shown on saved layers', () => {
  const first = { ...initialState().inventory[0], storageSpot: 'kitchen-fridge', storageShelf: 'middle' };
  const second = { ...initialState().inventory[1], storageSpot: 'kitchen-fridge', storageShelf: 'top' };
  const html = homeHTML([first, second], first.id, () => '<span>food</span>');
  assert.equal((html.match(/model-shelf target-shelf/g) || []).length, 1);
  assert.equal((html.match(/cutaway-layer selected-layer/g) || []).length, 1);
  assert.ok(html.includes('Kitchen / Refrigerator / Middle shelf'));
  assert.ok(html.includes('data-home-select="seed-milk"'));
  assert.ok(html.includes('--food-height:19'));
  assert.ok(!html.includes('class="home-food-marker"'));
  const legacy = homeHTML(initialState().inventory, first.id, () => '');
  assert.ok(legacy.includes('No shelf is assumed'));
  assert.ok(!legacy.includes('selected-layer'));
  assert.ok(!legacy.includes('class="shelf-product'));
});
