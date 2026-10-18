import test from 'node:test';
import assert from 'node:assert/strict';
import { dateAfter, daysUntil, validDate, validItem, initialState, demoDetections, addItems, validateState, statistics, normalizeProduct, normalizeWorkspace, productLabel } from './domain.js';

test('seed workspace and all demo detections are valid', () => {
  const state = initialState();
  assert.equal(validateState(state), true);
  assert.equal(demoDetections().length, 8);
  assert.equal(demoDetections().every(validItem), true);
  assert.deepEqual(statistics(state), { total: 23, soon: 3, expired: 0, low: 4 });
});

test('demo results match the supplied shopping-basket photo and keep dates estimated', () => {
  const items = demoDetections();
  assert.deepEqual(items.map(item => item.name), [
    'Rocher gift box',
    'LINDOR assorted chocolates (pink box)',
    'Milk chocolate',
    'Chopped Pork & Ham',
    'LINDOR gold box',
    'LINDOR black box',
    'Meltykiss original chocolate (large)',
    'Chocolate-flavoured finger biscuits'
  ]);
  assert.deepEqual(items.map(item => item.brand), ['Ferrero', 'Lindt', "M&M's", 'Great Wall', 'Lindt', 'Lindt', 'Meiji', 'Garden']);
  assert.deepEqual(items.map(item => item.quantity), [1, 1, 1, 2, 1, 1, 1, 1]);
  assert.equal(items.reduce((total, item) => total + item.quantity, 0), 9);
  assert.equal(new Set(items.map(item => item.id)).size, 8);
  assert.equal(items.every(item => item.estimated && item.category === 'Pantry' && item.location === 'Pantry'), true);
  assert.equal(items[3].confidence < 85, true);
});

test('dates use calendar days, including month/year boundaries and daylight saving changes', () => {
  assert.equal(dateAfter(2, new Date(2026, 11, 31, 23, 59)), '2027-01-02');
  assert.equal(dateAfter(1, new Date(2026, 2, 8)), '2026-03-09');
  assert.equal(daysUntil('2026-03-09', new Date(2026, 2, 8, 23, 30)), 1);
  assert.equal(daysUntil('2026-03-07', new Date(2026, 2, 8)), -1);
  assert.equal(daysUntil('2026-03-08', new Date(2026, 2, 8)), 0);
});

test('rejects invalid dates and fractional, excessive or empty quantities', () => {
  for (const value of ['2026-02-30', '2026-13-01', '', 'not-a-date', '26-01-01', null]) assert.equal(validDate(value), false);
  assert.equal(validDate('2028-02-29'), true);
  const item = demoDetections()[0];
  for (const quantity of [0, -1, 1.5, 1000, NaN, '2']) assert.equal(validItem({ ...item, quantity }), false);
  assert.equal(validItem({ ...item, name: '   ' }), false);
  assert.equal(validItem({ ...item, category: 'unknown' }), false);
  assert.equal(validItem({ ...item, location: 'unknown' }), false);
});

test('matching batches merge without mutating source or leaking confidence', () => {
  const item = demoDetections()[0];
  const inventory = [{ ...item, name: ` ${item.name.toUpperCase()} `, quantity: 2 }];
  const merged = addItems(inventory, [item], () => 'new-id');
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, 3);
  assert.equal(inventory[0].quantity, 2);
  const fresh = addItems([], [item], () => 'new-id');
  assert.equal(fresh[0].id, 'new-id');
  assert.equal('confidence' in fresh[0], false);
});

test('different expiry, storage, date source, or category stays in a separate batch', () => {
  const item = demoDetections()[0];
  for (const difference of [{ brand: 'Another brand' }, { expiry: dateAfter(181) }, { location: 'Fridge' }, { estimated: false }, { category: 'Dairy & eggs' }]) {
    const result = addItems([item], [{ ...item, ...difference }], () => 'new-id');
    assert.equal(result.length, 2);
    assert.equal(result[1].quantity, 1);
  }
});

test('labels separate known brands and review notes without losing variants or inventing brands', () => {
  const product = normalizeProduct({ name: 'Vita Ceylon lemon tea (check count)', category: 'Beverages' });
  assert.deepEqual(product, { brand: 'Vita', name: 'Ceylon lemon tea', category: 'Beverages', reviewNote: 'Check count' });
  assert.equal(productLabel(product), 'Vita | Ceylon lemon tea | Beverages');
  assert.equal(productLabel({ name: 'Cabbage', category: 'Produce' }), 'Unbranded | Cabbage | Produce');
  assert.equal(normalizeProduct({ name: 'Meiji Meltykiss original chocolate (large)' }).name, 'Meltykiss original chocolate (large)');
  assert.equal(normalizeProduct({ name: 'Household cleaner' }).brand, 'Unbranded');
  assert.equal(normalizeProduct({ brand: 'Custom', name: 'Garden biscuits' }).name, 'Garden biscuits');
  assert.deepEqual(normalizeProduct(product), product);
});

