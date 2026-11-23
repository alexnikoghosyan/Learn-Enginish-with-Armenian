// Պատրաստում է deploy/ թղթապանակը Cloudflare Pages-ի համար (Direct Upload, advanced mode)։
import { readFile, readdir, mkdir, writeFile, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = root + 'dist/';
const out = root + 'deploy/';
await mkdir(out, { recursive: true });
for (const file of await readdir(dist, { withFileTypes: true })) {
  if (file.isFile()) await copyFile(dist + file.name, out + file.name);
}
// dist/physics/ (Blender կադրերի թերթեր, ֆայլերի անուններում hash կա) պատճենվում է ռեկուրսիվ
await cp(dist + 'physics', out + 'physics', { recursive: true }).catch(() => {});
// Cache-busting. index.html-ի տեղական CSS/JS հղումները ստանում են ?v=<բովանդակության hash>,
// ուստի ամեն deploy-ից հետո դիտարկիչը բեռնում է նոր ֆայլերը, ոչ թե հին պահված պատճենը։
const hash = async name => createHash('sha1').update(await readFile(dist + name)).digest('hex').slice(0, 10);
let html = await readFile(out + 'index.html', 'utf8');
for (const [, attr, slash, name] of [...html.matchAll(/\b(href|src)="(\/?)([\w.-]+\.(?:css|js))"/g)]) {
  html = html.replace(`${attr}="${slash}${name}"`, `${attr}="${slash}${name}?v=${await hash(name)}"`);
}
await writeFile(out + 'index.html', html);
const strip = text => text.replace(/^export /gm, '');
const account = strip(await readFile(root + 'worker/account.mjs', 'utf8'));
const auth = strip(await readFile(root + 'worker/google-auth.mjs', 'utf8'));
const emailAuth = strip(await readFile(root + 'worker/email-auth.mjs', 'utf8'));
const leagues = strip(await readFile(root + 'worker/leaderboard.mjs', 'utf8'));
await writeFile(out + '_worker.js', account + '\n' + auth + '\n' + emailAuth + '\n' + leagues + `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/auth/')) {
      try { return await authRequest(request, env, url); }
      catch {
        if (url.pathname.startsWith('/auth/email/')) return json({ error: 'unavailable', message: 'Մուտքը ժամանակավորապես հասանելի չէ։ Փորձիր ավելի ուշ։' }, 503);
        return friendlyPage('Մուտքը ժամանակավորապես հասանելի չէ', 'Ինչ-որ բան սխալ գնաց։ Քո առաջընթացը պահպանվում է այս սարքում։', '/', 503); }
    }
    if (url.pathname.startsWith('/api/')) {
      try {
        const userId = await sessionUserId(request, env);
        if (url.pathname === '/api/xp' || url.pathname.startsWith('/api/leaderboard')) return await leaderboardRequest(request, env, url.pathname, userId);
        return await accountRequest(request, env, url.pathname, userId);
      }
      catch { return json({ error: 'unavailable' }, 503); }
    }
    const response = await env.ASSETS.fetch(request);
    // SPA fallback. /grammar/lesson/3 և նման հասցեները ֆայլ չեն, ուստի տալիս ենք index.html-ը,
    // իսկ էջի JS-ը (routes.js) բացում է համապատասխան էկրանը։
    if (response.status !== 404 || !['GET', 'HEAD'].includes(request.method) || /\\.[a-z0-9]+$/i.test(url.pathname)) return response;
    const index = await env.ASSETS.fetch(new Request(new URL('/', url), { headers: request.headers }));
    const headers = new Headers(index.headers);
    headers.set('Cache-Control', 'no-cache');
    return new Response(request.method === 'HEAD' ? null : index.body, { status: index.ok ? 200 : index.status, headers });
  }
};
`);
await writeFile(out + '_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n' +
  ['/', '/*.html', '/*.css', '/*.js'].map(path => path + '\n  Cache-Control: no-cache\n').join('') +
  '/physics/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log('deploy ready');
