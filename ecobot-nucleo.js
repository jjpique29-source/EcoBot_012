/* Ecobot Cobra Vida · núcleo compartido (navegador y servidor). JavaScript puro, sin librerías. */
(function (root, factory) {
  const E = factory();
  if (typeof module === 'object' && module.exports) module.exports = E; else root.Ecobot = E;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';
const E = {};

/* ---------- Modo calmado: solo si el moderador lo pide (no depende de Windows) ---------- */
E.calm = (() => { try { return localStorage.getItem('ecobot-calma') === 'si'; } catch (e) { return false; } })();
if (typeof document !== 'undefined' && E.calm) document.documentElement.classList.add('calm');

/* ---------- Utilidades ---------- */
E.ROWL = 'ABCDEFGH';
E.EMPTY = () => Array(8).fill('00000000');
E.mirror = rows => rows.map(r => [...r].reverse().join(''));
E.setBit = (rows, r, c, v) => rows.map((row, i) => i === r ? row.slice(0, c) + v + row.slice(c + 1) : row);
E.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
E.words = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
E.slug = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'cara';
E.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
E.joinY = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];
E.NEG = /(^|[^a-záéíóúñü])(no|nunca|jamás)(?=[^a-záéíóúñü]|$)/i;

/* ---------- Datos del taller ---------- */
const P = E.P = {
  abierto: ['00111100', '01111110', '11100111', '11000011', '11000011', '11100111', '01111110', '00111100'],
  medio: ['00000000', '00000000', '00000000', '11111111', '11100111', '01111110', '00111100', '00000000'],
  cerrado: ['00000000', '00000000', '00000000', '00000000', '11111111', '00000000', '00000000', '00000000'],
  feliz: ['00000000', '00111100', '01111110', '11100111', '11000011', '10000001', '00000000', '00000000'],
  triste: ['00000000', '00000000', '11000000', '11110000', '01111110', '00111111', '00011110', '00000000'],
  sorprendido: ['00111100', '01100110', '11000011', '11000011', '11000011', '11000011', '01100110', '00111100'],
  preocupado: ['10000000', '01100000', '00011000', '00111100', '01100110', '01100110', '00111100', '00000000'],
  dormido: ['00000000', '00000000', '00000000', '00000000', '10000001', '01000010', '00111100', '00000000'],
  amor: ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000']
};
E.defaultFaces = () => ({
  feliz: { label: 'Feliz', L: P.feliz, R: P.feliz },
  triste: { label: 'Triste', L: P.triste, R: E.mirror(P.triste) },
  sorprendido: { label: 'Sorprendido', L: P.sorprendido, R: P.sorprendido },
  preocupado: { label: 'Preocupado', L: P.preocupado, R: E.mirror(P.preocupado) },
  dormido: { label: 'Dormido', L: P.dormido, R: P.dormido },
  guino: { label: 'Guiño', L: P.abierto, R: P.cerrado },
  abierto: { label: 'Normal', L: P.abierto, R: P.abierto },
  amor: { label: 'Corazón', L: P.amor, R: P.amor }
});
E.MAIN6 = ['feliz', 'triste', 'sorprendido', 'preocupado', 'dormido', 'guino'];
E.SITS = [
  { id: 'recicla', t: 'Un estudiante recicla bien', sug: 'feliz', bg: '#e6f2e8' },
  { id: 'basura', t: 'Hay basura en el piso', sug: 'triste', bg: '#f3ece2' },
  { id: 'llave', t: 'Una llave de agua queda abierta', sug: 'preocupado', bg: '#e3f0f8' },
  { id: 'riega', t: 'Alguien riega una planta', sug: 'feliz', bg: '#e9f4e4' },
  { id: 'saluda', t: 'Un estudiante saluda al Ecobot', sug: 'sorprendido', bg: '#fdf3d4' },
  { id: 'nadie', t: 'Nadie interactúa con el Ecobot', sug: 'dormido', bg: '#ebe8f5' }
];
E.TEAMS = [
  { id: 'Agua', key: 'agua', c: '#3d9be0', soft: '#e3f1fc', ink: '#1b5e91', g: 'Yuly Ramos', ic: '<path d="M17 4C12 11 9 15 9 19a8 8 0 0 0 16 0c0-4-3-8-8-15z" fill="#3d9be0"/>' },
  { id: 'Aire', key: 'aire', c: '#4fb8c9', soft: '#e2f5f8', ink: '#1d6e7b', g: 'Leonardo Muñoz', ic: '<path d="M4 12h17a4 4 0 1 0-4-4M4 18h22a4 4 0 1 1-4 4M4 24h10" fill="none" stroke="#4fb8c9" stroke-width="3" stroke-linecap="round"/>' },
  { id: 'Tierra', key: 'tierra', c: '#a8723d', soft: '#f5ebe0', ink: '#6e4520', g: 'Valentina Velandia', ic: '<path d="M17 30V16M17 18C17 9 24 5 30 5c0 8-5 13-13 13zM17 22C17 15 11 11 5 11c0 7 5 11 12 11z" fill="#6aa84f" stroke="#a8723d" stroke-width="2"/>' },
  { id: 'Energía', key: 'energia', c: '#e3a313', soft: '#fdf3d4', ink: '#7a5600', g: 'Valentina Velandia', ic: '<path d="M19 3 7 19h9l-2 12 12-17h-9z" fill="#e3a313"/>' }
];
E.TEAM_IDS = E.TEAMS.map(t => t.id);
E.team = id => E.TEAMS.find(t => t.id === id || t.key === id);
E.teamIcon = (t, size = 34) => `<svg viewBox="0 0 34 34" width="${size}" height="${size}" aria-hidden="true">${t.ic}</svg>`;
E.ADJ = ['Alegre', 'Curioso', 'Sabio', 'Juguetón', 'Valiente', 'Amable', 'Chistoso', 'Tranquilo'];
E.MOMS = [
  { id: 'm1', n: '1', label: 'Bienvenida', min: 10, kid: '¡Bienvenidos!' },
  { id: 'm2', n: '2', label: 'Nombre', min: 20, kid: '¿Quién es el Ecobot?' },
  { id: 'm3', n: '3', label: 'Caras LED', min: 25, kid: 'Las caras del Ecobot' },
  { id: 'm4', n: '4', label: 'Emociones', min: 15, kid: '¿Cómo se siente?' },
  { id: 'pausa', n: 'P', label: 'Pausa', min: 5, kid: 'Pausa activa' },
  { id: 'm5', n: '5', label: 'Frases', min: 30, kid: '¿Qué dice el Ecobot?' },
  { id: 'm6', n: '6', label: 'Cierre', min: 15, kid: '¡El Ecobot despierta!' }
];
E.mom = id => E.MOMS.find(m => m.id === id) || E.MOMS[0];
E.ASSIGN = { Agua: 'feliz', Aire: 'triste', Tierra: 'sorprendido', 'Energía': 'preocupado' };
E.ART = {
  recicla: `<rect x="62" y="40" width="40" height="48" rx="4" fill="#2e8b57"/><rect x="56" y="33" width="52" height="9" rx="3" fill="#1e5b3a"/><path d="M82 52 L91 68 L73 68Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><g transform="rotate(-38 46 26)"><rect x="39" y="12" width="14" height="30" rx="5" fill="#8cc9ee" stroke="#3d7fb0" stroke-width="2"/><rect x="42" y="6" width="8" height="7" rx="2" fill="#3d7fb0"/></g><path d="M62 18q8-4 14 2" fill="none" stroke="#1e5b3a" stroke-width="2.5" stroke-dasharray="3 4"/>`,
  basura: `<rect x="0" y="66" width="160" height="34" fill="#d8c6a6"/><path d="M40 70l10-10 12 3 2 12-14 4z" fill="#fff" stroke="#8a8a8a" stroke-width="2"/><path d="M78 74c4-16 14-22 22-20-8 4-12 12-12 22zM88 76c4-12 14-14 20-10-8 0-12 6-12 12z" fill="#f2c430" stroke="#c9961a" stroke-width="1.5"/><rect x="108" y="62" width="26" height="14" rx="3" transform="rotate(-14 121 69)" fill="#d9534f" stroke="#a33" stroke-width="2"/><text x="80" y="38" font-size="28" font-weight="800" fill="#e3a313" text-anchor="middle">!</text>`,
  llave: `<rect x="70" y="14" width="16" height="10" rx="2" fill="#7d8a90"/><path d="M30 30h76a14 14 0 0 1 14 14v8h-18v-4H30z" fill="#a6b2b8"/><path d="M111 62q-4 7 0 9q4-2 0-9zM111 76q-4 7 0 9q4-2 0-9z" fill="#3d9be0"/><ellipse cx="111" cy="94" rx="30" ry="4" fill="#8cc4ee"/>`,
  riega: `<path d="M20 44h44l-6 30H26z" fill="#3d9be0"/><path d="M64 50l34-12" stroke="#3d9be0" stroke-width="6" stroke-linecap="round"/><path d="M20 50q-14 6 0 18" fill="none" stroke="#3d9be0" stroke-width="5"/><circle cx="100" cy="46" r="2.5" fill="#3d9be0"/><circle cx="96" cy="54" r="2.5" fill="#3d9be0"/><path d="M104 70h34l-5 24h-24z" fill="#c4703d"/><path d="M121 70V48M121 56c-12-2-16-12-14-18 10 2 14 8 14 18zM121 52c2-12 12-16 18-14-2 10-8 14-18 14z" fill="#5fbf5a" stroke="#3f8f4f" stroke-width="2"/>`,
  saluda: `<rect x="24" y="34" width="56" height="44" rx="12" fill="#e6f3e8" stroke="#1e5b3a" stroke-width="3"/><rect x="31" y="41" width="42" height="26" rx="7" fill="#0f2321"/><circle cx="43" cy="54" r="5" fill="#33d1b3"/><circle cx="61" cy="54" r="5" fill="#33d1b3"/><path d="M52 34v-8M52 26c-5-6-11-4-12-2M52 26c4-7 10-6 12-4" fill="none" stroke="#3f8f4f" stroke-width="2.5"/><path d="M112 88V56c0-4 6-4 6 0v14V44c0-4 6-4 6 0v26V46c0-4 6-4 6 0v26V54c0-4 6-4 6 0v22c0 10-6 14-14 14h-4c-8 0-12-4-14-10l-6-12c-2-4 3-7 6-3z" fill="#f2c9a0" stroke="#b07a4e" stroke-width="2"/><rect x="96" y="10" width="50" height="22" rx="11" fill="#fff" stroke="#e3a313" stroke-width="2"/><text x="121" y="26" font-size="12" font-weight="800" fill="#1e5b3a" text-anchor="middle">¡Hola!</text>`,
  nadie: `<rect x="52" y="34" width="56" height="44" rx="12" fill="#e6f3e8" stroke="#1e5b3a" stroke-width="3"/><rect x="59" y="41" width="42" height="26" rx="7" fill="#0f2321"/><path d="M66 56q5 5 10 0M84 56q5 5 10 0" fill="none" stroke="#33d1b3" stroke-width="2.5"/><path d="M80 34v-8M80 26c-5-6-11-4-12-2M80 26c4-7 10-6 12-4" fill="none" stroke="#3f8f4f" stroke-width="2.5"/><rect x="66" y="80" width="28" height="12" rx="4" fill="#cfe8d6" stroke="#1e5b3a" stroke-width="2"/><text x="116" y="34" font-size="12" font-weight="800" fill="#6f63c9">z</text><text x="124" y="24" font-size="15" font-weight="800" fill="#6f63c9">z</text><text x="133" y="13" font-size="18" font-weight="800" fill="#6f63c9">Z</text>`
};
E.sitArt = (s) => `<svg viewBox="0 0 160 100" aria-hidden="true" style="background:${s.bg}">${E.ART[s.id]}</svg>`;

const pin = () => String(1000 + Math.floor(Math.random() * 9000));
E.initial = () => ({
  v: 0, epoch: E.uid(), moment: 'm1', locked: false, voteOpen: false,
  pins: Object.fromEntries(E.TEAM_IDS.map(t => [t, pin()])),
  presence: {}, ready: {},
  ideas: [], traits: {}, traitAdj: {}, names: [], squadVotes: {}, official: '', nickname: '',
  faces: E.defaultFaces(), facesBy: {}, squadFace: {}, assign: Object.assign({}, E.ASSIGN),
  blink: [P.abierto, P.medio, P.cerrado], blinkSpeed: 160, facesTouched: false, guessed: {},
  states: {}, stateVotes: {},
  welcome: [
    { id: 'w1', text: '¡Hola, ___! Hoy podemos cuidar el agua juntos.', team: '', ex: true },
    { id: 'w2', text: '¡Qué bueno verte, ___! ¿Reciclamos hoy?', team: '', ex: true }],
  messages: [
    { id: 'x1', text: 'Cierra bien la llave y el agua seguirá contenta.', theme: 'Agua', face: 'feliz', team: '', ex: true },
    { id: 'x2', text: 'Las plantas nos regalan aire limpio todos los días.', theme: 'Aire', face: 'feliz', team: '', ex: true },
    { id: 'x3', text: 'La basura va en su caneca.', theme: 'Tierra', face: 'feliz', team: '', ex: true },
    { id: 'x4', text: 'Apaga la luz cuando salgas del salón.', theme: 'Energía', face: 'guino', team: '', ex: true }],
  rules: [
    { id: 'r1', sit: 'Un estudiante recicla bien', face: 'feliz', say: '¡Gracias! Así el planeta sonríe.', team: '', ex: true },
    { id: 'r2', sit: 'Una llave de agua queda abierta', face: 'preocupado', say: '¡Ayúdame a cerrar la llave, por favor!', team: '', ex: true }],
  evalv: { mucho: 0, medio: 0, poco: 0 }, evalTeam: {}, teamsDone: 0, awake: false,
  screen: { id: 0, kind: 'base' }
});

/* ---------- Cálculos ---------- */
E.traitTotals = s => {
  const t = Object.fromEntries(E.ADJ.map(a => [a, (s.traitAdj && s.traitAdj[a]) || 0]));
  Object.values(s.traits || {}).forEach(list => list.forEach(a => { if (a in t) t[a]++; }));
  return t;
};
E.topTraits = s => {
  const t = E.traitTotals(s);
  return E.ADJ.map((a, i) => ({ a, v: t[a], i })).filter(o => o.v > 0).sort((x, y) => y.v - x.v || x.i - y.i).slice(0, 3).map(o => o.a);
};
E.nameTotal = (s, n) => n.votes + Object.values(s.squadVotes || {}).filter(id => id === n.id).length;
E.userPhrases = s => s.welcome.filter(w => !w.ex).length + s.messages.filter(m => !m.ex).length;
E.energy = s => [
  ['Nombre', !!s.official], ['Rasgos', E.topTraits(s).length === 3], ['Caras', !!s.facesTouched],
  ['Emociones', Object.keys(s.states).length >= 3], ['Frases', E.userPhrases(s) >= 3], ['Reglas', s.rules.some(r => !r.ex)]];
E.sproutScale = s => s.awake ? 1.15 : 0.55 + E.energy(s).filter(x => x[1]).length * 0.08;
E.botName = s => s.official || 'Ecobot';
E.sentFace = (s, team) => { const k = s.squadFace && s.squadFace[team]; return k && s.faces[k] && s.facesBy[k] === team ? k : null; };
E.blinkSeq = s => { const b = s.blink; return [b[0], b[1], b[2], b[1], b[0]]; };

/* ---------- Reductor: todas las acciones pasan por aquí ---------- */
const clip = (t, n = 140) => String(t ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const isRows = r => Array.isArray(r) && r.length === 8 && r.every(x => typeof x === 'string' && /^[01]{8}$/.test(x));
function show(s, o, now) { s.screen = Object.assign({}, o, { id: ((s.screen && s.screen.id) || 0) + 1, at: now }); }
E.reduce = function (s, a) {
  if (!a || typeof a !== 'object') return s;
  const now = a.now || Date.now();
  const team = E.TEAM_IDS.includes(a.team) ? a.team : null;
  switch (a.type) {
    case 'patch':
      if (a.data && typeof a.data === 'object') for (const k of Object.keys(a.data)) if (!['v', 'epoch', 'screen'].includes(k)) s[k] = a.data[k];
      break;
    case 'show': if (a.show && typeof a.show === 'object') show(s, a.show, now); break;
    case 'reset': { const n = E.initial(); n.v = s.v; for (const k of Object.keys(s)) delete s[k]; Object.assign(s, n); break; }
    case 'ping': if (!team) return s; s.presence[team] = now; break;
    case 'ready':
      if (!team) return s; s.ready[team] = true;
      show(s, { kind: 'say', key: 'feliz', by: team, text: `¡El Escuadrón ${team} está listo para ayudarme!` }, now); break;
    case 'traits': {
      if (!team) return s;
      const t = [...new Set((a.traits || []).filter(x => E.ADJ.includes(x)))].slice(0, 3); s.traits[team] = t;
      if (t.length) show(s, { kind: 'say', key: 'feliz', by: team, text: `El Escuadrón ${team} dice que soy ${E.joinY(t.map(x => x.toLowerCase()))}.` }, now);
      break;
    }
    case 'propose': {
      if (!team) return s;
      const ns = (a.names || []).map(n => clip(n, 24)).filter(Boolean).slice(0, 2);
      s.names = s.names.filter(n => !(n.team === team && n.sq));
      ns.forEach(n => s.names.push({ id: E.uid(), name: n, team, votes: 0, sq: true }));
      if (ns.length) show(s, { kind: 'say', key: 'sorprendido', by: team, text: `¡El Escuadrón ${team} propone ${E.joinY(ns)} como mi nombre!` }, now);
      break;
    }
    case 'vote':
      if (!team || !s.voteOpen || !s.names.some(n => n.id === a.id)) return s;
      s.squadVotes[team] = a.id;
      show(s, { kind: 'face', key: 'feliz', by: team, text: `El Escuadrón ${team} ya votó.` }, now); break;
    case 'face': {
      let key = a.key;
      if (!isRows(a.L) || !isRows(a.R)) return s;
      if (team) {
        const asg = s.assign[team], label = clip(a.label, 20);
        key = asg;
        s.squadFace = s.squadFace || {};
        if (label && (!s.faces[asg] || label.toLowerCase() !== s.faces[asg].label.toLowerCase())) {
          const prev = s.squadFace[team];
          const same = Object.keys(s.faces).find(k => s.faces[k].label.toLowerCase() === label.toLowerCase());
          if (same && !['abierto', 'dormido'].includes(same) && (!s.facesBy[same] || s.facesBy[same] === team)) key = same;
          else if (prev && prev !== asg && s.faces[prev] && s.facesBy[prev] === team) { key = prev; s.faces[prev].label = label; }
          else { const b = E.slug(label); let k = b, i = 2; while (s.faces[k]) k = b + '_' + i++; s.faces[k] = { label, L: a.L, R: a.R }; key = k; }
        }
        s.squadFace[team] = key;
      }
      if (!key) return s;
      if (!s.faces[key]) { if (team) return s; s.faces[key] = { label: clip(a.label || key, 20), L: a.L, R: a.R }; }
      else { s.faces[key].L = a.L; s.faces[key].R = a.R; if (a.label && !team) s.faces[key].label = clip(a.label, 20); }
      s.facesTouched = true;
      if (team) { s.facesBy[key] = team; show(s, { kind: 'say', key, by: team, text: `¡Miren! El Escuadrón ${team} me dio la cara ${s.faces[key].label}.` }, now); }
      break;
    }
    case 'delFace':
      if (team || !s.faces[a.key] || ['abierto', 'dormido'].includes(a.key) || Object.keys(s.faces).length <= 2) return s;
      delete s.faces[a.key]; break;
    case 'stateVote': {
      const sit = E.SITS.find(x => x.id === a.sit);
      if (!team || !sit || !s.faces[a.face]) return s;
      (s.stateVotes[a.sit] = s.stateVotes[a.sit] || {})[team] = a.face;
      show(s, { kind: 'face', key: a.face, by: team, text: `Escuadrón ${team}: «${sit.t}» → ${s.faces[a.face].label}` }, now); break;
    }
    case 'add': {
      const L = a.list, it = a.item || {};
      if (!['welcome', 'messages', 'rules', 'ideas', 'names'].includes(L)) return s;
      let o;
      if (L === 'names') { if (team) return s; o = { id: E.uid(), name: clip(it.name, 24), team: clip(it.team, 20), votes: 0 }; if (!o.name) return s; s.names.push(o); break; }
      if (L === 'ideas') o = { id: E.uid(), text: clip(it.text, 60) };
      if (L === 'welcome') o = { id: E.uid(), text: clip(it.text, 120), team: team || clip(it.team, 20) };
      if (L === 'messages') o = { id: E.uid(), text: clip(it.text, 120), theme: E.TEAM_IDS.includes(it.theme) ? it.theme : (team || 'Agua'), face: s.faces[it.face] ? it.face : 'feliz', team: team || clip(it.team, 20) };
      if (L === 'rules') { o = { id: E.uid(), sit: clip(it.sit, 60), face: s.faces[it.face] ? it.face : 'feliz', say: clip(it.say, 120), team: team || '' }; if (!o.sit) return s; }
      const body = L === 'rules' ? o.say : o.text;
      if (!body) return s;
      s[L].push(o);
      if (team) {
        const txt = L === 'welcome' ? o.text.replace(/_{2,}/g, 'amigos') : L === 'messages' ? o.text : `Aprendí una regla nueva: si pasa «${o.sit}», digo: ${o.say}`;
        show(s, { kind: 'say', key: L === 'welcome' ? 'feliz' : o.face, by: team, text: txt }, now);
      }
      break;
    }
    case 'del': {
      if (!Array.isArray(s[a.list])) return s;
      const x = s[a.list].find(x => x.id === a.id);
      if (!x || (team && x.team !== team)) return s;
      s[a.list] = s[a.list].filter(y => y.id !== a.id); break;
    }
    case 'upd': {
      if (team || !Array.isArray(s[a.list])) return s;
      const x = s[a.list].find(x => x.id === a.id); if (!x) return s;
      Object.assign(x, a.patch || {}); break;
    }
    case 'rate':
      if (!team || !['mucho', 'medio', 'poco'].includes(a.val)) return s;
      s.evalTeam[team] = a.val;
      show(s, { kind: 'face', key: a.val === 'poco' ? 'triste' : 'feliz', by: team, text: `¡Gracias por contarme, Escuadrón ${team}!` }, now); break;
    default: return s;
  }
  s.v = (s.v || 0) + 1;
  return s;
};

/* ======================= Solo navegador ======================= */

/* ---------- Conexión en tiempo real ----------
   Con servidor (servidor.js): EventSource + POST. Sin servidor: localStorage + BroadcastChannel (mismo computador). */
E.connect = function (onState, onStatus) {
  const KEY = 'ecobot-estado-v2';
  let cur = null, mode = null, offset = 0, queue = [], bc = null;
  const prevJ = {};
  const status = x => { try { onStatus && onStatus(x, mode); } catch (e) { console.error(e); } };
  function apply(s) {
    if (!s || !s.faces) return;
    if (cur && s.epoch === cur.epoch && s.v <= cur.v) return;
    const changed = new Set();
    for (const k of new Set([...Object.keys(s), ...Object.keys(prevJ)])) {
      const j = JSON.stringify(s[k]); if (j !== prevJ[k]) { changed.add(k); prevJ[k] = j; }
    }
    cur = s;
    try { onState(JSON.parse(JSON.stringify(s)), changed); } catch (e) { console.error(e); }
  }
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.faces) return Object.assign(E.initial(), s); } catch (e) { } return null; };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { } };
  function startLocal() {
    mode = 'local';
    let s = load(); if (!s) { s = E.initial(); save(s); }
    apply(s); status('local');
    try { bc = new BroadcastChannel('ecobot-taller'); bc.onmessage = () => apply(load()); } catch (e) { }
    addEventListener('storage', e => { if (e.key === KEY) apply(load()); });
  }
  function startServer(first) {
    mode = 'server'; apply(first);
    const es = new EventSource('eventos');
    es.onopen = () => status('online');
    es.onerror = () => status('offline');
    es.onmessage = e => { try { apply(JSON.parse(e.data)); } catch (_) { } };
    es.addEventListener('tick', e => { offset = (+e.data) - Date.now(); });
    status('online');
  }
  let chain = Promise.resolve();
  function send(a) {
    if (mode === 'server') {
      chain = chain.then(() => fetch('accion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) })
        .then(r => { if (!r.ok) throw 0; }).catch(() => status('offline')));
      return chain;
    }
    const s = load() || cur || E.initial();
    E.reduce(s, Object.assign({}, a, { now: Date.now() }));
    save(s); apply(s); try { bc && bc.postMessage(1); } catch (e) { }
    return Promise.resolve();
  }
  (async () => {
    await Promise.resolve();
    if (/^https?:$/.test(location.protocol)) {
      try {
        const r = await fetch('estado', { cache: 'no-store' });
        if (r.ok) { const s = await r.json(); if (s && s.faces) { startServer(s); queue.splice(0).forEach(send); return; } }
      } catch (e) { }
    }
    startLocal(); queue.splice(0).forEach(send);
  })();
  return {
    dispatch(a) { if (!mode) { queue.push(a); return Promise.resolve(); } return send(a); },
    get mode() { return mode; },
    now: () => Date.now() + offset,
    async info() { if (mode !== 'server') return null; try { const r = await fetch('info', { cache: 'no-store' }); return await r.json(); } catch (e) { return null; } }
  };
};
E.online = (s, team, now) => !!(s.presence && s.presence[team] && now - s.presence[team] < 45000);

