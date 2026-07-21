/**
 * filters.js — pure functions that transform a list of Universal Games.
 * Used by the Library page and the SearchBar/Sidebar filter controls.
 */
import { computeProgress } from './helpers.js';

/**
 * @typedef {Object} FilterState
 * @property {string} query
 * @property {string|null} platform
 * @property {string|null} status
 * @property {[number, number]} progressRange
 * @property {boolean} onlyFavorites
 * @property {'title'|'progress'|'playtime'|'lastPlayed'} sortBy
 * @property {'asc'|'desc'} sortDir
 */

export const DEFAULT_FILTERS = {
  query: '',
  platform: null,
  status: null,
  progressRange: [0, 100],
  onlyFavorites: false,
  sortBy: 'lastPlayed',
  sortDir: 'desc',
};

export function applyFilters(games, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const q = f.query.trim().toLowerCase();

  let result = games.filter((game) => {
    const progress = computeProgress(game);
    if (q && !game.title.toLowerCase().includes(q)) return false;
    if (f.platform && game.platform !== f.platform) return false;
    if (f.status && game.status !== f.status) return false;
    if (f.onlyFavorites && !game.favorite) return false;
    if (progress < f.progressRange[0] || progress > f.progressRange[1]) return false;
    return true;
  });

  result = sortGames(result, f.sortBy, f.sortDir);
  return result;
}

export function sortGames(games, sortBy = 'lastPlayed', dir = 'desc') {
  const sorted = [...games].sort((a, b) => {
    let av, bv;
    switch (sortBy) {
      case 'progress':  av = computeProgress(a); bv = computeProgress(b); break;
      case 'playtime':  av = a.playtime; bv = b.playtime; break;
      case 'lastPlayed': av = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
                          bv = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0; break;
      case 'title':
      default:          av = a.title.toLowerCase(); bv = b.title.toLowerCase();
    }
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}
