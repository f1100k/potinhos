import { useLocation } from '@tanstack/react-router';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNoFluxo } from './fluxo';

export const TOAST_MS = 2600;

const TOAST_CLASS =
  'pointer-events-none fixed left-1/2 z-9 max-w-[calc(100vw-32px)] -translate-x-1/2 animate-toast rounded-pill border-[1.5px] border-border bg-surface px-4.5 py-3 text-center text-[14px] text-text shadow-toast wide:bottom-8 wide:whitespace-nowrap';

type ToastValue = (text: string) => void;

const ToastContext = createContext<ToastValue | null>(null);

type Toast = { id: number; text: string };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noFluxo = useNoFluxo();
  const naLanding = useLocation({ select: (l) => l.pathname === '/' });
  const semBarra = naLanding || noFluxo;

  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setToast((t) => ({ id: (t?.id ?? 0) + 1, text }));
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div role="status" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className={`${TOAST_CLASS} ${semBarra ? 'bottom-[calc(32px+env(safe-area-inset-bottom))]' : 'bottom-[calc(92px+env(safe-area-inset-bottom))]'}`}
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