/* ---------- Sonidos (sin archivos) ---------- */
E.soundOn = true;
let ac = null;
E.tone = function (notes, type = 'triangle', dur = .14, gap = .09, vol = .16, glide) {
  if (!E.soundOn || typeof window === 'undefined') return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    notes.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + i * gap;
      o.type = type; o.frequency.setValueAtTime(f, t0); if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t0 + dur);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .02); g.gain.exponentialRampToValueAtTime(.001, t0 + dur + .2);
      o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + .25);
    });
  } catch (e) { }
};
function noiseBurst(dur, f0, f1, vol = .12, type = 'bandpass') {
  if (!E.soundOn || typeof window === 'undefined') return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t0 = ac.currentTime;
    src.buffer = buf; f.type = type; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + dur * .3); g.gain.linearRampToValueAtTime(0, t0 + dur);
    src.connect(f); f.connect(g); g.connect(ac.destination); src.start(t0); src.stop(t0 + dur);
  } catch (e) { }
}
function snore() {
  if (!E.soundOn || typeof window === 'undefined') return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    const t0 = ac.currentTime, o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t0); lp.type = 'lowpass'; lp.frequency.value = 380;
    lfo.frequency.value = 24; lg.gain.value = 14; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.16, t0 + .9); g.gain.linearRampToValueAtTime(0, t0 + 1.4);
    o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t0); lfo.start(t0); o.stop(t0 + 1.5); lfo.stop(t0 + 1.5);
    const w = ac.createOscillator(), wg = ac.createGain(), t1 = t0 + 1.6;
    w.type = 'sine'; w.frequency.setValueAtTime(1300, t1); w.frequency.exponentialRampToValueAtTime(700, t1 + .9);
    wg.gain.setValueAtTime(0, t1); wg.gain.linearRampToValueAtTime(.05, t1 + .1); wg.gain.linearRampToValueAtTime(0, t1 + .9);
    w.connect(wg); wg.connect(ac.destination); w.start(t1); w.stop(t1 + 1);
  } catch (e) { }
}
E.sfx = {
  tap: () => E.tone([660], 'sine', .05, 0, .07),
  key: () => E.tone([880], 'sine', .03, 0, .05),
  pop: () => E.tone([520], 'sine', .08, 0, .1, 1.8),
  win: () => E.tone([523, 659, 784, 1047, 1319], 'triangle', .16, .09, .14),
  oops: () => E.tone([330, 247], 'sine', .12, .12, .09),
  chirp: () => E.tone([900, 1250], 'sine', .07, .08, .08, 1.35),
  giggle: () => E.tone([1046, 1318, 1174, 1568, 1396], 'sine', .06, .07, .08, 1.15),
  team: () => E.tone([784, 988, 1175], 'triangle', .12, .08, .12),
  whoosh: () => noiseBurst(.5, 300, 2400, .14),
  boing: () => E.tone([180], 'sine', .45, 0, .2, 3.2),
  clank: () => { E.tone([1400, 900, 1700, 700], 'square', .035, .07, .05); noiseBurst(.25, 3000, 1500, .1, 'highpass'); },
  snore: () => snore(),
  yawn: () => E.tone([620], 'sine', 1.1, 0, .12, .42),
  knock: () => { E.tone([150, 130], 'sine', .07, .16, .32, .6); noiseBurst(.08, 900, 300, .2, 'lowpass'); setTimeout(() => noiseBurst(.08, 900, 300, .2, 'lowpass'), 160); },
  rocket: () => { noiseBurst(1.8, 200, 900, .2, 'lowpass'); E.tone([110], 'sawtooth', 1.4, 0, .05, 3); },
  zap: () => { E.tone([300], 'square', .35, 0, .06, 8); noiseBurst(.4, 4000, 800, .08, 'highpass'); },
  step: () => noiseBurst(.07, 500, 200, .14, 'lowpass'),
  scared: () => { E.tone([420], 'sine', .22, 0, .14, 3.4); E.tone([1500, 1700, 1500, 1700], 'square', .03, .05, .035); }
};

