const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const state=import('../js/state.mjs');
const content=import('../data/content.mjs');
test('Rewards are gated, idempotent and derived from mission configuration',async()=>{const {fresh,earn,totals,unlocked}=await state;const s=fresh();assert.equal(earn(s,'books'),null);earn(s,'tutorial');earn(s,'tutorial');assert.equal(totals(s).xp,20);s.opened=['taman','kancil'];earn(s,'books');s.read=['taman'];earn(s,'read');assert.equal(unlocked(s),false);s.quizzes=['taman'];earn(s,'quiz');assert.equal(totals(s).xp,140);assert.equal(unlocked(s),true);for(let i=0;i<20;i++)earn(s,'quiz');assert.equal(totals(s).xp,140);});
test('Saved demo is isolated, round-trips and rejects invalid or inaccessible state',async()=>{const {fresh,save,load,KEY,sanitize}=await state;let data;const storage={setItem(k,v){assert.equal(k,KEY);data=v;},getItem(){return data;}};let s=fresh();s.profile.avatar='perempuan';s.profile.nickname='Pembaca Rekaan';save(storage,s);assert.deepEqual(load(storage).state,s);assert.equal(sanitize({version:1,location:{zone:'secret'},rewards:['fake']}).location.zone,'plaza');assert.equal(sanitize({version:1,location:{x:Infinity,y:-500}}).location.y,155);data='broken';assert.equal(load(storage).error,true);assert.equal(save({setItem(){throw Error();}},s),false);assert.deepEqual(sanitize({version:99}),fresh());});
test('Collision prevents crossing shelves and boundary; movement stops and easy mode is slower',async()=>{const {fresh,move,collision}=await state;const objects=[['shelf','Rak',500,250,'shelf']];assert(collision(500,250,objects));assert(collision(20,400,objects));let a=fresh(),b=fresh();b.profile.easy=true;move(a,1,0,.04,objects);move(b,1,0,.04,objects);assert(a.location.x>b.location.x);const x=a.location.x;move(a,0,0,.04,objects);assert.equal(a.location.x,x);a.location={zone:'library',x:500,y:280};for(let i=0;i<50;i++)move(a,0,-1,.04,objects);assert(a.location.y>=274);});
test('Three original stories have deterministic five-question quizzes with valid answers',async()=>{const {books,zones}=await content;const {grade}=await state;assert.equal(books.length,3);assert.equal(zones.length,7);for(const b of books){assert(b.pages.length>=3);assert.equal(b.quiz.length,5);for(const q of b.quiz){assert.equal(q[1].length,4);assert(q[2]>=0&&q[2]<4);}assert.equal(grade(b,b.quiz.map(q=>q[2])),5);assert.equal(grade(b,[]),0);}});
test('All zones have interactive objects, bidirectional portals and locked secret enforcement',async()=>{const {fresh}=await state;const {zones}=await content;const {portals,targets}=await import('../js/world.mjs');const s=fresh();assert.equal(portals(s).length,6);for(const z of zones){assert(z.objects.length>0);s.location.zone=z.id;assert(targets(s).length>1);if(z.id!=='plaza')assert.equal(portals(s)[0].id,'plaza');}});
test('Game is independent from school APIs, exposes five menus, real joystick, reader, videos and certificate',()=>{const html=fs.readFileSync(path.join(root,'world/index.html'),'utf8');const main=fs.readFileSync(path.join(root,'js/main.mjs'),'utf8');assert.match(html,/https:\/\/skpkt.github.io\/smartlib\//);assert.match(html,/id="joystick"/);assert.equal((html.match(/data-menu=/g)||[]).length,5);assert.match(main,/pointercancel/);assert.match(main,/visibilitychange/);assert.match(main,/window.print/);assert.match(main,/seen.size!==b.pages.length/);assert.match(main,/Video Bahasa Isyarat belum dimuat naik/);assert.doesNotMatch(main,/fetch\(|script.google|sessionToken|Gemini.*key/i);assert.match(main,/textContent=text/);});

// Integrated Plaza shell must keep access to six real zones, without replacing learning activities.
test('Start Plaza v4 is linked to existing learning worlds',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/GRAND FOYER|Grand Foyer|Plaza Mula/i);
 assert.match(html,/WORLD_PATH/);
 assert.match(html,/function enterWorld/);
 assert.match(html,/smartlibverse_demo_v1/);
 assert.match(html,/avatar_perempuan_production_walk4/);
});


test('Science comic collection is exclusive to the Sains & Alam interaction',()=>{
 const main=fs.readFileSync(path.join(root,'js/main.mjs'),'utf8');
 const start=main.indexOf("else if(z==='library'){");
 const end=main.indexOf("else if(z==='gallery')",start);
 assert(start>=0&&end>start,'Library interaction branch must exist');
 const source=main.slice(start,end).trim().replace(/^else\s+if/,'if');
 // Execute only the library interaction branch using controlled test stubs.
 const handle=new Function('z','t','books','show','btn','card','openBook','window','document',source);
 const run=shelf=>{
  const buttons=[],cards=[];
  const sampleBooks=[
   {id:'taman',title:'Sahabat di Taman',shelf:'cerita'},
   {id:'kancil',title:'Pengembaraan Si Kancil',shelf:'alam'},
   {id:'misteri',title:'Misteri Buku Bercahaya',shelf:'umum'}
  ];
  handle('library',{id:shelf,name:shelf},sampleBooks,()=>{},
   label=>buttons.push(label),(title)=>{cards.push(title);return {};},
   ()=>{}, {location:{}},{baseURI:'https://skpkt.github.io/smartlibverse/'});
  return {buttons,cards};
 };
 for(const shelf of ['cerita','umum']){
  const {buttons,cards}=run(shelf);
  assert.equal(buttons.includes('Jelajah Koleksi Buku'),false);
  assert.equal(cards.some(title=>title.includes('Koleksi Komik Sains')),false);
 }
 const science=run('alam');
 assert.equal(science.buttons.includes('Jelajah Koleksi Buku'),true);
 assert.equal(science.cards.filter(title=>title==='Koleksi Komik Sains & Fenomena Alam').length,1);
 assert.equal(science.cards.some(title=>title.startsWith('ROKET:')),true);
 assert.equal(science.cards.some(title=>title.startsWith('KOMPOS:')),true);
});
