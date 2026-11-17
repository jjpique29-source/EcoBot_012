/* Ecobot Cobra Vida · shows de la pantalla grande (canciones, fiesta, magia, ejercicio, adivinanzas, datos).
   Se carga después del script de pantalla.html y usa sus funciones: robot, dir, FX, caption, voice, face, shake, host, S, STUNTS, STUNT_MS. */
(function () {
'use strict';
const E = window.Ecobot;
const $ = s => document.querySelector(s);
const pick = a => a[Math.random() * a.length | 0];

/* ---------- Música con WebAudio (sin archivos) ---------- */
let mac = null;
const ctx = () => { mac = mac || new (window.AudioContext || window.webkitAudioContext)(); if (mac.state === 'suspended') mac.resume(); return mac; };
const SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = (n, tr = 0) => { const m = /^([A-G]#?)(\d)$/.exec(n); const midi = 12 * (+m[2] + 1) + SEMI[m[1]] + tr; return 440 * Math.pow(2, (midi - 69) / 12); };
let noiseBuf = null;
function noise(c) { if (noiseBuf) return noiseBuf; const n = c.sampleRate * .5; noiseBuf = c.createBuffer(1, n, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return noiseBuf; }
function note(c, out, t, f, dur, type, vol) {
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur * .98);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur);
}
function drum(c, out, t, kind) {
  if (kind === 'kick') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .15); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(out); o.start(t); o.stop(t + .22); return; }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = noise(c);
  f.type = kind === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'hat' ? 7000 : 1800;
  const v = kind === 'hat' ? .05 : kind === 'clap' ? .3 : .18, d = kind === 'hat' ? .04 : .12;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d + .02);
}
function play(song) {
  const spb = 60 / song.bpm;
  if (!E.soundOn) return { stop() {}, spb };
  const c = ctx(), out = c.createGain(); out.gain.value = .9; out.connect(c.destination);
  const t0 = c.currentTime + .08; let b = 0;
  song.melody.forEach(([n, beats]) => { if (n !== '-') note(c, out, t0 + b * spb, freq(n, song.tr || 0), beats * spb, song.lead || 'square', .055); b += beats; });
  let bb = 0; song.bass.forEach(([n, beats]) => { note(c, out, t0 + bb * spb, freq(n, song.tr || 0), beats * spb, 'triangle', .16); bb += beats; });
  const total = Math.max(b, bb);
  for (let k = 0; k < total; k++) {
    const t = t0 + k * spb;
    if (k % 2 === 0) drum(c, out, t, 'kick'); else drum(c, out, t, song.clap ? 'clap' : 'snare');
    drum(c, out, t, 'hat'); drum(c, out, t + spb / 2, 'hat');
  }
  return { spb, stop() { try { out.gain.setTargetAtTime(0, c.currentTime, .05); setTimeout(() => out.disconnect(), 500); } catch (e) { } } };
}

