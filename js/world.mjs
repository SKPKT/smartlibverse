import {zones,unlocked} from './world-data.mjs';
import {backgrounds,libraryStations,stationMotion,contain,TAU} from '../data/visuals.mjs';
import {createImageCache,imageReady} from './image-cache.mjs';

// Gameplay geometry is independent from sprite size, light effects and floating offsets.
export const portals=s=>s.location.zone==='plaza'?zones.filter(z=>z.id!=='plaza').map((z,i)=>({id:z.id,name:z.name,x:110+i*156,y:565,portal:true})): [{id:'plaza',name:'Kembali ke Plaza',x:500,y:590,portal:true}];
export const targets=s=>[...zones.find(z=>z.id===s.location.zone).objects.map(o=>({id:o[0],name:o[1],x:o[2],y:o[3]+68,object:o})),...portals(s)];
export function nearest(s){return targets(s).map(t=>({...t,d:Math.hypot(s.location.x-t.x,s.location.y-t.y)})).sort((a,b)=>a.d-b.d)[0];}
const readyImage=entry=>imageReady(entry)?entry.image:null;

export function createRenderer(canvas,map,options={}){
  const c=canvas.getContext('2d'),m=map.getContext('2d');
  const cache=createImageCache(options.makeImage),environments=new Map();
  const makeCanvas=options.makeCanvas||(()=>document.createElement('canvas'));
  const boy=cache.get('./assets/start-plaza/avatar_lelaki_production_walk4.png');
  const girl=cache.get('./assets/start-plaza/avatar_perempuan_production_walk4.png');
  const robot=cache.get('./assets/start-plaza/libra_ai.png');
  const reducedMotion=options.reducedMotion||(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  let snapshot={};

  // 1: only immutable scenery enters the bounded offscreen environment cache.
  function environment(zone){
    const url=backgrounds[zone.id],entry=cache.get(url,zone.id==='library'?url.replace('.webp','.png'):undefined);
    let saved=environments.get(zone.id);const image=readyImage(entry);
    if(!saved||saved.image!==image){
      const layer=saved?.layer||makeCanvas();layer.width=1000;layer.height=680;
      const b=layer.getContext('2d');b.fillStyle='#17375e';b.fillRect(0,0,1000,680);
      if(image){
        const scale=Math.max(1000/image.naturalWidth,680/image.naturalHeight);
        const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
        b.drawImage(image,(1000-w)/2,(680-h)/2,w,h);
      }else{
        const g=b.createLinearGradient(0,0,0,680);g.addColorStop(0,'#142c55');g.addColorStop(1,'#48779f');b.fillStyle=g;b.fillRect(0,0,1000,680);
        b.strokeStyle='#8edbf244';for(let x=0;x<=1000;x+=80){b.beginPath();b.moveTo(x,320);b.lineTo(x,680);b.stroke();}
        for(let y=320;y<680;y+=60){b.beginPath();b.moveTo(0,y);b.lineTo(1000,y);b.stroke();}
      }
      saved={layer,image};environments.set(zone.id,saved);
    }
    return {layer:saved.layer,status:entry.status};
  }
  function badge(text,x,y,active=false){
    c.save();c.font=`${active?700:600} 15px Urbanist,system-ui,sans-serif`;
    const w=Math.min(235,c.measureText(text).width+22);
    c.fillStyle=active?'#153960ee':'#0b2344e8';c.strokeStyle=active?'#f5ca70':'#77dcecb0';c.lineWidth=1;
    c.beginPath();c.roundRect(x-w/2,y-20,w,29,8);c.fill();c.stroke();c.fillStyle='#f5fbff';c.textAlign='center';c.fillText(text,x,y,215);c.restore();
  }
  // 3/4: ground shadows and energy geometry remain independent of scenery and sprites.
  function ring(x,y,focus,time,reduced,major=false,phase=0){
    c.save();c.translate(x,y);const r=major?61:48;
    c.fillStyle='#031b3c55';c.beginPath();c.ellipse(0,1,r+5,14,0,0,TAU);c.fill();
    c.strokeStyle=focus?'#ffe2a0':'#69ecff';c.lineWidth=focus?3:1.5;c.shadowColor='#42dfff';c.shadowBlur=focus?14:7;
    c.beginPath();c.ellipse(0,0,r,13,0,0,TAU);c.stroke();
    if(major){const a=reduced?0:time*TAU/8000+phase;c.beginPath();c.ellipse(0,0,r+7,18,0,a,a+Math.PI*.65);c.lineWidth=3;c.stroke();}
    c.restore();
  }
  function drawBook(x,y,focus){
    c.save();c.translate(x,y);c.fillStyle='#194b83';c.strokeStyle=focus?'#fff0b7':'#72eafa';c.lineWidth=2;
    c.beginPath();c.moveTo(-40,-47);c.quadraticCurveTo(-18,-55,0,-42);c.quadraticCurveTo(18,-55,40,-47);c.lineTo(40,2);c.quadraticCurveTo(17,-5,0,7);c.quadraticCurveTo(-17,-5,-40,2);c.closePath();c.fill();c.stroke();
    c.strokeStyle='#d4f7ff';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-32,-34+i*10);c.lineTo(-8,-29+i*10);c.moveTo(8,-29+i*10);c.lineTo(32,-34+i*10);c.stroke();}
    c.beginPath();c.moveTo(0,-41);c.lineTo(0,6);c.stroke();c.restore();
  }
  function hologram(o,time,reduced,focus){
    const [id,,x,y]=o,v=libraryStations[id],a=stationMotion(id,time,reduced);
    const image=readyImage(cache.get(v.sprite,v.sprite.replace('.webp','.png')));
    c.save();
    if(image){const fit=contain(image.naturalWidth,image.naturalHeight,v.width,v.height);c.imageSmoothingEnabled=false;c.drawImage(image,x-fit.width/2,y+24-fit.height+a.bob,fit.width,fit.height);}
    else drawBook(x,y-25,focus);
    c.restore();
    // Separate book-edge, globe highlight and bulb pulse; the full artwork is never spun.
    c.save();c.strokeStyle=id==='umum'?'#fff3ba':'#bafaff';c.globalAlpha=.15+a.pulse*.18;c.lineWidth=1.5;
    if(id==='cerita'){c.beginPath();c.moveTo(x-24,y-61+a.bob);c.quadraticCurveTo(x,y-69+a.bob,x+24,y-61+a.bob);c.stroke();}
    else if(id==='alam'){c.beginPath();c.ellipse(x+Math.sin(a.orbit)*24,y-85+a.bob,7,28,0,0,TAU);c.stroke();}
    else{c.beginPath();c.arc(x,y-105+a.bob,17+a.pulse*3,0,TAU);c.stroke();}
    c.restore();
  }
  // 5: analytical particle positions; eleven maximum, no accumulating arrays or timers.
  function particles(o,time,reduced){
    if(reduced)return;const [id,,x,y]=o,v=libraryStations[id];
    c.save();c.strokeStyle=id==='umum'?'#ffe0a0':'#bdfaff';c.lineWidth=1;
    for(let i=0;i<v.particles;i++){
      const p=(time/(3300+i*217)+i/v.particles+v.phase)%1;
      const xx=x+Math.sin(i*2.4+v.phase)*48+Math.sin(p*TAU)*5,yy=y-20-p*(id==='alam'?145:115);c.globalAlpha=Math.sin(p*Math.PI)*.38;
      if(id==='cerita')c.strokeRect(xx,yy,4,6);
      else if(id==='alam'){c.beginPath();c.ellipse(xx,yy,5,2,i,0,TAU);c.stroke();}
      else{c.beginPath();c.moveTo(xx-3,yy);c.lineTo(xx+3,yy);c.moveTo(xx,yy-3);c.lineTo(xx,yy+3);c.stroke();}
    }c.restore();
  }
  // Native vector station props for the other zones, separate from their scenic images.
  function prop(o,focus){
    const [,,,y,type]=o,x=o[2];c.save();c.translate(x,y);c.lineWidth=3;c.strokeStyle=focus?'#ffdd8c':'#7adff2';
    if(type==='robot'&&readyImage(robot)){const image=robot.image,fit=contain(image.naturalWidth,image.naturalHeight,100,130);c.drawImage(image,-fit.width/2,15-fit.height,fit.width,fit.height);}
    else if(type==='book')drawBook(0,-20,focus);
    else if(type==='trophy'){
      c.fillStyle='#f5ca70';c.beginPath();c.moveTo(-30,-90);c.lineTo(30,-90);c.quadraticCurveTo(25,-40,0,-40);c.quadraticCurveTo(-25,-40,-30,-90);c.fill();
      c.strokeStyle='#fff1bd';c.strokeRect(-4,-40,8,30);c.fillRect(-27,-10,54,9);c.beginPath();c.arc(-28,-72,18,Math.PI/2,Math.PI*1.5);c.stroke();c.beginPath();c.arc(28,-72,18,-Math.PI/2,Math.PI/2);c.stroke();
    }else if(type==='desk'){
      c.fillStyle='#153d76';c.beginPath();c.moveTo(0,-105);c.lineTo(45,-60);c.lineTo(0,-15);c.lineTo(-45,-60);c.closePath();c.fill();c.stroke();c.fillStyle='#eafaff';c.font='700 45px Urbanist';c.textAlign='center';c.fillText('?',0,-42);
    }else if(type==='tree'){
      c.fillStyle='#b49b70';c.fillRect(-7,-68,14,76);c.fillStyle='#4badae';for(const [xx,yy,r]of [[0,-96,37],[-29,-70,29],[29,-70,29]]){c.beginPath();c.arc(xx,yy,r,0,TAU);c.fill();c.stroke();}
    }else if(type==='flower'){
      c.beginPath();c.moveTo(0,4);c.lineTo(0,-60);c.stroke();c.fillStyle='#94dbff';for(let i=0;i<6;i++){c.beginPath();c.ellipse(Math.cos(i*TAU/6)*17,-65+Math.sin(i*TAU/6)*17,12,19,i*TAU/6,0,TAU);c.fill();}c.fillStyle='#f5ca70';c.beginPath();c.arc(0,-65,10,0,TAU);c.fill();
    }else if(type==='butterfly'){
      c.fillStyle='#a8c9ff';for(const sign of [-1,1]){c.beginPath();c.ellipse(sign*22,-55,23,34,sign*.5,0,TAU);c.fill();c.stroke();}c.fillStyle='#f5ca70';c.fillRect(-4,-80,8,54);
    }else if(type==='pond'){
      c.fillStyle='#236ca1';c.beginPath();c.ellipse(0,-15,57,29,0,0,TAU);c.fill();c.stroke();c.strokeStyle='#bbf3ff';c.beginPath();c.ellipse(0,-15,35,12,0,0,TAU);c.stroke();
    }else{
      c.fillStyle='#173c70';c.fillRect(-42,-86,84,75);c.strokeRect(-42,-86,84,75);c.fillStyle='#caedff';for(let i=0;i<4;i++)c.fillRect(-29,-70+i*13,58-i*7,3);c.fillStyle='#c6b18a';c.fillRect(-4,-11,8,25);
    }c.restore();
  }
  function avatar(s,time,moving,direction,reduced){
    const {x,y}=s.location,image=readyImage(s.profile.avatar==='perempuan'?girl:boy);
    c.save();c.fillStyle='#05152d66';c.beginPath();c.ellipse(x,y+3,23,7,0,0,TAU);c.fill();
    if(image){const row=direction==='up'?1:direction==='left'?2:direction==='right'?3:0,frame=moving&&!reduced?Math.floor(time/145)%4:0;
      c.imageSmoothingEnabled=false;const h=126,w=h*256/420;c.drawImage(image,frame*256,row*420,256,420,x-w/2,y-h*(405/420),w,h);
    }else{c.fillStyle='#c9edff';c.beginPath();c.arc(x,y-50,17,0,TAU);c.fill();c.fillRect(x-15,y-35,30,34);}
    c.restore();
  }
  function returnPortal(p,s,time,reduced){
    const lock=p.id==='secret'&&!unlocked(s);ring(p.x,p.y,false,time,reduced);
    c.save();c.strokeStyle=lock?'#a4b1c6':'#82edff';c.lineWidth=3;c.fillStyle='#0e2c59c9';c.beginPath();c.roundRect(p.x-34,p.y-57,68,58,25);c.fill();c.stroke();c.restore();badge((lock?'🔒 ':'↗ ')+p.name,p.x,p.y+34);
  }
  // 9: independent minimap pass; semantic DOM counters/controls remain accessible.
  function minimap(s,zone){
    m.clearRect(0,0,150,110);m.fillStyle='#0b2141';m.fillRect(0,0,150,110);m.strokeStyle='#76cde2';m.strokeRect(6,22,138,78);m.fillStyle='#f5ca70';m.font='10px Urbanist,sans-serif';m.textAlign='center';m.fillText(zone.name,75,14);
    for(const t of targets(s)){m.fillStyle=t.portal?'#f5ca70':'#82edff';m.fillRect(t.x*.14+5,t.y*.12+21,5,5);}m.fillStyle='#fff';m.beginPath();m.arc(s.location.x*.14+7,s.location.y*.12+23,4,0,TAU);m.fill();
  }
  const render=function(s,time,moving,direction){
    if(!c||!m)return;
    const vw=Math.min(1000,Math.max(1,Math.round(canvas.clientWidth*680/(canvas.clientHeight||680))));
    if(canvas.width!==vw)canvas.width=vw;if(canvas.height!==680)canvas.height=680;
    const cam=Math.max(0,Math.min(1000-vw,s.location.x-vw/2)),zone=zones.find(z=>z.id===s.location.zone),reduced=reducedMotion();
    const background=environment(zone),n=nearest(s),active=n?.d<=100?n.id:null;
    c.clearRect(0,0,vw,680);c.save();c.translate(-cam,0);
    c.drawImage(background.layer,0,0); // 1/2 static scenery and its architectural detail.
    for(const o of zone.objects)ring(o[2],o[3]+42,o[0]===active,time,reduced,zone.id==='library'&&o[0]==='alam',libraryStations[o[0]]?.phase||0);
    const depth=zone.objects.map(o=>({id:o[0],y:o[3],draw:()=>zone.id==='library'?hologram(o,time,reduced,o[0]===active):prop(o,o[0]===active)}));
    for(const p of portals(s))depth.push({id:'portal:'+p.id,y:p.y,draw:()=>returnPortal(p,s,time,reduced)});
    depth.push({id:'avatar',y:s.location.y,draw:()=>avatar(s,time,moving,direction,reduced)});
    depth.sort((a,b)=>a.y-b.y).forEach(layer=>layer.draw()); // 3/6/7 depth-sorted objects, avatar and foreground.
    if(zone.id==='library')for(const o of zone.objects)particles(o,time,reduced); // 5 capped motes.
    for(const o of zone.objects)if(vw>=700||o[0]===active)badge(o[1],o[2],o[3]+98,o[0]===active); // 8 indicators.
    c.restore();minimap(s,zone);
    snapshot={zone:zone.id,position:{...s.location},background:backgrounds[zone.id],backgroundStatus:background.status,active,depth:depth.map(x=>x.id),camera:cam,reduced,images:cache.size,particles:zone.id==='library'&&!reduced?11:0,
      stations:zone.id==='library'?zone.objects.map(o=>({id:o[0],status:cache.get(libraryStations[o[0]].sprite).status,...stationMotion(o[0],time,reduced)})):[]};
  };
  render.inspect=()=>({...snapshot});return render;
}
