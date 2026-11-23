// Վարկանիշ / Լիգաներ էջը (/leaderboard). Դիզայնը՝ Duolingo-ի «Рейтинги»-ի ձևով (leaderboard.css)։
// Ասսեթները՝ leaderboard-art.js (գեներացվում է leaderboard-assets.py-ով)։
// Տվյալները՝ սերվերից (worker/leaderboard.mjs). իրական օգտատերեր, շաբաթական XP, 10 լիգա։

const LEADERBOARD_LEAGUES = [
  { name: 'Բրոնզե', art: 'leagueBronze' }, { name: 'Արծաթե', art: 'leagueSilver' }, { name: 'Ոսկե', art: 'leagueGold' },
  { name: 'Շափյուղե', art: 'leagueSapphire' }, { name: 'Ռուբինե', art: 'leagueRuby' }, { name: 'Զմրուխտե', art: 'leagueEmerald' },
  { name: 'Ամեթիստե', art: 'leagueAmethyst' }, { name: 'Մարգարտե', art: 'leaguePearl' }, { name: 'Օբսիդիանե', art: 'leagueObsidian' },
  { name: 'Ադամանդե', art: 'leagueDiamond' }
];

// Գոհարներ և սրտեր դեռ չկան (պլեյսհոլդեր)
const LEADERBOARD_ECONOMY = { gems: 0, hearts: 5 };

const LEADERBOARD_STATUSES = [
  { art: 'st0', label: 'Արևային ակնոցով բու', owl: true }, { art: 'st1', label: 'Տոն' },
  { art: 'st2', label: 'Ուժ' }, { art: 'st3', label: 'Աչքեր' }, { art: 'st4', label: 'Պոպկորն' },
  { art: 'st5', label: 'Դրոշ', flag: true },
  { art: 'st6', label: 'Բու', owl: true }, { art: 'st7', label: '100' }, { art: 'st8', label: 'Զվարճալի' },
  { art: 'st9', label: 'Գավաթ' }, { art: 'st10', label: 'Ոսկի' }, { art: 'st11', label: 'Մռայլ կատու' }
];

let leaderboardData = null;
let leaderboardState = 'loading'; // loading | ready | error | offline | guest
let leaderboardRequestId = 0;
let leaderboardLastSyncedXp = null;

function leaderboardOnline() {
  return location.protocol !== 'file:' && !!account.profile;
}

function leaderboardMe() {
  return leaderboardData?.members.find(member => member.me) || null;
}

function leaderboardStatus() {
  const status = leaderboardMe()?.status;
  return Number.isInteger(status) && status >= 0 && status < LEADERBOARD_STATUSES.length ? status : -1;
}

async function setLeaderboardStatus(index) {
  const me = leaderboardMe();
  if (!me) return;
  const previous = me.status;
  me.status = index < 0 ? null : index;
  leaderboardRender(true);
  try {
    const response = await fetch('/api/leaderboard/status', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: me.status })
    });
    if (!response.ok) throw new Error('status');
  } catch {
    me.status = previous;
    leaderboardRender(false);
  }
}

// Ընդհանուր XP-ն ուղարկվում է սերվերին. սերվերը հաշվում է միայն աճը (սահմանափակումներով)
async function syncLeaderboardXp() {
  if (!leaderboardOnline() || typeof profileCounts !== 'function') return;
  let total;
  try { total = profileCounts().xp; } catch { return; }
  if (!Number.isInteger(total) || total === leaderboardLastSyncedXp) return;
  try {
    const response = await fetch('/api/xp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ total })
    });
    if (response.ok) leaderboardLastSyncedXp = total;
  } catch {}
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') syncLeaderboardXp();
});

function leaderboardOwnAvatar() {
  const cfg = typeof currentAvatarConfig === 'function' ? currentAvatarConfig() : null;
  if (cfg) return '<span class="lb-avatar-svg">' + renderAvatarSVG(cfg, { crop: 'bust', bg: true }) + '</span>';
  return leaderboardAvatarFor({ name: account.profile?.name || '?', avatar: account.profile?.avatar });
}

function leaderboardAvatarFor(member) {
  if (member.avatar_config) {
    try { return '<span class="lb-avatar-svg">' + renderAvatarSVG(member.avatar_config, { crop: 'bust', bg: true }) + '</span>'; } catch {}
  }
  if (member.avatar && typeof profileAvatars === 'object' && profileAvatars[member.avatar]) {
    return '<span class="lb-avatar-svg lb-avatar-animal">' + profileAvatars[member.avatar] + '</span>';
  }
  return '<span class="lb-letter">' + esc(String(member.name || '?').trim().charAt(0).toUpperCase() || '?') + '</span>';
}

