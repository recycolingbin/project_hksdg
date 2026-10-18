import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SAMPLES, getSample, sampleDetections, sampleAnnotations } from './samples.js';
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
      assert.deepEqual(Object.keys(item).sort(), ['id', 'brand', 'name', 'quantity', 'category', 'location', 'expiry', 'estimated', 'icon', 'reviewNote'].sort());
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
    ['sample-5', 'Fridge shelves & condiments', 'Minced garlic'],
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

test('scan metadata is preserved with backwards-compatible historic sources', () => {
  const state = initialState();
  const scan = { id: 'scan', at: new Date().toISOString(), count: 4, source: 'Sample', sampleId: 'sample-13', sampleName: getSample('sample-13').title };
  assert.equal(validateState({ ...state, scans: [scan] }), true);
  assert.equal(validateState({ ...state, scans: [{ ...scan, sampleName: 123 }] }), false);
  assert.equal(validateState({ ...state, scans: [{ id: 'old', at: scan.at, count: 1, source: 'Upload' }] }), true);
});
