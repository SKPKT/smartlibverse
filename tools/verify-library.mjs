import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {validateBook,assetUrl} from '../library/flipbooks/js/model.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export async function readLibraryCatalog(file){
 const s={window:{}};vm.runInNewContext(await readFile(file,'utf8'),s,{timeout:100});
 if(!Array.isArray(s.window.SMARTLIB_CATALOG))throw Error('Missing library catalog');
 return s.window.SMARTLIB_CATALOG;
}
export function isReleasedLibraryPath(file,booksRoot,releasedIds){
 const relative=path.relative(booksRoot,file);
 if(!relative||relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))return true;
 return releasedIds.has(relative.split(path.sep)[0]);
}
export async function verifyLibrary(root){
 const dir=path.join(root,'dist/library/flipbooks');
 const records=await readLibraryCatalog(path.join(dir,'catalog.js'));
 if(records.length!==5||records.reduce((n,b)=>n+b.pages,0)!==29)throw Error('Five-book catalog mismatch');
 for(const r of records){
  const bookDir=path.join(dir,'books',r.id);
  if(r.status!=='published'){try{await stat(bookDir);throw Error('Draft book leaked into production');}catch(e){if(e.code!=='ENOENT')throw e;}continue;}
  const data=await readFile(path.join(bookDir,'book.json')),m=JSON.parse(await readFile(path.join(bookDir,'manifest.json'),'utf8'));
  if(hash(data)!==m.bookDataSha256)throw Error('Book data changed: '+r.id);
  const b=validateBook(JSON.parse(data),r.id);
  if(b.status!==r.status||m.status!==r.status)throw Error('Book release status mismatch: '+r.id);
  for(const file of m.files){assetUrl(r.id,file.path,'https://example.invalid/smartlibverse/library/flipbooks/');const bytes=await readFile(path.join(bookDir,file.path));if(bytes.length!==file.bytes||hash(bytes)!==file.sha256)throw Error('Book asset changed: '+r.id+'/'+file.path);if(file.path.endsWith('.svg')&&/<script\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i.test(bytes.toString('utf8')))throw Error('Active SVG content is not permitted');}
  const supported=new Set(m.files.map(x=>x.path));
  for(const file of [...b.pages.map(p=>p.image),...b.activities.map(a=>a.image).filter(Boolean)])if(!supported.has(file))throw Error('Unmanifested book asset');
 }
 const published=await readdir(path.join(dir,'books'));
 if(published.some(id=>!records.some(r=>r.id===id&&r.status==='published')))throw Error('Unexpected published book');
 const released=records.filter(r=>r.status==='published');
 console.log(`Verified shared reader: ${records.length} source books / ${records.reduce((n,r)=>n+r.pages,0)} pages; ${released.length} published / ${released.reduce((n,r)=>n+r.pages,0)} pages; ${records.length-released.length} drafts excluded.`);
}
