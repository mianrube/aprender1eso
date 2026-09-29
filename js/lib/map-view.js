// Lógica pura de la vista del mapa (zoom y desplazamiento) y de los toques. Sin DOM.
// La vista es { k, cx, cy }: ampliación y centro, en unidades del mapa (viewBox).

// Rectángulo de contenido a 1×: los 51 países de la lista sin los márgenes vacíos.
export const BASE = { x: 20, y: 6, w: 724, h: 700 };
export const MIN_K = 1;
export const MAX_K = 8;

export const TAP_SLOP = 8;        // px: movimiento máximo para que siga siendo un toque
export const SMALL_PX = 28;       // px: un país que en pantalla mide menos se considera pequeño
export const TAP_RADIUS_PX = 20;  // px: distancia máxima para atribuir un toque a un país pequeño

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clampK = k => clamp(k, MIN_K, MAX_K);

export const initialView = () => ({ k: 1, cx: BASE.x + BASE.w / 2, cy: BASE.y + BASE.h / 2 });

// Rectángulo visible {x, y, w, h} de una vista.
export function viewBox(v) {
  const w = BASE.w / v.k;
  const h = BASE.h / v.k;
  return { x: v.cx - w / 2, y: v.cy - h / 2, w, h };
}

// Ajusta ampliación y centro para que la parte visible no salga del contenido.
export function clampView(v) {
  const k = clampK(v.k);
  const w = BASE.w / k;
  const h = BASE.h / k;
  const cx = w >= BASE.w ? BASE.x + BASE.w / 2 : clamp(v.cx, BASE.x + w / 2, BASE.x + BASE.w - w / 2);
  const cy = h >= BASE.h ? BASE.y + BASE.h / 2 : clamp(v.cy, BASE.y + h / 2, BASE.y + BASE.h - h / 2);
  return { k, cx, cy };
}

// Cambia la ampliación manteniendo fijo el punto (px, py) del mapa.
export function zoomAt(v, factor, px, py) {
  const k = clampK(v.k * factor);
  const ratio = v.k / k;
  return clampView({ k, cx: px - (px - v.cx) * ratio, cy: py - (py - v.cy) * ratio });
}

// Desplaza la vista dx, dy unidades del mapa (el contenido se mueve con el dedo).
export function panBy(v, dx, dy) {
  return clampView({ k: v.k, cx: v.cx - dx, cy: v.cy - dy });
}

// Mueve (y si hace falta reduce el zoom) la vista lo mínimo para que bbox quede visible.
// bbox = { x0, y0, x1, y1 } en unidades del mapa.
export function ensureVisible(v, bbox, pad = 12) {
  const b = { x0: bbox.x0 - pad, y0: bbox.y0 - pad, x1: bbox.x1 + pad, y1: bbox.y1 + pad };
  const k = Math.min(v.k, clampK(Math.min(BASE.w / (b.x1 - b.x0), BASE.h / (b.y1 - b.y0))));
  const w = BASE.w / k;
  const h = BASE.h / k;
  let x = v.cx - w / 2;
  let y = v.cy - h / 2;
  if (b.x0 < x) x = b.x0; else if (b.x1 > x + w) x = b.x1 - w;
  if (b.y0 < y) y = b.y0; else if (b.y1 > y + h) y = b.y1 - h;
  return clampView({ k, cx: x + w / 2, cy: y + h / 2 });
}

// ¿Es un toque? Movimiento pequeño y sin segundo dedo.
export function isTap({ distance, hadSecondPointer }) {
  return !hadSecondPointer && distance < TAP_SLOP;
}

export const DOT_CLOSE_PX = 10;      // px: un microestado a esta distancia gana a cualquier país
export const DOT_SIZE = 11;          // unidades del mapa: tamaño de un microestado dibujado como círculo

// País al que se atribuye un toque, por capas:
//   1. un microestado a menos de DOT_CLOSE_PX del dedo;
//   2. el país pequeño que está bajo el dedo;
//   3. el país pequeño más cercano a menos de TAP_RADIUS_PX (microestados por su centro, el resto
//      por las muestras 'probes' que se toman en anillos alrededor del dedo);
//   4. el país que esté bajo el dedo, sea del tamaño que sea.
// Un país deja de ser pequeño cuando en pantalla mide SMALL_PX o más, así que con zoom la
// tolerancia desaparece sola.
//   hitIso  país bajo el dedo (o null);  pt  punto tocado, en unidades del mapa
//   dots    [{ iso, x, y }] centros de los microestados
//   probes  [{ iso, d }] país (o null) hallado a d px del dedo
//   sizes   { iso: lado mayor en unidades del mapa } de los países con polígono
//   scale   px por unidad del mapa a 1×;  k  ampliación actual
export function pickCountry({ hitIso, pt, dots, probes, sizes, scale, k }) {
  const px = scale * k;
  const dotsSmall = DOT_SIZE * px < SMALL_PX;
  const polySmall = iso => iso != null && sizes[iso] != null && sizes[iso] * px < SMALL_PX;
  const isDot = iso => dots.some(d => d.iso === iso);
  if (hitIso && isDot(hitIso)) return hitIso; // se tocó justo el círculo

  const near = dotsSmall
    ? dots.map(d => ({ iso: d.iso, d: Math.hypot(d.x - pt.x, d.y - pt.y) * px })).sort((a, b) => a.d - b.d)
    : [];
  if (near.length && near[0].d <= DOT_CLOSE_PX) return near[0].iso;          // 1
  if (polySmall(hitIso)) return hitIso;                                       // 2

  let best = null;                                                            // 3
  let bestD = TAP_RADIUS_PX;
  for (const n of near) if (n.d <= bestD) { best = n.iso; bestD = n.d; }
  for (const p of probes) if (polySmall(p.iso) && p.d < bestD) { best = p.iso; bestD = p.d; }
  return best || hitIso || null;                                              // 4
}
