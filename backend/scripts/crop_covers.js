import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const coversDir = "public/covers";
const outputDir = "public/covers_cropped";
fs.mkdirSync(outputDir, { recursive: true });

console.log("🎨 Cropping all covers...");

const files = fs.readdirSync(coversDir).filter(f => f.endsWith(".jpg"));
files.forEach((file, i) => {
  const inputPath = path.join(coversDir, file);
  const outputPath = path.join(outputDir, file);
  try {
    execSync(`magick "${inputPath}" -crop 40%x100%+0+0 "${outputPath}"`);
    console.log(`✅ Cropped ${file}`);
  } catch (err) {
    console.error(`❌ Error cropping ${file}:`, err.message);
  }
});

console.log("🎉 Cropping complete! Cropped covers saved to /public/covers_cropped");
