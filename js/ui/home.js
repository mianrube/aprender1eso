import { h } from './dom.js';
import { href } from '../router.js';
import { MODULE } from '../data/europa.js';
import { BADGES } from '../data/badges.js';
import { averageMastery } from '../lib/mastery.js';

const ids = MODULE.items.map(c => c.id);

export function renderHome(save, { onReset }) {
  const mastery = averageMastery(ids, save.m);
  const pct = Math.round(mastery * 100);
  const won = BADGES.filter(b => save.badges.includes(b.id)).length;

  const confirmReset = () => {
    if (window.confirm('¿Seguro que quieres borrar todo tu progreso? No se puede deshacer.')) onReset();
  };

  return h('main', { class: 'page' },
    h('section', { class: 'section', style: { maxWidth: '640px', gap: '10px' } },
      h('h1', { class: 'h1' }, '¡Hola! ¿Qué aprendemos hoy?'),
      h('p', { class: 'lead' }, 'Elige una misión. Cada reto que superes suma puntos, y si practicas un poco cada día tu racha crece.'),
    ),

    h('section', { class: 'section' },
      h('h2', { class: 'h2' }, 'Misiones'),
      h('div', { class: 'missions' },
        h('div', { class: 'hero' },
          h('div', { class: 'hero__top' },
            h('div', { class: 'hero__tags' },
              h('span', { class: 'tag tag--yellow' }, MODULE.subject),
              h('span', { class: 'tag tag--glass' }, `${MODULE.items.length} países · ${MODULE.levels.length} niveles · 6 retos`),
            ),
            h('h3', { class: 'hero__title' }, MODULE.title),
          ),
          h('div', { class: 'hero__progress' },
            h('div', { class: 'hero__progress-row' }, h('span', {}, 'Tu dominio'), h('span', {}, `${pct}%`)),
            h('div', { class: 'bar bar--on-blue', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct },
              h('div', { class: 'bar__fill', style: { width: `${pct}%` } })),
          ),
          h('a', { class: 'btn btn--yellow', href: href('/europa'), style: { textDecoration: 'none', alignSelf: 'flex-start' } },
            mastery > 0 ? 'Continuar' : '¡Empezar!'),
        ),
        h('div', { class: 'soon' },
          h('span', { class: 'soon__title' }, 'Más misiones en camino'),
          h('span', { class: 'soon__text' }, 'Pronto podrás practicar otras materias desde aquí.'),
        ),
      ),
    ),

    h('section', { class: 'section' },
      h('div', { class: 'section__head' },
        h('h2', { class: 'h2' }, 'Tus insignias'),
        h('span', { class: 'section__count' }, `${won} de ${BADGES.length}`),
      ),
      h('div', { class: 'badges' },
        BADGES.map(b => {
          const on = save.badges.includes(b.id);
          return h('div', { class: `badge${on ? '' : ' badge--off'}` },
            h('div', { class: 'badge__icon', style: { background: b.color, color: b.ink, boxShadow: `0 4px 0 ${b.dark}` } }, b.glyph),
            h('span', { class: 'badge__name' }, b.name),
            h('span', { class: 'badge__desc' }, b.desc),
          );
        }),
      ),
    ),

    h('div', { class: 'reset' },
      h('button', { class: 'btn-link', type: 'button', onclick: confirmReset }, 'Borrar mi progreso'),
    ),
  );
}
