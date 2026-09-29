import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE, MIN_K, MAX_K, initialView, viewBox, clampView, zoomAt, panBy, ensureVisible, isTap, pickCountry,
} from '../js/lib/map-view.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const inside = v => {
  const r = viewBox(v);
  assert.ok(r.x >= BASE.x - 1e-6 && r.y >= BASE.y - 1e-6, 'esquina superior izquierda');
  assert.ok(r.x + r.w <= BASE.x + BASE.w + 1e-6 && r.y + r.h <= BASE.y + BASE.h + 1e-6, 'esquina inferior derecha');
};

test('la vista inicial es el mapa completo y centrado', () => {
  const r = viewBox(initialView());
  assert.deepEqual([r.x, r.y, r.w, r.h], [BASE.x, BASE.y, BASE.w, BASE.h]);
});

test('el zoom se acota entre 1× y 8×', () => {
  let v = initialView();
  for (let i = 0; i < 20; i++) v = zoomAt(v, 2, v.cx, v.cy);
  assert.equal(v.k, MAX_K);
  for (let i = 0; i < 20; i++) v = zoomAt(v, 0.5, v.cx, v.cy);
  assert.equal(v.k, MIN_K);
});

test('a 1× la vista queda centrada aunque se intente desplazar', () => {
  const v = panBy(initialView(), 300, -200);
  assert.deepEqual(v, initialView());
});

test('al ampliar, el punto bajo los dedos no se mueve', () => {
  const v0 = initialView();
  const p = { x: 300, y: 500 };
  const before = (p.x - viewBox(v0).x) / viewBox(v0).w;
  const v1 = zoomAt(v0, 2, p.x, p.y);
  const after = (p.x - viewBox(v1).x) / viewBox(v1).w;
  near(before, after);
  assert.equal(v1.k, 2);
});

test('con zoom, arrastrar no saca la vista del contenido', () => {
  let v = zoomAt(initialView(), 4, 300, 400);
  v = panBy(v, -5000, 5000);
  inside(v);
  v = panBy(v, 5000, -5000);
  inside(v);
});

test('clampView corrige un centro fuera del mapa', () => {
  const v = clampView({ k: 2, cx: -1000, cy: 9999 });
  inside(v);
});

test('ensureVisible no cambia la vista si la caja ya se ve', () => {
  const v = zoomAt(initialView(), 2, 400, 350);
  const r = viewBox(v);
  const box = { x0: r.x + 50, y0: r.y + 50, x1: r.x + 90, y1: r.y + 90 };
  assert.deepEqual(ensureVisible(v, box, 12), v);
});

test('ensureVisible trae a la vista una caja fuera', () => {
  const v = zoomAt(initialView(), 4, 60, 550); // sobre Iberia
  const box = { x0: 520, y0: 450, x1: 560, y1: 480 }; // Balcanes
  const w = ensureVisible(v, box, 12);
  const r = viewBox(w);
  assert.ok(box.x0 - 12 >= r.x - 1e-6 && box.x1 + 12 <= r.x + r.w + 1e-6);
  assert.ok(box.y0 - 12 >= r.y - 1e-6 && box.y1 + 12 <= r.y + r.h + 1e-6);
  assert.equal(w.k, v.k); // desplazamiento mínimo, sin perder zoom
  inside(w);
});

test('ensureVisible reduce el zoom si dos países no caben', () => {
  const v = zoomAt(initialView(), 6, 60, 550);
  const box = { x0: 60, y0: 550, x1: 540, y1: 480 + 200 };
  const w = ensureVisible(v, box, 12);
  assert.ok(w.k < v.k);
  const r = viewBox(w);
  assert.ok(box.x0 - 12 >= r.x - 1e-6 && box.x1 + 12 <= r.x + r.w + 1e-6);
});

test('toque frente a gesto', () => {
  assert.equal(isTap({ distance: 3, hadSecondPointer: false }), true);
  assert.equal(isTap({ distance: 40, hadSecondPointer: false }), false);
  assert.equal(isTap({ distance: 8, hadSecondPointer: false }), false);
  assert.equal(isTap({ distance: 1, hadSecondPointer: true }), false);
});

