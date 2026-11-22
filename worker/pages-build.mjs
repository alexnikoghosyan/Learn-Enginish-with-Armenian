// Պատրաստում է deploy/ թղթապանակը Cloudflare Pages-ի համար (Direct Upload, advanced mode)։
import { readFile, readdir, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = root + 'dist/';
const out = root + 'deploy/';
await mkdir(out, { recursive: true });
for (const file of await readdir(dist, { withFileTypes: true })) {
  if (file.isFile()) await copyFile(dist + file.name, out + file.name);
}
// Cache-busting. index.html-ի տեղական CSS/JS հղումները ստանում են ?v=<բովանդակության hash>,
// ուստի ամեն deploy-ից հետո դիտարկիչը բեռնում է նոր ֆայլերը, ոչ թե հին պահված պատճենը։
const hash = async name => createHash('sha1').update(await readFile(dist + name)).digest('hex').slice(0, 10);
let html = await readFile(out + 'index.html', 'utf8');
for (const [, attr, name] of [...html.matchAll(/\b(href|src)="([\w.-]+\.(?:css|js))"/g)]) {
  html = html.replace(`${attr}="${name}"`, `${attr}="${name}?v=${await hash(name)}"`);
}
await writeFile(out + 'index.html', html);
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
await writeFile(out + '_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n' +
  ['/', '/*.html', '/*.css', '/*.js'].map(path => path + '\n  Cache-Control: no-cache\n').join(''));
console.log('deploy ready');
