/**
 * app.js — application bootstrap. Wires the router to pages, renders the
 * persistent Sidebar, and re-renders on both route changes and data
 * changes (via dataService.subscribe).
 */
import { Sidebar } from './components/Sidebar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LibraryPage } from './pages/LibraryPage.js';
import { AchievementsPage } from './pages/AchievementsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SyncPage } from './pages/SyncPage.js';
import { createRouter } from './utils/router.js';
import { dataService } from './services/dataService.js';

const appRoot = document.getElementById('app');

const router = createRouter()
    .add('#/dashboard', DashboardPage)
    .add('#/library', LibraryPage)
    .add('#/achievements', AchievementsPage)
    .add('#/profile', ProfilePage)
    .add('#/sync/:platform', SyncPage);

let currentRender = { fn: DashboardPage, params: {} };

function closeActiveModal() {
    const modalRoot = document.querySelector('#modal-root');
    if (modalRoot && modalRoot.innerHTML.trim()) {
        modalRoot.innerHTML = '';
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeActiveModal();
    }
});

function render() {
    const sidebarHtml = Sidebar(router.current());
    const pageHtml = currentRender.fn(currentRender.params);

    appRoot.innerHTML = `
    <div class="app-shell">
      ${sidebarHtml}
      <main class="app-main">${pageHtml}</main>
    </div>
  `;

    // Each page may expose an optional attachEvents(root, rerender) hook
    // for interactivity (search, filters, forms) — event delegation keeps
    // this framework-free and cheap to re-run on every render.
    if (typeof currentRender.fn.attachEvents === 'function') {
        currentRender.fn.attachEvents(appRoot, render);
    }
}

router.onChange((path, renderFn, params) => {
    currentRender = { fn: renderFn, params };
    render();
});

// Re-render whenever the underlying game library changes (sync, favorites,
// filters) so every open page always reflects the latest data.
dataService.subscribe(() => render());

router.start();