import { h } from './dom.js';
import { href } from '../router.js';
import { store, ui } from '../app.js';
import { MODULE, COUNTRIES } from '../data/europa.js';
import { TYPES } from '../data/challenges.js';
import { levelPct, totalPct, isUnlocked, LEVEL_ALL } from '../engine/levels.js';
import { UNLOCK_THRESHOLD, SHOW_CAPITALS, SHOW_CAPITAL_FROM } from '../config.js';
import { createEuropeMap, fillsFromMastery, namesFull } from './europe-map.js';
import { flagSrc } from './assets.js';
import { startSession } from './flow.js';

// Opción «Todos»: nivel 0, siempre desbloqueado.
const ALL_LEVEL = { n: LEVEL_ALL, name: 'Todos los países', color: 'green' };

const LEGEND = [
  ['Sin empezar', '#FFFFFF'], ['Aprendiendo', '#FFD466'], ['Casi', '#7ED49A'], ['Dominado', '#22B573'],
];

function segColor(m, i) {
  if (i >= m) return 'var(--track)';
  return m >= 5 ? '#22B573' : m >= 3 ? '#7ED49A' : '#FFD466';
}

function levelCard(l, save, selected) {
  const pct = levelPct(l.n, save.m);
  const open = isUnlocked(l.n, save.m);
  const isAll = l.n === LEVEL_ALL;
  const countries = isAll ? 'Los 51 países mezclados. Siempre disponible para repasar.' : COUNTRIES.filter(c => c.level === l.n).map(c => c.name).join(', ');
  return h('button', {
    class: `level${selected ? ' is-selected' : ''}${open ? '' : ' is-locked'}`,
    type: 'button',
    disabled: !open,
    'aria-pressed': String(selected),
    style: { '--c': `var(--${l.color})`, '--d': `var(--${l.color}-dark)` },
    onclick: () => { if (open) ui.set({ level: l.n }); },
  },
    h('span', { class: 'level__num' }, isAll ? '51' : l.n),
    h('span', { class: 'level__body' },
      h('span', { class: 'level__head' },
        h('span', { class: 'level__name' }, l.name),
        h('span', { class: 'level__status' }, open ? `${pct}%` : 'Bloqueado')),
      h('span', { class: 'level__desc' },
        open ? countries : `Consigue un ${Math.round(UNLOCK_THRESHOLD * 100)}% en el nivel ${l.n - 1} para desbloquearlo.`),
      h('span', { class: 'level__bar' }, h('span', { class: 'level__fill', style: { width: `${open ? pct : 0}%` } })),
    ),
  );
}

function typeCard(t, level) {
  return h('button', {
    class: 'challenge', type: 'button',
    style: { '--c': `var(--${t.color})`, '--d': `var(--${t.color}-dark)`, '--ink-i': t.ink },
    onclick: () => startSession({ type: t.id, level }),
  },
    h('span', { class: 'challenge__top' },
      h('span', { class: 'challenge__icon', 'aria-hidden': 'true' }, t.glyph),
      h('span', { class: 'challenge__tag' }, t.tag)),
    h('span', { class: 'challenge__name' }, t.name),
    h('span', { class: 'challenge__desc' }, t.desc),
  );
}

function countryRow(c, m) {
  const show = SHOW_CAPITALS || m >= SHOW_CAPITAL_FROM;
  return h('div', { class: 'row' },
    h('img', { class: 'row__flag', src: flagSrc(c.id), alt: '', loading: 'lazy' }),
    h('div', { class: 'row__body' },
      h('div', { class: 'row__names' }, h('span', { class: 'row__name' }, c.name), h('span', { class: 'row__cap' }, show ? c.capital : '???')),
      h('div', { class: 'row__segs' }, [0, 1, 2, 3, 4].map(i => h('span', { class: 'row__seg', style: { background: segColor(m, i) } }))),
    ),
  );
}

export function renderModule({ save, onCleanup }) {
  const { level } = ui.get();
  const total = totalPct(save.m);

  const map = createEuropeMap();
  onCleanup(() => map.destroy());
  map.update({ fills: fillsFromMastery(save.m), names: namesFull(), showNames: true, interactive: false });

  return h('main', { class: 'page page--module' },
    h('div', { class: 'module-head' },
      h('a', { class: 'btn-link', href: href('/'), style: { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' } }, '← Volver al portal'),
      h('div', { class: 'module-head__row' },
        h('div', { class: 'module-head__title' },
          h('span', { class: 'tag tag--yellow' }, MODULE.subject),
          h('h1', { class: 'h1 h1--module' }, MODULE.title)),
        h('div', { class: 'total' },
          h('div', { class: 'total__row' }, h('span', {}, 'Dominio total'), h('span', {}, `${total}%`)),
          h('div', { class: 'bar' }, h('div', { class: 'bar__fill', style: { width: `${total}%` } }))),
      ),
    ),

    h('div', { class: 'module-cols' },
      h('div', { class: 'map-card' },
        h('div', { class: 'map-card__map' }, map.el),
        h('div', { class: 'map-legend' }, LEGEND.map(([label, color]) =>
          h('span', { class: 'map-legend__item' }, h('span', { class: 'map-legend__sw', style: { background: color } }), label))),
      ),
      h('div', { class: 'levels' },
        h('h2', { class: 'h2 h2--sm' }, '1. Elige nivel'),
        MODULE.levels.map(l => levelCard(l, save, l.n === level)),
        levelCard(ALL_LEVEL, save, level === LEVEL_ALL),
      ),
    ),

    h('section', { class: 'section' },
      h('h2', { class: 'h2 h2--sm' }, `2. Elige un reto · ${level === LEVEL_ALL ? 'Todos los países' : `Nivel ${level}`}`),
      h('div', { class: 'challenges' }, TYPES.map(t => typeCard(t, level))),
    ),

    h('section', { class: 'section' },
      h('h2', { class: 'h2 h2--sm' }, 'Tu dominio país a país'),
      h('div', { class: 'rows' }, COUNTRIES.map(c => countryRow(c, save.m[c.id] || 0))),
    ),
  );
}
