import {assetUrl} from './model.mjs';
export function mountActivities(book,base){
 const $=id=>document.getElementById(id),dialog=$('activity-dialog');let index=0,opener=null;
 function render(){
  const a=book.activities[index];dialog.dataset.index=String(index);$('activity-heading').textContent=a.title;
  $('activity-instructions').textContent=book.instructions;$('activity-position').textContent=`Situasi ${index+1} / ${book.activities.length}`;
  $('activity-question').textContent=a.question;$('activity-feedback').textContent='Pilih jawapan atau langkau. Anda boleh cuba semula tanpa had.';
  const art=$('activity-art');art.replaceChildren();
  if(a.image){const img=document.createElement('img');img.src=assetUrl(book.id,a.image,base);img.alt=a.alt;art.append(img);}else if(a.icon){const icon=document.createElement('span');icon.className='source-icon';icon.textContent=a.icon;icon.setAttribute('aria-hidden','true');art.append(icon);}
  const choices=$('activity-choices');choices.replaceChildren();
  a.choices.forEach((text,i)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.choice=String(i);b.addEventListener('click',()=>{
   for(const node of choices.children)node.setAttribute('aria-pressed',String(node===b));
   $('activity-feedback').textContent=i===a.answer?`✓ ${a.explanation}`:'↻ Belum tepat. Anda boleh cuba lagi atau pilih Lihat Jawapan.';
  });choices.append(b);});
 }
 function close(){dialog.close();opener?.focus();}
 $('activity-open').addEventListener('click',e=>{opener=e.currentTarget;render();dialog.showModal();$('activity-close').focus();});
 $('activity-close').addEventListener('click',close);$('activity-skip').addEventListener('click',close);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 $('activity-next').addEventListener('click',()=>{index=(index+1)%book.activities.length;render();dialog.scrollTop=0;$('activity-close').focus();});
 $('activity-retry').addEventListener('click',()=>{render();$('activity-choices').firstElementChild?.focus();});
 $('activity-answer').addEventListener('click',()=>{const a=book.activities[index];$('activity-feedback').textContent=`Jawapan: ${a.choices[a.answer]}. ${a.explanation}`;});
 $('activity-reset').addEventListener('click',()=>{index=0;render();dialog.scrollTop=0;$('activity-close').focus();});
 return {close};
}
