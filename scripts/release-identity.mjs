import { readFileSync, appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
/** A draft may have no tag ref: a tag-endpoint 404 alone cannot prove absence.
 * @param {string} repo @param {string} tag
 * @param {(url:string)=>{status:number|null,stdout:string,stderr:string}} request
 */
export function assertReleaseAbsent(repo, tag, request) {
  const response = request(`repos/${repo}/releases/tags/${tag}`);
  if (response.status === 0) throw new Error('Release already exists; never replace a published version or reuse a draft');
  if (!/HTTP 404/.test(response.stderr)) throw new Error('Cannot verify absence of release: ' + response.stderr);
  for (let page = 1; ; page++) {
    const result = request(`repos/${repo}/releases?per_page=100&page=${page}`);
    if (result.status !== 0) throw new Error('Cannot inspect draft releases: ' + result.stderr);
    const releases = JSON.parse(result.stdout);
    if (!Array.isArray(releases)) throw new Error('Invalid release collection');
    if (releases.some(release => release?.tag_name === tag)) throw new Error('Release already exists; never replace a published version or reuse a draft');
    if (releases.length < 100) return;
  }
}
function main() {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error('Invalid release version');
  const tag = `v${version}`, repo = process.env.GITHUB_REPOSITORY;
  if (!repo) throw new Error('GitHub repository is required');
  if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME !== tag) throw new Error('Tag and package version differ');
  assertReleaseAbsent(repo, tag, url => spawnSync('gh', ['api', url], { encoding: 'utf8' }));
  const output = process.env.GITHUB_OUTPUT;
  if (!output) throw new Error('GITHUB_OUTPUT is required');
  appendFileSync(output, `tag=${tag}\n`);
  console.log(`Release candidate ${tag}, source ${process.env.GITHUB_SHA}. Full tests precede manual approval; no installers before approval.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
