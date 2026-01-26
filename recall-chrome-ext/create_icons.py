from PIL import Image, ImageDraw

# Create a simple bookmark icon in different sizes
sizes = [16, 32, 48, 128]
color = (59, 130, 246)  # Blue color #3B82F6

for size in sizes:
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate bookmark shape
    padding = size // 8
    width = size - (padding * 2)
    height = size - padding
    
    # Draw rounded rectangle bookmark
    points = [
        (padding, padding),
        (size - padding, padding),
        (size - padding, height - padding),
        (size // 2, height - (padding * 2)),
        (padding, height - padding),
    ]
    
    draw.polygon(points, fill=color)
    
    # Save
    img.save(f'icon-{size}.png')
    print(f'Created icon-{size}.png')

print('\nAll icons created successfully!')
print('Copy these files to: recall-chrome-ext/assets/icons/')
