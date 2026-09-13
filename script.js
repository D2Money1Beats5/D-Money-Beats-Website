const beats=[
  {title:'What A Time',bpm:164,duration:'2:01',file:'assets/audio/what-a-time-preview.mp3'},
  {title:'All Set',bpm:160,duration:'3:12',file:'assets/audio/all-set-preview.mp3'},
  {title:'Balance',bpm:151,duration:'2:58',file:'assets/audio/balance-preview.mp3'},
  {title:'Decepticons',bpm:146,duration:'2:25',file:'assets/audio/decepticons-preview.mp3'},
  {title:'How Its Done',bpm:151,duration:'2:45',file:'assets/audio/how-its-done-preview.mp3'},
  {title:'Inna Glitch',bpm:140,duration:'2:03',file:'assets/audio/inna-glitch-preview.mp3'},
  {title:'Let Me Vent Bxsh',bpm:164,duration:'3:19',file:'assets/audio/let-me-vent-bxsh-preview.mp3'},
  {title:'We Had Pipes In A Bag',bpm:130,duration:'2:28',file:'assets/audio/we-had-pipes-in-a-bag-preview.mp3'},
  {title:'Young Sizzle',bpm:154,duration:'2:03',file:'assets/audio/young-sizzle-preview.mp3'}
];

const productNames={
  mp3:'MP3 Lease — $29.99',wav:'WAV Lease — $49.99',trackouts:'Trackouts — $99.99',unlimited:'Unlimited — $199.99',
  'bundle-mp3-3':'3 MP3 Bundle — $69.99','bundle-wav-3':'3 WAV Bundle — $119.99',
  mixing:'Mixing — $99.99',mastering:'Mastering — $49.99','mix-master':'Mix + Master — $129.99'
};

const player=document.getElementById('audioPlayer');
const playPause=document.getElementById('playPause');
const progress=document.getElementById('progress');
const autoplayNote=document.getElementById('autoplayNote');
let current=0;
let attemptedIntroAudio=false;
const saved=new Set(JSON.parse(localStorage.getItem('dmoneySaved')||'[]'));

function esc(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60);return `${m}:${String(s).padStart(2,'0')}`}
function pulseVapor(){const el=document.getElementById('featuredPlayer');el.classList.add('vapor');setTimeout(()=>el.classList.remove('vapor'),700)}

function setTrack(i,autoplay=false){
  current=(i+beats.length)%beats.length;
  const b=beats[current];
  player.src=b.file;
  document.getElementById('featuredTitle').textContent=b.title;
  document.getElementById('featuredDetails').textContent=`${b.bpm} BPM · 60-second preview`;
  progress.value=0;
  document.getElementById('currentTime').textContent='0:00';
  playPause.textContent='▶';
  document.getElementById('saveFeatured').setAttribute('aria-pressed',saved.has(b.title));
  document.getElementById('saveFeatured').textContent=saved.has(b.title)?'♥ Saved':'♡ Save';
  if(autoplay)player.play().then(()=>{playPause.textContent='Ⅱ';if(autoplayNote)autoplayNote.textContent=''}).catch(()=>{if(autoplayNote)autoplayNote.textContent='Tap play to start audio — your browser blocked automatic sound.'});
  pulseVapor();
}

function togglePlay(){
  if(player.paused){player.play().then(()=>{playPause.textContent='Ⅱ';if(autoplayNote)autoplayNote.textContent=''}).catch(()=>{playPause.textContent='▶';if(autoplayNote)autoplayNote.textContent='Tap play again to start audio.'})}
  else{player.pause();playPause.textContent='▶'}
}

async function attemptPostIntroAudio(){
  if(attemptedIntroAudio||!player.paused)return;
  attemptedIntroAudio=true;
  try{await player.play();playPause.textContent='Ⅱ';if(autoplayNote)autoplayNote.textContent=''}
  catch{if(autoplayNote)autoplayNote.textContent='Audio is ready — tap play if your browser blocks automatic sound.'}
}

function toggleSave(title){saved.has(title)?saved.delete(title):saved.add(title);localStorage.setItem('dmoneySaved',JSON.stringify([...saved]));renderBeats();setTrack(current,false)}
function renderBeats(){document.getElementById('beatGrid').innerHTML=beats.map((b,i)=>`<article class="beat-card"><button class="heart ${saved.has(b.title)?'saved':''}" aria-label="${saved.has(b.title)?'Remove':'Save'} ${esc(b.title)}" data-save="${i}">${saved.has(b.title)?'♥':'♡'}</button><p class="eyebrow">${String(i+1).padStart(2,'0')} / 09</p><h3>${esc(b.title)}</h3><p class="beat-meta">${b.bpm} BPM · ${b.duration} full length</p><div class="beat-actions"><button class="button ghost" data-play="${i}">Play preview</button><button class="button primary" data-license="${i}">License</button></div></article>`).join('')}

