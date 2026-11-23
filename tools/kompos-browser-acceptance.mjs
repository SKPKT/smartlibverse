import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';

const readKey='smartlibverse_kompos_read_v1',reflectionKey='smartlibverse_kompos_reflection_v1';
async function number(page,n){await page.locator('#page-sheet[data-page="'+n+'"]').waitFor();}
async function images(page){
 for(const image of await page.locator('#page-sheet img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());assert(await image.evaluate(image=>image.naturalWidth>0));}
}
async function geometry(page){
 const metrics=await page.evaluate(()=>({
  overflow:document.documentElement.scrollWidth>innerWidth,
  cropped:[...document.querySelectorAll('#page-sheet img')].some(image=>getComputedStyle(image).objectFit!=='contain'),
  clipped:[...document.querySelectorAll('.panel,.step-card,.fact,.bubble,.activity-question,.reflection')].some(el=>el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2),
  missing:[...document.querySelectorAll('button')].some(button=>!button.getAttribute('aria-label')&&!button.textContent.trim()),
  targets:[...document.querySelectorAll('button,.back-link')].map(el=>{const r=el.getBoundingClientRect();return [r.width,r.height];})
 }));
 assert.equal(metrics.overflow,false);assert.equal(metrics.cropped,false);assert.equal(metrics.clipped,false);assert.equal(metrics.missing,false);
 assert(metrics.targets.every(([w,h])=>w>=44&&h>=44),'Every interactive target must remain at least 44 by 44 CSS pixels');
}
async function touch(page,dx,dy=0,cancel=false){
 await page.locator('#page-sheet .sheet-header').scrollIntoViewIfNeeded();
 const r=await page.locator('#page-sheet .sheet-header').boundingBox();
 const x=r.x+r.width*(dx<0?.85:.15),y=r.y+r.height/2;
 const cdp=await page.context().newCDPSession(page);
 try{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/5,y:y+dy*i/5}]});
  await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
 }finally{await cdp.detach();}
}

