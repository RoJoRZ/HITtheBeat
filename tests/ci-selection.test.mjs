import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectTests } from '../scripts/ci-tests.mjs';
test('documentation-only changes do not build the app or run regressions', () => {
  assert.deepEqual(selectTests(['AGENTS.md', 'FUNCTIONEEL.md', 'docs/RELEASE.md']), { node: [], desktop: [], build: false });
});
test('infrastructure changes check startup and selector invariants without the full suite', () => {
  const s = selectTests(['.github/workflows/release.yml']);
  assert.equal(s.build, true); assert.deepEqual(s.desktop, ['tests/desktop/shell.spec.ts']);
  assert.ok(s.node.includes('tests/ci-selection.test.mjs')); assert.equal(s.node.length, 3);
});
test('audio and storage changes include their critical regressions without duplicates', () => {
  const s = selectTests(['src/audio/engine.ts', 'electron/library-store.mjs', 'src/audio/bpm.ts']);
  for (const n of ['bpm', 'count-in', 'library', 'sessions']) assert.ok(s.node.includes(`tests/${n}.test.mjs`));
  for (const n of ['audio', 'count-in', 'library', 'evaluation']) assert.ok(s.desktop.includes(`tests/desktop/${n}.spec.ts`));
  assert.equal(new Set(s.node).size, s.node.length); assert.equal(new Set(s.desktop).size, s.desktop.length);
});
test('window, shared UI and changed tests are covered', () => {
  const s = selectTests(['electron/notation-window.mjs', 'src/ui/App.tsx', 'tests/desktop/overview.spec.ts']);
  for (const n of ['notation', 'language', 'info', 'overview', 'shell']) assert.ok(s.desktop.includes(`tests/desktop/${n}.spec.ts`));
});
