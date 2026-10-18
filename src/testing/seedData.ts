import { vi } from 'vitest';
import { createInitialData } from '../stores/appReducer';
import { saveData } from '../stores/persistence/storage';
import type { AppData } from '../types/model';

/** Needs fake timers: it also sets the clock to `now`. */
export function seedData(now: Date, overrides: Partial<AppData> = {}): void {
  vi.setSystemTime(now);
  saveData(localStorage, { ...createInitialData(now), ...overrides });
}
