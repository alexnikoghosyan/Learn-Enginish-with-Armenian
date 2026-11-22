function actionIcon(name) {
  const paths = {
    speaker: '<path d="M3 9v6h4l5 4V5L7 9H3z M15 9a4 4 0 0 1 0 6 M18 6a8 8 0 0 1 0 12"/>',
    add: '<path d="M12 5v14 M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    external: '<path d="M14 3h7v7 M21 3l-9 9 M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'
  };
  return '<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths[name] + '</svg>';
}

const LESSONS=[
{title:'Ես, դու, նա…',en:'Pronouns & to be',desc:'Կառուցիր քո առաջին նախադասությունը',rule:'Անգլերենում սովորաբար պետք է նշել ենթական։ I → am, he/she/it → is, you/we/they → are։ Հայերենի «եմ, ես, է…» ձևերի փոխարեն օգտագործում ենք to be բայի այս ձևերը։',examples:[['I am a student.','Ես ուսանող եմ։'],['She is happy.','Նա ուրախ է։'],['We are at home.','Մենք տանն ենք։']],q:'She ___ a teacher.',options:['am','is','are','be'],a:1,why:'She-ի հետ օգտագործում ենք is։'},
{title:'Հարց ու ժխտում',en:'To be: questions & negatives',desc:'Ասա «ոչ» և հարցեր տուր',rule:'Ժխտման համար am/is/are-ից հետո ավելացրու not։ Հարց կազմելիս am/is/are-ը տեղափոխիր ենթակայից առաջ։ is not = isn’t, are not = aren’t։',examples:[['He is not busy.','Նա զբաղված չէ։'],['Are you ready?','Դու պատրա՞ստ ես։'],['Yes, I am. / No, I am not.','Այո։ / Ոչ։']],q:'Ընտրիր ճիշտ հարցը։',options:['You are happy?','Do you are happy?','Are you happy?','Is you happy?'],a:2,why:'To be-ով չեզոք հարցի կառուցվածքն է՝ Are + you + happy?։'},
{title:'Մի գիրք, այդ գիրքը',en:'A, an & the',desc:'Հասկացիր անգլերենի հոդերը',rule:'A/an-ը գործածվում է եզակի հաշվելի գոյականի հետ՝ երբ այն դեռ որոշակի չէ։ A՝ բաղաձայն հնչյունից առաջ, an՝ ձայնավոր հնչյունից առաջ։ The՝ երբ խոսակիցները գիտեն, թե կոնկրետ որ առարկայի մասին է խոսքը։ Կարևորը հնչյունն է, ոչ թե տառը։',examples:[['I have a book. The book is new.','Ես մի գիրք ունեմ։ Այդ գիրքը նոր է։'],['an apple · a university','խնձոր · համալսարան (university-ն սկսվում է /j/ հնչյունով)'],['an hour','մեկ ժամ (h-ն չի արտասանվում)']],q:'She is ___ teacher.',options:['an','a','—','are'],a:1,why:'Teacher-ը եզակի հաշվելի գոյական է և սկսվում է բաղաձայն հնչյունով։'},
{title:'Մեկից ավելի',en:'Plurals & this / these',desc:'Եզակի, հոգնակի և ցուցական բառեր',rule:'Սովորաբար հոգնակին կազմում ենք -s-ով, իսկ -s, -sh, -ch, -x վերջավորություններից հետո՝ -es-ով։ Բաղաձայն + y-ն դառնում է -ies։ Կան անկանոն ձևեր՝ child → children, man → men։ This/that՝ եզակի, these/those՝ հոգնակի։',examples:[['one book → two books','մեկ գիրք → երկու գիրք'],['a city → cities; a box → boxes','քաղաք → քաղաքներ, տուփ → տուփեր'],['This is my book. These are my books.','Սա իմ գիրքն է։ Սրանք իմ գրքերն են։']],q:'Two ___ are playing.',options:['child','childs','children','childes'],a:2,why:'Child բառի հոգնակին children է։'},
{title:'Իմ առօրյան',en:'Present Simple',desc:'Խոսիր սովորությունների և փաստերի մասին',rule:'Present Simple-ը նկարագրում է սովորություններ, կրկնվող գործողություններ և ընդհանուր փաստեր։ I/you/we/they-ի հետ բայի հիմնական ձևն է։ He/she/it-ի հետ ավելանում է -s կամ -es։ Have → has։',examples:[['I work every day.','Ես աշխատում եմ ամեն օր։'],['She reads books.','Նա գրքեր է կարդում։'],['He goes to school.','Նա դպրոց է գնում։']],q:'He ___ English every day.',options:['study','studies','studying','are study'],a:1,why:'He-ի հետ study → studies (բաղաձայն + y → ies)։'},
{title:'Do՞, թե does՞',en:'Present Simple: questions',desc:'Հարցեր ու ժխտումներ առօրյայի մասին',rule:'Օգտագործիր do/does՝ հարցի համար, don’t/doesn’t՝ ժխտման համար։ He/she/it-ի հետ՝ does։ Օժանդակ բայից հետո հիմնական բայը չի ստանում -s։ To be բայը այս կանոնին չի ենթարկվում։',examples:[['Do you like coffee?','Սիրո՞ւմ ես սուրճ։'],['Does she work here?','Նա այստե՞ղ է աշխատում։'],['He doesn’t like tea.','Նա թեյ չի սիրում։']],q:'Does she ___ English?',options:['speaks','speak','speaking','spoke'],a:1,why:'Does-ից հետո օգտագործում ենք բայի հիմնական ձևը՝ speak։'},
{title:'Հենց հիմա',en:'Present Continuous',desc:'Նկարագրիր ընթացող գործողությունը',rule:'Կառուցվածքը՝ am/is/are + բայ-ing։ Օգտագործում ենք այս պահին ընթացող կամ ժամանակավոր գործողության համար։ Համեմատիր՝ I read every day (սովորություն) և I am reading now (հիմա)։ Know, want, like նման վիճակ արտահայտող բայերը սովորաբար օգտագործում ենք Simple-ով։',examples:[['I am learning English now.','Ես հիմա անգլերեն եմ սովորում։'],['They are playing.','Նրանք խաղում են։'],['Are you listening?','Դու լսո՞ւմ ես։']],q:'Look! They ___ football.',options:['play','plays','are playing','is playing'],a:2,why:'Այս պահին ընթացող գործողություն՝ they + are + playing։'},
{title:'Երեկ ինչ եղավ',en:'Past Simple',desc:'Պատմիր անցյալի մասին',rule:'Անցյալում ավարտված գործողության համար կանոնավոր բային ավելացնում ենք -ed։ Անկանոն ձևերը սովորում ենք առանձին՝ go → went, see → saw, buy → bought։ Հարց/ժխտում՝ did/didn’t + հիմնական ձև։ To be-ի անցյալը was/were է և did չի պահանջում։',examples:[['I worked yesterday.','Ես երեկ աշխատեցի։'],['She went home.','Նա տուն գնաց։'],['Did you see him? I didn’t see him.','Դու տեսա՞ր նրան։ Ես նրան չտեսա։']],q:'Did you ___ the book?',options:['read','reads','reading','readed'],a:0,why:'Did-ից հետո բայը հիմնական ձևով է։ Read-ի ներկայի և անցյալի գրությունը նույնն է, արտասանությունը՝ տարբեր։'},
{title:'Վաղվա ծրագրերը',en:'Will & going to',desc:'Խոսիր ապագայի մասին',rule:'Will + հիմնական բայ՝ հաճախ տվյալ պահին ընդունված որոշման, խոստման կամ կանխատեսման համար։ Am/is/are going to + հիմնական բայ՝ նախապես մտածված ծրագրի կամ ներկա ապացույցի վրա հիմնված կանխատեսման համար։ Այս ձևերի գործածությունը երբեմն համընկնում է։',examples:[['I will help you.','Ես կօգնեմ քեզ։'],['We are going to study tonight.','Մենք մտադիր ենք սովորել այս երեկո։'],['Look at the clouds. It is going to rain.','Նայիր ամպերին։ Անձրև է գալու։']],q:'I am going to ___ English.',options:['learn','learning','learned','learns'],a:0,why:'Going to-ից հետո հիմնական ձևն է՝ learn։'},
{title:'Կարող եմ և պետք է',en:'Can, must & should',desc:'Կարողություն, պարտավորություն ու խորհուրդ',rule:'Can՝ կարողություն կամ թույլտվություն, must՝ ուժեղ անհրաժեշտություն, should՝ խորհուրդ։ Դրանցից հետո բայի հիմնական ձևն է՝ առանց to-ի և -s-ի։ Mustn’t նշանակում է «արգելվում է», don’t have to՝ «պարտադիր չէ»։',examples:[['She can speak English.','Նա կարող է անգլերեն խոսել։'],['You should practice every day.','Լավ կլինի՝ ամեն օր պարապես։'],['You mustn’t park here.','Այստեղ կայանելն արգելվում է։']],q:'He can ___ well.',options:['swims','to swim','swim','swimming'],a:2,why:'Can-ից հետո՝ բայի հիմնական ձևը՝ swim։'},
{title:'Որտե՞ղ և ե՞րբ',en:'In, on & at',desc:'Տեղի և ժամանակի նախդիրները',rule:'Ժամանակ՝ in՝ ամիս/տարի/օրվա մաս, on՝ օր/ամսաթիվ, at՝ ժամ։ Տեղ՝ in՝ ներսում կամ տարածքի մեջ, on՝ մակերևույթին, at՝ կոնկրետ կետում։ Կան կայուն արտահայտություններ՝ at home, at night, in the morning։',examples:[['in November · on Monday · at 9 o’clock','նոյեմբերին · երկուշաբթի · ժամը 9-ին'],['The book is on the table.','Գիրքը սեղանի վրա է։'],['I am at home.','Ես տանն եմ։']],q:'The lesson starts ___ 10 o’clock.',options:['in','on','at','to'],a:2,why:'Ժամերի հետ օգտագործում ենք at։'},
{title:'Շատ, քիչ և ավելի',en:'Some, any & comparisons',desc:'Քանակ և համեմատություն',rule:'Many՝ հաշվելի հոգնակի գոյականների հետ, much՝ անհաշվելի։ Some հաճախ հաստատականում է, any՝ հարցերում ու ժխտումներում։ Առաջարկներում և խնդրանքներում կարող է լինել some։ Կարճ ածական՝ small → smaller → the smallest։ Երկար՝ more beautiful → the most beautiful։ Good → better → the best։',examples:[['I have some books. I don’t have any milk.','Ես մի քանի գիրք ունեմ։ Կաթ չունեմ։'],['How many books? How much water?','Քանի՞ գիրք։ Որքա՞ն ջուր։'],['This book is better than that one.','Այս գիրքն ավելի լավն է, քան այն մեկը։']],q:'How ___ water do you drink?',options:['many','much','a','an'],a:1,why:'Water-ն անհաշվելի է․ օգտագործում ենք much։'}
];
let state;try{state=JSON.parse(localStorage.getItem('eg-v1'))||{}}catch{state={}}state.known??=[];state.lessons??=[];state.notes??={};state.review??={};let view=lastStudySection(),page=0,query='',filter='all',letter='',flashIndex=0,flipped=false,quizIndex=0,answered=false,score=0;const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const save=()=>{try{localStorage.setItem(studyStorageKey(),JSON.stringify(state))}catch{alert('Առաջընթացը հնարավոր չեղավ պահպանել։ Դիտարկիչի պահոցը հասանելի չէ։')}};const hy=w=>state.notes[w.en]||w.hy||w.mt||'';const translated=()=>WORDS.filter(w=>hy(w));const known=w=>state.known.includes(w);const go=v=>{view=v;render();window.scrollTo(0,0)};
const navigationIcons = {
  journal: '<rect x="5" y="6" width="22" height="23" rx="4" fill="#ffca3a"/><path fill="#fff0b5" d="M10 10h14v15H10z"/><path d="M10 4v6m11-6v6" stroke="#af7314" stroke-width="3" stroke-linecap="round"/><path fill="#f39318" d="m12 20 10-9 3 3-10 9-4 1z"/>'
};

