import { type ComponentType, useReducer } from 'react';
import { Add } from '../screens/Add';
import { Cafe } from '../screens/Cafe';
import { Conquistas } from '../screens/Conquistas';
import { Done } from '../screens/Done';
import { Draw } from '../screens/Draw';
import { Edit } from '../screens/Edit';
import { Home } from '../screens/Home';
import { Landing } from '../screens/Landing';
import { NotDone } from '../screens/NotDone';
import { NovaSemana } from '../screens/NovaSemana';
import { Pending } from '../screens/Pending';
import { Return } from '../screens/Return';
import { Settings } from '../screens/Settings';
import { Task } from '../screens/Task';
import { Vazio } from '../screens/Vazio';
import { Weekend } from '../screens/Weekend';
import { initialNav, navReducer, SCREENS, type Screen } from './navigation';

const SCREEN_COMPONENTS: Record<Screen, ComponentType> = {
  landing: Landing,
  home: Home,
  draw: Draw,
  task: Task,
  done: Done,
  notdone: NotDone,
  return: Return,
  vazio: Vazio,
  weekend: Weekend,
  novasemana: NovaSemana,
  ach: Conquistas,
  add: Add,
  edit: Edit,
  pending: Pending,
  settings: Settings,
  cafe: Cafe,
};

export function App() {
  const [nav, dispatch] = useReducer(navReducer, initialNav);
  const Current = SCREEN_COMPONENTS[nav.screen];

  return (
    <>
      {import.meta.env.DEV && (
        <nav
          aria-label="Telas (dev)"
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            padding: 8,
            fontSize: 12,
          }}
        >
          {SCREENS.map((screen) => (
            <button
              key={screen}
              type="button"
              onClick={() => dispatch({ type: 'go', screen })}
              aria-current={nav.screen === screen ? 'page' : undefined}
              style={{
                textDecoration: nav.screen === screen ? 'underline' : 'none',
              }}
            >
              {screen}
            </button>
          ))}
        </nav>
      )}
      <main>
        <Current />
      </main>
    </>
  );
}
