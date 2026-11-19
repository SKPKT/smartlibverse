import {missions,books,zones} from '../data/content.mjs';
export const KEY='smartlibverse_demo_v1';
export const fresh=()=>({version:1,profile:{nickname:'Penjelajah Buku',avatar:'lelaki',easy:false},location:{zone:'plaza',x:500,y:510},opened:[],read:[],quizzes:[],nature:[],rewards:[],visited:['plaza'],secretBook:false});
const unique=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
export function totals(s){const earned=missions.filter(m=>s.rewards.includes(m.id));const xp=earned.reduce((n,m)=>n+m.xp,0);return {xp,level:1+Math.floor(xp/50),coins:earned.reduce((n,m)=>n+m.coins,0),stars:earned.reduce((n,m)=>n+m.stars,0),badges:earned.map(m=>m.badge)};}
export function unlocked(s){const t=totals(s);return t.level>=3&&s.rewards.length>=3&&t.badges.length>=2;}
export function sanitize(raw){
 const s=fresh();if(!raw||raw.version!==1)return s;
 const p=raw.profile||{};s.profile={nickname:typeof p.nickname==='string'?p.nickname.replace(/[<>\u0000-\u001f]/g,'').slice(0,30)||s.profile.nickname:s.profile.nickname,avatar:p.avatar==='perempuan'?'perempuan':'lelaki',easy:p.easy===true};
 const ids=books.map(b=>b.id);s.opened=unique(raw.opened,ids);s.read=unique(raw.read,ids).filter(x=>s.opened.includes(x));s.quizzes=unique(raw.quizzes,ids).filter(x=>s.read.includes(x));s.nature=unique(raw.nature,['tree','flower','butterfly','pond','board']);
 s.rewards=unique(raw.rewards,missions.map(m=>m.id)).filter(id=>id==='tutorial'||id==='books'&&s.opened.length>=2||id==='read'&&s.read.length>0||id==='quiz'&&s.quizzes.length>0||id==='garden'&&s.nature.length>=3||id==='secret'&&raw.secretBook===true);
 s.secretBook=raw.secretBook===true;s.visited=unique(raw.visited,zones.map(z=>z.id));if(!s.visited.includes('plaza'))s.visited.push('plaza');
 const l=raw.location||{};s.location={zone:zones.some(z=>z.id===l.zone)&& (l.zone!=='secret'||unlocked(s))?l.zone:'plaza',x:Number.isFinite(l.x)?Math.max(55,Math.min(945,l.x)):500,y:Number.isFinite(l.y)?Math.max(155,Math.min(625,l.y)):510};if(collision(s.location.x,s.location.y,zones.find(z=>z.id===s.location.zone).objects)){s.location.x=500;s.location.y=510;}return s;
}
export function load(storage){try{return {state:sanitize(JSON.parse(storage.getItem(KEY))),error:false};}catch{return {state:fresh(),error:true};}}
export function save(storage,s){try{storage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
export function award(s,id){const m=missions.find(m=>m.id===id);if(!m||s.rewards.includes(id))return null;s.rewards.push(id);return m;}
export function eligible(s,id){return id==='tutorial'||id==='books'&&s.opened.length>=2||id==='read'&&s.read.length>0||id==='quiz'&&s.quizzes.length>0||id==='garden'&&s.nature.length>=3||id==='secret'&&s.secretBook;}
export function earn(s,id){return eligible(s,id)?award(s,id):null;}
export function grade(book,answers){return book.quiz.reduce((score,q,i)=>score+(q[2]===answers[i]?1:0),0);}
const obstacleBounds = ([,,x,y]) => [x - 73, y - 25, x + 73, y + 24];

export function collision(x, y, objects) {
  return x < 55 || x > 945 || y < 155 || y > 625 ||
    objects.some(object => {
      const [left, top, right, bottom] = obstacleBounds(object);
      return x > left && x < right && y > top && y < bottom;
    });
}

function crossesObstacle(from, to, [left, top, right, bottom]) {
  let enter = 0;
  let leave = 1;
  for (const [start, end, min, max] of [[from.x, to.x, left, right], [from.y, to.y, top, bottom]]) {
    const delta = end - start;
    if (delta === 0) {
      if (start <= min || start >= max) return false;
      continue;
    }
    const first = (min - start) / delta;
    const last = (max - start) / delta;
    enter = Math.max(enter, Math.min(first, last));
    leave = Math.min(leave, Math.max(first, last));
    if (enter >= leave) return false;
  }
  return true;
}

export function assistedRoute(from, to, objects) {
  const bounds = objects.map(obstacleBounds);
  const clear = (a, b) => !bounds.some(box => crossesObstacle(a, b, box));
  if (clear(from, to)) return [to];

  // A clearance around each corner leaves room for movement between frames.
  const clearance = 12;
  const corners = bounds.flatMap(([left, top, right, bottom]) =>
    [left - clearance, right + clearance].flatMap(x =>
      [top - clearance, bottom + clearance].map(y => ({x, y})))
  ).filter(({x, y}) => !collision(x, y, objects));
  const queue = [from];
  const parent = new Map([[from, null]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (clear(current, to)) {
      const route = [to];
      for (let corner = current; corner !== from; corner = parent.get(corner)) route.push(corner);
      return route.reverse();
    }
    for (const corner of corners) {
      if (parent.has(corner) || !clear(current, corner)) continue;
      parent.set(corner, current);
      queue.push(corner);
    }
  }
  return [];
}

export function move(s,dx,dy,dt,objects,running=false){const n=Math.hypot(dx,dy);if(!n)return false;const speed=(s.profile.easy?100:160)*(running?1.5:1),step=Math.min(dt,.04)*speed;const x=s.location.x+dx/n*step,y=s.location.y+dy/n*step;if(!collision(x,s.location.y,objects))s.location.x=x;if(!collision(s.location.x,y,objects))s.location.y=y;return true;}
