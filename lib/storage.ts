import { UserProfile } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: 'streetpass_user_profile',
  USER_ID: 'streetpass_user_id',
  ENCOUNTERS: 'streetpass_encounters',
  LOCATION_HISTORY: 'streetpass_location_history',
};

// User Profile
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

// User ID
export function saveUserId(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
}

export function getUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

// Generate random user ID
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Encounters
export function saveEncounters(encounterId: string, discovered: boolean = false): void {
  const encounters = getEncounters();
  const updatedEncounters = {
    ...encounters,
    [encounterId]: { discovered, timestamp: Date.now() },
  };
  localStorage.setItem(STORAGE_KEYS.ENCOUNTERS, JSON.stringify(updatedEncounters));
}

export function getEncounters(): Record<string, { discovered: boolean; timestamp: number }> {
  const data = localStorage.getItem(STORAGE_KEYS.ENCOUNTERS);
  return data ? JSON.parse(data) : {};
}

// Location history
export function saveLocationHistory(
  lat: number,
  lng: number,
  timestamp?: number
): void {
  const history = getLocationHistory();
  history.push({
    lat,
    lng,
    timestamp: timestamp || Date.now(),
  });
  // Keep only last 100 entries
  if (history.length > 100) {
    history.shift();
  }
  localStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));
}

export function getLocationHistory(): Array<{
  lat: number;
  lng: number;
  timestamp: number;
}> {
  const data = localStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
  return data ? JSON.parse(data) : [];
}
