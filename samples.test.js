import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SAMPLES, getSample, sampleDetections, sampleAnnotations, sampleDisplaySize } from './samples.js';
import { addItems, demoDetections, initialState, validItem, validateState, productLabel } from './domain.js';

test('library contains original photo and exactly 16 additional allowlisted images', async () => {
  assert.equal(SAMPLES.length, 17);
  assert.equal(new Set(SAMPLES.map(sample => sample.id)).size, 17);
  assert.equal(new Set(SAMPLES.map(sample => sample.file)).size, 17);
  assert.equal(SAMPLES[0].file, 'assets/groceries.jpg');
  for (let number = 2; number <= 17; number++) {
    assert.equal(getSample(`sample-${number}`).file, `assets/Media (${number}).jpg`);
  }
  for (const sample of SAMPLES) {
    const content = await readFile(new URL(sample.file, import.meta.url));
    assert.equal(content.readUInt16BE(0), 0xffd8);
    assert.ok(sample.width > 0 && sample.height > 0);
  }
});

test('each sample has independent valid, estimated detections and can be saved', () => {
  const signatures = new Set();
  for (const sample of SAMPLES) {
    const items = sampleDetections(sample.id);
    assert.ok(items.length);
    assert.equal(items.every(validItem), true, sample.id);
    assert.equal(items.every(item => item.estimated), true);
    assert.equal(new Set(items.map(item => item.id)).size, items.length);
    signatures.add(items.map(item => item.name).join('|'));
    let id = 0;
    const inventory = addItems([], items, () => `${sample.id}-${id++}`);
    assert.equal(validateState({ ...initialState(), inventory }), true);
    for (const item of inventory) {
      const placementFields = sample.id === 'sample-5' ? ['storageSpot', 'storageShelf'] : [];
      assert.deepEqual(Object.keys(item).sort(), ['id', 'brand', 'name', 'quantity', 'category', 'location', 'expiry', 'estimated', 'icon', 'reviewNote', ...placementFields].sort());
      assert.equal(productLabel(item).split(' | ').length, 3);
      assert.ok(item.brand.trim());
      assert.doesNotMatch(item.name, /check|partly hidden|visible count/i);
    }
    items[0].name = 'Edited product';
    assert.notEqual(sampleDetections(sample.id)[0].name, 'Edited product');
  }
  assert.equal(signatures.size, 17);
  assert.deepEqual(sampleDetections('basket'), demoDetections());
});

test('unknown IDs and arbitrary image paths cannot become samples', () => {
  for (const id of ['', undefined, 'sample-18', '/assets/other.jpg', 'https://example.com/photo.jpg', '../server.js']) {
    assert.throws(() => getSample(id), /bundled sample library/);
    assert.throws(() => sampleDetections(id), /bundled sample library/);
    assert.throws(() => sampleAnnotations(id), /bundled sample library/);
  }
});

test('every sample result has a photo-specific numbered box within the image bounds', () => {
  const layouts = new Set();
  for (const sample of SAMPLES) {
    const items = sampleDetections(sample.id);
    const annotations = sampleAnnotations(sample.id);
    assert.equal(annotations.length, items.length, sample.id);
    assert.deepEqual(annotations.map(annotation => annotation.productId), items.map(item => item.id));
    assert.deepEqual(annotations.map(annotation => annotation.number), items.map((_, index) => index + 1));
    for (const { left, top, width, height } of annotations) {
      assert.ok([left, top, width, height].every(Number.isFinite));
      assert.ok(left >= 0 && top >= 0 && width > 0 && height > 0);
      assert.ok(left + width <= 100 && top + height <= 100);
    }
    layouts.add(JSON.stringify(annotations.map(({ left, top, width, height }) => [left, top, width, height])));
    annotations[0].left = -100;
    assert.ok(sampleAnnotations(sample.id)[0].left >= 0);
  }
  assert.equal(layouts.size, SAMPLES.length);
});

test('sample filenames are mapped to the matching scenes and key products', () => {
  const expected = [
    ['sample-2', 'Crisper greens, cabbage & eggs', 'Cabbage'],
    ['sample-5', 'Fridge shelves & condiments', 'Garlic paste'],
    ['sample-10', 'Ice cream & frozen treats', 'Strawberry ice cream'],
    ['sample-13', 'Chocolate & chewy sweets drawer', 'HI-CHEW assorted sweets'],
    ['sample-15', 'Rice, curry & canned pantry foods', 'Vienna sausages'],
    ['sample-16', 'Instant noodles & dry pantry', 'Instant noodle packets'],
    ['sample-17', 'Cocoa, spreads & fresh fruit', 'Melon bread spread']
  ];
  for (const [id, title, name] of expected) {
    assert.equal(getSample(id).title, title);
    assert.ok(sampleDetections(id).some(item => item.name === name));
  }
});

