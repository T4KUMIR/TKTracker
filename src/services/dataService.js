/**
 * dataService.js
 * -----------------------------------------------------------------------
 * Single source of truth for the game library. Pages/components never
 * touch localStorage or platform adapters directly — they go through
 * this service, which keeps an in-memory cache and notifies subscribers
 * (a minimal pub/sub, enough for a vanilla-JS app of this size).
 * -----------------------------------------------------------------------
 */
import { storageService } from './storageService.js';
import { sampleGames } from '../data/games.sample.js';
import { computeProgress } from '../utils/helpers.js';
import { GameStatus, Platform, RARITY_META } from '../data/model.js';

const STORAGE_KEY = 'games';

let games = storageService.get(STORAGE_KEY, null) ?? sampleGames;
const subscribers = new Set();

function persist() {
    storageService.set(STORAGE_KEY, games);
}

function notify() {
    subscribers.forEach((cb) => cb(games));
}

export const dataService = {
    /** Subscribe to library changes. Returns an unsubscribe function. */
    subscribe(callback) {
        subscribers.add(callback);
        callback(games);
        return () => subscribers.delete(callback);
    },

    getAll() {
        return games;
    },

    getById(id) {
        return games.find((g) => g.id === id) ?? null;
    },

    add(game) {
        games = [{
                id: crypto.randomUUID(),
                title: game.title ?? 'Untitled',
                platform: game.platform ?? Platform.STEAM,
                cover: game.cover ?? '',
                playtime: Number(game.playtime) || 0,
                status: game.status ?? GameStatus.PENDING,
                favorite: Boolean(game.favorite),
                lastPlayed: game.lastPlayed ?? null,
                achievements: {
                    unlocked: Number(game.achievements ?.unlocked) || 0,
                    total: Number(game.achievements ?.total) || 0,
                    list: game.achievements ?.list ?? [],
                },
                progress: Number(game.progress) || 0,
            },
            ...games,
        ];
        persist();
        notify();
    },

    /** Merge platform-sync results into the library (upsert by id). */
    upsertMany(incomingGames) {
        const byId = new Map(games.map((g) => [g.id, g]));
        incomingGames.forEach((g) => byId.set(g.id, {...byId.get(g.id), ...g }));
        games = Array.from(byId.values());
        persist();
        notify();
    },

    update(id, patch) {
        games = games.map((g) => (g.id === id ? {...g, ...patch } : g));
        persist();
        notify();
    },

    toggleFavorite(id) {
        const g = this.getById(id);
        if (g) this.update(id, { favorite: !g.favorite });
    },

    remove(id) {
        games = games.filter((g) => g.id !== id);
        persist();
        notify();
    },

    resetToSampleData() {
        games = sampleGames;
        persist();
        notify();
    },

    /**
     * Global aggregated stats used by StatsPanel / Dashboard.
     */
    getGlobalStats() {
        const total = games.length;
        const completed = games.filter((g) => g.status === GameStatus.COMPLETED).length;

        const byPlatform = Object.values(Platform).reduce((acc, p) => {
            acc[p] = 0;
            return acc;
        }, {});
        games.forEach((g) => {
            if (byPlatform[g.platform] != null) byPlatform[g.platform] += 1;
        });

        const achievementsUnlocked = games.reduce((sum, g) => sum + g.achievements.unlocked, 0);
        const achievementsTotal = games.reduce((sum, g) => sum + g.achievements.total, 0);

        const globalProgress = total ?
            Math.round(games.reduce((sum, g) => sum + computeProgress(g), 0) / total) :
            0;

        const totalPlaytime = games.reduce((sum, g) => sum + g.playtime, 0);

        const topRanked = [...games]
            .filter((g) => g.status !== GameStatus.COMPLETED)
            .sort((a, b) => computeProgress(b) - computeProgress(a))
            .slice(0, 5);

        return {
            total,
            completed,
            byPlatform,
            achievementsUnlocked,
            achievementsTotal,
            globalProgress,
            totalPlaytime,
            topRanked,
        };
    },

    /** All unlocked achievements across the library, flattened, grouped by rarity. */
    getAchievementsByRarity() {
        const flat = games.flatMap((g) =>
            g.achievements.list.map((a) => ({...a, gameTitle: g.title, gameCover: g.cover })),
        );
        const grouped = {};
        Object.keys(RARITY_META).forEach((rarity) => {
            grouped[rarity] = flat.filter((a) => a.rarity === rarity);
        });
        return grouped;
    },

    getRecentlyPlayed(limit = 6) {
        return [...games]
            .filter((g) => g.lastPlayed)
            .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
            .slice(0, limit);
    },

    getFavorites() {
        return games.filter((g) => g.favorite);
    },

    getNearCompletion(limit = 5) {
        return [...games]
            .filter((g) => g.status !== GameStatus.COMPLETED)
            .map((g) => ({ g, p: computeProgress(g) }))
            .filter(({ p }) => p >= 50)
            .sort((a, b) => b.p - a.p)
            .slice(0, limit)
            .map(({ g }) => g);
    },
};