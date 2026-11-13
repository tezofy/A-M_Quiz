/* ============================================================
   app.js — main application logic (game, browse, rendering)
   ============================================================ */
(function(){
"use strict";
/* ===== Data: loaded from js/ files (ui-data, meta-data, questions-s1..s5) ===== */
const UI=window.UI_DATA;
const QS=[].concat(window.QUIZ_S1||[],window.QUIZ_S2||[],window.QUIZ_S3||[],window.QUIZ_S4||[],window.QUIZ_S5||[]);
const DATA={meta:window.QUIZ_META.meta,coverage:window.QUIZ_META.coverage,quotes:window.QUIZ_META.quotes,sections:window.QUIZ_META.sections,questions:QS};
const LETTERS=['A','B','C','D'], PER_PAGE=20;
const state={answers:{},flags:{},revealed:{},page:1,section:'ALL',search:'',diff:'ALL',only:'ALL',showAll:false};
const $=id=>document.getElementById(id);
const store={
  load(){try{const raw=localStorage.getItem('amQuizState');if(!raw)return;const s=JSON.parse(raw);state.answers=s.answers||{};state.flags=s.flags||{};}catch(e){}},
  save(){try{localStorage.setItem('amQuizState',JSON.stringify({answers:state.answers,flags:state.flags}));}catch(e){}}
};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function diffClass(k){return k==='Easy'?'diff-easy':(k==='Hard'?'diff-hard':'diff-medium');}
function human(d){return UI.diff[d]||d;}

/* ---------- hero pills ---------- */
function buildPills(){
  const box=$('heroPills');
  const pills=[
    `${QS.length} ${UI.pill_questions}`,
    `${DATA.coverage.length} ${UI.pill_blockword}`,
    `${DATA.quotes.length} ${UI.pill_quoteword}`,
    UI.pill_pages, UI.pill_type
  ];
  pills.forEach((t,i)=>{const p=el('span','pill');if(i<3){p.innerHTML='<strong>'+t.split(' ')[0]+'</strong> '+t.split(' ').slice(1).join(' ');}else{p.textContent=t;}box.appendChild(p);});
}

/* ---------- compact header (logo + name + read more) ---------- */
function initHero(){
  const h=$('heroTitle');
  if(h){
    const raw=h.textContent.trim();
    const parts=raw.split(/\s+[-—–]\s+/);
    h.textContent='';
    const name=el('b','',parts[0]);
    h.appendChild(name);
    if(parts.length>1)h.appendChild(el('span','',parts.slice(1).join(' — ')));
  }
  const btn=$('heroMoreBtn'),fold=$('heroMore'),txt=$('heroMoreTxt');
  if(!btn||!fold)return;
  const sync=open=>{
    btn.setAttribute('aria-expanded',String(open));
    fold.hidden=!open;
    if(txt)txt.textContent=open?UI.readLess:UI.readMore;
    btn.title=open?UI.readLess:UI.readMore;
  };
  btn.addEventListener('click',()=>sync(btn.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true')sync(false);});
  sync(false);
}

/* ---------- filters ---------- */
function initControls(){
  const sel=$('sectionFilter');
  const all=el('option','',UI.allSections);all.value='ALL';sel.appendChild(all);
  Object.entries(DATA.sections).forEach(([k,v])=>{const o=el('option','',`${k} · ${v}`);o.value=k;sel.appendChild(o);});
  sel.addEventListener('change',e=>{state.section=e.target.value;state.page=1;render();});
  $('searchBox').addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();state.page=1;render();});
  $('resetBtn').addEventListener('click',()=>{
    if(!confirm(UI.confirmReset)) return;
    state.answers={};state.flags={};state.revealed={};state.showAll=false;store.save();buildChips();render();
  });
  $('revealBtn').addEventListener('click',()=>{state.showAll=!state.showAll;$('revealBtn').textContent=state.showAll?UI.hideAllAnswers:UI.revealAll;render();});
  $('prevBtn').addEventListener('click',()=>go(state.page-1));
  $('nextBtn').addEventListener('click',()=>go(state.page+1));
  $('pageSelect').addEventListener('change',e=>go(Number(e.target.value)));
  $('themeBtn').addEventListener('click',()=>{
    const dark=document.documentElement.getAttribute('data-theme')!=='dark';
    document.documentElement.setAttribute('data-theme',dark?'dark':'light');
    $('themeBtn').setAttribute('aria-pressed',String(dark));$('themeTxt').textContent=dark?UI.lightMode:UI.darkMode;
    try{localStorage.setItem('amQuizTheme',dark?'dark':'light');}catch(e){}
  });
  document.addEventListener('keydown',onKey);
}
function go(p){const pages=totalPages();if(p<1||p>pages)return;state.page=p;render();window.scrollTo({top:0,behavior:'smooth'});}

function buildChips(){
  const box=$('chips');box.innerHTML='';
  const mk=(label,n,pressed,fn)=>{
    const b=el('button','chip');b.type='button';b.setAttribute('aria-pressed',String(pressed));
    b.innerHTML=label+(n!==null?` <span class="n">(${n})</span>`:'');
    b.addEventListener('click',fn);box.appendChild(b);
  };
  mk(UI.allQuestions,QS.length,state.only==='ALL',()=>{state.only='ALL';state.page=1;buildChips();render();});
  const unanswered=QS.filter(q=>!state.answers[q.id]).length;
  mk(UI.unanswered,unanswered,state.only==='UNANSWERED',()=>{state.only='UNANSWERED';state.page=1;buildChips();render();});
  const wrong=QS.filter(q=>state.answers[q.id]&&state.answers[q.id]!==q.answer_letter).length;
  mk(UI.incorrect,wrong,state.only==='WRONG',()=>{state.only='WRONG';state.page=1;buildChips();render();});
  const flagged=Object.keys(state.flags).filter(k=>state.flags[k]).length;
  mk(UI.flagged,flagged,state.only==='FLAGGED',()=>{state.only='FLAGGED';state.page=1;buildChips();render();});
  ['Easy','Medium','Hard'].forEach(d=>{
    const n=QS.filter(q=>q.difficulty_key===d).length;
    mk(human(d),n,state.diff===d,()=>{state.diff=state.diff===d?'ALL':d;state.page=1;buildChips();render();});
  });
}

function filtered(){
  const s=state.search;
  return QS.filter(q=>{
    if(state.section!=='ALL'&&q.section!==state.section)return false;
    if(state.diff!=='ALL'&&q.difficulty_key!==state.diff)return false;
    if(state.only==='UNANSWERED'&&state.answers[q.id])return false;
    if(state.only==='WRONG'&&!(state.answers[q.id]&&state.answers[q.id]!==q.answer_letter))return false;
    if(state.only==='FLAGGED'&&!state.flags[q.id])return false;
    if(!s)return true;
    return (q.question+' '+q.options.join(' ')+' '+q.block+' '+q.block_title+' '+q.answer_text).toLowerCase().includes(s);
  });
}
function totalPages(){return Math.max(1,Math.ceil(filtered().length/PER_PAGE));}

/* ---------- quotes + coverage ---------- */
function buildFolds(){
  const box=$('quoteList');
  DATA.quotes.forEach((q,i)=>{
    const d=el('div','quote');
    const line=el('div');line.appendChild(el('span','author',(i+1)+'. '+q.author+' — '));
    line.appendChild(el('em','',`“${q.quote}”`));d.appendChild(line);
    d.appendChild(el('div','',UI.whyMaps+q.meaning));
    d.appendChild(el('small','',`${UI.themeWord}${q.theme} · ${q.note} · ${q.source}`));
    box.appendChild(d);
  });
  $('quoteCount').textContent=DATA.quotes.length;
  const cov=$('coverage');
  DATA.coverage.forEach(c=>{
    const d=el('div');d.appendChild(el('b','',`${c.block} · ${c.questions} ${UI.pill_questions}`));d.appendChild(el('span','',c.block_title));cov.appendChild(d);
  });
  $('covCount').textContent=DATA.coverage.length;
}

/* ---------- the card ---------- */
function confetti(host){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const box=el('div','confetti');host.appendChild(box);
  const colors=['#FFCE1B','#0F7A4A','#2B7BE4','#D4A000','#FF3E8C'];
  for(let i=0;i<14;i++){
    const p=el('i');p.style.left=(8+Math.random()*84)+'%';
    p.style.background=colors[i%colors.length];
    p.style.animationDelay=(Math.random()*0.25)+'s';
    box.appendChild(p);
  }
  setTimeout(()=>box.remove(),1000);
}
function paint(card,q,fx){
  const chosen=state.answers[q.id];
  const reveal=state.showAll||state.revealed[q.id]||!!chosen;
  card.classList.toggle('is-correct',!!chosen&&chosen===q.answer_letter);
  card.classList.toggle('is-wrong',!!chosen&&chosen!==q.answer_letter);
  card.classList.toggle('is-flagged',!!state.flags[q.id]);
  card.querySelectorAll('.opt').forEach(btn=>{
    const L=btn.dataset.letter;
    btn.classList.remove('correct','wrong','dimmed');
    btn.setAttribute('aria-checked',String(chosen===L));
    const mark=btn.querySelector('.mark');if(mark)mark.textContent='';
    if(reveal){
      if(L===q.answer_letter){btn.classList.add('correct');btn.querySelector('.mark').textContent='✓';}
      else if(chosen===L){btn.classList.add('wrong');btn.querySelector('.mark').textContent='✗';}
      else{btn.classList.add('dimmed');}
    }
  });
  let fb=card.querySelector('.feedback');if(fb)fb.remove();
  const flagBtn=card.querySelector('.flagbtn');
  if(flagBtn)flagBtn.setAttribute('aria-pressed',String(!!state.flags[q.id]));
  const rev=card.querySelector('.reveal');
  if(rev)rev.textContent=reveal?UI.hideAnswer:UI.showAnswer;
  if(!reveal)return;
  fb=el('div','feedback');
  const ico=el('span','fico');
  const body=el('div','body');
  if(chosen===q.answer_letter){
    fb.classList.add('good');ico.textContent='✓';
    body.appendChild(el('b','',UI.correct));
    body.appendChild(document.createTextNode((q.why?' '+q.why:'')));
    if(fx)confetti(fb);
  }else if(chosen){
    fb.classList.add('bad');ico.textContent='✕';
    body.appendChild(el('b','',`${UI.correctAnswer} ${q.answer_letter}) ${q.answer_text}.`));
    if(q.why)body.appendChild(document.createTextNode(' '+q.why));
  }else{
    ico.textContent='i';
    body.appendChild(el('b','',`${UI.correctAnswer} ${q.answer_letter}) ${q.answer_text}.`));
    if(q.why)body.appendChild(document.createTextNode(' '+q.why));
  }
  fb.appendChild(ico);fb.appendChild(body);card.appendChild(fb);
}
function makeCard(q,shown){
  const card=el('article','qcard');card.dataset.id=q.id;
  const head=el('div','qhead');
  head.appendChild(el('div','qnum',String(parseInt(q.id.slice(1),10))));
  head.appendChild(el('span','chipmini '+diffClass(q.difficulty_key),human(q.difficulty_key)));
  const bchip=el('span','chipmini block');
  bchip.title=`${q.block} · ${q.block_title}`;
  bchip.appendChild(el('b','blockid',q.block));
  bchip.appendChild(el('span','blocktitle',' · '+q.block_title));
  head.appendChild(bchip);
  const bk=brandOf(q.question);
  if(bk){const bc=el('span','bkchip');bc.title=UI.brandTag+': '+bk;
    bc.appendChild(svgUse(bk));bc.appendChild(el('span','',bk));head.appendChild(bc);}
  head.appendChild(el('span','spacer'));
  const share=el('button','sharebtn');share.type='button';share.title=UI.shareTitle+' · '+q.id;
  share.setAttribute('aria-label',UI.shareTitle+' — '+q.id);
  share.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7 15.7 6.3M8.3 13.3l7.4 4.4"/></svg><span>'+UI.share+'</span>';
  share.addEventListener('click',e=>{e.stopPropagation();shareQuestion(q,share);});
  const act=el('div','qact');act.appendChild(share);
  const flag=el('button','flagbtn');flag.type='button';flag.setAttribute('aria-pressed',String(!!state.flags[q.id]));flag.title=UI.flag+' · '+q.id;flag.setAttribute('aria-label',UI.flag+' — '+q.id);
  flag.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V3.5"/><path d="M6 4.5c2.2-1.2 4.3-1.2 6.5 0s4.3 1.2 6.5 0V13c-2.2 1.2-4.3 1.2-6.5 0s-4.3-1.2-6.5 0"/></svg><span>'+UI.flag+'</span>';
  flag.addEventListener('click',()=>{state.flags[q.id]=!state.flags[q.id];store.save();paint(card,q);buildChips();});
  act.appendChild(flag);head.appendChild(act);card.appendChild(head);
  card.appendChild(el('div','qtext',q.question));

  const opts=el('div','opts');
  q.options.forEach((text,i)=>{
    const L=LETTERS[i];
    const b=el('button','opt');b.type='button';b.dataset.letter=L;b.setAttribute('role','radio');
    b.appendChild(el('span','key',L));
    b.appendChild(el('span','txt',text));
    b.appendChild(el('span','mark'));
    b.addEventListener('click',()=>{answer(q,L,card);});
    opts.appendChild(b);
  });
  card.appendChild(opts);

  const foot=el('div','qfoot');
  const rev=el('button','reveal');rev.type='button';rev.textContent=UI.showAnswer;
  rev.addEventListener('click',()=>{state.revealed[q.id]=!state.revealed[q.id];paint(card,q);});
  foot.appendChild(rev);
  foot.appendChild(el('span','src',`${q.section_title} · ${q.source_url}`));
  card.appendChild(foot);
  paint(card,q);
  return card;
}
function answer(q,L,card){
  state.answers[q.id]=L;store.save();
  paint(card,q,true);updateStats();buildChips();
}

/* ---------- keyboard ---------- */
function onKey(e){
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='select'||tag==='textarea')return;
  if(['1','2','3','4'].includes(e.key)){
    const cards=[...document.querySelectorAll('.qcard')];
    if(!cards.length)return;
    const visible=cards.find(c=>c.getBoundingClientRect().top>0)||cards[0];
    const q=QS.find(x=>x.id===visible.dataset.id);
    const L=LETTERS[Number(e.key)-1];
    if(q&&q.options[Number(e.key)-1]){e.preventDefault();answer(q,L,visible);}
  }else if(e.key.toLowerCase()==='f'){
    const cards=[...document.querySelectorAll('.qcard')];
    if(!cards.length)return;
    const visible=cards.find(c=>c.getBoundingClientRect().top>0)||cards[0];
    const q=QS.find(x=>x.id===visible.dataset.id);
    if(q){e.preventDefault();state.flags[q.id]=!state.flags[q.id];store.save();paint(visible,q);buildChips();}
  }else if(e.key.toLowerCase()==='s'){
    const cards=[...document.querySelectorAll('.qcard')];
    if(!cards.length)return;
    const visible=cards.find(c=>c.getBoundingClientRect().top>0)||cards[0];
    const q=QS.find(x=>x.id===visible.dataset.id);
    if(q){e.preventDefault();shareQuestion(q);}
  }else if(e.key==='ArrowRight'){go(state.page+1);}
  else if(e.key==='ArrowLeft'){go(state.page-1);}
}

/* ---------- stats ---------- */
function updateStats(){
  const answered=Object.keys(state.answers).length;
  let correct=0;Object.entries(state.answers).forEach(([id,L])=>{const q=QS.find(x=>x.id===id);if(q&&q.answer_letter===L)correct++;});
  const pct=answered?Math.round(correct/answered*100):0;
  $('answered').textContent=answered;$('correct').textContent=correct;$('score').textContent=pct+'%';
  const overall=Math.round(answered/QS.length*100);
  $('progress').style.width=overall+'%';
  $('ring').style.setProperty('--p',overall);$('ringTxt').textContent=overall+'%';
  const pt=$('progressTxt');if(pt)pt.textContent=answered+' / '+QS.length;
}

/* ---------- render ---------- */
function render(){
  const list=filtered(),pages=totalPages();if(state.page>pages)state.page=pages;
  const start=(state.page-1)*PER_PAGE,slice=list.slice(start,start+PER_PAGE);
  const host=$('quiz');host.innerHTML='';
  if(!slice.length){
    const em=el('div','empty');
    em.appendChild(el('b','',UI.emptyTitle));em.appendChild(el('span','',UI.emptyBody));host.appendChild(em);
  }
  slice.forEach((q,i)=>host.appendChild(makeCard(q,start+i+1)));
  const sel=$('pageSelect');sel.innerHTML='';
  for(let p=1;p<=pages;p++){const o=el('option','',`${UI.pageWord} ${p} / ${pages}`);o.value=p;sel.appendChild(o);}
  sel.value=state.page;
  $('pageInfo').textContent=`${list.length?start+1:0}–${Math.min(start+PER_PAGE,list.length)} ${UI.ofWord} ${list.length}`;
  const done=Object.keys(state.answers).length;
  $('filterInfo').textContent=`${UI.showing} ${slice.length} · ${list.length} ${UI.filteredResults} · ${pages} ${UI.pagesWord} · ${done}/${QS.length} ${UI.answeredWord}`;
  $('prevBtn').disabled=state.page<=1;$('nextBtn').disabled=state.page>=pages;
  updateStats();
}

/* ---------- toast + share ---------- */
let toastTimer=null;
function toast(msg,linkText){
  const t=$('toast'),m=$('toastMsg');
  m.textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),3200);
}
function questionLink(id){
  const clean=location.href.split('#')[0];
  return clean+'#'+id;
}
function sharePayload(q){
  const lines=[];
  lines.push(UI.sharePrefix+' · '+q.id+' ('+q.block+')');
  lines.push(q.question);
  q.options.forEach((o,i)=>lines.push(LETTERS[i]+') '+o));
  const revealed=state.showAll||state.revealed[q.id]||state.answers[q.id];
  if(revealed) lines.push(UI.shareAnswer+q.answer_letter+') '+q.answer_text);
  else lines.push(UI.shareNoAnswer);
  return {text:lines.join('\n'),url:questionLink(q.id),title:UI.shareTitle+' — '+q.id};
}
async function copyText(text){
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);return true;}
  }catch(e){}
  try{
    const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');
    ta.style.position='fixed';ta.style.top='-1000px';document.body.appendChild(ta);
    ta.select();const ok=document.execCommand('copy');ta.remove();if(ok)return true;
  }catch(e){}
  return false;
}
function openSheet(text){
  $('shareText').value=text;
  $('shareSheet').classList.add('show');
  const ta=$('shareText');ta.focus();ta.select();
}
async function shareQuestion(q,btn){
  const p=sharePayload(q);
  const full=p.text+'\n\n'+p.url;
  if(navigator.share){
    try{await navigator.share({title:p.title,text:p.text,url:p.url});toast(UI.shareDone);return;}
    catch(e){if(e&&e.name==='AbortError')return;}
  }
  const ok=await copyText(full);
  if(ok){toast(UI.shareCopied);return;}
  openSheet(full);
}
function initShare(){
  $('shareClose').addEventListener('click',()=>$('shareSheet').classList.remove('show'));
  $('shareSheet').addEventListener('click',e=>{if(e.target===$('shareSheet'))$('shareSheet').classList.remove('show');});
  $('shareCopy').addEventListener('click',async()=>{
    const ok=await copyText($('shareText').value);
    toast(ok?UI.shareCopied:UI.shareManual);
    if(ok)$('shareSheet').classList.remove('show');
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')$('shareSheet').classList.remove('show');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'&&document.activeElement===$('shareText')){}
  });
}

