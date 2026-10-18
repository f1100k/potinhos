import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  type RouterHistory,
  redirect,
} from '@tanstack/react-router';
import { z } from 'zod';
import { Toaster } from '../components/Toast';
import { isoDateSchema, POTES, poteSchema } from '../domain/types';
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

export const ACH_TABS = ['semana', 'mes'] as const;
export type AchTab = (typeof ACH_TABS)[number];

// Parâmetro opcional: um valor inválido na URL é ignorado. Os obrigatórios,
// do fluxo, só faltam se a URL foi editada à mão, e aí a validação falha.
const opcional = <T extends z.ZodType>(schema: T) =>
  schema.optional().catch(undefined);

const porPote = z.object({ pote: opcional(poteSchema) });

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
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
  validateSearch: porPote,
  component: Add,
});

const editRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/editar',
  validateSearch: porPote,
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
  validateSearch: z.object({
    tab: z.enum(ACH_TABS).catch('semana'),
    semana: opcional(isoDateSchema),
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
  validateSearch: z.object({
    from: z.enum(['landing', 'app']).catch('app'),
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
  validateSearch: z.object({ pote: poteSchema }),
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
  validateSearch: z.object({ destino: z.enum([...POTES, 'pendentes']) }),
  component: Return,
});

const vazioRoute = createRoute({
  getParentRoute: () => fluxoRoute,
  path: '/potes/vazio',
  validateSearch: z.object({ pote: poteSchema }),
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
  validateSearch: z.object({ semana: isoDateSchema }),
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
