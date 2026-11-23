// Լիգաներ և շաբաթական վարկանիշ (իրական օգտատերերով)։
//   GET  /api/leaderboard         ընթացիկ լիգայի քո խումբը (մասնակիցները՝ ըստ շաբաթական XP-ի)
//   PUT  /api/leaderboard/status  { status: null | 0..11 } քո կարգավիճակի նշանը
//   POST /api/xp                  { total } դասերից հավաքած ընդհանուր XP-ն (սերվերը հաշվում է միայն աճը)
//
// Կանոններ.
//  - 10 լիգա (0 Բրոնզե … 9 Ադամանդե), յուրաքանչյուր խմբում ≤30 հոգի։ Նոր մասնակիցը սկսում է Բրոնզե լիգայից։
//  - Շաբաթը սկսվում է երկուշաբթի 00:00 UTC-ին։ Շաբաթվա ավարտը «ծույլ» է. առաջին հարցումը նոր շաբաթում
//    ավարտում է հին խմբերը (settleLeagues). լավագույն ≈11/30-ը (XP>0) բարձրանում է, վերջին ≈5/30-ը իջնում է,
//    բոլորը նոր խմբերում սկսում են 0 XP-ից։ Դատարկ (0 XP) մասնակիցները Բրոնզեում դուրս են գալիս ցուցակից։
//  - XP-ի աղբյուրը կլիենտն է (պահվում է սարքում), ուստի սերվերը սահմանափակում է՝ ≤LEAGUE_XP_STEP մեկ հարցման
//    համար և ≤LEAGUE_XP_WEEK շաբաթվա համար։

const LEAGUE_COUNT = 10;
const LEAGUE_SIZE = 30;
const LEAGUE_WEEK_MS = 7 * 86400000;
const LEAGUE_EPOCH = 4 * 86400000; // 1970-01-05, երկուշաբթի 00:00 UTC
const LEAGUE_XP_STEP = 200;
const LEAGUE_XP_WEEK = 3000;
const LEAGUE_STATUS_COUNT = 12;
const LEAGUE_ONLINE_MS = 5 * 60 * 1000;

function leagueWeekOf(now) {
  return Math.floor((now - LEAGUE_EPOCH) / LEAGUE_WEEK_MS);
}

// Քանի հոգի է բարձրանում և իջնում n հոգանոց խմբում
function leagueZones(size, league) {
  const promote = league >= LEAGUE_COUNT - 1 ? 0 : Math.min(11, Math.max(1, Math.ceil(size * 11 / 30)));
  const demote = league > 0 ? Math.floor(size * 5 / 30) : 0;
  return { promote, demote };
}

function leagueShuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

async function leagueNextGroup(env) {
  const row = await env.DB.prepare("UPDATE league_meta SET value = value + 1 WHERE key = 'next_group' RETURNING value - 1 AS id").first();
  if (row) return row.id;
  await env.DB.prepare("INSERT OR IGNORE INTO league_meta (key, value) VALUES ('next_group', 1)").run();
  return leagueNextGroup(env);
}

// Գտնում է ընթացիկ շաբաթվա խումբ տվյալ լիգայում (ամենաբնակեցվածը, որտեղ տեղ կա) կամ նորն է բացում
async function leaguePickGroup(env, league, week, counts) {
  let best = null;
  for (const [group, size] of counts) {
    if (size < LEAGUE_SIZE && (!best || size > best[1])) best = [group, size];
  }
  if (best) return best[0];
  return leagueNextGroup(env);
}

async function joinLeague(env, accountId, week, now) {
  const { results } = await env.DB.prepare(
    'SELECT group_id, COUNT(*) AS size FROM league_members WHERE week = ? AND league = 0 GROUP BY group_id'
  ).bind(week).all();
  const group = await leaguePickGroup(env, 0, week, results.map(row => [row.group_id, row.size]));
  await env.DB.prepare(
    'INSERT OR IGNORE INTO league_members (account_id, league, group_id, week, xp, seen_at) VALUES (?, 0, ?, ?, 0, ?)'
  ).bind(accountId, group, week, now).run();
  return env.DB.prepare('SELECT league, group_id, week, xp FROM league_members WHERE account_id = ?').bind(accountId).first();
}

