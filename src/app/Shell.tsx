import { Link, linkOptions } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useNoFluxo } from './fluxo';

const ACTIVE_CLASS =
  'aria-[current=page]:bg-segment aria-[current=page]:text-link';

const BOTTOM_ITEM_CLASS = `min-h-12 max-w-30 flex-1 rounded-card px-1.5 py-2.5 text-center text-[13px] text-text-secondary ${ACTIVE_CLASS}`;

const SIDEBAR_ITEM_CLASS = `min-h-touch rounded-card px-3.5 py-3 text-left text-[15px] text-text-secondary not-aria-[current=page]:hover:text-text ${ACTIVE_CLASS}`;

// "Meus potes" (/potes) fica ativo durante todo o fluxo do sorteio, porque as
// telas do fluxo moram em /potes/... e o link casa pelo prefixo.
const HOME = linkOptions({ to: '/potes' });
const ADD = linkOptions({ to: '/nova-tarefa' });
const PENDING = linkOptions({ to: '/pendentes' });
const SETTINGS = linkOptions({ to: '/configuracoes' });

const SIDEBAR_ITEMS = [
  { label: 'Meus potes', link: HOME },
  { label: 'Nova tarefa', link: ADD },
  { label: 'Ver e editar potes', link: linkOptions({ to: '/editar' }) },
  { label: 'Tarefas pendentes', link: PENDING },
  {
    label: 'Pote de conquistas',
    link: linkOptions({
      to: '/conquistas',
      search: { tab: 'semana' },
      activeOptions: { includeSearch: false },
    }),
  },
  { label: 'Configurações', link: SETTINGS },
];

const BOTTOM_ITEMS = [
  { label: 'Meus potes', link: HOME },
  { label: 'Nova tarefa', link: ADD },
  { label: 'Pendentes', link: PENDING },
  { label: 'Configurações', link: SETTINGS },
];

type Props = {
  children: ReactNode;
};

/** Moldura das telas do app: menu lateral (web) ou barra inferior (celular). */
export function Shell({ children }: Props) {
  const flow = useNoFluxo();

  return (
    <div className="flex min-h-dvh">
      <nav
        className="hidden wide:sticky wide:top-0 wide:flex wide:h-dvh wide:w-sidebar wide:flex-none wide:flex-col wide:gap-1.5 wide:border-r wide:border-divider wide:px-5 wide:py-9"
        aria-label="Menu"
      >
        <div className="px-3.5 pb-6.5 text-[22px] text-link">Potinhos</div>
        {SIDEBAR_ITEMS.map((item) => (
          <Link key={item.label} {...item.link} className={SIDEBAR_ITEM_CLASS}>
            {item.label}
          </Link>
        ))}
        <Link
          to="/cafe"
          search={{ from: 'app' }}
          className="mt-auto min-h-10 px-3.5 py-2 text-left text-[13px] text-text-tertiary hover:text-link"
        >
          Me paga um café?
        </Link>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col items-center">
        <main
          className={`relative w-full max-w-mobile flex-1 px-5 pt-5 wide:max-w-web wide:pb-15 ${flow ? 'pb-[calc(40px+env(safe-area-inset-bottom))]' : 'pb-[calc(110px+env(safe-area-inset-bottom))]'}`}
        >
          {children}
        </main>
      </div>
      {!flow && (
        <nav
          className="fixed inset-x-0 bottom-0 z-5 flex justify-around border-t border-divider bg-bg-blur px-2 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-[10px] wide:hidden"
          aria-label="Navegação"
        >
          {BOTTOM_ITEMS.map((item) => (
            <Link key={item.label} {...item.link} className={BOTTOM_ITEM_CLASS}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
