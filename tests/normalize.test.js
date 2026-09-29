import { test } from 'node:test';
import assert from 'node:assert/strict';
import { norm, levenshtein, checkWritten } from '../js/engine/normalize.js';
import { COUNTRIES } from '../js/data/europa.js';

const by = id => COUNTRIES.find(c => c.id === id);

test('norm quita tildes, mayúsculas, espacios y símbolos', () => {
  assert.equal(norm('  París! '), 'paris');
  assert.equal(norm('Andorra la Vieja'), 'andorralavieja');
  assert.equal(norm('Chisináu'), 'chisinau');
});

test('levenshtein', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('roma', 'roma'), 0);
  assert.equal(levenshtein('', 'abc'), 3);
});

test('acierto exacto sin tildes ni mayúsculas', () => {
  assert.equal(checkWritten('parís', by('fr')), 'exact');
  assert.equal(checkWritten('PARIS', by('fr')), 'exact');
  assert.equal(checkWritten('andorra la vieja', by('ad')), 'exact');
});

test('acepta formas alternativas', () => {
  assert.equal(checkWritten('Kyiv', by('ua')), 'exact');
  assert.equal(checkWritten('london', by('gb')), 'exact');
});

test('un error de ortografía cuenta como casi', () => {
  assert.equal(checkWritten('Estocolma', by('se')), 'near');
  assert.equal(checkWritten('Rom', by('it')), 'near');
});

test('dos errores o una capital distinta fallan', () => {
  assert.equal(checkWritten('Estocolna', by('se')), 'wrong');
  assert.equal(checkWritten('Lyon', by('fr')), 'wrong');
  assert.equal(checkWritten('Ros', by('no')), 'wrong');
  assert.equal(checkWritten('', by('fr')), 'wrong');
});

test('la distancia 2 no se acepta', () => {
  assert.equal(checkWritten('Stocolma', by('se')), 'wrong');
});
