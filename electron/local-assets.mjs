import path from 'node:path';

/** Resolve only files within the bundled renderer directory.
 * @param {string} requestUrl
 * @param {string} root
 * @returns {string | null}
 */
export function resolveAsset(requestUrl, root) {
  try {
    const url = new URL(requestUrl);
    if (url.protocol !== 'hitthebeat:' || url.hostname !== 'app' || url.port || url.username || url.password) return null;
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) return null;
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
    return file;
  } catch {
    return null;
  }
}
