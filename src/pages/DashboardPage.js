/**
 * DashboardPage.js — wires dataService + profile info into the Dashboard component.
 */
import { Dashboard } from '../components/Dashboard.js';
import { ProfileCard } from '../components/ProfileCard.js';
import { dataService } from '../services/dataService.js';
import { profileService } from '../services/profileService.js';

import { escapeHtml } from '../utils/helpers.js';

export function DashboardPage() {
    const stats = dataService.getGlobalStats();
    const profile = profileService.getProfile();

    return `
    <div class="page-header">
      <div>
        <span class="eyebrow">Hola de nuevo</span>
        <h1>${escapeHtml(profile.name)}</h1>
      </div>
    </div>

    <div class="section">${ProfileCard(profile, stats)}</div>

    ${Dashboard({
      stats,
      recent: dataService.getRecentlyPlayed(),
      favorites: dataService.getFavorites(),
      nearCompletion: dataService.getNearCompletion(),
    })}
  `;
}