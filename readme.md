# VisionStock

A responsive, local-first web demo based on the VisionStock project plan: one-photo grocery stocktaking, human review, inventory tracking, freshness alerts, and refill reminders.

## Run

Requires Node.js 20 or newer. No dependencies, API keys, account, or installation step is needed.

```sh
npm start
```

Open **http://127.0.0.1:5173**. In VS Code, the **Start VisionStock** task also starts the app. To use another port, set the `PORT` environment variable before starting.

## Try the demo

1. Click **Choose sample (17)** on Overview to browse the original basket and 16 additional bundled photos, then click **Try a demo scan**. The selected photo is shown in full without cropping.
2. Review that sample's preset detections. Each photo has a different product list. Labels consistently use **Brand | Item name | Category** in boxes, results, inventory, freshness alerts, refill suggestions, and shopping lists. Unknown brands show **Unbranded**; uncertain details such as "check count" appear in a separate review note. Product variants and sizes remain in the item name. Uncheck unwanted products or use the pencil to edit brand, item name, review note, quantities, categories, storage, and expiry dates. Choosing another photo clears unsaved results, not inventory.
3. Add the selected products to inventory. Matching brand/product/category/storage/date/date-source batches merge; different brands or dates stay separate.
4. Open **My inventory** to search, filter, edit, or mark one unit used with the minus button. Past-date units are removed rather than counted as used.
5. Use the bell or expiry card to see in-app freshness reminders. Use the shopping-bag button or low-stock suggestions to build your shopping list.
6. **Kitchen insights** shows actual workspace counts and scan history, offers JSON export (download, clipboard, or selectable text), and lets you reset to the sample data.
7. **My home** uses a minimal 2D room map: choose Kitchen, Pantry room, Dining room, or Study, then select a large storage card to open its front-view shelves. No rotation, zoom, or dragging is needed. **Quick find** searches food names, brands, categories, and room/storage/shelf labels across all inventory. Click a food result (or **Find in home** from inventory) to jump directly to its room, storage, and saved layer. Every room and storage spot can be browsed even without inventory.
8. In the item editor (including scan review and barcode/manual entry), choose **Home storage spot** to save a specific refrigerator, freezer, cupboard, table, or desk. Changing storage type resets this choice to an unconfirmed suggestion. Chilled/frozen items can only use compatible appliances; tables, desks, and cupboards use Pantry storage. Existing items without an exact spot show a clearly labelled suggested demo placement, not a confirmed physical location. Different exact spots stay in separate batches. Saved spots persist locally and are included in JSON export.
9. Choose **Shelf / layer** after selecting a home storage spot: the refrigerator has top, middle, and bottom shelves plus a crisper drawer; cupboards have three shelves; the freezer has two drawers; tables/desks have a surface. Selecting food highlights its saved layer and shows its full location above the shelves, with an **Edit location** button. Food without a saved layer appears under **Shelf not assigned**; food without confirmed furniture appears under **Suggested placements**, never silently placed on a shelf. Room and storage counts include only explicitly saved placements. Changing furniture or storage type clears the layer. Different layers (including unassigned versus assigned) remain separate batches. Layers persist locally, appear in inventory search/location labels, and export with the workspace.

**Image input is restricted to the 17 bundled samples.** There is no file input or camera capture; dropped external files are rejected with an explanatory message. Only sample IDs in `samples.js` can be selected. The server explicitly allowlists the corresponding assets; it does not expose arbitrary files from the assets folder. A sample barcode fallback remains available after scanning: `1234567890128` (oat milk) and `4006381333931` (rolled oats). Unknown barcodes show an explicit error.

## What is simulated?

