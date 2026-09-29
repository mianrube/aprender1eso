import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, memoryStorage, defaults, KEY } from '../js/store.js';

test('primera visita: progreso inicial', () => {
  assert.deepEqual(createStore(memoryStorage()).get(), defaults());
});

test('recupera el progreso guardado', () => {
  const s = memoryStorage();
  s.setItem(KEY, JSON.stringify({ points: 40, streak: 2, badges: ['primera'] }));
  const st = createStore(s).get();
  assert.equal(st.points, 40);
  assert.equal(st.streak, 2);
  assert.deepEqual(st.badges, ['primera']);
});

test('set persiste bajo la clave rumbo-ue-v1', () => {
  const s = memoryStorage();
  createStore(s).set({ points: 10 });
  assert.equal(JSON.parse(s.getItem('rumbo-ue-v1')).points, 10);
});

test('JSON corrupto arranca con el progreso inicial', () => {
  const s = memoryStorage();
  s.setItem(KEY, '{no es json');
  assert.deepEqual(createStore(s).get(), defaults());
});

test('un valor que no es objeto se ignora', () => {
  const s = memoryStorage();
  s.setItem(KEY, '[1,2]');
  assert.deepEqual(createStore(s).get(), defaults());
});

test('campos ausentes toman su valor inicial', () => {
  const s = memoryStorage();
  s.setItem(KEY, JSON.stringify({ points: 5 }));
  const st = createStore(s).get();
  assert.equal(st.points, 5);
  assert.deepEqual(st.m, {});
  assert.deepEqual(st.badges, []);
  assert.equal(st.lastDay, null);
});

test('almacenamiento que lanza: sigue funcionando en memoria', () => {
  const broken = {
    getItem() { throw new Error('bloqueado'); },
    setItem() { throw new Error('bloqueado'); },
    removeItem() { throw new Error('bloqueado'); },
  };
  const store = createStore(broken);
  assert.deepEqual(store.get(), defaults());
  store.set({ points: 7 });
  assert.equal(store.get().points, 7);
  store.reset();
  assert.equal(store.get().points, 0);
});

test('reset elimina la clave y vuelve al estado inicial', () => {
  const s = memoryStorage();
  const store = createStore(s);
  store.set({ points: 99 });
  store.reset();
  assert.equal(s.getItem(KEY), null);
  assert.deepEqual(store.get(), defaults());
});

test('subscribe notifica cambios y permite darse de baja', () => {
  const store = createStore(memoryStorage());
  const seen = [];
  const off = store.subscribe(st => seen.push(st.points));
  store.set({ points: 1 });
  off();
  store.set({ points: 2 });
  assert.deepEqual(seen, [1]);
});
