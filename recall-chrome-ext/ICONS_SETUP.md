# Quick Icon Setup

Since you need icons immediately, here are the fastest options:

## Option 1: Download Free Icon (FASTEST - 2 minutes)

1. Go to: https://www.flaticon.com/free-icon/bookmark_1828970
2. Download the icon (free, no signup needed)
3. Use an online resizer: https://www.resizeimage.net/
4. Upload and create 4 versions:
   - 16x16 → save as `icon-16.png`
   - 32x32 → save as `icon-32.png`
   - 48x48 → save as `icon-48.png`
   - 128x128 → save as `icon-128.png`
5. Move all 4 files to `recall-chrome-ext/assets/icons/`

## Option 2: Use Included Simple Icons (if Python installed)

Run this command from `recall-chrome-ext` folder:
```bash
python create_icons.py
```

Then move the generated files to `assets/icons/`

## Option 3: Use Windows Paint (5 minutes)

1. Open Paint
2. Create a 128x128 blue square
3. Save as `icon-128.png` in `recall-chrome-ext/assets/icons/`
4. Repeat for 48x48, 32x32, 16x16

Any of these will work for testing! You can replace with professional icons later.
