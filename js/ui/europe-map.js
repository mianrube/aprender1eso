// Mapa de Europa en SVG. Se dibuja una vez y update() solo cambia colores y marcas.
import { geoAzimuthalEqualArea, geoPath } from '../../vendor/d3-geo/d3-geo.js';
import { feature } from '../../vendor/topojson-client/topojson-client.js';
import { COUNTRIES } from '../data/europa.js';
import { DOTS, FALLBACK, resolveIso } from '../data/map-ids.js';

const NS = 'http://www.w3.org/2000/svg';
const TOPO_URL = new URL('../../vendor/world-atlas/countries-110m.json', import.meta.url);

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

// opts: { onCountryClick(iso) }. Devuelve { el, update(state), destroy() }.
export function createEuropeMap({ onCountryClick } = {}) {
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
  const shapes = {};  // iso -> elementos SVG
  let group = null;
  let destroyed = false;

  const hideTip = () => { tip.style.display = 'none'; };

  function showTip(e, iso) {
    const text = state.showNames && state.names[iso];
    if (!text) return hideTip();
    tip.textContent = text;
    tip.style.display = 'block';
    const x = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 6);
    tip.style.left = `${Math.max(6, x)}px`;
    tip.style.top = `${e.clientY - 34}px`;
  }

  function paint() {
    el.classList.toggle('is-interactive', !!state.interactive);
    if (!group) return;
    for (const [iso, list] of Object.entries(shapes)) {
      const mark = state.marks[iso];
      const fill = MARK_COLORS[mark] || state.fills[iso] || '#FFFFFF';
      for (const s of list) {
        s.setAttribute('fill', fill);
        s.setAttribute('stroke-width', mark ? 2.2 : 0.9);
      }
    }
    // Las marcas y los círculos quedan por encima del resto.
    for (const iso of Object.keys(state.marks)) (shapes[iso] || []).forEach(s => group.append(s));
    group.querySelectorAll('circle.eu').forEach(c => group.append(c));
  }

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

    const svg = svgEl('svg', { viewBox: '0 0 800 760', preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Mapa de Europa' });
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
      node.addEventListener('click', () => { if (state.interactive && onCountryClick) onCountryClick(iso); });
      node.addEventListener('mousemove', e => showTip(e, iso));
      node.addEventListener('mouseleave', hideTip);
      (shapes[iso] ||= []).push(node);
      group.append(node);
    };
    feats.filter(f => f.iso).forEach(f => {
      const d = path(f);
      if (d) add(f.iso, svgEl('path', { d }));
    });
    Object.entries(dots).forEach(([iso, ll]) => {
      const p = proj(ll);
      if (p) add(iso, svgEl('circle', { cx: p[0], cy: p[1], r: 5.5 }));
    });
    svg.append(context, group);
    status.remove();
    el.append(svg);
    paint();
  }).catch(() => {
    if (!destroyed) status.textContent = 'No se pudo cargar el mapa.';
  });

  return {
    el,
    update(next) {
      state = { ...state, ...next };
      if (!state.showNames) hideTip();
      paint();
    },
    destroy() {
      destroyed = true;
      tip.remove();
      el.remove();
    },
  };
}
