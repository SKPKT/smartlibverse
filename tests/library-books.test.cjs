const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'library/flipbooks'),hash=b=>createHash('sha256').update(b).digest('hex');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'catalog.js'),'utf8'),sandbox);const records=JSON.parse(JSON.stringify(sandbox.window.SMARTLIB_CATALOG));
test('Five new adapters preserve 29 pages, 30 optional activities and authoritative editions',async()=>{
 const {validateBook,textLines}=await import('../library/flipbooks/js/model.mjs');
 assert.deepEqual(records.map(b=>b.id),['ribut','tsunami','gempa-bumi','banjir','persenyawaan']);assert.equal(records.reduce((n,b)=>n+b.pages,0),29);
 for(const r of records){const b=validateBook(JSON.parse(fs.readFileSync(path.join(dir,r.data))),r.id);assert.equal(b.activities.length,6);for(const p of b.pages)assert(textLines(p.text).some(t=>t.length>20));
  const m=JSON.parse(fs.readFileSync(path.join(dir,'books',r.id,'manifest.json')));assert.equal(hash(fs.readFileSync(path.join(dir,r.data))),m.bookDataSha256);
  for(const a of m.files)assert.equal(hash(fs.readFileSync(path.join(dir,'books',r.id,a.path))),a.sha256);
  assert(m.sourceArchive.includes(r.id==='persenyawaan'?'v3':r.id==='ribut'?'Enam_Halaman':r.id==='tsunami'?'Kawasan_Pantai':'6_Halaman'));
 }
 assert.equal(records.filter(r=>r.status==='published').reduce((n,b)=>n+b.pages,0),29);
 assert.equal(records.find(r=>r.id==='gempa-bumi').reviewReason,null);
 const gempa=JSON.parse(fs.readFileSync(path.join(dir,'books/gempa-bumi/book.json'))),manifest=JSON.parse(fs.readFileSync(path.join(dir,'books/gempa-bumi/manifest.json')));
 assert.equal(manifest.publicationApproval.approvedOn,'2026-11-23');assert.equal(manifest.files.length,12);assert(manifest.files.every(f=>f.sha256===f.sourceSha256),'All original page/card bytes remain unchanged');
 assert(gempa.pages[0].text.note.includes('jangan berlari keluar'));assert.equal(gempa.activities[1].choices[gempa.activities[1].answer],'Tidak selamat');
 assert.equal(records.find(r=>r.id==='persenyawaan').publisher,'Pusat Sumber SKPK Taiping');
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'books/persenyawaan/book.json'))).publisher,'Pusat Sumber SKPK Taiping');
});
test('Draft release gate rejects public preview bypasses and unsafe asset URLs',async()=>{
 const {canRead,assetUrl}=await import('../library/flipbooks/js/model.mjs'),draft={...records.find(r=>r.id==='gempa-bumi'),status:'draft'};
 assert.equal(canRead(draft,new URL('https://skpkt.github.io/smartlibverse/library/flipbooks/reader.html?review=1')),false);
 assert.equal(canRead(draft,new URL('http://127.0.0.1:4193/smartlibverse/library/flipbooks/reader.html?review=1')),true);
 for(const file of ['../secret','assets/../../secret.webp','https://bad.test/x.webp','assets/x.svg?x=1'])assert.throws(()=>assetUrl('ribut',file,'https://skpkt.github.io/smartlibverse/library/flipbooks/'));
 assert.equal(assetUrl('ribut','assets/pages/01-kulit-depan.webp','https://skpkt.github.io/smartlibverse/library/flipbooks/'),'https://skpkt.github.io/smartlibverse/library/flipbooks/books/ribut/assets/pages/01-kulit-depan.webp');
});
test('Production copying follows release metadata and keeps unapproved book folders out',async()=>{
 const {isReleasedLibraryPath}=await import('../tools/verify-library.mjs'),booksRoot=path.join(dir,'books'),approved=new Set(records.filter(r=>r.status==='published').map(r=>r.id));
 const art=path.join(booksRoot,'gempa-bumi/assets/pages/halaman-01.webp');assert.equal(isReleasedLibraryPath(art,booksRoot,approved),true);
 const held=new Set([...approved].filter(id=>id!=='gempa-bumi'));assert.equal(isReleasedLibraryPath(art,booksRoot,held),false);assert.equal(isReleasedLibraryPath(path.join(booksRoot,'not-approved/book.json'),booksRoot,approved),false);assert.equal(isReleasedLibraryPath(path.join(dir,'reader.html'),booksRoot,approved),true);
});
test('Reading progress is isolated and corruption-safe; legacy KOMPOS is read-only',async()=>{
 const {visitPage,visitedPages,progressKey,legacyKomposProgress}=await import('../library/flipbooks/js/progress.mjs'),map=new Map([['smartlibverse_kompos_read_v1','[1,2,4]']]),s={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 visitPage(s,'ribut',6,1);visitPage(s,'ribut',6,1);visitPage(s,'tsunami',6,6);assert.deepEqual(visitedPages(s,'ribut',6),[1]);assert.deepEqual(visitedPages(s,'tsunami',6),[6]);assert.equal(legacyKomposProgress(s),3);assert.equal(map.get('smartlibverse_kompos_read_v1'),'[1,2,4]');assert.equal(map.size,3);
 map.set(progressKey('ribut'),'[0,1,1,7,"2",null]');assert.deepEqual(visitedPages(s,'ribut',6),[1]);map.set(progressKey('ribut'),'{bad');assert.deepEqual(visitedPages(s,'ribut',6),[]);assert.deepEqual(visitPage({getItem(){throw Error();},setItem(){throw Error();}},'ribut',6,1),[1]);
});
test('All existing KOMPOS paths and source bytes match protected deployed baseline',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'docs/kompos-protected-baseline.json')));assert.equal(baseline.baseline,'ce82cb755313568895b681e513f9af4b5fd898a7');assert.equal(baseline.files.length,28);
 for(const f of baseline.files){let b=fs.readFileSync(path.join(root,f.path));if(/\.(js|css|html|json|md)$/.test(f.path))b=Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));assert.equal(hash(b),f.sha256,f.path);}
 const count=d=>fs.readdirSync(d,{withFileTypes:true}).reduce((n,e)=>n+(e.isDirectory()?count(path.join(d,e.name)):1),0);assert.equal(count(path.join(root,'books/kompos')),28);
 assert(!records.some(b=>b.id==='kompos'));assert(!fs.existsSync(path.join(dir,'books/kompos')));
});
test('Untrusted text imports reject foreign books and preserve plain editable content',async()=>{
 const {validateEdits}=await import('../library/flipbooks/js/model.mjs');const v={version:1,bookId:'ribut',pages:Array.from({length:6},()=>['<img src=x onerror=alert(1)>'])};assert.equal(validateEdits(v,'ribut',6),v);assert.throws(()=>validateEdits(v,'banjir',6));assert.throws(()=>validateEdits({...v,pages:[[]]},'ribut',6));
 const renderer=fs.readFileSync(path.join(dir,'js/reader.mjs'),'utf8');assert(!renderer.includes('innerHTML'));assert(!fs.readFileSync(path.join(dir,'css/style.css'),'utf8').includes('object-fit:cover'));
});
