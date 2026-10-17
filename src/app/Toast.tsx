import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNav } from './Nav';
import { FLOW_SCREENS } from './navigation';
import './Toast.css';

export const TOAST_MS = 2600;

type ToastValue = (text: string) => void;

const ToastContext = createContext<ToastValue | null>(null);

type Toast = { id: number; text: string };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { route } = useNav();
  const semBarra =
    route.screen === 'landing' || FLOW_SCREENS.includes(route.screen);

  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setToast((t) => ({ id: (t?.id ?? 0) + 1, text }));
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className={`toast${semBarra ? ' toast--low' : ''}`}
          >
            {toast.text}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast fora do ToastProvider');
  return show;
}