/* ---------- Motivos melódicos (cada uno dura 8 tiempos) ---------- */
const M = {
  A: [['E5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['D5', 1], ['C5', 1], ['D5', 2]],
  B: [['E5', 1], ['E5', 1], ['G5', 1], ['A5', 1], ['G5', 1], ['E5', 1], ['C5', 2]],
  C: [['A5', 1], ['G5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['D5', 1], ['C5', 2]],
  D: [['C6', .5], ['C6', .5], ['A5', 1], ['C6', .5], ['C6', .5], ['A5', 1], ['G5', 1], ['E5', 1], ['G5', 2]],
  F: [['A5', 1], ['A5', .5], ['G5', .5], ['E5', 1], ['D5', 1], ['E5', 1], ['D5', 1], ['C5', 2]],
  G: [['G5', .5], ['A5', .5], ['G5', .5], ['E5', .5], ['C5', 1], ['D5', 1], ['E5', 1], ['G5', 1], ['E5', 2]],
  H: [['C5', 1], ['D5', 1], ['E5', 1], ['G5', 1], ['A5', 1], ['G5', 1], ['E5', 2]],
  R: [['-', 4], ['G5', .5], ['E5', .5], ['G5', 1], ['C6', 2]]
};
const BASS = { v: [['C3', 2], ['F3', 2], ['G3', 2], ['C3', 2]], c: [['F3', 2], ['G3', 2], ['E3', 2], ['A3', 2]], i: [['C3', 2], ['G2', 2]] };
function build(order, bassOrder) {
  const melody = [['-', 4]], bass = [...BASS.i];
  order.forEach(k => melody.push(...M[k])); bassOrder.forEach(k => bass.push(...BASS[k]));
  melody.push(['C5', 2], ['-', 2]); bass.push(['C3', 4]);
  return { melody, bass };
}

/* ---------- Canciones originales ---------- */
const SONGS = {
  song_reciclaje: () => ({
    title: 'El baile del reciclaje', intro: '¡Canten conmigo la canción del reciclaje!', bpm: 116, lead: 'square', tr: 0,
    lines: ['Blanca para el plástico, el cartón y el papel,', 'verde para la comida que sobró en el mantel,', 'negra para lo que ya no se puede usar,', '¡y así nuestro planeta vuelve a respirar!', '¡Separa, separa, separa sin parar!', '¡Que el Ecobot te enseña a reciclar!'],
    ...build(['A', 'B', 'A', 'C', 'D', 'F'], ['v', 'v', 'v', 'v', 'c', 'c'])
  }),
  song_gotita: () => ({
    title: 'La gotita viajera', intro: '¡Ahora cantemos la canción de la gotita!', bpm: 100, lead: 'triangle', tr: 5,
    lines: ['Soy una gotita, viajo sin parar,', 'del río a la nube, de la nube al mar.', 'Cierra la llave mientras te cepillas,', '¡y la gotita feliz va a cantar!', '¡Plic, plic, plac! ¡Agua para todos!', '¡Plic, plic, plac! ¡La cuidamos juntos!'],
    ...build(['H', 'G', 'H', 'C', 'D', 'D'], ['v', 'v', 'v', 'v', 'c', 'c'])
  }),
  song_ecobot: () => {
    const n = E.botName(S);
    return {
      title: `La canción de ${n}`, intro: `¡Esta canción es sobre mí! ¡Canten conmigo!`, bpm: 122, lead: 'square', tr: 2, clap: true,
      lines: ['Tengo luces en los ojos y una hoja en la cabeza,', `soy ${n}, el robot de la naturaleza.`, 'Si reciclas y cuidas el agua del lugar,', '¡mis luces de colores se empiezan a prender!', '¡Bip, bup, bip! ¡Cuida tu planeta!', '¡Bip, bup, bip! ¡Con el corazón!'],
      ...build(['G', 'A', 'G', 'B', 'D', 'F'], ['v', 'v', 'v', 'v', 'c', 'c'])
    };
  },
  song_energia: () => ({
    title: 'Apaga la luz', intro: '¡Vamos con la canción de la energía!', bpm: 110, lead: 'sawtooth', tr: -3,
    lines: ['Si sales del salón, apaga la luz,', 'si nadie ve la tele, desconéctala tú.', 'El sol nos regala energía sin fin,', '¡ahorremos juntos, sí, sí, sí!', '¡Clic, clic! ¡Apaga y ahorra!', '¡Clic, clic! ¡El planeta lo agradece!'],
    ...build(['B', 'C', 'A', 'F', 'D', 'G'], ['v', 'v', 'v', 'v', 'c', 'c'])
  })
};

/* ---------- Ayudas visuales ---------- */
function layer(cls, html) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html || ''; document.body.appendChild(d); return d; }
function eq() { return Array.from({ length: 8 }, () => { const h = 1 + (Math.random() * 7 | 0); return h; }).reduce((rows, h, c) => rows.map((r, i) => r.slice(0, c) + (7 - i < h ? '1' : '0') + r.slice(c + 1)), Array(8).fill('00000000')); }
let walkT = null;
function move(x, y, s = 1, ms = 900, rot = 0) { host.style.transition = `transform ${ms}ms cubic-bezier(.4,1.2,.5,1)`; host.style.transform = `translate(${x}vw,${y}vh) scale(${s}) rotate(${rot}deg)`; robot.svg.classList.add('walking'); clearTimeout(walkT); walkT = setTimeout(() => robot.svg.classList.remove('walking'), ms); }
function home(ms = 900) { move(0, 0, 1, ms); }
let cleanup = [];
const later = (at, ms, fn) => at(ms, fn);

/* Canción con karaoke */
function songShow(key) {
  return at => {
    const song = SONGS[key](); const spb = 60 / song.bpm, beatMs = spb * 1000, introMs = 2600;
    voice(song.intro); caption(song.title, 2600);
    const k = layer('karaoke', `<small>${E.esc(song.title)}</small><p class="kline" id="kline"></p><p class="knext" id="knext"></p>`);
    cleanup.push(() => k.remove());
    let player = null, beatT = null, beat = 0;
    at(introMs, () => {
      player = play(song); cleanup.push(() => player.stop());
      robot.svg.classList.add('singing');
      beatT = setInterval(() => {
        beat++;
        robot.draw(eq(), eq()); robot.talk(beatMs * .8);
        const line = Math.floor((beat - 4) / 8);
        if (beat % 8 === 0 && line < song.lines.length) robot.hearts(1);
        if (beat >= 4 && (beat - 4) % 8 === 0 && line < song.lines.length) {
          const kl = $('#kline'); kl.textContent = song.lines[line]; kl.style.setProperty('--d', (beatMs * 8) + 'ms'); kl.classList.remove('go'); void kl.offsetWidth; kl.classList.add('go');
          $('#knext').textContent = song.lines[line + 1] || '';
          if (line >= 4) robot.cheer(beatMs * 8);
          const pos = [[-3, 0, 1], [14, -2, 1.08], [4, 2, 1.02], [18, 0, 1.12], [8, -3, 1.15], [20, 2, 1.2]][line] || [0, 0, 1];
          move(pos[0], pos[1], pos[2], beatMs * 2);
          if (line === 4) robot.trick('spin');
        }
        if (beat % 2 === 0) FX.burst(innerWidth * (.15 + Math.random() * .7), innerHeight * (.1 + Math.random() * .3), 6);
      }, beatMs);
      cleanup.push(() => clearInterval(beatT));
    });
    const total = introMs + (4 + song.lines.length * 8 + 4) * beatMs;
    at(total - 1800, () => { clearInterval(beatT); face('feliz'); caption('¡Muy bien! ¡Aplausos!', 2200); robot.cheer(2000); robot.hearts(8); FX.burst(innerWidth / 2, innerHeight * .4, 120); home(); });
    return total;
  };
}

/* Fiesta disco */
function discoShow(at) {
  const bpm = 124, beatMs = 60000 / bpm, beats = 64;
  const ball = layer('disco', '<div class="cord"></div><div class="ball"></div>'); const spots = layer('spots', '<i></i><i></i><i></i><i></i>');
  cleanup.push(() => { ball.remove(); spots.remove(); document.body.classList.remove('party-on'); });
  voice('¡Fiesta Ecobot! ¡Todos a bailar!'); caption('¡FIESTA ECOBOT!', 2600);
  at(300, () => { document.body.classList.add('party-on'); });
  at(2400, () => {
    const song = { bpm, lead: 'square', tr: 0, clap: true, ...(() => { const m = [], b = []; ['G', 'D', 'G', 'F', 'G', 'D', 'H', 'D'].forEach(k => m.push(...M[k])); for (let i = 0; i < 8; i++) b.push(...BASS[i % 2 ? 'c' : 'v']); return { melody: m, bass: b }; })() };
    const p = play(song); cleanup.push(() => p.stop());
    let beat = 0; const calls = ['¡Arriba las manos!', '¡Den una vuelta!', '¡Como robots!', '¡Aplausos!', '¡A la izquierda!', '¡A la derecha!', '¡Saltamos!', '¡Fiesta Ecobot!'];
    const tt = setInterval(() => {
      beat++; robot.draw(eq(), eq());
      const xs = [-4, 10, 22, 10, -4, 16];
      if (beat % 4 === 0) move(xs[(beat / 4) % xs.length], beat % 8 ? -3 : 1, 1 + (beat % 8 ? .05 : 0), beatMs * 2, beat % 8 ? -6 : 6);
      if (beat % 8 === 0) { const c = calls[(beat / 8 - 1) % calls.length]; caption(c, beatMs * 6); robot.trick(pick(['dance', 'spin', 'headspin', 'dance'])); }
      if (beat % 16 === 0) robot.cheer(beatMs * 6);
      if (beat >= beats) clearInterval(tt);
    }, beatMs);
    cleanup.push(() => clearInterval(tt));
  });
  const total = 2400 + beats * beatMs + 1500;
  at(total - 1400, () => { home(); face('feliz'); caption('¡Qué fiesta tan buena!', 2000); robot.hearts(8); });
  return total;
}

/* Magia: crece un árbol */
function magicShow(at) {
  voice('¡Atención! ¡Les voy a mostrar un truco de magia!'); caption('¡Truco de magia!', 2800); move(16, 2, 1.1, 1200);
  const tree = layer('magictree', `<svg viewBox="0 0 300 320" aria-hidden="true"><ellipse cx="150" cy="306" rx="80" ry="10" fill="rgba(0,0,0,.3)"/>
    <g class="mt-trunk"><path d="M138 306C140 240 136 200 128 170h44c-8 30-12 70-10 136z" fill="#7a5230"/><path d="M150 210l-34-30M152 230l30-26" stroke="#7a5230" stroke-width="10" stroke-linecap="round"/></g>
    <g class="mt-crown"><circle cx="150" cy="120" r="70" fill="#3f9a5a"/><circle cx="95" cy="150" r="46" fill="#4fae66"/><circle cx="205" cy="150" r="46" fill="#4fae66"/><circle cx="150" cy="70" r="44" fill="#5fbf5a"/></g>
    <g class="mt-flowers">${[[110, 110, '#ff7aa8'], [190, 100, '#f2b632'], [150, 60, '#ffffff'], [90, 160, '#ff9bbd'], [210, 160, '#ff7aa8'], [160, 140, '#f2b632']].map(([x, y, c]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 7}" cy="${Math.sin(a * Math.PI / 180) * 7}" r="6" fill="${c}"/>`).join('')}<circle r="4" fill="#f2b632"/></g>`).join('')}</g>
    <g class="mt-seed"><ellipse cx="150" cy="300" rx="10" ry="7" fill="#a8723d"/></g></svg>`);
  cleanup.push(() => tree.remove());
  at(2600, () => { robot.cheer(2400); face('guino'); voice('¡Abracadabra, semillita mágica!'); caption('¡Abracadabra!', 2400); const r = tree.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.bottom - 20, 60, ['#f2b632', '#ffffff', '#ff9bbd', '#33d1b3']); E.sfx.zap(); tree.classList.add('seed'); });
  at(4800, () => { tree.classList.add('grow'); E.tone([392, 494, 587, 784, 988, 1175], 'triangle', .18, .16, .12); });
  at(7200, () => { tree.classList.add('bloom'); E.sfx.win(); const r = tree.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height * .3, 90); robot.hearts(8); face('amor'); });
  at(8200, () => { voice('¡Si cuidamos la naturaleza, pasan cosas mágicas!'); caption('¡Si cuidamos la naturaleza, pasan cosas mágicas!', 4500); });
  at(13500, () => { tree.classList.add('fade'); home(); face('feliz'); });
  return 15000;
}

