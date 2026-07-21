/**
 * Dashboard.js — composes the sections requested for "Dashboard principal":
 * resumen general, últimos jugados, favoritos, próximos al 100%.
 * This component only renders — DashboardPage.js owns data fetching.
 */
import { GameCard } from './GameCard.js';
import { StatsPanel } from './StatsPanel.js';

function Row(title, games, emptyMsg) {
  if (!games.length) {
    return `
      <section class="section">
        <h2 class="section-title">${title}</h2>
        <div class="empty-state">${emptyMsg}</div>
      </section>
    `;
  }
  return `
    <section class="section">
      <h2 class="section-title">${title}</h2>
      <div class="row-scroll">
        ${games.map((g, i) => `<div style="min-width:200px">${GameCard(g, i)}</div>`).join('')}
      </div>
    </section>
  `;
}

/**
 * @param {{stats: object, recent: UniversalGame[], favorites: UniversalGame[], nearCompletion: UniversalGame[]}} data
 */
export function Dashboard(data) {
  return `
    <section class="section">
      <h2 class="section-title">Resumen general</h2>
      ${StatsPanel(data.stats)}
    </section>

    ${Row('🕒 Últimos jugados', data.recent, 'Aún no hay actividad reciente. Sincroniza una plataforma para empezar.')}
    ${Row('⭐ Favoritos', data.favorites, 'Marca juegos con la estrella para verlos aquí.')}
    ${Row('🎯 Próximos al 100%', data.nearCompletion, 'Ningún juego está cerca de completarse todavía.')}
  `;
}
