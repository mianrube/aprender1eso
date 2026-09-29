import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../js/data/europa.js';
import { makeQuestion, capitalHasCountryName } from '../js/engine/questions.js';
import { seeded, fixed } from './helpers.js';

const by = id => COUNTRIES.find(c => c.id === id);

test('solo 5 países tienen la capital con su nombre', () => {
  const got = COUNTRIES.filter(capitalHasCountryName).map(c => c.id).sort();
  assert.deepEqual(got, ['ad', 'lu', 'mc', 'sm', 'va']);
});

test('Test: 4 opciones distintas y solo una correcta', () => {
  for (let s = 1; s <= 30; s++) {
    const c = COUNTRIES[s];
    const q = makeQuestion('test', c, COUNTRIES, seeded(s));
    assert.equal(q.opts.length, 4);
    assert.equal(new Set(q.opts.map(o => o.id)).size, 4);
    assert.equal(q.opts.filter(o => o.id === c.id).length, 1);
  }
});

test('Test: 60 % de preguntas «capital de…» según el rng', () => {
  const es = by('es');
  assert.equal(makeQuestion('test', es, COUNTRIES, fixed(0.59)).mode, 'cap');
  assert.equal(makeQuestion('test', es, COUNTRIES, fixed(0.61)).mode, 'pais');
});

test('Test: Mónaco y El Vaticano siempre preguntan por la capital', () => {
  for (const id of ['mc', 'va', 'lu', 'sm', 'ad']) {
    assert.equal(makeQuestion('test', by(id), COUNTRIES, fixed(0.99)).mode, 'cap', id);
  }
});

test('Test: las opciones de «capital de» son capitales y las del otro modo son países', () => {
  const cap = makeQuestion('test', by('fr'), COUNTRIES, fixed(0.1));
  assert.ok(cap.opts.some(o => o.label === 'París'));
  const pais = makeQuestion('test', by('fr'), COUNTRIES, fixed(0.9));
  assert.ok(pais.opts.some(o => o.label === 'Francia'));
  assert.equal(pais.main, 'París');
});

test('Mapa: 70 % «toca el país»', () => {
  assert.equal(makeQuestion('mapa', by('es'), COUNTRIES, fixed(0.69)).mode, 'pais');
  assert.equal(makeQuestion('mapa', by('es'), COUNTRIES, fixed(0.71)).mode, 'cap');
});

test('Banderas, Escribe y Tarjetas', () => {
  const b = makeQuestion('banderas', by('es'), COUNTRIES, seeded(1));
  assert.equal(b.flag, 'es');
  assert.equal(b.opts.length, 4);
  const e = makeQuestion('escribir', by('es'), COUNTRIES, seeded(1));
  assert.equal(e.main, 'España');
  const t = makeQuestion('tarjetas', by('es'), COUNTRIES, seeded(1));
  assert.equal(t.back, 'Madrid');
});