/* Pausa de energía (ejercicio) */
function exerciseShow(at) {
  voice('¡Pausa de energía! ¡Todos de pie y muévanse conmigo!'); caption('¡Pausa de energía! ¡De pie!', 3200); move(14, 0, 1.15, 1000);
  const count = layer('count', ''); cleanup.push(() => count.remove());
  const showN = n => { count.textContent = n; count.classList.remove('go'); void count.offsetWidth; count.classList.add('go'); E.tone([660 + n * 60], 'sine', .08, 0, .1); };
  const steps = [
    [3500, '¡Brazos arriba!', () => robot.cheer(4000), 'cheer'],
    [8500, '¡Saltamos!', () => { }, 'jump'],
    [13500, '¡Tocamos la punta de los pies!', () => { }, 'squat'],
    [18500, '¡Damos una vuelta!', () => robot.trick('spin'), 'spin'],
    [23000, '¡Un aplauso para todos!', () => { robot.cheer(3000); robot.hearts(8); }, 'clap']
  ];
  steps.forEach(([t, txt, fn, kind]) => {
    at(t, () => { voice(txt); caption(txt, 3500); fn(); robot.svg.classList.remove('do-jump', 'do-squat'); if (kind === 'jump' || kind === 'squat') robot.svg.classList.add('do-' + kind); });
    if (kind !== 'clap' && kind !== 'spin') for (let n = 1; n <= 4; n++) at(t + 700 + n * 900, () => showN(n));
    if (kind === 'clap') for (let n = 0; n < 6; n++) at(t + 600 + n * 260, () => { if (!E.soundOn) return; const c = ctx(); drum(c, c.destination, c.currentTime, 'clap'); });
  });
  at(22800, () => robot.svg.classList.remove('do-jump', 'do-squat'));
  at(26500, () => { home(); face('feliz'); });
  cleanup.push(() => robot.svg.classList.remove('do-jump', 'do-squat'));
  return 28000;
}

