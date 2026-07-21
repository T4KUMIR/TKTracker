/**
 * games.sample.js
 * -----------------------------------------------------------------------
 * Demo dataset — used on first run (empty localStorage) so the app is
 * never empty out of the box. Replace/remove freely once real platform
 * sync is wired up. Shapes strictly follow the Universal Game Model.
 * -----------------------------------------------------------------------
 */
import { createUniversalGame, createUniversalAchievement, Platform, GameStatus, Rarity } from './model.js';

const cover = (seed) => `https://picsum.photos/seed/${seed}/400/560`;

function achv(gameId, name, rarity, unlocked = true) {
  return createUniversalAchievement({
    gameId, name, unlocked, rarity,
    rarityPercent: { legendary: 1.4, epic: 6, rare: 18, common: 62 }[rarity],
    description: 'Desbloqueado al completar un desafío especial.',
    unlockedAt: unlocked ? new Date(Date.now() - Math.random() * 9e9).toISOString() : null,
  });
}

export const sampleGames = [
  createUniversalGame({
    id: 'g-tlou2', title: 'The Last of Us Part II', platform: Platform.PS4,
    cover: cover('tlou2'), playtime: 38, status: GameStatus.COMPLETED,
    favorite: true, progress: 100, lastPlayed: '2026-06-02T10:00:00Z',
    achievements: {
      unlocked: 42, total: 42,
      list: [achv('g-tlou2', 'Superviviente', Rarity.LEGENDARY), achv('g-tlou2', 'Sin piedad', Rarity.EPIC)],
    },
  }),
  createUniversalGame({
    id: 'g-gow', title: "God of War Ragnarök", platform: Platform.PS5,
    cover: cover('gow-r'), playtime: 61, status: GameStatus.PLAYING,
    favorite: true, progress: 78, lastPlayed: '2026-07-14T18:30:00Z',
    achievements: { unlocked: 35, total: 50, list: [achv('g-gow', 'Padre e hijo', Rarity.RARE)] },
  }),
  createUniversalGame({
    id: 'g-bloodborne', title: 'Bloodborne', platform: Platform.PS3,
    cover: cover('bloodborne-legacy'), playtime: 90, status: GameStatus.COMPLETED,
    favorite: false, progress: 100, lastPlayed: '2024-01-11T00:00:00Z',
    achievements: { unlocked: 33, total: 33, list: [achv('g-bloodborne', 'Cazador de la Vieja Sangre', Rarity.LEGENDARY)] },
  }),
  createUniversalGame({
    id: 'g-elden', title: 'Elden Ring', platform: Platform.STEAM,
    cover: cover('elden-ring'), playtime: 145, status: GameStatus.PLAYING,
    favorite: true, progress: 64, lastPlayed: '2026-07-18T21:00:00Z',
    achievements: { unlocked: 28, total: 42, list: [achv('g-elden', 'Elden Lord', Rarity.LEGENDARY, false)] },
  }),
  createUniversalGame({
    id: 'g-hades2', title: 'Hades II', platform: Platform.STEAM,
    cover: cover('hades-2'), playtime: 22, status: GameStatus.PLAYING,
    favorite: false, progress: 40, lastPlayed: '2026-07-10T12:00:00Z',
    achievements: { unlocked: 12, total: 30, list: [achv('g-hades2', 'Primer escape', Rarity.RARE)] },
  }),
  createUniversalGame({
    id: 'g-fortnite', title: 'Fortnite', platform: Platform.EPIC,
    cover: cover('fortnite'), playtime: 210, status: GameStatus.PLAYING,
    favorite: false, progress: 55, lastPlayed: '2026-07-19T20:00:00Z',
    achievements: { unlocked: 55, total: 100, list: [achv('g-fortnite', 'Victoria Royale', Rarity.EPIC)] },
  }),
  createUniversalGame({
    id: 'g-alanwake2', title: 'Alan Wake II', platform: Platform.EPIC,
    cover: cover('alan-wake-2'), playtime: 16, status: GameStatus.PENDING,
    favorite: false, progress: 8, lastPlayed: null,
    achievements: { unlocked: 3, total: 45, list: [] },
  }),
  createUniversalGame({
    id: 'g-cyberpunk', title: 'Cyberpunk 2077', platform: Platform.PS5,
    cover: cover('cyberpunk'), playtime: 12, status: GameStatus.ABANDONED,
    favorite: false, progress: 15, lastPlayed: '2025-11-02T00:00:00Z',
    achievements: { unlocked: 6, total: 44, list: [] },
  }),
];
