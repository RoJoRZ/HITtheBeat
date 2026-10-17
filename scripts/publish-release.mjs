import { readFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const run = args => { const r = spawnSync('gh', args, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr); return r.stdout; };
const { version } = JSON.parse(readFileSync('package.json', 'utf8')), tag = `v${version}`, repo = process.env.GITHUB_REPOSITORY;
const hashes = readFileSync('release/SHA256SUMS.txt', 'utf8').trim().split('\n').map(line => { const [hash, name] = line.split('  '); return { hash, name }; });
if (hashes.length !== 4) throw new Error('All four platform downloads are required');
copyFileSync('docs/RELEASE.md', 'release/RELEASE.md');
copyFileSync('public/licenses/THIRD-PARTY-NOTICES.txt', 'release/THIRD-PARTY-NOTICES.txt');
const files = [...hashes.map(x => x.name), 'SHA256SUMS.txt', 'RELEASE.md', 'THIRD-PARTY-NOTICES.txt'];
const args = ['release', 'create', tag, ...files.map(f => `release/${f}`), '--repo', repo, '--target', process.env.GITHUB_SHA, '--draft', '--title', `HITtheBeat ${version}`, '--generate-notes'];
if (version.includes('-')) args.push('--prerelease');
// No --clobber, edits of existing releases, or tag moves. Failure leaves a diagnostic draft.
run(args);
const release = JSON.parse(run(['api', `repos/${repo}/releases/tags/${tag}`]));
for (const name of files) {
  const asset = release.assets.find(a => a.name === name);
  const digest = 'sha256:' + createHash('sha256').update(readFileSync(`release/${name}`)).digest('hex');
  if (!asset || asset.state !== 'uploaded' || asset.digest !== digest) throw new Error(`Uploaded asset mismatch: ${name}`);
}
run(['release', 'edit', tag, '--repo', repo, '--draft=false']);
console.log(`Published ${tag} from approved source ${process.env.GITHUB_SHA}`);
