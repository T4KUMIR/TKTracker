/**
 * router.js — minimal hash router. No dependency needed for ~6 routes.
 * Register routes with `router.add(path, renderFn)`, then `router.start()`.
 */
export function createRouter() {
  const routes = new Map();
  let notFound = () => '<div class="empty-state">Página no encontrada.</div>';
  let onNavigate = () => {};

  function currentPath() {
    return window.location.hash || '#/dashboard';
  }

  function resolve() {
    const path = currentPath();
    const matcher = [...routes.keys()].find((pattern) => matchRoute(pattern, path));
    const render = matcher ? routes.get(matcher) : notFound;
    const params = matcher ? extractParams(matcher, path) : {};
    onNavigate(path, render, params);
  }

  return {
    add(pattern, render) {
      routes.set(pattern, render);
      return this;
    },
    setNotFound(fn) { notFound = fn; },
    onChange(fn) { onNavigate = fn; },
    start() {
      window.addEventListener('hashchange', resolve);
      resolve();
    },
    navigate(path) {
      window.location.hash = path;
    },
    current: currentPath,
  };
}

function matchRoute(pattern, path) {
  const p = pattern.split('/');
  const a = path.split('?')[0].split('/');
  if (p.length !== a.length) return false;
  return p.every((seg, i) => seg.startsWith(':') || seg === a[i]);
}

function extractParams(pattern, path) {
  const p = pattern.split('/');
  const a = path.split('?')[0].split('/');
  const params = {};
  p.forEach((seg, i) => {
    if (seg.startsWith(':')) params[seg.slice(1)] = a[i];
  });
  return params;
}
