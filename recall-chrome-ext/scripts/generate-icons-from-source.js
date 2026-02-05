/**
 * Generate extension icons (16, 32, 48, 128) from repo-root recal-icon-128.png.
 * Run from recall-chrome-ext: node scripts/generate-icons-from-source.js
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.join(__dirname, "..");
const sourcePath = path.join(extRoot, "..", "recal-icon-128.png");
const outDir = path.join(extRoot, "assets", "icons");
const sizes = [16, 32, 48, 128];

if (!fs.existsSync(sourcePath)) {
  console.error("Source image not found:", sourcePath);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const buffer = await fs.promises.readFile(sourcePath);

for (const size of sizes) {
  const outPath = path.join(outDir, `icon-${size}.png`);
  await sharp(buffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log("Created", outPath);
}

console.log("\nAll icons generated in assets/icons/");
