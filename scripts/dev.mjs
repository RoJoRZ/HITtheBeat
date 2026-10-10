import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import electron from 'electron';

const server = await createServer();
await server.listen();
const child = spawn(/** @type {string} */ (/** @type {unknown} */ (electron)), ['.'], {
  stdio: 'inherit',
  env: { ...process.env, HITTHEBEAT_DEV: '1' },
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (child.exitCode === null) child.kill();
  await server.close();
}
child.on('error', async (error) => { console.error(error); await stop(); process.exitCode = 1; });
child.on('exit', async (code) => { await stop(); process.exitCode = code ?? 0; });
process.on('SIGINT', () => { void stop(); });
process.on('SIGTERM', () => { void stop(); });
