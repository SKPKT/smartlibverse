import {assetUrl,isLocalReview} from './model.mjs';
import {visitedPages,legacyKomposProgress} from './progress.mjs';
const base=new URL('../',import.meta.url),records=window.SMARTLIB_CATALOG;
const grid=document.querySelector('#catalog'),search=document.querySelector('#search'),category=document.querySelector('#category');
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null};}
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
function render(){
 grid.replaceChildren();const query=search.value.trim().toLocaleLowerCase('ms');
 const legacy=[...document.querySelectorAll('.legacy-card')];
 for(const card of legacy)card.hidden=!!category.value&&category.value!=='Sains'||!card.textContent.toLocaleLowerCase('ms').includes(query);
 const legacyCount=legacy.filter(c=>!c.hidden).length;document.querySelector('.legacy-section').hidden=legacyCount===0;
 const shown=records.filter(b=>(!category.value||b.category===category.value)&&`${b.title} ${b.author} ${b.series}`.toLocaleLowerCase('ms').includes(query));
 for(const b of shown){
  const c=el('article',null,'book-card');c.dataset.book=b.id;
  const draft=b.status!=='published',review=isLocalReview(new URL(location.href));
  if(!draft||review){const a=el('a',null,'cover-link');a.href=`reader.html?book=${b.id}${draft?'&review=1':''}`;a.setAttribute('aria-label',`Baca ${b.title}`);const img=el('img');img.className='book-cover';img.src=assetUrl(b.id,b.cover,base);img.alt=`Kulit buku ${b.title}`;img.loading='lazy';a.append(img);c.append(a);}else c.append(el('div','Draf · Semakan visual diperlukan','draft-cover'));
  c.append(el('span',`${b.category} · ${b.pages} halaman`,'eyebrow'),el('h2',b.title),el('p',b.series),el('p',`Penulis: ${b.author}`),el('p',`Penerbit: ${b.publisher||'Belum dinyatakan dalam sumber'}`));
  if(draft)c.append(el('span','MENUNGGU SEMAKAN PENGGUNA','draft-badge'),el('p',b.reviewReason));
  else c.append(el('p',`${visitedPages(storage,b.id,b.pages).length}/${b.pages} halaman telah dibuka`,'book-progress'));
  if(!draft||review){const a=el('a',draft?'Pratonton draf tempatan':'Baca Buku ›','read-link');a.href=`reader.html?book=${b.id}${draft?'&review=1':''}`;c.append(a);}
  grid.append(c);
 }
 if(!shown.length)grid.append(el('p',legacyCount?'Buku sedia ada yang sepadan ditunjukkan di bawah.':'Tiada buku sepadan. Cuba carian atau kategori lain.','empty-state'));
 document.querySelector('#catalog-status').textContent=`${shown.length} buku baharu · ${legacyCount} buku sedia ada · ${shown.filter(b=>b.status==='published').length} buku baharu tersedia untuk dibaca`;
 document.querySelector('#kompos-progress').textContent=`${legacyKomposProgress(storage)}/5 halaman telah dibuka · Buka pembaca asal ›`;
}
search.addEventListener('input',render);category.addEventListener('change',render);document.querySelector('form').addEventListener('submit',e=>e.preventDefault());window.addEventListener('pageshow',render);render();
