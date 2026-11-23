// Derived from the supplied engine's navigation/progress contract; image-page adapter,
// uncropped fit/zoom and separate optional activity overlay support all five books.
import {assetUrl,canRead,validateBook,textLines,validateEdits} from './model.mjs';
import {visitPage,visitedPages} from './progress.mjs';
import {mountActivities} from './activities.mjs';
const $=id=>document.getElementById(id),base=new URL('../',import.meta.url),url=new URL(location.href),id=url.searchParams.get('book');
// Backward-compatible handoff, not a second KOMPOS registration or reader.
if(id==='kompos'||id==='roket-keajaiban')location.replace(new URL(`../../books/${id}/index.html`,base).href);
else start().catch(()=>{const box=document.createElement('main');box.className='reader-error';const h=document.createElement('h1');h.textContent='Buku belum dapat dibuka.';const p=document.createElement('p');p.textContent='Buku ini tidak tersedia atau masih dalam semakan. Sila kembali ke koleksi buku.';const a=document.createElement('a');a.href='index.html';a.className='back-link';a.textContent='‹ Kembali ke Koleksi Buku';box.append(h,p,a);document.body.replaceChildren(box);});
async function start(){
 const record=window.SMARTLIB_CATALOG.find(b=>b.id===id);
 if(!canRead(record,url))throw Error('Unpublished book.');
 const response=await fetch(new URL(record.data,base));if(!response.ok)throw Error('Book unavailable.');
 const book=validateBook(await response.json(),id);let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
 let page=0,zoom=1,token=0,editing=false,baseW=0,baseH=0,visited=visitedPages(storage,id,book.pages.length);
 const editKey=`smartlibverse_book_${id}_text_v1`,defaults={version:1,bookId:id,pages:book.pages.map(p=>textLines(p.text))};
 let edits=structuredClone(defaults);try{const value=storage.getItem(editKey);if(value)edits=validateEdits(JSON.parse(value),id,book.pages.length);}catch{}
 $('book-heading').textContent=book.title;document.title=`${book.title} — SMARTLIBverse`;document.body.dataset.book=id;
 $('credit').textContent=`Penulis: ${book.author} · Penerbit: ${book.publisher||'Belum dinyatakan dalam sumber'} · Kemajuan pada pelayar sahaja; bukan rekod NILAM rasmi. © 2026 SMARTLIB |Syahida Suffian`;
 if(book.status==='draft'){$('review-warning').hidden=false;$('review-warning').textContent='PRATONTON DRAF TEMPATAN — '+book.reviewReason;}
 const viewport=$('image-viewport'),surface=$('image-surface'),img=$('page-image');
 function layout(){
  if(!img.naturalWidth)return;
  const reserved=viewport.getBoundingClientRect().top+scrollY+132;
  viewport.style.setProperty('--fit-height',`${Math.max(250,innerHeight-reserved)}px`);
  const w=viewport.clientWidth-4,h=viewport.clientHeight-4,r=Math.min(w/img.naturalWidth,h/img.naturalHeight);
  baseW=img.naturalWidth*r;baseH=img.naturalHeight*r;
  img.style.setProperty('--image-width',`${baseW*zoom}px`);img.style.setProperty('--image-height',`${baseH*zoom}px`);
  surface.style.width=`${Math.max(w,baseW*zoom+4)}px`;surface.style.height=`${Math.max(h,baseH*zoom+4)}px`;
  viewport.dataset.zoom=String(zoom);$('zoom-level').textContent=`${Math.round(zoom*100)}%`;
  viewport.style.touchAction=zoom===1?'pan-y':'pan-x pan-y';
  $('zoom-out').disabled=zoom<=1;$('zoom-in').disabled=zoom>=3;
 }
 function fit(){zoom=1;layout();viewport.scrollTo(0,0);}
 function saveEdits(){edits.pages[page]=[...$('page-text').children].map(n=>n.textContent.trim()).filter(Boolean);if(!edits.pages[page].length)edits.pages[page]=structuredClone(defaults.pages[page]);try{validateEdits(edits,id,book.pages.length);storage.setItem(editKey,JSON.stringify(edits));$('edit-status').textContent='Teks pendamping disimpan pada pelayar ini.';}catch{$('edit-status').textContent='Teks belum disimpan. Semak panjang dan kandungan teks.';}}
 function renderText(){const target=$('page-text');target.replaceChildren();for(const text of edits.pages[page]){const p=document.createElement('p');p.className='text-line';p.textContent=text;p.contentEditable=String(editing);if(editing){p.setAttribute('role','textbox');p.setAttribute('aria-label','Teks pendamping boleh disunting');}p.addEventListener('blur',saveEdits);p.addEventListener('paste',e=>{if(!editing)return;e.preventDefault();const text=e.clipboardData.getData('text/plain');const s=getSelection();if(s?.rangeCount){const r=s.getRangeAt(0);r.deleteContents();r.insertNode(document.createTextNode(text));}});target.append(p);}}
 async function go(n){
  if(n<0||n>=book.pages.length)return;if(editing)saveEdits();const current=++token;page=n;zoom=1;
  const p=book.pages[n],safety=id==='banjir'&&n===4?textLines(p.text.notes).join(' '):id==='gempa-bumi'&&n<2?textLines(book.pages[0].text.note).join(' '):'';
  $('safety-note').hidden=!safety;$('safety-note').textContent=safety;document.body.dataset.page=String(n+1);$('page-title').textContent=p.title;img.alt=p.alt;window.scrollTo({top:0,behavior:'instant'});
  img.src=assetUrl(id,p.image,base);await img.decode();if(current!==token)return;
  fit();renderText();visited=[...new Set([...visited,...visitPage(storage,id,book.pages.length,n+1)])].sort((a,b)=>a-b);
  $('current-count').textContent=`Halaman ${n+1}`;$('read-count').textContent=`${visited.length}/${book.pages.length} halaman telah dibuka`;
  $('position').textContent=`${n+1} / ${book.pages.length}`;$('prev-page').disabled=n===0;$('next-page').disabled=n===book.pages.length-1;
  $('progress-bar').setAttribute('aria-valuemax',book.pages.length);$('progress-bar').setAttribute('aria-valuenow',visited.length);$('progress-fill').style.width=`${visited.length/book.pages.length*100}%`;
  $('completion').textContent=visited.length===book.pages.length?'✓ Tahniah! Semua halaman telah dibuka. Anda boleh membaca semula atau kembali ke koleksi.':'';
  document.body.dataset.ready='true';
 }
 const safeGo=n=>go(n).catch(()=>{$('page-title').textContent='Ilustrasi belum dapat dimuatkan. Cuba semula.';});
 $('prev-page').addEventListener('click',()=>safeGo(page-1));$('next-page').addEventListener('click',()=>safeGo(page+1));
 $('fit-btn').addEventListener('click',fit);$('reset-btn').addEventListener('click',fit);
 $('zoom-in').addEventListener('click',()=>{zoom=Math.min(3,zoom+.25);layout();});$('zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom-.25);layout();});
 window.addEventListener('resize',layout);document.fonts?.ready.then(layout);
 $('full-btn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else document.body.classList.toggle('fallback-fullscreen');}catch{document.body.classList.toggle('fallback-fullscreen');}setTimeout(layout,60);$('full-btn').setAttribute('aria-pressed',String(!!document.fullscreenElement||document.body.classList.contains('fallback-fullscreen')));});
 document.addEventListener('fullscreenchange',()=>{layout();$('full-btn').setAttribute('aria-pressed',String(!!document.fullscreenElement));});
 let touch=null;viewport.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
 viewport.addEventListener('touchcancel',()=>{touch=null;},{passive:true});viewport.addEventListener('touchend',e=>{if(touch&&zoom===1&&e.changedTouches.length){const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)safeGo(page+(dx<0?1:-1));}touch=null;},{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('fallback-fullscreen');$('full-btn').setAttribute('aria-pressed',String(!!document.fullscreenElement));layout();}if($('activity-dialog').open||e.target.isContentEditable||['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName))return;if(zoom>1&&e.target===viewport)return;if(e.key==='ArrowRight'){e.preventDefault();safeGo(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();safeGo(page-1);}});
 $('edit-btn').addEventListener('click',()=>{if(editing)saveEdits();editing=!editing;$('edit-btn').textContent=editing?'Simpan teks':'Edit teks';$('edit-btn').setAttribute('aria-pressed',String(editing));renderText();});
 $('export-btn').addEventListener('click',()=>{if(editing)saveEdits();const blob=new Blob([JSON.stringify(edits,null,2)],{type:'application/json'}),href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=`SMARTLIBverse_${id}_teks.json`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);});
 $('import-btn').addEventListener('click',()=>$('import-file').click());$('import-file').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>200000)throw Error();edits=validateEdits(JSON.parse(await f.text()),id,book.pages.length);storage.setItem(editKey,JSON.stringify(edits));renderText();$('edit-status').textContent='Teks JSON berjaya diimport.';}catch{$('edit-status').textContent='JSON tidak sah atau tidak sepadan dengan buku ini. Teks asal dikekalkan.';}e.target.value='';});
 $('restore-text').addEventListener('click',()=>{edits=structuredClone(defaults);try{storage.removeItem(editKey);}catch{}renderText();$('edit-status').textContent='Teks pendamping asal dipulihkan. Kemajuan bacaan dikekalkan.';});
 mountActivities(book,base);await go(0);
}
