import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  type RouterHistory,
  redirect,
} from '@tanstack/react-router';
import { type ISODate, POTES, type Pote } from '../domain/types';
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
import { consumirFluxo } from './fluxo';
import { Shell } from './Shell';
import { ToastProvider } from './Toast';

export const ACH_TABS = ['semana', 'mes'] as const;
export type AchTab = (typeof ACH_TABS)[number];

type Search = Record<string, unknown>;

function oneOf<T extends string>(
  value: unknown,
  list: readonly T[],
): T | undefined {
  return list.includes(value as T) ? (value as T) : undefined;
}

function isoDate(value: unknown): ISODate | undefined {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : undefined;
}

/** Parâmetro obrigatório do fluxo. Só falta se a URL foi editada à mão. */
function required<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`Parâmetro inválido: ${name}`);
  return value;
}

const rootRoute = createRootRoute({
  component: () => (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
});

/** Telas do app, dentro do menu lateral e da barra inferior. */
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/potes',
  component: Home,
});

const addRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/nova-tarefa',
  validateSearch: (s: Search): { pote?: Pote | undefined } => ({
    pote: oneOf(s.pote, POTES),
  }),
  component: Add,
});

const editRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/editar',
  validateSearch: (s: Search): { pote?: Pote | undefined } => ({
    pote: oneOf(s.pote, POTES),
  }),
  component: Edit,
});

const pendingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/pendentes',
  component: Pending,
});

const achRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/conquistas',
  validateSearch: (
    s: Search,
  ): { tab: AchTab; semana?: ISODate | undefined } => ({
    tab: oneOf(s.tab, ACH_TABS) ?? 'semana',
    semana: isoDate(s.semana),
  }),
  component: Conquistas,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/configuracoes',
  component: Settings,
});

const cafeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/cafe',
  validateSearch: (s: Search): { from: 'landing' | 'app' } => ({
    from: oneOf(s.from, ['landing', 'app'] as const) ?? 'app',
  }),
  component: Cafe,
});

/** Fluxo do sorteio: só abre por uma ação dentro do app. */
const fluxoRoute = createRoute({
  getParentRoute: () => appRoute,
  id: 'fluxo',
  beforeLoad: ({ cause }) => {
    if (cause === 'enter' && !consumirFluxo()) {
      throw redirect({ to: '/potes', replace: true });
    }
  },
});

const drawRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/sorteio',
  validateSearch: (s: Search): { pote: Pote } => ({
    pote: required(oneOf(s.pote, POTES), 'pote'),
  }),
  component: Draw,
});

const taskRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/tarefa',
  component: Task,
});

const doneRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/feito',
  component: Done,
});

const notDoneRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/nao-consegui',
  component: NotDone,
});

const returnRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/devolver',
  validateSearch: (s: Search): { destino: Pote | 'pendentes' } => ({
    destino: required(
      oneOf(s.destino, [...POTES, 'pendentes'] as const),
      'destino',
    ),
  }),
  component: Return,
});

const vazioRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/vazio',
  validateSearch: (s: Search): { pote: Pote } => ({
    pote: required(oneOf(s.pote, POTES), 'pote'),
  }),
  component: Vazio,
});

const weekendRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/fim-de-semana',
  component: Weekend,
});

const novaSemanaRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/nova-semana',
  validateSearch: (s: Search): { semana: ISODate } => ({
    semana: required(isoDate(s.semana), 'semana'),
  }),
  component: NovaSemana,
});

export const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute.addChildren([
    homeRoute,
    addRoute,
    editRoute,
    pendingRoute,
    achRoute,
    settingsRoute,
    cafeRoute,
    fluxoRoute.addChildren([
      drawRoute,
      taskRoute,
      doneRoute,
      notDoneRoute,
      returnRoute,
      vazioRoute,
      weekendRoute,
      novaSemanaRoute,
    ]),
  ]),
]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: () => <Navigate to="/" replace />,
    ...(history ? { history } : {}),
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

export const router = createAppRouter();
