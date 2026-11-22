// Էլ. փոստով և գաղտնաբառով հաշիվներ։ Գաղտնաբառը պահվում է միայն որպես PBKDF2-SHA256 hash։
// Աղյուսակներ՝ credentials, auth_attempts (տես schema.sql)։ Սեսիան նույնն է, ինչ Google-ի դեպքում (eg_session)։
const PASSWORD_ITERATIONS = 100000; // Cloudflare Workers-ի առավելագույնը PBKDF2-ի համար
const ATTEMPT_WINDOW = 600; // վայրկյան (10 րոպե)
const ATTEMPT_LIMIT = 5;
const emailMessages = {
  invalid_email: 'Մուտքագրիր ճիշտ էլ. հասցե։',
  short_password: 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։',
  long_password: 'Գաղտնաբառը չափազանց երկար է։',
  exists: 'Այս էլ. հասցեն արդեն գրանցված է։ Մուտք գործիր քո գաղտնաբառով։',
  not_registered: 'Այս հաշիվը գրանցված չէ։',
  wrong_password: 'Գաղտնաբառը սխալ է։',
  too_many: 'Չափազանց շատ փորձեր։ Փորձիր 10 րոպե հետո։',
  origin: 'Հարցումը մերժվեց։',
  unavailable: 'Մուտքը ժամանակավորապես հասանելի չէ։ Փորձիր ավելի ուշ։',
  invalid: 'Սխալ հարցում։'
};

function emailReply(status, body, headers = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}
const emailError = (status, error) => emailReply(status, { error, message: emailMessages[error] });

function bytesToBase64(bytes) {
  let text = '';
  for (const byte of new Uint8Array(bytes)) text += String.fromCharCode(byte);
  return btoa(text);
}
function base64ToBytes(text) {
  return Uint8Array.from(atob(text), c => c.charCodeAt(0));
}

async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}

function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function normalizeEmail(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return email.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email) ? email : null;
}

async function recentAttempts(env, key) {
  const since = Math.floor(Date.now() / 1000) - ATTEMPT_WINDOW;
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM auth_attempts WHERE attempt_key = ? AND at > ?').bind(key, since).first();
  return row?.n ?? 0;
}

async function recordAttempt(env, key) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO auth_attempts (attempt_key, at) VALUES (?, ?)').bind(key, now),
    env.DB.prepare('DELETE FROM auth_attempts WHERE at < ?').bind(now - 3600)
  ]);
}

async function readCredentials(request) {
  if (Number(request.headers.get('Content-Length')) > 2048) return null;
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== 'object') return null;
  return { email: normalizeEmail(data.email), password: typeof data.password === 'string' ? data.password : '' };
}

async function signedIn(env, accountId, status = 200) {
  const registered = Boolean(await env.DB.prepare('SELECT 1 FROM profiles WHERE account_id = ?').bind(accountId).first());
  return emailReply(status, { ok: true, registered }, { 'Set-Cookie': await sessionCookie(env, accountId) });
}

async function checkPassword(row, password) {
  const hash = await derivePassword(password, base64ToBytes(row.pass_salt), row.iterations);
  return sameBytes(hash, base64ToBytes(row.pass_hash));
}

export async function emailAuthRequest(request, env, url) {
  if (request.method !== 'POST') return emailError(405, 'invalid');
  if (request.headers.get('Origin') !== url.origin) return emailError(403, 'origin');
  if (!(env.SESSION_SECRET || env.GOOGLE_CLIENT_SECRET) || !env.DB) return emailError(503, 'unavailable');
  const body = await readCredentials(request);
  if (!body) return emailError(400, 'invalid');
  const { email, password } = body;
  const ip = request.headers.get('CF-Connecting-IP') || 'local';

  if (url.pathname === '/auth/email/signup') {
    const key = 'signup|' + ip;
    if (await recentAttempts(env, key) >= ATTEMPT_LIMIT) return emailError(429, 'too_many');
    if (!email) return emailError(400, 'invalid_email');
    if (password.length < 8) return emailError(400, 'short_password');
    if (password.length > 200) return emailError(400, 'long_password');
    await recordAttempt(env, key);
    const existing = await env.DB.prepare('SELECT account_id, pass_hash, pass_salt, iterations FROM credentials WHERE email = ?').bind(email).first();
    if (existing) {
      // Արդեն գրանցված է. ճիշտ գաղտնաբառի դեպքում պարզապես մուտք ենք գործում։
      return await checkPassword(existing, password) ? signedIn(env, existing.account_id) : emailError(409, 'exists');
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
    const accountId = 'email:' + crypto.randomUUID();
    const result = await env.DB.prepare(
      'INSERT INTO credentials (account_id, email, pass_hash, pass_salt, iterations) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING'
    ).bind(accountId, email, bytesToBase64(hash), bytesToBase64(salt), PASSWORD_ITERATIONS).run();
    if (!result.meta?.changes) return emailError(409, 'exists');
    return signedIn(env, accountId, 201);
  }

  if (url.pathname === '/auth/email/signin') {
    if (!email) return emailError(400, 'invalid_email');
    const key = 'signin|' + ip + '|' + email;
    if (await recentAttempts(env, key) >= ATTEMPT_LIMIT) return emailError(429, 'too_many');
    const row = await env.DB.prepare('SELECT account_id, pass_hash, pass_salt, iterations FROM credentials WHERE email = ?').bind(email).first();
    if (!row) {
      await recordAttempt(env, key);
      return emailError(404, 'not_registered');
    }
    if (!password || password.length > 200 || !(await checkPassword(row, password))) {
      await recordAttempt(env, key);
      return emailError(401, 'wrong_password');
    }
    await env.DB.prepare('DELETE FROM auth_attempts WHERE attempt_key = ?').bind(key).run();
    return signedIn(env, row.account_id);
  }
  return emailError(404, 'invalid');
}
