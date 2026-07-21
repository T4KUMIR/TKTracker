/**
 * Sidebar.js — primary navigation. Links use #hash routing (see router.js).
 */
const NAV_ITEMS = [{
        section: 'General',
        links: [
            { route: '#/dashboard', label: 'Dashboard', icon: '🏠' },
            { route: '#/library', label: 'Biblioteca', icon: '📚' },
            { route: '#/achievements', label: 'Logros', icon: '🏆' },
            { route: '#/profile', label: 'Perfil', icon: '👤' },
        ]
    },
    {
        section: 'Sincronización',
        links: [
            { route: '#/sync/steam', label: 'Steam', icon: '🟦' },
            { route: '#/sync/ps3', label: 'PS3', icon: '🎮' },
            { route: '#/sync/epic', label: 'Epic Games', icon: '⬛' },
            { route: '#/sync/xbox', label: 'Xbox (próximamente)', icon: '🟩' },
            { route: '#/sync/switch', label: 'Switch (próximamente)', icon: '🟥' },
        ]
    },
];

/** @param {string} currentRoute e.g. "#/dashboard" */
export function Sidebar(currentRoute) {
    return `
    <aside class="sidebar glass">
      <div class="brand">
        <div class="brand-mark">UA</div>
        <div class="brand-name">Universal<br>Achievement<br><small>TRACKER</small></div>
      </div>

      ${NAV_ITEMS.map((group) => `
        <nav class="nav-group">
          <div class="nav-label">${group.section}</div>
          ${group.links.map((link) => `
            <a class="nav-link ${currentRoute === link.route ? 'active' : ''}" href="${link.route}">
              <span>${link.icon}</span>${link.label}
            </a>
          `).join('')}
        </nav>
      `).join('')}

      <div class="sidebar-footer">
        Universal Achievement Tracker<br>v1.0 · antes «TrofeosApp»
      </div>
    </aside>
  `;
}