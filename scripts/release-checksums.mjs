import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const names = [
  `HITtheBeat-${version}-mac-arm64.dmg`,
  `HITtheBeat-${version}-mac-arm64.zip`,
  `HITtheBeat-${version}-win-x64.zip`,
  `HITtheBeat-${version}-win-x64.exe`,
];
const lines = [];
for (const name of names) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path.join('release', name))) hash.update(chunk);
  lines.push(`${hash.digest('hex')}  ${name}`);
}
await writeFile('release/SHA256SUMS.txt', `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
