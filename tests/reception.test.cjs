const test=require('node:test'),assert=require('node:assert/strict');

function canvas(){
 const calls=[],gradient={addColorStop(){}};
 const ctx=new Proxy({}, {get(target,key){
  if(key==='createRadialGradient')return()=>gradient;
  return target[key]||((...args)=>calls.push([key,...args]));
 },set(target,key,value){target[key]=value;return true;}});
 return {ctx,calls};
}
function images(fail=false){
 const requests=[];
 const makeImage=()=>({complete:!fail,naturalWidth:fail?0:480,naturalHeight:fail?0:320,
  set src(url){this.url=url;requests.push(url);if(!fail)this.onload?.();}});
 return {makeImage,requests};
}

test('Reception renders LIBRA behind the desk, with separate tablet, lamps and books; decoded assets are reused',async()=>{
 const {createPlazaLayers}=await import('../js/plaza-layers.mjs');
 const im=images(),layers=createPlazaLayers({makeImage:im.makeImage}),{ctx,calls}=canvas();
 const view={left:163,top:0,scale:.45};
 const reception=layers.objects(ctx,view).find(o=>o.id==='libra');
 assert.equal(reception.y,800,'Keep the existing avatar depth-sort boundary');
 reception.draw();
 const drawn=calls.filter(c=>c[0]==='drawImage');
 assert.deepEqual(drawn.map(c=>c[1].url.split('/').pop()),[
  'libra_ai.png','reception-desk-restored.webp','reception-books.webp',
  'reception-lamp.webp','reception-tablet.webp','reception-lamp.webp'
 ]);
 assert(drawn[0][2]<drawn[1][2]+drawn[1][4]/2,'Robot remains on the left of the counter');
 const robotBottom=drawn[0][3]+drawn[0][5],deskTop=drawn[1][3],deskBottom=deskTop+drawn[1][5];
 assert(deskTop<robotBottom&&deskBottom>=robotBottom,'Desk must cover the lower body');
 assert(drawn[0][3]<deskTop,'Face and graduation cap remain above the countertop');
 assert(calls.some(c=>c[0]==='translate'&&c[1]===-view.left*view.scale));
 assert(calls.some(c=>c[0]==='scale'&&c[1]===view.scale&&c[2]===view.scale));
 const initial=im.requests.length;
 for(let frame=0;frame<100;frame++)reception.draw();
 assert.equal(im.requests.length,initial);assert.equal(initial,6,'Two lamps share one decoded sprite');
 assert(!im.requests.some(url=>url.endsWith('/reception-counter.webp')),'Old replacement is not rendered');
});

test('Reception asset failure preserves a bounded foreground counter and other objects without throwing',async()=>{
 const {createPlazaLayers}=await import('../js/plaza-layers.mjs');
 const im=images(true),layers=createPlazaLayers({makeImage:im.makeImage}),{ctx,calls}=canvas();
 const objects=layers.objects(ctx,{left:0,top:0,scale:1});
 assert.deepEqual(objects.map(o=>o.id),['libra','map']);
 assert.doesNotThrow(()=>objects.forEach(o=>o.draw()));
 assert(calls.some(c=>c[0]==='roundRect'&&c[1]===8&&c[3]===480));
 assert.equal(im.requests.length,6,'Failed images must not start an unbounded reload loop');
});
