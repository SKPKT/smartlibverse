import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';

async function pageNumber(page,n){await page.locator('#pageLabel').getByText(`Halaman ${n} / 5`,{exact:true}).waitFor();}
async function loadedArt(page){
 const images=page.locator('#page img');
 for(let i=0;i<await images.count();i++){const image=images.nth(i);await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());assert(await image.evaluate(image=>image.naturalWidth>0&&!!image.alt));}
}
async function touch(page,dx,dy=0,cancel=false){
 await page.locator('#page h2').scrollIntoViewIfNeeded();
 const box=await page.locator('#page').boundingBox(),viewport=page.viewportSize();
 const x=box.x+box.width*(dx<0?.8:.2),y=Math.min(viewport.height-80,Math.max(160,box.y+200));
 const client=await page.context().newCDPSession(page);
 try{
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/5,y:y+dy*i/5}]});
  await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
 }finally{await client.detach();}
}
async function importJson(page,data,name='ujian-teks.json'){
 await page.locator('#importFile').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))});
}

// Runs only in the acceptance suite's isolated synthetic browser context.
// Never writes to the game's progress key or the user's browser profile.
export async function inspectRoket(page,base,width){
 const url=new URL('./books/roket-keajaiban/index.html',base).href;
 await page.waitForURL(url);await pageNumber(page,1);
 const original=await page.evaluate(()=>window.ROKET_BOOK_DATA);
 assert.equal(original.pages.length,5);
 const gameBefore=await page.evaluate(()=>localStorage.getItem('smartlibverse_demo_v1'));
 const fonts=await page.evaluate(async()=>{await document.fonts.load('600 16px Urbanist');await document.fonts.ready;return [...document.fonts].filter(f=>f.family.replaceAll('"','')==='Urbanist'&&f.status==='loaded').length;});
 assert(fonts>0,'Urbanist must actually load online, rather than only appear in font-family');
 const seen=new Set();
 for(let i=0;i<5;i++){
  await pageNumber(page,i+1);await loadedArt(page);
  await page.locator('#page h2').getByText(original.pages[i].title,{exact:true}).waitFor();
  assert.equal(await page.locator('#prev').isDisabled(),i===0);assert.equal(await page.locator('#next').isDisabled(),i===4);
  assert.equal(await page.locator('#dots button[aria-current="page"]').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const displayed=await page.locator('#page img').evaluateAll(images=>images.map(image=>image.getAttribute('src')));
  displayed.forEach(src=>seen.add(src));
  if(i===3)assert.deepEqual(displayed,['art/launch-step-1.webp','art/launch-step-2.webp','art/launch-step-3.webp','art/launch-step-4.webp','art/launch-hero.webp']);
  await page.locator('#reader').screenshot({path:`test-results/roket-page-${i+1}-${width}.png`});
  if(i<4){if(i===1)await page.keyboard.press('ArrowRight');else if(i===2)await page.keyboard.press('PageDown');else await page.locator('#next').click();}
 }
 assert.equal(seen.size,20,'Twenty illustrations are used; the supplied extra engine art is also retained in the build');
 await page.locator('#done').click();await page.getByRole('status').getByText(/Tahniah!/).waitFor();
 const completed=await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_roket_read_v1')));
 assert.equal(completed.completed,true);assert.equal(completed.book,'roket-keajaiban');

 await page.keyboard.press('ArrowLeft');await pageNumber(page,4);
 const text=page.locator('[data-field="pages.3.lesson"]');const initialSize=await text.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 await page.getByRole('button',{name:'Besarkan teks',exact:true}).click();
 assert(await text.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>initialSize);
 await page.getByRole('button',{name:'Kecilkan teks',exact:true}).click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Pergi ke halaman 3',exact:true}).click();
 assert.equal(await page.locator('#page').evaluate(el=>getComputedStyle(el).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
 if(width===390){await touch(page,-150);await pageNumber(page,4);await touch(page,150);await pageNumber(page,3);await touch(page,0,-100);await pageNumber(page,3);await touch(page,-100,0,true);await pageNumber(page,3);}

 await page.getByRole('button',{name:'Pergi ke halaman 1',exact:true}).click();
 for(const control of ['Edit teks buku','Eksport teks suntingan','Import teks buku','Pulihkan teks asal','Skrin penuh']){
  const el=page.locator(`button[title="${control}"]`);const bounds=await el.boundingBox();assert(bounds.width>=24&&bounds.height>=44,control);
 }
 await page.locator('#editToggle').click();const field=page.getByRole('textbox',{name:'Sunting teks: ROKET',exact:true});
 await field.fill('ROKET UJIAN');await field.press('ArrowRight');await pageNumber(page,1);
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_roket_edits_urbanist_v1')))).pages[0].title,'ROKET UJIAN');
 await page.reload();await pageNumber(page,1);await page.locator('#page h2').getByText('ROKET UJIAN',{exact:true}).waitFor();assert(await page.locator('#done').isDisabled());
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportBtn').click()]);
 assert.equal(download.suggestedFilename(),'ROKET_Teks_Urbanist_Editable.json');
 const exported=await readFile(await download.path(),'utf8'),data=JSON.parse(exported);assert.equal(data.pages[0].title,'ROKET UJIAN');assert.equal(data.pages.length,5);
 page.once('dialog',d=>d.dismiss());await page.locator('#resetBtn').click();await page.locator('#page h2').getByText('ROKET UJIAN',{exact:true}).waitFor();
 page.once('dialog',d=>d.accept());await page.locator('#resetBtn').click();await page.locator('#page h2').getByText('ROKET',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('smartlibverse_roket_edits_urbanist_v1')),null);
 // Real keyboard-accessible file chooser, followed by JSON round-trip read-back.
 const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.locator('#importBtn').press('Enter')]);
 await chooser.setFiles({name:'ujian-teks.json',mimeType:'application/json',buffer:Buffer.from(exported)});
 await page.getByRole('status').getByText('Teks berjaya diimport. Tiada ilustrasi diubah.',{exact:true}).waitFor();
 await page.locator('#page h2').getByText('ROKET UJIAN',{exact:true}).waitFor();
 for(const invalid of ['{invalid',JSON.stringify({pages:data.pages.slice(0,4)}),' '.repeat(150001)]){
  await importJson(page,invalid);await page.getByRole('status').getByText(/^Import gagal:/).waitFor();
  await page.locator('#page h2').getByText('ROKET UJIAN',{exact:true}).waitFor();
 }
 data.pages[0].title='<img src=x onerror="window.roketInjected=true">';
 await importJson(page,data);await page.locator('#page h2').getByText(data.pages[0].title,{exact:true}).waitFor();
 assert.equal(await page.locator('#page h2 img, #page script').count(),0);assert.equal(await page.evaluate(()=>window.roketInjected),undefined);
 await page.locator('#editToggle').click();
 // Simulated rich paste verifies plain-text insertion without touching the OS clipboard.
 await page.locator('[data-field="pages.0.title"]').evaluate(node=>{
  node.focus();const range=document.createRange();range.selectNodeContents(node);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
  const clipboard=new DataTransfer();clipboard.setData('text/plain','TEKS TAMPALAN');clipboard.setData('text/html','<img src=x onerror="window.roketInjected=true">');
  node.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:clipboard}));
 });
 await page.locator('#page h2').getByText('TEKS TAMPALAN',{exact:true}).waitFor();assert.equal(await page.locator('#page h2 img').count(),0);
 await page.locator('[data-field="pages.0.title"]').fill('A'.repeat(2100));assert.equal((await page.locator('#page h2').innerText()).length,2000);
 page.once('dialog',d=>d.accept());await page.locator('#resetBtn').click();await page.locator('#editToggle').click();
 await page.locator('#page h2').getByText('ROKET',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('smartlibverse_demo_v1')),gameBefore,'Reader must never mutate game progress, XP, badges or quizzes');
 if(width===1366){
  await page.getByRole('button',{name:'Skrin penuh',exact:true}).click();await page.waitForFunction(()=>document.fullscreenElement?.id==='reader');
  await page.getByRole('button',{name:'Skrin penuh',exact:true}).click();await page.waitForFunction(()=>!document.fullscreenElement);
  // A separately isolated context validates readable fallback when Google Fonts is unavailable.
  const fallback=await page.context().browser().newContext({viewport:{width:390,height:844}});
  try{await fallback.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());const offline=await fallback.newPage();await offline.goto(url);await pageNumber(offline,1);await offline.locator('#next').click();await pageNumber(offline,2);assert((await offline.locator('#page').boundingBox()).width>0);assert.equal(await offline.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}finally{await fallback.close();}
 }
 await writeFile(`test-results/roket-${width}.json`,JSON.stringify({width,pages:5,illustrationsDisplayed:seen.size,urbanistLoaded:true,arrows:true,swipe:width===390?'CDP touch input':'not applicable',editing:true,jsonRoundTrip:true,reset:true,safeText:true,progressUnchanged:true},null,2));
 await page.getByRole('link',{name:'Kembali ke Perpustakaan Maya',exact:true}).click();await page.waitForURL(new URL('./world/index.html?zone=library',base).href);
 await page.waitForFunction(()=>window.SMARTLIBverseWorldQA?.inspect().backgroundStatus==='ready');
 const returned=await page.evaluate(()=>JSON.parse(localStorage.getItem('smartlibverse_demo_v1'))),before=JSON.parse(gameBefore);
 for(const key of ['profile','opened','read','quizzes','nature','rewards','customPreserved'])assert.deepEqual(returned[key],before[key],key+' must survive the return to the library');
}
