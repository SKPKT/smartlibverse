const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),app=path.join(root,'books/kompos');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(app,'book-data.js'),'utf8'),sandbox);
const book=sandbox.window.KOMPOS_BOOK,manifest=JSON.parse(fs.readFileSync(path.join(app,'manifest.json'),'utf8'));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');

test('KOMPOS keeps all five supplied pages and original educational prose with ten distinct ungraded materials',()=>{
 assert.equal(book.pageCount,5);assert.equal(book.pages.length,5);
 assert.deepEqual(Array.from(book.pages,p=>p.title),['Kulit Depan','Apa Itu Kompos?','Kenali Bahan Kompos','Jom Buat Kompos!','Rumusan dan Pengajaran']);
 const materials=book.pages[2].materials;
 assert.equal(materials.length,10);assert.equal(new Set(materials.map(m=>m.slug)).size,10);
 assert.equal(materials.filter(m=>m.suitable===true).length,5);assert.equal(materials.filter(m=>m.suitable===false).length,5);
 assert(materials.every(m=>m.name&&m.fact&&!Object.hasOwn(m,'score')));assert.equal(manifest.ungraded,true);
 const prose=JSON.parse(JSON.stringify(book));delete prose.ui;
 for(const panel of prose.pages[1].panels){delete panel.image;delete panel.alt;}
 assert.equal(hash(JSON.stringify(prose)),manifest.sourceContentSha256,'Original dialogue, facts and categories must remain unchanged');
 assert.equal(hash(fs.readFileSync(path.join(app,'book-data.js'))),manifest.bookDataSha256);
});

test('KOMPOS packages the exact 23 supplied WebP illustrations/materials and excludes flattened references',()=>{
 assert.equal(manifest.files.length,23);assert.equal(manifest.files.filter(f=>f.path.startsWith('assets/materials/')).length,10);
 assert.equal(manifest.referenceAssetsPublished,false);
 assert(!fs.existsSync(path.join(app,'assets/pages')));assert(!fs.existsSync(path.join(app,'assets/reference')));
 for(const asset of manifest.files){
  assert.match(asset.path,/^assets\/(illustrations|materials)\/[a-z0-9-]+\.webp$/);
  const bytes=fs.readFileSync(path.join(app,asset.path));assert.equal(bytes.length,asset.bytes);assert.equal(hash(bytes),asset.sha256);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
 for(const material of book.pages[2].materials)assert(manifest.files.some(f=>f.path==='assets/materials/'+material.slug+'.webp'));
 for(const panel of book.pages[1].panels)assert(!['mikroorganisma.webp','pengenalan-bekas.webp'].includes(panel.image),'Do not render cropped baked dialogue');
});

test('KOMPOS is linked only from the library science catalog and resolves correctly below the Pages project prefix',async()=>{
 const main=fs.readFileSync(path.join(root,'js/main.mjs'),'utf8');
 const library=main.slice(main.indexOf("else if(z==='library')"),main.indexOf("else if(z==='gallery')"));
 assert.match(library,/Buka Komik KOMPOS/);assert.match(library,/books.filter\(b=>b.shelf===t.id\)/);
 assert.equal((main.match(/books\/kompos\/index\.html/g)||[]).length,1);
 const base=new URL('../','https://skpkt.github.io/smartlibverse/world/index.html?zone=library');
 assert.equal(new URL('./books/kompos/index.html',base).href,'https://skpkt.github.io/smartlibverse/books/kompos/index.html');
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8');assert.match(html,/\.\.\/\.\.\/world\/index\.html\?zone=library/);
 assert.equal(new URL('../../world/index.html?zone=library','https://skpkt.github.io/smartlibverse/books/kompos/').href,'https://skpkt.github.io/smartlibverse/world/index.html?zone=library');
 assert.equal((await import('../data/content.mjs')).books.length,3,'Keep the three original quiz books intact');
});

test('KOMPOS uses data-driven text, one Urbanist CDN stylesheet, relative assets and isolated browser-only storage',()=>{
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8'),js=fs.readFileSync(path.join(app,'js/flipbook.js'),'utf8'),css=fs.readFileSync(path.join(app,'css/flipbook.css'),'utf8');
 assert.equal((html.match(/fonts\.googleapis\.com\/css2/g)||[]).length,1);assert.doesNotMatch(css,/@import/);
 for(const [,key] of html.matchAll(/data-ui(?:-aria|-title)?="([\w]+)"/g))assert(typeof book.ui[key]==='string'&&book.ui[key].trim(),key);
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g))assert(!url.startsWith('/')&&(!url.startsWith('http')||/^https:\/\/fonts\.(googleapis|gstatic)\.com(?:\/|$)/.test(url)),url);
 assert.match(js,/smartlibverse_kompos_read_v1/);assert.match(js,/smartlibverse_kompos_reflection_v1/);
 assert.doesNotMatch(js,/smartlibverse_demo_v1|fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|assets\/(pages|reference)/);
 assert.doesNotMatch(js,/localStorage\.(?:setItem|getItem)\(reflectionKey/);
 assert.match(js,/sessionStorage\.setItem\(reflectionKey/);assert.match(css,/prefers-reduced-motion/);
});
