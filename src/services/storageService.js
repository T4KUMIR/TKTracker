/**
 * storageService.js
 * -----------------------------------------------------------------------
 * Thin persistence layer over localStorage. Every read/write to disk goes
 * through here so swapping to IndexedDB or a real backend later only
 * touches this one file.
 * -----------------------------------------------------------------------
 */
const NAMESPACE = 'uat'; // Universal Achievement Tracker

const key = (name) => `${NAMESPACE}:${name}`;

export const storageService = {
  get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn(`[storageService] failed to read "${name}"`, err);
      return fallback;
    }
  },

  set(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[storageService] failed to write "${name}"`, err);
      return false;
    }
  },

  remove(name) {
    localStorage.removeItem(key(name));
  },
};