test('Media 5 follows the photo owner corrections in shelf order with exact brands, sizes and counts', () => {
  const items = sampleDetections('sample-5');
  assert.deepEqual(items.map(item => [item.brand, item.name, item.quantity, item.storageShelf]), [
    ['GNC', 'Vitamin gummy candy', 1, 'top'],
    ['Vitasoy', 'Coffee-flavoured soy milk', 1, 'top'],
    ['Lee Kum Kee', 'Garlic chili sauce', 1, 'top'],
    ['Lee Kum Kee', 'Garlic paste', 1, 'top'],
    ['Spring Light', 'Yellow chili sauce', 1, 'top'],
    ["Lawry's", 'Garlic salt', 1, 'top'],
    ['Starbucks', 'Coffee Craft Americano (pack)', 1, 'top'],
    ['Unbranded', 'Fish cake', 1, 'middle'],
    ['Unbranded', 'Chicken breast (pack)', 1, 'middle'],
    ['Vita', 'VLT lemon tea', 1, 'middle'],
    ['OKF', 'Korea watermelon drink', 1, 'middle'],
    ['Kara', 'Nata de coco', 1, 'middle'],
    ['Sansui', 'Soy milk (250 ml carton)', 1, 'middle'],
    ['Sansui', 'Soft tofu', 1, 'middle'],
    ['Vita', 'VLT lemon tea', 1, 'bottom'],
    ['Vita', 'Ceylon lemon tea', 4, 'bottom'],
    ['Ito En', 'Matcha LOVE', 4, 'bottom'],
    ['Trappist Dairy', 'Milk (946 ml carton)', 1, 'bottom'],
    ['Ito En', 'Green tea', 1, 'bottom'],
    ['Juver', 'Disfruta apple nectar', 1, 'bottom']
  ]);
  assert.ok(items.every(item => item.storageSpot === 'kitchen-fridge' && item.location === 'Fridge' && item.estimated));
  assert.equal(items.reduce((sum, item) => sum + item.quantity, 0), 26);
  const boxes = sampleAnnotations('sample-5');
  items.forEach((item, index) => {
    const box = boxes[index];
    if (item.storageShelf === 'top') assert.ok(box.top + box.height <= 32);
    else if (item.storageShelf === 'middle') assert.ok(box.top >= 32 && box.top + box.height <= 68);
    else assert.ok(box.top >= 60);
  });
  let id = 0;
  const saved = addItems([], items, () => `media5-${id++}`);
  assert.equal(saved.length, 20);
  assert.deepEqual(saved.filter(item => item.name === 'VLT lemon tea').map(item => item.storageShelf), ['middle', 'bottom']);
  assert.deepEqual(saved.map(item => item.storageShelf), items.map(item => item.storageShelf));
});

test('scan metadata is preserved with backwards-compatible historic sources', () => {
  const state = initialState();
  const scan = { id: 'scan', at: new Date().toISOString(), count: 4, source: 'Sample', sampleId: 'sample-13', sampleName: getSample('sample-13').title };
  assert.equal(validateState({ ...state, scans: [scan] }), true);
  assert.equal(validateState({ ...state, scans: [{ ...scan, sampleName: 123 }] }), false);
  assert.equal(validateState({ ...state, scans: [{ id: 'old', at: scan.at, count: 1, source: 'Upload' }] }), true);
});

test('Media 3 uses corrected ginger and Indian lettuce and identifies the bottom-right Hachi sauce in English', () => {
  const items = sampleDetections('sample-3');
  assert.equal(items.length, 8);
  assert.ok(items.some(item => item.name === 'Ginger (bag)' && item.category === 'Produce'));
  assert.ok(items.some(item => item.name === 'Indian lettuce' && item.icon === 'leaf'));
  assert.ok(items.some(item => item.name === 'Cabbage'));
  assert.ok(items.some(item => item.name === 'Coriander' && item.category === 'Produce' && item.quantity === 1));
  assert.ok(!items.some(item => /prepared food containers/i.test(item.name)));
  assert.ok(!items.some(item => /baby corn/i.test(item.name)));
  const sauce = items.find(item => item.brand === 'Hachi');
  assert.equal(sauce.name, 'Large-size Italian spaghetti sauce with bacon');
  assert.equal(sauce.quantity, 1);
  assert.match(sauce.reviewNote, /confirm other ingredients/);
  const annotations = sampleAnnotations('sample-3');
  const corianderBox = annotations[items.findIndex(item => item.name === 'Coriander')];
  assert.ok(corianderBox.left >= 78 && corianderBox.top <= 20);
  const sauceBox = annotations[items.indexOf(sauce)];
  assert.ok(sauceBox.left >= 80 && sauceBox.top >= 65);
  const lettuceBox = annotations[items.findIndex(item => item.name === 'Indian lettuce')];
  assert.ok(lettuceBox.top >= 79 && lettuceBox.left < 46);
  assert.equal(addItems([], items).length, 8);
});

