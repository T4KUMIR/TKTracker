/**
 * GameCard.js — the primary library tile: cover art, progress ring/bar,
 * status pill, unlocked achievements, playtime and a favorite toggle.
 */
import { PlatformBadge } from './PlatformBadge.js';
import { STATUS_META, GameStatus } from '../data/model.js';
import { formatPlaytime, computeProgress, escapeHtml } from '../utils/helpers.js';

/**
 * @param {UniversalGame} game
 * @param {number} index used for stagger animation delay
 * @returns {string} HTML string — attach listeners via event delegation in the page
 */
export function GameCard(game, index = 0) {
    const progress = computeProgress(game);
    const status = STATUS_META[game.status] ?? STATUS_META[GameStatus.PENDING];

    return `
    <article class="game-card glass animate-in" style="--i:${index}" data-game-id="${game.id}" tabindex="0" role="button" aria-label="Abrir ${escapeHtml(game.title)}">
      <img class="game-card-cover" src="${game.cover}" alt="${escapeHtml(game.title)}" loading="lazy"
           onerror="this.src='https://placehold.co/400x560/10162b/8d97b8?text=${encodeURIComponent(game.title)}'">
      <div class="game-card-overlay"></div>

      <div class="game-card-top">
        ${PlatformBadge(game.platform)}
        <button class="fav-btn ${game.favorite ? 'active' : ''}" data-action="toggle-favorite" data-game-id="${game.id}" aria-label="Favorito" title="Marcar como favorito">
          ${game.favorite ? '★' : '☆'}
        </button>
      </div>

      <div class="game-card-body">
        <div class="status-pill" style="--st-color:${status.color}; margin-bottom:10px; display:inline-block;">${status.label}</div>
        <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
        ${ProgressBarInline(progress)}
        <div class="game-card-meta">
          <span class="trophy">🏆 ${game.achievements.unlocked}/${game.achievements.total}</span>
          <span>⏱ ${formatPlaytime(game.playtime)}</span>
        </div>
      </div>
    </article>
  `;
}

// Inline mini progress bar (avoids importing ProgressBar's label markup for card density)
function ProgressBarInline(pct) {
    const completeClass = pct >= 100 ? 'is-complete' : '';
    return `<div class="progress-bar"><div class="progress-bar-fill ${completeClass}" style="width:${pct}%"></div></div>`;
}