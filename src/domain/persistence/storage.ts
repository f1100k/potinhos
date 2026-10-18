import { createInitialData } from '../store';
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

export function loadData(storage: Storage | undefined, now: Date): AppData {
  const raw = attempt(() => storage?.getItem(STORAGE_KEY));
  if (raw == null) return createInitialData(now);
  const data = attempt(() => parseData(JSON.parse(raw), now));
  if (data) return data;
  attempt(() => storage?.setItem(CORRUPT_KEY, raw));
  return createInitialData(now);
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
