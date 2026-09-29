import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { COUNTRIES } from '../js/data/europa.js';

const v = p => new URL(`../vendor/${p}`, import.meta.url);

test('librerías y datos del mapa con su licencia', () => {
  for (const p of [
    'd3-geo/d3-geo.js', 'd3-geo/LICENSE',
    'topojson-client/topojson-client.js', 'topojson-client/LICENSE',
    'world-atlas/countries-110m.json', 'world-atlas/LICENSE',
  ]) {
    assert.ok(existsSync(v(p)), p);
  }
});

test('hay una bandera SVG por cada uno de los 51 países', () => {
  for (const c of COUNTRIES) {
    const f = v(`flags/${c.id}.svg`);
    assert.ok(existsSync(f), `falta la bandera de ${c.id}`);
    assert.ok(statSync(f).size > 0, `bandera vacía: ${c.id}`);
  }
});

test('fuentes Fredoka 500/600/700 y Nunito 500-800', () => {
  for (const w of [500, 600, 700]) assert.ok(existsSync(v(`fonts/fredoka-${w}.woff2`)), `fredoka-${w}`);
  for (const w of [500, 600, 700, 800]) assert.ok(existsSync(v(`fonts/nunito-${w}.woff2`)), `nunito-${w}`);
});

test('las librerías vendorizadas cargan y proyectan el mapa', async () => {
  const { geoAzimuthalEqualArea, geoPath } = await import('../vendor/d3-geo/d3-geo.js');
  const { feature } = await import('../vendor/topojson-client/topojson-client.js');
  const { readFileSync } = await import('node:fs');
  const topo = JSON.parse(readFileSync(v('world-atlas/countries-110m.json'), 'utf8'));
  const countries = feature(topo, topo.objects.countries);
  assert.ok(countries.features.length > 100);
  const path = geoPath(geoAzimuthalEqualArea().rotate([-20, -54]));
  assert.ok(path(countries.features[0]).startsWith('M'));
});
