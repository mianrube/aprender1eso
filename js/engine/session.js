// Sesión de reto: funciones puras que devuelven { session, save } nuevos.
// La UI guarda `save` con store.set() y vuelve a pintar; aquí no hay DOM ni persistencia.
import { COUNTRIES } from '../data/europa.js';
import { QUESTIONS_PER_ROUND, MATCH_PAIRS } from '../config.js';
import { shuffle, pickOne } from './rng.js';
import { selectCountries } from './select.js';
import { makeQuestion } from './questions.js';
import { applyAnswer, POINTS_ANSWER, POINTS_CARD, COMBO_MIN } from './scoring.js';
import { checkWritten } from './normalize.js';
import { countriesOfLevel } from './levels.js';
import { nextStreak, dayKey } from '../lib/streak.js';
import { newBadges } from '../lib/badges.js';

const BY = Object.fromEntries(COUNTRIES.map(c => [c.id, c]));

export const OK_TITLES = ['¡Correcto!', '¡Eso es!', '¡Bien visto!', '¡Crack!', '¡Perfecto!'];
export const BAD_TITLES = ['¡Casi!', '¡Uy! No era esa', 'A la próxima'];

export function createSession({ type, level, ids = null }, save, rng = Math.random, perRound = QUESTIONS_PER_ROUND) {
  const levelPool = countriesOfLevel(level);
  let pool = ids ? ids.map(id => BY[id]) : levelPool;
  const base = {
    type, level, ids, i: 0, answered: false, ok: null, picked: null, marks: {},
    results: [], combo: 0, best: 0, earned: 0, fb: null, newBadges: [], finished: false,
  };

  if (type === 'emparejar') {
    if (pool.length < 4) {
      const extra = shuffle(levelPool.filter(c => !pool.includes(c)), rng).slice(0, 4 - pool.length);
      pool = pool.concat(extra);
    }
    const items = ids ? pool.slice(0, MATCH_PAIRS) : selectCountries(pool, save.m, MATCH_PAIRS, rng);
    const ids6 = items.map(c => c.id);
    return {
      ...base, items,
      match: { left: shuffle(ids6, rng), right: shuffle(ids6, rng), done: {}, errs: {}, selL: null, selR: null, wrong: null },
    };
  }

  const chosen = ids ? shuffle(pool, rng) : selectCountries(pool, save.m, perRound, rng);
  return { ...base, items: chosen.map(c => makeQuestion(type, c, COUNTRIES, rng)) };
}

// Registra una respuesta: dominio, puntos, racha de sesión y resultado.
function record(session, save, c, ok, given, basePoints) {
  const r = applyAnswer(save, c.id, ok, basePoints, session.combo);
  return {
    save: r.save,
    gained: r.gained,
    session: {
      ...session,
      combo: r.combo,
      best: Math.max(session.best, r.combo),
      earned: session.earned + r.gained,
      results: [...session.results, { id: c.id, ok, given }],
    },
  };
}

// Respuesta con corrección (Test, Banderas, Escribe, Mapa).
export function answer(session, save, { ok, given, detail = null, picked = null, marks = {} }, rng = Math.random) {
  if (session.answered) return { session, save };
  const q = session.items[session.i];
  const r = record(session, save, q.c, ok, given, POINTS_ANSWER);
  const combo = r.session.combo;
  const fb = ok
    ? {
        ok, title: pickOne(OK_TITLES, rng),
        detail: detail || `+${r.gained} puntos${combo >= COMBO_MIN ? ` · ¡llevas ${combo} seguidas!` : ''}`,
      }
    : { ok, title: pickOne(BAD_TITLES, rng), detail };
  return { save: r.save, session: { ...r.session, answered: true, ok, picked, marks, fb } };
}

// Test y Banderas: se elige una de las opciones.
export function answerOption(session, save, opt, rng) {
  const q = session.items[session.i];
  const ok = opt.id === q.c.id;
  let detail = null;
  if (!ok) {
    if (session.type === 'banderas') detail = `Es la bandera de ${q.c.name}.`;
    else if (q.mode === 'cap') detail = `La capital de ${q.c.name} es ${q.c.capital}.`;
    else detail = `${q.c.capital} es la capital de ${q.c.name}.`;
  }
  return answer(session, save, { ok, given: opt.label, detail, picked: opt.id }, rng);
}

