// Router por hash: #/ (portal), #/europa, ... Una ruta desconocida lleva al portal.
export function resolveRoute(hash, routes) {
  const path = (hash || '').replace(/^#/, '') || '/';
  return routes[path] ? path : '/';
}

export function createRouter(routes, onChange) {
  const go = () => {
    const path = resolveRoute(location.hash, routes);
    onChange(path, routes[path]);
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', go);
  return { start: go, go };
}

export const href = path => `#${path}`;
