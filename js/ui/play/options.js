// Test y Banderas: cuatro opciones A–D.
import { h } from '../dom.js';
import { flagSrc } from '../assets.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function createOptionsBody({ act }) {
  const kicker = h('span', { class: 'kicker' });
  const main = h('span', { class: 'keyword' });
  const flag = h('img', { class: 'flag-big', alt: 'Bandera misteriosa' });
  const grid = h('div', { class: 'opts' });
  const el = h('div', { class: 'q' }, h('div', { class: 'q__text' }, kicker, main), flag, grid);
  let lastI = -1;
  let buttons = [];

  function build(session) {
    const q = session.items[session.i];
    kicker.textContent = q.kicker;
    main.textContent = q.main || '';
    main.hidden = !q.main;
    flag.hidden = !q.flag;
    if (q.flag) flag.src = flagSrc(q.flag);
    buttons = q.opts.map((o, i) => h('button', { class: 'opt', type: 'button', onclick: () => act.option(o) },
      h('span', { class: 'opt__badge' }, LETTERS[i]),
      h('span', {}, o.label)));
    grid.replaceChildren(...buttons);
  }

  return {
    el,
    update(session) {
      if (session.i !== lastI) { lastI = session.i; build(session); }
      const q = session.items[session.i];
      buttons.forEach((b, i) => {
        const id = q.opts[i].id;
        b.disabled = session.answered;
        b.classList.toggle('is-correct', session.answered && id === q.c.id);
        b.classList.toggle('is-wrong', session.answered && id !== q.c.id && id === session.picked);
        b.classList.toggle('is-dim', session.answered && id !== q.c.id && id !== session.picked);
      });
    },
  };
}
