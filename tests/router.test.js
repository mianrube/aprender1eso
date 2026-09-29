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

import { resolveTarget } from '../js/router.js';

test('un guard redirige al módulo si no hay sesión', () => {
  let session = null;
  const guarded = {
    '/': {},
    '/europa': {},
    '/europa/reto': { guard: () => (session ? null : '/europa') },
  };
  assert.equal(resolveTarget('#/europa/reto', guarded), '/europa');
  session = {};
  assert.equal(resolveTarget('#/europa/reto', guarded), '/europa/reto');
  assert.equal(resolveTarget('#/nada', guarded), '/');
});
