import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const files = await readdir(dist, { withFileTypes: true });
const assets = {};
for (const file of files) {
  if (!file.isFile() || !/\.(js|css|html|txt|webmanifest|png)$/.test(file.name)) continue;
  assets['/' + file.name] = await readFile(dist + file.name, file.name.endsWith('.png') ? 'base64' : 'utf8');
}
const account = (await readFile(new URL('./account.mjs', import.meta.url), 'utf8')).replace(
  'export async function accountRequest', 'async function accountRequest'
);
await mkdir(dist + 'server', { recursive: true });
await writeFile(dist + 'server/index.js', account + '\nconst assets = ' + JSON.stringify(assets) + `;
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', txt: 'text/plain', webmanifest: 'application/manifest+json', png: 'image/png' };
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await accountRequest(request, env, url.pathname); }
      catch { return json({ error: 'unavailable' }, 503); }
    }
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405 });
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const asset = Object.hasOwn(assets, path) ? assets[path] : null;
    if (asset === null) return new Response('Not found', { status: 404 });
    const extension = path.split('.').at(-1);
    const binary = extension === 'png';
    const body = binary ? Uint8Array.from(atob(asset), character => character.charCodeAt(0)) : asset;
    return new Response(request.method === 'HEAD' ? null : body, { headers: {
      'Content-Type': types[extension] + (binary ? '' : '; charset=utf-8'),
      'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff'
    }});
  }
};
`);
