import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const LOGO = fileURLToPath(new URL("../public/logo-ap.png", import.meta.url));

/**
 * Buat ikon vujud "tile" putih dengan logo ANGGA PART di tengahnya.
 * favicon umumnya tampil di tab light/dark, jadi dasar putih dipakai
 * agar logo gelap tetap terbaca.
 */
async function tile(size, { rounded = true } = {}) {
  const radius = Math.round(size * (rounded ? 0.22 : 0));
  const tileSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/>` +
      "</svg>",
  );
  const base = await sharp(tileSvg).png().toBuffer();

  const glyphSize = Math.round(size * 0.78);
  const glyph = await sharp(LOGO).resize(glyphSize, glyphSize).png().toBuffer();

  return sharp(base)
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toBuffer();
}

const apple = await sharp({ create: { width: 180, height: 180, channels: 4, background: "#ffffff" } })
  .png()
  .toBuffer();
const appleGlyph = await sharp(LOGO).resize(132, 132).png().toBuffer();
await sharp(apple)
  .composite([{ input: appleGlyph, gravity: "center" }])
  .png()
  .toFile("public/apple-touch-icon.png");

const png32 = await tile(32);
const png16 = await tile(16);
await writeFile("public/favicon-32x32.png", png32);
await writeFile("public/favicon-16x16.png", png16);

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  const bodies = [];
  let offset = 6 + 16 * images.length;
  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry[0] = size === 256 ? 0 : size;
    entry[1] = size === 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(entry);
    bodies.push(png);
  }
  return Buffer.concat([header, ...entries, ...bodies]);
}

await writeFile("public/favicon.ico", ico([
  { size: 32, png: png32 },
  { size: 16, png: png16 },
]));

console.log("icons generated from public/logo-ap.png");