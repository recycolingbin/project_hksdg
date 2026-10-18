export const ROOMS = [
  { name: 'Kitchen', x: -145, z: -115, color: '#e7eddd' },
  { name: 'Pantry room', x: 145, z: -115, color: '#f0e6d6' },
  { name: 'Dining room', x: -145, z: 115, color: '#e3eaf0' },
  { name: 'Study', x: 145, z: 115, color: '#ece3ee' }
];

export const STORAGE_SPOTS = [
  { id: 'kitchen-fridge', room: 'Kitchen', name: 'Refrigerator', location: 'Fridge', x: -230, z: -155, width: 58, depth: 55, height: 100, color: '#b9cfcc' },
  { id: 'kitchen-freezer', room: 'Kitchen', name: 'Freezer', location: 'Freezer', x: -150, z: -155, width: 65, depth: 55, height: 55, color: '#b8cddd' },
  { id: 'kitchen-cupboard', room: 'Kitchen', name: 'Cupboard', location: 'Pantry', x: -55, z: -155, width: 85, depth: 48, height: 75, color: '#cbb18c' },
  { id: 'pantry-shelves', room: 'Pantry room', name: 'Storage cupboard', location: 'Pantry', x: 150, z: -155, width: 160, depth: 48, height: 85, color: '#d1ba96' },
  { id: 'dining-table', room: 'Dining room', name: 'Table', location: 'Pantry', x: -145, z: 120, width: 140, depth: 75, height: 42, color: '#b4c5ce' },
  { id: 'study-desk', room: 'Study', name: 'Desk', location: 'Pantry', x: 145, z: 120, width: 130, depth: 65, height: 45, color: '#c1afca' }
];

const defaults = { Fridge: 'kitchen-fridge', Freezer: 'kitchen-freezer', Pantry: 'pantry-shelves' };

const cabinetShelves = [
  { id: 'top', name: 'Top shelf', level: .78 },
  { id: 'middle', name: 'Middle shelf', level: .49 },
  { id: 'bottom', name: 'Bottom shelf', level: .2 }
];

export function shelvesFor(spot) {
  if (spot.id === 'kitchen-fridge') return [
    { id: 'top', name: 'Top shelf', level: .8 },
    { id: 'middle', name: 'Middle shelf', level: .57 },
    { id: 'bottom', name: 'Bottom shelf', level: .34 },
    { id: 'crisper', name: 'Crisper drawer', level: .12 }
  ];
  if (spot.id === 'kitchen-freezer') return [
    { id: 'upper', name: 'Upper drawer', level: .68 },
    { id: 'lower', name: 'Lower drawer', level: .25 }
  ];
  if (['kitchen-cupboard', 'pantry-shelves'].includes(spot.id)) return cabinetShelves;
  return [{ id: 'surface', name: spot.id === 'study-desk' ? 'Desktop' : 'Tabletop', level: 1 }];
}

export function storageSpot(item) {
  const id = item.storageSpot === undefined ? defaults[item.location] : item.storageSpot;
  const spot = STORAGE_SPOTS.find(entry => entry.id === id && entry.location === item.location);
  if (!spot) throw new Error('Choose a home storage spot compatible with the storage type.');
  return spot;
}

export function validStorageSpot(item) {
  const spot = STORAGE_SPOTS.find(spot => spot.id === item.storageSpot && spot.location === item.location);
  return (item.storageSpot === undefined || Boolean(spot)) &&
    (item.storageShelf === undefined || Boolean(spot && shelvesFor(spot).some(shelf => shelf.id === item.storageShelf)));
}

export function storageShelf(item) {
  if (item.storageShelf === undefined) return null;
  const shelf = shelvesFor(storageSpot(item)).find(shelf => shelf.id === item.storageShelf);
  if (!shelf || item.storageSpot === undefined) throw new Error('Choose a valid shelf for the selected home storage spot.');
  return shelf;
}

export const spotLabel = spot => `${spot.room} / ${spot.name}`;

export function placementLabel(item) {
  const shelf = storageShelf(item);
  return `${spotLabel(storageSpot(item))}${shelf ? ` / ${shelf.name}` : ''}`;
}
