import { h } from './dom.js';
import { store, ui, navigate } from '../app.js';
import { TYPE_BY_ID } from '../data/challenges.js';
import { BADGES } from '../data/badges.js';
import { COUNTRIES } from '../data/europa.js';
import { summary } from '../engine/session.js';
import { startSession } from './flow.js';
import { levelLabel } from './play.js';
import { flagSrc } from './assets.js';

const BY = Object.fromEntries(COUNTRIES.map(c => [c.id, c]));
const BADGE_BY = Object.fromEntries(BADGES.map(b => [b.id, b]));

export function renderResults() {
  const session = ui.get().session;
  const type = TYPE_BY_ID[session.type];
  const sum = summary(session);
  const failedIds = sum.errors.map(e => e.id);

  return h('main', { class: 'results' },
    h('div', { class: 'results__head' },
      h('span', { class: 'pill', style: { background: `var(--${type.color})`, color: type.ink } }, `${type.name} · ${levelLabel(session)}`),
      h('h1', { class: 'results__title' }, sum.title),
      h('p', { class: 'results__sub' }, `Has acertado ${sum.correct} de ${sum.total}`)),

    h('div', { class: 'stats' },
      h('div', { class: 'stat stat--ok' }, h('span', { class: 'stat__n' }, `${sum.pct}%`), h('span', { class: 'stat__l' }, 'Aciertos')),
      h('div', { class: 'stat stat--pts' }, h('span', { class: 'stat__n' }, `+${sum.earned}`), h('span', { class: 'stat__l' }, 'Puntos')),
      h('div', { class: 'stat stat--streak' }, h('span', { class: 'stat__n' }, sum.best), h('span', { class: 'stat__l' }, 'Mejor racha'))),

    session.newBadges.length > 0 && h('div', { class: 'newbadge' },
      h('span', { class: 'newbadge__title' }, '¡Insignia nueva!'),
      h('div', { class: 'newbadge__list' }, session.newBadges.map(id => h('div', { class: 'newbadge__item' },
        h('span', { class: 'newbadge__icon' }, BADGE_BY[id].glyph),
        h('span', { style: { fontWeight: '800' } }, BADGE_BY[id].name))))),

    sum.errors.length > 0 && h('div', { class: 'review' },
      h('h2', { class: 'h2 h2--sm' }, 'Para repasar'),
      sum.errors.map(e => h('div', { class: 'review__item' },
        h('img', { class: 'review__flag', src: flagSrc(e.id), alt: '' }),
        h('div', { class: 'review__text' },
          h('span', { class: 'review__pair' }, `${BY[e.id].name} → ${BY[e.id].capital}`),
          e.given && h('span', { class: 'review__given' }, `Tu respuesta: ${e.given}`))))),

    h('div', { class: 'results__actions' },
      failedIds.length > 0 && h('button', {
        class: 'btn btn--red', type: 'button',
        onclick: () => startSession({ type: session.type, level: session.level, ids: failedIds }),
      }, 'Repasar fallos'),
      h('button', {
        class: 'btn', type: 'button',
        onclick: () => startSession({ type: session.type, level: session.level, ids: session.ids }),
      }, 'Otra vez'),
      h('button', {
        class: 'btn btn--outline', type: 'button',
        onclick: () => { ui.set({ session: null }); navigate('/europa'); },
      }, 'Elegir otro reto')),
  );
}
