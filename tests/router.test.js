import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../js/router.js';

const routes = { '/': 1, '/europa': 2 };

test('ruta válida', () => {
  assert.equal(resolveRoute('#/europa', routes), '/europa');
});

test('hash vacío lleva al portal', () => {
  assert.equal(resolveRoute('', routes), '/');
  assert.equal(resolveRoute('#', routes), '/');
});

test('ruta desconocida lleva al portal', () => {
  assert.equal(resolveRoute('#/no-existe', routes), '/');
});
