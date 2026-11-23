// Real Chromium acceptance against built project-subpath URLs. Synthetic browser data only.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fresh} from '../js/state.mjs';
const local=!process.env.BASE_URL,base=process.env.BASE_URL||'http://127.0.0.1:4193/smartlibverse/';
const root=new URL('library/flipbooks/',base).href,output='test-results/library';
let server;if(local){server=spawn(process.execPath,['tools/serve-test.mjs'],{env:{...process.env,PORT:'4193',LIBRARY_REVIEW:'1'},stdio:['ignore','pipe','inherit']});await once(server.stdout,'data');}
await mkdir(output,{recursive:true});const sandbox={window:{}};vm.runInNewContext(await readFile('library/flipbooks/catalog.js','utf8'),sandbox);const records=JSON.parse(JSON.stringify(sandbox.window.SMARTLIB_CATALOG));
const browser=await chromium.launch({headless:true}),results=[],errors=[],badAssets=[];
let pagesChecked=0,activitiesChecked=0;const fontChecks=[];
async function ready(page,n=1){await page.waitForFunction(n=>document.body.dataset.ready==='true'&&document.querySelector('#position')?.textContent.startsWith(n+' / '),n);await page.locator('#page-image').evaluate(img=>img.decode());}
async function fitCheck(page){
 const g=await page.evaluate(()=>{const v=document.querySelector('#image-viewport'),im=document.querySelector('#page-image'),r=im.getBoundingClientRect(),b=v.getBoundingClientRect();return {ratio:r.width/r.height,native:im.naturalWidth/im.naturalHeight,left:r.left,right:r.right,top:r.top,bottom:r.bottom,view:b.toJSON(),scrollWidth:document.documentElement.scrollWidth,width:innerWidth,fit:getComputedStyle(im).objectFit,zoom:v.dataset.zoom};});
 assert.equal(g.fit,'contain');assert.equal(g.zoom,'1');assert(Math.abs(g.ratio-g.native)<.002,'Native aspect preserved');assert(g.left>=g.view.left&&g.right<=g.view.right+.5&&g.top>=g.view.top&&g.bottom<=g.view.bottom+.5,'All four illustration edges visible in fit');assert(g.scrollWidth<=g.width,'No horizontal page overflow');
 assert(await page.evaluate(()=>[...document.querySelectorAll('button,.back-link')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0).every(r=>r.width>=44&&r.height>=44)),'Visible controls have 44px touch targets');return g;
}
async function swipe(page,dx,cancel=false){const v=page.locator('#image-viewport');await v.scrollIntoViewIfNeeded();const r=await v.boundingBox(),x=r.x+r.width*.8,y=r.y+Math.min(160,r.height/2),cdp=await page.context().newCDPSession(page);try{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=5;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/5,y}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}finally{await cdp.detach();}}
try{
 for(const [width,height]of [[360,800],[390,844],[430,900],[768,1024],[1280,900]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<800,deviceScaleFactor:1});
  await context.addInitScript(()=>{if(!localStorage.getItem('smartlibverse_demo_v1'))localStorage.setItem('smartlibverse_demo_v1',JSON.stringify({version:1,regressionSentinel:'preserved'}));if(!localStorage.getItem('smartlibverse_kompos_read_v1'))localStorage.setItem('smartlibverse_kompos_read_v1','[1,3]');});
  const page=await context.newPage();page.on('pageerror',e=>errors.push({width,message:e.message}));page.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)badAssets.push({url:r.url(),status:r.status()});});
  await page.goto(root,{waitUntil:'networkidle'});await page.locator('.book-card').first().waitFor();
  assert.equal(await page.locator('.book-card').count(),5);assert.equal(await page.locator('#legacy-kompos').count(),1);assert((await page.locator('#legacy-kompos').getAttribute('href')).includes('../../books/kompos/index.html'));assert((await page.locator('#kompos-progress').innerText()).startsWith('2/5'));
  await page.locator('#search').fill('RIBUT');assert.equal(await page.locator('.book-card').count(),1);await page.locator('#search').fill('KOMPOS');await page.locator('#legacy-kompos').waitFor();assert.equal(await page.locator('.legacy-card:visible').count(),1);await page.locator('#search').fill('tiada-buku-ini');await page.locator('.empty-state').waitFor();await page.locator('#search').fill('');await page.locator('#category').selectOption('Sains');assert.equal(await page.locator('.book-card').count(),1);await page.locator('#category').selectOption('');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`${output}/catalog-${width}.jpg`,fullPage:true,quality:80});
  for(const r of records){
   if(r.status!=='published'&&!local)continue;
   const book=JSON.parse(await readFile(`library/flipbooks/books/${r.id}/book.json`,'utf8'));
   await page.goto(`${root}reader.html?book=${r.id}${r.status==='draft'?'&review=1':''}`);await ready(page);
   if(r.id==='ribut')fontChecks.push({width,urbanistLoaded:await page.evaluate(async()=>{try{return (await document.fonts.load('500 16px Urbanist')).length>0;}catch{return false;}})});
   for(let n=1;n<=r.pages;n++){
    if(n>1){await page.locator('#next-page').click();await ready(page,n);}
    await fitCheck(page);assert((await page.locator('#page-text').textContent()).trim().length>20,'Nonempty companion data');
    await page.screenshot({path:`${output}/${r.id}-p${n}-${width}.jpg`,quality:80,fullPage:true});pagesChecked++;
   }
   assert((await page.locator('#completion').innerText()).includes('Semua halaman'));
   const progress=await page.evaluate(id=>localStorage.getItem(`smartlibverse_book_${id}_visited_v1`),r.id);assert.equal(JSON.parse(progress).length,r.pages);
   await page.locator('#activity-open').click();await page.locator('#activity-skip').click();assert.equal(await page.locator('#activity-dialog').evaluate(d=>d.open),false);assert.equal(await page.evaluate(()=>document.activeElement.id),'activity-open');
   await page.locator('#activity-open').click();
   for(let i=0;i<6;i++){
    const a=book.activities[i];await page.waitForFunction(i=>document.querySelector('#activity-dialog').dataset.index===String(i),i);
    if(a.image){await page.locator('#activity-art img').evaluate(img=>img.decode());assert.equal(await page.locator('#activity-art img').evaluate(img=>getComputedStyle(img).objectFit),'contain');}
    const wrong=(a.answer+1)%a.choices.length;await page.locator(`[data-choice="${wrong}"]`).click();assert((await page.locator('#activity-feedback').innerText()).includes('Belum tepat'));
    await page.locator('#activity-retry').click();await page.locator('#activity-answer').click();assert((await page.locator('#activity-feedback').innerText()).includes(a.explanation));
    await page.locator(`[data-choice="${a.answer}"]`).click();assert((await page.locator('#activity-feedback').innerText()).includes('✓'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.locator('#activity-dialog').screenshot({path:`${output}/${r.id}-a${i+1}-${width}.jpg`,quality:80});activitiesChecked++;
    await page.locator('#activity-next').click();
   }
   await page.locator('#activity-reset').click();assert.equal(await page.locator('#activity-dialog').getAttribute('data-index'),'0');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'activity-open');assert.equal(await page.evaluate(id=>localStorage.getItem(`smartlibverse_book_${id}_visited_v1`),r.id),progress,'Activities never alter reading progress');
   await page.locator('#zoom-in').click();assert.equal(await page.locator('#image-viewport').getAttribute('data-zoom'),'1.25');await page.locator('#zoom-in').click();await page.locator('#image-viewport').evaluate(v=>v.scrollTo(v.scrollWidth,v.scrollHeight));await page.locator('#reset-btn').click();await fitCheck(page);await page.locator('#zoom-in').click();await page.locator('#prev-page').click();await ready(page,r.pages-1);await fitCheck(page);await page.locator('#fit-btn').click();
   await page.reload();await ready(page);assert.equal(JSON.parse(await page.evaluate(id=>localStorage.getItem(`smartlibverse_book_${id}_visited_v1`),r.id)).length,r.pages);
   assert.equal(await page.evaluate(()=>localStorage.getItem('smartlibverse_kompos_read_v1')),'[1,3]');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_demo_v1')).regressionSentinel),'preserved');
   if(width===390){
    // Swipe and cancellation; zoomed images pan without turning pages.
    await swipe(page,-140,true);await ready(page);await swipe(page,-140);await ready(page,2);
    await page.locator('#full-btn').click();await page.waitForFunction(()=>!!document.fullscreenElement||document.body.classList.contains('fallback-fullscreen'));await page.keyboard.press('Escape');await page.evaluate(async()=>{if(document.fullscreenElement)await document.exitFullscreen();});
    await page.locator('#companion summary').click();await page.locator('#edit-btn').click();const first=page.locator('.text-line').first();const original=await first.innerText();await first.fill('Teks ujian tempatan <b>bukan HTML</b>');await page.locator('#edit-btn').click();assert((await first.innerText()).includes('<b>'));assert.equal(await first.locator('b').count(),0);
    const download=page.waitForEvent('download');await page.locator('#export-btn').click();const file=await download;const filePath=await file.path();const json=JSON.parse(await readFile(filePath,'utf8'));assert.equal(json.bookId,r.id);
    await page.locator('#restore-text').click();assert.equal(await first.innerText(),original);await page.locator('#import-file').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(json))});await page.getByText('Teks JSON berjaya diimport.',{exact:true}).waitFor();assert((await first.innerText()).includes('Teks ujian'));
    await page.locator('#import-file').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from('{"bookId":"other"}')});assert((await page.locator('#edit-status').innerText()).includes('tidak sah'));await page.locator('#restore-text').click();
   }
   results.push({id:r.id,width,pages:r.pages,activities:6,status:r.status==='draft'?'LOCAL REVIEW ONLY':'PASS'});
  }
  await context.close();console.log(`Library viewport ${width}: pages, activities, fit and preservation passed.`);
 }
 // Draft is inaccessible through the ordinary reader even on the local review server.
 const context=await browser.newContext(),page=await context.newPage();await page.goto(root+'reader.html?book=gempa-bumi');await page.getByRole('heading',{name:'Buku belum dapat dibuka.'}).waitFor();
 if(!local){const draft=await page.request.get(root+'books/gempa-bumi/book.json');assert.equal(draft.status(),404);}
 await page.goto(root+'reader.html?book=kompos');await page.waitForURL('**/books/kompos/index.html');
 // Follow the new real game shelf action; preserve original books and rewards.
 await page.evaluate(s=>localStorage.setItem('smartlibverse_demo_v1',JSON.stringify(s)),{...fresh(),customPreserved:'five-book-test'});
 await page.goto(new URL('world/index.html?zone=library',base).href);await page.waitForFunction(()=>window.SMARTLIBverseWorldQA?.inspect().backgroundStatus==='ready');await page.getByText('Navigasi bantuan · Mod Mudah',{exact:true}).click();await page.locator('#destinations').getByRole('button',{name:'Sains & Alam',exact:true}).click();await page.waitForFunction(()=>window.SMARTLIBverseWorldQA.inspect().active==='alam');await page.locator('#interact').click();
 await page.getByRole('button',{name:'Buka Komik KOMPOS',exact:true}).waitFor();await page.getByRole('button',{name:'Buka Flipbook',exact:true}).waitFor();await page.getByRole('button',{name:'Jelajah Koleksi Buku',exact:true}).click();await page.waitForURL(root+'index.html');await page.locator('.book-card').first().waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_demo_v1')).customPreserved),'five-book-test');
 // Font fallback and reduced-motion do not remove any content or controls.
 await context.route('https://fonts.googleapis.com/**',r=>r.abort());await page.emulateMedia({reducedMotion:'reduce'});await page.goto(root+'reader.html?book=ribut');await ready(page);await fitCheck(page);await context.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));const bp=await blocked.newPage();await bp.goto(root+'reader.html?book=ribut');await ready(bp);for(let n=2;n<=6;n++){await bp.locator('#next-page').click();await ready(bp,n);}assert((await bp.locator('#completion').innerText()).includes('Semua halaman'),'Reading can finish even when persistence is blocked');await blocked.close();
 assert.deepEqual(errors,[],'No uncaught JavaScript errors');assert.deepEqual(badAssets,[],'No required reader asset errors');
 await rm(`${output}/failure.json`,{force:true});
 await writeFile(`${output}/results.json`,JSON.stringify({mode:local?'built-local-plus-loopback-draft-review':'live',base,pagesChecked,activitiesChecked,viewports:5,results,fontChecks,errors,badAssets,physicalDevicesTested:false},null,2));
 console.log(`Library acceptance passed: ${pagesChecked} page views, ${activitiesChecked} activity situations, five widths; no runtime or required asset errors.`);
}catch(e){await writeFile(`${output}/failure.json`,JSON.stringify({message:e.message,stack:e.stack,results,errors,badAssets},null,2));throw e;}
finally{await browser.close();if(server){server.kill();await once(server,'exit').catch(()=>{});}}
