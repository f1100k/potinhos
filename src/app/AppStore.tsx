import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
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

const DataContext = createContext<AppData | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);

export function newId(): string {
  return crypto.randomUUID();
}

type Props = {
  children: ReactNode;
  /** Estado inicial (testes). Sem ele, carrega do `localStorage`. */
  initial?: AppData;
};

export function AppStoreProvider({ children, initial }: Props) {
  const [data, dispatch] = useReducer(
    appReducer,
    initial,
    (i) => i ?? loadData(browserStorage(), new Date()),
  );

  useEffect(() => {
    saveData(browserStorage(), data);
  }, [data]);

  return (
    <DataContext.Provider value={data}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </DataContext.Provider>
  );
}

export function useAppData(): AppData {
  const data = useContext(DataContext);
  if (!data) throw new Error('useAppData fora do AppStoreProvider');
  return data;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) throw new Error('useAppDispatch fora do AppStoreProvider');
  return dispatch;
}
