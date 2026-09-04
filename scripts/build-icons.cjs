/* Exact official SVG geometry, recolored to the approved gold/espresso app-icon theme. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const sharp = require("sharp"); // Supplied by the existing Next installation.
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "public/brand/ghahvino-logomark.svg"), "utf8");
const background = "#1E1009";
const gold = "#E59141";
const themedSource = Buffer.from(source.replace('fill="#2B1D17"', `fill="${gold}"`));
async function render(size, scale) {
  const inner = Math.round(size * scale);
  const mark = await sharp(themedSource).resize(inner, inner, { fit: "contain" }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background } })
    .composite([{ input: mark, gravity: "centre" }]).removeAlpha().png().toBuffer();
}
async function verify(buffer, size, maskable) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, size); assert.equal(info.height, size); assert.equal(info.channels, 3);
  assert.deepEqual([...data.subarray(0, 3)], [30, 16, 9]);
  let radius = 0, pixels = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 3;
    if (data[i] > 100 && data[i + 1] > 50 && data[i] > data[i + 1] * 1.25) {
      radius = Math.max(radius, Math.hypot(x + .5 - size / 2, y + .5 - size / 2)); pixels++;
    }
  }
  assert.ok(pixels > size * size * .05, "Visible mark required");
  if (maskable) assert.ok(radius <= size * .4, "Maskable safe circle exceeded");
  return Number((radius / size).toFixed(4));
}
(async () => {
  for (const [file, size, scale, maskable] of [
    ["icons/icon-192.png", 192, .94, false], ["icons/icon-512.png", 512, .94, false],
    ["icons/maskable-icon-192.png", 192, .74, true], ["icons/maskable-icon-512.png", 512, .74, true],
    ["apple-touch-icon.png", 180, .90, false],
  ]) {
    const png = await render(size, scale), radius = await verify(png, size, maskable);
    fs.writeFileSync(path.join(root, "public", file), png);
    console.log(`${file}: ${size}px, opaque, ${png.length} bytes, mark radius ${radius}`);
  }
  const sizes = [16, 32, 48, 256];
  // ICO's PNG frames must be RGBA, even when every alpha value is fully opaque.
  const frames = await Promise.all(sizes.map(async size => sharp(await render(size, .94)).ensureAlpha().png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach((frame, i) => {
    const entry = 6 + 16 * i;
    header[entry] = header[entry + 1] = sizes[i] === 256 ? 0 : sizes[i];
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(frame.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += frame.length;
  });
  fs.writeFileSync(path.join(root, "src/app/favicon.ico"), Buffer.concat([header, ...frames]));
  console.log("favicon.ico: 16/32/48/256px frames");
})().catch(error => { console.error(error); process.exitCode = 1; });
