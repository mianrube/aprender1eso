import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUiState } from '../js/ui/state.js';

test('nivel 1 y sin sesión por defecto', () => {
  assert.deepEqual(createUiState().get(), { level: 1, session: null });
});

test('set fusiona, notifica y permite darse de baja', () => {
  const ui = createUiState();
  const seen = [];
  const off = ui.subscribe(s => seen.push(s.level));
  ui.set({ level: 3 });
  off();
  ui.set({ level: 4 });
  assert.deepEqual(seen, [3]);
  assert.equal(ui.get().level, 4);
});