test('legacy saved workspaces migrate non-destructively and remain valid and idempotent', () => {
  const oldItem = { ...demoDetections()[0], name: 'Vita lemon tea (check count)' };
  delete oldItem.brand;
  delete oldItem.reviewNote;
  const legacy = { ...initialState(), inventory: [oldItem], shopping: [{ id: 'old-list', name: 'Lindt LINDOR gold box', checked: true }] };
  assert.equal(validateState(legacy), true);
  const migrated = normalizeWorkspace(legacy);
  assert.equal(validateState(migrated), true);
  assert.equal(migrated.inventory[0].brand, 'Vita');
  assert.equal(migrated.inventory[0].reviewNote, 'Check count');
  assert.equal(migrated.inventory[0].id, oldItem.id);
  assert.equal(migrated.inventory[0].quantity, oldItem.quantity);
  assert.equal(migrated.shopping[0].brand, 'Lindt');
  assert.equal(migrated.shopping[0].category, 'Uncategorized');
  assert.equal(migrated.shopping[0].checked, true);
  assert.equal(legacy.inventory[0].name, 'Vita lemon tea (check count)');
  assert.deepEqual(normalizeWorkspace(migrated), migrated);
  const saved = JSON.parse(JSON.stringify(migrated));
  assert.deepEqual(saved, migrated);
});

test('merging compares brand and retains review notes, including legacy batches', () => {
  const item = demoDetections()[0];
  const legacy = { ...item, name: 'Ferrero Rocher gift box' };
  delete legacy.brand;
  assert.equal(addItems([legacy], [item])[0].quantity, 2);
  assert.equal(addItems([item], [{ ...item, brand: 'ferrero' }])[0].quantity, 2);
  const merged = addItems([{ ...item, reviewNote: 'Check label' }], [{ ...item, reviewNote: 'Check count' }]);
  assert.equal(merged[0].reviewNote, 'Check label; Check count');
  assert.throws(() => addItems([{ ...item, reviewNote: 'x'.repeat(200) }], [{ ...item, reviewNote: 'Check count' }]), /review notes/);
});

test('structured product fields reject invalid data', () => {
  const item = demoDetections()[0];
  for (const difference of [{ brand: 1 }, { brand: '' }, { brand: 'x'.repeat(61) }, { brand: 'A|B' }, { name: 'A|B' }, { reviewNote: 1 }, { reviewNote: 'x'.repeat(201) }]) {
    assert.equal(validItem({ ...item, ...difference }), false);
  }
  assert.equal(validateState({ ...initialState(), shopping: [{ id: 'bad', name: 'Milk', checked: false, category: 'Invalid' }] }), false);
});

test('batch addition is atomic when validation or combined quantities fail', () => {
  const item = { ...demoDetections()[0], quantity: 999 };
  assert.throws(() => addItems([item], [{ ...item, quantity: 1 }]), /999/);
  assert.equal(item.quantity, 999);
  assert.throws(() => addItems([], []), /Check/);
  assert.throws(() => addItems([], [{ ...item, expiry: '2026-02-30' }]), /Check/);
});

test('saved state rejects corrupted shapes and duplicate inventory IDs', () => {
  const state = initialState();
  assert.equal(validateState(null), false);
  assert.equal(validateState({}), false);
  assert.equal(validateState({ ...state, inventory: [...state.inventory, state.inventory[0]] }), false);
  assert.equal(validateState({ ...state, shopping: [{ id: 'bad', name: 'milk', checked: 'yes' }] }), false);
  assert.equal(validateState({ ...state, used: -1 }), false);
  assert.equal(validateState({ ...state, scans: [{ id: '1', at: 'nope', count: 4, source: 'Sample' }] }), false);
  assert.equal(validateState({ ...state, scans: [{ id: '1', at: new Date().toISOString(), count: 4, source: 'Sample' }] }), true);
});

test('expired items are counted separately from upcoming expiry', () => {
  const state = initialState();
  const past = { ...state.inventory[0], id: 'past', expiry: dateAfter(-1), quantity: 1 };
  const today = { ...state.inventory[0], id: 'today', expiry: dateAfter(0), quantity: 1 };
  assert.deepEqual(statistics({ ...state, inventory: [past, today] }), { total: 2, soon: 1, expired: 1, low: 2 });
});
