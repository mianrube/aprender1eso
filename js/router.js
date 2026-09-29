// Router por hash: #/ (portal), #/europa, #/europa/reto, ...
// Cada ruta puede tener guard() -> path de redirección o null.
export function resolveRoute(hash, routes) {
  const path = (hash || '').replace(/^#/, '') || '/';
  return routes[path] ? path : '/';
}

// Ruta final tras aplicar el guard (por ejemplo, un reto sin sesión vuelve al módulo).
export function resolveTarget(hash, routes) {
  const path = resolveRoute(hash, routes);
  const redirect = routes[path] && typeof routes[path].guard === 'function' ? routes[path].guard() : null;
  return redirect || path;
}

export const href = path => `#${path}`;

export function createRouter(routes, onChange) {
  const go = () => {
    const path = resolveRoute(location.hash, routes);
    const redirect = typeof routes[path].guard === 'function' ? routes[path].guard() : null;
    if (redirect) {
      location.replace(href(redirect)); // dispara hashchange y vuelve a entrar aquí
      return;
    }
    onChange(path, routes[path]);
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', go);
  return { start: go, go };
}
