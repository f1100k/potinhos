import type { ReactNode } from 'react';
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
import { AppStoreProvider } from './AppStore';
import { NavProvider, useNav } from './Nav';
import type { Route } from './navigation';

function renderScreen(route: Route): ReactNode {
  switch (route.screen) {
    case 'landing':
      return <Landing />;
    case 'home':
      return <Home />;
    case 'draw':
      return <Draw />;
    case 'task':
      return <Task />;
    case 'done':
      return <Done />;
    case 'notdone':
      return <NotDone />;
    case 'return':
      return <Return />;
    case 'vazio':
      return <Vazio />;
    case 'weekend':
      return <Weekend />;
    case 'novasemana':
      return <NovaSemana />;
    case 'ach':
      return <Conquistas />;
    case 'add':
      return <Add />;
    case 'edit':
      return <Edit />;
    case 'pending':
      return <Pending />;
    case 'settings':
      return <Settings />;
    case 'cafe':
      return <Cafe />;
  }
}

function Screens() {
  const { route } = useNav();
  return <main>{renderScreen(route)}</main>;
}

type Props = {
  initialRoute?: Route;
};

export function App({ initialRoute }: Props) {
  return (
    <AppStoreProvider>
      <NavProvider {...(initialRoute ? { initial: initialRoute } : {})}>
        <Screens />
      </NavProvider>
    </AppStoreProvider>
  );
}
