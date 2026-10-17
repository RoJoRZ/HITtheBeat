import { readFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
/** @param {string[]} args */
const gh = args => { const r = spawnSync('gh', args, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr); return r.stdout; };
/** @typedef {{id:number,tag_name:string,target_commitish:string,draft:boolean,assets:Array<{name:string,state:string,digest:string}>}} Release */
/** @param {Release} release @param {Record<string,string>} expected */
function verifyAssets(release, expected) {
  const names = Object.keys(expected);
  if (!names.length || !Array.isArray(release.assets) || release.assets.length !== names.length) throw new Error('Uploaded asset set differs');
  for (const name of names) {
    const matches = release.assets.filter(asset => asset.name === name);
    if (matches.length !== 1 || matches[0].state !== 'uploaded' || matches[0].digest !== expected[name]) throw new Error(`Uploaded asset mismatch: ${name}`);
  }
}
/** Complete only the uniquely created draft on the approved source. A new draft may not have a tag ref yet.
 * @param {{repo:string,sha:string,tag:string,expected:Record<string,string>}} options
 * @param {(args:string[])=>string} run
 */
export function completeDraft({ repo, sha, tag, expected }, run) {
  /** @type {Release[]} */
  const releases = JSON.parse(run(['api', `repos/${repo}/releases?per_page=100`]));
  if (!Array.isArray(releases)) throw new Error('Invalid release collection');
  const matches = releases.filter(release => release?.tag_name === tag);
  const release = matches[0];
  if (matches.length !== 1 || !release || release.draft !== true || release.target_commitish !== sha || !Number.isSafeInteger(release.id) || release.id <= 0) throw new Error('Created draft identity differs or is ambiguous');
  verifyAssets(release, expected);
  /** @type {Release} */
  const published = JSON.parse(run(['api', `repos/${repo}/releases/${release.id}`, '--method', 'PATCH', '-F', 'draft=false']));
  if (!published || published.id !== release.id || published.draft !== false || published.tag_name !== tag || published.target_commitish !== sha) throw new Error('Published release identity differs');
  verifyAssets(published, expected);
  return published.id;
}
function main() {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8')), tag = `v${version}`, repo = process.env.GITHUB_REPOSITORY, sha = process.env.GITHUB_SHA;
  if (!repo || !sha) throw new Error('GitHub repository and source SHA are required');
  const hashes = readFileSync('release/SHA256SUMS.txt', 'utf8').trim().split('\n').map(line => { const [hash, name] = line.split('  '); return { hash, name }; });
  if (hashes.length !== 4) throw new Error('All four platform downloads are required');
  copyFileSync('docs/RELEASE.md', 'release/RELEASE.md');
  copyFileSync('public/licenses/THIRD-PARTY-NOTICES.txt', 'release/THIRD-PARTY-NOTICES.txt');
  const files = [...hashes.map(x => x.name), 'SHA256SUMS.txt', 'RELEASE.md', 'THIRD-PARTY-NOTICES.txt'];
  const args = ['release', 'create', tag, ...files.map(f => `release/${f}`), '--repo', repo, '--target', sha, '--draft', '--title', `HITtheBeat ${version}`, '--generate-notes'];
  if (version.includes('-')) args.push('--prerelease');
  // Never overwrite existing releases/assets or move tags. Failure retains the diagnostic draft.
  gh(args);
  const expected = Object.fromEntries(files.map(name => [name, 'sha256:' + createHash('sha256').update(readFileSync(`release/${name}`)).digest('hex')]));
  completeDraft({ repo, sha, tag, expected }, gh);
  console.log(`Published ${tag} from approved source ${sha}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
