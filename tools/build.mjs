import {mkdir,cp,readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const files=['index.html','world','css','js','data','assets','libra-robot.webp','icon-192.png'];
await mkdir(path.join(root,'dist'),{recursive:true});
for(const file of files)await cp(path.join(root,file),path.join(root,'dist',file),{recursive:true});
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await scan(p);else if(/\.(html|mjs|css)$/.test(e.name)){const text=await readFile(p,'utf8');if(e.name.endsWith('.mjs'))execFileSync(process.execPath,['--check',p]);if(/AIza[\w-]{25,}|gh[pousr]_[\w]{20,}|-----BEGIN.*PRIVATE KEY/.test(text))throw Error('Potential secret in public build');if(/script\.google\.com|signin-with-chatgpt/.test(text))throw Error('Unexpected backend dependency');}}}
await scan(path.join(root,'dist'));console.log('Static production build and public secret scan passed. No server runtime required.');
