import { beforeEach, describe, expect, it } from 'vitest';
import { appReducer, createInitialData } from '../../appReducer';
import {
  CORRUPT_KEY,
  clearData,
  loadData,
  STORAGE_KEY,
  saveData,
} from '../storage';

const now = new Date(2026, 9, 14, 10);

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when nothing is saved', () => {
    expect(loadData(localStorage, now)).toBeNull();
  });

  it('saves and loads the same state', () => {
    const data = appReducer(createInitialData(now), {
      type: 'addTask',
      id: 'a',
      text: 'Regar as plantas',
      jar: 'weekly',
      freq: 2,
    });
    saveData(localStorage, data);
    expect(loadData(localStorage, now)).toEqual(data);
  });

  it('corrupted JSON returns null and keeps a copy', () => {
    localStorage.setItem(STORAGE_KEY, '{"tasks": [');
    expect(loadData(localStorage, now)).toBeNull();
    expect(localStorage.getItem(CORRUPT_KEY)).toBe('{"tasks": [');
  });

  it('an unexpected shape also returns null', () => {
    localStorage.setItem(STORAGE_KEY, '"oi"');
    expect(loadData(localStorage, now)).toBeNull();
  });

  it('clears the data and the corrupted copy', () => {
    localStorage.setItem(STORAGE_KEY, '{}');
    localStorage.setItem(CORRUPT_KEY, '{');
    clearData(localStorage);
    expect(localStorage.length).toBe(0);
  });

  it('keeps working when storage throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    } as unknown as Storage;
    expect(loadData(broken, now)).toBeNull();
    expect(() => saveData(broken, createInitialData(now))).not.toThrow();
  });
});