/* ---------- Voz dulce ---------- */
let voices = [];
E.voiceOn = true;
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const lv = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { } };
  lv(); speechSynthesis.onvoiceschanged = lv;
}
const SWEET = /salom|dalia|paloma|elvira|helena|sabina|laura|paulina|m[oó]nica|lupe|ximena|larissa|catalina|camila|elena|abril|beatriz|candela|irene|nuria|renata|valentina|vera|marina|andrea|sof[ií]a|luc[ií]a|google español/i;
const NATURAL = /natural|online|neural|premium|enhanced/i;
E.spanishVoices = () => voices.filter(v => /^es/i.test(v.lang));
E.voicePref = () => { try { return localStorage.getItem('ecobot-voz') || ''; } catch (e) { return ''; } };
E.setVoicePref = n => { try { localStorage.setItem('ecobot-voz', n); } catch (e) { } };
E.voiceScore = v => (/paola/i.test(v.name) ? 20 : 0) + (NATURAL.test(v.name) ? 4 : 0) + (SWEET.test(v.name) ? 3 : 0) + (/CO$/i.test(v.lang) ? 2 : /(MX|US|419)$/i.test(v.lang) ? 1 : 0);
E.bestVoice = () => {
  const es = E.spanishVoices(), pref = E.voicePref(), p = es.find(v => v.name === pref);
  return p || [...es].sort((a, b) => E.voiceScore(b) - E.voiceScore(a))[0] || null;
};
E.speak = function (text, cb = {}) {
  if (!E.voiceOn || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return false;
  try {
    speechSynthesis.cancel(); E.sfx.chirp();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text), v = E.bestVoice(), nat = v && NATURAL.test(v.name);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-CO';
      u.pitch = nat ? 1.2 : 1.5; u.rate = nat ? .96 : .92; u.volume = 1;
      u.onstart = () => cb.onstart && cb.onstart(); u.onend = u.onerror = () => cb.onend && cb.onend();
      speechSynthesis.speak(u);
    }, 260);
    return true;
  } catch (e) { return false; }
};