/* ---------- deep link (#Q0042) ---------- */
function goToHash(){
  const h=(location.hash||'').replace('#','').trim();
  if(!/^Q\d{4}$/.test(h))return false;
  const idx=QS.findIndex(q=>q.id===h);
  if(idx<0)return false;
  if(document.body.classList.contains('mode-game'))setMode('browse');
  state.section='ALL';state.diff='ALL';state.only='ALL';state.search='';
  const sel=$('sectionFilter');if(sel)sel.value='ALL';
  const sb=$('searchBox');if(sb)sb.value='';
  state.page=Math.floor(idx/PER_PAGE)+1;
  buildChips();render();
  const card=document.querySelector('.qcard[data-id="'+h+'"]');
  if(card){
    card.classList.add('is-target');
    if(typeof card.scrollIntoView==='function')card.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>card.classList.remove('is-target'),5000);
    toast(UI.deepLinked+' '+h);
  }
  return true;
}

/* ================= LEVEL QUIZ MODE ================= */
const GKEY='amQuizGame', perLevel=10, HEARTS=3, TIME_LIMIT=30;
const game={levels:[],chapters:[],stars:{},best:{},unlocked:1,xp:0,timer:true,claimed:{},answered:0,correct:0};
const G={lv:0,idx:0,correct:0,lives:HEARTS,streak:0,answered:false,left:TIME_LIMIT,tid:null,picked:'',wrongPicks:[],attempts:0};

