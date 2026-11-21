import {mkdir,cp,readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const files=['index.html','world','css','js','data','assets','libra-robot.webp','icon-192.png'];
await mkdir(path.join(root,'dist'),{recursive:true});
for(const file of files)await cp(path.join(root,file),path.join(root,'dist',file),{recursive:true});
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await scan(p);else if(/\.(html|mjs|css)$/.test(e.name)){const text=await readFile(p,'utf8');if(e.name.endsWith('.mjs'))execFileSync(process.execPath,['--check',p]);if(/AIza[\w-]{25,}|gh[pousr]_[\w]{20,}|-----BEGIN.*PRIVATE KEY/.test(text))throw Error('Potential secret in public build');if(/script\.google\.com|signin-with-chatgpt/.test(text))throw Error('Unexpected backend dependency');}}}
await scan(path.join(root,'dist'));console.log('Static production build and public secret scan passed. No server runtime required.');
const manifest=JSON.parse(await readFile(path.join(root,'dist/assets/hd2d/manifest.json'),'utf8'));
for(const entry of manifest.files){
 if(!/^assets\/hd2d\/[\w/-]+\.(png|webp)$/.test(entry.path))throw Error('Invalid asset manifest path');
 const data=await readFile(path.join(root,'dist',entry.path));
 if(data.length!==entry.bytes||createHash('sha256').update(data).digest('hex')!==entry.sha256)throw Error('Build asset mismatch: '+entry.path);
}
console.log(`Verified ${manifest.files.length} separate HD-2D assets in production output.`);
