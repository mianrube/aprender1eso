import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, pickOne, pickWeighted } from '../js/engine/rng.js';
import { seeded } from './helpers.js';

test('shuffle conserva los elementos y no muta el original', () => {
  const src = [1, 2, 3, 4, 5, 6];
  const out = shuffle(src, seeded(3));
  assert.deepEqual([...out].sort(), src);
  assert.deepEqual(src, [1, 2, 3, 4, 5, 6]);
});

test('shuffle es determinista con el mismo rng', () => {
  assert.deepEqual(shuffle([1, 2, 3, 4, 5], seeded(7)), shuffle([1, 2, 3, 4, 5], seeded(7)));
});

test('pickOne devuelve un elemento del array', () => {
  assert.ok(['a', 'b', 'c'].includes(pickOne(['a', 'b', 'c'], seeded(2))));
  assert.equal(pickOne(['a', 'b'], () => 0.99), 'b');
});

test('pickWeighted no repite y respeta n', () => {
  const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
  const out = pickWeighted(items, () => 1, 4, seeded(5));
  assert.equal(out.length, 4);
  assert.equal(new Set(out.map(x => x.id)).size, 4);
});
