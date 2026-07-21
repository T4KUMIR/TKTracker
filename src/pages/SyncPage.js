/**
 * SyncPage.js — one page, four platforms. Steam Web API sync, Epic manual
 * JSON import, and Xbox/Switch "coming soon" placeholders that already
 * point at the registered (but stubbed) adapters in platformService.js.
 */
import { dataService } from '../services/dataService.js';
import { getAdapter } from '../services/platformService.js';
import { epicService } from '../services/epicService.js';
import { playstationService } from '../services/playstationService.js';
import { Platform, PLATFORM_META } from '../data/model.js';

const COPY = {
    [Platform.STEAM]: {
        title: 'Sincronizar con Steam',
        body: 'Introduce tu SteamID64 para importar tu biblioteca y logros a través de la Steam Web API (requiere configurar un proxy — ver src/services/steamService.js).',
    },
    [Platform.PS3]: {
        title: 'Importar desde PS3',
        body: 'Pega aquí un JSON con tus juegos de PS3. Puedes usar el formato de ejemplo para importar tu colección y trofeos.',
    },
    [Platform.EPIC]: {
        title: 'Importar desde Epic Games',
        body: 'Epic no ofrece una API pública de logros para terceros. Pega aquí un JSON exportado manualmente para añadir tus juegos de Epic.',
    },
    [Platform.XBOX]: {
        title: 'Xbox — próximamente',
        body: 'La arquitectura ya está lista (ver platformService.js). En cuanto exista un adaptador para Xbox Live, aparecerá aquí sin cambios en el resto de la app.',
    },
    [Platform.SWITCH]: {
        title: 'Nintendo Switch — próximamente',
        body: 'Igual que Xbox: el registro de plataformas ya reserva un lugar para Switch, listo para un futuro adaptador.',
    },
};

/** @param {{platform: string}} params from the router */
export function SyncPage(params) {
    const platform = params.platform;
    const copy = COPY[platform] ?? { title: 'Plataforma desconocida', body: '' };
    const steamAdapter = getAdapter(Platform.STEAM);

    return `
    <div class="page-header">
      <div><span class="eyebrow">${PLATFORM_META[platform]?.label ?? ''}</span><h1>${copy.title}</h1></div>
    </div>

    <section class="section glass" style="padding:26px; border-radius:var(--radius-lg); max-width:560px;">
      <p style="margin-bottom:18px;">${copy.body}</p>

      ${platform === Platform.STEAM ? SteamForm(steamAdapter.isConfigured()) : ''}
      ${platform === Platform.PS3 ? PlayStationForm() : ''}
      ${platform === Platform.EPIC ? EpicForm() : ''}
      ${(platform === Platform.XBOX || platform === Platform.SWITCH)
        ? `<button class="btn btn-ghost" disabled>Sincronización no disponible</button>` : ''}

      <div id="sync-status" role="status" aria-live="polite" style="margin-top:14px; font-size:13px; color:var(--text-secondary);"></div>
    </section>
  `;
}

function SteamForm(isConfigured) {
  return `
    <form id="steam-sync-form" style="display:flex; gap:10px; flex-wrap:wrap;">
      <input name="steamId" placeholder="SteamID64 (ej: 76561198012345678)" class="chip" style="flex:1; min-width:220px; text-align:left;">
      <button type="submit" class="btn btn-primary" ${!isConfigured ? 'disabled' : ''}>Sincronizar</button>
      ${!isConfigured ? '<div style="width:100%; margin-top:10px; color:var(--warning);">Configura PROXY_BASE en src/services/steamService.js antes de sincronizar.</div>' : ''}
    </form>
  `;
}

function EpicForm() {
  return `
    <form id="epic-import-form">
      <textarea name="json" placeholder='[{"title":"Fortnite","playtimeHours":120,"achievementsUnlocked":50,"achievementsTotal":100}]'></textarea>
      <button type="submit" class="btn btn-primary">Importar JSON</button>
    </form>
  `;
}

function PlayStationForm() {
  return `
    <form id="ps3-import-form">
      <textarea name="json" placeholder='[{"title":"Demon\'s Souls","cover":"https://example.com/demonsouls.jpg","playtimeHours":120,"status":"playing","favorite":false,"lastPlayed":"2026-07-18T12:00:00Z","achievementsUnlocked":12,"achievementsTotal":30,"achievements":[{"name":"Comienza la aventura","description":"Completa el tutorial","unlocked":true,"unlockedAt":"2026-07-17T16:00:00Z","rarity":"common","rarityPercent":85}]}]'></textarea>
      <button type="submit" class="btn btn-primary">Importar JSON de PS3</button>
    </form>
  `;
}

SyncPage.attachEvents = function attachEvents(root, rerender) {
  const status = root.querySelector('#sync-status');

  root.querySelector('#steam-sync-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const steamId = new FormData(e.target).get('steamId')?.trim();
    const adapter = getAdapter(Platform.STEAM);
    if (!adapter.isConfigured()) {
      status.textContent = '⚠️ Configura PROXY_BASE en steamService.js antes de sincronizar (la Steam Web API no permite llamadas directas desde el navegador).';
      status.style.color = 'var(--warning)';
      return;
    }
    status.textContent = 'Sincronizando...';
    try {
      const games = await adapter.fetchLibrary(steamId);
      dataService.upsertMany(games);
      status.textContent = `✅ ${games.length} juegos sincronizados.`;
      status.style.color = 'var(--success)';
    } catch (err) {
      status.textContent = `❌ ${err.message}`;
      status.style.color = 'var(--danger)';
    }
  });

  root.querySelector('#epic-import-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const json = new FormData(e.target).get('json');
    try {
      const games = epicService.parseImport(json);
      dataService.upsertMany(games);
      status.textContent = `✅ ${games.length} juegos importados desde Epic.`;
      status.style.color = 'var(--success)';
    } catch (err) {
      status.textContent = `❌ ${err.message}`;
      status.style.color = 'var(--danger)';
    }
  });

  root.querySelector('#ps3-import-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const json = new FormData(e.target).get('json');
    try {
      const games = playstationService.parseImport(json);
      dataService.upsertMany(games);
      status.textContent = `✅ ${games.length} juegos importados desde PS3.`;
      status.style.color = 'var(--success)';
    } catch (err) {
      status.textContent = `❌ ${err.message}`;
      status.style.color = 'var(--danger)';
    }
  });
};