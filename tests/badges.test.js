import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../js/data/europa.js';
import { earnedBadges, newBadges, isLevelUnlocked } from '../js/lib/badges.js';

const empty = () => ({ m: {}, types: [], badges: [] });
const levelAt = (level, v) =>
  Object.fromEntries(COUNTRIES.filter(c => c.level === level).map(c => [c.id, v]));

test('sin progreso ni sesión no hay insignias', () => {
  assert.deepEqual(earnedBadges(empty(), null), []);
});

test('primera misión al completar una sesión', () => {
  assert.deepEqual(earnedBadges(empty(), { misses: 2, best: 1 }), ['primera']);
});

test('pleno: sesión sin fallos', () => {
  assert.ok(earnedBadges(empty(), { misses: 0, best: 3 }).includes('pleno'));
  assert.ok(!earnedBadges(empty(), { misses: 1, best: 3 }).includes('pleno'));
});

test('imparable: 5 aciertos seguidos', () => {
  assert.ok(earnedBadges(empty(), { misses: 1, best: 5 }).includes('imparable'));
  assert.ok(!earnedBadges(empty(), { misses: 1, best: 4 }).includes('imparable'));
});

test('nivel 2 se desbloquea con 60% de dominio en el nivel 1', () => {
  assert.equal(isLevelUnlocked(2, levelAt(1, 3)), true);
  assert.equal(isLevelUnlocked(2, levelAt(1, 2)), false);
  assert.ok(earnedBadges({ ...empty(), m: levelAt(1, 3) }, null).includes('n2'));
});

test('el nivel 1 siempre está desbloqueado', () => {
  assert.equal(isLevelUnlocked(1, {}), true);
});

test('todoterreno con los 6 tipos de reto', () => {
  const types = ['tarjetas', 'test', 'emparejar', 'banderas', 'mapa', 'escribir'];
  assert.ok(earnedBadges({ ...empty(), types }, null).includes('todoterreno'));
  assert.ok(!earnedBadges({ ...empty(), types: types.slice(1) }, null).includes('todoterreno'));
});

test('maestro con dominio 5 en los 51 países', () => {
  const m = Object.fromEntries(COUNTRIES.map(c => [c.id, 5]));
  const got = earnedBadges({ ...empty(), m }, null);
  assert.ok(got.includes('maestro'));
  assert.ok(['n2', 'n3', 'n4'].every(b => got.includes(b)));
});

test('newBadges excluye las ya ganadas', () => {
  const save = { ...empty(), badges: ['primera'] };
  assert.deepEqual(newBadges(save, { misses: 0, best: 1 }), ['pleno']);
});
