#!/usr/bin/env python3
"""
Generate mobile-optimized fractal background assets.
Usage: python3 tools/gen_bg.py

Requirements:
- PIL (Pillow): pip install Pillow
- Or use ImageMagick: convert fractal.webp -resize 900x fractal-mobile-1x.webp
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("PIL (Pillow) not found. Install with: pip install Pillow")
    print("\nAlternatively, use ImageMagick manually:")
    print("  cd assets/bg")
    print("  convert ../../fractal.webp -resize 900x -quality 80 fractal-mobile-1x.webp")
    print("  convert ../../fractal.webp -resize 1800x -quality 80 fractal-mobile-2x.webp")
    print("  convert ../../fractal.webp -resize 2700x -quality 80 fractal-mobile-3x.webp")
    sys.exit(1)

# Paths
root_dir = Path(__file__).parent.parent
src = root_dir / 'fractal.webp'
out_dir = root_dir / 'assets' / 'bg'

# Ensure output directory exists
out_dir.mkdir(parents=True, exist_ok=True)

# Check if source file exists
if not src.exists():
    print(f"Error: Source file not found: {src}")
    print("Please ensure fractal.webp exists in the repo root.")
    sys.exit(1)

# Targets: (name, width, webp_quality, avif_quality)
targets = [
    ('fractal-mobile-1x', 900, 80, 35),
    ('fractal-mobile-2x', 1800, 80, 35),
    ('fractal-mobile-3x', 2700, 80, 35),
    # Desktop versions (optional, for future use)
    ('fractal-desktop-1x', 1200, 85, 40),
    ('fractal-desktop-2x', 2400, 85, 40),
    ('fractal-desktop-3x', 3600, 85, 40),
]

print("Generating fractal background assets...")
print(f"Source: {src}")
print(f"Output: {out_dir}")

# Load source image
try:
    img = Image.open(src)
    orig_width, orig_height = img.size
    print(f"Original size: {orig_width}x{orig_height}")
except Exception as e:
    print(f"Error loading source image: {e}")
    sys.exit(1)

for name, width, webp_q, avif_q in targets:
    try:
        # Calculate new height maintaining aspect ratio
        if width > orig_width:
            new_width = orig_width
            new_height = orig_height
        else:
            ratio = width / orig_width
            new_width = width
            new_height = int(orig_height * ratio)
        
        print(f"\nProcessing {name} ({new_width}x{new_height})...")
        
        # Resize image
        resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Generate WebP
        webp_path = out_dir / f"{name}.webp"
        resized.save(webp_path, 'WEBP', quality=webp_q, method=6)
        size_kb = webp_path.stat().st_size / 1024
        print(f"  ✓ {webp_path} ({size_kb:.1f} KB)")
        
        # Generate AVIF if supported (Pillow 10+)
        try:
            avif_path = out_dir / f"{name}.avif"
            resized.save(avif_path, 'AVIF', quality=avif_q)
            size_kb = avif_path.stat().st_size / 1024
            print(f"  ✓ {avif_path} ({size_kb:.1f} KB)")
        except Exception as e:
            print(f"  ⚠ AVIF not supported (Pillow version too old): {e}")
            print(f"    Skipping {name}.avif - WebP only")
            
    except Exception as e:
        print(f"  ✗ Failed to generate {name}: {e}")
        continue

print("\n✓ Done! Background assets generated.")
print("\nNote: If AVIF generation failed, install Pillow 10+ or use WebP files only.")

