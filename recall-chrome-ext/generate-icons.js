import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple function to create a colored PNG icon
// This creates a base64 encoded PNG
function createIcon(size, color = '#3B82F6') {
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Create a simple SVG
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="rgb(${r},${g},${b})"/>
  <path d="M${size*0.25} ${size*0.25} L${size*0.75} ${size*0.25} L${size*0.75} ${size*0.75} L${size*0.5} ${size*0.6} L${size*0.25} ${size*0.75} Z" fill="white"/>
</svg>`;
  
  return Buffer.from(svg).toString('base64');
}

// Create icons directory
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// For now, create simple SVG files (Chrome accepts SVG as icons)
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#3B82F6"/>
  <path d="M${size*0.25} ${size*0.25} L${size*0.75} ${size*0.25} L${size*0.75} ${size*0.75} L${size*0.5} ${size*0.6} L${size*0.25} ${size*0.75} Z" fill="white"/>
</svg>`;
  
  const filename = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log('\n✓ All placeholder icons created successfully!');
console.log('Note: These are SVG files. Chrome supports SVG icons in extensions.');