function seeded(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffled(arr,rnd){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function dk(q){
  if(q.difficulty_key&&['Easy','Medium','Hard'].indexOf(q.difficulty_key)>=0)return q.difficulty_key;
  const raw=String(q.difficulty||'');
  for(const k of ['Easy','Medium','Hard'])if(raw===k||raw===(UI.diff||{})[k])return k;
  return 'Medium';
}
function starsStr(n){let o='';for(let i=0;i<3;i++)o+=i<n?'★':'☆';return o;}
function rankInfo(){const i=Math.min((UI.gRanks||['Rookie']).length-1,Math.floor(game.xp/150));return {n:i+1,title:(UI.gRanks||['Rookie'])[i]||''};}

function buildLevels(){
  const rnd=seeded(20261113);
  let pool=[];
  ['Easy','Medium','Hard'].forEach(d=>{pool=pool.concat(shuffled(QS.filter(q=>dk(q)===d),rnd));});
  const raw=[];
  for(let i=0;i<pool.length;i+=perLevel)raw.push(pool.slice(i,i+perLevel));
  const chapLen=Math.ceil(raw.length/7)||1;
  game.levels=raw.map((qs,i)=>{
    const c={Easy:0,Medium:0,Hard:0};qs.forEach(q=>{c[dk(q)]=(c[dk(q)]||0)+1;});
    const band=Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||'Easy';
    return {n:i+1,qs:qs,band:band,counts:c,chapter:Math.floor(i/chapLen)};
  });
  game.chapters=[];
  game.levels.forEach(l=>{(game.chapters[l.chapter]=game.chapters[l.chapter]||[]).push(l);});
  game.chapters=game.chapters.filter(Boolean);
}

const gstore={
  load(){
    try{const raw=localStorage.getItem(GKEY);if(!raw)return;const d=JSON.parse(raw);
      game.stars=d.stars||{};game.best=d.best||{};game.xp=d.xp||0;
      game.unlocked=Math.max(1,Math.min(d.unlocked||1,game.levels.length));game.claimed=d.claimed||{};
      game.timer=d.timer!==false;game.answered=d.answered||0;game.correct=d.correct||0;
    }catch(e){}
  },
  save(){
    try{localStorage.setItem(GKEY,JSON.stringify({stars:game.stars,best:game.best,xp:game.xp,unlocked:game.unlocked,timer:game.timer,claimed:game.claimed,answered:game.answered||0,correct:game.correct||0}));}catch(e){}
  }
};

function setMode(m){
  document.body.classList.toggle('mode-game',m==='game');
  document.body.classList.toggle('mode-browse',m==='browse');
  document.body.classList.toggle('mode-design',m==='design');
  [['tabGame','game'],['tabBrowse','browse'],['tabDesign','design']].forEach(([id,mode])=>{
    const b=$(id);if(b)b.setAttribute('aria-pressed',String(mode===m));
  });
  const dl=$('designLab'),nfc=$('nfcCard');
  if(dl)dl.hidden=m!=='design';
  if(nfc)nfc.hidden=m!=='design';
  try{localStorage.setItem('amQuizMode',m);}catch(e){}
  if(m==='game'){stopTimer();renderGameBar();openMap();}
  else{stopTimer();window.scrollTo({top:0,behavior:'smooth'});}
}

let gSlideIdx=0,gSlideTimer=null;
const G_SLIDE_MS=[5000,3000,3000];
function applyGSlide(){
  const bar=$('gameBar');if(!bar)return;
  bar.querySelectorAll('.gslide').forEach((s,i)=>s.classList.toggle('active',i===gSlideIdx));
}
function startGSlideRotation(){
  if(gSlideTimer)return;
  const tick=()=>{
    gSlideIdx=(gSlideIdx+1)%3;
    applyGSlide();
    gSlideTimer=setTimeout(tick,G_SLIDE_MS[gSlideIdx]);
  };
  gSlideTimer=setTimeout(tick,G_SLIDE_MS[0]);
}
function renderGameBar(){
  const bar=$('gameBar');if(!bar)return;bar.innerHTML='';
  const total=game.levels.length,got=Object.keys(game.stars).reduce((a,k)=>a+(game.stars[k]||0),0);
  const pct=total?Math.round(got/(total*3)*100):0;
  const ans=game.answered||0,cor=game.correct||0,acc=ans?Math.round(cor/ans*100):0;
  const slides=el('div','gslides');
  /* Slide 1 — score */
  const sScore=el('div','gslide gslide-score');
  const stats=el('div','gstats gstatsp');
  const ring=el('div','gring');ring.style.setProperty('--p',String(pct));ring.title=UI.gStars+' '+got+' / '+(total*3);
  ring.appendChild(el('span','',pct+'%'));
  stats.appendChild(ring);
  const cols=el('div','gcols');
  const col=(label,value)=>{const c=el('div','gcol');c.appendChild(el('span','gl',label));c.appendChild(el('span','gv',String(value)));return c;};
  cols.appendChild(col(UI.gAnswered,ans));
  cols.appendChild(col(UI.gCorrect,cor));
  cols.appendChild(col(UI.gScore,acc+'%'));
  stats.appendChild(cols);
  sScore.appendChild(stats);
  slides.appendChild(sScore);
  /* Slide 2 — brand */
  const sBrand=el('div','gslide gslide-brand');
  const bl=el('span','gbrand-logo');const blim=el('img','');blim.src='assets/coffee-cup.png';blim.alt='';bl.appendChild(blim);sBrand.appendChild(bl);
  const bt=el('span','gbrand-text');
  bt.appendChild(el('b','','Advertising & More'));
  bt.appendChild(el('small','','Integrated Advertising & Marketing Agency'));
  sBrand.appendChild(bt);
  slides.appendChild(sBrand);
  /* Slide 3 — gift / rewards (score-based) */
  const score=acc;
  let nextTier=null,readyCount=0;
  GIFT_TIERS.forEach(t=>{const gotT=score>=t.at,claimed=!!game.claimed['s'+t.at];if(gotT&&!claimed)readyCount++;if(!gotT&&nextTier===null)nextTier=t;});
  const sGift=el('div','gslide gslide-gift');
  const gi=el('span','ggift-icon');gi.innerHTML=readyCount?GIFT_SVG_OPEN:GIFT_SVG_LOCK;
  const gt=el('span','ggift-text');
  gt.appendChild(el('b','',UI.gmRewards));
  gt.appendChild(el('small','',readyCount?UI.gmReadyCount.replace('{n}',String(readyCount)):(nextTier?('Next gift at '+nextTier.at+'% score'):'All gifts claimed')));
  sGift.appendChild(gi);sGift.appendChild(gt);
  slides.appendChild(sGift);
  bar.appendChild(slides);
  applyGSlide();
  startGSlideRotation();

  const tg=$('tabGameTxt'),tb2=$('tabBrowseTxt');
  if(tg)tg.textContent=UI.gGame;if(tb2)tb2.textContent=UI.gBrowse;
  if(typeof syncSettingsUI==='function')syncSettingsUI();
}

function syncSettingsUI(){
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  const l=$('setLight'),d=$('setDark');
  if(l)l.setAttribute('aria-pressed',String(!dark));
  if(d)d.setAttribute('aria-pressed',String(dark));
  const t=$('setTimer'),ts=$('setTimerState');
  if(t)t.setAttribute('aria-checked',String(!!game.timer));
  if(ts)ts.textContent=game.timer?UI.gTimerOn:UI.gTimerOff;
}

function initSettings(){
  const btn=$('setBtn'),pop=$('setPop');
  if(!btn||!pop)return;
  const place=()=>{
    const r=btn.getBoundingClientRect();
    pop.style.top=Math.round(r.bottom+10)+'px';
    pop.style.right=Math.max(10,Math.round(window.innerWidth-r.right))+'px';
  };
  const setOpen=open=>{
    if(open)place();
    btn.setAttribute('aria-expanded',String(open));
    pop.hidden=!open;
    if(open)syncSettingsUI();
  };
  window.addEventListener('resize',()=>{if(!pop.hidden)place();});
  window.addEventListener('scroll',()=>{if(!pop.hidden)place();},{passive:true});
  btn.addEventListener('click',e=>{e.stopPropagation();setOpen(pop.hidden);});
  pop.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',e=>{
    if(pop.hidden)return;
    const t=e.target;
    if(t&&t.closest&&(t.closest('#setPop')||t.closest('#setBtn')||t.closest('#themeBtn')))return;
    setOpen(false);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden)setOpen(false);});

  const applyTheme=dark=>{
    if((document.documentElement.getAttribute('data-theme')==='dark')!==dark)$('themeBtn').click();
    syncSettingsUI();renderGameBar();
  };
  $('setLight').addEventListener('click',()=>applyTheme(false));
  $('setDark').addEventListener('click',()=>applyTheme(true));

  $('setTimer').addEventListener('click',()=>{
    game.timer=!game.timer;gstore.save();syncSettingsUI();renderGameBar();
    if(G.lv&&!G.answered)startTimer();
  });
  $('setResetBtn').addEventListener('click',()=>{
    if(!confirm(UI.gResetConfirm))return;
    game.stars={};game.best={};game.xp=0;game.unlocked=1;game.claimed={};openChap=null;gstore.save();
    renderGameBar();syncSettingsUI();setOpen(false);openMap();toast(UI.gResetDone);
  });
  syncSettingsUI();
}