/* ---------- Corazones ---------- */
E.hearts = function (host, n = 5) {
  if (!host || E.calm) return;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const cols = ['#ff7aa8', '#ff9bbd', '#f2b632', '#33d1b3'];
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span'); h.className = 'heart';
    h.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 4.3 2.4.8-1.2 2.2-2.4 4.4-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="${cols[i % cols.length]}"/></svg>`;
    h.style.left = (25 + Math.random() * 50) + '%'; h.style.top = (20 + Math.random() * 25) + '%';
    h.style.animationDelay = (i * .14) + 's'; h.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    host.appendChild(h); setTimeout(() => h.remove(), 2600 + i * 140);
  }
};

/* ---------- Monerías del robot ---------- */
const TRICK_MS = { headspin: 1400, headturn: 1700, toss: 1900, apart: 3100, spin: 1300, dance: 2600, snore: 3400, yawn: 2300, peek: 2400, scared: 1400, stretch: 1900, wakeup: 2200 };
const TRICKS = {
  headspin: (r, snd) => { snd('whoosh'); r.faceTmp(P.sorprendido, P.sorprendido, 1400); },
  headturn: r => { r.look(-1); setTimeout(() => r.look(1), 600); setTimeout(() => r.look(0), 1300); },
  toss: (r, snd) => { snd('whoosh'); setTimeout(() => snd('boing'), 1400); r.faceTmp(P.feliz, P.feliz, 1900); },
  apart: (r, snd) => { snd('clank'); r.faceTmp(P.sorprendido, P.sorprendido, 2600); setTimeout(() => snd('whoosh'), 1750); setTimeout(() => { snd('boing'); r.faceTmp(P.feliz, P.feliz, 1600); }, 2550); },
  spin: (r, snd) => { snd('whoosh'); setTimeout(() => snd('boing'), 1150); },
  dance: (r, snd, q) => { if (!q) E.tone([523, 659, 784, 659, 880, 784, 1047], 'square', .09, .2, .045); r.cheer(2600); r.faceTmp(P.feliz, P.feliz, 2600); },
  snore: (r, snd) => { snd('snore'); },
  yawn: (r, snd) => { snd('yawn'); r.talk(1500); r.faceTmp(P.medio, P.medio, 1800); },
  peek: (r, snd) => { snd('chirp'); r.faceTmp(P.abierto, P.cerrado, 1500); },
  scared: (r, snd) => { snd('scared'); r.faceTmp(P.sorprendido, P.sorprendido, 1900); },
  stretch: (r, snd) => { snd('yawn'); },
  wakeup: (r, snd) => { snd('chirp'); r.sleep(false); r.faceTmp(P.sorprendido, P.sorprendido, 900); setTimeout(() => r.wave(1500), 900); }
};
E.TRICKS = Object.keys(TRICKS);

/* ---------- Robot ---------- */
let robotN = 0;
E.mountRobot = function (host) {
  const n = ++robotN, gid = 'eglow' + n;
  host.innerHTML = `<svg class="robot" viewBox="0 0 300 330" role="img" aria-label="El Ecobot con sus ojos de matriz LED" style="--glow:url(#${gid})">
  <defs><filter id="${gid}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <ellipse class="shadow" cx="150" cy="322" rx="80" ry="9"/>
  <g class="bob"><g class="jig">
    <g class="p-armLw"><g class="arm armL"><rect x="54" y="240" width="46" height="15" rx="7.5"/><circle cx="56" cy="247.5" r="11"/></g></g>
    <g class="p-armRw"><g class="arm armR"><rect x="200" y="240" width="46" height="15" rx="7.5"/><circle cx="244" cy="247.5" r="11"/></g></g>
    <g class="flame"><path class="fl1" d="M118 300q-10 22 4 44q6-16 4-26q8 14 6 30q14-20 2-48z"/><path class="fl1" d="M170 300q-10 22 4 44q6-16 4-26q8 14 6 30q14-20 2-48z"/><path class="fl2" d="M121 302q-4 14 3 26q3-10 5-26z"/><path class="fl2" d="M173 302q-4 14 3 26q3-10 5-26z"/></g>
    <g class="p-body"><g class="foot footL"><rect x="104" y="298" width="38" height="22" rx="11"/></g><g class="foot footR"><rect x="158" y="298" width="38" height="22" rx="11"/></g><rect class="neck" x="132" y="218" width="36" height="14" rx="4"/><rect class="body" x="92" y="230" width="116" height="76" rx="20"/>
    <circle class="badge" cx="150" cy="268" r="20"/><path class="tri" d="M150 256 L161.5 276 L138.5 276 Z"/></g>
    <g class="p-head">
    <g class="sprout"><path class="stem" d="M150 74 C150 60 150 52 151 42"/><path class="leaf" d="M151 48 C138 30 118 32 112 38 C122 52 140 54 151 48Z"/><path class="leaf" d="M151 44 C162 24 184 24 190 30 C180 46 162 50 151 44Z"/></g>
    <rect class="ear" x="38" y="118" width="24" height="56" rx="9"/><rect class="ear" x="238" y="118" width="24" height="56" rx="9"/>
    <rect class="head" x="58" y="70" width="184" height="150" rx="36"/><rect class="screen" x="76" y="92" width="148" height="106" rx="20"/>
    <g class="eyeL"></g><g class="eyeR"></g><g class="mouth"></g>
    <circle class="cheek" cx="92" cy="182" r="7"/><circle class="cheek" cx="208" cy="182" r="7"/>
    <g class="sweat"><path d="M232 96c-5 8-7 12-3 15s9-1 6-6z" fill="#8cc8f2"/></g>
    </g>
  </g></g>
  <g class="zzz"><text x="230" y="64" font-size="22">z</text><text x="248" y="44" font-size="26">z</text><text x="266" y="24" font-size="32">Z</text></g></svg>`;
  const svg = host.querySelector('svg'), NS = 'http://www.w3.org/2000/svg', leds = { L: [], R: [] }, bars = [];
  [['L', 85], ['R', 155]].forEach(([k, ox]) => {
    const g = svg.querySelector('.eye' + k);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const ci = document.createElementNS(NS, 'circle');
      ci.setAttribute('cx', ox + 3.75 + c * 7.5); ci.setAttribute('cy', 113 + 3.75 + r * 7.5); ci.setAttribute('r', 2.9); ci.setAttribute('class', 'led');
      g.appendChild(ci); leds[k].push(ci);
    }
  });
  const mg = svg.querySelector('.mouth');
  for (let i = 0; i < 7; i++) { const b = document.createElementNS(NS, 'rect'); b.setAttribute('x', 124 + i * 8); b.setAttribute('y', 184.5); b.setAttribute('width', 4); b.setAttribute('height', 3); b.setAttribute('rx', 2); b.setAttribute('class', 'mbar'); mg.appendChild(b); bars.push(b); }
  let anim = null, loop = false, cur = { L: P.abierto, R: P.abierto }, shift = 0, talkT = null, talkIv = null;
  const flash = {};
  const sh = (r, d) => d > 0 ? '0' + r.slice(0, 7) : d < 0 ? r.slice(1) + '0' : r;
  const paint = () => { for (let r = 0; r < 8; r++) { const a = sh(cur.L[r], shift), b = sh(cur.R[r], shift); for (let c = 0; c < 8; c++) { leds.L[r * 8 + c].classList.toggle('on', a[c] === '1'); leds.R[r * 8 + c].classList.toggle('on', b[c] === '1'); } } };
  const cls = (name, ms) => { svg.classList.remove(name); void svg.getBoundingClientRect(); svg.classList.add(name); clearTimeout(flash[name]); if (ms) flash[name] = setTimeout(() => svg.classList.remove(name), ms); };
  const api = {
    svg, host,
    draw(L, R) { cur = { L, R }; paint(); },
    look(d) { shift = d; paint(); },
    stop() { if (anim) clearTimeout(anim); anim = null; loop = false; },
    get busy() { return !!anim; },
    play(seq, speed, lp, done) {
      api.stop(); loop = lp; let i = 0; svg.classList.remove('asleep'); shift = 0;
      const step = () => { const f = seq[i]; api.draw(f, E.mirror(f)); i++; if (i >= seq.length) { if (loop) i = 0; else { anim = setTimeout(() => { anim = null; done && done(); }, speed); return; } } anim = setTimeout(step, speed); };
      step();
    },
    sleep(on) { svg.classList.toggle('asleep', !!on); },
    sprout(sc) { svg.querySelector('.sprout').style.setProperty('--sp', sc.toFixed(2)); },
    pulse() { cls('woke', 2600); },
    wave(ms = 2600) { cls('wave', ms); },
    cheer(ms = 2200) { cls('cheer', ms); },
    wiggle() { cls('wiggle', 650); },
    hop() { cls('hop', 900); },
    hearts(k = 5) { E.hearts(host, k); },
    talk(ms = 2000) {
      clearTimeout(talkT);
      if (!talkIv) {
        svg.classList.add('talking'); let t = 0;
        talkIv = setInterval(() => { t++; bars.forEach((b, i) => { const h = 3 + Math.abs(Math.sin(t * .9 + i * .8)) * (5 + Math.random() * 6); b.setAttribute('height', h.toFixed(1)); b.setAttribute('y', (186 - h / 2).toFixed(1)); }); }, 85);
      }
      if (ms) talkT = setTimeout(api.hush, ms);
    },
    hush() { clearTimeout(talkT); clearInterval(talkIv); talkIv = null; svg.classList.remove('talking'); bars.forEach(b => { b.setAttribute('height', 3); b.setAttribute('y', 184.5); }); },
    tricking: false,
    faceTmp(L, R, ms) { const keep = cur; api.draw(L, R); setTimeout(() => { if (cur.L === L) api.draw(keep.L, keep.R); }, ms); },
    trick(name, opt = {}) {
      const T = TRICKS[name]; if (!T || api.tricking) return false;
      api.tricking = true; const q = opt.quiet;
      const snd = k => { if (!q && E.sfx[k]) E.sfx[k](); };
      svg.classList.add('t-' + name);
      T(api, snd, q);
      setTimeout(() => { svg.classList.remove('t-' + name); api.tricking = false; }, TRICK_MS[name]);
      return true;
    }
  };
  return api;
};

/* Director: hace que un robot reaccione a state.screen (pantalla grande, vista previa del mando y compañero de la tableta). */
E.director = function (robot, h = {}) {
  let st = null, lastId = null, holdT = null, inBase = true, first = true;
  const reduced = E.calm;
  const call = (k, ...a) => { try { return h[k] && h[k](...a); } catch (e) { console.error(e); } };
  const HAPPY = ['feliz', 'amor', 'sorprendido', 'guino'];
  const isAwake = () => st && st.awake && !(h.napping && h.napping());
  const faceOf = sc => sc.L ? { L: sc.L, R: sc.R } : (st.faces[sc.key] || st.faces.abierto || { L: P.abierto, R: P.abierto });
  function base() {
    clearTimeout(holdT); inBase = true; robot.stop(); robot.look(0);
    const aw = isAwake(), k = aw ? 'abierto' : 'dormido', f = st.faces[k] || { L: P[k], R: P[k] };
    robot.draw(f.L, f.R); robot.sleep(!aw); call('status', aw ? (st.faces[k] ? st.faces[k].label : 'Normal') : (st.awake ? 'Tomando una siesta' : 'Dormido'), k);
  }
  function hold(ms) { clearTimeout(holdT); inBase = false; if (ms) holdT = setTimeout(base, ms); }
  function showFace(sc) {
    robot.stop(); robot.look(0); const f = faceOf(sc); robot.draw(f.L, f.R); robot.sleep(sc.key === 'dormido');
    call('status', sc.guess ? '¿Qué emoción es?' : (st.faces[sc.key] ? st.faces[sc.key].label : 'Cara nueva'), sc.key);
    if (!sc.guess && HAPPY.includes(sc.key)) robot.wave();
    if (sc.key === 'amor') robot.hearts(6);
  }
  function talkFor(text) { const ms = Math.max(1600, (text || '').length * 72); robot.talk(ms); return ms; }
  function handle(s) {
    st = s; robot.sprout(E.sproutScale(s));
    const sc = s.screen || {};
    if (sc.id === lastId) { if (inBase && !robot.busy && !(h.frozen && h.frozen())) base(); return; }
    lastId = sc.id;
    if (first) { first = false; if (sc.hold && (sc.kind === 'face' || sc.kind === 'guess')) { showFace(sc); hold(0); } else base(); return; }
    switch (sc.kind) {
      case 'face': case 'guess':
        showFace(sc); if (sc.by) { robot.cheer(); robot.hearts(3); }
        if (sc.text) call('banner', sc.text, sc.by); hold(sc.hold ? 0 : 9000); break;
      case 'say':
        if (sc.key || sc.L) showFace(sc);
        if (sc.by) robot.cheer();
        talkFor(sc.text); call('say', sc.text || '', sc.by);
        hold(sc.hold ? 0 : Math.max(6500, (sc.text || '').length * 95)); break;
      case 'blink':
        inBase = false; call('status', 'Parpadeo', null);
        robot.play(sc.frames || E.blinkSeq(st), sc.speed || st.blinkSpeed, !!sc.loop, base); break;
      case 'peek': {
        const b = st.blink; inBase = false;
        if (sc.text) { talkFor(sc.text); call('say', sc.text, sc.by); }
        robot.play([b[2], b[1], b[0], b[0], b[1], b[2]], 320, false, base); break;
      }
      case 'wake': {
        const b = st.blink; inBase = false; robot.pulse(); call('wake');
        robot.play([b[2], b[1], b[2], b[1], b[0], b[0]], reduced ? 60 : 280, false, () => {
          showFace({ key: 'feliz' }); robot.cheer(3200); robot.hearts(8);
          const t = sc.text || `¡Hola! Soy ${E.botName(st)}.`; talkFor(t); call('say', t, null); hold(9000);
        }); break;
      }
      case 'simon':
        if (sc.key) showFace(sc); else base();
        if (!sc.reveal) talkFor(sc.cmd); else if (sc.says) robot.cheer();
        call('simon', sc); inBase = false; hold(9000); break;
      case 'stunt': call('stunt', sc.name); break;
      default: base();
    }
  }
  const iv = setInterval(() => {
    if (!robot.svg.isConnected) { clearInterval(iv); return; }
    if (!st || !inBase || !isAwake() || robot.busy || robot.tricking || document.hidden || reduced) return;
    const r = Math.random();
    if (r < .5) robot.play(E.blinkSeq(st), st.blinkSpeed, false, base);
    else if (r < .75) { robot.look(-1); setTimeout(() => robot.look(1), 650); setTimeout(() => robot.look(0), 1300); }
    else if (r < .88) robot.wiggle();
    else robot.wave(1800);
  }, 4300);
  return { handle, base, robot };
};

/* ---------- Monerías automáticas según el momento ---------- */
E.energyOf = momentId => ({ m1: 1, m2: 2, m3: 2, m4: 2, pausa: 3, m5: 2, m6: 3 }[momentId] || 1);
E.antics = function (robot, o = {}) {
  let t = null, stopped = false;
  const reduced = E.calm;
  const pick = a => a[Math.random() * a.length | 0];
  function loop() {
    if (stopped || !robot.svg.isConnected) return;
    const m = (o.mood && o.mood()) || { asleep: false, energy: 1 };
    if (!document.hidden && !robot.tricking && !robot.busy && !reduced && !(o.paused && o.paused())) {
      const k = m.asleep ? pick(['snore', 'snore', 'snore', 'yawn', 'peek', 'stretch'])
        : m.energy >= 3 ? pick(['apart', 'toss', 'spin', 'dance', 'headspin', 'dance'])
        : m.energy === 2 ? pick(['dance', 'spin', 'headturn', 'headspin', 'toss', 'headturn'])
        : pick(['headturn', 'dance', 'spin', 'headturn']);
      robot.trick(k, { quiet: o.quiet });
      o.onTrick && o.onTrick(k, m);
    }
    const wait = m.asleep ? 6500 : Math.max(5000, 16000 - (m.energy || 1) * 3500);
    t = setTimeout(loop, wait + Math.random() * 5000);
  }
  t = setTimeout(loop, o.first || 3500);
  return { stop() { stopped = true; clearTimeout(t); }, now(k) { robot.trick(k || 'dance', { quiet: o.quiet }); } };
};

/* ---------- Reacción al pasar el mouse ---------- */
E.hoverReact = function (robot, o = {}) {
  let last = 0;
  robot.host.addEventListener('pointerenter', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (o.disabled && o.disabled()) return;
    const now = Date.now(); if (now - last < (o.cooldown || 3500)) return; last = now;
    if (o.isAsleep && o.isAsleep()) { robot.trick('wakeup'); o.onWake && o.onWake(); }
    else { robot.trick('scared'); o.onScare && o.onScare(); }
  });
};

/* ---------- Escuchar su nombre (micrófono) ---------- */
E.normText = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
E.nameHeard = function (text, names) {
  const t = E.normText(text); if (!t) return null; const words = t.split(' '), flat = t.replace(/ /g, '');
  for (const raw of names) {
    const n = E.normText(raw); if (!n) continue; const nf = n.replace(/ /g, '');
    if (flat.includes(nf)) return raw;
    const tol = nf.length <= 4 ? 0 : nf.length <= 7 ? 1 : 2;
    const parts = n.split(' ').length;
    for (let i = 0; i + parts <= words.length; i++) if (lev(words.slice(i, i + parts).join(''), nf) <= tol) return raw;
  }
  return null;
};
E.listenSupported = () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
E.listen = function (o = {}) {
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  let rec = null, on = false, stream = null, raf = 0, actx = null, quietUntil = 0;
  const st = x => { try { o.onState && o.onState(x); } catch (e) { } };
  async function start() {
    if (!SR) { st('nosupport'); return false; }
    if (on) return true;
    on = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false } });
      actx = new (window.AudioContext || window.webkitAudioContext)(); const an = actx.createAnalyser(); an.fftSize = 512;
      actx.createMediaStreamSource(stream).connect(an); const buf = new Uint8Array(an.fftSize);
      const tick = () => { if (!on) return; an.getByteTimeDomainData(buf); let sum = 0; for (const v of buf) { const x = (v - 128) / 128; sum += x * x; } o.onLevel && o.onLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4)); raf = requestAnimationFrame(tick); };
      tick();
    } catch (e) { on = false; st(window.isSecureContext === false ? 'insecure' : 'denied'); return false; }
    rec = new SR(); rec.lang = o.lang || 'es-CO'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 3;
    rec.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const alts = [...e.results[i]].map(a => a.transcript);
        const speaking = typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking;
        const hit = (Date.now() < quietUntil || speaking) ? null : alts.map(a => E.nameHeard(a, o.names ? o.names() : [])).find(Boolean) || null;
        try { o.onHeard && o.onHeard(alts[0], hit, e.results[i].isFinal); } catch (err) { console.error(err); }
        if (hit) { quietUntil = Date.now() + (o.cooldown || 9000); break; }
      }
    };
    rec.onend = () => { if (on) setTimeout(() => { try { rec.start(); } catch (e) { } }, 250); };
    rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { stop(); st('denied'); } else if (e.error === 'network') st('network'); };
    try { rec.start(); } catch (e) { }
    st('listening'); return true;
  }
  function stop() { on = false; try { rec && rec.stop(); } catch (e) { } if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; cancelAnimationFrame(raf); try { actx && actx.close(); } catch (e) { } actx = null; o.onLevel && o.onLevel(0); st('off'); }
  return { start, stop, get on() { return on; }, mute(ms) { quietUntil = Date.now() + ms; } };
};
E.listenError = st => ({ nosupport: 'Este navegador no puede escuchar. Usen Microsoft Edge o Google Chrome.', denied: 'No me dieron permiso para usar el micrófono. Revisen el candado de la barra de direcciones.', insecure: 'Para escuchar, abran esta pantalla en el computador del servidor (localhost) o con doble clic en el archivo.', network: 'Para entender palabras necesito internet.' }[st] || '');

/* ---------- Partículas mágicas (fondo) ---------- */
E.fx = function (cv, opt = {}) {
  const x = cv.getContext('2d'), reduced = E.calm;
  const F = { mode: opt.mode || 'magia', parts: [], bursts: [], w: 0, h: 0, density: opt.density || 34 };
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); F.w = cv.clientWidth || innerWidth; F.h = cv.clientHeight || innerHeight; cv.width = F.w * d; cv.height = F.h * d; x.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  const R = (a, b) => a + Math.random() * (b - a);
  const LEAF = ['#5fbf5a', '#8bcf62', '#c48a4a', '#3f8f4f'];
  function spawn(initial, mode = F.mode) {
    const y = initial ? R(0, F.h) : null;
    if (mode === 'mix') return spawn(initial, ['agua', 'aire', 'tierra', 'energia'][Math.random() * 4 | 0]);
    if (mode === 'agua') return { k: 'bubble', x: R(0, F.w), y: y ?? F.h + 20, r: R(4, 16), vy: -R(.3, 1), ph: R(0, 6), a: R(.25, .55) };
    if (mode === 'aire') return { k: 'wind', x: initial ? R(0, F.w) : -120, y: R(0, F.h * .8), len: R(40, 110), vx: R(.6, 1.6), ph: R(0, 6), a: R(.15, .35) };
    if (mode === 'tierra') return { k: 'leaf', x: R(0, F.w), y: y ?? -20, r: R(6, 13), vy: R(.4, 1), rot: R(0, 6), vr: R(-.02, .02), ph: R(0, 6), c: LEAF[Math.random() * 4 | 0], a: R(.5, .85) };
    if (mode === 'energia') return { k: 'spark', x: R(0, F.w), y: y ?? R(0, F.h), r: R(3, 8), life: R(80, 200), t: initial ? R(0, 150) : 0, c: '#ffd56b' };
    return { k: 'spark', x: R(0, F.w), y: R(0, F.h), r: R(2, 6), life: R(90, 220), t: initial ? R(0, 150) : 0, c: '#bff5e8' };
  }
  const fire = () => ({ x: R(0, F.w), y: R(F.h * .15, F.h), ph: R(0, 6), sp: R(.004, .01), c: Math.random() < .6 ? '#7fe6d2' : '#ffd56b' });
  let lastMode = null, flies = [];
  function star(cx, cy, r) { x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .38 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); }
  function frame() {
    x.clearRect(0, 0, F.w, F.h);
    if (lastMode !== F.mode) { lastMode = F.mode; F.parts = Array.from({ length: reduced ? 0 : F.density }, () => spawn(true)); flies = Array.from({ length: reduced ? 0 : 16 }, fire); }
    const T = performance.now() / 1000;
    flies.forEach(f => { f.ph += f.sp * 6; f.x += Math.cos(f.ph) * .4; f.y += Math.sin(f.ph * .7) * .3; const a = .35 + .35 * Math.sin(T * 2 + f.ph * 3); x.fillStyle = f.c; x.globalAlpha = a; x.beginPath(); x.arc(f.x, f.y, 2.2, 0, 7); x.fill(); x.globalAlpha = a * .25; x.beginPath(); x.arc(f.x, f.y, 7, 0, 7); x.fill(); });
    F.parts.forEach((p, i) => {
      const re = () => { F.parts[i] = spawn(false, F.mode === 'mix' ? 'mix' : F.mode); };
      if (p.k === 'bubble') { p.y += p.vy; p.ph += .02; const px = p.x + Math.sin(p.ph) * 8; x.globalAlpha = p.a; x.strokeStyle = '#bfe6ff'; x.lineWidth = 1.6; x.beginPath(); x.arc(px, p.y, p.r, 0, 7); x.stroke(); x.fillStyle = '#fff'; x.globalAlpha = p.a * .8; x.beginPath(); x.arc(px - p.r * .35, p.y - p.r * .35, p.r * .22, 0, 7); x.fill(); if (p.y < -30) re(); }
      else if (p.k === 'wind') { p.x += p.vx; p.ph += .03; x.globalAlpha = p.a; x.strokeStyle = '#d6f5fa'; x.lineWidth = 2.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(p.x, p.y); x.bezierCurveTo(p.x + p.len * .3, p.y - 10 * Math.sin(p.ph), p.x + p.len * .7, p.y + 10 * Math.sin(p.ph), p.x + p.len, p.y); x.stroke(); x.beginPath(); x.arc(p.x + p.len, p.y - 6, 6, Math.PI * .5, Math.PI * 1.9); x.stroke(); if (p.x > F.w + 40) re(); }
      else if (p.k === 'leaf') { p.y += p.vy; p.ph += .02; p.rot += p.vr; const px = p.x + Math.sin(p.ph) * 20; x.save(); x.translate(px, p.y); x.rotate(p.rot + Math.sin(p.ph) * .6); x.globalAlpha = p.a; x.fillStyle = p.c; x.beginPath(); x.ellipse(0, 0, p.r, p.r * .5, 0, 0, 7); x.fill(); x.restore(); if (p.y > F.h + 20) re(); }
      else { p.t++; const k = p.t / p.life, a = Math.sin(Math.PI * Math.min(1, k)); x.globalAlpha = a * .9; x.fillStyle = p.c; star(p.x, p.y, p.r * (0.6 + a * .5)); if (k >= 1) re(); }
    });
    F.bursts = F.bursts.filter(b => b.t < b.life);
    F.bursts.forEach(b => { b.t++; b.vy += .25; b.x += b.vx; b.y += b.vy; b.rot += b.vr; x.globalAlpha = 1 - b.t / b.life; x.fillStyle = b.c; x.save(); x.translate(b.x, b.y); x.rotate(b.rot); if (b.s === 'star') star(0, 0, b.r); else if (b.s === 'leaf') { x.beginPath(); x.ellipse(0, 0, b.r, b.r * .5, 0, 0, 7); x.fill(); } else { x.beginPath(); x.arc(0, 0, b.r * .6, 0, 7); x.fill(); } x.restore(); });
    x.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  F.burst = (cx, cy, n = 60, cols = ['#f2b632', '#33d1b3', '#ffffff', '#5fbf5a', '#7fe6d2', '#ff9bbd']) => {
    if (reduced) return;
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9; F.bursts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 5 + Math.random() * 8, c: cols[i % cols.length], s: ['star', 'leaf', 'dot'][i % 3], rot: 0, vr: (Math.random() - .5) * .3, t: 0, life: 70 + Math.random() * 40 }); }
  };
  return F;
};

/* ---------- Paisajes ilustrados ---------- */
const tree = (x, y, s = 1, c = '#2f8a57') => `<g transform="translate(${x} ${y}) scale(${s})"><g class="ls-sway"><rect x="-5" y="-34" width="10" height="36" rx="4" fill="#6b4a2b"/><circle cx="0" cy="-48" r="24" fill="${c}"/><circle cx="-16" cy="-38" r="16" fill="${c}"/><circle cx="16" cy="-38" r="16" fill="${c}"/><circle cx="-6" cy="-56" r="8" fill="#ffffff" opacity=".12"/></g></g>`;
const pine = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-14" width="8" height="16" fill="#5a3e24"/><path d="M0-80L-22-38h10L-26-14h52L12-38h10z" fill="#246b45"/></g>`;
const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0v-14" stroke="#3f8f4f" stroke-width="2.4"/><g class="ls-bloom">${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 4.5}" cy="${-16 + Math.sin(a * Math.PI / 180) * 4.5}" r="3.6" fill="${c}"/>`).join('')}<circle cx="0" cy="-16" r="2.6" fill="#f2b632"/></g></g>`;
const LANDMARK = {
  agua: `<g><ellipse cx="0" cy="0" rx="190" ry="34" fill="#2f86c9"/><ellipse cx="0" cy="-4" rx="170" ry="24" fill="#4fa6e3"/><g class="ls-wave">${[-110, -30, 50, 120].map((x, i) => `<path d="M${x - 22} ${-6 + (i % 2) * 10}q11-7 22 0t22 0" stroke="#d6efff" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}</g>
    <g class="ls-jump"><path d="M-20 0c6-14 20-16 30-6l8-6-2 10 2 10-8-6c-10 10-24 8-30-2z" fill="#f2b632"/><circle cx="-10" cy="-6" r="2" fill="#173024"/></g>
    <g transform="translate(130 -18)"><path d="M0 0h34l-6 10H6z" fill="#e3a313"/><path d="M17 0v-30l14 22z" fill="#fff"/></g></g>`,
  aire: `<g><path d="M-14 0l8-120h12l8 120z" fill="#e9f6eb"/><path d="M-8 -60h16" stroke="#cfe8d6" stroke-width="4"/><rect x="-10" y="-34" width="20" height="26" rx="10" fill="#4fb8c9"/>
    <g transform="translate(0 -120)"><g class="ls-spin">${[0, 90, 180, 270].map(a => `<path transform="rotate(${a})" d="M0 0L-9 -70Q0 -78 9 -70Z" fill="#ffffff" opacity=".95"/>`).join('')}<circle r="8" fill="#4fb8c9"/></g></g>
    <g transform="translate(-170 -150)"><g class="ls-kite"><path d="M0 -24L18 0 0 30-18 0z" fill="#e3a313"/><path d="M0-24V30M-18 0h36" stroke="#fff" stroke-width="1.5"/><path d="M0 30q-10 20 6 34t-4 32" stroke="#fff" stroke-width="1.6" fill="none"/></g></g></g>`,
  tierra: `<g>${tree(0, 0, 2.1, '#3f9a5a')}${flower(-80, 0, '#ff7aa8')}${flower(-60, 4, '#f2b632')}${flower(70, 2, '#ffffff')}${flower(92, 0, '#ff7aa8')}
    <g transform="translate(-120 2)"><rect x="-3" y="-10" width="6" height="10" fill="#f3e6d0"/><path d="M-12-10a12 9 0 0 1 24 0z" fill="#d9534f"/><circle cx="-4" cy="-14" r="2" fill="#fff"/><circle cx="4" cy="-12" r="1.6" fill="#fff"/></g>
    <g transform="translate(120 4)"><g class="ls-worm"><path d="M0 0q6-10 12 0t12 0t12 0" stroke="#ff9bbd" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="36" cy="-1" r="1.6" fill="#173024"/></g></g></g>`,
  energia: `<g>${[-110, -40, 30].map(x => `<g transform="translate(${x} 0)"><path d="M0 0v-20M40 0v-20" stroke="#8aa0a8" stroke-width="4"/><g transform="translate(0 -22) skewX(-18)"><rect width="56" height="32" rx="3" fill="#1d4f8f"/><path d="M14 0v32M28 0v32M42 0v32M0 16h56" stroke="#7fb4ff" stroke-width="1.5"/><rect class="ls-glint" x="2" y="2" width="10" height="28" fill="#fff" opacity=".0"/></g></g>`).join('')}
    <g transform="translate(130 0)"><rect x="-3" y="-110" width="6" height="110" fill="#b9c6cc"/><path d="M-3-110h-18" stroke="#b9c6cc" stroke-width="5"/><circle class="ls-lamp" cx="-22" cy="-102" r="9" fill="#ffd56b"/></g>
    <g transform="translate(-170 -90)"><g class="ls-bolt"><path d="M10 0L-6 24h10L0 46l18-28H8z" fill="#ffd56b"/></g></g></g>`
};
E.landscape = function (mode) {
  const lm = (k, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${LANDMARK[k]}</g>`;
  const marks = mode === 'mix' ? lm('agua', 170, 236, .62) + lm('aire', 470, 214, .72) + lm('tierra', 760, 218, .8) + lm('energia', 1060, 222, .8) : lm(mode in LANDMARK ? mode : 'tierra', 880, 222, 1);
  return `<svg class="landscape" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g class="ls-cloud"><g fill="#ffffff" opacity=".1"><ellipse cx="160" cy="40" rx="60" ry="16"/><ellipse cx="200" cy="30" rx="40" ry="16"/><ellipse cx="760" cy="60" rx="70" ry="14"/><ellipse cx="800" cy="50" rx="40" ry="14"/></g></g>
    <path d="M0 150C120 110 240 120 360 140S600 100 740 120 1000 150 1200 110V260H0z" fill="#123f29"/>
    ${pine(90, 158, .9)}${pine(130, 150, .7)}${pine(1110, 138, .85)}${pine(1150, 130, .65)}${pine(560, 132, .6)}
    <path d="M0 190C160 160 300 175 460 186S760 160 920 172 1100 196 1200 176V260H0z" fill="#17512f"/>
    ${mode === 'mix' ? '' : tree(260, 196, .9, '#2f8a57') + tree(330, 200, .7, '#3a9a5f')}
    <path d="M0 226C200 210 380 218 600 228S1000 212 1200 222V260H0z" fill="#1e6a3d"/>
    ${marks}
    ${mode === 'mix' ? '' : flower(80, 236, '#ff9bbd') + flower(110, 240, '#f2b632') + flower(1150, 238, '#ffffff')}
  </svg>`;
};

