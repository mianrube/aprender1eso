import { COUNTRIES } from '../data/europa.js';
import { shuffle } from './rng.js';
import { norm } from './normalize.js';

export const CAPITAL_MODE_RATE = 0.6; // Test: 60 % «capital de…», 40 % «¿de qué país es capital…?»
export const MAP_COUNTRY_RATE = 0.7;  // Mapa: 70 % «Toca el país», 30 % «Toca el país cuya capital es»

// ¿El nombre de la capital contiene el del país? (Luxemburgo, Mónaco, San Marino, Andorra, El Vaticano)
// Se ignora el artículo inicial y se usan como mucho las 5 primeras letras.
export function capitalHasCountryName(c) {
  const name = norm(c.name.replace(/^(el|la|los|las)\s+/i, ''));
  const key = name.length > 5 ? name.slice(0, 5) : name;
  return norm(c.capital).includes(key);
}

function options(c, all, label, rng) {
  const distractors = shuffle(all.filter(x => x.id !== c.id), rng).slice(0, 3);
  return shuffle([c, ...distractors], rng).map(x => ({ id: x.id, label: label(x) }));
}

export function makeQuestion(type, c, all = COUNTRIES, rng = Math.random) {
  switch (type) {
    case 'test': {
      const asCapital = capitalHasCountryName(c) || rng() < CAPITAL_MODE_RATE;
      return asCapital
        ? { c, mode: 'cap', kicker: '¿Cuál es la capital de…', main: c.name, opts: options(c, all, x => x.capital, rng) }
        : { c, mode: 'pais', kicker: '¿De qué país es capital…', main: c.capital, opts: options(c, all, x => x.name, rng) };
    }
    case 'banderas':
      return { c, kicker: '¿De qué país es esta bandera?', main: '', flag: c.id, opts: options(c, all, x => x.name, rng) };
    case 'escribir':
      return { c, kicker: 'Escribe la capital de…', main: c.name, flag: c.id };
    case 'mapa':
      return rng() < MAP_COUNTRY_RATE
        ? { c, mode: 'pais', kicker: 'Toca en el mapa…', main: c.name }
        : { c, mode: 'cap', kicker: 'Toca el país cuya capital es…', main: c.capital };
    default: // tarjetas
      return { c, main: c.name, flag: c.id, back: c.capital };
  }
}