function openMap(){
  stopTimer();
  $('gamePlay').hidden=true;$('gameResult').hidden=true;$('gameMap').hidden=false;
  renderMap();
}

/* ---------- premium level card + level gifts ---------- */
const GIFT_ART=UI.giftArt||'';
const GIFT_SVG_OPEN='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="21" width="34" height="21" rx="4" fill="#FFCE1B"/><rect x="5" y="14" width="38" height="9" rx="3" fill="#FFE27A"/><rect x="22" y="14" width="4" height="28" fill="#D4A000"/><path d="M24 14c-3-7-11-7-10-1 .6 3 5 2 10 1zm0 0c3-7 11-7 10-1-.6 3-5 2-10 1z" fill="none" stroke="#D4A000" stroke-width="2.4" stroke-linejoin="round"/><circle cx="41" cy="8" r="2.4" fill="#FFE27A"/><circle cx="7" cy="8" r="1.8" fill="#FFE27A"/></svg>';
const GIFT_SVG_LOCK='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="21" width="34" height="21" rx="4" fill="#5B7FBF"/><rect x="5" y="14" width="38" height="9" rx="3" fill="#8DAEE3"/><rect x="22" y="14" width="4" height="28" fill="#3E63A6"/><rect x="18" y="28" width="12" height="10" rx="2.5" fill="#E8F0FF"/><path d="M20.5 28v-3.2a3.5 3.5 0 0 1 7 0V28" fill="none" stroke="#E8F0FF" stroke-width="2.2"/></svg>';
function buildGiftPanel(){
  const score=currentScore();
  const rw=el('aside','mhrw');
  /* Score requirement at the very top */
  const head=el('div','gift-score-head');
  head.appendChild(el('div','gift-score-label','Your Score'));
  const big=el('div','gift-score-big');big.innerHTML=score+'<small>%</small>';
  head.appendChild(big);
  const next=GIFT_TIERS.find(t=>!game.claimed['s'+t.at]&&score<t.at);
  const readyList=GIFT_TIERS.filter(t=>score>=t.at&&!game.claimed['s'+t.at]);
  head.appendChild(el('div','gift-score-next',next?('Next gift at '+next.at+'% score — RM '+next.amt):(readyList.length?'You have a gift ready to claim!':'All gifts claimed!')));
  const bar=el('div','gift-score-bar');const fill=el('span');
  fill.style.width=(next?Math.min(100,Math.round(score/next.at*100)):100)+'%';
  bar.appendChild(fill);head.appendChild(bar);
  rw.appendChild(head);
  /* Cards that fill up gradually with score */
  const grid=el('div','gift-cards');
  GIFT_TIERS.forEach(t=>{
    const claimed=!!game.claimed['s'+t.at];
    const ready=score>=t.at&&!claimed;
    const pct=Math.min(100,Math.round(score/t.at*100));
    const card=el('div','gift-card '+(claimed?'claimed':ready?'ready':'locked'));
    const fillEl=el('div','gc-fill');fillEl.style.height=pct+'%';
    card.appendChild(fillEl);
    card.appendChild(el('span','gc-pct',pct+'%'));
    card.appendChild(el('div','gc-icon',t.icon));
    card.appendChild(el('div','gc-amt','RM '+t.amt));
    card.appendChild(el('div','gc-name',t.label));
    card.appendChild(el('div','gc-need',t.at+'% score needed'));
    card.appendChild(el('div','gc-status',claimed?'✓ Claimed':ready?'🎁 Ready to claim!':'🔒 '+Math.max(0,t.at-score)+'% to go'));
    grid.appendChild(card);
  });
  rw.appendChild(grid);
  /* Claim footer */
  const ft=el('div','mhrwf');
  const info=readyList.length?UI.gmReadyCount.replace('{n}',String(readyList.length)):(next?('Next gift at '+next.at+'% score'):'');
  ft.appendChild(el('span','mhrwi',info));
  const cb=el('button','btn gold mhclaim',readyList.length?UI.gmClaim:UI.gmNoClaim);
  cb.type='button';cb.disabled=!readyList.length;
  cb.addEventListener('click',()=>{
    if(!readyList.length)return;
    const t=readyList[0];game.claimed['s'+t.at]=true;gstore.save();
    toast(UI.gmClaimedMsg.replace('{g}',t.label+' RM '+t.amt));
    renderMap();
  });
  ft.appendChild(cb);
  rw.appendChild(ft);
  return rw;
}

