import { dateAfter, demoDetections, normalizeProduct } from './domain.js';

const product = (name, quantity = 1, category = 'Pantry', location = 'Fridge', days = 14, icon = 'box') =>
  normalizeProduct({ name, quantity, category, location, days, icon });
const sample = (number, title, width, height, products) => ({
  id: `sample-${number}`, title, file: `assets/Media (${number}).jpg`, width, height, products
});

export const SAMPLES = [
  { id: 'basket', title: 'Chocolate shopping basket', file: 'assets/groceries.jpg', width: 768, height: 1365, products: null },
  sample(5, 'Fridge shelves & condiments', 2048, 1152, [
    product('Lee Kum Kee minced garlic', 2), product("Lawry's garlic salt"), product('Yellow mustard'),
    product('Starbucks coffee', 1, 'Beverages', 'Fridge', 7, 'coffee'),
    product('Vitasoy drink (check variety)', 1, 'Beverages'), product('Tofu packs (check variety)', 2),
    product('Vita lemon tea cartons (check count)', 2, 'Beverages', 'Fridge', 30, 'tea'),
    product('Vita Ceylon lemon tea (check count)', 3, 'Beverages', 'Fridge', 30, 'tea'),
    product('Ito En matcha LOVE (check count)', 2, 'Beverages', 'Fridge', 30, 'tea'),
    product('Fresh milk carton', 1, 'Dairy & eggs', 'Fridge', 7, 'milk'),
    product('Apple juice carton', 1, 'Beverages', 'Fridge', 7, 'apple'),
    product('Ito En green tea', 1, 'Beverages', 'Fridge', 30, 'tea'),
    product('Bottled drinks (check labels)', 3, 'Beverages')
  ]),
  sample(3, 'Vegetables & corn', 2048, 1536, [
    product('Leafy greens (bag)', 1, 'Produce', 'Fridge', 3, 'leaf'),
    product('Leeks (check count)', 2, 'Produce', 'Fridge', 5, 'leaf'),
    product('Corn portions', 2, 'Produce', 'Fridge', 3),
    product('Baby corn (bag)', 1, 'Produce', 'Fridge', 3),
    product('Prepared food containers (check contents)', 2),
    product('Cabbage', 1, 'Produce', 'Fridge', 7, 'leaf')
  ]),
  sample(9, 'Frozen rice & chicken', 1152, 2048, [
    product('CJ chicken pilaf', 1, 'Pantry', 'Freezer', 90, 'rice'),
    product('CJ mushroom pilaf', 1, 'Pantry', 'Freezer', 90, 'rice'),
    product('Sous vide chicken steak (check variety)', 2, 'Pantry', 'Freezer', 90),
    product('Frozen dumplings (check variety)', 1, 'Pantry', 'Freezer', 90),
    product('Frozen radish cake', 1, 'Pantry', 'Freezer', 90)
  ]),
  sample(7, 'Tea, milk & juice', 2048, 1152, [
    product('Vita lemon tea (check count)', 2, 'Beverages', 'Fridge', 30, 'tea'),
    product('Vita Ceylon lemon tea (check count)', 4, 'Beverages', 'Fridge', 30, 'tea'),
    product('Ito En matcha LOVE', 4, 'Beverages', 'Fridge', 30, 'tea'),
    product('Ito En green tea', 1, 'Beverages', 'Fridge', 30, 'tea'),
    product('Fresh milk carton', 1, 'Dairy & eggs', 'Fridge', 7, 'milk'),
    product('Apple juice carton', 1, 'Beverages', 'Fridge', 7, 'apple')
  ]),
  sample(8, 'Toast spreads, sauces & eggs', 2048, 1536, [
    product('Garlic toast spread'), product('Sugar butter toast spread'),
    product('Snow Brand Hokkaido condensed milk', 1, 'Dairy & eggs', 'Fridge', 14, 'milk'),
    product('Gyu-Kaku rich soy sauce'), product('Gyu-Kaku soy sauce'),
    product('Eggs (visible count; check tray)', 5, 'Dairy & eggs', 'Fridge', 14, 'eggs')
  ]),
  sample(6, 'Seasonings & fridge-door sauces', 2048, 1536, [
    product('Lee Kum Kee reduced-salt oyster sauce'), product('Yamaki concentrated soup base'),
    product('Sesame seeds'), product('Honey'), product('Sriracha hot chilli sauce'),
    product('Bottled condiments (check labels)', 4)
  ]),
  sample(4, 'Milk cartons & canned drinks', 2048, 1536, [
    product('Dutch Lady full cream milk (check count)', 6, 'Dairy & eggs', 'Fridge', 7, 'milk'),
    product('Vita chocolate milk', 1, 'Beverages', 'Fridge', 7, 'milk'),
    product('Canned drinks (check labels/count)', 5, 'Beverages'),
    product('Bagged fruit (check type)', 1, 'Produce', 'Fridge', 5, 'apple'),
    product('Prepared food container (check contents)')
  ]),
  sample(2, 'Crisper greens, cabbage & eggs', 2048, 1536, [
    product('Leafy greens (bag)', 1, 'Produce', 'Fridge', 3, 'leaf'),
    product('Cabbage', 1, 'Produce', 'Fridge', 7, 'leaf'),
    product('Eggs (check tray count)', 6, 'Dairy & eggs', 'Fridge', 14, 'eggs'),
    product('Sliced vegetables (container)', 1, 'Produce', 'Fridge', 3)
  ]),
  sample(14, 'Frozen meat & vegetables', 1600, 900, [
    product('Beef steak pack', 1, 'Pantry', 'Freezer', 90),
    product('Frozen broccoli (bag)', 1, 'Produce', 'Freezer', 90, 'leaf'),
    product('HK Meat frozen pack (check contents)', 1, 'Pantry', 'Freezer', 90),
    product('Frozen mochi pack', 1, 'Pantry', 'Freezer', 90),
    product('Frozen food packs (check contents)', 2, 'Pantry', 'Freezer', 90)
  ]),
  sample(11, 'Dumplings, radish cake & salmon', 1152, 2048, [
    product('Osaka Ohsho gyoza', 1, 'Pantry', 'Freezer', 90),
    product('XO sauce radish cake', 1, 'Pantry', 'Freezer', 90),
    product('Frozen rice balls (check filling)', 1, 'Pantry', 'Freezer', 90),
    product('Salmon portions', 2, 'Pantry', 'Freezer', 60),
    product('CJ mushroom pilaf', 1, 'Pantry', 'Freezer', 90, 'rice'),
    product('Frozen dumplings (partly hidden)', 1, 'Pantry', 'Freezer', 90)
  ]),
  sample(15, 'Rice, curry & canned pantry foods', 2048, 1418, [
    product('Libby\'s Vienna sausages', 3, 'Pantry', 'Pantry', 365, 'can'),
    product('Ligo sardines in tomato sauce', 2, 'Pantry', 'Pantry', 365, 'can'),
    product('Otoki cooked rice (4-pack)', 1, 'Pantry', 'Pantry', 90, 'rice'),
    product('Ready rice bowls', 2, 'Pantry', 'Pantry', 90, 'rice'),
    product('House mild pork & corn curry (check count)', 5, 'Pantry', 'Pantry', 180),
    product('Kimnori original seaweed', 1, 'Pantry', 'Pantry', 90, 'leaf'),
    product('Instant noodle bowl', 1, 'Pantry', 'Pantry', 90)
  ]),
  sample(12, 'Frozen pancakes, tangyuan & chicken', 2048, 1536, [
    product('Scallion pancakes (pack)', 1, 'Pantry', 'Freezer', 90),
    product('Ningbo sesame tangyuan', 1, 'Pantry', 'Freezer', 90),
    product('Frozen chicken pack', 1, 'Pantry', 'Freezer', 60),
    product('Frozen dumplings (12-piece pack)', 1, 'Pantry', 'Freezer', 90)
  ]),
  sample(13, 'Chocolate & chewy sweets drawer', 2048, 1152, [
    product('Morinaga HI-CHEW assorted sweets', 1, 'Pantry', 'Pantry', 180, 'candy'),
    product('Lotte premium Ghana matcha chocolate', 1, 'Pantry', 'Pantry', 180, 'chocolate'),
    product('Morinaga Carre de Chocolat cacao 70', 1, 'Pantry', 'Pantry', 180, 'chocolate'),
    product('Morinaga Carre de Chocolat French milk', 1, 'Pantry', 'Pantry', 180, 'chocolate'),
    product('Assorted sweets (check packs/count)', 1, 'Pantry', 'Pantry', 180, 'candy')
  ]),
  sample(17, 'Cocoa, spreads & fresh fruit', 1536, 2040, [
    product('Cocoa soy drink carton', 1, 'Beverages', 'Fridge', 7, 'milk'),
    product('Barista milk carton', 1, 'Dairy & eggs', 'Fridge', 7, 'milk'),
    product('Melon bread spread'), product('Mini jam jars', 2),
    product('Honey'), product('Green fruit (bag; check type)', 1, 'Produce', 'Fridge', 5, 'apple'),
    product('Kimchi'), product('Covered leftovers (check contents)', 2)
  ]),
  sample(10, 'Ice cream & frozen treats', 1152, 2048, [
    product('Movenpick strawberry ice cream', 1, 'Dairy & eggs', 'Freezer', 90, 'yogurt'),
    product('Kiss Mango frozen mango bar', 1, 'Produce', 'Freezer', 90),
    product('Black sesame milk ice bar', 1, 'Dairy & eggs', 'Freezer', 90),
    product('Mung bean ice bar', 1, 'Pantry', 'Freezer', 90),
    product('Red bean ice bar', 1, 'Pantry', 'Freezer', 90),
    product('La Frutta Jolly Freeze apple (pack)', 1, 'Pantry', 'Freezer', 90),
    product('La Frutta Jolly Freeze grape (pack)', 1, 'Pantry', 'Freezer', 90)
  ]),
  sample(16, 'Instant noodles & dry pantry', 3432, 2160, [
    product('Instant noodle packets (check count/variety)', 16, 'Pantry', 'Pantry', 180, 'pasta'),
    product('Oatmeal (partly hidden)', 1, 'Pantry', 'Pantry', 180, 'oats'),
    product('Snack packets (check labels)', 2, 'Pantry', 'Pantry', 90),
    product('Bottled cooking ingredient (check label)', 1, 'Pantry', 'Pantry', 90)
  ])
];

