import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolveAsset } from '../electron/local-assets.mjs';

const root = path.resolve('dist');
test('bundled entry and nested assets resolve within renderer root', () => {
  assert.equal(resolveAsset('hitthebeat://app/', root), path.join(root, 'index.html'));
  assert.equal(resolveAsset('hitthebeat://app/assets/main.js', root), path.join(root, 'assets/main.js'));
});
test('malformed requests, foreign origins and encoded traversal are rejected', () => {
  for (const url of ['https://example.com/', 'hitthebeat://other/', 'not a url', 'hitthebeat://app/%2e%2e%2fpackage.json', 'hitthebeat://app/%5c..%5cpackage.json', 'hitthebeat://app/%00', 'hitthebeat://user@app/', 'hitthebeat://app/%zz']) {
    assert.equal(resolveAsset(url, root), null, url);
  }
});
