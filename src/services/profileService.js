/**
 * profileService.js — the local player identity shown in ProfileCard/Dashboard.
 * Kept separate from dataService (games) because profile edits are rare
 * and shouldn't trigger a full library re-render.
 */
import { storageService } from './storageService.js';

const STORAGE_KEY = 'profile';

const DEFAULT_PROFILE = {
  name: 'Jugador',
  avatar: 'https://placehold.co/160x160/10162b/00d4ff?text=U',
};

let profile = storageService.get(STORAGE_KEY, DEFAULT_PROFILE);

export const profileService = {
  getProfile() {
    return profile;
  },
  updateProfile(patch) {
    profile = { ...profile, ...patch };
    storageService.set(STORAGE_KEY, profile);
    return profile;
  },
};
