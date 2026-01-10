# Background Assets Generation

This directory contains mobile-optimized fractal background assets.

## Required Files

For optimal mobile performance, generate these files:

### Mobile Assets (Required)
- `fractal-mobile-1x.webp` - 900px width, quality 80
- `fractal-mobile-2x.webp` - 1800px width, quality 80
- `fractal-mobile-3x.webp` - 2700px width, quality 80

### Desktop Assets (Optional but recommended)
- `fractal-desktop-1x.webp` - 1200px width, quality 85
- `fractal-desktop-2x.webp` - 2400px width, quality 85
- `fractal-desktop-3x.webp` - 3600px width, quality 85

### AVIF Versions (Optional but recommended for better compression)
- `fractal-mobile-1x.avif` - 900px width, quality 35
- `fractal-mobile-2x.avif` - 1800px width, quality 35
- `fractal-mobile-3x.avif` - 2700px width, quality 35
- (Same for desktop versions)

## Generation Methods

### Method 1: Python (Pillow)

```bash
pip install Pillow
python3 tools/gen_bg.py
```

### Method 2: Node.js (Sharp)

```bash
npm install -D sharp
node tools/gen_bg.js
```

### Method 3: ImageMagick (Manual)

```bash
cd assets/bg
convert ../../fractal.webp -resize 900x -quality 80 fractal-mobile-1x.webp
convert ../../fractal.webp -resize 1800x -quality 80 fractal-mobile-2x.webp
convert ../../fractal.webp -resize 2700x -quality 80 fractal-mobile-3x.webp
```

### Method 4: Online Tools or Image Editors

Use any image editor that supports WebP/AVIF:
1. Open `fractal.webp` (from repo root)
2. Resize to target width (maintain aspect ratio)
3. Export as WebP with specified quality
4. Save to `assets/bg/` with correct filename

## Fallback

If these files don't exist, the CSS will fallback to the original `fractal.webp` from the repo root. However, this may cause blur on mobile devices.

## Notes

- Fixed width approach (not cover) prevents GPU downscaling artifacts
- DPR-specific assets ensure crisp rendering on all devices
- AVIF format provides better compression but requires browser support

