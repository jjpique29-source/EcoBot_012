/* Servidor del taller Ecobot Cobra Vida.
   Uso: node servidor.js   (opcional: PORT=8080 node servidor.js)
   No necesita instalar nada más: solo Node.js. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const E = require('./ecobot-nucleo.js');

const PORT = +process.env.PORT || 8080;
const DIR = __dirname;
const DATA = path.join(DIR, 'datos-taller.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.pdf': 'application/pdf', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };

let S;
try { S = Object.assign(E.initial(), JSON.parse(fs.readFileSync(DATA, 'utf8'))); console.log('Se cargó el taller guardado en datos-taller.json'); }
catch (e) { S = E.initial(); }

const clients = new Set();
let saveT = null;
function persist() { clearTimeout(saveT); saveT = setTimeout(() => fs.writeFile(DATA, JSON.stringify(S), () => {}), 400); }
function broadcast() { const m = 'data: ' + JSON.stringify(S) + '\n\n'; for (const c of clients) c.write(m); }
setInterval(() => { const m = 'event: tick\ndata: ' + Date.now() + '\n\n'; for (const c of clients) c.write(m); }, 15000);

function ips() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  return out;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);

  if (p === '/eventos') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 2000\n\n');
    res.write('event: tick\ndata: ' + Date.now() + '\n\n');
    res.write('data: ' + JSON.stringify(S) + '\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (p === '/estado') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(S)); return; }
  if (p === '/info') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ips: ips(), port: PORT })); return; }
  if (p === '/accion' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 300000) req.destroy(); });
    req.on('end', () => {
      try { const a = JSON.parse(body); a.now = Date.now(); E.reduce(S, a); persist(); broadcast(); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); }
      catch (e) { res.writeHead(400); res.end('{"ok":false}'); }
    });
    return;
  }

  // Archivos de la carpeta
  let rel = p === '/' ? '/index.html' : p;
  const file = path.normalize(path.join(DIR, rel));
  if (!file.startsWith(DIR) || /datos-taller\.json$|servidor\.js$/.test(file)) { res.writeHead(404); res.end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const list = ips();
  console.log('\n  ECOBOT COBRA VIDA · servidor del taller encendido\n');
  console.log('  En este computador:   http://localhost:' + PORT);
  list.forEach(ip => {
    console.log('\n  Desde la red del colegio (' + ip + '):');
    console.log('    Mando principal:  http://' + ip + ':' + PORT + '/admin.html');
    console.log('    Escuadrones:      http://' + ip + ':' + PORT + '/escuadron.html');
    console.log('    Pantalla grande:  http://' + ip + ':' + PORT + '/pantalla.html');
  });
  console.log('\n  Deja esta ventana abierta durante el taller. Para apagar: Ctrl + C\n');
});
server.on('error', e => { console.error('\n  No pude encender el servidor: ' + e.message + '\n  ¿Ya hay otro servidor abierto en el puerto ' + PORT + '?\n'); });
