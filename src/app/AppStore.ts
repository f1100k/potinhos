import { create } from 'zustand';
import { loadData, saveData } from '../domain/persistence/storage';
import { type AppAction, appReducer } from '../domain/store';
import type { AppData } from '../domain/types';

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export const useAppData = create<AppData>()(() =>
  loadData(browserStorage(), new Date()),
);

export function dispatch(action: AppAction): void {
  useAppData.setState((data) => appReducer(data, action), true);
}

useAppData.subscribe((data) => saveData(browserStorage(), data));

export function newId(): string {
  return crypto.randomUUID();
}
