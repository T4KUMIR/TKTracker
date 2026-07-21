/**
 * LibraryPage.js — Requisitos funcionales #2 (biblioteca) y #5 (filtros).
 * Renders markup; LibraryPage.attachEvents() wires up interactivity
 * (called once by app.js after each render).
 */
import { GameCard } from '../components/GameCard.js';
import { SearchBar } from '../components/SearchBar.js';
import { GameDetailModal } from '../components/GameDetailModal.js';
import { dataService } from '../services/dataService.js';
import { applyFilters, DEFAULT_FILTERS } from '../utils/filters.js';
import { debounce, computeProgress } from '../utils/helpers.js';
import { Platform, GameStatus, PLATFORM_META, STATUS_META } from '../data/model.js';

let filters = {...DEFAULT_FILTERS };
let selectedTab = 'all';

const STATUS_TABS = [
    { key: 'all', label: 'Todos' },
    { key: GameStatus.PENDING, label: 'Pendiente' },
    { key: GameStatus.PLAYING, label: 'Jugando' },
    { key: GameStatus.COMPLETED, label: 'Terminado' },
    { key: 'platinum', label: 'Platino' },
];

export function LibraryPage() {
    const stats = dataService.getGlobalStats();
    const allLibrary = dataService.getAll();
    const allGames = applyFilters(allLibrary, filters);
    const counts = {
        all: allLibrary.length,
        [GameStatus.PENDING]: allLibrary.filter((game) => game.status === GameStatus.PENDING).length,
        [GameStatus.PLAYING]: allLibrary.filter((game) => game.status === GameStatus.PLAYING).length,
        [GameStatus.COMPLETED]: allLibrary.filter((game) => game.status === GameStatus.COMPLETED).length,
        platinum: allLibrary.filter((game) => computeProgress(game) === 100).length,
    };
    const games = selectedTab === 'all' ?
        allGames :
        selectedTab === 'platinum' ?
        allGames.filter((game) => computeProgress(game) === 100) :
        allGames.filter((game) => game.status === selectedTab);

    return `
    <div class="page-header">
      <div>
        <span class="eyebrow">Tu colección</span>
        <h1>Biblioteca</h1>
      </div>
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        ${SearchBar(filters.query)}
        <button id="add-game-btn" class="btn btn-primary">Agregar juego</button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="stat-card glass">
        <div class="value">${stats.total}</div>
        <div class="label">Juegos totales</div>
      </div>
      <div class="stat-card glass">
        <div class="value">${stats.completed}</div>
        <div class="label">Juegos terminados</div>
      </div>
      <div class="stat-card glass">
        <div class="value">${counts.platinum}</div>
        <div class="label">Platino conseguido</div>
      </div>
      <div class="stat-card glass">
        <div class="value">${stats.achievementsUnlocked}</div>
        <div class="label">Trofeos obtenidos</div>
      </div>
    </div>

    <div class="status-tabs">
      ${STATUS_TABS.map((tab) => `
        <button class="tab-button ${selectedTab === tab.key ? 'active' : ''}" data-tab="${tab.key}">
          ${tab.key === 'all' ? `Todos (${counts.all})` : tab.key === 'platinum' ? `Platino (${counts.platinum})` : `${tab.label} (${counts[tab.key]})`}
        </button>
      `).join('')}
    </div>

    <div class="filter-bar">
      <button class="chip ${!filters.platform ? 'active' : ''}" data-filter="platform" data-value="">Todas las plataformas</button>
      ${Object.values(Platform).map((p) => `
        <button class="chip ${filters.platform === p ? 'active' : ''}" data-filter="platform" data-value="${p}">
          ${PLATFORM_META[p].label}
        </button>
      `).join('')}
    </div>

    <div class="filter-bar">
      <button class="chip ${!filters.status ? 'active' : ''}" data-filter="status" data-value="">Todos los estados</button>
      ${Object.values(GameStatus).map((s) => `
        <button class="chip ${filters.status === s ? 'active' : ''}" data-filter="status" data-value="${s}">
          ${STATUS_META[s].label}
        </button>
      `).join('')}
      <button class="chip ${filters.onlyFavorites ? 'active' : ''}" data-filter="favorites">★ Favoritos</button>

      <select class="chip" id="sort-select" style="margin-left:auto;">
        <option value="lastPlayed" ${filters.sortBy === 'lastPlayed' ? 'selected' : ''}>Jugado recientemente</option>
        <option value="progress" ${filters.sortBy === 'progress' ? 'selected' : ''}>Progreso</option>
        <option value="playtime" ${filters.sortBy === 'playtime' ? 'selected' : ''}>Horas jugadas</option>
        <option value="title" ${filters.sortBy === 'title' ? 'selected' : ''}>Nombre (A-Z)</option>
      </select>
    </div>

    <div class="section">
      ${games.length
        ? `<div class="grid-cards">${games.map((g, i) => GameCard(g, i)).join('')}</div>`
        : `<div class="empty-state">No se encontraron juegos con estos filtros. Prueba a cambiarlos.</div>`}
    </div>

    <div id="modal-root"></div>
  `;
}

