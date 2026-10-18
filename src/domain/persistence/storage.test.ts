import { beforeEach, describe, expect, it } from 'vitest';
import { appReducer, createInitialData } from '../store';
import {
  CORRUPT_KEY,
  clearData,
  loadData,
  STORAGE_KEY,
  saveData,
} from './storage';

const now = new Date(2026, 9, 14, 10);

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('starts from scratch when nothing is saved', () => {
    expect(loadData(localStorage, now)).toEqual(createInitialData(now));
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

  it('corrupted JSON does not break and keeps a copy', () => {
    localStorage.setItem(STORAGE_KEY, '{"tasks": [');
    expect(loadData(localStorage, now)).toEqual(createInitialData(now));
    expect(localStorage.getItem(CORRUPT_KEY)).toBe('{"tasks": [');
  });

  it('an unexpected shape also starts from scratch', () => {
    localStorage.setItem(STORAGE_KEY, '"oi"');
    expect(loadData(localStorage, now).tasks).toEqual([]);
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
    expect(loadData(broken, now)).toEqual(createInitialData(now));
    expect(() => saveData(broken, createInitialData(now))).not.toThrow();
  });
});
