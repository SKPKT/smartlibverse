const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const app=path.join(root,'books','roket-keajaiban');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(app,'book-data.js'),'utf8'),sandbox);
const book=sandbox.window.ROKET_BOOK_DATA;
test('Five source-grounded book pages and complete content',()=>{
 assert.equal(book.pages.length,5);
 assert.deepEqual(Array.from(book.pages,p=>p.type),['cover','intro','parts','launch','benefits']);
 assert.equal(book.pages[1].facts.length,3);
 assert.equal(book.pages[2].parts.length,6);
 assert.equal(book.pages[3].steps.length,4);
 assert.equal(book.pages[4].benefits.length,4);
 const supplied=JSON.parse(JSON.stringify(book));delete supplied.pages[1].conversationTitle;delete supplied.pages[2].conversationTitle;
 const manifest=JSON.parse(fs.readFileSync(path.join(app,'manifest.json'),'utf8'));
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(supplied)).digest('hex'),manifest.sourceBookContentSha256,'Every original Malay field must remain unchanged');
 assert.equal(book.pages[1].conversationTitle,'Mari Bercerita');assert.equal(book.pages[2].conversationTitle,'Perbualan Sains');
 for(const [i,p] of book.pages.entries())assert.ok(p.title,`Missing page ${i+1} title`);
});
test('Reader uses editable DOM text and isolated local storage keys',()=>{
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8');
 const js=fs.readFileSync(path.join(app,'reader.js'),'utf8');
 assert.match(html,/fonts\.googleapis\.com\/css2\?family=Urbanist/);
 assert.match(js,/data-field/);assert.match(js,/contentEditable/);
 assert.match(js,/smartlibverse_roket_edits_urbanist_v1/);
 assert.doesNotMatch(js,/smartlibverse_demo_v1/);
 assert.match(html,/\.\.\/\.\.\/world\/index\.html\?zone=library/);
});
test('Twenty-one exact supplied illustrations and original Malay content are preserved; references stay unpublished',()=>{
 const files=fs.readdirSync(path.join(app,'art')).filter(x=>x.endsWith('.webp'));
 assert.equal(files.length,21);
 const manifest=JSON.parse(fs.readFileSync(path.join(app,'manifest.json'),'utf8'));
 assert.equal(Object.keys(manifest.sha256).length,22);
 assert.equal(manifest.editedPage4Reference.file,'04_pelancaran_TANPA_KHAT_ALLAH.png');
 assert.equal(manifest.editedPage4Reference.published,false);
 assert(!fs.existsSync(path.join(root,'REFERENCE_ARTWORK')));
 for(const [file,hash]of Object.entries(manifest.sha256))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(app,file))).digest('hex'),hash,file);
 assert.equal(manifest.sha256['art/launch-hero.webp'],'631cb4cbb001c00b34f8344927c164f397c78d98570d8f33d53dbbdd98758f16');
});

test('Science shelf links to the flipbook at the actual GitHub Pages subpath without adding a quiz book',async()=>{
 const main=fs.readFileSync(path.join(root,'js/main.mjs'),'utf8');
 assert.match(main,/if\(t.id==='alam'\)/);
 assert.match(main,/books.filter\(b=>b.shelf===t.id\)/);
 assert.match(main,/new URL\('\.\/books\/roket-keajaiban\/index.html',document.baseURI\)/);
 const base=new URL('../','https://skpkt.github.io/smartlibverse/world/index.html?zone=library');
 assert.equal(new URL('./books/roket-keajaiban/index.html',base).href,'https://skpkt.github.io/smartlibverse/books/roket-keajaiban/index.html');
 assert.equal(new URL('../../world/index.html?zone=library','https://skpkt.github.io/smartlibverse/books/roket-keajaiban/').href,'https://skpkt.github.io/smartlibverse/world/index.html?zone=library');
 assert.equal((await import('../data/content.mjs')).books.length,3);
});
