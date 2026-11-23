// Shared adapter contract, independent of the original game and legacy readers.
export const bookIds=['ribut','tsunami','gempa-bumi','banjir','persenyawaan'];
export function isLocalReview(url){return ['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&url.searchParams.get('review')==='1';}
export function canRead(record,url){return !!record&&(record.status==='published'||isLocalReview(url));}
export function assetUrl(id,file,base){
 if(!bookIds.includes(id)||!/^assets\/[a-z0-9/-]+\.(webp|svg)$/.test(file))throw Error('Laluan aset tidak sah.');
 return new URL(`books/${id}/${file}`,base).href;
}
export function validateBook(b,id){
 const expected=id==='persenyawaan'?5:6;
 if(!bookIds.includes(id)||b.id!==id||b.pageCount!==expected||b.pages?.length!==expected||b.activities?.length!==6)throw Error('Struktur buku tidak sah.');
 for(const [i,p]of b.pages.entries())if(p.number!==i+1||!p.title||!p.image||!p.text)throw Error('Halaman tidak lengkap.');
 for(const a of b.activities)if(!a.question||!a.explanation||!Array.isArray(a.choices)||a.choices.length<2||a.choices.some(c=>typeof c!=='string'||!c)||!Number.isInteger(a.answer)||a.answer<0||a.answer>=a.choices.length)throw Error('Aktiviti tidak lengkap.');
 return b;
}
export function textLines(value){
 if(typeof value==='string')return [value];
 if(Array.isArray(value))return value.flatMap(v=>Array.isArray(v)&&v.every(x=>typeof x==='string')?[v.join(' — ')]:textLines(v));
 if(value&&typeof value==='object'){
  if(value.speaker&&value.text)return [`${value.speaker}: ${value.text}`];
  return Object.values(value).flatMap(textLines);
 }
 return [];
}
export function validateEdits(value,id,count){
 if(value?.bookId!==id||value.version!==1||value.pages?.length!==count||value.pages.some(p=>!Array.isArray(p)||!p.length||p.some(t=>typeof t!=='string'||!t.trim()||t.length>6000)))throw Error('Fail teks tidak sepadan dengan buku ini.');
 if(JSON.stringify(value).length>200000)throw Error('Fail teks terlalu besar.');
 return value;
}
