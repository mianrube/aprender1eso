import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../js/data/europa.js';
import {
  createSession, answer, answerOption, answerWritten, answerMap, cardAnswer, advance,
  matchTap, clearWrong, finish, summary, progress, titleFor, OK_TITLES, BAD_TITLES,
} from '../js/engine/session.js';
import { dayKey } from '../js/lib/streak.js';
import { seeded, emptySave } from './helpers.js';

const rng = () => seeded(11);
const start = (type, level = 1, ids = null, save = emptySave()) =>
  ({ s: createSession({ type, level, ids }, save, rng()), save });

// Responde una pregunta de opciones bien o mal.
function pick(session, save, good) {
  const q = session.items[session.i];
  const opt = good ? q.opts.find(o => o.id === q.c.id) : q.opts.find(o => o.id !== q.c.id);
  return answerOption(session, save, opt, rng());
}

test('una sesión de Test tiene 8 preguntas del nivel', () => {
  const { s } = start('test', 2);
  assert.equal(s.items.length, 8);
  assert.ok(s.items.every(q => q.c.level === 2));
  assert.equal(new Set(s.items.map(q => q.c.id)).size, 8);
});

test('acierto: puntos, dominio y panel verde', () => {
  let { s, save } = start('test');
  const id = s.items[0].c.id;
  ({ session: s, save } = pick(s, save, true));
  assert.equal(save.points, 10);
  assert.equal(save.m[id], 1);
  assert.equal(s.fb.ok, true);
  assert.ok(OK_TITLES.includes(s.fb.title));
  assert.equal(s.fb.detail, '+10 puntos');
});

test('fallo: sin puntos y con explicación', () => {
  let { s, save } = start('banderas');
  const c = s.items[0].c;
  ({ session: s, save } = pick(s, save, false));
  assert.equal(save.points, 0);
  assert.equal(s.fb.ok, false);
  assert.ok(BAD_TITLES.includes(s.fb.title));
  assert.equal(s.fb.detail, `Es la bandera de ${c.name}.`);
});

test('detalles de fallo del Test según el modo', () => {
  let { s, save } = start('test');
  s.items[0] = { ...s.items[0], mode: 'cap' };
  const c = s.items[0].c;
  let r = pick(s, save, false);
  assert.equal(r.session.fb.detail, `La capital de ${c.name} es ${c.capital}.`);
  s.items[0] = { ...s.items[0], mode: 'pais' };
  r = pick(s, save, false);
  assert.equal(r.session.fb.detail, `${c.capital} es la capital de ${c.name}.`);
});

test('bonus por racha: el tercer acierto seguido da 15 y el panel lo dice', () => {
  let { s, save } = start('test');
  const gains = [];
  for (let k = 0; k < 4; k++) {
    const before = save.points;
    ({ session: s, save } = pick(s, save, true));
    gains.push(save.points - before);
    if (k === 2) assert.equal(s.fb.detail, '+15 puntos · ¡llevas 3 seguidas!');
    ({ session: s } = advance(s));
  }
  assert.deepEqual(gains, [10, 10, 15, 15]);
  assert.equal(s.best, 4);
});

test('un fallo reinicia la racha pero conserva la mejor', () => {
  let { s, save } = start('test');
  for (let k = 0; k < 4; k++) {
    ({ session: s, save } = pick(s, save, true));
    ({ session: s } = advance(s));
  }
  ({ session: s, save } = pick(s, save, false));
  assert.equal(s.combo, 0);
  assert.equal(s.best, 4);
});

test('no se puede responder dos veces la misma pregunta', () => {
  let { s, save } = start('test');
  ({ session: s, save } = pick(s, save, true));
  const again = pick(s, save, true);
  assert.equal(again.save.points, 10);
  assert.equal(again.session.results.length, 1);
});

test('advance avanza y detecta la última pregunta', () => {
  let { s, save } = start('test');
  assert.deepEqual(advance(s).session, s); // sin responder no avanza
  for (let k = 0; k < 8; k++) {
    ({ session: s, save } = pick(s, save, true));
    const r = advance(s);
    if (k < 7) { assert.equal(r.done, false); s = r.session; assert.equal(s.i, k + 1); assert.equal(s.answered, false); }
    else assert.equal(r.done, true);
  }
});

test('la barra de progreso sigue las preguntas respondidas', () => {
  let { s, save } = start('test');
  for (let k = 0; k < 4; k++) {
    ({ session: s, save } = pick(s, save, true));
    ({ session: s } = advance(s));
  }
  assert.equal(progress(s).ratio, 0.5);
});

test('Escribe: vacío no se corrige, casi cuenta y fallo explica', () => {
  let { s, save } = start('escribir');
  const c = s.items[0].c;
  assert.equal(answerWritten(s, save, '   ', rng()).session.answered, false);
  const near = answerWritten(s, save, c.capital.slice(0, -1), rng());
  assert.equal(near.session.ok, true);
  assert.equal(near.session.fb.detail, `Se escribe «${c.capital}». ¡Por muy poco!`);
  const bad = answerWritten(s, save, 'xyz', rng());
  assert.equal(bad.session.fb.detail, `La capital de ${c.name} es ${c.capital}. Tú escribiste «xyz».`);
  assert.equal(bad.session.results[0].given, 'xyz');
  const exact = answerWritten(s, save, c.capital, rng());
  assert.equal(exact.session.fb.detail, '+10 puntos');
});

