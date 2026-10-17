import type { ReactNode } from 'react';
import { useNav } from './Nav';
import { FLOW_SCREENS, type Route, type Screen } from './navigation';
import './Shell.css';

type NavItem = { label: string; route: Route };

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
        className={`${className}${active ? ` ${className}--active` : ''}`}
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
    <div className="shell">
      <nav className="sidebar" aria-label="Menu">
        <div className="sidebar__brand">Potinhos</div>
        <NavButtons items={SIDEBAR_ITEMS} className="sidebar__item" />
        <button
          type="button"
          className="sidebar__cafe"
          onClick={() => go({ screen: 'cafe', from: 'app' })}
        >
          Me paga um café?
        </button>
      </nav>
      <div className="shell__main">
        <main
          className={`shell__content${flow ? ' shell__content--flow' : ''}`}
        >
          {children}
        </main>
      </div>
      {!flow && (
        <nav className="bottom-nav" aria-label="Navegação">
          <NavButtons items={BOTTOM_ITEMS} className="bottom-nav__item" />
        </nav>
      )}
    </div>
  );
}
