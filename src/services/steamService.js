/**
 * steamService.js
 * -----------------------------------------------------------------------
 * Adapter that normalizes Steam Web API responses into the Universal
 * Game Model. The Steam Web API has NO CORS headers, so browser code
 * cannot call it directly — this service is written to talk to a small
 * proxy endpoint you control (e.g. a Cloudflare Worker / Node function)
 * that forwards to Steam and injects your STEAM_API_KEY server-side.
 * Never ship a Steam API key in frontend code.
 *
 * Expected proxy contract (you implement the server side):
 *   GET {PROXY_BASE}/steam/games?steamId=...     -> IPlayerService/GetOwnedGames
 *   GET {PROXY_BASE}/steam/achievements?steamId=...&appId=... -> ISteamUserStats/GetPlayerAchievements
 *   GET {PROXY_BASE}/steam/schema?appId=...       -> ISteamUserStats/GetSchemaForGame (names/icons/rarity)
 * -----------------------------------------------------------------------
 */
import { createUniversalGame, createUniversalAchievement, Platform, GameStatus, rarityFromPercent } from '../data/model.js';

const PROXY_BASE = ''; // e.g. 'https://your-proxy.example.workers.dev' — set before enabling sync

function statusFromPlaytime(playtimeHours, achievementsPercent) {
  if (achievementsPercent >= 100) return GameStatus.COMPLETED;
  if (playtimeHours === 0) return GameStatus.PENDING;
  return GameStatus.PLAYING;
}

export const steamService = {
  isConfigured() {
    return Boolean(PROXY_BASE);
  },

  /**
   * Fetch the full owned-games library for a Steam user and normalize it.
   * @param {string} steamId 64-bit Steam ID
   * @returns {Promise<UniversalGame[]>}
   */
  async fetchLibrary(steamId) {
    if (!this.isConfigured()) {
      throw new Error('steamService: configura PROXY_BASE antes de sincronizar con Steam.');
    }

    const res = await fetch(`${PROXY_BASE}/steam/games?steamId=${encodeURIComponent(steamId)}`);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const { games: ownedGames } = await res.json();

    // Fetch achievement summaries in parallel, but normalize failures per-game
    // so one broken app (e.g. achievements disabled) doesn't break the sync.
    const results = await Promise.allSettled(
      ownedGames.map((g) => this.fetchGameWithAchievements(steamId, g)),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);
  },

  async fetchGameWithAchievements(steamId, steamGame) {
    const playtimeHours = Math.round((steamGame.playtime_forever ?? 0) / 60);
    let unlocked = 0, total = 0, list = [];

    try {
      const res = await fetch(
        `${PROXY_BASE}/steam/achievements?steamId=${encodeURIComponent(steamId)}&appId=${steamGame.appid}`,
      );
      if (res.ok) {
        const data = await res.json();
        const achievements = data.playerstats?.achievements ?? [];
        total = achievements.length;
        unlocked = achievements.filter((a) => a.achieved === 1).length;
        list = achievements.map((a) =>
          createUniversalAchievement({
            gameId: String(steamGame.appid),
            name: a.name,
            unlocked: a.achieved === 1,
            unlockedAt: a.unlocktime ? new Date(a.unlocktime * 1000).toISOString() : null,
            rarity: rarityFromPercent(a.globalPercent ?? 100),
            rarityPercent: a.globalPercent ?? 100,
          }),
        );
      }
    } catch {
      // Achievements can be disabled/private for a given game — non-fatal.
    }

    const progress = total ? Math.round((unlocked / total) * 100) : 0;

    return createUniversalGame({
      id: `steam-${steamGame.appid}`,
      title: steamGame.name,
      platform: Platform.STEAM,
      cover: `https://cdn.akamai.steamstatic.com/steam/apps/${steamGame.appid}/library_600x900.jpg`,
      playtime: playtimeHours,
      status: statusFromPlaytime(playtimeHours, progress),
      progress,
      lastPlayed: steamGame.rtime_last_played
        ? new Date(steamGame.rtime_last_played * 1000).toISOString()
        : null,
      achievements: { unlocked, total, list },
    });
  },
};