- **No AI is connected.** Results are hand-authored per sample in `samples.js`. The original basket retains the eight product types corrected by the photo owner (including two Great Wall tins, the three LINDOR variants, Meiji Meltykiss and Garden biscuits). The additional photos cover fridge shelves, drinks, sauces, produce, frozen foods, sweets and pantry supplies. Partly hidden labels, flavours, counts and container contents require review; this is not an exhaustive recognition system.
- The original photo is `assets/groceries.jpg`; the 16 additions are `assets/Media (2).jpg` through `assets/Media (17).jpg`. Every sample has its own hand-positioned bounding boxes, shown after scanning and retained after saving. Numbers match the result list; dashed boxes indicate products needing review. Coordinates scale with the uncropped image at every screen size. One region may group several visible units. Boxes are approximate demo annotations, not live localization or proof of a product's identity.
- All detected expiry dates start as estimates. Review them against product labels. Estimates are not food-safety assessments.
- Further photo-owner corrections identify Indian lettuce at Media 2's top left; Coca-Cola cans, a bag of oranges, and a packed mooncake in Media 4; Trappist Dairy milk (946 ml) and Juver Disfruta apple nectar in Media 7 (not the Media 9 freezer photo); and Kewpie Aohata as the brand of both Media 8 toast spreads. Previously estimated quantities are retained for review, including the Coca-Cola can count.
- Media 9 is displayed 90 degrees clockwise in both the scanner and sample picker, without modifying its original photo. Annotation coordinates rotate with it. The photo owner's corrections identify Osaka Ohsho dumplings, three Tender Max sous vide chicken steaks, two Fuyuan black sesame ice cream packs (one vertical and one horizontal, covered by a grouped box), Amoy Black Gold salted egg yolk paste buns, and Osaka Ohsho Crispy Bite gyoza (18 pcs per pack). The two CJ pilaf products remain. Unspecified product quantities are one pack; 18 pieces is a pack size, not 18 inventory packs.
- Media 3 uses the photo owner's corrections for ginger (not baby corn), coriander at the top right (replacing the generic prepared-food-container detection), Indian lettuce on the lower left, and Hachi large-size Italian spaghetti sauce with bacon on the lower right. The cabbage remains a separate product. The partly visible sauce package still needs review for other ingredients and exact pack size. All bundled preset brands and item names use English/Latin-script labels, including products with Japanese packaging; this is curated sample data, not automatic translation of arbitrary labels or user-entered inventory.
- Media 5 uses the photo owner's corrected 20 product batches (26 units), ordered by top, middle, and bottom fridge shelves, with separate boxes for garlic chili sauce and garlic paste, the identified drink brands/sizes, and corrected bottom-shelf tea counts. Its reviewed detections carry those shelf assignments into the demo kitchen refrigerator when saved; they describe this sample photo, not an automatically detected location in your real home. Unspecified quantities default to one and still require review. Existing inventory is not rewritten; rescan and review to add the corrected sample.
- Ten product batches and two shopping items are preloaded. Their dates are relative to initialization.
- Inventory, shopping lists, usage counts, and scan history (including sample ID/name for new scans) are saved in this browser's local storage. Photos are local static assets and are not uploaded. Historic Upload/Camera scan records remain readable, but new scans can only use bundled samples.
- Existing saved labels are split into brand, item name, and review note on load without resetting inventory, quantities, dates, or history; the structured fields are persisted on the next save and included in JSON exports. Only known brand prefixes are extracted, not guessed from generic food names. Existing shopping items without a category show **Uncategorized**. New shopping entries have separate brand/name/category fields, and refills retain their inventory brand and category.
- If saved data is invalid or storage is blocked/full, an explicit warning is shown; changes remain in memory and can be exported. Reset is confirmed and restores sample data.
- No authentication, cloud sync, real recognition, external notifications, retailer integrations, price comparison, or measured environmental-impact calculations are included.
- My home is a fixed, illustrated 2D demo layout with warm-white surfaces, wood-toned cupboards, and soft-green selection states. It replaces the earlier rotatable 3D model to make room, storage, and shelf navigation simpler. It is not a house scan, room editor, or automatic food-position detector. Food uses symbolic icons, not realistic product models. Only explicitly saved assignments populate the front-view shelves; empty layers mean no food has been assigned, not that the physical shelf is empty. Existing stored furniture/shelf assignments remain compatible and are not reset by the redesign.

## Validate

```sh
npm test
npm run check
```

Uses plain HTML, CSS, browser JavaScript, and Node's built-in HTTP server/test runner. All visual assets and icons are local; no CDN or external fonts are required.
