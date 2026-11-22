// Google մուտք (OAuth 2.0 authorization code) և ստորագրված սեսիայի cookie։
// Պահանջվող գաղտնի փոփոխական՝ GOOGLE_CLIENT_SECRET (ըստ ցանկության՝ SESSION_SECRET, GOOGLE_CLIENT_ID)։
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
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export async function sessionUserId(request, env) {
  const raw = readCookie(request, SESSION_COOKIE);
  if (!raw || !sessionSecret(env)) return null;
  const [id, expires, signature] = raw.split('.');
  if (!id || !expires || !signature || Number(expires) < Date.now() / 1000) return null;
  const expected = await hmac(sessionSecret(env), id + '.' + expires);
  return expected === signature ? 'google:' + id : null;
}

export async function authRequest(request, env, url) {
  const redirectUri = url.origin + '/auth/google/callback';
  if (url.pathname === '/auth/signout') {
    return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': cookie(SESSION_COOKIE, '', 0) } });
  }
  if (!env.GOOGLE_CLIENT_SECRET) {
    return new Response('Google sign-in is not configured', { status: 503 });
  }
  if (url.pathname === '/auth/google') {
    const state = base64url(crypto.getRandomValues(new Uint8Array(18)));
    const returnTo = safeReturn(url.searchParams.get('return_to'));
    const target = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    target.search = new URLSearchParams({
      client_id: clientId(env), redirect_uri: redirectUri, response_type: 'code',
      scope: 'openid', state, prompt: 'select_account'
    });
    return new Response(null, { status: 302, headers: {
      Location: target.toString(),
      'Set-Cookie': cookie(STATE_COOKIE, state + '|' + encodeURIComponent(returnTo), 600)
    }});
  }
  if (url.pathname === '/auth/google/callback') {
    const saved = readCookie(request, STATE_COOKIE) || '';
    const [state, returnTo] = saved.split('|');
    const code = url.searchParams.get('code');
    if (!code || !state || state !== url.searchParams.get('state')) return new Response('Invalid sign-in state', { status: 400 });
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId(env), client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri, grant_type: 'authorization_code' })
    });
    if (!tokenResponse.ok) return new Response('Google sign-in failed', { status: 502 });
    const { id_token: idToken } = await tokenResponse.json();
    // id_token-ը ստացվել է անմիջապես Google-ից TLS-ով, ուստի բավական է ստուգել դաշտերը։
    let claims;
    try { claims = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { claims = null; }
    if (!claims || claims.aud !== clientId(env) || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) ||
        claims.exp < Date.now() / 1000 || !/^[0-9]+$/.test(claims.sub || '')) {
      return new Response('Invalid Google token', { status: 400 });
    }
    const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
    const value = claims.sub + '.' + expires + '.' + await hmac(sessionSecret(env), claims.sub + '.' + expires);
    const headers = new Headers({ Location: safeReturn(decodeURIComponent(returnTo || '%2F')) });
    headers.append('Set-Cookie', cookie(SESSION_COOKIE, value, SESSION_DAYS * 86400));
    headers.append('Set-Cookie', cookie(STATE_COOKIE, '', 0));
    return new Response(null, { status: 302, headers });
  }
  return new Response('Not found', { status: 404 });
}