// Ավարտում է հին շաբաթների խմբերը և նոր շաբաթվա համար վերաբաշխում մասնակիցներին
async function settleLeagues(env, week, now) {
  const lock = await env.DB.prepare(
    "INSERT INTO league_meta (key, value) VALUES ('settle_lock', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value WHERE value < ?"
  ).bind(now, now - 60000).run();
  if (!lock.meta.changes) return false; // ուրիշ հարցում հենց հիմա ավարտում է
  try {
    const { results: stale } = await env.DB.prepare(
      'SELECT account_id, league, group_id, xp FROM league_members WHERE week < ? ORDER BY group_id, xp DESC, account_id'
    ).bind(week).all();
    if (!stale.length) return true;
    const groups = new Map();
    for (const row of stale) {
      if (!groups.has(row.group_id)) groups.set(row.group_id, []);
      groups.get(row.group_id).push(row);
    }
    const pools = Array.from({ length: LEAGUE_COUNT }, () => []);
    const drop = [];
    for (const rows of groups.values()) {
      const league = rows[0].league;
      const { promote, demote } = leagueZones(rows.length, league);
      rows.forEach((row, index) => {
        const rank = index + 1;
        const up = rank <= promote && row.xp > 0;
        const down = !up && rank > rows.length - demote;
        const next = up ? league + 1 : down ? league - 1 : league;
        if (next === 0 && row.xp === 0) drop.push(row.account_id);
        else pools[next].push(row.account_id);
      });
    }
    const { results: current } = await env.DB.prepare(
      'SELECT league, group_id, COUNT(*) AS size FROM league_members WHERE week = ? GROUP BY league, group_id'
    ).bind(week).all();
    const counts = Array.from({ length: LEAGUE_COUNT }, () => new Map());
    for (const row of current) counts[row.league].set(row.group_id, row.size);
    const statements = [];
    for (let league = 0; league < LEAGUE_COUNT; league++) {
      for (const accountId of leagueShuffle(pools[league])) {
        const group = await leaguePickGroup(env, league, week, counts[league]);
        counts[league].set(group, (counts[league].get(group) || 0) + 1);
        statements.push(env.DB.prepare('UPDATE league_members SET league = ?, group_id = ?, week = ?, xp = 0 WHERE account_id = ?').bind(league, group, week, accountId));
      }
    }
    for (const accountId of drop) statements.push(env.DB.prepare('DELETE FROM league_members WHERE account_id = ?').bind(accountId));
    for (let i = 0; i < statements.length; i += 50) await env.DB.batch(statements.slice(i, i + 50));
    return true;
  } finally {
    await env.DB.prepare("UPDATE league_meta SET value = 0 WHERE key = 'settle_lock'").run();
  }
}

async function ensureLeagueWeek(env, now) {
  const week = leagueWeekOf(now);
  const stale = await env.DB.prepare('SELECT 1 AS found FROM league_members WHERE week < ? LIMIT 1').bind(week).first();
  if (stale && !(await settleLeagues(env, week, now))) {
    // Ուրիշ հարցում հենց հիմա ավարտում է շաբաթը. սպասում ենք մինչև 2 վայրկյան
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      if (!(await env.DB.prepare('SELECT 1 AS found FROM league_members WHERE week < ? LIMIT 1').bind(week).first())) break;
    }
  }
  return week;
}

// Վերադարձնում է քո անդամության տողը (անհրաժեշտության դեպքում միացնում է լիգային), կամ null՝ եթե խմբերը այս պահին թարմացվում են
async function leagueMembership(env, accountId, week, now) {
  const member = await env.DB.prepare('SELECT league, group_id, week, xp FROM league_members WHERE account_id = ?').bind(accountId).first();
  if (!member) return joinLeague(env, accountId, week, now);
  return member.week === week ? member : null;
}

