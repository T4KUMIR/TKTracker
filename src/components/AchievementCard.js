/**
 * AchievementCard.js — a single achievement row, colored by rarity tier.
 */
import { RARITY_META } from '../data/model.js';
import { formatDate, escapeHtml } from '../utils/helpers.js';

const RARITY_ICON = { common: '🥉', rare: '🥈', epic: '🥇', legendary: '💎' };

/** @param {UniversalAchievement} achievement */
export function AchievementCard(achievement) {
  const meta = RARITY_META[achievement.rarity] ?? RARITY_META.common;
  const lockedClass = achievement.unlocked ? '' : 'locked';

  return `
    <div class="achievement-card glass ${lockedClass}" style="--ra-color:${meta.color}">
      <div class="achievement-icon">${achievement.icon || RARITY_ICON[achievement.rarity] || '🏆'}</div>
      <div>
        <div class="achievement-name">${escapeHtml(achievement.name)}</div>
        ${achievement.description ? `<div class="achievement-desc">${escapeHtml(achievement.description)}</div>` : ''}
      </div>
      <div class="achievement-rarity">
        ${meta.label}<br>
        ${achievement.unlocked ? formatDate(achievement.unlockedAt) : 'Bloqueado'}
      </div>
    </div>
  `;
}
