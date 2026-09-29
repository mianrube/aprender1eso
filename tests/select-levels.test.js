import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../js/data/europa.js';
import { selectCountries } from '../js/engine/select.js';
import { levelPct, totalPct, isUnlocked, idsOfLevel } from '../js/engine/levels.js';
import { seeded } from './helpers.js';

const pool = level => COUNTRIES.filter(c => c.level === level);
const setLevel = (level, v) => Object.fromEntries(idsOfLevel(level).map(id => [id, v]));

test('8 países distintos de un nivel de 13', () => {
  const out = selectCountries(pool(1), {}, 8, seeded(1));
  assert.equal(out.length, 8);
  assert.equal(new Set(out.map(c => c.id)).size, 8);
  assert.ok(out.every(c => c.level === 1));
});

test('un nivel de 9 países da 8 y un pool menor da todos', () => {
  assert.equal(selectCountries(pool(4), {}, 8, seeded(1)).length, 8);
  assert.equal(selectCountries(pool(4).slice(0, 3), {}, 8, seeded(1)).length, 3);
});

test('los países menos dominados salen más a menudo', () => {
  const m = { es: 0, pt: 5 };
  const rng = seeded(42);
  const small = pool(1).slice(0, 4).map(c => c.id); // es pt fr gb
  const sub = pool(1).filter(c => small.includes(c.id));
  let es = 0, pt = 0;
  for (let i = 0; i < 2000; i++) {
    const ids = selectCountries(sub, m, 2, rng).map(c => c.id);
    if (ids.includes('es')) es++;
    if (ids.includes('pt')) pt++;
  }
  assert.ok(es > pt, `es=${es} pt=${pt}`);
});

test('desbloqueo: 59% bloquea y 60% abre el nivel 2', () => {
  // nivel 1 tiene 13 países: 38/65 = 58,5 % y 39/65 = 60 %
  const ids = idsOfLevel(1);
  const at = points => Object.fromEntries(ids.map((id, i) => [id, Math.min(5, Math.max(0, points - i * 5))]));
  assert.equal(isUnlocked(2, at(38)), false);
  assert.equal(isUnlocked(2, at(39)), true);
  assert.equal(levelPct(1, at(39)), 60);
});

test('el nivel 1 siempre está abierto y los demás dependen del anterior', () => {
  assert.equal(isUnlocked(1, {}), true);
  assert.equal(isUnlocked(3, setLevel(2, 3)), true);
  assert.equal(isUnlocked(3, setLevel(1, 5)), false);
});

test('porcentajes de nivel y total', () => {
  assert.equal(levelPct(1, setLevel(1, 5)), 100);
  assert.equal(levelPct(2, {}), 0);
  assert.equal(totalPct({}), 0);
  assert.equal(totalPct(Object.fromEntries(COUNTRIES.map(c => [c.id, 5]))), 100);
});

test('nivel 0 «Todos»: 51 países, siempre desbloqueado y con el dominio total', () => {
  assert.equal(idsOfLevel(0).length, 51);
  assert.equal(isUnlocked(0, {}), true);
  assert.equal(levelPct(0, Object.fromEntries(COUNTRIES.map(c => [c.id, 5]))), 100);
  assert.equal(levelPct(0, {}), 0);
});
