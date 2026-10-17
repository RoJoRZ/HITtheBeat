import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const root = mkdtempSync(path.join(tmpdir(), 'hitthebeat-install-'));
/** @param {string} command @param {string[]} args */
const run = (command, args, env = process.env) => {
  const r = spawnSync(command, args, { stdio: 'inherit', env, windowsVerbatimArguments: process.platform === 'win32' && /\.exe$/i.test(command) });
  if (r.status !== 0) throw new Error(`${command} failed (${r.status})`);
};
let source = path.resolve('release');
// One-off validation of this harness can reuse already published installers without building a release.
if (process.argv.includes('--existing')) {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) throw new Error('GITHUB_REPOSITORY is required');
  const name = `HITtheBeat-${version}-${process.platform === 'darwin' ? 'mac-arm64.dmg' : 'win-x64.exe'}`;
  const response = spawnSync('gh', ['api', `repos/${repo}/releases/tags/v${version}`], { encoding: 'utf8' });
  if (response.status !== 0) throw new Error(response.stderr);
  /** @type {{assets: Array<{name: string, digest: string}>}} */
  const metadata = JSON.parse(response.stdout);
  source = path.join(root, 'download');
  run('gh', ['release', 'download', `v${version}`, '--repo', repo, '--pattern', name, '--dir', source]);
  const hash = 'sha256:' + createHash('sha256').update(readFileSync(path.join(source, name))).digest('hex');
  if (metadata.assets.find(a => a.name === name)?.digest !== hash) throw new Error('Existing download hash differs');
}
let executable, mounted = false, installed = false;
try {
  if (process.platform === 'darwin') {
    const mount = path.join(root, 'volume'); mkdirSync(mount);
    run('hdiutil', ['attach', '-readonly', '-nobrowse', '-mountpoint', mount, path.join(source, `HITtheBeat-${version}-mac-arm64.dmg`)]); mounted = true;
    run('ditto', [path.join(mount, 'HITtheBeat.app'), path.join(root, 'HITtheBeat.app')]);
    run('hdiutil', ['detach', mount]); mounted = false;
    executable = path.join(root, 'HITtheBeat.app/Contents/MacOS/HITtheBeat');
    run('codesign', ['--verify', '--deep', '--strict', path.join(root, 'HITtheBeat.app')]);
  } else if (process.platform === 'win32') {
    const target = path.join(root, 'path with spaces');
    run(path.join(source, `HITtheBeat-${version}-win-x64.exe`), ['/S', `/D=${target}`]); installed = true;
    executable = path.join(target, 'HITtheBeat.exe');
  } else throw new Error('Installer validation requires macOS or Windows');
  if (!existsSync(executable)) throw new Error('Installed app missing');
  // These tests import fixtures, remove sources and reopen isolated libraries.
  run(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', 'tests/desktop/shell.spec.ts', 'tests/desktop/library.spec.ts', 'tests/desktop/import-settings.spec.ts', 'tests/desktop/notation.spec.ts'], { ...process.env, HITTHEBEAT_TEST_EXECUTABLE: executable });
} finally {
  if (mounted) run('hdiutil', ['detach', path.join(root, 'volume')]);
  if (installed) run(path.join(root, 'path with spaces', 'Uninstall HITtheBeat.exe'), ['/S', `_?=${path.join(root, 'path with spaces')}`]);
  rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
