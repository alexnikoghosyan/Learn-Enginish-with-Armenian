import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const files = await readdir(dist, { withFileTypes: true });
const assets = {};
for (const file of files) {
  if (!file.isFile() || !/\.(js|css|html|txt)$/.test(file.name)) continue;
  assets['/' + file.name] = await readFile(dist + file.name, 'utf8');
}
const account = (await readFile(new URL('./account.mjs', import.meta.url), 'utf8')).replace(
  'export async function accountRequest', 'async function accountRequest'
);
await mkdir(dist + 'server', { recursive: true });
await writeFile(dist + 'server/index.js', account + '\nconst assets = ' + JSON.stringify(assets) + `;
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', txt: 'text/plain' };
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
    return new Response(request.method === 'HEAD' ? null : asset, { headers: {
      'Content-Type': types[path.split('.').at(-1)] + '; charset=utf-8',
      'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff'
    }});
  }
};
`);