function leaderboardBadge(statusIndex) {
  const status = LEADERBOARD_STATUSES[statusIndex];
  if (!status) return '';
  return '<div class="lb-badge' + (status.owl ? ' is-owl' : '') + '"><img' + (status.flag ? ' class="is-flag"' : '') + ' src="' + LEADERBOARD_ART[status.art] + '" alt=""></div>';
}

function leaderboardRows(data) {
  return data.members.map(member => {
    const rank = member.rank;
    const up = rank <= data.promote && member.xp > 0 && data.league < LEADERBOARD_LEAGUES.length - 1;
    const down = !up && data.league > 0 && rank > data.size - data.demote;
    const zone = up ? ' is-up' : down ? ' is-down' : '';
    const rankCell = rank <= 3 ? '<img class="lb-medal" alt="' + rank + '" src="' + LEADERBOARD_ART['medal' + rank] + '">' : '<span class="lb-rank">' + rank + '</span>';
    return '<div class="lb-row' + zone + (member.me ? ' is-me' : '') + '"' + (member.me ? ' aria-current="true"' : '') + '>' + rankCell +
      '<div class="lb-avatar">' + (member.me ? leaderboardOwnAvatar() : leaderboardAvatarFor(member)) +
      (member.online ? '<span class="lb-online"></span>' : '') + (Number.isInteger(member.status) ? leaderboardBadge(member.status) : '') + '</div>' +
      '<div class="lb-name"><span>' + esc(member.name) + '</span></div><span class="lb-points">' + member.xp + ' միավոր</span></div>';
  }).join('');
}

function leaderboardLeagueStrip(current) {
  const items = [];
  for (let i = 0; i < LEADERBOARD_LEAGUES.length; i++) {
    const league = LEADERBOARD_LEAGUES[i];
    if (i === current) items.push('<div class="lb-league-current"><img src="' + LEADERBOARD_ART[league.art] + '" alt="' + esc(league.name) + ' լիգա"></div>');
    else items.push('<img src="' + LEADERBOARD_ART[i < current ? league.art : 'leagueLocked'] + '" alt="">');
  }
  return '<div class="lb-leagues"><div class="lb-leagues-track" style="--offset:' + current + '">' + items.join('') + '</div></div>';
}

function leaderboardTopStats() {
  const c = typeof profileCounts === 'function' ? profileCounts() : { xp: 0, streak: 0 };
  const stat = (cls, art, value) => '<div class="lb-stat ' + cls + '"><div class="lb-stat-btn"><img src="' + LEADERBOARD_ART[art] + '" alt="">' + value + '</div></div>';
  return '<div class="lb-stats">' +
    '<div class="lb-stat lb-stat-course"><div class="lb-stat-btn"><img src="' + LEADERBOARD_ART.flagUS + '" alt="English"><b>' + c.xp.toLocaleString('hy-AM') + '</b></div></div>' +
    stat('lb-stat-streak', 'streak', '<span class="lb-stat-num">' + c.streak + '</span>') +
    stat('lb-stat-gem', 'gem', '<span class="lb-stat-num">' + LEADERBOARD_ECONOMY.gems.toLocaleString('hy-AM') + '</span>') +
    stat('lb-stat-heart', 'heart', '<span class="lb-stat-num">' + LEADERBOARD_ECONOMY.hearts + '</span>') + '</div>';
}

function leaderboardStatusCard(animate) {
  const status = leaderboardStatus();
  const current = status >= 0 ? LEADERBOARD_STATUSES[status] : null;
  const ready = leaderboardState === 'ready';
  const big = current
    ? '<div class="lb-badge-big is-set' + (current.owl ? ' is-owl' : '') + '"' + (animate ? '' : ' style="animation:none"') + '><img' + (current.flag ? ' class="is-flag"' : '') + ' src="' + LEADERBOARD_ART[current.art] + '" alt=""></div>'
    : '<div class="lb-badge-big"><img src="' + LEADERBOARD_ART.statusEmpty + '" alt=""></div>';
  const tile = (s, i) => '<button type="button" class="lb-tile' + (s.owl ? ' is-owl' : '') + '" aria-label="' + esc(s.label) + '" aria-pressed="' + (i === status) + '"' +
    (ready ? ' onclick="setLeaderboardStatus(' + i + ')"' : ' disabled') + '><img' + (s.flag ? ' class="is-flag"' : '') + ' src="' + LEADERBOARD_ART[s.art] + '" alt=""></button>';
  const row = start => '<div class="lb-tiles">' + LEADERBOARD_STATUSES.slice(start, start + 6).map((s, i) => tile(s, start + i)).join('') + '</div>';
  return '<section class="lb-status-card"><div class="lb-status-head"><h2>Սահմանիր կարգավիճակ</h2>' +
    '<button type="button" class="lb-status-clear"' + (current ? '' : ' hidden') + ' onclick="setLeaderboardStatus(-1)">Մաքրել</button></div>' +
    '<div class="lb-status-grid"><div class="lb-status-me">' + leaderboardOwnAvatar() + '<span class="lb-status-dot"></span>' + big + '</div>' +
    row(0) + row(6) + '</div></section>';
}

