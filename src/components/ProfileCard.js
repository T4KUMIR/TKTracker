/**
 * ProfileCard.js — player identity header used on the Dashboard/Profile page.
 * Level is derived client-side from total achievements (simple, tweakable formula).
 */
import { formatPlaytime, escapeHtml } from '../utils/helpers.js';
import { RadialProgress } from './Charts.js';

function levelFromAchievements(totalUnlocked) {
    return Math.max(1, Math.floor(totalUnlocked / 15) + 1);
}

/**
 * @param {{name: string, avatar: string}} profile
 * @param {{completed: number, achievementsUnlocked: number, totalPlaytime: number, globalProgress?: number}} stats
 */
export function ProfileCard(profile, stats) {
    const level = levelFromAchievements(stats.achievementsUnlocked);

    return `
    <div class="profile-card glass animate-in">
      <div class="profile-avatar">
        <img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}"
             onerror="this.src='https://placehold.co/160x160/10162b/00d4ff?text=${encodeURIComponent(profile.name[0] || 'U')}'">
      </div>
      <div>
        <div class="profile-name">${escapeHtml(profile.name)}</div>
        <div class="profile-level">NIVEL ${level} · ${stats.achievementsUnlocked} LOGROS</div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="value">${stats.completed}</div>
          <div class="label">Completados</div>
        </div>
        <div class="profile-stat">
          <div class="value">${stats.achievementsUnlocked}</div>
          <div class="label">Logros</div>
        </div>
        <div class="profile-stat">
          <div class="value">${formatPlaytime(stats.totalPlaytime)}</div>
          <div class="label">Jugado</div>
        </div>
      </div>
      ${typeof stats.globalProgress === 'number' ? `
        <div style="margin-left:20px;">
          ${RadialProgress(stats.globalProgress, { size: 76, thickness: 8, label: 'Progreso' })}
        </div>
      ` : ''}
    </div>
  `;
}