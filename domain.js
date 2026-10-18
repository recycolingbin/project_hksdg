import { storageSpot, validStorageSpot } from './home-layout.js';

export const CATEGORIES = ['Produce', 'Dairy & eggs', 'Pantry', 'Beverages'];
export const LOCATIONS = ['Fridge', 'Pantry', 'Freezer'];
export const STORAGE_KEY = 'visionstock-demo-v1';

const BRANDS = [
  'Lee Kum Kee', 'Snow Brand', 'Great Wall', 'Osaka Ohsho', 'Dutch Lady',
  'Kiss Mango', 'Gyu-Kaku', 'La Frutta', "Lawry's", "Libby's", "M&M's",
  'Starbucks', 'Morinaga', 'Movenpick', 'Vitasoy', 'Ferrero', 'Ito En',
  'HK Meat', 'Kimnori', 'Yamaki', 'Lindt', 'Meiji', 'Garden', 'Lotte',
  'Otoki', 'House', 'Ligo', 'Vita', 'CJ'
];

export function normalizeProduct(item) {
  let name = item.name.trim();
  let brand = item.brand;
  let reviewNote = item.reviewNote || '';
  // Only legacy labels need splitting. Explicitly edited brand/name fields stay intact.
  if (brand === undefined) {
    brand = BRANDS.find(candidate => name.toLowerCase().startsWith(`${candidate.toLowerCase()} `)) || 'Unbranded';
    if (brand !== 'Unbranded') name = name.slice(brand.length).trim();
    name = name.replace(/\s*\(([^)]*(?:check|partly hidden|visible count)[^)]*)\)/gi, (_, note) => {
      reviewNote = [reviewNote, note.charAt(0).toUpperCase() + note.slice(1)].filter(Boolean).join('; ');
      return '';
    });
  }
  return {
    ...item,
    brand: brand.trim() || 'Unbranded',
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category: item.category || 'Uncategorized',
    reviewNote
  };
}

export function productLabel(item) {
  const product = normalizeProduct(item);
  return `${product.brand} | ${product.name} | ${product.category}`;
}

export function normalizeWorkspace(state) {
  return {
    ...state,
    inventory: state.inventory.map(normalizeProduct),
    shopping: state.shopping.map(normalizeProduct)
  };
}

function validProductDetails(item) {
  return (item.brand === undefined || (typeof item.brand === 'string' && item.brand.trim().length > 0 && item.brand.length <= 60 && !item.brand.includes('|'))) &&
    (item.reviewNote === undefined || (typeof item.reviewNote === 'string' && item.reviewNote.length <= 200));
}

