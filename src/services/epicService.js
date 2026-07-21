/**
 * epicService.js
 * -----------------------------------------------------------------------
 * Epic Games Store has no public achievements API for third-party apps.
 * Until Epic ships one (or exposes it via their dev portal), this
 * adapter supports manual JSON import so users can still track Epic
 * games. The `normalize()` function is the seam where a future official
 * API integration would plug in — everything else stays the same.
 * -----------------------------------------------------------------------
 */
import { createUniversalGame, createUniversalAchievement, Platform, GameStatus } from '../data/model.js';

export const epicService = {
  /**
   * Accepts a user-provided JSON export (see docs/epic-import-format.json)
   * and normalizes it into Universal Game Model entries.
   * Expected shape per entry:
   * { title, cover?, playtimeHours, achievementsUnlocked, achievementsTotal,
   *   status?, favorite?, lastPlayed?, achievements?: [{name, unlocked, description}] }
   */
  parseImport(jsonText) {
    let raw;
    try {
      raw = JSON.parse(jsonText);
    } catch {
      throw new Error('JSON inválido. Revisa el formato del archivo de importación.');
    }
    if (!Array.isArray(raw)) {
      throw new Error('El JSON de Epic debe ser un array de juegos.');
    }
    return raw.map((entry) => this.normalize(entry));
  },

  normalize(entry) {
    const total = entry.achievementsTotal ?? entry.achievements?.length ?? 0;
    const unlocked = entry.achievementsUnlocked ?? (entry.achievements?.filter((a) => a.unlocked).length ?? 0);
    const progress = total ? Math.round((unlocked / total) * 100) : (entry.progress ?? 0);

    return createUniversalGame({
      id: `epic-${(entry.title || 'game').toLowerCase().replace(/\s+/g, '-')}`,
      title: entry.title,
      platform: Platform.EPIC,
      cover: entry.cover ?? '',
      playtime: entry.playtimeHours ?? 0,
      status: entry.status ?? (progress >= 100 ? GameStatus.COMPLETED : GameStatus.PENDING),
      favorite: entry.favorite ?? false,
      lastPlayed: entry.lastPlayed ?? null,
      progress,
      achievements: {
        unlocked, total,
        list: (entry.achievements ?? []).map((a) => createUniversalAchievement({
          name: a.name, description: a.description, unlocked: a.unlocked,
        })),
      },
    });
  },
};
