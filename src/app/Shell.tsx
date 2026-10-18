import { Link, linkOptions } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useInFlow } from './flow';

const ACTIVE_CLASS =
  'aria-[current=page]:bg-segment aria-[current=page]:text-link';

const BOTTOM_ITEM_CLASS = `min-h-12 max-w-30 flex-1 rounded-card px-1.5 py-2.5 text-center text-[13px] text-text-secondary ${ACTIVE_CLASS}`;

const SIDEBAR_ITEM_CLASS = `min-h-touch rounded-card px-3.5 py-3 text-left text-[15px] text-text-secondary not-aria-[current=page]:hover:text-text ${ACTIVE_CLASS}`;

// "Meus potes" stays active during the whole draw flow, because the flow
// screens live under /jars/... and the link matches by prefix.
const HOME = linkOptions({ to: '/jars' });
const ADD = linkOptions({ to: '/new-task' });
const PENDING = linkOptions({ to: '/pending' });
const SETTINGS = linkOptions({ to: '/settings' });

const SIDEBAR_ITEMS = [
  { label: 'Meus potes', link: HOME },
  { label: 'Nova tarefa', link: ADD },
  { label: 'Ver e editar potes', link: linkOptions({ to: '/edit' }) },
  { label: 'Tarefas pendentes', link: PENDING },
  {
    label: 'Pote de conquistas',
    link: linkOptions({
      to: '/achievements',
      search: { tab: 'week' },
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

export function Shell({ children }: Props) {
  const inFlow = useInFlow();

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
          to="/coffee"
          search={{ from: 'app' }}
          className="mt-auto min-h-10 px-3.5 py-2 text-left text-[13px] text-text-tertiary hover:text-link"
        >
          Me paga um café?
        </Link>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col items-center">
        <main
          className={`relative w-full max-w-mobile flex-1 px-5 pt-5 wide:max-w-web wide:pb-15 ${inFlow ? 'pb-[calc(40px+env(safe-area-inset-bottom))]' : 'pb-[calc(110px+env(safe-area-inset-bottom))]'}`}
        >
          {children}
        </main>
      </div>
      {!inFlow && (
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
