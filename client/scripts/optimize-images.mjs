// Generates resized WebP copies of the images used on the home page and in the
// shared layout. Originals are kept so existing references keep working.
//
// Usage: node scripts/optimize-images.mjs
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// [path relative to /public, max width in px]
const targets = [
  ['assets/logo/logo-white.png', 600],
  ['assets/images/sec2-icon-remodel.png', 160],
  ['assets/images/sec2-icon-bathroom.png', 160],
  ['assets/images/sec2-icon-home.png', 160],
  ['assets/images/sec6-icon-residential-renovation.png', 160],
  ['assets/images/sec6-icon-design-planning.png', 160],
  ['assets/images/sec6-icon-turnkey-renovation.png', 160],
  ['assets/images/sec3-navy-kitchen.jpg', 900],
  ['assets/images/sec6-why-choose.jpg', 1000],
  ['assets/images/kitchen-sage-luxury.jpg', 900],
  ['assets/images/project-bathroom.jpg', 900],
  ['assets/images/basement-renovation-scaffolding.jpg', 900],
  ['assets/images/deck-installation-luxury.jpg', 900],
  ['assets/images/floor-installation-worker.jpg', 900],
  ['assets/images/painting-electrical-scaffolding.jpg', 900],
  ['assets/images/photo-1756079664354-34944e001f6d.jpeg', 800],
  ['assets/images/photo-1765745518752-68a289300789.jpeg', 800],
  ['assets/images/photo-1769253523308-f7bff35c60b1.jpeg', 800],
  ['assets/images/about/about-city-bg.jpg', 1000],
  ['assets/images/about/user7.jpg', 120],
  ['assets/images/about/user8.jpg', 120],
  ['assets/images/about/user9.jpg', 120],
  ['assets/images/about/toni-starner.jpg', 120],
];

for (const [rel, maxWidth] of targets) {
  const input = join(publicDir, rel);
  if (!existsSync(input)) {
    console.warn(`skip (missing): ${rel}`);
    continue;
  }
  const output = input.replace(/\.(png|jpe?g)$/i, '.webp');
  const info = await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 74, effort: 6 })
    .toFile(output);
  console.log(`${rel} -> ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}