/* ---------- Cuadrícula LED editable ---------- */
E.makeGrid = function (host, get, set, opt = {}) {
  const labels = opt.labels !== false;
  host.innerHTML = ''; host.classList.toggle('labeled', labels);
  const cells = [];
  if (labels) host.insertAdjacentHTML('beforeend', '<span></span>' + [1, 2, 3, 4, 5, 6, 7, 8].map(n => `<span class="lb">${n}</span>`).join(''));
  for (let r = 0; r < 8; r++) {
    if (labels) host.insertAdjacentHTML('beforeend', `<span class="lb">${E.ROWL[r]}</span>`);
    for (let c = 0; c < 8; c++) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cell'; b.dataset.r = r; b.dataset.c = c;
      b.setAttribute('aria-label', `Fila ${E.ROWL[r]}, columna ${c + 1}`); host.appendChild(b); cells.push(b);
    }
  }
  const refresh = () => { const rows = get(); cells.forEach(b => { const on = rows[+b.dataset.r][+b.dataset.c] === '1'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); };
  let paint = null;
  const apply = b => { const r = +b.dataset.r, c = +b.dataset.c; if (get()[r][c] === paint) return; set(r, c, paint); refresh(); };
  const end = () => { if (paint !== null) { paint = null; opt.onEnd && opt.onEnd(); } };
  host.onpointerdown = e => {
    const b = e.target.closest('.cell'); if (!b) return; e.preventDefault();
    paint = get()[+b.dataset.r][+b.dataset.c] === '1' ? '0' : '1'; opt.onStart && opt.onStart(); apply(b);
  };
  host.onpointermove = e => { if (paint === null) return; const t = document.elementFromPoint(e.clientX, e.clientY); const b = t && t.closest && t.closest('.cell'); if (b && host.contains(b)) apply(b); };
  host.onpointerup = end; host.onpointercancel = end; host.onpointerleave = e => { if (e.pointerType === 'mouse') end(); };
  host.onclick = e => { if (e.detail !== 0) return; const b = e.target.closest('.cell'); if (!b) return; paint = get()[+b.dataset.r][+b.dataset.c] === '1' ? '0' : '1'; opt.onStart && opt.onStart(); apply(b); end(); };
  refresh(); return refresh;
};
E.faceSVG = f => {
  let s = '<svg viewBox="0 0 134 62" aria-hidden="true">';
  [[f.L, 2], [f.R, 72]].forEach(([rows, ox]) => { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) s += `<circle cx="${ox + 3.75 + c * 7.5}" cy="${3.75 + r * 7.5}" r="2.9" fill="${rows[r][c] === '1' ? '#33d1b3' : '#21403b'}"/>`; });
  return s + '</svg>';
};

