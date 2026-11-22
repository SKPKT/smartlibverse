import {createImageCache,imageReady} from './image-cache.mjs';
const TAU=Math.PI*2;
// Foyer coordinates, not screen pixels: the existing camera scales every part together.
// The counter occludes LIBRA's lower body; tabletop props never get baked into scenery.
export const receptionParts=[
  {id:'robot',url:'./assets/start-plaza/libra_ai.png',x:138,bottom:755,height:345},
  {id:'counter',url:'./assets/hd2d/props/reception-desk-restored.webp',x:8,bottom:790,width:480},
  {id:'books',url:'./assets/hd2d/props/reception-books.webp',x:124,bottom:650,width:86},
  {id:'left-lamp',url:'./assets/hd2d/props/reception-lamp.webp',x:73,bottom:650,height:89},
  {id:'tablet',url:'./assets/hd2d/props/reception-tablet.webp',x:357,bottom:632,width:114},
  {id:'right-lamp',url:'./assets/hd2d/props/reception-lamp.webp',x:447,bottom:607,height:62}
];
// Clean foyer scenery has no NPC, map or active portal energy baked into it.
export function createPlazaLayers({makeImage}={}){
  const images=createImageCache(makeImage);
  const reception=receptionParts.map(part=>({...part,entry:images.get(part.url)}));
  const map=images.get('./assets/hd2d/props/world-map.webp');
  function world(ctx,view,paint){ctx.save();ctx.translate(-view.left*view.scale,-view.top*view.scale);ctx.scale(view.scale,view.scale);paint();ctx.restore();}
  function ground(ctx,view,time,reduced){world(ctx,view,()=>{
    for(const [i,x]of [546,841,1137].entries()){
      const a=reduced?0.45:0.45+Math.sin(time/2300+i*1.3)*.08;
      ctx.save();ctx.globalAlpha=a;const glow=ctx.createRadialGradient(x,465,4,x,465,90);glow.addColorStop(0,'#6aefff');glow.addColorStop(1,'#47b9ff00');ctx.fillStyle=glow;ctx.fillRect(x-90,345,180,200);
      ctx.strokeStyle=i===0?'#d6baff':'#99f7ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,430,58,106,0,Math.PI,TAU);ctx.stroke();
      if(!reduced)for(let p=0;p<3;p++){const t=(time/6000+p/3+i*.2)%1;ctx.globalAlpha=Math.sin(t*Math.PI)*.35;ctx.fillStyle='#e0faff';ctx.fillRect(x+Math.sin(p*2+i)*36,535-t*170,3,3);}
      ctx.restore();
    }
  });}
  function receptionist(ctx){
    for(const part of reception){
      if(imageReady(part.entry)){
        const im=part.entry.image;
        const w=part.width??part.height*im.naturalWidth/im.naturalHeight;
        const h=part.height??part.width*im.naturalHeight/im.naturalWidth;
        ctx.drawImage(im,part.x,part.bottom-h,w,h);
      }else if(part.id==='counter'){
        // Bounded fallback keeps the same foreground occlusion while the prop loads.
        ctx.fillStyle='#153967';ctx.beginPath();ctx.roundRect(8,646,480,143,18);ctx.fill();
        ctx.fillStyle='#f0cc7a';ctx.fillRect(8,636,480,18);ctx.fillRect(8,778,480,10);
        ctx.strokeStyle='#e9d198';ctx.lineWidth=3;ctx.strokeRect(310,665,58,90);
      }
    }
  }
  function worldMap(ctx){
    if(imageReady(map)){const im=map.image,w=300,h=w*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,1340,758-h,w,h);return;}
    ctx.translate(60,0);
    ctx.fillStyle='#e5c781';ctx.beginPath();ctx.roundRect(1280,508,255,210,16);ctx.fill();ctx.fillStyle='#112c57';ctx.fillRect(1290,518,235,190);ctx.strokeStyle='#72dfef';ctx.strokeRect(1300,528,215,170);
    const points=[[1332,561],[1410,550],[1484,572],[1350,641],[1430,617],[1481,668]];
    ctx.strokeStyle='#70c6e5';ctx.lineWidth=3;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
    for(const [i,[x,y]]of points.entries()){ctx.fillStyle=['#73c9ff','#c5b4ff','#ffe3a4'][i%3];ctx.beginPath();ctx.arc(x,y,10,0,TAU);ctx.fill();ctx.fillStyle='#0c2b52';ctx.font='bold 12px Urbanist';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+4);}
    ctx.fillStyle='#d9bc7a';ctx.fillRect(1337,718,17,36);ctx.fillRect(1460,718,17,36);
  }
  function objects(ctx,view){return[
    {id:'libra',y:800,draw:()=>world(ctx,view,()=>receptionist(ctx))},
    {id:'map',y:758,draw:()=>world(ctx,view,()=>worldMap(ctx))}
  ];}
  return {ground,objects};
}
