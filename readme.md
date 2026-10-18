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
7. **My 3D home** opens a rotatable, four-room demo layout with a kitchen, pantry room, dining room, and study. Select an inventory item, or click **Find in home** beside its inventory storage location, to highlight its furniture and show a food marker. Drag to rotate, use arrow keys with the model focused, or use the rotation, tilt, and zoom sliders. **Reset view** restores the camera without changing inventory.
8. In the item editor (including scan review and barcode/manual entry), choose **Home storage spot** to save a specific refrigerator, freezer, cupboard, table, or desk. Changing storage type resets this choice to an unconfirmed suggestion. Chilled/frozen items can only use compatible appliances; tables, desks, and cupboards use Pantry storage. Existing items without an exact spot show a clearly labelled suggested demo placement, not a confirmed physical location. Different exact spots stay in separate batches. Saved spots persist locally and are included in JSON export.
9. Choose **Shelf / layer** after selecting a home storage spot: the refrigerator has top, middle, and bottom shelves plus a crisper drawer; cupboards have three shelves; the freezer has two drawers; tables/desks have a surface. Selecting food opens its cabinet in the 3D home and highlights its saved layer, with the food icon at that height. A larger front-view cutaway below the home lists food on each layer; click a product to locate it. Food without a saved layer stays unassigned, never silently placed on a shelf. Changing furniture or storage type clears the layer. Different layers (including unassigned versus assigned) remain separate batches. Layers persist locally, appear in inventory search/location labels, and export with the workspace.

**Image input is restricted to the 17 bundled samples.** There is no file input or camera capture; dropped external files are rejected with an explanatory message. Only sample IDs in `samples.js` can be selected. The server explicitly allowlists the corresponding assets; it does not expose arbitrary files from the assets folder. A sample barcode fallback remains available after scanning: `1234567890128` (oat milk) and `4006381333931` (rolled oats). Unknown barcodes show an explicit error.

## What is simulated?

- **No AI is connected.** Results are hand-authored per sample in `samples.js`. The original basket retains the eight product types corrected by the photo owner (including two Great Wall tins, the three LINDOR variants, Meiji Meltykiss and Garden biscuits). The additional photos cover fridge shelves, drinks, sauces, produce, frozen foods, sweets and pantry supplies. Partly hidden labels, flavours, counts and container contents require review; this is not an exhaustive recognition system.
- The original photo is `assets/groceries.jpg`; the 16 additions are `assets/Media (2).jpg` through `assets/Media (17).jpg`. Every sample has its own hand-positioned bounding boxes, shown after scanning and retained after saving. Numbers match the result list; dashed boxes indicate products needing review. Coordinates scale with the uncropped image at every screen size. One region may group several visible units. Boxes are approximate demo annotations, not live localization or proof of a product's identity.
- All detected expiry dates start as estimates. Review them against product labels. Estimates are not food-safety assessments.
- Ten product batches and two shopping items are preloaded. Their dates are relative to initialization.
- Inventory, shopping lists, usage counts, and scan history (including sample ID/name for new scans) are saved in this browser's local storage. Photos are local static assets and are not uploaded. Historic Upload/Camera scan records remain readable, but new scans can only use bundled samples.
- Existing saved labels are split into brand, item name, and review note on load without resetting inventory, quantities, dates, or history; the structured fields are persisted on the next save and included in JSON exports. Only known brand prefixes are extracted, not guessed from generic food names. Existing shopping items without a category show **Uncategorized**. New shopping entries have separate brand/name/category fields, and refills retain their inventory brand and category.
- If saved data is invalid or storage is blocked/full, an explicit warning is shown; changes remain in memory and can be exported. Reset is confirmed and restores sample data.
- No authentication, cloud sync, real recognition, external notifications, retailer integrations, price comparison, or measured environmental-impact calculations are included.
- The 3D home uses local CSS perspective, textured floors, openable cabinet geometry, shelves, table legs, chairs, plants, a window, rugs, and kitchen fixtures, with full horizontal rotation, adjustable overhead tilt, and zoom; it needs no external 3D library or WebGL. This is a fixed, roofless demo layout, not a house scan, room editor, first-person walkthrough, or automatic food-position detection. Food is a symbolic icon on its saved shelf (or above its suggested furniture when no layer is saved), not a realistic product mesh. Only explicitly saved assignments populate the front-view shelves; empty layers mean no food has been assigned, not that the physical shelf is empty.

## Validate

```sh
npm test
npm run check
```

Uses plain HTML, CSS, browser JavaScript, and Node's built-in HTTP server/test runner. All visual assets and icons are local; no CDN or external fonts are required.