// A 360 px: 0,434 px por unidad. Medidas reales: San Marino–Vaticano a 13,6 px.
const scale = 0.434;
const u = px => px / scale; // px de pantalla a unidades del mapa (k = 1)
const dots = [
  { iso: 'sm', x: 300, y: 300 },
  { iso: 'va', x: 300, y: 300 + u(13.6) },
  { iso: 'lu', x: 100, y: 100 },
];
const sizes = { de: 190, be: 33, hr: 62, xk: 21, me: 25, fr: 300 }; // be ≈ 14 px, hr ≈ 27 px, xk ≈ 9 px
const pick = (o, k = 1) => pickCountry({ hitIso: null, pt: { x: 0, y: 0 }, dots, probes: [], sizes, scale, k, ...o });
const at = (iso, dx, dy = 0) => { const d = dots.find(x => x.iso === iso); return { x: d.x + u(dx), y: d.y + u(dy) }; };

test('pickCountry: se tocó justo el círculo del microestado', () => {
  assert.equal(pick({ hitIso: 'sm', pt: at('sm', 0) }), 'sm');
});

test('pickCountry: un microestado a 8 px gana al país grande de debajo', () => {
  assert.equal(pick({ hitIso: 'it', pt: at('sm', -8) }), 'sm');
});

test('pickCountry: un microestado a 8 px gana incluso a un país pequeño (Luxemburgo frente a Bélgica)', () => {
  assert.equal(pick({ hitIso: 'be', pt: at('lu', 8) }), 'lu');
});

test('pickCountry: a 15 px, un país pequeño bajo el dedo gana al microestado', () => {
  assert.equal(pick({ hitIso: 'be', pt: at('lu', 15) }), 'be');
});

test('pickCountry: a 15 px, un país grande pierde frente al microestado', () => {
  assert.equal(pick({ hitIso: 'de', pt: at('lu', 15) }), 'lu');
});

test('pickCountry: a 25 px no hay tolerancia', () => {
  assert.equal(pick({ hitIso: 'de', pt: at('lu', 25) }), 'de');
});

test('pickCountry: entre dos microestados gana el más cercano', () => {
  const pt = { x: 300, y: 300 + u(9) };            // 9 px de San Marino, 4,6 px del Vaticano
  assert.equal(pick({ hitIso: 'it', pt }), 'va');
});

test('pickCountry: un país pequeño cercano se halla por las muestras en anillo', () => {
  const probes = [{ iso: null, d: 5 }, { iso: 'xk', d: 10 }, { iso: 'de', d: 15 }];
  assert.equal(pick({ hitIso: 'de', pt: { x: 0, y: 0 }, probes }), 'xk');
});

test('pickCountry: las muestras de países grandes se ignoran', () => {
  const probes = [{ iso: 'de', d: 5 }, { iso: 'fr', d: 10 }];
  assert.equal(pick({ hitIso: null, pt: { x: 0, y: 0 }, probes }), null);
});

test('pickCountry: muestras a más de 20 px no cuentan', () => {
  assert.equal(pick({ hitIso: 'de', probes: [{ iso: 'xk', d: 22 }] }), 'de');
});

test('pickCountry: dentro de un país pequeño gana ese país (sin microestados cerca)', () => {
  assert.equal(pick({ hitIso: 'me', pt: { x: 0, y: 0 } }), 'me');
});

test('pickCountry: con mucho zoom los microestados dejan de ser pequeños y no hay tolerancia', () => {
  // A 8× un microestado mide 11 × 0,434 × 8 ≈ 38 px (≥ 28 px)
  assert.equal(pick({ hitIso: 'fr', pt: at('sm', 0, 0) }, 8), 'fr');
  assert.equal(pick({ hitIso: 'fr', pt: { x: 300 + u(5) / 8, y: 300 } }, 8), 'fr');
});

test('pickCountry: con zoom Bélgica deja de ser pequeña', () => {
  // 33 unidades × 0,434 × 3 ≈ 43 px: un toque en Francia junto a Bélgica es Francia
  const probes = [{ iso: 'be', d: 5 }];
  assert.equal(pick({ hitIso: 'fr', probes }, 3), 'fr');
  assert.equal(pick({ hitIso: 'fr', probes }, 1), 'be');
});

test('pickCountry: sin nada devuelve null', () => {
  assert.equal(pick({}), null);
});
