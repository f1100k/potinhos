import type { ReactNode } from 'react';
import { useNav } from './Nav';
import { FLOW_SCREENS } from './navigation';
import './Shell.css';

type Props = {
  children: ReactNode;
};

/** Moldura das telas do app: menu lateral (web) ou barra inferior (celular). */
export function Shell({ children }: Props) {
  const { route } = useNav();
  const flow = FLOW_SCREENS.includes(route.screen);

  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Menu" />
      <div className="shell__main">
        <main
          className={`shell__content${flow ? ' shell__content--flow' : ''}`}
        >
          {children}
        </main>
      </div>
      {!flow && <nav className="bottom-nav" aria-label="Navegação" />}
    </div>
  );
}