/* Adivinanzas y datos curiosos (sin repetir) */
const RIDDLES = [
  ['Vuelo sin alas, lloro sin ojos y paseo por el cielo. ¿Qué soy?', 'La nube'],
  ['Tengo hojas y no soy libro, tengo raíces y no soy diente. ¿Qué soy?', 'Un árbol'],
  ['Salgo de la llave, lleno tu vaso y si me desperdicias el planeta se pone triste. ¿Quién soy?', 'El agua'],
  ['De día brillo en el cielo y te regalo luz y energía. ¿Quién soy?', 'El sol'],
  ['Soy invisible, me respiras todo el día y las plantas me limpian. ¿Quién soy?', 'El aire'],
  ['Si me apagas al salir del salón, ayudas al planeta. ¿Qué soy?', 'La luz'],
  ['Vivo bajo la tierra, hago túneles y ayudo a que las plantas crezcan. ¿Quién soy?', 'La lombriz'],
  ['Me echas en la caneca blanca y vuelvo convertido en algo nuevo. ¿Qué soy?', 'Una botella de plástico']
];
const FACTS = [
  'Una botella de plástico puede tardar cientos de años en desaparecer de la naturaleza.',
  'Las plantas producen el oxígeno que respiramos todos los días.',
  'Con papel reciclado se pueden hacer cuadernos nuevos.',
  'Colombia es uno de los países con más plantas y animales diferentes del mundo.',
  'Si cierras la llave mientras te cepillas, ahorras muchos litros de agua cada día.',
  'El sol nos regala energía todos los días y no se acaba.',
  'Las lombrices convierten la cáscara de las frutas en abono para las plantas.',
  'En Colombia la caneca blanca es para lo que se puede reciclar, la verde para lo orgánico y la negra para lo que no se aprovecha.'
];
const bag = {};
function nextOf(key, list) { if (!bag[key] || !bag[key].length) bag[key] = list.map((_, i) => i).sort(() => Math.random() - .5); return list[bag[key].pop()]; }
function riddleShow(at) {
  const [q, a] = nextOf('riddle', RIDDLES);
  move(10, -2, 1.05, 900);
  const card = layer('qcard', `<small>Adivinanza</small><p class="q">${E.esc(q)}</p><div class="timer"><b id="qt">10</b></div><p class="a" id="qa"></p>`);
  cleanup.push(() => card.remove());
  voice('¡Adivinanza! ' + q);
  at(5200, () => { let n = 10; const tt = setInterval(() => { n--; const el = $('#qt'); if (el) el.textContent = n; E.tone([500 + (10 - n) * 40], 'sine', .05, 0, .08); if (n % 3 === 0) robot.trick('headturn'); if (n <= 0) clearInterval(tt); }, 1000); cleanup.push(() => clearInterval(tt)); caption('¡Piensen! ¡Díganlo en voz alta!', 3000); });
  at(15500, () => { card.classList.add('reveal'); $('#qa').textContent = a; voice('¡Es ' + a.toLowerCase() + '! ¡Muy bien!'); E.sfx.win(); robot.cheer(2400); robot.hearts(6); face('feliz'); const r = card.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.bottom - 40, 80); });
  at(20500, () => home());
  return 21500;
}
function factShow(at) {
  const f = nextOf('fact', FACTS);
  move(10, 0, 1.05, 900);
  const card = layer('qcard fact', `<small>¿Sabías que…?</small><p class="q">${E.esc(f)}</p>`);
  cleanup.push(() => card.remove());
  voice('¿Sabías que… ' + f); face('sorprendido');
  at(2500, () => robot.trick('headturn'));
  at(Math.max(9000, f.length * 85), () => { face('feliz'); robot.wave(1600); });
  const total = Math.max(11500, f.length * 85 + 2500);
  at(total - 1200, () => home());
  return total;
}

