import type { ISODate, Pote } from '../domain/types';

export const SCREENS = [
  'landing',
  'home',
  'draw',
  'task',
  'done',
  'notdone',
  'return',
  'vazio',
  'weekend',
  'novasemana',
  'ach',
  'add',
  'edit',
  'pending',
  'settings',
  'cafe',
] as const;

export type Screen = (typeof SCREENS)[number];

export type AchTab = 'semana' | 'mes';

export type Route =
  | { screen: 'landing' }
  | { screen: 'home' }
  | { screen: 'draw'; pote: Pote }
  | { screen: 'task' }
  | { screen: 'done' }
  | { screen: 'notdone' }
  | { screen: 'return'; destino: Pote | 'pendentes' }
  | { screen: 'vazio'; pote: Pote }
  | { screen: 'weekend' }
  | { screen: 'novasemana'; semana: ISODate }
  | { screen: 'ach'; tab: AchTab; semana?: ISODate }
  | { screen: 'add'; pote?: Pote }
  | { screen: 'edit'; pote?: Pote }
  | { screen: 'pending' }
  | { screen: 'settings' }
  | { screen: 'cafe'; from: 'landing' | 'app' };

// Garante que toda tela tem uma rota e vice-versa.
type _Exhaustive = [Route['screen']] extends [Screen]
  ? [Screen] extends [Route['screen']]
    ? true
    : never
  : never;
export const _routesCoverScreens: _Exhaustive = true;

/** Telas do fluxo do sorteio: sem barra inferior e com "Meus potes" ativo. */
export const FLOW_SCREENS: readonly Screen[] = [
  'draw',
  'task',
  'done',
  'notdone',
  'return',
  'vazio',
  'weekend',
  'novasemana',
];

export type NavState = { route: Route };

export type NavAction = { type: 'go'; route: Route };

export const initialNav: NavState = { route: { screen: 'landing' } };

export function navReducer(_state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'go':
      return { route: action.route };
  }
}
