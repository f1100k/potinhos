import { useLocation } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { Toaster as Sonner, toast as sonner } from 'sonner';
import { useInFlow } from '../app/flow';

export const TOAST_MS = 2600;

const PILL =
  'flex max-w-full items-center gap-3 rounded-pill border-[1.5px] border-border bg-surface px-4.5 py-3 text-center text-[14px] text-text shadow-toast wide:whitespace-nowrap';

type ToastAction = { label: string; onClick: () => void };

export function toast(text: string, action?: ToastAction): void {
  sonner.dismiss();
  sonner.custom(
    (id) => (
      <div className={PILL}>
        {text}
        {action && (
          <button
            type="button"
            className="font-bold underline underline-offset-2"
            onClick={() => {
              action.onClick();
              sonner.dismiss(id);
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    ),
    { duration: TOAST_MS },
  );
}

export function Toaster() {
  const inFlow = useInFlow();
  const onLanding = useLocation({ select: (l) => l.pathname === '/' });
  const hasBottomBar = !onLanding && !inFlow;

  return (
    <Sonner
      position="bottom-center"
      visibleToasts={1}
      offset={{ bottom: 'var(--toast-bottom)' }}
      mobileOffset={{ bottom: 'var(--toast-bottom)' }}
      style={{ '--width': 'min(560px, calc(100vw - 32px))' } as CSSProperties}
      className={`${hasBottomBar ? '[--toast-bottom:calc(92px+env(safe-area-inset-bottom))]' : '[--toast-bottom:calc(32px+env(safe-area-inset-bottom))]'} wide:[--toast-bottom:32px]`}
      toastOptions={{ unstyled: true, className: 'flex w-full justify-center' }}
      containerAriaLabel="Avisos"
    />
  );
}
