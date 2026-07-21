/**
 * platformService.js
 * -----------------------------------------------------------------------
 * Registry that exposes every platform adapter behind one interface, so
 * the UI never needs to know which platform it's talking to. Adding a
 * new platform (Xbox, Switch, ...) means writing one adapter file with a
 * `sync()` method and registering it here — nothing else in the app
 * needs to change. This is the extension point requested for "arquitectura
 * preparada para Xbox y Nintendo Switch".
 * -----------------------------------------------------------------------
 */
import { Platform } from '../data/model.js';
import { steamService } from './steamService.js';
import { epicService } from './epicService.js';

/**
 * A stub adapter for platforms without a live integration yet.
 * Keeps the registry shape consistent and gives a clear UX message.
 */
function stubAdapter(platformName) {
  return {
    isConfigured: () => false,
    async fetchLibrary() {
      throw new Error(`La sincronización con ${platformName} aún no está disponible. Próximamente.`);
    },
  };
}

export const platformRegistry = {
  [Platform.STEAM]: steamService,
  [Platform.EPIC]: epicService,
  [Platform.XBOX]: stubAdapter('Xbox'),
  [Platform.SWITCH]: stubAdapter('Nintendo Switch'),
  // PS3/PS4/PS5 continue to use the legacy manual-entry / CSV import
  // flow from the original TrofeosApp — see PlayStation import in Sidebar.
};

export function getAdapter(platform) {
  return platformRegistry[platform] ?? null;
}
