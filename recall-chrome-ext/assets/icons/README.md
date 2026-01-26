# Icon Placeholder

This folder should contain extension icons in the following sizes:
- icon-16.png (16x16)
- icon-32.png (32x32)
- icon-48.png (48x48)
- icon-128.png (128x128)

## Generating Icons

You can use any of these methods:

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
