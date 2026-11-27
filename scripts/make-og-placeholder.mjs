// One-time helper: writes public/og-default.png, a plain 1200x630 accent-colored PLACEHOLDER.
// TODO: replace public/og-default.png with a designed 1200x630 image. No dependencies needed.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;
const bg = [0x1f, 0x5f, 0xa8], fg = [0xfd, 0xfd, 0xfc];
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  const row = y * (W * 3 + 1);
  raw[row] = 0;
  for (let x = 0; x < W; x++) {
    // a thin light bar as a minimal visual motif
    const bar = y > 400 && y < 408 && x > 100 && x < 500;
    const c = bar ? fg : bg;
    raw.set(c, row + 1 + x * 3);
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(new URL('../public/og-default.png', import.meta.url), png);
console.log('wrote public/og-default.png', png.length, 'bytes');