test('Mapa: acierto, fallo con marcas e ignorar países fuera de la lista', () => {
  let { s, save } = start('mapa');
  const c = s.items[0].c;
  assert.equal(answerMap(s, save, 'zz', rng()).session.answered, false);
  const ok = answerMap(s, save, c.id, rng());
  assert.equal(ok.session.ok, true);
  assert.deepEqual(ok.session.marks, { [c.id]: 'ok' });
  const otherId = COUNTRIES.find(x => x.id !== c.id).id;
  const other = COUNTRIES.find(x => x.id === otherId);
  const bad = answerMap(s, save, otherId, rng());
  assert.deepEqual(bad.session.marks, { [c.id]: 'ok', [otherId]: 'bad' });
  assert.equal(bad.session.fb.detail, `Tocaste ${other.name}. ${c.name} es el país en verde.`);
  // tras responder ya no cambia
  assert.equal(answerMap(bad.session, bad.save, c.id, rng()).session, bad.session);
});

test('Tarjetas: 5 puntos, sin panel de feedback y dominio ±1', () => {
  let { s, save } = start('tarjetas');
  const id = s.items[0].c.id;
  ({ session: s, save } = cardAnswer(s, save, true));
  assert.equal(save.points, 5);
  assert.equal(save.m[id], 1);
  assert.equal(s.fb, null);
  ({ session: s } = advance(s));
  const id2 = s.items[s.i].c.id;
  ({ session: s, save } = cardAnswer(s, save, false));
  assert.equal(save.points, 5);
  assert.equal(save.m[id2], 0);
});

// ---------- Empareja ----------
function pairFor(s, id) { return [id, id]; }

test('Empareja: 6 parejas desordenadas de un nivel', () => {
  const { s } = start('emparejar', 3);
  assert.equal(s.items.length, 6);
  assert.deepEqual([...s.match.left].sort(), [...s.match.right].sort());
  assert.ok(s.items.every(c => c.level === 3));
});

test('Empareja: pareja correcta y orden libre', () => {
  let { s, save } = start('emparejar');
  const [a, b] = s.items.map(c => c.id);
  let r = matchTap(s, save, 'L', a);
  assert.equal(r.event, 'select');
  r = matchTap(r.session, r.save, 'R', a);
  assert.equal(r.event, 'ok');
  assert.equal(r.save.points, 10);
  // primero la capital y después el país
  r = matchTap(r.session, r.save, 'R', b);
  r = matchTap(r.session, r.save, 'L', b);
  assert.equal(r.event, 'ok');
  assert.equal(r.save.points, 20);
});

test('Empareja: error, parpadeo y acierto posterior cuenta como fallo', () => {
  let { s, save } = start('emparejar');
  const [a, b] = s.items.map(c => c.id);
  let r = matchTap(s, save, 'L', a);
  r = matchTap(r.session, r.save, 'R', b);
  assert.equal(r.event, 'wrong');
  assert.deepEqual(r.session.match.wrong, { l: a, r: b });
  // mientras parpadea se ignoran los toques
  assert.equal(matchTap(r.session, r.save, 'L', b).event, 'ignored');
  s = clearWrong(r.session);
  assert.equal(s.match.wrong, null);
  assert.equal(s.match.selL, null);
  r = matchTap(s, r.save, 'L', a);
  r = matchTap(r.session, r.save, 'R', a);
  assert.equal(r.event, 'ok');
  assert.equal(r.save.points, 0);
  assert.equal(r.session.results.at(-1).ok, false);
  assert.equal(r.save.m[a] ?? 0, 0);
});

test('Empareja: completar las 6 parejas', () => {
  let { s, save } = start('emparejar');
  let r;
  for (const c of s.items) {
    r = matchTap(s, save, 'L', c.id);
    r = matchTap(r.session, r.save, 'R', c.id);
    s = r.session; save = r.save;
  }
  assert.equal(r.complete, true);
  assert.equal(progress(s).ratio, 1);
  assert.equal(summary(s).correct, 6);
});

test('Empareja: un elemento ya emparejado no responde', () => {
  let { s, save } = start('emparejar');
  const id = s.items[0].id;
  let r = matchTap(s, save, 'L', id);
  r = matchTap(r.session, r.save, 'R', id);
  assert.equal(matchTap(r.session, r.save, 'L', id).event, 'ignored');
});

// ---------- Repaso ----------
test('Repaso con 3 países: una pregunta por país, sin ponderar', () => {
  const ids = ['es', 'fr', 'it'];
  const { s } = start('test', 1, ids);
  assert.equal(s.items.length, 3);
  assert.deepEqual(s.items.map(q => q.c.id).sort(), ['es', 'fr', 'it']);
});

