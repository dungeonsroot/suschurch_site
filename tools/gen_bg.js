#!/usr/bin/env node
// Generate mobile-optimized fractal background assets
// Usage: node tools/gen_bg.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const src = path.join(rootDir, 'fractal.webp');
const outDir = path.join(rootDir, 'assets', 'bg');

// Ensure output directory exists
fs.mkdirSync(outDir, { recursive: true });

// Check if source file exists
if (!fs.existsSync(src)) {
  console.error(`Source file not found: ${src}`);
  console.error('Please ensure fractal.webp exists in the repo root.');
  process.exit(1);
}

// Try to use sharp if available
let sharp;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default;
} catch (e) {
  console.error('sharp not found. Please install: npm install -D sharp');
  console.error('Or manually create the background files:');
  console.error('  assets/bg/fractal-mobile-1x.webp (900px width, quality 80)');
  console.error('  assets/bg/fractal-mobile-2x.webp (1800px width, quality 80)');
  console.error('  assets/bg/fractal-mobile-3x.webp (2700px width, quality 80)');
  process.exit(1);
}

const targets = [
  { name: 'fractal-mobile-1x', w: 900, quality: { webp: 80, avif: 35 } },
  { name: 'fractal-mobile-2x', w: 1800, quality: { webp: 80, avif: 35 } },
  { name: 'fractal-mobile-3x', w: 2700, quality: { webp: 80, avif: 35 } },
  // Desktop versions (optional, for future use)
  { name: 'fractal-desktop-1x', w: 1200, quality: { webp: 85, avif: 40 } },
  { name: 'fractal-desktop-2x', w: 2400, quality: { webp: 85, avif: 40 } },
  { name: 'fractal-desktop-3x', w: 3600, quality: { webp: 85, avif: 40 } },
];

console.log('Generating fractal background assets...');
console.log(`Source: ${src}`);
console.log(`Output: ${outDir}`);

for (const t of targets) {
  try {
    console.log(`Processing ${t.name} (${t.w}px)...`);
    
    // Generate WebP
    const webpPath = path.join(outDir, `${t.name}.webp`);
    await sharp(src)
      .resize({ width: t.w, withoutEnlargement: true })
      .webp({ quality: t.quality.webp })
      .toFile(webpPath);
    console.log(`  ✓ ${webpPath}`);
    
    // Generate AVIF (optional but recommended)
    const avifPath = path.join(outDir, `${t.name}.avif`);
    await sharp(src)
      .resize({ width: t.w, withoutEnlargement: true })
      .avif({ quality: t.quality.avif })
      .toFile(avifPath);
    console.log(`  ✓ ${avifPath}`);
  } catch (err) {
    console.error(`  ✗ Failed to generate ${t.name}:`, err.message);
  }
}

console.log('\nDone! Background assets generated.');

