import { store, ui } from './app.js';
import { createRouter } from './router.js';
import { renderHeader } from './ui/header.js';
import { renderHome } from './ui/home.js';
import { renderModule } from './ui/module.js';
import { renderPlay } from './ui/play.js';
import { renderResults } from './ui/results.js';

const root = document.getElementById('app');

// Cada ruta: chrome (cabecera general), live (se repinta al cambiar progreso o UI), guard y render.
const routes = {
  '/': { chrome: true, live: true, render: ctx => renderHome(ctx, { onReset: () => store.reset() }) },
  '/europa': { chrome: true, live: true, render: renderModule },
  '/europa/reto': { chrome: false, live: false, guard: () => (ui.get().session && !ui.get().session.finished ? null : '/europa'), render: renderPlay },
  '/europa/resultados': { chrome: false, live: false, guard: () => (ui.get().session && ui.get().session.finished ? null : '/europa'), render: renderResults },
};

let current = '/';
let cleanups = [];

function render() {
  cleanups.forEach(fn => fn());
  cleanups = [];
  const route = routes[current];
  const save = store.get();
  const node = route.render({ save, onCleanup: fn => cleanups.push(fn) });
  root.replaceChildren(...(route.chrome ? [renderHeader(save)] : []), node);
}

const router = createRouter(routes, path => {
  current = path;
  render();
});

const rerenderIfLive = () => { if (routes[current].live) render(); };
store.subscribe(rerenderIfLive);
ui.subscribe(rerenderIfLive);
router.start();
