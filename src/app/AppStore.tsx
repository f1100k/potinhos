import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useReducer,
} from 'react';
import { type AppAction, appReducer, createInitialData } from '../domain/store';
import type { AppData } from '../domain/types';

const DataContext = createContext<AppData | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);

export function newId(): string {
  return crypto.randomUUID();
}

type Props = {
  children: ReactNode;
  /** Estado inicial (testes). */
  initial?: AppData;
};

export function AppStoreProvider({ children, initial }: Props) {
  const [data, dispatch] = useReducer(
    appReducer,
    initial,
    (i) => i ?? createInitialData(new Date()),
  );
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
