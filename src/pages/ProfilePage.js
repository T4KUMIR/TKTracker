/**
 * ProfilePage.js — Requisito funcional #3: perfil del jugador, editable.
 */
import { ProfileCard } from '../components/ProfileCard.js';
import { StatsPanel } from '../components/StatsPanel.js';
import { DonutChart } from '../components/Charts.js';
import { profileService } from '../services/profileService.js';
import { dataService } from '../services/dataService.js';
import { PLATFORM_META } from '../data/model.js';
import { escapeHtml } from '../utils/helpers.js';

export function ProfilePage() {
    const profile = profileService.getProfile();
    const stats = dataService.getGlobalStats();

    return `
    <div class="page-header">
      <div><span class="eyebrow">Tu identidad</span><h1>Perfil</h1></div>
    </div>

    <div class="section">${ProfileCard(profile, stats)}</div>

    <section class="section glass" style="padding:22px; border-radius:var(--radius-lg);">
      <h2 class="section-title">Editar perfil</h2>
      <form id="profile-form" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <input name="name" value="${escapeHtml(profile.name)}" placeholder="Nombre" class="chip" style="flex:1; min-width:180px; text-align:left;">
        <input name="avatar" value="${escapeHtml(profile.avatar)}" placeholder="URL del avatar" class="chip" style="flex:2; min-width:220px; text-align:left;">
        <button type="submit" class="btn btn-primary">Guardar</button>
      </form>
    </section>

    <section class="section glass" style="padding:24px; border-radius:var(--radius-lg);">
      <h2 class="section-title">Distribución por plataforma</h2>
      ${stats.total > 0
        ? DonutChart(
            Object.entries(stats.byPlatform)
              .filter(([, count]) => count > 0)
              .map(([platform, count]) => ({ label: PLATFORM_META[platform].label, value: count, color: PLATFORM_META[platform].color })),
            { centerLabel: String(stats.total), centerSub: 'juegos' },
          )
        : '<div class="empty-state">Sin juegos todavía.</div>'}
    </section>

    <section class="section">
      <h2 class="section-title">Estadísticas globales</h2>
      ${StatsPanel(stats)}
    </section>
  `;
}

ProfilePage.attachEvents = function attachEvents(root, rerender) {
  root.querySelector('#profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    profileService.updateProfile({
      name: data.get('name')?.trim() || 'Jugador',
      avatar: data.get('avatar')?.trim() || '',
    });
    rerender();
  });
};