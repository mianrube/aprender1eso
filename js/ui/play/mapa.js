// Mapa: tocar el país en el mapa. El mapa se crea una vez por sesión.
import { h } from '../dom.js';
import { createEuropeMap, blankFills, namesCountry } from '../europe-map.js';

export function createMapBody({ act, onCleanup }) {
  const kicker = h('span', { class: 'kicker' });
  const main = h('span', { class: 'keyword' });
  const map = createEuropeMap({ onCountryClick: iso => act.map(iso) });
  onCleanup(() => map.destroy());
  const el = h('div', { class: 'q', style: { gap: '18px' } },
    h('div', { class: 'q__text', style: { gap: '4px' } }, kicker, main),
    h('div', { class: 'play-map' }, map.el),
  );
  let lastI = -1;
  const fills = blankFills();
  const names = namesCountry();

  return {
    el,
    update(session) {
      const q = session.items[session.i];
      if (session.i !== lastI) {
        lastI = session.i;
        kicker.textContent = q.kicker;
        main.textContent = q.main;
      }
      map.update({ fills, names, marks: session.marks, interactive: !session.answered, showNames: session.answered });
    },
  };
}
