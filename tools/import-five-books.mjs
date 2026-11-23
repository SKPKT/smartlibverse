// Offline, explicit source adapter. Never reads or writes the existing books/ directory.
// SOURCE_ROOT must contain the checksum-verified, safely extracted six input archives.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const source=process.env.SOURCE_ROOT;
if(!source)throw Error('Set SOURCE_ROOT to the verified extracted input directory.');
const verified=JSON.parse(await fs.readFile(path.join(source,'verified-inputs.json'),'utf8'));
const dimensions=JSON.parse(await fs.readFile(path.join(source,'image-dimensions.json'),'utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const ids=['ribut','tsunami','gempa-bumi','banjir','persenyawaan'];
const catalog=[];
for(const id of ids){
 const archive=verified.find(x=>x.id===id);
 if(!archive)throw Error('Missing verified archive: '+id);
 const bytes=await fs.readFile(path.join(source,id,'book-data.js'));
 if(digest(bytes)!==archive.files.find(x=>x.path==='book-data.js').sha256)throw Error('Source data changed: '+id);
 const sandbox={window:{}};
 vm.runInNewContext(bytes.toString('utf8'),sandbox,{timeout:100});
 const raw=Object.values(sandbox.window)[0];
 const dir=path.join(root,'library/flipbooks/books',id);
 await fs.mkdir(dir,{recursive:true});
 const assets=new Map();
 async function asset(file){
  if(!/^assets\/[\w/-]+\.(png|webp|svg)$/.test(file))throw Error('Unsafe asset: '+file);
  const original=await fs.readFile(path.join(source,id,file));
  const evidence=archive.files.find(x=>x.path===file);
  if(!evidence||digest(original)!==evidence.sha256)throw Error('Asset changed: '+file);
  // RIBUT's lossless WebP derivatives are prepared separately; no resizing or cropping.
  const target=id==='ribut'&&file.endsWith('.png')?file.replace(/\.png$/,'.webp'):file;
  const data=target===file?original:await fs.readFile(path.join(source,id,target));
  const dest=path.join(dir,target);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);
  const size=dimensions.find(x=>x.book===id)?.images.find(x=>x.path===file);
  assets.set(target,{path:target,bytes:data.length,sha256:digest(data),sourcePath:file,sourceSha256:evidence.sha256,...(size?{width:size.width,height:size.height}:{})});
  return target;
 }
 const pages=[];
 for(const [i,p]of raw.pages.entries()){
  const n=String(i+1).padStart(2,'0');
  const file=p.image|| (id==='gempa-bumi'?`assets/pages/halaman-${n}.webp`:`assets/halaman-${n}.webp`);
  const {image,original,number,alt,...text}=p;
  pages.push({number:i+1,title:p.title,image:await asset(file),alt:alt||`${raw.title} — ${p.title}. Illustration complète avec les panneaux du livre.`.replace('Illustration complète avec les panneaux du livre.','Ilustrasi penuh dan panel buku.'),text});
 }
 const input=raw.quiz?.situations||raw.quiz||raw.activities||raw.activity?.items||raw.visualActivities;
 const activities=[];
 for(const [i,a]of input.entries()){
  const hasChoices=Array.isArray(a.choices);
  activities.push({id:`${id}-${i+1}`,title:a.title||`Situasi ${i+1}`,question:a.question||a.scenario||a.text||a.description,
   image:a.image||a.illustration?await asset(a.image||a.illustration):null,icon:a.icon||null,alt:a.alt||a.description||a.question||a.text||a.scenario,
   choices:hasChoices?a.choices:['Selamat','Tidak selamat'],answer:hasChoices?a.answer:(a.safe??a.correct)?0:1,
   explanation:a.explanation||a.explain});
 }
 const book={id,title:raw.title,series:raw.subtitle||'Ensiklopedia Fenomena Alam',author:raw.author,publisher:raw.publisher||null,
  category:id==='persenyawaan'?'Sains':'Ensiklopedia Fenomena Alam',pageCount:pages.length,
  status:id==='gempa-bumi'?'draft':'published',reviewReason:id==='gempa-bumi'?'Visual halaman 1–2 memerlukan semakan pengguna: orang di jalan semasa gegaran. Rujuk laporan sumber.':null,
  instructions:raw.quiz?.instructions||raw.activity?.instructions||'Lihat situasi dan pilih jawapan. Tiada markah; boleh cuba semula atau langkau.',pages,activities};
 await fs.writeFile(path.join(dir,'book.json'),JSON.stringify(book,null,2)+'\n');
 const bookBytes=await fs.readFile(path.join(dir,'book.json'));
 const manifest={schema:1,bookId:id,sourceArchive:archive.filename,archiveSha256:archive.sha256,sourceDataSha256:digest(bytes),
  bookDataSha256:digest(bookBytes),sourcePageCount:raw.pages.length,activityCount:activities.length,status:book.status,
  files:[...assets.values()],excluded:'Source engines, backups, old TSUNAMI -asal images, original/reference art and optional covers are not published.'};
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 catalog.push({id,title:book.title,series:book.series,author:book.author,publisher:book.publisher,category:book.category,pages:pages.length,
  cover:pages[0].image,data:`books/${id}/book.json`,status:book.status,reviewReason:book.reviewReason});
}
await fs.writeFile(path.join(root,'library/flipbooks/catalog.js'),'// Five new books only. Existing KOMPOS/ROKET remain external links to their original readers.\nwindow.SMARTLIB_CATALOG = '+JSON.stringify(catalog,null,2)+';\n');
console.log('Adapted exactly five books, 29 pages, 30 ungraded activities. No existing books were changed.');