function leaderboardMessage(title, text, retry) {
  return '<div class="lb-message"><h2>' + title + '</h2><p>' + text + '</p>' +
    (retry ? '<button type="button" class="secondary" onclick="leaderboard()">Փորձել կրկին</button>' : '') + '</div>';
}

function leaderboardRender(animate) {
  const data = leaderboardData;
  const ready = leaderboardState === 'ready' && data;
  const current = ready ? Math.min(data.league, LEADERBOARD_LEAGUES.length - 1) : 0;
  const league = LEADERBOARD_LEAGUES[current];
  let head, body;
  if (ready) {
    const top = current >= LEADERBOARD_LEAGUES.length - 1;
    head = leaderboardLeagueStrip(current) + '<h1 class="lb-title">' + esc(league.name) + ' լիգա</h1>' +
      '<p class="lb-sub">' + (top ? 'Դու ամենաբարձր լիգայում ես' : 'Լավագույն ' + data.promote + '-ը կբարձրանա հաջորդ լիգա') + '</p>' +
      '<div class="lb-timer"><span>' + data.daysLeft + ' օր</span></div><hr>';
    body = '<div class="lb-list" data-test="leaderboard">' + leaderboardRows(data) + '</div>' +
      (data.size < 2 ? '<p class="lb-alone">Այս լիգայում դեռ միայն դու ես։ Հրավիրիր ընկերներին՝ միասին մրցելու համար։</p>' : '');
  } else {
    head = leaderboardLeagueStrip(0) + '<h1 class="lb-title">Վարկանիշ</h1><p class="lb-sub">&nbsp;</p><div class="lb-timer"></div><hr>';
    body = leaderboardState === 'loading' ? '<p class="lb-loading" role="status">Բեռնվում է…</p>' :
      leaderboardState === 'offline' ? leaderboardMessage('Վարկանիշը հասանելի է միայն առցանց', 'Բացիր <a href="https://armduo.pages.dev/leaderboard">armduo.pages.dev</a>-ը և մուտք գործիր՝ իրական մարդկանց հետ մրցելու համար։') :
      leaderboardState === 'guest' ? leaderboardMessage('Մուտք գործիր՝ մրցելու համար', 'Լիգաներին մասնակցելու համար պետք է հաշիվ։') :
      leaderboardMessage('Վարկանիշը չբեռնվեց', 'Ինչ-որ բան սխալ գնաց։ Փորձիր կրկին։', true);
  }
  app.innerHTML = '<div class="leaderboard-page">' +
    '<div class="lb-aside" role="complementary" aria-label="Վիճակագրություն"><div class="lb-aside-inner">' + leaderboardTopStats() + leaderboardStatusCard(animate) +
    '<ul class="lb-links"><li><a href="/privacy.html">Գաղտնիություն</a></li></ul></div></div>' +
    '<section class="lb-main"><div class="lb-board"><div class="lb-head">' + head + '</div>' + body + '</div></section></div>';
}

async function leaderboard() {
  const request = ++leaderboardRequestId;
  if (location.protocol === 'file:') { leaderboardState = 'offline'; return leaderboardRender(false); }
  if (!account.profile) { leaderboardState = 'guest'; return leaderboardRender(false); }
  if (!leaderboardData) { leaderboardState = 'loading'; leaderboardRender(false); }
  await syncLeaderboardXp();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (response.status === 503 && attempt < 2) { await new Promise(resolve => setTimeout(resolve, 1500)); continue; }
      if (!response.ok) throw new Error('leaderboard');
      const data = await response.json();
      if (request !== leaderboardRequestId || view !== 'leaderboard') return;
      leaderboardData = data;
      leaderboardState = 'ready';
      return leaderboardRender(false);
    } catch {
      if (attempt === 2) {
        if (request !== leaderboardRequestId || view !== 'leaderboard') return;
        leaderboardState = leaderboardData ? 'ready' : 'error';
        return leaderboardRender(false);
      }
    }
  }
}
