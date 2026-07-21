/**
 * SearchBar.js — text search input. Returns markup; the page wires
 * up the debounced 'input' listener (see LibraryPage.js) so this stays
 * a pure render function.
 */
import { escapeHtml } from '../utils/helpers.js';

export function SearchBar(value = '') {
    return `
    <div class="search-bar glass">
      <span aria-hidden="true">🔍</span>
      <input
        type="search"
        id="search-input"
        placeholder="Buscar juego por nombre..."
        value="${escapeHtml(value)}"
        aria-label="Buscar juego"
      >
    </div>
  `;
}