/* ---------- Registro en el motor de acrobacias ---------- */
const SHOWS = {
  song_reciclaje: songShow('song_reciclaje'), song_gotita: songShow('song_gotita'), song_ecobot: songShow('song_ecobot'), song_energia: songShow('song_energia'),
  disco: discoShow, magic: magicShow, exercise: exerciseShow, riddle: riddleShow, fact: factShow
};
const ESTIMATE = { song_reciclaje: 33000, song_gotita: 37000, song_ecobot: 32000, song_energia: 35000, disco: 35000, magic: 15000, exercise: 28000, riddle: 21500, fact: 15000 };
Object.keys(SHOWS).forEach(k => {
  STUNTS[k] = at => { cleanup = [() => document.body.classList.remove('showtime')]; if (k.startsWith('song')) document.body.classList.add('showtime'); SHOWS[k](at); };
  STUNT_MS[k] = ESTIMATE[k];
  STUNT_END[k] = () => { cleanup.forEach(fn => { try { fn(); } catch (e) { } }); cleanup = []; robot.svg.classList.remove('singing'); host.style.transition = 'none'; host.style.transform = ''; };
});
/* La duración real de las canciones depende del tempo: se calcula aquí para que el motor espere lo justo. */
['song_reciclaje', 'song_gotita', 'song_energia'].forEach(k => { const s = SONGS[k](); STUNT_MS[k] = 2600 + (4 + s.lines.length * 8 + 4) * 60000 / s.bpm; });
STUNT_MS.song_ecobot = 2600 + (4 + 6 * 8 + 4) * 60000 / 122;
STUNT_MS.disco = 2400 + 64 * 60000 / 124 + 1500;
window.ECOBOT_SHOWS = Object.keys(SHOWS);
})();
