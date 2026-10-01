// Shown when an item or category has no photo. Previously a stock city-street
// photo, which looked like a real (wrong) product picture.
const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#F3D9E3'/><g fill='none' stroke='#2F5D3A' stroke-opacity='.45' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'><path d='M150 165l50-28 50 28v70l-50 28-50-28z'/><path d='M150 165l50 28 50-28M200 193v70'/></g></svg>`;

export const ITEM_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const pluralize = (count, word, plural = `${word}s`) =>
  `${count} ${count === 1 ? word : plural}`;
