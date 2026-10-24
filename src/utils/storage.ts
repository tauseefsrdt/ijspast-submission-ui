const STORAGE_KEYS = {
  SESSION: 'ijspast_session_v2',
  MANUSCRIPTS: 'ijspast_manuscripts_v2',
  REVIEWS: 'ijspast_reviews_v2',
  USERS: 'ijspast_users_v2',
};

export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key} from localStorage:`, e);
  }
}

export { STORAGE_KEYS };
