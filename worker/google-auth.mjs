// Google մուտք (OAuth 2.0 authorization code) և ստորագրված սեսիայի cookie։
// Պահանջվող գաղտնի փոփոխական՝ GOOGLE_CLIENT_SECRET (ըստ ցանկության՝ SESSION_SECRET, GOOGLE_CLIENT_ID)։
// Սեսիայի cookie-ն՝ <id>.<expires>.<hmac>, որտեղ id-ն Google-ի sub-ն է (թվեր) կամ e_<uuid>՝ էլ. փոստով հաշվի համար։
const DEFAULT_CLIENT_ID = '860291395269-8b03n4dqvtlaigrtjjkrud2nfce2tngk.apps.googleusercontent.com';
const clientId = env => env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
const sessionSecret = env => env.SESSION_SECRET || env.GOOGLE_CLIENT_SECRET;
const SESSION_COOKIE = 'eg_session';
const STATE_COOKIE = 'eg_oauth_state';
const SESSION_DAYS = 60;
const encoder = new TextEncoder();

function base64url(bytes) {
  let text = '';
  for (const byte of new Uint8Array(bytes)) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function sameText(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function cookie(name, value, maxAge) {
  return name + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + maxAge;
}

function safeReturn(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/';
}

// Cookie-ի id ↔ հաշվի id (profiles.account_id)
function accountIdFromSessionId(id) {
  if (/^[0-9]{1,40}$/.test(id)) return 'google:' + id;
  if (/^e_[0-9a-f-]{36}$/.test(id)) return 'email:' + id.slice(2);
  return null;
}

export function sessionIdFromAccountId(accountId) {
  if (accountId.startsWith('google:')) return accountId.slice(7);
  if (accountId.startsWith('email:')) return 'e_' + accountId.slice(6);
  return null;
}

export async function sessionCookie(env, accountId) {
  const id = sessionIdFromAccountId(accountId);
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const value = id + '.' + expires + '.' + await hmac(sessionSecret(env), id + '.' + expires);
  return cookie(SESSION_COOKIE, value, SESSION_DAYS * 86400);
}

export async function sessionUserId(request, env) {
  const raw = readCookie(request, SESSION_COOKIE);
  if (!raw || !sessionSecret(env)) return null;
  const [id, expires, signature] = raw.split('.');
  if (!id || !expires || !signature || Number(expires) < Date.now() / 1000) return null;
  const expected = await hmac(sessionSecret(env), id + '.' + expires);
  return sameText(expected, signature) ? accountIdFromSessionId(id) : null;
}

const pageEscape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Փոքր HTML էջ կայքի ոճով՝ մուտքի սխալների համար (չկազմաձևված Google, սխալ state և այլն)։
export function friendlyPage(title, message, returnTo = '/', status = 503) {
  const html = '<!doctype html><html lang="hy"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex"><title>' + pageEscape(title) + ' — English Garden</title><style>' +
    'body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#3c3c3c;font-family:"Noto Sans Armenian",Nunito,system-ui,sans-serif}' +
    'main{max-width:440px;padding:32px 22px;text-align:center}.mascot{width:120px;height:120px;margin:0 auto 14px}' +
    'h1{font-size:23px;margin:0 0 12px;color:#4b4b4b}p{font-size:17px;line-height:1.55;margin:0 0 26px;color:#777}' +
    'a{display:inline-block;padding:13px 30px;border-radius:14px;background:#58cc02;color:#fff;font-weight:800;text-decoration:none;' +
    'text-transform:uppercase;letter-spacing:.04em;box-shadow:0 4px #3a9400;transition:transform 90ms,box-shadow 90ms}' +
    'a:hover{background:#61d40a}a:active{transform:translateY(4px);box-shadow:0 0 #3a9400}' +
    '@media(prefers-reduced-motion:reduce){a{transition:none}}</style></head><body><main>' +
    '<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true"><circle cx="30" cy="30" r="17" fill="#9b73dc"/><circle cx="90" cy="30" r="17" fill="#9b73dc"/>' +
    '<circle cx="30" cy="30" r="8" fill="#e6d8ff"/><circle cx="90" cy="30" r="8" fill="#e6d8ff"/><ellipse cx="60" cy="66" rx="44" ry="42" fill="#b48cf2"/>' +
    '<ellipse cx="60" cy="80" rx="22" ry="17" fill="#f3ebff"/><path d="M42 58q5-5 10 0M68 58q5-5 10 0" stroke="#3b2266" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="60" cy="74" rx="7" ry="5" fill="#3b2266"/><path d="M53 85q7 5 14 0" stroke="#3b2266" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>' +
    '<h1>' + pageEscape(title) + '</h1><p>' + pageEscape(message) + '</p><a href="' + pageEscape(safeReturn(returnTo)) + '">Վերադառնալ</a></main></body></html>';
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

const unavailableTitle = 'Google-ով մուտքը ժամանակավորապես հասանելի չէ';
const unavailableText = 'Google-ով մուտքը ժամանակավորապես հասանելի չէ։ Քո առաջընթացը պահպանվում է այս սարքում։';

async function hasProfile(env, accountId) {
  return Boolean(await env.DB.prepare('SELECT 1 FROM profiles WHERE account_id = ?').bind(accountId).first());
}

export async function authRequest(request, env, url) {
  if (url.pathname === '/auth/signout') {
    return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': cookie(SESSION_COOKIE, '', 0), 'Cache-Control': 'no-store' } });
  }
  if (url.pathname.startsWith('/auth/email/')) return emailAuthRequest(request, env, url);

  const redirectUri = url.origin + '/auth/google/callback';
  if (url.pathname === '/auth/google') {
    const returnTo = safeReturn(url.searchParams.get('return_to'));
    if (!env.GOOGLE_CLIENT_SECRET) return friendlyPage(unavailableTitle, unavailableText, returnTo);
    const mode = url.searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
    const state = base64url(crypto.getRandomValues(new Uint8Array(18)));
    const target = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    target.search = new URLSearchParams({
      client_id: clientId(env), redirect_uri: redirectUri, response_type: 'code',
      scope: 'openid', state, prompt: 'select_account'
    });
    return new Response(null, { status: 302, headers: {
      Location: target.toString(), 'Cache-Control': 'no-store',
      'Set-Cookie': cookie(STATE_COOKIE, state + '|' + mode + '|' + encodeURIComponent(returnTo), 600)
    }});
  }
  if (url.pathname === '/auth/google/callback') {
    if (!env.GOOGLE_CLIENT_SECRET) return friendlyPage(unavailableTitle, unavailableText);
    let [state, mode, returnTo] = (readCookie(request, STATE_COOKIE) || '').split('|');
    // Հին ձևաչափ (state|returnTo)՝ deploy-ի պահին սկսված մուտքերի համար
    if (returnTo === undefined) [returnTo, mode] = [mode, 'legacy'];
    const code = url.searchParams.get('code');
    if (!code || !state || !sameText(state, url.searchParams.get('state') || '')) {
      return friendlyPage('Մուտքը չհաջողվեց', 'Մուտքի ժամկետը լրացել է կամ հղումը սխալ է։ Փորձիր կրկին։', '/signin', 400);
    }
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId(env), client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri, grant_type: 'authorization_code' })
    });
    if (!tokenResponse.ok) return friendlyPage('Մուտքը չհաջողվեց', 'Google-ը չհաստատեց մուտքը։ Փորձիր կրկին։', '/signin', 502);
    const { id_token: idToken } = await tokenResponse.json();
    // id_token-ը ստացվել է անմիջապես Google-ից TLS-ով, ուստի բավական է ստուգել դաշտերը։
    let claims;
    try { claims = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { claims = null; }
    if (!claims || claims.aud !== clientId(env) || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) ||
        claims.exp < Date.now() / 1000 || !/^[0-9]{1,40}$/.test(claims.sub || '')) {
      return friendlyPage('Մուտքը չհաջողվեց', 'Google-ի պատասխանը սխալ էր։ Փորձիր կրկին։', '/signin', 400);
    }
    const accountId = 'google:' + claims.sub;
    const registered = await hasProfile(env, accountId);
    // Ինքնությունը հաստատված է, ուստի սեսիան միշտ պահում ենք, որ «Գրանցվել»-ը կրկին հաշիվ ընտրել չպահանջի։
    let location = safeReturn(decodeURIComponent(returnTo || '%2F'));
    if (mode === 'signin' && !registered) location = '/signin?error=not_registered';
    if (mode === 'signup' && registered) location = '/';
    const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', await sessionCookie(env, accountId));
    headers.append('Set-Cookie', cookie(STATE_COOKIE, '', 0));
    return new Response(null, { status: 302, headers });
  }
  return friendlyPage('Էջը չի գտնվել', 'Այս հասցեով էջ չկա։', '/', 404);
}
