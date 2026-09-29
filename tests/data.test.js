import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, LEVELS } from '../js/data/europa.js';
import { BADGES } from '../js/data/badges.js';

test('hay 51 países con iso2 únicos', () => {
  assert.equal(COUNTRIES.length, 51);
  assert.equal(new Set(COUNTRIES.map(c => c.id)).size, 51);
});

test('4 niveles con 13/14/15/9 países', () => {
  assert.equal(LEVELS.length, 4);
  const counts = LEVELS.map(l => COUNTRIES.filter(c => c.level === l.n).length);
  assert.deepEqual(counts, [13, 14, 15, 9]);
});

test('cada país tiene nombre y capital', () => {
  for (const c of COUNTRIES) {
    assert.ok(c.name && c.capital, c.id);
    assert.match(c.id, /^[a-z]{2}$/);
  }
});

test('hay 8 insignias con id único', () => {
  assert.equal(BADGES.length, 8);
  assert.equal(new Set(BADGES.map(b => b.id)).size, 8);
});
