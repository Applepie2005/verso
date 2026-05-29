/**
 * Regenera js/media-manifest.json con todas las imágenes de ../media/
 * Uso: node scripts/generate-media-manifest.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.join(__dirname, "..", "media");
const outFile = path.join(__dirname, "..", "js", "media-manifest.json");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

if (!fs.existsSync(mediaDir)) {
  console.error("No existe la carpeta media/", mediaDir);
  process.exit(1);
}

const files = fs
  .readdirSync(mediaDir)
  .filter((f) => exts.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

const payload = { images: files.map((f) => `media/${f}`) };
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Escritas ${payload.images.length} rutas en`, outFile);
