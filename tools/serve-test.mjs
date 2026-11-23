import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist'),prefix='/smartlibverse/';
const types={'.html':'text/html;charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(!u.pathname.startsWith(prefix))throw Error();let name=decodeURIComponent(u.pathname.slice(prefix.length));if(!name||name.endsWith('/'))name+='index.html';let file=path.resolve(root,name);if(!file.startsWith(root+path.sep))throw Error();
// Explicit loopback-only source review. This server is never part of the Pages build.
if(process.env.LIBRARY_REVIEW==='1'&&name.startsWith('library/flipbooks/books/gempa-bumi/')){const source=path.resolve('library/flipbooks/books/gempa-bumi');file=path.resolve(name);if(!file.startsWith(source+path.sep))throw Error();}
const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT)||4192,'127.0.0.1',()=>console.log('QA server ready'));
