// Escribe: teclear la capital. El input no se reconstruye al teclear.
import { h } from '../dom.js';
import { flagSrc } from '../assets.js';

export function createWriteBody({ act }) {
  const flag = h('img', { class: 'write-head__flag', alt: '' });
  const kicker = h('span', { class: 'kicker' });
  const main = h('span', { class: 'keyword' });
  const input = h('input', {
    class: 'write-input', type: 'text', placeholder: 'Escribe aquí la capital',
    autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', 'aria-label': 'Capital',
  });
  const submit = h('button', { class: 'btn write-submit', type: 'button', onclick: () => act.written(input.value) }, 'Comprobar');
  const el = h('div', { class: 'q' },
    h('div', { class: 'write-head' }, flag, h('div', { class: 'q__text' }, kicker, main)),
    input, submit,
    h('span', { class: 'write-help' }, 'No hace falta poner tildes. Pulsa Intro para comprobar.'),
  );
  let lastI = -1;

  return {
    el,
    submit: () => act.written(input.value),
    update(session) {
      const q = session.items[session.i];
      if (session.i !== lastI) {
        lastI = session.i;
        flag.src = flagSrc(q.flag);
        kicker.textContent = q.kicker;
        main.textContent = q.main;
        input.value = '';
      }
      input.disabled = session.answered;
      input.classList.toggle('is-ok', session.answered && session.ok);
      input.classList.toggle('is-bad', session.answered && !session.ok);
      submit.hidden = session.answered;
      // En la primera pregunta el nodo aún no está en la página: se enfoca al terminar el render.
      if (!session.answered) queueMicrotask(() => input.focus());
    },
  };
}