test('Repaso en Empareja con pocos países se completa hasta 4', () => {
  const { s } = start('emparejar', 1, ['es']);
  assert.equal(s.items.length, 4);
  assert.ok(s.items.some(c => c.id === 'es'));
});

// ---------- Abandono y cierre ----------
test('abandonar conserva puntos y dominio y no toca racha, tipos ni insignias', () => {
  let { s, save } = start('test');
  for (let k = 0; k < 3; k++) {
    ({ session: s, save } = pick(s, save, true));
    ({ session: s } = advance(s));
  }
  assert.equal(save.points, 35);
  assert.equal(save.streak, 0);
  assert.equal(save.lastDay, null);
  assert.deepEqual(save.types, []);
  assert.deepEqual(save.badges, []);
});

test('finish: primera sesión da racha 1, tipo y «Primera misión»', () => {
  let { s, save } = start('test');
  ({ session: s, save } = pick(s, save, false));
  const now = new Date(2026, 8, 29);
  const r = finish(s, save, now);
  assert.equal(r.save.streak, 1);
  assert.equal(r.save.lastDay, dayKey(now));
  assert.deepEqual(r.save.types, ['test']);
  assert.deepEqual(r.session.newBadges, ['primera']);
  assert.deepEqual(r.save.badges, ['primera']);
});

test('finish: Pleno e Imparable en una sesión perfecta', () => {
  let { s, save } = start('test');
  for (let k = 0; k < 8; k++) {
    ({ session: s, save } = pick(s, save, true));
    if (k < 7) ({ session: s } = advance(s));
  }
  const r = finish(s, save, new Date(2026, 8, 29));
  for (const id of ['primera', 'pleno', 'imparable']) assert.ok(r.session.newBadges.includes(id), id);
});

test('finish: no repite insignias ni duplica el tipo', () => {
  let { s, save } = start('test');
  save = { ...save, badges: ['primera'], types: ['test'], streak: 3, lastDay: dayKey(new Date(2026, 8, 28)) };
  ({ session: s, save } = pick(s, save, false));
  const r = finish(s, save, new Date(2026, 8, 29));
  assert.deepEqual(r.save.badges, ['primera']);
  assert.deepEqual(r.save.types, ['test']);
  assert.equal(r.save.streak, 4);
});

test('finish: gana Nivel 2 al llegar al 60 % del nivel 1', () => {
  let { s, save } = start('test');
  const level1 = COUNTRIES.filter(c => c.level === 1).map(c => c.id);
  save = { ...save, m: Object.fromEntries(level1.map(id => [id, 4])) };
  ({ session: s, save } = pick(s, save, false));
  const r = finish(s, save, new Date(2026, 8, 29));
  assert.ok(r.session.newBadges.includes('n2'));
});

test('finish: Todoterreno con los 6 tipos', () => {
  let { s, save } = start('escribir');
  save = { ...save, types: ['tarjetas', 'test', 'emparejar', 'banderas', 'mapa'] };
  ({ session: s, save } = answerWritten(s, save, 'xyz', rng()));
  const r = finish(s, save, new Date(2026, 8, 29));
  assert.ok(r.session.newBadges.includes('todoterreno'));
});

test('summary: titulares, datos y fallos sin repetir', () => {
  assert.equal(titleFor(100), '¡Brutal!');
  assert.equal(titleFor(90), '¡Brutal!');
  assert.equal(titleFor(62), '¡Muy bien!');
  assert.equal(titleFor(60), '¡Muy bien!');
  assert.equal(titleFor(37), '¡Sigue así!');
  const s = {
    results: [
      { id: 'es', ok: false, given: 'Lima' }, { id: 'es', ok: false, given: 'Roma' },
      { id: 'fr', ok: true, given: 'París' }, { id: 'it', ok: true, given: 'Roma' },
    ],
    best: 2, earned: 25,
  };
  const r = summary(s);
  assert.deepEqual([r.total, r.correct, r.pct], [4, 2, 50]);
  assert.deepEqual(r.errors, [{ id: 'es', given: 'Lima' }]);
  assert.equal(r.title, '¡Sigue así!');
});

test('answer no muta el progreso ni la sesión originales', () => {
  const { s, save } = start('test');
  const snapshotS = JSON.stringify(s), snapshotSave = JSON.stringify(save);
  pick(s, save, true);
  assert.equal(JSON.stringify(s), snapshotS);
  assert.equal(JSON.stringify(save), snapshotSave);
});

test('sesión «Todos»: mezcla países de distintos niveles', () => {
  const { s } = start('test', 0);
  assert.equal(s.items.length, 8);
  const levels = new Set(s.items.map(q => q.c.level));
  assert.ok(levels.size > 1, 'debería mezclar niveles');
  assert.equal(new Set(s.items.map(q => q.c.id)).size, 8);
});

test('Empareja en «Todos» usa 6 países', () => {
  const { s } = start('emparejar', 0);
  assert.equal(s.items.length, 6);
});
