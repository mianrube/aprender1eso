// Tarjetas: girar y autoevaluarse.
import { h } from '../dom.js';
import { flagSrc } from '../assets.js';

export function createCardsBody({ act }) {
  const flag = h('img', { class: 'flip__flag', alt: '' });
  const country = h('span', { class: 'flip__country' });
  const of = h('span', { class: 'flip__of' });
  const cap = h('span', { class: 'flip__cap' });
  const flip = h('button', { class: 'flip', type: 'button', 'aria-label': 'Girar la tarjeta', onclick: () => flip.classList.toggle('is-flipped') && refreshBtns() },
    h('span', { class: 'flip__inner' },
      h('span', { class: 'flip__face flip__front' }, flag, country, h('span', { class: 'flip__hint' }, '¿Cuál es su capital? Toca para girar')),
      h('span', { class: 'flip__face flip__back' }, of, cap)));
  const no = h('button', { class: 'btn btn--ghost-red', type: 'button', onclick: () => act.card(false) }, 'Aún no me la sé');
  const yes = h('button', { class: 'btn btn--green', type: 'button', onclick: () => act.card(true) }, '¡Me la sabía!');
  const btns = h('div', { class: 'card-btns' }, no, yes);
  btns.hidden = true;
  const el = h('div', { class: 'cards' }, flip, btns);
  let lastI = -1;
  let answered = false;

  function refreshBtns() {
    btns.hidden = !(flip.classList.contains('is-flipped') && !answered);
  }

  return {
    el,
    update(session) {
      const q = session.items[session.i];
      answered = session.answered;
      if (session.i !== lastI) {
        lastI = session.i;
        // Volver a la cara frontal sin animación, para no enseñar la capital siguiente al girar.
        flip.classList.add('no-anim');
        flip.classList.remove('is-flipped');
        void flip.offsetWidth;
        flip.classList.remove('no-anim');
        flag.src = flagSrc(q.flag);
        country.textContent = q.main;
        of.textContent = `Capital de ${q.main}`;
        cap.textContent = q.back;
      }
      refreshBtns();
    },
  };
}
