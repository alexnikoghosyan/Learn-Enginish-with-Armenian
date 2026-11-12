const avatars = ['bear', 'fox', 'frog', 'cat', 'rabbit', 'owl'];
const sources = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'Play Market', 'Ընկերներից', 'Նորություններից կամ բլոգից', 'YouTube', 'Հեռուստատեսությունից', 'Google-ի որոնումից', 'Ուրիշ'];
const reasons = ['people', 'fun', 'education', 'time', 'career', 'travel', 'other'];
const ages = ['13–17', '18–24', '25–34', '35–44', '45–54', '55+'];

function json(value, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}

function parseRegistration(data) {
  if (!data || typeof data !== 'object') return null;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const username = typeof data.username === 'string' ? data.username.trim().toLowerCase() : '';
  if (name.length < 1 || name.length > 50 || !/^[a-z][a-z0-9_]{2,19}$/.test(username) ||
      !Number.isInteger(data.level) || data.level < 0 || data.level > 4 ||
      !sources.includes(data.source) || !ages.includes(data.age) || !Array.isArray(data.reasons) ||
      !data.reasons.length || data.reasons.length > reasons.length || !data.reasons.every(reason => reasons.includes(reason))) return null;
  const dailyGoal = data.dailyGoal ?? 10;
  if (![5, 10, 15, 20].includes(dailyGoal)) return null;
  return { name, username, level: data.level, source: data.source, age: data.age,
    reasons: [...new Set(data.reasons)], dailyGoal, reminders: data.reminders === true ? 1 : 0 };
}

async function usernameAvailability(request, env) {
  const name = new URL(request.url).searchParams.get('name')?.trim().toLowerCase();
  if (!name || !/^[a-z][a-z0-9_]{2,19}$/.test(name)) return json({ error: 'invalid' }, 400);
  const taken = await env.DB.prepare('SELECT 1 FROM profiles WHERE username = ?').bind(name).first();
  if (!taken) return json({ available: true, suggestions: [] });
  const suffixes = new Set();
  while (suffixes.size < 12) suffixes.add(1000 + Math.floor(Math.random() * 9000));
  const candidates = [...suffixes].map(suffix => name.slice(0, 15) + '_' + suffix);
  const placeholders = candidates.map(() => '?').join(', ');
  const { results } = await env.DB.prepare(
    'SELECT username FROM profiles WHERE username IN (' + placeholders + ')'
  ).bind(...candidates).all();
  const unavailable = new Set(results.map(row => row.username));
  return json({ available: false, suggestions: candidates.filter(candidate => !unavailable.has(candidate)).slice(0, 3) });
}

export async function accountRequest(request, env, pathname) {
  if (pathname === '/api/username' && request.method === 'GET') return usernameAvailability(request, env);
  const id = request.headers.get('oai-authenticated-user-id');
  if (pathname === '/api/account' && request.method === 'GET' && !id) {
    return json({ authenticated: false, profile: null });
  }
  if (!id) return json({ error: 'sign_in_required' }, 401);
  const readProfile = () => env.DB.prepare(
    'SELECT name, username, level, avatar, created_at, daily_goal, reminders FROM profiles WHERE account_id = ?'
  ).bind(id).first();
  if (pathname === '/api/account' && request.method === 'GET') {
    return json({ authenticated: true, profile: await readProfile() });
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'origin' }, 403);
  if (pathname === '/api/account' && request.method === 'POST') {
    if (Number(request.headers.get('Content-Length')) > 4096) return json({ error: 'invalid' }, 413);
    const data = parseRegistration(await request.json().catch(() => null));
    if (!data) return json({ error: 'invalid' }, 400);
    const existing = await readProfile();
    if (existing) return json({ profile: existing });
    await env.DB.prepare(
      'INSERT INTO profiles (account_id, username, name, level, source, age_band, reasons, daily_goal, reminders) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING'
    ).bind(id, data.username, data.name, data.level, data.source, data.age, JSON.stringify(data.reasons), data.dailyGoal, data.reminders).run();
    const profile = await readProfile();
    return profile ? json({ profile }, 201) : json({ error: 'username_taken' }, 409);
  }
  if (pathname === '/api/account/avatar' && request.method === 'PUT') {
    const { avatar } = (await request.json().catch(() => null)) || {};
    if (!avatars.includes(avatar)) return json({ error: 'invalid' }, 400);
    await env.DB.prepare('UPDATE profiles SET avatar = ? WHERE account_id = ?').bind(avatar, id).run();
    const profile = await readProfile();
    return profile ? json({ profile }) : json({ error: 'missing_profile' }, 404);
  }
  return json({ error: 'not_found' }, 404);
}
