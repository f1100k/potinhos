import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';

type Props = {
  aboveBottomNav: boolean;
};

export function Toaster({ aboveBottomNav }: Props) {
  return (
    <Sonner
      position="bottom-center"
      visibleToasts={1}
      offset={{ bottom: 'var(--toast-bottom)' }}
      mobileOffset={{ bottom: 'var(--toast-bottom)' }}
      style={{ '--width': 'min(560px, calc(100vw - 32px))' } as CSSProperties}
      className={`${aboveBottomNav ? '[--toast-bottom:calc(92px+env(safe-area-inset-bottom))]' : '[--toast-bottom:calc(32px+env(safe-area-inset-bottom))]'} wide:[--toast-bottom:32px]`}
      toastOptions={{ unstyled: true, className: 'flex w-full justify-center' }}
      containerAriaLabel="Avisos"
    />
  );
}