renderBeats();
setTrack(0);
playPause.addEventListener('click',togglePlay);
document.getElementById('prevBeat').addEventListener('click',()=>setTrack(current-1,true));
document.getElementById('nextBeat').addEventListener('click',()=>setTrack(current+1,true));
player.addEventListener('timeupdate',()=>{progress.value=Math.min(60,player.currentTime);document.getElementById('currentTime').textContent=fmt(player.currentTime);if(player.currentTime>=60){player.pause();player.currentTime=0;playPause.textContent='▶'}});
progress.addEventListener('input',()=>player.currentTime=Number(progress.value));
document.getElementById('saveFeatured').addEventListener('click',()=>toggleSave(beats[current].title));
document.getElementById('beatGrid').addEventListener('click',e=>{const p=e.target.closest('[data-play]'),s=e.target.closest('[data-save]'),l=e.target.closest('[data-license]');if(p)setTrack(Number(p.dataset.play),true);if(s)toggleSave(beats[Number(s.dataset.save)].title);if(l)openPurchase('mp3',Number(l.dataset.license))});

const intro=document.getElementById('introFog');
function runIntro(){intro.classList.remove('hide');intro.style.display='block';attemptedIntroAudio=false;setTimeout(()=>intro.classList.add('hide'),1850);setTimeout(()=>{intro.style.display='none';attemptPostIntroAudio()},2700)}
if(sessionStorage.getItem('dmoneyIntroSeen')){intro.style.display='none';setTimeout(attemptPostIntroAudio,450)}
else{sessionStorage.setItem('dmoneyIntroSeen','1');runIntro()}
document.getElementById('replayIntro').addEventListener('click',runIntro);

function scheduleLightning(){setTimeout(()=>{const l=document.getElementById('lightning');l.classList.add('flash');setTimeout(()=>l.classList.remove('flash'),500);scheduleLightning()},8000+Math.random()*14000)}
scheduleLightning();

const menu=document.getElementById('menuButton'),nav=document.getElementById('siteNav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
nav.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')});

const dialog=document.getElementById('purchaseDialog');
const purchaseBody=document.getElementById('purchaseBody');
const purchaseTitle=document.getElementById('purchaseTitle');
const checkoutStatus=document.getElementById('checkoutStatus');
const checkoutButton=document.getElementById('checkoutButton');
let pending={product:null,beats:[]};

function beatSelectMarkup(selected=current){return `<label>Beat<select id="beatSelect">${beats.map((b,i)=>`<option value="${esc(b.title)}" ${i===selected?'selected':''}>${esc(b.title)} · ${b.bpm} BPM</option>`).join('')}</select></label>`}
function bundleMarkup(){return `<p>Select exactly three beats for this bundle.</p><div class="bundle-choices">${beats.map((b,i)=>`<label><input type="checkbox" name="bundleBeat" value="${esc(b.title)}" ${i<3?'checked':''}> ${esc(b.title)}</label>`).join('')}</div>`}
function openPurchase(product,selected=current){pending={product,beats:[]};purchaseTitle.textContent=productNames[product]||'Checkout';checkoutStatus.textContent='';checkoutButton.disabled=false;checkoutButton.textContent='Continue to secure checkout';document.getElementById('termsCheck').checked=false;if(product.startsWith('bundle-'))purchaseBody.innerHTML=bundleMarkup();else if(['mixing','mastering','mix-master'].includes(product))purchaseBody.innerHTML='<p>After verified payment, your confirmation page will show the paid order record and the project-submission next step for your service.</p>';else purchaseBody.innerHTML=beatSelectMarkup(selected);dialog.showModal()}

document.querySelectorAll('.buy-button').forEach(b=>b.addEventListener('click',()=>openPurchase(b.dataset.product)));
document.querySelectorAll('.bundle-button').forEach(b=>b.addEventListener('click',()=>openPurchase(b.dataset.product)));
document.querySelectorAll('.service-button').forEach(b=>b.addEventListener('click',()=>openPurchase(b.dataset.product)));

checkoutButton.addEventListener('click',async()=>{
  if(!document.getElementById('termsCheck').checked){checkoutStatus.textContent='Please accept the terms before continuing.';return}
  let chosen=[];
  if(pending.product.startsWith('bundle-')){chosen=[...document.querySelectorAll('input[name="bundleBeat"]:checked')].map(x=>x.value);if(chosen.length!==3){checkoutStatus.textContent='Choose exactly three beats for the bundle.';return}}
  else{const select=document.getElementById('beatSelect');if(select)chosen=[select.value]}
  checkoutButton.disabled=true;checkoutButton.textContent='Opening Stripe…';checkoutStatus.textContent='Creating secure checkout…';
  try{
    const r=await fetch('/api/create-checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({product:pending.product,beats:chosen,termsAccepted:true,licenseVersion:'2026-09-13'})});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||'Checkout is not ready yet.');
    if(data.url)location.href=data.url;else throw new Error('Checkout URL missing.');
  }catch(err){checkoutStatus.textContent=err.message||'Checkout is temporarily unavailable.';checkoutButton.disabled=false;checkoutButton.textContent='Continue to secure checkout'}
});

async function submitEndpoint(form,statusEl,endpoint){statusEl.textContent='Sending…';const payload=Object.fromEntries(new FormData(form).entries());try{const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Unable to send right now.');form.reset();statusEl.textContent=d.message||'Received.'}catch(e){statusEl.textContent=e.message}}

document.getElementById('freeBeatForm').addEventListener('submit',e=>{e.preventDefault();submitEndpoint(e.currentTarget,document.getElementById('freeBeatStatus'),'/api/free-beat')});
document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();submitEndpoint(e.currentTarget,document.getElementById('contactStatus'),'/api/contact')});
document.querySelectorAll('.socials a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));