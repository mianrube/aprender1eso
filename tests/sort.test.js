import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../js/data/europa.js';
import { sortByName } from '../js/lib/sort.js';

const names = sortByName(COUNTRIES).map(c => c.name);

test('los 51 países, sin duplicar ni perder ninguno', () => {
  assert.equal(names.length, 51);
  assert.equal(new Set(names).size, 51);
});

test('empieza por Albania y no muta el original', () => {
  assert.equal(names[0], 'Albania');
  assert.equal(COUNTRIES[0].name, 'España');
});

test('las tildes no alteran el orden', () => {
  assert.ok(names.indexOf('Bélgica') < names.indexOf('Bielorrusia'));
});

test('«El Vaticano» se ordena por la V, después de Ucrania', () => {
  assert.equal(names.at(-1), 'El Vaticano');
  assert.equal(names.at(-2), 'Ucrania');
});

test('orden alfabético español completo', () => {
  const plain = names.map(n => n.replace(/^El /, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  const sorted = plain.slice().sort((a, b) => a.localeCompare(b, 'es'));
  assert.deepEqual(plain, sorted);
});