function AddGameModal() {
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal glass" role="dialog" aria-modal="true" aria-label="Añadir juego" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>Añadir juego</h3>
            <p style="margin:4px 0 0; color:var(--text-secondary); font-size:13px;">Agrega un título y una portada para tu juego.</p>
          </div>
          <button class="btn-ghost btn" data-action="close-modal" aria-label="Cerrar">✕</button>
        </div>
        <form id="add-game-form" class="modal-form">
          <input name="title" placeholder="Título del juego" required class="modal-input">
          <input name="cover" placeholder="URL de la imagen de portada" class="modal-input">
          <div class="modal-grid-2">
            <select name="platform" required class="modal-input">
              ${Object.values(Platform).map((p) => `<option value="${p}">${PLATFORM_META[p].label}</option>`).join('')}
            </select>
            <select name="status" required class="modal-input">
              ${Object.values(GameStatus).map((s) => `<option value="${s}">${STATUS_META[s].label}</option>`).join('')}
            </select>
          </div>
          <div class="modal-grid-2">
            <input name="playtime" type="number" min="0" step="1" placeholder="Horas jugadas" class="modal-input">
            <input name="lastPlayed" type="date" placeholder="Última vez jugado" class="modal-input">
          </div>
          <div class="modal-grid-2">
            <input name="achievementsUnlocked" type="number" min="0" placeholder="Logros obtenidos" class="modal-input">
            <input name="achievementsTotal" type="number" min="0" placeholder="Total de logros" class="modal-input">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Agregar juego</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/** Attach event delegation for the library page. Call once after each render. */
LibraryPage.attachEvents = function attachEvents(root, rerender) {
  const searchInput = root.querySelector('#search-input');
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    searchInput.addEventListener('input', debounce((e) => {
      filters = { ...filters, query: e.target.value };
      rerender();
    }, 200));
  }

  root.querySelectorAll('[data-filter="platform"], [data-filter="status"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      filters = { ...filters, [key]: btn.dataset.value || null };
      rerender();
    });
  });

  const favBtn = root.querySelector('[data-filter="favorites"]');
  favBtn?.addEventListener('click', () => {
    filters = { ...filters, onlyFavorites: !filters.onlyFavorites };
    rerender();
  });

  root.querySelector('#sort-select')?.addEventListener('change', (e) => {
    filters = { ...filters, sortBy: e.target.value };
    rerender();
  });

  root.querySelectorAll('.tab-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedTab = btn.dataset.tab;
      rerender();
    });
  });

  const addGameBtn = root.querySelector('#add-game-btn');
  const modalRoot = root.querySelector('#modal-root');
  addGameBtn?.addEventListener('click', () => {
    if (!modalRoot) return;
    modalRoot.innerHTML = AddGameModal();
    const form = modalRoot.querySelector('#add-game-form');

    modalRoot.querySelectorAll('[data-action="close-modal"]').forEach((el) => {
      el.addEventListener('click', () => {
        modalRoot.innerHTML = '';
      });
    });

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const title = formData.get('title')?.toString().trim();
      if (!title) return;

      const playtime = Number(formData.get('playtime')) || 0;
      const unlocked = Number(formData.get('achievementsUnlocked')) || 0;
      const total = Math.max(Number(formData.get('achievementsTotal')) || 0, unlocked);
      const lastPlayedValue = formData.get('lastPlayed')?.toString().trim();

      dataService.add({
        title,
        cover: formData.get('cover')?.toString().trim() ?? '',
        platform: formData.get('platform')?.toString() || Platform.STEAM,
        status: formData.get('status')?.toString() || GameStatus.PENDING,
        playtime,
        lastPlayed: lastPlayedValue ? new Date(lastPlayedValue).toISOString() : null,
        achievements: {
          unlocked,
          total,
          list: [],
        },
      });

      modalRoot.innerHTML = '';
    });
  });

  root.querySelectorAll('[data-action="toggle-favorite"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dataService.toggleFavorite(btn.dataset.gameId);
      rerender();
    });
  });

  root.addEventListener('keydown', (event) => {
    const card = event.target.closest('.game-card');
    if (!card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.click();
    }
  });

  root.querySelectorAll('.game-card').forEach((card) => {
    card.addEventListener('click', () => {
      const game = dataService.getById(card.dataset.gameId);
      if (!game) return;
      const modalRoot = root.querySelector('#modal-root');
      modalRoot.innerHTML = GameDetailModal(game);
      modalRoot.querySelectorAll('[data-action="close-modal"]').forEach((el) => {
        el.addEventListener('click', () => { modalRoot.innerHTML = ''; });
      });

      modalRoot.querySelector('[data-action="delete-game"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar "${game.title}" de tu biblioteca?`)) {
          dataService.remove(game.id);
          modalRoot.innerHTML = '';
        }
      });
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });
};