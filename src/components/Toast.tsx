import { useLocation } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { Toaster as Sonner, toast as sonner } from 'sonner';
import { useNoFluxo } from '../app/fluxo';

export const TOAST_MS = 2600;

const PILULA =
  'flex max-w-full items-center gap-3 rounded-pill border-[1.5px] border-border bg-surface px-4.5 py-3 text-center text-[14px] text-text shadow-toast wide:whitespace-nowrap';

type Acao = { label: string; onClick: () => void };

/**
 * Mostra uma mensagem curta, que some sozinha depois de ~2,6s. Uma nova
 * mensagem substitui a anterior. A `acao` vira um botão, como "Desfazer".
 */
export function toast(text: string, acao?: Acao): void {
  sonner.dismiss();
  sonner.custom(
    (id) => (
      <div className={PILULA}>
        {text}
        {acao && (
          <button
            type="button"
            className="font-bold underline underline-offset-2"
            onClick={() => {
              acao.onClick();
              sonner.dismiss(id);
            }}
          >
            {acao.label}
          </button>
        )}
      </div>
    ),
    { duration: TOAST_MS },
  );
}

/** Onde o toast aparece: acima da barra inferior, quando ela existe. */
export function Toaster() {
  const noFluxo = useNoFluxo();
  const naLanding = useLocation({ select: (l) => l.pathname === '/' });
  const semBarra = naLanding || noFluxo;

  return (
    <Sonner
      position="bottom-center"
      visibleToasts={1}
      offset={{ bottom: 'var(--toast-bottom)' }}
      mobileOffset={{ bottom: 'var(--toast-bottom)' }}
      style={{ '--width': 'min(560px, calc(100vw - 32px))' } as CSSProperties}
      className={`${semBarra ? '[--toast-bottom:calc(32px+env(safe-area-inset-bottom))]' : '[--toast-bottom:calc(92px+env(safe-area-inset-bottom))]'} wide:[--toast-bottom:32px]`}
      toastOptions={{ unstyled: true, className: 'flex w-full justify-center' }}
      containerAriaLabel="Avisos"
    />
  );
}
