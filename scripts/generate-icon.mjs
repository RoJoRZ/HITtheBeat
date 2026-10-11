import { _electron as electron } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const desktop = await electron.launch({ args: ['.', '--user-data-dir=/tmp/hitthebeat-icon-render'], env: { ...process.env, HITTHEBEAT_DEV: '0' } });
try {
  const page = await desktop.firstWindow();
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.getByRole('heading', { name: 'Mijn oefensessies', exact: true }).waitFor();
  await page.setContent(`<style>html,body{margin:0!important;padding:0!important;min-width:0!important;overflow:hidden!important;background:transparent!important}svg{display:block}</style>${await readFile('design/app-icon.svg','utf8')}`);
  await page.evaluate(() => { for (const element of [document.documentElement, document.body]) { element.style.margin = '0'; element.style.padding = '0'; element.style.overflow = 'hidden'; element.style.background = 'transparent'; } const svg = document.querySelector('svg'); if (svg) svg.style.display = 'block'; });
  await page.screenshot({ path: 'build/icon.png', omitBackground: true });
} finally { await desktop.close(); }
await mkdir('build/icon.iconset', { recursive: true });
for (const size of [16,32,128,256,512]) for (const scale of [1,2]) {
  execFileSync('sips', ['-z', String(size*scale), String(size*scale), 'build/icon.png', '--out', `build/icon.iconset/icon_${size}x${size}${scale===2?'@2x':''}.png`]);
}
execFileSync('iconutil', ['-c','icns','build/icon.iconset','-o','build/icon.icns']);
// Windows ICO supports embedded PNG images, here at 16–256 pixels.
const images = await Promise.all([16,32,128,256].map(size => readFile(`build/icon.iconset/icon_${size}x${size}.png`)));
const header = Buffer.alloc(6 + images.length*16); header.writeUInt16LE(1,2); header.writeUInt16LE(images.length,4);
let offset = header.length;
images.forEach((png,i) => { const size=[16,32,128,256][i], at=6+i*16; header[at]=size%256;header[at+1]=size%256;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(png.length,at+8);header.writeUInt32LE(offset,at+12);offset+=png.length; });
await writeFile('build/icon.ico',Buffer.concat([header,...images]));
