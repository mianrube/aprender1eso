import { h } from './dom.js';
import { href } from '../router.js';
import { MODULE } from '../data/europa.js';
import { BADGES } from '../data/badges.js';
import { totalPct } from '../engine/levels.js';
import { createEuropeMap, fillsFromMastery, namesFull } from './europe-map.js';
import { ui } from '../app.js';

export function renderHome({ save, onCleanup }, { onReset }) {
  const pct = totalPct(save.m);
  const started = Object.values(save.m).some(v => v > 0);
  const map = createEuropeMap();
  onCleanup(() => map.destroy());
  map.update({ fills: fillsFromMastery(save.m), names: namesFull(), showNames: false, interactive: false });
  const won = BADGES.filter(b => save.badges.includes(b.id)).length;

  const confirmReset = () => {
    if (window.confirm('¿Seguro que quieres borrar todo tu progreso? No se puede deshacer.')) {
      onReset();
      ui.set({ level: 1, session: null });
    }
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
          h('div', { class: 'hero__text' },
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
              started ? 'Continuar' : '¡Empezar!'),
          ),
          h('div', { class: 'hero__map' }, h('div', { class: 'hero__map-box' }, map.el)),
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