// Percent coordinates [left, top, width, height], in each sample's product-list order.
// A grouped product result uses one region around the visible group.
const SAMPLE_BOXES = {
  basket: [
    [12, 36, 86, 58], [42, 54, 57, 31], [40, 23, 53, 14], [1, 52, 28, 38],
    [51, 28, 41, 13], [58, 25, 35, 8], [10, 43, 30, 30], [39, 30, 17, 8]
  ],
  'sample-2': [
    [1, 7, 53, 47], [43, 17, 50, 60], [1, 46, 46, 45], [51, 2, 20, 26]
  ],
  'sample-3': [
    [1, 19, 23, 59], [20, 31, 24, 25], [48, 16, 32, 23],
    [38, 41, 32, 32], [51, 30, 48, 29], [46, 76, 37, 24]
  ],
  'sample-4': [
    [30, 32, 47, 43], [71, 19, 14, 37], [1, 1, 63, 39],
    [0, 9, 40, 90], [65, 45, 34, 24]
  ],
  'sample-5': [
    [44, 4, 15, 23], [59, 4, 7, 24], [54, 13, 6, 15], [68, 0, 8, 28],
    [24, 11, 10, 20], [54, 36, 16, 22], [16, 70, 11, 25],
    [24, 70, 15, 29], [35, 65, 13, 30], [46, 68, 16, 31],
    [58, 69, 13, 26], [55, 60, 18, 23], [27, 39, 23, 21]
  ],
  'sample-6': [
    [69, 24, 28, 44], [30, 24, 19, 56], [50, 46, 20, 45],
    [65, 46, 27, 52], [84, 52, 16, 46], [10, 5, 39, 68]
  ],
  'sample-7': [
    [0, 34, 18, 50], [16, 33, 20, 63], [30, 19, 22, 59],
    [66, 25, 34, 34], [50, 41, 36, 49], [64, 44, 34, 43]
  ],
  'sample-8': [
    [16, 26, 10, 33], [24, 25, 15, 40], [32, 31, 14, 41],
    [42, 20, 20, 61], [60, 24, 15, 56], [60, 63, 40, 36]
  ],
  'sample-9': [
    [2, 52, 70, 34], [65, 50, 32, 33], [43, 10, 44, 39],
    [40, 42, 51, 13], [27, 16, 22, 37]
  ],
  'sample-10': [
    [44, 40, 34, 19], [47, 4, 32, 36], [9, 40, 34, 35],
    [8, 7, 34, 35], [26, 13, 24, 32], [23, 56, 55, 26], [9, 74, 59, 21]
  ],
  'sample-11': [
    [0, 32, 61, 58], [48, 9, 47, 34], [8, 8, 43, 30],
    [51, 45, 26, 34], [74, 48, 23, 34], [48, 37, 42, 15]
  ],
  'sample-12': [
    [0, 0, 32, 54], [15, 10, 42, 59], [45, 20, 41, 69], [29, 58, 47, 42]
  ],
  'sample-13': [
    [7, 22, 29, 70], [29, 46, 19, 45], [44, 4, 19, 38],
    [47, 51, 29, 42], [14, 0, 31, 33]
  ],
  'sample-14': [
    [7, 55, 32, 44], [47, 1, 46, 56], [45, 49, 45, 51],
    [0, 13, 20, 56], [11, 1, 41, 34]
  ],
  'sample-15': [
    [68, 26, 17, 63], [81, 31, 18, 61], [27, 44, 34, 48],
    [25, 18, 34, 29], [16, 0, 53, 22], [4, 12, 25, 85], [52, 11, 28, 23]
  ],
  'sample-16': [
    [22, 5, 73, 93], [0, 36, 29, 23], [11, 58, 29, 34], [0, 14, 21, 85]
  ],
  'sample-17': [
    [44, 11, 36, 26], [58, 6, 38, 27], [0, 27, 25, 19], [10, 20, 20, 13],
    [0, 16, 12, 17], [56, 38, 27, 18], [27, 44, 21, 11], [29, 12, 36, 28]
  ]
};

export function getSample(id) {
  const entry = SAMPLES.find(candidate => candidate.id === id);
  if (!entry) throw new Error('Choose an image from the bundled sample library.');
  return entry;
}

export function sampleAnnotations(id) {
  const items = sampleDetections(id);
  const boxes = SAMPLE_BOXES[id];
  if (!boxes || boxes.length !== items.length) {
    throw new Error(`Sample annotations are incomplete for ${id}.`);
  }
  return boxes.map((box, index) => {
    const [left, top, width, height] = box;
    if (box.length !== 4 || !box.every(Number.isFinite) || left < 0 || top < 0 ||
      width <= 0 || height <= 0 || left + width > 100 || top + height > 100) {
      throw new Error(`Invalid annotation bounds for ${id}, product ${index + 1}.`);
    }
    return { productId: items[index].id, number: index + 1, left, top, width, height };
  });
}

export function sampleDetections(id) {
  const entry = getSample(id);
  if (entry.id === 'basket') return demoDetections();
  return entry.products.map((item, index) => {
    const { days, ...details } = item;
    return { ...details, id: `${entry.id}-product-${index}`, expiry: dateAfter(days), estimated: true, confidence: 75 };
  });
}
