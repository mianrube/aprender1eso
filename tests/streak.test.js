import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, nextStreak, shownStreak } from '../js/lib/streak.js';

const today = new Date(2026, 8, 29);
const daysAgo = n => dayKey(new Date(2026, 8, 29 - n));

test('dayKey usa YYYY-M-D sin ceros', () => {
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-1-5');
});

test('jugó ayer: la racha suma 1', () => {
  assert.equal(nextStreak({ streak: 3, lastDay: daysAgo(1) }, today), 4);
});

test('jugó hoy: la racha no cambia', () => {
  assert.equal(nextStreak({ streak: 3, lastDay: daysAgo(0) }, today), 3);
});

test('racha rota: vuelve a 1', () => {
  assert.equal(nextStreak({ streak: 7, lastDay: daysAgo(3) }, today), 1);
  assert.equal(nextStreak({ streak: 0, lastDay: null }, today), 1);
});

test('ayer cruzando fin de mes', () => {
  const first = new Date(2026, 9, 1);
  assert.equal(nextStreak({ streak: 2, lastDay: '2026-9-30' }, first), 3);
});

test('la racha mostrada caduca a 0', () => {
  assert.equal(shownStreak({ streak: 5, lastDay: daysAgo(3) }, today), 0);
  assert.equal(shownStreak({ streak: 5, lastDay: daysAgo(1) }, today), 5);
  assert.equal(shownStreak({ streak: 5, lastDay: daysAgo(0) }, today), 5);
  assert.equal(shownStreak({ streak: 0, lastDay: null }, today), 0);
});
