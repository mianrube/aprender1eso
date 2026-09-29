import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAnswer } from '../js/engine/scoring.js';
import { emptySave } from './helpers.js';

test('acierto normal: 10 puntos y dominio +1', () => {
  const r = applyAnswer(emptySave(), 'es', true, 10, 0);
  assert.equal(r.gained, 10);
  assert.equal(r.save.points, 10);
  assert.equal(r.save.m.es, 1);
  assert.equal(r.combo, 1);
});

test('bonus de 5 al tercer acierto seguido', () => {
  assert.equal(applyAnswer(emptySave(), 'es', true, 10, 1).gained, 10);
  assert.equal(applyAnswer(emptySave(), 'es', true, 10, 2).gained, 15);
  assert.equal(applyAnswer(emptySave(), 'es', true, 10, 3).gained, 15);
});

test('Tarjetas: 5 puntos y 10 con bonus', () => {
  assert.equal(applyAnswer(emptySave(), 'es', true, 5, 0).gained, 5);
  assert.equal(applyAnswer(emptySave(), 'es', true, 5, 2).gained, 10);
});

test('fallo: sin puntos, reinicia la racha y baja el dominio', () => {
  const save = { ...emptySave(), points: 20, m: { es: 3 } };
  const r = applyAnswer(save, 'es', false, 10, 4);
  assert.equal(r.gained, 0);
  assert.equal(r.combo, 0);
  assert.equal(r.save.points, 20);
  assert.equal(r.save.m.es, 2);
});

test('el dominio se acota entre 0 y 5', () => {
  assert.equal(applyAnswer(emptySave(), 'es', false, 10, 0).save.m.es, 0);
  assert.equal(applyAnswer({ ...emptySave(), m: { es: 5 } }, 'es', true, 10, 0).save.m.es, 5);
});

test('no muta el progreso original', () => {
  const save = emptySave();
  applyAnswer(save, 'es', true, 10, 0);
  assert.deepEqual(save, emptySave());
});
