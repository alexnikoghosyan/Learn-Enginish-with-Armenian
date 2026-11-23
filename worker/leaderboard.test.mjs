import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
// Գործարկում՝ node --no-warnings worker/leaderboard.test.mjs
const src = 'function json(v,s=200){return Response.json(v,{status:s})}\n' + readFileSync(new URL('./leaderboard.mjs', import.meta.url), 'utf8');
const combined = join(mkdtempSync(join(tmpdir(), 'lb-')), 'combined.mjs');
writeFileSync(combined, src);
const { leaderboardRequest } = await import(pathToFileURL(combined).href);
const sqlite = new DatabaseSync(':memory:');
sqlite.exec(`CREATE TABLE profiles (account_id TEXT PRIMARY KEY NOT NULL, username TEXT, name TEXT NOT NULL, avatar TEXT DEFAULT 'bear', avatar_config TEXT);`);
for (const stmt of readFileSync(new URL('../drizzle/0004_leagues.sql', import.meta.url),'utf8').split('--> statement-breakpoint')) sqlite.exec(stmt);
const n = v => typeof v === 'bigint' ? Number(v) : v;
const conv = r => r && Object.fromEntries(Object.entries(r).map(([k, v]) => [k, n(v)]));
class Stmt { constructor(sql){this.sql=sql;this.a=[]} bind(...a){this.a=a;return this}
  first(){return conv(sqlite.prepare(this.sql).get(...this.a)) ?? null}
  all(){return {results: sqlite.prepare(this.sql).all(...this.a).map(conv)}}
  run(){const r=sqlite.prepare(this.sql).run(...this.a);return {meta:{changes:n(r.changes)}}} }
