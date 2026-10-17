import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** @param {string[]} files */
export function selectTests(files) {
  const node = new Set(), desktop = new Set();
  /** @param {string[]} unit @param {string[]} gui */
  const add = (unit, gui) => { unit.forEach(x => node.add(`tests/${x}.test.mjs`)); gui.forEach(x => desktop.add(`tests/desktop/${x}.spec.ts`)); };
  const executable = files.filter(f => !/\.md$|^design\//.test(f));
  if (!executable.length) return { node: [], desktop: [], build: false };
  add(['language', 'local-assets', 'ci-selection'], ['shell']);
  for (const file of executable) {
    if (/^tests\/.*\.test\.mjs$/.test(file)) { node.add(file); continue; }
    if (/^tests\/desktop\/.*\.spec\.ts$/.test(file)) { desktop.add(file); continue; }
    if (/^src\/ui\/Session(Player|Review)\.tsx$/.test(file)) { add(['sessions', 'runner'], ['session', 'evaluation']); continue; }
    if (/^src\/(library\/progress\.mjs|ui\/(ProgressDashboard|SessionHistory)\.tsx)$/.test(file) || /tests\/(desktop\/)?progress\./.test(file)) { add(['progress'], ['progress']); continue; }
    if (/audio|bpm|metronome|count-in|normalization|volume|waveform/i.test(file)) add(['audio-format', 'bpm', 'count-in', 'metronome', 'normalization', 'waveform'], ['audio', 'bpm', 'count-in', 'metronome', 'volume', 'waveform']);
    if (/library|storage|sharing|fragment|routine|session|runner|progress|evaluation/i.test(file)) add(['library', 'sharing', 'fragments', 'routines', 'sessions', 'runner', 'progress'], ['library', 'sharing', 'fragments', 'routines', 'session', 'evaluation', 'progress']);
    if (/language|i18n|translations|App\.tsx|Settings|styles\.css|Info|About/i.test(file)) add(['language'], ['language', 'info']);
    if (/notation|preload|main\.mjs/i.test(file)) add(['local-assets'], ['notation', 'shell']);
  }
  return { node: [...node].sort(), desktop: [...desktop].sort(), build: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = process.env.CI_BASE_SHA;
  if (!base) throw new Error('CI_BASE_SHA is required');
  const result = spawnSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Cannot determine changed files');
  const selection = selectTests(result.stdout.trim().split(/\r?\n/).filter(Boolean));
  console.log('Risk-based selection:', JSON.stringify(selection));
  /** @param {string[]} args */
  const run = (args) => { const p = spawnSync(process.execPath, args, { stdio: 'inherit' }); if (p.status !== 0) process.exit(p.status ?? 1); };
  if (selection.build) {
    // Direct Node entrypoints also work on Windows without shell-dependent .cmd handling.
    run(['node_modules/typescript/bin/tsc', '--noEmit']);
    run(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.electron.json']);
    run(['node_modules/vite/bin/vite.js', 'build']);
  }
  const available = new Set(readdirSync('tests').map(f => `tests/${f}`));
  if (selection.node.length) run(['--test', ...selection.node.filter(f => available.has(f))]);
  if (selection.desktop.length) run(['node_modules/@playwright/test/cli.js', 'test', ...selection.desktop]);
}
