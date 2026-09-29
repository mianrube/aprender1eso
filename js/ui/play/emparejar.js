// Empareja: dos columnas, se tocan en cualquier orden.
import { h } from '../dom.js';
import { flagSrc } from '../assets.js';
import { COUNTRIES } from '../../data/europa.js';

const BY = Object.fromEntries(COUNTRIES.map(c => [c.id, c]));

export function createMatchBody({ act }) {
  const left = h('div', { class: 'match__col' });
  const right = h('div', { class: 'match__col' });
  const el = h('div', { class: 'match' },
    h('div', { class: 'q__text', style: { gap: '4px' } },
      h('span', { class: 'match__title' }, 'Une cada país con su capital'),
      h('span', { class: 'match__sub' }, 'Toca un país y después su capital.')),
    h('div', { class: 'match__cols' }, left, right),
  );

  const state = (m, id, side) => {
    const sel = side === 'L' ? m.selL === id : m.selR === id;
    const wrong = m.wrong && (side === 'L' ? m.wrong.l === id : m.wrong.r === id);
    if (m.done[id]) return 'is-done';
    if (wrong) return 'is-wrong';
    if (sel) return 'is-sel';
    return '';
  };

  return {
    el,
    update(session) {
      const m = session.match;
      left.replaceChildren(...m.left.map(id => h('button', {
        class: `pair ${state(m, id, 'L')}`, type: 'button', onclick: () => act.tap('L', id),
      }, h('img', { class: 'pair__flag', src: flagSrc(id), alt: '' }), h('span', {}, BY[id].name))));
      right.replaceChildren(...m.right.map(id => h('button', {
        class: `pair ${state(m, id, 'R')}`, type: 'button', onclick: () => act.tap('R', id),
      }, BY[id].capital)));
    },
  };
}