const DB = { prepare: s => new Stmt(s), async batch(list){ sqlite.exec('BEGIN'); try{ for(const s of list) s.run(); sqlite.exec('COMMIT') }catch(e){ sqlite.exec('ROLLBACK'); throw e } return [] } };
const env = { DB, __now: Date.UTC(2026, 10, 23, 9) }; // երկուշաբթի 2026-11-23 09:00 UTC
let ok = 0, bad = 0; const t = (name, cond, extra='') => { cond ? ok++ : bad++; console.log((cond?'PASS ':'FAIL ')+name+(extra?'  '+extra:'')) };
const call = (method, path, id, body) => leaderboardRequest(new Request('https://x.test'+path, { method, headers: { Origin: 'https://x.test', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), env, path, id);
const get = async (id) => (await call('GET','/api/leaderboard',id)).json();
const ids = Array.from({length:70},(_,i)=>'u'+String(i).padStart(2,'0'));
for (const id of ids) sqlite.prepare('INSERT INTO profiles (account_id, username, name) VALUES (?,?,?)').run(id,id,'Name '+id);

// 1. միացում, խմբեր
for (const id of ids) await get(id);
const g = sqlite.prepare('SELECT group_id, COUNT(*) c FROM league_members GROUP BY group_id ORDER BY group_id').all().map(r=>[n(r.group_id),n(r.c)]);
t('70 users -> groups 30/30/10', JSON.stringify(g)==='[[1,30],[2,30],[3,10]]', JSON.stringify(g));
// 2. XP համաժամացում
let r = await (await call('POST','/api/xp','u00',{total:50})).json(); t('first sync is baseline (credit 0)', r.credited===0);
r = await (await call('POST','/api/xp','u00',{total:80})).json(); t('delta 30 credited', r.credited===30);
r = await (await call('POST','/api/xp','u00',{total:1000})).json(); t('per-call cap 200', r.credited===200, JSON.stringify(r));
let v = await get('u00'); t('me xp = 230', v.members.find(m=>m.me).xp===230, String(v.members.find(m=>m.me).xp));
t('rank list sorted desc', v.members.every((m,i,a)=>!i||a[i-1].xp>=m.xp));
t('bad total rejected', (await call('POST','/api/xp','u00',{total:-1})).status===400);
t('status set', (await call('PUT','/api/leaderboard/status','u00',{status:3})).status===200 && (await get('u00')).members.find(m=>m.me).status===3);
t('status invalid', (await call('PUT','/api/leaderboard/status','u00',{status:99})).status===400);
// weekly cap
for (let i=0;i<20;i++) await call('POST','/api/xp','u01',{total:100000*0+ (i+1)*1000}); 
const cap = sqlite.prepare("SELECT xp FROM league_members WHERE account_id='u01'").get(); t('weekly cap 3000', n(cap.xp)<=3000, String(n(cap.xp)));
// 3. նախապատրաստում. խմբերում տարբեր xp
for (const id of ids) sqlite.prepare('UPDATE league_members SET xp = ? WHERE account_id = ?').run(id==='u05'?0:(parseInt(id.slice(1))*7+13)%100+1, id);
sqlite.prepare("UPDATE league_members SET xp=0 WHERE account_id IN ('u60','u61','u62')").run(); // «դատարկ» մասնակիցներ խմբում 3
const before = Object.fromEntries(sqlite.prepare('SELECT account_id,league,group_id,xp FROM league_members').all().map(r=>[r.account_id,conv(r)]));
// 4. հաջորդ շաբաթ. միաժամանակյա հարցումներ (մրցավազք)
env.__now += 7*86400000;
const res = await Promise.all(ids.slice(0,10).map(id=>call('GET','/api/leaderboard',id)));
t('concurrent requests: all wait and succeed', res.every(x=>x.status===200), res.map(x=>x.status).join(','));
const z0 = ['u60','u61','u62'].filter(id=>!sqlite.prepare('SELECT 1 FROM league_members WHERE account_id=?').get(id));
for (const id of ids) await get(id); // նորից բոլորը
const after = Object.fromEntries(sqlite.prepare('SELECT account_id,league,group_id,xp,week FROM league_members').all().map(r=>[r.account_id,conv(r)]));
// սպասվող. խումբ 1 (30 հոգի)՝ top 20 (67%) xp>0 բարձրանում է, վերջին 5-ը՝ Բրոնզում մնում է (իջնելու տեղ չկա)
const expectGroup = gid => { const rows = Object.values(before).filter(r=>r.group_id===gid).sort((a,b)=>b.xp-a.xp||(a.account_id<b.account_id?-1:1)); return rows; };
let up=0, wrong=0; for (const gid of [1,2]) { const rows = expectGroup(gid); rows.forEach((r,i)=>{ const should = i<20 && r.xp>0 ? 1 : 0; if ((after[r.account_id]?.league ?? -1) !== should) wrong++; if(should) up++ }); }
t('groups 1,2: top 20 (67%) promoted exactly', wrong===0 && up===40, `up=${up} wrong=${wrong}`);
const g3 = expectGroup(3); const z = g3.filter(r=>r.xp===0).map(r=>r.account_id);
t('group 3 (10 users): promote=round(10*.67)=7 → top 7 with xp>0', g3.slice(0,7).every(r=>r.xp===0 || after[r.account_id].league===1), '');
t('zero-xp bronze members dropped from table (before they view again)', z0.length===3, z0.join(','));
t('all remaining have week=current & xp reset', Object.values(after).every(r=>r.week===Math.floor((env.__now-(4*86400000-4*3600000))/(7*86400000)) && r.xp===0));
const sizes = sqlite.prepare('SELECT league, group_id, COUNT(*) c FROM league_members GROUP BY league, group_id').all().map(r=>n(r.c)); t('no group > 30', sizes.every(c=>c<=30), sizes.join(','));
// dropped user rejoins on view
const dropped = z[0]; if (dropped) { const rv = await get(dropped); t('dropped user rejoins league 0', rv.league===0 && rv.members.some(m=>m.me)); }
// 5. իջեցում. լիգա 1 խմբի ստորին
const l1 = sqlite.prepare('SELECT group_id, COUNT(*) c FROM league_members WHERE league=1 GROUP BY group_id').all().map(conv); 
console.log('league-1 groups', JSON.stringify(l1));
for (const id of Object.keys(after).filter(id=>after[id].league===1)) sqlite.prepare('UPDATE league_members SET xp=? WHERE account_id=?').run(parseInt(id.slice(1))+1, id);
const l1ids = Object.keys(after).filter(id=>after[id].league===1);
env.__now += 14*86400000; // երկու շաբաթ բաց թողնված
for (const id of ids) await get(id);
const a2 = Object.fromEntries(sqlite.prepare('SELECT account_id,league FROM league_members').all().map(r=>[r.account_id,n(r.league)]));
t('skipped weeks settle once without crash', Object.keys(a2).length>0);
const dem = l1ids.filter(id=>a2[id]===0).length, stay = l1ids.filter(id=>a2[id]===1).length, up2 = l1ids.filter(id=>a2[id]===2).length;
console.log('league-1 outcomes: up',up2,'stay',stay,'down',dem,'of',l1ids.length);
t('league-1: some promoted, some demoted', up2>0 && dem>0);
// 6. API ձև
const view = await get('u10'); t('view shape', view.league!==undefined && view.daysLeft>=1 && view.daysLeft<=7 && Array.isArray(view.members) && view.members.filter(m=>m.me).length===1 && view.promote>=0, JSON.stringify({l:view.league,d:view.daysLeft,s:view.size,p:view.promote,dm:view.demote}));
t('online flag for viewer', view.members.find(m=>m.me).online===true);
t('no account ids leaked', !JSON.stringify(view).includes('account_id') && view.members.every(m=>Object.keys(m).sort().join()==='avatar,avatar_config,me,name,online,rank,status,xp'));
t('unauth rejected', (await leaderboardRequest(new Request('https://x.test/api/leaderboard'), env, '/api/leaderboard', null)).status===401);
t('cross-origin POST rejected', (await leaderboardRequest(new Request('https://x.test/api/xp',{method:'POST',headers:{Origin:'https://evil.test'},body:'{"total":5}'}), env, '/api/xp', 'u00')).status===403);
console.log(`\n${ok} passed, ${bad} failed`); process.exit(bad?1:0);
