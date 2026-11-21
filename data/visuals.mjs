// Presentation metadata only. Permanent object/shelf IDs and gameplay rules stay in content.mjs.
export const backgrounds = Object.freeze({
  plaza:'./assets/hd2d/zones/plaza.webp', library:'./assets/hd2d/library/library-hall.webp',
  gallery:'./assets/hd2d/zones/gallery.webp', quiz:'./assets/hd2d/zones/quiz.webp',
  awards:'./assets/hd2d/zones/awards.webp', garden:'./assets/hd2d/zones/garden.webp', secret:'./assets/hd2d/zones/secret.webp'
});
export const libraryStations = Object.freeze({
  cerita:{sprite:'./assets/hd2d/library/cerita_bergambar.webp',width:178,height:176,amplitude:4,period:3200,phase:0,particles:3},
  alam:{sprite:'./assets/hd2d/library/sains_dan_alam.webp',width:210,height:208,amplitude:6,period:3800,phase:1.3,particles:5},
  umum:{sprite:'./assets/hd2d/library/pengetahuan.webp',width:178,height:176,amplitude:4,period:3500,phase:2.2,particles:3}
});
export const TAU=Math.PI*2;
export function stationMotion(id,time,reduced=false){
  const v=libraryStations[id];
  return {bob:reduced?0:Math.sin(time*TAU/v.period+v.phase)*v.amplitude,
    pulse:reduced?0.5:0.5+0.5*Math.sin(time*TAU/(id==='umum'?2600:4600)+v.phase),
    orbit:reduced?0:time*TAU/8000+v.phase};
}
export function contain(width,height,maxWidth,maxHeight){
  const scale=Math.min(maxWidth/width,maxHeight/height);return {width:width*scale,height:height*scale};
}
