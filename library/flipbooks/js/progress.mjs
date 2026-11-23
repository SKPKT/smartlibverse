export const progressKey=id=>`smartlibverse_book_${id}_visited_v1`;
export function visitedPages(storage,id,count){
 try{const p=JSON.parse(storage.getItem(progressKey(id))||'[]');return Array.isArray(p)?[...new Set(p.filter(n=>Number.isInteger(n)&&n>=1&&n<=count))].sort((a,b)=>a-b):[];}catch{return [];}
}
export function visitPage(storage,id,count,page){
 const pages=visitedPages(storage,id,count);if(Number.isInteger(page)&&page>=1&&page<=count&&!pages.includes(page))pages.push(page);
 pages.sort((a,b)=>a-b);try{storage.setItem(progressKey(id),JSON.stringify(pages));}catch{}return pages;
}
// Legacy progress is read ONLY; never migrate, clear or create another KOMPOS key.
export function legacyKomposProgress(storage){try{const p=JSON.parse(storage.getItem('smartlibverse_kompos_read_v1')||'[]');return Array.isArray(p)?new Set(p.filter(n=>Number.isInteger(n)&&n>=1&&n<=5)).size:0;}catch{return 0;}}