let mhHeroTimer=null;
function startHeroSlider(){
  if(mhHeroTimer)return;
  const tick=()=>{
    const hero=document.querySelector('.mhhero');
    if(!hero){mhHeroTimer=null;return;}
    const imgs=hero.querySelectorAll('.mhhero-img');
    const dots=hero.querySelectorAll('.mhhero-dot');
    let cur=-1;
    imgs.forEach((im,i)=>{if(im.classList.contains('active'))cur=i;});
    const next=(cur+1)%imgs.length;
    imgs.forEach((im,i)=>im.classList.toggle('active',i===next));
    dots.forEach((d,i)=>d.classList.toggle('active',i===next));
    mhHeroTimer=setTimeout(tick,3200);
  };
  mhHeroTimer=setTimeout(tick,3200);
}
function buildMapHead(total,cont){
  const done=Math.max(0,Math.min(total,game.unlocked-1));
  const head=el('section','maphead mhpro');
  /* left: choose your level */
  const main=el('div','mhmain');
  const txt=el('div','mhtxt');
  txt.appendChild(el('span','mhtag',UI.gmTag));
  txt.appendChild(el('h2','',UI.gMapTitle));
  txt.appendChild(el('p','',UI.gMapSub.replace('{done}',String(done)).replace('{total}',String(total))));
  const lv=game.levels[cont-1]||{};
  const next=el('div','mhnext');
  next.appendChild(el('span','mhnl',UI.gmNext));
  next.appendChild(el('b','',UI.gLevel+' '+cont+' · '+human(lv.band||'Easy')));
  const stat=el('div','chips mhchips');
  [UI.gLevels+' '+game.unlocked+'/'+total,QS.length+' '+UI.pill_questions].forEach(t=>stat.appendChild(el('span','chipmini',t)));
  /* one line: next up + chips */
  const meta=el('div','mhmeta');
  meta.appendChild(next);
  meta.appendChild(stat);
  txt.appendChild(meta);
  main.appendChild(txt);
  head.appendChild(main);
  /* right: 3D character slider + CTA button below */
  const hero=el('div','mhhero');
  const stage=el('div','mhhero-stage');
  const heroImgs=['assets/hero/brain-hero.webp','assets/hero/trophy-hero.webp','assets/hero/owl-hero.webp'];
  heroImgs.forEach((src,i)=>{
    const im=el('img','mhhero-img'+(i===0?' active':''));
    im.src=src;im.alt='';im.decoding='async';
    stage.appendChild(im);
  });
  const dots=el('div','mhhero-dots');
  heroImgs.forEach((_,i)=>dots.appendChild(el('span','mhhero-dot'+(i===0?' active':''))));
  stage.appendChild(dots);
  hero.appendChild(stage);
  const go=el('button','btn gold mhgo',(game.unlocked>1?UI.gContinue:UI.gStart)+' · '+UI.gLevel+' '+cont+' →');
  go.type='button';go.addEventListener('click',()=>openLevel(cont));
  hero.appendChild(go);
  head.appendChild(hero);
  startHeroSlider();
  return head;
}

const GIFT_TIERS=[
  {at:30,amt:20,label:'Lucky Prize',icon:'☕'},
  {at:40,amt:30,label:'Good Prize',icon:'🎒'},
  {at:50,amt:50,label:'Nice Prize',icon:'💡'},
  {at:60,amt:80,label:'Great Prize',icon:'🔊'},
  {at:70,amt:100,label:'Big Prize',icon:'🎮'},
  {at:80,amt:150,label:'Super Prize',icon:'⌚'},
  {at:90,amt:200,label:'Mega Prize',icon:'🎧'},
  {at:100,amt:360,label:'Grand Prize',icon:'📱'}
];
function currentScore(){
  const ans=game.answered||0,cor=game.correct||0;
  return ans?Math.round(cor/ans*100):0;
}
function giftReadyCount(){
  const score=currentScore();
  return GIFT_TIERS.reduce((n,t)=>n+((score>=t.at&&!game.claimed['s'+t.at])?1:0),0);
}
function updateGiftDock(){
  /* Dock score is now shown by the rotating slides block (renderGameBar) */
  renderGameBar();
}
function renderGifts(){
  const body=$('giftBody');if(!body)return;
  body.innerHTML='';body.appendChild(buildGiftPanel());
  const ready=giftReadyCount();
  updateGiftDock();
  const dot=$('giftDot');if(dot)dot.hidden=!ready;
  const trig=$('giftBtn');
  if(trig){
    trig.title=UI.giftTrig;trig.setAttribute('aria-label',UI.giftTrig+(ready?' ('+ready+')':''));
    if(!trig.dataset.wired){
      trig.dataset.wired='1';
      const dlg=$('giftDlg'),close=$('giftClose');
      close.setAttribute('aria-label',UI.close);
      trig.addEventListener('click',()=>{renderGifts();if(!dlg.open)dlg.showModal();});
      close.addEventListener('click',()=>dlg.close());
      dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
    }
  }
}

