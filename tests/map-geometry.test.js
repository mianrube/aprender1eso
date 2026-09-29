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

import { geoAzimuthalEqualArea, geoPath } from '../vendor/d3-geo/d3-geo.js';
import { BASE } from '../js/lib/map-view.js';

const proj = geoAzimuthalEqualArea().rotate([-20, -54]).clipAngle(70)
  .fitExtent([[14, 14], [786, 746]], { type: 'MultiPoint', coordinates: [[-24, 64], [-10, 36], [44, 36], [62, 48], [32, 71], [-8, 56]] });
const path = geoPath(proj);
const intersectsBase = (x0, y0, x1, y1) => x1 >= BASE.x && x0 <= BASE.x + BASE.w && y1 >= BASE.y && y0 <= BASE.y + BASE.h;

test('los 51 países tienen una parte visible en el encuadre ajustado', () => {
  const missing = [];
  for (const c of COUNTRIES) {
    const polys = features.filter(f => resolveIso(f) === c.id).map(f => path.bounds(f)).filter(b => isFinite(b[0][0]));
    const hit = polys.some(b => intersectsBase(b[0][0], b[0][1], b[1][0], b[1][1]));
    const ll = DOTS[c.id] || FALLBACK[c.id];
    const dot = ll && proj(ll) && intersectsBase(proj(ll)[0], proj(ll)[1], proj(ll)[0], proj(ll)[1]);
    if (!hit && !dot) missing.push(c.id);
  }
  assert.deepEqual(missing, []);
});

test('los microestados y Chipre caen dentro del encuadre', () => {
  for (const iso of ['mt', 'lu', 'ad', 'li', 'mc', 'sm', 'va', 'cy']) {
    const ll = DOTS[iso] || FALLBACK[iso] || [33.2, 35.0];
    const [x, y] = proj(ll);
    assert.ok(x >= BASE.x && x <= BASE.x + BASE.w && y >= BASE.y && y <= BASE.y + BASE.h, iso);
  }
});

test('el encuadre ajustado da más escala que el anterior (800×760)', () => {
  assert.ok(800 / BASE.w > 1.05);
  assert.ok(Math.min(314 / BASE.w, 453 / BASE.h) > Math.min(314 / 800, 453 / 760));
});
