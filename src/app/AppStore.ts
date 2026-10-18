import { create } from 'zustand';
import { loadData, saveData } from '../domain/persistence';
import { type AppAction, appReducer } from '../domain/store';
import type { AppData } from '../domain/types';

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Os dados do app. Leia só o que a tela usa, para ela só redesenhar quando
 * isso mudar: `useAppData((d) => d.tasks)`.
 */
export const useAppData = create<AppData>()(() =>
  loadData(browserStorage(), new Date()),
);

/** Toda mudança nos dados passa por aqui, e já fica salva. */
export function dispatch(action: AppAction): void {
  useAppData.setState((data) => appReducer(data, action), true);
}

useAppData.subscribe((data) => saveData(browserStorage(), data));

export function newId(): string {
  return crypto.randomUUID();
}
