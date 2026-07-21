/**
 * model.js
 * -----------------------------------------------------------------------
 * Universal Achievement Tracker — data contracts.
 * Every platform adapter (PlayStation, Steam, Epic, Xbox, Switch) must
 * normalize its native data into this shape before it enters the app.
 * This is the ONE model the rest of the UI is allowed to depend on.
 * -----------------------------------------------------------------------
 */

/** @enum {string} Supported / planned platforms */
export const Platform = {
  PS3: 'ps3',
  PS4: 'ps4',
  PS5: 'ps5',
  STEAM: 'steam',
  EPIC: 'epic',
  XBOX: 'xbox',      // architecture-ready, no live adapter yet
  SWITCH: 'switch',  // architecture-ready, no live adapter yet
};

/** Human labels + brand colors used by PlatformBadge */
export const PLATFORM_META = {
  [Platform.PS3]:    { label: 'PS3',    color: '#0a4bb5', icon: 'ps' },
  [Platform.PS4]:    { label: 'PS4',    color: '#0070d1', icon: 'ps' },
  [Platform.PS5]:    { label: 'PS5',    color: '#00d4ff', icon: 'ps' },
  [Platform.STEAM]:  { label: 'Steam',  color: '#66c0f4', icon: 'steam' },
  [Platform.EPIC]:   { label: 'Epic',   color: '#f0f0f0', icon: 'epic' },
  [Platform.XBOX]:   { label: 'Xbox',   color: '#107c10', icon: 'xbox' },
  [Platform.SWITCH]: { label: 'Switch', color: '#ff4d6d', icon: 'switch' },
};

/** @enum {string} Game progress status */
export const GameStatus = {
  PLAYING: 'playing',
  COMPLETED: 'completed',
  PENDING: 'pending',
  ABANDONED: 'abandoned',
};

export const STATUS_META = {
  [GameStatus.PLAYING]:   { label: 'Jugando',    color: 'var(--accent-primary)' },
  [GameStatus.COMPLETED]: { label: 'Completado', color: 'var(--success)' },
  [GameStatus.PENDING]:   { label: 'Pendiente',  color: 'var(--text-secondary)' },
  [GameStatus.ABANDONED]: { label: 'Abandonado', color: 'var(--danger)' },
};

/** @enum {string} Achievement rarity tiers */
export const Rarity = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_META = {
  [Rarity.COMMON]:    { label: 'Común',      color: 'var(--accent-common)',    max: 100 },
  [Rarity.RARE]:       { label: 'Raro',       color: 'var(--accent-rare)',      max: 30 },
  [Rarity.EPIC]:       { label: 'Épico',      color: 'var(--accent-epic)',      max: 10 },
  [Rarity.LEGENDARY]:  { label: 'Legendario', color: 'var(--accent-legendary)', max: 3 },
};

/**
 * Derive a rarity tier from a "percentage of players who unlocked it".
 * @param {number} unlockPercent 0-100
 * @returns {string} Rarity
 */
export function rarityFromPercent(unlockPercent) {
  if (unlockPercent <= RARITY_META.legendary.max) return Rarity.LEGENDARY;
  if (unlockPercent <= RARITY_META.epic.max) return Rarity.EPIC;
  if (unlockPercent <= RARITY_META.rare.max) return Rarity.RARE;
  return Rarity.COMMON;
}

/**
 * Factory that guarantees every game object entering the app matches
 * the Universal Game Model, filling sane defaults for missing fields.
 * @param {Partial<UniversalGame>} raw
 * @returns {UniversalGame}
 */
export function createUniversalGame(raw = {}) {
  return {
    id: raw.id ?? crypto.randomUUID(),
    title: raw.title ?? 'Untitled',
    platform: raw.platform ?? Platform.STEAM,
    cover: raw.cover ?? '',
    playtime: raw.playtime ?? 0, // hours
    status: raw.status ?? GameStatus.PENDING,
    favorite: raw.favorite ?? false,
    lastPlayed: raw.lastPlayed ?? null, // ISO date string
    achievements: {
      unlocked: raw.achievements?.unlocked ?? 0,
      total: raw.achievements?.total ?? 0,
      list: raw.achievements?.list ?? [], // Array<UniversalAchievement>
    },
    progress: raw.progress ?? 0, // 0-100
  };
}

/**
 * Factory for a single achievement entry.
 * @param {Partial<UniversalAchievement>} raw
 */
export function createUniversalAchievement(raw = {}) {
  return {
    id: raw.id ?? crypto.randomUUID(),
    gameId: raw.gameId ?? null,
    name: raw.name ?? 'Achievement',
    description: raw.description ?? '',
    icon: raw.icon ?? '',
    unlocked: raw.unlocked ?? false,
    unlockedAt: raw.unlockedAt ?? null,
    rarity: raw.rarity ?? Rarity.COMMON,
    rarityPercent: raw.rarityPercent ?? 100, // % of players who have it
  };
}
