import { dateAfter, demoDetections, normalizeProduct } from './domain.js';

const product = (name, quantity = 1, category = 'Pantry', location = 'Fridge', days = 14, icon = 'box') =>
  normalizeProduct({ name, quantity, category, location, days, icon });
const sample = (number, title, width, height, products, rotation = 0) => ({
  id: `sample-${number}`, title, file: `assets/Media (${number}).jpg`, width, height, products, rotation
});
const fridgeProduct = (brand, name, storageShelf, quantity = 1, category = 'Pantry', days = 14, icon = 'box') =>
  normalizeProduct({ brand, name, storageShelf, storageSpot: 'kitchen-fridge', quantity, category, location: 'Fridge', days, icon });

export const SAMPLES = [
  { id: 'basket', title: 'Chocolate shopping basket', file: 'assets/groceries.jpg', width: 768, height: 1365, products: null },
  sample(5, 'Fridge shelves & condiments', 2048, 1152, [
    fridgeProduct('GNC', 'Vitamin gummy candy', 'top', 1, 'Pantry', 180, 'candy'),
    fridgeProduct('Vitasoy', 'Coffee-flavoured soy milk', 'top', 1, 'Beverages', 14, 'milk'),
    fridgeProduct('Lee Kum Kee', 'Garlic chili sauce', 'top'),
    fridgeProduct('Lee Kum Kee', 'Garlic paste', 'top'),
    fridgeProduct('Spring Light', 'Yellow chili sauce', 'top'),
    fridgeProduct("Lawry's", 'Garlic salt', 'top'),
    fridgeProduct('Starbucks', 'Coffee Craft Americano (pack)', 'top', 1, 'Beverages', 7, 'coffee'),
    fridgeProduct('Unbranded', 'Fish cake', 'middle', 1, 'Pantry', 3),
    fridgeProduct('Unbranded', 'Chicken breast (pack)', 'middle', 1, 'Pantry', 2),
    fridgeProduct('Vita', 'VLT lemon tea', 'middle', 1, 'Beverages', 30, 'tea'),
    fridgeProduct('OKF', 'Korea watermelon drink', 'middle', 1, 'Beverages', 14),
    fridgeProduct('Kara', 'Nata de coco', 'middle'),
    fridgeProduct('Sansui', 'Soy milk (250 ml carton)', 'middle', 1, 'Beverages', 7, 'milk'),
    fridgeProduct('Sansui', 'Soft tofu', 'middle', 1, 'Pantry', 3),
    fridgeProduct('Vita', 'VLT lemon tea', 'bottom', 1, 'Beverages', 30, 'tea'),
    fridgeProduct('Vita', 'Ceylon lemon tea', 'bottom', 4, 'Beverages', 30, 'tea'),
    fridgeProduct('Ito En', 'Matcha LOVE', 'bottom', 4, 'Beverages', 30, 'tea'),
    fridgeProduct('Trappist Dairy', 'Milk (946 ml carton)', 'bottom', 1, 'Dairy & eggs', 7, 'milk'),
    fridgeProduct('Ito En', 'Green tea', 'bottom', 1, 'Beverages', 30, 'tea'),
    fridgeProduct('Juver', 'Disfruta apple nectar', 'bottom', 1, 'Beverages', 7, 'apple')
  ]),
  sample(3, 'Vegetables & corn', 2048, 1536, [
    product('Leafy greens (bag)', 1, 'Produce', 'Fridge', 3, 'leaf'),
    product('Leeks (check count)', 2, 'Produce', 'Fridge', 5, 'leaf'),
    product('Corn portions', 2, 'Produce', 'Fridge', 3),
    product('Ginger (bag)', 1, 'Produce', 'Fridge', 14),
    product('Coriander', 1, 'Produce', 'Fridge', 3, 'leaf'),
    product('Cabbage', 1, 'Produce', 'Fridge', 7, 'leaf'),
    product('Indian lettuce', 1, 'Produce', 'Fridge', 3, 'leaf'),
    normalizeProduct({ brand: 'Hachi', name: 'Large-size Italian spaghetti sauce with bacon', quantity: 1, category: 'Pantry', location: 'Fridge', days: 14, icon: 'pasta', reviewNote: 'Partly visible package; confirm other ingredients and pack size from the label.' })
  ]),
  sample(9, 'Frozen rice & chicken', 1152, 2048, [
    product('CJ chicken pilaf', 1, 'Pantry', 'Freezer', 90, 'rice'),
    product('CJ mushroom pilaf', 1, 'Pantry', 'Freezer', 90, 'rice'),
    normalizeProduct({ brand: 'Tender Max', name: 'Sous vide chicken steak', quantity: 3, category: 'Pantry', location: 'Freezer', days: 90, icon: 'box' }),
    normalizeProduct({ brand: 'Osaka Ohsho', name: 'Dumplings', quantity: 1, category: 'Pantry', location: 'Freezer', days: 90, icon: 'box' }),
    normalizeProduct({ brand: 'Fuyan', name: 'Black sesame ice cream', quantity: 1, category: 'Dairy & eggs', location: 'Freezer', days: 90, icon: 'yogurt' }),
    normalizeProduct({ brand: 'Amoy', name: 'Black Gold salted egg yolk paste buns', quantity: 1, category: 'Pantry', location: 'Freezer', days: 90, icon: 'box' }),
    normalizeProduct({ brand: 'Osaka Ohsho', name: 'Crispy Bite gyoza (18 pcs)', quantity: 1, category: 'Pantry', location: 'Freezer', days: 90, icon: 'box' })
  ], 90),
  sample(7, 'Tea, milk & juice', 2048, 1152, [
    product('Vita lemon tea (check count)', 2, 'Beverages', 'Fridge', 30, 'tea'),
    product('Vita Ceylon lemon tea (check count)', 4, 'Beverages', 'Fridge', 30, 'tea'),
    product('Ito En matcha LOVE', 4, 'Beverages', 'Fridge', 30, 'tea'),
    product('Ito En green tea', 1, 'Beverages', 'Fridge', 30, 'tea'),
    normalizeProduct({ ...product('Milk (946 ml carton)', 1, 'Dairy & eggs', 'Fridge', 7, 'milk'), brand: 'Trappist Dairy' }),
    normalizeProduct({ ...product('Disfruta apple nectar', 1, 'Beverages', 'Fridge', 7, 'apple'), brand: 'Juver' })
  ]),
  sample(8, 'Toast spreads, sauces & eggs', 2048, 1536, [
    normalizeProduct({ ...product('Garlic toast spread'), brand: 'Kewpie Aohata' }),
    normalizeProduct({ ...product('Sugar butter toast spread'), brand: 'Kewpie Aohata' }),
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
    normalizeProduct({ ...product('Cola (cans; check count)', 5, 'Beverages', 'Fridge', 14, 'can'), brand: 'Coca-Cola' }),
    product('Oranges (bag)', 1, 'Produce', 'Fridge', 5, 'apple'),
    product('Mooncake (pack)')
  ]),
  sample(2, 'Crisper greens, cabbage & eggs', 2048, 1536, [
    product('Indian lettuce (bag)', 1, 'Produce', 'Fridge', 3, 'leaf'),
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
    [38, 41, 32, 32], [78, 16, 22, 43], [46, 76, 37, 24],
    [12, 79, 36, 21], [82, 65, 18, 35]
  ],
  'sample-4': [
    [30, 32, 47, 43], [71, 19, 14, 37], [1, 1, 63, 39],
    [0, 9, 40, 90], [61, 45, 26, 20]
  ],
  'sample-5': [
    [9, 0, 16, 31], [24, 11, 10, 20], [44, 8, 7, 19],
    [51, 3, 8, 24], [55, 13, 5, 15], [59, 4, 7, 24], [68, 0, 8, 28],
    [12, 42, 14, 25], [20, 52, 15, 10], [28, 40, 15, 19],
    [36, 41, 13, 18], [54, 43, 14, 16], [49, 32, 7, 18], [54, 36, 9, 11],
    [16, 70, 9, 26], [24, 68, 16, 32], [35, 65, 13, 30],
    [46, 68, 16, 32], [55, 60, 18, 23], [58, 70, 13, 30]
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
    [2, 7, 15, 32], [16, 12, 13, 35], [26, 15, 19, 39],
    [40, 42, 51, 13]
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
    const bounds = getSample(id).rotation === 90
      ? { left: 100 - top - height, top: left, width: height, height: width }
      : { left, top, width, height };
    return { productId: items[index].id, number: index + 1, ...bounds };
  });
}

export function sampleDisplaySize(entry) {
  return entry.rotation === 90 ? { width: entry.height, height: entry.width } : { width: entry.width, height: entry.height };
}

export function sampleDetections(id) {
  const entry = getSample(id);
  if (entry.id === 'basket') return demoDetections();
  return entry.products.map((item, index) => {
    const { days, ...details } = item;
    return { ...details, id: `${entry.id}-product-${index}`, expiry: dateAfter(days), estimated: true, confidence: 75 };
  });
}