/* ---------- Escáner de la hoja ---------- */
E.SHEET = { w: 215.9, h: 279.4, mc: [[23.95, 62], [191.95, 62], [191.95, 230], [23.95, 230]], ms: 14, gx: 38.95, gy: 77, cell: 17.25 };
E.INSET = 15 / 168;
function otsu(hist, N) { let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i]; let sB = 0, wB = 0, best = 0, t = 128; for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += i * hist[i]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) ** 2; if (v > best) { best = v; t = i; } } return t; }
function polyArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const j = (i + 1) % p.length; a += p[i].x * p[j].y - p[j].x * p[i].y; } return Math.abs(a) / 2; }
E.detectMarkers = function (src) {
  const W0 = src.width, H0 = src.height, k = Math.min(1, 400 / Math.max(W0, H0)), w = Math.max(1, Math.round(W0 * k)), h = Math.max(1, Math.round(H0 * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data, N = w * h, g = new Uint8Array(N), hist = new Float64Array(256);
  for (let i = 0; i < N; i++) { const v = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) | 0; g[i] = v; hist[v]++; }
  const t = otsu(hist, N) * .8, lab = new Int32Array(N), stack = new Int32Array(N), comps = []; let id = 0;
  for (let i = 0; i < N; i++) {
    if (lab[i] || g[i] >= t) continue; id++; let sp = 0; stack[sp++] = i; lab[i] = id; let cnt = 0, sx = 0, sy = 0, x0 = w, x1 = 0, y0 = h, y1 = 0, edge = false;
    while (sp) {
      const p = stack[--sp], px = p % w, py = (p / w) | 0; cnt++; sx += px; sy += py; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; if (px === 0 || py === 0 || px === w - 1 || py === h - 1) edge = true;
      if (px > 0) { const q = p - 1; if (!lab[q] && g[q] < t) { lab[q] = id; stack[sp++] = q; } } if (px < w - 1) { const q = p + 1; if (!lab[q] && g[q] < t) { lab[q] = id; stack[sp++] = q; } }
      if (py > 0) { const q = p - w; if (!lab[q] && g[q] < t) { lab[q] = id; stack[sp++] = q; } } if (py < h - 1) { const q = p + w; if (!lab[q] && g[q] < t) { lab[q] = id; stack[sp++] = q; } }
    }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1; comps.push({ cnt, cx: sx / cnt, cy: sy / cnt, bw, bh, edge });
  }
  const cand = comps.filter(o => !o.edge && o.cnt >= N * .0003 && o.cnt <= N * .03 && o.bw / o.bh > .5 && o.bw / o.bh < 2 && o.cnt / (o.bw * o.bh) > .55);
  if (cand.length < 4) return null;
  const pick = f => cand.reduce((a, b) => f(b) < f(a) ? b : a);
  const pts = [pick(o => o.cx + o.cy), pick(o => o.cy - o.cx), pick(o => -(o.cx + o.cy)), pick(o => o.cx - o.cy)];
  if (new Set(pts).size < 4) return null;
  const areas = pts.map(o => o.cnt); if (Math.max(...areas) / Math.min(...areas) > 3.5) return null;
  if (polyArea(pts.map(o => ({ x: o.cx, y: o.cy }))) < N * .06) return null;
  return pts.map(o => ({ x: o.cx / k, y: o.cy / k }));
};
function solve(A, b) { const n = 8, M = A.map((r, i) => [...r, b[i]]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; if (Math.abs(M[p][c]) < 1e-10) return null; [M[c], M[p]] = [M[p], M[c]]; for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } return M.map((r, i) => r[n] / r[i]); }
E.homog = function (cs) { const U = [[0, 0], [1, 0], [1, 1], [0, 1]], A = [], B = []; for (let i = 0; i < 4; i++) { const [u, v] = U[i], { x, y } = cs[i]; A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); B.push(x); A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); B.push(y); } return solve(A, B); };
E.hp = (h, u, v) => { const w = h[6] * u + h[7] * v + 1; return { x: (h[0] * u + h[1] * v + h[2]) / w, y: (h[3] * u + h[4] * v + h[5]) / w }; };
E.toScanImage = function (src, max = 1400) {
  const s = Math.min(1, max / Math.max(src.width, src.height)), c = document.createElement('canvas');
  c.width = Math.round(src.width * s); c.height = Math.round(src.height * s);
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0, c.width, c.height);
  return { canvas: c, W: c.width, H: c.height, data: x.getImageData(0, 0, c.width, c.height).data };
};
E.sampleGrid = function (img, corners, ins, sens = 0) {
  const H = E.homog(corners); if (!H) return null;
  const g = (1 - 2 * ins) / 8, d = img.data, W = img.W, Hh = img.H, sc = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const u = ins + (c + .5) * g, v = ins + (r + .5) * g, p = E.hp(H, u, v), q = E.hp(H, u + g * .3, v), q2 = E.hp(H, u, v + g * .3); let sum = 0, n = 0;
    for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) {
      const x = Math.round(p.x + ((q.x - p.x) * a + (q2.x - p.x) * b) / 2), y = Math.round(p.y + ((q.y - p.y) * a + (q2.y - p.y) * b) / 2);
      if (x < 0 || y < 0 || x >= W || y >= Hh) continue;
      const i = (y * W + x) * 4, R = d[i], G = d[i + 1], B = d[i + 2], L = (R * .299 + G * .587 + B * .114) / 255, ch = (Math.max(R, G, B) - Math.min(R, G, B)) / 255;
      sum += Math.max(1 - L, ch * 1.15); n++;
    }
    sc.push(n ? sum / n : 0);
  }
  const mn = Math.min(...sc), mx = Math.max(...sc); let th;
  if (mx - mn < .12) th = mx < .35 ? 2 : -1;
  else { let best = -1; th = (mn + mx) / 2; for (let k = 1; k < 40; k++) { const t = mn + (mx - mn) * k / 40; let n0 = 0, s0 = 0, n1 = 0, s1 = 0; sc.forEach(v => { if (v < t) { n0++; s0 += v; } else { n1++; s1 += v; } }); if (!n0 || !n1) continue; const bv = n0 * n1 * (s0 / n0 - s1 / n1) ** 2; if (bv > best) { best = bv; th = t; } } }
  th -= sens;
  return [0, 1, 2, 3, 4, 5, 6, 7].map(r => sc.slice(r * 8, r * 8 + 8).map(v => v >= th ? '1' : '0').join(''));
};
E.loadImageFile = file => new Promise((res, rej) => {
  if (!file || !/^image\//.test(file.type)) { rej(new Error('tipo')); return; }
  const url = URL.createObjectURL(file), im = new Image();
  im.onload = () => { res(im); URL.revokeObjectURL(url); }; im.onerror = () => rej(new Error('img')); im.src = url;
});
E.drawSheet = function (x, face) {
  const s = E.SHEET; x.fillStyle = '#fff'; x.fillRect(0, 0, s.w, s.h);
  x.fillStyle = '#7b9a86'; x.font = '600 5px Poppins, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText('Ecobot Cobra Vida · Taller 1', 24, 18);
  x.font = '500 8px Poppins, sans-serif'; x.fillText('Hoja escaneable · Caras del Ecobot', 24, 29);
  x.font = '500 4.2px Nunito, sans-serif'; x.fillStyle = '#8aa595'; x.fillText('Escuadrón: Agua        Emoción: Feliz        Ojo: izquierdo', 24, 42);
  x.fillStyle = '#111'; s.mc.forEach(([cx, cy]) => x.fillRect(cx - s.ms / 2, cy - s.ms / 2, s.ms, s.ms));
  x.strokeStyle = '#b9c8bd'; x.lineWidth = .35; x.fillStyle = '#a0b0a5'; x.font = '600 3.2px Poppins, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i < 8; i++) { x.fillText(i + 1, s.gx + (i + .5) * s.cell, s.gy - 4); x.fillText(E.ROWL[i], s.gx - 4, s.gy + (i + .5) * s.cell); }
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const cx = s.gx + (c + .5) * s.cell, cy = s.gy + (r + .5) * s.cell; x.beginPath(); x.arc(cx, cy, 7, 0, 7); x.stroke();
    if (face[r][c] === '1') { x.save(); x.beginPath(); x.arc(cx, cy, 7.4, 0, 7); x.clip(); x.strokeStyle = '#167e6c'; x.lineCap = 'round'; x.lineWidth = 2.6; x.beginPath(); for (let k = -9; k <= 9; k += 2.2) { x.moveTo(cx - 9 + Math.random(), cy + k + Math.random()); x.lineTo(cx + 9 - Math.random(), cy + k - 2 + Math.random()); } x.stroke(); x.restore(); }
  }
};
E.demoPhoto = function (face = P.feliz) {
  const c = document.createElement('canvas'); c.width = 1100; c.height = 1400; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 1100, 1400); gr.addColorStop(0, '#5e4632'); gr.addColorStop(1, '#3e2d20'); x.fillStyle = gr; x.fillRect(0, 0, 1100, 1400);
  x.save(); x.translate(560, 700); x.rotate(-.055); x.transform(1, 0, .02, 1, 0, 0); const k = 4.35; x.translate(-E.SHEET.w * k / 2, -E.SHEET.h * k / 2);
  x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 30; x.fillStyle = '#fff'; x.fillRect(0, 0, E.SHEET.w * k, E.SHEET.h * k); x.shadowColor = 'transparent'; x.scale(k, k); E.drawSheet(x, face); x.restore();
  const v = x.createRadialGradient(500, 600, 200, 560, 700, 900); v.addColorStop(0, 'rgba(255,240,210,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)'); x.fillStyle = v; x.fillRect(0, 0, 1100, 1400);
  return c;
};

/* Guarda los valores de los campos antes de re-dibujar una vista y los restaura después. */
E.keepInputs = function (host, fn) {
  const vals = {}, ae = document.activeElement, aid = ae && host.contains(ae) ? ae.id : null;
  let sel = null; try { if (aid && ae.selectionStart != null) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { }
  host.querySelectorAll('input[id],select[id],textarea[id]').forEach(el => { if (el.type === 'checkbox' || el.type === 'radio' || el.type === 'file' || el.type === 'range') return; vals[el.id] = el.value; });
  const y = window.scrollY; fn();
  Object.entries(vals).forEach(([id, v]) => { const el = document.getElementById(id); if (el && host.contains(el) && el.dataset.keep !== 'no') { if (el.tagName === 'SELECT') { if ([...el.options].some(o => o.value === v)) el.value = v; } else el.value = v; } });
  if (aid) { const el = document.getElementById(aid); if (el) { el.focus({ preventScroll: true }); try { if (sel) el.setSelectionRange(sel[0], sel[1]); } catch (e) { } } }
  window.scrollTo(0, y);
};

return E;
});
