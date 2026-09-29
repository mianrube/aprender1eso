// Pantalla de reto: barra superior, cuerpo (según el tipo) y panel de feedback.
import { h } from './dom.js';
import { store, ui, navigate } from '../app.js';
import { TYPE_BY_ID } from '../data/challenges.js';
import {
  answerOption, answerWritten, answerMap, cardAnswer, advance, matchTap, clearWrong, finish, progress,
} from '../engine/session.js';
import { leaveSession } from './flow.js';
import { createOptionsBody } from './play/options.js';
import { createWriteBody } from './play/escribir.js';
import { createMapBody } from './play/mapa.js';
import { createCardsBody } from './play/tarjetas.js';
import { createMatchBody } from './play/emparejar.js';

const BODIES = {
  test: createOptionsBody,
  banderas: createOptionsBody,
  escribir: createWriteBody,
  mapa: createMapBody,
  tarjetas: createCardsBody,
  emparejar: createMatchBody,
};

export const MATCH_ERROR_MS = 650;
export const MATCH_DONE_MS = 600;

export function levelLabel(session) {
  if (session.ids) return 'Repaso de fallos';
  return session.level === 0 ? 'Todos los países' : `Nivel ${session.level}`;
}

export function renderPlay({ onCleanup }) {
  let session = ui.get().session;
  const type = TYPE_BY_ID[session.type];
  const timers = new Set();
  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
    timers.add(t);
  };
  onCleanup(() => timers.forEach(clearTimeout));

  // ---- Acciones (llaman al motor y guardan) ----
  function commit(res) {
    if (res.save !== store.get()) store.set({ m: res.save.m, points: res.save.points });
    session = res.session;
    ui.set({ session });
    sync();
  }

  function finishAndGo() {
    const res = finish(session, store.get());
    const s = res.save;
    store.set({ streak: s.streak, lastDay: s.lastDay, types: s.types, badges: s.badges });
    ui.set({ session: res.session });
    navigate('/europa/resultados');
  }

  function next() {
    if (!session.answered) return;
    const r = advance(session);
    if (r.done) return finishAndGo();
    session = r.session;
    ui.set({ session });
    sync();
    window.scrollTo(0, 0);
  }

  const act = {
    option: opt => commit(answerOption(session, store.get(), opt)),
    written: text => commit(answerWritten(session, store.get(), text)),
    map: iso => commit(answerMap(session, store.get(), iso)),
    card: ok => {
      commit(cardAnswer(session, store.get(), ok));
      next();
    },
    tap: (side, id) => {
      const r = matchTap(session, store.get(), side, id);
      if (r.event === 'ignored') return;
      commit(r);
      if (r.event === 'wrong') later(() => { session = clearWrong(session); ui.set({ session }); sync(); }, MATCH_ERROR_MS);
      if (r.complete) later(finishAndGo, MATCH_DONE_MS);
    },
  };

  const body = BODIES[session.type]({ act, onCleanup });

  // ---- Vista ----
  const fill = h('div', { class: 'play-prog__fill' });
  const combo = h('span', { class: 'chip-combo' });
  const earned = h('span', { class: 'chip-earned' });
  const top = h('div', { class: 'play-top' },
    h('div', { class: 'play-top__in' },
      h('button', { class: 'play-x', type: 'button', 'aria-label': 'Salir del reto', onclick: leaveSession }, '✕'),
      h('div', { class: 'play-prog', role: 'progressbar' }, fill), combo, earned));

  const fbTitle = h('span', { class: 'fb__title' });
  const fbDetail = h('span', { class: 'fb__detail' });
  const fb = h('div', { class: 'fb', role: 'status' },
    h('div', { class: 'fb__in' },
      h('div', { class: 'fb__text' }, fbTitle, fbDetail),
      h('button', { class: 'btn', type: 'button', onclick: next }, 'Siguiente')));
  fb.hidden = true;

  const main = h('main', { class: 'play-main' },
    h('div', { class: 'play-chips' },
      h('span', { class: 'pill', style: { background: `var(--${type.color})`, color: type.ink } }, type.name),
      h('span', { class: 'pill pill--level' }, levelLabel(session))),
    body.el);

  function sync() {
    const p = progress(session);
    fill.style.width = `${Math.round(p.ratio * 100)}%`;
    combo.textContent = `racha x${session.combo}`;
    combo.hidden = session.combo < 2;
    earned.textContent = `+${session.earned}`;
    body.update(session);
    const showFb = !!session.fb && session.answered;
    fb.hidden = !showFb;
    if (showFb) {
      fb.classList.toggle('fb--bad', !session.fb.ok);
      fbTitle.textContent = session.fb.title;
      fbDetail.textContent = session.fb.detail || '';
      // Quita el foco del botón pulsado para que Intro avance sin duplicar el clic.
      if (document.activeElement && document.activeElement !== document.body && document.activeElement.tagName === 'BUTTON'
        && !fb.contains(document.activeElement)) document.activeElement.blur();
    }
  }

  // ---- Intro: comprobar (Escribe) y pasar a la siguiente ----
  function onKey(e) {
    if (e.key !== 'Enter') return;
    const tag = e.target && e.target.tagName;
    if (tag === 'BUTTON' || tag === 'A') return; // la pulsación nativa ya hace clic
    if (session.type === 'escribir' && !session.answered) { e.preventDefault(); body.submit(); return; }
    if (session.answered && session.type !== 'tarjetas' && session.type !== 'emparejar') { e.preventDefault(); next(); }
  }
  window.addEventListener('keydown', onKey);
  onCleanup(() => window.removeEventListener('keydown', onKey));

  const root = h('div', { class: 'play' }, top, main, fb);
  sync();
  return root;
}
