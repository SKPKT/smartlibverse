const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const engine=import('../js/state.mjs'),visuals=import('../data/visuals.mjs');

test('All seven independent backgrounds and exact transparent library assets are packaged',async()=>{
  const {backgrounds}=await visuals;assert.equal(new Set(Object.values(backgrounds)).size,7);
  for(const name of Object.values(backgrounds))assert(fs.existsSync(path.join(root,name)));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/hd2d/manifest.json'),'utf8'));
  assert.equal(manifest.files.length,16);
  for(const e of manifest.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,e.path))).digest('hex'),e.sha256,e.path);
  for(const id of ['cerita_bergambar','sains_dan_alam','pengetahuan']){
    const png=fs.readFileSync(path.join(root,`assets/hd2d/library/${id}.png`));assert.equal(png[25],6,'RGBA PNG must retain transparency');
  }
});
test('Station identities, books and safe approach points survive the new visual geometry',async()=>{
  const {zones,books}=await import('../data/content.mjs'),{targets}=await import('../js/world.mjs');
  const {fresh,assistedRoute,collision,sanitize}=await engine,s=fresh();s.location={zone:'library',x:500,y:510};
  const objects=zones.find(z=>z.id==='library').objects;
  assert.deepEqual(objects.map(o=>o[0]),['cerita','alam','umum']);
  assert.deepEqual(objects.map(o=>o.slice(2,4)),[[250,270],[500,246],[750,270]]);
  for(const target of targets(s).filter(t=>!t.portal)){
    assert.equal(books.filter(b=>b.shelf===target.id).length,1);
    assert.equal(collision(target.x,target.y,objects),false);
    const route=assistedRoute(s.location,target,objects);assert(route.length);
    let last=s.location;for(const next of route){for(let i=0;i<=100;i++)assert.equal(collision(last.x+(next.x-last.x)*i/100,last.y+(next.y-last.y)*i/100,objects),false);last=next;}
  }
  s.opened=['taman','kancil'];s.read=['taman'];s.rewards=['books','read'];s.location={zone:'library',x:250,y:287};
  const restored=sanitize(s);assert.deepEqual(restored.read,s.read);assert.deepEqual(restored.rewards,s.rewards);assert.equal(collision(restored.location.x,restored.location.y,objects),false);
});
test('Holograms have independent phases, a larger center, proportional fitting and static reduced motion',async()=>{
  const {libraryStations:v,stationMotion,contain}=await visuals;
  assert(v.alam.height>v.cerita.height&&v.alam.width>v.umum.width);
  const poses=Object.keys(v).map(id=>stationMotion(id,900));assert.equal(new Set(poses.map(x=>x.bob)).size,3);
  for(const id of Object.keys(v)){const fit=contain(480,620,v[id].width,v[id].height);assert(fit.width<=v[id].width+1e-8&&fit.height<=v[id].height+1e-8);assert(Math.abs(fit.width/fit.height-480/620)<1e-8);assert.deepEqual(stationMotion(id,0,true),stationMotion(id,9999,true));}
});
function recordingCanvas(width=1000,height=680){
  const calls=[];const gradient={addColorStop(){}};
  const ctx=new Proxy({}, {get(target,key){if(key==='measureText')return text=>({width:text.length*8});if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;return target[key]||((...args)=>calls.push([key,...args]));},set(target,key,value){target[key]=value;return true;}});
  return {width,height,clientWidth:width,clientHeight:height,calls,getContext:()=>ctx};
}
function imageFactory(fail=false){return()=>({complete:!fail,naturalWidth:fail?0:480,naturalHeight:fail?0:620,set src(url){this.url=url;if(!fail)this.onload?.();}});}
test('Actual renderer caches scenery separately, depth sorts avatar, caps effects and reuses decoded images',async()=>{
  const {createRenderer}=await import('../js/world.mjs'),{fresh}=await engine,s=fresh();s.location={zone:'library',x:500,y:260};
  const screen=recordingCanvas(),map=recordingCanvas(150,110),layers=[];
  let reduced=false;const render=createRenderer(screen,map,{makeImage:imageFactory(),makeCanvas:()=>{const c=recordingCanvas();layers.push(c);return c;},reducedMotion:()=>reduced});
  render(s,0,false,'front');const first=render.inspect();
  assert(first.depth.indexOf('alam')<first.depth.indexOf('avatar'));assert(first.depth.indexOf('avatar')<first.depth.indexOf('cerita'));
  const copied=layers[0].calls.filter(x=>x[0]==='drawImage');assert.equal(copied.length,1);assert(copied[0][1].url.includes('library-hall'));
  assert(!layers[0].calls.some(x=>x[0]==='drawImage'&&/avatar|bergambar|sains|pengetahuan/.test(x[1]?.url||'')));
  const sprites=()=>screen.calls.filter(x=>x[0]==='drawImage'&&x[1]?.url?.includes('/library/')&&!x[1].url.includes('hall'));
  const before=sprites().map(x=>x[3]);screen.calls.length=0;render(s,900,true,'left');assert.notDeepEqual(sprites().map(x=>x[3]),before);
  for(let i=0;i<50;i++)render(s,i*16,true,'front');assert.equal(render.inspect().images,first.images);assert.equal(layers.length,1);assert.equal(render.inspect().particles,11);
  reduced=true;render(s,1000,true,'front');assert.equal(render.inspect().particles,0);assert(render.inspect().stations.every(x=>x.bob===0));
});
test('Missing images keep the renderer playable; WebP fallback is bounded and cached',async()=>{
  const {createImageCache}=await import('../js/image-cache.mjs');const made=[];const cache=createImageCache(()=>{const image={set src(url){made.push(url);}};return image;});
  const entry=cache.get('sprite.webp','sprite.png');entry.image.onerror();entry.image.onerror();assert.equal(entry.status,'error');assert.deepEqual(made,['sprite.webp','sprite.png']);assert.equal(cache.get('sprite.webp'),entry);
  const {createRenderer}=await import('../js/world.mjs'),{fresh}=await engine,s=fresh();s.location.zone='library';
  const render=createRenderer(recordingCanvas(),recordingCanvas(150,110),{makeImage:imageFactory(true),makeCanvas:()=>recordingCanvas(),reducedMotion:()=>false});
  assert.doesNotThrow(()=>render(s,100,false,'front'));assert.equal(render.inspect().backgroundStatus,'loading');
});
