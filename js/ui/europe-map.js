// Mapa de Europa en SVG. Se dibuja una vez; update() cambia colores y marcas y la vista se mueve
// cambiando el viewBox. La lógica de zoom y de toques está en js/lib/map-view.js (pura).
import { geoAzimuthalEqualArea, geoPath } from '../../vendor/d3-geo/d3-geo.js';
import { feature } from '../../vendor/topojson-client/topojson-client.js';
import { COUNTRIES } from '../data/europa.js';
import { DOTS, FALLBACK, resolveIso } from '../data/map-ids.js';
import {
  BASE, MIN_K, MAX_K, TAP_SLOP, initialView, viewBox, clampView, zoomAt, panBy, ensureVisible, isTap, pickCountry,
} from '../lib/map-view.js';

const NS = 'http://www.w3.org/2000/svg';
const TOPO_URL = new URL('../../vendor/world-atlas/countries-110m.json', import.meta.url);
const ZOOM_STEP = 1.6;
const ANIM_MS = 200;
const DOT_R = 5.5;

// Escala de dominio 0–5 (relleno del mapa).
export const MASTERY_COLORS = ['#FFFFFF', '#FFE9A8', '#FFD466', '#BDE8B0', '#7ED49A', '#22B573'];
const MARK_COLORS = { ok: '#22B573', bad: '#F0555A' };

export const fillsFromMastery = m => Object.fromEntries(COUNTRIES.map(c => [c.id, MASTERY_COLORS[m[c.id] || 0]]));
export const blankFills = () => Object.fromEntries(COUNTRIES.map(c => [c.id, MASTERY_COLORS[0]]));
export const namesFull = () => Object.fromEntries(COUNTRIES.map(c => [c.id, `${c.name} · ${c.capital}`]));
export const namesCountry = () => Object.fromEntries(COUNTRIES.map(c => [c.id, c.name]));