function renderMap(){
  const host=$('gameMap');host.innerHTML='';
  const total=game.levels.length,got=Object.keys(game.stars).reduce((a,k)=>a+(game.stars[k]||0),0);
  const cont=Math.min(game.unlocked,total);
  host.appendChild(buildMapHead(total,cont));
  renderGifts();

  game.chapters.forEach((arr,ci)=>{
    if(openChap!==null&&openChap!==ci)return;
    const list=openChap===null;
    const chapName=(UI.gChapters||[])[ci]||('Chapter '+(ci+1));
    const chap=el('div','chap chapcard'+(list?' chaplink':''));
    if(list){
      chap.setAttribute('role','button');chap.tabIndex=0;chap.setAttribute('aria-label',chapName+' — '+UI.viewLevels);
      const openIt=()=>{openChap=ci;renderMap();$('gameMap').scrollIntoView({behavior:'smooth',block:'start'});};
      chap.addEventListener('click',openIt);
      chap.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openIt();}});
    }else{
      const back=el('button','btn ghost chapback','← '+UI.chapBack);back.type='button';
      back.addEventListener('click',()=>{openChap=null;renderMap();$('gameMap').scrollIntoView({behavior:'smooth',block:'start'});});
      host.appendChild(back);
    }
    const th=CHAP_THEME[ci]||CHAP_THEME[0]||['#3FA9FF','#1769D6'];
    chap.style.setProperty('--c1',th[0]);chap.style.setProperty('--c2',th[1]);
    const ban=el('div','chapban');
    const txt=el('div','cbtxt');
    txt.appendChild(el('span','cbnum',(UI.chapter||'Chapter')+' '+(ci+1)));
    txt.appendChild(el('h3','',(UI.gChapters||[])[ci]||('Chapter '+(ci+1))));
    const meta=el('div','cbmeta');
    const bands={};arr.forEach(l=>{bands[l.band]=(bands[l.band]||0)+1;});
    const order=['Easy','Medium','Hard'].filter(b=>bands[b]);
    meta.appendChild(el('span','cbpill',order.map(human).join(' → ')));
    const gotHere=arr.reduce((x,l)=>x+(game.stars[l.n]||0),0);
    meta.appendChild(el('span','cbpill','★ '+gotHere+' / '+(arr.length*3)));
    if(list)meta.appendChild(el('span','cbgo',UI.viewLevels+' →'));
    txt.appendChild(meta);
    ban.appendChild(txt);
    if(CHAP_ART[ci]){const im=el('img','cbart');im.src=CHAP_ART[ci];im.alt='';im.loading='lazy';im.decoding='async';ban.appendChild(im);}
    chap.appendChild(ban);
    const grid=el('div','lgrid');
    arr.forEach(l=>{
      const st=game.stars[l.n]||0,locked=l.n>game.unlocked,cur=l.n===game.unlocked;
      const b=el('button','ltile'+(locked?' locked':'')+(st===3?' perfect':(st?' done':''))+(cur?' current':''));
      b.type='button';
      b.setAttribute('aria-label',UI.gLevel+' '+l.n);
      const gw=el('span','lgw');
      if(UI.giftMystery){const im=el('img','lgift');im.src=UI.giftMystery;im.alt='';im.decoding='async';gw.appendChild(im);}
      if(locked){const lk=el('span','llock');lk.innerHTML='<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true" style="vertical-align:-1px"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>';gw.appendChild(lk);}
      b.appendChild(gw);
      b.appendChild(el('span','lnum',String(l.n)));
      b.appendChild(el('span','lstars'+(st&&!locked?'':' lstarsoff'),starsStr(locked?0:st)));
      b.addEventListener('click',()=>{if(locked){toast(UI.gLocked);return;}openLevel(l.n);});
      grid.appendChild(b);
    });
    if(!list)chap.appendChild(grid);
    host.appendChild(chap);
  });
}

