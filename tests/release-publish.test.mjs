import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completeDraft } from '../scripts/publish-release.mjs';
import { assertReleaseAbsent } from '../scripts/release-identity.mjs';
const options = { repo: 'owner/repo', sha: 'a'.repeat(40), tag: 'v1.2.0', expected: { 'mac.dmg': 'sha256:mac', 'win.exe': 'sha256:win' } };
const draft = () => ({ id: 42, tag_name: options.tag, target_commitish: options.sha, draft: true, assets: Object.entries(options.expected).map(([name, digest]) => ({ name, digest, state: 'uploaded' })) });
function client(releases, response) {
  const calls = [];
  return { calls, run(args) {
    calls.push(args);
    if (args[1] === 'repos/owner/repo/releases?per_page=100') return JSON.stringify(releases);
    if (args[1] === 'repos/owner/repo/releases/42' && args.includes('PATCH')) return JSON.stringify(response ?? { ...releases[0], draft: false });
    throw new Error('Unexpected API request: ' + args.join(' '));
  } };
}
test('draft without a tag ref is verified and published through its release ID', () => {
  const api = client([draft()]);
  assert.equal(completeDraft(options, api.run), 42);
  assert.deepEqual(api.calls, [['api', 'repos/owner/repo/releases?per_page=100'], ['api', 'repos/owner/repo/releases/42', '--method', 'PATCH', '-F', 'draft=false']]);
});
test('existing published releases, missing/ambiguous drafts and wrong sources are never patched', () => {
  for (const releases of [[], [draft(), draft()], [{ ...draft(), draft: false }], [{ ...draft(), target_commitish: 'b'.repeat(40) }], [{ ...draft(), id: 0 }]]) {
    const api = client(releases);
    assert.throws(() => completeDraft(options, api.run), /identity/);
    assert.equal(api.calls.length, 1);
  }
});
test('unrelated releases in the collection do not change draft selection', () => {
  const api = client([{ ...draft(), id: 99, tag_name: 'v0.9.0', draft: false }, draft()], { ...draft(), draft: false });
  assert.equal(completeDraft(options, api.run), 42);
});
test('missing, extra, duplicate, incomplete or altered uploads block publication', () => {
  const original = draft();
  const bad = [[], [...original.assets, original.assets[0]], [original.assets[0], original.assets[0]], [original.assets[0], { ...original.assets[1], digest: 'sha256:wrong' }], [original.assets[0], { ...original.assets[1], state: 'new' }]];
  for (const assets of bad) {
    const api = client([{ ...draft(), assets }]);
    assert.throws(() => completeDraft(options, api.run), /asset/);
    assert.equal(api.calls.length, 1);
  }
});
test('unexpected post-publication identity or bytes are reported rather than treated as success', () => {
  for (const response of [{ ...draft(), draft: true }, { ...draft(), draft: false, id: 99 }, { ...draft(), draft: false, tag_name: 'v9.0.0' }, { ...draft(), draft: false, assets: [] }]) {
    const api = client([draft()], response);
    assert.throws(() => completeDraft(options, api.run), /identity|asset/);
    assert.equal(api.calls.length, 2);
  }
});
test('API errors and invalid collection responses never cause a publish attempt', () => {
  assert.throws(() => completeDraft(options, () => { throw new Error('API unavailable'); }), /API unavailable/);
  const api = client({ error: 'not a collection' });
  assert.throws(() => completeDraft(options, api.run), /Invalid release collection/);
  assert.equal(api.calls.length, 1);
});


test('identity refuses a draft with no tag ref instead of treating tag 404 as absence', () => {
  const calls = [];
  assert.throws(() => assertReleaseAbsent(options.repo, options.tag, url => {
    calls.push(url);
    return url.includes('/tags/') ? { status: 1, stdout: '', stderr: 'gh: Not Found (HTTP 404)' } : { status: 0, stdout: JSON.stringify([draft()]), stderr: '' };
  }), /Release already exists/);
  assert.equal(calls.length, 2);
});
test('identity refuses published releases and API/auth/invalid-response failures', () => {
  assert.throws(() => assertReleaseAbsent(options.repo, options.tag, () => ({ status: 0, stdout: '{}', stderr: '' })), /Release already exists/);
  assert.throws(() => assertReleaseAbsent(options.repo, options.tag, () => ({ status: 1, stdout: '', stderr: 'HTTP 403' })), /Cannot verify/);
  for (const response of [{ status: 1, stdout: '', stderr: 'HTTP 403' }, { status: 0, stdout: '{}', stderr: '' }]) {
    assert.throws(() => assertReleaseAbsent(options.repo, options.tag, url => url.includes('/tags/') ? { status: 1, stdout: '', stderr: 'HTTP 404' } : response), /Cannot inspect|Invalid release collection/);
  }
});
test('identity checks all release pages before accepting absence and catches older drafts', () => {
  for (const found of [false, true]) {
    const calls = [];
    const request = url => {
      calls.push(url);
      if (url.includes('/tags/')) return { status: 1, stdout: '', stderr: 'HTTP 404' };
      const releases = url.endsWith('page=1') ? Array.from({ length: 100 }, (_, i) => ({ tag_name: `v0.0.${i}` })) : found ? [draft()] : [];
      return { status: 0, stdout: JSON.stringify(releases), stderr: '' };
    };
    if (found) assert.throws(() => assertReleaseAbsent(options.repo, options.tag, request), /Release already exists/);
    else assertReleaseAbsent(options.repo, options.tag, request);
    assert.equal(calls.length, 3);
  }
});
