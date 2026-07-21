/**
 * AchievementsPage.js — Requisito funcional #7: logros por rareza.
 */
import { AchievementCard } from '../components/AchievementCard.js';
import { BarChart } from '../components/Charts.js';
import { dataService } from '../services/dataService.js';
import { RARITY_META } from '../data/model.js';

export function AchievementsPage() {
  const grouped = dataService.getAchievementsByRarity();
  const totalAchievements = Object.values(grouped).flat().length;

  return `
    <div class="page-header">
      <div>
        <span class="eyebrow">${totalAchievements} logros registrados</span>
        <h1>Logros</h1>
      </div>
    </div>

    ${totalAchievements > 0 ? `
      <section class="section glass" style="padding:24px; border-radius:var(--radius-lg);">
        <h2 class="section-title">Logros por rareza</h2>
        ${BarChart(
          Object.entries(RARITY_META).map(([key, meta]) => ({
            key,
            label: meta.label,
            value: (grouped[key] ?? []).length,
            color: meta.color,
          })),
          { icon: (item) => `${rarityIcon(item.key)} ` },
        )}
      </section>
    ` : ''}

    ${Object.entries(RARITY_META).map(([key, meta]) => {
      const list = grouped[key] ?? [];
      return `
        <section class="section">
          <h2 class="section-title" style="color:${meta.color}">
            ${rarityIcon(key)} ${meta.label} <span style="color:var(--text-muted); font-size:13px; font-weight:400;">(${list.length})</span>
          </h2>
          ${list.length
            ? `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:10px;">
                 ${list.map(AchievementCard).join('')}
               </div>`
            : `<div class="empty-state">Sin logros de rareza "${meta.label}" todavía.</div>`}
        </section>
      `;
    }).join('')}
  `;
}

function rarityIcon(key) {
  return { common: '🥉', rare: '🥈', epic: '🥇', legendary: '💎' }[key] ?? '🏆';
}