// Escribe: un texto vacío no se corrige.
export function answerWritten(session, save, text, rng) {
  const val = (text || '').trim();
  if (!val || session.answered) return { session, save };
  const c = session.items[session.i].c;
  const res = checkWritten(val, c);
  const detail = res === 'near'
    ? `Se escribe «${c.capital}». ¡Por muy poco!`
    : res === 'exact' ? null : `La capital de ${c.name} es ${c.capital}. Tú escribiste «${val}».`;
  return answer(session, save, { ok: res !== 'wrong', given: val, detail }, rng);
}

// Mapa: se toca un país. Los que no están en la lista se ignoran.
export function answerMap(session, save, iso, rng) {
  if (session.answered || !BY[iso]) return { session, save };
  const q = session.items[session.i];
  const ok = iso === q.c.id;
  const marks = { [q.c.id]: 'ok' };
  if (!ok) marks[iso] = 'bad';
  const detail = ok ? null : `Tocaste ${BY[iso].name}. ${q.c.name} es el país en verde.`;
  return answer(session, save, { ok, given: BY[iso].name, detail, marks }, rng);
}

// Tarjetas: autoevaluación, 5 puntos, sin panel de feedback.
export function cardAnswer(session, save, ok) {
  if (session.answered) return { session, save };
  const q = session.items[session.i];
  const r = record(session, save, q.c, ok, null, POINTS_CARD);
  return { save: r.save, session: { ...r.session, answered: true, ok } };
}

// Pasa a la siguiente pregunta; `done` indica que era la última.
export function advance(session) {
  if (!session.answered) return { session, done: false };
  if (session.i + 1 >= session.items.length) return { session, done: true };
  return {
    done: false,
    session: { ...session, i: session.i + 1, answered: false, ok: null, picked: null, marks: {}, fb: null },
  };
}

// Empareja. Devuelve event: 'select' | 'ok' | 'wrong' | 'ignored' y `complete` al acabar las parejas.
export function matchTap(session, save, side, id) {
  const m = session.match;
  if (m.done[id] || m.wrong) return { session, save, event: 'ignored', complete: false };
  let nm = { ...m, [side === 'L' ? 'selL' : 'selR']: id };
  if (nm.selL && nm.selR) {
    if (nm.selL === nm.selR) {
      const r = record(session, save, BY[id], !m.errs[id], null, POINTS_ANSWER);
      nm = { ...nm, done: { ...m.done, [id]: true }, selL: null, selR: null };
      const complete = Object.keys(nm.done).length === session.items.length;
      return { session: { ...r.session, match: nm }, save: r.save, event: 'ok', complete };
    }
    nm = { ...nm, errs: { ...m.errs, [nm.selL]: true }, wrong: { l: nm.selL, r: nm.selR } };
    return { session: { ...session, combo: 0, match: nm }, save, event: 'wrong', complete: false };
  }
  return { session: { ...session, match: nm }, save, event: 'select', complete: false };
}

// Quita el parpadeo rojo y la selección tras un error en Empareja.
export function clearWrong(session) {
  return { ...session, match: { ...session.match, wrong: null, selL: null, selR: null } };
}

export function progress(session) {
  const done = session.match ? Object.keys(session.match.done).length : session.i + (session.answered ? 1 : 0);
  return { done, total: session.items.length, ratio: done / session.items.length };
}

// Cierra la sesión: racha diaria, tipo jugado e insignias nuevas.
export function finish(session, save, now = new Date()) {
  const misses = session.results.filter(r => !r.ok).length;
  const s = { ...save };
  s.streak = nextStreak(s, now);
  s.lastDay = dayKey(now);
  s.types = Array.from(new Set([...(s.types || []), session.type]));
  const won = newBadges(s, { misses, best: session.best });
  s.badges = [...s.badges, ...won];
  return { save: s, session: { ...session, newBadges: won, finished: true } };
}

export function titleFor(pct) {
  return pct >= 90 ? '¡Brutal!' : pct >= 60 ? '¡Muy bien!' : '¡Sigue así!';
}

export function summary(session) {
  const total = session.results.length;
  const correct = session.results.filter(r => r.ok).length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const seen = new Set();
  const errors = [];
  for (const r of session.results) {
    if (!r.ok && !seen.has(r.id)) {
      seen.add(r.id);
      errors.push({ id: r.id, given: r.given });
    }
  }
  return { total, correct, pct, title: titleFor(pct), best: session.best, earned: session.earned, errors };
}
