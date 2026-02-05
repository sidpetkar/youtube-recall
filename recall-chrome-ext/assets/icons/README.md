# Extension Icons

This folder contains the extension icons (16, 32, 48, 128 px) used by the manifest, toolbar, popup, and notifications.

## Regenerating from source

Source asset: **`recal-icon-128.png`** in the repo root (one level up from `recall-chrome-ext`).

From `recall-chrome-ext` run:

```bash
npm run icons
```

This uses `scripts/generate-icons-from-source.js` (sharp) to resize the source to 16, 32, 48, and 128 and overwrite the PNGs here.

## Sizes

- icon-16.png (16×16) – toolbar
- icon-32.png (32×32)
- icon-48.png (48×48) – extension management
- icon-128.png (128×128) – store listing, popup, notifications

## Other methods

1. **Online Icon Generators**:
   - https://favicon.io/
   - https://realfavicongenerator.net/

2. **Design Tools**:
   - Figma
   - Adobe Illustrator
   - Canva

3. **Command Line**:
   ```bash
   # Using ImageMagick
   convert logo.png -resize 16x16 icon-16.png
   convert logo.png -resize 32x32 icon-32.png
   convert logo.png -resize 48x48 icon-48.png
   convert logo.png -resize 128x128 icon-128.png
   ```

## Design Guidelines

- Use a simple, recognizable symbol (e.g., bookmark icon)
- Make it work in both light and dark themes
- Ensure good contrast
- Keep it consistent with your web app branding

## Temporary Fix

For development, you can use simple colored squares or download free icons from:
- https://icons8.com/
- https://www.flaticon.com/
- https://heroicons.com/
