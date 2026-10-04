// Canonical geometry is assets/brand/master.json. All SVG/PNG files are exports.
// npm ci && npm run brand:build
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// BRAND_NODE_MODULES optionally selects the bundled desktop runtime.
const sharp = process.env.BRAND_NODE_MODULES
  ? require(path.join(process.env.BRAND_NODE_MODULES, 'sharp')) : require('sharp');
const dir = fileURLToPath(new URL('../assets/brand/', import.meta.url));
const master = JSON.parse(await fs.readFile(path.join(dir, 'master.json'), 'utf8'));
const { ink, forest, white } = master.colors;
const symbol = (color) => `<g fill="${color}"><path d="${master.symbol_path}"/><path d="${master.symbol_path}" transform="${master.symbol_mirror}"/></g>`;
const wordmark = (color) => `<g fill="${color}" fill-rule="evenodd">${master.wordmark_paths.map(d => `<path d="${d}"/>`).join('')}</g>`;
const svg = (box, content, title = master.name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="${title}"><title>${title}</title>${content}</svg>\n`;
const write = (name, content) => fs.writeFile(path.join(dir, name), content);
for (const [name, color] of [['motiq-horizontal', ink], ['motiq-black', '#000000'], ['motiq-reversed', white], ['motiq-forest', forest]]) {
  await write(`${name}.svg`, svg('-8 -8 1076 294', symbol(color) + wordmark(color)));
}
for (const [name, color] of [['motiq-icon', ink], ['motiq-icon-black', '#000000'], ['motiq-icon-reversed', white], ['motiq-icon-forest', forest]]) {
  await write(`${name}.svg`, svg(master.symbol_viewbox, symbol(color)));
}
await write('motiq-wordmark.svg', svg(master.wordmark_viewbox, wordmark(ink)));
await write('motiq-stacked.svg', svg('0 0 680 550', `<g transform="translate(150 20)">${symbol(ink)}</g><g transform="translate(-250 300) scale(.8)">${wordmark(ink)}</g>`));
// Legacy filename kept so older links also receive the approved symbol.
await write('motiq-structure.svg', svg(master.symbol_viewbox, symbol(forest)));
const square = (maskable = false) => svg('0 0 512 512', `<rect width="512" height="512"${maskable ? '' : ' rx="96"'} fill="${forest}"/><g transform="translate(${maskable ? 104 : 74} ${maskable ? 150 : 129}) scale(${maskable ? .8 : .96})">${symbol(white)}</g>`);
await write('app-icon.svg', square());
await write('app-icon-maskable.svg', square(true));
await write('favicon.svg', square());
for (const [name, source, size] of [['favicon-16.png','app-icon.svg',16],['favicon-32.png','app-icon.svg',32],['apple-touch-icon.png','app-icon-maskable.svg',180],['app-icon-192.png','app-icon.svg',192],['app-icon-512.png','app-icon.svg',512],['app-icon-maskable-512.png','app-icon-maskable.svg',512]]) {
  await sharp(path.join(dir, source)).resize(size,size).png().toFile(path.join(dir,name));
}
for (const name of ['motiq-horizontal','motiq-reversed','motiq-black','motiq-forest','motiq-stacked','motiq-icon','motiq-icon-reversed']) {
  await sharp(path.join(dir,`${name}.svg`)).resize({width: name.includes('icon') ? 1024 : 2400}).png().toFile(path.join(dir,`${name}.png`));
}
// ICO supports PNG payloads. Preserve both favicon sizes in a reproducible file.
const buffers = await Promise.all([16,32].map(n => fs.readFile(path.join(dir,`favicon-${n}.png`))));
const header = Buffer.alloc(6 + 16 * buffers.length);
header.writeUInt16LE(1,2); header.writeUInt16LE(buffers.length,4);
let offset = header.length;
buffers.forEach((buf,i) => {
  const p = 6 + i*16; const n = [16,32][i]; header[p]=n; header[p+1]=n;
  header.writeUInt16LE(1,p+4); header.writeUInt16LE(32,p+6);
  header.writeUInt32LE(buf.length,p+8); header.writeUInt32LE(offset,p+12); offset += buf.length;
});
await write('favicon.ico', Buffer.concat([header,...buffers]));
console.log('Motiq SVG, transparent PNG, favicons and app icons exported.');
