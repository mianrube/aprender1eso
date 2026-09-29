import { h } from './dom.js';
import { href } from '../router.js';
import { shownStreak } from '../lib/streak.js';

export function renderHeader(save) {
  const streak = shownStreak(save);
  return h('header', { class: 'header' },
    h('div', { class: 'header__inner' },
      h('a', { class: 'brand', href: href('/'), 'aria-label': 'Rumbo, ir al portal' },
        h('span', { class: 'brand__logo', 'aria-hidden': 'true' }, 'R'),
        h('span', { class: 'brand__name' }, 'Rumbo'),
        h('span', { class: 'brand__tag' }, '1º ESO'),
      ),
      h('div', { class: 'chips' },
        h('div', { class: 'chip chip--streak' },
          h('span', { class: 'chip__dot' }, streak),
          h('span', {}, streak === 1 ? 'día seguido' : 'días seguidos'),
        ),
        h('div', { class: 'chip chip--points' },
          h('span', { class: 'chip__dot', 'aria-hidden': 'true' }),
          h('span', {}, `${save.points} pts`),
        ),
      ),
    ),
  );
}