// The callers use isolated synthetic contexts, never a pupil's real browser data.
export async function inspectKompos(page,base,width){
 const route=new URL('./books/kompos/index.html',base).href;
 await page.waitForURL(route);await number(page,1);
 const original=await page.evaluate(()=>window.KOMPOS_BOOK);
 const before=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key!=='smartlibverse_kompos_read_v1')));
 const badNetwork=[];
 const observe=request=>{const url=new URL(request.url());if(request.method()!=='GET'||(!url.href.startsWith(base)&&!/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url.href)))badNetwork.push({method:request.method(),url:url.href});};
 page.on('request',observe);
 const fonts=await page.evaluate(async()=>{await document.fonts.load('600 16px Urbanist');return [...document.fonts].filter(f=>f.family.replaceAll('"','')==='Urbanist'&&f.status==='loaded').length;});assert(fonts>0);
 const snapshot=async n=>{await number(page,n);await images(page);await geometry(page);assert.equal(await page.locator('#prev').isDisabled(),n===1);assert.equal(await page.locator('#next').isDisabled(),n===5);await page.locator('#reader').screenshot({path:`test-results/kompos-page-${n}-${width}.png`});};
 await snapshot(1);
 await page.getByRole('button',{name:original.ui.start+' →',exact:true}).click();await snapshot(2);
 await page.getByRole('button',{name:original.ui.nextPage,exact:true}).click();await number(page,3);await snapshot(3);
 assert.equal(await page.locator('[data-material]').count(),10);assert.equal(await page.locator('#explored-text').innerText(),'Bahan diteroka: 0 daripada 10');
 // Skipping before any answer must never gate page 4 or completion.
 await page.getByRole('button',{name:original.ui.skip+' →',exact:true}).click();await snapshot(4);
 await page.getByRole('button',{name:original.ui.nextPage,exact:true}).click();await snapshot(5);
 await page.getByText(original.ui.finished,{exact:true}).waitFor();
 assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),readKey),[1,2,3,4,5]);
 const reflection='Refleksi ujian sesi sahaja.';await page.getByRole('textbox',{name:original.ui.reflectionLabel,exact:true}).fill(reflection);
 await page.getByRole('textbox',{name:original.ui.reflectionLabel,exact:true}).press('ArrowLeft');await number(page,5);
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),reflectionKey),null);
 assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),reflectionKey),reflection);
 await page.reload();await number(page,5);assert.equal(await page.locator('#reflection-input').inputValue(),reflection);
 // A new tab shares reading progress, but has its own session-only reflection.
 const other=await page.context().newPage();try{await other.goto(route+'#page=5');await number(other,5);assert.equal(await other.locator('#reflection-input').inputValue(),'');await other.getByText(original.ui.finished,{exact:true}).waitFor();}finally{await other.close();}
 await page.getByRole('button',{name:original.ui.previousPage,exact:true}).click();await page.getByRole('button',{name:original.ui.previousPage,exact:true}).click();await number(page,3);
 for(const [i,material]of original.pages[2].materials.entries()){
  const card=page.locator('[data-material="'+i+'"]');await card.click();assert.equal(await card.getAttribute('aria-pressed'),'true');
  await page.locator('#selected-material strong').getByText(material.name,{exact:true}).waitFor();
  const wrong=page.locator(material.suitable?'#answer-no':'#answer-yes'),right=page.locator(material.suitable?'#answer-yes':'#answer-no');
  for(let attempt=0;attempt<3;attempt++){await wrong.click();await page.locator('#quiz-feedback').getByText(original.ui.tryAgain,{exact:true}).waitFor();assert.equal(await page.locator('#explored-text').innerText(),`Bahan diteroka: ${i} daripada 10`);}
  await page.locator('#show-answer').click();const category=material.suitable?original.pages[2].yes:original.pages[2].no;
  assert.equal(await page.locator('#quiz-feedback').innerText(),`Jawapan: ${category}. ${material.fact}`);
  await page.locator('#retry').click();await right.click();await page.locator('#quiz-feedback').getByText('Betul! Syabas! '+material.fact,{exact:true}).waitFor();
  await right.click();assert.match(await page.locator('#explored-text').innerText(),new RegExp('^Bahan diteroka: '+(i+1)+' daripada 10'));
  assert(await right.evaluate(el=>el===document.activeElement),'Feedback must preserve keyboard focus on the actual answer button');
 }
 assert.match(await page.locator('#explored-text').innerText(),/10 daripada 10/);
 await page.locator('#reader').screenshot({path:`test-results/kompos-all-materials-${width}.png`});
 await page.locator('#next-material').click();assert.equal(await page.locator('[data-material="0"]').getAttribute('aria-pressed'),'true');
 assert(await page.locator('[data-material="0"]').evaluate(el=>el===document.activeElement));
 const progressBefore=await page.evaluate(key=>localStorage.getItem(key),readKey);
 await page.locator('#reset-activity').click();assert.equal(await page.locator('#explored-text').innerText(),'Bahan diteroka: 0 daripada 10');
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),readKey),progressBefore);
 const first=page.locator('[data-material="0"]');await first.focus();await first.press('Space');assert(await first.evaluate(el=>el===document.activeElement));
 await page.locator('#page-sheet').focus();await page.keyboard.press('ArrowLeft');await number(page,2);
 await page.keyboard.press('ArrowRight');await number(page,3);await page.keyboard.press('PageUp');await number(page,2);await page.keyboard.press('PageDown');await number(page,3);
 if(width<=390){await page.keyboard.press('ArrowLeft');await number(page,2);await touch(page,-160);await number(page,3);await touch(page,160);await number(page,2);await touch(page,-130,0,true);await touch(page,0,-100);await number(page,2);}
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#page-sheet').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');await page.emulateMedia({reducedMotion:'no-preference'});
 if(width===1366){
  await page.getByRole('button',{name:original.ui.enterFullscreen,exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await images(page);await geometry(page);
  await page.getByRole('button',{name:original.ui.exitFullscreen,exact:true}).click();await page.waitForFunction(()=>!document.fullscreenElement);
  const fallback=await page.context().browser().newContext({viewport:{width:390,height:844}});
  try{
   await fallback.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Object.defineProperty(window,'localStorage',{get(){throw Error('Test unavailable storage');}});});
   await fallback.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
   const testPage=await fallback.newPage();await testPage.goto(route);await number(testPage,1);await testPage.getByRole('status').getByText(original.ui.storageWarning,{exact:true}).waitFor();
   await testPage.getByRole('button',{name:original.ui.enterFullscreen,exact:true}).click();assert(await testPage.locator('#reader').evaluate(el=>el.classList.contains('reader-fullscreen')));
   await testPage.keyboard.press('Escape');assert.equal(await testPage.locator('#reader').evaluate(el=>el.classList.contains('reader-fullscreen')),false);await geometry(testPage);
  }finally{await fallback.close();}
 }
 // Reset affects this book's visited pages only, never game/other-book saves.
 await page.getByRole('button',{name:original.ui.resetReading,exact:true}).click();await number(page,1);
 assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),readKey),[1]);
 const after=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key!=='smartlibverse_kompos_read_v1')));assert.deepEqual(after,before);
 assert.deepEqual(badNetwork,[]);page.off('request',observe);
 await writeFile(`test-results/kompos-${width}.json`,JSON.stringify({width,pages:5,materials:10,bothCategories:true,retriesWithoutLimit:true,showAnswers:true,resetPreservesReading:true,skipBeforeAnswers:true,finishWithoutActivity:true,sessionOnlyReflection:true,urbanistLoaded:true,arrows:true,swipe:width<=390?'CDP touch input':'not applicable',storageIsolation:true,fullscreen:width===1366?'native and fallback':'covered at desktop',overflow:false},null,2));
 await page.getByRole('link',{name:original.ui.back,exact:true}).click();await page.waitForURL(new URL('world/index.html?zone=library',base).href);
 await page.waitForFunction(()=>window.SMARTLIBverseWorldQA?.inspect().backgroundStatus==='ready');
 if(before.smartlibverse_demo_v1){const returned=await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_demo_v1'))),saved=JSON.parse(before.smartlibverse_demo_v1);for(const key of ['profile','read','opened','quizzes','nature','rewards','customPreserved'])assert.deepEqual(returned[key],saved[key]);}
}
