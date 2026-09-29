import { test } from 'node:test';
import assert from 'node:assert/strict';
import { averageMastery, clampMastery } from '../js/lib/mastery.js';

test('4 países con dominios 5, 5, 0 y 0 dan 50%', () => {
  const m = { a: 5, b: 5, c: 0 };
  assert.equal(averageMastery(['a', 'b', 'c', 'd'], m), 0.5);
});

test('lista vacía da 0', () => {
  assert.equal(averageMastery([], {}), 0);
});

test('el dominio se acota entre 0 y 5', () => {
  assert.equal(clampMastery(9), 5);
  assert.equal(clampMastery(-2), 0);
  assert.equal(averageMastery(['a'], { a: 9 }), 1);
});
