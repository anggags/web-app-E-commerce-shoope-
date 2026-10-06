import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SRC = fileURLToPath(new URL("../public/logo-ap.png", import.meta.url));
const OUT = fileURLToPath(new URL("../public/logo-ap.png", import.meta.url));

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
let minX = w;
let minY = h;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const alpha = data[(y * w + x) * 4 + 3];
    if (alpha > 30) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

const cropped = sharp(SRC).extract({
  left: minX,
  top: minY,
  width: cropW,
  height: cropH,
});

const target = 512;
const pad = target * 0.1;
const contentBox = target - pad * 2;
const scale = Math.min(contentBox / cropW, contentBox / cropH);
const glyphW = Math.round(cropW * scale);
const glyphH = Math.round(cropH * scale);
const left = Math.round((target - glyphW) / 2);
const top = Math.round((target - glyphH) / 2);

const glyph = await cropped.resize(glyphW, glyphH).png().toBuffer();
const canvas = sharp({
  create: { width: target, height: target, channels: 4, background: '#00000000' },
});

await canvas.composite([{ input: glyph, left, top }]).png().toFile(OUT);
console.log(
  `normalized: cropped ${cropW}x${cropH} -> glyph ${glyphW}x${glyphH} on ${target}x${target}`,
);