import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { initialNav, navReducer, type Route } from './navigation';

type NavValue = {
  route: Route;
  go: (route: Route) => void;
};

const NavContext = createContext<NavValue | null>(null);

type Props = {
  children: ReactNode;
  initial?: Route;
};

export function NavProvider({ children, initial }: Props) {
  const [state, dispatch] = useReducer(navReducer, initial, (r) =>
    r ? { route: r } : initialNav,
  );
  const go = useCallback((route: Route) => {
    dispatch({ type: 'go', route });
    window.scrollTo?.({ top: 0 });
  }, []);
  const value = useMemo(() => ({ route: state.route, go }), [state.route, go]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const nav = useContext(NavContext);
  if (!nav) throw new Error('useNav fora do NavProvider');
  return nav;
}
