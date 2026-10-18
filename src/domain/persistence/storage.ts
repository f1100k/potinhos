import type { AppData } from '../types';
import { parseData, serialize } from './schema';

export const STORAGE_KEY = 'potinhos';
export const CORRUPT_KEY = 'potinhos:corrupted';

// Storage can throw in private mode or with a full quota; the app then keeps
// working in memory.
const attempt = <T>(fn: () => T): T | undefined => {
  try {
    return fn();
  } catch {
    return undefined;
  }
};

export function browserStorage(): Storage | undefined {
  return attempt(() => window.localStorage);
}

/** Unreadable data is kept aside under `CORRUPT_KEY`, and `null` returned. */
export function loadData(
  storage: Storage | undefined,
  now: Date,
): AppData | null {
  const raw = attempt(() => storage?.getItem(STORAGE_KEY));
  if (raw == null) return null;
  const data = attempt(() => parseData(JSON.parse(raw), now));
  if (data) return data;
  attempt(() => storage?.setItem(CORRUPT_KEY, raw));
  return null;
}

export function saveData(storage: Storage | undefined, data: AppData): void {
  attempt(() => storage?.setItem(STORAGE_KEY, serialize(data)));
}

export function clearData(storage: Storage | undefined): void {
  attempt(() => {
    storage?.removeItem(STORAGE_KEY);
    storage?.removeItem(CORRUPT_KEY);
  });
}
