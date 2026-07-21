/**
 * playstationService.js
 * -----------------------------------------------------------------------
 * Manual PS3 import adapter. PS3 no tiene API pública moderna para
 * sincronizar desde el navegador, así que esta implementación acepta
 * un JSON sencillo que normaliza tus juegos y trofeos a la forma universal.
 * -----------------------------------------------------------------------
 */
import { createUniversalGame, createUniversalAchievement, Platform, GameStatus, rarityFromPercent } from '../data/model.js';

export const playstationService = {
    parseImport(jsonText) {
        let raw;
        try {
            raw = JSON.parse(jsonText);
        } catch {
            throw new Error('JSON inválido. Revisa el formato del archivo de importación.');
        }

        if (!Array.isArray(raw)) {
            throw new Error('El JSON de PS3 debe ser un array de juegos.');
        }

        return raw.map((entry) => this.normalize(entry));
    },

    normalize(entry) {
        const total = entry.achievementsTotal ?? entry.achievements?.length ?? 0;
        const unlocked = entry.achievementsUnlocked ?? (entry.achievements?.filter((a) => a.unlocked).length ?? 0);
        const progress = total ? Math.round((unlocked / total) * 100) : (entry.progress ?? 0);

        return createUniversalGame({
            id: entry.id ?? `ps3-${(entry.title || 'juego').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
            title: entry.title,
            platform: Platform.PS3,
            cover: entry.cover ?? '',
            playtime: entry.playtimeHours ?? 0,
            status: entry.status ?? (progress >= 100 ? GameStatus.COMPLETED : GameStatus.PENDING),
            favorite: entry.favorite ?? false,
            lastPlayed: entry.lastPlayed ?? null,
            progress,
            achievements: {
                unlocked,
                total,
                list: (entry.achievements ?? []).map((a) => createUniversalAchievement({
                    name: a.name,
                    description: a.description,
                    unlocked: a.unlocked,
                    unlockedAt: a.unlockedAt ?? a.dateUnlocked ?? null,
                    rarity: a.rarity ?? rarityFromPercent(a.rarityPercent ?? 100),
                    rarityPercent: a.rarityPercent ?? 100,
                })),
            },
        });
    },
};