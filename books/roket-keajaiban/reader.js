(() => {
 'use strict';
 const ORIGINAL = window.ROKET_BOOK_DATA;
 if (!ORIGINAL || !Array.isArray(ORIGINAL.pages) || ORIGINAL.pages.length !== 5) throw new Error('Data buku Roket tidak lengkap.');
 const EDIT_KEY = 'smartlibverse_roket_edits_urbanist_v1';
 const READ_KEY = 'smartlibverse_roket_read_v1';
 const clone = data => JSON.parse(JSON.stringify(data));
 let book = clone(ORIGINAL);
 let current = 0;
 let editing = false;
 let fontScale = 1;
 const visited = new Set([0]);
 const $ = id => document.getElementById(id);
 const reader = $('reader'), page = $('page');
 // These eight source crops cut off pupils before rendering. Use recomposed
 // landscape artwork; keep the original assets and editable book copy intact.
 const characterArt = Object.freeze({
   'intro-kids-1': 'Murid lelaki menunjuk ke roket dan murid perempuan memerhatikannya; kedua-dua wajah kelihatan penuh.',
   'intro-kids-2': 'Dua murid berbincang tentang satelit dan roket di hadapan Bumi; wajah dan gerak tangan jelas.',
   'intro-kids-3': 'Dua murid memerhatikan roket dengan nyalaan tujahan; kepala dan tangan mereka kelihatan penuh.',
   'intro-kids-4': 'Dua murid memandang Bumi dan angkasa dengan kagum; kedua-dua wajah kelihatan penuh.',
   'parts-kids-a': 'Murid lelaki bertanya sambil menunjuk ke atas dan murid perempuan berfikir tentang roket.',
   'parts-kids-b': 'Murid perempuan menerangkan tujahan roket dengan gerak tangan dan murid lelaki mendengar.',
   'parts-kids-c': 'Murid perempuan menerangkan bahagian roket dan murid lelaki mendengar sambil bersilang tangan.',
   'parts-kids-d': 'Dua murid berbincang tentang badan dan enjin roket; wajah dan gerak tangan kelihatan jelas.'
 });
 const art = (name,alt,cls='') => {
   const restored=Object.hasOwn(characterArt,name);
   return `<img class="img ${cls}" src="art/${name}${restored?'-v2':''}.webp" alt="${restored?characterArt[name]:alt}" ${restored?'width="1200" height="800" data-character-art="v2" ':''}loading="lazy" decoding="async">`;
 };
 const slot = (path,tag='span',cls='') => `<${tag} class="${cls}" data-field="${path}"></${tag}>`;
 const get = (obj,path) => path.split('.').reduce((cur,key)=>cur?.[key],obj);
 const set = (obj,path,value) => {let parts=path.split('.'),t=obj;for(let i=0;i<parts.length-1;i++)t=t[parts[i]];t[parts.at(-1)]=value;};
 const note = (s,edit=false) => {const el=$('message');el.textContent=s;el.classList.toggle('editing-message',edit)};
 const save = () => {try{localStorage.setItem(EDIT_KEY,JSON.stringify(book));return true;}catch {return false;}};
 const isSafeBook = value => {if(!value||!Array.isArray(value.pages)||value.pages.length!==5)return false;return value.pages.every((p,i)=>p && p.type===ORIGINAL.pages[i].type);};
 function mergeText(template, incoming){
   if (typeof template==='string'){const text=typeof incoming==='string'?incoming.slice(0,2000):'';return text.trim()?text:template;}
   if (Array.isArray(template))return template.map((x,i)=>mergeText(x,incoming?.[i]));
   if(template&&typeof template==='object'){const out={};for(const k of Object.keys(template))out[k]=mergeText(template[k],incoming?.[k]);return out;}
   return template;
 }
 try{const raw=JSON.parse(localStorage.getItem(EDIT_KEY)||'null');if(isSafeBook(raw))book=mergeText(ORIGINAL,raw);}catch{}
 function layout(i){
   const p=book.pages[i];
   const header=`<div class="motif" aria-hidden="true">✧ ❁ ✧</div><div class="pagehead"><h2>${slot('pages.'+i+'.title')}</h2>${p.subtitle && !['launch','benefits'].includes(p.type) ?slot('pages.'+i+'.subtitle','div','subtitle'):''}</div>`;
   const num=`<div class="pagenum" aria-label="Halaman ${i+1}"><span>${i+1}</span></div>`;
   if(p.type==='cover')return `<section class="covermain"><div class="motif" aria-hidden="true">✦ ❁ ✦</div>${slot('pages.0.title','h2')}${slot('pages.0.subtitle','h3')}<div class="introtext">${slot('pages.0.collection')}</div><div class="hero-frame">${art('cover-hero','Dua murid memerhatikan roket dilancarkan ke angkasa','cover-hero')}</div><div class="framebox">${slot('pages.0.caption','div','coverbottom')}</div></section>${num}`;
   if(p.type==='intro')return header+`<div class="introtext" style="display:block;text-align:center;margin:0 auto 12px">${slot('pages.1.collection')}</div><div class="two-cols"><div>${art('intro-launchpad','Roket dan menara pelancaran di bawah langit berbintang','illustration')}</div><div class="facts">${p.facts.map((_,n)=>`<div class="framebox fact"><span class="num">${n+1}</span>${slot('pages.1.facts.'+n)}</div>`).join('')}</div></div><h3 class="section-heading">${slot('pages.1.conversationTitle')}</h3><div class="comic-grid">${p.conversations.map((_,n)=>`<div class="comic">${art('intro-kids-'+(n+1),'Murid berbincang tentang roket')}<div class="text">${slot('pages.1.conversations.'+n)}</div></div>`).join('')}</div><section class="framebox cream bottombox"><h3>${slot('pages.1.lessonTitle')}</h3><p>${slot('pages.1.lesson')}</p></section>${num}`;
   if(p.type==='parts')return header+`<div class="parts-layout"><div>${art('parts-rocket','Rajah roket dan komponennya','rocket-image')}</div><div class="parts-list">${p.parts.map((_,n)=>`<div class="part"><strong>${slot('pages.2.parts.'+n+'.title')}</strong><span>${slot('pages.2.parts.'+n+'.detail')}</span></div>`).join('')}</div></div><h3 class="section-heading">${slot('pages.2.conversationTitle')}</h3><div class="comic-grid">${p.conversations.map((_,n)=>`<div class="comic">${art(['parts-kids-a','parts-kids-b','parts-kids-c','parts-kids-d'][n],'Murid menerangkan fungsi roket')}<div class="text">${slot('pages.2.conversations.'+n)}</div></div>`).join('')}</div><section class="framebox bottombox"><h3>${slot('pages.2.summaryTitle')}</h3><p>${slot('pages.2.summary')}</p></section>${num}`;
   if(p.type==='launch')return header+`<div class="introtext" style="display:block;text-align:center;margin:0 auto 13px">${slot('pages.3.subtitle')}</div><div class="launch-layout"><div class="steps">${p.steps.map((_,n)=>`<div class="step">${art('launch-step-'+(n+1),'Ilustrasi langkah pelancaran roket '+(n+1))}<div class="step-title"><span class="step-num">${n+1}</span>${slot('pages.3.steps.'+n)}</div>${n===1?`<div class="countdown">${slot('pages.3.countdownTitle','div')}<strong>${slot('pages.3.countdown')}</strong>${slot('pages.3.countdownSequence','div')}</div>`:''}</div>`).join('')}</div>${art('launch-hero','Roket sedang berlepas dengan cahaya enjin dan dua murid','launch-large')}</div><section class="framebox cream bottombox"><h3>${slot('pages.3.lessonTitle')}</h3><p>${slot('pages.3.lesson')}</p></section>${num}`;
   return header+`<div class="introtext" style="display:block;text-align:center;margin:0 auto 13px">${slot('pages.4.subtitle')}</div><div class="benefits-grid">${p.benefits.map((_,n)=>`<div class="benefit">${art(['benefit-comms','benefit-weather','benefit-gps','benefit-space'][n],'Ilustrasi manfaat roket '+(n+1))}<div class="benefit-text"><h3><span class="insignia">${n+1}.</span> ${slot('pages.4.benefits.'+n+'.title')}</h3><p>${slot('pages.4.benefits.'+n+'.detail')}</p></div></div>`).join('')}</div><section class="framebox cream bottombox"><h3>${slot('pages.4.lessonTitle')}</h3><p>${slot('pages.4.lesson')}</p></section><section class="framebox bottombox"><h3>${slot('pages.4.summaryTitle')}</h3><p>${slot('pages.4.summary')}</p></section>${num}`;
 }
 function showPage(index){
   if(index<0||index>=5)return;
   current=index;visited.add(index);
   page.classList.remove('page-swipe');void page.offsetWidth;page.classList.add('page-swipe');
   page.dataset.pageType=book.pages[index].type;
   page.innerHTML=layout(index);page.querySelectorAll('[data-field]').forEach(el=>{el.textContent=get(book,el.dataset.field)||'';el.contentEditable=editing?'true':'false';el.spellcheck=editing;if(editing){el.setAttribute('role','textbox');el.setAttribute('aria-multiline','true');el.setAttribute('aria-label','Sunting teks: '+get(ORIGINAL,el.dataset.field).slice(0,120));}});
   page.style.setProperty('--scale',fontScale);
   $('pageLabel').textContent=`Halaman ${index+1} / 5`;
   $('progressText').textContent=`${index+1} daripada 5 halaman`;
   $('prev').disabled=index===0;$('next').disabled=index===4;
   $('dots').innerHTML=Array.from({length:5},(_,n)=>`<button data-page="${n}" aria-label="Pergi ke halaman ${n+1}" class="${n===index?'active':''}" ${n===index?'aria-current="page"':''}></button>`).join('');
   for(const el of $('dots').querySelectorAll('button'))el.onclick=()=>showPage(Number(el.dataset.page));
   const completed=visited.size===5;
   $('done').disabled=!completed;
   $('completionHint').textContent=completed?'Semua halaman telah dilawati. Tekan Tamat Membaca.':`${visited.size} / 5 halaman dilawati.`;
   if(!editing)note('Halaman '+(index+1)+' / 5 · Leret atau gunakan butang untuk menyelak.');
 }
 page.addEventListener('input',evt=>{if(!editing)return;const node=evt.target.closest('[data-field]');if(!node)return;const text=node.textContent.slice(0,2000);if(node.textContent.length>2000)node.textContent=text;set(book,node.dataset.field,text);note(save()?'Perubahan teks disimpan pada pelayar. Eksport JSON untuk diberikan kepada Codex.':'Suntingan tidak dapat disimpan dalam pelayar. Gunakan Eksport JSON.',true);});
 // Keep pasted copy as text, matching JSON import's textContent rendering.
 page.addEventListener('paste',evt=>{if(!editing)return;const node=evt.target.closest('[data-field]');if(!node||!evt.clipboardData)return;evt.preventDefault();const selection=window.getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);if(!node.contains(range.commonAncestorContainer))return;range.deleteContents();const text=document.createTextNode(evt.clipboardData.getData('text/plain'));range.insertNode(text);range.setStartAfter(text);range.collapse(true);selection.removeAllRanges();selection.addRange(range);node.dispatchEvent(new Event('input',{bubbles:true}));});
 $('prev').onclick=()=>showPage(current-1);$('next').onclick=()=>showPage(current+1);
 $('editToggle').onclick=()=>{
   editing=!editing;let restored=false,saved=true;
   if(!editing){const valid=mergeText(ORIGINAL,book);restored=JSON.stringify(valid)!==JSON.stringify(book);book=valid;if(restored)saved=save();}
   reader.classList.toggle('editing',editing);$('editToggle').setAttribute('aria-pressed',String(editing));$('editToggle').textContent=editing?'✓ Selesai edit':'✎ Edit teks';showPage(current);
   note(editing?'Mod suntingan aktif: sentuh teks untuk mengedit; gunakan Eksport JSON untuk menyimpan fail.':restored?(saved?'Ruang teks kosong telah dipulihkan dengan teks asal.':'Ruang teks kosong dipulihkan untuk sesi ini. Gunakan Eksport JSON untuk menyimpan fail.'):'Mod bacaan aktif.',editing||!saved);
 };
 $('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(book,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ROKET_Teks_Urbanist_Editable.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
 $('importBtn').onclick=()=>$('importFile').click();
 $('importFile').onchange=async(evt)=>{try{const file=evt.target.files?.[0];if(!file)return;if(file.size>150000)throw Error('Fail JSON terlalu besar.');const raw=JSON.parse(await file.text());if(!isSafeBook(raw))throw Error('Struktur fail tidak sepadan dengan buku lima halaman.');book=mergeText(ORIGINAL,raw);const saved=save();showPage(current);note(saved?'Teks berjaya diimport. Tiada ilustrasi diubah.':'Teks diimport untuk sesi ini sahaja. Pelayar tidak dapat menyimpan suntingan; gunakan Eksport JSON.',!saved);}catch(e){note('Import gagal: '+e.message,true);}finally{evt.target.value='';}};
 $('resetBtn').onclick=()=>{if(!confirm('Pulihkan semua teks asal? Suntingan tempatan akan dipadam.'))return;book=clone(ORIGINAL);try{localStorage.removeItem(EDIT_KEY)}catch{}showPage(current);note('Semua teks asal telah dipulihkan.');};
 $('zoomIn').onclick=()=>{fontScale=Math.min(1.4,Math.round((fontScale+.1)*10)/10);page.style.setProperty('--scale',fontScale);};
 $('zoomOut').onclick=()=>{fontScale=Math.max(.8,Math.round((fontScale-.1)*10)/10);page.style.setProperty('--scale',fontScale);};
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(reader.requestFullscreen)await reader.requestFullscreen();else note('Skrin penuh tidak disokong oleh pelayar ini.');}catch{note('Skrin penuh tidak tersedia. Pembaca masih boleh digunakan.');}};
 document.addEventListener('fullscreenchange',()=>$('fullscreen').setAttribute('aria-pressed',String(document.fullscreenElement===reader)));
 $('done').onclick=()=>{if(visited.size!==5)return;try{localStorage.setItem(READ_KEY,JSON.stringify({completed:true,at:new Date().toISOString(),book:'roket-keajaiban'}));note('Tahniah! Semua lima halaman telah dibaca. Rekod ini disimpan pada pelayar sahaja, bukan dalam NILAM rasmi.');}catch{note('Semua lima halaman telah dibaca. Rekod tidak dapat disimpan dalam pelayar ini.',true);}};
 let touchX=null,touchY=null;
 page.addEventListener('touchstart',e=>{touchX=touchY=null;if(editing||e.touches.length!==1)return;touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;},{passive:true});
 page.addEventListener('touchcancel',()=>{touchX=touchY=null;},{passive:true});
 page.addEventListener('touchend',e=>{if(editing||touchX===null||!e.changedTouches.length)return;const d=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;touchX=touchY=null;if(Math.abs(d)>65&&Math.abs(d)>Math.abs(dy)*1.3)showPage(current+(d<0?1:-1));},{passive:true});
 document.addEventListener('keydown',e=>{if(editing||e.target.isContentEditable||e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();showPage(current+1);}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();showPage(current-1);}});
 showPage(0);
})();
