// One decoded Image per URL; library WebP failures have a single PNG fallback.
// No per-frame construction, timers, network loops, or global preload of every zone.
export function createImageCache(makeImage=()=>new Image()){
  const entries=new Map();
  return {
    get(url,fallback){
      if(!entries.has(url)){
        const image=makeImage(),entry={image,status:'loading',url};entries.set(url,entry);
        image.onload=()=>{entry.status='ready';};
        image.onerror=()=>{if(fallback){const next=fallback;fallback=null;image.src=next;}else entry.status='error';};
        image.src=url;
      }
      return entries.get(url);
    },
    get size(){return entries.size;}
  };
}
export const imageReady=entry=>entry?.image.complete&&entry.image.naturalWidth>0;
