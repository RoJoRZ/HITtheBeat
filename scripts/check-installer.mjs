import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const root = mkdtempSync(path.join(tmpdir(), 'hitthebeat-install-'));
/** @param {string} command @param {string[]} args */
const run = (command, args, env = process.env) => {
  const r = spawnSync(command, args, { stdio: 'inherit', env, windowsVerbatimArguments: process.platform === 'win32' && /\.exe$/i.test(command) });
  if (r.status !== 0) throw new Error(`${command} failed (${r.status})`);
};
let executable, mounted = false, installed = false;
try {
  if (process.platform === 'darwin') {
    const mount = path.join(root, 'volume');
    run('hdiutil', ['attach', '-readonly', '-nobrowse', '-mountpoint', mount, `release/HITtheBeat-${version}-mac-arm64.dmg`]); mounted = true;
    run('ditto', [path.join(mount, 'HITtheBeat.app'), path.join(root, 'HITtheBeat.app')]);
    run('hdiutil', ['detach', mount]); mounted = false;
    executable = path.join(root, 'HITtheBeat.app/Contents/MacOS/HITtheBeat');
    run('codesign', ['--verify', '--deep', '--strict', path.join(root, 'HITtheBeat.app')]);
  } else if (process.platform === 'win32') {
    const target = path.join(root, 'path with spaces');
    run(path.resolve(`release/HITtheBeat-${version}-win-x64.exe`), ['/S', `/D=${target}`]); installed = true;
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