async function leaderboardView(env, accountId, now) {
  const week = await ensureLeagueWeek(env, now);
  const member = await leagueMembership(env, accountId, week, now);
  if (!member) return null;
  await env.DB.prepare('UPDATE league_members SET seen_at = ? WHERE account_id = ?').bind(now, accountId).run();
  const { results } = await env.DB.prepare(
    'SELECT m.account_id, m.xp, m.seen_at, p.name, p.avatar, p.avatar_config, p.lb_status FROM league_members m ' +
    'JOIN profiles p ON p.account_id = m.account_id WHERE m.group_id = ? AND m.week = ? ORDER BY m.xp DESC, m.account_id'
  ).bind(member.group_id, week).all();
  const { promote, demote } = leagueZones(results.length, member.league);
  const members = results.map((row, index) => {
    let config = null;
    try { config = row.avatar_config ? JSON.parse(row.avatar_config) : null; } catch {}
    return { rank: index + 1, name: row.name, xp: row.xp, avatar: row.avatar, avatar_config: config,
      status: Number.isInteger(row.lb_status) ? row.lb_status : null, online: now - (row.seen_at || 0) < LEAGUE_ONLINE_MS,
      me: row.account_id === accountId };
  });
  const msLeft = LEAGUE_EPOCH + (week + 1) * LEAGUE_WEEK_MS - now;
  return { league: member.league, leagues: LEAGUE_COUNT, week, daysLeft: Math.max(1, Math.ceil(msLeft / 86400000)),
    size: results.length, promote, demote, members };
}

async function leagueSyncXp(env, accountId, total, now) {
  const profile = await env.DB.prepare('SELECT xp_total FROM profiles WHERE account_id = ?').bind(accountId).first();
  if (!profile) return { error: 'missing_profile', status: 404 };
  if (profile.xp_total === null || profile.xp_total === undefined) {
    // Առաջին համաժամացում. նախորդ XP-ն չի հաշվվում շաբաթվա մեջ
    await env.DB.prepare('UPDATE profiles SET xp_total = ? WHERE account_id = ?').bind(total, accountId).run();
    return { credited: 0 };
  }
  const delta = total - profile.xp_total;
  if (delta <= 0) {
    if (delta < 0) await env.DB.prepare('UPDATE profiles SET xp_total = ? WHERE account_id = ?').bind(total, accountId).run();
    return { credited: 0 };
  }
  const week = await ensureLeagueWeek(env, now);
  const member = await leagueMembership(env, accountId, week, now);
  if (!member) return { error: 'busy', status: 503 };
  const step = Math.min(delta, LEAGUE_XP_STEP);
  const credit = Math.max(0, Math.min(step, LEAGUE_XP_WEEK - member.xp));
  await env.DB.batch([
    env.DB.prepare('UPDATE league_members SET xp = xp + ?, seen_at = ? WHERE account_id = ?').bind(credit, now, accountId),
    env.DB.prepare('UPDATE profiles SET xp_total = ? WHERE account_id = ?').bind(credit < step ? total : profile.xp_total + step, accountId)
  ]);
  return { credited: credit };
}

export async function leaderboardRequest(request, env, pathname, userId) {
  if (!userId) return json({ error: 'sign_in_required' }, 401);
  const now = env.__now ?? Date.now();
  if (pathname === '/api/leaderboard' && request.method === 'GET') {
    const profile = await env.DB.prepare('SELECT 1 AS found FROM profiles WHERE account_id = ?').bind(userId).first();
    if (!profile) return json({ error: 'missing_profile' }, 404);
    const view = await leaderboardView(env, userId, now);
    return view ? json(view) : json({ error: 'busy' }, 503);
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'origin' }, 403);
  if (Number(request.headers.get('Content-Length')) > 512) return json({ error: 'invalid' }, 413);
  const body = (await request.json().catch(() => null)) || {};
  if (pathname === '/api/leaderboard/status' && request.method === 'PUT') {
    const status = body.status;
    if (status !== null && !(Number.isInteger(status) && status >= 0 && status < LEAGUE_STATUS_COUNT)) return json({ error: 'invalid' }, 400);
    const result = await env.DB.prepare('UPDATE profiles SET lb_status = ? WHERE account_id = ?').bind(status, userId).run();
    return result.meta.changes ? json({ status }) : json({ error: 'missing_profile' }, 404);
  }
  if (pathname === '/api/xp' && request.method === 'POST') {
    if (!Number.isInteger(body.total) || body.total < 0 || body.total > 10000000) return json({ error: 'invalid' }, 400);
    const result = await leagueSyncXp(env, userId, body.total, now);
    return result.error ? json({ error: result.error }, result.status) : json(result);
  }
  return json({ error: 'not_found' }, 404);
}
