import {zones,unlocked} from './world-data.mjs';
// Rendered geometry and collision objects are separate from background artwork.
export const portals=s=>s.location.zone==='plaza'?zones.filter(z=>z.id!=='plaza').map((z,i)=>({id:z.id,name:z.name,x:110+i*156,y:565,portal:true})): [{id:'plaza',name:'Kembali ke Plaza',x:500,y:590,portal:true}];
export const targets=s=>[...zones.find(z=>z.id===s.location.zone).objects.map(o=>({id:o[0],name:o[1],x:o[2],y:o[3]+68,object:o})),...portals(s)];
export function nearest(s){return targets(s).map(t=>({...t,d:Math.hypot(s.location.x-t.x,s.location.y-t.y)})).sort((a,b)=>a.d-b.d)[0];}
export function createRenderer(canvas,map){
 const c=canvas.getContext('2d'),m=map.getContext('2d'),images={};
 for(const [key,url] of Object.entries({room:'./assets/library-room.webp',sprites:'./assets/avatar-atlas.webp',robot:'./libra-robot.webp'})){const im=new Image();im.src=url;images[key]=im;}
 const ready=im=>im.complete&&im.naturalWidth>0;
 function label(text,x,y,color='#07503e'){c.font='700 15px Urbanist, sans-serif';const w=c.measureText(text).width+24;c.fillStyle=color;c.beginPath();c.roundRect(x-w/2,y-22,w,30,12);c.fill();c.strokeStyle='#e4c779';c.lineWidth=2;c.stroke();c.fillStyle='#fff6dc';c.textAlign='center';c.fillText(text,x,y);}
 function object(o){const [id,name,x,y,type]=o;c.save();c.translate(x,y);c.fillStyle='#0003';c.beginPath();c.ellipse(0,8,65,18,0,0,Math.PI*2);c.fill();
  if(type==='shelf'){c.fillStyle='#5b3422';c.fillRect(-67,-112,134,124);c.fillStyle='#c78b4c';for(let row=0;row<3;row++){c.fillRect(-70,-110+row*40,140,5);for(let b=0;b<9;b++){c.fillStyle=['#245c4d','#b54838','#e0b44d','#508a99'][b%4];c.fillRect(-59+b*14,-103+row*40,10,29);}}c.fillStyle='#d4a15a';c.fillRect(-72,5,144,8);}
  else if(type==='robot'&&ready(images.robot)){c.drawImage(images.robot,-43,-95,86,86);}
  else{c.font=type==='tree'?'88px serif':'66px serif';c.textAlign='center';c.fillText(({tree:'🌳',flower:'🌺',butterfly:'🦋',pond:'🐟',board:'📜',book:'📖',desk:'🧩',trophy:'🏆',robot:'🤖'})[type],0,0);}
  c.strokeStyle='#e8c763';c.lineWidth=3;c.beginPath();c.ellipse(0,55,22,8,0,0,Math.PI*2);c.stroke();c.restore();label(name,x,y+94);
 }
 return function render(s,time,moving,direction){if(!c||!m)return;// Match the visible canvas ratio so the browser does not crop the camera a second time.
  const vw = Math.min(1000, Math.max(1, Math.round(canvas.clientWidth * 680 / (canvas.clientHeight || 680))));if(canvas.width!==vw)canvas.width=vw;if(canvas.height!==680)canvas.height=680;const cam=Math.max(0,Math.min(1000-vw,s.location.x-vw/2));c.clearRect(0,0,vw,680);c.save();c.translate(-cam,0);
  const zone=zones.find(z=>z.id===s.location.zone);c.fillStyle=zone.color;c.fillRect(0,0,1000,680);if(ready(images.room)&&zone.id!=='garden'){c.drawImage(images.room,0,0,1000,680);c.fillStyle=zone.id==='secret'?'#11274255':'#00000012';c.fillRect(0,0,1000,680);}else{c.fillStyle=zone.id==='garden'?'#8db779':'#ead0a1';c.fillRect(30,155,940,500);c.strokeStyle='#ffffff22';for(let x=30;x<1000;x+=70){c.beginPath();c.moveTo(x,155);c.lineTo(x,680);c.stroke();}for(let y=155;y<680;y+=50){c.beginPath();c.moveTo(30,y);c.lineTo(970,y);c.stroke();}}
  c.fillStyle='#07664b99';c.fillRect(420,170,160,440);c.strokeStyle='#d9ba67';c.lineWidth=3;c.strokeRect(426,176,148,428);
  const sorted=zone.objects.map(o=>({y:o[3],draw:()=>object(o)}));
  sorted.push({y:s.location.y,draw:()=>{const x=s.location.x,y=s.location.y;c.fillStyle='#0004';c.beginPath();c.ellipse(x,y+3,24,8,0,0,Math.PI*2);c.fill();const im=images.sprites;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const bob=moving&&!reduced?Math.sin(time/100)*3:0;if(ready(im)){const cell=direction==='up'?3:direction==='left'?1:direction==='right'?2:0;const cw=im.naturalWidth/4,ch=im.naturalHeight/2;c.drawImage(im,cell*cw,s.profile.avatar==='perempuan'?ch:0,cw,ch,x-47,y-126+bob,94,126);}else{c.font='64px serif';c.textAlign='center';c.fillText(s.profile.avatar==='perempuan'?'🧕':'👦',x,y);} }});
  sorted.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());for(const p of portals(s)){const lock=p.id==='secret'&&!unlocked(s);c.fillStyle=lock?'#555b53':'#087a64';c.strokeStyle='#f0cf72';c.lineWidth=4;c.beginPath();c.roundRect(p.x-35,p.y-25,70,52,15);c.fill();c.stroke();label((lock?'🔒 ':'✦ ')+p.name,p.x,p.y+53);}
  c.restore();m.fillStyle='#113f33';m.fillRect(0,0,150,110);m.strokeStyle='#b99e5a';m.strokeRect(6,22,138,78);m.fillStyle='#ffe0a0';m.font='10px sans-serif';m.textAlign='center';m.fillText(zone.name,75,14);for(const t of targets(s)){m.fillStyle=t.portal?'#e6be63':'#a9d6b1';m.fillRect(t.x*.14+5,t.y*.12+21,5,5);}m.fillStyle='#fff';m.beginPath();m.save();m.translate(s.location.x*.14+7,s.location.y*.12+23);m.rotate(({up:0,right:Math.PI/2,front:Math.PI,left:-Math.PI/2})[direction]||0);m.moveTo(0,-6);m.lineTo(4,4);m.lineTo(-4,4);m.closePath();m.fill();m.restore();
 };
}
