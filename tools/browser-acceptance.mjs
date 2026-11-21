// Automated CI browser tests run in new, isolated demo contexts, never a pupil's browser.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4192/smartlibverse/';
let server;if(!process.env.BASE_URL){server=spawn(process.execPath,['tools/serve-test.mjs'],{stdio:['ignore','pipe','inherit']});await once(server.stdout,'data');}
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});const results=[];
const fresh={version:1,profile:{nickname:'Penguji CI',avatar:'lelaki',easy:false},location:{zone:'plaza',x:500,y:510},opened:[],read:[],quizzes:[],nature:[],rewards:[],visited:['plaza'],secretBook:false,customPreserved:'keep'};
async function frame(page,n=8){await page.evaluate(n=>new Promise(resolve=>{function tick(){if(--n<=0)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}),n);}
async function inspectWorld(page,zone,width){
 await page.waitForFunction(()=>window.SMARTLIBverseWorldQA?.inspect().backgroundStatus==='ready');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(zone==='library'){
  await page.waitForFunction(()=>window.SMARTLIBverseWorldQA.inspect().stations.every(s=>s.status==='ready'));
  await page.getByText('Navigasi bantuan · Mod Mudah',{exact:true}).click();
  for(const [id,label,book]of [['cerita','Cerita Bergambar','Sahabat di Taman'],['alam','Sains & Alam','Pengembaraan Si Kancil'],['umum','Pengetahuan','Misteri Buku Bercahaya']]){
   await page.locator('#destinations').getByRole('button',{name:label,exact:true}).click();
   await page.waitForFunction(id=>window.SMARTLIBverseWorldQA.inspect().active===id,id);
   await page.locator('#interact').click();await page.getByRole('heading',{name:label,exact:true}).waitFor();
   await page.getByRole('button',{name:book,exact:true}).click();await page.getByRole('heading',{name:book,exact:true}).waitFor();
   await page.locator('#close-panel').click();await page.locator('#world').screenshot({path:`test-results/library-${id}-${width}.png`});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await frame(page);
  const frozen=await page.evaluate(()=>window.SMARTLIBverseWorldQA.inspect());assert.equal(frozen.particles,0);assert(frozen.stations.every(s=>s.bob===0));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#run').click();assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'true');await page.locator('#run').click();
 }
 await page.locator('#world').screenshot({path:`test-results/world-${zone}-${width}.png`});
}
try{
 for(const [width,height]of [[1366,768],[820,980],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width===390});
  await context.addInitScript(state=>{if(!sessionStorage.getItem('v4-ci-seeded')){localStorage.setItem('smartlibverse_demo_v1',JSON.stringify(state));localStorage.removeItem('smartlibverse_foyer_playable_demo_v1');sessionStorage.setItem('v4-ci-seeded','1');}},fresh);
  const page=await context.newPage(),errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)bad.push(r.url());});
  await page.goto(base);await page.waitForFunction(()=>!!window.SMARTLIBverseQA);await frame(page);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'👤 Avatar',exact:true}).click();await page.locator('[data-avatar="perempuan"]').click();await page.reload();await page.waitForFunction(()=>!!window.SMARTLIBverseQA);
  const afterFoyer=await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_demo_v1')));
  assert.equal(afterFoyer.profile.avatar,'perempuan');assert.equal(afterFoyer.customPreserved,'keep');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#world').focus();await page.keyboard.down('d');await frame(page,10);await page.keyboard.up('d');assert.equal(await page.evaluate(()=>window.SMARTLIBverseQA.getState().animFrame),0);await page.emulateMedia({reducedMotion:'no-preference'});
  // Actual keyboard events, direction changes, collision overlay and normalized diagonals.
  for(const key of ['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){await page.evaluate(()=>window.SMARTLIBverseQA.setPosition(823,812));await page.locator('#world').focus();await page.keyboard.down(key);await frame(page,10);await page.keyboard.up(key);await frame(page,2);assert(await page.evaluate(()=>{const s=window.SMARTLIBverseQA.getState();return window.SMARTLIBverseQA.canStand(s.x,s.y)&&!s.walking;}));}
  await page.keyboard.press('c');await page.keyboard.press('c');
  // Capture each nearby portal caption at every supported viewport for visual review.
  for(const [id,x,y]of [['portal1',549,600],['portal2',840,605],['portal3',1125,605]]){
   await page.evaluate(([x,y])=>window.SMARTLIBverseQA.setPosition(x,y),[x,y]);await frame(page);
   await page.screenshot({path:`test-results/${id}-${width}.png`,fullPage:true});
  }
  // Real pointer capture/release in the same control slot.
  await page.locator('#movementMode').click();await page.locator('#foyerJoystick').scrollIntoViewIfNeeded();const joy=await page.locator('#foyerJoystick').boundingBox();await page.mouse.move(joy.x+joy.width/2,joy.y+joy.height/2);await page.mouse.down();await page.mouse.move(joy.x+joy.width-10,joy.y+joy.height/2);await frame(page,10);await page.mouse.up();await frame(page,2);assert.equal(await page.evaluate(()=>window.SMARTLIBverseQA.getState().walking),false);
  await page.getByText('Navigasi Bantuan',{exact:true}).click();
  for(const [id,title]of [['libra','🤖 LIBRA AI'],['portal1','✨ Portal Cerita'],['portal2','✨ Portal Cabaran'],['portal3','✨ Portal Penemuan'],['map','🗺️ Enam Dunia Ilmu']]){await page.locator(`[data-hotspot="${id}"]`).click();await page.getByRole('heading',{name:title,exact:true}).waitFor({timeout:15000});await page.getByRole('button',{name:'Tutup',exact:true}).click();}
  await page.locator('#worldMapBtn').click();await page.locator('[data-zone="secret"]').click();await page.getByText('Untuk membuka Zon Rahsia, capai Tahap 3, lengkapkan tiga misi dan kumpulkan dua lencana.',{exact:true}).waitFor();await page.getByRole('button',{name:'Tutup',exact:true}).click();
  for(const [id,zone,title]of [['library','library','Perpustakaan Maya'],['story','gallery','Galeri Cerita'],['edu','quiz','Arena Kuiz'],['trophy','awards','Dewan Anugerah'],['garden','garden','Taman Ilmu']]){await page.locator('#worldMapBtn').click();await page.locator(`[data-zone="${id}"]`).click();await page.waitForURL(base+`world/index.html?zone=${zone}`);await page.getByRole('heading',{name:title,exact:true}).waitFor();await inspectWorld(page,zone,width);await page.locator('#home').click();await page.waitForURL(base);await page.waitForFunction(()=>!!window.SMARTLIBverseQA);}
  // Preserve and exercise the real legacy story/quiz UI at the project subpath.
  await page.locator('#worldMapBtn').click();await page.locator('[data-zone="story"]').click();await page.getByRole('heading',{name:'Galeri Cerita',exact:true}).waitFor();
  for(let i=0;i<3;i++){await page.locator('[data-menu="collection"]').click();await page.getByRole('button',{name:'Baca Cerita',exact:true}).nth(i).click();assert.equal(await page.getByRole('button',{name:'Tamat Membaca',exact:true}).isEnabled(),false);for(let p=0;p<3;p++)await page.getByRole('button',{name:'Seterusnya →',exact:true}).click();await page.getByRole('button',{name:'Tamat Membaca',exact:true}).click();await page.getByRole('button',{name:'Kembali ke Dunia',exact:true}).click();}
  await page.locator('[data-menu="collection"]').click();await page.getByRole('button',{name:'Video BIM',exact:true}).first().click();await page.getByText('Video Bahasa Isyarat belum dimuat naik.',{exact:true}).waitFor();await page.locator('#close-panel').click();await page.locator('[data-menu="collection"]').click();await page.getByRole('button',{name:'Kuiz',exact:true}).first().click();
  let prior;for(let run=0;run<2;run++){if(run)await page.getByRole('button',{name:'Cuba Semula',exact:true}).click();for(const [i,answer]of ['Budi','Taman','Kotak','Penjaga taman','Buang sampah'].entries()){await page.getByRole('button',{name:answer,exact:true}).click();await page.getByRole('button',{name:i===4?'Lihat Keputusan':'Soalan Seterusnya',exact:true}).click();}await page.getByRole('heading',{name:'4 / 5 jawapan betul',exact:true}).waitFor();const xp=await page.locator('#xp').innerText();if(run)assert.equal(xp,prior);prior=xp;}
  await page.locator('#close-panel').click();await page.locator('[data-menu="awards"]').click();await page.getByRole('button',{name:'Pratonton Sijil Permainan',exact:true}).click();await page.getByText('Sijil Permainan Demo · Bukan rekod NILAM rasmi',{exact:true}).waitFor();await page.locator('#close-panel').click();await page.locator('#home').click();await page.waitForURL(base);await page.waitForFunction(()=>!!window.SMARTLIBverseQA);
  await page.locator('#worldMapBtn').click();await page.locator('[data-zone="secret"]').click();await page.waitForURL(base+'world/index.html?zone=secret');await page.getByRole('heading',{name:'Zon Rahsia',exact:true}).waitFor();await inspectWorld(page,'secret',width);await page.locator('#home').click();await page.waitForURL(base);await page.waitForFunction(()=>!!window.SMARTLIBverseQA);
  // Both the foyer and reused learning world preserve unknown v1 extension fields.
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_demo_v1')));assert.equal(saved.customPreserved,'keep');assert.equal(saved.profile.avatar,'perempuan');assert.equal(saved.read.length,3);assert.equal(saved.quizzes.length,1);
  await page.screenshot({path:`test-results/foyer-${width}.png`,fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);results.push({width,height,passed:true,errors:0});await context.close();
 }
 console.log(JSON.stringify({base,results},null,2));await writeFile('test-results/acceptance.json',JSON.stringify({base,results},null,2));
}finally{await browser.close();server?.kill();}
