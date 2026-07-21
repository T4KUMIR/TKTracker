/**
 * helpers.js — small, pure, dependency-free utility functions.
 * Keep this file framework-agnostic so it can be unit-tested in isolation.
 */

/** Format hours as "123h" or "45 min" for sub-1h playtimes. */
export function formatPlaytime(hours) {
  if (!hours || hours <= 0) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${Math.round(hours).toLocaleString('es-ES')}h`;
}

/** Format an ISO date into a short relative-ish label. */
export function formatDate(iso) {
  if (!iso) return 'Sin fecha';
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Clamp a number between min and max. */
export function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

/** Compute achievement completion % for a game, derived — never trust stale stored %. */
export function computeProgress(game) {
  const { unlocked, total } = game.achievements;
  if (!total) return game.progress ?? 0;
  return clamp(Math.round((unlocked / total) * 100));
}

/** Debounce helper for the search bar. */
export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Simple DOM-creation shorthand: h('div.class#id', {attr}, [children]) */
export function h(tag, attrs = {}, children = []) {
  const [tagName, ...rest] = tag.split(/(?=[.#])/);
  const el = document.createElement(tagName || 'div');
  rest.forEach((token) => {
    if (token.startsWith('.')) el.classList.add(token.slice(1));
    else if (token.startsWith('#')) el.id = token.slice(1);
  });
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (key === 'onClick') el.addEventListener('click', value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') el.innerHTML = value;
    else if (value !== false && value != null) el.setAttribute(key, value);
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null) return;
    el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return el;
}

/** Escapes text for safe innerHTML interpolation. */
export function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