let topoPromise = null;
const loadTopo = () => (topoPromise ||= fetch(TOPO_URL).then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}).catch(err => { topoPromise = null; throw err; }));

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// opts: { onCountryClick(iso), zoomable }. Devuelve { el, update(state), destroy() }.
export function createEuropeMap({ onCountryClick, zoomable = false } = {}) {
  const el = document.createElement('div');
  el.className = 'map';
  const status = document.createElement('div');
  status.className = 'map__status';
  status.textContent = 'Cargando mapa…';
  el.append(status);
  const tip = document.createElement('div');
  tip.className = 'map__tip';
  document.body.append(tip);

  let state = { fills: {}, names: {}, marks: {}, interactive: false, showNames: false };
  const shapes = {};      // iso -> elementos SVG
  const anchors = {};     // iso -> { bbox } para traer marcas a la vista
  const sizes = {};       // iso -> lado mayor (unidades del mapa) de los países con polígono
  const dotList = [];     // microestados: [{ iso, x, y }]
  let group = null;
  let svg = null;
  let destroyed = false;
  let view = initialView();
  let anim = null;
  let lastMarksKey = '';
  let zoomBtns = null;

  const hideTip = () => { tip.style.display = 'none'; };

  function showTip(e, iso) {
    const text = state.showNames && state.names[iso];
    if (!text || (e.pointerType && e.pointerType !== 'mouse')) return hideTip();
    tip.textContent = text;
    tip.style.display = 'block';
    const x = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 6);
    tip.style.left = `${Math.max(6, x)}px`;
    tip.style.top = `${e.clientY - 34}px`;
  }

  // ---------- Vista ----------
  const scale = () => {
    const r = svg.getBoundingClientRect();
    return Math.min(r.width / BASE.w, r.height / BASE.h) || 1; // px por unidad del mapa a 1×
  };

  function toMap(clientX, clientY) {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function updateControls() {
    el.classList.toggle('is-zoomed', view.k > 1);
    if (svg) svg.style.touchAction = zoomable && state.interactive ? (view.k > 1 ? 'none' : 'pan-y') : '';
    if (!zoomBtns) return;
    zoomBtns.in.disabled = view.k >= MAX_K - 1e-6;
    zoomBtns.out.disabled = view.k <= MIN_K + 1e-6;
    zoomBtns.reset.disabled = view.k <= MIN_K + 1e-6;
  }

  function setView(v) {
    view = clampView(v);
    if (svg) {
      const b = viewBox(view);
      svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`);
    }
    paint();
    updateControls();
  }

  function animateTo(target) {
    cancelAnimationFrame(anim);
    const to = clampView(target);
    if (!svg || reducedMotion() || document.hidden) return setView(to);
    const from = view;
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / ANIM_MS);
      const e = 1 - (1 - t) * (1 - t); // ease-out
      setView({ k: from.k + (to.k - from.k) * e, cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e });
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function paint() {
    el.classList.toggle('is-interactive', !!state.interactive);
    if (!group) return;
    const k = view.k;
    for (const [iso, list] of Object.entries(shapes)) {
      const mark = state.marks[iso];
      const fill = MARK_COLORS[mark] || state.fills[iso] || '#FFFFFF';
      for (const s of list) {
        s.setAttribute('fill', fill);
        s.setAttribute('stroke-width', (mark ? 2.2 : 0.9) / k); // el trazo no crece con el zoom
      }
    }
    // Las marcas y los círculos quedan por encima del resto.
    for (const iso of Object.keys(state.marks)) (shapes[iso] || []).forEach(s => group.append(s));
    group.querySelectorAll('circle.eu').forEach(c => group.append(c));
  }

  // ---------- Toques y gestos ----------
  const ptrs = new Map();
  let g = null;

  const isoAt = (x, y) => {
    const e = document.elementFromPoint(x, y);
    const h = e && e.closest ? e.closest('[data-iso]') : null;
    return h ? h.dataset.iso : null;
  };

  // Muestras en anillos alrededor del dedo, para hallar países pequeños cercanos.
  function ring(x, y) {
    const out = [];
    for (const d of [5, 10, 15, 20]) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        out.push({ iso: isoAt(x + d * Math.cos(a), y + d * Math.sin(a)), d });
      }
    }
    return out;
  }

  function resolveTap(clientX, clientY) {
    const pt = toMap(clientX, clientY);
    if (!pt) return null;
    return pickCountry({
      hitIso: isoAt(clientX, clientY), pt, dots: dotList, probes: ring(clientX, clientY), sizes, scale: scale(), k: view.k,
    });
  }

  function midpoint() {
    const [a, b] = [...ptrs.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) };
  }

  function bindGestures() {
    svg.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      cancelAnimationFrame(anim);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) {
        g = { sx: e.clientX, sy: e.clientY, dist: 0, multi: false, captured: false };
      } else if (g) {
        g.multi = true;
        if (zoomable && ptrs.size === 2) {
          const m = midpoint();
          g.pinch = { d0: m.d || 1, mid0: m, view0: view, map0: toMap(m.x, m.y) };
        }
      }
    });

    svg.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId);
      if (!p || !g) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (ptrs.size === 2 && g.pinch) {
        const m = midpoint();
        const z = zoomAt(g.pinch.view0, m.d / g.pinch.d0, g.pinch.map0.x, g.pinch.map0.y);
        const px = scale() * z.k;
        setView(panBy(z, (m.x - g.pinch.mid0.x) / px, (m.y - g.pinch.mid0.y) / px));
        hideTip();
      } else if (ptrs.size === 1) {
        g.dist = Math.max(g.dist, Math.hypot(e.clientX - g.sx, e.clientY - g.sy));
        if (zoomable && view.k > 1 && g.dist >= TAP_SLOP) {
          if (!g.captured) { try { svg.setPointerCapture(e.pointerId); } catch { /* puntero ya liberado */ } g.captured = true; }
          const px = scale() * view.k;
          setView(panBy(view, dx / px, dy / px));
          hideTip();
        }
      }
    });

    svg.addEventListener('pointerup', e => {
      const single = ptrs.size === 1 && g && !g.multi;
      if (single) g.dist = Math.max(g.dist, Math.hypot(e.clientX - g.sx, e.clientY - g.sy));
      const tap = single && isTap({ distance: g.dist, hadSecondPointer: false });
      ptrs.delete(e.pointerId);
      if (ptrs.size === 0) { const wasTap = tap; g = null; if (wasTap && state.interactive && onCountryClick) fireTap(e); }
    });

    svg.addEventListener('pointercancel', e => {
      ptrs.delete(e.pointerId);
      if (ptrs.size === 0) g = null;
    });
  }

  function fireTap(e) {
    const iso = resolveTap(e.clientX, e.clientY);
    if (iso) onCountryClick(iso);
  }

  // ---------- Controles ----------
  function buildControls() {
    const btn = (label, text, onclick) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'map__btn';
      b.setAttribute('aria-label', label);
      b.textContent = text;
      b.addEventListener('click', onclick);
      return b;
    };
    zoomBtns = {
      in: btn('Ampliar el mapa', '+', () => animateTo(zoomAt(view, ZOOM_STEP, view.cx, view.cy))),
      out: btn('Alejar el mapa', '−', () => animateTo(zoomAt(view, 1 / ZOOM_STEP, view.cx, view.cy))),
      reset: btn('Restablecer la vista del mapa', '⤢', () => animateTo(initialView())),
    };
    const box = document.createElement('div');
    box.className = 'map__zoom';
    box.append(zoomBtns.in, zoomBtns.out, zoomBtns.reset);
    el.append(box);
    updateControls();
  }

  if (zoomable) buildControls();

  // ---------- Carga y dibujo ----------
  const unionBounds = list => list.reduce((a, b) => [[Math.min(a[0][0], b[0][0]), Math.min(a[0][1], b[0][1])], [Math.max(a[1][0], b[1][0]), Math.max(a[1][1], b[1][1])]]);

  loadTopo().then(topo => {
    if (destroyed) return;
    const feats = feature(topo, topo.objects.countries).features;
    feats.forEach(f => { f.iso = resolveIso(f); });
    const have = new Set(feats.map(f => f.iso));
    const dots = { ...DOTS };
    Object.entries(FALLBACK).forEach(([iso, ll]) => { if (!have.has(iso)) dots[iso] = ll; });

    const proj = geoAzimuthalEqualArea().rotate([-20, -54]).clipAngle(70)
      .fitExtent([[14, 14], [786, 746]], {
        type: 'MultiPoint',
        coordinates: [[-24, 64], [-10, 36], [44, 36], [62, 48], [32, 71], [-8, 56]],
      });
    const path = geoPath(proj);

    svg = svgEl('svg', { viewBox: `${BASE.x} ${BASE.y} ${BASE.w} ${BASE.h}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Mapa de Europa' });
    // Países fuera de la lista: contexto, sin interacción.
    const context = svgEl('g');
    feats.filter(f => !f.iso).forEach(f => {
      const d = path(f);
      if (d) context.append(svgEl('path', { d, fill: '#EEE9DE', stroke: '#FFFFFF', 'stroke-width': 0.8 }));
    });
    group = svgEl('g');
    const add = (iso, node) => {
      node.classList.add('eu');
      node.dataset.iso = iso;
      node.setAttribute('stroke', '#1F2335');
      node.setAttribute('stroke-linejoin', 'round');
      node.addEventListener('mousemove', e => showTip(e, iso));
      node.addEventListener('mouseleave', hideTip);
      (shapes[iso] ||= []).push(node);
      group.append(node);
    };
    const bounds = {};
    feats.filter(f => f.iso).forEach(f => {
      const d = path(f);
      if (!d) return;
      add(f.iso, svgEl('path', { d }));
      const b = path.bounds(f);
      bounds[f.iso] = bounds[f.iso] ? unionBounds([bounds[f.iso], b]) : b;
    });
    // Tamaño y caja de cada país (tolerancia táctil y traer marcas a la vista).
    Object.entries(bounds).forEach(([iso, b]) => {
      sizes[iso] = Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]);
      anchors[iso] = { bbox: { x0: b[0][0], y0: b[0][1], x1: b[1][0], y1: b[1][1] } };
    });
    Object.entries(dots).forEach(([iso, ll]) => {
      const p = proj(ll);
      if (!p) return;
      add(iso, svgEl('circle', { cx: p[0], cy: p[1], r: DOT_R }));
      // El círculo es el objetivo táctil de los microestados y sustituye a su polígono como caja.
      dotList.push({ iso, x: p[0], y: p[1] });
      anchors[iso] = { bbox: { x0: p[0] - DOT_R, y0: p[1] - DOT_R, x1: p[0] + DOT_R, y1: p[1] + DOT_R } };
    });
    svg.append(context, group);
    bindGestures();
    status.remove();
    el.prepend(svg);
    setView(view);
  }).catch(() => {
    if (!destroyed) status.textContent = 'No se pudo cargar el mapa.';
  });

  // Trae a la vista los países marcados (solo con zoom activado).
  function showMarks() {
    if (!Object.keys(anchors).length) return;
    const key = Object.keys(state.marks).sort().join(',');
    if (key === lastMarksKey) return;
    lastMarksKey = key;
    if (!zoomable || !key) return;
    const boxes = Object.keys(state.marks).map(iso => anchors[iso] && anchors[iso].bbox).filter(Boolean);
    if (!boxes.length) return;
    const bbox = boxes.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
    animateTo(ensureVisible(view, bbox));
  }

  return {
    el,
    update(next) {
      state = { ...state, ...next };
      if (!state.showNames) hideTip();
      paint();
      updateControls();
      showMarks();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(anim);
      tip.remove();
      el.remove();
    },
  };
}
