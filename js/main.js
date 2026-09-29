import { createStore } from './store.js';
import { createRouter } from './router.js';
import { renderHeader } from './ui/header.js';
import { renderHome } from './ui/home.js';
import { renderModuleStub } from './ui/module-stub.js';

const store = createStore();
const root = document.getElementById('app');
let current = '/';

const routes = {
  '/': save => renderHome(save, { onReset: () => store.reset() }),
  '/europa': () => renderModuleStub(),
};

function render() {
  const save = store.get();
  root.replaceChildren(renderHeader(save), routes[current](save));
}

const router = createRouter(routes, path => {
  current = path;
  render();
});

store.subscribe(render);
router.start();