const studySectionNames = ['home', 'grammar', 'vocabulary', 'sounds', 'journal', 'profile'];

function lastStudySection() {
  try {
    const saved = localStorage.getItem('eg-section');
    if (['home', 'grammar', 'vocabulary', 'sounds', 'journal', 'profile'].includes(saved)) return saved;
  } catch {}
  return 'vocabulary';
}

function renderNavigation() {
  const section = view === 'quiz' ? 'grammar' : view;
  if (studySectionNames.includes(section)) {
    try { localStorage.setItem('eg-section', section); } catch {}
  }
  const activeView = ['journal', 'sounds', 'profile'].includes(view) ? view : 'home';
  const links = [
    ['home', 'Սովորել'],
    ['sounds', 'Հնչյուններ'],
    ['journal', 'Իմ գրառումները'],
    ['profile', 'Պրոֆիլ']
  ];
  document.getElementById('nav').innerHTML = links.map(([id, name]) =>
    '<button ' + (activeView === id ? 'class="active" aria-current="page" ' : '') +
    'onclick="go(\'' + id + '\')"><i aria-hidden="true">' +
    (id === 'home' || id === 'sounds' ? referenceIcon(id) : id === 'profile' && typeof avatarNavIcon === 'function' && avatarNavIcon() ? avatarNavIcon() : '<svg viewBox="0 0 32 32" focusable="false">' + (navigationIcons[id] || '<circle cx="16" cy="10" r="6" fill="#9b73dc"/><path d="M5 28c0-8 5-12 11-12s11 4 11 12z" fill="#9b73dc"/>') + '</svg>') +
    '</i>' + name + '</button>'
  ).join('');
}
function render() {
  renderNavigation();
  const pages = { home: studyHome, grammar, vocabulary, quiz, journal, sounds, profile };
  (pages[view] ?? studyHome)();
}
function filtered(){return WORDS.filter(w=>(!query||w.en.toLowerCase().includes(query.toLowerCase())||hy(w).toLowerCase().includes(query.toLowerCase()))&&(!letter||w.en[0].toUpperCase()===letter)&&(filter==='all'||filter==='translated'&&hy(w)||filter==='known'&&known(w.en)||filter==='new'&&!known(w.en)))}
function words(){app.innerHTML=`<div class="eyebrow">YOUR WORD COLLECTION</div><h1>Բառեր</h1><div class="tools"><input id="search" type="search" placeholder="Որոնիր բառ կամ թարգմանություն…" aria-label="Որոնել բառ" value="${esc(query)}"><select id="filter" aria-label="Բառերի զտիչ"><option value="all">Բոլոր բառերը</option><option value="translated">Թարգմանությամբ</option><option value="new">Դեռ չեմ սովորել</option><option value="known">Սովորած բառեր</option></select><select id="letter" aria-label="Սկզբնատառ"><option value="">A–Z</option>${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>`<option>${l}</option>`).join('')}</select></div><div class="panel" id="wordlist"></div>`;document.getElementById('filter').value=filter;document.getElementById('letter').value=letter;document.getElementById('search').oninput=e=>{query=e.target.value;page=0;wordList()};document.getElementById('filter').onchange=e=>{filter=e.target.value;page=0;wordList()};document.getElementById('letter').onchange=e=>{letter=e.target.value;page=0;wordList()};wordList()}
function wordList(){const rows=filtered(),max=Math.max(1,Math.ceil(rows.length/25));page=Math.min(page,max-1);document.getElementById('wordlist').innerHTML=`<small>${rows.length} արդյունք</small>${rows.slice(page*25,page*25+25).map(w=>{let i=WORDS.indexOf(w);return `<div class="word-row"><div class="word-en"><button class="text-button word-link" onclick="openWordLesson(${i})">${esc(w.en)} →</button></div><div class="word-hy">${hy(w)?esc(hy(w))+(w.mt&&!w.hy&&!state.notes[w.en]?' <small>· ավտոմատ</small>':''):`<span class="muted">Ավելացրու հայերեն իմաստը</span>`}<button class="text-button" onclick="editWord(${i})" aria-label="Խմբագրել ${esc(w.en)}">✎</button><div id="edit-${i}"></div></div><button class="icon-btn" data-speak="${esc(w.en)}" aria-label="Լսել ${esc(w.en)}">${actionIcon("speaker")}</button><button class="icon-btn" onclick="toggleKnown(${i})" aria-label="${known(w.en)?'Նշել չսովորած':'Նշել սովորած'}">${actionIcon(known(w.en)?'check':'add')}</button><a class="icon-btn" href="https://translate.google.com/?sl=en&tl=hy&text=${encodeURIComponent(w.en)}&op=translate" target="_blank" rel="noopener" aria-label="Բացել թարգմանությունը">${actionIcon("external")}</a></div>`}).join('')||'<div class="empty">Բառ չի գտնվել։ Փոխիր որոնումը կամ զտիչը։</div>'}<div class="pager"><button class="secondary" onclick="page--;wordList()" ${page===0?'disabled':''}>←</button><small>${page+1} / ${max}</small><button class="secondary" onclick="page++;wordList()" ${page>=max-1?'disabled':''}>→</button></div>`}
function editWord(i){let box=document.getElementById('edit-'+i);box.innerHTML=`<div class="editor"><input id="note-${i}" aria-label="Հայերեն թարգմանություն" value="${esc(hy(WORDS[i]))}"><button class="secondary" onclick="saveNote(${i})">Պահել</button></div>`;box.querySelector('input').focus()}
function saveNote(i){state.notes[WORDS[i].en]=document.getElementById('note-'+i).value.trim();save();wordList()}
function toggleKnown(i){let w=WORDS[i].en;state.known=known(w)?state.known.filter(x=>x!==w):[...state.known,w];save();wordList()}
let deck=[];
function cards(){deck=translated().filter(w=>!known(w.en));deck.sort((a,b)=>(state.review[a.en]||0)-(state.review[b.en]||0));flashIndex=0;flipped=false;drawCard()}
function drawCard(){let w=deck[flashIndex];app.innerHTML=`<div class="eyebrow">A LITTLE EVERY DAY</div><h1>Բառեր</h1><h2>Կրկնություն</h2><p class="muted">Նախ հիշիր իմաստը, հետո բացիր քարտը։ Դժվար բառերը կրկին կհանդիպեն։</p><div class="flash-wrap">${w?`<small>Քարտ ${flashIndex+1} / ${deck.length} · Հայերեն իմաստով բառեր</small><div class="progress"><span style="width:${flashIndex/deck.length*100}%"></span></div><button class="flash" onclick="flipped=!flipped;drawCard()" aria-label="Շրջել քարտը"><div class="eyebrow">${flipped?'ՀԱՅԵՐԵՆ ԻՄԱՍՏԸ':'ՀԻՇՈ՞ՒՄ ԵՍ ԱՅՍ ԲԱՌԸ'}</div><div class="${flipped?'translation':'big'}">${esc(flipped?hy(w):w.en)}</div><small>${flipped?esc(w.en):'Սեղմիր՝ թարգմանությունը տեսնելու համար ↻'}</small></button><div class="flash-actions"><button class="secondary" data-speak="${esc(w.en)}">${actionIcon("speaker")} Լսել բառը</button></div>${flipped?`<div class="flash-actions"><button class="secondary" onclick="rate(false)">Կրկնել ավելի ուշ</button><button class="primary" onclick="rate(true)">Գիտեմ ✓</button></div>`:''}`:`<div class="panel"><h2>Գերազանց աշխատանք 🌱</h2><p>${deck.length?'Ավարտեցիր այս շրջանը։':'Բոլոր թարգմանված բառերը նշել ես սովորած։ Բառարանում կարող ես ավելացնել նոր իմաստներ կամ բառը նորից նշել չսովորած։'}</p><button class="primary" onclick="vocabulary('dictionary')">Բացել բառարանը</button><button class="secondary" onclick="cards()">Նոր շրջան</button></div>`}</div>`}
function rate(ok){let w=deck[flashIndex];state.review[w.en]=Date.now();if(ok&&!known(w.en))state.known.push(w.en);if(!ok)deck.push(w);save();flashIndex++;flipped=false;drawCard()}
let quizSet=[];function quiz(){quizSet=[...LESSONS].sort(()=>Math.random()-.5).slice(0,6);quizIndex=0;score=0;drawQuiz()}
function drawQuiz(){answered=false;const l=quizSet[quizIndex];if(!l){app.innerHTML=`<div class="flash-wrap panel"><div class="eyebrow">ՊԱՐԱՊՄՈՒՆՔՆ ԱՎԱՐՏՎԱԾ Է</div><h1>${score} / ${quizSet.length}</h1><p>${score===quizSet.length?'Հիանալի է․ բոլոր պատասխանները ճիշտ էին։':'Դիտիր բացատրությունները և կրկնիր համապատասխան դասերը։'}</p><button class="primary" onclick="quiz()">Փորձել նորից</button><button class="secondary" onclick="go('grammar')">Կրկնել դասերը</button></div>`;return}app.innerHTML=`<div class="eyebrow">PRACTICE MAKES PROGRESS</div><h1>Փորձիր քեզ</h1><p class="muted">Վեց հարց՝ սովորածդ ամրապնդելու համար։</p><div class="lesson-body"><div class="progress"><span style="width:${quizIndex/quizSet.length*100}%"></span></div><div class="quiz"><small>Հարց ${quizIndex+1} / ${quizSet.length} · ${l.en}</small><h2 style="margin-top:25px">${l.q}</h2><div class="options">${l.options.map((o,j)=>`<button class="option" onclick="answerQuiz(this,${j})">${o}</button>`).join('')}</div><div class="feedback" id="feedback" aria-live="polite"></div><button id="nextQ" class="primary hidden" style="margin-top:20px" onclick="quizIndex++;drawQuiz()">Շարունակել →</button></div></div>`}
function answerQuiz(btn,j){if(answered)return;answered=true;let l=quizSet[quizIndex];if(j===l.a)score++;app.querySelectorAll('.option').forEach((x,k)=>{x.disabled=true;if(k===l.a)x.classList.add('correct')});if(j!==l.a)btn.classList.add('wrong');document.getElementById('feedback').textContent=(j===l.a?'Ճիշտ է։ ':'Ճիշտ պատասխանը՝ '+l.options[l.a]+'. ')+l.why;document.getElementById('nextQ').classList.remove('hidden')}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-speak]');
  if (!button) return;
  const status = document.getElementById('speech-status');
  const report = message => { if (status) status.textContent = message; };
  report('');
  if (!('speechSynthesis' in window)) {
    report('Այս դիտարկիչում արտասանությունը հասանելի չէ։');
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(button.dataset.speak);
  utterance.lang = 'en-US';
  utterance.rate = .82;
  utterance.onerror = ({ error }) => {
    if (error !== 'canceled' && error !== 'interrupted') report('Ձայնը չհնչեց։ Կրկին սեղմիր բարձրախոսին։');
  };
  speechSynthesis.speak(utterance);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
  }
});