export function dateAfter(days, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function daysUntil(date, now = new Date()) {
  const today = dateAfter(0, now);
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
}

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validItem(item) {
  return Boolean(item) && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim().length > 0 &&
    CATEGORIES.includes(item.category) && LOCATIONS.includes(item.location) && validStorageSpot(item) &&
    Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 999 &&
    validDate(item.expiry) && typeof item.estimated === 'boolean' &&
    typeof item.icon === 'string' && validProductDetails(item) && !item.name.includes('|');
}

export function initialState() {
  return normalizeWorkspace({
    inventory: [
      { id: 'seed-avocado', name: 'Avocados', category: 'Produce', location: 'Fridge', quantity: 2, expiry: dateAfter(2), estimated: true, icon: 'avocado' },
      { id: 'seed-milk', name: 'Fresh milk', category: 'Dairy & eggs', location: 'Fridge', quantity: 1, expiry: dateAfter(3), estimated: false, icon: 'milk' },
      { id: 'seed-spinach', name: 'Baby spinach', category: 'Produce', location: 'Fridge', quantity: 1, expiry: dateAfter(1), estimated: true, icon: 'leaf' },
      { id: 'seed-eggs', name: 'Free-range eggs', category: 'Dairy & eggs', location: 'Fridge', quantity: 6, expiry: dateAfter(12), estimated: false, icon: 'eggs' },
      { id: 'seed-pasta', name: 'Whole wheat pasta', category: 'Pantry', location: 'Pantry', quantity: 2, expiry: dateAfter(120), estimated: false, icon: 'pasta' },
      { id: 'seed-coffee', name: 'Ground coffee', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(60), estimated: false, icon: 'coffee' },
      { id: 'seed-apples', name: 'Red apples', category: 'Produce', location: 'Fridge', quantity: 4, expiry: dateAfter(10), estimated: true, icon: 'apple' },
      { id: 'seed-rice', name: 'Jasmine rice', category: 'Pantry', location: 'Pantry', quantity: 2, expiry: dateAfter(180), estimated: false, icon: 'rice' },
      { id: 'seed-yogurt', name: 'Greek yogurt', category: 'Dairy & eggs', location: 'Fridge', quantity: 3, expiry: dateAfter(8), estimated: false, icon: 'yogurt' },
      { id: 'seed-tea', name: 'Green tea', category: 'Beverages', location: 'Pantry', quantity: 1, expiry: dateAfter(150), estimated: false, icon: 'tea' }
    ],
    shopping: [
      { id: 'shopping-bread', name: 'Sourdough bread', category: 'Pantry', checked: false },
      { id: 'shopping-oil', name: 'Olive oil', category: 'Pantry', checked: false }
    ],
    scans: [],
    used: 0
  });
}

export function demoDetections() {
  return [
    { id: 'detect-ferrero', name: 'Ferrero Rocher gift box', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'chocolate', confidence: 98 },
    { id: 'detect-lindt', name: 'Lindt LINDOR assorted chocolates (pink box)', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'chocolate', confidence: 96 },
    { id: 'detect-mms', name: "M&M's milk chocolate", category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'candy', confidence: 94 },
    { id: 'detect-cans', name: 'Great Wall Chopped Pork & Ham', category: 'Pantry', location: 'Pantry', quantity: 2, expiry: dateAfter(365), estimated: true, icon: 'can', confidence: 72 },
    { id: 'detect-lindt-gold', name: 'Lindt LINDOR gold box', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'chocolate', confidence: 82 },
    { id: 'detect-lindt-black', name: 'Lindt LINDOR black box', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'chocolate', confidence: 80 },
    { id: 'detect-meltykiss', name: 'Meiji Meltykiss original chocolate (large)', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'chocolate', confidence: 70 },
    { id: 'detect-garden', name: 'Garden chocolate-flavoured finger biscuits', category: 'Pantry', location: 'Pantry', quantity: 1, expiry: dateAfter(180), estimated: true, icon: 'chocolate', confidence: 75 }
  ].map(normalizeProduct);
}

export const BARCODE_PRODUCTS = {
  '1234567890128': { name: 'Oat milk', category: 'Beverages', location: 'Fridge', icon: 'milk', days: 10 },
  '4006381333931': { name: 'Rolled oats', category: 'Pantry', location: 'Pantry', icon: 'oats', days: 90 }
};

export function addItems(inventory, items, makeId = () => crypto.randomUUID()) {
  if (!items.length || !items.every(validItem)) throw new Error('Check every product name, quantity, category, storage location, and date.');
  const next = inventory.map(normalizeProduct);
  for (const item of items.map(normalizeProduct)) {
    const existing = next.find(row => row.brand.toLowerCase() === item.brand.toLowerCase() && row.name.toLowerCase().trim() === item.name.toLowerCase().trim() && row.location === item.location && storageSpot(row).id === storageSpot(item).id && row.storageShelf === item.storageShelf && row.expiry === item.expiry && row.estimated === item.estimated && row.category === item.category);
    if (existing) {
      if (existing.quantity + item.quantity > 999) throw new Error('The combined quantity cannot exceed 999.');
      existing.quantity += item.quantity;
      if (item.storageSpot !== undefined) existing.storageSpot = item.storageSpot;
      const reviewNote = [...new Set([existing.reviewNote, item.reviewNote].filter(Boolean))].join('; ');
      if (reviewNote.length > 200) throw new Error('Combined review notes exceed 200 characters. Shorten them before merging this batch.');
      existing.reviewNote = reviewNote;
    } else {
      const { confidence, ...product } = item;
      next.push({ ...product, name: product.name.trim(), id: makeId() });
    }
  }
  return next;
}

export function validateState(state) {
  return Boolean(state) && Array.isArray(state.inventory) && state.inventory.every(validItem) &&
    new Set(state.inventory.map(item => item.id)).size === state.inventory.length &&
    Array.isArray(state.shopping) && state.shopping.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim().length > 0 && !item.name.includes('|') && typeof item.checked === 'boolean' && validProductDetails(item) && (item.category === undefined || [...CATEGORIES, 'Uncategorized'].includes(item.category))) &&
    Array.isArray(state.scans) && state.scans.every(scan => scan && typeof scan.id === 'string' && typeof scan.at === 'string' && Number.isFinite(Date.parse(scan.at)) && Number.isInteger(scan.count) && scan.count > 0 && ['Sample', 'Upload', 'Camera'].includes(scan.source) && (scan.sampleId === undefined || typeof scan.sampleId === 'string') && (scan.sampleName === undefined || typeof scan.sampleName === 'string')) &&
    Number.isInteger(state.used) && state.used >= 0;
}

export function statistics(state) {
  return {
    total: state.inventory.reduce((total, item) => total + item.quantity, 0),
    soon: state.inventory.filter(item => daysUntil(item.expiry) >= 0 && daysUntil(item.expiry) <= 3).length,
    expired: state.inventory.filter(item => daysUntil(item.expiry) < 0).length,
    low: state.inventory.filter(item => item.quantity === 1).length
  };
}
