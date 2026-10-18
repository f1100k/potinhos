import { vi } from 'vitest';
import { saveData } from '../domain/persistence/storage';
import { createInitialData } from '../domain/reducer';
import type { AppData } from '../domain/types';

/** Needs fake timers: it also sets the clock to `now`. */
export function seedData(now: Date, overrides: Partial<AppData> = {}): void {
  vi.setSystemTime(now);
  saveData(localStorage, { ...createInitialData(now), ...overrides });
}