test('all bundled sample brand and product labels use English rather than Japanese scripts', () => {
  for (const sample of SAMPLES) {
    for (const item of sampleDetections(sample.id)) {
      assert.doesNotMatch(item.brand, /[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/u);
      assert.doesNotMatch(item.name, /[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/u);
    }
  }
});

test('Media 9 contains corrected frozen products and counts without replacing the two pilafs', () => {
  const items = sampleDetections('sample-9');
  assert.deepEqual(items.map(item => [item.brand, item.name, item.quantity]), [
    ['CJ', 'Chicken pilaf', 1],
    ['CJ', 'Mushroom pilaf', 1],
    ['Tender Max', 'Sous vide chicken steak', 3],
    ['Osaka Ohsho', 'Dumplings', 1],
    ['Fuyuan', 'Black sesame ice cream', 2],
    ['Amoy', 'Black Gold salted egg yolk paste buns', 1],
    ['Osaka Ohsho', 'Crispy Bite gyoza (18 pcs)', 1]
  ]);
  assert.ok(items.every(item => item.location === 'Freezer' && item.estimated));
  assert.equal(items[4].category, 'Dairy & eggs');
  assert.equal(items.reduce((sum, item) => sum + item.quantity, 0), 10);
  const saved = addItems([], items);
  assert.equal(saved.length, 7);
  assert.equal(saved.find(item => item.brand === 'Fuyuan').quantity, 2);
});

test('Media 9 rotates 90 degrees clockwise with swapped display dimensions and aligned boxes', () => {
  const entry = getSample('sample-9');
  assert.equal(entry.rotation, 90);
  assert.deepEqual(sampleDisplaySize(entry), { width: 2048, height: 1152 });
  const boxes = sampleAnnotations(entry.id);
  assert.deepEqual(
    boxes.map(({ left, top, width, height }) => [left, top, width, height]),
    [[14, 2, 34, 70], [17, 65, 33, 32], [51, 43, 39, 44],
      [61, 2, 32, 15], [53, 9, 35, 20], [46, 26, 39, 19], [45, 40, 13, 51]]
  );
  for (const other of SAMPLES.filter(sample => sample.id !== entry.id)) {
    assert.deepEqual(sampleDisplaySize(other), { width: other.width, height: other.height });
  }
});

test('Media 2, 4, 7 and 8 retain the photo owner brand and food corrections', () => {
  const lettuce = sampleDetections('sample-2')[0];
  assert.equal(productLabel(lettuce), 'Unbranded | Indian lettuce (bag) | Produce');
  assert.equal(lettuce.icon, 'leaf');

  const fridge = sampleDetections('sample-4');
  assert.equal(productLabel(fridge[2]), 'Coca-Cola | Cola | Beverages');
  assert.equal(fridge[2].quantity, 5);
  assert.match(fridge[2].reviewNote, /check count/i);
  assert.equal(fridge[3].name, 'Oranges (bag)');
  assert.equal(fridge[4].name, 'Mooncake (pack)');
  assert.equal(fridge[4].brand, 'Unbranded');
  assert.ok(!fridge.some(item => /prepared food|bagged fruit|canned drinks/i.test(item.name)));

  const drinks = sampleDetections('sample-7');
  assert.equal(productLabel(drinks[4]), 'Trappist Dairy | Milk (946 ml carton) | Dairy & eggs');
  assert.equal(productLabel(drinks[5]), 'Juver | Disfruta apple nectar | Beverages');
  assert.ok(!sampleDetections('sample-9').some(item => ['Juver', 'Trappist Dairy'].includes(item.brand)));

  const spreads = sampleDetections('sample-8').slice(0, 2);
  assert.deepEqual(spreads.map(item => productLabel(item)), [
    'Kewpie Aohata | Garlic toast spread | Pantry',
    'Kewpie Aohata | Sugar butter toast spread | Pantry'
  ]);
  for (const id of ['sample-2', 'sample-4', 'sample-7', 'sample-8']) {
    const items = sampleDetections(id);
    assert.ok(items.every(validItem));
    const saved = addItems([], items);
    assert.deepEqual(saved.map(productLabel), items.map(productLabel));
  }
});