function openLevel(n){
  const lv=game.levels[n-1];if(!lv)return;
  G.lv=n;G.idx=0;G.correct=0;G.lives=HEARTS;G.streak=0;G.answered=false;G.picked='';G.wrongPicks=[];G.attempts=0;
  $('gameMap').hidden=true;$('gameResult').hidden=true;$('gamePlay').hidden=false;
  renderPlay();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderPlay(){
  const lv=game.levels[G.lv-1],q=lv.qs[G.idx];
  const host=$('gamePlay');host.innerHTML='';
  const top=el('div','playtop');
  const back=el('button','pback','← '+UI.gBack);back.type='button';
  back.addEventListener('click',()=>openMap());
  top.appendChild(back);
  top.appendChild(el('span','pt',UI.gLevel+' '+G.lv+' · '+(G.idx+1)+' / '+lv.qs.length));
  if(G.streak>1)top.appendChild(el('span','pstreak',UI.gStreak+' ×'+G.streak));
  const hearts=el('div','hearts');
  for(let i=0;i<HEARTS;i++){
    const h=el('i',i<G.lives?'':'gone',i<G.lives?'♥':'♡');hearts.appendChild(h);
  }
  top.appendChild(hearts);
  const tr=el('div','tring'+(G.left<=8?' low':''));tr.id='tring';
  tr.appendChild(el('span','',String(game.timer?G.left:'∞')));
  top.appendChild(tr);
  host.appendChild(top);

  const body=el('div','playbody');
  const pb=el('div','pbar');const ps=el('span');ps.style.width=(G.idx/lv.qs.length*100)+'%';pb.appendChild(ps);body.appendChild(pb);
  const tg=(UI.topicOf||{})[q.block]||'web';
  const qhero=el('div','qhero');
  const flip=el('div','flipcard');
  const finner=el('div','flip-inner');
  const ffront=el('div','flip-front');
  const qdisc=el('div','qdisc');
  if(UI.topicArt&&UI.topicArt[tg]){const im=el('img','');im.src=UI.topicArt[tg];im.alt='';im.decoding='async';qdisc.appendChild(im);}
  ffront.appendChild(qdisc);
  finner.appendChild(ffront);
  const fback=el('div','flip-back');
  const bim=el('img','');bim.src='assets/coffee-cup.png';bim.alt='';bim.decoding='async';fback.appendChild(bim);
  finner.appendChild(fback);
  flip.appendChild(finner);
  flip.appendChild(el('span','qmark qmark-left','?'));
  flip.appendChild(el('span','qmark qmark-right','?'));
  qhero.appendChild(flip);
  const qhi=el('div','qhinfo');
  qhi.appendChild(el('span','qhsec',q.block));
  qhi.appendChild(el('b','qhttl',q.block_title));
  qhero.appendChild(qhi);
  body.appendChild(qhero);
  body.appendChild(el('div','playq',q.question));

  const opts=el('div','opts');
  q.options.forEach((text,i)=>{
    const L=LETTERS[i];
    const b=el('button','opt');b.type='button';b.dataset.letter=L;b.setAttribute('role','radio');
    b.appendChild(el('span','key',L));
    b.appendChild(el('span','txt',text));
    b.appendChild(el('span','mark'));
    b.addEventListener('click',()=>pick(i));
    opts.appendChild(b);
  });
  body.appendChild(opts);

  const foot=el('div','pfoot');
  const sb=el('button','sharebtn');sb.type='button';sb.title=UI.shareTitle+' · '+q.id;
  sb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7 15.7 6.3M8.3 13.3l7.4 4.4"/></svg><span>'+UI.share+'</span>';
  sb.addEventListener('click',()=>shareQuestion(q,sb));
  foot.appendChild(sb);
  const hint=el('span','src',UI.gKeyHint);hint.style.fontSize='11.5px';
  foot.appendChild(hint);
  const nx=el('button','btn gold',G.idx+1<lv.qs.length?UI.gNextQ:UI.gSeeResults);
  nx.type='button';nx.id='gNext';nx.hidden=!G.answered;
  nx.addEventListener('click',()=>nextQuestion());
  foot.appendChild(nx);
  body.appendChild(foot);
  host.appendChild(body);

  if(G.answered){applyFeedback(q);host.querySelector('#gNext').hidden=false;}
  startTimer();
}

function stopTimer(){if(G.tid){clearInterval(G.tid);G.tid=null;}}
function startTimer(){
  stopTimer();
  const tr=$('tring');if(!tr)return;
  if(!game.timer){tr.style.setProperty('--p','100');return;}
  G.left=TIME_LIMIT;updateTimer();
  G.tid=setInterval(()=>{
    G.left-=1;updateTimer();
    if(G.left<=0){stopTimer();if(!G.answered)pick(-1);}
  },1000);
}
function updateTimer(){
  const tr=$('tring');if(!tr)return;
  G.left=Math.max(0,G.left);
  tr.style.setProperty('--p',String((G.left/TIME_LIMIT)*100));
  const sp=tr.querySelector('span');if(sp)sp.textContent=String(G.left);
  tr.classList.toggle('low',G.left<=8);
}

function applyFeedback(q){
  const opts=[...document.querySelectorAll('#gamePlay .opt')];
  const correctIdx=LETTERS.indexOf(q.answer_letter);
  opts.forEach((b,i)=>{
    b.disabled=true;
    if(i===correctIdx)b.classList.add('correct');
    else if(G.picked!==''&&i===Number(G.picked))b.classList.add('wrong');
    else b.classList.add('dimmed');
    if(i===correctIdx)b.querySelector('.mark').textContent='✓';
    else if(G.picked!==''&&i===Number(G.picked))b.querySelector('.mark').textContent='✕';
  });
  const right=Number(G.picked)===correctIdx;
  const fb=el('div','gfb '+(right?'ok':'bad'));
  fb.appendChild(el('span','ic',right?'✓':'✕'));
  const txt=el('div','');
  txt.appendChild(el('span','',right?UI.correct:(G.picked===''?UI.gTimeUp:UI.correctAnswer+' '+q.answer_letter+') '+q.answer_text)));
  if(q.why){const w=el('small','',UI.whyMaps+q.why);txt.appendChild(w);}
  fb.appendChild(txt);
  document.querySelector('#gamePlay .playbody').appendChild(fb);
}

function pick(i){
  if(G.answered)return;
  G.answered=true;stopTimer();
  const lv=game.levels[G.lv-1],q=lv.qs[G.idx];
  const correctIdx=LETTERS.indexOf(q.answer_letter);
  G.picked=i<0?'':String(i);
  const right=i===correctIdx;
  G.attempts=(G.attempts||0)+1;
  if(right){G.correct++;G.streak++;}
  else{G.lives--;G.streak=0;if(i>=0)G.wrongPicks.push(i);}
  if(G.attempts===1)game.answered=(game.answered||0)+1;
  if(right)game.correct=(game.correct||0)+1;
  gstore.save();renderGameBar();updateGiftDock();
  // refresh header hearts/streak
  const top=document.querySelector('#gamePlay .playtop');
  if(top){
    const hearts=top.querySelector('.hearts');
    if(hearts){hearts.innerHTML='';for(let k=0;k<HEARTS;k++){const h=el('i',k<G.lives?'':'gone',k<G.lives?'♥':'♡');hearts.appendChild(h);}}
    const old=top.querySelector('.pstreak');
    if(old)old.remove();
    if(G.streak>1){const s=el('span','pstreak',UI.gStreak+' ×'+G.streak);top.insertBefore(s,hearts);}
  }
  const tok=G.lv+'-'+G.idx;
  const show=(kind)=>setTimeout(()=>{if(G.lv+'-'+G.idx===tok)showAnswerPopup(kind,q);},500);
  if(right){applyFeedback(q);show('correct');}
  else if(G.lives<=0){applyFeedback(q);show('out');}
  else if(i<0){applyFeedback(q);show('timeup');}
  else{markWrongOnly(i);show('retry');}
}

/* ---------- answer popup: correct -> next question / wrong -> try again ---------- */
let apopEl=null;
function ensurePopup(){
  if(apopEl)return apopEl;
  const ov=el('div','apop-overlay');ov.id='answerPop';ov.hidden=true;
  const card=el('div','apop-card');
  card.appendChild(el('div','apop-ic'));
  card.appendChild(el('h3','apop-tt'));
  card.appendChild(el('p','apop-sub'));
  const btn=el('button','btn gold apop-btn');btn.type='button';
  btn.addEventListener('click',()=>{
    const act=ov.dataset.act;
    hideAnswerPopup();
    if(act==='retry')retryQuestion();
    else if(act==='finish')finishLevel(false);
    else nextQuestion();
  });
  card.appendChild(btn);
  ov.appendChild(card);
  document.body.appendChild(ov);
  apopEl=ov;
  return ov;
}
function hideAnswerPopup(){if(apopEl)apopEl.hidden=true;}
function showAnswerPopup(kind,q){
  const p=ensurePopup();
  const card=p.querySelector('.apop-card');
  const ic=p.querySelector('.apop-ic'),tt=p.querySelector('.apop-tt'),sub=p.querySelector('.apop-sub'),btn=p.querySelector('.apop-btn');
  const lv=game.levels[G.lv-1];
  const isLast=G.idx+1>=lv.qs.length;
  card.className='apop-card '+(kind==='correct'?'ok':'bad');
  sub.innerHTML='';
  if(kind==='correct'){
    ic.textContent='✓';
    tt.textContent=UI.gCorrectPop+(G.streak>1?' · '+UI.gStreak+' ×'+G.streak:'');
    if(q.why)sub.textContent=UI.whyMaps+q.why;
    btn.textContent=isLast?UI.gSeeResults:UI.gNextQ+' →';
    p.dataset.act='next';
  }else if(kind==='retry'){
    ic.textContent='✕';
    tt.textContent=UI.gWrongPop;
    sub.textContent=UI.gRemovedHint+' ';
    const hh=el('span','apop-hearts','♥'.repeat(Math.max(0,G.lives)));sub.appendChild(hh);
    btn.textContent=UI.gTryAgainBtn;
    p.dataset.act='retry';
  }else if(kind==='out'){
    ic.textContent='✕';
    tt.textContent=UI.gOutLivesPop;
    sub.textContent=UI.correctAnswer+' '+q.answer_letter+') '+q.answer_text;
    btn.textContent=UI.gSeeResults;
    p.dataset.act='finish';
  }else{
    ic.textContent='⏰';
    tt.textContent=UI.gTimeUp;
    sub.textContent=UI.correctAnswer+' '+q.answer_letter+') '+q.answer_text;
    btn.textContent=isLast?UI.gSeeResults:UI.gNextQ+' →';
    p.dataset.act='next';
  }
  p.hidden=false;
}
function markWrongOnly(i){
  const opts=document.querySelectorAll('#gamePlay .opt');
  opts.forEach((b,k)=>{
    if(k===i){b.disabled=true;b.classList.add('wrong');const m=b.querySelector('.mark');if(m)m.textContent='✕';}
  });
}
function retryQuestion(){
  G.answered=false;G.picked='';
  const opts=document.querySelectorAll('#gamePlay .opt');
  opts.forEach((b,k)=>{
    const wasWrong=G.wrongPicks.includes(k);
    b.disabled=wasWrong;
    b.classList.toggle('wrong',wasWrong);
    b.classList.remove('correct','dimmed');
    const m=b.querySelector('.mark');if(m)m.textContent=wasWrong?'✕':'';
  });
  const fb=document.querySelector('#gamePlay .gfb');if(fb)fb.remove();
  const nx=$('gNext');if(nx)nx.hidden=true;
  startTimer();
}

function nextQuestion(){
  const lv=game.levels[G.lv-1];
  if(G.lives<=0){finishLevel(false);return;}
  if(G.idx+1<lv.qs.length){G.idx++;G.answered=false;G.picked='';G.wrongPicks=[];G.attempts=0;renderPlay();window.scrollTo({top:0,behavior:'smooth'});}
  else finishLevel(true);
}

/* ===== Prize reveal: chosen mystery card bursts open, prize by score ===== */
const PRIZE_POOL=[
  {amt:360,label:'Grand Prize',gadget:{icon:'📱',name:'Smartphone'}},
  {amt:200,label:'Mega Prize',gadget:{icon:'🎧',name:'Wireless Headphones'}},
  {amt:150,label:'Super Prize',gadget:{icon:'⌚',name:'Smart Watch'}},
  {amt:100,label:'Big Prize',gadget:{icon:'🎮',name:'Game Controller'}},
  {amt:80,label:'Great Prize',gadget:{icon:'🔊',name:'Bluetooth Speaker'}},
  {amt:50,label:'Nice Prize',gadget:{icon:'💡',name:'Smart Lamp'}},
  {amt:30,label:'Good Prize',gadget:{icon:'🎒',name:'Travel Backpack'}},
  {amt:20,label:'Lucky Prize',gadget:{icon:'☕',name:'Coffee Mug Set'}},
  {amt:10,label:'Starter Prize',gadget:{icon:'🎁',name:'Surprise Box'}}
];
function prizeForScore(acc){
  if(acc>=1) return PRIZE_POOL[0];
  if(acc>=0.9) return PRIZE_POOL[1];
  if(acc>=0.8) return PRIZE_POOL[2];
  if(acc>=0.7) return PRIZE_POOL[3];
  if(acc>=0.6) return PRIZE_POOL[4];
  if(acc>=0.5) return PRIZE_POOL[5];
  if(acc>=0.4) return PRIZE_POOL[6];
  if(acc>=0.3) return PRIZE_POOL[7];
  return PRIZE_POOL[8];
}
function burstParticles(container){
  if(!container) return;
  const colors=['#FFCE1B','#FFE082','#FFB300','#4FC3F7','#CE93D8','#fff','#2ECC71'];
  for(let i=0;i<36;i++){
    const p=document.createElement('span');
    p.className='prize-particle';
    p.style.background=colors[i%colors.length];
    p.style.left='50%';p.style.top='42%';
    if(i%3===0)p.style.borderRadius='50%';
    container.appendChild(p);
    const ang=(Math.PI*2*i)/36+Math.random()*.4;
    const dist=120+Math.random()*220;
    const dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist-60;
    p.animate([
      {transform:'translate(0,0) rotate(0deg) scale(1)',opacity:1},
      {transform:`translate(${dx}px,${dy+160}px) rotate(${Math.random()*540-270}deg) scale(.4)`,opacity:0}
    ],{duration:1100+Math.random()*700,easing:'cubic-bezier(.17,.67,.35,1)',delay:Math.random()*150}).onfinish=()=>p.remove();
  }
}
function showPrizeReveal(acc){
  const overlay=$('prizeOverlay');
  if(!overlay||overlay.dataset.shown)return;
  overlay.dataset.shown='1';
  const prize=prizeForScore(acc);
  $('prizeAmount').textContent='RM '+prize.amt;
  $('prizeSub').textContent=prize.label+' · Malaysia Prize Bond';
  $('prizeScore').textContent='Score: '+Math.round(acc*100)+'%';
  const gad=$('prizeGadget');
  if(prize.gadget&&acc>=0.7){
    gad.hidden=false;
    $('prizeGadgetIcon').textContent=prize.gadget.icon;
    $('prizeGadgetName').textContent='+ '+prize.gadget.name;
  } else gad.hidden=true;
  overlay.hidden=false;
  document.body.style.overflow='hidden';
  burstParticles($('prizeBurst'));
  $('prizeClose').onclick=()=>{
    overlay.hidden=true;
    overlay.dataset.shown='';
    document.body.style.overflow='';
  };
}

function finishLevel(reachedEnd){
  stopTimer();
  const lv=game.levels[G.lv-1],total=lv.qs.length,acc=G.correct/total;
  if(window.__chosenPrizeCard){setTimeout(()=>showPrizeReveal(acc),900);}
  let stars=0;
  if(reachedEnd&&G.lives>0){ if(acc===1&&G.lives===HEARTS)stars=3; else if(acc>=0.8)stars=2; else if(acc>=0.6)stars=1; }
  const gained=G.correct*10+(stars===3?30:stars===2?15:stars===1?5:0);
  const prevBest=game.best[lv.n]||0;
  const delta=Math.max(0,gained-prevBest);
  game.xp+=delta;game.best[lv.n]=Math.max(prevBest,gained);
  game.stars[lv.n]=Math.max(game.stars[lv.n]||0,stars);
  if(stars>0&&lv.n+1>game.unlocked&&lv.n<game.levels.length)game.unlocked=lv.n+1;
  gstore.save();renderGameBar();

  $('gamePlay').hidden=true;
  const host=$('gameResult');host.hidden=false;host.innerHTML='';
  const rt=el('div','');
  const bs=el('div','bigstars');
  for(let i=0;i<3;i++){if(i<stars)bs.appendChild(el('span','','★'));else bs.appendChild(el('span','off','☆'));}
  rt.appendChild(bs);
  const passed=stars>0;
  rt.appendChild(el('h2','',passed?(stars===3?UI.gPerfect:stars===2?UI.gGreat:UI.gPassed):(G.lives<=0?UI.gFailedHearts:UI.gFailed)));
  rt.appendChild(el('p','rsub',UI.gLevel+' '+lv.n+' · '+(UI.gLevels||'')+' '+(game.unlocked-1)+'/'+game.levels.length));
  const grid=el('div','rgrid');
  [[G.correct+' / '+total,UI.gCorrectWord],[Math.round(acc*100)+'%',UI.gAccuracy],['+'+delta,UI.gXPEarned],[rankInfo().n+' · '+rankInfo().title,UI.gRank]].forEach(([b,l])=>{
    const d=el('div','');d.appendChild(el('b','',b));d.appendChild(el('span','',l));grid.appendChild(d);
  });
  rt.appendChild(grid);
  const btns=el('div','rbtns');
  const retry=el('button','btn ghost',UI.gRetry);retry.type='button';
  retry.addEventListener('click',()=>openLevel(lv.n));
  btns.appendChild(retry);
  if(passed&&lv.n<game.levels.length){
    const nxt=el('button','btn gold',UI.gNextLevel+' →');nxt.type='button';
    nxt.addEventListener('click',()=>openLevel(lv.n+1));
    btns.appendChild(nxt);
  }
  const map=el('button','btn ghost',UI.gBack);map.type='button';map.addEventListener('click',()=>openMap());
  btns.appendChild(map);
  rt.appendChild(btns);
  host.appendChild(rt);
  window.scrollTo({top:0,behavior:'smooth'});
  if(passed&&stars===3)toast(UI.gPerfectToast);
}

function gameKeys(e){
  if(!document.body.classList.contains('mode-game'))return false;
  if($('gamePlay').hidden)return false;
  if(['1','2','3','4'].includes(e.key)){
    if(!G.answered){const i=Number(e.key)-1;
      const lv=game.levels[G.lv-1],q=lv.qs[G.idx];
      if(q&&q.options[i]){e.preventDefault();pick(i);}
    }
    return true;
  }
  if(e.key==='Enter'){
    const p=$('answerPop');
    if(p&&!p.hidden){e.preventDefault();p.querySelector('.apop-btn').click();return true;}
    if(G.answered){e.preventDefault();nextQuestion();return true;}
  }
  if(e.key==='Escape'){openMap();return true;}
  return false;
}

function initGame(){
  buildLevels();gstore.load();
  $('tabGame').addEventListener('click',()=>setMode('game'));
  $('tabBrowse').addEventListener('click',()=>setMode('browse'));
  $('tabDesign').addEventListener('click',()=>setMode('design'));
  renderGameBar();renderMap();
  let m='game';
  try{m=localStorage.getItem('amQuizMode')||'game';}catch(e){}
  if(!/^#Q\d{4}$/.test(location.hash||''))setMode(m==='browse'?'browse':'game');
  document.addEventListener('keydown',e=>{
    if(e.target&&['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
    if(gameKeys(e)){e.stopPropagation();}
  },true);
}

/* ---------- boot ---------- */
try{const th=localStorage.getItem('amQuizTheme');if(th==='dark'){document.documentElement.setAttribute('data-theme','dark');$('themeTxt').textContent=UI.lightMode;$('themeBtn').setAttribute('aria-pressed','true');}}catch(e){}

/* ---------- brands + 3D depth ---------- */
function slugOf(n){return String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function svgUse(name){
  const ns='http://www.w3.org/2000/svg';const sv=document.createElementNS(ns,'svg');
  sv.setAttribute('viewBox','0 0 64 64');sv.setAttribute('aria-hidden','true');
  const u=document.createElementNS(ns,'use');u.setAttribute('href','#bi-'+slugOf(name));
  sv.appendChild(u);return sv;
}
function brandOf(text){
  const list=(UI.brands||[]);
  return list.find(b=>String(text).includes(b))||null;
}
function initDepth(){
  if(!(window.matchMedia&&matchMedia('(pointer:fine)').matches&&matchMedia('(hover:hover)').matches))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const SEL='.qcard,.ltile';
  document.addEventListener('pointermove',e=>{
    const c=e.target&&e.target.closest?e.target.closest(SEL):null;if(!c)return;
    const r=c.getBoundingClientRect();if(!r.width)return;
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.setProperty('--ry',(x*6).toFixed(2)+'deg');
    c.style.setProperty('--rx',(-y*5).toFixed(2)+'deg');
  });
  document.addEventListener('pointerout',e=>{
    const c=e.target&&e.target.closest?e.target.closest(SEL):null;
    if(c&&!c.contains(e.relatedTarget)){c.style.removeProperty('--rx');c.style.removeProperty('--ry');}
  });
}
const CHAP_ART=UI.chapArt||[],CHAP_THEME=UI.chapTheme||[];
let openChap=null;
store.load();initHero();buildPills();initControls();buildFolds();buildChips();render();initShare();initGame();initSettings();initDepth();goToHash();
window.addEventListener('hashchange',goToHash);
})();
