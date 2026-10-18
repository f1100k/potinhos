import type { ReactNode } from 'react';
import { useNav } from './Nav';
import { FLOW_SCREENS, type Route, type Screen } from './navigation';

type NavItem = { label: string; route: Route };

const ACTIVE_CLASS =
  'aria-[current=page]:bg-segment aria-[current=page]:text-link';

const BOTTOM_ITEM_CLASS = `min-h-12 max-w-30 flex-1 rounded-card px-1.5 py-2.5 text-[13px] text-text-secondary ${ACTIVE_CLASS}`;

const SIDEBAR_ITEM_CLASS = `min-h-touch rounded-card px-3.5 py-3 text-left text-[15px] text-text-secondary not-aria-[current=page]:hover:text-text ${ACTIVE_CLASS}`;

const SIDEBAR_ITEMS: readonly NavItem[] = [
  { label: 'Meus potes', route: { screen: 'home' } },
  { label: 'Nova tarefa', route: { screen: 'add' } },
  { label: 'Ver e editar potes', route: { screen: 'edit' } },
  { label: 'Tarefas pendentes', route: { screen: 'pending' } },
  { label: 'Pote de conquistas', route: { screen: 'ach', tab: 'semana' } },
  { label: 'Configurações', route: { screen: 'settings' } },
];

const BOTTOM_ITEMS: readonly NavItem[] = [
  { label: 'Meus potes', route: { screen: 'home' } },
  { label: 'Nova tarefa', route: { screen: 'add' } },
  { label: 'Pendentes', route: { screen: 'pending' } },
  { label: 'Configurações', route: { screen: 'settings' } },
];

/** "Meus potes" fica ativo durante todo o fluxo do sorteio. */
export function isActive(item: Screen, current: Screen): boolean {
  return (
    item === current || (item === 'home' && FLOW_SCREENS.includes(current))
  );
}

function NavButtons({
  items,
  className,
}: {
  items: readonly NavItem[];
  className: string;
}) {
  const { route, go } = useNav();
  return items.map((item) => {
    const active = isActive(item.route.screen, route.screen);
    return (
      <button
        key={item.label}
        type="button"
        className={className}
        aria-current={active ? 'page' : undefined}
        onClick={() => go(item.route)}
      >
        {item.label}
      </button>
    );
  });
}

type Props = {
  children: ReactNode;
};

/** Moldura das telas do app: menu lateral (web) ou barra inferior (celular). */
export function Shell({ children }: Props) {
  const { route, go } = useNav();
  const flow = FLOW_SCREENS.includes(route.screen);

  return (
    <div className="flex min-h-dvh">
      <nav
        className="hidden wide:sticky wide:top-0 wide:flex wide:h-dvh wide:w-sidebar wide:flex-none wide:flex-col wide:gap-1.5 wide:border-r wide:border-divider wide:px-5 wide:py-9"
        aria-label="Menu"
      >
        <div className="px-3.5 pb-6.5 text-[22px] text-link">Potinhos</div>
        <NavButtons items={SIDEBAR_ITEMS} className={SIDEBAR_ITEM_CLASS} />
        <button
          type="button"
          className="mt-auto min-h-10 px-3.5 py-2 text-left text-[13px] text-text-tertiary hover:text-link"
          onClick={() => go({ screen: 'cafe', from: 'app' })}
        >
          Me paga um café?
        </button>
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
          <NavButtons items={BOTTOM_ITEMS} className={BOTTOM_ITEM_CLASS} />
        </nav>
      )}
    </div>
  );
}
