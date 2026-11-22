// Պատրաստում է deploy/ թղթապանակը Cloudflare Pages-ի համար (Direct Upload, advanced mode)։
import { readFile, readdir, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = root + 'dist/';
const out = root + 'deploy/';
await mkdir(out, { recursive: true });
for (const file of await readdir(dist, { withFileTypes: true })) {
  if (file.isFile()) await copyFile(dist + file.name, out + file.name);
}
const strip = text => text.replace(/^export /gm, '');
const account = strip(await readFile(root + 'worker/account.mjs', 'utf8'));
const auth = strip(await readFile(root + 'worker/google-auth.mjs', 'utf8'));
await writeFile(out + '_worker.js', account + '\n' + auth + `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/auth/')) return authRequest(request, env, url);
    if (url.pathname.startsWith('/api/')) {
      try { return await accountRequest(request, env, url.pathname, await sessionUserId(request, env)); }
      catch { return json({ error: 'unavailable' }, 503); }
    }
    return env.ASSETS.fetch(request);
  }
};
`);
await writeFile(out + '_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log('deploy ready');
