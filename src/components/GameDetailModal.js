/**
 * GameDetailModal.js — full achievement breakdown for one game, opened
 * when a GameCard is clicked. Closed via backdrop click or the × button.
 */
import { AchievementCard } from './AchievementCard.js';
import { PlatformBadge } from './PlatformBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { formatPlaytime, computeProgress, escapeHtml } from '../utils/helpers.js';

/** @param {UniversalGame} game */
export function GameDetailModal(game) {
    const progress = computeProgress(game);
    const achievements = game.achievements.list;

    return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal glass" role="dialog" aria-modal="true" aria-label="Detalles del juego" style="width:min(560px,92vw); max-height:82vh; overflow:auto;" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
          <div>
            ${PlatformBadge(game.platform)}
            <h3 style="margin-top:10px; font-size:20px;">${escapeHtml(game.title)}</h3>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button type="button" class="btn btn-ghost" data-action="delete-game">Eliminar juego</button>
            <button type="button" class="btn-ghost btn" data-action="close-modal" aria-label="Cerrar">✕</button>
          </div>
        </div>

        <div style="margin:16px 0 6px; font-size:12px; color:var(--text-secondary); font-family:var(--font-mono);">
          ⏱ ${formatPlaytime(game.playtime)} &nbsp;·&nbsp; 🏆 ${game.achievements.unlocked}/${game.achievements.total}
        </div>
        ${ProgressBar(progress, { label: 'Progreso general' })}

        <h4 style="margin:22px 0 10px; font-size:14px; color:var(--text-secondary);">Logros</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${achievements.length
            ? achievements.map(AchievementCard).join('')
            : '<div class="empty-state">Sin datos de logros individuales para este juego todavía.</div>'}
        </div>
      </div>
    </div>
  `;
}