import { h } from './dom.js';
import { href } from '../router.js';
import { MODULE } from '../data/europa.js';

// Pantalla provisional hasta que exista el módulo Europa.
export function renderModuleStub() {
  return h('main', { class: 'page' },
    h('div', { class: 'stub' },
      h('a', { class: 'btn-link', href: href('/'), style: { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' } }, '← Volver al portal'),
      h('span', { class: 'tag tag--yellow' }, MODULE.subject),
      h('h1', { class: 'h1', style: { fontSize: 'clamp(30px, 5vw, 44px)' } }, MODULE.title),
      h('div', { class: 'stub__box' },
        h('span', { class: 'soon__title' }, 'Próximamente'),
        h('span', { class: 'soon__text' }, 'Estamos preparando los niveles y los retos de este módulo.'),
      ),
    ),
  );
}
