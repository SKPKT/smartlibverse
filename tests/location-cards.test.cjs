const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function fixture() {
  const doc = {createElement(tag) {
    return {tag, ownerDocument:doc, children:[], dataset:{}, attrs:{}, handlers:{},
      append(child) {this.children.push(child);},
      setAttribute(key,value) {this.attrs[key]=value;},
      addEventListener(event,handler) {this.handlers[event]=handler;}
    };
  }};
  return doc.createElement('div');
}

test('The original six zone IDs map to supplied artwork; whole cards invoke each existing destination once', async () => {
  const {renderLocationCards,LOCATION_ART} = await import('../js/location-cards.mjs');
  const {zones} = await import('../data/content.mjs');
  const parent = fixture(), selected=[];
  renderLocationCards(parent,zones,{secretLocked:false,currentZone:'library',onSelect:id=>selected.push(id)});
  assert.equal(parent.children.length,1);
  const cards=parent.children[0].children;
  assert.equal(cards.length,6);
  assert.deepEqual(cards.map(c=>c.dataset.zone),['library','gallery','quiz','awards','garden','secret']);
  for (const card of cards) {
    assert.equal(card.tag,'button');
    assert.equal(card.type,'button');
    assert.match(card.attrs['aria-label'],new RegExp(zones.find(z=>z.id===card.dataset.zone).name));
    assert.equal(card.children.length,1); // No duplicate visible title or avatar.
    const image=card.children[0];
    assert.equal(image.tag,'img');
    assert.equal(image.alt,'');
    assert.equal(image.width/image.height,1.5);
    assert.equal(image.src,`./assets/locations/${LOCATION_ART[card.dataset.zone].file}`);
    card.handlers.click();
  }
  assert.deepEqual(selected,['library','gallery','quiz','awards','garden','secret']);
  assert.equal(cards[0].attrs['aria-current'],'location');
});

test('Locked Secret stays operable to show the original requirements; unlocked Secret removes the lock', async () => {
  const {renderLocationCards} = await import('../js/location-cards.mjs');
  const {zones} = await import('../data/content.mjs');
  for (const locked of [true,false]) {
    const parent=fixture(),selected=[];
    renderLocationCards(parent,zones,{secretLocked:locked,onSelect:id=>selected.push(id)});
    const secret=parent.children[0].children.find(c=>c.dataset.zone==='secret');
    assert.equal(secret.disabled,undefined);
    assert.equal(secret.children.length,locked?2:1);
    assert.equal(secret.attrs['aria-label'].includes('terkunci'),locked);
    if(locked) assert.equal(secret.children[1].attrs['aria-hidden'],'true');
    secret.handlers.click();assert.deepEqual(selected,['secret']);
  }
});

test('Six real WebP assets use relative lowercase paths and are included by the production asset allowlist', async () => {
  const {LOCATION_ART} = await import('../js/location-cards.mjs');
  const root=path.join(__dirname,'..');
  for (const art of Object.values(LOCATION_ART)) {
    assert.match(art.file,/^[a-z-]+\.webp$/);
    const bytes=fs.readFileSync(path.join(root,'assets','locations',art.file));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
  const main=fs.readFileSync(path.join(root,'js/main.mjs'),'utf8');
  assert.equal((main.match(/renderLocationCards\(body,zones/g)||[]).length,1);
  assert.match(main,/onSelect:id=>\{close\(\);changeZone\(id\);\}/);
  assert.match(main,/id==='secret'&&!unlocked\(s\)/);
  assert.match(fs.readFileSync(path.join(root,'tools/build.mjs'),'utf8'),/'assets'/);
});
