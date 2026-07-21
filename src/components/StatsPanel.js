/**
 * StatsPanel.js — grid of headline global stats (Requisito funcional #4).
 */
import { formatPlaytime } from '../utils/helpers.js';

/** @param {ReturnType<import('../services/dataService.js').dataService.getGlobalStats>} stats */
export function StatsPanel(stats) {
  const cards = [
    { label: 'Juegos totales', value: stats.total, icon: '🎮' },
    { label: 'Completados', value: stats.completed, icon: '✅' },
    { label: 'Logros desbloqueados', value: `${stats.achievementsUnlocked}/${stats.achievementsTotal}`, icon: '🏆' },
    { label: 'Progreso global', value: `${stats.globalProgress}%`, icon: '📈' },
    { label: 'Tiempo total jugado', value: formatPlaytime(stats.totalPlaytime), icon: '⏱' },
  ];

  return `
    <div class="stats-grid">
      ${cards.map((c) => `
        <div class="stat-card glass animate-in">
          <div class="value">${c.value}</div>
          <div class="label">${c.label}</div>
          <div class="icon-bg">${c.icon}</div>
        </div>
      `).join('')}
    </div>
  `;
}
