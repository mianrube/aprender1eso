import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feature } from '../vendor/topojson-client/topojson-client.js';
import { COUNTRIES } from '../js/data/europa.js';
import { NUM, BYNAME, DOTS, FALLBACK, resolveIso } from '../js/data/map-ids.js';

const topo = JSON.parse(readFileSync(new URL('../vendor/world-atlas/countries-110m.json', import.meta.url), 'utf8'));
const features = feature(topo, topo.objects.countries).features;
const resolved = new Set(features.map(resolveIso).filter(Boolean));

test('los 51 países se resuelven a un polígono o a un punto', () => {
  const missing = COUNTRIES.filter(c => !resolved.has(c.id) && !DOTS[c.id] && !FALLBACK[c.id]).map(c => c.id);
  assert.deepEqual(missing, []);
});

test('la tabla numérica solo apunta a países de la lista', () => {
  const ids = new Set(COUNTRIES.map(c => c.id));
  for (const iso of [...Object.values(NUM), ...Object.values(BYNAME), ...Object.keys(DOTS), ...Object.keys(FALLBACK)]) {
    assert.ok(ids.has(iso), iso);
  }
});

test('Kosovo y el norte de Chipre se identifican por nombre', () => {
  assert.ok(features.some(f => resolveIso(f) === 'xk'), 'Kosovo');
  const cyprus = features.filter(f => resolveIso(f) === 'cy');
  assert.ok(cyprus.length >= 1, 'Chipre');
});

test('los siete microestados tienen círculo', () => {
  assert.deepEqual(Object.keys(DOTS).sort(), ['ad', 'li', 'lu', 'mc', 'mt', 'sm', 'va']);
});
