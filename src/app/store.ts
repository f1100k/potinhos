import { create } from 'zustand';
import {
  browserStorage,
  loadData,
  saveData,
} from '../domain/persistence/storage';
import { appReducer, createInitialData } from '../domain/reducer';
import type { AppAction, AppData } from '../domain/types';

export function loadAppData(storage: Storage | undefined): AppData {
  const now = new Date();
  return loadData(storage, now) ?? createInitialData(now);
}

export const useAppData = create<AppData>()(() =>
  loadAppData(browserStorage()),
);

/** @public */
export function dispatch(action: AppAction): void {
  useAppData.setState((data) => appReducer(data, action), true);
}

useAppData.subscribe((data) => saveData(browserStorage(), data));

/** @public */
export function newId(): string {
  return crypto.randomUUID();
}
